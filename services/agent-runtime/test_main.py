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
