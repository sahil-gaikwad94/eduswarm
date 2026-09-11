process.env.NODE_ENV = 'test';
const { app } = await import('../apps/api/dist/server.js');
const server = app.listen(4310);
const base = 'http://127.0.0.1:4310';
const headers = { 'x-demo-user': 'qa-user', 'content-type': 'application/json' };
async function check(label, path, init = {}) {
  const response = await fetch(base + path, { headers, ...init });
  const body = await response.text();
  console.log(`${label} ${response.status} ${body.slice(0, 160)}`);
  if (!response.ok) process.exitCode = 1;
  return body;
}
try {
  for (const path of [
    '/health', '/api/metrics',
    '/api/curriculum/gate-cs', '/api/curriculum/web-dev', '/api/curriculum/ai-ml',
    '/api/quiz/catalog?course=web-dev&source=practice&subject=Backend&topic=API%20Design',
    '/api/recommendations/videos?topicId=algo-complexity',
    '/api/session', '/api/dashboard?goal=gate-cs', '/api/study-plan?goal=gate-cs',
    '/api/search?q=scheduling', '/api/flashcards/due', '/api/mock-exams',
    '/api/code/challenges', '/api/diagnostic', '/api/analytics/weekly', '/api/achievements',
  ]) await check('GET', path);
  await check('POST', '/api/study-plan', { method: 'POST', body: JSON.stringify({ goal: 'gate-cs' }) });
  await check('POST', '/api/mock-exams', { method: 'POST', body: JSON.stringify({ course: 'gate-cs', count: 5 }) });
  await check('POST', '/api/code/run', { method: 'POST', body: JSON.stringify({ challengeId: 'binary-search', code: 'function solve(nums, t) { return nums.indexOf(t); }' }) });
  await check('POST', '/api/doubt', { method: 'POST', body: JSON.stringify({ question: 'Why is merge sort stable?' }) });
} finally {
  await new Promise((resolve) => server.close(resolve));
}
