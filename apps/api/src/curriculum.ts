export type CurriculumGoal = 'gate-cs' | 'web-dev' | 'ai-ml';
export type CurriculumTopic = { id: string; module: string; title: string; description: string; prerequisites: string[]; status: 'available' | 'locked' | 'complete'; minutes: number };
type TopicSeed = [string, string, string, number?];
type ModuleSeed = [string, TopicSeed[]];

function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function build(goal: CurriculumGoal, modules: ModuleSeed[]): CurriculumTopic[] {
  const output: CurriculumTopic[] = [];
  const legacyGateIds: Record<string, string> = { 'Time and Space Complexity': 'algo-complexity', 'Searching and Sorting': 'algo-sorting', 'Graph Algorithms': 'algo-graphs' };
  for (const [module, seeds] of modules) {
    let previous: string | null = null;
    for (const [title, description, kind, minutes = 35] of seeds) {
      const id = goal === 'gate-cs' && legacyGateIds[title] ? legacyGateIds[title] : `${goal}-${slug(module)}-${slug(title)}`;
      output.push({ id, module, title, description, prerequisites: previous ? [previous] : [], status: 'available', minutes });
      previous = id;
    }
  }
  return output;
}

const gateModules: ModuleSeed[] = [
  ['Engineering Mathematics', [
    ['Discrete Mathematics', 'Logic, sets, relations, functions, combinatorics, and proof techniques for computer science.', 'concepts', 50],
    ['Graph Theory', 'Paths, connectivity, trees, planar graphs, coloring, matching, and graph representations.', 'concepts', 50],
    ['Linear Algebra', 'Vectors, matrices, systems of equations, eigenvalues, and transformations used in computing.', 'concepts', 45],
    ['Calculus and Optimization', 'Limits, derivatives, integration, extrema, and the optimization ideas behind algorithms.', 'concepts', 45],
    ['Probability and Statistics', 'Random variables, distributions, expectation, variance, Bayes theorem, and estimation.', 'concepts', 50],
  ]],
  ['Digital Logic', [
    ['Boolean Algebra and Logic Gates', 'Simplify Boolean expressions and design combinational circuits from first principles.', 'concepts'],
    ['Combinational Circuits', 'Adders, subtractors, multiplexers, decoders, encoders, and arithmetic circuits.', 'concepts'],
    ['Sequential Circuits', 'Latches, flip-flops, registers, counters, timing, and finite-state memory elements.', 'concepts'],
    ['Number Systems and Computer Arithmetic', 'Binary representations, signed arithmetic, overflow, floating point, and ALU operations.', 'concepts'],
  ]],
  ['Computer Organization and Architecture', [
    ['Instruction Set Architecture', 'Instructions, addressing modes, registers, assembly-level execution, and datapaths.', 'concepts', 45],
    ['CPU Datapath and Control', 'Single-cycle and pipelined processors, control units, hazards, and forwarding.', 'concepts', 55],
    ['Memory Hierarchy and Cache', 'Locality, cache mapping, replacement, write policies, virtual memory, and performance.', 'concepts', 50],
    ['Input Output and DMA', 'Interrupts, programmed I/O, DMA, buses, and device communication.', 'concepts', 40],
    ['Pipelining and Performance', 'Pipeline speedup, stalls, branch prediction, superscalar execution, and Amdahl’s law.', 'concepts', 50],
  ]],
  ['Programming and Data Structures', [
    ['C Programming and Pointers', 'Memory, pointers, arrays, structs, functions, recursion, and undefined behavior in C.', 'code', 50],
    ['Stacks Queues and Linked Lists', 'Implement linear data structures and reason about operations, invariants, and memory.', 'code', 45],
    ['Trees and Heaps', 'Binary trees, BSTs, AVL intuition, traversals, heaps, and priority queues.', 'code', 50],
    ['Hashing', 'Hash functions, collision strategies, load factor, maps, sets, and expected-time analysis.', 'code', 40],
  ]],
  ['Algorithms', [
    ['Time and Space Complexity', 'Analyze growth rates with O, Ω, Θ, recurrences, amortized cost, and trade-offs.', 'code', 45],
    ['Searching and Sorting', 'Linear and binary search plus insertion, merge, quick, heap, radix, and counting sort.', 'code', 50],
    ['Divide and Conquer', 'Design recurrences and solve them using substitution, recursion trees, and Master theorem.', 'code', 50],
    ['Greedy Algorithms', 'Exchange arguments, matroids intuition, scheduling, Huffman coding, and minimum spanning trees.', 'code', 50],
    ['Dynamic Programming', 'State design, transitions, memoization, tabulation, and classic optimization problems.', 'code', 60],
    ['Graph Algorithms', 'BFS, DFS, topological sort, shortest paths, connectivity, MST, and flow fundamentals.', 'code', 60],
    ['String Algorithms', 'Pattern matching, tries, prefix functions, hashing, and suffix-based techniques.', 'code', 50],
  ]],
  ['Theory of Computation', [
    ['Regular Languages and Finite Automata', 'DFA, NFA, regular expressions, closure properties, and minimization.', 'concepts', 50],
    ['Context Free Grammars and Pushdown Automata', 'CFG derivations, parse trees, ambiguity, normal forms, and PDA equivalence.', 'concepts', 55],
    ['Turing Machines and Decidability', 'Machine models, recursive languages, reductions, decidable and recognizable problems.', 'concepts', 55],
    ['Complexity Classes', 'P, NP, co-NP, reductions, completeness, and the limits of efficient computation.', 'concepts', 55],
  ]],
  ['Compiler Design', [
    ['Lexical Analysis', 'Tokens, regular expressions, finite automata, scanners, and lexical errors.', 'concepts', 40],
    ['Parsing and Grammars', 'Top-down and bottom-up parsing, FIRST/FOLLOW, LL, LR, and parse table construction.', 'concepts', 55],
    ['Syntax Directed Translation', 'Semantic analysis, attributes, type checking, and intermediate representations.', 'concepts', 45],
    ['Runtime Environments and Optimization', 'Symbol tables, activation records, code generation, data flow, and optimization.', 'concepts', 50],
  ]],
  ['Operating Systems', [
    ['Processes and Threads', 'Process states, context switches, threads, IPC, and process coordination.', 'concepts', 50],
    ['CPU Scheduling', 'FCFS, SJF, priority, round robin, response time, throughput, and scheduling trade-offs.', 'concepts', 45],
    ['Synchronization and Deadlocks', 'Critical sections, semaphores, monitors, races, deadlock conditions, and recovery.', 'concepts', 55],
    ['Memory Management', 'Paging, segmentation, page tables, TLBs, virtual memory, and page replacement.', 'concepts', 55],
    ['File Systems and Storage', 'Files, directories, allocation, inodes, disk scheduling, journaling, and RAID.', 'concepts', 50],
  ]],
  ['Database Management Systems', [
    ['ER Modeling and Relational Algebra', 'Model requirements, keys, constraints, relational operations, and query foundations.', 'concepts', 45],
    ['SQL and Query Processing', 'Write joins, aggregation, subqueries, views, indexes, and understand query plans.', 'code', 50],
    ['Functional Dependencies and Normalization', 'Compute closures, candidate keys, normal forms, lossless decomposition, and dependency preservation.', 'concepts', 55],
    ['Transactions and Concurrency', 'ACID, schedules, serializability, locking, timestamps, recovery, and logging.', 'concepts', 55],
    ['Distributed Databases', 'Replication, partitioning, distributed transactions, consistency, and CAP trade-offs.', 'concepts', 50],
  ]],
  ['Computer Networks', [
    ['OSI and TCP IP Models', 'Layering, encapsulation, addressing, protocols, and how data crosses a network.', 'concepts', 40],
    ['Data Link and LANs', 'Framing, error detection, Ethernet, switching, ARP, VLANs, and MAC learning.', 'concepts', 45],
    ['IP Addressing and Routing', 'IPv4, IPv6, subnetting, routing tables, distance vector, link state, and BGP intuition.', 'concepts', 55],
    ['Transport Layer', 'UDP, TCP, reliability, flow control, congestion control, connection lifecycle, and QUIC context.', 'concepts', 55],
    ['Application Protocols and Security', 'DNS, HTTP, TLS, email, sockets, proxies, firewalls, and secure communication.', 'concepts', 50],
  ]],
  ['General Aptitude and GATE Strategy', [
    ['Quantitative Aptitude', 'Percentages, ratios, averages, counting, probability, data interpretation, and numerical shortcuts.', 'practice', 40],
    ['Verbal Aptitude', 'Reading comprehension, grammar, sentence completion, vocabulary, and logical language questions.', 'practice', 35],
    ['Previous Year Question Strategy', 'Classify GATE questions, identify recurring patterns, manage time, and review mistakes.', 'practice', 35],
  ]],
  ['PYQ Marathons and Test Strategy', [
    ['PYQ Marathon: Engineering Mathematics', 'Timed mixed sets from linear algebra, probability, discrete math, and graph theory PYQs.', 'practice', 45],
    ['PYQ Marathon: Digital Logic and COA', 'Number systems, Boolean minimization, cache, and pipeline questions under time pressure.', 'practice', 45],
    ['PYQ Marathon: Programming and Data Structures', 'C output questions, pointers, stacks, trees, and hashing PYQs with traps explained.', 'practice', 45],
    ['PYQ Marathon: Algorithms', 'Complexity, sorting, greedy, DP, and graph PYQs with proof sketches for hard ones.', 'practice', 50],
    ['PYQ Marathon: Theory of Computation', 'Automata constructions, pumping arguments, decidability, and complexity PYQs.', 'practice', 50],
    ['PYQ Marathon: Compiler Design', 'FIRST/FOLLOW, LR parsing, SDT, and code generation PYQs solved methodically.', 'practice', 45],
    ['PYQ Marathon: Operating Systems', 'Scheduling, synchronization, paging, and file system numericals from past papers.', 'practice', 50],
    ['PYQ Marathon: Databases', 'Normalization, serializability, SQL, and transaction PYQs with canonical methods.', 'practice', 50],
    ['PYQ Marathon: Computer Networks', 'Subnetting, TCP, flow control, and application-layer PYQs with diagrams.', 'practice', 45],
    ['PYQ Marathon: Aptitude Sprint', 'High-speed quantitative and verbal sets tuned to the 15-mark aptitude section.', 'practice', 35],
    ['Full-Length Test Strategy', 'Three-pass attempt order, mark budgeting, intelligent skipping, and post-test analysis rituals.', 'practice', 35],
  ]],
];

const fullStackModules: ModuleSeed[] = [
  ['Web Foundations', [['How the Web Works', 'Browsers, servers, DNS, HTTP, URLs, rendering, and the request-response lifecycle.', 'concepts'], ['HTML Semantics and Accessibility', 'Semantic structure, forms, landmarks, ARIA, keyboard navigation, and accessible content.', 'code'], ['CSS Layout and Responsive Design', 'Cascade, specificity, Flexbox, Grid, responsive breakpoints, container queries, and modern units.', 'code', 45], ['CSS Architecture and Motion', 'Design tokens, component styles, animations, transitions, and maintainable CSS systems.', 'code'], ['Browser DevTools Mastery', 'Inspect, debug, profile, and audit any web app with Elements, Network, Performance, and Lighthouse.', 'code', 40], ['Web Performance Fundamentals', 'Critical rendering path, resource hints, lazy loading, bundling, and Core Web Vitals budgets.', 'concepts', 45]]],
  ['JavaScript and TypeScript', [['Modern JavaScript', 'Scopes, closures, objects, prototypes, modules, destructuring, and modern syntax.', 'code', 50], ['Async JavaScript and the Event Loop', 'Promises, async/await, tasks, microtasks, cancellation, retries, and concurrency patterns.', 'code', 45], ['Browser APIs and Performance', 'DOM, events, storage, workers, networking, profiling, and Core Web Vitals.', 'code', 45], ['TypeScript Deep Dive', 'Types, generics, narrowing, utility types, modules, declaration files, and strict projects.', 'code', 50], ['Testing JavaScript Applications', 'Unit, integration, component, end-to-end, mocks, fixtures, and test-driven workflows.', 'code', 40], ['Functional Programming in JavaScript', 'Pure functions, immutability, map/filter/reduce, currying, composition, and functors intuition.', 'code', 45], ['Design Patterns in JavaScript', 'Module, observer, factory, singleton, strategy, and middleware patterns in real codebases.', 'code', 45]]],
  ['React Ecosystem', [['React Fundamentals', 'Components, props, state, effects, refs, controlled inputs, and rendering behavior.', 'code', 45], ['React Architecture', 'Composition, custom hooks, context, server state, error boundaries, and feature boundaries.', 'code', 50], ['Next.js', 'App Router, layouts, server components, server actions, metadata, caching, and deployment.', 'code', 55], ['State and Data Libraries', 'TanStack Query, Redux Toolkit, Zustand, URL state, optimistic updates, and cache invalidation.', 'code', 45], ['UI Systems and Design Engineering', 'Tailwind, shadcn/ui, Radix, component APIs, tokens, theming, and visual QA.', 'code', 40], ['Advanced React Patterns', 'Compound components, render props, headless UI, portals, and polymorphic component APIs.', 'code', 50], ['React Performance Optimization', 'Memoization, virtualization, code splitting, suspense boundaries, and render profiling.', 'code', 45]]],
  ['Backend with Node.js', [['Node.js Runtime', 'Modules, streams, buffers, event emitters, workers, filesystem, and process lifecycle.', 'code', 45], ['Express and Fastify', 'Routing, middleware, validation, error handling, logging, and production API structure.', 'code', 45], ['REST and GraphQL APIs', 'Resource modeling, pagination, filtering, versioning, GraphQL schemas, resolvers, and federation.', 'code', 50], ['Authentication and Authorization', 'Sessions, JWT, OAuth, cookies, RBAC, ABAC, CSRF, password security, and identity providers.', 'code', 55], ['Realtime and Background Jobs', 'WebSockets, SSE, queues, workers, scheduling, retries, idempotency, and event-driven design.', 'code', 50], ['API Security in Practice', 'Rate limiting, input validation, auth scoping, injection defense, SSRF guards, and security headers.', 'code', 50], ['Caching Strategies for APIs', 'HTTP caching, ETags, CDN behavior, Redis caching layers, and invalidation design.', 'code', 45]]],
  ['Data and Persistence', [['SQL and PostgreSQL', 'Relational modeling, joins, indexes, constraints, transactions, and query performance.', 'code', 50], ['MongoDB and Document Data', 'Document modeling, indexes, aggregation, transactions, and schema evolution.', 'code', 40], ['ORMs and Query Builders', 'Prisma, Drizzle, TypeORM, migrations, relations, generated types, and N+1 prevention.', 'code', 45], ['Redis and Caching', 'Cache-aside, invalidation, sessions, rate limits, pub-sub, streams, and distributed locks.', 'code', 40], ['Search and Vector Databases', 'Full-text search, embeddings, Qdrant, pgvector, retrieval, and hybrid search.', 'code', 45], ['Database Transactions and Isolation', 'ACID, isolation levels, phantom reads, deadlocks, optimistic locking, and retry design.', 'concepts', 45], ['Data Migration Strategies', 'Zero-downtime migrations, backfills, expand-contract, versioned schemas, and rollback plans.', 'concepts', 40]]],
  ['Production Engineering', [['Docker and Containers', 'Images, layers, volumes, networking, Compose, multi-stage builds, and security.', 'code', 45], ['Cloud Deployment', 'Render, Vercel, AWS, serverless, managed databases, secrets, domains, and environments.', 'concepts', 50], ['CI CD and Release Engineering', 'GitHub Actions, checks, preview environments, migrations, rollbacks, and release safety.', 'concepts', 45], ['Observability and Reliability', 'Structured logs, metrics, traces, health checks, alerts, SLOs, and incident response.', 'concepts', 45], ['Web Security', 'OWASP risks, input validation, XSS, SQL injection, CSP, SSRF, supply chain, and threat modeling.', 'concepts', 55], ['Performance and Scaling', 'Caching, queues, CDN, database tuning, load testing, horizontal scaling, and bottleneck analysis.', 'concepts', 50], ['Incident Management and Postmortems', 'On-call rotations, severity levels, blameless postmortems, runbooks, and reliability culture.', 'concepts', 40], ['Cloud Cost Optimization', 'Right-sizing, autoscaling policies, storage tiers, caching economics, and cost alerts.', 'concepts', 35]]],
  ['System Design', [
    ['System Design Fundamentals', 'Requirements, capacity estimation, trade-offs, and the framework interviewers expect.', 'concepts', 50],
    ['Load Balancing and CDNs', 'Layer 4 vs 7 balancing, consistent hashing, edge caching, and global traffic routing.', 'concepts', 45],
    ['Caching at Scale', 'Cache hierarchies, eviction, thundering herds, request coalescing, and CDN design.', 'concepts', 45],
    ['SQL vs NoSQL at Scale', 'Sharding, replication topologies, consistency models, and choosing the right store.', 'concepts', 50],
    ['Message Queues and Streaming', 'Kafka, RabbitMQ, SQS intuition, exactly-once effects, backpressure, and event sourcing.', 'concepts', 50],
    ['Designing a URL Shortener', 'Hashing vs counters, key generation service, redirects, analytics, and rate limits.', 'practice', 55],
    ['Designing a Social Feed', 'Fan-out on write vs read, timelines, ranking, caching feeds, and celebrity handling.', 'practice', 60],
    ['Designing a Chat System', 'WebSockets at scale, presence, message ordering, storage, and multi-device sync.', 'practice', 60],
  ]],
  ['Advanced Frontend', [
    ['Progressive Web Apps', 'Service workers, manifests, offline strategies, installability, and push notifications.', 'code', 50],
    ['Micro-frontends and Web Components', 'Module federation, custom elements, shadow DOM, and scaling teams on one page.', 'code', 50],
    ['Realtime UI with WebSockets', 'Live cursors, optimistic presence, reconnection, and scaling socket servers.', 'code', 45],
    ['WebAssembly Introduction', 'When WASM wins, Rust to WASM pipelines, JS interop, and performance case studies.', 'concepts', 45],
    ['Interaction Design and Animation', 'Springs, gestures, layout animation, accessibility-safe motion, and Framer Motion.', 'code', 40],
    ['Client State at Scale', 'Normalized caches, state machines, URL-as-state, and taming sprawling app state.', 'code', 45],
  ]],
  ['Testing and Delivery', [
    ['E2E Testing with Playwright', 'Reliable selectors, fixtures, visual regression, parallel shards, and flake triage.', 'code', 45],
    ['Contract and API Testing', 'Schema contracts, consumer-driven tests, Pact intuition, and breaking-change gates.', 'code', 40],
    ['Load Testing with k6', 'Virtual users, thresholds, soak tests, and finding the real bottleneck.', 'code', 40],
    ['Feature Flags and Progressive Delivery', 'Flags, canary releases, kill switches, experimentation, and safe rollouts.', 'concepts', 35],
  ]],
];

const aiModules: ModuleSeed[] = [
  ['Python and Data Foundations', [['Python for AI', 'Python syntax, functions, classes, typing, environments, packaging, and notebooks.', 'code', 45], ['NumPy and Vectorized Computing', 'Arrays, broadcasting, linear algebra operations, memory layout, and numerical performance.', 'code', 40], ['Pandas and Data Preparation', 'DataFrames, joins, missing values, reshaping, time series, and reproducible cleaning.', 'code', 45], ['SQL for Data Science', 'Analytics queries, window functions, cohort analysis, and feature extraction from databases.', 'code', 40], ['Data Visualization', 'Matplotlib, Seaborn, Plotly, visual encodings, dashboards, and honest charts.', 'code', 35], ['Web APIs and Scraping for Data', 'REST clients, pagination, rate limits, HTML parsing, and building datasets legally.', 'code', 40], ['Polars and Modern DataFrames', 'Lazy frames, query plans, out-of-core patterns, and 10x pandas workflows.', 'code', 35]]],
  ['Math and Statistics for ML', [['Linear Algebra for ML', 'Vectors, matrices, projections, decompositions, eigenvalues, and geometric intuition.', 'concepts', 50], ['Probability and Statistics', 'Distributions, expectation, conditional probability, Bayes, sampling, and confidence intervals.', 'concepts', 50], ['Calculus and Gradients', 'Derivatives, partial derivatives, chain rule, gradients, and optimization landscapes.', 'concepts', 45], ['Optimization', 'Gradient descent, convexity, learning rates, regularization, and constrained optimization.', 'concepts', 45], ['Information Theory', 'Entropy, cross-entropy, KL divergence, mutual information, and their ML applications.', 'concepts', 40]]],
  ['Classical Machine Learning', [['ML Problem Framing', 'Targets, features, leakage, baselines, metrics, splits, and choosing supervised or unsupervised learning.', 'concepts', 40], ['Regression and Classification', 'Linear and logistic regression, losses, regularization, calibration, and decision boundaries.', 'code', 50], ['Trees and Ensembles', 'Decision trees, random forests, gradient boosting, XGBoost, LightGBM, and feature importance.', 'code', 50], ['Unsupervised Learning', 'Clustering, PCA, dimensionality reduction, anomaly detection, and representation choices.', 'code', 45], ['Model Selection and Evaluation', 'Cross-validation, imbalanced data, precision-recall, ROC, uncertainty, and error analysis.', 'concepts', 50], ['Feature Engineering', 'Encoding, scaling, text features, temporal features, pipelines, and reproducible transformations.', 'code', 45], ['Recommender Systems Basics', 'Collaborative filtering, matrix factorization, ranking metrics, and cold-start strategies.', 'code', 50], ['Time Series Forecasting', 'Stationarity, ARIMA intuition, Prophet, deep forecasters, and backtesting discipline.', 'code', 45]]],
  ['Deep Learning', [['Neural Network Fundamentals', 'Perceptrons, activations, losses, backpropagation, initialization, and training loops.', 'code', 50], ['PyTorch', 'Tensors, autograd, modules, datasets, dataloaders, training, checkpoints, and GPU use.', 'code', 55], ['TensorFlow and Keras', 'Models, layers, tf.data, callbacks, distributed training, and serving workflows.', 'code', 50], ['CNNs and Computer Vision', 'Convolutions, pooling, augmentation, transfer learning, detection, and segmentation.', 'code', 55], ['Sequence Models', 'RNNs, LSTMs, GRUs, attention, sequence-to-sequence learning, and masking.', 'code', 50], ['Generative Models', 'Autoencoders, VAEs, GANs, diffusion intuition, sampling, and evaluation.', 'concepts', 55], ['Optimization for Deep Learning', 'Adam variants, schedulers, warmup, gradient clipping, weight decay done right.', 'concepts', 50], ['Normalization and Regularization', 'BatchNorm, LayerNorm, dropout, stochastic depth, augmentation, and early stopping.', 'concepts', 45]]],
  ['NLP and Language Models', [['NLP Foundations', 'Tokenization, normalization, n-grams, language modeling, embeddings, and evaluation.', 'code', 45], ['Transformers', 'Self-attention, positional encoding, encoder-decoder structure, masking, and scaling.', 'concepts', 55], ['Hugging Face Ecosystem', 'Datasets, tokenizers, Transformers, pipelines, Trainer, PEFT, and model hubs.', 'code', 50], ['Fine Tuning and Alignment', 'Instruction tuning, LoRA, QLoRA, preference optimization, evaluation, and safety.', 'code', 55], ['Prompt Engineering', 'Task decomposition, structured outputs, tool use, few-shot examples, and prompt testing.', 'code', 40], ['LLM Evaluation and Benchmarks', 'HELM, MMLU, human evals, LLM-as-judge, contamination, and building your own evals.', 'concepts', 45], ['Multilingual and Low-Resource NLP', 'Cross-lingual transfer, tokenization fertility, translation, and low-resource tactics.', 'concepts', 40]]],
  ['Generative AI Applications', [['Embeddings and Semantic Search', 'Embedding models, similarity, chunking, metadata, vector indexes, and retrieval quality.', 'code', 45], ['RAG Systems', 'Ingestion, hybrid retrieval, reranking, grounded generation, citations, and evaluation.', 'code', 55], ['AI Agents and Tool Use', 'Planning, state, tools, memory, graph workflows, guardrails, and human-in-the-loop design.', 'code', 55], ['Multimodal AI', 'Vision-language models, image understanding, speech, OCR, and multimodal pipelines.', 'concepts', 45], ['LLM Application Engineering', 'Streaming, structured generation, caching, rate limits, observability, and cost control.', 'code', 50], ['Structured Data Extraction', 'Schemas, constrained decoding, document pipelines, validation, and human review loops.', 'code', 45], ['AI Red Teaming', 'Prompt injection, jailbreak taxonomies, adversarial evals, and defense in depth.', 'concepts', 45]]],
  ['MLOps and Production AI', [['Experiment Tracking', 'Reproducibility, MLflow, Weights and Biases, artifacts, runs, and comparison workflows.', 'code', 40], ['Data and Model Versioning', 'DVC, dataset lineage, feature stores, model registries, and reproducible builds.', 'concepts', 40], ['Serving Models', 'FastAPI, TorchServe, Triton, batch inference, streaming inference, and API contracts.', 'code', 50], ['Docker and Cloud GPUs', 'Containers, CUDA, GPU scheduling, autoscaling, cost planning, and managed platforms.', 'concepts', 45], ['Monitoring and Responsible AI', 'Drift, data quality, bias, explainability, privacy, red-teaming, and incident response.', 'concepts', 50], ['End-to-End ML Projects', 'Turn a business question into a deployed, maintainable ML product.', 'practice', 60], ['Inference Optimization', 'Quantization, distillation, vLLM, batching, KV-cache, and latency budgeting.', 'code', 50], ['Feature Stores in Production', 'Online/offline consistency, point-in-time correctness, and Feast/Tecton patterns.', 'concepts', 45]]],
  ['Computer Vision in Depth', [
    ['Object Detection with YOLO', 'Anchors, NMS, mAP, training detectors, and deploying real-time vision.', 'code', 55],
    ['Semantic Segmentation', 'U-Net, DeepLab, mask losses, and pixel-perfect evaluation.', 'code', 55],
    ['Vision Transformers', 'Patch embeddings, DeiT training, hybrid CNN-ViT, and when transformers win.', 'concepts', 50],
    ['Diffusion Models in Practice', 'Forward/reverse processes, Stable Diffusion, ControlNet, LoRA styles, and evals.', 'code', 55],
    ['Video Understanding', 'Temporal modeling, action recognition, tracking, and video-language models.', 'concepts', 45],
  ]],
  ['Reinforcement Learning', [
    ['MDPs and Dynamic Programming', 'States, actions, rewards, Bellman equations, and policy/value iteration.', 'concepts', 50],
    ['Q-Learning and DQN', 'Temporal difference, experience replay, target networks, and Atari breakthroughs.', 'code', 55],
    ['Policy Gradients', 'REINFORCE, baselines, actor-critic, PPO, and stable policy optimization.', 'code', 55],
    ['RLHF and Preference Learning', 'Reward models, DPO, constitutional AI, and aligning LLMs with feedback.', 'concepts', 50],
  ]],
  ['ML System Design', [
    ['Designing ML Systems', 'Requirements, framing, offline/online splits, and the ML design rubric.', 'concepts', 50],
    ['Training Pipelines at Scale', 'Data loaders, distributed training, checkpointing, spot resilience, and orchestration.', 'concepts', 50],
    ['Candidate Generation and Ranking', 'Two-tower retrieval, cascade ranking, calibration, and exploration.', 'concepts', 50],
    ['Inference at Scale', 'Batching, caching, autoscaling, edge deployment, and SLO-driven serving.', 'concepts', 50],
    ['Monitoring and Feedback Loops', 'Label delay, bandits, drift response, and closing the loop safely.', 'concepts', 45],
  ]],
  ['AI Career Accelerator', [
    ['ML Interview Playbook', 'ML coding, theory, system design, and research-taste rounds with rubrics.', 'practice', 45],
    ['Kaggle Grandmaster Workflows', 'Validation design, ensembling, leakage hunting, and efficient experimentation.', 'practice', 50],
    ['Reading Papers Effectively', 'Three-pass method, reproducing results, and building on state of the art.', 'practice', 35],
    ['Building an AI Portfolio', 'Flagship projects, demos, write-ups, and proof that gets interviews.', 'practice', 40],
  ]],
];

export const catalogs: Record<CurriculumGoal, CurriculumTopic[]> = {
  'gate-cs': build('gate-cs', gateModules),
  'web-dev': build('web-dev', fullStackModules),
  'ai-ml': build('ai-ml', aiModules),
};

export function getCatalog(goal: string): CurriculumTopic[] { return catalogs[goal as CurriculumGoal] || catalogs['gate-cs']; }
export function getTopic(topicId: string) { return Object.values(catalogs).flat().find((topic) => topic.id === topicId); }
export const catalogCounts = Object.fromEntries(Object.entries(catalogs).map(([goal, topics]) => [goal, topics.length]));
