import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from './server.js';
import http from 'node:http';

function request(path: string, options: any = {}) { return new Promise<{status:number; body:any}>((resolve, reject) => { const server = app.listen(0, () => { const address = server.address() as any; const req = http.request({ hostname: '127.0.0.1', port: address.port, path, method: options.method || 'GET', headers: { 'content-type': 'application/json', ...(options.headers || {}) } }, res => { let data=''; res.on('data', c => data+=c); res.on('end', () => { server.close(); resolve({ status: res.statusCode || 0, body: data ? JSON.parse(data) : null }); }); }); req.on('error', reject); if (options.body) req.write(JSON.stringify(options.body)); req.end(); }); }); }

test('health endpoint is available', async () => { const result = await request('/health'); assert.equal(result.status, 200); assert.equal(result.body.ok, true); });
test('onboarding creates an independent goal', async () => { const result = await request('/api/onboarding', { method: 'POST', body: { name: 'Ada', goal: 'gate-cs', dailyMinutes: 30 } }); assert.equal(result.status, 201); assert.equal(result.body.goals.length, 1); assert.equal(result.body.dailyMinutes, 30); });
test('curriculum exposes prerequisite-aware topics', async () => { const result = await request('/api/curriculum/gate-cs'); assert.equal(result.status, 200); assert.equal(result.body.topics[1].prerequisites[0], 'algo-complexity'); });
