import type { TopicLesson } from "../topicLessons.js"; /** * Advanced Frontend — 6 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const advancedFrontend: Record<string, TopicLesson> = {
  "web-dev-advanced-frontend-progressive-web-apps": {
    intro: `A Progressive Web App is a web application with app-like qualities — installable, offline-capable, fast, push-enabled — delivered through open standards rather than app stores. The subject is what it takes to ship one: service workers, manifests, caching strategies, offline UX, and the platform limits you must design around. a PWA is the web, disciplined — offline resilience plus an install icon, no store gatekeepers required.`,
    foundations: `Three pillars: a web app manifest (name, icons, display, start_url, theme_color) making the app installable; a service worker (a script proxied between page and network) intercepting fetch events and implementing caching/push/background sync; HTTPS everywhere. Service workers lifecycle: installing → waiting → activated; scope defines which URLs it controls; skipWaiting + clients.claim for instant takeover; update flow: new SW downloaded, activates on next load (or with skipWaiting after prompt). Cache API stores request/response pairs; strategies: cache-first (assets), network-first (HTML/data with timeout fallback), stale-while-revalidate (static + data), network-only (mutations). Install prompts come from beforeinstallprompt; push via Push API + VAPID.`,
    concepts: [
      {
        title: "Service worker architecture and lifecycle.",
        body: `Register at load: navigator.serviceWorker.register('/sw.js', { scope: '/' }). SW is event-driven — fetches, push, sync, message. Install event pre-caches the app shell (versioned cache name — old caches cleaned on activate); activate claims clients. Update protocol: byte-compare new SW → install in background → prompt user or skipWaiting carefully (uncontrolled activate can break sessions on SPAs mid-mutation — always offer reload). SW cannot block main thread beyond event handling; keep it lean; never cache POST responses; bypass SW for analytics endpoints (or use keepalive fetch after respondWith).`,
      },
      {
        title: "Caching strategies per resource class.",
        body: `Static fingerprinted assets (JS/CSS/fonts/images): cache-first — immutable, serve instantly, update URL hashes on build. HTML/navigation: network-first with short timeout (3 s) then cached shell offline — always shows latest when online, instant fallback offline. API data: stale-while-revalidate — return cache instantly, refresh in background; or network-first for critical freshness (account pages). Mutations: network-only — never fabricate POST results; queue offline writes via Background Sync where supported. Route-aware map: (push stripe analytics) bypass entirely. Version caches atomically; purge old on activate; test offline with DevTools throttling, always.`,
      },
      {
        title: "Offline UX and data sync.",
        body: `Offline is a state of the product, not an error page: app shell renders instantly (cache), user data from IndexedDB with staleness indicators ("last synced 12:40"), forms queue mutations and replay on reconnect (Background Sync or custom retry with inbox), conflicts resolved per entity (last-write-wins for low-stakes, explicit merge for edits), sync progress visible (spinner → "saved offline" → "synced"). Detection: navigator.onLine (advisory) + heartbeat to own API — treat online/offline as quality-of-connection heuristics; test with airplane mode on real devices; measure offline session completion rate as a first-class metric.`,
      },
      {
        title: "Manifest, installability, and push.",
        body: `Manifest: short_name (home screen), icons 192/512 (+ maskable purpose for Android adaptive icons), display standalone/minimal-ui, start_url with source tracking (?source=pwa), scope, theme_color/background_color for splash. Install criteria: manifest + SW + HTTPS + engagement heuristics — qualify reliably by shipping quality; prompt with beforeinstallprompt on user gesture ("Add to home screen" button), not on page load. Push: subscribe via PushManager with applicationServerKey (VAPID), permission requested in context (after value demonstrated), payload ≤ 4 KB, deep-link into app on click; silent push throttled by browser; always include notification action buttons; respect per-user quiet hours.`,
      },
      {
        title: "Limits, testing, and distribution reality.",
        body: `Limits: no iOS install-prompt programmatic API (user adds manually — design copy for it), push support uneven, storage quota evictable (request persistent storage: navigator.storage.persist()), background sync gaps on iOS/Firefox; app-store distribution absent unless TWA/PWABuilder wraps (Google Play) or App Store via Capacitor — PWAs complement, rarely replace, native for deep-device APIs (Bluetooth, NFC limited). Testing: Lighthouse PWA audit (manifest, SW, offline, installability), Playwright offline runs, cache-budget alarms for precache growth (each cached MB is a bandwidth + eviction risk), and continuous real-device testing before every major release.`,
      },
    ],
    worked: [
      {
        title: "Make a React SPA offline-capable in one sprint.",
        body: `Add manifest (icons, standalone, start_url) + workbox-generated SW (precache build output, runtime rules: images cache-first, API GET SWR with 10 min TTL, navigation network-first 3 s) + update prompt banner ("new version available — reload") + IndexedDB read-through for last-known data with staleness badge; test: airplane mode → app still opens, previously viewed orders list renders, staleness chip visible; reconnect → SWR refreshes silently; Lighthouse PWA = 100; install works on Android Chrome instantly; iOS shows instructions.`,
      },
      {
        title: "Push notifications for order status.",
        body: `In-app enable prompt after first delivery (never cold): subscribe PushManager with VAPID key → server stores endpoint per user → order worker sends payloads { title, body, url, tag } filtered by prefs and quiet hours → SW notificationclick focuses/opens the order page → delivery receipts tracked; unsubscribe on last device removal; fallback email for iOS devices without push; measured: 41% opt-in, 28% open rate — meaningful, and zero unsubscribe storms because timing respected intent.`,
      },
      {
        title: "Debug a stale-while-revalidate loop.",
        body: `Bug: every API response re-rendered from cache forever — SW never updated entries because fetch kept resolving from cache (rules overlapped: GET returns cache-first due to ordering). Fix: order rules by specificity (API SWR before generic cache-first images), add matchOptions ignoreSearch correctly, version runtime cache name (runtime-v2) to invalidate the poisoned namespace, add tests asserting a network call happens in SWR path with cache present-but-stale; deploy; verification: every request hits network once, cache still fast on repeats.`,
      },
    ],
    exam: [
      {
        question:
          "Why can service workers not cache POST requests, and what replaces the pattern?",
        answer:
          "POST bodies are not idempotent and caching them encourages silently replaying mutations — corrupt duplicates; instead: network-only for mutations, and if offline behavior is needed, queue the mutation intent (IndexedDB + Background Sync) and replay deliberately with server-side idempotency, never blindly from a cache.",
      },
      {
        question:
          "What update strategy do well-behaved PWAs use for new service workers?",
        answer:
          "New SW installs silently in the background; the app notifies the user (banner) and reloads — reloading mid-session can discard state and half-written forms; seamless update happens naturally on next navigation; skipWaiting is reserved for controlled forced-refresh moments with user consent.",
      },
      {
        question:
          "What makes beforeinstallprompt preferable to assuming browsers prompt automatically?",
        answer:
          "Automatic prompts are heuristics you do not control and users ignore; capturing the event lets you defer and trigger it at a high-value moment after demonstrated value — raising opt-in rates dramatically while keeping the mandatory install criteria honest.",
      },
      {
        question:
          "What is the single most common PWA production bug, and the guard?",
        answer:
          "An unversioned cache namespace serving stale assets forever after a deploy — the guard is versioned precache names, cleanup of old caches on activate, SWR (not plain cache-first) for HTML, and a release checklist that unregisters stale service workers in staging after every build.",
      },
    ],
    cheat: [
      "Manifest + SW + HTTPS = installable; icons incl. maskable; start_url with source.",
      "SW lifecycle: install precache (versioned) → activate cleanup → claim clients.",
      "Cache-first assets, SWR data, network-first navigations, network-only mutations.",
      "Offline UX: app shell instant, IndexedDB source of truth offline, sync queue for writes.",
      "Prompt install on user gesture post-value; never cold on load.",
      "iOS: no programmatic prompt — instruct manual add; push limited.",
      "Test offline in Lighthouse + real devices; version all cache names.",
    ],
    recap: `PWAs are the disciplined web: a manifest for installability, a service worker proxying the network with per-resource caching strategies, offline-first UX backed by IndexedDB and sync queues, permission-respecting push, and ruthless cache hygiene — the result is an installable, resilient surface with no store gatekeeper, validated continuously in real offline life.`,
    code: {
      title: "Workbox-style runtime rules sketch",
      language: "javascript",
      code: `workbox.routing.registerRoute(({url}) => url.origin === self.location.origin && url.pathname.startsWith('/api/') ? new workbox.strategies.StaleWhileRevalidate({ cacheName: 'api-v3' }) : new workbox.strategies.CacheFirst({ cacheName: 'static-v3' }));`,
      explanation:
        "Route-aware strategy selection — API reads SWR, everything else cache-first; versioned names invalidate deploys; one rule does what hand-rolled listeners repeat badly.",
    },
    diagram: {
      title: "PWA stack",
      caption: "Manifest, service worker, cache, app.",
      mermaid: `flowchart TD\n M[Manifest] --> SW[Service worker]\n SW --> CA[Cache API + IndexedDB]\n CA --> APP[App shell]`,
    },
  },
  "web-dev-advanced-frontend-micro-frontends-and-web-components": {
    intro: `Micro-frontends decompose a large frontend into independently deployable pieces owned by different teams; Web Components standardize encapsulated custom elements the browser understands natively. The subject is when and how to adopt them — module federation vs iframe vs component sharing, shadow DOM encapsulation, custom elements and their lifecycle — and the organizational trade-offs that decide whether it scales or fractures. micro-frontends trade a unified codebase for parallel delivery — buy it only when coordination cost exceeds integration cost.`,
    foundations: `Composition approaches: (1) iframe — total isolation, poor UX/ perf, legacy integration fallback; (2) Web Components — framework-agnostic custom elements (<org-widget>), shadow DOM style encapsulation, slots, observedAttributes/attributeChangedCallback, lifecycle connected/disconnected; (3) module federation (webpack 5/Vite) — runtime sharing of JS modules across independent builds (shared deps as singletons); (4) server-side composition (ESI/fragments, SSR includes). Team boundaries follow domain ownership (catalog/cart/checkout); contracts: events, URL namespacing, shared auth context; design-system tokens keep consistency.`,
    concepts: [
      {
        title: "Module federation in practice.",
        body: `Host app imports remotes at runtime: remoteEntry.js exposes modules (Button, CheckoutPanel); host resolves URL per env (config map); shared singletons (react, react-dom) declared to avoid duplicate copies; versioning handled by semver-compatible ranges + fallbacks; independent deploys per remote — roll forward freely, host loads whatever is live; failure isolation: load remote with error boundary + timeout; local dev proxies remotes or mocks them; CI per remote + integration smoke suite for the assembled shell.`,
      },
      {
        title: "Web Components: the native encapsulation layer.",
        body: `Custom elements: class extends HTMLElement; register customElements.define('x-name', X); shadow DOM (this.attachShadow({ mode: 'open' })) scopes styles completely (page CSS cannot leak in; component CSS cannot leak out); slots project light DOM children; attributes observed; properties set as JS props; events via CustomEvent bubbling (composed: true crosses shadow boundary); form association via ElementInternals (formAssociated: true). Uses: design-system primitives shared across React/Vue/vanilla stacks, embeddable widgets (consent banners, pricing cards) for third-party sites. Costs: SSR story historically weak (declarative shadow DOM improving), styling theming needs CSS custom properties piercing shadow boundaries deliberately.`,
      },
      {
        title: "Organization, ownership, and contracts.",
        body: `Each micro-frontend owns a domain end-to-end (team = catalog including its API edge); shared shell owns routing, auth, theming; contracts: URL scheme (/catalog/* → catalog MF), custom events (cart:added) or callbacks; auth token via shell-injected context or cookie; design tokens shared as package; versioning: MF-minor upgrades roll independently, major coordination for breaking contract changes — versioned events or URL contracts prevent silent drift; weekly integration builds catch cross-team breakage; "strangulate, then delete" migration from the monolith — no big-bang rewrite.`,
      },
      {
        title: "Performance and shared dependencies.",
        body: `Duplicate bundles are the killer — shared React/lodash/etc as singletons with semantic versioning; MF-specific bundles lazy-load per route; preload critical shells; monitor per-remote bundle weight; caching: immutable remoteEntry per deploy hash; SSR each MF yields best-of-both LCP but doubles infra; hydration cost across boundaries — islands architecture per MF; total page weight budgets enforced in CI; measure field Core Web Vitals per remote (a slow remote must be visible on its team\'s dashboard — incentives align when pain is attributable).`,
      },
      {
        title: "When micro-frontends are the wrong answer.",
        body: `Small teams (< 12 engineers): coordination via monorepo + feature flags + strict CI usually wins; shared runtime duplication, version drift pain, debugging complexity across boundaries, inconsistent UX drift — these are the subscription fees; if teams are not yet blocked by each other's release train, do not pay them; incremental migration: extract one seam at a time (search page first), keep monolith shell alive, ship value each quarter; the architecture mirrors the org — reorganize the org before the code.`,
      },
    ],
    worked: [
      {
        title: "Federate the checkout of a legacy shop.",
        body: `Shell hosts product catalog monolith; checkout extracted as remote (VITE_REMOTE_CHECKOUT_URL); shared React singleton (18.2 both); remote ships /checkout route with its own state; contract: shell provides customer context via custom event 'shell:context' with detail { user, apiBase }; remote emits 'checkout:complete' that shell listens for analytics; deploys independent; checkout team ships 4 times a week without catalog releases; LCP on catalog unchanged (remote not loaded until checkout route); rollback: env var to point checkout to previous version instantly.`,
      },
      {
        title:
          "Build an <org-toast> Web Component for cross-team notifications.",
        body: `customElements.define('org-toast', class extends HTMLElement { connectedCallback() { render template with shadow root, variant attr (success|error|info), auto-dismiss timer 4 s; } }); styles fully encapsulated with tokens via CSS vars; used from React (<org-toast variant="success">Saved</org-toast>), Vue, and static pages; dispatched from any MF via document.createElement('org-toast') — one implementation, zero duplication across three frameworks; a11y: role=status aria-live=polite; prefers-reduced-motion respected; the component earned its name.`,
      },
      {
        title: "Kill a duplicate react-dom in every remote.",
        body: `Three remotes shipped own React copies — 350 KB extra and hook-instance mismatches ("invalid hook call" on shell↔remote boundaries). Fix: shared config { react: { singleton: true, import: 'react', requiredVersion: '^18.2.0' }, 'react-dom': { singleton: true, ... } } in each remote + host; verify with webpack stats that each remote emits ~0 react bytes; runtime handshake validates versions at load, error boundary shows graceful fallback on mismatch; page weight down, runtime stable, peace restored.`,
      },
    ],
    exam: [
      {
        question:
          "What does shadow DOM actually guarantee, and what does it not?",
        answer:
          "It guarantees style encapsulation — outside CSS cannot leak in, component CSS cannot leak out; it does not guarantee event isolation (events still bubble unless composed:false), nor behavior sandboxing like iframes; security isolation requires iframes or separate origins.",
      },
      {
        question:
          "Why must React/react-dom be singletons in module federation?",
        answer:
          'Multiple React copies break hook instance tracking and context delivery — hooks throw "invalid hook call" across boundaries; a singleton import ensures one runtime; version mismatch is caught by the shared negotiation with console errors at load — loud failure beats silent corruption.',
      },
      {
        question:
          "What is the migration strategy for adopting micro-frontends safely?",
        answer:
          "Strangulate incrementally: extract one bounded route (search, then account) as a remote behind the shell, verify, repeat — never rewrite in parallel; the monolith remains the integration test bed until replaced; each quarter ships user-visible value instead of a big-bang nobody survives.",
      },
      {
        question: "When is an iframe preferable to a module federation remote?",
        answer:
          "When hard isolation trumps UX integration: untrusted third-party content, legacy apps with conflicting globals you cannot fix, regulatory separation, or crash-containment needs — at the cost of blank UX, double frameworks, and no shared state; it is the containment tool, not the composition tool.",
      },
    ],
    cheat: [
      "Composition: federation for trusted same-org code, Web Components for framework-agnostic primitives, iframes for isolation.",
      "Singles: react/react-dom singletons; shared semver; runtime version negotiation.",
      "Contracts: URL routes, CustomEvents, token auth via shell; versioned, documented.",
      "Strangle the monolith; never rewrite in parallel; integrate nightly.",
      "Budgets: per-remote bundle caps; field vitals attributed per team.",
      "Web Components: shadow DOM styles, slots, formAssociated for inputs.",
      "Small team? Monorepo + flags beats MF complexity.",
    ],
    recap: `Micro-frontends and Web Components are the scaling tools of the large frontend: module federation swaps code at runtime with shared singletons and independent deploys, Web Components enforce native encapsulation for primitives and embeds, and both succeed only with ruthless shared budgets, contracts, and metrics — the pattern is bought with organizational maturity, not architectural fashion; pay it off or stay monolithic with discipline.`,
    code: {
      title: "Module federation shared config",
      language: "javascript",
      code: `shared: { react: { singleton: true, requiredVersion: '^18.2.0' }, 'react-dom': { singleton: true, requiredVersion: '^18.2.0' } }`,
      explanation:
        "One React across host and remotes; version requirements catch drift at load; the handshake is the whole difference between working MFs and hook explosions.",
    },
    diagram: {
      title: "Micro-frontend assembly",
      caption: "Host composes remotes at runtime.",
      mermaid: `flowchart LR\n H[Host shell] --> R1[Remote A]\n H --> R2[Remote B]`,
    },
  },
  "web-dev-advanced-frontend-realtime-ui-with-websockets": {
    intro: `Realtime UI with WebSockets brings live state into the browser — cursors, presence, chat, collaborative documents, live dashboards — without polling. The subject is building it properly: connection management, reconnect with backoff and resync, optimistic updates, CRDTs for collaborative editing, scaling socket servers, and knowing when SSE or polling is the better choice. realtime UI is about delivering correct ordered state to every client continuously — the socket is the easy part; the semantics are the product.`,
    foundations: `WebSocket (ws): full-duplex over one TCP connection — server can push; not automatic: connection lifecycle events (open/message/close/error); heartbeat ping/pong for liveness; close codes with meaning; authentication on connect (token in query or first message — never URL with secrets that land in logs). Reconnect: exponential backoff + jitter; resume via last-event-id/sequence — server replays gap. Alternatives: SSE for server→client (simpler, auto-reconnect, HTTP/1.1 ok); long-polling worst-case; WS for bidirectional. Collaboration: CRDTs (Yjs, Automerge) give conflict-free merging for text/trees; OT older. Scale: sticky sessions or pub/sub (Redis) between nodes; presence via heartbeat set; backpressure: drop or coalesce.`,
    concepts: [
      {
        title: "Connection lifecycle and reconnection discipline.",
        body: `createSocket(with ticket) → on open: authenticate (first frame auth message with short-lived ticket), send lastSeq for each subscribed room → on message: route by type (presence, op, ack) → on close: backoff schedule (250 ms ×2^n + jitter, max 30 s) → reconnect → resync subscribed channels. In-flight unacked ops: client retry queue or CRDT local copy survives reload (IndexedDB). Distinguish close codes: 1000 normal, 1008 auth failed (stop retrying, re-login), 1011 server error (retry). Never reconnect-storm after deploy — jitter everyone; server drains sockets gracefully (send reconnect-requested with new node hint).`,
      },
      {
        title: "Optimistic UI and server reconciliation.",
        body: `Apply user intent immediately (optimistic), then reconcile with server echo: temporary id → confirmed id swap; conflicts resolved by server order (ops carry seq); failure path: rollback with toast + retry; pending state visible (clock icon); never show unconfirmed state to others ahead of server authority. Pattern: client op log with ack tracking; server assigns global order; client rebases local pending ops on incoming remote ops (OT/CRDT do this natively). For presence/cursors, loss-tolerant: last-writer-wins positions, drop stale, no persistence.`,
      },
      {
        title: "CRDT collaboration from first principles.",
        body: `Shared editing needs merge semantics: CRDTs (Yjs etc.) make concurrent inserts/deletes commute — no central arbiter required for convergence; local updates apply instantly; ops serialize (Y.encodeStateAsUpdate) to bytes over WS/WebRTC; server can be a dumb relay + optional persistence; awareness protocol for cursors/selection separate from doc state; offline edits merge on reconnect automatically; undo needs scoping per user (Y.UndoManager); complexity budget: adopt existing library, never hand-roll CRDTs; boundary cases (schema migrations of doc structure) still need care — version the document root.`,
      },
      {
        title: "Scaling socket servers in production.",
        body: `Horizontal scale: sticky LB (cookie) or Redis pub/sub fan-out — any node can publish to all nodes subscribed to a room; thousands of connections per node fine (memory ~KB each, event-loop non-blocking); presence ledger in Redis SETEX per user; hot rooms (live sports trivia 200k) — dedicated shard or CDN-ish relay tier; per-connection limits + global caps; slow consumer policy: drop frames with backpressure counter, then disconnect with reason (a slow phone must not buffer gigabytes); observability: connected sockets, messages/s in/out, broadcast fan-out latency, reconnect storm rate — these four charts catch most realtime incidents.`,
      },
      {
        title: "When WebSockets are the wrong tool.",
        body: `Server→client only (progress, notifications, live feed)? SSE — plain HTTP, automatic retry with Last-Event-ID, proxy-friendly, zero WS infra. Infrequent updates (once a minute)? Polling with cache headers beats WS complexity. One-way heavy streams with huge scale and no interactivity? CDN + long-poll or SSE. WS earns its keep with: bidirectional low-latency (< 100 ms), high message rates, collaboration. Choose per direction, latency and rate — and remember every WS is a stateful commitment from a stateless-friendly world; deploys need drain, LB needs awareness, monitoring needs the four charts.`,
      },
    ],
    worked: [
      {
        title: "Build collaborative cursors over WebSockets.",
        body: `Each user: socket sends { type:'awareness', name, color, selection } throttled 20 Hz; gateway dedups per room via Redis publish; clients render remote cursors from awareness state (ephemeral, last-writer-wins by timestamp, TTL 10 s on disconnect); local cursor never blocks on network (send-on-move, no ack); render via absolutely positioned overlay layer with transform; 10 users: 200 msg/s total — trivial; the UX is magic, the infra is a pub/sub hiccup.`,
      },
      {
        title: "Make a dashboard live without melting the API.",
        body: `Metrics page polled every 5 s (1k users = 200 rps of identical queries). Migrate to SSE: metrics service recomputes every 2 s and publishes to Redis → SSE endpoints push diffs to subscribers → browser EventSource updates charts; on reconnect, sends Last-Event-ID, server replays from a 30 s ring buffer; API load dropped 95%; users see sub-second freshness; total new code: ~150 lines including history replay — SSE was the right tool and the team never paid the WS tax.`,
      },
      {
        title: "Reconnect storm after a deploy, fixed.",
        body: `Deploy restarted all pods simultaneously; 8k clients reconnected instantly and slammed auth + subscribe (CPU 90% for 5 min). Fixes: pods drain with reconnect-requested + randomized client backoff (already existed but too tight — widened, full jitter); rolling restart with maxUnavailable 1; reconnect SLO alert on storm rate; staging load test replays 8k reconnects; next deploy: zero blips; lesson: realtime systems fail at the edges of the lifecycle, not the steady state.`,
      },
    ],
    exam: [
      {
        question:
          'Why must clients resync by sequence number after reconnect instead of "just listen"?',
        answer:
          "The gap while disconnected is silent and arbitrary; seq-based replay closes it deterministically — the server sends everything after lastSeq in order, no missed events, no double-render if dedupe persists; without it, clocks drift into quiet corruption.",
      },
      {
        question:
          "What is the advantage of CRDTs for collaborative text over a server-serialized op log?",
        answer:
          "CRDT ops commute — convergence is guaranteed without a central sequencer, enabling offline edits, peer-to-peer sessions, and simple relay servers; serialization still wins for app-level invariants and simple mental models — choose deliberately, not by fashion.",
      },
      {
        question:
          "Why do real deployments avoid routing all WS traffic through one node without a broker?",
        answer:
          "A single node holds all sockets — deploy, crash, or scale event loses every connection simultaneously, and adding nodes is impossible without redistributing ownership; a broker (Redis pub/sub or NATS) decouples presence from placement, enabling drains, autoscaling and zero-downtime deploys.",
      },
      {
        question:
          "When does backpressure demand disconnecting a consumer instead of buffering?",
        answer:
          "When a consumer cannot keep pace indefinitely, unbounded buffering eats server memory until an OOM takes everyone down; bounded per-connection queues with drop policies and disconnect-slow-consumer protect the whole fleet — stale data the user never sees is worse than a reconnect.",
      },
    ],
    cheat: [
      "WS = bidirectional low-latency; SSE = server→client default; polling = fallback.",
      "Backoff + jitter reconnects; resume with lastSeq replay; ack-tracked pending ops.",
      "Optimistic apply → server echo reconcile; rollback on failure with toast.",
      "CRDT (Yjs/Automerge) for collaboration; awareness for cursors, ephemeral.",
      "Redis pub/sub routing; sticky or broker — never one node of sockets.",
      "Metrics: sockets, msgs/s, fan-out lag, reconnect storms — the four charts.",
      "Drain on deploy; reconnect storms are killers — jitter everything.",
    ],
    recap: `Realtime UI is correct ordered state delivery over stateful pipes: choose WS/SSE/polling by direction, latency and rate; authenticate on connect, backoff with jitter, resume by sequence; apply optimistically and reconcile via the server; use CRDTs where edits commute; route through a broker so nodes are disposable; and protect the fleet with bounded queues and slow-consumer drops — the magic users feel is math you rehearsed.`,
    code: {
      title: "Exponential backoff connect loop",
      language: "javascript",
      code: `let attempt = 0;\nfunction connect() {\n const s = new WebSocket(url);\n s.onopen = () => { attempt = 0; s.send(JSON.stringify({ type: 'resume', lastSeq })); };\n s.onclose = () => setTimeout(connect, Math.min(30000, 250 * 2 ** attempt++) * (0.5 + Math.random()));\n}`,
      explanation:
        "Jittered exponential backoff caps reconnect storms; resume handshake restores the gap before any new event renders.",
    },
    diagram: {
      title: "Realtime topology",
      caption: "Gateways, broker, storage, clients.",
      mermaid: `flowchart LR\n C1[Client] --> G[Gateway]\n G --> R[Redis pub/sub]\n R --> G2[Gateway 2]\n G2 --> C2[Client]`,
    },
  },
  "web-dev-advanced-frontend-webassembly-introduction": {
    intro: `WebAssembly (Wasm) is a portable bytecode format the browser executes at near-native speed — bringing C, C++, Rust and Go code to the web for computation-heavy jobs JavaScript was never designed to do fast. The subject is knowing when Wasm wins (and when it does not), the Rust→Wasm toolchain, JS interop patterns, and the performance case studies that decide which 5% of your app deserves it. Wasm is for computation that would otherwise melt the main thread — everything else is JavaScript with extra steps.`,
    foundations: `Wasm modules are binary, sandboxed (no raw memory access outside linear memory), validated before execution, and run in every major browser. Toolchain: Rust + wasm-bindgen (or Emscripten for C/C++) → .wasm + JS glue; instantiate with WebAssembly.instantiateStreaming (compiles while downloading); linear memory shared as ArrayBuffer views; WASM/JS boundary cost per call (~microseconds) — batch work across the boundary. Not: DOM access (no direct — via JS), full threading model still evolving (threads via SharedArrayBuffer + COOP/COEP headers). Use cases: codecs, parsers/compilers, physics, crypto, image/video processing, CAD, emulators.`,
    concepts: [
      {
        title: "When Wasm wins — and when it loses.",
        body: `Wins: heavy compute already written in native languages (ffmpeg.wasm, SQLite compiled, zstd, image codecs, tree-sitter); algorithms with predictable hot loops (crypto, compression, physics); CPU-bound libraries with no good JS equivalent; Actions on huge buffers. Losses: DOM-heavy UI work (Wasm cannot touch DOM natively — JS is strictly better there); frequent tiny calls across the boundary (marshalling cost dominates); code better expressed in optimized JS JIT for typical scalar logic — V8 is excellent; Wasm ≠ universal speedup; profile first — if the hot path is rendering or network, Wasm helps nothing. Rule: measure time, locate the 10% of code = 90% of time, then decide.`,
      },
      {
        title: "The Rust to Wasm toolchain, practically.",
        body: `cargo new --lib crate → add crate-type cdylib → wasm-pack build --target web → emits pkg/ with .wasm + JS bindings (wasm-bindgen generates get/set for exports); import { greet } from './pkg' — call like any module; types mostly automatic via wasm-bindgen; for no-export-pure-compute: bind functions returning numbers/strings; memory management: pass arrays as Vec<u8> or pre-allocated linear memory + manual pointer passing for zero-copy (advanced); wasm-bindgen-futures for async; keep the API surface tiny — every crossing costs; smaller exports = smaller glue.`,
      },
      {
        title: "Calling convention, memory, and cost accounting.",
        body: `Per-call overhead: ~0.05-2 µs — irrelevant for 50 ms computations, fatal for 5 µs loops of tiny calls; batch APIs (process_all(buffer) not process_one called 1M times); copying vs sharing: pass ArrayBuffers (memory.grow or exported memory views) for zero-copy access from JS — or copy small arrays, simpler; strings are UTF-8/UTF-16 conversions — costly, minimize; consider transferable semantics for big buffers passed to workers. Threading: wasm threads via atomics.wait on SharedArrayBuffer requires cross-origin isolation (COOP/COEP headers) — check deployment constraints before promising parallelism.`,
      },
      {
        title: "Case studies: codecs, parsers, database, CAD.",
        body: `Media: ffmpeg.wasm (transcoding small clips in-browser for previews — 10-30x slower than native but usable, saves server cost); SQLite WASM (client-side in-browser SQL — notebooks, demos, offline-first prototypes); tree-sitter (incremental parsing for web IDEs); PDFium (rendering); CAD (OpenCascade → Wasm for FreeCAD-class browser tools); game engines (Godot exports); compression (brotli, zstd); cryptography (libsignal, libsodium.js). Pattern recognition: they are all algorithms-with-libraries, CPU-bound, already native — Wasm distributed the capability, not invention; your path likely matches one of these shapes.`,
      },
      {
        title: "Debugging, measurement, and delivery.",
        body: `Debug: source maps for Rust (wasm-pack debug builds), DWARF in Chrome DevTools, console.log from wasm-bindgen; profile: Performance panel with wasm frames + Wasm-specific timings; flamegraphs via Chrome Tracing; size: wasm-opt -O3/-Os (Binaryen) strips unused code; gzip/brotli on served .wasm (served with application/wasm + cache headers, immutable or versioned names); fallbacks for ancient browsers: feature-detect WebAssembly, degrade to JS path if needed (rare now); CI: run wasm tests in headless browser; bundle: lazy-load the module only when the feature activates (import() on first use) — Wasm belongs in its own chunk, not the critical path.`,
      },
    ],
    worked: [
      {
        title: "Replace a JS image decoder with wasm.",
        body: `A custom medical image format decoded in JS took 900 ms — UI froze. Port to Rust (decoder crate compiled to Wasm, wasm-bindgen export decode(ptr, len)); JS passes Uint8Array once, gets pixels back; call wrapped in requestIdleCallback, progress bar wired; total decode 60 ms; bundle cost +140 KB gz lazy-loaded on route; users on mid-tier Android went from jank to instant; JS fallback kept for ancient browsers via dynamic import.`,
      },
      {
        title: "Stream a 200 MB CSV parse through Wasm.",
        body: `Papa Parse choked; ported parser to Rust with fast UTF-8 validation and SIMD-ish paths (manual, no intrinsics needed); chunked 64 KB reads from file stream, each chunk passed to Wasm; results appended incrementally; memory flat; 200 MB in 3.5 s (JS: 14 s and GC thrash); DOM updates throttled to 4 Hz; the feature moved from "power user beta" to default; the team kept the architecture lesson: big buffer + compute + batch, exactly the Wasm shape.`,
      },
      {
        title: "Measure boundary cost before building.",
        body: `Proposed "Wasm sort of 1M items" — micro-benchmark said sort faster in JS anyway (V8's Timsort is good); the Wasm overhead + copying exceeded wins at this granularity. Verdict: do not build; instead moved the heavy neighbor-search (100k points, O(n log n) KD-tree) to Wasm — 8x faster than the naive JS version; lesson: benchmark the actual kernel and crossing pattern before committing; teams that skip this ship Wasm for applause and maintain it forever.`,
      },
    ],
    exam: [
      {
        question: "Why can WebAssembly not touch the DOM directly?",
        answer:
          "Wasm is a sandboxed compute container — its world is linear memory and the JS API it is exposed; every DOM effect crosses the JS boundary by design (isolation + safety); that crossing cost is exactly why compute-then-return shapes win and per-node DOM loops in Wasm would lose catastrophically.",
      },
      {
        question: "What headers are required for SharedArrayBuffer, and why?",
        answer:
          "Cross-origin isolation via Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp — the Spectre-class mitigations browsers demand before handing out shared memory and threads; without them, Wasm threads are unavailable regardless of code.",
      },
      {
        question:
          "When does calling Wasm from JS become slower than staying in JS?",
        answer:
          "When calls are frequent and tiny (marshalling dwarfs the work), when the data copied across outweighs compute savings, or when the JS engine already optimizes the pattern well — V8/JIT wins on straight-line numeric code; Wasm wins on branchy algorithms, SIMD, and pre-existing native libraries.",
      },
      {
        question: "What does wasm-opt do and why run it before shipping?",
        answer:
          "Binaryen optimization passes: dead-code elimination, inlining, size reduction (typically 10-30%) with zero semantic change — smaller download, faster parse; shipping unoptimized Wasm is shipping an unbuilt release; run it in CI like minification.",
      },
    ],
    cheat: [
      "Wasm = compute offload; DOM stays JS; boundary crossing is the budget.",
      "Rust + wasm-pack + wasm-bindgen is the sane default toolchain.",
      "Batch APIs; pass ArrayBuffers when zero-copy matters; minimize strings.",
      "Threads need SharedArrayBuffer + COOP/COEP; verify before promising.",
      "Lazy-load Wasm; versioned chunk; wasm-opt; brotli.",
      "Profile the kernel before committing; not everything gets faster.",
      "Feature-detect and keep a JS fallback path where cheap.",
    ],
    recap: `WebAssembly extends the web with near-native computation: sandboxed bytecode executed fast, wired to JS via bindgen glue, ideal for hot kernels and ported native libraries — the discipline is batching across the boundary, measuring before committing, optimizing with wasm-opt, isolating with COOP/COEP when threading, and lazy-loading so Wasm never taxes the critical path; where the DOM is the workload, JavaScript remains king.`,
    code: {
      title: "Instantiate a module",
      language: "javascript",
      code: `const bytes = await fetch('/pkg/app_bg.wasm');\nconst { instance } = await WebAssembly.instantiateStreaming(bytes, imports);\ninstance.exports.process(buf);`,
      explanation:
        "Streaming compilation overlaps download with compile; imports wire JS callbacks/memory; exports are the Wasm API surface — keep it tiny and batch-oriented.",
    },
    diagram: {
      title: "Wasm in the browser",
      caption: "JS orchestrates; Wasm computes.",
      mermaid: `flowchart LR\n JS[JS main thread] -->|call| WA[Wasm module]\n WA -->|results| JS`,
    },
  },
  "web-dev-advanced-frontend-accessibility-auditing-in-practice": {
    intro: `Accessibility auditing is the practice of verifying your interface works for every human — keyboard-only, screen reader, low vision, motor, cognitive — and fixing what fails. The subject is the honest audit loop: automated scanning (axe), manual keyboard passes, screen reader walkthroughs (NVDA/VoiceOver/JAWS), focus management, and the patterns that catch what automation never sees. an accessible product is not niche — it is the product working, period.`,
    foundations: `WCAG 2.1 AA as the pragmatic bar: 1. Perceivable (text alternatives, contrast 4.5:1, resize 200%), 2. Operable (keyboard everything, no traps, visible focus, no flashing, skip links), 3. Understandable (labels, errors, consistent nav), 4. Robust (valid ARIA, name/role/value, parsing). Tools: axe DevTools / axe-core (automation catches ~30-40%), Lighthouse accessibility audit, Pa11y CI; manual: tab through page top to bottom, every interactive element reachable + operable + visible focus ring, logical order; screen readers: NVDA (Windows, free), VoiceOver (macOS/iOS), JAWS; browser zoom 200%; reduced motion; forced-colors mode.`,
    concepts: [
      {
        title: "Automated audits: what they catch and what they miss.",
        body: `axe scans DOM for objective violations: missing alt, low contrast (verifiable), form inputs without labels, duplicate ids, aria-invalid attribute use, missing landmarks, heading order. Wire it in CI: axe-core against key pages (violations fail the build), Pa11y in pipelines, Storybook a11y addon per component. Missed entirely: focus order wrongness, keyboard traps on custom widgets, screen reader UX (announcement quality, verbosity), logic-vs-intent mismatch (aria-label="Click me" on Buy button), content quality, animation harm, cognitive load. Ratio: automation finds, humans verify — budget for both.`,
      },
      {
        title: "Keyboard-only pass: the 80% wins.",
        body: `Start at body: Tab order must follow visual/logical order; skip link first ("Skip to main content"); every control reachable: native buttons/links/inputs inherently fine — custom divs need role=button tabindex=0 + keydown handlers (Enter/Space); visible focus ALWAYS (outline or ring — never outline-none without replacement; focus-visible polyfill pattern); no positive tabindex (jumps the queue); escape closes modals; arrow keys navigate composite widgets (tabs, radios, menus — roving tabindex); focus trapped in modal until closed, restored to trigger; logical grouping via fieldsets/legends.`,
      },
      {
        title: "Screen reader walkthroughs and ARIA.",
        body: `Run NVDA or VoiceOver: navigate by headings (H key) — structure must make sense; landmarks (nav/main/aside) announce; forms: every input announced with label + role + error state (aria-describedby wiring); buttons announce name/role; dynamic updates: aria-live=polite for toasts, assertive for errors/confirms; modals: aria-modal + labelledby, focus trap, background inert; page title updates per route (document.title in SPAs!); images alt meaningful or empty=true decorative; icon buttons need aria-label; the experience is a narrative — make it read coherently, not just tick checkboxes.`,
      },
      {
        title: "The failure taxonomy and fixing common bugs.",
        body: `Ranked offenders: (1) unlabeled icon-only buttons; (2) missing alt text; (3) color-only meaning (red border = error); (4) poor focus rings removed globally; (5) custom select without keyboard/ARIA; (6) modals without trap/restore; (7) skip-link absent; (8) vague link text ("click here"); (9) contrast on placeholders/disabled; (10) route title never updates. Fix pattern: semantic HTML first (button beats div+role), then minimal ARIA (first rule of ARIA: do not use ARIA when native works), then style; verify in the matrix: keyboard × SR × zoom × contrast × motion — five small passes per release.`,
      },
      {
        title: "Process: from audit to culture.",
        body: `Definition of done includes: keyboard pass on new UI, axe clean in CI, SR sanity on interactive flows, contrast tokens audited, reduced-motion path; design review checklist (focus states drawn, error states labeled, content hierarchy); quarterly third-party audit or rotation (fresh eyes catch accrued drift); user testing with disabled users when building core flows — nothing substitutes lived feedback; track a11y bugs in the same backlog as everything else — separate labels become ghettos; SLAs on critical a11y regressions like any prod bug.`,
      },
    ],
    worked: [
      {
        title: "Keyboard-audit a checkout flow and fix four blockers.",
        body: `Pass 1 Tab: promo code input reachable; "Pay now" div-style button unreachable (no tabindex) → converted to real <button>; address autocomplete listbox not keyboard navigable → roving tabindex + Enter select; modal for saved cards traps focus correctly but does not return focus on close → stored trigger ref, focus restored; skip link absent → added; re-run: entire flow from address bar to confirmation completable with keyboard alone; timing: 90 minutes; impact: unblocks motor-impaired and power-keyboard users entirely.`,
      },
      {
        title: "Empty-state error announcements via aria-live.",
        body: `Form errors appeared visually only; screen reader users heard silence on submit. Fix: error summary at top with role=alert (assertive) listing errors with jump links to fields (WCAG 3.3.3 suggestion); field-level aria-invalid + aria-describedby text actually read on focus; success toast role=status; the change required no redesign — only correct wiring of semantics the DOM already held; SR walkthrough went from silent failure to guided recovery.`,
      },
      {
        title: "Contrast rescue of the settings panel.",
        body: `axe failed 14 nodes: muted labels 3.2:1, disabled buttons 2.1:1, primary-on-tint selected state 2.8:1. Token-level fix: surface-muted darkened to hit 4.6:1; disabled conveyed by icon + label not color alone; selected rows use left border + bold + check icon; re-audit zero violations; tokens recorded so future components cannot reintroduce silently; the settings page is now shippable in high-brightness outdoor glare — the test condition that matters, not the lab.`,
      },
    ],
    exam: [
      {
        question:
          "Why does automated testing (axe) cover only about a third of accessibility?",
        answer:
          "It detects objective, static violations in the DOM, not interaction quality — wrong focus order, keyboard traps in custom widgets, confusing announcements, inert error handling, and cognitive clarity are invisible to it; manual and screen-reader passes cover the rest, and no option substitutes for them.",
      },
      {
        question:
          "What is the first rule of ARIA, and why does semantic HTML win?",
        answer:
          "Do not use ARIA if a native HTML element does the job — native elements carry battle-tested name/role/value, keyboard behavior and platform semantics for free; ARIA adds only the annotation layer and often nothing the tag does not already do; fewer ARIA roles usually means more accessibility.",
      },
      {
        question: "What focus-related defects defeat keyboard flows in modals?",
        answer:
          "No initial focus target (user stays on background control), no trap (Tab escapes behind the overlay), no restore (focus lost to body on close), and missing aria-modal/labelledby — the fix trio: initial focus to first interactive, cycle within the modal, restore to the trigger on close.",
      },
      {
        question:
          "Which three habits make accessibility an org norm instead of a project?",
        answer:
          "CI gates (axe clean or build fails), definition-of-done keyboard passes and SR smoke tests per PR, and scheduled third-party or rotating internal audits with real users — incentives and process, not heroics; accessibility regressions then get caught as ordinary defects before release.",
      },
    ],
    cheat: [
      "WCAG AA bar: 4.5:1 contrast, keyboard all things, visible focus, skip link.",
      "axe in CI + Pa11y; automation finds ~35%; keyboard pass finds the rest.",
      "Native HTML > ARIA; first rule: no ARIA when native suffices.",
      "Modals: initial focus, trap, restore, aria-modal + labelledby.",
      "aria-live polite for toasts, assertive for errors; route title updates.",
      "Screen readers: NVDA/VoiceOver nav by headings and landmarks.",
      "DoD: keyboard + axe + SR sanity + reduced motion per release.",
    ],
    recap: `Accessibility auditing is human-in-the-loop verification: automation (axe) for the objective third, keyboard passes for the interaction layer, screen reader narrative for the experience — fix with semantic HTML first, minimal ARIA second, and process (CI gates, definition-of-done, real-user testing) as the guarantor; the measure is not audit scores but whether a disabled user can simply... use it.`,
    code: {
      title: "Axe in a test",
      language: "javascript",
      code: `import { axe } from 'jest-axe';\ntest('page has no violations', async () => {\n const { container } = render(<App />);\n expect((await axe(container)).violations).toHaveLength(0);\n});`,
      explanation:
        "Every render audited automatically in CI; regressions fail the build — the cheapest possible prevention layer for the objective class of issues.",
    },
    diagram: {
      title: "Audit layers",
      caption: "Machines, keyboards, humans.",
      mermaid: `flowchart TD\n A[axe automated] --> K[Keyboard pass]\n K --> S[Screen reader pass]`,
    },
  },
  "web-dev-advanced-frontend-client-state-at-scale": {
    intro: `Client state at scale is the discipline of managing a large frontend's in-browser state without chaos — normalized caches, state machines, URL-as-state, and the boundaries between server cache and client atoms. The subject is taming sprawling app state: identifying what belongs where, normalizing entity graphs, modeling workflows as state machines, and making the whole thing debuggable years later. most "state problems" are placement problems — the right state in the wrong layer is worse than no state at all.`,
    foundations: `Classification before tooling: server state (remote, cacheable → TanStack Query), URL state (shareable → search params), global client state (auth, theme → store/context), local component state (useState), ephemeral scratch (useRef). Zustand/Jotai for atomic stores; Redux Toolkit for complex reducer logic with DevTools time-travel; XState for explicit state machines (payment flows, wizard steps, upload lifecycles); normalization: entities by id (postsById: Record<id, Post>, allIds: string[]) — no duplication, O(1) updates; selectors to derive views; immer for ergonomic updates. URL state: useSearchParams with typed parsing — bookmarkable, back-button-correct.`,
    concepts: [
      {
        title: "Classification first, libraries second.",
        body: `Inventory every piece of state on the page and file it: (1) server-owned? → query cache; (2) belongs in a shareable link? → URL params; (3) needed app-wide at low frequency? → context or store (auth user, theme, feature flags); (4) lives and dies inside a component subtree? → local state near the leaves (never lift prematurely); (5) derived? → selector/useMemo, not stored. The discipline alone removes most pain before a single store exists; the tools then serve the taxonomy: query cache syncs (1), params drive (2), store or context holds (3), local state hosts (4).`,
      },
      {
        title: "Normalized state for entity graphs.",
        body: `Denormalized nesting duplicates data and makes updates nonlocal — fixing one comment means walking the tree. Normalize: { entities: { users: { id: {...} }, comments: {...} }, relations: { postId → [commentIds] } }; update by id touches one node; selectors reassemble view models (useSelector(selectCommentsForPost) memoized); Redux Toolkit\'s createEntityAdapter packages this; or use TanStack Query with manual normalization if Redux feels heavy; GraphQL clients (Apollo) normalize automatically. Normalization costs indirection — pay it only beyond a few nested levels or when sharing entities across views.`,
      },
      {
        title: "State machines for multi-step flows.",
        body: `Wizard/payment/upload flows are state machines disguised as if-soup — model explicitly: XState createMachine({ id: 'checkout', initial: 'editing', states: { editing, validating, processing, done, error }, on: { VALIDATE: { target: 'validating' }, ... } }) — transitions legal only from valid states, impossible states unrepresentable, visualizable, testable without rendering; actors trigger services (payment call); guards handle branching (age ≥ 18). Forbid ad-hoc boolean flags (isLoading, isError, hasTried) — three booleans = eight states, seven are bugs. Machines make flows readable for the on-call engineer at 3 AM.`,
      },
      {
        title: "URL as the shareable source of truth.",
        body: `Anything worth bookmarking belongs in the URL: active tab, filters, search query, pagination cursor, selected entity, comparison mode; parse with schema (coerce defaults, clamp page, whitelist enums — never trust raw params); write via router replace (no history per keystroke) or push (undoable actions like tab switches? prefer replace for transient); server components can render from the same params (SSR-able views); the URL is the cheapest collaborative state you will ever build — no sync code, no conflicts, trivially shareable; delete redundant stores of param data ruthlessly.`,
      },
      {
        title: "Debugging state at scale.",
        body: `DevTools: Redux DevTools (time travel, action log with diffs) — replay any bug statelessly; Zustand devtools middleware; XState visualizer; why-did-you-render for render storms; Monkey-patching console.trace on store writes (grepable); snapshot the whole store to JSON for bug reports (serialize select slices, attach to issue). Hygiene: selectors colocated, no store reads outside components/hooks except in actions, middlewares for logging in dev only; the performance becomes visible only with structured inspection — without it, state bugs are ghost stories.`,
      },
    ],
    worked: [
      {
        title: "Normalize a nested comments tangle.",
        body: `Comments nested in posts with replies nested in comments — edit one comment = map over posts → find post → find comment → find reply — O(n·m) inaction and bug-prone. Normalization: commentsById: Record<id, Comment> (with parentId), postIds: string[], commentIdsByPost: Record<postId, id[]>; selectComments(postId) reassembles memoized tree; edit/delete = one map set; like-count updates anywhere propagate everywhere; render count measured; code shrank 40%; racing bugs vanished because the update site is single, indexable, and obvious.`,
      },
      {
        title: "Machine a three-step KYC flow.",
        body: `States: form → uploading → verifying → done | rejected; events SUBMIT, UPLOAD_OK, UPLOAD_FAIL (retry edge), VERIFY_PASS/VERIFY_FAIL; context: { files, applicantId, attempts }; guards: files.length ≥ 1 for SUBMIT, attempts < 3 for retry; actors: uploadService (resumable), verifyService (polling API); UI binds machine state → stepper render, error banners, retry affordance; QA walks states via visualizer, no guesswork; a support ticket arriving mid-flow can quote the exact machine state — incident triage so much cleaner.`,
      },
      {
        title: "Move dashboard filters into the URL.",
        body: `Filters were useState — refresh lost everything, Slack links useless ("look at this spike" → everyone sees default view). Refactor: useSearchParams with zod-coerced parse; onChange navigates replace with serialized params; initial render from params (server-renderable in Next); saved views = bookmarked URLs; the store lost 120 lines; product analytics now attributes views by filter set naturally; support pastes URLs in tickets — reproducible bug reports by default.`,
      },
    ],
    exam: [
      {
        question:
          "What criterion decides between query cache and a global store for a piece of data?",
        answer:
          "Ownership and staleness: remote shared data the server owns → query cache (fetch/dedupe/invalidate solves consistency); client-owned ephemeral or preference data the user owns → store; putting remote data in the store reimplements cache invalidation badly, every time.",
      },
      {
        question:
          "When does normalizing entity state pay off, and what does it cost?",
        answer:
          "When entities are shared across views, nested beyond a couple of levels, or updated from multiple surfaces — O(1) indexed updates replace tree walks; the cost is indirection through id maps and the discipline to select derived views with memoized selectors; trivial apps can skip it until shared pain appears.",
      },
      {
        question:
          "What does an explicit state machine eliminate that booleans cannot express?",
        answer:
          "Illegal combinations (loading ∧ error ∧ done simultaneously) — transitions become the only legal state changes, impossible states unrepresentable, the whole flow drawn and tested independently — modulo hidden paths nobody documents.",
      },
      {
        question: "Why prefer the URL over store for shareable view state?",
        answer:
          "URL state is free persistence, free collaboration, free SSR, and free correctness — back/forward, refresh, direct links all just work with zero sync code; store copies of the same truth are duplicated state guaranteed to drift; the URL should be the source, store the mirror at most.",
      },
    ],
    cheat: [
      "Classify: server → query cache; shareable → URL; app-global client → store/context; local → useState; derived → selectors.",
      "Normalize entities: Record<id, T> + id arrays; selectors reassemble.",
      "XState/state machines for flows; boolean flags = hidden state explosions.",
      "URL params: typed parse, clamp, whitelist; replace vs push deliberately.",
      "Derived state via useMemo/selectors; never store what you can compute.",
      "DevTools/time-travel on; store reads in hooks/actions only.",
      "Snapshot slices for bug reports; selector-first debugging.",
    ],
    recap: `Client state at scale is placement discipline before tool choice: query cache owns server truth, URLs own shareable views, stores own app-global client state, local state owns components, selectors own derivations; normalize shared entity graphs, model flows as explicit machines, and make the whole thing inspectable with DevTools — the codebase tells one coherent story, which is all large-scale frontends really need.`,
    code: {
      title: "Entity adapter upsert pattern",
      language: "javascript",
      code: `const posts = createEntityAdapter({ selectId: (p) => p.id });\nstate.posts = posts.upsertOne(state.posts, action.payload);`,
      explanation:
        "Normalized upsert by id — insert or replace in O(1); the pattern scales to huge collections with no structural choices left to make ad hoc.",
    },
    diagram: {
      title: "State placement",
      caption: "Right state, right layer.",
      mermaid: `flowchart TD\n S[State on the page] --> Q[Query cache]\n S --> U[URL params]\n S --> G[Store or context]\n S --> L[Local state]`,
    },
  },
};
