/**
 * EduSwarm API — learning platform services.
 *
 * Sections:
 *  1. App setup, auth + sessions
 *  2. Curriculum, quiz catalog, agents, recommendations
 *  3. Topic jobs (agent runtime + local recovery) with SSE progress
 *  4. Learning content, progress, practice, adaptive engine, mistakes
 *  5. Intelligence: dashboard, search, study plans, SRS flashcards
 *  6. Mock exams, code lab, doubts, diagnostics, analytics, achievements
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createStore, StoredUser } from './store.js';
import { getCatalog, getTopic, catalogCounts, catalogs } from './curriculum.js';
import {
  QUESTION_BANK,
  filterQuestions,
  bankFilters,
  questionById,
  difficultyOf,
  stripAnswers,
} from './questionBank.js';
import {
  masteryForTopic,
  xpForAttempt,
  levelForXp,
  sm2Schedule,
  dateKey,
  streakInfo,
  gradeMock,
  seededShuffle,
  searchScore,
  achievementsFor,
  adaptiveRank,
  generateStudyPlan,
  type ProgressLike,
} from './intelligence.js';
import { runJavaScript, type RunCase } from './codeRunner.js';
import { CODE_CHALLENGES, challengeById, publicChallenges } from './challenges.js';
import { listRooms, createRoom, joinRoom, joinByInvite, rotateInvite, postMessage, roomMessages, roomSummaryFor, RoomAccessError } from './rooms.js';
import { buildInterview, evaluateAnswer, buildReport, type InterviewTrack } from './interview.js';
import { TRACK_META } from './interviewBank.js';
import { buildLocalPack, type PackDepth } from './localPack.js';
import { issueToken, verifyToken, issueLoginCode, redeemLoginCode, bearerFromHeader } from './auth.js';
import { buildSystemPrompt, localSpecialistReply, type AgentContext } from './agentBrain.js';
import { completeChat, llmConfigured, modelChain, type ChatMessage } from './llm.js';

// ------------------------------------------------------------------ setup

const app = express();
const store = createStore();
const bootAt = Date.now();
const metrics = { jobsCreated: 0, attemptsLogged: 0 };

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((o) => o.trim()).filter(Boolean),
);
const runtime = normalizeServiceUrl(process.env.AGENT_RUNTIME_URL || 'http://localhost:8000');
const authMode = process.env.AUTH_MODE || (process.env.NODE_ENV === 'production' ? 'google' : 'demo');
const allowLocalFallback =
  process.env.ALLOW_LOCAL_FALLBACK === 'true' ||
  (process.env.ALLOW_LOCAL_FALLBACK !== 'false' && process.env.NODE_ENV !== 'production');
const runtimeTimeoutMs = Math.max(3000, Number(process.env.AGENT_RUNTIME_TIMEOUT_MS || 10000));
const runtimeMaxWaitMs = Math.max(5000, Number(process.env.AGENT_RUNTIME_MAX_WAIT_MS || 600000));
const agentChatTimeoutMs = Math.max(10000, Number(process.env.AGENT_CHAT_TIMEOUT_MS || 300000));
const recoverWithLocalFallback = allowLocalFallback || process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || 'development-only-session-secret';
const sessionCookie = 'eduswarm_session';
const oauthStateCookie = 'eduswarm_oauth_state';
const sessionTtlMs = 1000 * 60 * 60 * 24 * 30;

const AGENT_CATALOG = [
  { id: 'socratic-tutor', name: 'Socratic Tutor', role: 'Concept guide', description: 'Asks the right next question instead of giving away the answer.', bestFor: 'Breaking through confusing concepts', icon: '◌' },
  { id: 'pyq-coach', name: 'PYQ Coach', role: 'Exam strategist', description: 'Turns missed GATE questions into patterns, shortcuts, and timed drills.', bestFor: 'GATE CSE preparation', icon: '⌁' },
  { id: 'doubt-solver', name: 'Doubt Solver', role: 'Concept debugger', description: 'Unsticks you on any question with hints first, then a full worked solution.', bestFor: 'Stuck on a problem right now', icon: '?' },
  { id: 'code-reviewer', name: 'Code Reviewer', role: 'Practice partner', description: 'Reviews your implementation for correctness, complexity, and edge cases.', bestFor: 'Full-stack and AI/ML projects', icon: '</>' },
  { id: 'mock-examiner', name: 'Mock Examiner', role: 'Test analyst', description: 'Designs timed drills and dissects your mock performance subject by subject.', bestFor: 'Exam temperament and speed', icon: '◷' },
  { id: 'revision-planner', name: 'Revision Planner', role: 'Study architect', description: 'Builds a realistic next-session plan from your confidence and weak topics.', bestFor: 'Keeping momentum over time', icon: '↗' },
  { id: 'career-mentor', name: 'Career Mentor', role: 'Pathfinder', description: 'Maps your skills to roles, projects, and interview readiness.', bestFor: 'Placements and direction', icon: '★' },
];

app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)), credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ------------------------------------------------------------ rate limiting

const buckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMITS: Array<[RegExp, number]> = [
  [/^\/api\/code\/run$/, 60],
  [/^\/api\/jobs$/, 60],
  [/^\/api\//, 1200],
];
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'test') return next();
  const rule = RATE_LIMITS.find(([pattern]) => pattern.test(req.path));
  if (!rule) return next();
  const [, perMinute] = rule;
  const identity = String(req.headers['x-demo-user'] || req.ip || 'anon');
  const key = `${identity}:${req.path}`;
  const nowMs = Date.now();
  const slot = buckets.get(key);
  if (!slot || slot.resetAt <= nowMs) {
    buckets.set(key, { count: 1, resetAt: nowMs + 60_000 });
    return next();
  }
  slot.count += 1;
  if (slot.count > perMinute) {
    res.status(429).json({ error: 'Too many requests — please slow down and retry.' });
    return;
  }
  next();
});

// ----------------------------------------------------------------- helpers

function normalizeServiceUrl(value: string) {
  const candidate = value.trim();
  return /^https?:\/\//i.test(candidate) ? candidate.replace(/\/$/, '') : `https://${candidate}`;
}
function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}
function cookieOptions(maxAge: number) {
  const isProd = process.env.NODE_ENV === 'production';
  return [
    `Max-Age=${Math.floor(maxAge / 1000)}`,
    'Path=/',
    'HttpOnly',
    isProd ? 'SameSite=None' : 'SameSite=Lax',
    ...(isProd ? ['Secure'] : []),
  ].join('; ');
}
function setCookie(res: Response, name: string, value: string, maxAge: number) {
  res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${cookieOptions(maxAge)}`);
}
function clearCookie(res: Response, name: string) { setCookie(res, name, '', 0); }
function cookies(req: Request) {
  return Object.fromEntries(
    (req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
      const index = part.indexOf('=');
      return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
    }),
  );
}
function sign(value: string) {
  return `${value}.${createHmac('sha256', sessionSecret).update(value).digest('base64url')}`;
}
function verify(value: string | undefined) {
  if (!value) return null;
  const [raw, signature] = value.split('.');
  if (!raw || !signature) return null;
  const expected = createHmac('sha256', sessionSecret).update(raw).digest('base64url');
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted) ? raw : null;
}
function redirectUri() {
  return process.env.OAUTH_REDIRECT_URI || `${process.env.PUBLIC_API_URL || 'http://localhost:4000'}/auth/google/callback`;
}
function publicWebUrl() {
  return process.env.WEB_URL || [...allowedOrigins][0] || 'http://localhost:5173';
}
function now() { return new Date().toISOString(); }
/** Shareable club invite link, rooted at the web app the learner is using. */
function inviteLink(req: Request, code: string): string {
  let origin = '';
  const referer = String(req.headers.referer || req.headers.origin || '');
  try { origin = referer ? new URL(referer).origin : ''; } catch { origin = ''; }
  const root = (origin || publicWebUrl()).replace(/\/$/, '');
  return `${root}/?invite=${encodeURIComponent(code)}`;
}
function defaultUser(id: string, overrides: Partial<StoredUser> = {}): StoredUser {
  return {
    id, name: 'Demo Learner', skillLevel: 'beginner', dailyMinutes: 60,
    avatar: { base: 'owl', color: 'yellow', accessory: 'glasses' },
    goals: [], createdAt: now(), updatedAt: now(), ...overrides,
  };
}

async function ready() { await store.connect(); }

/**
 * Resolve the learner for a request.
 *
 * Order: Bearer token → session cookie → demo header.
 * The Bearer path is what makes cross-origin deployments work: the web app is
 * served from a different domain than the API, so its session cookie is a
 * third-party cookie that Safari (ITP), Firefox and Chrome now block. Without
 * the token path a brand-new phone could sign in with Google, lose the cookie,
 * and bounce back to Google forever.
 */
async function userFor(req: Request) {
  const token = bearerFromHeader(req.headers.authorization) || sseToken(req);
  if (token) {
    const tokenUser = await store.getUser(verifyToken(token) || '');
    if (tokenUser) return tokenUser;
  }
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

/**
 * EventSource cannot send an Authorization header, so the job stream accepts
 * the same signed token as a query parameter. It is scoped to GET requests on
 * the stream route only, and the token is never logged.
 */
function sseToken(req: Request): string | null {
  if (req.method !== 'GET' || !/\/events$/.test(req.path)) return null;
  const value = req.query.token;
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' && raw.length > 8 ? raw : null;
}

async function requireUser(req: Request, res: Response) {
  const user = await userFor(req);
  if (!user) { res.status(401).json({ error: 'Authentication required' }); return null; }
  return user;
}
function emit(jobId: string, event: unknown) { void store.publish(jobId, event); }

async function logActivity(ownerId: string, kind: string, extra: Record<string, unknown> = {}) {
  try {
    const createdAt = now();
    await store.logActivity({ id: randomUUID(), ownerId, kind, date: createdAt.slice(0, 10), createdAt, ...extra });
  } catch { /* analytics must never break learning */ }
}

// ------------------------------------------------------- health + sessions

app.get('/health', (_req: Request, res: Response) =>
  res.json({ ok: true, service: 'eduswarm-api', version: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'local' }));

app.get('/ready', async (_req: Request, res: Response) => {
  try {
    await ready();
    const response = await fetch(`${runtime}/ready`);
    if (!response.ok) throw new Error('runtime unavailable');
    res.json({ ok: true, service: 'eduswarm-api', dependencies: { database: 'ready', redis: 'ready', runtime: 'ready' } });
  } catch {
    res.status(503).json({ ok: false, service: 'eduswarm-api' });
  }
});

app.get('/api/metrics', (_req: Request, res: Response) =>
  res.json({ ok: true, uptimeSec: Math.floor((Date.now() - bootAt) / 1000), ...metrics, timestamp: now() }));

app.get('/api/session', async (req: Request, res: Response) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user, mode: authMode });
});

app.get('/auth/google', (_req: Request, res: Response) => {
  if (authMode !== 'google') return res.redirect(publicWebUrl());
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).send('Google OAuth is not configured');
  const state = randomBytes(24).toString('base64url');
  setCookie(res, oauthStateCookie, sign(state), 10 * 60 * 1000);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: redirectUri(), response_type: 'code',
    scope: 'openid email profile', state, access_type: 'online', prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get('/auth/google/callback', async (req: Request, res: Response) => {
  try {
    const expected = verify(cookies(req)[oauthStateCookie]);
    clearCookie(res, oauthStateCookie);
    if (!expected || expected !== String(req.query.state || '')) return res.status(400).send('Invalid OAuth state');
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).send('Google OAuth is not configured');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(req.query.code || ''), client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri(), grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) throw new Error('OAuth token exchange failed');
    const tokens = (await tokenResponse.json()) as any;
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileResponse.ok) throw new Error('OAuth profile lookup failed');
    const profile = (await profileResponse.json()) as any;
    const existing = await store.getUserByProvider('google', profile.sub);
    const user = await store.upsertUser(defaultUser(existing?.id || `google:${profile.sub}`, {
      ...existing, provider: 'google', providerSubject: profile.sub, email: profile.email,
      name: profile.name || profile.email || 'Learner',
      avatar: existing?.avatar || { base: 'owl', color: 'yellow', accessory: 'glasses' },
    }));
    const sessionId = randomBytes(32).toString('base64url');
    await store.createSession({ id: sessionId, userId: user.id, expiresAt: new Date(Date.now() + sessionTtlMs) });
    setCookie(res, sessionCookie, sessionId, sessionTtlMs);
    // The cookie above is best-effort: on a different domain from the web app
    // browsers treat it as third-party and drop it. Hand the SPA a single-use
    // login code instead — it exchanges the code for a Bearer token, which is
    // what ends the "sign in with Google again" loop on new devices.
    const target = new URL(publicWebUrl());
    target.searchParams.set('loginCode', issueLoginCode(user.id));
    res.redirect(target.toString());
  } catch (error) {
    console.error('OAuth callback failed', error);
    res.status(502).send('Unable to sign in with Google');
  }
});

app.post('/auth/logout', async (req: Request, res: Response) => {
  const id = cookies(req)[sessionCookie];
  if (id) await store.deleteSession(id);
  clearCookie(res, sessionCookie);
  res.status(204).end();
});

/**
 * Exchange the single-use code from the OAuth redirect for a long-lived Bearer
 * token. This is the step the web app calls on arrival; without it a browser
 * that blocks third-party cookies has no way to hold a session.
 */
app.post('/api/auth/exchange', async (req: Request, res: Response) => {
  const userId = redeemLoginCode(String(req.body?.code || ''));
  if (!userId) return res.status(401).json({ error: 'This sign-in link was already used or has expired — please sign in again.' });
  const user = await store.getUser(userId);
  if (!user) return res.status(401).json({ error: 'Account not found — please sign in again.' });
  res.json({ token: issueToken(user.id), user });
});

/** Diagnostic for the web app: which auth path is live, and is the AI brain up? */
app.get('/api/auth/status', (_req: Request, res: Response) => {
  res.json({
    mode: authMode,
    tokenAuth: true,
    ai: {
      runtimeUrl: runtime,
      runtimeKeyConfigured: Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY),
      models: modelChain().slice(0, 4),
    },
  });
});

// ------------------------------------------------------------- me + goals

app.get('/api/me', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user) res.json(user);
});

app.patch('/api/me', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const body = req.body || {};
  const patch: Partial<StoredUser> = { updatedAt: now() };
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim().slice(0, 80);
  if (['beginner', 'intermediate', 'advanced'].includes(body.skillLevel)) patch.skillLevel = body.skillLevel;
  if (Number.isFinite(Number(body.dailyMinutes))) patch.dailyMinutes = Math.max(15, Math.min(240, Number(body.dailyMinutes)));
  if (body.targetDate === null || /^\d{4}-\d{2}-\d{2}$/.test(String(body.targetDate || ''))) patch.targetDate = body.targetDate || null;
  if (body.avatar && typeof body.avatar === 'object') patch.avatar = body.avatar;
  // Active learning universe: switching it must survive reloads and devices.
  const activeGoal = String(body.activeGoal || '');
  if (activeGoal) {
    if (!catalogs[activeGoal as keyof typeof catalogs]) {
      return res.status(400).json({ error: 'Unknown learning universe' });
    }
    patch.activeGoal = activeGoal;
    // Keep the goal list in sync so Profile and the switcher agree.
    const goals = [...user.goals];
    if (!goals.some((g) => g.type === activeGoal)) {
      goals.push({ id: randomUUID(), type: activeGoal, title: GOAL_TITLES[activeGoal], progress: 0, paused: false });
    }
    patch.goals = goals.map((g) => ({ ...g, paused: g.type === activeGoal ? false : g.paused }));
  }
  res.json(await store.upsertUser({ ...user, ...patch }));
});

app.post('/api/onboarding', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const body = req.body || {};
  const updated = await store.upsertUser({
    ...user,
    name: body.name || user.name,
    skillLevel: body.skillLevel || user.skillLevel,
    dailyMinutes: Number(body.dailyMinutes || user.dailyMinutes),
    targetDate: body.targetDate || null,
    avatar: body.avatar || user.avatar,
    goals: [{ id: randomUUID(), type: body.goal || 'gate-cs', title: body.goalTitle || 'Clear GATE CS', progress: 0, paused: false }],
    activeGoal: catalogs[String(body.goal || 'gate-cs') as keyof typeof catalogs] ? String(body.goal) : 'gate-cs',
    updatedAt: now(),
  });
  void logActivity(user.id, 'onboarding', {});
  res.status(201).json(updated);
});

app.get('/api/goals', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user) res.json(user.goals);
});

const GOAL_TITLES: Record<string, string> = {
  'gate-cs': 'Clear GATE CS', 'web-dev': 'Become job-ready full-stack', 'ai-ml': 'Ship real AI systems', other: 'Custom goal',
};

app.post('/api/goals', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const type = String(req.body?.type || '');
  if (!['gate-cs', 'web-dev', 'ai-ml', 'other'].includes(type)) {
    return res.status(400).json({ error: 'Unknown goal type' });
  }
  const goal = { id: randomUUID(), type, title: String(req.body?.title || GOAL_TITLES[type]), progress: 0, paused: false };
  await store.upsertUser({ ...user, goals: [...user.goals, goal], updatedAt: now() });
  res.status(201).json(goal);
});

app.patch('/api/goals/:id', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const id = param(req.params.id);
  const goals = user.goals.map((g) => {
    if (String(g.id) !== id) return g;
    const next = { ...g };
    if (typeof req.body?.title === 'string' && req.body.title.trim()) next.title = req.body.title.trim().slice(0, 120);
    if (Number.isFinite(Number(req.body?.progress))) next.progress = Math.max(0, Math.min(100, Number(req.body.progress)));
    if (typeof req.body?.paused === 'boolean') next.paused = req.body.paused;
    return next;
  });
  if (!user.goals.some((g) => String(g.id) === id)) return res.status(404).json({ error: 'Goal not found' });
  const updated = await store.upsertUser({ ...user, goals, updatedAt: now() });
  res.json(updated.goals.find((g) => String(g.id) === id));
});

app.delete('/api/goals/:id', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  await store.upsertUser({ ...user, goals: user.goals.filter((g) => String(g.id) !== param(req.params.id)), updatedAt: now() });
  res.status(204).end();
});

// --------------------------------------- curriculum, quiz, agents, videos

app.get('/api/curriculum/:goal', (req: Request, res: Response) => {
  const goal = String(req.params.goal);
  const topics = getCatalog(goal);
  if (!topics.length) return res.status(404).json({ error: 'Unknown curriculum' });
  const labels: Record<string, string> = {
    'gate-cs': 'GATE CSE Complete Preparation',
    'web-dev': 'Full-stack Engineering Universe',
    'ai-ml': 'AI / ML Engineering Universe',
  };
  res.json({ template: labels[goal] || goal, goal, counts: catalogCounts, topics });
});

app.get('/api/quiz/catalog', (req: Request, res: Response) => {
  const course = String(req.query.course || 'gate-cs');
  const source = String(req.query.source || (course === 'gate-cs' ? 'gate-pyq' : 'practice'));
  const subject = String(req.query.subject || 'all');
  const topic = String(req.query.topic || 'all');
  const year = String(req.query.year || 'all');
  const difficulty = String(req.query.difficulty || 'all');
  const questions = filterQuestions({ course, source, subject, topic, year, difficulty });
  const scoped = QUESTION_BANK.filter((item) => item.course === course && (source === 'all' || item.source === source));
  res.json({
    course, source, questions,
    filters: {
      subjects: [...new Set(scoped.map((item) => item.subject))].sort(),
      topics: [...new Set(scoped.filter((item) => subject === 'all' || item.subject === subject).map((item) => item.topic))].sort(),
      years: [...new Set(scoped.map((item) => item.year))].sort((a, b) => b - a),
      difficulties: ['easy', 'medium', 'hard'],
    },
    available: questions.length > 0,
  });
});

app.get('/api/agents', (_req: Request, res: Response) => res.json({ agents: AGENT_CATALOG }));

app.get('/api/recommendations/videos', (req: Request, res: Response) => {
  const topicId = String(req.query.topicId || '');
  const topic = getTopic(topicId);
  if (!topic) return res.status(404).json({ error: 'Unknown topic' });
  const query = encodeURIComponent(`${topic.title} tutorial`);
  res.json({
    topicId, topic: topic.title,
    recommendations: [
      { title: `${topic.title} — NPTEL lecture`, channel: 'NPTEL', kind: 'University lecture', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic.title} NPTEL lecture`)}` },
      { title: `${topic.title} — MIT OpenCourseWare`, channel: 'MIT OpenCourseWare', kind: 'Conceptual deep dive', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic.title} MIT OpenCourseWare`)}` },
      { title: `${topic.title} — practical walkthrough`, channel: 'freeCodeCamp / community', kind: 'Worked examples', url: `https://www.youtube.com/results?search_query=${query}` },
    ],
  });
});

// ------------------------------------------------- topic jobs + SSE stream

app.get('/api/jobs/:id', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const job = await store.getJob(param(req.params.id));
  if (!job || job.ownerId !== user.id) return res.status(404).json({ error: 'Job not found' });
  const age = Date.now() - new Date(job.updatedAt || job.createdAt).getTime();
  if (['queued', 'running'].includes(job.status) && age > 2 * 60 * 1000) {
    if (recoverWithLocalFallback) void runLocalFallback(job.id, job.topicId);
    else void dispatchJob(job.id, job.topicId);
  }
  res.json(job);
});

app.get('/api/jobs/:id/events', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const job = await store.getJob(param(req.params.id));
  if (!job || job.ownerId !== user.id) return res.status(404).end();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify(job)}\n\n`);
  const unsubscribe = await store.subscribe(param(req.params.id), (event) => res.write(`data: ${JSON.stringify(event)}\n\n`));
  req.on('close', () => void unsubscribe());
});

app.post('/api/jobs', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const topicId = req.body?.topicId || 'gate-cs-algorithms-time-and-space-complexity';
  if (!getTopic(topicId)) return res.status(400).json({ error: 'Unknown topic' });
  const depth = (['eli5', 'standard', 'deep'] as const).includes(req.body?.depth) ? req.body.depth : 'standard';
  const id = randomUUID();
  const job = {
    id, ownerId: user.id, topicId, depth, status: 'queued', stage: 'Dean',
    message: 'Queued for the learning team', package: null, createdAt: now(), updatedAt: now(),
  };
  await store.saveJob(job);
  metrics.jobsCreated += 1;
  res.status(202).json(job);
  void dispatchJob(id, topicId, depth);
});

app.get('/api/content/:jobId', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const job = await store.getJob(param(req.params.jobId));
  if (!job || job.ownerId !== user.id || !job.package) return res.status(404).json({ error: 'Verified package is not ready' });
  res.json(job.package);
});

// ------------------------------------ learning content, progress, practice

app.get('/api/learning/content', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user) res.json({ content: await store.listContent(user.id), progress: await store.listProgress(user.id) });
});

app.get('/api/learning/content/:topicId', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const content = await store.getContent(user.id, param(req.params.topicId));
  if (!content) return res.status(404).json({ error: 'No saved learning package' });
  res.json(content.package);
});

app.post('/api/learning/progress', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const topicId = String(req.body?.topicId || '');
  if (!getTopic(topicId)) return res.status(400).json({ error: 'Unknown topic' });
  const progress = await store.saveProgress({
    id: `${user.id}:${topicId}`, ownerId: user.id, topicId,
    completed: Boolean(req.body?.completed),
    solvedQuestions: Number(req.body?.solvedQuestions || 0),
    reviewedFlashcards: Number(req.body?.reviewedFlashcards || 0),
    updatedAt: now(),
  });
  res.json(progress);
});

app.post('/api/practice/attempts', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const topicId = String(req.body?.topicId || '');
  if (!getTopic(topicId)) return res.status(400).json({ error: 'Unknown topic' });
  const current = await store.getProgress(user.id, topicId);
  const questionId = String(req.body?.questionId || randomUUID());
  // Canonical correctness: the bank is the source of truth, never the browser.
  const canonical = questionById(questionId);
  const selectedAnswer = String(req.body?.selectedAnswer || '');
  const attempt = {
    id: randomUUID(),
    questionId,
    subject: String(canonical?.subject || req.body?.subject || 'General'),
    topic: String(canonical?.topic || req.body?.topic || getTopic(topicId)?.title || topicId),
    question: String(canonical?.question || req.body?.question || ''),
    selectedAnswer,
    correctAnswer: String(canonical ? canonical.options[canonical.answer] : req.body?.correctAnswer || ''),
    correct: Boolean(canonical ? selectedAnswer === canonical.options[canonical.answer] : req.body?.correct),
    solution: req.body?.solution || {
      approach: 'Identify the governing concept and its invariant.',
      stepByStep: [
        'Restate the question and list the given facts.',
        'Name the concept or invariant that constrains the answer.',
        'Eliminate choices that contradict the definition or edge cases.',
        'Verify the remaining choice with a small example.',
      ],
      whyItWorks: String(req.body?.explanation || 'The selected answer follows from the definition and its stated constraints.'),
      commonMistake: 'Choosing a familiar-looking option without checking the assumptions.',
    },
    answeredAt: now(),
  };
  const attempts = [...(current?.attempts || []).filter((item: any) => item.questionId !== attempt.questionId), attempt];
  const progress = await store.saveProgress({
    id: `${user.id}:${topicId}`, ownerId: user.id, topicId,
    completed: Boolean(req.body?.completed || current?.completed),
    solvedQuestions: attempts.length,
    reviewedFlashcards: Number(req.body?.reviewedFlashcards || current?.reviewedFlashcards || 0),
    attempts, updatedAt: now(),
  });
  metrics.attemptsLogged += 1;
  void logActivity(user.id, 'attempt', {
    topicId, questionId, correct: attempt.correct,
    xp: xpForAttempt(attempt.correct, difficultyOf(questionId)),
  });
  if (!attempt.correct) {
    await store.saveMistake({
      id: randomUUID(), ownerId: user.id, questionId: attempt.questionId, topicId,
      subject: attempt.subject, topic: attempt.topic, question: attempt.question,
      learnerAnswer: attempt.selectedAnswer, correctAnswer: attempt.correctAnswer,
      explanation: attempt.solution.whyItWorks, misconception: attempt.solution.commonMistake,
      createdAt: attempt.answeredAt,
    });
  }
  res.status(201).json({ attempt, progress });
});

app.get('/api/practice/attempts', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user) {
    const progress = await store.listProgress(user.id);
    res.json({ attempts: progress.flatMap((item: any) => item.attempts || []) });
  }
});

app.get('/api/practice/adaptive', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const course = String(req.query.course || 'gate-cs');
  const subject = String(req.query.subject || 'all');
  const topic = String(req.query.topic || 'all');
  const attempts = (await store.listProgress(user.id)).flatMap((item: any) => item.attempts || []);
  const candidates = filterQuestions({ course, source: 'all', subject, topic });
  if (!candidates.length) return res.json({ question: null, reason: 'No questions match these filters.' });
  const stats = new Map<string, { wrong: number; seen: number; recent: number }>();
  for (const attempt of attempts) {
    const stat = stats.get(attempt.questionId) || { wrong: 0, seen: 0, recent: 0 };
    stat.seen += 1;
    if (!attempt.correct) stat.wrong += 1;
    stat.recent = Math.max(stat.recent, new Date(attempt.answeredAt || 0).getTime());
    stats.set(attempt.questionId, stat);
  }
  const ranked = adaptiveRank(candidates, stats, user.skillLevel);
  const top = ranked[0];
  const topStat = stats.get(top.id);
  res.json({
    question: top,
    strategy: topStat && topStat.wrong > 0 ? 'repair-repeated-mistake' : 'build-recall',
    attempts: attempts.length,
  });
});

app.get('/api/mistakes', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user) res.json({ mistakes: await store.listMistakes(user.id) });
});

app.delete('/api/mistakes/:id', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user) {
    await store.deleteMistake(user.id, param(req.params.id));
    res.status(204).end();
  }
});

app.post('/api/mistakes/:id/repair', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const mistake = (await store.listMistakes(user.id)).find((item: any) => item.id === param(req.params.id));
  if (!mistake) return res.status(404).json({ error: 'Mistake not found' });
  res.json({
    title: `Repair lesson: ${mistake.topic}`,
    steps: [
      `Recall the concept behind ${mistake.topic} without looking at the answer.`,
      `Compare your answer with the governing definition: ${mistake.misconception || 'identify the assumption that failed.'}`,
      'Solve one smaller example, then retry the original pattern.',
    ],
    questionId: mistake.questionId, topic: mistake.topic,
  });
});

// ------------------------------------------------ specialist agent sessions

app.post('/api/agents/:agentId/sessions', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const agent = AGENT_CATALOG.find((item) => item.id === param(req.params.agentId));
  if (!agent) return res.status(404).json({ error: 'Unknown agent' });
  const goal = String(req.body?.goal || user.activeGoal || user.goals?.[0]?.type || 'gate-cs');
  const session = await store.saveAgentSession({
    id: randomUUID(), ownerId: user.id, agentId: agent.id, agent, goal, topicId: req.body?.topicId || null,
    messages: [{
      role: 'assistant', provider: 'system', model: 'eduswarm',
      text: `I am ${agent.name} — ${agent.role.toLowerCase()} for ${GOAL_TITLES[goal] || goal}. Paste the exact question, option list, or code you are stuck on and I will work it with you.`,
    }],
    createdAt: now(), updatedAt: now(),
  });
  res.status(201).json(session);
});

app.get('/api/agents/sessions', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user) res.json({ sessions: await store.listAgentSessions(user.id) });
});

app.post('/api/agents/sessions/:id/messages', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const session = await store.getAgentSession(user.id, param(req.params.id));
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const text = String(req.body?.text || '').trim().slice(0, 8000);
  if (!text) return res.status(400).json({ error: 'Message required' });

  const goal = String(session.goal || user.activeGoal || user.goals?.[0]?.type || 'gate-cs');
  const topic = session.topicId ? getTopic(String(session.topicId)) || null : null;
  const mistakes = await store.listMistakes(user.id).catch(() => [] as any[]);
  const weakTopics = [...new Set(mistakes.map((m: any) => String(m.topic || '')))].filter(Boolean);
  const context: AgentContext = {
    agentId: session.agentId,
    agentName: session.agent?.name || 'Specialist Tutor',
    agentRole: session.agent?.role || 'Learning specialist',
    learnerName: user.name,
    skillLevel: user.skillLevel,
    dailyMinutes: user.dailyMinutes,
    goal,
    goalTitle: GOAL_TITLES[goal] || goal,
    topic,
    weakTopics,
  };
  const system = buildSystemPrompt(context);
  const history = (session.messages || []).slice(-12);
  const failures: string[] = [];

  let reply = '';
  let provider = 'local';
  let model = 'curriculum-fallback';
  let note = '';

  // 1. Agent runtime — preferred: it adds Qdrant retrieval to the same prompt.
  try {
    const ai = await fetch(`${runtime}/v1/agent-chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        agent_id: context.agentId, agent_name: context.agentName, agent_role: context.agentRole,
        topic_id: session.topicId || null, topic_title: topic?.title || null, goal,
        system, messages: history.concat({ role: 'user', text }),
      }),
      signal: AbortSignal.timeout(Math.min(agentChatTimeoutMs, 120_000)),
    });
    if (ai.ok) {
      const data = (await ai.json()) as any;
      if (typeof data?.reply === 'string' && data.reply.trim().length > 40) {
        reply = data.reply.trim();
        provider = 'runtime';
        model = String(data.model || 'agent-runtime');
      } else failures.push('runtime returned an empty reply');
    } else {
      failures.push(`runtime HTTP ${ai.status}: ${(await ai.text().catch(() => '')).slice(0, 160)}`);
    }
  } catch (error: any) {
    failures.push(`runtime unreachable (${error?.message || error})`.slice(0, 200));
  }

  // 2. Direct LLM from the API — keeps the specialists real when the runtime is
  //    asleep, cold-starting, or misconfigured.
  if (!reply) {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: system },
        ...history.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: String(m.text || '') })),
        { role: 'user', content: text },
      ];
      const result = await completeChat(messages);
      reply = result.text;
      provider = 'openrouter';
      model = result.model;
    } catch (error: any) {
      failures.push(String(error?.message || error).slice(0, 240));
    }
  }

  // 3. Curriculum-grounded local answer — never the same paragraph twice.
  if (!reply) {
    reply = localSpecialistReply(context, text);
    provider = 'local';
    model = 'curriculum-fallback';
    note = failures[0] || 'The AI brain did not answer, so this came from your curriculum.';
    if (llmConfigured()) console.warn('[agents] fell back to local guidance:', failures.join(' | '));
  }

  session.messages = [
    ...(session.messages || []),
    { role: 'user', text },
    { role: 'assistant', text: reply, provider, model, note },
  ];
  session.updatedAt = now();
  const saved = await store.saveAgentSession(session);
  res.json({ ...saved, meta: { provider, model, note, failures: failures.slice(0, 3) } });
});

/** Live capability check so the UI can say whether the AI brain is answering. */
app.get('/api/agents/status', async (_req: Request, res: Response) => {
  let runtimeOk = false;
  let runtimeModel = '';
  try {
    const health = await fetch(`${runtime}/health`, { signal: AbortSignal.timeout(4000) });
    runtimeOk = health.ok;
    if (health.ok) runtimeModel = String(((await health.json()) as any)?.model || '');
  } catch { /* runtime is asleep or unconfigured */ }
  res.json({
    runtime: { online: runtimeOk, model: runtimeModel, url: runtime },
    directLlm: llmConfigured(),
    models: modelChain().slice(0, 4),
    answerPath: runtimeOk ? 'runtime' : llmConfigured() ? 'direct-llm' : 'curriculum-fallback',
  });
});

// ============================================================ INTELLIGENCE

type LearnerSnapshot = {
  progress: ProgressLike[];
  attempts: any[];
  mistakes: any[];
  reviews: any[];
  mocks: any[];
  activities: any[];
  content: any[];
};

async function snapshot(userId: string): Promise<LearnerSnapshot> {
  const [progress, mistakes, reviews, mocks, activities, content] = await Promise.all([
    store.listProgress(userId), store.listMistakes(userId), store.listReviews(userId),
    store.listMocks(userId), store.listActivities(userId, 500), store.listContent(userId),
  ]);
  return { progress: progress as ProgressLike[], attempts: progress.flatMap((p: any) => p.attempts || []), mistakes, reviews, mocks, activities, content };
}

function xpFromSnapshot(snap: LearnerSnapshot): number {
  let xp = 0;
  for (const attempt of snap.attempts) xp += xpForAttempt(Boolean(attempt.correct), difficultyOf(String(attempt.questionId || '')));
  for (const p of snap.progress) if (p.completed) xp += 40;
  xp += snap.reviews.length * 4;
  xp += snap.mocks.filter((m) => m.status === 'submitted').length * 30;
  xp += snap.activities.filter((a) => a.kind === 'code' && a.solved).length * 20;
  return xp;
}

function accuracyOf(attempts: any[]): number {
  if (!attempts.length) return 0;
  return Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100);
}

async function dueCards(userId: string, topicId: string | null, limit = 20) {
  const [reviews, content] = await Promise.all([store.listReviews(userId), store.listContent(userId)]);
  const nowMs = Date.now();
  const scoped = topicId ? reviews.filter((r) => r.topicId === topicId) : reviews;
  const due = scoped
    .filter((r) => new Date(r.nextDueAt).getTime() <= nowMs)
    .sort((a, b) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime())
    .map((r) => ({ cardKey: r.cardKey, topicId: r.topicId, question: r.question, answer: r.answer, fresh: false, efactor: r.efactor, intervalDays: r.intervalDays, repetitions: r.repetitions }));
  const scheduled = new Set(reviews.map((r) => r.cardKey));
  const fresh: any[] = [];
  for (const item of content) {
    if (topicId && item.topicId !== topicId) continue;
    for (const card of item.package?.flashcards || []) {
      const cardKey = `${item.topicId}:${card.question}`;
      if (!scheduled.has(cardKey)) {
        fresh.push({ cardKey, topicId: item.topicId, question: card.question, answer: card.answer, fresh: true });
      }
    }
  }
  return { due: [...due, ...fresh].slice(0, limit), dueCount: due.length, freshCount: fresh.length };
}

// ------------------------------------------------------------- dashboard

app.get('/api/dashboard', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const goal = String(req.query.goal || (user.goals[0] as any)?.type || 'gate-cs');
  const topics = getCatalog(goal);
  const snap = await snapshot(user.id);

  const masteryByTopic = new Map(topics.map((t) => [t.id, masteryForTopic(snap.progress.find((p) => p.topicId === t.id))]));
  const modules = [...new Set(topics.map((t) => t.module))].map((module) => {
    const group = topics.filter((t) => t.module === module);
    const scores = group.map((t) => masteryByTopic.get(t.id)?.score || 0);
    return {
      module,
      score: group.length ? Math.round(scores.reduce((a, b) => a + b, 0) / group.length) : 0,
      completed: group.filter((t) => masteryByTopic.get(t.id)?.completed).length,
      topics: group.length,
    };
  });

  const xp = xpFromSnapshot(snap);
  const activeDates = [
    ...snap.attempts.map((a) => dateKey(a.answeredAt || '')),
    ...snap.progress.map((p) => dateKey(p.updatedAt || '')),
    ...snap.activities.map((a) => a.date),
  ].filter(Boolean);
  const streak = streakInfo(activeDates);
  const { dueCount, freshCount } = await dueCards(user.id, null, 1);
  const totalDue = dueCount + freshCount;

  const nextNew = topics.find((t) => !snap.progress.some((p) => p.topicId === t.id && p.completed));
  const weakModule = [...modules].sort((a, b) => a.score - b.score).find((m) => m.score < 80);
  const nextActions: any[] = [];
  if (totalDue > 0) nextActions.push({ kind: 'review', icon: '▤', title: `Review ${totalDue} due card${totalDue === 1 ? '' : 's'}`, detail: 'Spaced repetition keeps recall sharp.', page: 'flashcards' });
  if (snap.mistakes.length > 0) nextActions.push({ kind: 'repair', icon: '!', title: `Repair ${snap.mistakes.length} mistake${snap.mistakes.length === 1 ? '' : 's'}`, detail: `Start with ${snap.mistakes[0].topic || 'your latest miss'}.`, page: 'mistakes' });
  if (nextNew) nextActions.push({ kind: 'learn', icon: '◈', title: `Continue: ${nextNew.title}`, detail: nextNew.module, page: 'lesson', topicId: nextNew.id });
  if (weakModule && snap.attempts.length > 0) nextActions.push({ kind: 'drill', icon: '✓', title: `Drill ${weakModule.module}`, detail: `Mastery ${weakModule.score}% — adaptive questions first.`, page: 'quiz' });
  if (snap.progress.filter((p) => p.completed).length >= 3) nextActions.push({ kind: 'mock', icon: '◷', title: 'Take a mini mock', detail: 'Timed, with GATE negative marking.', page: 'mocks' });
  if (!nextActions.length) nextActions.push({ kind: 'explore', icon: '▦', title: 'Explore the syllabus', detail: 'Pick any topic to generate your first kit.', page: 'syllabus' });

  const bySubject = new Map<string, { correct: number; total: number }>();
  for (const a of snap.attempts) {
    const key = a.subject || 'General';
    const entry = bySubject.get(key) || { correct: 0, total: 0 };
    entry.total += 1;
    if (a.correct) entry.correct += 1;
    bySubject.set(key, entry);
  }
  const weakSubject = [...bySubject.entries()].filter(([, v]) => v.total >= 3).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)[0];
  const insights: string[] = [];
  const completedCount = snap.progress.filter((p) => p.completed).length;
  insights.push(completedCount === 0
    ? 'Generate your first study kit to activate mastery tracking.'
    : `You have completed ${completedCount} of ${topics.length} tutorials in this universe.`);
  if (snap.attempts.length >= 5) {
    insights.push(`Practice accuracy is ${accuracyOf(snap.attempts)}% across ${snap.attempts.length} attempts.`);
    if (weakSubject) insights.push(`Weakest area with real volume: ${weakSubject[0]} (${Math.round((weakSubject[1].correct / weakSubject[1].total) * 100)}%).`);
  } else if (snap.attempts.length > 0) {
    insights.push('Answer a few more questions to unlock weak-area detection.');
  } else {
    insights.push('Attempt the PYQ lab once — adaptive picks improve with every answer.');
  }
  insights.push(streak.current >= 2
    ? `You are on a ${streak.current}-day streak. Protect it with a 15-minute review.`
    : 'Short daily sessions beat weekend marathons — consistency builds recall.');

  const week: any[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const dayAttempts = snap.attempts.filter((a) => dateKey(a.answeredAt || '') === date);
    week.push({
      date,
      attempts: dayAttempts.length,
      correct: dayAttempts.filter((a) => a.correct).length,
      xp: dayAttempts.reduce((n, a) => n + xpForAttempt(Boolean(a.correct), difficultyOf(String(a.questionId || ''))), 0),
    });
  }

  res.json({
    goal,
    xp,
    level: levelForXp(xp),
    streak,
    completedTopics: completedCount,
    totalTopics: topics.length,
    accuracy: accuracyOf(snap.attempts),
    totalAttempts: snap.attempts.length,
    dueReviews: totalDue,
    mistakes: snap.mistakes.length,
    mastery: modules,
    topicMastery: topics.map((t) => {
      const m = masteryByTopic.get(t.id);
      return { topicId: t.id, score: m ? m.score : 0, band: m ? m.band : 'nascent', attempts: m ? m.attempts : 0, accuracy: m ? m.accuracy : 0, completed: m ? m.completed : false };
    }),
    nextActions: nextActions.slice(0, 5),
    insights,
    week,
  });
});

// ---------------------------------------------------------------- search

app.get('/api/search', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ topics: [], questions: [], lessons: [] });
  const goal = String(req.query.goal || '');
  const goals = goal ? [goal] : ['gate-cs', 'web-dev', 'ai-ml'];
  const topics = goals
    .flatMap((g) => getCatalog(g).map((t) => ({ ...t, goal: g })))
    .map((t) => ({ ...t, _score: searchScore(q, `${t.title} ${t.module} ${t.description}`) }))
    .filter((t) => t._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8)
    .map(({ _score: _s, ...rest }) => rest);
  const courseFilter = goal === 'web-dev' ? 'web-dev' : goal === 'ai-ml' ? 'ai-ml' : goal === 'gate-cs' ? 'gate-cs' : '';
  const questions = QUESTION_BANK
    .filter((item) => !courseFilter || item.course === courseFilter)
    .map((item) => ({ ...item, _score: searchScore(q, `${item.question} ${item.subject} ${item.topic}`) + searchScore(q, item.subject) }))
    .filter((item) => item._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8)
    .map(({ answer: _a, explanation: _e, _score: _s, ...rest }) => rest);
  const content = await store.listContent(user.id);
  const lessons = content
    .map((item) => ({ topicId: item.topicId, title: item.package?.title || item.topicId, savedAt: item.savedAt, _score: searchScore(q, `${item.package?.title || ''} ${item.topicId}`) }))
    .filter((item) => item._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5)
    .map(({ _score: _s, ...rest }) => rest);
  res.json({ topics, questions, lessons });
});

// ------------------------------------------------------------ study plan

async function studyPlanFor(user: StoredUser, goal: string) {
  const topics = getCatalog(goal);
  const [progress, mistakes] = await Promise.all([store.listProgress(user.id), store.listMistakes(user.id)]);
  const mastery = new Map(topics.map((t) => [t.id, masteryForTopic(progress.find((p: any) => p.topicId === t.id))]));
  const completedIds = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.topicId));
  const { dueCount, freshCount } = await dueCards(user.id, null, 1);
  // Try the agent runtime for an LLM-crafted plan; fall back deterministically.
  try {
    const response = await fetch(`${runtime}/v1/study-plan`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        goal, daily_minutes: user.dailyMinutes, target_date: user.targetDate || null,
        weak_topics: mistakes.slice(0, 5).map((m: any) => m.topic),
        due_reviews: dueCount + freshCount,
        next_topic: topics.find((t) => !completedIds.has(t.id))?.title || null,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (response.ok) {
      const plan = await response.json();
      if (Array.isArray(plan.blocks) && plan.blocks.length) return { goal, date: dateKey(), provider: 'agent', ...plan };
    }
  } catch { /* deterministic plan below */ }
  return {
    goal, date: dateKey(), provider: 'planner',
    ...generateStudyPlan({
      topics, mastery, completedIds,
      mistakeTopics: [...new Set(mistakes.map((m: any) => String(m.topic || 'Mixed')))],
      dailyMinutes: user.dailyMinutes, dueReviews: dueCount + freshCount, targetDate: user.targetDate,
    }),
  };
}

app.get('/api/study-plan', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const goal = String(req.query.goal || (user.goals[0] as any)?.type || 'gate-cs');
  res.json(await studyPlanFor(user, goal));
});

app.post('/api/study-plan', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const goal = String(req.body?.goal || req.query.goal || (user.goals[0] as any)?.type || 'gate-cs');
  res.json(await studyPlanFor(user, goal));
});

// ------------------------------------------------------ SRS flashcard flow

app.get('/api/flashcards/due', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const topicId = req.query.topicId ? String(req.query.topicId) : null;
  if (topicId && !getTopic(topicId)) return res.status(400).json({ error: 'Unknown topic' });
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));
  const result = await dueCards(user.id, topicId, limit);
  res.json({ ...result, count: result.due.length });
});

app.post('/api/flashcards/review', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const { cardKey, topicId, question, answer, quality } = req.body || {};
  if (!cardKey || !topicId || !getTopic(String(topicId))) return res.status(400).json({ error: 'cardKey and a valid topicId are required' });
  const q = Math.max(0, Math.min(5, Number(quality ?? 4)));
  const existing = (await store.listReviews(user.id)).find((r) => r.cardKey === String(cardKey));
  const schedule = sm2Schedule(q, existing || {});
  const review = await store.saveReview({
    id: existing?.id || randomUUID(), ownerId: user.id,
    cardKey: String(cardKey), topicId: String(topicId),
    question: String(question || existing?.question || ''), answer: String(answer || existing?.answer || ''),
    efactor: schedule.efactor, intervalDays: schedule.intervalDays, repetitions: schedule.repetitions,
    nextDueAt: schedule.nextDueAt, lastQuality: q, updatedAt: now(),
  });
  const current = await store.getProgress(user.id, String(topicId));
  await store.saveProgress({
    id: `${user.id}:${topicId}`, ownerId: user.id, topicId: String(topicId),
    completed: Boolean(current?.completed), solvedQuestions: Number(current?.solvedQuestions || 0),
    reviewedFlashcards: Number(current?.reviewedFlashcards || 0) + 1,
    attempts: (current as any)?.attempts || [], updatedAt: now(),
  });
  void logActivity(user.id, 'review', { topicId: String(topicId), quality: q, xp: 4 });
  const remaining = await dueCards(user.id, null, 1);
  res.json({ review, dueRemaining: remaining.dueCount + remaining.freshCount });
});

// ------------------------------------------------------------- mock exams

function stripMock(mock: any) {
  return {
    id: mock.id, ownerId: mock.ownerId, course: mock.course, status: mock.status,
    config: mock.config, questions: stripAnswers(mock.questions || []),
    createdAt: mock.createdAt, startedAt: mock.startedAt, submittedAt: mock.submittedAt || null,
    result: mock.result || null,
  };
}

app.post('/api/mock-exams', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const course = String(req.body?.course || 'gate-cs');
  if (!['gate-cs', 'web-dev', 'ai-ml'].includes(course)) return res.status(400).json({ error: 'Unknown course' });
  const subject = String(req.body?.subject || 'all');
  const topic = String(req.body?.topic || 'all');
  let pool = filterQuestions({ course, source: 'all', subject, topic });
  if (pool.length < 3) pool = filterQuestions({ course, source: 'all' });
  const count = Math.max(3, Math.min(30, Number(req.body?.count || 10)));
  const id = randomUUID();
  const questions = seededShuffle(pool, id).slice(0, Math.min(count, pool.length));
  const minutes = Math.max(5, Math.min(180, Number(req.body?.minutes || questions.length * 2)));
  const mock = {
    id, ownerId: user.id, course, subject, topic, status: 'active',
    config: {
      count: questions.length, minutes,
      totalMarks: questions.reduce((n, q) => n + (q.marks || 1), 0),
      negative: 'One-third of marks per wrong answer (GATE scheme)',
    },
    questions, answers: {}, createdAt: now(), startedAt: now(),
  };
  await store.saveMock(mock);
  res.status(201).json(stripMock(mock));
});

app.get('/api/mock-exams', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const mocks = await store.listMocks(user.id);
  res.json({
    mocks: mocks.map((m: any) => ({
      id: m.id, course: m.course, status: m.status, totalQuestions: (m.questions || []).length,
      score: m.result?.score ?? null, maxMarks: m.config?.totalMarks ?? null,
      accuracy: m.result?.accuracy ?? null, createdAt: m.createdAt, submittedAt: m.submittedAt || null,
    })),
  });
});

app.get('/api/mock-exams/:id', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const mock = await store.getMock(param(req.params.id));
  if (!mock || mock.ownerId !== user.id) return res.status(404).json({ error: 'Mock exam not found' });
  if (mock.status !== 'submitted') return res.json(stripMock(mock));
  res.json({
    ...stripMock(mock),
    answers: mock.answers,
    review: (mock.questions || []).map((q: any) => {
      const row = (mock.result?.perQuestion || []).find((r: any) => r.id === q.id) || {};
      return { ...q, selected: row.selected ?? null, isCorrect: Boolean(row.isCorrect), delta: row.delta ?? 0 };
    }),
  });
});

app.post('/api/mock-exams/:id/submit', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const mock = await store.getMock(param(req.params.id));
  if (!mock || mock.ownerId !== user.id) return res.status(404).json({ error: 'Mock exam not found' });
  if (mock.status === 'submitted') return res.json({ result: mock.result, review: mock.questions });
  const answers = (req.body?.answers || {}) as Record<string, number | null>;
  const timeUsedSec = Math.max(0, Number(req.body?.timeUsedSec || 0));
  const grade = gradeMock(
    (mock.questions || []).map((q: any) => ({ id: q.id, answer: q.answer, marks: q.marks || 1 })),
    answers,
  );
  const pct = grade.maxMarks ? Math.round((Math.max(0, grade.score) / grade.maxMarks) * 100) : 0;
  const result = { ...grade, pct, timeUsedSec };
  await store.saveMock({ ...mock, status: 'submitted', answers, result, submittedAt: now(), updatedAt: now() });
  void logActivity(user.id, 'mock', { mockId: mock.id, score: grade.score, xp: 30 });
  // Wrong mock answers join the mistake notebook automatically.
  const existing = await store.listMistakes(user.id);
  const seen = new Set(existing.map((m: any) => m.questionId));
  for (const row of grade.perQuestion) {
    if (row.isCorrect || row.skipped || seen.has(row.id)) continue;
    const canonical = questionById(row.id);
    if (!canonical) continue;
    seen.add(row.id);
    await store.saveMistake({
      id: randomUUID(), ownerId: user.id, questionId: canonical.id, topicId: 'algo-complexity',
      subject: canonical.subject, topic: canonical.topic, question: canonical.question,
      learnerAnswer: row.selected === null ? '(skipped)' : canonical.options[row.selected] || '(invalid)',
      correctAnswer: canonical.options[canonical.answer],
      explanation: canonical.explanation, misconception: 'Recheck the governing definition under time pressure.',
      createdAt: now(), source: 'mock-exam',
    });
  }
  res.json({
    result,
    review: (mock.questions || []).map((q: any) => {
      const row = grade.perQuestion.find((r) => r.id === q.id) || {};
      return { ...q, selected: (row as any).selected ?? null, isCorrect: Boolean((row as any).isCorrect), delta: (row as any).delta ?? 0 };
    }),
  });
});

// ---------------------------------------------------------------- code lab

app.get('/api/code/challenges', (_req: Request, res: Response) => {
  res.json({ challenges: publicChallenges() });
});

app.post('/api/code/run', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const code = String(req.body?.code || '');
  const challengeId = req.body?.challengeId ? String(req.body.challengeId) : null;
  let cases: RunCase[];
  let challenge: any = null;
  if (challengeId) {
    challenge = challengeById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Unknown challenge' });
    cases = challenge.tests;
  } else if (Array.isArray(req.body?.tests)) {
    try {
      cases = (req.body.tests as any[]).slice(0, 10).map((t, i) => {
        if (!t || !Array.isArray(t.args) || !('expected' in t)) throw new Error(`Test ${i + 1} needs {args:[...], expected}`);
        return { args: t.args, expected: t.expected, label: t.label || `Case ${i + 1}` };
      });
      if (!cases.length) throw new Error('empty');
    } catch {
      return res.status(400).json({ error: 'Custom tests must look like [{args:[...], expected}] (max 10).' });
    }
  } else {
    return res.status(400).json({ error: 'challengeId or custom tests are required' });
  }
  const result = runJavaScript(code, cases);
  const solved = Boolean(result.ok && result.passed === result.total && result.total > 0);
  if (challengeId) void logActivity(user.id, 'code', { challengeId, passed: result.passed, total: result.total, solved, xp: solved ? 20 : 5 });
  res.json({ ...result, challengeId, solved });
});

app.post('/api/code/review', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const code = String(req.body?.code || '');
  if (code.trim().length < 10) return res.status(400).json({ error: 'Submit your solution code for review.' });
  const challenge = req.body?.challengeId ? challengeById(String(req.body.challengeId)) : null;
  try {
    const response = await fetch(`${runtime}/v1/evaluate-code`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        language: 'javascript', code: code.slice(0, 8000),
        problem: challenge ? `${challenge.title}: ${challenge.prompt}` : 'General JavaScript solution review',
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (response.ok) return res.json({ ...(await response.json()), provider: 'agent' });
  } catch { /* static review below */ }
  const findings: string[] = [];
  const strengths: string[] = [];
  if (!/function\s+solve/.test(code)) findings.push('Define solve(...) as a top-level function so the runner can invoke it.');
  else strengths.push('solve(...) is defined and invocable.');
  if (!/return\b/.test(code)) findings.push('No return statement found — every test path must return a value.');
  if (/\bfor\b|\bwhile\b|\.map\b|\.reduce\b/.test(code)) strengths.push('Uses iteration or higher-order traversal.');
  else findings.push('Consider whether the problem needs a loop or a direct formula.');
  if (code.length > 3000) findings.push('Long solution — extract a helper to keep solve(...) readable.');
  if (/console\.log/.test(code)) findings.push('Remove console.log before treating this as final.');
  if (/\[\]|\bnull\b|length\s*===?\s*0/.test(code)) strengths.push('Shows awareness of empty-input edge cases.');
  else findings.push('Add explicit handling for empty inputs.');
  const score = Math.max(20, Math.min(95, 55 + strengths.length * 12 - findings.length * 8));
  res.json({
    provider: 'local-static',
    verdict: score >= 75 ? 'Strong solution — polish edge cases.' : score >= 55 ? 'Working direction — tighten correctness.' : 'Needs rework — revisit the approach.',
    score, findings, strengths,
    complexity: 'Estimate time/space beside your loops and state whether the bound is worst-case.',
  });
});

// ------------------------------------------------------------------ doubts

app.post('/api/doubt', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const question = String(req.body?.question || '').trim();
  const topicId = req.body?.topicId ? String(req.body.topicId) : null;
  if (question.length < 3 || question.length > 2000) return res.status(400).json({ error: 'Ask a specific question (3–2000 characters).' });
  if (topicId && !getTopic(topicId)) return res.status(400).json({ error: 'Unknown topic' });
  const topic = topicId ? getTopic(topicId) : null;
  let lessonContext = String(req.body?.context || '');
  if (!lessonContext && topicId) {
    const saved = await store.getContent(user.id, topicId);
    lessonContext = (saved?.package?.notes?.sections || []).slice(0, 2).map((s: any) => `${s.heading}: ${String(s.body || '').slice(0, 400)}`).join('\n\n');
  }
  try {
    const response = await fetch(`${runtime}/v1/doubt-solve`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic_id: topicId, messages: [{ role: 'user', content: question }], lesson_context: lessonContext.slice(0, 4000) }),
      signal: AbortSignal.timeout(60000),
    });
    if (response.ok) {
      const data = await response.json();
      return res.json({ answer: data.reply, provider: 'agent', topicId, related: [] });
    }
  } catch { /* direct model below */ }

  // Direct model when the runtime is unavailable — doubts deserve a real answer.
  try {
    const doubtContext: AgentContext = {
      agentId: 'doubt-solver', agentName: 'Doubt Solver', agentRole: 'Concept debugger',
      learnerName: user.name, skillLevel: user.skillLevel,
      goal: String(user.activeGoal || user.goals?.[0]?.type || 'gate-cs'),
      goalTitle: GOAL_TITLES[String(user.activeGoal || user.goals?.[0]?.type || 'gate-cs')] || 'your syllabus',
      topic,
    };
    const system = `${buildSystemPrompt(doubtContext)}${lessonContext ? `\n\nLesson context:\n${lessonContext.slice(0, 3000)}` : ''}`;
    const result = await completeChat([{ role: 'system', content: system }, { role: 'user', content: question }]);
    return res.json({ answer: result.text, provider: 'direct-model', model: result.model, topicId, related: [] });
  } catch { /* curriculum guide below */ }

  const related = QUESTION_BANK
    .map((item) => ({ ...item, _score: searchScore(question, `${item.question} ${item.subject} ${item.topic}`) + (topic ? searchScore(topic.title, `${item.subject} ${item.topic}`) : 0) }))
    .filter((item) => item._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 3)
    .map(({ answer: _a, _score: _s, ...rest }) => rest);
  const doubtFallback = localSpecialistReply({
    agentId: 'doubt-solver', agentName: 'Doubt Solver', agentRole: 'Concept debugger',
    learnerName: user.name, skillLevel: user.skillLevel,
    goal: String(user.activeGoal || user.goals?.[0]?.type || 'gate-cs'),
    goalTitle: GOAL_TITLES[String(user.activeGoal || user.goals?.[0]?.type || 'gate-cs')] || 'your syllabus',
    topic,
  }, question);
  const answer = related.length
    ? `${doubtFallback}\n\nRelated solved patterns in your bank: ${related.map((r) => `“${r.question.slice(0, 60)}…”`).join(' ')}`
    : doubtFallback;
  res.json({ answer, provider: 'local-guide', topicId, related });
});

// --------------------------------------------------------------- diagnostic

const DIAGNOSTIC_IDS = [
  'gate-cse-2024-apt-train', 'gate-cse-2024-cn-tcp', 'gate-cse-2023-os-scheduling',
  'gate-cse-2022-db-normalization', 'gate-cse-2023-algo-knapsack',
];

app.get('/api/diagnostic', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const questions = DIAGNOSTIC_IDS.map((id) => questionById(id)).filter(Boolean) as any[];
  const pool = questions.length === 5 ? questions : filterQuestions({ course: 'gate-cs', source: 'all' }).slice(0, 5);
  res.json({ questions: stripAnswers(pool), total: pool.length });
});

app.post('/api/diagnostic', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  const breakdown = answers.slice(0, 10).map((a: any) => {
    const canonical = questionById(String(a.questionId || ''));
    if (!canonical) return null;
    const selected = Number(a.selected);
    return {
      questionId: canonical.id, correct: selected === canonical.answer,
      correctAnswer: canonical.options[canonical.answer], explanation: canonical.explanation,
    };
  }).filter(Boolean);
  const score = breakdown.filter((b: any) => b.correct).length;
  const recommendedLevel = score <= 1 ? 'beginner' : score <= 3 ? 'intermediate' : 'advanced';
  await store.upsertUser({ ...user, skillLevel: recommendedLevel, updatedAt: now() });
  void logActivity(user.id, 'diagnostic', { score, total: breakdown.length });
  res.json({ score, total: breakdown.length, recommendedLevel, breakdown });
});

// ---------------------------------------------------------------- analytics

app.get('/api/analytics/weekly', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const snap = await snapshot(user.id);
  const days: any[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const dayAttempts = snap.attempts.filter((a) => dateKey(a.answeredAt || '') === date);
    const reviews = snap.reviews.filter((r) => dateKey(r.updatedAt || '') === date).length;
    days.push({
      date,
      label: new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      attempts: dayAttempts.length,
      correct: dayAttempts.filter((a) => a.correct).length,
      xp: dayAttempts.reduce((n, a) => n + xpForAttempt(Boolean(a.correct), difficultyOf(String(a.questionId || ''))), 0) + reviews * 4,
      reviews,
    });
  }
  const totals = {
    attempts: snap.attempts.length,
    accuracy: accuracyOf(snap.attempts),
    xp: xpFromSnapshot(snap),
    activeDays: streakInfo(snap.attempts.map((a) => dateKey(a.answeredAt || ''))).activeDays,
    reviews: snap.reviews.length,
    mocks: snap.mocks.filter((m) => m.status === 'submitted').length,
  };
  res.json({ days, totals });
});

// -------------------------------------------------------------- achievements

app.get('/api/achievements', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const snap = await snapshot(user.id);
  const ordered = [...snap.attempts].sort((a, b) => String(a.answeredAt).localeCompare(String(b.answeredAt)));
  const seenWrong = new Set<string>();
  let comebacks = 0;
  for (const attempt of ordered) {
    const key = String(attempt.questionId || attempt.id);
    if (!attempt.correct) seenWrong.add(key);
    else if (seenWrong.has(key)) { comebacks += 1; seenWrong.delete(key); }
  }
  const submitted = snap.mocks.filter((m) => m.status === 'submitted');
  const xp = xpFromSnapshot(snap);
  const achievements = achievementsFor({
    completedTopics: snap.progress.filter((p) => p.completed).length,
    totalAttempts: snap.attempts.length,
    accuracy: accuracyOf(snap.attempts),
    reviews: snap.reviews.length,
    mocksSubmitted: submitted.length,
    bestMockPct: submitted.reduce((best, m) => Math.max(best, Number(m.result?.pct || 0)), 0),
    challengesSolved: snap.activities.filter((a) => a.kind === 'code' && a.solved).length,
    comebacks,
    streak: streakInfo(snap.attempts.map((a) => dateKey(a.answeredAt || ''))).current,
  });
  res.json({ achievements, unlocked: achievements.filter((a) => a.unlocked).length, total: achievements.length, xp, level: levelForXp(xp) });
});

// ----------------------------------------------- universes, lesson nav, daily

app.get('/api/universes', (_req: Request, res: Response) => {
  const universes = Object.entries(catalogs).map(([goal, topics]) => ({
    goal,
    title: { 'gate-cs': 'GATE CSE', 'web-dev': 'Full-stack Engineering', 'ai-ml': 'AI / ML Engineering' }[goal] || goal,
    topics: topics.length,
    modules: new Set(topics.map((t) => t.module)).size,
  }));
  res.json({ universes });
});

app.get('/api/lesson/:goal/:topicId/nav', (req: Request, res: Response) => {
  const topics = getCatalog(param(req.params.goal));
  const index = topics.findIndex((t) => t.id === param(req.params.topicId));
  if (index < 0) return res.status(404).json({ error: 'Unknown topic' });
  res.json({
    index,
    prev: index > 0 ? { topicId: topics[index - 1].id, title: topics[index - 1].title } : null,
    next: index < topics.length - 1 ? { topicId: topics[index + 1].id, title: topics[index + 1].title } : null,
  });
});

function topicIdForQuestion(goal: string, topicTitle: string): string {
  const catalog = getCatalog(goal);
  const needle = topicTitle.toLowerCase();
  const match = catalog.find((t) => {
    const title = t.title.toLowerCase();
    return title === needle || title.includes(needle) || needle.includes(title.split(' ')[0]);
  });
  return (match || catalog[0])?.id || `${goal}-fallback`;
}

app.get('/api/challenge/daily', (req: Request, res: Response) => {
  const goal = String(req.query.goal || 'gate-cs');
  const seed = `${goal}:${dateKey()}`;
  const pool = filterQuestions({ course: goal });
  const question = seededShuffle(pool, `${seed}:question`)[0];
  const code = seededShuffle(CODE_CHALLENGES, `${seed}:code`)[0];
  if (!question || !code) return res.status(404).json({ error: 'No daily challenge available for this goal.' });
  res.json({
    date: dateKey(),
    topicId: topicIdForQuestion(goal, question.topic),
    question: stripAnswers([question])[0],
    code: { id: code.id, title: code.title, difficulty: code.difficulty },
  });
});

// -------------------------------------------------------------------- notes

app.get('/api/notes/:topicId', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const note = await store.getNote(user.id, param(req.params.topicId));
  if (!note) return res.status(404).json({ error: 'No notes for this topic yet' });
  res.json({ text: note.text, updatedAt: note.updatedAt });
});

app.put('/api/notes/:topicId', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const topicId = param(req.params.topicId);
  const text = String(req.body?.text || '').slice(0, 20_000);
  const note = await store.saveNote({ id: `${user.id}:${topicId}`, ownerId: user.id, topicId, text, updatedAt: now() });
  res.json({ text: note.text, updatedAt: note.updatedAt });
});

// --------------------------------------------------------------- study rooms

// Clubs: three public halls ship with the product; anything a learner creates
// is private and only reachable through its invite link.
app.get('/api/rooms', async (req: Request, res: Response) => {
  const user = await userFor(req);
  res.json({ rooms: listRooms(user?.id || null) });
});

app.post('/api/rooms', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Club name is required' });
  try {
    const room = createRoom(
      name, String(req.body?.goal || 'gate-cs'), String(req.body?.topic || ''),
      user.id, user.name || 'Learner', { isPrivate: req.body?.isPrivate !== false },
    );
    res.status(201).json({
      id: room.id, name: room.name, goal: room.goal, topic: room.topic,
      ownerId: room.ownerId, ownerName: room.ownerName, isPrivate: room.isPrivate,
      inviteCode: room.inviteCode, createdAt: room.createdAt,
    });
  } catch (error: any) {
    res.status(429).json({ error: error?.message || 'Could not create club' });
  }
});

/** Owner-only: rotate the invite link (the old link stops working). */
app.post('/api/rooms/:id/invite', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const inviteCode = rotateInvite(param(req.params.id), user.id);
    res.json({ inviteCode, link: inviteLink(req, inviteCode) });
  } catch (error: any) {
    res.status(error instanceof RoomAccessError ? 403 : 404).json({ error: error?.message || 'Club not found' });
  }
});

/** Redeem an invite link. */
app.post('/api/rooms/join-by-invite', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const code = String(req.body?.code || '').trim();
  if (!code) return res.status(400).json({ error: 'Invite code is required' });
  try {
    const room = joinByInvite(code, user.id, user.name || 'Learner');
    res.json(roomSummaryFor(room.id, user.id));
  } catch (error: any) {
    res.status(error instanceof RoomAccessError ? 404 : 400).json({ error: error?.message || 'Invite link is not valid' });
  }
});

app.post('/api/rooms/:id/join', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const members = joinRoom(param(req.params.id), user.id, user.name || 'Learner', String(req.body?.inviteCode || ''));
    res.json({ members });
  } catch (error: any) {
    res.status(error instanceof RoomAccessError ? 403 : 404).json({ error: error?.message || 'Club not found' });
  }
});

app.post('/api/rooms/:id/messages', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const message = postMessage(param(req.params.id), user.id, user.name || 'Learner', String(req.body?.text || ''), req.body?.share || null);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(error instanceof RoomAccessError ? 403 : 400).json({ error: error?.message || 'Could not post message' });
  }
});

app.get('/api/rooms/:id/messages', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const since = Number(String(req.query.since || 0));
    res.json(roomMessages(param(req.params.id), user.id, Number.isFinite(since) ? since : 0));
  } catch (error: any) {
    res.status(error instanceof RoomAccessError ? 403 : 404).json({ error: error?.message || 'Club not found' });
  }
});

// ------------------------------------------------------------ interview sim

app.get('/api/interviews/meta', (_req: Request, res: Response) => {
  const tracks = (Object.keys(TRACK_META) as InterviewTrack[]).map((track) => ({
    track, title: TRACK_META[track].title, rounds: TRACK_META[track].rounds,
  }));
  res.json({ tracks });
});

const interviewSessions = new Map<string, { track: InterviewTrack; interviewId: string; evals: Array<ReturnType<typeof evaluateAnswer>> }>();

app.post('/api/interviews', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const track = String(req.body?.track || '') as InterviewTrack;
  if (!(track in TRACK_META)) return res.status(400).json({ error: 'Unknown interview track' });
  const interviewId = randomUUID();
  const flow = buildInterview(track, interviewId);
  interviewSessions.set(interviewId, { track, interviewId, evals: [] });
  void logActivity(user.id, 'interview', { track, interviewId });
  res.status(201).json(flow);
});

app.post('/api/interviews/:id/answer', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const session = interviewSessions.get(param(req.params.id));
  if (!session) return res.status(404).json({ error: 'Interview not found' });
  try {
    const evaluation = evaluateAnswer(session.track, session.interviewId, String(req.body?.itemId || ''), {
      selected: req.body?.selected, explanation: req.body?.explanation, code: req.body?.code, answerText: req.body?.answerText,
    });
    session.evals.push(evaluation);
    res.json({ evaluation });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Could not evaluate answer' });
  }
});

app.post('/api/interviews/:id/complete', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const session = interviewSessions.get(param(req.params.id));
  if (!session) return res.status(404).json({ error: 'Interview not found' });
  const report = buildReport(session.track, session.interviewId, session.evals);
  res.json(report);
});

// ================================================== runtime job orchestration

async function updateJob(id: string, patch: Record<string, unknown>) {
  const job = await store.updateJob(id, { ...patch, updatedAt: now() });
  if (job) emit(id, job);
  return job;
}

async function dispatchJob(id: string, topicId: string, depth: string = 'standard') {
  try {
    const job = await store.getJob(id);
    const learner = await store.getUser(job?.ownerId || '');
    const response = await fetch(`${runtime}/v1/topic-jobs`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        job_id: id, topic_id: topicId, depth,
        learner_level: learner?.skillLevel || 'beginner',
        daily_minutes: learner?.dailyMinutes || 60,
      }),
      signal: AbortSignal.timeout(runtimeTimeoutMs),
    });
    if (!response.ok) throw new Error(`runtime ${response.status}`);
    void syncRuntimeJob(id);
  } catch {
    if (recoverWithLocalFallback) await runLocalFallback(id, (await store.getJob(id))?.topicId || 'algo-complexity');
    else await updateJob(id, { status: 'failed', message: 'The agent runtime is unavailable; please retry later.' });
  }
}

async function syncRuntimeJob(id: string) {
  for (let attempt = 0; attempt < Math.ceil(runtimeMaxWaitMs / 1000); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const response = await fetch(`${runtime}/v1/topic-jobs/${id}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('runtime polling failed');
      const remote = (await response.json()) as any;
      const latest = remote.events?.at(-1);
      if (latest) await updateJob(id, { stage: latest.agent, message: latest.message });
      if (remote.status === 'failed' || remote.status === 'missing') {
        if (recoverWithLocalFallback) return void (await runLocalFallback(id, (await store.getJob(id))?.topicId || 'algo-complexity'));
        return void (await updateJob(id, { status: 'failed', message: remote.error || latest?.message || 'The agent runtime could not complete this topic.' }));
      }
      if (remote.status === 'completed') {
        const current = await store.getJob(id);
        if (current?.status === 'completed') return;
        if (!remote.package?.topicId || remote.package.verification?.status !== 'approved') throw new Error('invalid verified package');
        const completed = await updateJob(id, { status: 'completed', package: remote.package });
        if (completed) {
          await store.saveContent({ id: completed.id, ownerId: completed.ownerId, topicId: completed.topicId, package: remote.package, savedAt: now() });
          await store.saveProgress({
            id: `${completed.ownerId}:${completed.topicId}`, ownerId: completed.ownerId, topicId: completed.topicId,
            completed: true, solvedQuestions: 0, reviewedFlashcards: 0, updatedAt: now(),
          });
          void logActivity(completed.ownerId, 'lesson', { topicId: completed.topicId, xp: 40 });
        }
        return;
      }
    } catch { /* keep polling until the deadline */ }
  }
  if (recoverWithLocalFallback) return void (await runLocalFallback(id, (await store.getJob(id))?.topicId || 'algo-complexity'));
  await updateJob(id, { status: 'failed', message: 'The agent team timed out; please retry.' });
}

async function runLocalFallback(id: string, topicId: string) {
  const job = await store.getJob(id);
  const rawDepth = job?.depth;
  const depth = (['eli5', 'standard', 'deep'] as const).includes(rawDepth) ? rawDepth as PackDepth : 'standard';
  const topic = getTopic(topicId) || {
    title: topicId.replace(/^(gate-cs|web-dev|ai-ml)-/, '').replaceAll('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    description: 'A complete tutorial with definitions, examples, edge cases, and practice.',
    module: 'Self-study',
  };
  const stages = [
    ['Dean', 'Selecting topic'], ['Researcher', 'Grounding sources'], ['Notes Author', 'Writing detailed notes'],
    ['Practice Team', 'Creating recall practice'], ['Fact-Checker', 'Checking claims'], ['Publisher', 'Saving your study kit'],
  ];
  await updateJob(id, { status: 'running' });
  for (const [stage, message] of stages) {
    await updateJob(id, { stage, message });
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  const packageData = buildLocalPack(topicId, topic, depth);
  const completed = await updateJob(id, { status: 'completed', package: packageData });
  if (completed) {
    await store.saveContent({ id: completed.id, ownerId: completed.ownerId, topicId, package: packageData, savedAt: now() });
    await store.saveProgress({
      id: `${completed.ownerId}:${topicId}`, ownerId: completed.ownerId, topicId,
      completed: true, solvedQuestions: 0, reviewedFlashcards: 0, updatedAt: now(),
    });
    void logActivity(completed.ownerId, 'lesson', { topicId, xp: 40 });
  }
}

export { app, store };

const serverPort = Number(process.env.PORT || 4000);
if (process.env.NODE_ENV !== 'test') {
  void store.connect()
    .then(() => app.listen(serverPort, () => console.log(`EduSwarm API listening on ${serverPort}`)))
    .catch((error) => { console.error('API startup failed', error); process.exit(1); });
}
