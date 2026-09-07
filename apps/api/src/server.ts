import express, { Request, Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const users = new Map<string, any>();
const jobs = new Map<string, any>();
const subscribers = new Map<string, Set<Response>>();
const runtime = process.env.AGENT_RUNTIME_URL || 'http://localhost:8000';

const topics = [
  { id: 'algo-complexity', title: 'Time & Space Complexity', description: 'Analyze algorithm efficiency using asymptotic notation.', prerequisites: [], status: 'available' },
  { id: 'algo-arrays', title: 'Arrays and Searching', description: 'Solve array problems with invariants and binary search.', prerequisites: ['algo-complexity'], status: 'locked' },
  { id: 'algo-graphs', title: 'Graph Traversals', description: 'Apply BFS and DFS to connected structures.', prerequisites: ['algo-arrays'], status: 'locked' }
];

function emit(jobId: string, event: any) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  subscribers.get(jobId)?.forEach((res) => res.write(payload));
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'eduswarm-api' }));
app.get('/api/me', (req, res) => {
  const id = String(req.headers['x-demo-user'] || 'demo-user');
  if (!users.has(id)) users.set(id, { id, name: 'Demo Learner', skillLevel: 'beginner', dailyMinutes: 60, avatar: { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [] });
  res.json(users.get(id));
});
app.post('/api/onboarding', (req, res) => {
  const id = String(req.headers['x-demo-user'] || 'demo-user');
  const body = req.body || {};
  const user = { id, name: body.name || 'Learner', skillLevel: body.skillLevel || 'beginner', dailyMinutes: Number(body.dailyMinutes || 60), targetDate: body.targetDate || null, avatar: body.avatar || { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [{ id: randomUUID(), type: body.goal || 'gate-cs', title: body.goalTitle || 'Clear GATE CS', progress: 0, paused: false }] };
  users.set(id, user);
  res.status(201).json(user);
});
app.get('/api/goals', (req, res) => res.json(users.get(String(req.headers['x-demo-user'] || 'demo-user'))?.goals || []));
app.get('/api/curriculum/:goal', (_req, res) => res.json({ template: 'GATE CS Algorithms v1', topics }));
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});
app.get('/api/jobs/:id/events', (req, res) => {
  const id = req.params.id;
  res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); res.flushHeaders?.();
  if (!subscribers.has(id)) subscribers.set(id, new Set()); subscribers.get(id)!.add(res);
  if (jobs.has(id)) res.write(`data: ${JSON.stringify(jobs.get(id))}\n\n`);
  req.on('close', () => subscribers.get(id)?.delete(res));
});
app.post('/api/jobs', async (req, res) => {
  const id = randomUUID(); const topicId = req.body?.topicId || 'algo-complexity';
  const job = { id, topicId, status: 'queued', stage: 'Dean', message: 'Queued for the learning team', package: null, createdAt: new Date().toISOString() };
  jobs.set(id, job); res.status(202).json(job);
  try {
    const response = await fetch(`${runtime}/v1/topic-jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ job_id: id, topic_id: topicId }) });
    if (!response.ok) throw new Error(`runtime ${response.status}`);
    void syncRuntimeJob(id);
  } catch {
    job.status = 'failed';
    job.message = 'Agent runtime is unavailable; no content was generated.';
    emit(id, { ...job, timestamp: new Date().toISOString() });
  }
});
app.get('/api/content/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId); if (!job?.package) return res.status(404).json({ error: 'Verified package is not ready' }); res.json(job.package);
});
app.get('/api/jobs/:id/trace', async (req, res) => {
  try {
    const response = await fetch(`${runtime}/v1/topic-jobs/${req.params.id}/trace`);
    if (!response.ok) return res.status(response.status).json({ error: 'Trace unavailable' });
    res.json(await response.json());
  } catch {
    res.status(503).json({ error: 'Agent runtime is unavailable' });
  }
});

async function syncRuntimeJob(id: string) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    try {
      const response = await fetch(`${runtime}/v1/topic-jobs/${id}`);
      const remote = await response.json() as any;
      const job = jobs.get(id); if (!job) return;
      const latest = remote.events?.at(-1);
      if (latest) { job.stage = latest.agent; job.message = latest.message; emit(id, { ...job, timestamp: latest.timestamp }); }
      if (remote.status === 'completed') { job.status = 'completed'; job.package = remote.package; emit(id, { ...job, timestamp: new Date().toISOString() }); return; }
    } catch { /* transient worker/network failure; continue until the retry budget expires */ }
  }
  const job = jobs.get(id); if (job && job.status !== 'completed') { job.status = 'failed'; job.message = 'The agent team timed out; please retry.'; emit(id, { ...job, timestamp: new Date().toISOString() }); }
}

export { app, users, jobs };
if (process.env.NODE_ENV !== 'test') app.listen(Number(process.env.PORT || 4000), () => console.log(`EduSwarm API listening on ${process.env.PORT || 4000}`));
