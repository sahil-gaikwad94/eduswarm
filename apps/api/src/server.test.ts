import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from './server.js';
import http from 'node:http';

function request(path: string, options: any = {}) { return new Promise<{status:number; body:any}>((resolve, reject) => { const server = app.listen(0, () => { const address = server.address() as any; const req = http.request({ hostname: '127.0.0.1', port: address.port, path, method: options.method || 'GET', headers: { 'content-type': 'application/json', ...(options.headers || {}) } }, res => { let data=''; res.on('data', c => data+=c); res.on('end', () => { server.close(); resolve({ status: res.statusCode || 0, body: data ? JSON.parse(data) : null }); }); }); req.on('error', reject); if (options.body) req.write(JSON.stringify(options.body)); req.end(); }); }); }

test('health endpoint is available', async () => { const result = await request('/health'); assert.equal(result.status, 200); assert.equal(result.body.ok, true); });
test('demo session returns the isolated learner identity', async () => { const result = await request('/api/session', { headers: { 'x-demo-user': 'session-user' } }); assert.equal(result.status, 200); assert.equal(result.body.authenticated, true); assert.equal(result.body.user.id, 'session-user'); });
test('onboarding creates an independent goal', async () => { const result = await request('/api/onboarding', { method: 'POST', body: { name: 'Ada', goal: 'gate-cs', dailyMinutes: 30 } }); assert.equal(result.status, 201); assert.equal(result.body.goals.length, 1); assert.equal(result.body.dailyMinutes, 30); });
	test('curriculum exposes prerequisite-aware topics', async () => { const result = await request('/api/curriculum/gate-cs'); assert.equal(result.status, 200); assert.equal(result.body.topics[0].status, 'available'); assert.equal(result.body.topics[1].prerequisites.length, 1); });
test('curriculum includes the full GATE, full-stack, and AI/ML catalogs', async () => { const gate = await request('/api/curriculum/gate-cs'); const web = await request('/api/curriculum/web-dev'); const ai = await request('/api/curriculum/ai-ml'); assert.equal(gate.body.topics.length >= 40, true); assert.equal(web.body.topics.length >= 30, true); assert.equal(ai.body.topics.length >= 35, true); assert.equal(ai.body.topics.some((topic: any) => topic.title === 'RAG Systems'), true); });
test('quiz catalog is available without a study prerequisite and supports subject/topic filters', async () => {
  const all = await request('/api/quiz/catalog?course=gate-cs&source=gate-pyq');
  assert.equal(all.status, 200);
  assert.equal(all.body.available, true);
  assert.equal(all.body.questions.length > 0, true);
  assert.equal(all.body.filters.subjects.includes('Operating Systems'), true);
  const filtered = await request('/api/quiz/catalog?course=gate-cs&source=gate-pyq&subject=Algorithms&topic=Complexity');
  assert.equal(filtered.body.questions.every((question: any) => question.subject === 'Algorithms' && question.topic === 'Complexity'), true);
});
test('agent directory returns goal-oriented specialist roles', async () => {
  const result = await request('/api/agents');
  assert.equal(result.status, 200);
  assert.equal(result.body.agents.some((agent: any) => agent.id === 'pyq-coach'), true);
});
test('topic job publishes only a verified package', async () => {
  const created = await request('/api/jobs', { method: 'POST', body: { topicId: 'algo-complexity' } });
  assert.equal(created.status, 202);
  let result: any;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    result = await request(`/api/jobs/${created.body.id}`);
    if (result.body.status === 'completed') break;
  }
  assert.equal(result.body.status, 'completed');
  const content = await request(`/api/content/${created.body.id}`);
  assert.equal(['approved', 'fallback'].includes(content.body.verification.status), true); if (content.body.verification.status === 'fallback') assert.equal(content.body.verification.evidenceMode, 'local-fallback');
  assert.equal(content.body.verification.sources.length >= 2, true);
});
test('runtime outage completes through the local recovery path', async () => {
  const previous = process.env.AGENT_RUNTIME_URL;
  process.env.AGENT_RUNTIME_URL = 'http://127.0.0.1:1';
  const created = await request('/api/jobs', { method: 'POST', body: { topicId: 'algo-complexity' } });
  assert.equal(created.status, 202);
  let result: any;
  for (let attempt = 0; attempt < 30; attempt += 1) { await new Promise((resolve) => setTimeout(resolve, 100)); result = await request(`/api/jobs/${created.body.id}`); if (result.body.status === 'completed') break; }
  assert.equal(result.body.status, 'completed');
  assert.equal(result.body.package.verification.status, 'fallback'); assert.equal(result.body.package.verification.evidenceMode, 'local-fallback');
  if (previous === undefined) delete process.env.AGENT_RUNTIME_URL; else process.env.AGENT_RUNTIME_URL = previous;
});

test('jobs cannot be read by another learner', async () => {
  const created = await request('/api/jobs', { method: 'POST', headers: { 'x-demo-user': 'owner-user' }, body: { topicId: 'algo-complexity' } });
  const result = await request(`/api/jobs/${created.body.id}`, { headers: { 'x-demo-user': 'other-user' } });
  assert.equal(result.status, 404);
});

test('completed topic packages are saved to the learner and progress is readable', async () => {
  const headers = { 'x-demo-user': 'saved-learner' };
  const created = await request('/api/jobs', { method: 'POST', headers, body: { topicId: 'algo-complexity' } });
  let result: any;
  for (let attempt = 0; attempt < 20; attempt += 1) { await new Promise((resolve) => setTimeout(resolve, 100)); result = await request(`/api/jobs/${created.body.id}`, { headers }); if (result.body.status === 'completed') break; }
  assert.equal(result.body.status, 'completed');
  const saved = await request('/api/learning/content', { headers });
  assert.equal(saved.body.content.some((item: any) => item.topicId === 'algo-complexity'), true);
  assert.equal(saved.body.progress.some((item: any) => item.topicId === 'algo-complexity' && item.completed), true);
});
test('specialist agents create sessions and answer messages', async () => {
  const headers = { 'x-demo-user': 'agent-learner' };
  const created = await request('/api/agents/socratic-tutor/sessions', { method: 'POST', headers, body: { topicId: 'algo-complexity' } });
  assert.equal(created.status, 201);
  const reply = await request(`/api/agents/sessions/${created.body.id}/messages`, { method: 'POST', headers, body: { text: 'binary search invariant' } });
  assert.equal(reply.status, 200);
  assert.equal(reply.body.messages.length, 3);
});

test('practice attempts are saved with a reusable step-by-step solution', async () => {
  const headers = { 'x-demo-user': 'revision-learner' };
  const result = await request('/api/practice/attempts', { method: 'POST', headers, body: { topicId: 'algo-complexity', subject: 'Algorithms', topic: 'Complexity', questionId: 'q-1', question: 'What is binary search?', selectedAnswer: 'O(log n)', correctAnswer: 'O(log n)', correct: true, explanation: 'Each step halves the search interval.', solution: { approach: 'Use repeated halving.', stepByStep: ['Check that the array is sorted.', 'Compare with the midpoint.', 'Discard half the remaining interval.', 'Repeat until found or empty.'], whyItWorks: 'The search interval shrinks geometrically.', commonMistake: 'Using binary search on unsorted input.' } } });
  assert.equal(result.status, 201);
  assert.equal(result.body.attempt.solution.stepByStep.length, 4);
  const history = await request('/api/practice/attempts', { headers });
  assert.equal(history.body.attempts.length, 1);
  assert.equal(history.body.attempts[0].solution.whyItWorks, 'The search interval shrinks geometrically.');
});

test('quiz catalog supports full-stack and AI/ML subject and topic filters', async () => {
  const web = await request('/api/quiz/catalog?course=web-dev&source=practice&subject=Backend&topic=API%20Design');
  assert.equal(web.status, 200);
  assert.equal(web.body.questions.length, 1);
  assert.equal(web.body.questions[0].course, 'web-dev');
  const ai = await request('/api/quiz/catalog?course=ai-ml&source=practice&subject=Generative%20AI&topic=RAG%20Systems');
  assert.equal(ai.status, 200);
  assert.equal(ai.body.questions.length, 1);
  assert.equal(ai.body.questions[0].answer, 1);
});

test('video recommendations are topic-specific and actionable', async () => {
  const result = await request('/api/recommendations/videos?topicId=algo-complexity');
  assert.equal(result.status, 200);
  assert.equal(result.body.recommendations.length, 3);
  assert.equal(result.body.recommendations.every((item: any) => item.url.includes('youtube.com')), true);
  assert.equal(result.body.recommendations.some((item: any) => item.channel === 'NPTEL'), true);
});

test('specialist fallback gives role-specific guidance', async () => {
  const headers = { 'x-demo-user': 'quality-learner' };
  const created = await request('/api/agents/pyq-coach/sessions', { method: 'POST', headers, body: { topicId: 'algo-complexity' } });
  const reply = await request(`/api/agents/sessions/${created.body.id}/messages`, { method: 'POST', headers, body: { text: 'Which option is correct and why?' } });
  assert.equal(reply.status, 200);
  assert.match(reply.body.messages.at(-1).text, /invariant|distractor|exam-ready/i);
});

test('server derives canonical question correctness instead of trusting the browser', async () => {
  const result = await request('/api/practice/attempts', { method: 'POST', headers: { 'x-demo-user': 'tamper-learner' }, body: { topicId: 'algo-complexity', questionId: 'gate-cse-2021-algo-complexity', selectedAnswer: 'O(1)', correctAnswer: 'O(1)', correct: true, explanation: 'tampered', solution: { approach: 'tampered', stepByStep: [] } } });
  assert.equal(result.status, 201);
  assert.equal(result.body.attempt.correct, false);
  assert.equal(result.body.attempt.correctAnswer, 'O(log n)');
  assert.equal(result.body.attempt.question, 'The worst-case time complexity of binary search on a sorted array is:');
});

test('incorrect answers create a repairable mistake notebook entry', async () => {
  const headers = { 'x-demo-user': 'mistake-learner' };
  const result = await request('/api/practice/attempts', { method: 'POST', headers, body: { topicId: 'algo-complexity', questionId: 'gate-cse-2021-algo-complexity', selectedAnswer: 'O(1)', correct: true } });
  assert.equal(result.status, 201);
  const mistakes = await request('/api/mistakes', { headers });
  assert.equal(mistakes.status, 200);
  assert.equal(mistakes.body.mistakes.length, 1);
  assert.equal(mistakes.body.mistakes[0].correctAnswer, 'O(log n)');
  const repair = await request(`/api/mistakes/${mistakes.body.mistakes[0].id}/repair`, { method: 'POST', headers });
  assert.equal(repair.status, 200);
  assert.equal(repair.body.steps.length, 3);
});

test('adaptive practice prioritizes a repeated weak question', async () => {
  const headers = { 'x-demo-user': 'adaptive-learner' };
  for (let i = 0; i < 2; i += 1) await request('/api/practice/attempts', { method: 'POST', headers, body: { topicId: 'algo-complexity', questionId: 'gate-cse-2021-algo-complexity', selectedAnswer: 'O(1)', correct: true } });
  const result = await request('/api/practice/adaptive?course=gate-cs&subject=Algorithms', { headers });
  assert.equal(result.status, 200);
  assert.equal(result.body.question.id, 'gate-cse-2021-algo-complexity');
  assert.equal(result.body.strategy, 'repair-repeated-mistake');
});
