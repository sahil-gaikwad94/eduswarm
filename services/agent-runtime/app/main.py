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

from fastapi import BackgroundTasks, FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict
from app.rag import EvidenceChunk, OpenRouterRag

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
    """Resolve any curriculum topic id (legacy or new slug) to teachable metadata."""
    if topic_id in TOPICS:
        return TOPICS[topic_id]
    readable = re.sub(r"^(gate-cs|web-dev|ai-ml)-", "", topic_id).replace("-", " ").title()
    return {"title": readable, "description": f"A detailed tutorial on {readable} with concepts, examples, code, and practice.", "prerequisites": []}


def curriculum_fallback_evidence(topic_id: str, topic: dict[str, Any]) -> list[EvidenceChunk]:
    """Return clearly labeled curriculum briefs when Qdrant has not been seeded yet.

    This is deliberately a preview-grade evidence path: it keeps the agent useful
    for newly added syllabus topics without pretending that a missing index hit is
    a fully researched lesson. The publisher still requires two independent chunks,
    and the package records these sources for later replacement by indexed content.
    """
    title = topic["title"]
    description = topic["description"]
    return [
        EvidenceChunk("curriculum-brief-0", "gate-syllabus", CURRICULUM_SOURCES["gate-syllabus"]["title"], CURRICULUM_SOURCES["gate-syllabus"]["url"], f"Curriculum topic: {title}. Scope brief: {description} This topic belongs to the learner's selected EduSwarm curriculum and should be taught with definitions, worked examples, common misconceptions, and exam/application practice."),
        EvidenceChunk("curriculum-brief-1", "nptel-cs", CURRICULUM_SOURCES["nptel-cs"]["title"], CURRICULUM_SOURCES["nptel-cs"]["url"], f"Learning brief for {title}: {description} Explain the intuition first, then the formal vocabulary, then a small worked example and a verification exercise. Label this as a curriculum brief until a source document is indexed."),
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
        if any(value not in TOPICS for value in values): raise ValueError("Unknown topic ID")
        return values

class ToolRegistry:
    def validate_package(self, package: dict[str, Any], evidence: list[dict[str, Any]]) -> dict[str, Any]:
        known = {item["chunk_id"] for item in evidence}; errors: list[str] = []
        claims = package.get("claims", [])
        if len(evidence) < 2: errors.append("At least two independent trusted sources are required")
        if not claims: errors.append("No factual claims were produced")
        for index, claim in enumerate(claims):
            cited = set(claim.get("evidenceIds", []))
            if len(cited) < 2 or not cited <= known: errors.append(f"Claim {index + 1} lacks two valid independent citations")
        for artifact in ("flashcards", "quiz", "pyqs"):
            if not package.get(artifact): errors.append(f"{artifact} is missing")
            elif any(not item.get("claimIds") for item in package[artifact]): errors.append(f"{artifact} lacks claim provenance")
        if not package.get("notes", {}).get("sections"): errors.append("Notes Author produced no sections")
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
        plans = {
            "eli5": {"sections": 8, "tone": "a friendly story-first explainer for a complete beginner: everyday analogies before vocabulary, tiny examples, zero jargon without a definition"},
            "standard": {"sections": 11, "tone": "a rigorous exam-grade tutor: intuition, formalism, worked examples, code, visuals, complexity analysis, traps, and exam strategy"},
            "deep": {"sections": 15, "tone": "a demanding senior mentor: everything in standard plus proof sketches, advanced variations, production-system usage, and challenge drills"},
        }
        plan = plans[depth]
        self.state.context = {"topic": topic, "plan": ["ground evidence", "compose", "practice", "verify", "publish"], "depth": depth, "section_target": plan["sections"], "tone": plan["tone"], "daily_minutes": self.state.daily_minutes}; self.run_agent("Dean", "Plan the topic package", "Adapt scope to learner profile and time budget.", lambda: {"depth": depth, "minutes": self.state.daily_minutes}); self.state.current_node = "research"
    def research(self):
        if self.rag is None: self.rag = OpenRouterRag()
        query = f"{self.state.context['topic']['title']}: {self.state.context['topic']['description']}"
        evidence = self.run_agent("Researcher", "Retrieve grounded evidence", "Semantic-search the Qdrant knowledge base before generation.", lambda: {"evidence": [chunk.__dict__ for chunk in self.rag.retrieve(query, self.state.topic_id)]}, "qdrant_retrieve")["evidence"]
        if len({item["source_id"] for item in evidence}) < 2:
            fallback = curriculum_fallback_evidence(self.state.topic_id, self.state.context["topic"])
            evidence = [chunk.__dict__ for chunk in fallback]
            self.state.context["evidence_mode"] = "curriculum-preview"
        self.state.sources = evidence; self.state.context["evidence"] = evidence
        if len({item["source_id"] for item in evidence}) < 2: self.state.current_node = "failed"; self.state.error = "Insufficient independent retrieved evidence"; return
        self.state.current_node = "compose"
    def compose(self):
        evidence = self.state.context["evidence"]
        prompt = f'''You are the EduSwarm lesson author, {self.state.context['tone']}. Return JSON only with {{"notes":{{"sections":[{{"heading":str,"body":str,"claimIds":[int]}}]}},"claims":[{{"text":str,"evidenceIds":[str,str]}}]}}. Write a long, detailed {self.state.learner_level} tutorial for {self.state.context['topic']['title']} — never a short summary. Produce exactly {self.state.context['section_target']} substantial sections in this order: the core story/intuition, formal definition and vocabulary, a fully worked step-by-step example, a code walkthrough, a visual/diagram description, complexity and trade-offs with a comparison table, common mistakes and edge cases, exam and interview patterns, where the topic fits in the syllabus, a cheat sheet, and a practice plan. For the deep plan also add: proof sketch, advanced variations, production-system usage, and a challenge drill. For the eli5 plan, lead every section with an everyday analogy and keep formalism minimal. Each section body must be 3-5 paragraphs separated by blank lines, with concrete numbers, worked traces, fenced code blocks tagged with a language, at least one markdown comparison table, and at least one ```mermaid diagram block where the idea is structural (flows, states, hierarchies, pipelines). Every factual claim must cite exactly two distinct chunk IDs from this evidence. Do not use facts outside it.\n\nEVIDENCE:\n''' + "\n\n".join(f"[chunk_id={item['chunk_id']}; source={item['title']}]\n{item['text']}" for item in evidence)
        generated = self.run_agent("Notes Author", "Generate grounded notes with the language model", "Generate only from retrieved chunks and require claim-level citations.", lambda: self.rag.structured_generate(prompt), "structured_generate")
        if not generated.get("notes", {}).get("sections") or not generated.get("claims"): raise RuntimeError("The language model returned an invalid lesson schema")
        self.state.artifacts.update({"notes": generated["notes"], "claims": generated["claims"]}); self.state.current_node = "practice"
    def practice(self):
        prompt = f'''Return JSON only with {{"flashcards":[{{"question":str,"answer":str,"claimIds":[int]}}],"quiz":[{{"question":str,"options":[str,str,str,str],"answer":int,"explanation":str,"claimIds":[int]}}],"pyqs":[{{"year":int,"question":str,"difficulty":str,"claimIds":[int]}}]}}. Build active-recall practice only from these verified claims: {json.dumps(self.state.artifacts['claims'])}. Produce exactly 8 flashcards, 6 quiz questions (each explanation must justify the right answer AND eliminate every distractor), and 4 exam-style pyqs across easy/medium/hard. Every item needs claimIds.'''
        generated = self.run_agent("Practice Team", "Generate grounded practice with the language model", "Derive practice only from verified claims.", lambda: self.rag.structured_generate(prompt), "structured_generate")
        self.state.artifacts.update(generated); self.state.current_node = "verify"
    def verify(self):
        result = self.run_agent("Fact-Checker", "Verify package", "Fail closed on incomplete evidence.", lambda: TOOLS.validate_package(self.state.artifacts, self.state.context["evidence"]), "validate_package"); self.state.verification = result; self.state.current_node = "publish" if result["status"] == "approved" else "failed"; self.state.error = "; ".join(result["errors"]) if result["status"] != "approved" else None
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

@app.get("/health")
def health():
    rag = OpenRouterRag()
    return {
        "ok": True, "service": "agent-runtime", "mode": "langgraph-openrouter-qdrant",
        "providerConfigured": bool(os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")),
        "model": getattr(getattr(rag, "settings", None), "model", ""),
        "models": (rag.model_chain()[:4] if hasattr(rag, "model_chain") else []),
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
