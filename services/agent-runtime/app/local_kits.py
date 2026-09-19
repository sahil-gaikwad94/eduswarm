"""On-disk local study kits: seeded tutorial content used as offline evidence.

Why this exists
---------------
Lesson generation is grounded: the Notes Author may only use retrieved evidence.
When Qdrant has nothing indexed for a topic, the runtime falls back to a
"curriculum preview" brief — honest, but thin. A seeded local kit is the middle
tier: real, attributed tutorial text stored on disk, so a topic can be taught
properly even with Qdrant empty, the network down, or every model busy.

Kits are **data, not code**. They live outside the Git checkout (default
`/tmp/eduswarm-local-kits`, set `EDUSWARM_LOCAL_KITS_DIR` in a deploy to point at
a mounted disk) and are produced by `seed_knowledge.py --local-kits`, which only
fetches pages that the publisher's robots.txt permits and records the source URL
with every chunk. Nothing here downloads anything; this module only reads what
has already been seeded and licensed.

Kit file format — `<topic_id>.json`:

    {
      "topic_id": "web-dev-...",
      "title": "Node.js Runtime",
      "sources": [
        {"source_id": "gfg-nodejs",
         "title": "GeeksforGeeks: Node.js Tutorial",
         "url": "https://www.geeksforgeeks.org/...",
         "text": "…attributed extract…"}
      ]
    }
"""
from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

MIN_TEXT_LENGTH = 200
MAX_CHUNK_CHARS = 1500


def kits_dir() -> Path:
    return Path(os.getenv("EDUSWARM_LOCAL_KITS_DIR", "/tmp/eduswarm-local-kits"))


def kit_path(topic_id: str) -> Path:
    """Path for one topic's kit. The id is sanitised: it can reach this from HTTP."""
    safe = re.sub(r"[^A-Za-z0-9_-]", "-", topic_id)[:160]
    return kits_dir() / f"{safe}.json"


@lru_cache(maxsize=512)
def _load(path_text: str, stamp: float) -> dict[str, Any] | None:
    """Read and cache one kit, keyed by path and mtime so re-seeds are picked up."""
    try:
        data = json.loads(Path(path_text).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return data if isinstance(data, dict) else None


def load_kit(topic_id: str) -> dict[str, Any] | None:
    path = kit_path(topic_id)
    try:
        stamp = path.stat().st_mtime
    except OSError:
        return None
    return _load(str(path), stamp)


def kit_sources(topic_id: str) -> list[dict[str, str]]:
    """Usable, de-duplicated sources for a topic, or [] when none are seeded."""
    kit = load_kit(topic_id)
    sources = kit.get("sources") if isinstance(kit, dict) else None
    if not isinstance(sources, list):
        return []
    seen: set[str] = set()
    usable: list[dict[str, str]] = []
    for source in sources:
        if not isinstance(source, dict):
            continue
        text = " ".join(str(source.get("text", "")).split())
        source_id = str(source.get("source_id", "")).strip()
        if len(text) < MIN_TEXT_LENGTH or not source_id or source_id in seen:
            continue
        seen.add(source_id)
        usable.append({
            "source_id": source_id,
            "title": str(source.get("title") or source_id),
            "url": str(source.get("url", "")),
            "text": text[:MAX_CHUNK_CHARS],
        })
    return usable


def has_kit(topic_id: str) -> bool:
    """True when this topic has at least two independent seeded sources.

    Two is the threshold the fact-checker enforces, so a kit that cannot satisfy
    it is not worth preferring over the curriculum preview.
    """
    return len(kit_sources(topic_id)) >= 2


def available_topics() -> list[str]:
    directory = kits_dir()
    if not directory.is_dir():
        return []
    return sorted(path.stem for path in directory.glob("*.json"))


def write_kit(topic_id: str, title: str, sources: list[dict[str, str]]) -> Path:
    """Persist one seeded kit. Used by the seeder, never during a request."""
    directory = kits_dir()
    directory.mkdir(parents=True, exist_ok=True)
    path = kit_path(topic_id)
    path.write_text(json.dumps({"topic_id": topic_id, "title": title, "sources": sources}, indent=2), encoding="utf-8")
    _load.cache_clear()
    return path
