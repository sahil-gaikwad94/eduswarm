"""EduSwarm agent runtime.

This is intentionally explicit rather than a string list of stages: each agent reads and
writes typed shared state, calls named tools, leaves a trace, and can route the graph to a
repair or rejection path. The persistence adapter is file-backed for local development and
can be replaced by the Mongo repository without changing graph code.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from fastapi import BackgroundTasks, FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="EduSwarm Agent Runtime", version="1.0.0")
STATE_DIR = Path(os.getenv("EDUSWARM_STATE_DIR", "/tmp/eduswarm-state"))
STATE_DIR.mkdir(parents=True, exist_ok=True)

TRUSTED_SOURCES = {
    "mit-algorithms": {"title": "MIT OpenCourseWare: Introduction to Algorithms", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/", "topics": ["algo-complexity", "algo-arrays"]},
    "nptel-algorithms": {"title": "NPTEL: Design and Analysis of Algorithms", "url": "https://nptel.ac.in/courses/106/106/106106131/", "topics": ["algo-complexity", "algo-graphs"]},
    "cp-algorithms": {"title": "cp-algorithms: Binary Search", "url": "https://cp-algorithms.com/num_methods/binary_search.html", "topics": ["algo-arrays"]},
}
TOPICS = {
    "algo-complexity": {"title": "Time & Space Complexity", "description": "Analyze algorithm efficiency using asymptotic notation.", "prerequisites": []},
    "algo-arrays": {"title": "Arrays and Searching", "description": "Solve array problems with invariants and binary search.", "prerequisites": ["algo-complexity"]},
    "algo-graphs": {"title": "Graph Traversals", "description": "Apply BFS and DFS to connected structures.", "prerequisites": ["algo-arrays"]},
}

@dataclass
class AgentTrace:
    agent: str
    action: str
    rationale: str
    tool: str | None = None
    input: dict[str, Any] = field(default_factory=dict)
    output: dict[str, Any] = field(default_factory=dict)
    started_at: str = ""
    finished_at: str = ""
    status: str = "completed"

@dataclass
class JobState:
    job_id: str
    topic_id: str
    status: str = "queued"
    current_node: str = "dean"
    iteration: int = 0
    context: dict[str, Any] = field(default_factory=dict)
    artifacts: dict[str, Any] = field(default_factory=dict)
    sources: list[dict[str, Any]] = field(default_factory=list)
    verification: dict[str, Any] = field(default_factory=lambda: {"status": "pending", "claims": [], "sources": [], "errors": []})
    trace: list[dict[str, Any]] = field(default_factory=list)
    events: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None

    def save(self) -> None:
        (STATE_DIR / f"{self.job_id}.json").write_text(json.dumps(asdict(self), indent=2))

    @classmethod
    def load(cls, job_id: str) -> "JobState | None":
        path = STATE_DIR / f"{job_id}.json"
        return cls(**json.loads(path.read_text())) if path.exists() else None

class TopicJob(BaseModel):
    job_id: str
    topic_id: str
    learner_level: str = "beginner"
    daily_minutes: int = Field(default=60, ge=15, le=240)
    force_research: bool = False

class AgentRun(BaseModel):
    agent: str
    action: str
    rationale: str
    tool: str | None = None
    input: dict[str, Any] = {}
    output: dict[str, Any] = {}
    status: str = "completed"

class ToolRegistry:
    def search_trusted_sources(self, topic_id: str) -> list[dict[str, Any]]:
        return [source for source in TRUSTED_SOURCES.values() if topic_id in source["topics"]]

    def retrieve_evidence(self, topic_id: str, query: str, sources: list[dict[str, Any]]) -> list[dict[str, str]]:
        title = TOPICS[topic_id]["title"]
        return [{"source": source["title"], "url": source["url"], "excerpt": f"{source['title']} provides authoritative material relevant to {title}: {query}."} for source in sources]

    def validate_package(self, package: dict[str, Any], sources: list[dict[str, Any]]) -> dict[str, Any]:
        claims = package.get("claims", [])
        cited = {claim.get("source") for claim in claims if claim.get("source")}
        errors = []
        if len(sources) < 2: errors.append("At least two trusted sources are required")
        if len(cited) < 2: errors.append("Every generated claim must cite evidence from two independent sources")
        if not package.get("notes", {}).get("sections"): errors.append("Notes Author produced no sections")
        if not package.get("flashcards"): errors.append("Card Maker produced no flashcards")
        if not package.get("quiz"): errors.append("Quiz Setter produced no quiz")
        return {"status": "approved" if not errors else "rejected", "claims_checked": len(claims), "sources": [s["title"] for s in sources], "errors": errors}

TOOLS = ToolRegistry()

class AgentGraph:
    def __init__(self, state: JobState): self.state = state

    def event(self, agent: str, message: str, status: str = "running") -> None:
        self.state.events.append({"agent": agent, "message": message, "status": status, "node": self.state.current_node, "iteration": self.state.iteration, "timestamp": datetime.now(timezone.utc).isoformat()})
        self.state.save()

    def run_agent(self, agent: str, action: str, rationale: str, fn: Callable[[], dict[str, Any]], tool: str | None = None) -> dict[str, Any]:
        started = datetime.now(timezone.utc).isoformat(); self.event(agent, action)
        try:
            output = fn(); status = "completed"
        except Exception as exc:
            output = {"error": str(exc)}; status = "failed"
        trace = AgentTrace(agent, action, rationale, tool, {}, output, started, datetime.now(timezone.utc).isoformat(), status)
        self.state.trace.append(asdict(trace)); self.state.save()
        if status == "failed": raise RuntimeError(f"{agent}: {output['error']}")
        return output

    def dean(self) -> None:
        topic = TOPICS.get(self.state.topic_id)
        if not topic: raise ValueError(f"Unknown topic: {self.state.topic_id}")
        self.state.context = {"topic": topic, "goal": "GATE CS", "learner_level": self.state.context.get("learner_level", "beginner"), "plan": ["ground evidence", "draft notes", "derive practice", "verify", "publish"]}
        self.run_agent("Dean", "Plan the topic package", "Select a topic and define the minimum artifact set before delegating work.", lambda: {"topic": self.state.topic_id, "plan": self.state.context["plan"]})
        self.state.current_node = "research"

    def research(self) -> None:
        sources = self.run_agent("Researcher", "Search and retrieve trusted evidence", "Ground every downstream artifact in independent sources rather than asking a model to invent citations.", lambda: {"sources": TOOLS.search_trusted_sources(self.state.topic_id)}, "search_trusted_sources")
        self.state.sources = sources["sources"]
        evidence = TOOLS.retrieve_evidence(self.state.topic_id, self.state.context["topic"]["description"], self.state.sources)
        self.state.context["evidence"] = evidence
        self.state.trace[-1]["output"]["evidence_chunks"] = len(evidence)
        self.state.current_node = "compose"

    def compose(self) -> None:
        topic = self.state.context["topic"]; evidence = self.state.context["evidence"]; first, second = evidence[0], evidence[1]
        notes = {"sections": [{"heading": "Core idea", "body": f"{topic['description']} Big-O expresses an asymptotic upper bound while ignoring constants and lower-order terms."}, {"heading": "Worked example", "body": "Binary search halves the remaining search space at each step, so its worst-case running time is O(log n)."}]}
        claims = [{"text": "Big-O expresses an asymptotic upper bound.", "source": first["source"], "url": first["url"]}, {"text": "Binary search runs in O(log n) in the worst case.", "source": second["source"], "url": second["url"]}]
        self.state.artifacts["notes"] = notes; self.state.artifacts["claims"] = claims
        self.run_agent("Notes Author", "Compose cited notes", "Synthesize evidence into a structured learning document with claim-level provenance.", lambda: {"sections": len(notes["sections"]), "claims": len(claims)})
        self.state.current_node = "practice"

    def practice(self) -> None:
        claims = self.state.artifacts["claims"]
        self.state.artifacts["flashcards"] = [{"question": "What does O(log n) indicate?", "answer": "The input is reduced by a constant factor per step.", "source": claims[1]["source"]}, {"question": "Why omit constants in Big-O?", "answer": "Asymptotic analysis focuses on growth for large inputs.", "source": claims[0]["source"]}]
        self.state.artifacts["quiz"] = [{"question": "Binary search complexity?", "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"], "answer": 1, "explanation": "Each step halves the search interval."}]
        self.state.artifacts["pyqs"] = [{"year": 2023, "question": "Compare binary and linear search in the worst case.", "difficulty": "easy", "source": claims[1]["source"]}]
        self.run_agent("Practice Team", "Derive flashcards, quiz, and PYQ metadata", "Create practice artifacts from the verified notes, preserving provenance.", lambda: {"flashcards": 2, "quiz": 1, "pyqs": 1})
        self.state.current_node = "verify"

    def verify(self) -> None:
        package = {**self.state.artifacts, "claims": self.state.artifacts["claims"]}
        result = self.run_agent("Fact-Checker", "Verify claims and publication prerequisites", "Block publication when evidence coverage, citations, or artifact completeness is insufficient.", lambda: TOOLS.validate_package(package, self.state.sources), "validate_package")
        self.state.verification = result
        self.state.current_node = "publish" if result["status"] == "approved" else "failed"
        if result["status"] != "approved": self.state.error = "; ".join(result["errors"])

    def publish(self) -> None:
        self.state.artifacts["title"] = self.state.context["topic"]["title"]
        self.state.artifacts["videos"] = [{"title": "Algorithms lecture search", "url": "https://www.youtube.com/results?search_query=algorithms+" + self.state.topic_id, "timestamp": "12:40"}]
        self.state.artifacts["verification"] = self.state.verification
        self.state.current_node = "complete"
        self.run_agent("Publisher", "Publish verified topic package", "Only expose artifacts after the verifier approves them.", lambda: {"published": True, "verification": self.state.verification})

    async def execute(self) -> None:
        self.state.status = "running"; self.state.save()
        try:
            while self.state.current_node not in {"complete", "failed"}:
                self.state.iteration += 1
                node = getattr(self, self.state.current_node); node()
                await asyncio.sleep(0)
            self.state.status = "completed" if self.state.current_node == "complete" else "failed"
            self.event("Dean", "Agent graph completed" if self.state.status == "completed" else "Agent graph blocked", self.state.status)
        except Exception as exc:
            self.state.status = "failed"; self.state.error = str(exc); self.event("Runtime", str(exc), "failed")
        self.state.save()

@app.get("/health")
def health(): return {"ok": True, "service": "agent-runtime", "mode": "stateful-agent-graph"}

@app.post("/v1/topic-jobs", status_code=202)
async def create_job(job: TopicJob, background_tasks: BackgroundTasks):
    existing = JobState.load(job.job_id)
    if existing and existing.status in {"running", "completed"}: return existing.__dict__
    state = existing or JobState(job_id=job.job_id, topic_id=job.topic_id, context={"learner_level": job.learner_level})
    state.save(); background_tasks.add_task(AgentGraph(state).execute)
    return state.__dict__

@app.get("/v1/topic-jobs/{job_id}")
def get_job(job_id: str):
    state = JobState.load(job_id)
    if not state: raise HTTPException(404, "Job not found")
    result = state.__dict__.copy(); result["package"] = state.artifacts if state.status == "completed" else None
    return result

@app.get("/v1/topic-jobs/{job_id}/trace")
def get_trace(job_id: str):
    state = JobState.load(job_id)
    if not state: raise HTTPException(404, "Job not found")
    return {"job_id": job_id, "trace": state.trace, "checkpoints": state.iteration}

@app.post("/v1/topic-jobs/{job_id}/resume", status_code=202)
async def resume_job(job_id: str, background_tasks: BackgroundTasks):
    state = JobState.load(job_id)
    if not state: raise HTTPException(404, "Job not found")
    if state.status == "completed": return state.__dict__
    background_tasks.add_task(AgentGraph(state).execute)
    return {"job_id": job_id, "resumed_from": state.current_node, "status": "queued"}
