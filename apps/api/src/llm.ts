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

const DEFAULT_CHAIN = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'qwen/qwen3-coder:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'openai/gpt-oss-20b:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
  'openrouter/free',
];

// 404 / 400 with "not found"/"function" = bad model id (common with Nvidia BYOK). Try next model.
// Transient 408/425/429/5xx = retry same model briefly, then try next.
const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504]);
const NOT_FOUND_CODES = new Set([400, 404]);

function splitList(value: string | undefined): string[] {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Ordered model ids to try, honouring explicit configuration first. */
export function modelChain(): string[] {
  const configured = [...splitList(process.env.OPENROUTER_MODEL), ...splitList(process.env.OPENROUTER_FALLBACK_MODELS)];
  const chain = [...new Set([...configured, ...DEFAULT_CHAIN])];
  return chain;
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
  return Math.max(10_000, Number(process.env.LLM_TIMEOUT_MS || 90_000));
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
    const detail = (await response.text().catch(() => '')).slice(0, 800);
    const error: any = new Error(`${model} → HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }
  return extractText(await response.json().catch(() => ({})));
}

function isModelNotFound(status: number, detail: string): boolean {
  if (status === 404) return true;
  if (status === 400) {
    const low = detail.toLowerCase();
    return low.includes('not found') || low.includes('function') || low.includes('no endpoints') || low.includes('model');
  }
  return false;
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
      const detail = String(error?.detail || error?.message || '');
      failures.push(String(error?.message || error).slice(0, 500));
      // Auth / billing errors will never recover by trying another model with same key
      if (status === 401 || status === 402 || status === 403) {
        // Provide actionable message for invalid key
        if (status === 401) failures.push('Check OPENROUTER_API_KEY validity');
        break;
      }
      // Model/function not found (Nvidia BYOK 404) → try next model immediately
      if (isModelNotFound(status, detail)) {
        continue;
      }
      // Retryable transient errors: continue to next model (callModel already timed out once)
      // Non-retryable 4xx other than auth/not-found: also try next model
      if (status && !RETRYABLE.has(status) && status < 500) {
        continue;
      }
      // For retryable 5xx, also try next model after this failure
    }
  }
  throw new Error(`Every configured model failed — ${failures.slice(0, 4).join(' | ')}`);
}
