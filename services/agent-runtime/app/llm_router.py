"""Self-healing OpenRouter model router (standard library only).

Free-tier model ids churn constantly: an id that works today returns 404 next
week, and a model that used to answer starts spending its whole token budget on
hidden reasoning. Hard-coding two ids in the environment therefore guarantees a
future outage, which is exactly what happened to the Notes Author.

This module removes the model id from the deployment's critical path:

* the live OpenRouter catalogue is fetched (cached, best effort, never
  blocking) and used to discover which free models actually exist right now;
* configured ids are demoted to *hints* — they are used only while they still
  exist in the catalogue;
* every failure feeds an in-memory cool-down ledger so a dead model drifts to
  the end of the chain instead of burning the first attempt of every request;
* the last model that produced a valid answer is tried first next time.

Nothing here raises on catalogue problems. If OpenRouter's `/models` endpoint is
unreachable the router degrades to "assume every configured/curated id exists",
which is the old behaviour plus cool-downs.
"""
from __future__ import annotations

import json
import os
import re
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Iterable

# --------------------------------------------------------------------------- #
# Tunables
# --------------------------------------------------------------------------- #

CATALOGUE_TTL_SECONDS = 20 * 60
CATALOGUE_RETRY_SECONDS = 60
CATALOGUE_TIMEOUT_SECONDS = 8

MIN_CONTEXT = 32_000
MIN_PARAMETER_BILLIONS = 20.0
MAX_DISCOVERED = 8

# Models that cannot write a lesson: safety/guard classifiers, embedding and
# rerank endpoints, media models, and small/experimental families that reliably
# fail structured JSON.
EXCLUDED_ID = re.compile(
    r"safety|guard|moderat|embed|rerank|lyria|tts|whisper|vision|image|audio|omni|lfm|dolphin|vl",
    re.IGNORECASE,
)

LAST_RESORT_MODEL = "openrouter/free"

# Verified against the live catalogue before use — this is only a starting
# order, never a requirement. Snapshot taken July 2026.
CURATED_MODELS = [
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openai/gpt-oss-120b:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "poolside/laguna-m.1:free",
    "openai/gpt-oss-20b:free",
]

# Cool-down lengths in seconds, keyed by failure class.
COOLDOWN_SECONDS = {
    "gone": 6 * 60 * 60,        # 404 / 410 — the id no longer exists
    "bad_request": 60 * 60,     # 400 / 422 — payload the model cannot accept
    "denied": 60 * 60,          # 402 / 403 — often model- or tier-specific
    "rate_limited": 2 * 60,     # 429 — short burst limit
    "rate_limited_day": 3 * 60 * 60,  # 429 with a per-day message
    "transient": 2 * 60,        # 5xx / timeout / network
    "unusable": 15 * 60,        # empty body or output that never parses
}


# Fixed budgets. These are NOT configurable: the whole point of this module is
# that a deployment never has to tune model behaviour. A lesson is ~3k tokens of
# JSON, six models is enough to survive a bad day on the free tier, and 480s
# keeps the job inside the API's 600s wait window.
STRUCTURED_MAX_TOKENS = 4096
STRUCTURED_MAX_ATTEMPTS = 6
STRUCTURED_ATTEMPT_TIMEOUT = 150
STRUCTURED_TOTAL_BUDGET = 480
CHAT_MAX_TOKENS = 1400
CHAT_ATTEMPT_TIMEOUT = 75
CHAT_TOTAL_BUDGET = 200


def paid_fallback_model() -> str:
    """Optional single cheap paid model, tried only after the free chain."""
    return os.getenv("OPENROUTER_PAID_FALLBACK_MODEL", "").strip()


# --------------------------------------------------------------------------- #
# Catalogue
# --------------------------------------------------------------------------- #


def _split_list(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split(",") if part.strip()]


def configured_hints() -> list[str]:
    """`OPENROUTER_MODEL` + `OPENROUTER_FALLBACK_MODELS`, in order."""
    return list(dict.fromkeys(
        _split_list(os.getenv("OPENROUTER_MODEL", "")) + _split_list(os.getenv("OPENROUTER_FALLBACK_MODELS", ""))
    ))


def _as_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def parameter_billions(model_id: str, entry: dict[str, Any] | None = None) -> float | None:
    """Best-effort parameter count in billions, parsed from the id or metadata.

    Returns None when the size is genuinely unknown — unknown-size models stay
    eligible, because plenty of capable models do not advertise a size.
    """
    if entry:
        declared = _as_float(entry.get("parameter_count") or (entry.get("top_provider") or {}).get("parameter_count"))
        if declared:
            return declared / 1e9 if declared > 1e6 else declared
    sizes = [
        float(match.group(1)) * (1000.0 if match.group(2).lower() == "t" else 1.0)
        for match in re.finditer(r"(?<![a-z0-9.])(\d+(?:\.\d+)?)\s*([bt])(?![a-z0-9])", model_id.lower())
    ]
    # "80b-a3b" means 80B total with 3B active: judge the model on total size.
    return max(sizes) if sizes else None


def _is_expired(entry: dict[str, Any]) -> bool:
    for key in ("expires_at", "expiry", "deprecated_at", "deprecation_date", "sunset_at"):
        raw = entry.get(key)
        if not raw:
            continue
        try:
            if isinstance(raw, (int, float)):
                moment = datetime.fromtimestamp(float(raw), tz=timezone.utc)
            else:
                moment = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
                if moment.tzinfo is None:
                    moment = moment.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError):
            continue
        if moment <= datetime.now(timezone.utc):
            return True
    return bool(entry.get("deprecated")) or bool(entry.get("is_deprecated"))


def is_free(entry: dict[str, Any]) -> bool:
    pricing = entry.get("pricing") or {}
    prompt = _as_float(pricing.get("prompt"))
    completion = _as_float(pricing.get("completion"))
    return prompt == 0.0 and completion == 0.0


def is_text_output(entry: dict[str, Any]) -> bool:
    architecture = entry.get("architecture") or {}
    modalities = architecture.get("output_modalities")
    if isinstance(modalities, list) and modalities:
        return [str(item).lower() for item in modalities] == ["text"]
    modality = str(architecture.get("modality") or "")
    return "->text" in modality.replace(" ", "") or modality == "" or modality.endswith("text")


def is_eligible(entry: dict[str, Any]) -> bool:
    """Can this catalogue entry plausibly author a long JSON lesson for free?"""
    model_id = str(entry.get("id") or "")
    if not model_id or EXCLUDED_ID.search(model_id):
        return False
    if not is_free(entry) or not is_text_output(entry) or _is_expired(entry):
        return False
    context = _as_float(entry.get("context_length")) or _as_float((entry.get("top_provider") or {}).get("context_length")) or 0.0
    if context < MIN_CONTEXT:
        return False
    size = parameter_billions(model_id, entry)
    if size is not None and size < MIN_PARAMETER_BILLIONS:
        return False
    return True


def supports_structured_output(entry: dict[str, Any]) -> bool:
    parameters = entry.get("supported_parameters") or []
    if isinstance(parameters, list) and any(str(item) in {"response_format", "structured_outputs"} for item in parameters):
        return True
    return bool((entry.get("architecture") or {}).get("structured_outputs"))


@dataclass
class _CatalogueCache:
    entries: dict[str, dict[str, Any]] | None = None
    fetched_at: float = 0.0
    failed_at: float = 0.0


class ModelRouter:
    """Shared, process-wide model ordering and failure memory.

    All state is in memory on purpose: the ledger must survive the individual
    request (so a dead model is not retried first every time) but must not
    outlive a deploy, where the catalogue is refetched anyway.
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._cache = _CatalogueCache()
        self._cooldowns: dict[str, tuple[float, str]] = {}
        self._last_good: str | None = None

    # ----------------------------------------------------------- catalogue --
    def _fetch_catalogue(self, base_url: str, api_key: str) -> dict[str, dict[str, Any]] | None:
        request = urllib.request.Request(
            f"{base_url.rstrip('/')}/models",
            headers={"Accept": "application/json", **({"Authorization": f"Bearer {api_key}"} if api_key else {})},
            method="GET",
        )
        try:
            with urllib.request.urlopen(request, timeout=CATALOGUE_TIMEOUT_SECONDS) as response:
                body = json.loads(response.read().decode("utf-8"))
        except Exception:  # network, HTTP, decode — never fatal
            return None
        data = body.get("data") if isinstance(body, dict) else body
        if not isinstance(data, list):
            return None
        entries: dict[str, dict[str, Any]] = {}
        for entry in data:
            if isinstance(entry, dict) and entry.get("id"):
                entries[str(entry["id"])] = entry
        return entries or None

    def catalogue(self, base_url: str, api_key: str = "", fetch: bool = True) -> dict[str, dict[str, Any]] | None:
        """Cached catalogue. Returns None when it has never been fetched."""
        with self._lock:
            cache = self._cache
            now = time.monotonic()
            fresh = cache.entries is not None and (now - cache.fetched_at) < CATALOGUE_TTL_SECONDS
            retry_ok = (now - cache.failed_at) >= CATALOGUE_RETRY_SECONDS
            if not fetch or fresh or not retry_ok:
                return cache.entries
        entries = self._fetch_catalogue(base_url, api_key)
        with self._lock:
            if entries:
                self._cache = _CatalogueCache(entries=entries, fetched_at=time.monotonic())
            else:
                # Keep serving the previous catalogue; just remember the failure.
                self._cache.failed_at = time.monotonic()
            return self._cache.entries

    # ------------------------------------------------------------- ledger ---
    def cooldown_remaining(self, model: str) -> float:
        with self._lock:
            until, _reason = self._cooldowns.get(model, (0.0, ""))
        return max(0.0, until - time.monotonic())

    def penalise(self, model: str, kind: str, detail: str = "") -> None:
        seconds = COOLDOWN_SECONDS.get(kind, COOLDOWN_SECONDS["transient"])
        with self._lock:
            until = time.monotonic() + seconds
            existing, _ = self._cooldowns.get(model, (0.0, ""))
            self._cooldowns[model] = (max(existing, until), detail or kind)
            if self._last_good == model:
                self._last_good = None

    def mark_ok(self, model: str) -> None:
        with self._lock:
            self._last_good = model
            self._cooldowns.pop(model, None)

    def last_good(self) -> str | None:
        with self._lock:
            return self._last_good

    def reset(self) -> None:
        """Test helper: forget the catalogue, cool-downs and last-good model."""
        with self._lock:
            self._cache = _CatalogueCache()
            self._cooldowns.clear()
            self._last_good = None

    @staticmethod
    def classify(status: int | None, message: str = "") -> str:
        """Map an HTTP status (or None for network errors) to a cool-down class."""
        if status in (404, 410):
            return "gone"
        if status in (400, 422):
            return "bad_request"
        if status in (402, 403):
            return "denied"
        if status == 429:
            return "rate_limited_day" if re.search(r"per[-\s]?day|daily|per day", message, re.IGNORECASE) else "rate_limited"
        if status and status >= 500:
            return "transient"
        if status is None:
            return "transient"
        return "unusable"

    # -------------------------------------------------------------- chain ---
    def discovered(self, entries: dict[str, dict[str, Any]], exclude: Iterable[str]) -> list[str]:
        """Newest eligible free models, structured-output capable ones first."""
        skip = set(exclude)
        candidates = [entry for model_id, entry in entries.items() if model_id not in skip and is_eligible(entry)]
        candidates.sort(key=lambda entry: (0 if supports_structured_output(entry) else 1, -(_as_float(entry.get("created")) or 0.0)))
        return [str(entry["id"]) for entry in candidates[:MAX_DISCOVERED]]

    def model_chain(self, base_url: str, api_key: str = "", fetch: bool = True, include_paid: bool = False) -> list[str]:
        """Ordered model ids to try for one request.

        Order: last-known-good, environment hints that still exist, the curated
        list, freshly discovered free models, then `openrouter/free`. Models on
        cool-down are pushed to the end rather than dropped, so a total outage
        still has something to try.
        """
        entries = self.catalogue(base_url, api_key, fetch=fetch)
        known = set(entries) if entries else None  # None => assume everything exists

        def exists(model_id: str) -> bool:
            return known is None or model_id in known

        chain: list[str] = []

        def add(model_id: str) -> None:
            if model_id and model_id not in chain and exists(model_id):
                chain.append(model_id)

        last_good = self.last_good()
        if last_good:
            add(last_good)
        for model_id in configured_hints():
            add(model_id)
        for model_id in CURATED_MODELS:
            add(model_id)
        if entries:
            for model_id in self.discovered(entries, exclude=chain):
                add(model_id)
        # The aggregator alias is a genuine last resort: it always resolves, but
        # picks whatever is cheapest rather than the best JSON author.
        if LAST_RESORT_MODEL not in chain:
            chain.append(LAST_RESORT_MODEL)
        else:
            chain.append(chain.pop(chain.index(LAST_RESORT_MODEL)))

        ready = [model for model in chain if not self.cooldown_remaining(model)]
        cooling = [model for model in chain if self.cooldown_remaining(model)]
        cooling.sort(key=self.cooldown_remaining)
        ordered = ready + cooling
        if include_paid:
            paid = paid_fallback_model()
            if paid and paid not in ordered:
                ordered.append(paid)
        return ordered


ROUTER = ModelRouter()


# --------------------------------------------------------------------------- #
# Tolerant JSON parsing
# --------------------------------------------------------------------------- #

_THINK_BLOCK = re.compile(r"<(think|thinking|reasoning|scratchpad)>.*?</\1>", re.IGNORECASE | re.DOTALL)
_TRAILING_COMMA = re.compile(r",\s*([}\]])")


def strip_wrappers(text: str) -> str:
    """Remove reasoning blocks and Markdown fences from a model reply."""
    cleaned = _THINK_BLOCK.sub(" ", str(text or ""))
    if re.search(r"<(think|thinking|reasoning|scratchpad)>", cleaned, re.IGNORECASE):
        # An unterminated reasoning block: keep only what follows its opening tag,
        # which is where a cut-off model usually starts emitting real content.
        cleaned = re.sub(r"^.*<(think|thinking|reasoning|scratchpad)>", " ", cleaned, flags=re.IGNORECASE | re.DOTALL)
    for fence in re.finditer(r"```(?:json|jsonc|json5)?\s*(.*?)```", cleaned, re.DOTALL | re.IGNORECASE):
        candidate = fence.group(1).strip()
        if candidate.startswith("{"):
            return candidate
    cleaned = re.sub(r"```(?:json|jsonc|json5)?", " ", cleaned, flags=re.IGNORECASE).replace("```", " ")
    return cleaned.strip()


def repair_truncated(fragment: str) -> str:
    """Close a JSON object that the provider cut off at its token limit.

    Drops the dangling tail (a half-written key or value), then closes any open
    string, array and object. The result is only ever *offered* to a validator;
    the caller decides whether the salvaged lesson is good enough to keep.
    """
    text = fragment.rstrip()
    in_string = False
    escaped = False
    stack: list[str] = []
    # Last index at which the document was structurally "safe" to cut.
    safe_cut = -1
    for index, char in enumerate(text):
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char in "{[":
            stack.append("}" if char == "{" else "]")
        elif char in "}]":
            if stack:
                stack.pop()
            safe_cut = index
        elif char == ",":
            safe_cut = index - 1
    if in_string:
        # Cutting mid-string: prefer rewinding to the last completed element.
        if safe_cut >= 0:
            text = text[: safe_cut + 1]
            return repair_truncated(text)
        text += '"'
    body = text.rstrip().rstrip(",")
    if body.endswith(":"):
        body = body[:-1].rstrip()
        body = body[: body.rfind('"')].rstrip() if '"' in body else body
        body = body.rstrip().rstrip(",")
    # Re-scan the trimmed body so the closer stack matches what actually remains.
    stack = []
    in_string = False
    escaped = False
    for char in body:
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char in "{[":
            stack.append("}" if char == "{" else "]")
        elif char in "}]" and stack:
            stack.pop()
    if in_string:
        body += '"'
    return body + "".join(reversed(stack))


def loads_object(text: str) -> tuple[dict[str, Any], bool]:
    """Parse the first JSON object in a model reply.

    Returns `(object, repaired)`. `repaired` is True when the text had to be
    salvaged from a truncated reply, so callers can be stricter about it.
    Raises ValueError when nothing usable is present.
    """
    cleaned = strip_wrappers(text)
    start = cleaned.find("{")
    if start < 0:
        raise ValueError("the reply contained no JSON object")
    fragment = cleaned[start:]
    decoder = json.JSONDecoder()
    for candidate, repaired in ((fragment, False), (_TRAILING_COMMA.sub(r"\1", fragment), False)):
        try:
            value, _end = decoder.raw_decode(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value, repaired
    salvaged = _TRAILING_COMMA.sub(r"\1", repair_truncated(fragment))
    try:
        value, _end = decoder.raw_decode(salvaged)
    except json.JSONDecodeError as exc:
        raise ValueError(f"unparseable JSON reply ({exc.msg})") from exc
    if not isinstance(value, dict):
        raise ValueError("the reply was not a JSON object")
    return value, True
