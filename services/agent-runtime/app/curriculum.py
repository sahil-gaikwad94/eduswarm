"""Read the API's canonical curriculum without maintaining a second topic list.

The API owns titles, scopes, and identifiers.  The runtime imports this small
parser at startup so every current GATE, web-development, and AI/ML topic gets
its real scope in retrieval/generation rather than a title-derived placeholder.
"""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Any

LEGACY = {
    "Time and Space Complexity": "algo-complexity",
    "Searching and Sorting": "algo-sorting",
    "Graph Algorithms": "algo-graphs",
}


def slug(value: str) -> str:
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


@lru_cache(maxsize=1)
def curriculum_topics() -> dict[str, dict[str, Any]]:
    curriculum = Path(__file__).resolve().parents[3] / "apps" / "api" / "src" / "curriculum.ts"
    lines = curriculum.read_text(encoding="utf-8").splitlines()
    goal = ""
    module = ""
    output: dict[str, dict[str, Any]] = {}
    goal_starts = {
        "const gateModules": "gate-cs",
        "const fullStackModules": "web-dev",
        "const aiModules": "ai-ml",
    }
    module_re = re.compile(r"^  \['([^']+)', \[$")
    topic_re = re.compile(r"^    \['([^']+)', '([^']+)', '[^']+'(?:, (\d+))?\],?$")
    for line in lines:
        for marker, candidate in goal_starts.items():
            if line.startswith(marker):
                goal = candidate
                module = ""
        matched_module = module_re.match(line)
        if matched_module:
            module = matched_module.group(1)
            continue
        matched_topic = topic_re.match(line)
        if not matched_topic or not goal or not module:
            continue
        title, description, minutes = matched_topic.groups()
        tid = LEGACY[title] if goal == "gate-cs" and title in LEGACY else f"{goal}-{slug(module)}-{slug(title)}"
        output[tid] = {
            "title": title,
            "description": description,
            "module": module,
            "goal": goal,
            "minutes": int(minutes or 35),
            "prerequisites": [],
        }
    if not output:
        raise RuntimeError(f"Could not parse any topics from {curriculum}")
    return output


def topic_for(topic_id: str) -> dict[str, Any] | None:
    return curriculum_topics().get(topic_id)
