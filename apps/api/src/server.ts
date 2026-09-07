import express, { Request, Response } from 'express';
import cors from 'cors';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({ credentials: true, origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed')); } }));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => { if (isProduction && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.path.startsWith('/api/') && !allowedOrigins.includes(String(req.headers.origin || ''))) return res.status(403).json({ error: 'Invalid request origin' }); next(); });

const users = new Map<string, any>();
const jobs = new Map<string, any>();
const subscribers = new Map<string, Set<Response>>();
const runtime = (() => {
  const configured = process.env.AGENT_RUNTIME_URL || 'http://localhost:8000';
  return configured.startsWith('http://') || configured.startsWith('https://') ? configured : `http://${configured}`;
})();

const topics = [
  { id: 'algo-complexity', title: 'Time & Space Complexity', description: 'Analyze algorithm efficiency using asymptotic notation.', prerequisites: [], status: 'available' },
  { id: 'algo-arrays', title: 'Arrays and Searching', description: 'Solve array problems with invariants and binary search.', prerequisites: ['algo-complexity'], status: 'locked' },
  { id: 'algo-graphs', title: 'Graph Traversals', description: 'Apply BFS and DFS to connected structures.', prerequisites: ['algo-arrays'], status: 'locked' }
];

type Principal = { id: string };
const sessionSecret = process.env.SESSION_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const publicApiUrl = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 4000}`;

function cookieValue(req: Request, name: string): string | undefined { return req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1); }
function sign(value: string): string { if (!sessionSecret) throw new Error('SESSION_SECRET must be configured'); return createHmac('sha256', sessionSecret).update(value).digest('base64url'); }
function signedValue(value: string): string { return `${value}.${sign(value)}`; }
function verifiedValue(value: string | undefined): string | null { if (!value || !sessionSecret) return null; const index = value.lastIndexOf('.'); if (index < 1) return null; const payload = value.slice(0, index); const signature = value.slice(index + 1); const expected = sign(payload); if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; return payload; }
function setCookie(res: Response, name: string, value: string, maxAge?: number): void { res.append('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=${isProduction ? 'None; Secure' : 'Lax'}${maxAge ? `; Max-Age=${maxAge}` : ''}`); }

function principal(req: Request): Principal | null {
  const session = verifiedValue(cookieValue(req, 'eduswarm_session'));
  if (session) return { id: session };
  // Demo identities are development/test-only; production always requires a signed OAuth session.
  if (isProduction) return null;
  return { id: String(req.headers['x-demo-user'] || 'demo-user') };
}
function requirePrincipal(req: Request, res: Response): Principal | null {
  const user = principal(req); if (!user) { res.status(401).json({ error: 'Authentication required' }); return null; } return user;
}
function validTopic(topicId: unknown): topicId is string { return typeof topicId === 'string' && topics.some((topic) => topic.id === topicId); }

app.get('/auth/google', (_req, res) => {
  if (!googleClientId || !googleClientSecret || !sessionSecret) return res.status(503).json({ error: 'Google authentication is not configured' });
  const nonce = randomBytes(24).toString('base64url');
  setCookie(res, 'eduswarm_oauth_state', signedValue(nonce), 600);
  const params = new URLSearchParams({ client_id: googleClientId, redirect_uri: `${publicApiUrl}/auth/google/callback`, response_type: 'code', scope: 'openid email profile', state: nonce, prompt: 'select_account' });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});
app.get('/auth/google/callback', async (req, res) => {
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  if (!googleClientId || !googleClientSecret || !sessionSecret || !state || verifiedValue(cookieValue(req, 'eduswarm_oauth_state')) !== state || typeof req.query.code !== 'string') return res.status(401).json({ error: 'Invalid OAuth callback' });
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: req.query.code, client_id: googleClientId, client_secret: googleClientSecret, redirect_uri: `${publicApiUrl}/auth/google/callback`, grant_type: 'authorization_code' }) });
    if (!tokenResponse.ok) return res.status(401).json({ error: 'Google token exchange failed' });
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) return res.status(401).json({ error: 'Google did not return an access token' });
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${token.access_token}` } });
    const profile = await profileResponse.json() as { sub?: string; name?: string };
    if (!profileResponse.ok || !profile.sub) return res.status(401).json({ error: 'Google profile lookup failed' });
    if (!users.has(profile.sub)) users.set(profile.sub, { id: profile.sub, name: profile.name || 'Learner', skillLevel: 'beginner', dailyMinutes: 60, avatar: { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [] });
    setCookie(res, 'eduswarm_session', signedValue(profile.sub), 60 * 60 * 24 * 7);
    setCookie(res, 'eduswarm_oauth_state', '', 1);
    res.redirect(process.env.WEB_APP_URL || 'http://localhost:5173');
  } catch { res.status(502).json({ error: 'Google authentication is unavailable' }); }
});
app.post('/auth/logout', (req, res) => { if (!requirePrincipal(req, res)) return; setCookie(res, 'eduswarm_session', '', 1); res.status(204).end(); });

function emit(jobId: string, event: any) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  subscribers.get(jobId)?.forEach((res) => res.write(payload));
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'eduswarm-api' }));
app.get('/api/me', (req, res) => {
  const auth = requirePrincipal(req, res); if (!auth) return; const id = auth.id;
  if (!users.has(id)) users.set(id, { id, name: 'Demo Learner', skillLevel: 'beginner', dailyMinutes: 60, avatar: { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [] });
  res.json(users.get(id));
});
app.post('/api/onboarding', (req, res) => {
  const auth = requirePrincipal(req, res); if (!auth) return; const id = auth.id;
  const body = req.body || {};
  if (typeof body.name !== 'string' || !body.name.trim() || !['beginner', 'intermediate', 'advanced'].includes(body.skillLevel || 'beginner') || !Number.isInteger(Number(body.dailyMinutes || 60)) || Number(body.dailyMinutes || 60) < 15 || Number(body.dailyMinutes || 60) > 240) return res.status(400).json({ error: 'Invalid onboarding payload' });
  const goal = body.goal || 'gate-cs'; if (!['gate-cs', 'web-dev', 'ai-ml', 'other'].includes(goal)) return res.status(400).json({ error: 'Invalid goal' });
  const user = { id, name: body.name.trim(), skillLevel: body.skillLevel || 'beginner', dailyMinutes: Number(body.dailyMinutes || 60), targetDate: body.targetDate || null, avatar: body.avatar || { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [{ id: randomUUID(), type: goal, title: body.goalTitle || 'Clear GATE CS', progress: 0, paused: false }] };
  users.set(id, user);
  res.status(201).json(user);
});
app.get('/api/goals', (req, res) => { const auth = requirePrincipal(req, res); if (auth) res.json(users.get(auth.id)?.goals || []); });
app.get('/api/curriculum/:goal', (req, res) => { if (!requirePrincipal(req, res)) return; if (req.params.goal !== 'gate-cs') return res.status(404).json({ error: 'Curriculum not available' }); res.json({ template: 'GATE CS Algorithms v1', topics }); });
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const auth = requirePrincipal(req, res); if (!auth) return; if (job.ownerId !== auth.id) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});
app.get('/api/jobs/:id/events', (req, res) => {
  const id = req.params.id;
  const auth = requirePrincipal(req, res); if (!auth) return; const job = jobs.get(id); if (!job || job.ownerId !== auth.id) return res.status(404).json({ error: 'Job not found' });
  res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); res.flushHeaders?.();
  if (!subscribers.has(id)) subscribers.set(id, new Set()); subscribers.get(id)!.add(res);
  if (jobs.has(id)) res.write(`id: ${job.events || 0}\ndata: ${JSON.stringify(job)}\n\n`);
  const heartbeat = setInterval(() => res.write(': keepalive\n\n'), 15_000);
  req.on('close', () => { clearInterval(heartbeat); subscribers.get(id)?.delete(res); });
});
app.post('/api/jobs', async (req, res) => {
  const auth = requirePrincipal(req, res); if (!auth) return;
  const id = randomUUID(); const topicId = req.body?.topicId;
  if (!validTopic(topicId)) return res.status(400).json({ error: 'A supported topicId is required' });
  const job = { id, ownerId: auth.id, topicId, status: 'queued', stage: 'Dean', message: 'Queued for the learning team', package: null, createdAt: new Date().toISOString(), events: 0 };
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
  const auth = requirePrincipal(req, res); if (!auth) return; const job = jobs.get(req.params.jobId); if (!job || job.ownerId !== auth.id || !job?.package) return res.status(404).json({ error: 'Verified package is not ready' }); res.json(job.package);
});
app.get('/api/jobs/:id/trace', async (req, res) => {
  const auth = requirePrincipal(req, res); if (!auth) return; const job = jobs.get(req.params.id); if (!job || job.ownerId !== auth.id) return res.status(404).json({ error: 'Job not found' });
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
      if (!response.ok) throw new Error(`runtime ${response.status}`);
      const remote = await response.json() as any;
      const job = jobs.get(id); if (!job) return;
      const latest = remote.events?.at(-1);
      if (latest) { job.stage = latest.agent; job.message = latest.message; job.events += 1; emit(id, { ...job, timestamp: latest.timestamp }); }
      if (remote.status === 'completed') { job.status = 'completed'; job.package = remote.package; emit(id, { ...job, timestamp: new Date().toISOString() }); return; }
      if (remote.status === 'failed') { job.status = 'failed'; job.message = remote.error || 'The agent team could not verify this package.'; emit(id, { ...job, timestamp: new Date().toISOString() }); return; }
    } catch { /* transient worker/network failure; continue until the retry budget expires */ }
  }
  const job = jobs.get(id); if (job && job.status !== 'completed') { job.status = 'failed'; job.message = 'The agent team timed out; please retry.'; emit(id, { ...job, timestamp: new Date().toISOString() }); }
}

export { app, users, jobs };
if (process.env.NODE_ENV !== 'test') app.listen(Number(process.env.PORT || 4000), () => console.log(`EduSwarm API listening on ${process.env.PORT || 4000}`));
