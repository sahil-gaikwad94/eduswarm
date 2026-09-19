/**
 * EduSwarm direct LLM client
 * --------------------------
 * The agent runtime is the *preferred* brain (it adds Qdrant retrieval), but it
 * is a separate service: when it is cold-starting, sleeping, or erroring, the
 * learner used to silently receive canned guidance. This client gives the API
 * its own path to an OpenAI-compatible provider so specialist agents still
 * answer with a real model.
 *
 * This mirrors `services/agent-runtime/app/llm_router.py`. Free-tier model ids
 * churn constantly, so the chain is *discovered* rather than configured:
 *
 *  - the live OpenRouter catalogue is cached for 20 minutes (retried after 60s
 *    on failure) and used to drop ids that no longer exist;
 *  - `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODELS` are optional hints —
 *    a stale value is ignored instead of consuming every attempt;
 *  - failures feed an in-memory cool-down ledger so a dead model sinks to the
 *    end of the chain, and the last model that answered is tried first;
 *  - only a 401 aborts the chain. 402/403/404/429 are model-specific.
 */

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type LlmResult = { text: string; model: string; provider: string };

const CATALOGUE_TTL_MS = 20 * 60 * 1000;
const CATALOGUE_RETRY_MS = 60 * 1000;
const CATALOGUE_TIMEOUT_MS = 8000;
const MIN_CONTEXT = 32_000;
const MIN_PARAMETER_BILLIONS = 20;
const MAX_DISCOVERED = 8;
const LAST_RESORT_MODEL = 'openrouter/free';

/** Models that cannot author a lesson: classifiers, media, tiny/experimental. */
const EXCLUDED_ID = /safety|guard|moderat|embed|rerank|lyria|tts|whisper|vision|image|audio|omni|lfm|dolphin|vl/i;

/** Starting order only — every id is verified against the live catalogue. */
const CURATED_MODELS = [
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-120b:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'poolside/laguna-m.1:free',
  'openai/gpt-oss-20b:free',
];

const COOLDOWN_MS: Record<string, number> = {
  gone: 6 * 60 * 60 * 1000,        // 404 / 410
  bad_request: 60 * 60 * 1000,     // 400 / 422
  denied: 60 * 60 * 1000,          // 402 / 403
  rate_limited: 2 * 60 * 1000,     // 429
  rate_limited_day: 3 * 60 * 60 * 1000,
  transient: 2 * 60 * 1000,        // 5xx / network / timeout
  unusable: 15 * 60 * 1000,        // empty or unusable output
};

type CatalogueEntry = Record<string, any>;

const catalogue: { entries: Map<string, CatalogueEntry> | null; fetchedAt: number; failedAt: number; inFlight: Promise<void> | null } = {
  entries: null,
  fetchedAt: 0,
  failedAt: 0,
  inFlight: null,
};
const cooldowns = new Map<string, number>();
let lastGood: string | null = null;

function splitList(value: string | undefined): string[] {
  return String(value || '').split(',').map((part) => part.trim()).filter(Boolean);
}

/**
 * Fixed budgets. Deliberately NOT configurable: a deployment should never have
 * to tune model behaviour, and a stale value must not be able to break a reply.
 */
const CHAT_MAX_TOKENS = 1400;
const ATTEMPT_TIMEOUT_MS = 75_000;
const TOTAL_BUDGET_MS = 200_000;
const MAX_ATTEMPTS = 6;

export function llmConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
}

function baseUrl(): string {
  return (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').trim().replace(/\/$/, '');
}

function apiKey(): string {
  return process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '';
}

function paidFallbackModel(): string {
  return String(process.env.OPENROUTER_PAID_FALLBACK_MODEL || '').trim();
}

// ------------------------------------------------------------------ catalogue

function toNumber(value: any): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Parameter count in billions, parsed from metadata or the id. Null = unknown. */
export function parameterBillions(modelId: string, entry?: CatalogueEntry): number | null {
  const declared = toNumber(entry?.parameter_count ?? entry?.top_provider?.parameter_count);
  if (declared) return declared > 1e6 ? declared / 1e9 : declared;
  const sizes = [...modelId.toLowerCase().matchAll(/(?<![a-z0-9.])(\d+(?:\.\d+)?)\s*([bt])(?![a-z0-9])/g)]
    .map((match) => Number(match[1]) * (match[2] === 't' ? 1000 : 1));
  // "80b-a3b" is an 80B model with 3B active parameters: judge it on the total.
  return sizes.length ? Math.max(...sizes) : null;
}

function isExpired(entry: CatalogueEntry): boolean {
  if (entry.deprecated || entry.is_deprecated) return true;
  for (const key of ['expires_at', 'expiry', 'deprecated_at', 'deprecation_date', 'sunset_at']) {
    const raw = entry[key];
    if (!raw) continue;
    const moment = typeof raw === 'number' ? new Date(raw * 1000) : new Date(String(raw));
    if (!Number.isNaN(moment.getTime()) && moment.getTime() <= Date.now()) return true;
  }
  return false;
}

function isFree(entry: CatalogueEntry): boolean {
  return toNumber(entry?.pricing?.prompt) === 0 && toNumber(entry?.pricing?.completion) === 0;
}

function isTextOutput(entry: CatalogueEntry): boolean {
  const modalities = entry?.architecture?.output_modalities;
  if (Array.isArray(modalities) && modalities.length) {
    return modalities.length === 1 && String(modalities[0]).toLowerCase() === 'text';
  }
  const modality = String(entry?.architecture?.modality || '');
  return modality === '' || modality.replace(/\s/g, '').includes('->text') || modality.endsWith('text');
}

export function isEligible(entry: CatalogueEntry): boolean {
  const id = String(entry?.id || '');
  if (!id || EXCLUDED_ID.test(id)) return false;
  if (!isFree(entry) || !isTextOutput(entry) || isExpired(entry)) return false;
  const context = toNumber(entry.context_length) ?? toNumber(entry?.top_provider?.context_length) ?? 0;
  if (context < MIN_CONTEXT) return false;
  const size = parameterBillions(id, entry);
  return size === null || size >= MIN_PARAMETER_BILLIONS;
}

function supportsStructuredOutput(entry: CatalogueEntry): boolean {
  const parameters = entry?.supported_parameters;
  if (Array.isArray(parameters) && parameters.some((item) => item === 'response_format' || item === 'structured_outputs')) return true;
  return Boolean(entry?.architecture?.structured_outputs);
}

/**
 * Refresh the catalogue in the background. Never throws and never blocks a
 * learner's request: a stale cache is always preferable to a slow failure.
 */
function refreshCatalogue(): void {
  const now = Date.now();
  const fresh = catalogue.entries && now - catalogue.fetchedAt < CATALOGUE_TTL_MS;
  if (fresh || catalogue.inFlight || now - catalogue.failedAt < CATALOGUE_RETRY_MS) return;
  catalogue.inFlight = (async () => {
    try {
      const response = await fetch(`${baseUrl()}/models`, {
        headers: { accept: 'application/json', ...(apiKey() ? { authorization: `Bearer ${apiKey()}` } : {}) },
        signal: AbortSignal.timeout(CATALOGUE_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`catalogue HTTP ${response.status}`);
      const body: any = await response.json();
      const data = Array.isArray(body?.data) ? body.data : body;
      if (!Array.isArray(data) || !data.length) throw new Error('empty catalogue');
      const entries = new Map<string, CatalogueEntry>();
      for (const entry of data) if (entry?.id) entries.set(String(entry.id), entry);
      catalogue.entries = entries;
      catalogue.fetchedAt = Date.now();
    } catch {
      // Keep the previous catalogue; just remember when to retry.
      catalogue.failedAt = Date.now();
    } finally {
      catalogue.inFlight = null;
    }
  })();
}

/** Await the first catalogue fetch only; later refreshes happen in background. */
async function ensureCatalogue(): Promise<void> {
  refreshCatalogue();
  if (!catalogue.entries && catalogue.inFlight) await catalogue.inFlight;
}

// --------------------------------------------------------------------- ledger

export function classifyFailure(status: number | null, message = ''): string {
  if (status === 404 || status === 410) return 'gone';
  if (status === 400 || status === 422) return 'bad_request';
  if (status === 402 || status === 403) return 'denied';
  if (status === 429) return /per[-\s]?day|daily/i.test(message) ? 'rate_limited_day' : 'rate_limited';
  if (status === null || status >= 500) return 'transient';
  return 'unusable';
}

export function penalise(model: string, kind: string): void {
  const until = Date.now() + (COOLDOWN_MS[kind] ?? COOLDOWN_MS.transient);
  cooldowns.set(model, Math.max(cooldowns.get(model) || 0, until));
  if (lastGood === model) lastGood = null;
}

export function markOk(model: string): void {
  lastGood = model;
  cooldowns.delete(model);
}

function cooldownRemaining(model: string): number {
  return Math.max(0, (cooldowns.get(model) || 0) - Date.now());
}

/** Test helper: clear the catalogue cache, cool-downs and last-good model. */
export function resetRouter(): void {
  catalogue.entries = null;
  catalogue.fetchedAt = 0;
  catalogue.failedAt = 0;
  cooldowns.clear();
  lastGood = null;
}

// ---------------------------------------------------------------------- chain

/**
 * Ordered model ids to try: live env hints, last-known-good, curated list,
 * newest discovered free models, then `openrouter/free`. Models on cool-down
 * are moved to the end, never removed — a total outage must still have
 * something to attempt. Uses the cached catalogue only, so this is synchronous
 * and safe to call from a health endpoint.
 */
export function modelChain(options: { includePaid?: boolean } = {}): string[] {
  refreshCatalogue();
  const entries = catalogue.entries;
  const exists = (id: string) => !entries || entries.has(id);
  const chain: string[] = [];
  const add = (id: string) => {
    if (id && !chain.includes(id) && exists(id)) chain.push(id);
  };

  // Explicit configuration wins, so changing OPENROUTER_MODEL in the dashboard
  // takes effect on the next request instead of losing to the last-good memory.
  const hints = [...splitList(process.env.OPENROUTER_MODEL), ...splitList(process.env.OPENROUTER_FALLBACK_MODELS)];
  for (const id of hints) add(id);
  if (lastGood && !hints.includes(lastGood)) add(lastGood);
  for (const id of CURATED_MODELS) add(id);
  if (entries) {
    const discovered = [...entries.values()]
      .filter((entry) => isEligible(entry) && !chain.includes(String(entry.id)))
      .sort((a, b) => (supportsStructuredOutput(b) ? 1 : 0) - (supportsStructuredOutput(a) ? 1 : 0) || (toNumber(b.created) ?? 0) - (toNumber(a.created) ?? 0))
      .slice(0, MAX_DISCOVERED);
    for (const entry of discovered) add(String(entry.id));
  }
  const withoutAlias = chain.filter((id) => id !== LAST_RESORT_MODEL);
  const ordered = [
    ...withoutAlias.filter((id) => !cooldownRemaining(id)),
    ...withoutAlias.filter((id) => cooldownRemaining(id)).sort((a, b) => cooldownRemaining(a) - cooldownRemaining(b)),
    LAST_RESORT_MODEL,
  ];
  const paid = paidFallbackModel();
  if (options.includePaid && paid && !ordered.includes(paid)) ordered.push(paid);
  return ordered;
}

// ----------------------------------------------------------------- one attempt

function extractText(body: any): { text: string; finish: string } {
  const choice = body?.choices?.[0];
  const message = choice?.message;
  let content = message?.content;
  if (Array.isArray(content)) {
    content = content.map((part: any) => (typeof part === 'string' ? part : String(part?.text || ''))).join('');
  }
  let text = String(content ?? '').trim();
  // Reasoning-first models sometimes drain `content` and answer in `reasoning`.
  if (!text && typeof message?.reasoning === 'string') text = message.reasoning.trim();
  return { text, finish: String(choice?.finish_reason || '') };
}

/** True when the reply is empty or an obvious refusal/placeholder. */
export function isUsableReply(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 40) return false;
  return !/^(i'?m sorry|i cannot|i can't|as an ai)/i.test(clean);
}

class ModelError extends Error {
  constructor(message: string, readonly status: number | null, readonly kind: string) {
    super(message);
  }
}

async function post(payload: Record<string, unknown>, budgetMs: number): Promise<any> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey()}`,
        'content-type': 'application/json',
        'HTTP-Referer': process.env.WEB_URL || 'https://eduswarm-web.onrender.com',
        'X-Title': 'EduSwarm',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(Math.max(5_000, Math.min(ATTEMPT_TIMEOUT_MS, budgetMs))),
    });
  } catch (error: any) {
    throw new ModelError(String(error?.message || error), null, 'transient');
  }
  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    throw new ModelError(`HTTP ${response.status}${detail ? `: ${detail}` : ''}`, response.status, classifyFailure(response.status, detail));
  }
  const body: any = await response.json().catch(() => ({}));
  // OpenRouter returns upstream provider failures as HTTP 200 with an error body.
  if (body?.error) {
    const status = typeof body.error.code === 'number' ? body.error.code : 502;
    const message = String(body.error.message || 'provider error').slice(0, 300);
    throw new ModelError(`HTTP ${status}: ${message}`, status, classifyFailure(status, message));
  }
  return body;
}

/**
 * Ask one model, adapting the request to what it accepts: a 400/422 means it
 * rejects the `reasoning` knob, and an empty reply means hidden reasoning ate
 * the token budget, so it is retried with an explicit low effort.
 */
async function callModel(model: string, messages: ChatMessage[], temperature: number, budgetMs: number): Promise<string> {
  const base = { model, messages, temperature, max_tokens: CHAT_MAX_TOKENS, stream: false };
  const variants: Record<string, unknown>[] = [{ ...base, reasoning: { enabled: false } }];
  let lastDetail = '';
  for (let index = 0; index < 3 && index < variants.length; index += 1) {
    try {
      const { text, finish } = extractText(await post(variants[index], budgetMs));
      if (text) return text;
      lastDetail = `empty content (finish_reason=${finish || 'unknown'})`;
      if (!variants.some((variant) => (variant as any).reasoning?.effort)) {
        variants.push({ ...base, reasoning: { effort: 'low' } });
        continue;
      }
      throw new ModelError(lastDetail, null, 'unusable');
    } catch (error: any) {
      if (!(error instanceof ModelError)) throw error;
      if (error.kind === 'bad_request' && index === 0) {
        variants.push({ ...base });  // resend bare: no reasoning field at all
        lastDetail = error.message;
        continue;
      }
      throw error;
    }
  }
  throw new ModelError(lastDetail || 'no usable reply', null, 'unusable');
}

/**
 * Complete a chat, walking the discovered model chain until one answers.
 * Throws a learner-readable summary (with per-model detail appended) when the
 * whole chain fails, so callers can surface the reason or degrade locally.
 */
export async function completeChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxModels?: number } = {},
): Promise<LlmResult> {
  if (!llmConfigured()) throw new Error('No LLM API key is configured on the API service (OPENROUTER_API_KEY).');
  await ensureCatalogue();
  const paid = paidFallbackModel();
  const chain = modelChain({ includePaid: true });
  const free = chain.filter((model) => model !== paid).slice(0, Math.max(1, options.maxModels ?? MAX_ATTEMPTS));
  const attempts = paid && !free.includes(paid) ? [...free, paid] : free;
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const failures: string[] = [];

  for (const model of attempts) {
    const remaining = deadline - Date.now();
    if (remaining <= 2000) {
      failures.push('the time budget for this reply was exhausted');
      break;
    }
    try {
      const text = await callModel(model, messages, options.temperature ?? 0.35, remaining);
      if (isUsableReply(text)) {
        markOk(model);
        return { text, model, provider: 'openrouter' };
      }
      penalise(model, 'unusable');
      failures.push(`${model} → empty or refused reply`);
    } catch (error: any) {
      // Only a rejected key is global; 402/403/404/429 are model-specific.
      if (error?.status === 401) throw new Error(`The AI provider rejected the API key — ${error.message}`);
      penalise(model, error?.kind || 'transient');
      failures.push(`${model} → ${String(error?.message || error)}`);
    }
  }
  throw new Error(
    `Every free AI model was busy, unavailable or returned unusable output (tried ${attempts.length}). ` +
    `Please retry in a minute. — ${failures.slice(0, 4).join(' | ')}`,
  );
}
