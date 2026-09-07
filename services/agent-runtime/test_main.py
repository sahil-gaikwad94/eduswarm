import time

from fastapi.testclient import TestClient

from app.main import app, STATE_DIR

client = TestClient(app)


def test_health_reports_agent_graph_mode():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['mode'] == 'stateful-agent-graph'


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
