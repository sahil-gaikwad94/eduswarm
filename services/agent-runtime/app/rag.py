"""Gemini-backed retrieval augmented generation primitives.

Knowledge is explicitly ingested before it can be used. The generator receives only
retrieved chunks and must cite their stable chunk IDs; it cannot manufacture sources.
"""
from __future__ import annotations

import json
import os
import uuid
from dataclasses import dataclass
from typing import Any

from google import genai
from qdrant_client import QdrantClient, models

EMBEDDING_SIZE = 3072

@dataclass(frozen=True)
class Settings:
    api_key: str
    qdrant_url: str
    qdrant_api_key: str
    collection: str
    model: str
    embedding_model: str
    @classmethod
    def from_env(cls) -> "Settings":
        return cls(os.getenv("GEMINI_API_KEY", ""), os.getenv("QDRANT_URL", "http://localhost:6333"), os.getenv("QDRANT_API_KEY", ""), os.getenv("QDRANT_COLLECTION", "eduswarm_knowledge"), os.getenv("GEMINI_MODEL", "gemini-2.5-flash"), os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001"))

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

class GeminiRag:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings.from_env()
        if not self.settings.api_key: raise RuntimeError("GEMINI_API_KEY is required for the intelligent agent runtime")
        self.gemini = genai.Client(api_key=self.settings.api_key)
        self.qdrant = QdrantClient(url=self.settings.qdrant_url, api_key=self.settings.qdrant_api_key or None)

    def _embed(self, text: str) -> list[float]:
        response = self.gemini.models.embed_content(model=self.settings.embedding_model, contents=text)
        return list(response.embeddings[0].values)

    def ensure_collection(self) -> None:
        if not self.qdrant.collection_exists(self.settings.collection):
            self.qdrant.create_collection(self.settings.collection, vectors_config=models.VectorParams(size=EMBEDDING_SIZE, distance=models.Distance.COSINE))

    def ingest(self, source_id: str, title: str, url: str, text: str, topic_ids: list[str]) -> int:
        self.ensure_collection(); chunks = [text[index:index + 1500] for index in range(0, len(text), 1200)]
        points = []
        for index, chunk in enumerate(chunks):
            points.append(models.PointStruct(id=str(uuid.uuid4()), vector=self._embed(chunk), payload={"chunk_id": f"{source_id}-{index}", "source_id": source_id, "title": title, "url": url, "text": chunk, "topic_ids": topic_ids}))
        self.qdrant.upsert(self.settings.collection, points=points, wait=True); return len(points)

    def retrieve(self, query: str, topic_id: str, limit: int = 6) -> list[EvidenceChunk]:
        self.ensure_collection()
        results = self.qdrant.query_points(collection_name=self.settings.collection, query=self._embed(query), query_filter=models.Filter(must=[models.FieldCondition(key="topic_ids", match=models.MatchAny(any=[topic_id]))]), limit=limit, with_payload=True).points
        return [EvidenceChunk(chunk_id=str(point.payload["chunk_id"]), source_id=str(point.payload["source_id"]), title=str(point.payload["title"]), url=str(point.payload["url"]), text=str(point.payload["text"]), score=float(point.score)) for point in results]

    def structured_generate(self, prompt: str) -> dict[str, Any]:
        response = self.gemini.models.generate_content(model=self.settings.model, contents=prompt, config={"response_mime_type": "application/json", "temperature": 0.2})
        return json.loads(response.text)
