"""Provider-agnostic grounded generation and Qdrant retrieval.

Generation uses an OpenAI-compatible endpoint (OpenRouter by default), so the
runtime can use a provider's free-tier model without coupling the application to
a single model vendor. Embeddings are generated locally with a deterministic
feature hash; this keeps ingestion and retrieval independent of a second paid
API and preserves the existing 3072-dimensional Qdrant collection.

Retrieval blends vector similarity with keyword overlap (hybrid ranking) so
exact concept names (e.g. "Belady's anomaly") surface even when phrased
differently from the indexed text.

Model selection lives in `app.llm_router`: free model ids churn, so the chain is
discovered from OpenRouter's live catalogue, remembers which models failed, and
treats `OPENROUTER_MODEL` as an optional hint rather than a hard requirement.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import time
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass
from typing import Any, Callable

from qdrant_client import QdrantClient, models

from app.llm_router import (
    CHAT_ATTEMPT_TIMEOUT,
    CHAT_MAX_TOKENS,
    CHAT_TOTAL_BUDGET,
    ROUTER,
    STRUCTURED_ATTEMPT_TIMEOUT,
    STRUCTURED_MAX_ATTEMPTS,
    STRUCTURED_MAX_TOKENS,
    STRUCTURED_MAX_TOKENS_LONG,
    STRUCTURED_TOTAL_BUDGET,
    loads_object,
    paid_fallback_model,
)

EMBEDDING_SIZE = 3072


class ModelAttemptError(Exception):
    """One model failed. `kind` selects its cool-down in the router ledger."""

    def __init__(self, model: str, kind: str, detail: str, status: int | None = None):
        super().__init__(detail)
        self.model = model
        self.kind = kind
        self.detail = detail
        self.status = status

STOPWORDS = frozenset(
    "a an the and or but of to in on for with is are was were be been being "
    "this that these those it its as at by from into over after before between "
    "what which who whom whose when where why how do does did can could should "
    "would may might will shall your you we our they them their there here than "
    "then so such very too also just only not no yes if else".split()
)


@dataclass(frozen=True)
class Settings:
    api_key: str
    qdrant_url: str
    qdrant_api_key: str
    collection: str
    model: str
    base_url: str

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            os.getenv("OPENROUTER_API_KEY", os.getenv("OPENAI_API_KEY", "")),
            os.getenv("QDRANT_URL", "http://localhost:6333"),
            os.getenv("QDRANT_API_KEY", ""),
            os.getenv("QDRANT_COLLECTION", "eduswarm_knowledge"),
            os.getenv("OPENROUTER_MODEL", ""),  # an optional hint, not a requirement
            os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/"),
        )


@dataclass(frozen=True)
class EvidenceChunk:
    chunk_id: str
    source_id: str
    title: str
    url: str
    text: str
    score: float = 0.0

    def as_prompt(self) -> str:
        return f"[chunk_id={self.chunk_id}; source={self.title}; url={self.url}]\n{self.text}"


class OpenRouterRag:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings.from_env()
        # The API key is required for generation, but Qdrant-only operations
        # (ingest/search) work without it so knowledge tooling stays usable.
        self.qdrant = QdrantClient(url=self.settings.qdrant_url, api_key=self.settings.qdrant_api_key or None)
        # Budgets are fixed constants in `llm_router` — there is nothing to
        # tune, and nothing a stale dashboard value can break.
        self.request_timeout = STRUCTURED_ATTEMPT_TIMEOUT

    def _require_key(self) -> None:
        if not self.settings.api_key:
            raise RuntimeError("OPENROUTER_API_KEY is required for the intelligent agent runtime")

    @staticmethod
    def _tokens(text: str) -> list[str]:
        return [token for token in "".join(ch.lower() if ch.isalnum() else " " for ch in text).split() if token not in STOPWORDS and len(token) > 1]

    @staticmethod
    def _embed(text: str) -> list[float]:
        """Create a stable normalized feature vector without an embedding API.

        Word and bigram hashing plus character trigrams give related
        educational text useful overlap while keeping the vector dimension
        compatible with the existing Qdrant collection.
        """
        vector = [0.0] * EMBEDDING_SIZE
        normalized = " ".join(text.lower().split())
        tokens = OpenRouterRag._tokens(text)
        bigrams = [f"{tokens[i]} {tokens[i + 1]}" for i in range(len(tokens) - 1)]
        features = tokens + bigrams + tokens + [normalized[index:index + 3] for index in range(max(0, len(normalized) - 2))]
        for feature in features:
            digest = hashlib.blake2b(feature.encode("utf-8"), digest_size=8).digest()
            index = int.from_bytes(digest, "big") % EMBEDDING_SIZE
            vector[index] += 1.0
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]

    @staticmethod
    def keyword_overlap(query: str, text: str) -> float:
        query_tokens = set(OpenRouterRag._tokens(query))
        if not query_tokens:
            return 0.0
        doc_tokens = set(OpenRouterRag._tokens(text))
        return len(query_tokens & doc_tokens) / len(query_tokens)

    def ensure_collection(self) -> None:
        if not self.qdrant.collection_exists(self.settings.collection):
            self.qdrant.create_collection(
                self.settings.collection,
                vectors_config=models.VectorParams(size=EMBEDDING_SIZE, distance=models.Distance.COSINE),
            )

    def ingest(self, source_id: str, title: str, url: str, text: str, topic_ids: list[str]) -> int:
        self.ensure_collection()
        chunks = [text[index:index + 1500] for index in range(0, len(text), 1200)]
        points = []
        for index, chunk in enumerate(chunks):
            points.append(
                models.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=self._embed(chunk),
                    payload={"chunk_id": f"{source_id}-{index}", "source_id": source_id, "title": title, "url": url, "text": chunk, "topic_ids": topic_ids},
                )
            )
        self.qdrant.upsert(self.settings.collection, points=points, wait=True)
        return len(points)

    def search(self, query: str, topic_id: str | None = None, limit: int = 6) -> list[EvidenceChunk]:
        """Hybrid retrieval: vector candidates reranked with keyword overlap."""
        self.ensure_collection()
        fetch = max(limit * 3, 12)
        query_filter = None
        if topic_id:
            query_filter = models.Filter(must=[models.FieldCondition(key="topic_ids", match=models.MatchAny(any=[topic_id]))])
        results = self.qdrant.query_points(
            collection_name=self.settings.collection,
            query=self._embed(query),
            query_filter=query_filter,
            limit=fetch,
            with_payload=True,
        ).points
        ranked = []
        for point in results:
            payload = point.payload or {}
            text = str(payload.get("text", ""))
            combined = float(point.score) + 0.35 * self.keyword_overlap(query, text)
            ranked.append((
                combined,
                EvidenceChunk(
                    chunk_id=str(payload.get("chunk_id", point.id)),
                    source_id=str(payload.get("source_id", "unknown")),
                    title=str(payload.get("title", "Untitled")),
                    url=str(payload.get("url", "")),
                    text=text,
                    score=float(point.score),
                ),
            ))
        ranked.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in ranked[:limit]]

    def retrieve(self, query: str, topic_id: str, limit: int = 6) -> list[EvidenceChunk]:
        return self.search(query, topic_id=topic_id, limit=limit)

    # ------------------------------------------------------------ requests --
    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("WEB_URL", "https://eduswarm-web.onrender.com"),
            "X-Title": "EduSwarm",
        }

    def _post(self, payload: dict[str, Any], timeout: float) -> tuple[int | None, dict[str, Any] | None, str]:
        """POST one chat completion. Returns (status, body, detail).

        `status` is None for a network/timeout failure and 200 for a decoded
        body. A 200 response carrying an `error` object is reported with that
        error's status, because OpenRouter returns upstream provider failures
        that way and they must not be parsed as content.
        """
        request = urllib.request.Request(
            f"{self.settings.base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers=self._headers(),
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                raw = response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:300]
            return exc.code, None, detail
        except Exception as exc:  # URLError, timeout, socket error
            return None, None, f"{type(exc).__name__}: {exc}"
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            return 200, None, f"non-JSON response body: {raw[:200]}"
        if isinstance(body, dict) and isinstance(body.get("error"), dict):
            error = body["error"]
            status = error.get("code") if isinstance(error.get("code"), int) else 502
            return int(status), None, str(error.get("message", "provider error"))[:300]
        return 200, body if isinstance(body, dict) else None, ""

    @staticmethod
    def _message_text(body: dict[str, Any]) -> tuple[str, str]:
        """Extract (content, finish_reason), tolerating list or null content."""
        choices = body.get("choices") or []
        if not choices or not isinstance(choices[0], dict):
            return "", ""
        choice = choices[0]
        message = choice.get("message") or {}
        content = message.get("content")
        if isinstance(content, list):
            content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
        text = "" if content is None else str(content).strip()
        if not text:
            # Reasoning-first models sometimes put the whole answer here when
            # the content field is drained by hidden reasoning tokens.
            reasoning = message.get("reasoning")
            if isinstance(reasoning, str):
                text = reasoning.strip()
        return text, str(choice.get("finish_reason") or "")

    def _attempt_model(self, model: str, messages: list[dict[str, str]], *, max_tokens: int, temperature: float, json_mode: bool, timeout: float) -> tuple[str, str]:
        """Ask one model, adapting the request to what that model accepts.

        Variant 1 asks for a JSON object with reasoning disabled. A 400/422
        means the model rejects one of those knobs, so the request is resent
        bare. An empty reply usually means the budget went to hidden reasoning,
        so it is retried once with low reasoning effort.

        Returns (text, finish_reason). Raises ModelAttemptError on failure.
        """
        base: dict[str, Any] = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens, "stream": False}
        variants: list[dict[str, Any]] = [{**base, **({"response_format": {"type": "json_object"}} if json_mode else {}), "reasoning": {"enabled": False}}]
        detail = ""
        for index in range(3):
            payload = variants[index] if index < len(variants) else None
            if payload is None:
                break
            status, body, detail = self._post(payload, timeout)
            if status == 200 and body is not None:
                text, finish = self._message_text(body)
                if text:
                    return text, finish
                detail = f"empty content (finish_reason={finish or 'unknown'})"
                if not any(variant.get("reasoning", {}).get("effort") for variant in variants):
                    # The budget went to hidden reasoning. Give the model an
                    # explicit low effort so the rest of max_tokens reaches the
                    # answer, and drop json mode in case that caused the stall.
                    variants.append({**base, "reasoning": {"effort": "low"}})
                    continue
                raise ModelAttemptError(model, "unusable", detail)
            if status in (400, 422) and index == 0:
                # Resend without response_format/reasoning: some free providers
                # reject either field outright.
                variants.append(dict(base))
                continue
            raise ModelAttemptError(model, ROUTER.classify(status, detail), f"HTTP {status}: {detail}" if status else detail, status)
        raise ModelAttemptError(model, "unusable", detail or "no usable reply")

    def _run_chain(self, *, messages: list[dict[str, str]], max_tokens: int, temperature: float, json_mode: bool, attempt_timeout: float, total_budget: float, max_attempts: int, handle: Callable[[str, str], Any]) -> tuple[Any, str]:
        """Walk the router's chain until `handle` accepts a reply.

        `handle(text, model)` returns the caller's value, or raises ValueError
        to reject this model's output and move on. Only a 401 aborts early —
        every other failure is model-specific and recorded as a cool-down.
        """
        self._require_key()
        chain = ROUTER.model_chain(self.settings.base_url, self.settings.api_key, include_paid=True)
        paid = paid_fallback_model()
        free_chain = [model for model in chain if model != paid][:max_attempts]
        models_to_try = free_chain + ([paid] if paid and paid not in free_chain else [])
        started = time.monotonic()
        failures: list[str] = []
        for model in models_to_try:
            remaining = total_budget - (time.monotonic() - started)
            if remaining <= 5:
                failures.append("the time budget for this step was exhausted")
                break
            try:
                text, _finish = self._attempt_model(
                    model, messages,
                    max_tokens=max_tokens, temperature=temperature, json_mode=json_mode,
                    timeout=min(attempt_timeout, remaining),
                )
            except ModelAttemptError as exc:
                if exc.status == 401:
                    # Only a rejected key is global; 402/403 are usually tier- or
                    # model-specific, so they must not abort the whole chain.
                    raise RuntimeError(f"The AI provider rejected the API key — {exc.detail}") from exc
                ROUTER.penalise(model, exc.kind, exc.detail)
                failures.append(f"{model} {exc.detail}")
                continue
            try:
                value = handle(text, model)
            except ValueError as exc:
                ROUTER.penalise(model, "unusable", str(exc))
                failures.append(f"{model} returned unusable output: {exc}")
                continue
            ROUTER.mark_ok(model)
            return value, model
        raise RuntimeError(
            f"Every free AI model was busy, unavailable or returned unusable output (tried {len(models_to_try)}). "
            "Please retry in a minute. — " + " | ".join(failures[:4])
        )

    def structured_generate(self, prompt: str, validator: Callable[[dict[str, Any]], None] | None = None, long: bool = False) -> dict[str, Any]:
        """Generate one JSON object, walking models until one is usable.

        `validator` may raise ValueError to reject a structurally wrong reply;
        the router then tries the next model instead of failing the job. A
        reply salvaged from a truncated response is only accepted when the
        validator passes, so a half-written lesson never reaches a learner.

        Set `long` for a deep lesson, which needs a larger output budget than
        the standard one to fit its extra sections without being truncated.
        """
        messages = [
            {"role": "system", "content": "You are a JSON API. Reply with one valid JSON object and nothing else: no Markdown fences, no commentary, no reasoning text."},
            {"role": "user", "content": prompt},
        ]

        def handle(text: str, _model: str) -> dict[str, Any]:
            value, repaired = loads_object(text)  # raises ValueError when hopeless
            if validator is not None:
                validator(value)
            elif repaired and not value:
                raise ValueError("the repaired reply was empty")
            return value

        result, _model = self._run_chain(
            messages=messages,
            max_tokens=STRUCTURED_MAX_TOKENS_LONG if long else STRUCTURED_MAX_TOKENS,
            temperature=0.2,
            json_mode=True,
            attempt_timeout=STRUCTURED_ATTEMPT_TIMEOUT,
            total_budget=STRUCTURED_TOTAL_BUDGET,
            max_attempts=STRUCTURED_MAX_ATTEMPTS,
            handle=handle,
        )
        return result

    def chat(self, messages: list[dict[str, str]], system: str) -> str:
        return self.chat_with_model(messages, system)[0]

    def model_chain(self, fetch: bool = True) -> list[str]:
        """Ordered model ids to try. `fetch=False` uses the cached catalogue."""
        return ROUTER.model_chain(self.settings.base_url, self.settings.api_key, fetch=fetch)

    def chat_with_model(self, messages: list[dict[str, str]], system: str) -> tuple[str, str]:
        """Complete a chat, falling back across models. Returns (text, model)."""
        normalized = [{"role": str(message.get("role", "user")), "content": str(message.get("content", message.get("text", "")))} for message in messages if message.get("text") or message.get("content")]
        latest = normalized[-1]["content"] if normalized else ""
        reinforced_system = system + f"\n\nThe latest learner message is exactly: <learner_message>{latest}</learner_message>\nYou must answer that message directly. Do not ask the learner to provide the message again when it is present."

        def handle(text: str, _model: str) -> str:
            if len(text.strip()) < 40:
                raise ValueError("the reply was too short to be an answer")
            return text.strip()

        return self._run_chain(
            messages=[{"role": "system", "content": reinforced_system}, *normalized],
            max_tokens=CHAT_MAX_TOKENS,
            temperature=0.35,
            json_mode=False,
            attempt_timeout=CHAT_ATTEMPT_TIMEOUT,
            total_budget=CHAT_TOTAL_BUDGET,
            max_attempts=STRUCTURED_MAX_ATTEMPTS - 1,
            handle=handle,
        )


RagProvider = OpenRouterRag
