from fastapi.testclient import TestClient
from app.main import app, JOBS

client = TestClient(app)

def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['ok'] is True

def test_topic_job_is_queued():
    response = client.post('/v1/topic-jobs', json={'job_id': 'test-job', 'topic_id': 'algo-complexity'})
    assert response.status_code == 202
    assert JOBS['test-job']['status'] in ('queued', 'running', 'completed')
