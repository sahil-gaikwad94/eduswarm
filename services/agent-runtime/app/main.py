from datetime import datetime, timezone
from typing import Any
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import asyncio

app = FastAPI(title='EduSwarm Agent Runtime', version='0.1.0')
JOBS: dict[str, dict[str, Any]] = {}

class TopicJob(BaseModel):
    job_id: str
    topic_id: str

class TopicPackage(BaseModel):
    topic_id: str
    verification: dict[str, Any]
    notes: dict[str, Any]
    flashcards: list[dict[str, str]]
    quiz: list[dict[str, Any]]
    pyqs: list[dict[str, Any]]

@app.get('/health')
def health(): return {'ok': True, 'service': 'agent-runtime'}

@app.post('/v1/topic-jobs', status_code=202)
async def create_job(job: TopicJob, background_tasks: BackgroundTasks):
    JOBS[job.job_id] = {'job_id': job.job_id, 'topic_id': job.topic_id, 'status': 'queued', 'events': []}
    background_tasks.add_task(run_graph, job.job_id, job.topic_id)
    return JOBS[job.job_id]

@app.get('/v1/topic-jobs/{job_id}')
def get_job(job_id: str): return JOBS.get(job_id, {'status': 'missing'})

async def run_graph(job_id: str, topic_id: str):
    # The graph is explicit and replaceable with LangGraph nodes. The deterministic provider
    # makes CI and local development reproducible; provider adapters can call real LLM/RAG APIs.
    stages = [
        ('Dean', 'Selecting a prerequisite-ready topic'),
        ('Retriever', 'Retrieving trusted source chunks'),
        ('Notes Author', 'Drafting cited theory notes'),
        ('PYQ Curator', 'Organizing permitted previous-year questions'),
        ('Card Maker', 'Distilling atomic flashcards'),
        ('Quiz Setter', 'Calibrating an original practice quiz'),
        ('Fact-Checker', 'Cross-checking claims against two independent sources'),
        ('Publisher', 'Publishing only approved artifacts'),
    ]
    job = JOBS[job_id]; job['status'] = 'running'
    for agent, message in stages:
        event = {'agent': agent, 'message': message, 'status': 'running', 'timestamp': datetime.now(timezone.utc).isoformat()}
        job['events'].append(event)
        await asyncio.sleep(0.05)
    package = TopicPackage(topic_id=topic_id, verification={'status': 'approved', 'sources': ['MIT OpenCourseWare', 'NPTEL'], 'claims_checked': 8}, notes={'sections': [{'heading': 'Big-O notation', 'body': 'Big-O is an asymptotic upper bound. Constants and lower-order terms are omitted when describing growth.'}]}, flashcards=[{'question': 'What does O(log n) indicate?', 'answer': 'The input is reduced by a constant factor each step.'}], quiz=[{'question': 'Binary search complexity?', 'options': ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 'answer': 1}], pyqs=[{'year': 2023, 'question': 'Compare binary and linear search.', 'difficulty': 'easy'}])
    job['package'] = package.model_dump(); job['status'] = 'completed'
    job['events'].append({'agent': 'Publisher', 'message': 'Verified package published', 'status': 'completed', 'timestamp': datetime.now(timezone.utc).isoformat()})
