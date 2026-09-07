"""Durable, evidence-gated topic-package runtime.

The default provider is deterministic so CI is reproducible. A future Gemini provider is
intentionally an adapter boundary; no provider key is required to run this service.
"""
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
from app.rag import GeminiRag

class GraphState(TypedDict):
    pass

app = FastAPI(title="EduSwarm Agent Runtime", version="1.1.0")
STATE_DIR = Path(os.getenv("EDUSWARM_STATE_DIR", "/tmp/eduswarm-state"))
STATE_DIR.mkdir(parents=True, exist_ok=True)
JOB_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$")
LEASE_SECONDS = 120

TOPICS = {
    "algo-complexity": {"title": "Time & Space Complexity", "description": "Analyze algorithm efficiency using asymptotic notation.", "prerequisites": []},
    "algo-arrays": {"title": "Arrays and Searching", "description": "Solve array problems with invariants and binary search.", "prerequisites": ["algo-complexity"]},
    "algo-graphs": {"title": "Graph Traversals", "description": "Apply BFS and DFS to connected structures.", "prerequisites": ["algo-arrays"]},
}
TRUSTED_SOURCES = {
    "mit-algorithms": {"title": "MIT OpenCourseWare: Introduction to Algorithms", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/", "topics": ["algo-complexity", "algo-arrays", "algo-graphs"]},
    "nptel-algorithms": {"title": "NPTEL: Design and Analysis of Algorithms", "url": "https://nptel.ac.in/courses/106/106/106106131/", "topics": ["algo-complexity", "algo-graphs"]},
    "cp-algorithms": {"title": "cp-algorithms: Binary Search", "url": "https://cp-algorithms.com/num_methods/binary_search.html", "topics": ["algo-arrays"]},
}

def now() -> str: return datetime.now(timezone.utc).isoformat()

@dataclass
class JobState:
    job_id: str
    topic_id: str
    learner_level: str = "beginner"
    daily_minutes: int = 60
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
    def __init__(self, state: JobState): self.state = state; self.rag = GeminiRag()
    def save(self): STORE.save(self.state)
    def event(self, agent: str, message: str, status: str = "running"):
        self.state.events.append({"id": len(self.state.events) + 1, "agent": agent, "message": message, "status": status, "node": self.state.current_node, "iteration": self.state.iteration, "timestamp": now()}); self.save()
    def run_agent(self, agent: str, action: str, rationale: str, fn: Callable[[], dict[str, Any]], tool: str | None = None):
        started = now(); self.event(agent, action)
        try: output = fn(); status = "completed"
        except Exception as exc: output = {"error": str(exc)}; status = "failed"
        self.state.trace.append({"agent": agent, "action": action, "rationale": rationale, "tool": tool, "input": {}, "output": output, "started_at": started, "finished_at": now(), "status": status}); self.save()
        if status == "failed": raise RuntimeError(f"{agent}: {output['error']}")
        return output
    def dean(self):
        topic = TOPICS.get(self.state.topic_id)
        if not topic: raise ValueError("Unknown topic")
        depth = "foundational examples" if self.state.learner_level == "beginner" else "exam-style tradeoffs"
        self.state.context = {"topic": topic, "plan": ["ground evidence", "compose", "practice", "verify", "publish"], "depth": depth, "daily_minutes": self.state.daily_minutes}; self.run_agent("Dean", "Plan the topic package", "Adapt scope to learner profile and time budget.", lambda: {"depth": depth, "minutes": self.state.daily_minutes}); self.state.current_node = "research"
    def research(self):
        query = f"{self.state.context['topic']['title']}: {self.state.context['topic']['description']}"
        evidence = self.run_agent("Researcher", "Retrieve grounded evidence", "Semantic-search the Qdrant knowledge base before generation.", lambda: {"evidence": [chunk.__dict__ for chunk in self.rag.retrieve(query, self.state.topic_id)]}, "qdrant_retrieve")["evidence"]
        self.state.sources = evidence; self.state.context["evidence"] = evidence
        if len({item["source_id"] for item in evidence}) < 2: self.state.current_node = "failed"; self.state.error = "Insufficient independent retrieved evidence"; return
        self.state.current_node = "compose"
    def compose(self):
        evidence = self.state.context["evidence"]
        prompt = f'''You are the EduSwarm lesson author. Return JSON only with {{"notes":{{"sections":[{{"heading":str,"body":str,"claimIds":[int]}}]}},"claims":[{{"text":str,"evidenceIds":[str,str]}}]}}. Write a concise {self.state.learner_level} lesson for {self.state.context['topic']['title']}. Every factual claim must cite exactly two distinct chunk IDs from this evidence. Do not use facts outside it.\n\nEVIDENCE:\n''' + "\n\n".join(f"[chunk_id={item['chunk_id']}; source={item['title']}]\n{item['text']}" for item in evidence)
        generated = self.run_agent("Notes Author", "Generate grounded notes with Gemini", "Generate only from retrieved chunks and require claim-level citations.", lambda: self.rag.structured_generate(prompt), "gemini_generate_content")
        if not generated.get("notes", {}).get("sections") or not generated.get("claims"): raise RuntimeError("Gemini returned an invalid lesson schema")
        self.state.artifacts.update({"notes": generated["notes"], "claims": generated["claims"]}); self.state.current_node = "practice"
    def practice(self):
        prompt = f'''Return JSON only with {{"flashcards":[{{"question":str,"answer":str,"claimIds":[int]}}],"quiz":[{{"question":str,"options":[str,str,str,str],"answer":int,"explanation":str,"claimIds":[int]}}],"pyqs":[{{"year":int,"question":str,"difficulty":str,"claimIds":[int]}}]}}. Build active-recall practice only from these verified claims: {json.dumps(self.state.artifacts['claims'])}. Every item needs claimIds.'''
        generated = self.run_agent("Practice Team", "Generate grounded practice with Gemini", "Derive practice only from verified claims.", lambda: self.rag.structured_generate(prompt), "gemini_generate_content")
        self.state.artifacts.update(generated); self.state.current_node = "verify"
    def verify(self):
        result = self.run_agent("Fact-Checker", "Verify package", "Fail closed on incomplete evidence.", lambda: TOOLS.validate_package(self.state.artifacts, self.state.context["evidence"]), "validate_package"); self.state.verification = result; self.state.current_node = "publish" if result["status"] == "approved" else "failed"; self.state.error = "; ".join(result["errors"]) if result["status"] != "approved" else None
    def publish(self):
        self.state.artifacts.update({"topicId": self.state.topic_id, "title": self.state.context["topic"]["title"], "videos": [{"title": f"Trusted lecture search: {self.state.context['topic']['title']}", "url": "https://www.youtube.com/results?search_query=" + self.state.topic_id, "timestamp": "00:00"}], "verification": self.state.verification}); self.run_agent("Publisher", "Publish verified package", "Only approved packages are visible.", lambda: {"published": True}); self.state.current_node = "complete"
    def build_graph(self):
        graph = StateGraph(GraphState)
        for name in ("dean", "research", "compose", "practice", "verify", "publish"):
            graph.add_node(name, lambda _state, node=name: (getattr(self, node)() or {}))
        graph.set_entry_point("dean"); graph.add_edge("dean", "research"); graph.add_conditional_edges("research", lambda _state: "compose" if self.state.current_node == "compose" else END, {"compose": "compose", END: END}); graph.add_edge("compose", "practice"); graph.add_edge("practice", "verify")
        graph.add_conditional_edges("verify", lambda _state: "publish" if self.state.current_node == "publish" else END, {"publish": "publish", END: END}); graph.add_edge("publish", END)
        return graph.compile()
    async def execute(self):
        try:
            self.build_graph().invoke({})
            self.state.status = "completed" if self.state.current_node == "complete" else "failed"; self.state.lease_until = None; self.event("Dean", "Agent graph completed" if self.state.status == "completed" else "Agent graph blocked", self.state.status)
        except Exception as exc:
            self.state.status = "failed"; self.state.error = str(exc); self.state.lease_until = None; self.event("Runtime", str(exc), "failed")
        self.save()

@app.get("/health")
def health(): return {"ok": True, "service": "agent-runtime", "mode": "langgraph-gemini-qdrant", "geminiConfigured": bool(os.getenv("GEMINI_API_KEY"))}
@app.post("/v1/knowledge/documents", status_code=202)
def ingest_document(document: KnowledgeDocument):
    try: chunks = GeminiRag().ingest(**document.model_dump())
    except Exception as exc: raise HTTPException(503, f"Knowledge ingestion unavailable: {exc}")
    return {"source_id": document.source_id, "chunks": chunks}
@app.post("/v1/topic-jobs", status_code=202)
async def create_job(job: TopicJob, background_tasks: BackgroundTasks):
    existing = STORE.load(job.job_id)
    if existing and existing.status in {"running", "completed"}: return asdict(existing)
    state = existing or JobState(**job.model_dump())
    if not STORE.claim(state): return asdict(STORE.load(job.job_id) or state)
    background_tasks.add_task(AgentGraph(state).execute); return asdict(state)
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
    background_tasks.add_task(AgentGraph(state).execute); return {"job_id": job_id, "resumed_from": state.current_node, "status": "queued"}
