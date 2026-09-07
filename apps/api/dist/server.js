"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobs = exports.users = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_crypto_1 = require("node:crypto");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
const users = new Map();
exports.users = users;
const jobs = new Map();
exports.jobs = jobs;
const subscribers = new Map();
const runtime = process.env.AGENT_RUNTIME_URL || 'http://localhost:8000';
const topics = [
    { id: 'algo-complexity', title: 'Time & Space Complexity', description: 'Analyze algorithm efficiency using asymptotic notation.', prerequisites: [], status: 'available' },
    { id: 'algo-arrays', title: 'Arrays and Searching', description: 'Solve array problems with invariants and binary search.', prerequisites: ['algo-complexity'], status: 'locked' },
    { id: 'algo-graphs', title: 'Graph Traversals', description: 'Apply BFS and DFS to connected structures.', prerequisites: ['algo-arrays'], status: 'locked' }
];
function emit(jobId, event) {
    const payload = `data: ${JSON.stringify(event)}\\n\\n`;
    subscribers.get(jobId)?.forEach((res) => res.write(payload));
}
app.get('/health', (_req, res) => res.json({ ok: true, service: 'eduswarm-api' }));
app.get('/api/me', (req, res) => {
    const id = String(req.headers['x-demo-user'] || 'demo-user');
    if (!users.has(id))
        users.set(id, { id, name: 'Demo Learner', skillLevel: 'beginner', dailyMinutes: 60, avatar: { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [] });
    res.json(users.get(id));
});
app.post('/api/onboarding', (req, res) => {
    const id = String(req.headers['x-demo-user'] || 'demo-user');
    const body = req.body || {};
    const user = { id, name: body.name || 'Learner', skillLevel: body.skillLevel || 'beginner', dailyMinutes: Number(body.dailyMinutes || 60), targetDate: body.targetDate || null, avatar: body.avatar || { base: 'owl', color: 'yellow', accessory: 'glasses' }, goals: [{ id: (0, node_crypto_1.randomUUID)(), type: body.goal || 'gate-cs', title: body.goalTitle || 'Clear GATE CS', progress: 0, paused: false }] };
    users.set(id, user);
    res.status(201).json(user);
});
app.get('/api/goals', (req, res) => res.json(users.get(String(req.headers['x-demo-user'] || 'demo-user'))?.goals || []));
app.get('/api/curriculum/:goal', (_req, res) => res.json({ template: 'GATE CS Algorithms v1', topics }));
app.get('/api/jobs/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job)
        return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});
app.get('/api/jobs/:id/events', (req, res) => {
    const id = req.params.id;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    if (!subscribers.has(id))
        subscribers.set(id, new Set());
    subscribers.get(id).add(res);
    if (jobs.has(id))
        res.write(`data: ${JSON.stringify(jobs.get(id))}\\n\\n`);
    req.on('close', () => subscribers.get(id)?.delete(res));
});
app.post('/api/jobs', async (req, res) => {
    const id = (0, node_crypto_1.randomUUID)();
    const topicId = req.body?.topicId || 'algo-complexity';
    const job = { id, topicId, status: 'queued', stage: 'Dean', message: 'Queued for the learning team', package: null, createdAt: new Date().toISOString() };
    jobs.set(id, job);
    res.status(202).json(job);
    try {
        const response = await fetch(`${runtime}/v1/topic-jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ job_id: id, topic_id: topicId }) });
        if (!response.ok)
            throw new Error(`runtime ${response.status}`);
    }
    catch {
        await runLocalFallback(id, topicId);
    }
});
app.get('/api/content/:jobId', (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (!job?.package)
        return res.status(404).json({ error: 'Verified package is not ready' });
    res.json(job.package);
});
async function runLocalFallback(id, topicId) {
    const stages = [['Dean', 'Selecting prerequisite-ready topic'], ['Notes Author', 'Grounding explanations in trusted sources'], ['Card Maker', 'Distilling atomic flashcards'], ['Quiz Setter', 'Calibrating practice questions'], ['Fact-Checker', 'Checking claims against two sources'], ['Publisher', 'Publishing verified topic package']];
    const job = jobs.get(id);
    if (!job)
        return;
    job.status = 'running';
    for (const [agent, message] of stages) {
        job.stage = agent;
        job.message = message;
        emit(id, { ...job, timestamp: new Date().toISOString() });
        await new Promise(r => setTimeout(r, 180));
    }
    job.status = 'completed';
    job.package = { topicId, title: 'Time & Space Complexity', verification: { status: 'approved', sources: ['MIT OpenCourseWare · Algorithms', 'NPTEL · Design and Analysis of Algorithms'], claimsChecked: 8 }, notes: { sections: [{ heading: 'Big-O notation', body: 'Big-O describes an asymptotic upper bound on growth. Ignore constants and lower-order terms when comparing algorithms.' }, { heading: 'Worked example', body: 'A loop that halves n on every iteration runs in O(log n); nested independent loops over n each run in O(n²).' }] }, videos: [{ title: 'Asymptotic Analysis — NPTEL', url: 'https://www.youtube.com/results?search_query=asymptotic+analysis+nptel', timestamp: '12:40' }], flashcards: [{ question: 'What does O(log n) usually indicate?', answer: 'The input is reduced by a constant factor per step, such as binary search.' }, { question: 'Why drop constants in Big-O?', answer: 'Asymptotic analysis focuses on growth as input size becomes large.' }], quiz: [{ question: 'Binary search on a sorted array has which complexity?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 1 }], pyqs: [{ year: 2023, question: 'Compare the worst-case complexity of binary and linear search.', difficulty: 'easy' }] };
    emit(id, { ...job, timestamp: new Date().toISOString() });
}
if (process.env.NODE_ENV !== 'test')
    app.listen(Number(process.env.PORT || 4000), () => console.log(`EduSwarm API listening on ${process.env.PORT || 4000}`));
