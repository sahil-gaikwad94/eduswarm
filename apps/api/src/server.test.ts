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
  assert.equal(['approved', 'local'].includes(content.body.verification.status), true); if (content.body.verification.status === 'local') assert.equal(content.body.verification.evidenceMode, 'authored-curriculum');
  assert.equal(content.body.verification.sources.length >= 1, true);
});
test('runtime outage completes through the local recovery path', async () => {
  const previous = process.env.AGENT_RUNTIME_URL;
  process.env.AGENT_RUNTIME_URL = 'http://127.0.0.1:1';
  const created = await request('/api/jobs', { method: 'POST', body: { topicId: 'algo-complexity' } });
  assert.equal(created.status, 202);
  let result: any;
  for (let attempt = 0; attempt < 30; attempt += 1) { await new Promise((resolve) => setTimeout(resolve, 100)); result = await request(`/api/jobs/${created.body.id}`); if (result.body.status === 'completed') break; }
  assert.equal(result.body.status, 'completed');
  assert.equal(result.body.package.verification.status, 'local'); assert.equal(result.body.package.verification.evidenceMode, 'authored-curriculum');
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
  assert.equal(web.body.questions.length >= 1, true);
  assert.equal(web.body.questions[0].course, 'web-dev');
  const ai = await request('/api/quiz/catalog?course=ai-ml&source=practice&subject=Generative%20AI&topic=RAG%20Systems');
  assert.equal(ai.status, 200);
  assert.equal(ai.body.questions.length, 2); // retrieval + cross-encoder reranker, both on RAG Systems
  assert.equal(ai.body.questions.every((q: any) => q.course === 'ai-ml'), true);
  assert.equal(ai.body.questions[0].answer, 1);
});

test('video recommendations are topic-specific, actionable, and honestly attributed', async () => {
  const result = await request('/api/recommendations/videos?topicId=algo-complexity');
  assert.equal(result.status, 200);
  assert.equal(result.body.recommendations.length, 3);
  assert.equal(result.body.recommendations.every((item: any) => item.url.includes('youtube.com')), true);
  assert.equal(result.body.recommendations.every((item: any) => typeof item.publisher === 'string' && item.publisher.length > 2), true);
  assert.equal(result.body.recommendations.some((item: any) => item.publisher === 'freeCodeCamp'), true);
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

test('dashboard returns a full intelligence snapshot', async () => {
  const result = await request('/api/dashboard?goal=gate-cs', { headers: { 'x-demo-user': 'dash-learner' } });
  assert.equal(result.status, 200);
  assert.equal(typeof result.body.xp, 'number');
  assert.equal(result.body.level.level >= 1, true);
  assert.equal(result.body.mastery.length > 0, true);
  assert.equal(result.body.topicMastery.length >= 40, true);
  assert.equal(result.body.nextActions.length >= 1, true);
  assert.equal(result.body.insights.length >= 3, true);
  assert.equal(result.body.week.length, 7);
});

test('unified search finds topics and questions', async () => {
  const result = await request('/api/search?q=binary%20search', { headers: { 'x-demo-user': 'search-learner' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.questions.length >= 1, true);
  assert.equal('answer' in result.body.questions[0], false);
});

test('study plan fits the daily budget with ordered blocks', async () => {
  const result = await request('/api/study-plan', { method: 'POST', headers: { 'x-demo-user': 'plan-learner' }, body: { goal: 'gate-cs' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.blocks.length >= 1, true);
  assert.equal(result.body.totalMinutes <= 60, true);
  assert.equal(['steady', 'focused', 'sprint'].includes(result.body.intensity), true);
});

test('spaced flashcards schedule reviews in the future', async () => {
  const headers = { 'x-demo-user': 'srs-learner' };
  const created = await request('/api/jobs', { method: 'POST', headers, body: { topicId: 'algo-complexity' } });
  let job: any;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    job = await request(`/api/jobs/${created.body.id}`, { headers });
    if (job.body.status === 'completed') break;
  }
  assert.equal(job.body.status, 'completed');
  const due = await request('/api/flashcards/due', { headers });
  assert.equal(due.status, 200);
  assert.equal(due.body.count >= 4, true);
  const first = due.body.due[0];
  const reviewed = await request('/api/flashcards/review', { method: 'POST', headers, body: { cardKey: first.cardKey, topicId: first.topicId, question: first.question, answer: first.answer, quality: 4 } });
  assert.equal(reviewed.status, 200);
  assert.equal(new Date(reviewed.body.review.nextDueAt).getTime() > Date.now(), true);
});

test('mock exams hide answers then grade with negative marking', async () => {
  const headers = { 'x-demo-user': 'mock-learner' };
  const created = await request('/api/mock-exams', { method: 'POST', headers, body: { course: 'gate-cs', count: 4 } });
  assert.equal(created.status, 201);
  assert.equal(created.body.questions.length, 4);
  assert.equal('answer' in created.body.questions[0], false);
  const catalog = await request('/api/quiz/catalog?course=gate-cs&source=gate-pyq');
  const key = new Map(catalog.body.questions.map((q: any) => [q.id, q]));
  const qs = created.body.questions;
  const answers: any = { [qs[0].id]: (key.get(qs[0].id) as any).answer, [qs[1].id]: (((key.get(qs[1].id) as any).answer + 1) % 4) };
  const submitted = await request(`/api/mock-exams/${created.body.id}/submit`, { method: 'POST', headers, body: { answers } });
  assert.equal(submitted.status, 200);
  const expected = (key.get(qs[0].id) as any).marks - (key.get(qs[1].id) as any).marks / 3;
  assert.ok(Math.abs(submitted.body.result.score - expected) < 0.02);
  assert.equal(submitted.body.result.correct, 1);
  assert.equal(submitted.body.result.wrong, 1);
  assert.equal(submitted.body.result.skipped, 2);
  const mistakes = await request('/api/mistakes', { headers });
  assert.equal(mistakes.body.mistakes.length >= 1, true);
});

test('diagnostic recommends a level and teaches from misses', async () => {
  const quiz = await request('/api/diagnostic', { headers: { 'x-demo-user': 'diag-learner' } });
  assert.equal(quiz.body.questions.length, 5);
  assert.equal('answer' in quiz.body.questions[0], false);
  const graded = await request('/api/diagnostic', { method: 'POST', headers: { 'x-demo-user': 'diag-learner' }, body: { answers: quiz.body.questions.map((q: any) => ({ questionId: q.id, selected: -1 })) } });
  assert.equal(graded.body.score, 0);
  assert.equal(graded.body.recommendedLevel, 'beginner');
  assert.equal(graded.body.breakdown[0].explanation.length > 0, true);
});

test('goals support full lifecycle and profile is editable', async () => {
  const headers = { 'x-demo-user': 'goals-learner' };
  const created = await request('/api/goals', { method: 'POST', headers, body: { type: 'ai-ml' } });
  assert.equal(created.status, 201);
  const patched = await request(`/api/goals/${created.body.id}`, { method: 'PATCH', headers, body: { paused: true } });
  assert.equal(patched.body.paused, true);
  const me = await request('/api/me', { method: 'PATCH', headers, body: { dailyMinutes: 45 } });
  assert.equal(me.body.dailyMinutes, 45);
  const removed = await request(`/api/goals/${created.body.id}`, { method: 'DELETE', headers });
  assert.equal(removed.status, 204);
});

test('doubts get guided help even when the runtime is offline', async () => {
  const result = await request('/api/doubt', { method: 'POST', headers: { 'x-demo-user': 'doubt-learner' }, body: { question: 'Why does binary search need sorted input?' } });
  assert.equal(result.status, 200);
  assert.match(result.body.answer, /restate|invariant/i);
});

test('analytics and achievements summarize the week', async () => {
  const headers = { 'x-demo-user': 'stats-learner' };
  const weekly = await request('/api/analytics/weekly', { headers });
  assert.equal(weekly.body.days.length, 7);
  const badges = await request('/api/achievements', { headers });
  assert.equal(badges.body.total, 19);
  assert.equal(badges.body.achievements.some((a: any) => a.id === 'first-steps'), true);
});

test('metrics expose platform counters', async () => {
  const result = await request('/api/metrics');
  assert.equal(result.body.ok, true);
  assert.equal(typeof result.body.jobsCreated, 'number');
});

test('universes expose all learning worlds with counts', async () => {
  const result = await request('/api/universes');
  assert.equal(result.status, 200);
  assert.equal(result.body.universes.length, 3);
  for (const u of result.body.universes) {
    assert.equal(typeof u.goal, 'string');
    assert.equal(u.topics > 0, true);
    assert.equal(u.modules > 0, true);
  }
});
test('lesson nav links prev/next within a universe', async () => {
  const catalog = await request('/api/curriculum/gate-cs');
  const first = catalog.body.topics[0];
  const nav = await request(`/api/lesson/gate-cs/${first.id}/nav`);
  assert.equal(nav.status, 200);
  assert.equal(nav.body.index, 0);
  assert.equal(nav.body.prev, null);
  assert.equal(typeof nav.body.next.topicId, 'string');
  const missing = await request('/api/lesson/gate-cs/nope/nav');
  assert.equal(missing.status, 404);
});
test('daily challenge is deterministic within a day', async () => {
  const a = await request('/api/challenge/daily?goal=gate-cs');
  const b = await request('/api/challenge/daily?goal=gate-cs');
  assert.equal(a.status, 200);
  assert.equal(a.body.question.id, b.body.question.id);
  assert.equal(a.body.question.answer, undefined);
  assert.equal(typeof a.body.topicId, 'string');
});
test('notes round-trip per learner and topic', async () => {
  const headers = { 'x-demo-user': 'notes-learner' };
  const saved = await request('/api/notes/algo-complexity', { method: 'PUT', headers, body: { text: 'invariant first' } });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.text, 'invariant first');
  const loaded = await request('/api/notes/algo-complexity', { headers });
  assert.equal(loaded.body.text, 'invariant first');
  const missing = await request('/api/notes/nope', { headers });
  assert.equal(missing.status, 200);
  assert.equal(missing.body.text, '');
});
test('authored local chapters are topic-specific, instant, and honestly labeled', async () => {
  const { buildLocalPack } = await import('./localPack.js');
  const { getTopic, catalogs } = await import('./curriculum.js');
  const topic = getTopic('algo-complexity')!;
  const pack = buildLocalPack('algo-complexity', topic, 'standard');
  assert.equal(pack.local, true);
  assert.equal(pack.authored, true);
  assert.equal(pack.verification.evidenceMode, 'authored-curriculum');
  assert.equal(pack.verification.status, 'local');
  assert.equal(pack.verification.fallbackReason, '');
  assert.equal(pack.quiz.length >= 4, true);
  assert.equal(pack.codeExamples.length >= 1, true);
  assert.equal(pack.diagrams.length >= 1, true);
  assert.equal(pack.notes.sections.length >= 9, true, 'definition + foundations + concepts + worked + exam + recap + revision');
  assert.equal(pack.readingMinutes > 0, true);
  assert.match(pack.notes.sections[0].heading, /Definition and scope/);
  assert.match(pack.notes.sections[0].body, /complexity/i);
  assert.doesNotMatch(pack.notes.sections[0].body, /learning objectives|mental model/i);
  assert.match(pack.notes.sections.at(-1).heading, /Revision schedule/);

  const deep = buildLocalPack('algo-complexity', topic, 'deep');
  assert.equal(deep.quiz.length >= pack.quiz.length, true);
  assert.equal(deep.pyqs.length >= pack.pyqs.length, true);

  const node = getTopic('web-dev-backend-with-node-js-node-js-runtime')!;
  const nodePack = buildLocalPack(node.id, node, 'standard');
  assert.match(nodePack.notes.sections[0].body, /event.?loop/i);
  assert.equal(nodePack.authored, true);

  // Coverage: every curriculum topic resolves to an authored pack.
  for (const curriculum of Object.values(catalogs)) {
    for (const current of curriculum) {
      const local = buildLocalPack(current.id, current, 'eli5');
      assert.equal(local.authored, true, `${current.id} is authored`);
      assert.equal(local.verification.status, 'local');
      assert.equal(local.notes.sections.some((section: any) => /Revision schedule/.test(section.heading)), true, `${current.id} ends with the revision schedule`);
      assert.ok(local.cheatSheet.length >= 6, `${current.id} has a real cheat sheet`);
    }
  }
});
test('token auth round-trips and login codes are single-use', async () => {
  const { issueToken, verifyToken, issueLoginCode, redeemLoginCode, bearerFromHeader } = await import('./auth.js');
  const token = issueToken('user-1');
  assert.equal(verifyToken(token), 'user-1');
  assert.equal(verifyToken('bogus'), null);
  assert.equal(bearerFromHeader('Bearer abc123'), 'abc123');
  assert.equal(bearerFromHeader(undefined), null);
  const code = issueLoginCode('user-1');
  assert.equal(redeemLoginCode(code), 'user-1');
  assert.equal(redeemLoginCode(code), null);
});
test('topic jobs accept an explanation depth', async () => {
  const headers = { 'x-demo-user': 'depth-learner' };
  const created = await request('/api/jobs', { method: 'POST', headers, body: { topicId: 'algo-complexity', depth: 'eli5' } });
  assert.equal(created.status, 202);
  let result: any;
  for (let attempt = 0; attempt < 20; attempt += 1) { await new Promise((r) => setTimeout(r, 100)); result = await request(`/api/jobs/${created.body.id}`, { headers }); if (result.body.status === 'completed') break; }
  assert.equal(result.body.status, 'completed');
  assert.equal(result.body.package.depth, 'eli5');
});

// --------------------------------------------------- universe switching + auth

test('login codes exchange for a bearer token that authenticates later requests', async () => {
  const { issueLoginCode } = await import('./auth.js');
  await request('/api/session', { headers: { 'x-demo-user': 'token-learner' } });
  const code = issueLoginCode('token-learner');
  const exchanged = await request('/api/auth/exchange', { method: 'POST', body: { code } });
  assert.equal(exchanged.status, 200);
  assert.equal(typeof exchanged.body.token, 'string');
  const session = await request('/api/session', { headers: { authorization: `Bearer ${exchanged.body.token}` } });
  assert.equal(session.body.user.id, 'token-learner');
  const replay = await request('/api/auth/exchange', { method: 'POST', body: { code } });
  assert.equal(replay.status, 401, 'a login code must only work once');
});

test('switching the learning universe persists on the account', async () => {
  const headers = { 'x-demo-user': 'universe-learner' };
  const switched = await request('/api/me', { method: 'PATCH', headers, body: { activeGoal: 'ai-ml' } });
  assert.equal(switched.status, 200);
  assert.equal(switched.body.activeGoal, 'ai-ml');
  assert.equal(switched.body.goals.some((g: any) => g.type === 'ai-ml'), true);
  const reloaded = await request('/api/me', { headers });
  assert.equal(reloaded.body.activeGoal, 'ai-ml');
  const invalid = await request('/api/me', { method: 'PATCH', headers, body: { activeGoal: 'astrology' } });
  assert.equal(invalid.status, 400);
});

// --------------------------------------------------------- specialist answers

test('doubts answer the concept asked instead of a similar-looking PYQ', async () => {
  const savedKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  try {
    const result = await request('/api/doubt', {
      method: 'POST', headers: { 'x-demo-user': 'doubt-concept' },
      body: { question: 'Why does binary search need sorted input?' },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.provider, 'local-guide');
    assert.match(result.body.answer, /total order|discards half/i, 'must explain the actual concept');
    assert.equal(result.body.answer.includes('Option by option'), false, 'must not answer a different question');
  } finally {
    if (savedKey !== undefined) process.env.OPENROUTER_API_KEY = savedKey;
  }
});

// ------------------------------------------------------------- reading room

test('reading room returns curated resources scoped to a universe', async () => {
  const gate = await request('/api/resources?goal=gate-cs');
  assert.equal(gate.status, 200);
  assert.equal(gate.body.goal, 'gate-cs');
  assert.ok(gate.body.resources.length >= 10, 'GATE universe has a real shelf');
  assert.ok(gate.body.modules.length >= 8, 'module list mirrors the live syllabus');
  const web = await request('/api/resources?goal=web-dev');
  const ai = await request('/api/resources?goal=ai-ml');
  assert.equal(web.body.goal, 'web-dev');
  assert.equal(ai.body.goal, 'ai-ml');
  assert.ok(web.body.resources.length >= 10 && ai.body.resources.length >= 10);
  const webIds = new Set(web.body.resources.map((r: any) => r.id));
  const aiIds = new Set(ai.body.resources.map((r: any) => r.id));
  const gateIds = new Set(gate.body.resources.map((r: any) => r.id));
  assert.ok([...webIds].every((id) => !gateIds.has(id)), 'shelves differ per universe');
  assert.ok([...aiIds].every((id) => !gateIds.has(id)), 'shelves differ per universe');
});

test('reading room filters by module and search text', async () => {
  const byModule = await request('/api/resources?goal=ai-ml&module=Deep%20Learning');
  assert.equal(byModule.status, 200);
  assert.ok(byModule.body.resources.length >= 1);
  assert.ok(byModule.body.resources.every((r: any) => r.modules.includes('Deep Learning')));
  const byQuery = await request('/api/resources?goal=web-dev&q=react');
  assert.equal(byQuery.status, 200);
  assert.ok(byQuery.body.resources.length >= 1);
  assert.ok(byQuery.body.resources.every((r: any) =>
    `${r.title} ${r.publisher} ${r.blurb} ${r.modules.join(' ')}`.toLowerCase().includes('react')));
});

// ------------------------------------------------- regeneration guarantees

async function waitForJob(id: string, headers: any) {
  for (let i = 0; i < 60; i += 1) {
    const job = await request(`/api/jobs/${id}`, { headers });
    if (['completed', 'failed'].includes(job.body.status)) return job.body;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('job did not settle');
}

test('first generation still falls back to the local kit when the runtime is offline', async () => {
  const headers = { 'x-demo-user': 'regen-fresh' };
  const created = await request('/api/jobs', { method: 'POST', headers, body: { topicId: 'algo-complexity', depth: 'standard' } });
  assert.equal(created.status, 202);
  const settled = await waitForJob(created.body.id, headers);
  assert.equal(settled.status, 'completed', 'a brand-new topic still gets a kit offline');
  assert.ok(settled.package, 'fallback package is attached');
});

test('regeneration fails loudly and keeps the saved kit when the runtime is offline', async () => {
  const headers = { 'x-demo-user': 'regen-keeper' };
  const first = await request('/api/jobs', { method: 'POST', headers, body: { topicId: 'algo-sorting', depth: 'standard' } });
  const settled = await waitForJob(first.body.id, headers);
  assert.equal(settled.status, 'completed');
  const saved = await request('/api/learning/content/algo-sorting', { headers });
  assert.equal(saved.status, 200, 'kit is stored after first generation');

  const regen = await request('/api/jobs', { method: 'POST', headers, body: { topicId: 'algo-sorting', depth: 'standard', regenerate: true } });
  assert.equal(regen.status, 202);
  assert.equal(regen.body.regenerate, true);
  assert.equal(regen.body.hadContent, true);
  const regenSettled = await waitForJob(regen.body.id, headers);
  assert.equal(regenSettled.status, 'failed', 'offline regen must fail instead of overwriting');
  assert.match(regenSettled.message, /kept untouched/i);

  const after = await request('/api/learning/content/algo-sorting', { headers });
  assert.equal(after.status, 200);
  assert.deepEqual(after.body, saved.body, 'the saved kit is byte-identical after a failed regen');
});

test('a missing authored lesson fails loudly instead of fabricating one', async () => {
  const { buildLocalPack } = await import('./localPack.js');
  const { getTopic } = await import('./curriculum.js');
  assert.throws(
    () => buildLocalPack('gate-cs-algorithms-this-topic-does-not-exist', getTopic('algo-complexity')!, 'standard'),
    /No authored lesson registered/,
  );
});

// ------------------------------------------------------- discussions (Sprint 1)

test('discussions feed is public and ships with curated cold-start threads', async () => {
  const result = await request('/api/discussions');
  assert.equal(result.status, 200);
  assert.equal(result.body.discussions.length >= 8, true);
  const deadlock = result.body.discussions.find((d: any) => d.id === 'seed-deadlock-one-more-mutex');
  assert.equal(Boolean(deadlock), true);
  assert.equal(typeof deadlock.upvotes, 'number');
  assert.equal(deadlock.comments.length >= 1, true);
  assert.equal('upvoterIds' in deadlock, false, 'serialized posts must not leak upvoter internals');
});

test('discussions support posting, upvoting, commenting and resolving', async () => {
  const headers = { 'x-demo-user': 'discuss-learner' };
  const created = await request('/api/discussions', { method: 'POST', headers, body: { kind: 'doubt', title: 'Why does LRU beat FIFO on stack algorithms?', body: 'Belady says stack algorithms cannot have the anomaly — but WHY is LRU a stack algorithm and FIFO is not?', topicId: 'gate-cs-operating-systems-memory-management' } });
  assert.equal(created.status, 201);
  assert.equal(created.body.isResolved, false);
  const up = await request(`/api/discussions/${created.body.id}/upvote`, { method: 'POST', headers });
  assert.equal(up.body.upvoted, true);
  const upAgain = await request(`/api/discussions/${created.body.id}/upvote`, { method: 'POST', headers });
  assert.equal(upAgain.body.upvoted, false);
  assert.equal(upAgain.body.upvotes < up.body.upvotes, true);
  const comment = await request(`/api/discussions/${created.body.id}/comments`, { method: 'POST', headers, body: { body: 'LRU keeps the m most recent pages — a new frame never evicts a recently used page for an older one.' } });
  assert.equal(comment.status, 201);
  assert.equal(comment.body.comments.length, 1);
  const resolved = await request(`/api/discussions/${created.body.id}/resolve`, { method: 'POST', headers });
  assert.equal(resolved.body.isResolved, true);
  const filter = await request('/api/discussions?kind=doubt&topicId=gate-cs-operating-systems-memory-management');
  assert.equal(filter.body.discussions.some((d: any) => d.id === created.body.id), true);
});

test('discussions reject bad input and non-author resolves', async () => {
  const headers = { 'x-demo-user': 'discuss-guard' };
  const bad = await request('/api/discussions', { method: 'POST', headers, body: { kind: 'rant', title: 'x-y', body: 'y-z' } });
  assert.equal(bad.status, 400);
  const spam = await request('/api/discussions', { method: 'POST', headers, body: { kind: 'thought', title: 'check this out', body: 'go to https://a.com https://b.com https://c.com now' } });
  assert.equal(spam.status, 400);
  const resolveForbidden = await request('/api/discussions/seed-deadlock-one-more-mutex/resolve', { method: 'POST', headers });
  assert.equal(resolveForbidden.status, 403);
});

// --------------------------------------------------------------- guest mode

test('guest reads are public, curated and never persisted', async () => {
  const saved = process.env.AUTH_MODE;
  process.env.AUTH_MODE = 'google';
  try {
    const session = await request('/api/session');
    assert.equal(session.status, 401);
    const pack = await request('/api/learning/content/algo-complexity');
    assert.equal(pack.status, 200);
    assert.equal(pack.body.guest, true);
    assert.equal(pack.body.notes.sections.length >= 5, true);
    const feed = await request('/api/discussions');
    assert.equal(feed.status, 200);
    const created = await request('/api/discussions', { method: 'POST', body: { kind: 'doubt', title: 'guest post attempt', body: 'should be rejected' } });
    assert.equal(created.status, 401);
  } finally {
    if (saved === undefined) delete process.env.AUTH_MODE; else process.env.AUTH_MODE = saved;
  }
});

test('authenticated learners without a saved kit get the authored chapter, never persisted', async () => {
  const headers = { 'x-demo-user': 'baseline-reader' };
  const pack = await request('/api/learning/content/algo-sorting', { headers });
  assert.equal(pack.status, 200);
  assert.equal(pack.body.local, true);
  assert.equal(pack.body.authored, true);
  assert.equal(pack.body.verification.evidenceMode, 'authored-curriculum');
  assert.equal(pack.body.verification.status, 'local');
  const list = await request('/api/learning/content', { headers });
  assert.equal(list.body.content.some((item: any) => item.topicId === 'algo-sorting'), false, 'baseline reads are never persisted');
});
