import type { TopicLesson } from "../topicLessons.js"; /** * Testing and Delivery — 5 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const testingAndDelivery: Record<string, TopicLesson> = {
  "web-dev-testing-and-delivery-e2e-testing-with-playwright": {
    intro: `End-to-end testing with Playwright proves your whole product works as a user experiences it — real browser, real clicks, real assertions on what the page shows. The subject is writing E2E that catches regressions without being flaky or slow: reliable selectors, fixtures, parallel shards, network control, visual regression, and the triage discipline for when tests go red in CI. E2E is your last line of defense — keep it few, meaningful, and deterministic.`,
    foundations: `Playwright: auto-wait (actionability checks built in — no manual sleep), test runner, codegen (record interactions), trace viewer (post-failure replay), parallel by default across workers; browsers Chromium/Firefox/WebKit; selectors: getByRole is preferred (accessible, stable), getByTestId for semantic gaps, CSS for structure only. Network mocking: route() to stub or intercept requests — hermetic tests without backend. Fixtures: test-scoped resources (accounts, seed data). Config: playwright.config with projects per browser/device, baseURL, retries on CI only, shard count vs machine cores. CI: headless, artifacts on failure (trace, screenshots), sharded across runners.`,
    concepts: [
      {
        title: "Selectors that survive redesigns.",
        body: `getByRole('button', { name: /add to cart/i }) — mirrors what assistive tech sees; breaks only when behavior breaks (good signal); chain: getByRole('row', { name: /alice/i }).getByRole('button', { name: /edit/i }); getByLabel for form fields; getByTestId as sanctioned escape hatch for elements without accessible roles (charts, canvas wrappers) — add testid attributes deliberately in the design system; avoid brittle CSS/XPath (refactor-proofing is a lie); prefer text content over class names; strict mode fails on ambiguous matches — disambiguate explicitly, don't .first() blindly.`,
      },
      {
        title: "Auto-waiting and eliminating flakiness.",
        body: `Playwright asserts actionability (visible, stable, enabled, receives events) before click/fill — most "flaky" tests are actually assertions written before the UI settled; the fix is to let expect() poll (toBeVisible, toHaveText with default timeout) rather than sleep or immediate checks. Flakiness root causes: shared state between tests (login once via storageState, seed per test data), animations mid-assert (prefers-reduced-motion in CI config), clocks/timezones, network timing (mock with route() for determinism), test isolation — each test independent: fresh context, seeded data, no order dependence; quarantine flaky tests, track, fix — never retry-as-policy beyond CI retries: 2 for infra noise only.`,
      },
      {
        title: "Fixtures, auth state, and seed data.",
        body: `Global setup: one login per browser project saved to storageState.json (cookies + localStorage) — tests start authenticated in milliseconds; per-test data via API helpers (prisma seed or HTTP seed endpoints): create tenant/product/user before test, delete after (transaction or cascade); never rely on shared dev database rows; parallel-safe: unique suffixes per test run; fixtures compose (test.extend({ seededOrder })) — a fixture like any other resource with setup/teardown guarantees; cleanup mandatory or CI accumulates zombie data.`,
      },
      {
        title: "Network control and hermetic tests.",
        body: `page.route('**/api/products', ...) fulfills with fixture JSON — suite runs without backend: fast, deterministic, offline-friendly; route to abort analytics/ads; intercept failures to test error UI (abort → timeout screen); spy on requests to assert what the app sends (capture payload for verification); mock at the network boundary, never by monkey-patching internals; keep a small set of true integration E2E (real staging backend) as a separate project run nightly; unit+integration cover logic, E2E covers user-visible truth.`,
      },
      {
        title: "Parallel shards, visual regression, CI wiring.",
        body: `CI: --shard=1/4 per runner — suite time / 4; artifacts (test-results with traces) uploaded on failure; playwright show-trace replays locally. Visual regression: toHaveScreenshot with maxDiffPixelRatio, baseline per browser — catches CSS regressions humans miss; review diffs in PRs (Playwright UI/CI comment integration); keep screenshot count small (critical flows + component states); mask dynamic regions (timestamps). Coverage policy: E2E for critical journeys (signup → first value, checkout, payment failure); everything else belongs to unit/integration; delete E2E that no longer adds signal — suites rot without budget review.`,
      },
    ],
    worked: [
      {
        title: "E2E the checkout critical path hermetically.",
        body: `Tests: seeded cart fixture; route **/api/cart* returns 2 items; route **/api/checkout POSTs captured, fulfilled 200 { orderId }; steps: goto /cart → assert both lines visible (getByRole) → click checkout → fill address (getByLabel) → submit → assert confirmation with order id and cart now empty; assert captured POST body { items: [2 ids], address: {...} }; one test per failure mode: API 500 → error UI renders + retry button works; suite runs in 9 s headless chromium shard on CI; flake incidents zero in 60 runs.`,
      },
      {
        title: "Storage-state login unlocks the whole suite.",
        body: `Before: every test signed up via UI (18 s each); after: global-setup.ts logs in once as fixture user, saves storageState; every test starts authed; suite time 18 min → 4 min; signup path verified by exactly one dedicated test; saved state invalidated on password change (detected via 401 → global setup re-runs); the engineering effort of 50 lines paid for 14 minutes per CI run forever.`,
      },
      {
        title: 'Kill a flaky "notification badge" test in one commit.',
        body: `Test asserted badge count immediately after posting comment — raced async SSE delivery. Root cause: expectation synchronous vs UI eventual. Fix: expect(page.getByTestId('badge')).toHaveText('1', { timeout: 5000 }) (auto-retry polling); plus mock SSE or reduce timing dependency entirely; plus seeded unique user so badge starts at 0; merged with a quarantine label removed; 200 consecutive green runs; the Playwright trace from the failure in CI showed exact timing — reading traces converts flakiness from superstition to diagnosis.`,
      },
    ],
    exam: [
      {
        question:
          "Why does Playwright wait for actionability automatically, and what does it still require from you?",
        answer:
          "It polls visibility, stability, enabled state and pointer interception before acting — most timing flakes vanish; you still must write expect() assertions that auto-retry (toHaveText, toBeVisible) instead of one-shot reads, and design tests around independent seeded state rather than sleeps.",
      },
      {
        question: "What is storageState and what does it save?",
        answer:
          "A serialized auth context (cookies, localStorage, sessionStorage) captured after one real login and injected into every test — eliminating per-test UI login, cutting suite time dramatically while keeping exactly one test honest about the sign-in flow itself.",
      },
      {
        question:
          "What do route() mocks buy you in E2E, and what do they cost?",
        answer:
          "Determinism, speed, offline CI, and failure injection — the suite tests the UI contract against a controlled backend; the cost is divergence risk from the real API — mitigated by a small nightly integration project against staging and contract tests keeping the mock honest.",
      },
      {
        question:
          "What makes a test suite deterministic instead of flaky, in three points?",
        answer:
          "Independent tests with seeded per-test data (no shared state), auto-retrying assertions instead of fixed waits, and hermetic network (route mocks) or isolated staging — remove order dependence, remove timing guesses, remove live-backend variability.",
      },
    ],
    cheat: [
      "getByRole first; testid for gaps; never brittle CSS/XPath.",
      "Auto-retry assertions; never sleep; isolation per test with seeded data.",
      "storageState for auth-once; fixtures with setup/teardown guarantees.",
      "route() mocks for hermetic determinism + error injection.",
      "Shard CI; traces on failure; visual snapshots for critical flows only.",
      "E2E budget: critical journeys only; nightly integration for real backend.",
      "Quarantine flakes; fix with traces, not retries.",
    ],
    recap: `Playwright E2E is the user-truth layer: accessible-role selectors, actionability auto-waiting, storageState auth reuse, seeded isolated fixtures, hermetic route mocks, sharded CI with traces as evidence — a small, deterministic suite guarding the critical journeys, refreshed by guarding against mock divergence, and audited so every red means something real broke and never flakes for ambience.`,
    code: {
      title: "Seeded fixture with API setup",
      language: "javascript",
      code: `test.beforeEach(async ({ request }) => {\n order = await request.post('/api/test/seed-order', { data: { sku: 'T-1' } }).then(r => r.json());\n});`,
      explanation:
        "Fixture API endpoint creates the world the test needs, versioned ids returned; teardown via cascade delete; no dependency on UI flows for setup.",
    },
    diagram: {
      title: "E2E pipeline",
      caption: "Seed, act, assert, heal.",
      mermaid: `flowchart LR\n S[Seed data] --> A[Browser actions]\n A --> V[Assertions]\n V --> T[Teardown]`,
    },
  },
  "web-dev-testing-and-delivery-storybook-and-component-testing": {
    intro: `Storybook is the workbench where components are built and verified in isolation before they ever reach a page — and component tests prove behavior from the outside, states and all. The subject is the discipline: stories as living documentation, interaction tests, visual regression, accessibility checks, and treating Storybook as the UI's CI environment rather than a demo gallery nobody maintains. a well-kept Storybook is to UI what unit tests are to logic — the fast feedback loop everything else depends on.`,
    foundations: `.stories.tsx per component: title group, component reference, args (props), story variants (Default, Loading, Error, Disabled, DarkTheme), play functions for interaction tests (userEvent via @storybook/test), assert with expect within the story. Addons: a11y (axe per story), actions (emitted events), controls (live arg tweaking), viewport (responsive). Composition: stories compose into docs pages (CSF → Doc Blocks). Visual regression: Storybook interaction + Playwright/Chromatic screenshot diffs per story — catches CSS drift humans miss. Design tokens: decorators set theme context per story (light/dark/brand). Untested UI is a rumor; stories are the receipts.`,
    concepts: [
      {
        title: "Stories as the component contract.",
        body: `Each component documents exactly which states exist: Button: Primary, Secondary, Ghost, Destructive, Loading, Disabled, WithIcon, Sizes (sm/md/lg), FocusVisible, Dark. Args org: argTypes declare control types and docs tables auto-generated; a story per meaningful variant — not a free-for-all of random permutations; names spell states (ErrorWithRetry not Story5); decorators wrap in theme providers; play functions drive realistic flows; the catalog doubles as onboarding for designers and engineers; implementation drift caught by reviewers opening the component in isolation, not navigating 14 screens to find it.`,
      },
      {
        title: "Interaction testing with play functions.",
        body: `play: async ({ canvasElement, step }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: /submit/i })); await expect(canvas.getByText(/saved/i)).toBeInTheDocument(); } — assertions run in-browser as part of the story; portable to CI (test-runner executes every play function); canvas-scoped queries mirror RTL semantics; steps annotate the flow for the UI viewer; mocks: module mocks via parameters.msw for network-shaped stories (form submit → 200 vs 500 variants); stories then cover logic-adjacent UI behavior without pages, routers or backend — the suite stays fast and deterministic.`,
      },
      {
        title: "Accessibility in the loop.",
        body: `@storybook/addon-a11y runs axe per story in the panel and fails CI on violations — unlabeled inputs, contrast failures caught before review; plus storybook-test-runner runs axe programmatically; keyboard passes still manual per interaction story; color-scheme stories (prefers-color-scheme dark) ensure token swaps hold; reduced-motion variant stories ensure prefers-reduced-motion paths exist; a11y regressions are caught at the component, where fixing is cheap, not at the page where it is spelunking.`,
      },
      {
        title: "Visual regression and Chromatic/Playwright.",
        body: `Every story is a snapshot target: font rendering, spacing, colors — Chromatic (hosted) stores baselines, diffs PRs with perceptual thresholds, approve-with-one-click for intentional changes; self-hosted: storybook-test-runner + Playwright screenshots per story with CI artifacts; keep diffs attributable: one story change = one focused diff — global restyling shows as thousand diffs (that is correct signal — budget reviewers for theme PRs); mask dynamic regions; disable animations for snapshot determinism. Visual regression cost is review attention — spend it on tokens, layouts and states, not decorative pages.`,
      },
      {
        title: "Design systems as shipped components.",
        body: `For real design systems: Storybook is the product surface — tokens table pages (color/spacing/motion with live swatches), usage guidelines pages, motion examples with reduced-motion alternates, do/don't examples, prop-table audits (public API surface frozen per release), changelog per release; consumers pin versions; deprecations announced with codemods; the system is consumed in-browser from day one — no handoff PDF, no ambiguity; contribution flow: RFC → implementation → stories + a11y + docs + release; a storybook that ages unmaintained is worse than none — assign an owner or it dies.`,
      },
    ],
    worked: [
      {
        title: "Build Button story coverage end to end.",
        body: `Stories: Primary, Secondary, Destructive, Loading (disables + spinner visible), Disabled, WithIconLeft, Sizes, FocusVisible (play tabs until ring visible), DarkTheme decorator variant; play on Loading asserts aria-disabled + spinner role=status; a11y addon passes (contrast on destructive = 5.9:1); Chromatic baselines every state; doc page embeds guidelines; the Button was already done — the story work took one afternoon and now every future Button change is regression-proven before review.`,
      },
      {
        title: "Test a form story including its error path.",
        body: `Story Form.Error: MSW mock 422; play: type invalid email → submit → expect role=alert text visible → aria-invalid true on input → focus moved to summary; Story Form.Success: mock 200; play: fill valid → submit → success toast role=status; storybook-test-runner in CI runs both; the page-level Playwright suite covers only the assembled journey — the form logic lives in the stories; CI failure message points at the exact story, not a 200-step test.`,
      },
      {
        title: "Catch a token drift with visual regression.",
        body: `Designer changed --surface-muted hue; Chromatic diffed 87 stories — intended for theme PR, alarming for feature PR; reviewer confirmed values match the new token spec; approved with note; zero regressions merged unknowingly; last year without Chromatic, the same drift shipped for six weeks and leaked into invoices emails and admin tables; the diff queue is cheaper than one support escalation.`,
      },
    ],
    exam: [
      {
        question: "What does a Storybook story prove that a unit test cannot?",
        answer:
          "The rendered, themed, accessible, animatable reality of the component — layout, contrast, focus behavior and interaction across states, visible and verifiable by humans and diffed by machines; unit tests verify logic, stories verify presence.",
      },
      {
        question: "What do play functions add over static story rendering?",
        answer:
          "Executable interaction scripts inside the story — click, type, submit, assert outcomes — deterministic in CI via the test runner, replacing brittle page-level tests for component behavior with in-browser proof at component speed.",
      },
      {
        question: "Why treat a11y addon failures as CI failures, not warnings?",
        answer:
          "Because they are objective violations — unlabeled controls, contrast failures, invalid ARIA — silently shipping them compounds on every consumer; failing red is the only mechanism that stops them at the point of authoring, where the fix is seconds, not archaeology.",
      },
      {
        question:
          "What is visual regression actually buying you, and what does it demand?",
        answer:
          "It catches any visible unintended change — CSS, fonts, tokens, layout — automatically across every state ever enumerated; it demands disciplined baseline management and honest PR review of diffs; unreviewed approvals defeat it entirely.",
      },
    ],
    cheat: [
      "One story per meaningful state; names spell states; controls typed.",
      "play functions: in-browser interaction proof; test-runner in CI.",
      "a11y addon = build gate, not panel decoration.",
      "Chromatic/test-runner + Playwright diffs per story; mask dynamic bits.",
      "Decorators for themes; reduced-motion variants always.",
      "Design systems: storybook = product surface; own it or lose it.",
      "Stories document states; unit tests verify logic; E2E verifies journeys.",
    ],
    recap: `Storybook is the component CI: every state enumerated as a story, interactions proven with play functions, accessibility enforced per story in CI, visual regression policing pixels, and design systems consuming it as their real API documentation — the feedback loop is measured in seconds at the component, which is where UI quality is actually won or lost.`,
    code: {
      title: "Interaction story skeleton",
      language: "tsx",
      code: `export const SubmitError: Story = { args: {...}, parameters: { msw: { handlers: [http.post('/api/x', () => new HttpResponse(null, { status: 422 }))] } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: /submit/i })); await expect(c.getByRole('alert')).toBeVisible(); } };`,
      explanation:
        "Network mock, click, assert — a full async error-path proof inside one story; the test-runner executes it in CI like any test.",
    },
    diagram: {
      title: "Storybook in the flow",
      caption: "Build, verify, diff, ship.",
      mermaid: `flowchart LR\n B[Build component] --> S[Stories per state]\n S --> A[a11y + interaction checks]\n A --> V[Visual diff]`,
    },
  },
  "web-dev-testing-and-delivery-contract-and-api-testing": {
    intro: `Contract and API testing protects the boundary between services — the place where frontend meets backend and service meets service — so teams can deploy independently without integration-day surprises. The subject is consumer-driven contracts (Pact), schema validation (OpenAPI), and breaking-change gates: proving both sides honor the same agreement before either ships. integration failures are communication failures — contracts make the conversation explicit and testable.`,
    foundations: `Consumer-driven contract testing (Pact): consumer writes example interactions → generates contract file → CI shares to provider → provider replays, verifying it can satisfy all expectations → publish results; provider deploys freely if green. Schema validation: OpenAPI/JSON Schema as the shared artifact — validate requests/responses both sides; contract drift = CI red. Breaking changes: detected by diffing the schema (remove/rename/type-change = major); gates in CI. API tests: supertest/jest hitting real handlers against seeded DB for status/shape/perf budgets. Test pyramid: many unit, some integration, few e2e — contracts decouple teams; avoid writing tests couples cannot evolve.`,
    concepts: [
      {
        title: "Consumer-driven contracts with Pact.",
        body: `Consumer test: given provider state (seeded user 42), expect GET /users/42 → 200 with body matching { id: 42, name: like('x') } → Pact records the interaction in a pact file (JSON). Publish to broker (or git). Provider verify: fetch pacts, replay each request against the real service, assert responses match; green = independent deploys safe; new fields are additive-safe; removing fields fails loudly at provider CI — before users see it; pacts versioned per consumer; provider tests remain integration-true (real code path, not mocks of itself).`,
      },
      {
        title: "Schema-first OpenAPI validation.",
        body: `OpenAPI 3 spec as single artifact: paths, params, request/response schemas, enums (closed lists catch typos), required vs optional, nullable explicit; validate inbound in the server (parse-or-400), validate outbound in tests (supertest + jest-openapi asserts response matches spec) — schema becomes the spec; mock servers from the schema enable frontend parallel work (Prism); contract lint (spectral) in CI catches ambiguous or invalid specs; diff on PR flags breaking vs additive; publish internal docs with Stoplight/Redocly; the schema replaces the wiki.`,
      },
      {
        title: "Breaking-change gates and versioning.",
        body: `Breaking changes: removing endpoints/fields, renaming, tightening types (string→number), narrowing enums, changing requiredness, altering auth — detect mechanically: oasdiff or similar on every PR vs main: FAIL on breaking unless major version bump + migration plan; additive-only default keeps clients working; deprecate additive fields first (header Deprecation + Sunset date, usage telemetry), delete when usage hits zero; URL /v1/ vs /v2/ for unavoidable breaks; consumers pin majors; sunset communication automated from the spec; the gate turns "who broke the mobile app" archaeology into a red CI check.`,
      },
      {
        title: "API tests with real behavior budgets.",
        body: `supertest against the real Express/Fastify app with test DB fixtures: route-level tests cover status codes, body shape (strict — no extra surprises with dangerous paths like isAdmin!), auth enforcement (401 unauthenticated, 403 cross-tenant), pagination invariants, idempotency replay via key; performance budgets: p95 of list endpoint < 150 ms in CI-failing threshold (lenient, but guards cliff regressions); seeds isolated per test; parallel-safe; these tests buy confidence without UI — the cheap high-coverage layer.`,
      },
      {
        title: "Contract drift and provider states.",
        body: `Drift happens anyway — the discipline is detection: consumer CI fails on verify mismatches instantly; weekly scheduled pact verification against production-like provider; provider-side states (user with 2 orders) documented and auto-seeded via test hooks (/_pact/provider-state endpoint or middleware aliases); bi-di tests vs PactFlow for fuzzing edges; telemetry: if you see 404 spikes, verify spec-vs-implementation parse — drift defined, caught, closed. Contract testing does not eliminate integration — it makes it boring and continuous.`,
      },
    ],
    worked: [
      {
        title: "Let frontend ship without backend for three sprints.",
        body: `Backend pending: frontend team wrote Pact tests against the spec: GET /products list, POST /cart/add, GET /search with filters; mock via @pact-foundation; UI integration-tested against the mock with MSW mirroring the same interactions; backend team delivered spec first; verify green day zero — frontend deployed to prod the same week backend landed; zero "works on my mock" surprises because the mock WAS the contract, and the provider had to satisfy exactly those interactions.`,
      },
      {
        title: "CI gate catches a breaking rename before merge.",
        body: `PR renamed response field totalAmount → total_amount "for consistency"; oasdiff flagged three potential breaking references with the mobile app listed as a consumer; author reconsidered, reverted to additive alias (emit both during deprecation) instead; gate went green; six weeks later, after sunset header and zero mobile usage telemetry pings, the old field was removed cleanly; customers never saw the fight — the gate had the argument for you.`,
      },
      {
        title: "Provider verify fails on enum narrowing.",
        body: `Provider PR removed status 'pending' from OpenAPI enum (dead code cleanup!); Pact provider verification went red: consumer pact expected pending in a fixture; backend team negotiated with consumer owners — new enum 'processing' added, both sides merged coordinated over two deploys; without the gate, mobile clients would have parsed unknown enum as undefined and shown permanent spinners to thousands nightly; the gate was cheaper than the incident.`,
      },
    ],
    exam: [
      {
        question:
          "Why are consumer-driven contracts stronger than provider-side integration tests alone?",
        answer:
          "They encode what consumers actually need — provider can refactor freely behind the contract, unsupported-but-required fields surface at CI, and deploy order stops mattering; provider integration asserts perfection of implementation, contracts assert perfection of promise.",
      },
      {
        question: 'What does it mean for a provider to "verify" a pact?',
        answer:
          "Replaying recorded interactions against the real service and matching status/headers/body shape per expectations — any drift between recorded consumer assumption and provider reality fails the build; the guarantee is symmetric, enforced continuously rather than at integration day.",
      },
      {
        question: "Which changes are objectively non-breaking in a JSON API?",
        answer:
          "Additive fields, new endpoints, new optional parameters, new enum values consumers must tolerate but may ignore (with unknown-forward parsing) — everything else (removals, renames, retypes, narrowed enums, tightened requiredness) is major; the diff tool decides, not opinion.",
      },
      {
        question:
          "Why validate responses with jest-openapi in addition to Pact verification?",
        answer:
          "Pact proves consumer expectations are met; OpenAPI validation proves the entire response surface conforms to the spec, including paths no consumer test exercises yet — belt and suspenders against silent drift, scoped cheap.",
      },
    ],
    cheat: [
      "Pact: consumer writes, provider verifies, deploy independently.",
      "OpenAPI is the artifact: validate in, out, and in CI diff.",
      "Breaking changes fail CI; additive-only by default.",
      "Provider state hooks seed fixtures for verification.",
      "Deprecate with headers + telemetry, then delete.",
      "API tests: auth, shape strictness, pagination, idempotency, budgets.",
      "Contracts make integration boring; boring is the goal.",
    ],
    recap: `Contract testing replaces integration day with continuous proof: consumers publish their expectations, providers verify against reality in CI, OpenAPI diffs gate breaking changes, and supertest-style checks guard behavior budgets — independently deployable teams stop stepping on each other because the agreement is executable, versioned and always enforced.`,
    code: {
      title: "Supertest assertion of response shape",
      language: "javascript",
      code: `await request(app).get('/api/users/42').expect(200).expect((res) => { expect(res.body).toMatchObject({ id: 42 }); expect(res.body.passwordHash).toBeUndefined(); });`,
      explanation:
        "Status, shape, and absence-of-secrets in one request — the safety line API tests always draw.",
    },
    diagram: {
      title: "Contract verification loop",
      caption: "Consumer publishes; provider verifies.",
      mermaid: `flowchart LR\n C[Consumer test] --> P[Pact file]\n P --> V[Provider verifies]\n V -->|green| D[Deploy safe]`,
    },
  },
  "web-dev-testing-and-delivery-load-testing-with-k6": {
    intro: `Load testing with k6 is how you find your system's saturation point before your users do — written as code, executed in CI, and interpreted like an engineer rather than a spectator. The subject is crafting meaningful load tests: realistic journeys, ramp stages, thresholds as pass/fail gates, finding the knee where latency goes linear-to-cliff, and distinguishing infrastructure limits from application bugs. a load test is a hypothesis about your system — design it like one.`,
    foundations: `k6 (Grafana): JavaScript-like scripts executed on a Go runtime — thousands of VUs (virtual users) per process, distributed execution, xk6 extensions. Script shape: options { stages: [ramping], thresholds: { http_req_duration: ['p(95)<500'] } } exported; default function = iteration body (journey): check() asserts, tags label requests (checkout vs browse). Results: percentiles, req/s, failure rate. Ramp load model: arrival-rate vs VUs-as-closed/open — open model (arrival-rate) better simulates Poisson traffic; VU model saturates oddly. Run modes: local (dev sanity), cloud (k6 Cloud), CI threshold gates; distributed via k8s operator. Metrics export: Prometheus/Grafana; alerts in pipelines.`,
    concepts: [
      {
        title: "Scripting realistic user journeys, not pings.",
        body: `Bad test: hammer GET /health 10k rps — proves nothing about your app. Good test: journey of weighted steps — browse (60%): list, view 2 details; cart (25%): add, update, view; checkout (10%): full purchase with seeded data; account (5%): login + page; randomize think times (sleep with realistic distribution) and payloads (unique SKUs from seed set); unique per-VU users to avoid global locks and caches lying; checks assert business truth (confirmation present), not HTTP 200 alone; tags slice metrics per journey step; the test passes at production-shape traffic honestly.`,
      },
      {
        title: "Stages, arrival-rate, and finding the knee.",
        body: `stages: [{ duration: '2m', target: 50 }, { '5m', 200 }, { '3m', 800 }, { '1m', 0 }] — ramp, soak, spike, cool-down; watch latency percentiles per stage: the knee is where p95 curves upward superlinearly (usually DB pool exhaustion, then CPU, then memory pressure → GC); open model (constant arrival rate) reveals queueing honestly — closed VUs throttle themselves and hide the knee (coordinated omission problem!); spike stage validates autoscaling reactions; soak reveals leaks (memory creeps); failure below peak = scale ceiling confirmed; compare before/after every change with the same journey.`,
      },
      {
        title: "Thresholds as CI gates and budgets.",
        body: `options.thresholds: { http_req_duration: ['p(95)<400', 'p(99)<900'], http_req_failed: ['rate<0.01'], 'checks{tag:checkout}': ['rate>0.99'] } — exit code non-zero on breach; CI fails deploy promotion: the SLO stops regressions pre-production; tune thresholds to step below contract, not at; maintain a budget doc: each endpoint class with latency target + test to enforce; budgets reviewed quarterly; test data volume must match production shape or thresholds are theater — seed realistic cardinality, not three rows.`,
      },
      {
        title: "Debugging saturation: what the knee usually says.",
        body: `p99 cliff at 600 rps: check in order — DB connection pool (pgbouncer saturated; queries queued silently), then lock contention/N+1 (increase pool barely helps if queries are the issue), then app CPU pegged (add instances / profile), then memory pressure (heap dumps), then downstream dependency (payment API throttling cascades — isolate and stub to confirm). k6 output + server telemetry correlate: queue depth curves align with latency spikes — the bottleneck lives where the flat line meets the ramp; fix one thing, re-run identical test, compare; never two changes at once in test archaeology.`,
      },
      {
        title: "Running in CI without becoming a DDoS.",
        body: `Gate stages: smoke (10 VUs, CI every PR — correctness of the test itself), load (PR nightly — SLO gates), stress (weekly — ceiling finding), soak (pre-major-release — leaks); target staging (never prod unless rehearsed game-day with flags and comms); limits: k6 --vus caps, distributed containers for >10k VUs; isolate test tenant data; seed idempotently; teardown destroys fixtures post-run; secrets scoped; coordinate with on-call; artifacts: results JSON + Grafana snapshot attached to the report; the test suite is production infrastructure — treat its failures like prod alerts.`,
      },
    ],
    worked: [
      {
        title: "Write the checkout test and CI gate.",
        body: `Journey: login (unique users from CSV) → add 2 random items → view cart → apply code 'TEST10' → checkout with test card → expect order confirmation; tags per step; stages to 300 VUs; thresholds: p95 checkout < 700 ms, error rate < 0.5%, confirmation check rate > 99%; runs nightly on staging; caught a regression in coupon validation (p95 1.4 s after an ORM change) before release; rolled back with one-click; baseline re-established; the gate paid back in one saved incident.`,
      },
      {
        title: "Find the connection-pool ceiling.",
        body: `Ramp: at 420 rps, latency rose 80→650 ms nonlinearly; k6 correlated with app metrics: pg_stat_activity showed 96/100 connections active; pgbouncer queue depth climbing; diagnosis: pool too small for ORM pattern (each request = 3 queries); fix: pgbouncer transaction mode + pool 100→200 and N+1 elimination; same profile: knee moved to 980 rps at p95 340 ms; the test proved cause, the fix falsified it twice.`,
      },
      {
        title: "Soak test exposes a memory leak.",
        body: `Constant 200 VUs for 4 h: latency flat for 3 h, p95 climbed 300→700 ms in hour 4; heap monitoring: RSS +40 MB/h growth; heap snapshot: unbounded Map in a cache layer (TTL never enforced on entries); fix: LRU with max 10k entries; re-run soak: flat 6 h; the leak would have OOM-killed nightly in production within a week — caught in rehearsal instead of on-call; soak tests are cheap; incidents are not.`,
      },
    ],
    exam: [
      {
        question:
          "Why is the open model (arrival rate) usually preferable to closed VUs?",
        answer:
          "Closed VUs self-throttle — when the system slows they issue fewer requests, hiding overload and flattering latency curves (coordinated omission); arrival-rate keeps sending at target load, producing real queueing behavior and the true knee — the shape production actually produces.",
      },
      {
        question:
          "What do thresholds in k6 make possible that dashboards alone cannot?",
        answer:
          "Automatic pass/fail: the same run that prints metrics fails a deploy when SLOs slip — performance becomes an invariant enforced in the pipeline, not a chart someone might check; dashboards show what happened, thresholds decide whether it ships.",
      },
      {
        question:
          "What is the correct order of suspicion at a p99 latency cliff under ramp?",
        answer:
          "Connection pool saturation, then lock/query cost (N+1, missing index), then CPU saturation, then memory pressure/GC, then downstream dependency throttling — confirmed by correlating k6 latency with server-side telemetry; never tune by adding instances before naming the shared resource.",
      },
      {
        question: "Why run soak tests separately from stress tests?",
        answer:
          "Stress finds the breaking point fast; soak finds slow degradation — leaks, connection drift, cache growth, log disk fill — under ordinary load over hours; either alone misses half the failure spectrum; both are cheap relative to one 3 AM page.",
      },
    ],
    cheat: [
      'Journeys with think times; never GET /health as "the load test".',
      "Arrival-rate model; ramp → soak → spike → verify.",
      "Thresholds = CI gates; budgets documented per endpoint class.",
      "Knee = superlinear p95; hunt pool → queries → CPU → memory → downstream.",
      "Nightly load, weekly stress, soak pre-release; staging only.",
      "Seed production-shaped cardinality; idempotent fixtures; cleanup.",
      "Compare identical runs pre/post change; one variable only.",
    ],
    recap: `k6 turns performance into code and pipelines: journeys that mirror reality, arrival-rate models that reveal the true knee, thresholds that gate deploys on SLOs, and staged runs (load/stress/soak) isolating ceiling, leak and spike behavior — with correlation to server telemetry as the diagnostic compass, load testing is the rehearsal that replaces 3 AM discovery with an expected number.`,
    code: {
      title: "k6 options skeleton",
      language: "javascript",
      code: `export const options = { scenarios: { ramp: { executor: 'constant-arrival-rate', rate: 200, timeUnit: '1s', duration: '5m', preAllocatedVUs: 400 } }, thresholds: { http_req_duration: ['p(95)<450'] } };`,
      explanation:
        "Arrival-rate executor plus a p95 gate — one declaration of load and one of acceptability; CI evaluates both without interpretation.",
    },
    diagram: {
      title: "Load test loop",
      caption: "Define, run, measure, gate.",
      mermaid: `flowchart LR\n S[Script journey] --> R[Run ramp]\n R --> M[Metrics percentiles]\n M --> G[Threshold gate]`,
    },
  },
  "web-dev-testing-and-delivery-feature-flags-and-progressive-delivery": {
    intro: `Feature flags separate deployment from release — you ship code dark, and decide who sees it and when. Progressive delivery (canary, rings, experiments) exposes the change to a widening circle while metrics watch. The subject is using flags as a release-engineering tool: safe rollouts, instant kill switches, cohort strategies, experiments, and the hygiene that prevents flag debt from rot-eating your codebase. flags turn releases from events into dials.`,
    foundations: `Flag types: release toggles (deploy vs release), ops toggles (kill switches, degradation), experiment toggles (A/B), permission toggles (beta cohorts, plans). Providers: LaunchDarkly, Unleash, PostHog, or homegrown (config table + cache). Evaluation: server-side (deterministic by user hash) or edge; targeting: percentage rollouts, attribute rules (plan=pro, country), allow/deny lists. Progressive delivery rings: internal → beta → 5% → 25% → 100%; metric gates between rings (error rate, latency, conversion). Kill switch: flip off instantly on incident. Flag lifecycle: temp flags deleted after rollout completes (track expiry!); permanent flags = configuration — treat with audits.`,
    concepts: [
      {
        title: "Flag taxonomy and where each lives.",
        body: `Release: guards unfinished code in prod — short-lived, killed after rollout (else code complexity rots). Ops: circuit breakers on behavior (e.g., disable search as you go read-only during DB incident) — permanent-ish, but documented with runbooks; Experiment: A/B with assignment bucketed by user id hash — assignment stable across sessions; Permission: plan gating (pro-only features) — long-lived, moves to entitlement service eventually. Miscategorizing causes pain: kill switches buried as release flags or A/B debris shipped as "permanent" — classify deliberately at creation; expiry date required at creation for release flags.`,
      },
      {
        title: "Progressive rollout mechanics.",
        body: `Rings: dogfood employees (2) → opt-in beta (500 users) → 5% hash cohort → 25% → 50% → 100%; promotion between rings gated by: error rate delta < 0.5%, p95 latency within 10%, conversion within noise OR improved; observation window ≥ 30 min per ring (or overnight for big rings); auto-rollback hooks: prometheus alert → flag auto-off or deployment blocked (no manual 3 AM); rollbacks drill quarterly; flags also decouple migrations: expand schema → deploy code behind flag → backfill → enable → contract — zero big-bang risk.`,
      },
      {
        title: "A/B experiments as product decisions.",
        body: `Hypothesis first: "shorter onboarding increases activation by 8%"; metric: activation within 7 days; single primary, pre-registered; guard metrics: retention, support contacts, refund rate; sample size from baseline rate + MDE (calculator — most orgs underpower and call noise victory); duration to weekly-cycle completeness; sequential testing or fixed horizon with pre-commit; assignment: stable hash(user_id, experiment_id) — sticky, no contamination; analysis: intention-to-treat, segments only exploratory; ship or kill; document learning; the org that cannot kill a beloved idea on data will ossify.`,
      },
      {
        title: "Kill switches and graceful degradation.",
        body: `For every dependency you can lose, a toggle exists: disable recommendations (fallback editorial), disable search suggest (plain input), disable checkout upsell (direct path), read-only mode; toggles wired to server-side evaluation with cache TTL ≤ 30 s and manual override; incident playbook says exactly which gremlins to pull in which SEV; automatic triggers possible (error rate threshold opens toggle); a kill switch you have never tested is folklore — test by staging flip monthly; every toggle documented to the runbook and linked from alerts.`,
      },
      {
        title: "Flag hygiene: preventing debt and sprawl.",
        body: `Floors: max active release flags per service (8); CI lint flags without expiry after 60 days (warn → block on PR); quarterly flag audit with owners; flag value logging in request traces (debug which flag decided); naming: team-feature-purpose (growth-onboarding-v2-step2), not tmp123; no branching-per-flag nested beyond two levels — readability ceiling; kill permanent flags by migrating to config system; metrics: flags created/month vs retired/month — churn ratio shows discipline; the hygiene is the feature: flags are powerful debt instruments, treat the balance sheet.`,
      },
    ],
    worked: [
      {
        title: "Roll out checkout redesign with rings.",
        body: `Merge dark; deploy; internal ring 15 eng (clean checkout for week); beta 400 users (converted −3%! bug in tax calc for one jurisdiction — fixed fast); 5% cohort (metrics flat); 25% (+6% conversion, p95 −120 ms — the redesign good); 100%; flag deleted in the release after 100% (hygiene task); total elapsed 3 weeks instead of a high-wire launch weekend; zero incident reviews beyond the beta tax find; everyone slept through the loud day.`,
      },
      {
        title: "Auto-rollback on error-rate spike.",
        body: `New pricing engine behind flag: promoted 25% → 5xx rate doubles vs baseline (from 0.2% to 0.5% — still tiny, still fatal) → Prometheus rule fires → flags auto-revert to previous version via CD hook → 3 minutes later elevated cohort shrinks back → postmortem: rounding error on zero-decimal currencies — fix, re-promote through rings in 48 h; the guard rail engaged before the SEV channel woke up; no customer noticed except a handful of logged failed retries.`,
      },
      {
        title: "A/B: does the shorter copy button win clicks?",
        body: `Experiment: "Get started" vs "Start free" on hero; hypothesis: start free +10% clicks; n = 12k per arm at 80% power for 8% MDE on 22% baseline; 2 weeks; result +2.1% ± 1.9% (not significant, p=0.27) — ship "Get started" for brand coherence with written note "no evidence of harm; weak no"; the experiment culture respected: null results logged, not buried; next test scoped to above-the-fold value prop instead; velocity preserved without cargo-culting buttons.`,
      },
    ],
    exam: [
      {
        question:
          "What is the difference between deployment and release, and why must flags bridge them?",
        answer:
          "Deployment is code running in production; release is users exposed to it — flags decouple them so code can ship dark and behavior can be enabled by audience and pace, enabling instant rollback without redeploy, cohort targeting, and experiment gating — a release becomes a dial.",
      },
      {
        question:
          "Why are percentage rollouts hash-bucketed by stable user id instead of random per request?",
        answer:
          "Stability: the same user always sees the same variant — otherwise flickering identities break sessions, caches, experiments (contamination), and trust; hash bucketing gives sticky random assignment with uniform distribution without a lookup service.",
      },
      {
        question:
          "When does an experiment fail ethically and practically before statistics even matter?",
        answer:
          "When it withholds material value or harms a cohort (e.g., checkout failure for some users), or is underpowered so noise gets celebrated — the fix: guard metrics, power analysis before start, pre-registered primary, humane rollouts, and the courage to stop when guard rails trip regardless of the primary metric.",
      },
      {
        question: "What is flag debt and the two cheapest controls against it?",
        answer:
          "Dead or permanent feature toggles accumulating branching complexity and review burden; controls: mandatory expiry date for release flags with CI warn/block on staleness, and quarterly audit deleting resolved flags with a retired/created ratio target — hygiene is policy, not virtue.",
      },
    ],
    cheat: [
      "Release ≠ deploy: flags decouple; kill switches everywhere it hurts.",
      "Rings: internal → beta → 5/25/50/100; gated by error, latency, conversion.",
      "Never roll out blind: auto-rollback on metric burn.",
      "Kill switches tested monthly; playbooks linked from alerts.",
      "A/B: pre-register primary, power honestly, stable hash bucketing, kill on null.",
      "Flag hygiene: expiry at creation, CI lint, quarterly audit, owner per flag.",
      "Flags make releases reversible by default — that is the entire point.",
    ],
    recap: `Feature flags are the control plane of releases: deploy dark, expose by rings with metric gates, kill instantly on failure, experiment honestly, degrade gracefully under stress — and delete the flags afterwards, because undeleted flags are architecture you did not choose; treated this way, shipping stops being an event and starts being a dial you turn with data and a fire extinguisher you have actually test-discharged.`,
    code: {
      title: "Hash-bucketed assignment",
      language: "javascript",
      code: `const bucket = murmurhash3(userId + experimentId) % 10000 / 100; // 0-99.99`,
      explanation:
        "Stable uniform 0-100 cohort; bucket compare against rollout percentage; no server needed at read time; reproducible forever for the same user and experiment.",
    },
    diagram: {
      title: "Progressive delivery loop",
      caption: "Deploy dark, expand, measure, kill or keep.",
      mermaid: `flowchart LR\n D[Deploy dark] --> R[Rings with gates]\n R --> M[Measure]\n M -->|good| F[Full rollout]\n M -->|bad| K[Kill switch]`,
    },
  },
};
