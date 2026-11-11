import type { TopicLesson } from "../topicLessons.js"; /** * System Design — 10 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const systemDesign: Record<string, TopicLesson> = {
  "web-dev-system-design-system-design-fundamentals": {
    intro: `System design is the practice of architecting software systems that work correctly, scale gracefully, and survive failure — the skill interviewers probe with scenarios like "design Twitter" and the craft every senior engineer practices daily. The subject is the method: requirements first (functional, non-functional, scale), capacity estimation, API design, data model, high-level design, deep dives, bottlenecks, and trade-offs spelled out honestly. before boxes and arrows, define what the system must do, how well, and at what scale — the rest is bookkeeping with taste.`,
    foundations: `Requirements: functional (use cases, APIs, entities) and non-functional (availability, latency, consistency, durability, security) plus constraints (budget, team, deadline). Capacity estimation: DAU → QPS (peak = avg × 3-10x), storage per row × rows, bandwidth, memory footprints — order-of-magnitude math with explicit assumptions. Framework (the interviewer-approved loop): requirements → API (resource shapes, auth) → data model → high-level diagram (clients, LB, services, stores, caches, queues) → scale & deep-dive (hot paths, sharding, replication) → bottlenecks & mitigations (SPOFs, cascading failures) → trade-offs stated aloud. Trade-off vocabulary: consistency vs availability (CAP), latency vs throughput, cost vs performance, buy vs build.`,
    concepts: [
      {
        title: "Requirements: the step most designs skip.",
        body: `Write functional requirements as verbs from the user's view ("post a tweet, view feed, follow") — everything else is inference. Non-functional: availability target (99.9% multi-AZ), latency budgets (feed p95 < 300 ms), consistency needs (edit-your-own within 1 s; others eventually), durability (zero loss), security (authn/z, PII). Scale guesses: DAU 10M, posts per user 1/day, feed reads 50/user — QPS read 6k, write 100s; storage/row 1 KB × 10 GB/day; bandwidth trivial; hot days 3x. Explicit assumptions let everyone contest numbers — contesting numbers is designing. Mis-scoped requirements produce mis-sized, mis-ordered systems — every postmortem of a "surprise outage" contains a requirement nobody wrote down.`,
      },
      {
        title: "Capacity estimation in five minutes.",
        body: `Order-of-magnitude with clean round numbers: 100M DAU, 10% write daily → 10M writes/day ≈ 120/s avg, peak ×5 = 600/s; reads 100/user ≈ 10k/s avg peak 30k/s. Storage: tweet ~300 B + metadata → ~500 B; 10M/day × 500 B = 5 GB/day, 5-year ~10 TB. Redis cache for hot entities; feed fan-out storage sized for celebrities; CDN egress math; connection counts to DB (pool!). Do the math on the whiteboard fast; interviewers want to see you derive, not recite; always sanity-check by dividing round numbers — estimation errors within 2x are fine; orders-of-magnitude wrong is disqualifying.`,
      },
      {
        title: "API design: the contract before the boxes.",
        body: `Define endpoints: POST /tweets { text, mediaIds }, GET /feed?cursor=&limit=, POST /follow/{userId}; auth via tokens; idempotency keys on writes; cursor pagination everywhere; versioned URLs; rate limits; error contract uniform. Write the entities too: users(id, handle), tweets(...). APIs expose your data model publicly — changing them is painful; review against use cases; keep them minimal (no field "just in case"); design for mobile clients (batched endpoints) vs partners (HATEOAS-ish discoverability) — know your consumers before freezing the contract.`,
      },
      {
        title: "High-level diagram: clients to data, no gaps.",
        body: `Walk left-to-right: client (web/mobile) → DNS → CDN (static, media) → LB (L4/L7) → app servers (stateless) → cache (Redis) → databases (read replicas) → object storage (media) → queues (async work) → search (Elasticsearch). Every box answers "what does this store/decide"; every arrow is a protocol (HTTPS, SQL, Redis protocol, Kafka). Add redundancy per tier, autoscaling notes, and failure modes (cache down? replica lag? AZ loss?). The diagram is a communication tool — it must be comprehensible in 90 seconds by a tired engineer at 3 AM; clutter kills understanding and hides SPOFs.`,
      },
      {
        title: "Deep dives and honest trade-offs.",
        body: `Pick 2-3 hardest components and go deep: fan-out on write vs read for feeds; sharding keys; hotspot mitigation; consistency choices with justification ("eventual everywhere except likes-for-me ledger"). State trade-offs: "fan-out on write wins for read-heavy Twitter; celebrity tweets switch to pull at runtime" — defend it. Bottlenecks & mitigations: single DB → replicas; media → CDN; compute hot path → cache + async; cascading failures → timeouts, retries+jitter, circuit breakers, load shedding. Failure modes: enumerate what degrades and how users see it; a design with no discussed failure modes is not a design, it is a diagram.`,
      },
    ],
    worked: [
      {
        title: "Estimate Twitter-scale numbers in ten minutes.",
        body: `DAU 250M → tweets/day 60M (0.25/user) ≈ 700 writes/s avg, peak 2-3k/s; reads 10B/day ≈ 115k/s; storage 60M × 280 B ≈ 17 GB/day + media; media dominates egress → CDN; feed fan-out: average user 200 followers → 12B writes/day of feed entries — infeasible naive; hybrid (push for <1k followers, pull for celebrities) collapses to ~120M writes/day ≈ 1.4k/s — feasible; cache hot profiles; this is why the celebrity split exists — write amplification, not cleverness.`,
      },
      {
        title: "Design a pastebin in the framework order.",
        body: `Requirements: create paste (≤ 10 MB text/blob), get by short link, optional expiry, syntax highlighting later-nice-to-have; scale: 5M new pastes/day peak ~120/s, reads 100x → 12k/s peak; API: POST /paste { content, ttl } → 201 { url }, GET /p/:id; entities: pastes(id, short_id, blob_ref, expires_at); short_id base62 7 chars from counter service (no collisions, no coordination); hot pastes cached in Redis (80% hit); storage: S3 blobs + Dynamo metadata by id; expiry via TTL indexes; rate limit per IP; analytics async via queue; failure: metadata down → serve from cache stale; done in 45 minutes — framework preserved.`,
      },
      {
        title: "Find the SPOF in a two-tier web stack.",
        body: `Single app instance + single Postgres primary + no cache. Enumerate: app down → 100% down (fix: 2+ instances + LB health checks + autoscaling); primary DB failure → total stall (fix: synchronous replica + auto failover; or managed RDS Multi-AZ); schema change deploy blocks writes (expand-contract); cache absence amplifies DB load at traffic spikes (add Redis); monitoring absent (nobody notices at 3 AM — add RED metrics + alerts); each fix mapped to a concrete failure; the diagram now degrades gracefully instead of catastrophically.`,
      },
    ],
    exam: [
      {
        question: "Why start with requirements instead of boxes and arrows?",
        answer:
          "Every downstream decision — storage, replication, caching, API shape — derives from requirements; starting with components builds a system optimized for nothing in particular; requirements are the objective function; a beautiful diagram serving the wrong constraints fails reviews and production.",
      },
      {
        question:
          "What does order-of-magnitude capacity estimation actually buy you?",
        answer:
          "It prunes impossible architectures before you draw them: 50k QPS says no single-node design covers it; TB/day says object storage not local disk; MB-scale rows say index discipline — estimates constrain choices to feasible regions, and being wrong by 2x rarely changes the architecture while right-by-order changes everything.",
      },
      {
        question:
          "Why is a design without discussed failure modes considered incomplete?",
        answer:
          "Systems live in partial failure — a design that does not enumerate degradation paths simply has not been thought through; interviewers and users both trust the design that knows its weaknesses; graceful degradation (stale reads, queued writes, read-only mode) is often the feature that preserves the business during the incident.",
      },
      {
        question:
          "What is the difference between latency and throughput goals?",
        answer:
          "Latency is per-request delay (p95/p99) experienced by users; throughput is total work/time (rps, writes/s); you can raise throughput by batching and pipelining while worsening latency, or sacrifice throughput for tail latency; state both explicitly, because they trade against each other and against cost.",
      },
    ],
    cheat: [
      "Framework: requirements → estimation → API → data model → HLD → deep-dives → trade-offs.",
      "DAU → avg QPS (÷86k), peak ×3-10; storage/row × rows; bandwidth egress.",
      "API contracts: noun resources, cursor pagination, idempotency keys, versioning.",
      "HLD: client → CDN → LB → stateless apps → cache → DB replicas → storage/queue.",
      "Deep-dive the hardest 2-3 parts; state consistency and fan-out choices explicitly.",
      "Name SPOFs; mitigation per tier; graceful degradation, not doom.",
      "Latency vs throughput vs consistency — pick and defend per component.",
    ],
    recap: `System design is requirement-first architecture: quantify users, traffic and storage; design APIs and entities before boxes; connect clients through CDN, LB, stateless apps, caches, and stores with redundancy and failure modes named; go deep on the hard parts and defend every trade-off aloud; estimation prunes infeasible designs, and explicit failure analysis separates diagrams from engineering.`,
    code: {
      title: "Order-of-magnitude QPS worksheet",
      language: "text",
      code: `DAU=100M | writes=5M/day(~60/s, peak 300) | reads=2B/day(~23k/s, peak 70k/s) | storage=5M*600B=3GB/day`,
      explanation:
        "Rounded arithmetic with explicit numbers lets anyone contest the assumptions in seconds — estimation is communication, not precision.",
    },
    diagram: {
      title: "System design framework",
      caption: "Requirements to reality.",
      mermaid: `flowchart LR\n R[Requirements] --> E[Estimation]\n E --> A[API + model]\n A --> H[High-level design]\n H --> D[Deep dives]`,
    },
  },
  "web-dev-system-design-load-balancing-and-cdns": {
    intro: `Load balancing distributes traffic so each node stays healthy and the system survives node loss; CDNs do the same for content, placing bytes close to users at the edge. The subject is their layers — L4 vs L7, consistent hashing, health checks, session persistence, TLS termination, and global traffic steering — plus CDN cache design for static and dynamic content. everyone hits capacity through the same door, so the door is where you engineer for survival.`,
    foundations: `L4 LB works at TCP/UDP (fast, dumb, no content inspection); L7 at HTTP (routing by path/host/headers, retries, auth, WAF hooks). Algorithms: round-robin, least-connections, weighted, IP hash, consistent hashing for caches/shards (node add/remove moves only k/n keys). Health checks: TCP connect, HTTP status, or deep checks (DB ping) with intervals and removal thresholds. Session persistence: sticky sessions (cookie-based) or stateless with shared store (Redis) — prefer stateless. CDN: origin pull, cache keys by URL+headers, edge locations, TTL/SWR, signed URLs for private media, DNS routing (latency/geo). TLS termination at LB with cert management (ACM/Let's Encrypt), h2/h3, Brotli.`,
    concepts: [
      {
        title: "L4 vs L7 and where each belongs.",
        body: `L4 (AWS NLB, HAProxy TCP): kernel-speed pass-through, no content parsing — for raw throughput, long-lived connections (WebSocket), non-HTTP protocols; it sees IPs and ports only. L7 (ALB, NGINX, Envoy, Cloudflare): understands HTTP — path-based routing (/api → api service, /static → CDN), weighted canary splits, header-based auth offload, WAF integration, retries, observability at request level. Default: L7 at the edge of the app, L4 inside for raw/fast paths or when you need to forward protocols; cost and latency differ — L7 does real work per request, L4 almost none.`,
      },
      {
        title: "Algorithms and consistent hashing.",
        body: `Round-robin for homogeneous stateless fleets; least-connections when requests vary in cost; weighted for heterogeneous capacity (new instance warm-up); IP/URL hash for cheap affinity; consistent hashing maps (hash(key) mod ring) to nodes — adding/removing a node moves only ~1/n of keys, critical for cache sharding and DHTs vs modulo hashing which reshuffles everything on change. Virtual nodes (150+ points per physical node) smooth imbalance; bounded-load consistent hashing caps skew when one key is a celebrity.`,
      },
      {
        title: "Health checks, draining, and zero-downtime.",
        body: `Checks must be deep enough to catch half-dead processes (HTTP 200 vs DB-dependent readiness) but cheap and frequent (2-5 s); failed N checks → remove from rotation; recovery → re-add gradually (slow start to avoid thundering herd on a cold box). Connection draining: on deploy/deregister, stop new, finish in-flight (or 30 s timeout), then kill — no dropped requests. Graceful LB + app lifecycle coordination (readiness probe 503 during drain) is the mechanical heart of zero-downtime deploys.`,
      },
      {
        title: "CDN: cache architecture at the edge.",
        body: `Cache keys: scheme+host+path (+selected Vary) — avoid Vary: *; canonicalize query strings; static assets hashed in filename → max-age=31536000 immutable. Dynamic: s-maxage + SWR for public pages, edge-include/personalization at edge compute (Workers/Cloudflare) for logged-in shells; signed cookies/URLs for private content with short TTLs; image optimization on the fly; origin shield in front of multi-region origins to collapse cache misses; purge APIs (or versioned URLs) on publish; monitor hit ratio and origin offload — 95%+ is normal for good CDN hygiene.`,
      },
      {
        title: "Global traffic and failover.",
        body: `DNS latency/geo routing sends users to nearest healthy region; health-aware endpoints flip traffic on outage (Route53/NS1/Cloudflare); active-passive cross-region for regional failure (auto-failover with DNS TTL ≤ 60 s + connection draining); active-active behind global anycast LB for multi-region champions; session stickiness preserved at global layer via consistent hashing or replicated session store; RPO/RTO defined per tier; chaos drills kill a region quarterly — untested failover is failover-in-name-only.`,
      },
    ],
    worked: [
      {
        title: "Cut origin traffic 80% with CDN + headers.",
        body: `Site served 100% from origin. Changes: static assets fingerprinted → immutable year TTL; HTML pages → s-maxage=60, stale-while-revalidate=30; media → signed URLs, cache-forever; API cacheable lists → s-maxage=5 with surrogate keys purge-on-publish; Vary trimmed to Accept-Encoding only; origin shield enabled; result: hit ratio 92%, origin QPS 25k→2k, p75 TTFB 600→90 ms globally; cost delta: +$180 CDN −$600 origin savings; the CFO heard about it in cost review, approvingly.`,
      },
      {
        title: "Rolling deploy without dropping a connection.",
        body: `ALB + ECS rolling deploy: new tasks pass startup probe → join target group; old tasks get deregistration → LB stops sending new → tasks finish in-flight → stop healthy events → terminate after drain timeout; health check curl every 2 s per task; the one time drain was skipped, a deploy lost 40 in-flight uploads — the config now mandates drain ≥ 30 s and smoke tests assert zero 5xx during deploy hour; postmortem phrase: "deployment is a feature people use daily, treat it like one".`,
      },
      {
        title: "Shard caches with consistent hashing after a node dies.",
        body: `Redis cluster with modulo hashing lost 60% of cache keys on one node removal — hit ratio collapse, DB almost went down. Migration: client-side consistent hashing (ketama ring, 150 vnodes/node); adding a node moved only 20% of keys and cluster absorbed it online; before the switchback, we rehearsed node-kill game days; the ring survived every deletion smoothly; final lesson documented: modulo hashing is for fixed clusters only, rings for the real world — the difference between a blip and an outage.`,
      },
    ],
    exam: [
      {
        question: "When do you choose L4 over L7 at the entry layer?",
        answer:
          "For raw TCP/UDP throughput, non-HTTP protocols, and long-lived connections where parsing overhead matters (game backends, tunnels); otherwise L7 — routing, auth, WAF, retries, and per-request metrics at the edge are worth the modest per-request cost for HTTP services.",
      },
      {
        question: "What problem does consistent hashing solve and how?",
        answer:
          "It minimizes key reshuffling when nodes change: hash(key) maps to a ring; each key binds to the next node clockwise; removing/adding a node remaps only its arc (~1/n of keys) — vs modulo where the entire keyspace redistributes, devastating cache and shard locality.",
      },
      {
        question: 'Why must health checks be deeper than "port open"?',
        answer:
          "A process can accept TCP while wedged — deadlocked event loop, exhausted pool, failed dependency; deep checks (local HTTP 200 including a DB ping or queue drain) catch the half-dead state and stop sending traffic to it before users do.",
      },
      {
        question:
          "What does stale-while-revalidate accomplish for semi-static pages?",
        answer:
          "After TTL expiry the edge serves the stale copy instantly while asynchronously revalidating with the origin — users never wait on regeneration, and traffic spikes after expiry are absorbed coherently instead of a miss storm; the origin sees smooth traffic; staleness is bounded by design.",
      },
    ],
    cheat: [
      "L4 = fast dumb pass-through; L7 = routes, auth, WAF, metrics.",
      "Least-connections for skewed cost; round-robin for uniform; ring hashing for caches/shards.",
      "Deep health checks; deregister → drain → kill; slow-start on re-add.",
      "CDN keys: host+path, minimal Vary; immutable fingerprinted assets; s-maxage+SWR for public dynamic.",
      "Signed URLs for private media; origin shield collapses misses.",
      "DNS anycast failover for regions; drain during deploys; TTL ≤ 60 s.",
      "Measure hit ratio and origin offload — 92%+ is table stakes.",
    ],
    recap: `Load balancing and CDNs are the traffic tier of every serious system: L4 for raw flow, L7 for HTTP intelligence; consistent hashing keeps caches and shards stable through change; deep health checks and draining make deploys invisible; CDNs with correct cache keys and SWR push bytes to the edge — together they turn single nodes into fleets and continents into caches, with failover rehearsed rather than prayed for.`,
    code: {
      title: "Nginx L7 path routing snippet",
      language: "text",
      code: `location /api/ { proxy_pass http://api_backend; }\nlocation / { proxy_pass http://web; }`,
      explanation:
        "Path-based L7 split — API and frontend scale independently behind one entry; LB health checks per upstream keep half-dead backends out of rotation.",
    },
    diagram: {
      title: "Request path through traffic tiers",
      caption: "Client to edge to origins.",
      mermaid: `flowchart LR\n U[User] --> D[DNS anycast]\n D --> C[CDN edge]\n C --> L[L7 LB]\n L --> S[App servers]`,
    },
  },
  "web-dev-system-design-caching-at-scale": {
    intro: `Caching at scale is the layered strategy of keeping hot data close to compute — browser, CDN, edge, service, database — so your origin breathes and your users fly. The subject is the architecture and the hazards: cache hierarchies, eviction policies, thundering herds, request coalescing, and CDN design for massive read-heavy surfaces. when 90% of your reads can be answered from cache, your system cost drops 10x for the same capacity.`,
    foundations: `Layers by proximity: browser cache (max-age, ETag), CDN/edge (s-maxage), in-memory in-process (LRU), distributed cache (Redis/Memcached), database buffer pool. Hit ratio is the health metric; miss storms are the failure mode. Patterns: cache-aside (most common), read-through, write-through, write-behind. Eviction: LRU/LFU/TTL; size by working set; stampedes on expiry (jitter, SWR, singleflight, lock). Request coalescing: collapse concurrent identical requests into one origin call. Invalidation: TTL, versioned keys, event bust. Negative caching for missing keys (with short TTL). Cache warming for deploys/traffic spikes.`,
    concepts: [
      {
        title: "Designing the hierarchy: what goes where.",
        body: `Browser: immutable static assets (fingerprinted, year TTL) and cautiously HTML with short TTL; CDN: everything publicly readable cacheable at the edge; Redis: entities read thousands of times per write (profile, pricing, config); in-process: tiny hot dicts (lookup tables) with short TTL to save network hops. Allocate by staleness tolerance × read:write ratio; the cost ladder sends a hit at the browser at ~0 cost, edge at pennies, Redis at sub-millisecond, DB at slowest+costliest; push every byte as far left as the contract allows.`,
      },
      {
        title: "Eviction, expiry, and the herd.",
        body: `Capacity planning: hot set must fit in Redis (measure key counts × avg value); LRU for general, LFU for skewed popular keys; volatile-ttl on cache instance; maxmemory with allkeys-lru baseline. TTL strategies: fixed (60-300 s), jittered (base ± 20%) to avoid synchronized expiry; SWR: serve stale while refreshing behind (CDN and Redis); singleflight/in-flight dedup in app: one recompute, N waiters; SETNX lock for cross-node dedup; negative caching: cache the miss for 30-60 s so repeated misses don't hammer DB; locks must always be token-checked on delete.`,
      },
      {
        title: "Request coalescing and graceful degradation.",
        body: `Coalescing: identical concurrent requests share one origin call (Go singleflight, Node in-flight map, nginx proxy_cache_lock); effective under flash crowds (marketing link, HN front page); protects DB from 100x baselines. Degradation modes: serve stale on origin error (or 503 with Retry-After), circuit-break around the cache layer so Redis failure → direct DB with shedding, degrade features not availability (hide recommendations before core search). Measure: coalesced requests count proves herd prevention; dead-cache drills quarterly.`,
      },
      {
        title: "CDN for scale: patterns and pitfalls.",
        body: `Patterns: origin shield (one POP revalidates, rest pull from it — tames misses for multi-region), tiered caching, cache tags/surrogate keys for surgical purging, edge KV (Workers KV) for config, edge compute for personalization without origin hits, image/auto-video optimization, HTTP/3; Pitfalls: uncacheable Vary pollution kills hit ratio; cookies sent to edge bypass caching (strip at edge); query-param cache-busting variants multiply keys (normalize); purging on every publish is fine with surrogate keys, but keyed invalidation bugs strand stale content — test purge in prod-like before relying; measure real hit ratio outside staging (synthetic 100% hits lie).`,
      },
      {
        title: "Key design and serialization.",
        body: `Keys encode identity + version: entity:{id}:v{n} or with tenant prefix {tenant}:user:{id} — co-locates tenant keys in cluster slots (hash tags); avoid unbounded cardinality (car IDs per combination — attacker-generated infinite keys; cap via hashing or LRU caps); values serialized consistently (JSON or MessagePack — not mixed); compress > 1 KB; store TTLs; monitor keyspace by prefix with Redis memory stats; integrity: version bumps flip atomically after deploy — a cleaner invalidation than deletion sweeps; document every cache's staleness budget and owner.`,
      },
    ],
    worked: [
      {
        title: "Take a product-listing page from 1.2 s to 60 ms.",
        body: `Layers applied: images pre-resized to CDN with immutable keys; HTML → s-maxage=120 + SWR=30; JSON catalog fragment → Redis 60 s cache-aside (hit rate 94%); DB query → index on (tenant, updated_at) with replica read; result p75 60 ms, origin trips only on misses ~6%, CPU down 70%; invalidation: publish webhook purges surrogate keys listing:{tenant}:*; rollback story: prior HTML by version query-param during incidents; cost neutral within two weeks.`,
      },
      {
        title: "Stop a cache stampede after a deploy.",
        body: `Symptom: every deploy expired 40k hot keys at once → DB CPU 100% for 4 minutes → site wobbled. Postmortem fixes: jittered TTLs; SWR so stale serves during recompute; singleflight in handler; warming script re-seeds top 500 keys right after deploy from a snapshot task; next release wave passed cleanly with zero DB blips; lesson: expiry is a design event, not a timer default — chaos-test your own cache.`,
      },
      {
        title: "Recover from Redis losing all memory pressure eviction.",
        body: `allkeys-lru under memory starvation evicted 30% of sessions and rate counters — users logged out, limits forgotten. Fix: split instances by concern — sessions: volatile-lru small instance with noeviction replacement policy lessons; counters/limits: separate Redis with noeviction and tight TTLs; cache proper: allkeys-lru; sizing by measured working set + 40% headroom; alerts on evicted_keys; runbook: degrade to DB reads, drop limits fail-open for known-safe routes only; documented and game-dayed since.`,
      },
    ],
    exam: [
      {
        question: "What is request coalescing and when does it save you?",
        answer:
          "Multiple identical concurrent requests share one backend computation instead of each hitting origin — it collapses flash-crowd damage (front-page links, deploy expiry storms); in-flight maps per process or proxy-side locks dedupe; the backend sees one miss; everyone else waits on that one result.",
      },
      {
        question: "Why jitter TTLs on a cache with many keys?",
        answer:
          "Fixed TTLs synchronize expiry — entire cohorts of keys expire in the same second, an artificial miss storm; jitter spreads regeneration smoothly, flattening origin load and hiding the hiccup distribution from users entirely.",
      },
      {
        question:
          "What is the practical difference between read-through and cache-aside?",
        answer:
          "Cache-aside puts population logic in the app (miss → load → set): simple, bypassable, explicit — but two code paths must agree. Read-through makes the cache itself load on miss (self-healing, one path) at the cost of coupling the cache with data-source awareness; read-through shines for simple KV sources, cache-aside for complex graphs.",
      },
      {
        question:
          "Why is caching private (per-user) data in shared tiers an incident waiting?",
        answer:
          "Shared caches serve by key; absent per-user keying/vary, one user receives another's response — privacy breach at scale; private data needs private caches (no shared layer or per-user keys) with authorization evaluated before serving — never optimize privacy away for milliseconds.",
      },
    ],
    cheat: [
      "Hierarchy: browser → CDN → Redis → in-process → DB buffer; push left.",
      "Hit ratio is the metric; negative cache misses briefly.",
      "Jitter TTLs; singleflight/locks; SWR; stale-on-origin-error.",
      "Eviction: allkeys-lru for general; noeviction for correctness keys.",
      "Origin shield + surrogate keys for CDN purge of lists.",
      "Key = identity + version + tenant hash-tag; cap cardinality.",
      "Warm top keys post-deploy; load-test your own invalidation.",
    ],
    recap: `Caching at scale is a layered system of budgets, not a single Redis box: browsers and CDNs carry the free capacity, Redis the computed hot set, with singleflight, jitter, SWR and negative caching taming the herd; eviction policies match data semantics, keys encode tenant and version, and private data never touches shared tiers; measure hit ratios, test expiry storms, and drill the dead-cache day — because the cache is not optional decoration, it is the system.`,
    code: {
      title: "In-flight dedup skeleton",
      language: "javascript",
      code: `const inflight = new Map();\nasync function load(k) {\n if (inflight.has(k)) return inflight.get(k);\n const p = fetchAndStore(k).finally(() => inflight.delete(k));\n inflight.set(k, p); return p;\n}`,
      explanation:
        "Concurrent same-key callers await the single computation; the entry cleans up on settle; origin sees one miss per key per wave — herds impossible by construction.",
    },
    diagram: {
      title: "Cache hierarchy",
      caption: "Latency and cost fall to the left.",
      mermaid: `flowchart LR\n B[Browser] --> D[CDN]\n D --> R[Redis]\n R --> D2[DB]`,
    },
  },
  "web-dev-system-design-sql-vs-nosql-at-scale": {
    intro: `SQL vs NoSQL at scale is the decision every large system faces: strong relational guarantees with a bounded scale-out story, or flexible schema and massive horizontal scale with weaker consistency. The subject is how to choose and combine them — sharding, replication topologies, consistency models, and the pragmatic hybrid patterns most production systems actually use. the question is never "which is better" — it is "which guarantees can this workload not live without, and which can it not live with".`,
    foundations: `SQL (Postgres/MySQL): schemas, ACID, joins, strong consistency per node, vertical scaling + read replicas + sharding complexity; best for financial ledgers, orders, relational integrity. NoSQL: document (MongoDB), key-value (DynamoDB/Redis), wide-column (Cassandra/Scylla), graph (Neo4j) — horizontal sharding native, eventual consistency common, schema flexibility, high write throughput; best for feeds, events, time series, session/cart data. Replication: leader→follower async (lag) or sync (slow), multi-leader (conflict resolution), leaderless quorums (Dynamo-style W+R>N). CAP: pick under partition — C or A. PACELC: even without partitions, latency vs consistency.`,
    concepts: [
      {
        title: "When SQL is not negotiable.",
        body: `Money and inventory: ledgers needing atomic multi-row transactions, FK integrity, unique constraints — Postgres with serializable isolation; audit requirements (immutable append logs reconciled); reporting with arbitrary ad-hoc joins; regulatory schemas. Scale ceiling: a well-tuned Postgres does billions of rows and 50-100k TPS with partitioning + replicas; sharding SQL is doable (Citus, Vitess, app-level) but costly — do it when single-primary writes genuinely saturate. Until measured saturation: SQL wins on operability; most "NoSQL scale panic" was premature — fix indexes and connection pools first, breathe later.`,
      },
      {
        title: "When NoSQL is the right tool.",
        body: `Write-heavy append workloads (events, logs, telemetry, clickstream): Cassandra/Scylla excel at massive write throughput and TTL expiry; time-series (Influx/Timescale — timescale is Postgres extension, best of both); key-value sessions/carts (DynamoDB with single-digit-ms, predictable ops); document stores for rapid-evolving shapes (catalogs, user profiles with varied attributes) — MongoDB with validators; search-ish graph traversals → Neo4j. Consistency: accept eventual for counters/feeds (merge with CRDT-ish patterns or last-write-wins consciously); keep money in SQL.`,
      },
      {
        title: "Sharding strategies and hot keys.",
        body: `Hash sharding spreads evenly but kills range scans and local joins; range sharding keeps ranges together (time-series by day) but risks hot shards (today's partition, celebrity); directory-based lookup = flexibility, extra hop; consistent hashing for cache-like growth. Hot keys: a celebrity"s partition saturating its shard — mitigate with key salting (shard key + bucket suffix 0-9), caching the hot key at Redis, splitting the entity (hot profile replica). Resharding without downtime: dual-write + backfill + flip reads + cleanup — the same expand-contract discipline as schema migrations.`,
      },
      {
        title: "Replication topologies and reads.",
        body: `Single leader → N followers: leader reads guaranteed fresh, follower reads stale-able with lag monitoring; route read-only traffic to replicas by default (report queries, lists), reserve leader for writes and consistency-critical reads; async replication for throughput, sync for zero-data-loss when latency allows; multi-leader for multi-region writes (accept conflict resolution: LWW, CRDTs, or application merge); leaderless quorum (DynamoDB-style): W+R>N gives tunable consistency; replication lag metrics are first-class SLOs (seconds by default policy); failover promotion scripts tested quarterly, or managed (RDS/Aurora) — self-managing failover at 3 AM builds character you do not want.`,
      },
      {
        title: "Hybrid and migration patterns.",
        body: `Real systems blend: Postgres for core ledger, Redis for sessions/cache, Elasticsearch for search, Kafka for events, S3 for blobs, DynamoDB for huge KV — a polyglot persistence philosophy, not a purist one. CD C (change data capture — Debezium) keeps stores in sync without dual-write bugs: write to Postgres, stream changes to search/elastic/analytics; migration path SQL→NoSQL: shadow-write, backfill, compare reads, flip, cleanup — same expand-contract rigor; document consistency guarantees per store in the architecture doc — the day you cannot state each store\'s consistency model is the day incidents begin.`,
      },
    ],
    worked: [
      {
        title: "Choose stores for an e-commerce rebuild.",
        body: `Orders/payments → Postgres (transactions, inventory consistency, audits). Catalog → MongoDB (variable product attributes, editorial flexibility) — actually Elasticsearch overlays it for faceted search. Sessions/carts → Redis (fast, TTL). Events/clickstream → Kafka → ClickHouse for analytics. Media → S3 + CDN. Stock counter → Redis with periodic Postgres reconciliation (flash-sale oversell prevented by conditional decrement + DB guard). Outcome: 99.95% availability, p95 < 300 ms, zero double-charges — polyglot by workload, not fashion; one page architecture doc lists guarantees per store.`,
      },
      {
        title: "Shard a 40 TB events table live.",
        body: `Range-partition by month (natural locality, cold months archived to Glacier); each partition hash-sharded by (event_type, user_id) 64 ways — no single partition dominates; dual-write during migration; backfill by month; reads flip per month; old table frozen and dropped after verification; hot "today" partition split into ingress + 7 pre-allocated buckets rotated hourly (preempt hotspots); the whole migration ran four weekends with zero downtime and zero lost events; cutover evidence archived for the auditors.`,
      },
      {
        title: "Fix replication-lag-induced phantom carts.",
        body: `Symptom: user adds item, refreshes, cart shows empty — read-your-writes broken via replica 3 s lag. Fixes: route mutations + immediate subsequent reads to leader for 5 s (per-session stickiness); scale replica sync or use quorum reads for cart endpoint; alert on lag > 500 ms with auto-failover off-replica; the bug class revealed that the read path never knew about write recency — a reminder that consistency is an API trait, not a database checkbox.`,
      },
    ],
    exam: [
      {
        question:
          "What does W + R > N guarantee in a quorum system, and what does it not?",
        answer:
          "It guarantees read-after-write consistency (read quorum intersects write quorum, seeing at least one fresh copy); it does not guarantee monotonic or causal consistency by itself; tunable knobs exist: stronger W for durability, stronger R for read freshness — cost rises on both.",
      },
      {
        question:
          "Why is sharding SQL usually a last resort rather than a starting posture?",
        answer:
          "Sharding breaks joins, foreign keys, and transaction scope across shards; the application inherits routing, rebalancing, cross-shard queries — years of complexity; exhaust connection pooling, indexes, partitioning-vertical scaling, replicas and archiving first; shard only measured write-throughput saturation.",
      },
      {
        question:
          "When does eventual consistency become acceptable for money-adjacent data?",
        answer:
          'Never for the ledger itself; acceptable for derived/caches: display balance (flagged approximate, corrected on refresh), loyalty points displays, recommendations; the authoritative record stays strongly consistent; UIs reconcile with a "confirming" state rather than lie about the number.',
      },
      {
        question:
          "How do you prevent double-charges in a multi-store checkout flow?",
        answer:
          "Idempotency keys propagated end-to-end (API → worker → provider), plus conditional atomic transitions in the ledger (PENDING → CAPTURED only from pending), plus reconciliation jobs against the PSP daily — store-in-cache status is a hint, ledger transition is the truth.",
      },
    ],
    cheat: [
      "SQL for integrity + transactions; NoSQL for write scale + flexible shapes.",
      "Scale order: pool → index → vertical → replicas → archive → shard (last).",
      "Shard by hash for even, range for locality, salting for hot keys.",
      "Consistent hashing for cache growth without reshuffles.",
      "Replication: leader reads fresh, followers lag — lag metrics are SLOs.",
      "CDC (Debezium) keeps SQL truth flowing into search/analytics honestly.",
      "Polyglot by workload; document the consistency model per store.",
    ],
    recap: `SQL vs NoSQL is a guarantee-matching exercise: relational ACID where correctness is non-negotiable, document/KV/wide-column where scale demands it; scale vertically, pool, index, replicate before sharding; shard by access pattern with salting for hotspots; use CDC instead of dual writes for cross-store truth; and hold each store to its declared consistency model with documented APIs for recency — because the worst architecture is the one nobody can explain.`,
    code: {
      title: "CDC-driven search sync sketch",
      language: "text",
      code: `INSERT/UPDATE/DELETE -> WAL -> Debezium -> Kafka topic -> search indexer (idempotent) -> upsert/delete`,
      explanation:
        "The database remains the single source; derived stores consume the log; no app-level dual write to forget; replayable from offset — recovery is a Kafka read-back.",
    },
    diagram: {
      title: "Polyglot persistence map",
      caption: "Right store per workload.",
      mermaid: `flowchart LR\n P[Postgres: ledger] --> E[Elasticsearch: search]\n P --> R[Redis: cache]\n P --> K[Kafka: events]`,
    },
  },
  "web-dev-system-design-message-queues-and-streaming": {
    intro: `Message queues decouple producers from consumers so systems absorb spikes, recover from failures, and process asynchronously; streaming platforms (Kafka) generalize messaging into a persistent, replayable log for event-driven architectures. The subject is choosing and operating them — Kafka, RabbitMQ, SQS, delivery semantics, backpressure, idempotency, transactional outbox, and stream processing — without cargo-culting "just add Kafka". queues turn synchronous brittle couplings into asynchronous resilient flows — at the cost of eventual consistency and new failure modes you must design for.`,
    foundations: `Queues: broker holds messages; consumers pull/ack; visibility timeout; retries + DLQ. Kafka: partitioned append-only log; producers write to topic partitions; consumer groups share partitions (horizontal scale); offsets per group; retention configurable (forever possible); ordering only within a partition; delivery semantics: at-most-once (offset commit first), at-least-once (commit after processing — standard), effectively-once (idempotent producer + transactions). SQS: simple managed queue; Kafka: throughput + replay; RabbitMQ: routing patterns + priorities; Pulsar: multi-tenancy. Backpressure: queues absorb bursts; monitor depth; scale consumers; shed load early. Transactional outbox solves dual-write-to-DB-and-broker atomicity.`,
    concepts: [
      {
        title: "Choosing the broker for the job.",
        body: `SQS (or managed equivalents): zero ops, at-least-once, no replay long-term, great for decoupling work pools and simple pipelines — start here when unsure. RabbitMQ: rich routing (exchanges, topics), priorities, RPC-ish patterns, lower throughput but flexible topology, great for task queues with routing needs. Kafka: millions of msgs/s, replay from any offset, retention unlimited, ecosystem (streams, Connect, schema registry) — the default for event backbones, analytics, and multi-consumer fan-out; needs partition planning (order within key). Pulsar/Kinesis similar class. Do not Kafka a cron job; do not SQS an event-sourcing backbone.`,
      },
      {
        title: "Delivery semantics and idempotency.",
        body: `At-most-once: commit before process — message may vanish. At-least-once: process then commit — duplicates on failure; the default contract; design consumers idempotent: dedupe by message id in Redis/DB (setnx with TTL), upsert by natural key, or offset-reprocessing safety; effectively-once: Kafka idempotent producer + transactions across partitions — narrows but doesn't cross side-effect boundaries; external systems (payments, emails) need idempotency keys regardless. Rule: assume duplicates, assume reorders; code so both are harmless.`,
      },
      {
        title: "The transactional outbox pattern.",
        body: `Problem: write to DB then publish to broker — crash between → lost events. Solution: write the event row into an outbox table in the SAME DB transaction as the business change; a relay (Debezium CDC or polling publisher) reads outbox and publishes; consumers dedupe; exactly-once semantics for the hand-off boundary; outbox rows cleaned after publish; ordering per aggregate via partitioning on aggregate id. Invariants: outbox insert cannot fail without the business txn rolling back — the atomicity you actually get; CDC the WAL is the zero-polling variant.`,
      },
      {
        title: "Backpressure, partitioning, and ordering.",
        body: `Queue depth is the universal backpressure signal — autoscale consumers on it; reject/shed early (429 + Retry-After) at the door before the queue melts; producers with bounded buffers and drop-oldest/drop-new policy per business tolerance. Kafka partitioning: key = aggregate id → strict order per entity, parallel across entities; hot keys → salt sub-partitioning; partitions sized for peak consumer count; over-partition up front (repartition is painful mid-flight). Rebalancing: consumer groups rebalance on join/leave — during rebalances processing pauses; keep group stable with sticky cooperative rebalancing; monitor lag per partition (a single stuck partition = one hot shard).`,
      },
      {
        title: "Stream processing and schemas.",
        body: `Simple: consumers read, transform, write (ETL per event). Real: Kafka Streams/Flink for stateful processing — windows, joins, aggregations (counts per minute, sessions); exactly-once within the framework; interactive queries. Schema registry (Avro/Protobuf) enforces compatibility — producers cannot break consumers; evolve with additive changes only; dead-letter malformed messages with alerting; reprocessing = rewind offsets — replay is the killer feature for rebuilding derived state after bugs; snapshot topics to new versions, blue/green consumers, migrate.`,
      },
    ],
    worked: [
      {
        title: "Replace a synchronous email call with a queue.",
        body: `Signup endpoint called SMTP synchronously — 2 s added latency, timeout-induced 502s when the provider browned out, and double-emails on retries. Change: INSERT user + outbox event in one tx → 201 immediately; relay publishes to SQS → worker sends with idempotency key derived from (user_id, event_id) → DLQ after 3 attempts → alert on DLQ depth; latency 2 s → 40 ms p95; email provider outage now invisible to signups (queued 3 h, drained after recovery); zero lost confirmations; the pattern applied to invoices and webhooks the same week.`,
      },
      {
        title: "Absorb a 40x flash sale with queues.",
        body: `Vendor drop: 30k orders/min vs 800 backend capacity for payment capture. Edge rate limiter admitted 2k/min bursts; intake API wrote order PENDING to Postgres + outbox → Kafka orders topic, 48 partitions keyed by order_id; workers scaled to 24 consumers; capture rate-limited at PSP token-bucket 1k/min — queue absorbed the difference; customers saw "confirming payment" within seconds; zero site errors; analytics (counts by minute) streamed from the same topic; postmortem lesson: the queue was the capacity plan.`,
      },
      {
        title: "Rebuild a corrupted search index by replay.",
        body: `Mapping bug dropped price field from new documents for 3 days. Fix: deploy correction; replay topic users→search from offset of 3 days ago with a backfill consumer; idempotent upserts by product_id repair every doc; zero downtime; confidence proven by doc count vs Postgres scan match and sampled field diff; the replay pattern turned a 3-day silent corruption into a 2-hour mechanical rebuild — the strongest argument for Kafka as an event log and not just a pipe.`,
      },
    ],
    exam: [
      {
        question:
          "Why is at-least-once the default delivery semantic, and what must consumers do because of it?",
        answer:
          "Because brokers favor not losing messages — on failure or timeout the broker redelivers; consumers must tolerate duplicates: idempotent processing (dedupe by id, upserts) is mandatory, or every retry risks repeated side effects (double charges, triple emails).",
      },
      {
        question: "What does the transactional outbox actually guarantee?",
        answer:
          "Atomicity of the business write and its event: either both persist or neither does, in one DB transaction; the relay (CDC or poller) ships events reliably afterward; the consumer still dedupes for broker-level retries, but no event is ever lost mid-handoff.",
      },
      {
        question: "When does Kafka beat SQS decisively?",
        answer:
          "When multiple independent consumer groups need the same events, when retention/replay matters (rebuild, debug, reprocess, event sourcing), when throughput exceeds SQS comfort, or when stream processing (windows, joins) is on the roadmap — otherwise SQS's operational simplicity wins for one-shot task decoupling.",
      },
      {
        question: "What sets the number of partitions in a Kafka topic?",
        answer:
          "Peak consumers per consumer group (partition count caps parallel consumption) and hot-key distribution; choose ≥ peak group size with headroom (e.g., 2-3x); more partitions = more ordering parallelism but more files/replication overhead; under-provision and you throttle scale-out forever.",
      },
    ],
    cheat: [
      "SQS for simple decoupling; RabbitMQ for routing/priority; Kafka for log/replay/scale.",
      "At-least-once everywhere; idempotent consumers or duplicate side effects.",
      "Transactional outbox: one DB tx, CDC relay — atomic handoff.",
      "Backpressure = queue depth ≥ threshold → autoscale consumers / shed early.",
      "Kafka: partition by aggregate id; order within partition only.",
      "Schema registry + additive changes only; DLQ + alert on poison messages.",
      "Replay = rewind offsets; rebuilds are reads, not heroics.",
    ],
    recap: `Queues and streams are the nervous system of decoupled systems: pick the broker by replay, throughput and ops budget; assume duplicates and reorder, build idempotent consumers; atomic hand-offs via transactional outbox; partition by aggregate; autoscale on depth; enforce schemas; and use the log\'s rewind to recover anything derived — because in a distributed system, "we can replay it" is the closest thing to a time machine you will ever get.`,
    code: {
      title: "Outbox relay sketch",
      language: "sql",
      code: `INSERT INTO orders(...) VALUES (...);\nINSERT INTO outbox(topic, payload, key) VALUES ('orders', :p, :id);\n-- same transaction; relay publishes from outbox, then marks sent`,
      explanation:
        "Atomic write of order and its event; the relay is crash-safe; consumers still dedupe — the boundary that actually needs exactly-once is the DB.",
    },
    diagram: {
      title: "Transactional outbox flow",
      caption: "One transaction, then the broker.",
      mermaid: `flowchart LR\n DB[(DB + outbox table)] --> R[CDC relay]\n R --> K[Kafka]\n K --> C[Consumers]`,
    },
  },
  "web-dev-system-design-designing-a-url-shortener": {
    intro: `Designing a URL shortener is the classic "simple problem, deep waters" — hash assignment, redirection performance, analytics, and abuse prevention hide inside "make links smaller". The subject is building it end to end: key generation, storage, redirect path with caching, expiry, analytics, and scale; plus the trade-offs between counter/base62, hashing, and precomputed key services that interviewers love to probe. a shortener is a read-heavy redirect service with a tiny write problem — optimize reads to the edge, and generate keys without collisions at all costs.`,
    foundations: `Requirements: create short link from long URL, redirect 301/302 with low latency, optional expiry/custom alias, basic analytics (clicks). Scale estimates: 10M new links/day, 100:1 read:write ratio, 30k reads/s peak; storage tiny (billions of rows, ~500 B each). Key space: base62 7 chars = 62^7 ≈ 3.5T unique; base36 8 chars similar; collision resolution: try-insert with unique constraint retry (load anyway) — fine at this row count; counters from a key-distribution service (ranges per app server, e.g., 10k per lease, no coordination per link). Redirect: 301 (permanent, cacheable, bad for analytics accuracy) vs 302 (temporary, hits server, better analytics) — most systems compromise with 302 default.`,
    concepts: [
      {
        title: "Key generation: counter, hash, or precompute.",
        body: `Counter service hands each app server ranges of 7-char base62 keys (e.g., server gets 1M ids/lease; generates locally, no lock per insert; renew before exhaustion; failed renew = pause writes, not wrong keys). Hash approach: sha256(url) truncated to 7 chars — dedup naturally (same URL same link) but collisions handled by appending/incrementing and re-checking; tracking redirections after merge-collisions gets weird. Precomputed keys: background generator fills a Keys table with unused random 7-char strings; insert picks one atomically (single row flip is_used) — no collisions possible, O(1), at the cost of a cleanup/refill pipeline. Counter is simplest, precomputed is safest; choose per team maturity; never random-without-check in prod (birthday paradox).`,
      },
      {
        title: "Storage and the redirect hot path.",
        body: `Table links(id PK, short_key UNIQUE, long_url TEXT, created_at, expires_at, user_id nullable, click_count); indexes: short_key unique hash/B-tree — point lookups O(log n); rough row size 500 B; 10-year horizon fits easily on one modern Postgres; or KV stores (DynamoDB) for multi-region. Hot path: resolve short_key → (long_url, expires_at, click metadata) — read-through Redis cache (99% hit, sub-ms), negative cache 60 s (misses also cached); redirect via 302 to the long URL; expired → 410 Gone with a branded interstitial offering re-create; count clicks asynchronously (Kafka event, batch-increment to DB — never inline counter updates in the redirect path).`,
      },
      {
        title: "Analytics and abuse prevention.",
        body: `Analytics: click events to Kafka → ClickHouse/StarRocks for OLAP; dimensions: short_key, referrer, country (GeoIP), device class, hour; dashboards per link; aggregate rollups hourly; privacy: never store raw IPs beyond 24 h, hash or drop; GDPR-compliant defaults. Abuse: rate limit creation per IP/API key (10/hour), block known-bad destinations (phishing lists, Safe Browsing API pre-check), manual review queue on report, interstitial warning page option for flagged links, takedown SLAs; hot-spotting: viral links are the normal case — caching absorbs them; watch for scanners brute-forcing keys — keyspace is 3.5T, infeasible, still rate limit 404 probes.`,
      },
      {
        title: "Expiry, custom aliases, and availability.",
        body: `Expiry: TTL at DB (or Dynamo TTL) + cache negative-entry invalidation; expired link → redirect gone but keep tombstone row for re-use policy (random keys recycled after N years or never — simpler never recycle, space is free). Custom aliases: uniqueness enforced by constraint; validate format (^[a-zA-Z0-9-_]{3,32}$), reserve brand-blocklist words, rate limit registration. Availability: multi-AZ read replicas; redirect read path tolerates full leader failure via cache; creation requires leader — acceptable; disaster recovery: daily snapshot + PITR; multi-region active-active via anycast DNS + regional Redis + replicated KV (accept last-writer-wins for click counts, strict uniqueness via global key allocator or accept duplication window on primary failure).`,
      },
      {
        title: "The build order and verification.",
        body: `MVP: create, redirect, basic click count — a weekend. Then: cache layer, expiry, custom aliases, abuse rate limits, analytics pipeline, dashboard, takedown tooling, load tests to 50k redirects/s, chaos drills on cache tier. Measure: redirect p99 < 30 ms; creation p99 < 200 ms; cache hit ratio 98%+; 404 probe rate; monthly cost per billion redirects (tiny — the whole business is infrastructure pennies at scale). Keep the product honest: a shortener is trust infrastructure — uptime and abuse response define the brand more than features do.`,
      },
    ],
    worked: [
      {
        title: "Build the counter key service safely.",
        body: `KeyTable: leases(lease_id, server_id, start_id, end_id, issued_at). Server startup/every N minutes: SELECT for update a row or insert new from a global counter sequence (Postgres SEQUENCE) reserving 10k ids; store local next_id; on link create: base62(next_id++) → INSERT link ... ON CONFLICT DO NOTHING (shouldn't collide but belt-and-braces); next lease acquired at 50% remaining; crash losing a range = wasted ids (3.5T space — fine, holes are invisible); zero coordination on the hot path; provisioning a new app node needs no team action beyond start.`,
      },
      {
        title: "Hit 40k redirects/s and stay at 12 ms p99.",
        body: `Stack: anycast DNS → edge CDN (cached redirect for hot links at edge KV with 60 s TTL!) → Redis (misses only) → Postgres (1% traffic). Edge KV short-circuits hot links entirely; mid links via Redis; cold links DB; click events to Kafka → ClickHouse hourly rollups; result: p50 6 ms, p99 12 ms, origin QPS 400 at peak, database loafs; the entire architecture moved the redirect lookup closer to the user until the origin became decorative for the common case.`,
      },
      {
        title: "Stop a phishing campaign using your shortener.",
        body: `Spike in reports for one key → abuse pipeline: auto-flag → Safe Browsing verdict bad → replace redirect target with warning interstitial (not outage) → notify reporter → takedown doc; preventive: destinations pre-screened at creation via reputation API; creation rate-limits tightened for new accounts; the campaign key was neutralized in 90 s; no clean links taken down; abuse SLA met — the fire break exists before the fire.`,
      },
    ],
    exam: [
      {
        question:
          "Why is a 301 redirect problematic for analytics but a 302 is not?",
        answer:
          "301 is cached permanently by browsers — subsequent clicks never reach your server, so counts, referrers, and campaigns go blind; 302 forces every click through your stack (cacheable briefly, still measured) — the standard default where analytics matter; some opt into 301 for SEO/longevity with blind analytics accepted.",
      },
      {
        question:
          "What is the birthday-paradox risk in random 7-char keys, and how do systems avoid it?",
        answer:
          "Collisions arrive far sooner than intuition — at millions of links, random generation guarantees near-certain collisions if unchecked; systems avoid it by construction (counter ranges, precomputed unused keys with atomic claim) rather than by luck-checked inserts alone.",
      },
      {
        question:
          "Why count clicks asynchronously instead of in the redirect request?",
        answer:
          "A synchronous counter update adds a write dependency to the hottest path (latency + failure coupling to the DB); async events to a queue keep redirects single-digit-ms with 100% success even during analytics outages — counts may lag, redirects must not.",
      },
      {
        question:
          "What does negative caching protect against, and what TTL does it deserve?",
        answer:
          'It protects the database from 404 probe storms and crawler miss floods; a short TTL (30-60 s) suffices — long enough to absorb abuse waves, short enough that a newly created link propagates to cache quickly; correctness of "not found" matters less than survival of the path.',
      },
    ],
    cheat: [
      "Keys: counter ranges or precomputed table with atomic claim; never raw random.",
      "Redirect: 302 default; edge/Redis/DB cascade; clicks via queue, never inline.",
      "Analytics: Kafka → ClickHouse; hash/drop IPs; dashboards per key.",
      "Abuse: creation rate limits, Safe Browsing pre-check, takedown SLA, interstitial.",
      "Expiry: TTL + tombstones; negative cache 30-60 s; custom aliases validated + blocklist.",
      "99% redirects served from cache/edge; p99 < 30 ms; availability > analytics features.",
      "PITR + replicas; redirect path survives leader death via cache.",
    ],
    recap: `A URL shortener is a read-optimized redirect service: collision-free keys via counters or precomputed tables, a cache-and-edge cascade for single-digit-millisecond redirects, asynchronous analytics, expiry via TTLs, and abuse defenses applied at creation and via interstitials — built incrementally from a weekend MVP into an always-on trust service, with availability and takedown speed as the real product.`,
    code: {
      title: "base62 encode for counter keys",
      language: "javascript",
      code: `const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';\nfunction enc(n, out = []) { while (n) { out.unshift(chars[n % 62]); n = Math.floor(n / 62); } return out.join(''); }`,
      explanation:
        "Deterministic, collision-free mapping from a monotonically increasing id; no hashing, no coordination per link, 7 characters exhaust 3.5 trillion ids.",
    },
    diagram: {
      title: "Shorten and redirect flows",
      caption: "Key service, store, redirect, analytics.",
      mermaid: `flowchart LR\n M[Create request] --> K[Key service]\n K --> D[(Links table)]\n U[Redirect request] --> C[Edge/Redis cache]\n C --> D`,
    },
  },
  "web-dev-system-design-designing-a-social-feed": {
    intro: `Designing a social feed is the canonical hard design problem: fan-out at write vs fan-out at read, ranking, caching, and the celebrity problem — all choosing how a user sees "what matters now" at scale. The subject is the full architecture: publish pipeline, timeline construction with push/pull hybrids, ranking signals, storage layout, and the failure modes (hot celebrities, stale caches) that separate textbook feeds from Twitter-grade ones. a feed is a personalized, ordered, read-heavy projection of who-follows-whom — compute it where it is cheapest, and cache it where everyone looks.`,
    foundations: `Requirements: post, follow, feed (reverse-chron, later ranked), notifications optional. Scale: 100M users, avg 200 follows, 5k QPS feed reads peak, write QPS in hundreds. Fan-out on write: on post, push the post id into every follower's timeline cache (Redis list, capped 800 entries) — reads are O(1); explodes for celebrities (10M followers × writes = massive amplification). Fan-out on read: compute feed at query time by union-merging followed-users' recent posts — cheap writes, expensive reads (fan-out cost per read). Hybrid: push for normal users (< ~10k followers), pull-merge celebrity posts at read time. Storage: posts table sharded by author_id; timeline in Redis (or Cassandra for durability); ranking decoupled from storage.`,
    concepts: [
      {
        title: "Fan-out on write: mechanics and the celebrity fix.",
        body: `User posts → write post row → publish to Kafka → fan-out workers read follow graph (follows index by user_id) → LPUSH tweet_id onto timeline:{follower_id} → LTRIM 0 799 → done. Read: LRANGE timeline:user → MGET posts by id (mostly cached) → render. Amplification: user with 8M followers = 8M pushes/post — solve with pull-on-read for accounts ≥ threshold: skip push; at read time merge celebrity recent posts (their last 20) into the timeline via a per-user hot-celebrity list cached in Redis. Follower-graph storage: adjacency in tables or sharded KV; graph mutation events invalidate the per-user push lists lazily.`,
      },
      {
        title: "Timeline storage and eviction.",
        body: `Redis timelines: trimmed lists (cap 800) give instant reads; memory cost = 100M users × 800 × 8 B ≈ 640 GB — use sharded Redis or move cold timelines to Cassandra with the same key shape; timeline entries store tweet_id only, bodies fetched via posts cache (memory 10x better); rebuild on miss by recompute from graph (rare — acceptable MTTR); age-out: LTRIM bounds memory; inactive users\' timelines can be regenerated on demand instead of kept.`,
      },
      {
        title: "Ranking: beyond reverse-chronological.",
        body: `Stages: candidate generation (timelines + celebrity merge, 500-2000 candidates) → filtering (blocks, muted, seen > 7 days, NSFW) → scoring: features (author affinity, recency decay 1/x^1.5, engagement rate prediction, media match, conversation depth, negative signals like "X happened" blocks) → top k (150) with diversity re-rank (MMR) to avoid same-author clumps; online model (GBDT/deep model) served as a ranking service — feature store updated streaming; latency budget 120 ms end-to-end p99; fallback: reverse-chron if ranker times out; log impressions/clicks for training and guard against feedback loops (exploration epsilon, position debiasing).`,
      },
      {
        title: "Pagination, freshness, and the cold-start user.",
        body: `Cursor pagination on timeline position (tweet_id of last seen) — stable under inserts; "new tweets" pill via timeline version counters (WebSocket/SSE event triggers client bump). Freshness: push model means new posts appear within push latency (~1 s); consistency for the author themselves: write-through to their own timeline for instant self-visibility. Cold start: no follows → onboarding suggests 10 accounts; empty timeline → populated by global popular posts + topic exploration until follows exist; first experiences decide retention — engineering for the empty state is engineering for growth.`,
      },
      {
        title: "Failure modes and operational realities.",
        body: `Hot celebrity events: pull-merge path gets hammered — cache celebrity lists with short TTL; fan-out storms (mass follow-back cascades) — worker autoscaling + Kafka lag alerts; timeline cache stampede on celebrity post — singleflight per key; stale cache after graph change — event-driven invalidation or version-tagged lists; deleted posts — tombstone filter at read (cheap, 99.9% cases); regional outage — timeline replicas readable-only; cost: timelines dominate memory — monitor hit ratio and LTRIM clamp.`,
      },
    ],
    worked: [
      {
        title: "Push-fan-out for a 40k-follower account and pull for a 9M one.",
        body: `Normal user posts: path writes to 40k follower lists — 40k Redis ops in ~2 s via pipelined workers; followers see it in < 3 s. Celebrity posts: skip push; cached "star list" for their latest 30 ids in Redis with 2 s TTL; readers merge star list at read (MGET + dedupe-merge, ~10 ms); celebrity followers get the post in seconds anyway, and the system survived a product launch weekend without melting — the celebrity asymmetry was the entire design.`,
      },
      {
        title: "Add engagement ranking behind a flag and measure.",
        body: `Shadow mode first: ranker scores logged, current chron order served — compare CTR@10 on logged impressions for the top 10/20% agreement; then 5% flag on cohort with holdout; metrics: engagement rate (+18%), session length (+9%), hide/mute rate (-22% — ranking filtered noise effectively), negative feedback rate watched carefully (ranking can amplify mirage — guard rails: block-list penalty ×10, author diversity floor 3 distinct authors per 8); rollout over two weeks; the ranker paid for itself in retention inside a month.`,
      },
      {
        title: "Rebuild a user timeline from scratch after cache loss.",
        body: `Cache tier flushed by accident: timelines gone; service healthy; users saw empty feeds. Recovery runbook: on miss, timeline recompute — fetch followees\' last 200 posts each from posts store (sharded by author, parallel fan-in), merge by created_at, refill Redis list; 100M timelines would take forever — so lazily rebuild per-user on access with singleflight (cost amortized; popular users rebuilt within minutes, long tail within days of traffic); the design makes cache-loss a user-visible blip for individuals, never a system outage; documented and drilled.`,
      },
    ],
    exam: [
      {
        question:
          "Why does the hybrid fan-out (push for small accounts, pull for celebrities) exist?",
        answer:
          "Push fan-out cost is O(followers) per post — fine to ~10-50k followers, ruinous at 10M; pulling at read merges only the celebrity segment per read — small extra read cost concentrated where the amplification would otherwise be worst; the asymmetry is the optimum.",
      },
      {
        question: "What does trimming timelines to ~800 entries achieve?",
        answer:
          "Bounded memory and bounded write amplification — timelines stay Redis-resident for the working set, old entries vanish automatically (regenerable), and the system never accumulates unbounded per-user history; the trade is losing access to deep history without scroll-rebuilds, which is fine since feeds are not archives.",
      },
      {
        question:
          "Why log impressions and clicks for a ranker, and what metric guards it?",
        answer:
          "Training data comes from exposure — with position debiasing and exploration noise to avoid feedback collapse; the guard metric is negative feedback (hides, mutes, unfollows per impression) because optimizing engagement alone rewards outrage and clickbait — a trustworthy ranker optimizes satisfaction proxies, not raw clicks.",
      },
      {
        question:
          "Why is reverse-chronological the correct fallback for feed ranking?",
        answer:
          "It is predictable, fresh, trivially computable under any degradation (no model, no feature store, no dependencies); when the ranker times out, errors or is disabled, chron still delivers the product — resilience by fallback, not by hope.",
      },
    ],
    cheat: [
      "Hybrid fan-out: push small accounts, pull celebrities at read; cache the star lists.",
      "Timeline: Redis list of ids, cap ~800; post bodies from the posts cache.",
      "Ranking: candidate gen → filter → score (affinity, decay, prediction) → diversity.",
      'Cursor pagination; version counter for "new posts"; write-through for authors.',
      "Cold start: onboarding follows + global popular; lazy rebuild on cache miss.",
      "Fallback to chron when the ranker fails; shadow-mode before prod.",
      "Guard metrics: hides/mutes/unfollows, not just clicks.",
    ],
    recap: `A social feed is large-scale personalization under a hard latency budget: hybrid push/pull timelines with cached celebrity merges, trimmed per-user lists, cursor pagination, and decoupled ranking with fallback to chron; memory dominates the bill and correctness lives in the graph; is that reads are for machines and feeds are for humans — engineer the former so the latter never notice.`,
    code: {
      title: "Hybrid feed read pseudo-code",
      language: "javascript",
      code: `const tl = await redis.lrange('tl:' + userId, 0, 799);\nconst stars = await redis.get('stars:' + userId); // merged celebrity list\nreturn mergeById([...tl, ...stars], postsByIds(...));`,
      explanation:
        "Two cheap fetches, one merge — push path covers followees, pull path covers celebrities; no fan-out write storm ever reaches the reader.",
    },
    diagram: {
      title: "Feed construction",
      caption: "Write path push; read path merge.",
      mermaid: `flowchart LR\n W[Post created] --> K[Kafka fan-out]\n K --> R[Redis timelines]\n R --> F[Feed read]`,
    },
  },
  "web-dev-system-design-designing-a-chat-system": {
    intro: `Designing a chat system is a realtime design problem with persistent data: WebSocket connections at scale, presence, message ordering, delivery guarantees, storage, and multi-device sync. The subject is building it like production does — connection gateways behind a broker, direct and group chat fanout, message IDs for ordering, offline queues, and the consistency choices (eventual everywhere except read receipts) that keep it simple. chat is ordered state broadcast over unreliable realtime pipes — get the ordering, the persistence, and the reconnect story right, and the rest follows.`,
    foundations: `Architecture: clients (Web/Mobile) → connection gateways (WebSocket, stateful, hold sockets) → message broker (Kafka/Redis pub-sub for cross-node routing) → chat service + DB (Cassandra/Scylla/Postgres). Message identity: server-assigned Snowflake-ish id (time + sequence) for total order per conversation; per-message sequence numbers per chat for gap detection. Delivery: at-least-once + client dedupe by id (messages exactly-once from the user\'s perspective). Presence: heartbeat to Redis (SETEX presence:userId with TTL refresh) + fan-out to friends; typing indicators with TTL. Persistence: messages table keyed by (chat_id, seq) — writes append; reads fetch ranges; unread counts via counters. Offline: unacked messages kept per device; on reconnect, client sends last seen seq → server replays the gap.`,
    concepts: [
      {
        title: "Connection gateways and cross-node routing.",
        body: `Each gateway process holds thousands of sockets; users connect sticky or via rendezvous routing; every gateway publishes received messages to the broker keyed by chat_id; delivery: gateway for the recipient"s node subscribed to their chat channels forwards to local sockets — no single node needs global state; fanout for groups: message → broker → one subscription entry per member → each entry routed to that member\'s gateway. Heartbeats every 15 s (ping/pong) kill dead sockets; LB does not need sticky sessions if the broker handles routing — the architecture is symmetric and horizontally scalable; drain on deploy with connection migration or auto-reconnect (clients resubscribe with last seq).`,
      },
      {
        title: "Message ordering and IDs.",
        body: `Global time-based ids (Snowflake: 41 bits ms + 10 bits node + 12 bits seq) give k-sortable ids for anything — then per-conversation seq from a DB counter or a broker partition per chat_id enforces strict order; clients use seq for gap detection on reconnect (fetch all since last_seen); conflicts (two parents sending in a group simultaneously) resolve by seq — order is define-time, not arrival-time; identical message never rendered twice — client dedupe set of recent ids (memory 1k); edits/deletes send revision events with a new seq; replies reference parent seq; receipts: delivered/read updates per message id stored as counters or flags (eventually consistent, never blocking the message path).`,
      },
      {
        title: "Delivery guarantees and offline sync.",
        body: `At-least-once with client dedupe beats exactly-once complexity: server stores messages once; redelivery happens on reconnect or gateway retry; client drops duplicates by id. Offline queue: while offline, messages are stored (as always); the client reconnects → hello with device_id + last_seq per chat → server streams the delta → client renders in order → receipts flow back later. Multi-device: each device tracks its own seq cursor; same message seen on phone and laptop renders identically; send-from-any-device syncs via the server, not peer-to-peer.`,
      },
      {
        title: "Presence, typing, and group scale.",
        body: `Presence: heartbeats SETEX presence:{user} 45 s; gateway marks online → publish presence change events → friends subscribed see online/offline with ± TTL skew; "last seen" timestamp stored. Typing: ephemeral event PUBLISH typing:{chat}:{userId} with 3 s TTL, no persistence. Group chats: channel per chat_id; membership table; large groups (>500) switch to fan-out-on-read or sharded topic subsets (interest-set sharding by hash of chat_id); supergroup scale is a separate discipline — do not pretend 1M-member rooms are the same as team chat.`,
      },
      {
        title: "Storage: messages and media.",
        body: `Messages: chat_id + seq as composite key, value { sender, body, type, created_at, edited } — append-only, partitioned by chat hash; TTL none by default (compliance option); media uploads via presigned URLs → S3 (thumbnails, transcoding async); message inserts are tiny and hot — keep the table lean (no blobs); unread counters as Redis INCR per member with DB reconciliation; backups: PITR on the metadata DB, S3 versioning for media; GDPR deletion: tombstone messages (deleted_at) — renders as removed; hard purge window; legal hold override documented.`,
      },
    ],
    worked: [
      {
        title: "Route a message across two gateway nodes.",
        body: `Alice on GW-1 sends to Bob on GW-2: GW-1 authenticates, appends to messages (chat_id, seq=98, id=snowflake) via chat service → PUBLISH chat:dm:{chat_id} message → GW-2 (subscribed per online user) receives → writes to Bob\'s socket → Bob\'s app applies dedupe by id, renders; Bob offline? message stays committed; on reconnect Bob sends last_seq=97 → server streams seq ≥ 98 → Bob sees both pending messages in order; Alice gets delivered receipt via the same broker path; total latency online: < 80 ms p99 cross-region.`,
      },
      {
        title: "Gap recovery after a mobile tunnel blip.",
        body: `iOS connection dropped 40 s in a subway: client auto-reconnects with device hello { chat_42, last_seq: 1183 } → server queries messages where chat_id=42 AND seq>1183 → streams seq 1184-1211 (27 messages) in order → client dedupes any overlap with in-flight sends, renders, sends receipts lazily → user sees seamless history, no push needed; the entire experience cost 27 small JSON frames — invisible, exactly the product promise of chat.`,
      },
      {
        title: "Run presence without a thundering herd.",
        body: `5M online users heartbeating every 15 s = 333k SETEX/s — fine. Presence fan-out: on online/offline change only, publish to friends list (avg 200) — 66M events/s if everyone flapped simultaneously — instead: batch presence deltas per second per gateway and publish compact maps; subscribers refresh LED on next sync (pull-on-visible); "online" dot may lag 30 s in extremes — acceptable trade documented; battery cost bounded; presence is explicitly best-effort by design.`,
      },
    ],
    exam: [
      {
        question:
          "Why server-assigned time-based IDs alongside per-chat sequence numbers?",
        answer:
          "Time ids give global k-sortability and cross-chat merging (inbox list); per-chat seq gives strict per-conversation order and gap detection for reconnect replay — one id cannot serve both masters well; using both is the standard production answer.",
      },
      {
        question:
          "How does client-side deduplication deliver effectively-once messaging?",
        answer:
          'The store is the truth; the transport is at-least-once; duplicates are inevitable (retries, reconnects); dropping repeats by id at render converts an unreliable transport into an idempotent view — every user-visible guarantee comes from ids, never from "we sent it once".',
      },
      {
        question:
          "Why route through a broker instead of direct gateway-to-gateway?",
        answer:
          "Gateways are dumb stateful sockets; adding topology awareness (who holds whom) couples placement logic to edge processes and breaks on reconnects; the broker decouples location entirely — any gateway can reach any user regardless of pod placement, enabling drains, autoscaling and multi-region without coordination protocols.",
      },
      {
        question:
          "What is the real cost of read receipts at scale, and what do products do about it?",
        answer:
          "Receipts multiply message-rate writes by the number of participants — a group of 50 turns 1 message into 51 receipt events; production systems make receipts per-user eventually consistent (batched, drop-oldest under load, aggregate for large groups — show count not names), or omit them in very large rooms.",
      },
    ],
    cheat: [
      "Gateways hold sockets; broker routes by chat_id; DBs store; clients dedupe.",
      "ids: snowflake-ish global + seq per chat; gap sync via last_seq replay.",
      "At-least-once + dedupe = exactly-once feeling.",
      "Presence = heartbeat TTL; typing = ephemeral events; receipts async.",
      "Groups: channel per chat; huge rooms shard by interest set.",
      "Media via presigned URLs; messages table lean; counters for unread.",
      "Reconnect with last_seq → ordered catch-up; multi-device per-cursor.",
    ],
    recap: `Chat systems are realtime databases with UX polish: stateful gateways, a routing broker, append-only storage keyed by (chat, seq), global time-ordered ids, client dedupe over at-least-once transport, replay-on-reconnect sync, presence via TTLs, and receipts kept asynchronous — the correctness lives in ids and ordering; the scale lives in the broker; the magic lives in the reconnect path users never see.`,
    code: {
      title: "Gap detection and replay pseudo-code",
      language: "javascript",
      code: `const missed = await db.query('SELECT * FROM messages WHERE chat_id=$1 AND seq > $2 ORDER BY seq', [chatId, lastSeq]);\nfor (const m of missed) socket.send(JSON.stringify(m));`,
      explanation:
        "On reconnect the client asks for everything after its cursor; the server streams the gap in order; idempotent render does the rest.",
    },
    diagram: {
      title: "Chat message path",
      caption: "Gateway to broker to storage to other gateway.",
      mermaid: `flowchart LR\n A[Client A] --> G1[Gateway 1]\n G1 --> B[Broker]\n B --> G2[Gateway 2]\n G2 --> C[Client B]`,
    },
  },
  "web-dev-system-design-designing-a-notification-system": {
    intro: `Designing a notification system is a fan-out and reliability problem across channels — push, email, SMS, in-app — with retries, rate shaping, templates, and user preferences as first-class features. The subject is assembling the full pipeline: event intake, user preference resolution, template rendering, provider delivery with fallback, deduplication, and delivery tracking — plus the quiet complexities (opt-outs, quiet hours, collapse keys) that separate usable from unusable. notifications are promises you make to your users — each one must respect their settings and exactly one of their lives.`,
    foundations: `Channels: mobile push (APNs/FCM), email (SES/SendGrid), SMS (Twilio), in-app inbox, web push. Pipeline: trigger → normalize event → resolve recipients + preferences (opt-in per channel/type, quiet hours honoring local tz) → dedupe/collapse (same logical notification within window = one) → render template (per locale/channel constraints: push title ≤ 50 chars, SMS 160/segment) → send via provider with idempotency key → track status (sent/delivered/bounced/failed) → retry with backoff on transient errors → DLQ for persistent → analytics (open, click via tracking pixels/shortlinks). Priority classes: transactional (critical security, password reset) bypass rate limits; product/engagement capped per user per day.`,
    concepts: [
      {
        title: "Event ingestion and preference resolution.",
        body: `Events from app/services hit a notification API: { userId, type (order.shipped), data, idempotencyKey } → persist → eligibility check: user exists, channel enabled for this type? locale? quiet hours now? frequency cap for marketing type (e.g., 3 product pushes/week, transactional bypass)? preference center is the contract — every notification decision flows through it; admin override audited. Recipient expansion: one event may fan out to multiple devices (tokens table per user per platform; stale tokens pruned on provider feedback — 410/Unregistered means delete that token).`,
      },
      {
        title: "Templates, locales, and rendering safely.",
        body: `Template per type per channel: push (title, body, deeplink), email (HTML + text fallback, unsubscribe footer — legally required in most jurisdictions), SMS (plain, segment count budget), in-app (structured payload for native rendering). Locales with fallback chains (user locale → product default); variables validated against allowlist (no raw HTML injection — templates escape); template versioning with staged rollout; preview tooling for marketing; snapshot tests of rendered output per template×locale×channel to catch regressions before blast.`,
      },
      {
        title: "Delivery, retries, and provider failover.",
        body: `Queue per channel with distinct rates (email 5k/min, SMS 1k/min, push 50k/min); workers send with idempotency key = hash(event_id, channel, device) — safe retry on timeouts; classify responses: permanent (invalid token/email → prune, no retry), transient (429/5xx → exponential backoff with jitter, max 4 attempts, then DLQ + alerting), success. Provider failover: on provider error-rate spike, auto-switch to secondary (Twilio→MessageBird) for SMS, or dual-send policy for critical classes; circuit breakers per provider; webhook status callbacks update records (delivered/bounced) — email bounces hard-pruned after thresholds; track deliverability as an SLO.`,
      },
      {
        title: "Deduplication, collapse, and rate shaping.",
        body: `Same logical notification within window (e.g., "you have 3 new followers" in 5 min) collapses via collapseKey + windowing — one notification, count incremented. Cross-channel suppression: in-app shown + push sent? Suppress push if the app is foregrounded on a live channel (presence-aware delivery via gateway events — skip push when user is online in-app, else they get double-notified). Per-user rate caps: token bucket per user per class; bursts for transactional only; global system-wide rate limiter protects downstream (SQS backlog, provider throttle headroom); collapse and caps keep notification noise from becoming uninstall-reason number one.`,
      },
      {
        title: "Inbox, receipts, and measurement.",
        body: `In-app inbox: notifications table keyed by user with read/unread, deeplink actions (markActionTaken), retention 30-90 days; badge counts in-memory (Redis) + periodic reconcile. Measurement: sent → delivered → opened → action conversion per type/channel/cohort; watch opt-out rate — the canary metric for over-messaging; A/B copy tests with holdout; fatigue scores feed back into frequency caps automatically (power users silently desensitize to once-a-day spam — model engagement half-life); reports per type/team so product and growth share one dashboard of trust vs engagement.`,
      },
    ],
    worked: [
      {
        title: "Ship transactional password-reset notifications.",
        body: `POST /notify { userId, type: 'security.password_reset', data: { link } } → transactional class bypasses caps and quiet hours (user expects it now) → resolves email + SMS + push all at once per policy (defense-in-depth for security) → signed short-lived link, single use → SES + Twilio independently idempotency-keyed → both delivered in < 2 s; inbox entry shows attempt status per channel; support sees "email sent 12:01:33, SMS delivered 12:01:34" — the user resets and carries on; zero marketing content touched this path; audit logged.`,
      },
      {
        title: 'Collapse 47 "new follower" pings into one.',
        body: `Growth spike day: 47 follows for one user in 30 min would have meant 47 pushes — uninstall bait. Collapse: type=social.follower with collapseKey={user}:{day} window 15 min → first triggers delivery, subsequent 46 increment pending_count and DAILY register only → one push at window end: "47 new followers — see who"; in-app shows all 47 entries; user delight instead of dread; the notification system treated the human, not the event firehose.`,
      },
      {
        title: "Foreground suppression kills the double-notify bug.",
        body: `User staring at the app gets "New message!" push 2 seconds after seeing it in-app — annoying. Fix: delivery consults presence (Redis key user:online with TTL refreshed by gateway heartbeats): if online and in-app inbox connected, skip push (and optionally mark inbox highlight animation instead) — 80% of in-app pings vanished for active users; push remains for backgrounded/no-session states; opt-out rate dropped; the fix cost one Redis call and one product debate.`,
      },
    ],
    exam: [
      {
        question:
          "Why do transactional notifications bypass quiet hours and caps, while marketing never may?",
        answer:
          "They carry user-safety and account-integrity meaning (resets, fraud alerts) where delay is harm; marketing under identical treatment trains users to ignore even security pings — severity-scoped bypass keeps both channels trustworthy; bypassing everything destroys the scarcity that makes bypass meaningful.",
      },
      {
        question: "What is a collapse key and which failure does it eliminate?",
        answer:
          "A deduplication key grouping semantically identical notifications in a window — it eliminates notification avalanches during event storms (mass follows, repeated edits), converting N pings into one digest with a counter — preventing attention fatigue and contempt for all future pushes.",
      },
      {
        question:
          "Why are provider status webhooks mandatory for email/SMS at scale?",
        answer:
          'Without them you are blind after "accepted": hard bounces and invalid tokens accumulate until ISP reputation collapses; webhook receipts close the loop — prune dead endpoints, measure true delivery, fail over when a provider degrades, and report clean per-channel SLOs.',
      },
      {
        question:
          "What does an unsubscribe-rate metric tell you that delivery rate cannot?",
        answer:
          "Delivery measures plumbing; unsubscribes measure trust — rising opt-outs mean the frequency, relevance or timing is wrong regardless of 99.9% delivery; the metric guards the relationship itself, and product teams should treat even a gentle upswing as a stop-and-review signal.",
      },
    ],
    cheat: [
      "Intake → eligibility (prefs, quiet hours, caps) → dedupe/collapse → render → send → track.",
      "Transactional bypasses caps; engagement classes capped per user/day.",
      "Locales + escaped variables; template versioning; snapshot tests.",
      "transclasses per channel with quotas; idempotency keys; classify permanent vs transient; DLQ.",
      "Collapse keys + windows; foreground suppression via presence; caps per user.",
      "Inbox table with read/action states; retention 30-90d; badge counters + reconcile.",
      "Watch opt-out rate — the canary for over-messaging.",
    ],
    recap: `Notification systems are fan-out engines with a conscience: an intake pipeline that resolves preferences, caps, quiet hours and deduplication before rendering localized templates, delivered through per-channel queues with idempotency, retry and provider failover, tracked end-to-end, and measured by unsubscribe rate as much as delivery — because the scarcest resource in product is the user's continued permission to interrupt them.`,
    code: {
      title: "Preference gate skeleton",
      language: "javascript",
      code: `if (!prefs.enabled(user.id, type, channel)) return skip('opted-out');\nif (quietHours(user.tz)) return defer(openNext);\nif (overCap(user, marketing)) return skip('cap');`,
      explanation:
        "Three gates before one byte is sent — the order mirrors the trust contract: user control, user context, user sanity.",
    },
    diagram: {
      title: "Notification pipeline",
      caption: "From event to inbox.",
      mermaid: `flowchart LR\n E[Event] --> P[Preference gate]\n P --> R[Render]\n R --> S[Send per channel]\n S --> t[Track]`,
    },
  },
  "web-dev-system-design-designing-a-rate-limiter": {
    intro: `Designing a rate limiter is protecting your system from being loved to death — abuse, bugs, and flash crowds — while keeping legitimate bursts alive. The subject is the algorithm zoo — fixed window, sliding window log, sliding window counter, token bucket, leaky bucket — the distributed implementation with Redis, headers clients should send, and graceful degradation policies. a rate limiter is a fairness gatekeeper — precisely configured, honestly signaled, and always on the side of the healthy system.`,
    foundations: `Fixed window counter: INCR per window, boundary bursts (2x limit at edge). Sliding window log: store timestamps, count in last window — exact but memory heavy. Sliding window counter (weighted two windows): memory O(1) approximation, standard choice. Token bucket: refill at rate r, burst capacity b — allows controlled bursts; leaky bucket: steady outflow, smooths spikes. Distributed: Redis + Lua for atomic check-and-set; key per identity+route or route-only for global; headers: X-RateLimit-Limit/Remaining/Reset; 429 + Retry-After. Dimensions: per-IP, per-user, per-API-key, per-route, global.`,
    concepts: [
      {
        title: "Algorithm selection: fixed, sliding, token bucket.",
        body: `Fixed window trivially simple — has 2x burst cheat at boundaries; fine for coarse limits. Sliding log exact: ZADD timestamp now, ZREMRANGEBYSCORE window, ZCARD — memory per request heavy for hot keys; use for low-volume sensitive routes (login). Sliding window counter: current window count + previous × overlap weight — O(1) memory, no boundary cheat, industry default. Token bucket: capacity b tokens, refill r/s continuously — shapes bursts yet permits them within b; ideal for APIs with acknowledged burst behavior (webhooks, batch imports). Leaky bucket: fixed leak rate regardless of input — smooths egress to downstreams, kills bursts entirely. Pick by burst semantics; implement by cardinality needs.`,
      },
      {
        title: "Distributed implementation and race safety.",
        body: `Multi-node apps share limits via Redis: Lua script does check-and-increment atomically (read counter + TTL, compare, INCR, set expire) — no check-then-set race across nodes; one round trip per decision; script cached by EVALSHA; latency impact ~1 ms; clock skew tolerated by window design (windows computed server-side, not client). Keys: rl:{dimension}:{route}:{identity} with hash tags for slot co-location in cluster; TTL = window; memory-bounded: millions of keys with seconds TTL fine; on Redis outage: decision needed — fail-open for read APIs (log + allow with alert) vs fail-closed for money endpoints (429) — document per route, never ad hoc during an incident.`,
      },
      {
        title: "Client signaling and error contract.",
        body: `Response headers standard-ish: X-RateLimit-Limit (quota), X-RateLimit-Remaining, X-RateLimit-Reset (epoch seconds); on exceed: 429 with Retry-After (seconds) and JSON { error: 'rate_limited', retry_after }. Clients expected to back off exponentially with jitter — SDK helpers encode this; well-behaved bots identify via API keys with negotiated quotas (higher tiers — rate limits as billing tier!). Unlimited endpoints require explicit reason written down; global ceiling catches pathological clients that spray across routes; per-route quotas protect expensive operations (search, exports — 10/min) vs reads (1000/min).`,
      },
      {
        title: "Policies: tiering, fairness, and degradation.",
        body: `Fairness: per-tenant weights (paid gets 10x free); fair queuing for batch; burst credits decay. Abuse patterns beyond rate: credential stuffing → per-account + per-IP dual windows; scraping → user-agent entropy + fingerprint velocity; request smuggling — irrelevant here, but scope creep guarded: rate limiting is not authz, not DDoS L3/L4 defense (CDN/WAF territory); rate limiting defends app-layer exhaustion; compose with WAF rules and bot management for the full stack. Under saturation, degrade: shed anonymous traffic before free-tier, shed free tier before paid, always preserve health checks and static assets.`,
      },
      {
        title: "Observability and tuning.",
        body: `Metrics per limit rule: hits denied/total, hit rate trend, top denied keys, burst distribution (log histogram); alert on sudden denial spikes (attack vs misconfigured client — usually a buggy retry loop in your own SDK!); weekly quota review with product (are limits instrumenting known-good workflows? adjust); changelog discipline: limits change = release notes for API consumers — changing quota silently breaks integrations; load test neighbor-dimension behavior; chaos-test Redis failure path per route policy.`,
      },
    ],
    worked: [
      {
        title: "Ship Redis sliding-window limiter in Lua.",
        body: `Script: now = tonumber(ARGV[1]); window = 60; limit = 100; key given; prev = get window-1 bucket; curr = incr curr bucket (set nx ex 120); weighted = curr + prev*((60 - now%60)/60); if weighted > limit reject else allowed. EVALSHA hot path one RTT; app middleware logs dimension + outcome; Retry-After computed as seconds until window reset; per-route config map; load test at 3x limit proves boundary holds at 100.0 exactly, no 101 leakage; the limiter shipped to prod behind a flag with 1% shadow-mode first.`,
      },
      {
        title: "Stop a runaway client with dual-dimension limiting.",
        body: `A customer integration bug retried a 502 in a tight loop — 40k req/min to /export. Per-route global limit missed (route had 1000/min shared tenancy, retries drowned it). Fix: add per-API-key dimension on /export (20/min) + per-IP secondary (60/min) + exponential Retry-After surfacing; the offending client got 429 immediately, fixed their loop; alerting flagged the key for review — limits caught the bug and named the culprit without waking anyone at 3 AM.`,
      },
      {
        title: "Webhook endpoint with burst-friendly token bucket.",
        body: `Partners send bursts of 200 webhooks in seconds every 5 min — fixed window would reject half the burst; business demands absorb it. Token bucket 10/s refill, burst 200: bursts pass wholesale, sustained > 10/s throttled gently; partner sees 200 OK then 429 with Retry-After only in genuine floods; zero integration breakage; the limit shape matches the traffic physics — the limiter expresses capacity, not hostility.`,
      },
    ],
    exam: [
      {
        question: "Why is the fixed-window algorithm vulnerable at boundaries?",
        answer:
          "It counts per absolute window (e.g., 00-00:59) — a client can use full quota at the end of one window and full again at the start of the next, achieving 2× the intended rate in seconds; sliding window counters overlap weights to close that edge without per-request logs.",
      },
      {
        question:
          "What does 429 + Retry-After communicate to a well-written client?",
        answer:
          "Exact backoff timing for the next attempt — clients can schedule themselves precisely rather than guess, smoothing retries into the window; without it, clients poll blindly, thundering-herd the very endpoint they were throttled from, and degrade their own throughput.",
      },
      {
        question: "Why must the check-and-increment be atomic in Redis?",
        answer:
          "Independent GET and SET across nodes race — N nodes can all read 99, all write 100, and 100 + overflow the limit; the Lua script executes as one indivisible unit on one Redis node (cluster-local by hash tag), so the counter is exactly consistent.",
      },
      {
        question:
          "What is the correct fail-open/fail-closed decision per route, and why not one global rule?",
        answer:
          "Fail decisions depend on blast radius: fail-open for read-heavy, cacheable routes (availability wins over strictness) with alert; fail-closed for payment/auth/mutation routes (correctness wins) — a global rule silently picks disaster for half the surface area; the decision is per-route policy, documented, and tested.",
      },
    ],
    cheat: [
      "Fixed window = simple + 2x edge cheat; sliding log = exact + heavy; sliding counter = O(1) default; token bucket = burst-tolerant.",
      "Redis + Lua EVALSHA = atomic decision in one RTT.",
      "Headers: Limit/Remaining/Reset; 429 + Retry-After always.",
      "Dimensions: user/ip/key/route/global; dual-check auth-sensitive routes.",
      "Per-route caps protect expensive endpoints; tiers by plan.",
      "Fail-open reads with alert; fail-closed money/auth; tested per route.",
      "Watch denial-rate spikes — usually a buggy client, not an attack.",
    ],
    recap: `Rate limiters are capacity-aware traffic contracts: sliding windows or token buckets matched to burst physics, atomic Redis decisions under one RTT, honest 429 + Retry-After signaling for well-behaved clients, per-route and per-dimension quotas that reflect real cost, and fail-open/fail-closed chosen per blast radius with observability that catches both attacks and your own buggy SDKs — a limiter is how a system says no gracefully.`,
    code: {
      title: "Retry-After on 429",
      language: "javascript",
      code: `res.set('Retry-After', String(resetSec));\nres.status(429).json({ error: 'rate_limited', retry_after: resetSec });`,
      explanation:
        "Two lines any API framework can ship; the contract that keeps well-behaved clients cooperative instead of antagonistic.",
    },
    diagram: {
      title: "Rate limit decision flow",
      caption: "Check, count, admit or reject.",
      mermaid: `flowchart LR\n Req[Request] --> K[Lookup key]\n K --> W{Within limit?}\n W -->|yes| OK[Admit + headers]\n W -->|no| R[429 + Retry-After]`,
    },
  },
};
