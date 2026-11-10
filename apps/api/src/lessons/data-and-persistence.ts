import type { TopicLesson } from "../topicLessons.js"; /** * Data and Persistence — 7 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const dataAndPersistence: Record<string, TopicLesson> = {
  "web-dev-data-and-persistence-sql-and-postgresql": {
    intro: `SQL is the language of relational databases, and PostgreSQL is the production-grade open-source relational engine that runs much of the internet; mastering the two together means designing schemas that stay fast under growth. The subject is relational modeling, joins and indexes, constraints, transactions, and reading execution plans — the craft between writing queries and knowing they will not melt the database at 10x traffic. the database is the source of truth, and its shape is the product's shape.`,
    foundations: `Relations (tables) hold tuples (rows) conforming to a schema (columns with types). Keys: primary keys identify rows; foreign keys reference other tables, enforcing referential integrity; unique constraints prevent duplicates; CHECK constraints enforce domain rules; NOT NULL for required data. Joins: INNER (matches only), LEFT (all left rows + matches), FULL OUTER; aggregate with GROUP BY and HAVING (filters groups); subqueries and CTEs (WITH) structure complex queries. Indexes: B-tree default (equality and ranges), hash, GIN/GiST for full-text and JSONB; indexes speed reads, cost writes and storage. EXPLAIN ANALYZE shows planned vs actual cost; transactions group statements atomically with ACID.`,
    concepts: [
      {
        title: "Schema design and normalization.",
        body: `Design from the domain: entities (customers, orders, items) as tables; relationships via foreign keys (one-to-many: column on the many side; many-to-many: join table). Normalize to 3NF for write-heavy OLTP: each fact stored once — no update anomalies. Denormalize deliberately for read-heavy analytics or hot paths (materialized summary tables refreshed by jobs) — never by habit. Types: timestamptz always; numeric for money; enums via lookup tables or CREATE TYPE; JSONB for semi-structured corners (prefer typed columns for queryable fields); surrogate bigserial PKs vs natural keys — surrogates for modifiability, natural uniques for real-world identity.`,
      },
      {
        title: "Indexes: which, why, and what they cost.",
        body: `B-tree on the column in your WHERE and JOIN predicates; composite indexes cover multiple columns in left-to-right prefix order (index (a, b) serves a=, a= + b=, not b= alone); partial indexes (WHERE status='open') shrink indexes for hot subsets; covering indexes (INCLUDE) serve index-only scans; expression indexes on lower(email) for case-insensitive lookup. Mental model: index = sorted signpost; writes pay the cost; too many indexes slow inserts and bloat storage — audit pg_stat_user_indexes for unused ones; CREATE INDEX CONCURRENTLY to avoid write locks in production.`,
      },
      {
        title: "Reading EXPLAIN ANALYZE and fixing slow queries.",
        body: `EXPLAIN (ANALYZE, BUFFERS) output: Seq Scan = full table scan (missing index or unneeded scan of small table); Index Scan/Bitmap Heap Scan = index-assisted; nested loop join = per-outer-row lookup (great with index + selective outer), hash join = large unsorted joins, merge join = presorted inputs; sort buffers, work_mem overflow → disk spill (raise work_mem for the session); actual rows vs estimated rows gap → stale statistics (run ANALYZE) — the planner's choice is only as good as its histogram; time per node shows where the cost lives. Fix order: statistics, indexes, then rewrite (avoid SELECT *, avoid functions on indexed columns in WHERE).`,
      },
      {
        title: "Transactions and consistency in practice.",
        body: `BEGIN → statements → COMMIT or ROLLBACK: invariants hold or nothing persists. Isolation levels: READ COMMITTED (default; sees committed data per statement; no dirty reads), REPEATABLE READ (stable snapshot per transaction), SERIALIZABLE (true serial semantics). Keep transactions short: no user waits inside, no external calls; hold minimal rows; use SELECT ... FOR UPDATE for pessimistic locks or optimistic version columns for high-contention; handle deadlocks by retry with backoff — Postgres detects and kills one party; order lock acquisition consistently everywhere.`,
      },
      {
        title: "Operational essentials: backups, vacuum, migrations.",
        body: `Backups: pg_dump logical dumps for small DBs, continuous WAL archiving + base backups (PITR) for big ones; test restores quarterly — an untested backup is a rumor. Vacuum reclaims dead tuples; autovacuum tune for write-heavy tables (prevent transaction ID wraparound — monitor age). Migrations: versioned, reversible, zero-downtime deployments matter more than elegance — expand columns, backfill in batches, then contract; never rename in-use columns blindly; run migrations as separate CI step before code rollout; track schema_version in a table.`,
      },
    ],
    worked: [
      {
        title: "From duplicate orders to a junction table.",
        body: `Requirement: an order holds many items, an item type appears in many orders. Wrong design: items JSONB array on orders — no integrity, no joins. Right: orders(id, customer_id FK, status, created_at), order_items(order_id FK, sku, qty, unit_price, PRIMARY KEY(order_id, sku)); join for totals; indexes on order_items(order_id) and orders(customer_id); FK ON DELETE CASCADE from orders to items; report query: SELECT sum(qty*unit_price) FROM ... JOIN ... — a readable, indexable, constraint-checked shape that survives audits.`,
      },
      {
        title: "Index a slow admin invoice query.",
        body: `Symptom: SELECT * FROM invoices WHERE customer_id = $1 AND status = 'overdue' ORDER BY due_date LIMIT 50 takes 900 ms at 2M rows. EXPLAIN shows Seq Scan filter + Sort. Fix: CREATE INDEX CONCURRENTLY idx_invoices_cust_status_due ON invoices (customer_id, status, due_date); rerun: Index Scan backward on due_date — 0.4 ms; estimated-vs-actual within 5% after ANALYZE; delete nothing, change nothing else; 2000x faster for one index decision.`,
      },
      {
        title: "Survive a deploy with an expand-contract migration.",
        body: `Old code writes full_name; new code splits first/last. Step 1 (expand): ADD COLUMN first_name, last_name (nullable) — deploy code that writes both new columns and reads with COALESCE; step 2: backfill batches (UPDATE ... WHERE first_name IS NULL LIMIT 10000 loop, throttled); step 3: constraint after backfill (SET NOT NULL); step 4: drop legacy column in a later release. Every step backward-compatible; zero-downtime; rollback story trivial at each stage; data integrity ends at constraints, not hopes.`,
      },
    ],
    exam: [
      {
        question: "What does a composite index on (a, b) accelerate?",
        answer:
          "Predicates on a alone, on a plus b, and ORDER BY a, b; it does not serve b-only predicates (leftmost prefix rule); column order in the index should follow your most selective left-to-right query patterns and equality before range.",
      },
      {
        question:
          "What does EXPLAIN tell you that query timing alone does not?",
        answer:
          "The plan: which scan algorithm, which join strategy, estimated vs actual row counts, buffer hits vs reads, where time is actually spent, and whether statistics mislead the planner — timing says slow; EXPLAIN says why.",
      },
      {
        question: "Why keep transactions short in production OLTP?",
        answer:
          "Locks are held for the transaction duration; long transactions block writers, bloat tables with dead tuples, and risk deadlocks; short txns release locks fast, keep vacuum effective, and bound retry scope — also never await network inside them.",
      },
      {
        question: "What does ON DELETE CASCADE express vs RESTRICT?",
        answer:
          "CASCADE deletes dependent rows automatically with the parent (orders → items); RESTRICT blocks deleting a parent that still has children — the safeguard for data you never want orphaned by accident; NO ACTION defers the check to statement end, useful for cyclic FK checks.",
      },
    ],
    cheat: [
      "PKs unique + not null; FKs enforce references; CHECK/NOT NULL/UNIQUE for domains.",
      "Indexes: B-tree default; composite left-prefix; partial and INCLUDE variants.",
      "EXPLAIN ANALYZE before optimizing; ANALYZE after bulk loads.",
      "READ COMMITTED default; FOR UPDATE for locks; retry deadlocks.",
      "timestamptz always; numeric for money; JSONB for the edges.",
      "Expand-contract migrations; never rename live columns.",
      "Backups tested by restore, not by existence.",
    ],
    recap: `Relational databases are engines of integrity: schemas model the domain, constraints enforce it, indexes make it fast, and EXPLAIN reveals why; design 3NF for writes, denormalize deliberately for reads; composite B-trees follow the left-prefix rule; transactions stay short with proper isolation and retry; migrations expand-contract; and a database you cannot restore is a database you do not have.`,
    code: {
      title: "Cursor pagination query",
      language: "sql",
      code: `SELECT id, total FROM invoices\nWHERE (created_at, id) < ($1, $2)\nORDER BY created_at DESC, id DESC LIMIT 26;`,
      explanation:
        "Keyset pagination over an index on (created_at, id) — stable under inserts, no offset scan, scales to deep pages; 26 rows reveal whether another page exists.",
    },
    diagram: {
      title: "Query execution path",
      caption: "Parse, plan, execute, return.",
      mermaid: `flowchart LR\n Q[SQL] --> P[Parser]\n P --> PL[Planner with stats]\n PL --> E[Executor]\n E --> R[Rows]`,
    },
  },
  "web-dev-data-and-persistence-mongodb-and-document-data": {
    intro: `MongoDB is a document database that stores JSON-like documents in collections instead of rows in tables; it trades rigid schemas for flexibility and locality, and rewards teams that model for their access patterns rather than against normalization dogma. The subject is document modeling (embedding vs referencing), indexes, the aggregation pipeline, transactions across documents, and the discipline of evolving schemas safely. in a document store, you design collections around the reads you will do, not around the entities you see.`,
    foundations: `Documents (BSON) in collections; no fixed schema at the engine level — application enforces shapes (often with validation rules). Keys: _id default ObjectId; compound indexes (prefix rule); TTL indexes expire documents automatically. Modeling: embed when the subdocument is read with the parent and has bounded size/cardinality (order with line items); reference when data is shared, large, or unbounded (author with bio embedded in millions of posts is wrong). Extended reference patterns, bucket pattern for time series, subset pattern for hot/cold fields. Aggregation: pipeline of stages (match, project, group, lookup, unwind) per collection. Transactions: multi-document ACID across collections since 4.0, with cost — favor single-document atomicity by design when possible.`,
    concepts: [
      {
        title: "Embedding vs referencing: the locality rule.",
        body: `Embed: read together always, written together, bounded size (16 MB doc cap) — order + items + shipping address; profile embedded in session if small; subdocuments avoid joins entirely. Reference: unbounded growth (comments on a post), shared across parents (a tag taxonomy), independently updated frequently, huge sub-objects. Hybrid: embed the summary (latest comment, counts) + reference full records (subset pattern). Rule of thumb: one query should serve your most common read; if you need two collections joined per read, embed or use aggregation $lookup sparingly.`,
      },
      {
        title: "Indexes: prefix, compound, and TTL.",
        body: `Same left-prefix logic as SQL: index { status: 1, createdAt: -1 } serves status= equality then createdAt range/sort, and status-only. Covered queries via projection when index contains all fields. TTL index { expiresAt: 1 } with expireAfterSeconds deletes stale sessions automatically. Multikey indexes on arrays index each element — powerful, avoid on huge arrays; text indexes for search-ish filters (prefer real search engines for relevance); partial indexes (partialFilterExpression: { status: 'open' }) for hot subsets; always check .explain('executionStats') — winningPlan vs rejected; stage fetch vs IXSCAN.`,
      },
      {
        title: "Aggregation pipelines for real reporting.",
        body: `Pipeline stages: $match (filter early — uses indexes), $lookup (left outer join — expensive, avoid on hot paths), $group with accumulator expressions ($sum, $avg, $push), $project (shape), $unwind (explode arrays), $sort/$limit, $facet (multiple reports per pass). Cost model: every stage streams documents; filter first, project before group reduces bytes; indexes only help $match at the start (and $sort in some cases). Use allowDiskUse for big sorts/groups. Materialize hot aggregates into collections refreshed on write if the pipeline is called constantly.`,
      },
      {
        title: "Transactions and single-document atomicity.",
        body: `Multi-statement, multi-document transactions (session.withTransaction) give ACID with snapshot isolation; they cost: performance overhead, write conflicts, locks. Design first for atomic single documents — when one document holds all the state for one operation, you never need a transaction (e.g., ledger entry + balance embedded with $inc on same doc? Not atomic across collections but atomic per document via $inc on one doc). When genuinely needed: keep short, retry TransientTransactionError, watch for indefinite retries; prefer retryable writes.`,
      },
      {
        title: "Schema evolution and versioning.",
        body: `Documents carry their schema with them; old docs linger indefinitely. Patterns: schemaVersion field on documents; on read, upgrade-in-place (read old shape, write new shape) or background migration; defaults applied at the application layer on read; never mutate fields in-place without a version gate; dual-write during migrations; field renames as new field + copy + drop later. Deprecation: log readers of old shapes to know when it is safe to drop; validation schema in MongoDB ($jsonSchema) rejects blatantly wrong inserts — enable it, it saves incidents.`,
      },
    ],
    worked: [
      {
        title: "Model a blog: posts, authors, comments.",
        body: `Post embeds author summary { id, name, avatar } (read with post, changes rarely — stale summaries acceptable, update lazily), tags array (indexed multikey), commentCount + recentComments (latest 3 embedded subset). Comments collection holds full comment docs { postId, author summary, body, createdAt, ttl for moderation? } with index { postId: 1, createdAt: -1 } for the comment thread query. Feed query: find posts in category sort createdAt — covered by index on { tags, createdAt } or category+createdAt depending on shape; no joins anywhere on the hot path; counts precomputed on write.`,
      },
      {
        title: "Build a revenue report with aggregation.",
        body: `orders collection with { status, total, currency, createdAt }: pipeline $match { status: 'paid', createdAt: { $gte: start } } → $group { _id: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } → $sort { '_id.month': 1 } → done in one pass, correct indexes make it milliseconds; run it nightly into a cached report collection if called repeatedly; expose via API with the same pipeline parameterized — dashboard renders instantly.`,
      },
      {
        title: "Migrate embedded user address to new shape.",
        body: `Old doc: { name, address: '123 Street' }. New shape: { name, address: { street, city, zip, country }, schemaVersion: 2 }. Steps: add schemaVersion: 1 to readers; on read of v1 doc, parse and write v2 (address object) in place; background script scans all docs with schemaVersion < 2, upgrades in bulk with batching + logging; writes during migration accept both shapes (dual parsers); after 100% upgraded, assert zero v1 docs remain via count, then delete the compat code; never an outage, and every document carries its version so the process is verifiable.`,
      },
    ],
    exam: [
      {
        question:
          "When should comments on a post be embedded rather than referenced?",
        answer:
          "Only when counts are tiny and bounded forever (e.g., featured 3 testimonials) — for real comment streams, embed latest N as a subset and reference full comment documents; embedding unbounded or frequently written arrays bloats the parent document and hits the 16 MB limit with write contention.",
      },
      {
        question:
          "What does a compound index { status: 1, createdAt: 1 } serve?",
        answer:
          "Queries on status alone, and status + createdAt range/sort (prefix rule); it does not serve createdAt-alone queries; index ordering and the covered-query opportunity come before adding any more indexes.",
      },
      {
        question: "Why start aggregation pipelines with $match?",
        answer:
          "To use indexes and cut the stream before expensive stages (lookup/group/sort) run; filtering early means fewer documents traverse the pipeline — the single biggest pipeline performance lever.",
      },
      {
        question:
          "What is the safest way to evolve a document schema in production?",
        answer:
          "Version the documents (schemaVersion), read old shapes with upgrade-on-read, dual-write during the migration, backfill in batches, verify zero unversioned docs remain, then remove compatibility; validators ($jsonSchema) keep the floor honest during the transition.",
      },
    ],
    cheat: [
      "Embed bounded/read-together data; reference shared/unbounded/frequently-written.",
      "Indexes: compound prefix rule; covered queries; partial + TTL variants.",
      "Aggregation: match first, project early, lookup sparingly.",
      "Single-document atomicity first; transactions rare and short.",
      "schemaVersion + dual parsers + backfill for evolution.",
      "$jsonSchema validators on in every live collection.",
      "explain(executionStats) before believing the plan.",
    ],
    recap: `Document databases reward locality modeling: embed what you read together and is bounded, reference the rest; index with the prefix rule and prefer covered queries; build reports as aggregation pipelines that filter first; lean on single-document atomicity and reserve multi-doc transactions for rare cases; evolve schemas with versions, dual paths, and batched backfills; and validate documents at the door so bad shapes never reach your logic.`,
    code: {
      title: "Lookup with subset embed pattern",
      language: "javascript",
      code: `db.posts.updateOne({ _id }, { $inc: { commentCount: 1 } });\ndb.posts.updateOne({ _id }, { $push: { recentComments: { $each: [c], $slice: -3 } } });`,
      explanation:
        "Atomic increment of the counter plus keeping only the latest 3 comments embedded — the feed query needs no join and counts are always right without aggregation.",
    },
    diagram: {
      title: "Embed vs reference",
      caption: "Model around read patterns.",
      mermaid: `flowchart LR\n P[Post] --> E[Embedded summary]\n P --> R[Referenced comments]`,
    },
  },
  "web-dev-data-and-persistence-orms-and-query-builders": {
    intro: `ORMs and query builders are the bridge between your type system and the database — they generate SQL/NoSQL calls from typed code, manage migrations, and handle relations — and their failure mode is always the same: hiding the query you actually ran. The subject is using them deliberately: Prisma, Drizzle and TypeORM compared, migrations done right, N+1 and how to kill it, and when to drop to raw SQL with pride. the database still executes everything; the ORM is a power tool for the common cases, not a force field against thinking.`,
    foundations: `ORMs map classes/schemas to tables: Prisma (schema language, generated client, migrations), Drizzle (TypeScript-first SQL-like DSL, drizzle-kit migrations), TypeORM (decorators, mature, heavier). Query builders (kysely, Knex) compose SQL programmatically without entity magic. Relation types: one-to-many via FK, many-to-many join tables, polymorphic via type+id (use sparingly). Migrations: diff-based (Prisma migrate dev), SQL-first (Drizzle), or manual; zero-downtime rules apply here exactly as in raw SQL. Relations drive include/join generation; lazy vs eager loading decides when SQL fires. N+1 = one query per row; solve with batching (DataLoader for APIs) or eager includes.`,
    concepts: [
      {
        title: "Prisma vs Drizzle vs TypeORM — honest comparison.",
        body: `Prisma: fastest DX, schema-first with generated client, great type safety, migrations excellent, joins via include; weaker at exotic SQL (though $queryRaw works). Drizzle: SQL-in-TypeScript — you write nearly-real SQL with types, zero runtime magic, tiny bundle, perfect for edge/serverless; migrations via SQL files. TypeORM: decorator entities, active-record-ish, mature ecosystem, but heavyweight, magic-laden, slower, and TS types weaker in complex edges; fine for brownfield NestJS. Choose: greenfield TS app → Prisma or Drizzle; SQL control freaks and edge → Drizzle; enterprise NestJS consistency → TypeORM. All three can coexist with raw queries for the 10% of hot paths.`,
      },
      {
        title: "Migrations the production-safe way.",
        body: `Migrations are code-first, append-only, reviewed, and forward-only in prod: never edit an applied migration; separate up/down; test migration on a restored snapshot before prod deploys; prefer expand-contract discipline exactly as raw SQL; ORM generate ≠ trusted blindly — read the diff, hand-edit when it wants to recreate a table (data loss risk); backfills as separate throttled scripts; CI: spin DB from snapshot, apply migrations, run tests; deploy order: migrations first (expand), then code; rollback plan for each step (revert migration only if not destructive).`,
      },
      {
        title: "N+1 and how ORMs create it.",
        body: `Loop over posts, lazy-load post.author per post → 1 + N queries. Fix options: include relations in one query (Prisma include, Drizzle relational queries with joins), DataLoader (batch by id at the API layer), or SQL join for report shapes. Detect: enable query logging in dev — anything in a loop is suspicious; add APM/ORM instrumentation (query count per request; alert > threshold); tests with query counting for critical paths. Watch the inverse trap: eager-including a huge relation graph to fix N+1 just moves the bytes — select only needed fields (select/include clauses) and counts of children instead of the children.`,
      },
      {
        title: "Types, generated code, and the escape hatch.",
        body: `Prisma client generates types per model — User.create({ data }) is checked; relations typed end to end; regenerate after every schema change (CI check: git diff on generated client must be empty, else schema drift). Drizzle infers types from your schema definitions directly. For the 10%: raw SQL escapes via $queryRaw/sql template with typed mapping — acceptable when the ORM fights you (window functions, recursive CTEs, full-text ranking); keep those in a repository layer with tests, never scattered through handlers. ORM does not remove the need to know SQL — it lowers the daily tax of routine queries.`,
      },
      {
        title: "Transactions, locking, and consistency with ORMs.",
        body: `Interactive transactions: Prisma $transaction(async (tx) => {...}) — pass tx everywhere inside; unknown errors roll back; keep tx short; retry on serialization/P2034-like codes with backoff; optimistic concurrency via version column updated where version = $x (rowCount 0 → conflict → 409 or retry); pessimistic via SELECT FOR UPDATE inside interactive tx for money movements; set isolation level per transaction when needed; avoid long-lived transactions around user input or network.`,
      },
    ],
    worked: [
      {
        title: "Kill the N+1 in an orders list endpoint.",
        body: `Before: orders.map(o => db.order.findUnique({ where: { id: o.id }, include: { items: true, customer: true } })) — 1 + 2N queries, 3 s at N=200. Fix with one query: findMany({ where: { tenantId }, include: { items: true, customer: { select: { id, name } } }, orderBy: createdAt desc, take: 25 }) — 1 query, 120 ms, fields selected not star-fetched; if GraphQL N+1 shapes remain deeper, add DataLoader per request; measure with query-count logging; the endpoint now does exactly 1-2 queries with indexes matching (tenant_id, created_at).`,
      },
      {
        title: "Write a safe expand-contract migration with Prisma.",
        body: `Goal: split name into first/last. Step 1: prisma schema adds firstName, lastName nullable; migrate dev generates SQL; review diff — remove any DROP COLUMN the diff snuck in; commit migration. Step 2: code writes both (dual write), reads COALESCE(name, first||' '||last). Step 3: backfill script: UPDATE orders SET first_name = split_part(name, ' ', 1) WHERE first_name IS NULL AND id BETWEEN :start AND :end — batched 5k ids per commit, sleep 50 ms — runs 40 min at 10M rows with zero lockouts. Step 4: after verification, set NOT NULL, drop name in a later release with its own expand-reverse cycle.`,
      },
      {
        title: "Raw SQL where the ORM struggled, isolated properly.",
        body: `Report needs running total with window function: SELECT customer_id, sum(total) OVER (PARTITION BY customer_id ORDER BY created_at) FROM invoices WHERE ... — Prisma cannot express; put it in InvoiceReports repository: one function, typed result via $queryRaw<RawInvoiceTotal[]> or sql template; unit-tested against a seeded DB; handler calls it like any service; the ORM learns nothing new but the codebase stays clean — one place documents the raw technique and its intent.`,
      },
    ],
    exam: [
      {
        question:
          "Why is N+1 so easy to create with ORMs, and the two standard fixes?",
        answer:
          "Lazy-loading relations per row hides the SQL — one plus one-per-row looks fine in code until it runs; fixes: eager loading/includes in a single query for flat relations, and DataLoader batching for graph-shaped fan-outs; both replace per-row trips with one or two round trips.",
      },
      {
        question:
          "What must you do before trusting an ORM-generated migration?",
        answer:
          "Read the generated SQL; diffs sometimes recreate tables or drop columns (data loss); verify indexes and foreign keys appear with the right names; run against a restored snapshot; plan expand-contract mechanics manually for anything destructive.",
      },
      {
        question: "When is dropping to raw SQL the right call with ORMs?",
        answer:
          "For queries the ORM cannot express well — window functions, recursive CTEs, heavy analytics, full-text ranking, upsert-with-returning-complexity; always isolated behind a repository function with tests, typed results, and parameterized inputs; never scattered as $queryRaw through handlers.",
      },
      {
        question:
          "How do interactive transactions with Prisma differ from $transaction([array])?",
        answer:
          "Array form batches independent operations in one transaction; interactive form passes a tx client and lets you branch/loop with logic inside one transaction — needed for check-then-act patterns, locking reads, and conditional writes; both roll back on thrown errors.",
      },
    ],
    cheat: [
      "Prisma: DX + migrations; Drizzle: SQL-in-TS, edge; TypeORM: NestJS legacy.",
      "Migrations: append-only, review SQL diff, test on snapshot, expand-contract.",
      "N+1: include/join for flat, DataLoader for graphs, select only needed fields.",
      "Log query counts per request in dev; alert on spikes.",
      "Raw SQL escape hatch: repository layer + tests + params.",
      "Interactive tx: short, retried, locks for money paths.",
      "Regenerate client in CI or drift breaks builds.",
    ],
    recap: `ORMs are productivity multipliers with sharp edges: they shine at routine CRUD and migrations and hide the SQL that defines performance; kill N+1 with includes or DataLoader and select fields deliberately; keep migrations expand-contract and review every generated diff; isolate raw SQL behind repositories; and always remember the engine underneath — because explain, indexes and locks do not disappear just because the code looks elegant.`,
    code: {
      title: "One include query vs N+1",
      language: "typescript",
      code: `const posts = await prisma.post.findMany({ where: { tenantId }, include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } }, take: 25 });`,
      explanation:
        "Single round trip, selected fields only, counts instead of children — the N+1 pattern is structurally impossible with this shape.",
    },
    diagram: {
      title: "N+1 vs eager load",
      caption: "One query vs one-plus-many.",
      mermaid: `flowchart LR\n A[Query posts] --> B[N author queries]\n A2[Query with include] --> J[One join]`,
    },
  },
  "web-dev-data-and-persistence-redis-and-caching": {
    intro: `Redis is the default in-memory data structure server of the internet — sessions, caches, rate limits, leaderboards, pub/sub, queues — and it rewards precise understanding of its data structures and its failure semantics. The subject is using it deliberately: caching patterns, atomic operations, pub/sub and streams, distributed locks, and the operational realities (eviction, persistence, failover) that decide whether it helps or hurts you at scale. Redis is a data-structure server that happens to be fast — design around its primitives, not around a generic cache.`,
    foundations: `Data structures: strings (set/get, counters INCR/DECR with TTL), hashes (objects), lists (queues, capped feeds LPUSH/LTRIM), sets (membership, intersections), sorted sets (leaderboards, delays, sliding windows), streams (append-only log with consumer groups), bitmaps and HyperLogLog (cardinality). Commands run single-threaded → O(1) atomicity per command, but multi-key transactions need WATCH/MULTI or Lua. Eviction policies (allkeys-lru, volatile-ttl) matter when memory fills. Persistence: RDB snapshots + AOF; it is a cache by default — treat it as rebuildable, not as the only copy of truth. Redis Cluster shards keys by hash slot; Redis Sentinel or managed offerings handle failover.`,
    concepts: [
      {
        title: "Cache-aside and TTL discipline.",
        body: `GET key → hit return; miss → DB read, SETEX key ttl value; writes update DB then DEL key. TTL everywhere: 60-600 s for hot entities; jitter to avoid synchronized expiry stampedes (ttl = base + rand). Stampede protection: singleflight in app, or SETNX lock (lock holder recomputes, others serve stale or wait with timeout). Never check-then-set across two clients without WATCH/Lua — races write wrong values; Lua script read-check-write atomically for compare-and-set needs.`,
      },
      {
        title: "Atomic counters and rate limiting.",
        body: `INCR/DECR with EXPIRE on the same key — sliding or fixed windows: fixed window INCR key 1, EXPIRE 60 (burst at boundaries), sliding via sorted sets: ZREMRANGEBYSCORE older than window, ZCARD to count, ZADD now — exact rolling window; token bucket via Lua (read tokens, refill elapsed, consume, save) atomically. Rate limit keys per dimension (ip:xxx, user:yyy via hashes or plain keys with colon namespace); respond 429 with Retry-After; keep limits in code config, not scattered constants; expire keys so memory never grows.`,
      },
      {
        title: "Pub/sub, streams, and job-like flows.",
        body: `PUBLISH/SUBSCRIBE: fire-and-forget fan-out to all connected subscribers; no persistence — disconnected clients miss events (fine for live UI, wrong for jobs). Streams: append-only log with consumer groups — each group tracks read offset; XREADGROUP fetches batches, XACK acknowledges after processing; claim stale pending entries with XAUTOCLAIM (worker crash recovery); trim by MAXLEN. Streams are the right primitive for durable cross-service events with replay; pub/sub for ephemeral notifications.`,
      },
      {
        title: "Distributed locks the right way.",
        body: `SET resource my_token NX PX 30000 — short TTL lock, unique token (uuid); release via Lua compare-and-delete (get token == mine then del) — never naive get+del (you might delete someone else's lock after yours expired). Redlock across 5 nodes exists but is debated; usually one Redis lock with short TTL + fencing tokens (monotonic number checked at the resource) is enough for correctness at the system level. Locks are for efficiency (mutual exclusion of work), not correctness of state — always reconcile with the DB (unique constraints, conditional updates).`,
      },
      {
        title: "Sessions, and operational realities.",
        body: `Session store: SET session:{id} JSON PX ttl with rolling refresh — one DEL on logout; survive app restarts; scale behind any number of app nodes. Operational: watch memory (maxmemory + policy), hit rate, keyspace misses; AOF everysec vs RDB tradeoffs; replica reads for read scaling (careful: stale); Cluster re-sharding moves slots — multi-key ops only inside one hash slot (use hashtags {user}:... to force co-location); evictions silently drop your locks/sessions — size memory so cache pressure stays low; sentinel/failover, and always graceful degradation (if Redis is down, fall back to DB or fail feature cleanly).`,
      },
    ],
    worked: [
      {
        title: "Sliding-window rate limiter in Lua.",
        body: `SCRIPT: ZREMRANGEBYSCORE key 0 (now - window); count = ZCARD key; if count >= limit return 0; ZADD key now now + member (now:uuid); PEXPIRE key window; return 1. Called atomically per request — no race between count and add; returns allowed/denied; headers X-RateLimit-Remaining; when Redis is down, decide fail-open (allow, log) or fail-closed for sensitive endpoints (login: deny with 429 + Retry-After) — choose per route, documented.`,
      },
      {
        title: "Distributed lock around a payout job.",
        body: `Worker acquires SET payout:{id} uuid NX PX 60_000 → wins? runs payout → finally: Lua unlock-if-token-matches → logs job id. If the worker crashes, TTL expires and another attempt may pick it up — double payout? No: payout itself uses idempotency (provider key + DB status transition pending→paid conditional update). The lock is a throughput/exclusivity guard; the DB and provider idempotency are the correctness. This layering is the recurring lesson of distributed systems.`,
      },
      {
        title: "Live notification fan-out with pub/sub.",
        body: `Publisher: PUBLISH notifications:{userId} JSON.each of N app nodes SUBSCRIBE once; each routes to locally connected SSE/WebSocket per user; reconnects catch-up: client passes lastEventId; server sends latest from Stream XREAD (hybrid!) — pub/sub for instant fan-out, streams for replay gap after reconnect; rooms/topics by user or tenant; unsubscribe on disconnect; the hybrid pattern is what production notification systems actually look like.`,
      },
    ],
    exam: [
      {
        question:
          "Why is SET key value NX alone insufficient for a distributed lock?",
        answer:
          "It provides mutual exclusion only while held, but a crashed holder never releases unless TTL expires, and an unrelated holder can be evicted when memory pressure hits; add PX TTL, unique token, compare-and-delete on release, and accept TTL expiry as inevitable — fence with idempotency elsewhere.",
      },
      {
        question: "When do you choose Redis streams over pub/sub?",
        answer:
          "When consumers must not lose events while offline: streams persist with consumer groups, ack semantics, and claimable pending entries — pub/sub drops messages for disconnected clients; streams replay gaps; pub/sub is for ephemeral live fan-out (dashboards, presence) with no durability requirement.",
      },
      {
        question:
          "What does the eviction policy allkeys-lru mean and why is it wrong for locks?",
        answer:
          "When memory fills, Redis evicts any least-recently-used keys — including your lock keys, sessions, and rate-limit counters, silently breaking invariants; lock/rate-limit keys must live in a redis instance with noeviction or volatile-ttl on dedicated keys, or TTL shorter than any eviction gap.",
      },
      {
        question:
          "Why is multi-key atomicity in Redis only guaranteed inside one slot?",
        answer:
          "Cluster shards keys by hash slot across nodes; multi-key commands spanning nodes cannot execute atomically — hash tags {tag} co-locate keys deliberately; on a single node everything is atomic per command because one thread executes; Lua preserves atomicity by running uninterrupted on the node.",
      },
    ],
    cheat: [
      "Strings for counters with TTL; hashes for objects; sorted sets for windows/leaders.",
      "Cache-aside: DEL on write, jittered TTLs, singleflight against stampedes.",
      "Rate limits: INCR fixed, sorted-set sliding, Lua token bucket.",
      "Streams: XREADGROUP + XACK + XAUTOCLAIM for durable jobs.",
      "Locks: SET NX PX + token + Lua compare-del; TTL expiry inevitable.",
      "Eviction: noeviction for correctness keys; size memory.",
      "Redis is rebuildable; the DB is truth.",
    ],
    recap: `Redis is a data-structure server: strings with TTLs, hashes, lists, sets, sorted sets, streams, and pub/sub; use cache-aside with jittered TTLs and singleflight; implement rate limits atomically (INCR or Lua/sorted sets); choose streams for durable delivery, pub/sub for live fan-out; take locks with NX+PX+token+compare-delete and never for correctness without DB fencing; and respect eviction, TTLs and failover because Redis is fast infrastructure, not authoritative state.`,
    code: {
      title: "Compare-and-delete lock release",
      language: "lua",
      code: `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end`,
      explanation:
        "Only the token holder can delete; one atomic round trip; prevents deleting a re-acquired lock after your TTL expired.",
    },
    diagram: {
      title: "Cache-aside read path",
      caption: "Check, miss, load, fill.",
      mermaid: `flowchart LR\n R[Read key] --> H{Hit?}\n H -->|yes| V[Return value]\n H -->|no| D[DB load + SETEX]`,
    },
  },
  "web-dev-data-and-persistence-search-and-vector-databases": {
    intro: `Search and vector databases power discovery: full-text search answers what you asked (BM25), vector search answers what is similar (embeddings), and hybrid systems answer both better. The subject is choosing and building them — Postgres FTS, Elasticsearch/OpenSearch, embeddings, pgvector and Qdrant, retrieval quality, and the honest evaluation that keeps search from becoming vibes. search is ranking, and ranking is a contract between your users and your system.`,
    foundations: `Full-text: tokenization, stemming, inverted indexes; BM25 scoring (term frequency, inverse doc frequency, field length normalization); Postgres FTS (tsvector/tsquery with GIN indexes) handles moderate needs; Elasticsearch/OpenSearch scale to billions of docs with analyzers, boosting, aggregations. Vectors: embeddings encode semantic similarity in N-dim space; nearest neighbor search via HNSW/IVF indexes (pgvector, Qdrant, Weaviate, Pinecone); distance metrics cosine/dot/euclidean. Hybrid: BM25 + vector scores combined with weighted fusion; retrieval augmented generation builds on this. Always measure: precision/recall at k, NDCG, MRR, click-through, and task success rate.`,
    concepts: [
      {
        title: "Postgres FTS or a real engine?",
        body: `Start with Postgres tsvector + GIN: to_tsvector('english', title || ' ' || body) @@ plainto_tsquery('search terms') with ts_rank ordering; GIN index, partial indexes per status, web-search-style: ts_headline for snippets. Good to tens of millions of rows with proper indexes; zero new infra; consistent transactions. Move to Elastic/OpenSearch when you need: custom analyzers per language/field, fuzzy/typo tolerance, heavy aggregations with search, billion-scale, or relevance tuning beyond SQL. Elastic is operationally heavy (shards, replicas, heap tuning) — justify the cost or stay on Postgres.`,
      },
      {
        title: "Embeddings and semantic search.",
        body: `Embedding models map text to vectors (1536-3072 dims typical); distance = semantic similarity. Pipeline: chunk documents into passages 100-500 tokens with overlap; embed once at ingestion (batch, cache, re-embed on model change); store vector + metadata in pgvector (CREATE TABLE items(embedding vector(1536))) or Qdrant collections; index HNSW (ef_construction, m) — build time vs recall trade-off; query: embed the query, ORDER BY embedding <=> $query LIMIT k (cosine) — filter by tenant/category metadata in SQL before the ANN scan for correct, fast results.`,
      },
      {
        title: "Hybrid retrieval and reranking.",
        body: `Pure vector misses exact keywords (names, IDs, SKUs); pure BM25 misses semantics. Hybrid: run both, normalize scores (min-max), fuse with weight (0.6 vector + 0.4 BM25) or Reciprocal Rank Fusion (RRF: sum 1/(60+rank)). Rerank top-20 with a cross-encoder for precision — slower but only on candidates; skip reranking when latency matters. Chunking strategy drives quality more than the model: structure-aware splits (headings, one concept per chunk, overlap 10-15%) beat fixed character windows; same logic for code (function-level chunks).`,
      },
      {
        title: "Index freshness and operational patterns.",
        body: `Ingestion pipeline: source change → event → index worker → embed/BM25 update; deletes must propagate (soft-delete flag excluded by default, or immediate remove); reindexing on mapping changes (alias swap pattern: index v2 → point alias → delete v1); query-time filters via metadata prefiltering (tenant!, status) — never post-filter an ANN top-k you cannot fill; monitoring: recall probes, p95 latency, empty-query rate, zero-result rate (a leading indicator of broken ingestion). pgvector keeps everything SQL-transactionally consistent with the app tables — the compelling reason to start there.`,
      },
      {
        title: "Evaluation discipline.",
        body: `Never tune search by gut alone: build a labeled set of 200-1000 query → relevant docs; measure Recall@k, MRR, NDCG@10, and end-task metrics (click, add-to-cart, support resolution); A/B test ranking changes; watch zero-result rate weekly; regression-test the golden set in CI when changing analyzers/models. For RAG, end-to-end: retrieval hit rate + faithfulness of answers (LLM-as-judge vs human sample). Search is a ranking model; treat it like one — versioned, evaluated, rolled back when worse.`,
      },
    ],
    worked: [
      {
        title: "Add Postgres FTS to a docs site.",
        body: `ALTER TABLE articles ADD COLUMN tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))) STORED; CREATE INDEX idx_fts ON articles USING GIN (tsv); Query: SELECT id, ts_headline('english', body, q) FROM articles, plainto_tsquery('english', $1) q WHERE tsv @@ q AND tenant_id = $2 ORDER BY ts_rank(tsv, q) DESC LIMIT 20; — zero new services, transactions preserved, snippet highlighting for free; measure before reaching for Elastic.`,
      },
      {
        title: "Ship pgvector semantic search with filters.",
        body: `CREATE EXTENSION vector; ALTER TABLE docs ADD COLUMN embedding vector(1536); CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops); Query: SELECT id, title, 1 - (embedding <=> $1) AS score FROM docs WHERE tenant_id = $2 AND status = 'published' ORDER BY embedding <=> $1 LIMIT 10; — metadata filter in WHERE evaluated before the ANN ordering — combine with BM25 via UNION ALL + RRF if exact keyword hits matter; embeddings precomputed in an ingestion job with retry and dead-letter for provider failures.`,
      },
      {
        title: "Diagnose rising zero-result rate.",
        body: `Zero-result alerts fired. Investigation: analyzer change removed synonym expansion; reindexed corpus missing docs due to a failed consumer — backlog 14k docs; fix: replay the indexing queue, restore synonyms, reindex with alias swap (zero downtime), add zero-result rate and index-lag dashboards to on-call; add CI test with a 300-query golden set gating analyzer merges; back to baseline 2.1% from 9%.`,
      },
    ],
    exam: [
      {
        question: "When does Postgres FTS stop being enough?",
        answer:
          "When you need multi-language analyzers, fuzzy/typo tolerance, heavy faceting/aggregation alongside search, billions of documents, or relevance tuning past SQL reach; until then FTS+GIN is cheaper, transactional and operationally silent — adopt Elastic only when a measured need justifies it.",
      },
      {
        question: "Why filter metadata before ANN retrieval rather than after?",
        answer:
          "Post-filtering an ANN top-k that includes mostly excluded docs returns too few or nothing; prefiltering (tenant, status) with the metadata in the SQL scope keeps the scan honest and full — the vector index answers nearest within the eligible set, not nearest and then discarded.",
      },
      {
        question:
          "What does hybrid search with RRF solve over either method alone?",
        answer:
          "Complementary failure modes: BM25 catches exact terms and rare tokens that embeddings blur; vectors catch semantics and paraphrase that keyword match misses; RRF fusion of ranked lists (score-free, robust to scale differences) beats raw score mixing in most practical deployments.",
      },
      {
        question: "Why must search relevance be evaluated with a golden set?",
        answer:
          "Without measurement, ranking changes trade silently against each other; a labeled query→relevant set computes recall/MRR/NDCG deterministically, enabling regression gates in CI, A/B sanity, and defensible rollback decisions; intuition mis-ranks changes at scale.",
      },
    ],
    cheat: [
      "Postgres FTS first: tsvector + GIN + ts_rank; Elastic when measured need.",
      "Embeddings: chunk 100-500 tokens, overlap, batch ingest, re-embed on model change.",
      "pgvector/Qdrant HNSW for ANN; filter tenant/status in WHERE before ordering.",
      "Hybrid = BM25 + vector, fused by RRF; rerank top candidates if latency allows.",
      "Prefilter ACLs/tenants; never post-filter ANN k.",
      "Reindex via alias swap; monitor zero-result rate and index lag.",
      "Golden set in CI; recall/NDCG over vibes.",
    ],
    recap: `Search is ranked retrieval: full-text (BM25 via Postgres FTS or Elasticsearch) finds exact matches, vector ANN finds semantics, hybrid combines them with RRF; embeddings live beside metadata so prefiltering stays honest; ingestion is a queue with replay, rebuilds swap aliases; and every ranking decision is gated by a labeled evaluation set — because the day search stops being measured is the day it starts lying to your users.`,
    code: {
      title: "RRF fusion sketch",
      language: "javascript",
      code: `score = 0; for (const { rank } of retrieved) score += 1 / (60 + rank);\n// combine bm25 and vector lists this way; sort by fused score`,
      explanation:
        "Reciprocal Rank Fusion: sum of inverse ranks from each retriever; robust to incomparable raw score scales; the constant 60 dampens top-heavy outliers.",
    },
    diagram: {
      title: "Hybrid retrieval flow",
      caption: "Two retrievers, one fused ranking.",
      mermaid: `flowchart LR\n Q[Query] --> BM[BM25]\n Q --> V[Vector ANN]\n BM --> F[RRF fuse]\n V --> F`,
    },
  },
  "web-dev-data-and-persistence-database-transactions-and-isolation": {
    intro: `Database transactions and isolation define what concurrent users can and cannot see from each other — and they are the boundary where money, inventory and integrity either survive or corrupt. The subject is ACID revisited with concurrency: isolation levels, read anomalies (dirty, non-repeatable, phantom), write conflicts, deadlock detection and retry design, optimistic locking, and what serializable actually costs you. concurrency control is about choosing which anomalies you tolerate, and paying for the rest.`,
    foundations: `ACID: atomicity (all or nothing), consistency (constraints hold), isolation (interleavings look serialized), durability (committed survives). Isolation levels and their anomalies: READ UNCOMMITTED (dirty reads — almost never used), READ COMMITTED (default in Postgres — no dirty reads; non-repeatable reads and phantom possible across statements), REPEATABLE READ (snapshot per txn; phantoms gone per InnoDB/Postgres semantics), SERIALIZABLE (true serial order; Postgres uses SSI — detects dangerous structures, aborts with serialization failures to be retried). Locking: shared vs exclusive; row-level SELECT FOR UPDATE/SHARE; lock ordering to avoid deadlocks. Optimistic: version column, compare on update, retry on conflict. Multi-statement invariants belong inside transactions — always.`,
    concepts: [
      {
        title: "Anomalies, spelled out.",
        body: `Dirty read: seeing uncommitted data of a txn that later aborts — prevented by any reasonable level. Non-repeatable read: same row read twice in one txn, value changed between by a committed other txn — READ COMMITTED allows it. Phantom: same query returns new rows matching the range on re-read — also RC. Serialization anomaly: interleavings producing a result impossible in any serial order (write skew — two doctors both "removing" the last on-call doctor because each saw the other present). Phantoms and write skew are why REPEATABLE READ/SERIALIZABLE exist; you pay in aborts/retries, but integrity is guaranteed.`,
      },
      {
        title: "How Postgres SSI gives true serializability.",
        body: `Serializable Snapshot Isolation: every txn runs on a snapshot; the system tracks rw-antidependencies (read didn't see a concurrent write); when a dangerous cycle appears (two txns each reading what the other writes), one is aborted with SQLSTATE 40001 (serialization_failure). Your obligation: retry those txns (idempotent bodies) with backoff — typically succeeds within 1-3 attempts. Cost: some false-positive aborts under contention; throughput slightly lower; absolute correctness. Use it for invariants that cannot tolerate write skew: inventory oversell, double-booking, quota counters, financial balances.`,
      },
      {
        title: "Deadlocks: detect, order, retry.",
        body: `Deadlock = cycle of txns each waiting on locks the others hold; Postgres detects cycles and aborts one victim (error 40P01). Prevention beats cure: always lock in the same order (e.g., always account row by ascending id), keep transactions short, reduce lock footprint (select/for update only what you need), batch carefully. When immovable orders conflict, use explicit NOWAIT with retry loop. Application side: catch deadlock errors and retry the whole transaction with jittered backoff — never retry partial statements.`,
      },
      {
        title: "Optimistic locking vs pessimistic.",
        body: `Optimistic: read with version; update ... WHERE id AND version = $v; 0 rows changed → someone else won; reload and surface conflict (409) or merge. Great for low contention, no locks held during user think-time (forms!). Pessimistic (FOR UPDATE): lock held from select to commit; correct for high contention, short critical sections — money moves, stock decrement. Hybrid: read-committed + optimistic by default; escalate select for update hot paths; retry loops either way. Rule: never let user think-time or network latency live inside a pessimistic transaction.`,
      },
      {
        title: "Retry design for transaction failures.",
        body: `Wrap the whole transaction body in retry: attempts = 3-5, exponential backoff with jitter (50-500 ms), retry only on serialization_failure (40001), deadlock (40P01), connection drops — never on constraint violations (bug) or business conflicts (handle). Idempotency markers inside so a retried txn doesn't double-apply; test fault injection (forced abort mid-txn) in staging; metric: retry rate — high rates mean contention design flaw, not "just retry more".`,
      },
    ],
    worked: [
      {
        title: "Prevent overselling the last iPhone.",
        body: `Bug: read count=1, both customers see 1, both decrement to 0 → sold 2 of 1. Fix A (pessimistic): SELECT stock FROM products WHERE id=$1 FOR UPDATE; if stock < 1 → 409 out of stock; UPDATE stock = stock - 1; commit — serialized at the row, correct under any concurrency. Fix B (serializable): run in SERIALIZABLE; second txn aborts with 40001; retry once — still 409. Fix C (constraint): CHECK stock >= 0 + conditional UPDATE ... WHERE stock > 0 — engine enforces. All three correct; A/C cheapest; serializable simplest mental model when many txn touch the row.`,
      },
      {
        title: "Write skew on-call schedule.",
        body: `Rule: at least one doctor on call. Two doctors each query "all on-call except me" = 2 rows, both decide to go off → zero on call. Under RC/RR snapshots both succeed (each read the same snapshot). Fix: SERIALIZABLE — one txn aborts (SSI detects the rw-antidependency cycle) and retries, sees one, stays on. Alternative: SELECT ... FOR SHARE all on-call rows both agree to modify... blocks the other explicitly — enumeration locked, second waits then re-reads, keeps one on-call. SSI needs no manual lock discipline — pay in retries.`,
      },
      {
        title: "Optimistic update endpoint with version conflicts.",
        body: `PATCH /tickets/:id { title, version: 7 } → UPDATE tickets SET title=$1, version=8 WHERE id=$2 AND version=7; if rowCount=0: SELECT version, updated_by FROM tickets WHERE id=$2 → 409 Conflict { currentVersion: 9, editedBy: 'user-9' }; client offers "view their version / mine / overwrite"; no locks held across the user's read-then-edit interval; conflicts surface explicitly instead of silently clobbering — the UI pattern is merge/overwrite choice; audit log keeps both edits.`,
      },
    ],
    exam: [
      {
        question:
          "What anomaly does READ COMMITTED allow that REPEATABLE READ does not?",
        answer:
          "Non-repeatable and phantom reads — a committed concurrent change becomes visible to later statements in the same transaction, so the same query can return different rows; REPEATABLE READ pins the snapshot, so re-reads are stable within the transaction.",
      },
      {
        question:
          "What does SERIALIZABLE guarantee and what must the application do?",
        answer:
          "It guarantees the outcome equals some serial order of the concurrent transactions (SSI aborts dangerous interleavings with SQLSTATE 40001); the application must retry aborted transactions idempotently — correctness on the engine, cooperation on the client.",
      },
      {
        question:
          "Why is optimistic locking preferred for form editing and pessimistic for money?",
        answer:
          "Forms involve human think-time; holding locks there blocks everyone — versions surface conflicts without blocking. Money moves in sub-second critical sections; locks serialize genuinely contended rows correctly, and conflicts are impossible to ignore because they never happen — the wrong tool in each spot corrupts differently.",
      },
      {
        question: "What are the two universal rules to avoid deadlocks?",
        answer:
          "Lock resources in a consistent global order, and keep transactions short with minimal lock scope; plus retry-on-deadlock in the app — the first reduces cycle formation, the second survives what remains.",
      },
    ],
    cheat: [
      "Isolation buys: RC = no dirty reads; RR = stable snapshot; SER = serial outcomes.",
      "Write skew is the killer: gone only by SERIALIZABLE or locks.",
      "Postgres SSI aborts with 40001 — retry with backoff, idempotent body.",
      "FOR UPDATE for short hot critical sections; version columns for forms.",
      "Deadlock: consistent lock order + short txns + app retry.",
      "Retry only 40001/40P01/connection drops — never constraint violations.",
      "Metrics: retry rate, deadlocks/day, 40001 per second.",
    ],
    recap: `Transactions with isolation make concurrent correctness survivable: READ COMMITTED covers routine work, REPEATABLE READ stabilizes snapshots, SERIALIZABLE plus SSI ends write-skew by aborting one side (you retry); FOR UPDATE serializes hot rows, version columns surface conflicts without blocking; deadlocks die by lock ordering and retries; and the discipline is in the application — wrap critical sections in one transaction, retry transient failures, never stretch locks over user time.`,
    code: {
      title: "Retry wrapper for serialization failures",
      language: "javascript",
      code: `for (let i = 0; i < 4; i++) {\n try { return await db.transaction(work); }\n catch (e) { if (!['40001', '40P01'].includes(e.code)) throw e; await sleep(50 * 2 ** i + Math.random() * 50); }\n}`,
      explanation:
        "Retry whole transactions on serialization/deadlock codes with jittered backoff; everything else fails fast; idempotency lives inside work().",
    },
    diagram: {
      title: "Isolation levels and guarantees",
      caption: "Strength increases; retries required.",
      mermaid: `flowchart TD\n RC[Read committed] --> RR[Repeatable read]\n RR --> S[Serializable + SSI]`,
    },
  },
  "web-dev-data-and-persistence-data-migration-strategies": {
    intro: `Data migration strategies are the discipline of changing database shape without downtime, corruption, or weekend heroics: expand-contract, backfills, dual writes, and versioning, all rehearsed on snapshots before they touch production. The subject is the full playbook — from additive-only releases to strangler rewrites — with the failure modes that actually page people included. a migration is a two-phase commit over weeks, not a script you run once.`,
    foundations: `Core rule: every release is backward compatible with the previous and next schema. Expand: add new columns/tables (nullable, defaults), dual-write to old+new. Migrate: backfill in throttled batches; verify counts/checksums. Contract: drop old after cutover and a soak period. Never rename in place (add new + copy + drop). All migrations reviewed, tested on restored prod snapshots, and reversible or forward-fixed. Large backfills: chunked (id ranges), with resumability, metrics, and throttle; writes during migration continue dual or via triggers. Checklists, runbooks, and cutover windows defined in advance.`,
    concepts: [
      {
        title: "Expand-contract: the universal safe pattern.",
        body: `Expand phase: ADD COLUMN nullable with default (no rewrite in fast Postgres); deploy code writing both old and new; dual-read with COALESCE for reads; add triggers or app-level dual-write shadowing for denormalized correctness. Migrate phase: backfill script batches (WHERE id BETWEEN a AND b; 5k rows/commit; sleep); verification queries (count mismatch, checksum comparison, random sample audit). Contract phase: after N weeks stable and old-code gone, set NOT NULL/defaults, drop old column in a separate release, remove shim code. Each step reversible; no step locks tables long; zero user impact at any time.`,
      },
      {
        title: "Backfills at scale without incident.",
        body: `Mechanics: resumable script with durable cursor table (id last processed); batch size tuned to keep tx < 1 s; throttle via sleep or DB load metric gates (pg_stat_activity, replication lag < threshold); parallel shards by id ranges across workers; idempotent updates (WHERE new IS NULL / version gates); poison-row handling (log and skip, fix manually, continue); progress dashboard (rows/s, ETA, lag); dead-man alert if throughput stalls; schedule off-peak; abort switch stops cleanly mid-run and resumes later — no heroics, no locks.`,
      },
      {
        title: "Dual writes and the consistency pitfalls.",
        body: `Dual write = write old + new shape in the same operation: app-level (two ORM calls in one tx — coupling), or DB triggers (shadow tables), or CDC (Debezium/pipelines on logical replication — clean decoupling, but eventually consistent). The cardinal rule: during dual write, reads must prefer new (or COALESCE), and reconciliation reports compare old vs new periodically — drift alerts trigger re-backfill, not silent divergence. Drop dual writes only after the contract step ships and soak proves equality.`,
      },
      {
        title: "Versioned schemas and API coexistence.",
        body: `Data version (schemaVersion) stored with the record for semantic migrations (document shapes). API coexistence: mobile clients lag weeks; serve old and new shapes behind version negotiation — server reads agnostically, writes in new form primarily, presents legacy DTO for v-old clients from the same source (no double storage); deprecation with sunset headers + analytics on version usage; time; then remove. The mantra: deploy order — expand schema → expand code (dual) → migrate → contract code → contract schema — any step reordered risks outage.`,
      },
      {
        title: "Rehearse on snapshots and prepare the runbook.",
        body: `Pre-flight: restore prod snapshot to staging (anonymized), run the migration, time it, find the nasty surprises (index build time, lock waits, trigger overhead), adjust batch sizes, write the runbook: exact commands, verification queries at each gate, abort criteria, rollback steps (usually: revert code, keep schema — forward-only data), communication plan, responsible roles, and the final checksum. Untested migrations fail in the most interesting ways; tested ones are boring — boring is the goal.`,
      },
    ],
    worked: [
      {
        title: "Split a monolith users table into profiles and accounts.",
        body: `Expand: CREATE TABLE profiles (user_id PK FK, display_name, avatar_url, created_at); backfill from users (batch 2k, checksum per batch: md5 count(*) of join); dual-write via trigger or ORM dual path; code reads: profile ?? legacy users columns; profiles serve all new reads; after 3 weeks soak + zero drift alerts, contract: drop avatar_url etc from users; users keeps id/email/password; total: zero downtime, two releases, every step measurable.`,
      },
      {
        title: "Backfill a search index from Postgres to Elastic.",
        body: `Phase 1: pipeline writes both (tx to PG + best-effort ES with retry, DLQ); phase 2 backfill worker re-indexes all PG rows (resumable cursor; 1k docs/s; lag metric); phase 3 verify: random 5k docs compared field-by-field; shadow reads compare PG vs ES results diff < 0.1% — flip read path to ES behind a flag; drift alert → revert flag instantly; PG search kept for 2 more weeks; contract: remove ES dual-write complexity, keep PG as fallback read for a month; documented rollback at every stage.`,
      },
      {
        title: "Type change on an enum column, zero downtime.",
        body: `status was TEXT ('open','closed') → becomes enum. Wrong: ALTER TYPE rewrite bricks writes. Right expand: ADD COLUMN status_v2 enum with default 'open'; backfill batches cast text→enum; dual writes write both columns (reader prefers v2 with COALESCE fallback); verify zero mismatches; contract: drop status text in later release; app reads via one accessor function so the cut is one function body; total user impact: none; the technique generalizes to any type narrowing or restructure.`,
      },
    ],
    exam: [
      {
        question:
          "Why may a migration never rename a column in place, and what replaces it?",
        answer:
          "Renaming breaks every running instance still reading/writing the old name — instant crash across mixed deploys; expand instead: add the new column (or table), dual-write, backfill, verify, then drop the old in a later release; each step is independently shippable and reversible.",
      },
      {
        question:
          "What is the one property every backfill must have to be safe under failure?",
        answer:
          "Resumability and idempotency — a durable cursor (or id range) and WHERE-guards so a half-completed run can restart without corrupting already-migrated rows; interrupted mid-run, it continues exactly where it stopped.",
      },
      {
        question:
          "How do you keep dual-write drift visible during a migration?",
        answer:
          "Reconciliation jobs that compare old vs new on samples or full scans on a schedule, alerting on mismatch counts; treating divergence as a first-class incident — the drift budget defines cutover readiness; invisibility of drift is how partial migrations corrupt quietly forever.",
      },
      {
        question:
          "What should a migration runbook contain before touching production?",
        answer:
          "Restored-snapshot rehearsal results, timing, exact commands per phase, verification queries with pass/fail gates, abort criteria, rollback procedure (usually code-revert with schema kept), roles, timing window, and dashboards to watch; undocumented migrations are indistinguishable from outages waiting.",
      },
    ],
    cheat: [
      "Expand → dual-write → backfill → verify → contract; every step compatible.",
      "Backfills: resumable, batched, throttled, idempotent, observable.",
      "Dual writes need reconciliation alerts — drift means not done.",
      "Never rename in place; add, copy, drop later.",
      "Test on prod snapshot; time it; runbook with gates and abort criteria.",
      "Deploy order: expand schema → code → migrate → contract code → schema.",
      "Forward-only for data; rollback = revert code, keep schema.",
    ],
    recap: `Migrations are phased, reversible deployments of data shape: expand with additive changes, dual-write, backfill resumably and throttle to production health, reconcile continuously, then contract after soak; rehearsed on snapshots with a runbook of gates and abort criteria — because the fastest way to corrupt production is a confident one-shot script, and the safest is a boring, verified, multi-release plan.`,
    code: {
      title: "Resumable batched backfill",
      language: "sql",
      code: `UPDATE users SET full_name = first_name || ' ' || last_name\nWHERE full_name IS NULL AND id BETWEEN :start AND :end;`,
      explanation:
        "Chunked by id range with a NULL-guard for idempotency; cursor table tracks progress; throttle each batch with sleep; resume after any failure without corruption.",
    },
    diagram: {
      title: "Expand-contract phases",
      caption: "Add, fill, verify, drop.",
      mermaid: `flowchart LR\n E[Expand schema] --> D[Dual write]\n D --> B[Backfill]\n B --> V[Verify]\n V --> C[Contract]`,
    },
  },
};
