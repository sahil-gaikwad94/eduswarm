import type { TopicLesson } from "../topicLessons.js"; /** * Backend with Node.js — 10 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const backendWithNodeJs: Record<string, TopicLesson> = {
  "web-dev-backend-with-node-js-node-js-runtime": {
    intro: `Node.js is a JavaScript runtime built on V8 that runs on the server: the same language as the browser, plus modules, streams, buffers, filesystems, sockets, and child processes. The subject is how the runtime actually executes your code — the event loop phases, streams for large data, workers for CPU-bound work, and the process lifecycle from boot to graceful shutdown. Node.js is a single-threaded, event-driven runtime whose power is I/O concurrency and whose discipline is keeping the loop free.`,
    foundations: `The event loop has phases: timers (setTimeout/setInterval), pending callbacks, idle/prepare, poll (I/O callbacks), check (setImmediate), close callbacks; microtasks (promise jobs, process.nextTick) drain between phases/callbacks. nextTick queues before promise microtasks in Node semantics. Streams: Readable, Writable, Duplex, Transform; backpressure via pipe or pipeline; highWaterMark for buffer chunks. Buffers hold raw bytes. Worker threads run CPU-heavy work in parallel; cluster forks processes sharing the port. process exposes argv, env, exitCode, signals; graceful shutdown on SIGTERM: close servers, drain connections, flush, exit.`,
    concepts: [
      {
        title: "The event loop phases and where your code lands.",
        body: `Every I/O callback, timer, and immediate executes in a phase; the loop never blocks except inside your synchronous code. setTimeout(fn, 0) enters timers phase; setImmediate(fn) enters check phase — but after poll, so from within I/O callbacks immediate runs first, from top-level they race. Promises resolve interleaved with phases via the microtask queue; process.nextTick has its own queue flushed before promises. Consequence: heavy synchronous work stalls all connections; long computation belongs in worker_threads or child processes — never in request handlers on the main loop.`,
      },
      {
        title: "Streams and backpressure.",
        body: `Streams process data chunk by chunk without loading whole files into memory. pipe chains readable to writable with automatic backpressure (pauses when the consumer is full). Better: stream/promises pipeline() handles errors and cleanup properly. Readable.from(iterable) builds streams from arrays/generators. Transform streams encapsulate map stages (gzip, encrypt, CSV parse). For uploads/downloads, always stream; a 2 GB file with readFile crashes on memory. Handle 'error' explicitly; a dead consumer should reject the pipeline, not hang the request.`,
      },
      {
        title: "Worker threads, cluster, and child processes.",
        body: `worker_threads: same process memory sharing via SharedArrayBuffer; message passing for structured data; perfect for CPU-bound (image resizing, PDF generation); each worker loads its own V8 isolate + module graph. cluster: fork N processes sharing a port via the primary accept-distribute; cheap multi-core scaling with separate heaps; restarts via PM2 or systemd. child_process: spawn for external binaries with streaming stdio; exec for small outputs; fork for Node subprocesses with IPC channel. Choose: same-process CPU off main thread → worker; multi-core HTTP scaling → cluster; external tools → spawn.`,
      },
      {
        title: "Buffers and binary data.",
        body: `Buffer is a fixed-length byte sequence allocated from a pool (Buffer.from, Buffer.alloc, Buffer.allocUnsafe). Use Buffer.concat to assemble chunks; encoding helpers (utf8, base64, hex) convert; Buffer.compare for order-independent sorting; Buffer.isBuffer for type checks. Network and file data are bytes before they are strings — never assume UTF-8 arrives clean; validate. For numeric binary protocols, use DataView or custom struct readers; for cryptographic material, Buffer directly with timing-safe comparison.`,
      },
      {
        title: "Modules and the process lifecycle.",
        body: `ESM is the standard ('type': 'module'), but CJS powers much of the ecosystem; package.json exports fields define public entry points; conditional exports (import/require/node/browser) route per platform. The process starts: load, parse .env if present, boot the server, register listeners; on SIGTERM/SIGINT: stop accepting new connections, finish in-flight requests (or time out), close DB pools, flush logs, exit(0). Unhandled rejections and exceptions crash in modern Node by design — catch at the top level, log with context, and let the supervisor restart; never swallow.`,
      },
    ],
    worked: [
      {
        title: "Stream a 5 GB upload to S3 without loading it.",
        body: `req (IncomingMessage is Readable) → pipeline(req, busboy or multipart parser, s3UploadStream) or for single-file: pipeline(req, createWriteStream(tmpPath)) then multipart upload in parts via s3.upload with fs streams; memory stays at highWaterMark level (~64 KB per stream); a 100 KB heap serves multi-GB files; errors reject the pipeline and unlink the temp file. Compare to readFile-to-buffer: same code shape, 50,000x less peak memory.`,
      },
      {
        title: "Move image resizing off the main loop.",
        body: `CPU-heavy resize blocks every concurrent request. worker_threads with a pool (e.g., piscina or hand-rolled 4 workers): main thread posts { id, src } messages; worker runs sharp; posts back { id, result }; main thread responds to that request. Throughput scales with cores; the HTTP loop stays responsive (P99 flat under load); a 'drain' queue bounds pending work; overload returns 503 early instead of queuing unboundedly.`,
      },
      {
        title: "Graceful shutdown under Kubernetes.",
        body: `SIGTERM arrives on pod eviction: server.close() stops new connections; track in-flight requests with a counter middleware; when count hits 0 (or 10 s timer), close DB and cache pools, flush pino logs, exit(0); readiness probe returns 503 during drain so the load balancer routes elsewhere first. Test with in-flight curl during deploy; without drain you drop live requests on every rollout.`,
      },
    ],
    exam: [
      {
        question:
          "Why does a single synchronous 800 ms computation ruin P99 latency on Node?",
        answer:
          "The event loop is single-threaded; that computation occupies the only thread, so every other pending I/O callback waits — all concurrent requests stall for the duration; offload to worker_threads or child processes so the loop keeps draining.",
      },
      {
        question: "What does backpressure in streams prevent?",
        answer:
          "Memory exhaustion: a fast producer (disk read) outrunning a slow consumer (network write) buffers unbounded data otherwise; pipe/pipeline pause the source when the destination signals fullness, bounding memory to highWaterMark.",
      },
      {
        question: "What is the difference between worker_threads and cluster?",
        answer:
          "Worker threads are parallel execution units within one process sharing memory constructs; cluster forks whole processes (own heap, own module state) that share the port; cluster scales I/O-bound HTTP across cores; workers offload CPU without process duplication.",
      },
      {
        question: "What should a top-level unhandled rejection handler do?",
        answer:
          "Log the error with full context and exit non-zero so the process supervisor (systemd, PM2, k8s) restarts a fresh, consistent process; continuing in a corrupt state or swallowing errors hides failures and violates fail-fast production design.",
      },
    ],
    cheat: [
      "Event loop: timers → pending → poll → check → close; microtasks between.",
      "nextTick before promise queue; never block the loop.",
      "pipeline() > pipe > manual; backpressure bounds memory.",
      "worker_threads for CPU; cluster for multi-core; spawn for binaries.",
      "Buffer = raw bytes; compare and concat carefully.",
      "ESM via type:module; exports field defines public entry.",
      "SIGTERM → drain, close pools, flush, exit(0).",
    ],
    recap: `Node.js is a V8-based, event-loop-driven runtime: phases (timers, poll, check) execute callbacks while microtasks interleave; streams pipeline bytes with bounded memory; workers and clusters split CPU and multi-core work off the main thread; buffers handle raw binary; and production discipline — no synchronous blocking, explicit error handling, graceful shutdown — is what separates a fast demo from a reliable service.`,
    code: {
      title: "Streaming file response with backpressure",
      language: "javascript",
      code: `import { pipeline } from 'stream/promises';\napp.get('/report', async (req, res) => {\n await pipeline(createReadStream('report.csv'), res);\n});`,
      explanation:
        "Reads the CSV in chunks and writes to the socket; pipeline handles errors and cleanup; memory stays flat regardless of file size.",
    },
    diagram: {
      title: "Event loop flow",
      caption: "Callbacks per phase; microtasks between.",
      mermaid: `flowchart TD\n T[Timers] --> P[Poll]\n P --> C[Check]\n C --> T`,
    },
  },
  "web-dev-backend-with-node-js-express-and-fastify": {
    intro: `Express and Fastify are the two workhorses for HTTP services on Node: Express is the ubiquitous middleware framework, Fastify the performance-first schema-driven alternative. The subject is production-grade API structure with them — routing, middleware chains, validation, centralized error handling, structured logging, and the shape that scales from prototype to serious service. a good API framework is invisible in code and loud in logs.`,
    foundations: `Express: app.get/post handlers; middleware via app.use(fn) chaining (req, res, next); error-handling middleware has 4 args (err, req, res, next); routers group routes (express.Router()); order matters — body parsing, auth, then handlers. Fastify: same ideas, faster: plugins (encapsulated scopes), JSON Schema validation built-in (ajv), hooks (onRequest, preHandler, onResponse), schema-first routes, pino logger built-in, route prefixing, reply.send for serialization. Both: async handlers, async error propagation (Express 5 handles natively; Fastify native).`,
    concepts: [
      {
        title: "Middleware order and the request lifecycle.",
        body: `Request enters: global middleware (CORS, helmet, request-id, body parser, auth) → router → route handler → response. Skipping middleware is impossible once registered — so gate by path (app.use('/admin', adminAuth)). Error-handling last; 404 handler before it. res.json/res.send hydrate responses; res.status() chains. Async handler signature: either catch + pass to next(err) or rely on Express 5 automatic forwarding; always centralize unexpected errors in one middleware that maps them (known errors → status, unknown → 500 + log).`,
      },
      {
        title: "Validation at the boundary.",
        body: `Validate everything entering the system: query, params, body, headers. Zod (framework-agnostic) or Fastify schemas (JSON Schema, auto-generates OpenAPI). Never read req.body raw in handlers; parse into typed objects; fail with 400 plus structured issues ([{ path, message }]); coercion for primitives (z.coerce.number()). Validation errors are client errors — return 400, not 500. Centralize the parse-or-400 pattern in a tiny wrapper (parseBody(schema, req)) so handlers stay clean.`,
      },
      {
        title: "Centralized error handling.",
        body: `Create an ApiError class with statusCode, code, public message; throw it anywhere (or next(err)); the final middleware maps: ApiError → its status + body { error: { code, message, details? } }; unknown errors → 500 with generic message + full log; validation → 422/400 with issues; not found → 404. Consistent shape lets the frontend branch on code, not on message text. Log once at the boundary with pino: request id, user id, route, status, latency; never log secrets — redact auth headers and bodies with PII.`,
      },
      {
        title: "Fastify specifics: plugins, hooks, serialization.",
        body: `Plugins encapsulate routes + decorators in scoped contexts (fastify.register(import routes, { prefix: '/api' })); hooks wrap requests: onRequest (rate limit), preHandler (auth), onResponse (logging). Schemas per route give automatic validation + fast serialization via compiled serializers (fast JSON stringify) — faster than JSON.stringify and safe against accidental property leaks (response schema whitelists fields). reply.header, reply.code, reply.send chain. Fastify suits high-throughput services; Express suits maximal middleware ecosystem familiarity.`,
      },
      {
        title: "Production API shape: config, logging, health.",
        body: `Startup: parse env (dotenv + zod — fail fast on missing keys), create server, register plugins, listen. Health: GET /health (liveness) and /ready (readiness, checks DB ping); request id middleware (pino-http); compression; graceful shutdown. Structure as app.js (assembly) + routes/ + services/ + lib/; keep handlers thin (parse, call service, respond); business logic in services for testability. Rate limiting at the edge (or proxy); trust proxy settings for correct IPs behind load balancers.`,
      },
    ],
    worked: [
      {
        title: "Ship a validated route group with central errors.",
        body: `usersRouter: router.post('/users', async (req) => { const body = CreateUserSchema.parse(req.body); const user = await users.create(body); return user; }); — zod parse throws ZodError → error middleware maps to 400 { error: { code: 'VALIDATION', issues } }; duplicate email throws ApiError(409, 'EMAIL_TAKEN') → 409; Postgres down → unknown error → 500 + pino log with request id; the client always receives a consistent JSON error shape; success returns 201 with the created resource.`,
      },
      {
        title: "Migrate an Express hot path to Fastify.",
        body: `Symptom: 1,400 rps ceiling on /quotes endpoint despite CPU idle. Move route to Fastify: JSON Schema for query/body/response; reply.send with schema serializer; onResponse logging hook; keep rest of app on Express behind a reverse proxy (or incrementally port); result: 3,100 rps same document, 30% lower p99, automatic OpenAPI from schema. Measure before/after with autocannon; adopt Fastify where profiling proves it matters.`,
      },
      {
        title: "Build a request-id-aware logger.",
        body: `pino-http assigns req.id (from header x-request-id or randomUUID); every log line includes req.id; the id is echoed in response headers and error bodies; support can correlate one user report to the exact log lines; redact: authorization, cookie, password fields via pino redact paths; pretty-print in dev, JSON in prod; logs feed Loki/ELK; dashboards per-route latency/error rate from the emitted structured events.`,
      },
    ],
    exam: [
      {
        question:
          "Why must error-handling middleware be registered last in Express?",
        answer:
          "Middleware chains run in registration order on the way in; the error handler only receives control via next(err) or thrown async errors from earlier middleware/routes; registered later, it catches everything before the response is sent; registered earlier, errors bypass it entirely and hit the default handler.",
      },
      {
        question:
          "What does a response schema in Fastify buy you besides validation?",
        answer:
          "Safety and speed: it whitelists serialized fields (no accidental leaks like password hashes), compiles a fast serializer, and documents the contract; Fastify uses it for automatic JSON output with correct content-type — no res.json() needed.",
      },
      {
        question:
          "Why centralize error mapping instead of try/catch per route?",
        answer:
          "Consistency and less code: one place defines the error taxonomy — known domain errors map to statuses and codes, unknowns become 500s with safe messages and full logs; scattered try/catch produce inconsistent shapes, missing logs, and leaked internals.",
      },
      {
        question: "What belongs in a readiness probe vs a liveness probe?",
        answer:
          "Liveness: is the process alive (restart if not); readiness: can it serve traffic now — DB reachable, cache reachable, not draining; orchestrators route to ready pods and restart unready ones; probing dependencies in liveness causes restart storms.",
      },
    ],
    cheat: [
      "Middleware order: parser → auth → handler → 404 → error handler.",
      "Validate at boundary: zod/JSON Schema; 400 not 500.",
      "ApiError with code+status; central mapper for consistent bodies.",
      "pino structured JSON; request id echoed; redact secrets.",
      "Fastify: schema per route → validation + serialization + OpenAPI.",
      "Thin handlers; services hold logic; errors flow up one path.",
      "Health: /health liveness; /ready dependencies + drain state.",
    ],
    recap: `Express and Fastify structure the HTTP edge identically: ordered middleware (CORS, body parse, auth) → routers → handlers, with boundary validation, one centralized error mapper producing consistent JSON errors, structured redacted logging, and health probes; Fastify adds schema-first routes with fast compiled serialization; production APIs keep handlers thin and push behavior into services, with startup validated by zod and shutdown drained gracefully.`,
    code: {
      title: "Express 5 async error centralization",
      language: "javascript",
      code: `app.use((err, req, res, next) => {\n const status = err.status ?? 500;\n res.status(status).json({ error: { code: err.code ?? 'INTERNAL', message: status === 500 ? 'Internal error' : err.message } });\n});`,
      explanation:
        "One place maps thrown errors to the public shape; handlers throw freely; unknowns hide details while still logging with the request id.",
    },
    diagram: {
      title: "Express request pipeline",
      caption: "Ordered middleware; errors flow to the mapper.",
      mermaid: `flowchart LR\n R[Request] --> B[Body parser]\n B --> A[Auth]\n A --> H[Handler]\n H --> E[Error mapper]`,
    },
  },
  "web-dev-backend-with-node-js-rest-and-graphql-apis": {
    intro: `REST and GraphQL are the two API styles of the web era: REST models resources as URLs with HTTP semantics; GraphQL models a typed graph with client-driven queries. The subject is designing both well — resource modeling, pagination, filtering, versioning for REST; schemas, resolvers, and composition for GraphQL — so consumers get predictable, evolvable contracts. an API is the product's public promise; design the promise once and change it carefully.`,
    foundations: `REST: resources as nouns (/invoices, /invoices/42, /invoices/42/items); HTTP methods map to CRUD (GET read, POST create, PUT replace, PATCH partial update, DELETE delete); status codes mean what they say (200, 201, 400, 401, 403, 404, 409, 422, 429, 500); headers carry negotiation (Accept, Content-Type, ETag); idempotent methods safe to retry; HATEOAS optional. GraphQL: schema (types, Query, Mutation, Subscription); resolvers fetch per field; clients ask exactly what they need; one endpoint; N+1 problem solved by DataLoader; federation stitches subgraphs.`,
    concepts: [
      {
        title: "Resource modeling and URL design.",
        body: `Nouns, plural, nesting one level: /customers/{id}/invoices vs /invoices?customer= — filtering via query strings scales better than deep nesting; use IDs not slugs in paths unless SEO demands readable slugs; bulk operations as nouns (/invoices/bulk-imports); actions that have no resource shape as explicit verbs sparingly. Status codes strictly: 201 for created (Return the Location header), 204 for empty success, 409 for conflicts (duplicate, version clash), 422 for semantic validation failures, 429 rate-limited with Retry-After. Idempotency keys (Idempotency-Key header) for POST retries.`,
      },
      {
        title: "Pagination, filtering, and sorting.",
        body: `Offset (page, limit) is simple but breaks under writes mid-page (duplicates/skips); cursor-based (after=opaque-cursor over a sort key) is stable, better for infinite feeds; keyset comparison on the tuple (created_at, id), which scales with an index over the sort columns. Filter allowlist (filter[status]=open&filter[gte]=2024-01-01): never raw SQL from input; sort whitelist (sort=-createdAt); field selection (fields=id,total) trims payloads; defaults and max page size enforced server-side; responses wrap in { data, pageInfo { hasNextPage, endCursor } }.`,
      },
      {
        title: "Versioning and evolution.",
        body: `Version in the URL (/v1/ → /v2/) or via header (Accept: application/vnd.api+json; version=2); URL versioning is dumb and effective. Never break: add fields (additive changes are safe), never remove/rename; mark deprecated fields (Deprecation + Sunset headers), telemetry on usage, remove after usage is zero; new major version for breaking steps (renames, type changes, auth changes); clients must ignore unknown fields. For GraphQL: deprecate fields with @deprecated; additive evolution only; subgraph versioning for federation.`,
      },
      {
        title: "GraphQL: schemas, resolvers, and N+1.",
        body: `Schema-first: types define the contract; Query/Mutation define entry; resolvers per field return values or throw GraphQLError; context carries auth/db clients; DataLoader batches and dedupes — one query per (type, key) per request kills the N+1 pattern (100 invoices × 100 customer lookups = 1 batched lookup). Unions/interfaces for polymorphism; directives for cross-cutting (@auth); subscriptions over WebSocket/SSE for live updates. Validate depth and complexity to prevent abuse; @cost directives or hard depth limits.`,
      },
      {
        title: "Federation and hybrid patterns.",
        body: `Federation: subgraphs (users, billing, catalog) own their types; the gateway composes and plans cross-service queries; entities (@key) stitch by key reference; two teams ship independently. Hybrid: REST for public/simple surfaces (CDN-cacheable, cacheable with ETag), GraphQL for client-rich nested data (mobile home screen needs 8 resource types in one round trip). Caching: REST plays with CDNs out of the box; GraphQL needs persisted queries + response caches (GET /graphql?query-id). Choose per consumer.`,
      },
    ],
    worked: [
      {
        title: "Design invoice endpoints before code.",
        body: `POST /v1/invoices (create; Idempotency-Key; 201 + Location; 422 issues); GET /v1/invoices?status=open&sort=-createdAt&limit=25&after=cur (cursor page; filter allowlist); GET /v1/invoices/:id (404 problem+json if missing); PATCH /v1/invoices/:id (Accept-Version semantics; 409 on version clash with If-Match); POST /v1/invoices/:id/payments (sub-action with own idempotency); GET /v1/invoices/export (async job; 202 Accepted + job URL) — same shapes reusable across every resource; SDK generated from OpenAPI.`,
      },
      {
        title: "Implement a cursor-paginated feed with stable sort.",
        body: `Sort by (created_at DESC, id DESC); store last seen tuple; SQL: WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 26; take 26, drop the 26th as hasNextPage; base64(JSON[created_at, id]) as cursor; no duplicates on mid-list inserts; pair with ETag 304 for unchanged pages near the top; cache in CDN with private keying for personalized feeds; document cursor opacity — clients must never parse it.`,
      },
      {
        title: "Fix the N+1 in a GraphQL order query.",
        body: `query { orders(first: 50) { id customer { name } items { sku qty } } } — naive resolvers: 1 + 50 + 50 queries. DataLoader for Customer (batches IDs, one IN query) and for OrderItems (batches order_ids) → 3 queries total; cache per request so repeated customer IDs resolve once; result p95 800→120 ms at 2k rps; audit with query-time logging (per-resolver µs) — the N+1 always shows up as suspicious fan-out.`,
      },
    ],
    exam: [
      {
        question:
          "Why is cursor pagination preferable to offset for write-heavy feeds?",
        answer:
          "Offset shifts rows as inserts happen — pages repeat or skip; a cursor pins the position to a sort tuple, so results stay stable under concurrent writes; it also performs predictably at the tail with proper indexes (no COUNT/OFFSET scan cost).",
      },
      {
        question: "What makes a POST retry-safe to implement?",
        answer:
          "An Idempotency-Key captured and checked before executing; storing key → result for a TTL window (24-72h) and replaying stored responses on duplicate keys; plus natural idempotency where possible (set-based semantics instead of increments); never let retries double-charge.",
      },
      {
        question: "How does DataLoader solve the N+1 problem?",
        answer:
          "It batches individual field resolutions within one request into one bulk call per type (deduplicating keys too), turning 1+50+50 queries into 3: it is the standard bridge between GraphQL field resolution and batch-oriented data layers.",
      },
      {
        question:
          "What may a REST API add and what may it never change non-breaking?",
        answer:
          "Adding new fields, new endpoints, new optional parameters is safe; removing/renaming fields, changing types, tightening constraints, changing auth semantics are breaking; mark deprecated fields, measure usage, remove only after zero, or version to /v2.",
      },
    ],
    cheat: [
      "Nouns for resources; verbs only for actions without resource shape.",
      "Status codes honest: 201/204/400/401/403/404/409/422/429.",
      "Cursor pagination for stable, scalable lists; offsets only for small static sets.",
      "Filter/sort/field allowlists; never raw input to SQL.",
      "Additive evolution; deprecate with headers; version majors.",
      "GraphQL: schema-first; DataLoader for N+1; depth limits.",
      "REST cached by CDNs; GraphQL persisted queries for caches.",
    ],
    recap: `APIs are contracts: REST expresses resources with URLs, methods, and honest status codes, paged cursor-first and evolved additively; GraphQL expresses a typed graph resolved per field, defended with DataLoader and depth limits; choose per consumer, keep idempotency and validation at every boundary, and version through discipline, not ceremony — stable clients make stable products.`,
    code: {
      title: "Cursor pagination query shape",
      language: "sql",
      code: `SELECT id, created_at FROM orders\nWHERE (created_at, id) < ($1, $2)\nORDER BY created_at DESC, id DESC\nLIMIT $3;`,
      explanation:
        "Tuple-comparison keyset pagination: stable under inserts, uses index (created_at, id), and never scans offset rows — the correct shape for an infinite feed.",
    },
    diagram: {
      title: "GraphQL resolution with DataLoader",
      caption: "One request; batched field lookups.",
      mermaid: `flowchart LR\n Q[Query] --> R[Resolvers]\n R --> D[DataLoader batch]\n D --> B[One bulk query]`,
    },
  },
  "web-dev-backend-with-node-js-authentication-and-authorization": {
    intro: `Authentication proves who the caller is; authorization decides what they may do; every serious application needs both, applied consistently across every endpoint. The subject is the machinery behind them — passwords and hashing, sessions vs tokens, cookies and CSRF, OAuth and identity providers, RBAC/ABAC, and the failure modes that actually get apps breached. auth is not a feature, it is a perimeter applied per request, per action, per resource.`,
    foundations: `Authentication (AuthN): identity via credentials or federated sign-in. Passwords hashed with bcrypt or argon2 (memory-hard), salted; never store plaintext or unsalted hashes. Sessions: server-side state in a store (Redis/DB), client holds opaque session id in an HttpOnly Secure SameSite cookie; instant revocation. JWTs are self-contained claims signed by the server — stateless, good for APIs, but revocation requires short expiry + refresh rotation or a denylist. Cookies carry flags: HttpOnly (no JS access), Secure (HTTPS only), SameSite (CSRF mitigation: Lax blocks cross-site POSTs in most browsers). Authorization (AuthZ): RBAC (roles grant permissions), ABAC (attributes — department, time, resource owner — decide access), and ownership checks per resource.`,
    concepts: [
      {
        title: "Password handling done right.",
        body: `Hash with bcrypt (cost 10-12) or argon2id (memory-hard, tunable); never SHA-256/MD5 alone — fast hashes are brute-forceable. Salts are per-password and automatic in bcrypt/argon2. Compare in constant time (bcrypt.compare). Add rate limiting on login endpoints, account lockout or progressive delay after failures, generic error messages ("invalid credentials", not "user not found"), MFA via TOTP or WebAuthn for high-value accounts, and breach-aware checks (HaveIBeenPwned k-anonymity) at registration. Forgot-password: single-use, short-lived, hashed tokens; never leak whether the email exists.`,
      },
      {
        title: "Sessions vs JWT for APIs.",
        body: `Sessions: opaque id in cookie, server-side lookup; pros — instant revocation, server controls lifetime (rolling or absolute expiry), cookie HttpOnly protects against XSS token theft; cons — store lookup per request, horizontal scaling needs shared store. JWT: claims travel in the token; pros — stateless, cdns/edge verify without a store, multiple services verify independently; cons — revocation is the hard part: use 5-15 minute access tokens + rotating refresh tokens stored hashed server-side, reuse detection revokes the whole family. Hybrid: JWT for access + server-side refresh rotation is the industry default for APIs.`,
      },
      {
        title: "Cookies, CSRF, and XSS defense in depth.",
        body: `XSS: output encode, CSP, never innerHTML with user data, sanitize rich text, framework auto-escaping, HttpOnly cookies keep tokens out of JS reach. CSRF: SameSite=Lax/Strict cookies mitigate; classic tokens (double-submit cookie or per-form token validated server-side) for defense in depth; state-changing requests never via GET; CORS allows only your own origins with credentials; verify Origin header where feasible. Content-Type enforcement: require application/json for mutations so forms cannot be cross-posted blindly.`,
      },
      {
        title: "OAuth 2.0 and identity providers (overview).",
        body: `OAuth delegates: users authorize your app to access their account at a provider without sharing the password; OpenID Connect layers identity (ID token with sub, email, name) on top. Authorization code flow with PKCE is the default for public clients (SPAs, mobile, CLI): your app gets an authorization code, exchanges it for tokens at the token endpoint with the PKCE verifier, receives access/ID/refresh tokens. Never use the implicit flow (tokens in URL) — deprecated; never embed client secrets in public clients. Provider SDKs (Auth0, Clerk, WorkOS, OIDC libraries) beat hand-rolling; integrate with your session system: verify ID token, map sub to your user, establish your own session.`,
      },
      {
        title: "RBAC, ABAC, and resource ownership.",
        body: `RBAC: users ↔ roles ↔ permissions (admin, editor, viewer); simple and auditable, coarse-grained. ABAC: policy decisions from attributes (subject.department == resource.department, time < 18:00) — expressive, harder to reason about; frameworks (Casbin, OPA, Cedar) help. Every resource mutation checks ownership/scope server-side: user can edit any order only if it is theirs (or they are staff); tenant scoping: filter every query by tenant_id from the session, never trust a client-sent tenant header. Deny by default; permission checks centralized in middleware/guards; log authorization denials.`,
      },
    ],
    worked: [
      {
        title: "Build the login endpoint end to end.",
        body: `POST /login: lookup user by email (constant-time-ish timing to avoid enumeration — hash a dummy password on miss); bcrypt.compare; on fail: increment failure counter with lockout (exponential backoff, temporary lock after 5); on success: create session (random id, store { userId, ip, ua, expiresAt } in Redis with TTL), set cookie: HttpOnly, Secure, SameSite=Lax, max-age aligned to rolling re-issue; return { user: { id, name } }; optional MFA step if enrolled. Log the attempt with outcome; never log passwords.`,
      },
      {
        title: "Add CSRF protection without framework magic.",
        body: `Double-submit pattern: issue a csrf_token cookie (readable by JS) alongside the session cookie; the form posts it back as a header (x-csrf-token); the server compares cookie token vs header token — different origins cannot read your cookies nor the header preflight would fail; SameSite adds a second wall; verification is O(1); missing/mismatched → 403 with a generic code; rotate the token on login and privilege change.`,
      },
      {
        title: "Revoke a stolen refresh token family.",
        body: `User reports phone stolen. Ops dashboard: find refresh tokens by user, mark the user family revoked; access tokens live ≤15 minutes and naturally die; any use of a revoked refresh token (reuse detection) triggers family revocation + alert email "your session was used"; the session store entry is deleted for the stolen device; user logs in fresh and gets new tokens; audit log shows exactly which tokens, when, from which IP — incident timeline built from data, not guesses.`,
      },
    ],
    exam: [
      {
        question:
          "Why must passwords be hashed with bcrypt or argon2 instead of fast hashes?",
        answer:
          "Fast hashes (SHA-256, MD5) are designed for speed — GPUs brute-force billions of guesses per second; bcrypt/argon2 are deliberately expensive and memory-hard, raising the cost of guessing to the point that leaked hashes resist cracking; salts make rainbow tables useless.",
      },
      {
        question:
          "What is the revocation weakness of plain JWTs and the standard fix?",
        answer:
          "A signed JWT remains valid until expiry — you cannot take it back without a store; the fix is short-lived access tokens (minutes) plus rotating refresh tokens with server-side reuse detection; any replay of an old refresh revokes the whole family, achieving near-instant global revocation in practice.",
      },
      {
        question:
          "How do SameSite cookies mitigate CSRF and what do they not stop?",
        answer:
          "SameSite=Lax/Strict prevents the browser from sending the session cookie on cross-site POSTs in most cases, neutralizing classic CSRF; they do not stop same-site attacks within your own origin, XSS-driven forgery, or older browser gaps — so keep tokens or origin checks as defense in depth.",
      },
      {
        question:
          "What is the difference between authentication and authorization failures?",
        answer:
          "Authentication failure means identity could not be established (401 Unauthorized — not signed in or invalid credentials); authorization failure means identity is known but the action is forbidden (403 Forbidden — signed in, not allowed); logs, status codes and client behavior differ meaningfully.",
      },
    ],
    cheat: [
      "bcrypt/argon2 with salt; constant-time compare; no SHA family for passwords.",
      "Sessions: HttpOnly+Secure+SameSite; JWT: short access + rotating refresh + reuse detection.",
      "CSRF: SameSite + double-submit token; never authorize via GET.",
      "XSS: escape output, CSP, no innerHTML with user data; HttpOnly keeps tokens out of JS.",
      "OAuth code+PKCE for public clients; never implicit; SDK over hand-roll.",
      "RBAC for roles, ABAC for attributes; ownership checks per resource.",
      "Tenant scoping server-side; deny by default; log denials.",
    ],
    recap: `Auth is a per-request perimeter: passwords hashed with memory-hard algorithms, sessions or short-lived JWTs with rotating refreshes for tokens, cookies with HttpOnly/Secure/SameSite plus CSRF tokens for the browser threat model, OAuth/OIDC for federation with PKCE everywhere, and authorization enforced server-side per resource with RBAC/ABAC and tenant scoping — deny by default, log everything, and never trust the client.`,
    code: {
      title: "Constant-time-ish login handler",
      language: "javascript",
      code: `const ok = await bcrypt.compare(req.body.password, user?.passwordHash ?? dummyHash);\nif (!ok) return res.status(401).json({ error: 'Invalid credentials' });`,
      explanation:
        "Always run the bcrypt compare against a real-or-dummy hash so timing does not reveal whether the email exists; generic message keeps enumeration away; lockout counter handled around this.",
    },
    diagram: {
      title: "Login request flow",
      caption: "Verify, issue, set cookie.",
      mermaid: `flowchart LR\n L[Login] --> V[Verify hash]\n V --> S[Create session]\n S --> C[HttpOnly cookie]`,
    },
  },
  "web-dev-backend-with-node-js-oauth-2-0-and-openid-connect-in-depth": {
    intro: `OAuth 2.0 is the authorization framework behind "Sign in with Google" and API access delegation; OpenID Connect (OIDC) layers identity — who the user is — on top of it. The subject is the flows end to end: authorization code with PKCE, tokens and their lifetimes, scopes and consent, refresh and rotation, session management in your app, and the failure modes — weak redirects, token leakage, mix-up attacks — that show up in real integrations. OAuth is delegation with receipts — prove who you are without sharing the key to the vault.`,
    foundations: `Actors: resource owner (user), client (your app), authorization server (provider), resource server (API). Flows: authorization code (web/SPA/mobile backbone), client credentials (service-to-service), refresh token (renew access), device code (TVs/CLI); implicit and password grant are deprecated. PKCE: code_verifier hashed to code_challenge sent at authorize, original verifier presented at token exchange — binds the code to the client that started the flow. Tokens: access (API calls, short-lived), ID (identity claims, JWT, for the client), refresh (renew, long-lived, revocable). Scopes limit access; consent records what the user agreed to; state parameter defeats CSRF on redirect; redirect_uri is allowlisted exactly.`,
    concepts: [
      {
        title: "Authorization code flow with PKCE, step by step.",
        body: `1) App generates code_verifier (random) and code_challenge = base64url(sha256(verifier)); 2) redirect user-agent to /authorize?response_type=code&client_id&redirect_uri&scope&state&code_challenge&code_challenge_method=S256; 3) user authenticates and consents at the provider; 4) provider redirects back to redirect_uri?code=...&state=...; 5) app verifies state; 6) backend posts grant_type=authorization_code, code, redirect_uri, client_id, code_verifier to /token; 7) provider returns access_token, id_token, refresh_token. The PKCE verifier proves the code was exchanged by the same app that started the flow — stolen codes are useless. State ties the callback to the browser session — CSRF on the redirect is rejected.`,
      },
      {
        title: "ID tokens, access tokens, and your own session.",
        body: `ID token is a JWT for your app: verify signature against provider JWKS (cache keys), check iss, aud (your client id), exp, nonce (if you sent one — binds value to this sign-in round, defeats replay). Access token is for the resource server — opaque or JWT per provider; your app usually should not introspect it; call APIs with it directly. Establish your own session after verification: map provider sub (+ iss) to your user record; issue your HttpOnly cookie; your internal session outlives the OAuth exchange; refresh handling per provider rules. Never trust an unverified token; never log token contents.`,
      },
      {
        title: "Refresh tokens, rotation, and reuse detection.",
        body: `Access tokens expire quickly (5-60 min); refresh tokens renew them without user interaction. Best practice: rotate refresh tokens on each use — provider issues a new one and invalidates the old; if an already-rotated token shows up (reuse), kill the whole token family: every session from this grant is revoked. Store refresh tokens hashed server-side; scopes pinned; revocation on logout and on password/security events; absolute session cap (e.g., 30 days) regardless of rotations; audit refresh usage anomalies (geography jumps, burst refreshes).`,
      },
      {
        title: "Scopes, consent, and least privilege.",
        body: `Scopes name the capabilities requested (openid, email, profile, calendar.read); the consent screen shows what the user grants; request the minimum; incremental authz (ask for more scopes when needed, not upfront). Consent fatigue is real — request narrow, named access; record grants for audit; honor offline_access only when you truly need background access; on the resource side, enforce scopes as permissions. Mis-scoped tokens (admin scope for a read button) are how least-privilege dies — map each route to exact scopes.`,
      },
      {
        title: "Failure modes and attacks to defend.",
        body: `redirect_uri mismatch/weak allowlist → open redirect and token theft: pin exact URIs. State missing/reused → CSRF on login. Token mix-up across providers (id_token from A validated by B's keys) → pin iss + aud + JWKS per provider. alg=none/RS256→HS256 confusion → use library defaults, never hand-rolled verification. Clickjacked consent → provider frames blocked or X-Frame-Options + frame-ancestors. Logging tokens, storing them in localStorage (XSS-readable) → use HttpOnly cookies for your session, ephemeral memory for API calls. Monitor: token endpoint error rates, refresh rotation failures, anomalous geography — your early-warning system.`,
      },
    ],
    worked: [
      {
        title: "Implement sign-in with Google for a web app.",
        body: `Register client; set authorized redirect_uri https://app.example.com/auth/callback. /login generates verifier/challenge/state, cookies verifier+state, redirects to Google with scopes openid email profile. Callback: state match; POST code+verifier to token endpoint; verify id_token (JWKS, aud=client id, iss=https://accounts.google.com, exp, nonce); find-or-create user on sub; create your session (HttpOnly cookie); redirect to original destination stored before the flow; logout deletes your session and optionally revokes the refresh grant at Google. Time: ~90 minutes with an auth middleware library; security properties as above, for free.`,
      },
      {
        title: "Call a third-party API with the user grant.",
        body: `After sign-in, access token lives in server-side session storage only; a worker wants Drive access: load refresh token, exchange for access token, call Drive API with rate-limit handling (429 → Retry-After, exponential backoff), on 401 refresh once and retry once, on refresh failure mark connection revoked and prompt re-consent; store token expiry, refresh 60 s before expiry to avoid races; audit every outbound grant use with user id + scope + outcome — provider dashboards help but keep your own ledger.`,
      },
      {
        title: "Handle a suspected token leak incident.",
        body: `User reports weird activity. Triage: identify grant/family from logs (refresh usage timestamps/IPs); if reuse detected, auto-revoked — user already flagged; else revoke refresh at provider + delete session store key; force re-auth; scan auth logs for the suspicious IP across other users (credential stuffing pattern); rotate any app-level signing secrets if applicable; postmortem adds: mandatory nonce, shorten access token TTL, alert rule on refresh geography. Contain with provider APIs; document; harden.`,
      },
    ],
    exam: [
      {
        question: "What does PKCE protect against and how?",
        answer:
          "It binds the authorization code to the client that began the flow: the code alone is useless without the code_verifier that hashed to the code_challenge, so an intercepted code (via redirect interception, logs, or referrer leaks) cannot be exchanged by an attacker.",
      },
      {
        question: "Why must redirect_uri be an exact allowlist match?",
        answer:
          "Otherwise attackers register/point the flow at a URI they control and receive the code (and tokens via token endpoint in some profiles); partial matches enable path traversal and subdomain takeover tricks; exact matching is the defense the OAuth spec mandates.",
      },
      {
        question:
          "What does the id_token verify, and what does it not grant access to?",
        answer:
          "It proves to your app who the user is — its signature (iss, aud, exp, nonce) establishes identity at the provider; it conveys no API permissions by itself; calling APIs requires the access token; treating the ID token as an access token is a classic misuse.",
      },
      {
        question: "How does refresh-token rotation give you reuse detection?",
        answer:
          "Each refresh exchange issues a new refresh token and invalidates the previous; if an already-consumed token is presented, the provider (or your store) knows the family is compromised and revokes every token in it, turning silent token theft into an immediate, visible abort.",
      },
    ],
    cheat: [
      "Code + PKCE everywhere; never implicit; state defeats redirect CSRF.",
      "Verify id_token: JWKS, iss, aud, exp, nonce; establish your own session.",
      "Rotate refresh tokens; reuse detection revokes the whole family.",
      "pin exact redirect URIs; least scopes; incremental consent.",
      "Tokens never localStorage; HttpOnly for your session.",
      "Access TTL short; refresh server-side, hashed, revocable.",
      "On incident: revoke grant + session, audit logs, shorten TTLs, alerts.",
    ],
    recap: `OAuth/OIDC is delegation with verifiable receipts: authorization code with PKCE binds flows to clients, state binds callbacks to sessions, exact redirect allowlists prevent interception, verified ID tokens establish identity, refresh rotation gives reuse detection, scopes enforce least privilege, and your own HttpOnly session carries what the OAuth exchange cannot — per-request revocation, logout, and audit.`,
    code: {
      title: "Verify an id_token with a library",
      language: "javascript",
      code: `const { payload } = await jwtVerify(idToken, JWKS, { audience: CLIENT_ID, issuer: ISSUER });`,
      explanation:
        "jwtVerify fetches/caches provider keys, checks signature, expiry, issuer and audience; result payload carries sub/email for find-or-create; anything unverifiable throws and the login fails closed.",
    },
    diagram: {
      title: "Authorization code + PKCE",
      caption: "Verifier binds the exchange to the flow.",
      mermaid: `flowchart TD\n A[Authorize] --> C[Code redirect]\n C --> T[Token exchange with verifier]\n T --> S[Session established]`,
    },
  },
  "web-dev-backend-with-node-js-realtime-and-background-jobs": {
    intro: `Realtime and background jobs cover the push side of applications — WebSockets, SSE, queues, workers, schedulers — where work and updates flow without the user asking. The subject is building them reliably: queues with retries and idempotency for jobs, WebSockets/SSE for live data, cron-like scheduling, and the operational discipline (timeouts, dead-letter queues, observability) that keeps them trustworthy. asynchronous systems trade synchronous simplicity for resilience, and they demand explicit handling of failure, duplication, and order.`,
    foundations: `Background jobs: a producer enqueues work; a worker pulls, executes, acknowledges; failures retry with backoff; poison messages go to a dead-letter queue (DLQ). Queues (BullMQ on Redis, SQS) provide durability and visibility timeouts. Idempotency: jobs may run more than once — design side effects to survive duplication (unique keys, upsert semantics). Realtime: WebSockets (bidirectional, stateful, need sticky sessions or a broker for multi-node); SSE (one-way server→client, simple, auto-reconnect). Scheduling: cron or delayed jobs with jitter. Exactly-once is a myth; at-least-once + idempotent consumers is the real architecture.`,
    concepts: [
      {
        title: "Queue-backed job architecture.",
        body: `Components: producer (API writes job with payload + idempotency key), queue (Redis list + sorted sets for delays/retries), worker (concurrency N, per-job timeout, attempts/backoff), DLQ for exhausted jobs (alert + manual replay). Job states: waiting → active → completed/failed → delayed → prioritizable. BullMQ gives retries, backoff, rate limiting (rateLimit.max), priority queues, repeatable cron jobs, and metrics. Design payloads small — the job points at data, not holds it (attachment by reference to DB rows, not 5 MB blobs).`,
      },
      {
        title: "Idempotency and at-least-once delivery.",
        body: `Workers see every job at least once; duplicates happen on retries, timeouts misjudged, and deploys. Make handlers idempotent: natural unique keys (e.g., payment_id), upsert semantics (INSERT ... ON CONFLICT DO NOTHING), state machines that tolerate re-entry (skip if already emailed). Record processed keys with TTL; fail closed on ambiguity (alert, park job) rather than assume. External side effects (charges, emails) deserve idempotency keys propagated end-to-end — same key, same outcome.`,
      },
      {
        title: "WebSockets: state, scaling, and backpressure.",
        body: `A socket per client is cheap until it is not: memory per connection, heartbeat/ping-pong to detect dead peers, max payload limits, per-message origin check. Scaling beyond one node: sticky sessions (load balancer routes by cookie) or external pub/sub (Redis) — handlers subscribe/publish events so any node reaches any client; or switch to managed (Ably, Pusher, Supabase Realtime). Reconnect logic client-side with backoff + resume from a sequence number; server tracks last sent cursor per room. Backpressure: drop or coalesce for slow consumers rather than buffer unboundedly — prefer stale-or-skipped over growing memory.`,
      },
      {
        title: "SSE: the underrated one-way channel.",
        body: `Server-Sent Events: plain HTTP, text/event-stream, automatic client reconnection with Last-Event-ID; perfect for notifications, progress bars, live feeds, AI token streaming; works through proxies/CDNs (with correct headers: X-Accel-Buffering: no, Content-Type text/event-stream); one-way only — client posts via normal requests; heartbeat comments keep connections alive; scale with the fan-out pattern (writer publishes to Redis, each connection streams). Simpler than WebSockets; no library needed.`,
      },
      {
        title: "Scheduling, retries, and observability.",
        body: `Cron-style: repeatable jobs with every N (BullMQ repeat or node-cron); jitter spreads thundering herds (cron + random skew); catch-up policy after downtime (skip missed vs run-all — choose per job). Retries: exponential backoff + jitter, max attempts, classify retryable (network, 5xx) vs permanent (validation) errors; DLQ with alerts and a replay path. Observability: job duration p50/p95/p99, failure rate, queue depth, DLQ size; structured logs with job id traced through worker; dashboards per queue; SLOs with page-worthy thresholds (depth > 10k for 5 min).`,
      },
    ],
    worked: [
      {
        title: "Invoice email pipeline with BullMQ.",
        body: `API on invoice.issued enqueues send-invoice-email with { invoiceId, idempotencyKey: 'invoice:' + id + ':email' }; worker renders template, sends via provider with idempotency header, records { key, sentAt }; retries 3x exponential; after exhaustion job → DLQ → PagerDuty; worker concurrency 10 with limiter 50/min; daily repeatable job reconciles sent vs issued (catches enqueue gaps); metrics: sent, failed, p95 latency; support can replay DLQ from dashboard after fixing template bug — no code deploy needed for recovery already sitting in the queue.`,
      },
      {
        title: "Ship live order updates without WebSockets.",
        body: `Order page polls every 10 s — acceptable but wasteful. Upgrade: SSE endpoint /orders/:id/events streams status events; order service publishes to Redis channel orders:{id}; the SSE handler relays events with a monotonic event: sequence id; browser EventSource auto-reconnects with Last-Event-ID on drops; missed events replayed from a short Redis buffer (e.g., 100 events); page shows live progress checklist without sockets or polls; infra cost: one extra HTTP connection per watching client, trivial for this load.`,
      },
      {
        title: "Idempotent payment capture job.",
        body: `charge-job enqueued with { orderId, idempotencyKey }; worker: begin transaction → SELECT status FROM orders FOR UPDATE → if captured, return done (replayed safely) → else charge provider with idempotency key → mark captured in same transaction → enqueue receipt email (its own key). Retry-safe end to end; a crash between charge and mark leaves the provider already knowing the key — re-execution returns the original charge, no double capture; the order table is the ledger of truth; reconcile nightly against provider payout report anyway.`,
      },
    ],
    exam: [
      {
        question:
          "Why is exactly-once delivery considered impossible, and what do systems ship instead?",
        answer:
          "Networks and processes can always duplicate (ack lost, retry, crash mid-ack); systems provide at-least-once delivery plus idempotent consumers, which achieves effectively-once side effects; exactly-once is a property you build on top of keys and upserts, not something the transport grants.",
      },
      {
        question: "What is the purpose of a dead-letter queue?",
        answer:
          "It isolates jobs that exhausted retries so the main queue keeps flowing; operators inspect root causes, fix the issue (data, bug, provider outage), and replay deliberately; without one, poison messages jam or silently vanish; DLQ size is a core health metric.",
      },
      {
        question: "When do you choose SSE over WebSockets?",
        answer:
          "When updates flow server→client (progress, feeds, notifications, LLM token streams) and the client never pushes over the channel; SSE needs no handshake, survives proxies, auto-reconnects with replay, and is plain HTTP — WebSockets when you truly need bidirectional low-latency streaming.",
      },
      {
        question: "Why add jitter to retries and cron schedules?",
        answer:
          "Without jitter, many jobs/retries land on the same instant, spiking load on shared resources (thundering herd) — synchronized retries can take down the database they are all reconnecting to; jitter spreads arrivals over time, keeping recovery smooth.",
      },
    ],
    cheat: [
      "At-least-once + idempotent consumers > exactly-once fantasies.",
      "BullMQ/SQS: retries, backoff, priority, DLQ, rate limit, repeat.",
      "Jobs reference data by id; payloads small; keys idempotent.",
      "SSE for server→client; WebSockets for bidirectional.",
      "Sticky sessions or Redis pub/sub for multi-node sockets.",
      "Jitter retries and crons; alert on DLQ and queue depth.",
      "Replay DLQ after root-cause; never before.",
    ],
    recap: `Async systems are built on at-least-once delivery with idempotent consumers: queues (BullMQ, SQS) carry jobs with retries, backoff, and dead-letter queues; workers are stateless, time-boxed, and observable; WebSockets and SSE push live updates — SSE when one-way suffices, sockets when bidirectional matters — and everything scales through Redis fan-out, sticky sessions, and jittered retries; correctness comes from idempotency and ledgers, not from transport guarantees.`,
    code: {
      title: "Idempotent worker skeleton",
      language: "javascript",
      code: `const seen = new Set(); // use Redis in prod\nif (seen.has(job.data.idempotencyKey)) return;\nseen.add(job.data.idempotencyKey);\nawait work(job.data);`,
      explanation:
        "Dedup on a stable key before side effects; in production the set lives in Redis/DB with a TTL; replayed jobs short-circuit; the side effect happens exactly once per key.",
    },
    diagram: {
      title: "Job lifecycle",
      caption: "Enqueue, work, retry, dead-letter.",
      mermaid: `flowchart LR\n P[Producer] --> Q[Queue]\n Q --> W[Worker]\n W -->|fail| R[Backoff retry]\n R -->|exhausted| D[Dead letter]`,
    },
  },
  "web-dev-backend-with-node-js-webhooks-and-event-delivery": {
    intro: `Webhooks are how systems notify each other of events — a payment completed, an order shipped — by pushing HTTP requests to a consumer URL; getting them right means signing, verifying, retrying, and deduplicating so events are delivered securely and processed exactly once. The subject is the delivery contract: signature schemes, retry policy with jitter, idempotency keys, dead-letter handling, ordering, and the consumer-side verification that separates a working integration from a support nightmare. a webhook is an untrusted push from the internet, and it must be treated as such.`,
    foundations: `Delivery: provider POSTs to your URL with a payload and an event id; headers carry a signature (HMAC-SHA256 of raw body with shared secret) and timestamp to prevent replay; you verify before parsing. Retries: provider retries non-2xx responses with exponential backoff + jitter over hours/days; your endpoint must be idempotent and fast (ack within seconds, process async). Ordering: not guaranteed — events can arrive out of order; design consumers to tolerate gaps/reordering (state machines, sequence numbers). Security: verify signature against raw body, never the parsed JSON; enforce timestamp window (±5 min); optionally pin source IPs; treat webhook data as untrusted input — validate.`,
    concepts: [
      {
        title: "Signature verification, done with the raw body.",
        body: `The provider signs raw bytes (timestamp + "." + body) with your shared secret: header t=1699999999,v1=hmac_hex. Verification: read raw body as Buffer (do NOT parse JSON first — reserialization changes bytes); recompute HMAC over t + '.' + rawBody; constant-time compare with v1; check t within 5 minutes (else replay window); only then parse and validate the payload against a schema; store (event_id, received_at) to dedup retries; respond 200 within seconds; enqueue for async processing; never do heavy work inline — providers time out and retry, causing duplicate deliveries.`,
      },
      {
        title: "Idempotency keys and deduplication.",
        body: `Every event carries a unique id (evt_123); duplicates happen on provider retries and network uncertainty; keep a processed-events table (or Redis SET with TTL 72 h): before processing, INSERT ... ON CONFLICT DO NOTHING — if no row, process and record; if conflict, ack and skip. Side effects (crediting an account, sending an email) must also be idempotent — same key, same outcome; for ledger-like writes, the event id is the natural unique key. Belt and braces: dedup at the endpoint AND idempotent side effects.`,
      },
      {
        title: "Retry policy, dead-lettering, and replay.",
        body: `Producers retry with exponential backoff (e.g., 30 s, 2 min, 10 min, 1 h, 6 h, 24 h) and jitter; consumer endpoints return 2xx only when safely recorded — any 5xx triggers redelivery; 4xx (except 408/429) is a permanent failure the provider will not retry (or treats as done) — return 200 only if you intentionally drop, else 400 to stop retries you cannot process? No: misconfigured consumer should fix their schema, provider semantics differ — know yours. After max attempts, events go to a provider-side dead-letter queue with a manual replay button in their dashboard. Your own async processing pipeline also dead-letters after exhaustion with alerting.`,
      },
      {
        title: "Ordering and out-of-order delivery.",
        body: `Providers do not guarantee order (retries interleave); two invoice events can arrive "paid" before "issued". Defenses: sequence numbers/versions per aggregate — keep the highest seen; apply older events only if your state machine tolerates them, else buffer or reject for re-fetch; use the provider event to trigger a re-read of authoritative state rather than apply blindly ("re-fetch on receive" pattern: webhook = hint to pull, not source of truth); this pattern eliminates ordering pain for most use cases and narrows untrusted payloads.`,
      },
      {
        title: "Webhook as untrusted input: robust consumer design.",
        body: `Validate the entire payload schema (zod) — never trust fields' types; cap sizes; escape before render; validate URLs in payload before fetching (SSRF); rate-limit or at least parse cheaply before deeper handling; respond 200 fast then process async from a queue; log event id, not raw bodies with secrets; keep a manual reprocess tool (support can replay single events); monitor: signature failure rate (attack or rotated secret), delivery p95, dedup hit rate, DLQ size; test with provider CLIs/sandbox that simulate retries, reordering, and signature failures.`,
      },
    ],
    worked: [
      {
        title: "Build a verified Stripe-style webhook endpoint.",
        body: `POST /webhooks/payments: capture raw body (bodyParser verify fn or fastify rawBody); headers t and v1; secret from env; recompute hmac(t + '.' + rawBody); timingSafeEqual; check t within 300 s; zod-parse payload (type: 'payment.succeeded' | 'payment.failed', data.object.id, amount, currency); INSERT INTO processed_events(event_id) ON CONFLICT DO NOTHING — none? enqueue job (paymentId) → return 200; worker applies the actual state change via the re-fetch pattern; signature failure → 401 and security-alert log; replay incidents detected by spike in failures.`,
      },
      {
        title: "Recover from a week of lost events on a consumer.",
        body: `Integration broke silently (bad deploy rejected every event with 500 → provider dead-lettered them). Fix sequence: patch consumer, deploy, hit provider's replay/backfill endpoint (or re-enqueue from their DLQ via dashboard), watch queue drain, verify ledger matches provider report, verify processed_events has the full id set with no duplicates applied, add alert on 4xx/5xx spike from /webhooks/* and on DLQ non-empty; add synthetic canary event daily; postmortem attribute time-to-detect and time-to-replay; document the replay runbook — recovery is a feature.`,
      },
      {
        title: "Handle out-of-order shipment events.",
        body: `Carrier sends picked → packed → shipped → delivered; your dashboard showed delivered before shipped because a retry delayed shipped. Fix: per-shipment state machine (created → picked → packed → shipped → delivered); events carry sequence 3/4; handler loads current state, applies only transitions forward, parks anomalies in a review queue (delivered when never shipped — likely address correction edge); UI renders highest applied state with a "last event" footnote. Zero page redesigns — reordering tolerance lives in the handler.`,
      },
    ],
    exam: [
      {
        question:
          "Why must webhook signature verification use the raw request body?",
        answer:
          "HMAC is computed over exact bytes; parsing to JSON and re-serializing (key order, whitespace, Unicode escapes) changes the byte sequence, so a valid signature would fail verification; read the body as a buffer before any parsing and sign/verify over those bytes.",
      },
      {
        question:
          "What does the timestamp in a signed webhook header protect against?",
        answer:
          "Replay attacks: an attacker who captures one valid signed payload could resubmit it forever; the timestamp window (e.g., ±5 min) binds the signature to a fresh moment, so old captures are rejected even if unmodified.",
      },
      {
        question: "Why is webhook handler idempotency non-negotiable?",
        answer:
          "Providers retry until they see 2xx — retries, timeouts, and network uncertainty guarantee redelivery; a handler that double-applies side effects (double refunds, duplicate emails) corrupts state; dedup by event id plus idempotent side effects is the only safe contract.",
      },
      {
        question:
          "What is the re-fetch pattern and what problem does it solve?",
        answer:
          "Treat the webhook as a hint: acknowledge it, then query the provider (or your own database) for the authoritative current object state before applying changes; it dissolves ordering hazards and stale/forged payloads, since delivery becomes an edge that triggers truth-fetching rather than truth-carrying.",
      },
    ],
    cheat: [
      "Verify HMAC over raw body; constant-time; 5-minute timestamp window.",
      "Respond 200 fast; process async from a queue.",
      "Dedup by event id (ON CONFLICT DO NOTHING); idempotent side effects.",
      "Re-fetch authoritative state on receive — hint, not truth.",
      "Order not guaranteed; state machines or sequence checks.",
      "Alert on signature failures, 5xx rate, DLQ; replay runbooks.",
      "Treat payloads as untrusted input: validate, cap, escape.",
    ],
    recap: `Webhooks are untrusted, retried, possibly-unordered pushes: verify signatures over raw bytes with a timestamp window, ack fast, dedupe by event id, make side effects idempotent, treat payloads as hints to re-fetch truth, dead-letter what you cannot process with alerting and replay, and monitor signature failures as security signals — correct webhook handling is what makes integrations quiet.`,
    code: {
      title: "Raw-body signature verification",
      language: "javascript",
      code: `const expected = hmac('sha256', secret, t + '.' + rawBody);\nif (!timingSafeEqual(Buffer.from(expected), Buffer.from(v1, 'hex'))) return 401;`,
      explanation:
        "Recompute over timestamp-dot-rawbody; compare in constant time; failure means 401 and a security metric — the request is never parsed or trusted.",
    },
    diagram: {
      title: "Webhook delivery path",
      caption: "Sign, verify, ack, process, dedupe.",
      mermaid: `flowchart LR\n P[Provider] -->|signed POST| V[Verify signature]\n V --> A[Ack 200]\n A --> Q[Queue]\n Q --> W[Worker applies]`,
    },
  },
  "web-dev-backend-with-node-js-file-uploads-streams-and-object-storage": {
    intro: `File handling on the web means receiving bytes from a browser and pushing them somewhere durable — and doing it without exhausting memory, leaking data, or breaking on huge files. The subject is the whole pipeline: multipart parsing, streaming to disk or object storage, signed URLs, resumable uploads, and image pipelines — the difference between "upload works on my laptop" and "production-grade media handling". files are bytes in flight; keep them flowing through streams and never park them in memory.`,
    foundations: `Multipart/form-data carries file fields with boundaries; busboy (fast, streaming) is the engine behind multer/@fastify/multipart. Upload paths: app-proxied (bytes flow through your server — simple, bandwidth-costly) vs direct-to-storage via signed URLs (browser uploads straight to S3 — scalable, app stays light). Storage: S3-compatible buckets; keys designed for listing (prefix by user/date); lifecycle policies expire intermediates; CORS for direct uploads. Validation: size limits, MIME sniffing (not extension), image re-encode to strip metadata, virus scan for untrusted uploads. Resumable: tus protocol or multipart upload with part tracking for large files over flaky networks.`,
    concepts: [
      {
        title: "Multipart parsing without buffering.",
        body: `POST /uploads with multipart/form-data: busboy emits file streams per field; validate before piping (fieldname allowlist, mimetype from magic bytes, size cap via limits); stream to temp file or straight to S3; never readFile then upload. Memory stays flat for GB files; temp files on disk with cleanup on error/abort. Progress: track bytesWritten per stream for client progress bars via WebSocket or response chunks. Reject oversize uploads mid-stream (413) instead of after buffering; always unlink temp files in finally blocks.`,
      },
      {
        title: "Signed URLs: direct-to-storage uploads.",
        body: `Your API issues a presigned PUT (or POST) URL with an expiry (5-15 min) and constraints (content-length-range, content-type); the browser PUTs the file straight to S3; S3 enforces the signature; completion webhook or client callback marks the upload done. Benefits: no bandwidth cost on your app, no memory pressure, direct CDN delivery of originals. Flow: POST /uploads { filename, contentType, size } → validate → create upload record → return signed URL → client uploads → POST /uploads/:id/complete → attach to entity. Defense: validate size/type server-side both at signing and completion; signed URLs are single-purpose capabilities — short TTL always.`,
      },
      {
        title: "Large files: resumable and multipart uploads.",
        body: `For multi-GB files: S3 multipart — initiate (returns uploadId), sign each part (5-10 MB), browser uploads parts in parallel, complete with part ETags; failures retry only the failed parts; abort cleans up. tus protocol for browser-to-app resumability. Progress and cancellation supported natively. Watchdog: abort incomplete uploads older than 24 h via lifecycle rule (incomplete multipart costs storage forever otherwise). Splitting logic client-side with Blob.slice; ETag per part returned by S3; a upload state machine (initiated → uploading → completing → done | aborted).`,
      },
      {
        title: "Image pipelines: validate, transform, serve.",
        body: `Never trust uploaded images: sniff magic bytes (JPEG/PNG/WebP), re-encode with sharp (strip EXIF — privacy metadata leaks), resize to max dimension, generate variants (thumbnail, medium, original-as-webp), store with content hashing keys (immutable + cache-forever + CDN-friendly). Serve via CDN with immutable Cache-Control (max-age=31536000) for hashed names. Processing modes: on-upload synchronous (small), or async via queue (large batches) with webhook/notification on completion; placeholders (blurhash) for perceived performance; strip metadata unless needed.`,
      },
      {
        title: "Security and lifecycle hygiene.",
        body: `Constraints: max size (413 early), allowed MIME allowlist, extension irrelevant for trust; malware scan (ClamAV) for public content; never serve user uploads from your app domain as active content (CSP sandbox or storage domain); signed GET URLs for private files (or ACL-private with short-lived URLs); lifecycle rules: expire multipart aborts, lifecycle transit to infrequent/archive tiers for originals; deletion requests purge storage keys too; audit logs on access to sensitive files; bucket listing disabled; encryption at rest (SSE-S3 or SSE-KMS); keys unpredictable; per-tenant prefixes with IAM policies for multi-tenant isolation.`,
      },
    ],
    worked: [
      {
        title: "Ship avatar uploads via presigned URLs.",
        body: `POST /me/avatar { contentType: 'image/jpeg', size: 400000 } → validate (type, ≤ 2 MB) → create avatars/{userId}/{uuid} key + upload record → presigned PUT (TTL 10 min, content-length-range) → client uploads → POST /me/avatar/complete → server statS3 head object (verify size/type), re-encode sharp (max 512 px, strip EXIF), write variants (128/256/512 webp) under avatars/{userId}/{hash}/{size}.webp → update profile, delete old keys async, return URLs; hotlink-proof: keys unguessable, CDN caches with immutable TTL.`,
      },
      {
        title: "Stream a 3 GB report straight to object storage.",
        body: `POST /reports (bull job) → worker generates CSV → stream zip → putObject with Content-Type and metadata { tenant } → set lifecycle? Reports expire after 30 days automatically (bucket rule) → presigned GET on demand (15 min TTL) delivered via chat/email link → nobody ever held 3 GB in memory; the queue retries failures; the bucket self-cleans; support redeems links without touching the app server.`,
      },
      {
        title: "Reject a poisoned file upload safely.",
        body: `User uploads "photo.jpg" that is really a 45 MB executable. Flow: busboy stream → sniff first 512 bytes — magic bytes say ELF, not JPEG → abort upload, unlink temp, return 415 with generic message; log attempt with user id + hash; security metric increment; if policy requires, scan with ClamAV before any serving; never reflect the original filename in error pages; incident review: confirm no AV-scan bypass for already-stored files; tighten MIME allowlist and re-encode everything with sharp as defense in depth.`,
      },
    ],
    exam: [
      {
        question:
          "Why are presigned URLs preferred over proxying uploads through the app for large files?",
        answer:
          "They remove the app bandwidth and memory bottleneck entirely — bytes travel browser → storage directly; the app stays light, scales to huge concurrency, and never buffers; the trade is implementing signing and a completion callback, well worth it beyond trivial file sizes.",
      },
      {
        question:
          "Why is the file extension useless for validation and what replaces it?",
        answer:
          "Extensions are attacker-controlled text; security decisions must read content: sniff magic bytes, verify with decoder/re-encoder (sharp for images), possibly scan with AV; then serve from a sandboxed domain/bucket with strict content-types.",
      },
      {
        question: "What does S3 multipart upload give you over one big PUT?",
        answer:
          "Parallelism (parts upload concurrently), resumability (retry only failed parts), per-part progress, and support for huge objects; the final CompleteMultipartUpload stitches them; lifecycle rules must abort stale incomplete uploads.",
      },
      {
        question:
          "Why re-encode user images with sharp instead of storing originals?",
        answer:
          "Re-encoding strips EXIF/metadata (location, device), neutralizes polyglot files hiding payloads, normalizes formats and size, drops malicious structures, and produces CDN-friendly variants — a cheap, total win for safety, privacy, and performance.",
      },
    ],
    cheat: [
      "Stream everything; never readFile for upload paths.",
      "Presigned PUT/POST for direct-to-storage; short TTLs; constraints.",
      "Sniff magic bytes; re-encode images; drop EXIF.",
      "Multipart for huge files; abort stale uploads via lifecycle.",
      "Validate size/type at sign + completion; 413 early mid-stream.",
      "Serve uploads from storage domain with strict CSP; private via signed GETs.",
      "Hash-keyed immutable files; CDN cache-forever.",
    ],
    recap: `File pipelines are byte streams with a custody chain: multipart parsing stays streaming and capped; direct-to-storage via presigned URLs scales past app servers; multipart/tus resumes the huge ones; every byte is validated by content, re-encoded, stored under unguessable hashed keys with lifecycle rules; private objects get short-lived signed GETs; and nothing untrusted reaches your domain or your users.`,
    code: {
      title: "busboy streaming skeleton",
      language: "javascript",
      code: `busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } })\n .on('file', (name, file, info) => { pipeline(file, createWriteStream(tmpPath)).catch(cleanup); });`,
      explanation:
        "Per-file stream with a hard size cap; pipeline handles backpressure and error propagation; temp file unlinked on failure — memory stays flat regardless of upload size.",
    },
    diagram: {
      title: "Direct upload flow",
      caption: "Sign, upload, complete, attach.",
      mermaid: `flowchart LR\n B[Browser] -->|ask| A[API signs URL]\n A -->|PUT| S3[Object storage]\n S3 -->|callback| A`,
    },
  },
  "web-dev-backend-with-node-js-api-security-in-practice": {
    intro: `API security in practice is the unglamorous checklist that stops real breaches: input validation, authentication scoping, injection defense, SSRF guards, rate limiting, and sane headers — applied uniformly to every endpoint, not sprinkled onto the sensitive ones. The subject is the practical defenses with the reasoning behind each, tuned for Node APIs in the real world. every endpoint is a perimeter you are responsible for, and attackers only need one weak door.`,
    foundations: `Defense in depth across layers: (1) transport — HTTPS, HSTS; (2) headers — CSP, frame-ancestors, nosniff, referrer-policy; (3) input — schema validation, allowlists, limit sizes, reject early; (4) identity — every handler knows who the caller is and their tenant; (5) authorization — per-resource checks, deny by default; (6) injection — parameterized queries, escaped output, no eval/Function; (7) SSRF — allowlist outbound hosts, no user-controlled URLs without proxying through validated resolvers; (8) rate limiting — per IP and per user; (9) secrets — env/secret manager, redacted logs; (10) supply chain — lockfiles, audits.`,
    concepts: [
      {
        title: "Input validation as the first wall.",
        body: `Validate everything: query, params, body, headers, cookies. Zod with coercion; allowlists for enums/sort/filter fields; max lengths on strings; max items in arrays; rejection with 400 and structured issues. No raw input reaches SQL, shell, or templates. Fail fast at the boundary — a rejected request costs microseconds; an accepted bad one costs everything downstream. Files/base64 bodies get their own caps (1-10 MB). Never reflect input into error messages, pages, or logs unescaped.`,
      },
      {
        title: "Injection, parameterization, and output side.",
        body: `SQL injection is dead in codebases that parameterize (pg: $1..$n; ORMs bind too) — the residual risk lives in dynamic ORDER BY and in raw/query_builder escapes; allowlist those columns. NoSQL injection: objects with $where or operator dicts from user JSON — strip/deny keys starting with $; command injection: never exec user data; use execFile with arrays; template injection: escape server-side templates by default (ERB-style escaping) — treat SSTI as a code execution bug. Output: encode at render; APIs return JSON — set Content-Type and X-Content-Type-Options: nosniff.`,
      },
      {
        title: "SSRF and outbound request guards.",
        body: `SSRF fetches internal services (metadata 169.254.169.254, admin panels) from your server; classic via webhook-like fetch(url) or PDF renderers or avatar-from-URL. Guards: resolve and pin the host, verify it is public (not RFC1918/loopback/CGNAT), https only, no redirects without revalidation, allowlist by hostname for fixed integrations, disable response echoing into the page, short timeouts, and response size caps. For user images by URL: download server-side through the guard then re-encode; log every outbound target.`,
      },
      {
        title: "Rate limiting, CORS, and tenant scoping.",
        body: `Rate limit per IP and per user (e.g., 100 req/min global, 10/min login, 5/min password reset) with 429 + Retry-After; sliding window counters in Redis; stricter on auth endpoints (credential stuffing defense). CORS: exact origins with credentials: true only for your web app; deny everything else; preflight caching. Tenant scoping: every query filtered by the tenant from the session, never from the request body; isolation verified by tests that attempt cross-tenant access and expect 403/empty; row-level security in Postgres as belt-and-braces.`,
      },
      {
        title: "Security headers and secrets hygiene.",
        body: `Headers: Strict-Transport-Security (max-age, includeSubDomains), Content-Security-Policy (default-src 'self'; script-src minimal + nonces), X-Content-Type-Options nosniff, X-Frame-Options/frame-ancestors none, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy minimal. Secrets: env via secret manager; never in git, client bundles, or logs; rotate regularly; least-privilege IAM for services (one role per service); audit access to secrets; leak detection in CI (gitleaks). Logging: redact auth headers, passwords, tokens, card data; structured logs with request ids for incident response; security alerts to a real channel.`,
      },
    ],
    worked: [
      {
        title: "Close the open redirect and SSRF in one endpoint.",
        body: `GET /fetch?url=... used to proxy any URL — internal metadata leaked in demos. Fix: parse URL; require https; resolve hostname; reject private/reserved ranges; allowlist path prefixes for known integrations; forbid userinfo-in-URL trickery; response size cap 5 MB; content-type text/json|image/* only; timeout 5 s; no redirects (or revalidate each hop); log host list to detect scanners — result: endpoint gone from pen-test findings, and internal metadata IP is now unreachable even if someone re-opens the handler.`,
      },
      {
        title: "Add rate limiting to login without false positives.",
        body: `Sliding window per IP (Redis INCR + EXPIRE 60 s): 20 attempts/min per IP + 5 attempts/min per account (key by email hash) — corporate NAT users not blocked by one attacker behind it; on exceed: 429 with Retry-After; exponential per-account lockout beyond threshold; credential-stuffing traffic collapses; log dimension: ip, account, outcome; alert when global login failure rate > 40%; legitimate users see generic errors without enumeration.`,
      },
      {
        title: "A penetration test finds IDOR in /invoices/:id.",
        body: `Pentester fetches /invoices/1041 and sees user B's data. Root cause: handler checked auth but not ownership. Fix: middleware loads invoice by id AND tenant from session — query WHERE id = $1 AND tenant_id = $2 — 0 rows → 404 (not 403, do not reveal existence); add integration test: user A requests B's invoice → expect 404; same for update/delete; audit similar-shaped endpoints (export, share links) for the same class; add a lint rule/sql-guard requiring tenant predicates; retest; pass.`,
      },
    ],
    exam: [
      {
        question:
          "Why must SQL queries always use parameter binding even for admin tooling?",
        answer:
          "Injection does not care who runs it — one untrusted value anywhere (search box, import, admin form) can drop tables or exfiltrate data; parameter binding is a mechanical, reviewable guarantee that data can never be code; admin tools are prime targets precisely because they are trusted.",
      },
      {
        question:
          "What is SSRF and the one-line guard category that prevents it?",
        answer:
          "Server-side request forgery: attacker-controlled URLs make your server call internal services; guard = outbound allowlisting with DNS resolution and private-range rejection, no untrusted redirects, https only, short timeouts — the request never happens to internal targets because the guard decides first.",
      },
      {
        question: "Why is Content-Type enforcement part of CSRF defense?",
        answer:
          "Cross-site forms can only send urlencoded/multipart/text plain bodies; requiring application/json for mutations means a form POST cannot carry the payload the handler will parse — attackers must script a CORS-governed request, which fails preflight; content-type is a cheap but real barrier.",
      },
      {
        question:
          "What does no tenant-scoping in a query enable, and how is it verified?",
        answer:
          "It enables IDOR — reading any row by id regardless of ownership; verify with tests flipping user/tenant and asserting zero rows/404, plus review checklists and linters forbidding unscoped queries; defense in depth pairs it with row-level security at the database layer.",
      },
    ],
    cheat: [
      "Validate at boundary: schema, allowlists, caps; 400 not 500.",
      "Parameterize always; allowlist dynamic sort columns.",
      "SSRF: resolve host, reject private ranges, https, no open redirects.",
      "Rate limit per IP + account; 429 + Retry-After; lockout on repeats.",
      "CORS exact origins with credentials; never wildcard with credentials.",
      "Headers: HSTS, CSP with nonces, nosniff, frame-ancestors.",
      "Tenant predicate on every query; RLS as backstop; secrets out of logs.",
    ],
    recap: `API security is a uniform perimeter: HTTPS and hardened headers, strict boundary validation, parameterized queries everywhere, SSRF guards on outbound calls, rate limiting and lockouts on auth surfaces, exact CORS origins, tenant scoping in every query with RLS behind it, secrets redacted and rotated, and a culture where tests attempt cross-tenant access on purpose — because attackers will do it for free.`,
    code: {
      title: "Tenant-scoped query",
      language: "sql",
      code: `SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2;`,
      explanation:
        "The tenant predicate is mandatory, not optional — it is the IDOR defense; when no row returns, answer 404, not 403, so enumeration reveals nothing.",
    },
    diagram: {
      title: "Request defense layers",
      caption: "Headers, auth, validation, authorization.",
      mermaid: `flowchart LR\n C[Client] --> H[Security headers]\n H --> V[Validate input]\n V --> A[Authn]\n A --> Z[Authz + tenant]`,
    },
  },
  "web-dev-backend-with-node-js-caching-strategies-for-apis": {
    intro: `Caching is the highest-leverage latency and cost lever in the API world — and the source of some of the most confusing bugs, because stale or wrongly-invalidated data fails silently and confidently. The subject is the layers: HTTP caching (Cache-Control, ETag, CDNs), application caches (Redis), cache-aside patterns, and invalidation design that actually works. every cache is a bet that the world changes slower than you notice — design the bet explicitly.`,
    foundations: `HTTP caching: response headers tell clients and CDNs what they may store — Cache-Control: max-age, s-maxage (CDN TTL), public/private, no-store, stale-while-revalidate; ETag + If-None-Match = 304 Not Modified; Last-Modified/If-Modified-Since likewise. Private data requires private or no-store — shared caches must not hold per-user content. Redis: in-memory key-value for sessions, hot reads, computed results; patterns — cache-aside (read-through by app), write-through (write both), write-behind (async persist). Invalidation: key versioning, TTLs, explicit bust on mutation, cache stampede control (singleflight/locks).`,
    concepts: [
      {
        title: "HTTP caching and CDN edge behavior.",
        body: `Headers are the contract: Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=30 tells browsers and CDNs the resource is shareable for 5 minutes plus a 30 s SWR grace; private, max-age=60 for user-specific (CDN must not share); no-store for anything sensitive. ETag revalidation: server returns 304 when hash unchanged — bandwidth drops to headers-only. CDNs key on method + URL + Vary headers; avoid Vary: * — it kills hit rates; normalize query strings (?v= cache-busting for assets, not for APIs). Cache invalidation via purge APIs on deploy or via versioned URLs (hashed assets cache forever).`,
      },
      {
        title: "Cache-aside with Redis.",
        body: `Read path: key = resource:pk — check Redis; hit → return; miss → read DB, SETEX 60-300 s. Write path: update DB first, then DEL key (or SET with computed value); never SET without TTL; concurrent misses may stampede one DB row — protect with singleflight (dedupe in-flight by key) or SETNX lock (first request computes, others wait-or-serve-stale). Freshness budget = TTL choice; thundering herd after expiry: jitter TTLs, or proactively refresh hot keys before expiry; persist metrics: hit rate, latency saved, memory pressure; eviction policy allkeys-lru for general caches.`,
      },
      {
        title: "Invalidation design that survives contact.",
        body: `Options: (a) TTL-only — simplest, bounded staleness; choose per resource (pricing 5 s, profile 60 s, catalog 300 s). (b) Versioned keys — resource vN bumps on change; readers compute key from version, no deletion needed, atomic flip (great for deploys). (c) Event-driven bust — publish invalidation on mutation (webhook to cache nodes/CDN purge); strongest consistency; complexity. (d) Write-through — compute and write value on mutation; read path always hot. Compose them: catalog = cache-aside + 5 min TTL + purge on publish. The marker of good design: a written staleness budget per endpoint, enforced and monitored — not "we cache it".`,
      },
      {
        title: "What not to cache and where it goes wrong.",
        body: `Do not cache: highly personalized data without vary/private keys (leaks across users — catastrophic), responses with side effects, error responses longer than seconds (a cached 500 poisons until TTL), authorization decisions without short TTLs, search with user-specific filtering unless keyed by the filter fingerprint. Pitfalls: stale-while-revalidate serving expired product prices at checkout — cap SWR tightly for transactional pages; cache poisoning via unkeyed Vary; distributed counters over-caching hot keys into a single Redis node (shard keys); memory-only invalidation lost on failover — acceptable if TTLs exist (they must).`,
      },
      {
        title: "Measuring effectiveness.",
        body: `Metrics before/after: p50/p95 latency per endpoint, origin QPS reduction, DB CPU, CDN hit ratio (bytes + requests), Redis hit ratio, error rate. Instrument cache outcome per request (HIT/MISS/STALE/BYPASS); dashboards per endpoint; alert when hit rate drops (config drift, key churn) — a silent miss storm can take down the DB it was shielding; budget perf tests with caching enabled and cold caches; load-test hot keys; define the failure mode: Redis down → degrade to DB with circuit breaker and lower rate limits, do not hard fail if tolerable.`,
      },
    ],
    worked: [
      {
        title: "Cache product catalog at the edge.",
        body: `GET /products/:id — origin sets Cache-Control: public, s-maxage=300, stale-while-revalidate=60 + ETag; CDN serves 95% of traffic; on publish webhook, API calls CDN purge for /products/:id (and /products?list keys); versioned HTML pages keyed by build hash; TTFB 180→25 ms p75; origin offload 10x; transactional pages (checkout, cart) explicitly no-store; A/B verified by splitting traffic; purge latency 2 s measured — acceptable vs 5-minute staleness budget.`,
      },
      {
        title: "Redis cache-aside for user profile with stampede control.",
        body: `GET /users/:id/profile — key users:{id}:v3 (v3 bumped on schema change); check Redis; miss → singleflight group by key: one DB query, others await same promise (in-process; across nodes use SETNX lock or accept duplicate loads — DB absorbs it once per 5 min); SETEX 120 s + jitter 0-30 s; on profile update: DB write → DEL users:{id}:v* (or bump version field in DB-driven key); stale window ≤ 2.5 min; monitor hit rate 92%; pg load dropped 70%; failover drill: kill Redis → app reads DB with 100 ms added p95 — acceptable; clients never saw errors.`,
      },
      {
        title: "ETag the invoice list for conditional fetch.",
        body: `GET /invoices?limit=20 → response body sorted stable; ETag = sha256 of (ids + updated_at_max + count); client sends If-None-Match next time; server recomputes cheaply from index-only query; unchanged → 304 with empty body; changed → full page; bandwidth down 80% on polling dashboards; CDN can even cache 304 responses; client keeps list fresh with 5 s poll at nearly zero cost — poor man's realtime push without sockets.`,
      },
    ],
    exam: [
      {
        question:
          "What does Cache-Control: s-maxage buy that max-age does not?",
        answer:
          "s-maxage applies specifically to shared caches like CDNs (browsers ignore it), letting the edge hold content longer than the browser would; pairs with private browser TTLs to balance freshness at each tier; public is required for CDNs to store at all.",
      },
      {
        question:
          "Why must error responses rarely be cached, and for how long at most?",
        answer:
          "A cached 5xx or 404 is served to many users until TTL — transient backend blips become sticky outages; keep error caches absent or seconds; 429s may use Retry-After as its ceiling; success responses cache; failures flush fast.",
      },
      {
        question: "What is the cache stampede and the standard countermeasure?",
        answer:
          "Many concurrent misses for the same expired key all hit the database at once; countermeasure: singleflight/in-flight deduplication — first request computes, others wait on the same promise or receive stale; plus jittered TTLs to desynchronize expiry across keys.",
      },
      {
        question:
          "How does ETag revalidation save bandwidth without staleness?",
        answer:
          "Client sends If-None-Match with the stored ETag; server compares hashes (cheap); on match it answers 304 with no body; on mismatch it sends the fresh resource; clients always converge to current state while paying near-zero bytes when nothing changed.",
      },
    ],
    cheat: [
      "Cache-Control: max-age (browser), s-maxage (CDN); public vs private; no-store for sensitive.",
      "ETag + If-None-Match → 304; bandwidth saved, freshness kept.",
      "Cache-aside: read-through + TTL + DEL on mutation; never SET without TTL.",
      "Stampede: singleflight / SETNX lock / jittered TTLs.",
      "Versioned keys flip atomically on deploy; no purge needed.",
      "Staleness budget per endpoint; measure hit rate; alert on drops.",
      "Never cache private data in shared caches; never cache 5xx long.",
    ],
    recap: `Caching is an explicit bet on freshness: HTTP headers (max-age, s-maxage, stale-while-revalidate, ETag) drive browsers and CDNs; Redis cache-aside with singleflight tames stampedes; versioned keys make deploy flips atomic; invalidation is TTL budgets plus event-driven busts designed per endpoint; personalized and error responses stay out of shared caches; and every cache is validated by measured hit rate, latency, and a written staleness budget — not by guesswork.`,
    code: {
      title: "Cache-aside read with singleflight",
      language: "javascript",
      code: `const key = 'user:' + id;\nconst hit = await redis.get(key);\nif (hit) return JSON.parse(hit);\nconst p = inflight.get(key) ?? fetchUser(id).then(u => { redis.set(key, JSON.stringify(u), 'EX', 120).catch(() => {}); return u; });\ninflight.set(key, p); const out = await p; inflight.delete(key); return out;`,
      explanation:
        "First miss computes once; concurrent requests await the same promise; result cached with TTL; errors still propagate; leaks cleaned on settle.",
    },
    diagram: {
      title: "Caching layers",
      caption: "Browser, CDN, app cache, origin.",
      mermaid: `flowchart LR\n B[Browser cache] --> D[CDN edge]\n D --> R[Redis app cache]\n R --> O[Origin and DB]`,
    },
  },
};
