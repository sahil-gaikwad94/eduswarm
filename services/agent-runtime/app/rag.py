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
        self.request_timeout = max(30, int(os.getenv("OPENROUTER_REQUEST_TIMEOUT_SECONDS", "300")))

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
        payload = json.dumps(
            {
                "model": self.settings.model,
                "messages": [
                    {"role": "system", "content": "Return valid JSON only. Do not use Markdown fences."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
                "response_format": {"type": "json_object"},
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            f"{self.settings.base_url}/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {self.settings.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://eduswarm-web.onrender.com",
                "X-Title": "EduSwarm",
            },
            method="POST",
        )
        last_error: Exception | None = None
        for attempt in range(3):
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
            except (urllib.error.HTTPError, urllib.error.URLError, KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
                last_error = exc
                if isinstance(exc, urllib.error.HTTPError) and exc.code not in {408, 429, 500, 502, 503, 504}:
                    break
                if attempt < 2:
                    time.sleep(2 ** attempt)
        if isinstance(last_error, urllib.error.HTTPError):
            detail = last_error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"OpenAI-compatible provider HTTP {last_error.code}: {detail[:1000]}") from last_error
        raise RuntimeError(f"OpenAI-compatible provider request failed: {last_error}") from last_error

    def chat(self, messages: list[dict[str, str]], system: str) -> str:
        self._require_key()
        normalized = [{"role": str(message.get("role", "user")), "content": str(message.get("content", message.get("text", "")))} for message in messages if message.get("text") or message.get("content")]
        latest = normalized[-1]["content"] if normalized else ""
        reinforced_system = system + f"\n\nThe latest learner message is exactly: <learner_message>{latest}</learner_message>\nYou must answer that message directly. Do not ask the learner to provide the message again when it is present."
        payload = json.dumps({"model": self.settings.model, "messages": [{"role": "system", "content": reinforced_system}, *normalized], "temperature": 0.35}).encode("utf-8")
        request = urllib.request.Request(f"{self.settings.base_url}/chat/completions", data=payload, headers={"Authorization": f"Bearer {self.settings.api_key}", "Content-Type": "application/json", "HTTP-Referer": "https://eduswarm-web.onrender.com", "X-Title": "EduSwarm"}, method="POST")
        with urllib.request.urlopen(request, timeout=self.request_timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
        content = body["choices"][0]["message"]["content"]
        if isinstance(content, list):
            content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
        return str(content).strip()


RagProvider = OpenRouterRag
