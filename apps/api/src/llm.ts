/**
 * EduSwarm direct LLM client
 * --------------------------
 * The agent runtime is the *preferred* brain (it adds Qdrant retrieval), but it
 * is a separate service: when it is cold-starting, sleeping, or erroring, the
 * learner used to silently receive canned guidance. This client gives the API
 * its own path to an OpenAI-compatible provider so specialist agents still
 * answer with a real model.
 *
 * Design notes:
 *  - Model fallback chain: free-tier model ids churn constantly, so every id in
 *    `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODELS` (comma separated) is
 *    tried in order and the first one that answers wins.
 *  - Retries only on transient provider states (408/429/5xx/network).
 *  - Errors carry the provider's own message so the UI can tell the learner
 *    *why* it fell back instead of pretending the model spoke.
 */

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type LlmResult = { text: string; model: string; provider: string };

// Checked against OpenRouter's free catalogue on 2026-09-18. These are
// explicit current models rather than `openrouter/free`, whose auto-routing
// can select an incompatible endpoint for a learner request.
export const DEFAULT_CHAIN = [
  'nvidia/nemotron-3.5-lightning:free',
  'inclusionai/ling-3.0-flash-vl:free',
  'qwen/qwen3.8-27b:free',
  'deepseek/deepseek-v4-flash:free',
  'thinkingmachines/inkling-small:free',
];

// Old service environments persist independently of render.yaml. Ignore only
// these retired free aliases so an existing deployment immediately moves past
// the DeepSeek V3-0324 404 and the generic router's invalid JSON responses.
export const RETIRED_FREE_MODELS = new Set([
  'openrouter/free',
  'deepseek/deepseek-chat-v3-0324:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
]);

const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504]);

function splitList(value: string | undefined): string[] {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Ordered model ids to try, honouring current explicit configuration first.
 *
 * Known-retired free ids are removed even when they remain in a persisted
 * Render environment. This preserves custom model choices while allowing an
 * existing deployment to self-heal from the old V3-0324/free-router failure.
 */
export function modelChain(): string[] {
  const configured = [...splitList(process.env.OPENROUTER_MODEL), ...splitList(process.env.OPENROUTER_FALLBACK_MODELS)]
    .filter((model) => !RETIRED_FREE_MODELS.has(model));
  return [...new Set([...configured, ...DEFAULT_CHAIN])];
}

export function llmConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
}

function baseUrl(): string {
  const value = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').trim();
  return value.replace(/\/$/, '');
}

function apiKey(): string {
  return process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '';
}

function timeoutMs(): number {
  return Math.max(10_000, Number(process.env.LLM_TIMEOUT_MS || 240_000));
}

function extractText(body: any): string {
  const content = body?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    return content
      .map((part: any) => (typeof part === 'string' ? part : String(part?.text || '')))
      .join('')
      .trim();
  }
  return String(content ?? '').trim();
}

/** True when the reply is empty or an obvious refusal/placeholder. */
export function isUsableReply(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 40) return false;
  if (/^(i'?m sorry|i cannot|i can't|as an ai)/i.test(clean)) return false;
  return true;
}

async function callModel(model: string, messages: ChatMessage[], temperature: number): Promise<string> {
  const response = await fetch(`${baseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey()}`,
      'content-type': 'application/json',
      'HTTP-Referer': process.env.WEB_URL || 'https://eduswarm-web.onrender.com',
      'X-Title': 'EduSwarm',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: 1400, stream: false }),
    signal: AbortSignal.timeout(timeoutMs()),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 400);
    const error: any = new Error(`${model} → HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
    error.status = response.status;
    throw error;
  }
  return extractText(await response.json().catch(() => ({})));
}

/**
 * Complete a chat. Throws with the last provider error when every model in the
 * chain fails, so callers can decide between surfacing the reason or degrading.
 */
export async function completeChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxModels?: number } = {},
): Promise<LlmResult> {
  if (!llmConfigured()) throw new Error('No LLM API key is configured on the API service (OPENROUTER_API_KEY).');
  const chain = modelChain().slice(0, Math.max(1, options.maxModels ?? modelChain().length));
  const failures: string[] = [];
  for (const model of chain) {
    try {
      const text = await callModel(model, messages, options.temperature ?? 0.35);
      if (isUsableReply(text)) return { text, model, provider: 'openrouter' };
      failures.push(`${model} → empty or refused reply`);
    } catch (error: any) {
      const status = Number(error?.status || 0);
      failures.push(String(error?.message || error));
      // A bad key or an invalid model list will never recover mid-request.
      if (status === 401 || status === 402 || status === 403) break;
      if (status && !RETRYABLE.has(status)) continue;
    }
  }
  throw new Error(`Every configured model failed — ${failures.slice(0, 3).join(' | ')}`);
}
