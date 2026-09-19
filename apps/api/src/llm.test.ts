/**
 * Model-churn tests for the API's direct LLM path, against a fake OpenRouter
 * bound to localhost. No network access is required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { completeChat, isEligible, modelChain, parameterBillions, resetRouter } from './llm.js';

type Behaviour = Record<string, string>;

const state: { models: any[]; behaviour: Behaviour; catalogueStatus: number; requests: any[] } = {
  models: [], behaviour: {}, catalogueStatus: 200, requests: [],
};

function entry(id: string, overrides: Record<string, any> = {}) {
  return {
    id,
    created: 1_700_000_000,
    context_length: 131_072,
    pricing: { prompt: '0', completion: '0' },
    architecture: { output_modalities: ['text'], modality: 'text->text' },
    supported_parameters: ['response_format', 'max_tokens'],
    ...overrides,
  };
}

const LESSON_TEXT = 'This is a full, usable model answer that comfortably exceeds the minimum length required by the client.';

const server = http.createServer((req, res) => {
  const send = (status: number, body: unknown) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  if (req.method === 'GET') {
    if (state.catalogueStatus !== 200) return send(state.catalogueStatus, { error: { message: 'catalogue down' } });
    return send(200, { data: state.models });
  }
  let raw = '';
  req.on('data', (chunk) => { raw += chunk; });
  req.on('end', () => {
    const payload = JSON.parse(raw || '{}');
    state.requests.push(payload);
    const mode = state.behaviour[payload.model] || 'good';
    const reply = (content: unknown, finish = 'stop') => ({ choices: [{ message: { content }, finish_reason: finish }] });
    if (mode === '404') return send(404, { error: { message: 'This model is unavailable for free' } });
    if (mode === '401') return send(401, { error: { message: 'No auth credentials found' } });
    if (mode === '429-day') return send(429, { error: { message: 'Rate limit exceeded: free-models-per-day' } });
    if (mode === 'error-200') return send(200, { error: { code: 502, message: 'upstream provider gave up' } });
    if (mode === 'empty') return send(200, reply(null, 'length'));
    if (mode === 'empty-then-good') {
      return payload.reasoning?.effort === 'low' ? send(200, reply(LESSON_TEXT)) : send(200, reply('', 'length'));
    }
    if (mode === 'bare-only') {
      return payload.reasoning ? send(400, { error: { message: 'reasoning is not supported' } }) : send(200, reply(LESSON_TEXT));
    }
    if (mode === 'reasoning-field') return send(200, { choices: [{ message: { content: null, reasoning: LESSON_TEXT }, finish_reason: 'stop' }] });
    return send(200, reply(LESSON_TEXT));
  });
});

let baseUrl = '';

test.before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as any).port}`;
  process.env.OPENROUTER_API_KEY = 'test-key';
});

test.after(() => server.close());

test.beforeEach(() => {
  process.env.OPENROUTER_BASE_URL = baseUrl;
  delete process.env.OPENROUTER_MODEL;
  delete process.env.OPENROUTER_FALLBACK_MODELS;
  delete process.env.OPENROUTER_PAID_FALLBACK_MODEL;
  state.models = [];
  state.behaviour = {};
  state.catalogueStatus = 200;
  state.requests = [];
  resetRouter();
});

/** The catalogue is loaded lazily; a chat call primes it for chain assertions. */
async function primeCatalogue() {
  try { await completeChat([{ role: 'user', content: 'hi' }]); } catch { /* expected in failure tests */ }
}

test('eligibility drops paid, tiny, short-context, guard and media models', () => {
  assert.equal(isEligible(entry('good/model-70b:free')), true);
  assert.equal(isEligible(entry('paid/model-70b', { pricing: { prompt: '0.5', completion: '1' } })), false);
  assert.equal(isEligible(entry('tiny/model-7b:free')), false);
  assert.equal(isEligible(entry('short/model-70b:free', { context_length: 8000 })), false);
  assert.equal(isEligible(entry('meta/llama-guard-4-70b:free')), false);
  assert.equal(isEligible(entry('media/imagegen-70b:free')), false);
  assert.equal(isEligible(entry('old/model-70b:free', { deprecated: true })), false);
  assert.equal(isEligible(entry('unknown/mystery-model:free')), true, 'unknown size stays eligible');
  assert.equal(parameterBillions('qwen/qwen3-next-80b-a3b-instruct:free'), 80, 'total size, not active size');
});

test('a dead env slug is skipped and the aggregator alias is last', async () => {
  state.models = [entry('meta-llama/llama-3.3-70b-instruct:free'), entry('new/model-70b:free', { created: 1_800_000_000 }), entry('openrouter/free')];
  process.env.OPENROUTER_MODEL = 'deepseek/deepseek-v4-flash-0731:free';
  process.env.OPENROUTER_FALLBACK_MODELS = 'deepseek/deepseek-chat-v3-0324:free';
  await primeCatalogue();

  const chain = modelChain();
  assert.equal(chain.includes('deepseek/deepseek-v4-flash-0731:free'), false);
  assert.equal(chain.includes('deepseek/deepseek-chat-v3-0324:free'), false);
  assert.equal(chain[0], 'meta-llama/llama-3.3-70b-instruct:free');
  assert.equal(chain.at(-1), 'openrouter/free');
});

test('an unreachable catalogue still yields a chain', async () => {
  state.catalogueStatus = 500;
  process.env.OPENROUTER_MODEL = 'custom/whatever:free';
  await primeCatalogue();
  const chain = modelChain();
  assert.equal(chain[0], 'custom/whatever:free', 'without a catalogue every id is assumed to exist');
  assert.equal(chain.at(-1), 'openrouter/free');
});

test('an empty model, then a dead model, then a good model succeeds and is remembered', async () => {
  state.models = [entry('a/empty-70b:free', { created: 3 }), entry('b/dead-70b:free', { created: 2 }), entry('c/good-70b:free', { created: 1 })];
  state.behaviour = { 'a/empty-70b:free': 'empty', 'b/dead-70b:free': '404', 'c/good-70b:free': 'good' };

  const result = await completeChat([{ role: 'user', content: 'explain binary search' }]);
  assert.equal(result.model, 'c/good-70b:free');

  assert.equal(modelChain()[0], 'c/good-70b:free', 'the known-good model is tried first next time');
  state.requests = [];
  await completeChat([{ role: 'user', content: 'again' }]);
  assert.equal(state.requests[0].model, 'c/good-70b:free');
});

test('a model that rejects the reasoning field succeeds via the bare retry', async () => {
  state.models = [entry('a/picky-70b:free')];
  state.behaviour = { 'a/picky-70b:free': 'bare-only' };
  const result = await completeChat([{ role: 'user', content: 'hello' }]);
  assert.equal(result.model, 'a/picky-70b:free');
  assert.equal('reasoning' in state.requests.at(-1), false);
});

test('an empty reply is retried with low reasoning effort', async () => {
  state.models = [entry('a/hybrid-70b:free')];
  state.behaviour = { 'a/hybrid-70b:free': 'empty-then-good' };
  await completeChat([{ role: 'user', content: 'hello' }]);
  assert.deepEqual(state.requests.at(-1).reasoning, { effort: 'low' });
});

test('an answer left in the reasoning field is still used', async () => {
  state.models = [entry('a/reasoner-70b:free')];
  state.behaviour = { 'a/reasoner-70b:free': 'reasoning-field' };
  assert.equal((await completeChat([{ role: 'user', content: 'hello' }])).text, LESSON_TEXT);
});

test('HTTP 200 carrying an error body is treated as a failure', async () => {
  state.models = [entry('a/broken-70b:free', { created: 2 }), entry('b/good-70b:free', { created: 1 })];
  state.behaviour = { 'a/broken-70b:free': 'error-200', 'b/good-70b:free': 'good' };
  assert.equal((await completeChat([{ role: 'user', content: 'hello' }])).model, 'b/good-70b:free');
});

test('a 401 fails fast without walking the chain', async () => {
  state.models = [entry('a/model-70b:free'), entry('b/model-70b:free')];
  state.behaviour = { 'a/model-70b:free': '401', 'b/model-70b:free': '401' };
  await assert.rejects(completeChat([{ role: 'user', content: 'hi' }]), /rejected the API key/);
  assert.equal(state.requests.length, 1);
});

test('a dead model is demoted, not deleted, and the learner error is readable', async () => {
  state.models = [entry('a/dead-70b:free'), entry('b/live-70b:free', { created: 1 })];
  state.behaviour = { 'a/dead-70b:free': '404', 'b/live-70b:free': '404', 'openrouter/free': '404' };

  await assert.rejects(completeChat([{ role: 'user', content: 'hi' }]), (error: Error) => {
    assert.match(error.message, /^Every free AI model was busy, unavailable or returned unusable output \(tried \d+\)\. Please retry in a minute\./);
    assert.match(error.message, /HTTP 404/, 'per-model detail is kept after the summary');
    return true;
  });

  const chain = modelChain();
  assert.equal(chain.includes('a/dead-70b:free'), true, 'cool-down demotes rather than removes');
});

test('a cooled-down model sorts behind a healthy one and behind a shorter cool-down', async () => {
  state.models = [entry('a/dead-70b:free', { created: 3 }), entry('b/busy-70b:free', { created: 2 }), entry('c/good-70b:free', { created: 1 })];
  state.behaviour = { 'a/dead-70b:free': '404', 'b/busy-70b:free': 'empty', 'c/good-70b:free': 'good' };
  await completeChat([{ role: 'user', content: 'hi' }]);

  const chain = modelChain();
  assert.equal(chain[0], 'c/good-70b:free', 'the healthy model leads');
  assert.ok(chain.indexOf('b/busy-70b:free') < chain.indexOf('a/dead-70b:free'), 'a 15m cool-down outranks a 6h one');
});

test('the paid tier is only used after the free chain and only when configured', async () => {
  state.models = [entry('a/dead-70b:free')];
  state.behaviour = { 'a/dead-70b:free': '404', 'openrouter/free': '404', 'paid/reliable-mini': 'good' };
  await assert.rejects(completeChat([{ role: 'user', content: 'hi' }]), /Every free AI model/);

  resetRouter();
  process.env.OPENROUTER_PAID_FALLBACK_MODEL = 'paid/reliable-mini';
  const result = await completeChat([{ role: 'user', content: 'hi' }]);
  assert.equal(result.model, 'paid/reliable-mini');
  assert.equal(state.requests.at(-1).model, 'paid/reliable-mini');
});

test('stale env values and dead slugs still produce an answer', async () => {
  process.env.OPENROUTER_MODEL = 'deepseek/deepseek-v4-flash-0731:free';
  process.env.OPENROUTER_FALLBACK_MODELS = 'deepseek/deepseek-chat-v3-0324:free,qwen/qwen-2.5-72b-instruct:free';
  state.models = [entry('a/live-70b:free')];
  const result = await completeChat([{ role: 'user', content: 'hi' }]);
  assert.equal(result.model, 'a/live-70b:free');
});
