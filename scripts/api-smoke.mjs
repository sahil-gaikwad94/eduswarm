/**
 * Live boot smoke for the EduSwarm API (Sprint 1 surface).
 * Spawns the built server as a child process (exactly like production) and
 * exercises the public + demo-auth paths over HTTP.
 */
import { spawn } from 'node:child_process';

const PORT = Number(process.env.SMOKE_PORT || 4311);
const base = `http://127.0.0.1:${PORT}`;
const headers = { 'x-demo-user': 'qa-user', 'content-type': 'application/json' };

const child = spawn(process.execPath, ['apps/api/dist/server.js'], {
  env: { ...process.env, NODE_ENV: 'development', PORT: String(PORT) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.on('data', (chunk) => process.stdout.write(`[api] ${chunk}`));
child.stderr.on('data', (chunk) => process.stdout.write(`[api:err] ${chunk}`));

async function waitForHealth(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/health`);
      if (response.ok) return true;
    } catch { /* still booting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

let failures = 0;
async function check(label, path, init = {}) {
  const response = await fetch(base + path, { headers, ...init });
  const body = await response.text();
  console.log(`${label} ${response.status} ${body.slice(0, 140)}`);
  if (!response.ok) failures += 1;
  return body;
}

try {
  if (!(await waitForHealth())) throw new Error('API did not become healthy in time');
  for (const path of [
    '/health', '/api/metrics',
    '/api/curriculum/gate-cs', '/api/curriculum/web-dev', '/api/curriculum/ai-ml',
    '/api/quiz/catalog?course=web-dev&source=practice&subject=Backend&topic=API%20Design',
    '/api/recommendations/videos?topicId=algo-complexity',
    '/api/universes', '/api/resources?goal=gate-cs', '/api/challenge/daily?goal=gate-cs',
    '/api/session', '/api/dashboard?goal=gate-cs', '/api/study-plan?goal=gate-cs',
    '/api/search?q=scheduling', '/api/flashcards/due', '/api/mock-exams',
    '/api/diagnostic', '/api/analytics/weekly', '/api/achievements',
    // Sprint 1 — discussions (public read) + guest curated baseline
    '/api/discussions', '/api/discussions?kind=doubt',
    '/api/learning/content/algo-complexity',
  ]) await check('GET', path);
  await check('POST', '/api/study-plan', { method: 'POST', body: JSON.stringify({ goal: 'gate-cs' }) });
  await check('POST', '/api/mock-exams', { method: 'POST', body: JSON.stringify({ course: 'gate-cs', count: 5 }) });
  await check('POST', '/api/doubt', { method: 'POST', body: JSON.stringify({ question: 'Why is merge sort stable?' }) });
  await check('POST', '/api/discussions', { method: 'POST', body: JSON.stringify({ kind: 'thought', title: 'Smoke thread from the API smoke run', body: 'Posting to prove the write path; the QA user owns this one.', topicId: 'algo-complexity' }) });
} catch (error) {
  console.error('smoke FAILED:', error);
  failures += 1;
} finally {
  child.kill('SIGTERM');
}
console.log(failures ? `smoke FAILED (${failures} failing routes)` : 'smoke OK');
process.exit(failures ? 1 : 0);
