/**
 * Curated, compact lesson facts for the offline study-kit path.
 *
 * These are original teaching notes and worked examples, not copied pages.  Each
 * profile points learners to the primary/reference material that was used to
 * scope the lesson.  Keeping the explanations local gives the product a useful
 * lesson even when the runtime, Qdrant, or a provider is unavailable.
 */

export type LocalReference = {
  title: string;
  publisher: string;
  url: string;
  kind: 'primary' | 'reference' | 'practice';
};

export type LocalKnowledge = {
  focus: string;
  mentalModel: string;
  mechanics: string[];
  workedExample: string;
  buildSteps: string[];
  trap: string;
  check: string;
  code?: { title: string; language: string; code: string; explanation: string };
  diagram?: { title: string; caption: string; mermaid: string };
};

type TopicLike = { title: string; description: string; module?: string; id?: string };
type Profile = { matches: string[]; knowledge: LocalKnowledge };

const profiles: Profile[] = [
  {
    matches: ['node.js runtime', 'node js runtime', 'nodejs runtime'],
    knowledge: {
      focus: 'the JavaScript runtime that lets one process coordinate many I/O-bound requests without creating one blocking thread per request',
      mentalModel: 'Node runs your JavaScript on a main event-loop thread. Slow network, timer, and filesystem work is registered, then its continuation is queued when the work is ready. CPU-heavy JavaScript is different: it occupies the main thread and delays every request.',
      mechanics: ['CommonJS uses require/module.exports; modern Node also supports ESM import/export. Pick one module boundary deliberately.', 'Buffers represent raw bytes; streams process data in chunks, which prevents large files or responses from being loaded all at once.', 'Errors from async work must travel through a callback, rejected promise, or framework error handler. A thrown error in a detached async task is not a response.'],
      workedExample: 'For a file-download endpoint, start a read stream and pipe it to the response. The event loop can accept another request while the operating system reads the file. In contrast, reading a huge file synchronously blocks the event loop until all bytes are available.',
      buildSteps: ['Create a small server and one route.', 'Make the route asynchronous and return a useful status code on both success and failure.', 'Load-test or log a slow request; then move CPU-bound work to a worker thread or queue instead of blocking the route.'],
      trap: '“Single-threaded” does not mean Node can only do one thing. It means JavaScript callbacks share a main thread; blocking that thread is the real throughput bug.',
      check: 'Can you explain why await does not block other requests, but a long while loop does?',
      code: {
        title: 'Non-blocking Node HTTP route', language: 'javascript',
        code: "import http from 'node:http';\nimport { readFile } from 'node:fs/promises';\n\nhttp.createServer(async (req, res) => {\n  if (req.url !== '/health') {\n    res.writeHead(404).end('Not found');\n    return;\n  }\n  try {\n    const body = await readFile(new URL('./status.txt', import.meta.url), 'utf8');\n    res.writeHead(200, { 'content-type': 'text/plain' }).end(body);\n  } catch {\n    res.writeHead(500).end('Unable to read status');\n  }\n}).listen(3000);",
        explanation: 'The await yields while I/O is pending. The route still owns the response and handles its own failure path.',
      },
      diagram: { title: 'Node request lifecycle', caption: 'Register I/O now; run its continuation only when the event loop can pick it up.', mermaid: 'sequenceDiagram\n  participant C as Client\n  participant E as Event loop\n  participant O as OS I/O\n  C->>E: Request /health\n  E->>O: Start file read\n  E-->>E: Serve other callbacks\n  O-->>E: Read completed\n  E-->>C: 200 response' },
    },
  },
  {
    matches: ['express and fastify', 'rest and graphql apis', 'api security in practice', 'authentication and authorization', 'realtime and background jobs', 'file uploads streams and object storage', 'caching strategies for apis'],
    knowledge: {
      focus: 'a production API boundary: validate input, perform one well-defined operation, return an intentional HTTP response, and make retries safe',
      mentalModel: 'Treat a route as a small contract, not a convenience function. The client sends an authenticated request; middleware validates and authorizes it; business logic changes state; the response communicates the result and can be retried without accidental duplication.',
      mechanics: ['Use status codes to communicate the outcome: 2xx for success, 4xx for client/actionable errors, and 5xx only when the server could not fulfil a valid request.', 'Validate at the boundary and scope every data read/write to the authenticated user or tenant.', 'For network retries and background jobs, use idempotency keys or durable job identifiers so the same command cannot create two payments, emails, or records.'],
      workedExample: 'An order-creation endpoint validates the cart, derives price server-side, records an idempotency key with the new order, and returns 201. If the browser retries after a timeout, the server returns the same order instead of charging twice.',
      buildSteps: ['Write the request and response JSON shape before implementation.', 'Add schema validation, auth, authorization, and one error format.', 'Add a request ID, logs, and tests for valid, invalid, unauthorized, and duplicate requests.'],
      trap: 'Authentication answers “who are you?”; authorization answers “may this identity perform this operation on this resource?”. Checking only the first leaks data.',
      check: 'For a client retry after a 504, what key lets your endpoint return the original result rather than repeat the side effect?',
      code: { title: 'Explicit API boundary', language: 'javascript', code: "app.post('/api/todos', requireUser, async (req, res, next) => {\n  const title = String(req.body?.title || '').trim();\n  if (!title || title.length > 120) return res.status(422).json({ error: 'title is required (max 120 chars)' });\n  try {\n    const todo = await todos.create({ ownerId: req.user.id, title });\n    return res.status(201).location(`/api/todos/${todo.id}`).json(todo);\n  } catch (error) { return next(error); }\n});", explanation: 'The route validates at the edge, derives ownership from the session instead of the body, and has one success/error path.' },
      diagram: { title: 'A request contract', caption: 'Validation and authorization happen before a side effect.', mermaid: 'flowchart LR\n C[Client] --> V[Validate schema]\n V --> A[Authenticate + authorize]\n A --> B[Business operation]\n B --> D[(Durable store)]\n D --> R[Intentional HTTP response]' },
    },
  },
  {
    matches: ['how the web works', 'html semantics and accessibility', 'css layout and responsive design', 'css architecture and motion', 'forms validation and ux states', 'seo metadata and structured data', 'browser devtools mastery', 'web performance fundamentals', 'accessibility auditing in practice', 'progressive web apps', 'webassembly introduction'],
    knowledge: {
      focus: 'the browser platform: meaningful documents, predictable layout, progressive enhancement, and fast feedback for every user and device',
      mentalModel: 'The browser parses HTML into a document tree, applies CSS to compute layout and paint, and runs JavaScript on top. Start with semantic HTML and a usable layout; JavaScript should improve the experience rather than be the only way it works.',
      mechanics: ['Semantic elements give screen readers, search engines, and future maintainers structure. Use a button for an action and a link for navigation.', 'Responsive layout is constraint solving: let content size itself, use flexible tracks, then add a breakpoint only when the layout genuinely breaks.', 'Performance is user-facing: avoid blocking render with unnecessary scripts, reserve media space to prevent layout shift, and measure before optimizing.'],
      workedExample: 'A checkout form can use label, input, fieldset, and native constraint validation before adding custom JavaScript. Keyboard and screen-reader users receive a coherent form; JavaScript can then add inline feedback without replacing browser fundamentals.',
      buildSteps: ['Build the document outline with landmarks and headings.', 'Use Flexbox/Grid constraints and test at narrow, wide, zoomed, and keyboard-only views.', 'Audit with DevTools: network waterfall, accessibility tree, and a performance recording.'],
      trap: 'A div with a click handler is not a button: it misses native keyboard behavior, semantics, and disabled-state behavior unless you recreate all of them.',
      check: 'If JavaScript fails to load, can a user still read the content and submit the core form?',
      code: { title: 'Accessible, progressively enhanced form', language: 'html', code: '<form action="/subscribe" method="post">\n  <label for="email">Email address</label>\n  <input id="email" name="email" type="email" autocomplete="email" required />\n  <button type="submit">Subscribe</button>\n  <p id="status" aria-live="polite"></p>\n</form>', explanation: 'The native form works without client JavaScript. aria-live is reserved for status feedback added after submission.' },
      diagram: { title: 'From bytes to pixels', caption: 'HTML and CSS establish the usable baseline; JavaScript enhances it.', mermaid: 'flowchart LR\n H[HTML] --> D[DOM]\n C[CSS] --> S[Style + layout]\n D --> S\n S --> P[Paint]\n J[JavaScript] -. enhances .-> D' },
    },
  },
  {
    matches: ['modern javascript', 'async javascript and the event loop', 'browser apis and performance', 'modules bundlers and build tools', 'typescript deep dive', 'testing javascript applications', 'functional programming in javascript', 'design patterns in javascript', 'javascript memory and garbage collection'],
    knowledge: {
      focus: 'writing JavaScript that makes data flow, asynchronous ordering, and runtime boundaries explicit',
      mentalModel: 'Values move through lexical scopes and the event loop. A function closes over values from the render/call that created it; promise continuations run as microtasks after the current stack, before the next timer task.',
      mechanics: ['Prefer clear module exports and narrow function inputs over mutable global state.', 'Use async/await around a promise, but still handle rejection, cancellation, timeout, and concurrent updates intentionally.', 'TypeScript checks shapes before runtime; it does not validate JSON received from a network. Validate untrusted values at the boundary.'],
      workedExample: 'Two searches start in quick succession. The first request can finish last and overwrite the newer result. Attach an AbortController or request counter so only the latest response updates the UI.',
      buildSteps: ['Separate pure transformation functions from I/O adapters.', 'Write a small test for the success case, a boundary case, and an async failure.', 'Use strict TypeScript and narrow unknown input after validation.'],
      trap: 'await pauses only the current async function. It does not make two operations run in order unless you actually await one before starting the next.',
      check: 'Why does Promise.resolve().then(...) run before setTimeout(..., 0) after the current call stack finishes?',
      code: { title: 'Latest request wins', language: 'typescript', code: "let controller: AbortController | undefined;\n\nasync function search(query: string) {\n  controller?.abort();\n  controller = new AbortController();\n  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });\n  if (!response.ok) throw new Error('Search failed');\n  return response.json() as Promise<{ results: string[] }> ;\n}", explanation: 'Cancelling the old request prevents an out-of-order response from updating state after a newer search.' },
      diagram: { title: 'Event-loop ordering', caption: 'The stack drains; microtasks run; then the next task is selected.', mermaid: 'flowchart LR\n S[Call stack] --> M[Microtask queue: promises]\n M --> T[Task queue: timers / I-O]\n T --> S' },
    },
  },
  {
    matches: ['react fundamentals', 'react architecture', 'react forms and validation libraries', 'next.js', 'state and data libraries', 'ui systems and design engineering', 'advanced react patterns', 'react performance optimization', 'client state at scale', 'realtime ui with websockets', 'micro-frontends and web components'],
    knowledge: {
      focus: 'building interfaces as a tree of pure render descriptions plus carefully isolated state and effects',
      mentalModel: 'A React render is a snapshot. Props and state produce UI; an event requests the next state; React renders a new snapshot. Effects synchronize that UI with something outside React such as a network request, subscription, or browser API.',
      mechanics: ['Keep state near the component that owns it; lift it only when siblings truly need the same source of truth.', 'Use effects for synchronization, not for values you can derive during render. Clean up subscriptions and cancel obsolete requests.', 'Separate server state (cached, asynchronous data) from local UI state (open panel, input value). Their update and invalidation rules differ.'],
      workedExample: 'A product filter is UI state and can live in the page component. The product list is server state: a query cache keys it by filter, preserves the previous result while a new request loads, and invalidates it after a mutation.',
      buildSteps: ['Draw component boundaries around responsibilities, not around every div.', 'Write loading, empty, error, and success states before the happy-path styling.', 'Profile before memoizing; fix unnecessary state ownership or expensive list rendering first.'],
      trap: 'An empty dependency array does not mean “run when data changes”; it means the effect captures initial values. Missing dependencies create stale closures.',
      check: 'Which part of your component is a pure rendering calculation, and which part truly synchronizes with an external system?',
      code: { title: 'Effect with cancellation and complete dependencies', language: 'tsx', code: "function UserCard({ id }: { id: string }) {\n  const [user, setUser] = useState<User | null>(null);\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch(`/api/users/${id}`, { signal: controller.signal })\n      .then(r => r.ok ? r.json() : Promise.reject(r))\n      .then(setUser)\n      .catch(error => { if (error.name !== 'AbortError') console.error(error); });\n    return () => controller.abort();\n  }, [id]);\n  return user ? <h2>{user.name}</h2> : <p>Loading…</p>;\n}", explanation: 'The effect depends on id and aborts the old request before a new id or unmount can produce a stale update.' },
      diagram: { title: 'React data flow', caption: 'Events request state changes; state and props produce the next render.', mermaid: 'flowchart LR\n E[User event] --> U[State update]\n U --> R[Render snapshot]\n R --> V[UI]\n R -. sync only when needed .-> X[External system]' },
    },
  },
  {
    matches: ['sql and postgresql', 'mongodb and document data', 'orms and query builders', 'redis and caching', 'search and vector databases', 'database transactions and isolation', 'data migration strategies', 'sql vs nosql at scale'],
    knowledge: {
      focus: 'choosing a data model, enforcing invariants at the database boundary, and measuring query cost rather than guessing',
      mentalModel: 'A database is not just storage. Its schema/indexes define which access paths are cheap, and its transaction model defines which concurrent histories are safe. Model the invariants first, then make the common reads and writes observable.',
      mechanics: ['Indexes speed selective reads but add write/storage cost. Read the query plan before adding indexes indiscriminately.', 'Transactions group related changes. Isolation controls what concurrent transactions may observe; retries are part of the contract when serialization conflicts are possible.', 'Cache derived/read-heavy data with an explicit invalidation owner. A cache is allowed to be stale only when the product can tolerate it.'],
      workedExample: 'To show a user’s latest orders, index orders on (user_id, created_at DESC), query only the requested page, and inspect EXPLAIN. Do not fetch all orders and sort them in application memory.',
      buildSteps: ['List entities, ownership, invariants, and access patterns.', 'Create the smallest schema/query, then inspect its plan with realistic data.', 'Add migrations that can be rolled out and rolled back safely; monitor slow queries and cache hit rate.'],
      trap: 'A cache miss is normal; cache invalidation is the design problem. Never let a cache become the only copy of essential state.',
      check: 'What index supports your WHERE, JOIN, and ORDER BY together, and what write cost does it add?',
      code: { title: 'Parameterized paginated query', language: 'sql', code: 'SELECT id, total_cents, created_at\nFROM orders\nWHERE user_id = $1\n  AND created_at < $2\nORDER BY created_at DESC\nLIMIT $3;', explanation: 'Parameters prevent injection, the cursor avoids expensive large offsets, and a composite index can support the filter and order.' },
      diagram: { title: 'Read path with cache-aside', caption: 'The database remains authoritative; the application owns filling and invalidating the cache.', mermaid: 'sequenceDiagram\n participant A as App\n participant C as Cache\n participant D as Database\n A->>C: get(key)\n alt miss\n C-->>A: miss\n A->>D: query\n D-->>A: result\n A->>C: set(key, result)\n end' },
    },
  },
  {
    matches: ['docker and containers', 'cloud deployment', 'ci cd and release engineering', 'observability and reliability', 'web security', 'performance and scaling', 'incident management and postmortems', 'cloud cost optimization', 'load testing with k6', 'feature flags and progressive delivery', 'e2e testing with playwright', 'contract and api testing'],
    knowledge: {
      focus: 'making a service safe to build, release, observe, and repair under real traffic',
      mentalModel: 'Production engineering is a feedback loop: define an expected service level, instrument the system, release a reversible change, and use evidence to improve the next release. Reliability is a product feature with a budget.',
      mechanics: ['Containers package a process and its dependencies, not a security boundary. Use a small image, non-root user, pinned dependencies, and explicit configuration.', 'A deployment should be observable and reversible: health checks, metrics, logs with request IDs, a gradual rollout, and a rollback plan.', 'Security starts with threat modeling: validate input, authenticate/authorize server-side, keep secrets out of builds/logs, and set defensive browser headers.'],
      workedExample: 'Before a database migration, deploy backward-compatible code that can read both shapes. Backfill in controlled batches, switch reads, then remove the old path in a later release. This expand–migrate–contract sequence avoids downtime.',
      buildSteps: ['Set a measurable latency/error/availability target.', 'Add one dashboard and alert that identify user impact, not just host CPU.', 'Ship behind a flag or canary, watch the metric, and document the rollback trigger.'],
      trap: '“It works in Docker” is not a release criterion. It says little about secrets, database migration safety, observability, traffic, or rollback.',
      check: 'If this release raises error rate from 0.2% to 2%, who sees it, how quickly, and what is the one-command rollback?',
      diagram: { title: 'Safe delivery loop', caption: 'Measure user impact before, during, and after a reversible rollout.', mermaid: 'flowchart LR\n P[Plan + test] --> R[Release gradually]\n R --> O[Observe SLOs]\n O -->|healthy| S[Scale rollout]\n O -->|regression| B[Rollback]\n B --> L[Learn + improve]' },
    },
  },
  {
    matches: ['system design fundamentals', 'load balancing and cdns', 'caching at scale', 'message queues and streaming', 'designing a url shortener', 'designing a social feed', 'designing a chat system', 'designing a notification system', 'designing a rate limiter'],
    knowledge: {
      focus: 'turning ambiguous product requirements into a measurable architecture with explicit trade-offs',
      mentalModel: 'Start from the workload: who does what, how often, how fast, and how correct must the result be? Then draw the request path, identify the state that must be authoritative, and design the failure/backpressure behavior before selecting technologies.',
      mechanics: ['Separate functional requirements from scale, latency, availability, durability, and consistency constraints.', 'Use queues to absorb bursts and decouple work, but define ordering, retry, idempotency, poison-message, and backpressure rules.', 'Caches, replicas, and CDNs trade freshness for latency/cost. State the consistency promise at the API boundary.'],
      workedExample: 'For a URL shortener, a redirect is read-heavy and latency-sensitive. Store a durable key-to-URL mapping, cache hot keys at the edge, send analytics asynchronously through a queue, and define what happens when analytics is unavailable without breaking redirects.',
      buildSteps: ['Clarify the API, SLOs, data size, read/write ratio, and failure tolerance.', 'Sketch the happy path and two failure paths.', 'Choose one trade-off deliberately and state how you would measure whether it works.'],
      trap: 'Jumping to Kafka, sharding, or microservices before estimating traffic produces architecture theatre. A well-indexed monolith is often the correct first design.',
      check: 'Which data must be strongly consistent, and which user-visible result can be delayed or eventually consistent?',
      diagram: { title: 'Design from the request path', caption: 'Keep the synchronous path short; move non-critical side effects behind a durable boundary.', mermaid: 'flowchart LR\n U[User] --> E[Edge / API]\n E --> D[(Authoritative data)]\n E --> C[(Cache)]\n E --> Q[Durable queue]\n Q --> W[Async workers]' },
    },
  },
  {
    matches: ['python for ai', 'numpy and vectorized computing', 'pandas and data preparation', 'sql for data science', 'data visualization', 'web apis and scraping for data', 'polars and modern dataframes', 'data pipelines and orchestration', 'data quality and validation', 'data lakes warehouses and lakehouses'],
    knowledge: {
      focus: 'making data work reproducible: explicit inputs, vectorized transformations, validated outputs, and a traceable pipeline',
      mentalModel: 'A data workflow is a series of transformations from raw observations to an analysis-ready table. Each step should state its input schema, output schema, assumptions, and quality checks so a rerun produces the same result or clearly reports why it cannot.',
      mechanics: ['Prefer vectorized array/dataframe operations over Python loops for large numeric data; they make intent and performance clearer.', 'Split data by time/entity before fitting transformations to prevent future information leaking into training.', 'Visualizations answer a question. Label units, show uncertainty when it matters, and avoid scales that exaggerate tiny differences.'],
      workedExample: 'For daily revenue, parse timestamps into one timezone, reject duplicate order IDs, aggregate net value by day, and compare row counts before/after each cleaning step. A missing day becomes a visible quality alert instead of a silent zero.',
      buildSteps: ['Keep raw data immutable and version the transformation code.', 'Validate schema, null rate, uniqueness, and distribution expectations at each boundary.', 'Write the final table/figure with its grain, time range, and known limitations.'],
      trap: 'Cleaning after splitting is not enough if you learned a global mean, vocabulary, or scaler from all rows. Fit transforms on training data only.',
      check: 'What does one row represent after your transformation, and which checks prove that statement?',
      code: { title: 'A small explicit data-quality check', language: 'python', code: "def validate_orders(df):\n    required = {'order_id', 'created_at', 'amount'}\n    missing = required - set(df.columns)\n    if missing: raise ValueError(f'missing columns: {sorted(missing)}')\n    if df.order_id.duplicated().any(): raise ValueError('duplicate order_id')\n    if df.amount.isna().any() or (df.amount < 0).any(): raise ValueError('invalid amount')\n    return df.copy()", explanation: 'Validate data contracts before aggregation or model training so bad input fails close to its source.' },
      diagram: { title: 'Reproducible data path', caption: 'Raw data is preserved; every transformation is validated and observable.', mermaid: 'flowchart LR\n R[Raw data] --> V[Validate]\n V --> T[Transform]\n T --> Q[Quality checks]\n Q --> A[Analysis / features]\n A --> M[Model or dashboard]' },
    },
  },
  {
    matches: ['linear algebra for ml', 'probability and statistics', 'calculus and gradients', 'optimization', 'information theory', 'regression and classification', 'trees and ensembles', 'unsupervised learning', 'model selection and evaluation', 'feature engineering', 'recommender systems basics', 'time series forecasting', 'ml problem framing'],
    knowledge: {
      focus: 'choosing a measurable prediction problem, learning a generalizable relationship, and using evaluation to decide whether it is useful',
      mentalModel: 'A model is a function fitted on past examples. It is useful only when its inputs are available at prediction time, its metric matches the decision, and it performs on data it did not see while choices were being made.',
      mechanics: ['Start with a baseline and a metric tied to the cost of mistakes; accuracy alone hides class imbalance and threshold trade-offs.', 'Separate train/validation/test by the real deployment boundary—usually time, user, or group—not just a random row split.', 'Bias is systematic underfitting; variance is sensitivity to the sample. Regularization, simpler models, more data, and better features each affect a different failure mode.'],
      workedExample: 'For fraud detection, positives are rare and false negatives are costly. Use a time-based split, report precision/recall and a precision-recall curve, choose a threshold with operations, and check features for leakage from post-decision events.',
      buildSteps: ['Write the target, prediction time, decision owner, and cost of false positives/negatives.', 'Establish a simple baseline and a held-out evaluation protocol.', 'Inspect errors by segment, then change one hypothesis at a time and record the result.'],
      trap: 'A high offline metric is not proof of value. Leakage, a mismatched metric, or a shifted deployment distribution can make it collapse in production.',
      check: 'Could every feature be known at the exact moment your production system must make its prediction?',
      code: { title: 'Leakage-safe model pipeline', language: 'python', code: "from sklearn.pipeline import make_pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n\nmodel = make_pipeline(\n    SimpleImputer(), StandardScaler(),\n    LogisticRegression(class_weight='balanced', max_iter=1000),\n)\nmodel.fit(X_train, y_train)\nprint(model.score(X_valid, y_valid))", explanation: 'Putting preprocessing in the pipeline fits it on training folds only, avoiding a common form of evaluation leakage.' },
      diagram: { title: 'ML decision loop', caption: 'Evaluation is a gate before deployment, and production feedback starts the next iteration.', mermaid: 'flowchart LR\n F[Frame problem] --> D[Split + prepare data]\n D --> T[Train baseline]\n T --> E[Evaluate by metric + segment]\n E -->|good enough| P[Deploy + monitor]\n E -->|gap| F\n P --> F' },
    },
  },
  {
    matches: ['neural network fundamentals', 'pytorch', 'tensorflow and keras', 'cnns and computer vision', 'sequence models', 'generative models', 'optimization for deep learning', 'normalization and regularization', 'mixed precision and distributed training', 'transformers', 'nlp foundations', 'hugging face ecosystem', 'fine tuning and alignment', 'prompt engineering', 'llm evaluation and benchmarks', 'multilingual and low-resource nlp', 'speech and audio ai'],
    knowledge: {
      focus: 'training and evaluating neural systems as controlled experiments rather than tuning by intuition',
      mentalModel: 'A network maps inputs through differentiable layers to a loss. Backpropagation computes how each parameter affected that loss; an optimizer makes a small update. Data, objective, model capacity, and training dynamics all determine the result.',
      mechanics: ['Keep train/validation/test data separate and make preprocessing/tokenization identical between training and serving.', 'Monitor loss, task metrics, learning rate, gradient health, and representative samples; a single aggregate number is not enough.', 'For language models, separate factuality, task success, safety, latency, and cost in the evaluation set.'],
      workedExample: 'A classifier with falling training loss but rising validation loss is overfitting. Stop based on validation, add augmentation/regularization, reduce capacity, or collect better coverage; simply training longer worsens the generalization gap.',
      buildSteps: ['Make one tiny overfit test to prove the model/code can learn.', 'Create a fixed validation set and baseline before changing architecture.', 'Log configuration, seed, data version, metric, and failure examples for each run.'],
      trap: 'A lower training loss is not automatically a better model. The deployment distribution and failure modes decide whether the change is valuable.',
      check: 'What evidence distinguishes underfitting, overfitting, data leakage, and a broken training loop in your experiment?',
      code: { title: 'Minimal PyTorch training step', language: 'python', code: "model.train()\nfor x, y in train_loader:\n    optimizer.zero_grad()\n    logits = model(x)\n    loss = loss_fn(logits, y)\n    loss.backward()\n    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)\n    optimizer.step()", explanation: 'The update order is deliberate: clear old gradients, compute loss, backpropagate, optionally clip, then step the optimizer.' },
      diagram: { title: 'Training feedback loop', caption: 'Training updates parameters; validation decides whether the change generalizes.', mermaid: 'flowchart LR\n X[Batch] --> F[Forward pass]\n F --> L[Loss]\n L --> B[Backprop gradients]\n B --> O[Optimizer update]\n O --> F\n F -. held-out data .-> V[Validation metrics]' },
    },
  },
  {
    matches: ['embeddings and semantic search', 'rag systems', 'ai agents and tool use', 'multimodal ai', 'llm application engineering', 'structured data extraction', 'ai red teaming', 'experiment tracking', 'data and model versioning', 'serving models', 'docker and cloud gpus', 'monitoring and responsible ai', 'interpretability and explainability', 'inference optimization', 'feature stores in production', 'designing ml systems', 'training pipelines at scale', 'candidate generation and ranking', 'inference at scale', 'monitoring and feedback loops'],
    knowledge: {
      focus: 'shipping an AI feature as a measured system: grounded inputs, constrained outputs, evaluation, observability, and safe fallbacks',
      mentalModel: 'An AI application is a pipeline, not just a model call. Retrieve or prepare trusted context, invoke a model within a schema and budget, validate the result, then record enough evidence to reproduce failures and improve the next version.',
      mechanics: ['Retrieval quality comes from document quality, chunk boundaries, metadata, query/reranking, and evaluation—not embeddings alone.', 'Tool-using agents need narrow permissions, input/output validation, timeouts, idempotency, and a human-safe failure path.', 'Version prompts, models, evaluation cases, and data. Compare changes against a fixed test set before making them user-visible.'],
      workedExample: 'For a support RAG assistant, retrieve chunks scoped to the customer’s product and permission, ask for answer citations, reject unsupported claims, and show a search result or escalation when confidence is low. Do not let retrieved text grant new instructions or permissions.',
      buildSteps: ['Define the user task, unacceptable failure modes, latency/cost budget, and an offline evaluation set.', 'Build a deterministic baseline (search/template/rules) before adding a model.', 'Validate output schema and citations; log redacted traces and review failures by category.'],
      trap: 'RAG reduces hallucinations only when retrieval is relevant and the application treats retrieved documents as data, not trusted instructions.',
      check: 'Can your evaluator tell whether a failure came from retrieval, generation, output validation, or the surrounding product workflow?',
      code: { title: 'Schema-first model boundary', language: 'typescript', code: "type Answer = { answer: string; citations: string[]; needsHuman: boolean };\n\nfunction validAnswer(value: unknown): value is Answer {\n  const x = value as Answer;\n  return !!x && typeof x.answer === 'string'\n    && Array.isArray(x.citations) && x.citations.every(c => typeof c === 'string')\n    && typeof x.needsHuman === 'boolean';\n}\n\nconst output = await callModel(prompt);\nif (!validAnswer(output) || (!output.needsHuman && !output.citations.length)) {\n  return { answer: 'I could not verify that answer.', citations: [], needsHuman: true };\n}", explanation: 'Treat model output as untrusted input: validate its contract and choose a safe fallback when evidence is missing.' },
      diagram: { title: 'Grounded AI request', caption: 'Evidence and validation surround the model call; they are not optional decorations.', mermaid: 'flowchart LR\n Q[User request] --> P[Policy + permissions]\n P --> R[Retrieve scoped evidence]\n R --> M[Model / tool call]\n M --> V[Schema + citation validation]\n V --> A[Answer or safe escalation]\n A --> O[Redacted observability]' },
    },
  },
  {
    matches: ['sets relations and functions', 'propositional and predicate logic', 'combinatorics and counting', 'graph theory', 'linear algebra', 'calculus and optimization', 'probability', 'statistics and estimation', 'numerical methods', 'number systems and codes', 'boolean algebra and logic gates', 'karnaugh maps and minimization', 'combinational circuits', 'sequential circuits', 'registers counters and fsm design', 'computer arithmetic'],
    knowledge: {
      focus: 'building formal reasoning from definitions, small cases, and explicit assumptions before doing symbolic manipulation',
      mentalModel: 'Mathematical and digital-logic questions look different, but the reliable method is the same: define the objects, write the governing rule, test a minimal example, and only then generalize. Symbols compress a claim; they do not replace its assumptions.',
      mechanics: ['Translate English precisely: quantify the domain, distinguish implication from equivalence, and write the condition under which a formula applies.', 'For counting or probability, define the sample space and whether cases are disjoint before adding/multiplying.', 'For Boolean/digital logic, use truth tables or adjacent K-map groups to verify an algebraic simplification rather than trusting visual familiarity.'],
      workedExample: 'A /26 IPv4-style count has 32 − 26 = 6 free bits, so 2^6 = 64 addresses. In the usual subnet convention, network and broadcast addresses are reserved, giving 62 usable host addresses. The assumption about reservation is part of the answer.',
      buildSteps: ['State the definition/formula and its preconditions.', 'Work a smallest numerical/truth-table example.', 'Check units, bounds, and a complementary case before selecting an option.'],
      trap: 'Most exam errors are not arithmetic errors: they are counting overlapping cases twice, using an implication backwards, or applying a formula outside its assumptions.',
      check: 'What is the domain, what is held fixed, and what one tiny case can disprove your proposed rule?',
      diagram: { title: 'Definition-to-proof workflow', caption: 'A small counterexample is cheaper than a long incorrect derivation.', mermaid: 'flowchart LR\n D[Define objects + assumptions] --> R[Write governing rule]\n R --> E[Test tiny example]\n E -->|passes| G[Generalize / calculate]\n E -->|fails| D' },
    },
  },
  {
    matches: ['instruction set architecture', 'cpu datapath and control', 'pipelining and hazards', 'memory hierarchy and cache', 'virtual memory and address translation', 'input output and dma', 'performance analysis', 'c programming fundamentals', 'pointers arrays and memory', 'structs unions and dynamic allocation', 'recursion', 'stacks queues and linked lists', 'trees and binary search trees', 'heaps and priority queues', 'hashing', 'time and space complexity', 'searching and sorting', 'divide and conquer', 'greedy algorithms', 'dynamic programming', 'backtracking and branch and bound', 'graph algorithms', 'string algorithms', 'asymptotic analysis practice'],
    knowledge: {
      focus: 'solving systems and algorithm questions with an invariant, a hand trace, and a named cost model',
      mentalModel: 'An invariant is the fact that remains true after each step. It is both the proof guide and the debugging tool: initialize it, preserve it in each branch, and use it at termination to justify the result.',
      mechanics: ['State preconditions before applying an algorithm: binary search requires sorted order; Dijkstra requires non-negative edge weights; a pointer must reference valid lifetime-managed memory.', 'Trace a tiny case and write state after every operation. This reveals boundary errors, aliasing, cache/page mappings, and recurrence base cases.', 'Count the dominant operation and extra storage separately. Label best, average, and worst case when they differ.'],
      workedExample: 'In binary search on a sorted array, maintain “if target exists, it is in [lo, hi]”. Compare mid; discard only the half that cannot contain target. The interval roughly halves, so after k steps n / 2^k ≤ 1 and k is O(log n).',
      buildSteps: ['Write the precondition, invariant, and termination condition beside the pseudocode.', 'Trace empty, singleton, typical, duplicate, and adversarial inputs.', 'State the time/space cost and the exact input that produces worst case.'],
      trap: 'Memorizing an implementation without its invariant creates off-by-one bugs. If you cannot say what lo/hi, a stack, or a DP cell means, do not optimize it yet.',
      check: 'What is true before the loop, after every branch, and when the loop stops?',
      code: { title: 'Binary search with a stated invariant', language: 'javascript', code: "function binarySearch(values, target) {\n  let lo = 0, hi = values.length - 1;\n  // If target occurs, it is in the inclusive interval [lo, hi].\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (values[mid] === target) return mid;\n    if (values[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}", explanation: 'Each branch preserves the inclusive-interval invariant and removes at least one element; sorted order makes the discarded half impossible.' },
      diagram: { title: 'Invariant-driven loop', caption: 'Every branch either returns a proved answer or shrinks the remaining search state.', mermaid: 'flowchart TD\n I[Initialize invariant] --> C{State remains?}\n C -->|yes| S[Choose one valid transition]\n S --> C\n C -->|no| T[Termination + invariant proves result]' },
    },
  },
  {
    matches: ['regular languages and finite automata', 'pumping lemmas and language proofs', 'context free grammars and pushdown automata', 'turing machines and decidability', 'complexity classes', 'the compilation pipeline', 'lexical analysis', 'parsing and grammars', 'syntax directed translation', 'runtime environments and optimization', 'processes and threads', 'system calls and kernel interfaces', 'cpu scheduling', 'synchronization and deadlocks', 'memory management', 'file systems and storage', 'er modeling and relational algebra', 'er to relational mapping', 'sql and query processing', 'functional dependencies and normalization', 'indexing and b plus trees', 'transactions and concurrency', 'query optimization and execution plans', 'distributed databases', 'osi and tcp ip models', 'data link and lans', 'ip addressing and subnetting', 'routing protocols', 'transport layer', 'application protocols', 'network security and cryptography basics'],
    knowledge: {
      focus: 'reasoning about a layered or formal system by identifying its model, legal transitions, and the property you must prove or measure',
      mentalModel: 'Operating systems, databases, networks, compilers, and formal languages all hide complexity behind interfaces. Draw the state/stack/graph/table that the system maintains, then ask which transitions are legal and which invariant the interface promises.',
      mechanics: ['Keep layers distinct: application intent is not a TCP segment, a virtual address is not a physical address, and a logical schema is not a physical index.', 'For concurrency and transactions, construct the dependency/precedence graph; cycles reveal conflicting orderings and deadlock/serializability risks.', 'For formal languages and parsing, state the machine/grammar model and use a witness string or derivation rather than pattern-matching an answer.'],
      workedExample: 'To test conflict serializability, create one node per transaction and add Ti → Tj when Ti’s conflicting operation occurs first. An acyclic graph can be topologically ordered into an equivalent serial schedule; a cycle cannot.',
      buildSteps: ['Name the abstraction and the data/state it stores.', 'Trace one successful flow and one failure/edge flow.', 'Use the correct graph, table, or derivation to justify the conclusion—not an analogy alone.'],
      trap: 'Terms that sound interchangeable usually live at different layers: flow control vs congestion control, process vs thread, 3NF vs BCNF, DFA vs NFA, authentication vs encryption.',
      check: 'Which layer owns this decision, and what explicit state proves whether the next transition is legal?',
      diagram: { title: 'Model, transition, property', caption: 'Formal and systems questions become manageable once the hidden state is made visible.', mermaid: 'flowchart LR\n M[Choose the right model]\n M --> S[Expose state / graph / table]\n S --> T[Trace legal transitions]\n T --> P[Prove or measure property]' },
    },
  },
];

function normalized(topic: TopicLike) {
  return `${topic.title} ${topic.description} ${topic.module || ''}`.toLowerCase().replace(/[^a-z0-9+]+/g, ' ');
}

function fallbackKnowledge(topic: TopicLike): LocalKnowledge {
  const title = topic.title;
  const module = topic.module || 'this module';
  return {
    focus: `the practical and conceptual foundations of ${title}`,
    mentalModel: `${title} belongs to ${module}. Start from the stated scope: ${topic.description} Turn each noun in that scope into a definition, each verb into an operation you can trace, and each boundary into a test case.`,
    mechanics: [`List the inputs, state, outputs, and assumptions for ${title}.`, 'Work one minimal example slowly enough to label each state transition.', 'Compare the standard method with one nearby alternative and state when each is valid.'],
    workedExample: `Choose the smallest realistic example from ${title}, predict the result before computing it, and then change one boundary condition. The disagreement between prediction and trace is the exact concept to repair.`,
    buildSteps: ['Read the linked reference once for terminology and its canonical API/formula.', 'Reproduce one example without copying it.', 'Write one test, derivation, or explanation that would catch the most likely misconception.'],
    trap: `Do not treat ${title} as a vocabulary list. A correct term without its assumptions or failure mode is not yet a usable mental model.`,
    check: `Can you define ${title}, work a tiny example, and name one condition where the standard rule changes?`,
  };
}

/** Returns the strongest profile, with an intentional general fallback for every curriculum topic. */
export function localKnowledgeFor(topic: TopicLike): LocalKnowledge {
  const text = normalized(topic);
  let best: { profile: Profile; score: number } | undefined;
  for (const profile of profiles) {
    const score = profile.matches.reduce((total, phrase) => total + (text.includes(phrase) ? phrase.split(' ').length + 1 : 0), 0);
    if (score && (!best || score > best.score)) best = { profile, score };
  }
  return best?.profile.knowledge || fallbackKnowledge(topic);
}

function goalOf(topic: TopicLike): 'gate-cs' | 'web-dev' | 'ai-ml' {
  if (topic.id?.startsWith('web-dev-')) return 'web-dev';
  if (topic.id?.startsWith('ai-ml-')) return 'ai-ml';
  return 'gate-cs';
}

const nodeUrl = 'https://www.geeksforgeeks.org/node-js/nodejs/';

/**
 * Primary/reference routes for every topic.  URLs are intentionally stored as
 * links, not copied article text.  The runtime's opt-in source seeder can ingest
 * permitted public source text into Qdrant; the offline kit remains original.
 */
export function referencesFor(topic: TopicLike): LocalReference[] {
  const goal = goalOf(topic);
  const title = topic.title;
  const query = encodeURIComponent(title);
  const text = normalized(topic);
  if (text.includes('node js runtime') || text.includes('nodejs runtime')) {
    return [
      { title: 'Node.js Tutorial', publisher: 'GeeksforGeeks', url: nodeUrl, kind: 'reference' },
      { title: 'Node.js Learn', publisher: 'OpenJS Foundation', url: 'https://nodejs.org/en/learn', kind: 'primary' },
      { title: 'JavaScript Guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', kind: 'reference' },
    ];
  }
  if (goal === 'web-dev') {
    const primary = text.includes('react') || text.includes('next js')
      ? { title: `${title} documentation`, publisher: text.includes('next js') ? 'Vercel' : 'React', url: text.includes('next js') ? 'https://nextjs.org/docs' : 'https://react.dev/learn', kind: 'primary' as const }
      : text.includes('typescript')
        ? { title: 'TypeScript Handbook', publisher: 'Microsoft', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', kind: 'primary' as const }
        : { title: `MDN: ${title}`, publisher: 'MDN Web Docs', url: `https://developer.mozilla.org/en-US/search?q=${query}`, kind: 'primary' as const };
    return [
      primary,
      { title: `GeeksforGeeks: ${title}`, publisher: 'GeeksforGeeks', url: `https://www.geeksforgeeks.org/?s=${query}`, kind: 'reference' },
      { title: `W3Schools reference: ${title}`, publisher: 'W3Schools', url: 'https://www.w3schools.com/', kind: 'reference' },
    ];
  }
  if (goal === 'ai-ml') {
    const primary = text.includes('pytorch') || text.includes('neural') || text.includes('deep learning')
      ? { title: 'PyTorch Tutorials', publisher: 'PyTorch', url: 'https://docs.pytorch.org/tutorials/', kind: 'primary' as const }
      : text.includes('hugging face') || text.includes('transformer') || text.includes('rag') || text.includes('llm')
        ? { title: 'Hugging Face Learn', publisher: 'Hugging Face', url: 'https://huggingface.co/learn', kind: 'primary' as const }
        : { title: 'scikit-learn User Guide', publisher: 'scikit-learn', url: 'https://scikit-learn.org/stable/user_guide.html', kind: 'primary' as const };
    return [
      primary,
      { title: `GeeksforGeeks: ${title}`, publisher: 'GeeksforGeeks', url: `https://www.geeksforgeeks.org/?s=${query}`, kind: 'reference' },
      { title: 'Dive into Deep Learning', publisher: 'D2L', url: 'https://d2l.ai/', kind: 'reference' },
    ];
  }
  return [
    { title: `GeeksforGeeks: ${title}`, publisher: 'GeeksforGeeks', url: `https://www.geeksforgeeks.org/?s=${query}`, kind: 'reference' },
    { title: 'NPTEL Computer Science courses', publisher: 'IITs and IISc', url: 'https://nptel.ac.in/courses', kind: 'primary' },
    { title: 'GATE Overflow', publisher: 'GATE CSE community', url: 'https://gateoverflow.in/', kind: 'practice' },
  ];
}
