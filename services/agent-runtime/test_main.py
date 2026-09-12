import time

import pytest

from fastapi.testclient import TestClient

from app.main import app, STATE_DIR
from app.rag import EvidenceChunk

client = TestClient(app)


class FakeProviderRag:
    def retrieve(self, _query, _topic_id):
        return [
            EvidenceChunk('mit-0', 'mit', 'MIT Algorithms', 'https://ocw.mit.edu/example', 'Binary search repeatedly removes half of a sorted search interval.'),
            EvidenceChunk('nptel-0', 'nptel', 'NPTEL Algorithms', 'https://nptel.ac.in/example', 'Asymptotic analysis describes growth as input size increases.'),
        ]

    def structured_generate(self, prompt):
        if '"notes"' in prompt:
            return {'notes': {'sections': [{'heading': 'Core idea', 'body': 'Use the retrieved evidence.', 'claimIds': [0]}]}, 'claims': [{'text': 'A supported claim.', 'evidenceIds': ['mit-0', 'nptel-0']}]}
        return {'flashcards': [{'question': 'Q?', 'answer': 'A.', 'claimIds': [0]}], 'quiz': [{'question': 'Quiz?', 'options': ['A', 'B', 'C', 'D'], 'answer': 0, 'explanation': 'Evidence-backed.', 'claimIds': [0]}], 'pyqs': [{'year': 2023, 'question': 'Apply it.', 'difficulty': 'beginner', 'claimIds': [0]}]}


@pytest.fixture(autouse=True)
def fake_rag(monkeypatch):
    monkeypatch.setattr('app.main.OpenRouterRag', FakeProviderRag)


def test_health_reports_agent_graph_mode():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['mode'] == 'langgraph-openrouter-qdrant'


def test_topic_job_runs_agents_and_publishes_verified_package():
    job_id = 'test-agent-graph'
    response = client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'algo-complexity'})
    assert response.status_code == 202

    result = None
    for _ in range(30):
        result = client.get(f'/v1/topic-jobs/{job_id}').json()
        if result['status'] == 'completed':
            break
        time.sleep(0.02)

    assert result is not None
    assert result['status'] == 'completed'
    assert result['package']['verification']['status'] == 'approved'
    assert len(result['package']['verification']['sources']) >= 2
    assert result['package']['notes']['sections']

    trace = client.get(f'/v1/topic-jobs/{job_id}/trace').json()
    agents = [run['agent'] for run in trace['trace']]
    assert agents == ['Dean', 'Researcher', 'Notes Author', 'Practice Team', 'Fact-Checker', 'Publisher']
    assert trace['checkpoints'] >= 6

    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)


def test_all_advertised_topics_publish_and_path_ids_are_rejected():
    for topic_id in ('algo-complexity', 'algo-arrays', 'algo-graphs'):
        job_id = f'test-{topic_id}'
        response = client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': topic_id, 'learner_level': 'advanced', 'daily_minutes': 90})
        assert response.status_code == 202
        result = client.get(f'/v1/topic-jobs/{job_id}').json()
        assert result['status'] == 'completed'
        assert result['package']['verification']['claimsChecked'] > 0
        (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)
    invalid = client.post('/v1/topic-jobs', json={'job_id': '../escape', 'topic_id': 'algo-complexity'})
    assert invalid.status_code == 422


def test_missing_provider_configuration_fails_job_without_crashing_request(monkeypatch):
    monkeypatch.delenv('OPENROUTER_API_KEY', raising=False)
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    monkeypatch.setattr('app.main.OpenRouterRag', lambda: (_ for _ in ()).throw(RuntimeError('OPENROUTER_API_KEY is required for the intelligent agent runtime')))
    job_id = 'missing-provider-regression'
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)

    response = client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'algo-complexity'})

    assert response.status_code == 202
    result = client.get(f'/v1/topic-jobs/{job_id}').json()
    assert result['status'] == 'failed'
    assert 'OPENROUTER_API_KEY' in result['error']
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)


def test_unindexed_curriculum_topic_uses_safe_preview_evidence(monkeypatch):
    class EmptyEvidenceRag(FakeProviderRag):
        def retrieve(self, _query, _topic_id):
            return []

        def structured_generate(self, prompt):
            if '"notes"' in prompt:
                return {'notes': {'sections': [{'heading': 'Preview', 'body': 'Use the curriculum brief.', 'claimIds': [0]}]}, 'claims': [{'text': 'A preview claim.', 'evidenceIds': ['curriculum-brief-0', 'curriculum-brief-1']}]}
            return {'flashcards': [{'question': 'Q?', 'answer': 'A.', 'claimIds': [0]}], 'quiz': [{'question': 'Quiz?', 'options': ['A', 'B', 'C', 'D'], 'answer': 0, 'explanation': 'Preview-backed.', 'claimIds': [0]}], 'pyqs': [{'year': 2023, 'question': 'Apply it.', 'difficulty': 'beginner', 'claimIds': [0]}]}

    monkeypatch.setattr('app.main.OpenRouterRag', EmptyEvidenceRag)
    job_id = 'unindexed-curriculum-preview'
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)

    response = client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'gate-cs-engineering-mathematics-discrete-mathematics'})

    assert response.status_code == 202
    result = client.get(f'/v1/topic-jobs/{job_id}').json()
    assert result['status'] == 'completed'
    assert result['package']['verification']['status'] == 'approved'
    assert result['context']['evidence_mode'] == 'curriculum-preview'
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)


class FakeSpecialistRag(FakeProviderRag):
    def retrieve(self, query, topic_id, limit=6):
        return FakeProviderRag.retrieve(self, query, topic_id)[:limit]

    def search(self, query, topic_id=None, limit=6):
        return self.retrieve(query, topic_id or "algo-complexity", limit)[:limit]

    def chat(self, messages, system):
        return self.chat_with_model(messages, system)[0]

    def chat_with_model(self, messages, system):
        latest = messages[-1].get("content", messages[-1].get("text", "")) if messages else ""
        FakeSpecialistRag.last_system = system
        return f"Grounded answer to: {latest[:60]}", "fake-model:free"

    def model_chain(self):
        return ["fake-model:free"]


def test_doubt_solve_returns_grounded_answer(monkeypatch):
    monkeypatch.setattr("app.main.OpenRouterRag", FakeSpecialistRag)
    response = client.post("/v1/doubt-solve", json={"topic_id": "algo-complexity", "messages": [{"role": "user", "content": "Why is binary search O(log n)?"}]})
    assert response.status_code == 200
    body = response.json()
    assert "binary search" in body["reply"].lower()
    assert body["sources"]


def test_doubt_solve_degrades_to_503_without_provider(monkeypatch):
    monkeypatch.setattr("app.main.OpenRouterRag", lambda: (_ for _ in ()).throw(RuntimeError("OPENROUTER_API_KEY is required")))
    response = client.post("/v1/doubt-solve", json={"messages": [{"role": "user", "content": "Why?"}]})
    assert response.status_code == 503


def test_study_plan_returns_timeboxed_blocks(monkeypatch):
    class PlanRag(FakeSpecialistRag):
        def structured_generate(self, prompt):
            return {"totalMinutes": 60, "intensity": "focused", "blocks": [{"kind": "review", "title": "Review due cards", "detail": "SRS", "minutes": 15}, {"kind": "learn", "title": "New kit", "detail": "Study", "minutes": 45}]}

    monkeypatch.setattr("app.main.OpenRouterRag", PlanRag)
    response = client.post("/v1/study-plan", json={"goal": "gate-cs", "daily_minutes": 60, "due_reviews": 5})
    assert response.status_code == 200
    body = response.json()
    assert body["totalMinutes"] == 60
    assert len(body["blocks"]) == 2


def test_evaluate_code_returns_rubric(monkeypatch):
    class ReviewRag(FakeSpecialistRag):
        def structured_generate(self, prompt):
            return {"verdict": "Good", "score": 82, "findings": ["Missing empty-input guard"], "strengths": ["Clean loop"], "complexity": "O(n) time, O(1) space", "corrected_code": None}

    monkeypatch.setattr("app.main.OpenRouterRag", ReviewRag)
    response = client.post("/v1/evaluate-code", json={"language": "javascript", "code": "function solve(a) { return a; }", "problem": "Identity"})
    assert response.status_code == 200
    assert response.json()["score"] == 82


def test_mock_analysis_returns_next_steps(monkeypatch):
    class ExamRag(FakeSpecialistRag):
        def structured_generate(self, prompt):
            return {"summary": "Solid", "strengths": ["Accuracy"], "weaknesses": ["Speed"], "next_steps": ["Drill CN subnetting"]}

    monkeypatch.setattr("app.main.OpenRouterRag", ExamRag)
    response = client.post("/v1/mock-analysis", json={"course": "gate-cs", "score": 7, "max_marks": 10, "accuracy": 70})
    assert response.status_code == 200
    assert response.json()["next_steps"] == ["Drill CN subnetting"]


def test_knowledge_search_lists_chunks(monkeypatch):
    monkeypatch.setattr("app.main.OpenRouterRag", FakeSpecialistRag)
    response = client.get("/v1/knowledge/search", params={"q": "binary search", "topic_id": "algo-complexity"})
    assert response.status_code == 200
    assert len(response.json()["chunks"]) == 2


def test_agent_chat_uses_the_api_supplied_system_prompt_and_reports_its_model(monkeypatch):
    monkeypatch.setattr("app.main.OpenRouterRag", FakeSpecialistRag)
    response = client.post("/v1/agent-chat", json={
        "agent_id": "pyq-coach",
        "agent_name": "PYQ Coach",
        "agent_role": "Exam strategist",
        "topic_id": "algo-complexity",
        "topic_title": "Time and Space Complexity",
        "goal": "gate-cs",
        "system": "You are PYQ Coach. Answer the option list they pasted and eliminate each wrong option.",
        "messages": [{"role": "user", "text": "Worst case of binary search on a sorted array?"}],
    })
    assert response.status_code == 200
    body = response.json()
    assert "binary search" in body["reply"].lower()
    assert body["model"] == "fake-model:free"
    assert body["provider"] == "openrouter"
    assert "eliminate each wrong option" in FakeSpecialistRag.last_system
    assert "Time and Space Complexity" in FakeSpecialistRag.last_system
    assert body["sources"]


def test_agent_chat_requires_a_learner_message():
    response = client.post("/v1/agent-chat", json={"agent_id": "doubt-solver", "messages": [{"role": "assistant", "text": "Hello"}]})
    assert response.status_code == 422


def test_agent_chat_falls_back_to_its_own_prompt_without_a_system(monkeypatch):
    monkeypatch.setattr("app.main.OpenRouterRag", FakeSpecialistRag)
    response = client.post("/v1/agent-chat", json={
        "agent_id": "socratic-tutor", "agent_name": "Socratic Tutor", "agent_role": "Concept guide",
        "messages": [{"role": "user", "text": "Why does my recursion blow up?"}],
    })
    assert response.status_code == 200
    assert "Socratic Tutor" in FakeSpecialistRag.last_system
    assert "generic study advice" in FakeSpecialistRag.last_system
