"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const server_js_1 = require("./server.js");
const node_http_1 = __importDefault(require("node:http"));
function request(path, options = {}) { return new Promise((resolve, reject) => { const server = server_js_1.app.listen(0, () => { const address = server.address(); const req = node_http_1.default.request({ hostname: '127.0.0.1', port: address.port, path, method: options.method || 'GET', headers: { 'content-type': 'application/json', ...(options.headers || {}) } }, res => { let data = ''; res.on('data', c => data += c); res.on('end', () => { server.close(); resolve({ status: res.statusCode || 0, body: data ? JSON.parse(data) : null }); }); }); req.on('error', reject); if (options.body)
    req.write(JSON.stringify(options.body)); req.end(); }); }); }
(0, node_test_1.default)('health endpoint is available', async () => { const result = await request('/health'); strict_1.default.equal(result.status, 200); strict_1.default.equal(result.body.ok, true); });
(0, node_test_1.default)('onboarding creates an independent goal', async () => { const result = await request('/api/onboarding', { method: 'POST', body: { name: 'Ada', goal: 'gate-cs', dailyMinutes: 30 } }); strict_1.default.equal(result.status, 201); strict_1.default.equal(result.body.goals.length, 1); strict_1.default.equal(result.body.dailyMinutes, 30); });
(0, node_test_1.default)('curriculum exposes prerequisite-aware topics', async () => { const result = await request('/api/curriculum/gate-cs'); strict_1.default.equal(result.status, 200); strict_1.default.equal(result.body.topics[1].prerequisites[0], 'algo-complexity'); });
