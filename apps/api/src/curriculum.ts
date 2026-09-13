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
    ['Sets Relations and Functions', 'Sets, relations, equivalence, partial orders, functions, cardinality, and proof techniques used across CS.', 'concepts', 45],
    ['Propositional and Predicate Logic', 'Connectives, quantifiers, validity, satisfiability, inference rules, and translating statements to logic.', 'concepts', 45],
    ['Combinatorics and Counting', 'Permutations, combinations, pigeonhole, inclusion-exclusion, recurrence-based counting, and generating function intuition.', 'concepts', 50],
    ['Graph Theory', 'Paths, connectivity, trees, planar graphs, coloring, matching, Euler/Hamilton ideas, and graph representations.', 'concepts', 50],
    ['Linear Algebra', 'Vectors, matrices, systems of equations, rank, eigenvalues, diagonalization, and transformations used in computing.', 'concepts', 50],
    ['Calculus and Optimization', 'Limits, continuity, derivatives, integration, maxima/minima, and the optimization ideas behind algorithms.', 'concepts', 45],
    ['Probability', 'Sample spaces, conditional probability, independence, Bayes theorem, and random variables with standard distributions.', 'concepts', 50],
    ['Statistics and Estimation', 'Expectation, variance, moments, limit theorems, sampling, estimation, and hypothesis-testing intuition.', 'concepts', 45],
    ['Numerical Methods', 'Root finding, interpolation, numerical integration, solving linear systems, and error analysis.', 'concepts', 45],
  ]],
  ['Digital Logic', [
    ['Number Systems and Codes', 'Binary, octal, hex, signed representations, complements, BCD, Gray code, and conversions.', 'concepts'],
    ['Boolean Algebra and Logic Gates', 'Axioms, theorems, duality, gate universality, and simplifying Boolean expressions from first principles.', 'concepts'],
    ['Karnaugh Maps and Minimization', 'K-map grouping, don’t-cares, SOP/POS forms, and Quine-McCluskey intuition.', 'concepts', 40],
    ['Combinational Circuits', 'Adders, subtractors, comparators, multiplexers, decoders, encoders, and arithmetic circuit design.', 'concepts', 45],
    ['Sequential Circuits', 'Latches, flip-flops, excitation tables, timing, race conditions, and finite-state memory elements.', 'concepts', 45],
    ['Registers Counters and FSM Design', 'Shift registers, counter types, Mealy/Moore machines, state diagrams, and state reduction.', 'concepts', 45],
    ['Computer Arithmetic', 'Fixed and floating point, IEEE 754, overflow, multiplication algorithms, and ALU operations.', 'concepts', 40],
  ]],
  ['Computer Organization and Architecture', [
    ['Instruction Set Architecture', 'Instructions, addressing modes, registers, assembly-level execution, CISC vs RISC, and datapaths.', 'concepts', 45],
    ['CPU Datapath and Control', 'Single-cycle and multi-cycle processors, hardwired vs microprogrammed control, and datapath sizing.', 'concepts', 55],
    ['Pipelining and Hazards', 'Pipeline speedup, structural/data/control hazards, forwarding, stalls, branch prediction, and Amdahl’s law.', 'concepts', 55],
    ['Memory Hierarchy and Cache', 'Locality, cache mapping, replacement, write policies, multi-level caches, and performance calculation.', 'concepts', 50],
    ['Virtual Memory and Address Translation', 'Paging, TLBs, page tables, segmentation, replacement, and the hardware of virtual addresses.', 'concepts', 50],
    ['Input Output and DMA', 'Interrupts, programmed I/O, DMA, buses, I/O mapped vs memory mapped, and device communication.', 'concepts', 40],
    ['Performance Analysis', 'CPI, MIPS, MFLOPS, benchmarks, and quantitative comparison of architectures.', 'concepts', 40],
  ]],
  ['Programming and Data Structures', [
    ['C Programming Fundamentals', 'Types, operators, control flow, functions, storage classes, and reading C like an examiner.', 'code', 45],
    ['Pointers Arrays and Memory', 'Pointer arithmetic, arrays, strings, stack vs heap, and the classic pointer traps in GATE questions.', 'code', 50],
    ['Structs Unions and Dynamic Allocation', 'Structures, unions, bit fields, malloc/free patterns, and memory layout questions.', 'code', 45],
    ['Recursion', 'Call stacks, recursion trees, tail recursion, tracing outputs, and converting recursion to iteration.', 'code', 45],
    ['Stacks Queues and Linked Lists', 'Implement linear data structures, reason about operations and invariants, and solve application problems.', 'code', 50],
    ['Trees and Binary Search Trees', 'Binary trees, BSTs, AVL intuition, traversals, expressions trees, and height/count properties.', 'code', 50],
    ['Heaps and Priority Queues', 'Binary heaps, heapify, insertion/deletion cost, heap sort, and priority-queue applications.', 'code', 40],
    ['Hashing', 'Hash functions, collision strategies, load factor, maps, sets, and expected-time analysis.', 'code', 40],
  ]],
  ['Algorithms', [
    ['Time and Space Complexity', 'Analyze growth rates with O, Ω, Θ, recurrences, amortized cost, and trade-offs.', 'code', 45],
    ['Searching and Sorting', 'Linear and binary search plus insertion, merge, quick, heap, radix, and counting sort.', 'code', 50],
    ['Divide and Conquer', 'Design recurrences and solve them using substitution, recursion trees, and Master theorem.', 'code', 50],
    ['Greedy Algorithms', 'Exchange arguments, matroids intuition, scheduling, Huffman coding, and minimum spanning trees.', 'code', 50],
    ['Dynamic Programming', 'State design, transitions, memoization, tabulation, and classic optimization problems.', 'code', 60],
    ['Backtracking and Branch and Bound', 'Search trees, pruning strategies, N-queens, subset problems, and bounding functions.', 'code', 45],
    ['Graph Algorithms', 'BFS, DFS, topological sort, shortest paths, connectivity, MST, and flow fundamentals.', 'code', 60],
    ['String Algorithms', 'Pattern matching, tries, prefix functions, hashing, and suffix-based techniques.', 'code', 50],
    ['Asymptotic Analysis Practice', 'Ordering functions, tight bounds, recurrence traps, and the complexity questions GATE loves.', 'practice', 40],
  ]],
  ['Theory of Computation', [
    ['Regular Languages and Finite Automata', 'DFA, NFA, regular expressions, closure properties, and minimization.', 'concepts', 50],
    ['Pumping Lemmas and Language Proofs', 'Proving non-regularity and non-context-freeness, adversary arguments, and standard proof templates.', 'concepts', 45],
    ['Context Free Grammars and Pushdown Automata', 'CFG derivations, parse trees, ambiguity, normal forms, and PDA equivalence.', 'concepts', 55],
    ['Turing Machines and Decidability', 'Machine models, recursive languages, reductions, decidable and recognizable problems.', 'concepts', 55],
    ['Complexity Classes', 'P, NP, co-NP, reductions, completeness, and the limits of efficient computation.', 'concepts', 55],
  ]],
  ['Compiler Design', [
    ['The Compilation Pipeline', 'Phases of a compiler, interpreters vs compilers, and how the stages connect end to end.', 'concepts', 35],
    ['Lexical Analysis', 'Tokens, regular expressions, finite automata, scanners, and lexical errors.', 'concepts', 40],
    ['Parsing and Grammars', 'Top-down and bottom-up parsing, FIRST/FOLLOW, LL, LR, and parse table construction.', 'concepts', 55],
    ['Syntax Directed Translation', 'Semantic analysis, attributes, type checking, and intermediate representations.', 'concepts', 45],
    ['Runtime Environments and Optimization', 'Symbol tables, activation records, code generation, data flow, and optimization.', 'concepts', 50],
  ]],
  ['Operating Systems', [
    ['Processes and Threads', 'Process states, context switches, threads, IPC, and process coordination.', 'concepts', 50],
    ['System Calls and Kernel Interfaces', 'User vs kernel mode, system call flow, shells, and how programs talk to the OS.', 'concepts', 40],
    ['CPU Scheduling', 'FCFS, SJF, priority, round robin, response time, throughput, and scheduling trade-offs.', 'concepts', 45],
    ['Synchronization and Deadlocks', 'Critical sections, semaphores, monitors, races, deadlock conditions, and recovery.', 'concepts', 55],
    ['Memory Management', 'Paging, segmentation, page tables, TLBs, virtual memory, thrashing, and page replacement.', 'concepts', 55],
    ['File Systems and Storage', 'Files, directories, allocation, inodes, disk scheduling, journaling, and RAID.', 'concepts', 50],
  ]],
  ['Database Management Systems', [
    ['ER Modeling and Relational Algebra', 'Model requirements, keys, constraints, relational operations, and query foundations.', 'concepts', 45],
    ['ER to Relational Mapping', 'Convert ER diagrams to schemas, handle weak entities and multi-valued attributes, and spot design errors.', 'concepts', 40],
    ['SQL and Query Processing', 'Write joins, aggregation, subqueries, views, and understand how queries are processed.', 'code', 50],
    ['Functional Dependencies and Normalization', 'Compute closures, candidate keys, normal forms, lossless decomposition, and dependency preservation.', 'concepts', 55],
    ['Indexing and B Plus Trees', 'Primary/secondary indexes, B+ tree structure, insertions, and cost estimation of indexed lookups.', 'concepts', 50],
    ['Transactions and Concurrency', 'ACID, schedules, serializability, locking, timestamps, recovery, and logging.', 'concepts', 55],
    ['Query Optimization and Execution Plans', 'Join ordering, cost models, plan reading, and optimization heuristics.', 'concepts', 45],
    ['Distributed Databases', 'Replication, partitioning, distributed transactions, consistency, and CAP trade-offs.', 'concepts', 50],
  ]],
  ['Computer Networks', [
    ['OSI and TCP IP Models', 'Layering, encapsulation, addressing, protocols, and how data crosses a network.', 'concepts', 40],
    ['Data Link and LANs', 'Framing, error detection, Ethernet, switching, ARP, VLANs, and MAC learning.', 'concepts', 45],
    ['IP Addressing and Subnetting', 'IPv4, IPv6, CIDR, subnetting numericals, NAT, and routing table lookups.', 'concepts', 50],
    ['Routing Protocols', 'Distance vector, link state, RIP, OSPF, BGP intuition, and routing convergence.', 'concepts', 45],
    ['Transport Layer', 'UDP, TCP, reliability, flow control, congestion control, connection lifecycle, and QUIC context.', 'concepts', 55],
    ['Application Protocols', 'DNS, HTTP, SMTP, sockets, proxies, and the protocols that power the web.', 'concepts', 45],
    ['Network Security and Cryptography Basics', 'Symmetric/asymmetric encryption, hashes, digital signatures, authentication, and TLS intuition.', 'concepts', 50],
  ]],
  ['General Aptitude and GATE Strategy', [
    ['Quantitative Aptitude', 'Percentages, ratios, averages, time-speed-distance, data interpretation, and numerical shortcuts.', 'practice', 40],
    ['Verbal Aptitude', 'Reading comprehension, grammar, sentence completion, vocabulary, and logical language questions.', 'practice', 35],
    ['Logical Reasoning and Data Interpretation', 'Series, syllogisms, puzzles, charts, tables, and structured reasoning drills.', 'practice', 40],
    ['Spatial and Analytical Aptitude', 'Visual reasoning, arrangement problems, and the newer analytical question styles.', 'practice', 35],
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
    ['Full Mock Debrief Method', 'How to dissect a full mock: error taxonomy, time audits, and turning analysis into the next week’s plan.', 'practice', 35],
  ]],
];

const fullStackModules: ModuleSeed[] = [
  ['Engineering Foundations', [
    ['Git and GitHub Workflow', 'Commits, branches, rebasing, pull requests, conflicts, and collaborative workflows that teams actually use.', 'code', 40],
    ['Terminal Shell and Tooling', 'Navigating the shell, environment variables, pipes, SSH, and configuring a fast development machine.', 'code', 35],
    ['Package Managers and Dependency Hygiene', 'npm workspaces, lockfiles, semantic versioning, audits, and keeping dependencies healthy.', 'code', 35],
  ]],
  ['Web Foundations', [
    ['How the Web Works', 'Browsers, servers, DNS, HTTP, URLs, rendering, and the request-response lifecycle.', 'concepts'],
    ['HTML Semantics and Accessibility', 'Semantic structure, forms, landmarks, ARIA, keyboard navigation, and accessible content.', 'code'],
    ['CSS Layout and Responsive Design', 'Cascade, specificity, Flexbox, Grid, responsive breakpoints, container queries, and modern units.', 'code', 45],
    ['CSS Architecture and Motion', 'Design tokens, component styles, animations, transitions, and maintainable CSS systems.', 'code'],
    ['Forms Validation and UX States', 'Native validation, error messaging, loading and empty states, and forms people enjoy using.', 'code', 40],
    ['SEO Metadata and Structured Data', 'Crawlability, semantic markup, Open Graph, JSON-LD, and honest performance-friendly SEO.', 'concepts', 35],
    ['Browser DevTools Mastery', 'Inspect, debug, profile, and audit any web app with Elements, Network, Performance, and Lighthouse.', 'code', 40],
    ['Web Performance Fundamentals', 'Critical rendering path, resource hints, lazy loading, bundling, and Core Web Vitals budgets.', 'concepts', 45],
  ]],
  ['JavaScript and TypeScript', [
    ['Modern JavaScript', 'Scopes, closures, objects, prototypes, modules, destructuring, and modern syntax.', 'code', 50],
    ['Async JavaScript and the Event Loop', 'Promises, async/await, tasks, microtasks, cancellation, retries, and concurrency patterns.', 'code', 45],
    ['Browser APIs and Performance', 'DOM, events, storage, workers, networking, profiling, and Core Web Vitals.', 'code', 45],
    ['Modules Bundlers and Build Tools', 'ESM vs CJS, Vite, esbuild, tree shaking, code splitting, and configuring modern builds.', 'code', 45],
    ['TypeScript Deep Dive', 'Types, generics, narrowing, utility types, modules, declaration files, and strict projects.', 'code', 50],
    ['Testing JavaScript Applications', 'Unit, integration, component, end-to-end, mocks, fixtures, and test-driven workflows.', 'code', 40],
    ['Functional Programming in JavaScript', 'Pure functions, immutability, map/filter/reduce, currying, composition, and functors intuition.', 'code', 45],
    ['Design Patterns in JavaScript', 'Module, observer, factory, singleton, strategy, and middleware patterns in real codebases.', 'code', 45],
    ['JavaScript Memory and Garbage Collection', 'Heaps, references, leaks, weak maps, profiling memory, and keeping apps light.', 'concepts', 40],
  ]],
  ['Design for Engineers', [
    ['Visual Hierarchy and Layout', 'Spacing scales, alignment, grouping, and layout decisions that make interfaces feel professional.', 'concepts', 35],
    ['Typography and Color Systems', 'Type scales, contrast, accessible palettes, dark mode, and tokenizing design decisions.', 'concepts', 35],
    ['Figma to Code Fluency', 'Read design files, extract specs, negotiate constraints, and hand off cleanly.', 'practice', 35],
    ['Interaction Design and Motion', 'Springs, gestures, layout animation, accessibility-safe motion, and when animation earns its keep.', 'code', 40],
  ]],
  ['React Ecosystem', [
    ['React Fundamentals', 'Components, props, state, effects, refs, controlled inputs, and rendering behavior.', 'code', 45],
    ['React Architecture', 'Composition, custom hooks, context, server state, error boundaries, and feature boundaries.', 'code', 50],
    ['React Forms and Validation Libraries', 'React Hook Form, Zod schemas, async validation, and accessible form feedback.', 'code', 40],
    ['Next.js', 'App Router, layouts, server components, server actions, metadata, caching, and deployment.', 'code', 55],
    ['State and Data Libraries', 'TanStack Query, Redux Toolkit, Zustand, URL state, optimistic updates, and cache invalidation.', 'code', 45],
    ['UI Systems and Design Engineering', 'Tailwind, shadcn/ui, Radix, component APIs, tokens, theming, and visual QA.', 'code', 40],
    ['Advanced React Patterns', 'Compound components, render props, headless UI, portals, and polymorphic component APIs.', 'code', 50],
    ['React Performance Optimization', 'Memoization, virtualization, code splitting, suspense boundaries, and render profiling.', 'code', 45],
  ]],
  ['Backend with Node.js', [
    ['Node.js Runtime', 'Modules, streams, buffers, event emitters, workers, filesystem, and process lifecycle.', 'code', 45],
    ['Express and Fastify', 'Routing, middleware, validation, error handling, logging, and production API structure.', 'code', 45],
    ['REST and GraphQL APIs', 'Resource modeling, pagination, filtering, versioning, GraphQL schemas, resolvers, and federation.', 'code', 50],
    ['Authentication and Authorization', 'Sessions, JWT, OAuth, cookies, RBAC, ABAC, CSRF, password security, and identity providers.', 'code', 55],
    ['Realtime and Background Jobs', 'WebSockets, SSE, queues, workers, scheduling, retries, idempotency, and event-driven design.', 'code', 50],
    ['File Uploads Streams and Object Storage', 'Multipart uploads, signed URLs, S3-compatible storage, resumable transfers, and image pipelines.', 'code', 45],
    ['API Security in Practice', 'Rate limiting, input validation, auth scoping, injection defense, SSRF guards, and security headers.', 'code', 50],
    ['Caching Strategies for APIs', 'HTTP caching, ETags, CDN behavior, Redis caching layers, and invalidation design.', 'code', 45],
  ]],
  ['Data and Persistence', [
    ['SQL and PostgreSQL', 'Relational modeling, joins, indexes, constraints, transactions, and query performance.', 'code', 50],
    ['MongoDB and Document Data', 'Document modeling, indexes, aggregation, transactions, and schema evolution.', 'code', 40],
    ['ORMs and Query Builders', 'Prisma, Drizzle, TypeORM, migrations, relations, generated types, and N+1 prevention.', 'code', 45],
    ['Redis and Caching', 'Cache-aside, invalidation, sessions, rate limits, pub-sub, streams, and distributed locks.', 'code', 40],
    ['Search and Vector Databases', 'Full-text search, embeddings, Qdrant, pgvector, retrieval, and hybrid search.', 'code', 45],
    ['Database Transactions and Isolation', 'ACID, isolation levels, phantom reads, deadlocks, optimistic locking, and retry design.', 'concepts', 45],
    ['Data Migration Strategies', 'Zero-downtime migrations, backfills, expand-contract, versioned schemas, and rollback plans.', 'concepts', 40],
  ]],
  ['Production Engineering', [
    ['Docker and Containers', 'Images, layers, volumes, networking, Compose, multi-stage builds, and security.', 'code', 45],
    ['Cloud Deployment', 'Render, Vercel, AWS, serverless, managed databases, secrets, domains, and environments.', 'concepts', 50],
    ['CI CD and Release Engineering', 'GitHub Actions, checks, preview environments, migrations, rollbacks, and release safety.', 'concepts', 45],
    ['Observability and Reliability', 'Structured logs, metrics, traces, health checks, alerts, SLOs, and incident response.', 'concepts', 45],
    ['Web Security', 'OWASP risks, input validation, XSS, SQL injection, CSP, SSRF, supply chain, and threat modeling.', 'concepts', 55],
    ['Performance and Scaling', 'Caching, queues, CDN, database tuning, load testing, horizontal scaling, and bottleneck analysis.', 'concepts', 50],
    ['Incident Management and Postmortems', 'On-call rotations, severity levels, blameless postmortems, runbooks, and reliability culture.', 'concepts', 40],
    ['Cloud Cost Optimization', 'Right-sizing, autoscaling policies, storage tiers, caching economics, and cost alerts.', 'concepts', 35],
  ]],
  ['System Design', [
    ['System Design Fundamentals', 'Requirements, capacity estimation, trade-offs, and the framework interviewers expect.', 'concepts', 50],
    ['Load Balancing and CDNs', 'Layer 4 vs 7 balancing, consistent hashing, edge caching, and global traffic routing.', 'concepts', 45],
    ['Caching at Scale', 'Cache hierarchies, eviction, thundering herds, request coalescing, and CDN design.', 'concepts', 45],
    ['SQL vs NoSQL at Scale', 'Sharding, replication topologies, consistency models, and choosing the right store.', 'concepts', 50],
    ['Message Queues and Streaming', 'Kafka, RabbitMQ, SQS intuition, exactly-once effects, backpressure, and event sourcing.', 'concepts', 50],
    ['Designing a URL Shortener', 'Hashing vs counters, key generation service, redirects, analytics, and rate limits.', 'practice', 55],
    ['Designing a Social Feed', 'Fan-out on write vs read, timelines, ranking, caching feeds, and celebrity handling.', 'practice', 60],
    ['Designing a Chat System', 'WebSockets at scale, presence, message ordering, storage, and multi-device sync.', 'practice', 60],
    ['Designing a Notification System', 'Delivery guarantees, fan-out, rate shaping, templating, retries, and user preferences.', 'practice', 55],
    ['Designing a Rate Limiter', 'Token bucket, sliding window, distributed counters, headers, and fair degradation.', 'practice', 45],
  ]],
  ['Advanced Frontend', [
    ['Progressive Web Apps', 'Service workers, manifests, offline strategies, installability, and push notifications.', 'code', 50],
    ['Micro-frontends and Web Components', 'Module federation, custom elements, shadow DOM, and scaling teams on one page.', 'code', 50],
    ['Realtime UI with WebSockets', 'Live cursors, optimistic presence, reconnection, and scaling socket servers.', 'code', 45],
    ['WebAssembly Introduction', 'When WASM wins, Rust to WASM pipelines, JS interop, and performance case studies.', 'concepts', 45],
    ['Accessibility Auditing in Practice', 'Screen reader flows, focus management, automated audits, and fixing the issues that matter.', 'practice', 40],
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
  ['Python and Data Foundations', [
    ['Python for AI', 'Python syntax, functions, classes, typing, environments, packaging, and notebooks.', 'code', 45],
    ['NumPy and Vectorized Computing', 'Arrays, broadcasting, linear algebra operations, memory layout, and numerical performance.', 'code', 40],
    ['Pandas and Data Preparation', 'DataFrames, joins, missing values, reshaping, time series, and reproducible cleaning.', 'code', 45],
    ['SQL for Data Science', 'Analytics queries, window functions, cohort analysis, and feature extraction from databases.', 'code', 40],
    ['Data Visualization', 'Matplotlib, Seaborn, Plotly, visual encodings, dashboards, and honest charts.', 'code', 35],
    ['Web APIs and Scraping for Data', 'REST clients, pagination, rate limits, HTML parsing, and building datasets legally.', 'code', 40],
    ['Polars and Modern DataFrames', 'Lazy frames, query plans, out-of-core patterns, and 10x pandas workflows.', 'code', 35],
  ]],
  ['Data Engineering Essentials', [
    ['Data Pipelines and Orchestration', 'Batch vs streaming, DAGs, scheduling, retries, and pipeline observability.', 'concepts', 45],
    ['Data Quality and Validation', 'Schema contracts, drift checks, anomaly flags, and testing data like code.', 'code', 40],
    ['Labeling and Human Feedback Loops', 'Annotation workflows, inter-rater agreement, active learning, and quality control.', 'concepts', 40],
    ['Data Lakes Warehouses and Lakehouses', 'Storage layers, parquet, partitioning, catalogs, and choosing architectures.', 'concepts', 45],
  ]],
  ['Math and Statistics for ML', [
    ['Linear Algebra for ML', 'Vectors, matrices, projections, decompositions, eigenvalues, and geometric intuition.', 'concepts', 50],
    ['Probability and Statistics', 'Distributions, expectation, conditional probability, Bayes, sampling, and confidence intervals.', 'concepts', 50],
    ['Calculus and Gradients', 'Derivatives, partial derivatives, chain rule, gradients, and optimization landscapes.', 'concepts', 45],
    ['Optimization', 'Gradient descent, convexity, learning rates, regularization, and constrained optimization.', 'concepts', 45],
    ['Information Theory', 'Entropy, cross-entropy, KL divergence, mutual information, and their ML applications.', 'concepts', 40],
  ]],
  ['Classical Machine Learning', [
    ['ML Problem Framing', 'Targets, features, leakage, baselines, metrics, splits, and choosing supervised or unsupervised learning.', 'concepts', 40],
    ['Regression and Classification', 'Linear and logistic regression, losses, regularization, calibration, and decision boundaries.', 'code', 50],
    ['Trees and Ensembles', 'Decision trees, random forests, gradient boosting, XGBoost, LightGBM, and feature importance.', 'code', 50],
    ['Unsupervised Learning', 'Clustering, PCA, dimensionality reduction, anomaly detection, and representation choices.', 'code', 45],
    ['Model Selection and Evaluation', 'Cross-validation, imbalanced data, precision-recall, ROC, uncertainty, and error analysis.', 'concepts', 50],
    ['Feature Engineering', 'Encoding, scaling, text features, temporal features, pipelines, and reproducible transformations.', 'code', 45],
    ['Recommender Systems Basics', 'Collaborative filtering, matrix factorization, ranking metrics, and cold-start strategies.', 'code', 50],
    ['Time Series Forecasting', 'Stationarity, ARIMA intuition, Prophet, deep forecasters, and backtesting discipline.', 'code', 45],
  ]],
  ['Deep Learning', [
    ['Neural Network Fundamentals', 'Perceptrons, activations, losses, backpropagation, initialization, and training loops.', 'code', 50],
    ['PyTorch', 'Tensors, autograd, modules, datasets, dataloaders, training, checkpoints, and GPU use.', 'code', 55],
    ['TensorFlow and Keras', 'Models, layers, tf.data, callbacks, distributed training, and serving workflows.', 'code', 50],
    ['CNNs and Computer Vision', 'Convolutions, pooling, augmentation, transfer learning, detection, and segmentation.', 'code', 55],
    ['Sequence Models', 'RNNs, LSTMs, GRUs, attention, sequence-to-sequence learning, and masking.', 'code', 50],
    ['Generative Models', 'Autoencoders, VAEs, GANs, diffusion intuition, sampling, and evaluation.', 'concepts', 55],
    ['Optimization for Deep Learning', 'Adam variants, schedulers, warmup, gradient clipping, weight decay done right.', 'concepts', 50],
    ['Normalization and Regularization', 'BatchNorm, LayerNorm, dropout, stochastic depth, augmentation, and early stopping.', 'concepts', 45],
    ['Mixed Precision and Distributed Training', 'FP16/BF16 training, gradient scaling, data parallelism, sharding, and multi-GPU debugging.', 'code', 50],
  ]],
  ['NLP and Language Models', [
    ['NLP Foundations', 'Tokenization, normalization, n-grams, language modeling, embeddings, and evaluation.', 'code', 45],
    ['Transformers', 'Self-attention, positional encoding, encoder-decoder structure, masking, and scaling.', 'concepts', 55],
    ['Hugging Face Ecosystem', 'Datasets, tokenizers, Transformers, pipelines, Trainer, PEFT, and model hubs.', 'code', 50],
    ['Fine Tuning and Alignment', 'Instruction tuning, LoRA, QLoRA, preference optimization, evaluation, and safety.', 'code', 55],
    ['Prompt Engineering', 'Task decomposition, structured outputs, tool use, few-shot examples, and prompt testing.', 'code', 40],
    ['LLM Evaluation and Benchmarks', 'HELM, MMLU, human evals, LLM-as-judge, contamination, and building your own evals.', 'concepts', 45],
    ['Multilingual and Low-Resource NLP', 'Cross-lingual transfer, tokenization fertility, translation, and low-resource tactics.', 'concepts', 40],
    ['Speech and Audio AI', 'ASR pipelines, TTS, audio features, speaker systems, and voice product patterns.', 'concepts', 45],
  ]],
  ['Generative AI Applications', [
    ['Embeddings and Semantic Search', 'Embedding models, similarity, chunking, metadata, vector indexes, and retrieval quality.', 'code', 45],
    ['RAG Systems', 'Ingestion, hybrid retrieval, reranking, grounded generation, citations, and evaluation.', 'code', 55],
    ['AI Agents and Tool Use', 'Planning, state, tools, memory, graph workflows, guardrails, and human-in-the-loop design.', 'code', 55],
    ['Multimodal AI', 'Vision-language models, image understanding, speech, OCR, and multimodal pipelines.', 'concepts', 45],
    ['LLM Application Engineering', 'Streaming, structured generation, caching, rate limits, observability, and cost control.', 'code', 50],
    ['Structured Data Extraction', 'Schemas, constrained decoding, document pipelines, validation, and human review loops.', 'code', 45],
    ['AI Red Teaming', 'Prompt injection, jailbreak taxonomies, adversarial evals, and defense in depth.', 'concepts', 45],
  ]],
  ['MLOps and Production AI', [
    ['Experiment Tracking', 'Reproducibility, MLflow, Weights and Biases, artifacts, runs, and comparison workflows.', 'code', 40],
    ['Data and Model Versioning', 'DVC, dataset lineage, feature stores, model registries, and reproducible builds.', 'concepts', 40],
    ['Serving Models', 'FastAPI, TorchServe, Triton, batch inference, streaming inference, and API contracts.', 'code', 50],
    ['Docker and Cloud GPUs', 'Containers, CUDA, GPU scheduling, autoscaling, cost planning, and managed platforms.', 'concepts', 45],
    ['Monitoring and Responsible AI', 'Drift, data quality, bias, explainability, privacy, red-teaming, and incident response.', 'concepts', 50],
    ['Interpretability and Explainability', 'Attribution methods, probing, mechanistic intuition, and honest model audits.', 'concepts', 45],
    ['Inference Optimization', 'Quantization, distillation, vLLM, batching, KV-cache, and latency budgeting.', 'code', 50],
    ['Feature Stores in Production', 'Online/offline consistency, point-in-time correctness, and Feast/Tecton patterns.', 'concepts', 45],
    ['End-to-End ML Projects', 'Turn a business question into a deployed, maintainable ML product.', 'practice', 60],
  ]],
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
