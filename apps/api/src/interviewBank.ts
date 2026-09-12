/**
 * EduSwarm Interview Simulator Bank
 * ---------------------------------
 * System-design and behavioral prompts per track. Each design prompt lists
 * the key points an examiner listens for (with keyword signals and hints),
 * so even the local evaluator can score and coach like a real interviewer.
 */

export type InterviewTrack = 'sde' | 'gate' | 'aiml';

export type DesignKeyPoint = { label: string; keywords: string[]; hint: string };
export type DesignPrompt = {
  id: string; track: InterviewTrack; title: string; prompt: string;
  keyPoints: DesignKeyPoint[]; followUps: string[];
};
export type BehavioralPrompt = { id: string; track: InterviewTrack | 'all'; title: string; prompt: string; rubric: string[] };

export const DESIGN_PROMPTS: DesignPrompt[] = [
  {
    id: 'design-rate-limiter', track: 'sde', title: 'Design a distributed rate limiter',
    prompt: `Design a rate limiter for a public API serving 100k requests/second across 50 gateway nodes, with per-user and per-API-key limits.

Cover: the algorithm (token bucket vs fixed/sliding window), where state lives, how 50 nodes stay consistent, precision vs performance trade-offs, failure behavior when the limiter store is down, and how you would test and monitor it.`,
    keyPoints: [
      { label: 'Algorithm choice with justification', keywords: ['token bucket', 'sliding window', 'leaky bucket'], hint: 'Token bucket allows bursts with smooth sustained limits; sliding window is more precise.' },
      { label: 'Distributed state store', keywords: ['redis', 'memcached', 'centralized', 'lua'], hint: 'A central store like Redis with atomic Lua scripts keeps counters exact across nodes.' },
      { label: 'Clock and race handling', keywords: ['atomic', 'race', 'clock', 'ttl', 'expiry'], hint: 'Atomic increments plus TTLs prevent races when keys expire.' },
      { label: 'Fail-open vs fail-closed policy', keywords: ['fail-open', 'fail-closed', 'fallback', 'degraded'], hint: 'Fail-open keeps revenue flowing; fail-closed protects overloaded backends — pick per endpoint.' },
      { label: 'Monitoring and headers', keywords: ['429', 'retry-after', 'metric', 'alert', 'dashboard'], hint: 'Return 429 with Retry-After; alert on rejection-rate spikes per key.' },
    ],
    followUps: [
      'Your Redis becomes a hotspot on one viral API key — how do you shard the counters?',
      'The product team wants different limits for free vs paid tiers with instant upgrades. What changes?',
    ],
  },
  {
    id: 'design-url-shortener', track: 'sde', title: 'Design a URL shortener (TinyURL)',
    prompt: `Design a URL shortener: 100M new URLs/month, 10:1 read/write ratio, custom aliases, analytics (clicks per link per day), and 5-year data retention.

Cover: ID generation (hash vs counter vs KGS), collision handling, storage schema, caching strategy, redirect flow latency, rate limiting on creation, and analytics pipeline.`,
    keyPoints: [
      { label: 'ID generation strategy', keywords: ['base62', 'counter', 'kgs', 'hash', 'uuid', 'sequence'], hint: 'Base62-encoded counters or a key-generation service beat random hashes for density.' },
      { label: 'Collision / uniqueness handling', keywords: ['collision', 'unique', 'constraint', 'retry'], hint: 'DB unique constraints plus retry loops make creation idempotent.' },
      { label: 'Read-path caching', keywords: ['cache', 'cdn', 'redis', 'ttl', '301', '302'], hint: 'Cache hot mappings; 301s let browsers/CDNs absorb repeat traffic.' },
      { label: 'Analytics pipeline', keywords: ['kafka', 'analytics', 'aggregate', 'batch', 'stream'], hint: 'Emit click events to a stream; aggregate daily counts offline.' },
      { label: 'Scale and retention', keywords: ['shard', 'partition', 'retention', 'archive', 'replica'], hint: 'Shard by hash of short code; archive cold links to cheap storage.' },
    ],
    followUps: [
      'How do you prevent malicious users from mass-creating links?',
      'Custom aliases collide under concurrency — design the reservation flow.',
    ],
  },
  {
    id: 'design-feed', track: 'sde', title: 'Design a social media feed',
    prompt: `Design a home feed for 50M users: posts, follows, likes, ranked reverse-chronological timeline, celebrity users with 100M followers, p99 < 300ms.

Cover: fan-out on write vs read, handling celebrities, ranking vs recency, pagination/cursoring, like counters, and cache invalidation.`,
    keyPoints: [
      { label: 'Fan-out strategy', keywords: ['fan-out', 'fanout', 'push', 'pull', 'hybrid'], hint: 'Hybrid: push for normal users, pull for celebrities.' },
      { label: 'Celebrity handling', keywords: ['celebrity', 'hot key', 'shard', 'asymmetric'], hint: 'Never fan out to 100M inboxes on write — merge celebrity posts at read time.' },
      { label: 'Pagination', keywords: ['cursor', 'pagination', 'offset', 'timeline'], hint: 'Cursor-based pagination survives inserts between pages; OFFSET breaks.' },
      { label: 'Counters consistency', keywords: ['counter', 'eventual', 'like', 'aggregate'], hint: 'Like counts can be eventually consistent; the feed itself cannot reorder.' },
      { label: 'Caching and precompute', keywords: ['cache', 'precompute', 'materializ', 'cdn', 'edge'], hint: 'Precompute timelines for active users; serve media from a CDN.' },
    ],
    followUps: [
      'A celebrity posts during the Super Bowl — walk me through second-by-second load.',
      'How do you add "posts you may have missed" ranking without breaking recency?',
    ],
  },
  {
    id: 'design-scheduler', track: 'gate', title: 'Design a CPU scheduler (OS concepts)',
    prompt: `You are designing the scheduler for a teaching OS: 4 cores, mixed interactive + batch + real-time workloads, strict starvation-freedom, and measurable fairness.

Cover: scheduling classes and priorities, time-quantum choice, load balancing across cores, priority inversion handling, which metrics you report, and how you would test starvation-freedom.`,
    keyPoints: [
      { label: 'Scheduling classes', keywords: ['real-time', 'interactive', 'batch', 'priority', 'class', 'fifo', 'round robin'], hint: 'Separate real-time, interactive, and batch classes with distinct policies.' },
      { label: 'Starvation freedom', keywords: ['starvation', 'aging', 'fair', 'guarantee'], hint: 'Aging or CFS-style virtual runtime guarantees every task eventually runs.' },
      { label: 'Multicore balancing', keywords: ['affinity', 'migration', 'load balanc', 'core', 'cache'], hint: 'Balance load but respect cache affinity — migration has a cost.' },
      { label: 'Priority inversion', keywords: ['inversion', 'inheritance', 'ceiling', 'mutex'], hint: 'Priority inheritance bounds how long a high-priority task can wait on a lock.' },
      { label: 'Metrics', keywords: ['turnaround', 'waiting', 'response', 'throughput', 'p95', 'jitter'], hint: 'Report turnaround, waiting, and response-time percentiles per class.' },
    ],
    followUps: [
      'A real-time task misses its deadline once per hour — how do you debug it?',
      'Compare your design against Linux CFS: what would you steal, what would you skip?',
    ],
  },
  {
    id: 'design-db-index', track: 'gate', title: 'Design an index for a read-heavy database',
    prompt: `Design the indexing subsystem for a read-heavy OLTP store: 1B rows, point lookups + range scans, 10% writes, crash recovery required.

Cover: B+ tree vs LSM vs hash index choice, page layout and fan-out math, concurrency control on the index, write amplification, crash recovery, and when you would pick a different structure.`,
    keyPoints: [
      { label: 'Structure choice with math', keywords: ['b+ tree', 'btree', 'lsm', 'fan-out', 'fanout', 'height', 'log'], hint: 'B+ tree height stays ~3-4 at 1B rows with realistic fan-out — show the math.' },
      { label: 'Range scan support', keywords: ['range', 'scan', 'leaf', 'linked', 'order'], hint: 'Linked leaf pages make B+ trees range-friendly; hash indexes cannot scan.' },
      { label: 'Concurrency control', keywords: ['latch', 'crabbing', 'lock coupling', 'concurrent', 'mvcc'], hint: 'Latch crabbing lets readers and writers share the tree safely.' },
      { label: 'Crash recovery', keywords: ['wal', 'write-ahead', 'recovery', 'checkpoint', 'redo'], hint: 'Write-ahead logging replays committed changes after a crash.' },
      { label: 'Write path costs', keywords: ['split', 'amortiz', 'write amplification', 'compaction'], hint: 'Page splits cost; LSM defers them via compaction at read cost.' },
    ],
    followUps: [
      'Range queries suddenly slow 10x after a bulk load — diagnose it.',
      'At what write ratio would you switch to LSM, and how would you migrate live?',
    ],
  },
  {
    id: 'design-cache', track: 'gate', title: 'Design a multi-level cache',
    prompt: `Design caching for a web service: L1 in-process, L2 Redis cluster, origin database. 1M RPS, 90% reads, strong consistency needed for payments but feeds can lag 60s.

Cover: per-layer policy (TTL vs LRU), consistency strategy per data class, stampede protection, invalidation flow, and failure behavior per layer.`,
    keyPoints: [
      { label: 'Layered policy', keywords: ['l1', 'l2', 'ttl', 'lru', 'tier', 'layer'], hint: 'Tiny TTLs in L1, longer in L2, per-class policies.' },
      { label: 'Consistency per class', keywords: ['consistent', 'invalidate', 'write-through', 'write-behind', 'eventual'], hint: 'Write-through/invalidate for payments; TTL-expiry for feeds.' },
      { label: 'Stampede protection', keywords: ['stampede', 'thundering', 'mutex', 'singleflight', 'jitter'], hint: 'Singleflight + TTL jitter stop cache stampedes on hot keys.' },
      { label: 'Invalidation flow', keywords: ['invalidate', 'purge', 'publish', 'subscribe', 'version'], hint: 'Versioned keys or pub/sub purges propagate writes to L1s.' },
      { label: 'Failure behavior', keywords: ['fallback', 'degraded', 'origin', 'circuit', 'timeout'], hint: 'L2 loss should degrade to origin with backpressure, not cascade.' },
    ],
    followUps: [
      'Payments read stale data once — walk me through the race.',
      'How do you size L2 memory, and what eviction metric proves the size?',
    ],
  },
  {
    id: 'design-rag', track: 'aiml', title: 'Design a production RAG system',
    prompt: `Design RAG over 10M company documents: hybrid retrieval, citations required, <2s p95 latency, daily doc updates, PII must never leak into answers.

Cover: chunking strategy, embedding + index choice, hybrid search fusion, reranking, context-budget management, citation enforcement, evaluation, update pipeline, and PII controls.`,
    keyPoints: [
      { label: 'Chunking and embeddings', keywords: ['chunk', 'embedding', 'overlap', 'semantic'], hint: 'Structure-aware chunks with overlap beat fixed-size splits.' },
      { label: 'Hybrid retrieval + fusion', keywords: ['hybrid', 'bm25', 'fusion', 'rrf', 'dense', 'sparse'], hint: 'BM25 + dense with RRF fusion covers keyword and semantic misses.' },
      { label: 'Reranking and context budget', keywords: ['rerank', 'cross-encoder', 'budget', 'truncate', 'top-k'], hint: 'Rerank top-50 down to top-5; budget tokens per chunk.' },
      { label: 'Citations and grounding', keywords: ['citation', 'ground', 'attribut', 'quote', 'faithful'], hint: 'Constrain generation to retrieved spans; verify quotes post-hoc.' },
      { label: 'Eval + freshness + PII', keywords: ['evaluat', 'recall', 'fresh', 'reindex', 'pii', 'redact', 'acl'], hint: 'Track retrieval recall + answer faithfulness; enforce ACLs at retrieval, redact PII.' },
    ],
    followUps: [
      'Faithfulness drops after a doc-format change — how do you detect and fix it?',
      'How do you serve per-team ACLs without one index per team?',
    ],
  },
  {
    id: 'design-recsys', track: 'aiml', title: 'Design a recommendation system',
    prompt: `Design recommendations for a video platform: 100M users, cold starts daily, explore/exploit balance, <100ms serving, retrain cadence, and fairness across creators.

Cover: candidate generation vs ranking split, features and labels, cold-start handling, online vs batch training, serving architecture, exploration, metrics, and creator fairness.`,
    keyPoints: [
      { label: 'Two-tower / two-stage split', keywords: ['candidate', 'ranking', 'two-tower', 'retrieval', 'rerank'], hint: 'Cheap candidate generation narrows millions to hundreds; a heavy ranker orders them.' },
      { label: 'Labels and objectives', keywords: ['label', 'watch time', 'ctr', 'multi-task', 'objective'], hint: 'Optimize long-term value (watch time), not just clicks.' },
      { label: 'Cold start', keywords: ['cold start', 'popularity', 'content-based', 'onboard'], hint: 'Content-based + popularity priors bootstrap new users and items.' },
      { label: 'Serving and freshness', keywords: ['serving', 'feature store', 'latency', 'online', 'fresh'], hint: 'A feature store with online updates keeps serving under 100ms.' },
      { label: 'Exploration and fairness', keywords: ['explor', 'bandit', 'fair', 'diversity', 'exposure'], hint: 'Bandits explore new creators; exposure floors guarantee fairness.' },
    ],
    followUps: [
      'Watch time is up but surveys say users are unhappy — what do you measure next?',
      'A new viral category floods training data overnight — how does the pipeline cope?',
    ],
  },
  {
    id: 'design-mlops', track: 'aiml', title: 'Design an ML platform (MLOps)',
    prompt: `Design the ML platform for 20 teams: experiment tracking, feature reuse, training at scale, safe deployment, drift detection, and cost control.

Cover: experiment + lineage tracking, feature store design, training orchestration, deployment strategies (shadow/canary), monitoring and rollback triggers, and cost attribution.`,
    keyPoints: [
      { label: 'Lineage and reproducibility', keywords: ['lineage', 'reproduc', 'version', 'tracking', 'mlflow'], hint: 'Version data, code, and configs together — every model must be rebuildable.' },
      { label: 'Feature store', keywords: ['feature store', 'offline', 'online', 'skew', 'point-in-time'], hint: 'Point-in-time correct offline + low-latency online views prevent train/serve skew.' },
      { label: 'Safe deployment', keywords: ['shadow', 'canary', 'rollback', 'a/b', 'champion'], hint: 'Shadow then canary with automatic rollback on guardrail metrics.' },
      { label: 'Drift and monitoring', keywords: ['drift', 'monitor', 'psi', 'ks', 'alert'], hint: 'Monitor input drift, prediction drift, and business metrics — not just loss.' },
      { label: 'Cost control', keywords: ['cost', 'spot', 'autoscal', 'quota', 'attribution'], hint: 'Spot instances, autoscaling, and per-team cost attribution.' },
    ],
    followUps: [
      'Two teams need conflicting versions of the same feature — how does the store handle it?',
      'A canary passes offline metrics but tanks revenue — what was missing?',
    ],
  },
];

export const BEHAVIORAL_PROMPTS: BehavioralPrompt[] = [
  {
    id: 'behav-conflict', track: 'all', title: 'Tell me about a technical disagreement',
    prompt: 'Describe a time you disagreed with a teammate about a technical decision. What was your position, how did you argue it, and what happened?',
    rubric: ['Specific situation with names/roles', 'Technical reasoning, not just opinion', 'Listened and adapted or escalated cleanly', 'Outcome + lesson learned'],
  },
  {
    id: 'behav-failure', track: 'all', title: 'Tell me about a failure',
    prompt: 'Tell me about a project or exam that went badly. What was your role, what went wrong, and what changed in how you work since?',
    rubric: ['Owns their part without excuses', 'Root cause, not just symptoms', 'Concrete changed behavior', 'Evidence it worked later'],
  },
  {
    id: 'behav-ambiguity', track: 'all', title: 'Working through ambiguity',
    prompt: 'Describe a time you had to deliver with unclear requirements. How did you decide what to build?',
    rubric: ['Clarifying questions asked early', 'Smallest shippable slice first', 'Feedback loop with stakeholders', 'Result tied to their actions', 'Handled a wrong guess well'],
  },
  {
    id: 'behav-leadership', track: 'all', title: 'Leading without authority',
    prompt: 'Tell me about a time you influenced a group outcome without being the official lead.',
    rubric: ['Context and stakes are clear', 'Specific influence actions taken', 'Result tied to their actions', 'Reflection on leadership style'],
  },
];

/** Coding challenges mapped per track (ids reference challenges.ts). */
export const TRACK_CODE: Record<InterviewTrack, string[]> = {
  sde: ['two-sum', 'valid-parentheses', 'merge-intervals'],
  gate: ['binary-search', 'bst-search', 'postfix-eval'],
  aiml: ['two-sum', 'edit-distance', 'merge-intervals'],
};

export const TRACK_META: Record<InterviewTrack, { title: string; goal: string; rounds: string[] }> = {
  sde: { title: 'SDE / Full-stack interview', goal: 'web-dev', rounds: ['Warm-up concepts', 'Live coding', 'Deep concepts', 'System design', 'Behavioral'] },
  gate: { title: 'GATE + systems viva', goal: 'gate-cs', rounds: ['Warm-up concepts', 'Problem solving', 'Deep concepts', 'Systems design', 'Behavioral'] },
  aiml: { title: 'AI/ML interview', goal: 'ai-ml', rounds: ['Warm-up concepts', 'Coding + math', 'Deep concepts', 'ML design', 'Behavioral'] },
};
