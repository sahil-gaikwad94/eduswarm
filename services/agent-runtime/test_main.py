import re
import time

import pytest

from fastapi.testclient import TestClient

from app.main import app, STATE_DIR, reference_routes, resolve_topic
from app.curriculum import curriculum_topics
from app.rag import EvidenceChunk

client = TestClient(app)


class FakeProviderRag:
    def retrieve(self, _query, _topic_id):
        return [
            EvidenceChunk('mit-0', 'mit', 'MIT Algorithms', 'https://ocw.mit.edu/example', 'Binary search repeatedly removes half of a sorted search interval.'),
            EvidenceChunk('nptel-0', 'nptel', 'NPTEL Algorithms', 'https://nptel.ac.in/example', 'Asymptotic analysis describes growth as input size increases.'),
        ]

    @staticmethod
    def sections_requested(prompt, default=6):
        """Behave like a compliant model: write the number of sections asked for."""
        match = re.search(r'write exactly (\d+) note sections', prompt, re.IGNORECASE)
        return int(match.group(1)) if match else default

    def structured_generate(self, prompt, validator=None, long=False):
        if '"notes"' in prompt:
            package = {'notes': {'sections': [{'heading': f'Core idea {index}', 'body': 'Use the retrieved evidence.', 'claimIds': [0]} for index in range(self.sections_requested(prompt))]}, 'claims': [{'text': 'A supported claim.', 'evidenceIds': ['mit-0', 'nptel-0']}]}
            if validator:
                validator(package)
            return package
        return {'flashcards': [{'question': 'Q?', 'answer': 'A.', 'claimIds': [0]}], 'quiz': [{'question': 'Quiz?', 'options': ['A', 'B', 'C', 'D'], 'answer': 0, 'explanation': 'Evidence-backed.', 'claimIds': [0]}], 'pyqs': [{'year': 2023, 'question': 'Apply it.', 'difficulty': 'beginner', 'claimIds': [0]}]}


@pytest.fixture(autouse=True)
def fake_rag(monkeypatch):
    monkeypatch.setattr('app.main.OpenRouterRag', FakeProviderRag)


def test_health_reports_agent_graph_mode():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['mode'] == 'langgraph-openrouter-qdrant'


def test_every_live_topic_has_its_real_scope_and_two_reference_routes():
    topics = curriculum_topics()
    assert len(topics) == 237
    node_id = 'web-dev-backend-with-node-js-node-js-runtime'
    assert resolve_topic(node_id)['description'].startswith('Modules, streams')
    node_routes = reference_routes(node_id, resolve_topic(node_id)['title'])
    assert node_routes[0]['url'] == 'https://www.geeksforgeeks.org/node-js/nodejs/'
    for topic_id, topic in topics.items():
        assert topic['description']
        assert len(reference_routes(topic_id, topic['title'])) >= 2


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
    assert result['context']['section_target'] == 6
    assert result['context']['word_budget'] == 900

    trace = client.get(f'/v1/topic-jobs/{job_id}/trace').json()
    agents = [run['agent'] for run in trace['trace']]
    assert agents == ['Dean', 'Researcher', 'Notes Author', 'Practice Team', 'Fact-Checker', 'Publisher']
    practice = next(run for run in trace['trace'] if run['agent'] == 'Practice Team')
    assert practice['tool'] == 'local_practice_curator'
    assert practice['output']['generation_calls_saved'] == 1
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

        def structured_generate(self, prompt, validator=None, long=False):
            if '"notes"' in prompt:
                return {'notes': {'sections': [{'heading': f'Preview {index}', 'body': 'Use the curriculum brief.', 'claimIds': [0]} for index in range(self.sections_requested(prompt))]}, 'claims': [{'text': 'A preview claim.', 'evidenceIds': ['curriculum-brief-0', 'curriculum-brief-1']}]}
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

    def model_chain(self, fetch=True):
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
        def structured_generate(self, prompt, validator=None, long=False):
            return {"totalMinutes": 60, "intensity": "focused", "blocks": [{"kind": "review", "title": "Review due cards", "detail": "SRS", "minutes": 15}, {"kind": "learn", "title": "New kit", "detail": "Study", "minutes": 45}]}

    monkeypatch.setattr("app.main.OpenRouterRag", PlanRag)
    response = client.post("/v1/study-plan", json={"goal": "gate-cs", "daily_minutes": 60, "due_reviews": 5})
    assert response.status_code == 200
    body = response.json()
    assert body["totalMinutes"] == 60
    assert len(body["blocks"]) == 2


def test_evaluate_code_returns_rubric(monkeypatch):
    class ReviewRag(FakeSpecialistRag):
        def structured_generate(self, prompt, validator=None, long=False):
            return {"verdict": "Good", "score": 82, "findings": ["Missing empty-input guard"], "strengths": ["Clean loop"], "complexity": "O(n) time, O(1) space", "corrected_code": None}

    monkeypatch.setattr("app.main.OpenRouterRag", ReviewRag)
    response = client.post("/v1/evaluate-code", json={"language": "javascript", "code": "function solve(a) { return a; }", "problem": "Identity"})
    assert response.status_code == 200
    assert response.json()["score"] == 82


def test_mock_analysis_returns_next_steps(monkeypatch):
    class ExamRag(FakeSpecialistRag):
        def structured_generate(self, prompt, validator=None, long=False):
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


def test_an_unreachable_index_falls_through_instead_of_failing_the_topic(monkeypatch):
    """Qdrant is an optimisation, not a dependency: an outage must not fail jobs."""
    class DeadIndexRag(FakeProviderRag):
        def retrieve(self, _query, _topic_id):
            raise ConnectionRefusedError('[Errno 111] Connection refused')

        def structured_generate(self, prompt, validator=None, long=False):
            package = {'notes': {'sections': [{'heading': f'Preview {index}', 'body': 'From the brief.', 'claimIds': [0]} for index in range(self.sections_requested(prompt))]},
                       'claims': [{'text': 'A preview claim.', 'evidenceIds': ['curriculum-brief-0', 'curriculum-brief-1']}]}
            if validator:
                validator(package)
            return package

    monkeypatch.setattr('app.main.OpenRouterRag', DeadIndexRag)
    job_id = 'dead-index-regression'
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)

    client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'algo-complexity'})

    result = client.get(f'/v1/topic-jobs/{job_id}').json()
    assert result['status'] == 'completed', result.get('error')
    assert result['package']['verification']['status'] == 'approved'
    assert result['context']['evidence_mode'] == 'curriculum-preview'
    researcher = next(run for run in result['trace'] if run['agent'] == 'Researcher')
    assert 'Connection refused' in researcher['output']['index_unavailable'], 'the outage is reported, not hidden'
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)


def test_every_depth_publishes_at_least_five_sections_and_deep_gives_more():
    """5-6 sections at eli5/standard; deep genuinely teaches more."""
    from app.main import DEEP_MIN_SECTIONS, MAX_SECTIONS, MIN_SECTIONS

    counts = {}
    for depth in ('eli5', 'standard', 'deep'):
        job_id = f'depth-{depth}'
        (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)
        client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'algo-complexity', 'depth': depth})
        result = client.get(f'/v1/topic-jobs/{job_id}').json()
        assert result['status'] == 'completed', result.get('error')
        counts[depth] = len(result['package']['notes']['sections'])
        assert result['context']['section_target'] >= MIN_SECTIONS
        (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)

    assert all(count >= MIN_SECTIONS for count in counts.values()), counts
    assert counts['eli5'] <= MAX_SECTIONS and counts['standard'] <= MAX_SECTIONS, counts
    assert counts['deep'] >= DEEP_MIN_SECTIONS, f"deep must be a long-form treatment: {counts}"
    assert counts['deep'] >= 2 * counts['standard'], f"deep should be substantially deeper, not marginally: {counts}"


def test_a_deep_lesson_asks_for_a_larger_output_budget():
    """Deep needs more tokens than standard, or its extra sections truncate."""
    from app.llm_router import STRUCTURED_MAX_TOKENS, STRUCTURED_MAX_TOKENS_LONG

    seen: list[bool] = []

    class BudgetRag(FakeProviderRag):
        def structured_generate(self, prompt, validator=None, long=False):
            seen.append(long)
            return FakeProviderRag.structured_generate(self, prompt, validator)

    assert STRUCTURED_MAX_TOKENS_LONG > STRUCTURED_MAX_TOKENS

    import app.main as main_module
    original = main_module.OpenRouterRag
    main_module.OpenRouterRag = BudgetRag
    try:
        for depth, expected in (('standard', False), ('deep', True)):
            job_id = f'budget-{depth}'
            (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)
            seen.clear()
            client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'algo-complexity', 'depth': depth})
            assert seen and seen[0] is expected, f'{depth} should request long={expected}'
            (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)
    finally:
        main_module.OpenRouterRag = original


def test_deep_splits_notes_and_practice_into_two_calls():
    """Deep is long form, so its notes get a whole response to themselves.

    One call cannot hold ~3000 words of notes plus 10 cards, 8 quiz items and 5
    prompts without truncating, and a truncated deep lesson is worse than a
    short one.
    """
    calls: list[str] = []

    class TwoCallRag(FakeProviderRag):
        def structured_generate(self, prompt, validator=None, long=False):
            calls.append('notes' if '"notes"' in prompt else 'practice')
            assert long, 'both deep calls need the long output budget'
            if '"notes"' in prompt:
                package = {'notes': {'sections': [{'heading': f'H{index}', 'body': 'Body.', 'claimIds': [0]} for index in range(self.sections_requested(prompt))]},
                           'claims': [{'text': f'Claim {index}.', 'evidenceIds': ['mit-0', 'nptel-0']} for index in range(10)]}
                if validator:
                    validator(package)
                return package
            package = {'flashcards': [{'question': f'Q{i}?', 'answer': 'A.', 'claimIds': [0]} for i in range(10)],
                       'quiz': [{'question': f'Quiz {i}?', 'options': ['A', 'B', 'C', 'D'], 'answer': 0, 'explanation': 'Rule.', 'claimIds': [0]} for i in range(8)],
                       'pyqs': [{'year': 2024, 'question': f'Apply {i}.', 'difficulty': 'hard', 'claimIds': [0]} for i in range(5)]}
            if validator:
                validator(package)
            return package

    import app.main as main_module
    original = main_module.OpenRouterRag
    main_module.OpenRouterRag = TwoCallRag
    job_id = 'deep-two-call'
    try:
        (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)
        client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'algo-complexity', 'depth': 'deep'})
        result = client.get(f'/v1/topic-jobs/{job_id}').json()
    finally:
        main_module.OpenRouterRag = original

    assert result['status'] == 'completed', result.get('error')
    assert calls == ['notes', 'practice'], calls
    package = result['package']
    assert len(package['notes']['sections']) >= 12
    assert len(package['flashcards']) == 10 and len(package['quiz']) == 8 and len(package['pyqs']) == 5
    assert [run['agent'] for run in result['trace']][:4] == ['Dean', 'Researcher', 'Notes Author', 'Practice Author']
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)


def test_deep_keeps_its_notes_when_the_practice_call_fails():
    """A practice outage must not throw away an expensive long-form lesson."""
    class FlakyPracticeRag(FakeProviderRag):
        def structured_generate(self, prompt, validator=None, long=False):
            if '"notes"' not in prompt:
                raise RuntimeError('Every free AI model was busy (tried 6).')
            package = {'notes': {'sections': [{'heading': f'H{index}', 'body': 'Body.', 'claimIds': [0]} for index in range(self.sections_requested(prompt))]},
                       'claims': [{'text': f'Claim {index}.', 'evidenceIds': ['mit-0', 'nptel-0']} for index in range(10)]}
            if validator:
                validator(package)
            return package

    import app.main as main_module
    original = main_module.OpenRouterRag
    main_module.OpenRouterRag = FlakyPracticeRag
    job_id = 'deep-practice-outage'
    try:
        (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)
        client.post('/v1/topic-jobs', json={'job_id': job_id, 'topic_id': 'algo-complexity', 'depth': 'deep'})
        result = client.get(f'/v1/topic-jobs/{job_id}').json()
    finally:
        main_module.OpenRouterRag = original

    assert result['status'] == 'completed', result.get('error')
    assert len(result['package']['notes']['sections']) >= 12, 'the long-form notes survived'
    assert result['package']['flashcards'], 'the local curator filled practice from the claims'
    (STATE_DIR / f'{job_id}.json').unlink(missing_ok=True)
