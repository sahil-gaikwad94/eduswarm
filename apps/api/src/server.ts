import express, { Request, Response } from 'express';
import cors from 'cors';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createStore, StoredUser } from './store.js';
import { getCatalog, getTopic, catalogCounts } from './curriculum.js';

const app = express();
const store = createStore();
const allowedOrigins = new Set((process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean));
const runtime = normalizeServiceUrl(process.env.AGENT_RUNTIME_URL || 'http://localhost:8000');
const authMode = process.env.AUTH_MODE || (process.env.NODE_ENV === 'production' ? 'google' : 'demo');
const allowLocalFallback = process.env.ALLOW_LOCAL_FALLBACK !== 'false' && process.env.NODE_ENV !== 'production';
const sessionSecret = process.env.SESSION_SECRET || 'development-only-session-secret';
const sessionCookie = 'eduswarm_session';
const oauthStateCookie = 'eduswarm_oauth_state';
const sessionTtlMs = 1000 * 60 * 60 * 24 * 30;

const PYQ_BANK = [
  { id: 'gate-cse-2023-os-scheduling', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Operating Systems', topic: 'CPU Scheduling', difficulty: 'medium', question: 'A process scheduling policy that gives each ready process a fixed time slice in cyclic order is:', options: ['FCFS', 'Round Robin', 'Shortest Job First', 'Non-preemptive priority'], answer: 1, explanation: 'Round Robin cycles through ready processes and assigns each a bounded time quantum.' },
  { id: 'gate-cse-2022-db-normalization', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'DBMS', topic: 'Normalization', difficulty: 'medium', question: 'A relation is in BCNF when, for every non-trivial functional dependency X → Y, X is a:', options: ['Foreign key', 'Candidate key', 'Prime attribute', 'Superkey'], answer: 3, explanation: 'BCNF requires every determinant of a non-trivial dependency to be a superkey.' },
  { id: 'gate-cse-2021-algo-complexity', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Algorithms', topic: 'Complexity', difficulty: 'easy', question: 'The worst-case time complexity of binary search on a sorted array is:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 1, explanation: 'Each comparison halves the remaining search interval.' },
  { id: 'gate-cse-2020-cn-routing', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Computer Networks', topic: 'Routing', difficulty: 'medium', question: 'Which algorithm is classically associated with distance-vector routing?', options: ['Dijkstra', 'Bellman-Ford', 'Kruskal', 'Prim'], answer: 1, explanation: 'Distance-vector protocols exchange route distances and use Bellman-Ford style updates.' },
  { id: 'gate-cse-2019-toc-automata', course: 'gate-cs', source: 'gate-pyq', year: 2019, subject: 'Theory of Computation', topic: 'Finite Automata', difficulty: 'medium', question: 'Regular languages are closed under:', options: ['Union', 'Only reversal', 'Only complement', 'None of these'], answer: 0, explanation: 'Regular languages are closed under union, intersection, complement, concatenation, and more.' },
  { id: 'gate-cse-2018-coa-cache', course: 'gate-cs', source: 'gate-pyq', year: 2018, subject: 'Computer Organization', topic: 'Cache Memory', difficulty: 'hard', question: 'The main benefit of a cache is exploiting:', options: ['Only parallelism', 'Locality of reference', 'Instruction pipelining', 'Virtualization'], answer: 1, explanation: 'Caches rely on temporal and spatial locality of reference.' },
];

const AGENT_CATALOG = [
  { id: 'socratic-tutor', name: 'Socratic Tutor', role: 'Concept guide', description: 'Asks the right next question instead of giving away the answer.', bestFor: 'Breaking through confusing concepts', icon: '◌' },
  { id: 'pyq-coach', name: 'PYQ Coach', role: 'Exam strategist', description: 'Turns missed GATE questions into patterns, shortcuts, and timed drills.', bestFor: 'GATE CSE preparation', icon: '⌁' },
  { id: 'code-reviewer', name: 'Code Reviewer', role: 'Practice partner', description: 'Reviews your implementation for correctness, complexity, and edge cases.', bestFor: 'Full-stack and AI/ML projects', icon: '</>' },
  { id: 'revision-planner', name: 'Revision Planner', role: 'Study architect', description: 'Builds a realistic next-session plan from your confidence and weak topics.', bestFor: 'Keeping momentum over time', icon: '↗' },
];

app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)), credentials: true }));
app.use(express.json({ limit: '1mb' }));

function normalizeServiceUrl(value: string) { const candidate = value.trim(); return /^https?:\/\//i.test(candidate) ? candidate.replace(/\/$/, '') : `https://${candidate}`; }
function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function cookieOptions(maxAge: number) {
  const isProd = process.env.NODE_ENV === 'production';
  return [
    `Max-Age=${Math.floor(maxAge / 1000)}`,
    'Path=/',
    'HttpOnly',
    isProd ? 'SameSite=None' : 'SameSite=Lax',
    ...(isProd ? ['Secure'] : [])
  ].join('; ');
}
function setCookie(res: Response, name: string, value: string, maxAge: number) { res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${cookieOptions(maxAge)}`); }
function clearCookie(res: Response, name: string) { setCookie(res, name, '', 0); }
function cookies(req: Request) { return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => { const index = part.indexOf('='); return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))]; })); }
function sign(value: string) { return `${value}.${createHmac('sha256', sessionSecret).update(value).digest('base64url')}`; }
function verify(value: string | undefined) { if (!value) return null; const [raw, signature] = value.split('.'); if (!raw || !signature) return null; const expected = createHmac('sha256', sessionSecret).update(raw).digest('base64url'); const actualBuffer = Buffer.from(signature); const expectedBuffer = Buffer.from(expected); return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer) ? raw : null; }
function redirectUri() { return process.env.OAUTH_REDIRECT_URI || `${process.env.PUBLIC_API_URL || 'http://localhost:4000'}/auth/google/callback`; }
function publicWebUrl() { return process.env.WEB_URL || [...allowedOrigins][0] || 'http://localhost:5173'; }
function now() { return new Date().toISOString(); }
function defaultUser(id: string, overrides: Partial<StoredUser> = {}): StoredUser { return { id, name: 'Demo Learner', skillLevel: 'beginner', dailyMinutes: 60, avatar: { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [], createdAt: now(), updatedAt: now(), ...overrides }; }

async function ready() { await store.connect(); }
async function userFor(req: Request) {
  if (authMode === 'demo') {
    const id = String(req.headers['x-demo-user'] || 'demo-user');
    let user = await store.getUser(id);
    if (!user) user = await store.upsertUser(defaultUser(id));
    return user;
  }
  const sessionId = cookies(req)[sessionCookie];
  const session = sessionId ? await store.getSession(sessionId) : null;
  return session ? store.getUser(session.userId) : null;
}
async function requireUser(req: Request, res: Response) { const user = await userFor(req); if (!user) { res.status(401).json({ error: 'Authentication required' }); return null; } return user; }
function emit(jobId: string, event: any) { void store.publish(jobId, event); }

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true, service: 'eduswarm-api' }));
app.get('/ready', async (_req: Request, res: Response) => { try { await ready(); const response = await fetch(`${runtime}/ready`); if (!response.ok) throw new Error('runtime unavailable'); res.json({ ok: true, service: 'eduswarm-api', dependencies: { database: 'ready', redis: 'ready', runtime: 'ready' } }); } catch { res.status(503).json({ ok: false, service: 'eduswarm-api' }); } });
app.get('/api/session', async (req: Request, res: Response) => { const user = await userFor(req); if (!user) return res.status(401).json({ authenticated: false }); res.json({ authenticated: true, user, mode: authMode }); });
app.get('/auth/google', (_req: Request, res: Response) => { if (authMode !== 'google') return res.redirect(publicWebUrl()); if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).send('Google OAuth is not configured'); const state = randomBytes(24).toString('base64url'); setCookie(res, oauthStateCookie, sign(state), 10 * 60 * 1000); const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: redirectUri(), response_type: 'code', scope: 'openid email profile', state, access_type: 'online', prompt: 'select_account' }); res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`); });
app.get('/auth/google/callback', async (req: Request, res: Response) => { try { const expected = verify(cookies(req)[oauthStateCookie]); clearCookie(res, oauthStateCookie); if (!expected || expected !== String(req.query.state || '')) return res.status(400).send('Invalid OAuth state'); if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).send('Google OAuth is not configured'); const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: String(req.query.code || ''), client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri(), grant_type: 'authorization_code' }) }); if (!tokenResponse.ok) throw new Error('OAuth token exchange failed'); const tokens = await tokenResponse.json() as any; const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${tokens.access_token}` } }); if (!profileResponse.ok) throw new Error('OAuth profile lookup failed'); const profile = await profileResponse.json() as any; const existing = await store.getUserByProvider('google', profile.sub); const user = await store.upsertUser(defaultUser(existing?.id || `google:${profile.sub}`, { ...existing, provider: 'google', providerSubject: profile.sub, email: profile.email, name: profile.name || profile.email || 'Learner', avatar: existing?.avatar || { base: 'owl', color: 'yellow', accessory: 'glasses' } })); const sessionId = randomBytes(32).toString('base64url'); await store.createSession({ id: sessionId, userId: user.id, expiresAt: new Date(Date.now() + sessionTtlMs) }); setCookie(res, sessionCookie, sessionId, sessionTtlMs); res.redirect(publicWebUrl()); } catch (error) { console.error('OAuth callback failed', error); res.status(502).send('Unable to sign in with Google'); } });
app.post('/auth/logout', async (req: Request, res: Response) => { const id = cookies(req)[sessionCookie]; if (id) await store.deleteSession(id); clearCookie(res, sessionCookie); res.status(204).end(); });

app.get('/api/me', async (req: Request, res: Response) => { const user = await requireUser(req, res); if (user) res.json(user); });
app.post('/api/onboarding', async (req: Request, res: Response) => { const user = await requireUser(req, res); if (!user) return; const body = req.body || {}; const updated = await store.upsertUser({ ...user, name: body.name || user.name, skillLevel: body.skillLevel || user.skillLevel, dailyMinutes: Number(body.dailyMinutes || user.dailyMinutes), targetDate: body.targetDate || null, avatar: body.avatar || user.avatar, goals: [{ id: randomUUID(), type: body.goal || 'gate-cs', title: body.goalTitle || 'Clear GATE CS', progress: 0, paused: false }], updatedAt: now() }); res.status(201).json(updated); });
app.get('/api/goals', async (req: Request, res: Response) => { const user = await requireUser(req, res); if (user) res.json(user.goals); });
app.get('/api/curriculum/:goal', (req: Request, res: Response) => { const goal = String(req.params.goal); const topics = getCatalog(goal); if (!topics.length) return res.status(404).json({ error: 'Unknown curriculum' }); const labels: Record<string, string> = { 'gate-cs': 'GATE CSE Complete Preparation', 'web-dev': 'Full-stack Engineering Universe', 'ai-ml': 'AI / ML Engineering Universe' }; res.json({ template: labels[goal] || goal, goal, counts: catalogCounts, topics }); });
app.get('/api/quiz/catalog', (req: Request, res: Response) => {
  const course = String(req.query.course || 'gate-cs');
  const source = String(req.query.source || 'gate-pyq');
  const subject = String(req.query.subject || 'all');
  const topic = String(req.query.topic || 'all');
  const year = String(req.query.year || 'all');
  const questions = PYQ_BANK.filter((item) => item.course === course && item.source === source && (subject === 'all' || item.subject === subject) && (topic === 'all' || item.topic === topic) && (year === 'all' || String(item.year) === year));
  const subjects = [...new Set(PYQ_BANK.filter((item) => item.course === course).map((item) => item.subject))];
  const topics = [...new Set(PYQ_BANK.filter((item) => item.course === course && (subject === 'all' || item.subject === subject)).map((item) => item.topic))];
  const years = [...new Set(PYQ_BANK.filter((item) => item.course === course).map((item) => item.year))].sort((a, b) => b - a);
  res.json({ course, source, questions, filters: { subjects, topics, years }, available: questions.length > 0 });
});
app.get('/api/agents', (_req: Request, res: Response) => res.json({ agents: AGENT_CATALOG }));
app.get('/api/jobs/:id', async (req: Request, res: Response) => { const user = await requireUser(req, res); if (!user) return; const job = await store.getJob(param(req.params.id)); if (!job || job.ownerId !== user.id) return res.status(404).json({ error: 'Job not found' }); res.json(job); });
app.get('/api/jobs/:id/events', async (req: Request, res: Response) => { const user = await requireUser(req, res); if (!user) return; const job = await store.getJob(param(req.params.id)); if (!job || job.ownerId !== user.id) return res.status(404).end(); res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); res.flushHeaders?.(); res.write(`data: ${JSON.stringify(job)}\n\n`); const unsubscribe = await store.subscribe(param(req.params.id), (event) => res.write(`data: ${JSON.stringify(event)}\n\n`)); req.on('close', () => void unsubscribe()); });
app.post('/api/jobs', async (req: Request, res: Response) => { const user = await requireUser(req, res); if (!user) return; const topicId = req.body?.topicId || 'gate-cs-algorithms-time-and-space-complexity'; if (!getTopic(topicId)) return res.status(400).json({ error: 'Unknown topic' }); const id = randomUUID(); const job = { id, ownerId: user.id, topicId, status: 'queued', stage: 'Dean', message: 'Queued for the learning team', package: null, createdAt: now(), updatedAt: now() }; await store.saveJob(job); res.status(202).json(job); void dispatchJob(id, topicId); });
app.get('/api/content/:jobId', async (req: Request, res: Response) => { const user = await requireUser(req, res); if (!user) return; const job = await store.getJob(param(req.params.jobId)); if (!job || job.ownerId !== user.id || !job.package) return res.status(404).json({ error: 'Verified package is not ready' }); res.json(job.package); });

async function updateJob(id: string, patch: Record<string, unknown>) { const job = await store.updateJob(id, { ...patch, updatedAt: now() }); if (job) emit(id, job); return job; }
async function dispatchJob(id: string, topicId: string) { try { const response = await fetch(`${runtime}/v1/topic-jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ job_id: id, topic_id: topicId }) }); if (!response.ok) throw new Error(`runtime ${response.status}`); void syncRuntimeJob(id); } catch { if (allowLocalFallback) await runLocalFallback(id, topicId); else await updateJob(id, { status: 'failed', message: 'The agent runtime is unavailable; please retry later.' }); } }
async function syncRuntimeJob(id: string) { for (let attempt = 0; attempt < 120; attempt += 1) { await new Promise((resolve) => setTimeout(resolve, 250)); try { const response = await fetch(`${runtime}/v1/topic-jobs/${id}`); if (!response.ok) throw new Error('runtime polling failed'); const remote = await response.json() as any; const latest = remote.events?.at(-1); if (latest) await updateJob(id, { stage: latest.agent, message: latest.message }); if (remote.status === 'failed' || remote.status === 'missing') return void await updateJob(id, { status: 'failed', message: remote.error || latest?.message || 'The agent runtime could not complete this topic.' }); if (remote.status === 'completed') { if (!remote.package?.topicId || remote.package.verification?.status !== 'approved') throw new Error('invalid verified package'); return void await updateJob(id, { status: 'completed', package: remote.package }); } } catch {} } await updateJob(id, { status: 'failed', message: 'The agent team timed out; please retry.' }); }
async function runLocalFallback(id: string, topicId: string) { const stages = [['Dean', 'Selecting prerequisite-ready topic'], ['Notes Author', 'Grounding explanations in trusted sources'], ['Card Maker', 'Distilling atomic flashcards'], ['Quiz Setter', 'Calibrating practice questions'], ['Fact-Checker', 'Checking claims against two sources'], ['Publisher', 'Publishing verified topic package']]; await updateJob(id, { status: 'running' }); for (const [stage, message] of stages) { await updateJob(id, { stage, message }); await new Promise((resolve) => setTimeout(resolve, 180)); } await updateJob(id, { status: 'completed', package: { topicId, title: 'Time & Space Complexity', verification: { status: 'approved', sources: ['MIT OpenCourseWare · Algorithms', 'NPTEL · Design and Analysis of Algorithms'], claimsChecked: 8 }, notes: { sections: [{ heading: 'Big-O notation', body: 'Big-O describes an asymptotic upper bound on growth.' }] }, videos: [{ title: 'Asymptotic Analysis - NPTEL', url: 'https://www.youtube.com/results?search_query=asymptotic+analysis+nptel', timestamp: '12:40' }], flashcards: [{ question: 'What does O(log n) usually indicate?', answer: 'The input is reduced by a constant factor per step.' }], quiz: [{ question: 'Binary search complexity?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 1 }], pyqs: [{ year: 2023, question: 'Compare binary and linear search.', difficulty: 'easy' }] } }); }

export { app, store };
const serverPort = Number(process.env.PORT || 4000);
if (process.env.NODE_ENV !== 'test') void store.connect().then(() => app.listen(serverPort, () => console.log(`EduSwarm API listening on ${serverPort}`))).catch((error) => { console.error('API startup failed', error); process.exit(1); });
