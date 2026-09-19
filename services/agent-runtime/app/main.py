"""Durable, evidence-gated topic-package runtime."""
from __future__ import annotations

import asyncio
import json
import os
import re
import tempfile
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.parse import quote_plus

from fastapi import BackgroundTasks, FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict
from app.rag import EvidenceChunk, OpenRouterRag
from app.curriculum import topic_for
from app.local_kits import has_kit, kit_sources

class GraphState(TypedDict):
    node: str

app = FastAPI(title="EduSwarm Agent Runtime", version="1.2.0")
STATE_DIR = Path(os.getenv("EDUSWARM_STATE_DIR", "/tmp/eduswarm-state"))
STATE_DIR.mkdir(parents=True, exist_ok=True)
JOB_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$")
LEASE_SECONDS = 120

TOPICS = {
    "algo-complexity": {"title": "Time & Space Complexity", "description": "Analyze algorithm efficiency using asymptotic notation.", "prerequisites": []},
    "algo-arrays": {"title": "Arrays and Searching", "description": "Solve array problems with invariants and binary search.", "prerequisites": ["algo-complexity"]},
    "algo-linked-lists": {"title": "Linked Lists", "description": "Master pointers, reversal, fast and slow runners, and list merging.", "prerequisites": ["algo-arrays"]},
    "algo-stacks-queues": {"title": "Stacks and Queues", "description": "Model LIFO/FIFO systems and solve monotonic stack and sliding-window problems.", "prerequisites": ["algo-linked-lists"]},
    "algo-hashing": {"title": "Hashing", "description": "Trade memory for expected O(1) lookup with maps, sets, and frequency tables.", "prerequisites": ["algo-arrays"]},
    "algo-recursion": {"title": "Recursion and Backtracking", "description": "Build recursion trees, define base cases, and search constrained solution spaces.", "prerequisites": ["algo-complexity"]},
    "algo-sorting": {"title": "Sorting Algorithms", "description": "Compare insertion, merge, quick, heap, and counting sort by stability and complexity.", "prerequisites": ["algo-arrays"]},
    "algo-trees": {"title": "Trees and Binary Search Trees", "description": "Traverse trees, reason about height, and maintain ordered search properties.", "prerequisites": ["algo-recursion"]},
    "algo-heaps": {"title": "Heaps and Priority Queues", "description": "Use complete trees to schedule work and select smallest or largest elements efficiently.", "prerequisites": ["algo-trees"]},
    "algo-graphs": {"title": "Graph Traversals", "description": "Apply BFS and DFS, detect cycles, and reason about connected components.", "prerequisites": ["algo-trees"]},
    "algo-greedy": {"title": "Greedy Algorithms", "description": "Prove local choices, exchange arguments, and solve interval and scheduling problems.", "prerequisites": ["algo-sorting"]},
    "algo-dp": {"title": "Dynamic Programming", "description": "Turn overlapping subproblems into memoized and tabulated solutions.", "prerequisites": ["algo-recursion", "algo-complexity"]},
}
TRUSTED_SOURCES = {
    "mit-algorithms": {"title": "MIT OpenCourseWare: Introduction to Algorithms", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/", "topics": ["algo-complexity", "algo-arrays", "algo-graphs"]},
    "nptel-algorithms": {"title": "NPTEL: Design and Analysis of Algorithms", "url": "https://nptel.ac.in/courses/106/106/106106131/", "topics": ["algo-complexity", "algo-graphs"]},
    "cp-algorithms": {"title": "cp-algorithms: Binary Search", "url": "https://cp-algorithms.com/num_methods/binary_search.html", "topics": ["algo-arrays"]},
}

CURRICULUM_SOURCES = {
    "gate-syllabus": {"title": "GATE Computer Science and Information Technology syllabus", "url": "https://gate2026.iitg.ac.in/doc/GATE2026_Syllabus/CS_Computer_Science_and_Information_Technology.pdf"},
    "nptel-cs": {"title": "NPTEL Computer Science and Engineering courses", "url": "https://nptel.ac.in/course.html"},
}

def resolve_topic(topic_id: str) -> dict[str, Any]:
    """Resolve every canonical curriculum id before using a legacy fallback."""
    canonical = topic_for(topic_id)
    if canonical:
        return canonical
    if topic_id in TOPICS:
        return TOPICS[topic_id]
    readable = re.sub(r"^(gate-cs|web-dev|ai-ml)-", "", topic_id).replace("-", " ").title()
    return {"title": readable, "description": f"A detailed tutorial on {readable} with concepts, examples, code, and practice.", "prerequisites": []}


def reference_routes(topic_id: str, title: str) -> list[dict[str, str]]:
    """Reference links for every curriculum family, including unseeded topics."""
    query = quote_plus(title)
    lowered = f"{topic_id} {title}".lower()
    if "node-js-runtime" in topic_id or "node-js" in lowered:
        return [
            {"source_id": "gfg-nodejs", "title": "GeeksforGeeks: Node.js Tutorial", "url": "https://www.geeksforgeeks.org/node-js/nodejs/"},
            {"source_id": "nodejs-learn", "title": "Node.js Learn", "url": "https://nodejs.org/en/learn"},
        ]
    if topic_id.startswith("web-dev-"):
        primary = ("React Learn", "https://react.dev/learn") if "react" in lowered else ("Next.js Documentation", "https://nextjs.org/docs") if "next-js" in topic_id else (f"MDN Web Docs: {title}", f"https://developer.mozilla.org/en-US/search?q={query}")
        return [
            {"source_id": "mdn-web", "title": primary[0], "url": primary[1]},
            {"source_id": "gfg-web", "title": f"GeeksforGeeks: {title}", "url": f"https://www.geeksforgeeks.org/?s={query}"},
        ]
    if topic_id.startswith("ai-ml-"):
        primary = ("Hugging Face Learn", "https://huggingface.co/learn") if any(word in lowered for word in ("transformer", "rag", "llm", "hugging-face")) else ("PyTorch Tutorials", "https://docs.pytorch.org/tutorials/") if any(word in lowered for word in ("pytorch", "neural", "deep-learning", "cnn")) else ("scikit-learn User Guide", "https://scikit-learn.org/stable/user_guide.html")
        return [
            {"source_id": "ai-primary", "title": primary[0], "url": primary[1]},
            {"source_id": "gfg-ai", "title": f"GeeksforGeeks: {title}", "url": f"https://www.geeksforgeeks.org/?s={query}"},
        ]
    return [
        {"source_id": "gfg-gate", "title": f"GeeksforGeeks: {title}", "url": f"https://www.geeksforgeeks.org/?s={query}"},
        {"source_id": "nptel-cs", "title": "NPTEL Computer Science courses", "url": "https://nptel.ac.in/courses"},
    ]


def local_kit_evidence(topic_id: str) -> list[EvidenceChunk]:
    """Seeded, attributed tutorial text for a topic, or [] when none exists.

    This is the middle evidence tier: real source extracts that were seeded
    offline, used when Qdrant has nothing indexed. It keeps a topic teachable
    (and citable by two independent sources) without the network.
    """
    return [
        EvidenceChunk(f"local-kit-{index}", source["source_id"], source["title"], source["url"], source["text"])
        for index, source in enumerate(kit_sources(topic_id)[:4])
    ]


def curriculum_fallback_evidence(topic_id: str, topic: dict[str, Any]) -> list[EvidenceChunk]:
    """Labeled source routes when an indexed document is not ready yet.

    This preview never claims to have scraped a page. It carries the selected
    curriculum scope plus two topic-appropriate reference routes, allowing the
    publisher/UI to label the result honestly until the opt-in source seeder has
    indexed permitted source text.
    """
    title = topic["title"]
    description = topic["description"]
    routes = reference_routes(topic_id, title)
    return [
        EvidenceChunk(f"curriculum-brief-{index}", route["source_id"], route["title"], route["url"], f"Curriculum preview for {title}. Scope: {description} Teach the definition, a small worked example, assumptions, common misconceptions, and an application exercise. This is an EduSwarm curriculum brief, not extracted source text; use the linked {route['title']} for canonical detail.")
        for index, route in enumerate(routes[:2])
    ]

def now() -> str: return datetime.now(timezone.utc).isoformat()

@dataclass
class JobState:
    job_id: str
    topic_id: str
    learner_level: str = "beginner"
    daily_minutes: int = 60
    depth: str = "standard"
    force_research: bool = False
    status: str = "queued"
    current_node: str = "dean"
    iteration: int = 0
    context: dict[str, Any] = field(default_factory=dict)
    artifacts: dict[str, Any] = field(default_factory=dict)
    sources: list[dict[str, Any]] = field(default_factory=list)
    verification: dict[str, Any] = field(default_factory=lambda: {"status": "pending", "claimsChecked": 0, "sources": [], "errors": []})
    trace: list[dict[str, Any]] = field(default_factory=list)
    events: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None
    lease_until: str | None = None

class StateStore:
    def path(self, job_id: str) -> Path:
        if not JOB_ID.fullmatch(job_id): raise ValueError("Invalid job ID")
        return STATE_DIR / f"{job_id}.json"
    def load(self, job_id: str) -> JobState | None:
        path = self.path(job_id)
        return JobState(**json.loads(path.read_text())) if path.exists() else None
    def save(self, state: JobState) -> None:
        path = self.path(state.job_id)
        with tempfile.NamedTemporaryFile("w", delete=False, dir=STATE_DIR, encoding="utf-8") as out:
            json.dump(asdict(state), out, indent=2); out.flush(); os.fsync(out.fileno()); temp = out.name
        os.replace(temp, path)
    def claim(self, state: JobState) -> bool:
        lock = self.path(state.job_id).with_suffix(".lock")
        try:
            descriptor = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            return False
        try:
            latest = self.load(state.job_id)
            if latest and latest.status == "completed": return False
            if latest and latest.lease_until and datetime.fromisoformat(latest.lease_until) > datetime.now(timezone.utc): return False
            if latest:
                state.__dict__.update(asdict(latest))
            state.lease_until = (datetime.now(timezone.utc) + timedelta(seconds=LEASE_SECONDS)).isoformat()
            state.status = "running"; self.save(state); return True
        finally:
            os.close(descriptor)
            lock.unlink(missing_ok=True)

STORE = StateStore()

class TopicJob(BaseModel):
    job_id: str
    topic_id: str
    learner_level: str = Field(default="beginner", pattern="^(beginner|intermediate|advanced)$")
    daily_minutes: int = Field(default=60, ge=15, le=240)
    depth: str = Field(default="standard", pattern="^(eli5|standard|deep)$")
    force_research: bool = False
    @field_validator("job_id")
    @classmethod
    def valid_job_id(cls, value: str) -> str:
        if not JOB_ID.fullmatch(value): raise ValueError("job_id must be a safe identifier")
        return value

class KnowledgeDocument(BaseModel):
    source_id: str = Field(pattern=r"^[a-z0-9][a-z0-9-]{1,80}$")
    title: str = Field(min_length=3, max_length=300)
    url: str = Field(pattern=r"^https://")
    text: str = Field(min_length=200, max_length=200_000)
    topic_ids: list[str] = Field(min_length=1)
    @field_validator("topic_ids")
    @classmethod
    def known_topics(cls, values: list[str]) -> list[str]:
        # Source ingestion is available for every API curriculum topic, not
        # only the small set of legacy runtime aliases.
        if any(value not in TOPICS and topic_for(value) is None for value in values): raise ValueError("Unknown topic ID")
        return values

# Every published lesson carries at least MIN_SECTIONS note sections, whichever
# model wrote it: a model that returns two paragraphs is a weak reply, not a
# lesson. Deep deliberately runs longer than the 5-6 section standard window.
MIN_SECTIONS = 5
MAX_SECTIONS = 6
DEEP_MAX_SECTIONS = 9


def check_lesson_shape(package: Any) -> None:
    """Reject a structurally unusable lesson so the router tries another model.

    This runs *inside* the model chain (as `structured_generate`'s validator),
    not after it: a weak model that returns `{"notes": {}}` should cost one
    attempt, not the whole job. Only the shape is enforced here — citation
    quality is checked later by the fact-checker, which can ask for a repair.
    """
    if not isinstance(package, dict):
        raise ValueError("the reply was not a JSON object")
    sections = (package.get("notes") or {}).get("sections") if isinstance(package.get("notes"), dict) else None
    if not isinstance(sections, list) or not sections:
        raise ValueError("notes.sections is missing or empty")
    usable = [section for section in sections if isinstance(section, dict) and str(section.get("heading", "")).strip() and str(section.get("body", "")).strip()]
    if not usable:
        raise ValueError("no note section has both a heading and a body")
    if len(usable) < MIN_SECTIONS:
        # A model that ignored the section count produces a thin lesson, so try
        # the next one rather than publishing two paragraphs.
        raise ValueError(f"only {len(usable)} usable note sections; at least {MIN_SECTIONS} are required")
    package["notes"]["sections"] = usable
    claims = package.get("claims")
    if not isinstance(claims, list) or not claims:
        raise ValueError("claims is missing or empty")
    normalised: list[dict[str, Any]] = []
    for claim in claims:
        if not isinstance(claim, dict) or not str(claim.get("text", "")).strip():
            continue
        raw = claim.get("evidenceIds")
        if isinstance(raw, (str, int)):
            raw = [raw]
        ids = list(dict.fromkeys(str(value).strip() for value in (raw or []) if str(value).strip()))
        claim["evidenceIds"] = ids
        normalised.append(claim)
    if not normalised:
        raise ValueError("no claim has usable text")
    package["claims"] = normalised


class ToolRegistry:
    def validate_package(self, package: dict[str, Any], evidence: list[dict[str, Any]]) -> dict[str, Any]:
        evidence_by_id = {item["chunk_id"]: item for item in evidence}
        known = set(evidence_by_id)
        errors: list[str] = []
        claims = package.get("claims", [])
        valid_claim_ids = set(range(len(claims)))
        source_ids = {item.get("source_id") for item in evidence if item.get("source_id")}
        if len(source_ids) < 2: errors.append("At least two independent trusted sources are required")
        if not claims: errors.append("No factual claims were produced")
        for index, claim in enumerate(claims):
            cited = set(claim.get("evidenceIds", []))
            cited_sources = {evidence_by_id[item].get("source_id") for item in cited if item in evidence_by_id}
            if len(cited) != 2 or not cited <= known or len(cited_sources) != 2:
                errors.append(f"Claim {index + 1} lacks two valid independent citations")

        def has_valid_provenance(item: dict[str, Any]) -> bool:
            claim_ids = item.get("claimIds", [])
            return isinstance(claim_ids, list) and bool(claim_ids) and set(claim_ids) <= valid_claim_ids

        for artifact in ("flashcards", "quiz", "pyqs"):
            values = package.get(artifact)
            if not values: errors.append(f"{artifact} is missing")
            elif any(not isinstance(item, dict) or not has_valid_provenance(item) for item in values):
                errors.append(f"{artifact} lacks valid claim provenance")
        sections = package.get("notes", {}).get("sections", [])
        if not sections: errors.append("Notes Author produced no sections")
        elif any(not isinstance(section, dict) or not has_valid_provenance(section) for section in sections):
            errors.append("Notes sections lack valid claim provenance")
        return {"status": "approved" if not errors else "rejected", "claimsChecked": len(claims), "sources": sorted({item["title"] for item in evidence}), "errors": errors}
TOOLS = ToolRegistry()

class AgentGraph:
    def __init__(self, state: JobState): self.state = state; self.rag: OpenRouterRag | None = None
    def save(self): STORE.save(self.state)
    def event(self, agent: str, message: str, status: str = "running"):
        self.state.events.append({"id": len(self.state.events) + 1, "agent": agent, "message": message, "status": status, "node": self.state.current_node, "iteration": self.state.iteration, "timestamp": now()}); self.save()
    def run_agent(self, agent: str, action: str, rationale: str, fn: Callable[[], dict[str, Any]], tool: str | None = None):
        started = now(); self.event(agent, action)
        try: output = fn(); status = "completed"
        except Exception as exc: output = {"error": str(exc)}; status = "failed"
        self.state.trace.append({"agent": agent, "action": action, "rationale": rationale, "tool": tool, "input": {}, "output": output, "started_at": started, "finished_at": now(), "status": status}); self.state.iteration += 1; self.save()
        if status == "failed": raise RuntimeError(f"{agent}: {output['error']}")
        return output
    def dean(self):
        topic = resolve_topic(self.state.topic_id)
        depth = self.state.depth if self.state.depth in {"eli5", "standard", "deep"} else "standard"
        # The local companion supplies diagrams, code, recall prompts, and
        # reference links. The model only writes the evidence-sensitive
        # explanation, avoiding the former three-page wall of text and a
        # second provider round-trip.
        plans = {
            "eli5": {"sections": 5, "word_budget": 620, "practice": (5, 4, 2), "tone": "a story-first explainer for a complete beginner; define jargon immediately and use one tiny example"},
            "standard": {"sections": 6, "word_budget": 900, "practice": (5, 4, 3), "tone": "a concise, rigorous tutor; prioritize the mental model, formal rule, worked trace, trade-off, and trap"},
            "deep": {"sections": 9, "word_budget": 1700, "practice": (6, 5, 3), "tone": "a senior mentor; add a compact proof or derivation and production or transfer trade-off without repeating the standard material"},
        }
        plan = plans[depth]
        self.state.context = {
            "topic": topic,
            "plan": ["ground evidence", "compose compact lesson plus practice", "curate", "verify", "publish"],
            "depth": depth,
            "section_target": plan["sections"],
            "word_budget": plan["word_budget"],
            "practice_target": plan["practice"],
            "tone": plan["tone"],
            "daily_minutes": self.state.daily_minutes,
            "local_companion": True,
        }
        self.run_agent("Dean", "Plan a compact lesson with a local companion", "Use the model for evidence-sensitive explanation and local material for supporting examples, diagrams, and recall.", lambda: {"depth": depth, "minutes": self.state.daily_minutes, "word_budget": plan["word_budget"], "local_companion": True})
        self.state.current_node = "research"

    def research(self):
        if self.rag is None: self.rag = OpenRouterRag()
        query = f"{self.state.context['topic']['title']}: {self.state.context['topic']['description']}"
        def retrieve() -> dict[str, Any]:
            # Qdrant is an optimisation, not a dependency: an unreachable or
            # empty index must fall through to the local evidence tiers rather
            # than failing the learner's topic.
            try:
                return {"evidence": [chunk.__dict__ for chunk in self.rag.retrieve(query, self.state.topic_id)[:4]]}
            except Exception as exc:
                return {"evidence": [], "index_unavailable": f"{type(exc).__name__}: {exc}"[:200]}

        evidence = self.run_agent("Researcher", "Retrieve grounded evidence", "Retrieve a compact, diverse evidence set before generation.", retrieve, "qdrant_retrieve")["evidence"]
        if len({item["source_id"] for item in evidence}) < 2:
            # Prefer seeded local kit text (real attributed tutorial extracts)
            # over the thin curriculum brief whenever a kit exists for this topic.
            if has_kit(self.state.topic_id):
                evidence = [chunk.__dict__ for chunk in local_kit_evidence(self.state.topic_id)]
                self.state.context["evidence_mode"] = "local-kit"
            else:
                fallback = curriculum_fallback_evidence(self.state.topic_id, self.state.context["topic"])
                evidence = [chunk.__dict__ for chunk in fallback]
                self.state.context["evidence_mode"] = "curriculum-preview"
        self.state.sources = evidence; self.state.context["evidence"] = evidence
        if len({item["source_id"] for item in evidence}) < 2: self.state.current_node = "failed"; self.state.error = "Insufficient independent retrieved evidence"; return
        self.state.current_node = "compose"

    def compose(self):
        evidence = self.state.context["evidence"]
        flashcards, quiz, pyqs = self.state.context["practice_target"]
        prompt = f'''You are the EduSwarm lesson author, {self.state.context['tone']}. Return JSON only. Build one compact, evidence-grounded package with this exact shape:
{{"notes":{{"sections":[{{"heading":str,"body":str,"claimIds":[int]}}]}},"claims":[{{"text":str,"evidenceIds":[str,str]}}],"flashcards":[{{"question":str,"answer":str,"claimIds":[int]}}],"quiz":[{{"question":str,"options":[str,str,str,str],"answer":int,"explanation":str,"claimIds":[int]}}],"pyqs":[{{"year":int,"question":str,"difficulty":"easy|medium|hard","claimIds":[int]}}]}}.

Topic: {self.state.context['topic']['title']}. Learner level: {self.state.learner_level}. Write exactly {self.state.context['section_target']} note sections and approximately {self.state.context['word_budget']} words across the note bodies (never more than {self.state.context['word_budget'] + 150}). Use this order where applicable: intuition and scope; definitions/mental model; one worked trace; implementation or applied workflow; trade-offs and failure modes; exam/interview or production transfer; then compact proof/advanced sections only for deep. Each body is 1–2 short paragraphs; use at most one small code or table block in the whole notes. Do not repeat definitions. A local companion already supplies extra code, diagrams, source links, and drills.

Create {flashcards} active-recall flashcards, {quiz} four-option quiz questions, and {pyqs} exam/application prompts in the SAME response. Quiz explanations must give the governing rule and why the most tempting distractor is wrong. Every section and practice item needs claimIds. Make claims atomically checkable. Write 8 to 10 claims in total. Every claim must cite exactly two distinct chunk IDs from two different sources, and use no facts outside the evidence. Output only the JSON object, keys in order notes, claims, flashcards, quiz, pyqs.

EVIDENCE:
''' + "\n\n".join(f"[chunk_id={item['chunk_id']}; source={item['title']}; url={item['url']}]\n{item['text']}" for item in evidence)
        # The shape check runs inside the model chain: a structurally wrong
        # reply costs one model attempt instead of failing the learner's job.
        generated = self.run_agent("Notes Author", "Generate the compact lesson and practice in one model call", "A single schema-constrained response removes a slow second provider request while retaining claim provenance.", lambda: self.rag.structured_generate(prompt, validator=check_lesson_shape, long=self.state.context.get("depth") == "deep"), "structured_generate")
        self.state.artifacts.update(generated); self.state.current_node = "practice"

    def practice(self):
        """Curate/fill practice locally instead of making a second model call."""
        claims = self.state.artifacts.get("claims", [])
        valid_ids = list(range(len(claims)))
        if not valid_ids:
            raise RuntimeError("Cannot curate practice without verified claims")

        def claim_ids(item: dict[str, Any], fallback: int) -> list[int]:
            values = [int(value) for value in item.get("claimIds", []) if isinstance(value, int) or str(value).isdigit()]
            values = [value for value in values if value in valid_ids]
            return values or [fallback]

        def compact(text: str, length: int = 180) -> str:
            value = " ".join(str(text).split())
            return value if len(value) <= length else value[:length - 1].rstrip() + "…"

        target_cards, target_quiz, target_pyqs = self.state.context["practice_target"]
        cards = [item for item in self.state.artifacts.get("flashcards", []) if isinstance(item, dict) and item.get("question") and item.get("answer")]
        for index, item in enumerate(cards): item["claimIds"] = claim_ids(item, index % len(valid_ids))
        while len(cards) < target_cards:
            index = len(cards) % len(valid_ids); claim = claims[index]
            cards.append({"question": f"What is the key point about {self.state.context['topic']['title']}?", "answer": compact(claim.get("text", "")), "claimIds": [index]})

        quiz = [item for item in self.state.artifacts.get("quiz", []) if isinstance(item, dict) and item.get("question") and isinstance(item.get("options"), list) and len(item["options"]) == 4 and isinstance(item.get("answer"), int)]
        for index, item in enumerate(quiz): item["claimIds"] = claim_ids(item, index % len(valid_ids))
        while len(quiz) < target_quiz:
            index = len(quiz) % len(valid_ids); fact = compact(claims[index].get("text", ""))
            quiz.append({"question": f"Which statement is supported by the lesson on {self.state.context['topic']['title']}?", "options": [fact, "A claim that ignores the stated assumptions", "A conclusion from an unrelated topic", "A rule that contradicts the evidence"], "answer": 0, "explanation": "The first option restates a verified claim. The other options either drop its conditions, introduce unrelated material, or contradict the cited lesson evidence.", "claimIds": [index]})

        pyqs = [item for item in self.state.artifacts.get("pyqs", []) if isinstance(item, dict) and item.get("question")]
        for index, item in enumerate(pyqs): item["claimIds"] = claim_ids(item, index % len(valid_ids))
        while len(pyqs) < target_pyqs:
            index = len(pyqs) % len(valid_ids)
            pyqs.append({"year": datetime.now(timezone.utc).year, "question": f"Apply this claim to a small case and justify each step: {compact(claims[index].get('text', ''), 220)}", "difficulty": ("easy", "medium", "hard")[len(pyqs) % 3], "claimIds": [index]})

        # Retain the strongest sections if a provider ignored the compact
        # target, rather than publishing a slow three-page response. The floor
        # is enforced upstream by check_lesson_shape, so this only trims.
        ceiling = DEEP_MAX_SECTIONS if self.state.context.get("depth") == "deep" else MAX_SECTIONS
        sections = self.state.artifacts.get("notes", {}).get("sections", [])[:max(MIN_SECTIONS, min(ceiling, self.state.context["section_target"]))]
        for index, section in enumerate(sections):
            section["claimIds"] = claim_ids(section, index % len(valid_ids))
        self.state.artifacts["notes"]["sections"] = sections
        self.state.artifacts.update({"flashcards": cards[:target_cards], "quiz": quiz[:target_quiz], "pyqs": pyqs[:target_pyqs]})
        self.run_agent("Practice Team", "Curate claim-linked recall practice locally", "Reuse the one-call lesson output and deterministically fill any missing practice so publishing is faster and reliable.", lambda: {"flashcards": len(self.state.artifacts["flashcards"]), "quiz": len(self.state.artifacts["quiz"]), "pyqs": len(self.state.artifacts["pyqs"]), "generation_calls_saved": 1}, "local_practice_curator")
        self.state.current_node = "verify"

    def repair_citations(self) -> bool:
        """Ask the model once to re-cite its claims against the real chunk ids.

        Weaker free models routinely cite one chunk, invent an id, or use two
        chunks from the same source. That is a fixable formatting error, not a
        reason to throw away a good lesson — but the fix must come from the
        model, never from us silently attaching citations to a claim. If the
        repair also fails, verification stays failed (fail closed).
        """
        evidence = self.state.context["evidence"]
        claims = self.state.artifacts.get("claims", [])
        if not claims or len(({item.get("source_id") for item in evidence})) < 2:
            return False
        catalogue = "\n".join(f'- chunk_id "{item["chunk_id"]}" (source_id "{item["source_id"]}", {item["title"]})' for item in evidence)
        prompt = (
            'Return JSON only: {"claims": [{"text": str, "evidenceIds": [str, str]}]}.\n\n'
            "These claims were written from the evidence below but their citations are invalid. "
            "Re-cite every claim using ONLY the chunk_ids listed here. Each claim must cite exactly two "
            "different chunk_ids that belong to two DIFFERENT source_ids. Keep the claim text and the claim "
            "order unchanged; if a claim genuinely cannot be supported by two independent chunks, rewrite its "
            "text so that it can be, without inventing facts.\n\n"
            f"VALID CHUNKS:\n{catalogue}\n\nCLAIMS TO RE-CITE:\n"
            + "\n".join(f"{index}. {claim.get('text', '')}" for index, claim in enumerate(claims))
        )
        valid_ids = {item["chunk_id"]: item.get("source_id") for item in evidence}

        def validator(package: Any) -> None:
            repaired = package.get("claims") if isinstance(package, dict) else None
            if not isinstance(repaired, list) or len(repaired) != len(claims):
                raise ValueError("the repair must return one entry per original claim")
            for claim in repaired:
                ids = list(dict.fromkeys(str(value) for value in (claim.get("evidenceIds") or []) if str(value).strip())) if isinstance(claim, dict) else []
                if len(ids) != 2 or not set(ids) <= set(valid_ids) or len({valid_ids[item] for item in ids}) != 2:
                    raise ValueError("every claim needs two valid chunk ids from two different sources")
                claim["evidenceIds"] = ids

        try:
            repaired = self.rag.structured_generate(prompt, validator=validator)
        except Exception:
            return False
        for original, fixed in zip(claims, repaired["claims"]):
            original["evidenceIds"] = fixed["evidenceIds"]
            if str(fixed.get("text", "")).strip():
                original["text"] = str(fixed["text"]).strip()
        return True

    def verify(self):
        result = self.run_agent("Fact-Checker", "Verify package", "Fail closed on incomplete evidence.", lambda: TOOLS.validate_package(self.state.artifacts, self.state.context["evidence"]), "validate_package")
        if result["status"] != "approved" and any("citation" in error for error in result["errors"]):
            # One bounded repair round: the model re-cites its own claims from
            # the real chunk list. We never invent a citation on its behalf.
            if self.run_agent("Fact-Checker", "Request corrected citations", "Invalid citations are a formatting failure; ask the author to re-cite before failing the topic.", lambda: {"repaired": self.repair_citations()}, "repair_citations")["repaired"]:
                result = self.run_agent("Fact-Checker", "Re-verify repaired package", "Fail closed if the repaired citations are still invalid.", lambda: TOOLS.validate_package(self.state.artifacts, self.state.context["evidence"]), "validate_package")
        self.state.verification = result
        self.state.current_node = "publish" if result["status"] == "approved" else "failed"
        self.state.error = "; ".join(result["errors"]) if result["status"] != "approved" else None
    def publish(self):
        self.state.artifacts.update({"topicId": self.state.topic_id, "title": self.state.context["topic"]["title"], "depth": self.state.context.get("depth", "standard"), "videos": [{"title": f"Trusted lecture search: {self.state.context['topic']['title']}", "url": "https://www.youtube.com/results?search_query=" + self.state.topic_id, "timestamp": "00:00"}], "verification": self.state.verification}); self.run_agent("Publisher", "Publish verified package", "Only approved packages are visible.", lambda: {"published": True}); self.state.current_node = "complete"
    def build_graph(self):
        graph = StateGraph(GraphState)
        for name in ("dean", "research", "compose", "practice", "verify", "publish"):
            graph.add_node(name, lambda _state, node=name: (getattr(self, node)() or {"node": node}))
        graph.set_entry_point("dean"); graph.add_edge("dean", "research"); graph.add_conditional_edges("research", lambda _state: "compose" if self.state.current_node == "compose" else END, {"compose": "compose", END: END}); graph.add_edge("compose", "practice"); graph.add_edge("practice", "verify")
        graph.add_conditional_edges("verify", lambda _state: "publish" if self.state.current_node == "publish" else END, {"publish": "publish", END: END}); graph.add_edge("publish", END)
        return graph.compile()
    async def execute(self):
        try:
            self.build_graph().invoke({"node": "start"})
            self.state.status = "completed" if self.state.current_node == "complete" else "failed"; self.state.lease_until = None; self.event("Dean", "Agent graph completed" if self.state.status == "completed" else "Agent graph blocked", self.state.status)
        except Exception as exc:
            self.state.status = "failed"; self.state.error = str(exc); self.state.lease_until = None; self.event("Runtime", str(exc), "failed")
        self.save()

class AgentChatRequest(BaseModel):
    agent_id: str
    agent_name: str = "Specialist Tutor"
    agent_role: str = "Learning specialist"
    topic_id: str | None = None
    topic_title: str | None = None
    goal: str = "gate-cs"
    system: str = Field(default="", max_length=12000)
    messages: list[dict[str, str]] = Field(default_factory=list)

@app.post("/v1/agent-chat")
def agent_chat(request: AgentChatRequest):
    """Specialist chat: API-supplied system prompt + retrieved evidence."""
    question = ""
    for message in reversed(request.messages):
        text = str(message.get("content", message.get("text", ""))).strip()
        if message.get("role", "user") != "assistant" and text:
            question = text
            break
    if not question:
        raise HTTPException(422, "A learner message is required")

    topic = resolve_topic(request.topic_id or "") if request.topic_id else None
    topic_label = request.topic_title or (topic["title"] if topic else "a computer science topic")

    # Ground the answer in indexed knowledge when the topic has evidence.
    evidence: list[EvidenceChunk] = []
    if request.topic_id:
        try:
            evidence = OpenRouterRag().retrieve(f"{topic_label}: {question}", request.topic_id, limit=3)
        except Exception:
            evidence = []
    grounding = "\n\n".join(chunk.as_prompt() for chunk in evidence[:3])

    persona = {
        "socratic-tutor": "Guide with questions, expose assumptions, use small counterexamples, and never skip the learner's reasoning.",
        "pyq-coach": "Act as an exam strategist. Classify the question, identify the invariant, compare distractors, and teach time management.",
        "doubt-solver": "Debug the learner's understanding. Give one hint at a time, diagnose the exact failed assumption, then walk the full solution.",
        "code-reviewer": "Review code like a senior engineer. Cover correctness, edge cases, complexity, maintainability, and a concrete improvement.",
        "mock-examiner": "Coach exam temperament. Analyze accuracy, negative-mark leakage, pacing, and subject order for the next mock.",
        "revision-planner": "Design a realistic spaced-repetition plan based on confidence, errors, time budget, and the next measurable action.",
        "career-mentor": "Connect learning to careers. Map skills to roles, projects, and interview stories with a concrete ladder.",
    }.get(request.agent_id, "Teach clearly with examples and checks for understanding.")

    default_system = (
        f"You are {request.agent_name}, EduSwarm's {request.agent_role}. {persona}\n"
        f"The learner is studying \"{topic_label}\" in the {request.goal} universe.\n"
        "Answer the message they actually sent: quote the concept, option, or line of code they mentioned.\n"
        "Structure: Answer (1-2 sentences) / Why / Worked example or code / Trap / Next step.\n"
        "Never answer a concrete question with generic study advice. Under 300 words. No preamble."
    )
    system = request.system.strip() or default_system
    # Always re-anchor the lesson, even when the caller supplied its own prompt.
    if request.topic_id or request.topic_title:
        system += f'\n\nLesson anchor: "{topic_label}" in the {request.goal} universe.'
    if grounding:
        system += f"\n\nRetrieved evidence (cite it only when it actually answers the question):\n{grounding}"

    try:
        reply, model = OpenRouterRag().chat_with_model(request.messages[-12:], system)
        return {"reply": reply, "provider": "openrouter", "model": model, "sources": sorted({chunk.title for chunk in evidence})}
    except Exception as exc:
        raise HTTPException(503, f"Agent provider unavailable: {exc}")


class DoubtSolveRequest(BaseModel):
    topic_id: str | None = None
    messages: list[dict[str, str]] = Field(default_factory=list)
    lesson_context: str = Field(default="", max_length=6000)


class StudyPlanRequest(BaseModel):
    goal: str = "gate-cs"
    daily_minutes: int = Field(default=60, ge=15, le=240)
    target_date: str | None = None
    weak_topics: list[str] = Field(default_factory=list)
    due_reviews: int = Field(default=0, ge=0)
    next_topic: str | None = None


class EvaluateCodeRequest(BaseModel):
    language: str = "javascript"
    code: str = Field(min_length=10, max_length=20000)
    problem: str = Field(default="General code review", max_length=4000)


class MockAnalysisRequest(BaseModel):
    course: str = "gate-cs"
    score: float = 0
    max_marks: float = 1
    accuracy: float = 0
    per_subject: list[dict[str, Any]] = Field(default_factory=list)
    mistakes: list[str] = Field(default_factory=list)


@app.post("/v1/doubt-solve")
def doubt_solve(request: DoubtSolveRequest):
    """Answer a learner doubt grounded in retrieved evidence + lesson context."""
    question = ""
    for message in reversed(request.messages):
        text = str(message.get("content", message.get("text", ""))).strip()
        if message.get("role", "user") != "assistant" and text:
            question = text
            break
    if not question:
        raise HTTPException(422, "A learner question is required")
    try:
        rag = OpenRouterRag()
        evidence: list[EvidenceChunk] = []
        if request.topic_id:
            try:
                evidence = rag.retrieve(f"{resolve_topic(request.topic_id)['title']}: {question}", request.topic_id, limit=4)
            except Exception:
                evidence = []
        grounding = "\n\n".join(chunk.as_prompt() for chunk in evidence) if evidence else "No indexed evidence available; rely on the lesson context and first principles."
        system = (
            "You are EduSwarm's Doubt Solver. Resolve the doubt precisely.\n"
            f"Topic: {resolve_topic(request.topic_id)['title'] if request.topic_id else 'general'}\n"
            f"Lesson context:\n{request.lesson_context or '(none provided)'}\n\n"
            f"Retrieved evidence:\n{grounding}\n\n"
            "Format: start with the direct answer in one or two sentences, then a short worked explanation, "
            "then the trap to avoid. If the question is ambiguous, state your assumption explicitly."
        )
        reply = rag.chat(request.messages[-8:], system)
        return {"reply": reply, "provider": "openrouter", "sources": sorted({chunk.title for chunk in evidence})}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(503, f"Agent provider unavailable: {exc}")


@app.post("/v1/study-plan")
def study_plan(request: StudyPlanRequest):
    """Generate a time-boxed daily plan as structured JSON."""
    prompt = (
        'Return JSON only with {"totalMinutes": int, "intensity": "steady|focused|sprint", '
        '"blocks": [{"kind": str, "title": str, "detail": str, "minutes": int}]}. '
        f"Design today's study plan for a {request.goal} learner with {request.daily_minutes} minutes. "
        f"Weak topics: {request.weak_topics or ['none reported']}. "
        f"Due flashcard reviews: {request.due_reviews}. "
        f"Next new topic: {request.next_topic or 'syllabus order'}. "
        f"Target exam/career date: {request.target_date or 'not set'}. "
        "Rules: blocks must sum to at most daily minutes; put spaced review first when due; "
        "include exactly one new-topic block when one is available; keep titles concrete."
    )
    try:
        plan = OpenRouterRag().structured_generate(prompt)
    except Exception as exc:
        raise HTTPException(503, f"Agent provider unavailable: {exc}")
    blocks = plan.get("blocks") if isinstance(plan, dict) else None
    if not blocks:
        raise HTTPException(502, "The planner returned an empty plan")
    total = sum(int(block.get("minutes", 0)) for block in blocks if isinstance(block, dict))
    return {"totalMinutes": total or request.daily_minutes, "intensity": str(plan.get("intensity", "steady")), "blocks": blocks, "provider": "openrouter"}


@app.post("/v1/evaluate-code")
def evaluate_code(request: EvaluateCodeRequest):
    """Rubric-based code review as structured JSON."""
    prompt = (
        'Return JSON only with {"verdict": str, "score": int (0-100), "findings": [str], '
        '"strengths": [str], "complexity": str, "corrected_code": str | null}. '
        f"Review this {request.language} solution for: {request.problem}\n\n```{request.language}\n{request.code}\n```\n\n"
        "Be specific: name the failing input for each finding, state worst-case time/space, "
        "and provide corrected code only when a real defect exists."
    )
    try:
        review = OpenRouterRag().structured_generate(prompt)
    except Exception as exc:
        raise HTTPException(503, f"Agent provider unavailable: {exc}")
    if not isinstance(review, dict) or "verdict" not in review:
        raise HTTPException(502, "The reviewer returned an invalid report")
    review["provider"] = "openrouter"
    return review


@app.post("/v1/mock-analysis")
def mock_analysis(request: MockAnalysisRequest):
    """Turn a mock score split into strengths, weaknesses, and next steps."""
    prompt = (
        'Return JSON only with {"summary": str, "strengths": [str], "weaknesses": [str], "next_steps": [str]}. '
        f"Analyze this {request.course} mock: score {request.score}/{request.max_marks}, accuracy {request.accuracy}%. "
        f"Per-subject split: {json.dumps(request.per_subject) or 'not provided'}. "
        f"Recent mistake topics: {request.mistakes or ['none']}. "
        "Give exam-temperament advice: question order, time budget, and which two topics to repair before the next mock."
    )
    try:
        analysis = OpenRouterRag().structured_generate(prompt)
    except Exception as exc:
        raise HTTPException(503, f"Agent provider unavailable: {exc}")
    if not isinstance(analysis, dict) or "next_steps" not in analysis:
        raise HTTPException(502, "The examiner returned an invalid analysis")
    analysis["provider"] = "openrouter"
    return analysis


@app.get("/v1/knowledge/search")
def knowledge_search(q: str, topic_id: str | None = None, limit: int = 6):
    """Hybrid knowledge search (works with Qdrant alone — no LLM key needed)."""
    if len(q.strip()) < 2:
        raise HTTPException(422, "Query must be at least 2 characters")
    try:
        chunks = OpenRouterRag().search(q.strip(), topic_id=topic_id, limit=max(1, min(12, limit)))
    except Exception as exc:
        raise HTTPException(503, f"Knowledge search unavailable: {exc}")
    return {"query": q.strip(), "chunks": [chunk.__dict__ for chunk in chunks]}


async def launch_agent(state: JobState):
    """Run blocking LangGraph/provider work outside FastAPI's event loop."""
    await asyncio.to_thread(lambda: asyncio.run(AgentGraph(state).execute()))

def _cached_chain(rag: Any) -> list[str]:
    try:
        return rag.model_chain(fetch=False)
    except TypeError:  # test doubles keep the old zero-argument signature
        return rag.model_chain()
    except Exception:
        return []


@app.get("/health")
def health():
    rag = OpenRouterRag()
    return {
        "ok": True, "service": "agent-runtime", "mode": "langgraph-openrouter-qdrant",
        "providerConfigured": bool(os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")),
        "model": getattr(getattr(rag, "settings", None), "model", ""),
        # Cached catalogue only: Render's health check must never wait on a
        # live OpenRouter request.
        "models": (_cached_chain(rag)[:4] if hasattr(rag, "model_chain") else []),
    }
@app.get("/ready")
def ready():
    if not (os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")): raise HTTPException(503, "OPENROUTER_API_KEY is not configured")
    try:
        OpenRouterRag().qdrant.get_collections()
    except Exception as exc:
        raise HTTPException(503, f"Qdrant is not ready: {exc}")
    return {"ok": True, "service": "agent-runtime", "mode": "langgraph-openrouter-qdrant"}
@app.post("/v1/knowledge/documents", status_code=202)
def ingest_document(document: KnowledgeDocument):
    try: chunks = OpenRouterRag().ingest(**document.model_dump())
    except Exception as exc: raise HTTPException(503, f"Knowledge ingestion unavailable: {exc}")
    return {"source_id": document.source_id, "chunks": chunks}
@app.post("/v1/topic-jobs", status_code=202)
async def create_job(job: TopicJob, background_tasks: BackgroundTasks):
    existing = STORE.load(job.job_id)
    if existing and existing.status in {"running", "completed"}: return asdict(existing)
    state = existing or JobState(**job.model_dump())
    if not STORE.claim(state): return asdict(STORE.load(job.job_id) or state)
    asyncio.create_task(launch_agent(state)); return asdict(state)
@app.get("/v1/topic-jobs/{job_id}")
def get_job(job_id: str):
    try: state = STORE.load(job_id)
    except ValueError: raise HTTPException(404, "Job not found")
    if not state: raise HTTPException(404, "Job not found")
    result = asdict(state); result["package"] = state.artifacts if state.status == "completed" else None; return result
@app.get("/v1/topic-jobs/{job_id}/trace")
def get_trace(job_id: str):
    state = STORE.load(job_id)
    if not state: raise HTTPException(404, "Job not found")
    return {"job_id": job_id, "trace": state.trace, "checkpoints": state.iteration}
@app.post("/v1/topic-jobs/{job_id}/resume", status_code=202)
async def resume_job(job_id: str, background_tasks: BackgroundTasks):
    state = STORE.load(job_id)
    if not state: raise HTTPException(404, "Job not found")
    if state.status == "completed": return asdict(state)
    if not STORE.claim(state): return {"job_id": job_id, "status": "running"}
    asyncio.create_task(launch_agent(state)); return {"job_id": job_id, "resumed_from": state.current_node, "status": "queued"}
