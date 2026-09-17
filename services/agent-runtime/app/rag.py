"""Provider-agnostic grounded generation and Qdrant retrieval.

Generation uses an OpenAI-compatible endpoint (OpenRouter by default), so the
runtime can use a provider's free-tier model without coupling the application to
a single model vendor. Embeddings are generated locally with a deterministic
feature hash; this keeps ingestion and retrieval independent of a second paid
API and preserves the existing 3072-dimensional Qdrant collection.

Retrieval blends vector similarity with keyword overlap (hybrid ranking) so
exact concept names (e.g. "Belady's anomaly") surface even when phrased
differently from the indexed text.
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
from typing import Any

from qdrant_client import QdrantClient, models

EMBEDDING_SIZE = 3072

# Free-tier model ids change often, so generation walks a chain instead of
# betting on one id. `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODELS`
# (comma separated) are tried first, then these.
DEFAULT_FALLBACK_MODELS = [
    "deepseek/deepseek-chat-v3-0324:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "mistralai/mistral-small-3.2-24b-instruct:free",
    "openrouter/free",
]

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
            os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free"),
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
        self.request_timeout = max(20, int(os.getenv("OPENROUTER_REQUEST_TIMEOUT_SECONDS", "240")))
        try:
            configured_backoff = float(os.getenv("OPENROUTER_STRUCTURED_RETRY_BACKOFF_SECONDS", "2"))
        except ValueError:
            configured_backoff = 2.0
        # Structured generation makes one alternate-model retry after a short
        # bounded backoff. This absorbs transient free-tier/provider errors
        # without turning a learner's job into an unbounded retry loop.
        self.structured_retry_backoff_seconds = min(30.0, max(0.0, configured_backoff))

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

    def structured_generate(self, prompt: str) -> dict[str, Any]:
        self._require_key()
        # Structured lesson output includes notes and practice in one response.
        # A bounded output prevents a single verbose model turn from turning a
        # compact lesson into the old three-page experience. Individual deploys
        # may raise this deliberately, but cannot request an unbounded reply.
        max_tokens = max(500, min(2800, int(os.getenv("OPENROUTER_STRUCTURED_MAX_TOKENS", "2200"))))
        base_payload = {
            "messages": [
                {"role": "system", "content": "Return valid JSON only. Do not use Markdown fences."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }
        headers = {
            "Authorization": f"Bearer {self.settings.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://eduswarm-web.onrender.com",
            "X-Title": "EduSwarm",
        }
        failures: list[str] = []
        # Make one alternate-model retry when the primary cannot return valid
        # JSON. It has a small backoff so a transient 429/5xx does not cause an
        # immediate repeat request.
        max_models = max(1, min(2, int(os.getenv("OPENROUTER_STRUCTURED_MAX_MODELS", "2"))))
        models_to_try = self.model_chain()[:max_models]
        for attempt, model in enumerate(models_to_try):
            request = urllib.request.Request(
                f"{self.settings.base_url}/chat/completions",
                data=json.dumps({**base_payload, "model": model}).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            try:
                with urllib.request.urlopen(request, timeout=self.request_timeout) as response:
                    body = json.loads(response.read().decode("utf-8"))
                content = body["choices"][0]["message"]["content"]
                if isinstance(content, list):
                    content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
                content = str(content).strip()
                if content.startswith("```"):
                    content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                return json.loads(content)
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")[:300]
                failures.append(f"{model} HTTP {exc.code}: {detail}")
                # Invalid credentials/credits will not recover on another
                # model, whereas model-specific errors often will.
                if exc.code in {401, 402, 403}:
                    raise RuntimeError("OpenAI-compatible provider request failed: " + failures[-1]) from exc
            except (urllib.error.URLError, KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
                failures.append(f"{model} {type(exc).__name__}: {exc}")

            if attempt < len(models_to_try) - 1 and self.structured_retry_backoff_seconds:
                time.sleep(self.structured_retry_backoff_seconds)

        raise RuntimeError("every configured model failed to return valid JSON — " + " | ".join(failures[:3]))

    def chat(self, messages: list[dict[str, str]], system: str) -> str:
        return self.chat_with_model(messages, system)[0]

    def model_chain(self) -> list[str]:
        """Model ids to try in order — free-tier ids churn, so fall back."""
        configured = [m.strip() for m in f"{os.getenv('OPENROUTER_MODEL', '')},{os.getenv('OPENROUTER_FALLBACK_MODELS', '')}".split(",") if m.strip()]
        chain = list(dict.fromkeys([*configured, *DEFAULT_FALLBACK_MODELS]))
        return chain

    def chat_with_model(self, messages: list[dict[str, str]], system: str) -> tuple[str, str]:
        """Complete a chat, falling back across models. Returns (text, model)."""
        self._require_key()
        normalized = [{"role": str(message.get("role", "user")), "content": str(message.get("content", message.get("text", "")))} for message in messages if message.get("text") or message.get("content")]
        latest = normalized[-1]["content"] if normalized else ""
        reinforced_system = system + f"\n\nThe latest learner message is exactly: <learner_message>{latest}</learner_message>\nYou must answer that message directly. Do not ask the learner to provide the message again when it is present."
        payload = json.dumps({
            "messages": [{"role": "system", "content": reinforced_system}, *normalized],
            "temperature": 0.35,
            "max_tokens": int(os.getenv("OPENROUTER_MAX_TOKENS", "1400")),
        }).encode("utf-8")
        headers = {"Authorization": f"Bearer {self.settings.api_key}", "Content-Type": "application/json", "HTTP-Referer": "https://eduswarm-web.onrender.com", "X-Title": "EduSwarm"}
        errors: list[str] = []
        for model in self.model_chain():
            body_payload = json.dumps({**json.loads(payload), "model": model}).encode("utf-8")
            request = urllib.request.Request(f"{self.settings.base_url}/chat/completions", data=body_payload, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(request, timeout=self.request_timeout) as response:
                    body = json.loads(response.read().decode("utf-8"))
                content = body["choices"][0]["message"]["content"]
                if isinstance(content, list):
                    content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
                text = str(content).strip()
                if len(text) >= 40:
                    return text, model
                errors.append(f"{model} returned an empty reply")
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")[:300]
                errors.append(f"{model} HTTP {exc.code}: {detail}")
                if exc.code in (401, 402, 403):
                    break
            except Exception as exc:  # URLError, timeout, malformed body
                errors.append(f"{model} {type(exc).__name__}: {exc}")
        raise RuntimeError("every configured model failed — " + " | ".join(errors[:3]))


RagProvider = OpenRouterRag
