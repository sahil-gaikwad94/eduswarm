import type { TopicLesson } from "../topicLessons.js"; /** * JavaScript and TypeScript — 9 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const javascriptAndTypeScript: Record<string, TopicLesson> = {
  "web-dev-javascript-and-typescript-modern-javascript": {
    intro: `Modern JavaScript is the language as it has evolved since ES2015: arrow functions, classes, destructuring, promises, modules, and a handful of quality-of-life operators that together make the language far more expressive than the original. The subject is the semantic machinery underneath — scopes, closures, the prototype chain, and modules — because understanding those mechanics is what separates reading code from debugging it. modern JavaScript is a dynamic, prototype-based, garbage-collected language, and every feature is syntax layered over those three ideas.`,
    foundations: `Variables: var is function-scoped and hoisted; let and const are block-scoped and in the temporal dead zone until initialized. Functions are first-class values. Arrow functions inherit this lexically and can be concise; function declarations hoist as whole bindings. Everything is an object except primitives (string, number, bigint, boolean, symbol, undefined, null), which are immutable; objects are reference types compared by identity. The prototype chain delegates property lookups; classes are sugar over prototypes. Modules are file-scoped: import/export explicitly declare boundaries.`,
    concepts: [
      {
        title: "Scopes, hoisting, and closures.",
        body: `JavaScript has global, function, and block scope. var is scoped to the enclosing function and hoisted to the top of it (initialized as undefined); let and const are scoped to the enclosing block and uninitialized until the declaration line. A closure is a function that remembers the variables of its lexical environment even after that environment has returned. The classic trap: for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)) prints 3 3 3 because all three callbacks share one binding; use let for a fresh binding per iteration, or pass the value as an argument. Closures power private state, factories, memoization, and partial application.`,
      },
      {
        title: "Objects, this, and the prototype chain.",
        body: `Objects are bags of property keys mapping to values; methods are functions stored as properties. this is bound at call time: called as obj.m() binds this to obj; called as a plain function, this is undefined in strict mode; arrow functions inherit the enclosing this; call/apply/bind set it explicitly. The prototype chain is the delegation path: every object has an internal [[Prototype]]; property lookup walks the chain until found or null; modern classes desugar to prototype methods plus a constructor. Arrays, dates, and errors are objects built on the same machinery with their own prototypes ([[Prototype]] links).`,
      },
      {
        title: "Destructuring, spread, and rest.",
        body: `Array destructuring pulls elements by position (const [a, b] = arr); object destructuring pulls by name (const { a, b } = obj) with rename ({ a: x }) and default ({ a = 1 }) support. Rest collects leftovers (const [head, ...tail] = arr); spread expands (const copy = { ...obj }, const merged = [...a, ...b]). Shallow copies only copy the top level; nested objects are shared. Destructuring with defaults in parameters (function f({ port = 3000 } = {})) is the standard signature idiom for configuration objects.`,
      },
      {
        title: "Modules: ESM syntax and interop.",
        body: `ESM is the standard: import x from './m.js' imports a default export, import { x } from './m.js' imports a named export, import * as ns imports a namespace. Exports: export const, export function, export default; a module has one default export. Module scope is private: nothing leaks to global unless deliberately attached. Dynamic import() returns a promise of a module and enables code splitting. CJS (require/module.exports) still powers much of the Node ecosystem; bundlers bridge both; the package.json type field decides how .js files are interpreted.`,
      },
      {
        title: "The operators that matter: ?., ??, and ||.",
        body: `Optional chaining (obj?.a?.b) short-circuits to undefined when any link is nullish instead of throwing; nullish coalescing (a ?? b) falls back only on null/undefined, preserving legitimate falsy values like 0 and empty string that || would swallow. Optional chaining combined with ?? replaces most manual presence checks. Also worth knowing: logical assignment (??=, ||=, &&=) and structuredClone for deep copies of plain data.`,
      },
    ],
    worked: [
      {
        title: "Fix the classic closure-in-a-loop bug.",
        body: `Symptom: three async callbacks all see the final loop value. Root cause: one shared var binding captured by all callbacks. Fix A: let creates a new binding per iteration. Fix B: wrap in an IIFE or pass the value through a function argument (setTimeout((j) => ..., 0, i)). Fix C: use for (const item of list) — const also binds per iteration. Understand the fix, not just the patch: closures capture variables by reference to the binding, not by value snapshot.`,
      },
      {
        title: "Repair this in a class callback.",
        body: `A class method passed as a callback loses this: button.addEventListener('click', this.handleClick) crashes on this inside handleClick because the listener is called as a plain function. Fixes: bind in constructor (this.handleClick = this.handleClick.bind(this)); use an arrow class field (handleClick = () => { ... }) which captures the instance this lexically; or pass an arrow at the call site. In modern code the arrow field is the cleanest default.`,
      },
      {
        title: "Destructure a real API response with defaults.",
        body: `const { data: { users = [], meta: { total = 0 } } = {}, error = null } = await res.json(); — rename data.users to users, default users to an empty array when missing, default meta.total to zero, default error to null. This single expression replaces a ladder of ifs and survives partial responses: if the API omits meta or data entirely, nothing throws and defaults kick in. Destructuring defaults compose with nested optionality.`,
      },
    ],
    exam: [
      {
        question:
          "Why does console.log(1 ?? 0) print 1 while console.log(0 || 1) prints 1?",
        answer:
          "Nullish coalescing only falls back on null or undefined, so 1 is returned as-is; logical OR falls back on any falsy value, and 0 is falsy, so it returns the right operand. Use ?? when 0 or the empty string are legitimate values you must preserve.",
      },
      {
        question:
          "What is the difference between export default and a named export?",
        answer:
          "A module may have at most one default export; importers pick any name for it (import Whatever from ...). Named exports are imported by their exact name (import { x } from ...) and a module may have many; named exports are better for multi-function modules and for tree shaking visibility.",
      },
      {
        question:
          "Explain what a closure captures and why the var loop trap occurs.",
        answer:
          "A closure captures the variable binding (storage location), not a snapshot of the value. var hoists one binding shared by every iteration, so all closures see the final value. let (and const) create a fresh binding per iteration, giving each closure its own storage.",
      },
      {
        question: "What does the prototype chain do on property access?",
        answer:
          "It walks [[Prototype]] links from the object upward: if the property exists on the object, return it; otherwise look up the parent, then its parent, until found or the chain ends at null. Methods live on prototypes, so all instances share them without duplicating storage; own properties shadow inherited ones.",
      },
    ],
    cheat: [
      "var function-scoped hoisted; let/const block-scoped TDZ.",
      "Closures capture bindings, not values; use let in loops with callbacks.",
      "this binds at call site; arrow functions inherit this; bind/call/apply set it.",
      "Prototype chain delegates lookups; classes desugar to prototypes.",
      "?? falls back on nullish only; || falls back on any falsy.",
      "ESM: named + one default export; import * as ns for namespaces.",
      "Destructuring with defaults everywhere; shallow copies only.",
      "Optional chaining short-circuits to undefined.",
    ],
    recap: `Modern JavaScript rests on three ideas: dynamic scope-plus-closures for functions, prototype delegation for objects, and modules for boundaries. let/const/const semantics, arrow functions, destructuring, spread, ??, and ?. are syntax that becomes predictable once the machinery is understood; the language is small and composable, and fluency comes from tracing values through closures and prototype lookups rather than memorizing features.`,
    code: {
      title: "Closure as private state",
      language: "javascript",
      code: `function counter() {\n let n = 0;\n return { inc: () => ++n, peek: () => n };\n}\nconst c = counter();\nc.inc(); c.inc();\nconsole.log(c.peek()); // 2`,
      explanation:
        "The factory returns closures over n; n is not reachable from outside, giving private state without classes. n persists across calls because each closure shares the one binding.",
    },
    diagram: {
      title: "Closure anatomy",
      caption: "Function plus its captured lexical environment.",
      mermaid: `flowchart TD\n F[Function] --> E[Lexical environment]\n E --> V[Variables captured by reference]\n V --> G[Global and outer scopes]`,
    },
  },
  "web-dev-javascript-and-typescript-async-javascript-and-the-event-loop": {
    intro: `Async JavaScript is how the single-threaded language performs waiting — network, timers, disk — without blocking: the event loop drains a call stack and two queues, always running synchronous code first, then microtasks (promises, queueMicrotask), then macrotasks (timers, I/O, user events). The subject is the loop itself, promises as the unit of async work, async/await as readable linear syntax over promises, and the failure and cancellation semantics that make production code reliable. nothing in JavaScript is ever truly parallel on the main thread; asynchrony is scheduling.`,
    foundations: `The call stack executes frames. Web/Node APIs hand work to the host and re-queue results: timers and I/O callbacks land in the task queue (macrotask), promise reactions in the microtask queue. After every task, the microtask queue drains completely before the next macrotask. Microtasks scheduled from microtasks run before any new macrotask. setTimeout(0) is not "now"; it is "after the current job and all pending microtasks". Node has its own phases (timers, poll, check), but the microtask rule is the same.`,
    concepts: [
      {
        title: "Promises: states, chaining, and error flow.",
        body: `A promise is a state machine: pending → fulfilled or rejected, settled forever once decided; .then(onFulfilled) runs on fulfillment; .catch(onRejected) on rejection; .finally runs either way. Chains propagate: a returned value becomes the next fulfillment; a thrown error becomes the next rejection, skipping intermediate .then handlers until a .catch. Promises are hot — work starts at construction, not at await. Aggregate: Promise.all fails fast on first rejection; Promise.allSettled reports every outcome; Promise.race settles with the first; Promise.any resolves with the first fulfillment.`,
      },
      {
        title: "async/await: linear syntax over promises.",
        body: `async function returns a promise; await pauses the function until the promise settles, with the runtime slicing the function into promise-chained segments behind the scenes. try/catch around await replaces .catch; await in a loop is sequential (await items one by one), Promise.all(items.map(...)) is parallel. Mixing await with .then is legal but rarely clearer. Handle errors at the boundary: one try/catch per logical operation; log, convert to domain error, or surface to the UI.`,
      },
      {
        title: "Cancellation, timeouts, and AbortController.",
        body: `fetch and most modern APIs accept an AbortSignal; aborting rejects the promise with AbortError and cancels the underlying request. Pattern: one AbortController per operation; timeout via AbortSignal.timeout(ms) or a manual timer; wire "cancel previous on new keystroke" with a single controller reused per search box. Cancellation must be cooperative — long computations must check signal.aborted or listening to abort events. This is the only proper way to stop work mid-flight; ignoring aborts wastes bandwidth and race-conditions state.`,
      },
      {
        title: "Retries and backoff.",
        body: `Transient failures (network blips, 503s, rate limits) deserve bounded retries with exponential backoff and jitter: wait 100ms, 200ms, 400ms with randomization, capped. Retry only idempotent operations (GET, PUT with idempotency keys) — never blindly retry POST. A retry helper wraps an fn(signal) with attempt limit, backoff schedule, and error filtering (retry on network/5xx, not on 4xx). Observe retry counts; infinite retry hides outages.`,
      },
      {
        title: "Event ordering: sync, microtasks, macrotasks.",
        body: `Given: console.log('a'); setTimeout(() => console.log('b'), 0); Promise.resolve().then(() => console.log('c')); console.log('d') — output is a d c b. Synchronous statements run first; the promise reaction runs in the microtask flush after the stack empties; the timer waits for the macrotask queue, after microtasks drain. Understanding this order explains why updating state in promise reactions feels "instant" relative to timers, why render side effects should be scheduled deliberately, and why infinite microtask loops starve the thread forever.`,
      },
    ],
    worked: [
      {
        title: "Fetch with timeout and abort.",
        body: `async function fetchWithTimeout(url, ms = 5000) { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), ms); try { return await fetch(url, { signal: controller.signal }); } finally { clearTimeout(timer); } } — the finally ensures the timer never fires after success; aborting rejects fetch with AbortError; callers treat AbortError as their own timeout error and retry or surface. Composing cancellation with timeouts is the backbone of robust browser networking.`,
      },
      {
        title: "Parallel vs sequential requests.",
        body: `Sequential: for (const id of ids) await fetchUser(id); — each request waits for the previous; N round trips. Parallel: const users = await Promise.all(ids.map(fetchUser)); — N requests in flight at once; total time ≈ slowest single request. Choose sequential when later calls depend on earlier results or when rate limits demand pacing; choose allSettled to tolerate partial failure and report which failed; choose all when you need every result and any failure is fatal.`,
      },
      {
        title: "Debounce and cancel stale searches.",
        body: `Keep one AbortController per input; on each keystroke, controller.abort() cancels the in-flight request from the last keystroke; create a fresh controller and fetch; handle AbortError silently (stale, not an error). Combine with 150-250ms debounce to limit request volume; render only results for the latest query id. This pattern — cancel + latest-wins — is the difference between a search box that flickers stale results and one that feels instant and correct.`,
      },
    ],
    exam: [
      {
        question:
          "In what order do sync, promise, and setTimeout callbacks run?",
        answer:
          "Synchronous code runs to completion first; then the microtask queue (all promise reactions and queueMicrotask callbacks, including nested ones) drains completely; only then does the next macrotask (setTimeout, I/O, events) run. Hence sync, then microtasks, then timers.",
      },
      {
        question: "Why does await inside a for loop not fetch in parallel?",
        answer:
          "Each iteration awaits the previous promise before the loop advances, serializing the requests. To run them concurrently, map over the items creating promises without awaiting, then await Promise.all on the array of promises; only true dependencies require sequential awaits.",
      },
      {
        question: "What does AbortController solve that timers cannot?",
        answer:
          "A timer can reject a promise but cannot stop the underlying operation; AbortController signals the operation itself to stop — fetch aborts mid-flight, the runtime cancels or detaches the request, and listeners react to the abort event. It is cooperative cancellation, not just decorative error handling, and it prevents stale work from touching state or consuming bandwidth.",
      },
      {
        question: "When is Promise.allSettled preferable to Promise.all?",
        answer:
          "When partial failure is acceptable and you want every outcome, e.g., fetching 100 feature flags or dashboards where one failing endpoint should not block the rest; allSettled returns an array of fulfilled/rejected descriptors so you can proceed with the successes and report the failures individually.",
      },
    ],
    cheat: [
      "Stack first, then microtasks, then macrotasks — always.",
      "Promise: pending → fulfilled/rejected, settled forever.",
      "async fn returns promise; await unwraps; try/catch handles errors.",
      "Promise.all fails fast; allSettled reports all; race first settle; any first fulfill.",
      "await in loops is sequential; Promise.all(map(...)) is parallel.",
      "AbortController + AbortSignal.timeout for cancel and timeout.",
      "Retry only idempotent ops; exponential backoff with jitter.",
      'setTimeout(0) waits for microtasks first — never "immediate".',
    ],
    recap: `JavaScript concurrency is scheduling on one thread: synchronous work runs first, then the microtask queue drains (promises), then macrotasks (timers, I/O); promises are the unit of async work; async/await is linear syntax over them; AbortController provides cooperative cancellation; retries with backoff handle transient failure; and the event-order rules (sync → microtasks → macrotasks) explain every "impossible" ordering bug.`,
    code: {
      title: "withRetry helper",
      language: "javascript",
      code: `async function withRetry(fn, tries = 3) {\n let last;\n for (let i = 0; i < tries; i++) {\n try { return await fn(); } catch (err) { last = err; }\n await new Promise(r => setTimeout(r, 2 ** i * 100 + Math.random() * 50));\n }\n throw last;\n}`,
      explanation:
        "Wraps any async operation; exponential backoff with jitter between attempts; on the final failure it rethrows the last error so callers can distinguish exhausted retries from single failures.",
    },
    diagram: {
      title: "The event loop order",
      caption: "Stack empties, microtasks drain, then one task.",
      mermaid: `flowchart TD\n S[Run synchronous code] --> M[Drain microtask queue]\n M --> T[Run one macrotask]\n T --> M`,
    },
  },
  "web-dev-javascript-and-typescript-browser-apis-and-performance": {
    intro: `The browser platform is a vast API surface layered on the JavaScript core: the DOM for structure, events for interaction, storage for persistence, workers for off-main-thread work, and performance observers for measurement. The subject is how to use those APIs to build fast, resilient interfaces — from event delegation and localStorage to requestAnimationFrame, IntersectionObserver, and Core Web Vitals. the browser is the runtime, and mastering its APIs is what lets JavaScript be the engine of the user experience.`,
    foundations: `The DOM is a tree of nodes mirroring the HTML; JavaScript manipulates it through document and element references. Events bubble from target up to window; delegation attaches one listener at a common ancestor. Storage: localStorage/sessionStorage hold strings (5-10 MB), cookies travel with HTTP requests, IndexedDB holds structured data unlimited-ish. Main-thread work competes with rendering; layout is expensive; requestAnimationFrame schedules visual work; long tasks (>50ms) block input and hurt INP. The browser reports performance via PerformanceObserver and Navigation Timing.`,
    concepts: [
      {
        title: "DOM selection, mutation, and delegation.",
        body: `querySelector/querySelectorAll select by CSS selectors; classList, dataset, style, and attributes mutate. Creating nodes (document.createElement) and inserting them (append, prepend, replaceChildren) beats string concatenation (XSS risk and re-parse cost). Event delegation: one listener on a container handles events from many children via event.target — the standard for lists and dynamic content. Use event.preventDefault for form defaults and element.stopPropagation sparingly — it breaks other listeners. Reflow is triggered by reading geometry (offsetWidth) after writes; batch reads and writes.`,
      },
      {
        title: "Persistence: storage, cookies, IndexedDB.",
        body: `localStorage persists across sessions (per origin, strings only, synchronous); sessionStorage per tab session; both block the main thread on read — keep values small. Cookies are small (4 KB), sent with every request, and configurable (HttpOnly prevents JS access, Secure requires TLS, SameSite controls cross-site sending) — use them for auth tokens you must send; never for app state. IndexedDB is the async, transactional, structured store for larger data; wrap it or use idb. Cache API via service workers holds request/response pairs for offline.`,
      },
      {
        title: "Workers: moving work off the main thread.",
        body: `Web Workers run scripts on a separate thread with no DOM access; they receive messages via postMessage and reply the same way (structured clone). Use them for heavy computation (parsing big files, image processing, ML inference). Service Workers are network proxies: they intercept fetches and implement offline strategies (cache-first, network-first, stale-while-revalidate); they enable installability and background sync. Workers communicate by message passing — no shared state except SharedArrayBuffer + Atomics for the adventurous.`,
      },
      {
        title: "Rendering performance and Core Web Vitals.",
        body: `The pipeline: parse HTML → DOM; CSSOM; render tree; layout; paint; composite. Layout and paint are the expensive steps; forced synchronous layout (reading geometry mid-write) serializes them. LCP (largest contentful paint) targets 2.5s; INP (interaction to next paint) targets 200ms; CLS (cumulative layout shift) targets 0.1. Levers: defer non-critical JS, lazy-load images with loading=lazy, preconnect to origins, use content-visibility: auto for offscreen content, avoid layout thrashing in scripts, and split long tasks with scheduler.yield or setTimeout.`,
      },
      {
        title: "Measuring with the platform.",
        body: `PerformanceObserver surfaces entries: longtask, layout-shift, largest-contentful-paint, event timing. Navigation Timing and Resource Timing give TTFB, DNS, and per-resource breakdowns. Lighthouse and WebPageTest give lab scores; Chrome UX Report gives field data; the web-vitals library wires Core Web Vitals into production analytics. Rule: measure in the field first, reproduce in the lab second, fix, and verify with the same metric. A fix without a measurement before and after is a guess, not an optimization.`,
      },
    ],
    worked: [
      {
        title: "Delegate events for a dynamic list.",
        body: `const list = document.querySelector('#items'); list.addEventListener('click', (e) => { const btn = e.target.closest('button[data-action]'); if (!btn) return; const item = btn.closest('li'); if (btn.dataset.action === 'delete') item.remove(); }); — one listener survives future items; closest handles clicks on icons inside buttons; dataset carries metadata without extra state. This is the canonical pattern for todo lists, tables, and menus.`,
      },
      {
        title: "Offload CSV parsing to a worker.",
        body: `Main thread: const w = new Worker('./parse.js'); w.postMessage(bigCsvString); w.onmessage = (e) => render(e.data); — the worker parses the CSV row-by-row into objects and posts the resulting array back; the UI never freezes; memory copies across workers via structured clone (consider transferable for ArrayBuffers). Result: the page stays interactive at INP < 200ms even for 50 MB files.`,
      },
      {
        title: "Halve CLS by reserving space.",
        body: `Images loaded without dimensions shift content as they load. Fix: always set width and height attributes (or CSS aspect-ratio) so the browser reserves layout before the image arrives; same for embeds and ads. Verify with LayoutShift entries in a PerformanceObserver; CLS drops toward zero; the fix costs nothing and improves both user experience and page experience signals.`,
      },
    ],
    exam: [
      {
        question: "Why is event delegation preferred for large dynamic lists?",
        answer:
          "One listener on the container handles all current and future children via bubbling, avoiding per-element listeners that leak, double-register, and cost memory; lookup via closest/target keeps the target of the action precise even with nested interactive elements inside each item.",
      },
      {
        question:
          "When should you use a Web Worker instead of optimizing main-thread code?",
        answer:
          "When computation is long enough to threaten input responsiveness (>50ms blocks hurt INP), when data is large (parsing, transforms, ML inference), or when work can run in parallel with rendering. Workers move CPU work off the UI thread; they cannot touch the DOM, so they return data rather than mutating UI.",
      },
      {
        question:
          "localStorage vs cookies for storing a session token — which and why?",
        answer:
          "Cookie with HttpOnly and Secure when the token must be sent automatically and should not be readable by injected scripts (XSS containment). localStorage is easier to use for SPA state but is readable by any script on the origin, so it is weaker against XSS; cookies with SameSite=Lax/Strict also mitigate CSRF.",
      },
      {
        question: "What is forced synchronous layout and how do you avoid it?",
        answer:
          "Reading a layout-dependent property (offsetWidth, getBoundingClientRect) after writing styles forces the browser to flush pending style and layout changes synchronously, inside your JavaScript. Avoid by batching all writes together, then reading measurements once; use requestAnimationFrame to separate phases; use ResizeObserver instead of manual geometry polling.",
      },
    ],
    cheat: [
      "Events bubble; delegate one listener on the container; closest for target.",
      "Batch DOM writes then read geometry; never interleave write-read-write.",
      "localStorage synchronous strings; cookies small, autosent; IndexedDB async structured.",
      "Web Workers: postMessage/onmessage; no DOM; heavy compute off-thread.",
      "Service Workers: network proxy; cache-first/network-first/SWR; offline.",
      "LCP 2.5s, INP 200ms, CLS 0.1; content-visibility: auto; loading=lazy.",
      "PerformanceObserver: longtask, layout-shift, largest-contentful-paint.",
      "Field metrics (CrUX) + lab (Lighthouse); measure before and after.",
    ],
    recap: `The browser gives scripts structure (DOM), interaction (events), persistence (storage and IndexedDB), concurrency (workers), and measurement (PerformanceObserver); render performance comes from respecting the pipeline — defer JS, reserve space, batch geometry, move heavy work off-thread — and from measuring with real field data (Core Web Vitals) rather than assumptions.`,
    code: {
      title: "IntersectionObserver lazy-render",
      language: "javascript",
      code: `const io = new IntersectionObserver((entries) => {\n for (const e of entries) if (e.isIntersecting) {\n e.target.src = e.target.dataset.src;\n io.unobserve(e.target);\n }\n}, { rootMargin: '200px' });`,
      explanation:
        "Renders offscreen images only when they approach the viewport; rootMargin preloads slightly ahead; unobserve stops observing once loaded, saving observer overhead.",
    },
    diagram: {
      title: "Browser work pipeline",
      caption: "Parse, style, layout, paint, composite — and where JS fits.",
      mermaid: `flowchart LR\n H[HTML] --> D[DOM]\n D --> R[Render tree]\n R --> L[Layout]\n L --> P[Paint]\n P --> C[Composite]`,
    },
  },
  "web-dev-javascript-and-typescript-modules-bundlers-and-build-tools": {
    intro: `Modules decide how JavaScript code is organized and shared; bundlers decide how that code reaches the browser in the smallest, fastest form possible. Modern tooling (Vite, esbuild) uses native ES modules in development for instant startup and single-pass bundling plus transpilation for production. The subject is how modules work (ESM vs CJS), how bundlers process dependency graphs, and how to configure builds for code splitting, tree shaking, source maps, and environment handling. correctness of your dependency graph and leanness of your output are the two jobs of the build tool.`,
    foundations: `Two module systems coexist: CommonJS (require/module.exports, dynamic, synchronous, Node default historically) and ES modules (import/export, statically analyzable, async-capable, the standard). Bundlers read the entry, follow imports to build a dependency graph, transform (transpile, minify), and emit chunks. Tree shaking removes unused exports; code splitting creates on-demand chunks via dynamic import. The package.json type field (module vs commonjs) declares interpretation; .mjs/.cjs force it per file. Source maps map output back to source for debugging.`,
    concepts: [
      {
        title: "ESM vs CJS: interop without pain.",
        body: `ESM is static: the import list is known at link time, enabling tree shaking and circular-reference handling; CJS loads dynamically, so exports are live-ish mutable objects and tree shaking is impossible. In practice: author libraries dual-published or ESM-only; use import in ESM; require in CJS; nodejs interop lets require of an ESM fail — use ESM or dynamic import() to load ESM from CJS. Vite and modern frameworks ship ESM-first; stdlib APIs like fs/promises work in both. When you see ERR_REQUIRE_ESM, the fix is a type-of-module mismatch in the package, not your code.`,
      },
      {
        title: "Vite: dev server and production build.",
        body: `Vite serves source files directly over native ESM in dev — no bundling, instant cold start, on-demand transforms; it pre-bundles dependencies with esbuild once into node_modules/.vite for speed. Production uses Rollup to bundle, minify (esbuild/terser), chunk, and emit assets with hashed names. Configuration lives in vite.config.ts: plugins (framework presets), resolve.alias, server.proxy, build.rollupOptions, env handling via import.meta.env with VITE_ prefix for client-exposed vars. The mental model: dev = ESM server + HMR; build = one-pass bundle.`,
      },
      {
        title: "Tree shaking and code splitting.",
        body: `Tree shaking drops unused exports from ESM modules: mark side-effect-free packages with sideEffects: false in package.json so bundlers can drop unimported modules; keep imports named (import { map } from 'lodash-es', not import _ from 'lodash'); avoid barrel files that re-export everything in hot paths. Code splitting: dynamic import('./chart') creates a separate chunk fetched on demand; React.lazy and Suspense make this natural. Route-level splitting plus dynamic imports is the single biggest lever on initial bundle size.`,
      },
      {
        title: "Environment variables and configuration.",
        body: `Env vars configure builds and runtimes. In Vite, only VITE_-prefixed vars are exposed to client code; server-side secrets must never use the VITE_ prefix. Use .env files per environment, inject via import.meta.env or process.env in Node. Configuration is code that runs at build time — keep it minimal; prefer explicit flags over clever resolution. Reproducibility: pin the toolchain (engines in package.json, lockfile) so CI and local builds agree.`,
      },
      {
        title: "Source maps, minification, and debugging bundles.",
        body: `Source maps connect bundled output back to sources; ship hidden source maps in production (upload to your error tracker) or public ones for OSS. Minification renames and strips whitespace; terser/esbuild trade a bit of speed for smaller size. Verify bundle composition with a bundle visualizer (rollup-plugin-visualizer) — the three usual surprises are a huge transitive dep imported wholesale, locale files from a date library, and unshakable CSS-in-JS. Act on evidence: see the chart, fix the import, rebuild, compare.`,
      },
    ],
    worked: [
      {
        title: "Split an admin dashboard out of the main bundle.",
        body: `Route-level code splitting: const Admin = lazy(() => import('./Admin')); render with <Suspense fallback={<Spinner/>}>. The build emits a separate admin chunk loaded only on navigation; the entry stays lean; the admin chunk cache-hits repeat visits. Verify with the build output (chunk sizes printed by Vite) and with import statistics; drop e.g. 60-70% of initial JS for a public-facing app.`,
      },
      {
        title: "Fix a bundle bloated by an accidental import.",
        body: `Visualizer shows moment.js plus all locales in the vendor chunk. Fix: replace moment with date-fns (tree-shakeable, import { format }) or Intl API; mark sideEffects false in your own package; rebuild; vendor drops from 300 KB to 40 KB. The lesson: bundle size is an outcome of your import graph, and the visualizer is the diagnostic instrument.`,
      },
      {
        title: "Diagnose ERR_REQUIRE_ESM in a Node script.",
        body: `Error: require() of ES module detected. Cause: package.json type: module (or .mjs) but your script uses require. Fixes: rename to ESM and use import; or pin the dependency version that is dual-published; or import the ESM dynamically inside CJS: const mod = await import('pkg');. Keep module type consistent per package; mixed trees are the common cause.`,
      },
    ],
    exam: [
      {
        question: "Why can tree shaking work for ESM but not for CommonJS?",
        answer:
          "ESM imports are static and resolvable before execution, so bundlers know exactly which exports are used and can drop the rest; CommonJS computes requires at runtime, so the bundler cannot know statically what will be used and must keep everything.",
      },
      {
        question:
          "What does code splitting change about how JavaScript reaches the browser?",
        answer:
          "Instead of one monolithic bundle fetched up front, the app is divided into chunks loaded on demand (route or feature); initial load drops dramatically, and chunks cache independently; the trade-off is an extra request per chunk and the need for loading states.",
      },
      {
        question:
          "How do VITE_ variables differ from plain environment variables in a Vite project?",
        answer:
          "Vite statically replaces VITE_ prefixed variables in client code at build time and only those are exposed to the browser bundle; any other variable exists only at build/dev-server time, so prefixing a secret VITE_ leaks it to every visitor — never do it.",
      },
      {
        question: "What is the safest fix for ERR_REQUIRE_ESM?",
        answer:
          "Align module types: make your package ESM (type: module) and use import syntax, or ensure the dependency ships ESM with proper exports fields; as an escape hatch, use dynamic import() in a CJS context, which loads ESM asynchronously.",
      },
    ],
    cheat: [
      "ESM static imports enable tree shaking; CJS dynamic requires do not.",
      "Vite dev = native ESM + HMR; build = Rollup bundle; preview serves build.",
      "code splitting via dynamic import; lazy load routes; Suspense boundaries.",
      "sideEffects: false in package.json unlocks shaking in libraries.",
      "VITE_ vars are baked into client code; never for secrets.",
      "Source maps: upload hidden maps to your error tracker in production.",
      "Visualize bundles; replace heavy deps; pin engines and lockfile.",
    ],
    recap: `Modules declare boundaries — ESM statically, CJS dynamically — and bundlers turn the resulting graph into optimized chunks; Vite gives instant dev via native ESM and optimizes production via Rollup with tree shaking, minification and code splitting; environment handling, source maps, and size budgets are the engineering discipline that keeps the output lean and the process debuggable.`,
    code: {
      title: "Dynamic import for an on-demand chunk",
      language: "javascript",
      code: `const { renderChart } = await import('./chart.js');\nrenderChart(data);`,
      explanation:
        "The chart module becomes a separate chunk; it downloads only when this line runs, keeping first paint fast; build tools split automatically on literal dynamic imports.",
    },
    diagram: {
      title: "From source to bundle",
      caption: "Graph, transform, split, minify, emit.",
      mermaid: `flowchart LR\n E[Entry] --> G[Dependency graph]\n G --> T[Transform and minify]\n T --> C[Chunks]\n C --> O[Hashed assets]`,
    },
  },
  "web-dev-javascript-and-typescript-typescript-deep-dive": {
    intro: `TypeScript is JavaScript with a structural static type system: it erases at runtime but verifies at build time that values flow to functions that expect them. The subject is the type system itself — inference, narrowing, generics, union and intersection types, utility types — and how to model data precisely enough that the compiler catches whole classes of bugs before tests run. TypeScript shifts failure left, from production to the editor, and the craft is writing types that do that work with minimal noise.`,
    foundations: `Types are structural: compatibility is about shape, not name. Every value has an inferred type; annotations state intent and documentation. Union types model "one of these"; intersections model "both"; unknown is the safe top type requiring narrowing; any disables checking (use sparingly); never is the empty type for impossible states. Narrowing uses control flow: typeof, instanceof, in, truthiness, discriminant properties. Generics parameterize types over other types. The compiler erases all types at emit; .d.ts files describe types for consumers.`,
    concepts: [
      {
        title: "Structural typing and interfaces vs type aliases.",
        body: `Interfaces describe object shapes and can be extended/merged; type aliases name any type expression including unions and tuples. Structural compatibility means a function expecting { name: string } accepts any object with a string name. Prefer interfaces for public object APIs (better error messages, declaration merging), type aliases for unions, mapped, and conditional compositions. Declaration merging lets interfaces from different files merge; aliases cannot extend but can intersect.`,
      },
      {
        title: "Narrowing and discriminated unions.",
        body: `The compiler narrows types along control flow. Discriminated unions are the killer pattern: { kind: 'circle', radius: number } | { kind: 'square', side: number } — switch (s.kind) narrows s in each case to exactly the right variant, eliminating impossible states at compile time. Prefer discriminated unions over optional properties with ordering invariants; they make the type system prove exhaustive handling.`,
      },
      {
        title: "Generics: parameterizing types over types.",
        body: `Generics are functions/types over types: function first<T>(arr: T[]): T | undefined. Constraints (T extends { id: string }) express requirements; defaults (T = string) express common cases; keyof extracts keys; indexed access (T[K]) looks up nested types. Generics preserve the relationship between inputs and outputs — the caller gets back the exact subtype rather than a widened base, which is what makes APIs like fetch<T>() usable safely. Resist over-genericizing: if no relationship between parameters is needed, concrete types are clearer.`,
      },
      {
        title: "Utility types and mapped types.",
        body: `Partial<T> makes all properties optional; Required<T> the reverse; Pick<T, K> and Omit<T, K> subset/complement; Record<K, V> maps keys to values; ReturnType<F> and Parameters<F> introspect functions; Readonly<T> deep-freezes the shape; NonNullable strips null/undefined. Compose them for real work: a Draft<T> type that makes some fields optional, an API response normalized with Required depth, an event payload mapped by name. Mapped types are the raw material: { [K in keyof T]: ... } powers the utilities.`,
      },
      {
        title: "Modules, declaration files, and strict mode.",
        body: `tsconfig.json controls strictness: enable strict (catches implicit any, null checks, class field issues); skipLibCheck off in new projects; target and lib decide syntax and available globals; moduleResolution bundler vs node matters for bundler builds. Declaration files (.d.ts) describe types for JS libraries; types: [...] controls which @types are included; moduleResolution and exports interplay. Strict projects surface bugs early; @ts-expect-error documents intentionally suppressed errors better than any.`,
      },
    ],
    worked: [
      {
        title: "Model a payment state machine as a discriminated union.",
        body: `type Payment = { status: 'idle' } | { status: 'pending' } | { status: 'succeeded', receiptUrl: string } | { status: 'failed', reason: string }; — instead of one object with optional receiptUrl/reason, the union forces handling of each state; switch (p.status) narrows; impossible combinations (pending with receiptUrl) cannot be represented; the compiler enforces that success handling reads receiptUrl only in the succeeded branch. Refactoring the enum-ish if-chain yields fewer runtime bugs and better IDE help.`,
      },
      {
        title: "Write a generic cache with proper typing.",
        body: `class Cache<K, V> { private store = new Map<K, V>(); get(k: K): V | undefined { return this.store.get(k); } set(k: K, v: V) { this.store.set(k, v); return this; } } — generics preserve the relationship: keys and values are typed per instance; get returns V | undefined (honest optionality), so callers must handle absence; no any leaks. Add TTL by wrapping values in { value: V, expires: number } inside the map without widening the public API.`,
      },
      {
        title: "Typify an untyped JSON API response safely.",
        body: `const payload = (await res.json()) as unknown; then parse with a schema validator (zod) or manual type guard: function isUser(u: unknown): u is User { return typeof u === 'object' && u !== null && typeof (u as User).name === 'string'; } — cast through unknown never trusts the wire; the guard proves shape at the boundary; inside the app every value is fully typed. Trusting res.json() directly with as User is how type systems rot.`,
      },
    ],
    exam: [
      {
        question: 'What does "structural typing" mean in TypeScript?',
        answer:
          "Type compatibility is determined by the members a type has, not its declared name; any object with the required shape is assignable to the type, which is why small inline object literals satisfy interfaces without implementing them.",
      },
      {
        question: "Why use discriminated unions instead of optional fields?",
        answer:
          "They make invalid states unrepresentable and give the compiler exhaustive knowledge: switch on the discriminant narrows precisely, and adding a new variant forces compile-time updates at every handling site, whereas optional fields let impossible combinations compile silently.",
      },
      {
        question: "What is the difference between unknown and any?",
        answer:
          "any disables the checker for the value; unknown accepts any value but requires narrowing before any operation, preserving safety; use unknown for untyped external data and narrow deliberately.",
      },
      {
        question: "What does Partial<T> do and when is it used?",
        answer:
          'It constructs a type identical to T with every property optional; used for patch/update payloads, draft builders, and configuration objects where omission means "keep the default" — apply it deliberately, since it also erases requiredness guarantees.',
      },
    ],
    cheat: [
      "Structural: shape decides compatibility, not names.",
      "Interfaces extend + merge; type aliases do unions/mapped/conditional.",
      "Discriminated unions + switch = exhaustive narrowing.",
      "unknown forces narrowing; any disables checking.",
      "Generics keep caller/callee type flow; constrain with extends.",
      "Partial Pick Omit Record ReturnType Readonly — compose freely.",
      "tsconfig strict: true; types erased at emit; .d.ts for consumers.",
      "zod/typed guards validate external data at the boundary.",
    ],
    recap: `TypeScript is a structural, erasable type system layered on JavaScript; its power is narrowing (discriminated unions), generic relationships, and composition via utility and mapped types; modeling states as unions rather than optional fields converts impossible bugs into compile errors; strictness and boundary validation turn the same type discipline into runtime safety.`,
    code: {
      title: "A discriminated union + exhaustive switch",
      language: "typescript",
      code: `type Event =\n | { type: 'click'; x: number; y: number }\n | { type: 'scroll'; offset: number };\nfunction handle(e: Event) {\n switch (e.type) {\n case 'click': return [e.x, e.y];\n case 'scroll': return e.offset;\n }\n}`,
      explanation:
        "Each branch narrows e to the exact variant; a missing case is a compile error if a default-throw or exhaustiveness pattern (never) is used; the union forbids invalid shapes like scroll with x.",
    },
    diagram: {
      title: "Union narrowing flow",
      caption: "Discriminant selects the variant; type system tracks it.",
      mermaid: `flowchart TD\n U[Union of variants] --> S[switch on discriminant]\n S --> A[Variant A fields]\n S --> B[Variant B fields]`,
    },
  },
  "web-dev-javascript-and-typescript-testing-javascript-applications": {
    intro: `Testing JavaScript is the practice of proving your code behaves as intended without manual clicking: unit tests for logic, component tests for UI behavior, integration tests for wired flows, and end-to-end tests for real user journeys. The subject is the testing model — what to test, the Testing Library philosophy (test behavior, not implementation), mocking strategies, fixtures, and the test-driven loop — because tests only pay their rent when they catch regressions without freezing design. good tests verify observable behavior, are read by future humans, and fail only when something actually broke.`,
    foundations: `Test pyramid: many unit, fewer integration, fewest e2e. Unit tests isolate a module; component tests render UI and assert on DOM and interactions; integration tests wire real collaborators (e.g., API + DB); e2e drives a real browser against the full stack. Vitest/Jest provide describe/it/expect, lifecycle hooks, and mocking (vi.fn, vi.mock, module mocks). fixtures hold reusable test data. Coverage measures lines exercised, not correctness. The Testing Library queries the DOM as a user would: getByRole, getByText, getByLabelText.`,
    concepts: [
      {
        title: "Unit tests: structure and assertions.",
        body: `A unit test has arrange-act-assert: build inputs, call the function, assert the output. Test behavior: outputs, errors, state changes — not call counts. Keep tests deterministic: no real time, no real randomness (inject seeds/clocks), no network. One reason to fail per test; names describe the expectation ("rejects expired tokens"), effectively executable documentation. Snapshot tests capture output verbatim — useful for stable serialized shapes, dangerous for volatile UI; review diffs carefully.`,
      },
      {
        title: "Component testing with Testing Library.",
        body: `Render the component, query by role/label/text (getByRole('button', { name: /save/i })), interact with userEvent, and assert visible outcomes. Never assert on internal state or class lists unless that IS the contract. Accessible queries double as accessibility audits. Async: findBy queries wait for state updates; mock fetch or API modules; assert loading, success, error states. Prefer userEvent over fireEvent since it simulates real interaction.`,
      },
      {
        title: "Mocks, spies, and fakes — when to use which.",
        body: `Mock: replace a dependency to control its behavior (module mocks with vi.mock). Spy: wrap a real function to observe calls. Stub: fixed return values. Fake: working mini-implementation (in-memory DB). Use mocks for external boundaries (network, filesystem, clock), never to fake the module under test. Test doubles at boundaries produce deterministic, fast tests; over-mocking middle layers makes tests pass while production breaks — keep them thin.`,
      },
      {
        title: "Integration and E2E tests.",
        body: `Integration tests wire real collaborators: a real API handler against an ephemeral test database (e.g., in Docker or in-memory SQLite), asserting request-to-response behavior. E2E tests run the whole product in a real browser (Playwright): user journeys like signup-to-first-action; they catch wiring bugs nothing else sees but are slower and flakier; keep them few and high-value, with stable selectors (roles), seed data, and retries disabled. Run unit + integration on every push; e2e on merge queues or nightly.`,
      },
      {
        title: "TDD in practice.",
        body: `The loop: write a failing test that describes the next slice of behavior; implement just enough to pass; refactor; commit. TDD shapes designs toward testable, loosely coupled APIs because untestable code resists a failing test. Start with the simplest case; let tests drive edge cases (empty, boundary, error) you would forget; keep the test list your backlog. TDD is a design technique with testing as its evidence, not a religion; pragmatically, write tests before code for tricky logic, alongside for simple glue.`,
      },
    ],
    worked: [
      {
        title: "Test a discount rules engine as pure functions.",
        body: `export function priceOf(cart) maps items, applies bulk discount when quantity >= 10, then membership 10% off. Tests: empty cart → 0; single item no discount; bulk threshold exact boundary (9 vs 10); member + bulk compounding (10% off the discounted subtotal); unknown promo code ignored. Pure functions make the table of cases trivial; the suite is documentation of the business rule; adding a new rule extends the table, not the implementation sketch.`,
      },
      {
        title: "Test a form component end-to-end-ish.",
        body: `render(<SignupForm />); await user.type(screen.getByLabelText(/email/i), 'a@b.co'); await user.click(screen.getByRole('button', { name: /create account/i })); expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument(); Mock the API module (vi.mock('../api', () => ({ signup: vi.fn().mockResolvedValue({}) }))) so the test asserts the UI flow, email validation, and success state — without a network. Error path: mock reject and assert the error banner appears; assert the button disables while pending.`,
      },
      {
        title: "Stabilize a flaky integration test.",
        body: `Symptom: test passes locally, fails in CI; cause: real database state leaked between tests and a hardcoded ID. Fix: ephemeral database per run (testcontainers or transaction rollback pattern); seed deterministic fixtures; never rely on execution order; assert on uniquely generated values (unique email per test run) rather than literals; assert with toHaveProperty rather than whole-object equality when timestamps vary. Flakiness is a smell pointing at shared mutable state or timing assumptions.`,
      },
    ],
    exam: [
      {
        question:
          'What is the Testing Library philosophy of "testing behavior, not implementation"?',
        answer:
          "Query the DOM as a user perceives it (roles, labels, text) and assert on visible outcomes, not on component internals, props, or state; this keeps tests stable under refactors and meaningful as regression detectors because they fail when user-visible behavior breaks.",
      },
      {
        question:
          "When is mocking a module justified, and when does it become harmful?",
        answer:
          "Justified for boundaries you cannot control in tests (network, clock, filesystem, heavy deps); harmful when you mock the collaborator you meant to test or every layer, because tests then pass in isolation while real integration breaks — mocks prove your assumptions, not the system.",
      },
      {
        question: "What does coverage measure and what does it miss?",
        answer:
          "It measures how many lines/branches/functions were executed during tests; it says nothing about correctness, missing assertions, untested error paths, or wrong expectations; 100% coverage with weak assertions is worse than 60% with strong behavior checks.",
      },
      {
        question: "Why prefer findBy over getBy for async UI updates?",
        answer:
          "findBy retries the query until the element appears (or timeout), matching how the UI actually transitions after async work like fetch or timers; getBy fails immediately when the element has not appeared yet, producing flaky tests instead of waiting for reality.",
      },
    ],
    cheat: [
      "Pyramid: many unit, fewer integration, fewest e2e.",
      "Arrange-act-assert; one reason to fail; names describe.",
      "Test behavior and outcomes; not implementation details.",
      "userEvent > fireEvent; findBy for async; getByRole first.",
      "Mock boundaries; keep doubles thin; integration tests wire real deps.",
      "TDD loop: failing test → minimal code → refactor → commit.",
      "Snapshots for serialized shapes; review diffs with care.",
      "E2E: few, stable selectors, seeded data; run on merge queue.",
    ],
    recap: `Tests are executable documentation of observable behavior: unit tests prove logic tables, component tests prove user-visible interactions, integration tests prove wiring against real collaborators, e2e proves journeys; Testing Library's role-based queries make tests read like user stories; mocking belongs at boundaries; TDD lets tests shape design; coverage is a hint, not a goal.`,
    code: {
      title: "A minimal vitest suite",
      language: "javascript",
      code: `import { describe, it, expect } from 'vitest';\nimport { priceOf } from './pricing';\ndescribe('priceOf', () => {\n it('applies bulk discount at 10+ items', () => {\n expect(priceOf({ items: 10, price: 5 })).toBe(45);\n });\n});`,
      explanation:
        "describe groups the behavior, it names the one expectation, expect asserts; fixtures constructed inline keep tests readable; no real time, network, or randomness involved.",
    },
    diagram: {
      title: "The test pyramid",
      caption: "Where the bulk of tests should live.",
      mermaid: `flowchart TD\n U[Unit: logic] --> I[Integration: wired flows]\n I --> E[E2E: journeys]`,
    },
  },
  "web-dev-javascript-and-typescript-functional-programming-in-javascript": {
    intro: `Functional programming in JavaScript treats functions as values and data as immutable: programs become compositions of small, pure transformations instead of sequences of imperative mutations.
The subject is the practical core — pure functions, immutability, map/filter/reduce, currying, composition, and functor-like patterns — applied in the everyday codebase rather than in theory papers. when functions are values and data does not mutate, code becomes easier to reason about, test, and reuse.`,
    foundations: `A pure function returns the same output for the same input and has no side effects. Immutability forbids in-place change: update by creating new values (spread, structuredClone, Map/Set with .set copied variants). Array higher-order functions map, filter, reduce transform without loops. First-class functions enable higher-order functions: functions that take or return functions. Referential transparency means substituting a call with its result never changes behavior. Composition chains f(g(x)) into pipelines; currying turns f(a, b) into f(a)(b); partial application fixes some arguments; functors are containers with a map that applies functions inside (Promise, Array, Option-like types).`,
    concepts: [
      {
        title: "Pure functions and side effects.",
        body: `A function is pure if it depends only on its arguments and returns its result without touching the outside world: no mutation of shared objects, no I/O, no randomness/time unless passed in. Purity buys local reasoning: the call site need not care about context. Side effects are inevitable — separate them: core logic pure, shell effectful (read input, compute, write output). This structure is the functional core / imperative shell, and it makes the interesting part trivially testable.`,
      },
      {
        title: "Immutability without performance suicide.",
        body: `Never mutate inputs: build new objects ({ ...state, count: state.count + 1 }), new arrays ([...items, x]). For deep updates use immutable helpers (immer's produce lets you "mutate" a draft that produces a new state). Mutating local variables inside a function is fine — what matters is not leaking mutations across boundaries. Immutability makes change sets predictable (great for React re-render checks via reference equality) and eliminates the whole category of action-at-a-distance bugs.`,
      },
      {
        title: "map, filter, reduce — the workhorses.",
        body: `map transforms elementwise; filter keeps matching elements; reduce folds an array into one value (seed, callback (acc, item, index) => acc'). Reduce does everything: sums, groupings (build objects by key), pipelines. Avoid using reduce for side effects (pushing to outer arrays) — that defeats it. Prefer flatMap for map+flatten. Know when NOT to: for hot paths, plain loops outperform; readability first. Compose: pipe(xs, arr => arr.filter(isOk), arr => arr.map(clean), arr => arr.reduce(merge, {})).`,
      },
      {
        title: "Currying, partial application, closures.",
        body: `Currying converts f(a, b, c) into f(a)(b)(c); partial application fixes some leading arguments. Curried helpers enable point-free composition: const add = a => b => a + b; const add5 = add(5); — and configuration of behaviors: const withTimeout = fn => (...args) => Promise.race([fn(...args), timeout(5000)]). Closures are the mechanism; partial application the idiom. Use it where composition reads better; plain explicit calls for rarely-reused logic.`,
      },
      {
        title: "Functors and pipelines intuition.",
        body: `A functor is a container plus a map function: map f over the container applies f to the contained values and re-wraps: arrays (map), promises (.then), optional chains. Laws (identity, composition) make transformations composable. In practice: arrays of data, promise chains of async values, and maybe/option-like wrappers for nullability — all behave as functors, and reaching for .map instead of nested if/loops often collapses code. Functors are the intuition behind declarative dataflow; not every type needs the abstraction, but recognizing it clarifies code everywhere.`,
      },
    ],
    worked: [
      {
        title: "Refactor an imperative total with side effects.",
        body: `Original: let total = 0; for (const item of cart) { if (item.taxable) total += item.price * 0.2; total += item.price; } — Mixed concerns. Functional: const total = cart.reduce((sum, item) => sum + item.price * (item.taxable ? 1.2 : 1), 0). Two lines, one concept, no mutation of shared state; the tax rule is a pure expression; adding rules extends the reducer, never the loop ritual. Test it as a table of cases.`,
      },
      {
        title: "Group an array by key with reduce.",
        body: `const byKind = items.reduce((acc, item) => { (acc[item.kind] ??= []).push(item); return acc; }, {}); — reduce with a seed object builds a grouping; the ??= handles first occurrence; the result is a plain object keyed by kind. Equivalent with Map: new Map(items.map(i => [i.kind, i]).then(...)) or Object.groupBy (ES2024). Grouping is the most common report-shape and the canonical reduce example.`,
      },
      {
        title: "Build a reusable compose and use it.",
        body: `const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x); const clean = pipe(parseCsv, rows => rows.filter(r => r.total > 0), rows => rows.sort(byDate), dedupe); — pipe applies left to right; each step is a small pure function; the pipeline tells the data story in reading order; adding a transformation inserts one line without restructuring anything. Compare to a 200-line function mutating shared objects; the pipeline is diff-friendly and testable stepwise.`,
      },
    ],
    exam: [
      {
        question: "What makes a function pure?",
        answer:
          "It returns the same result for the same arguments and has no observable side effects — no mutation of outer state, no I/O, no nondeterminism unless injected as arguments; nothing about the call site can tell the call happened except receiving the result.",
      },
      {
        question: "Why is immutability so prominent in React?",
        answer:
          "React re-renders by comparing references; mutation in place fools reference equality checks, so immutability guarantees referential freshness, enables cheap change detection, makes time-travel/debugging possible, and eliminates hidden cross-component mutation bugs.",
      },
      {
        question:
          "What does Array.prototype.reduce do that map and filter cannot?",
        answer:
          "It folds an array into any single value — a number, a string, an object, another array — because it accumulates state across steps with an explicit seed and callback, expressing groupings, sums, and pipelines that map/filter alone cannot express.",
      },
      {
        question: "What is a functor in the loose JavaScript sense?",
        answer:
          "A value container equipped with a map operation that applies a function to the contained values while preserving the container (arrays, promises, options); it enables uniform, declarative transformation without unwrapping and re-wrapping manually.",
      },
    ],
    cheat: [
      "Pure: same input → same output, no side effects.",
      "Immutable updates: spread, structuredClone, immer drafts.",
      "map transform, filter select, reduce fold; flatMap for map+flatten.",
      "Curry f(a)(b) and pipe/compose for dataflow pipelines.",
      "Imperative shell, functional core; effects at the boundary.",
      "Functors: Array/Promise all have map; compose inside containers.",
      "Referential transparency = substitutable function calls.",
    ],
    recap: `Functional JavaScript is values in, values out: pure functions, immutable data, higher-order array methods, currying, and composition turn tangled mutation into legible pipelines; separate effects to the edges; reach for map/filter/reduce before for-loops; the payoff is code that is trivially testable, immune to whole classes of aliasing bugs, and pleasant to read.`,
    code: {
      title: "pipe and a data pipeline",
      language: "javascript",
      code: `const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);\nconst report = pipe(\n parse,\n (rows) => rows.filter((r) => r.total > 0),\n (rows) => rows.map(toSummary),\n);`,
      explanation:
        "pipe returns a function that threads a value through each transformation; each step is pure and independently testable; the data flow reads in the same order it executes.",
    },
    diagram: {
      title: "Composition pipeline",
      caption: "Values flow through pure transformations.",
      mermaid: `flowchart LR\n IN[Input] --> A[Filter]\n A --> B[Map]\n B --> C[Reduce]\n C --> OUT[Output]`,
    },
  },
  "web-dev-javascript-and-typescript-design-patterns-in-javascript": {
    intro: `A design pattern is a named, reusable solution to a recurring design problem; in JavaScript most classic patterns dissolve into a few idioms because the language has closures, first-class functions, and prototypes. The subject is the patterns that actually earn their keep in modern codebases — module, observer, factory, singleton, strategy, middleware — and when to reach for each. patterns are distilled experience, not ceremony, and the test for a pattern is whether it removes duplication or adds clarity.`,
    foundations: `Patterns fall into three camps: creational (how objects are made: factory, singleton, builder), structural (how they are assembled: module, decorator, adapter), and behavioral (how they communicate: observer, strategy, command, middleware). In ES2015+ JavaScript, functions and objects cover most of it; classes matter less. Dependencies are injected via parameters; closures provide privacy; events provide decoupling. Anti-patterns exist: anemic objects, shotgun surgery, primitive obsession — and pattern misuse is as bad as none.`,
    concepts: [
      {
        title: "Module pattern and revealing exports.",
        body: `Before ESM, the IIFE module pattern (const api = (() => { const secret = ...; return { publicMethod }; })()) created a private namespace; today ESM does it natively (export only what you intend; the module is private by default). Keep module internals small; export narrow interfaces; avoid exporting volatile implementation details you may want to change — the module boundary is an API contract.`,
      },
      {
        title: "Observer / pub-sub: decoupled communication.",
        body: `Observers subscribe to a subject; the subject notifies them on change; neither knows the other's concrete type. In the browser: DOM events, EventEmitter (Node), and frameworks' state subscriptions are all this pattern. Implementations: naive event map (on/off/emit), Node's EventEmitter, RxJS for streams. Use for cross-cutting notifications (toasts, cache invalidation), not as a general control-flow replacement — callback soup is the observer pattern gone wrong; prefer direct calls for direct relationships.`,
      },
      {
        title: "Factories: encapsulated construction.",
        body: `A factory is a function/method that builds objects so callers stay oblivious to which concrete class or shape they get: createStorage('local') returns a LocalStorage-backed adapter; createLogger('pino') returns a configured logger. Factories beat new scattered across the codebase because the construction decision lives in one place; adding a variant extends the factory, not every call site. Use for plugin points and for selecting implementations by environment.`,
      },
      {
        title: "Strategy: interchangeable algorithms.",
        body: `The strategy pattern puts the variable part behind a common interface: pricing = strategies[customer.plan] (plan: standard | premium | enterprise) — the checkout computes pricing without knowing which formula applies; new plans add one entry. Same shape as dependency injection of function arguments; it removes conditionals that branch on type and scales cheaply. Strategy is preferable to switch statements when variants multiply.`,
      },
      {
        title: "Middleware: compositional request pipelines.",
        body: `Middleware is a chain of functions that each get the request and a next() continuation; each may log, validate, authenticate, transform, or short-circuit. Express/Connect popularized it; Koa made it async/await-native; it appears in Fetch wrappers, Redux, and effect systems. Middleware ordering is the design decision: authentication before authorization before handler; analytics last. It is the strategy pattern applied to pipelines — order and composition are the whole API.`,
      },
    ],
    worked: [
      {
        title: "Swap storage backends without touching call sites.",
        body: `const stores = { memory: makeMemoryStore(), redis: makeRedisStore() }; const store = stores[process.env.STORE ?? 'memory']; — consumers call store.get/set and never know which backend they got; tests use memory, production uses redis; adding a Postgres store touches one line in the factory; the seam was the factory, not rewrites.`,
      },
      {
        title: "Implement pub-sub for a dashboard.",
        body: `const bus = new EventTarget(); widgets register bus.addEventListener('refresh', refreshWidget(e.detail)); a global tick emits bus.dispatchEvent(new CustomEvent('refresh', { detail: { force: true } })) — one event refreshes every widget without coupling; widgets unsubscribe on unmount to avoid leaks. The alternative — parent passing refresh props down three levels — couples unrelated widgets; the bus decouples them.`,
      },
      {
        title: "Add a retry strategy without changing callers.",
        body: `callApi = withRetry(fetchJson, { tries: 3, backoff: exponential }) — withRetry is a higher-order strategy: fetchJson stays untouched; the retry behavior is injected; tests can inject a stubbed fetchJson with a fake clock; switching to a single attempt is one argument. Strategy + closure = behavior injection without framework machinery.`,
      },
    ],
    exam: [
      {
        question: "When does the module pattern outperform a class?",
        answer:
          "For singleton-ish utilities and sealed services needing privacy without instantiation ceremony; ESM modules already are private namespaces with explicit exports, so prefer a module over a class whose only purpose is namespacing and a single instance.",
      },
      {
        question: "Observer vs direct method call — how do you choose?",
        answer:
          "Direct call when caller and callee are both known and the relationship is stable (simplest, easiest to follow); observer when many, unknown, or dynamically loaded parties react to an event, or when the subject must not know its observers (decoupling); accept the indirection cost only when the decoupling pays.",
      },
      {
        question: "Why do factories beat scattered new expressions?",
        answer:
          "Construction knowledge is centralized: one place decides concrete implementations, environment wiring, and defaults; call sites depend on the abstraction; adding variants extends the factory rather than every instantiation; tests inject fakes through the same seam.",
      },
      {
        question: "What makes middleware ordering a design decision?",
        answer:
          "Each stage may short-circuit or transform the request for the next; authentication must precede authorization, validation before handlers, logging around everything; misordering leaks protected resources or breaks observability; ordering is part of the security and correctness contract, not an implementation detail.",
      },
    ],
    cheat: [
      "Module: ESM is the module pattern now — export narrowly.",
      "Observer: on/off/emit; decouples emitters from listeners; unsubscribe to avoid leaks.",
      "Factory: one construction seam; extend variants in one place.",
      "Strategy: inject the varying behavior; erase type switches.",
      "Singleton: module scope or instance-one caches; avoid for mutable shared state.",
      "Middleware: chain of next() continuations; order is the contract.",
      "Inject dependencies; prefer functions over ceremony.",
    ],
    recap: `Patterns name reusable solutions; JavaScript's closures, first-class functions, and prototypes make most patterns small: ESM modules are the module pattern; events are the observer; factories centralize construction; strategy injects variability; middleware composes request pipelines; reach for a pattern when duplication and conditionals signal it, not as fashion — the goal is always clearer, more changeable code.`,
    code: {
      title: "Event bus in 20 lines",
      language: "javascript",
      code: `const bus = (() => {\n const map = new Map();\n return {\n on(t, fn) { (map.get(t) ?? map.set(t, []).get(t)).push(fn); },\n emit(t, d) { (map.get(t) ?? []).forEach((fn) => fn(d)); },\n };\n})();`,
      explanation:
        "Map of event name to handler list; on subscribes, emit dispatches synchronously; real implementations add unsubscribe and error isolation; the structure is the publish-subscribe pattern in miniature.",
    },
    diagram: {
      title: "Middleware chain",
      caption: "Each stage may short-circuit or pass control.",
      mermaid: `flowchart LR\n R[Request] --> A[Auth]\n A --> V[Validate]\n V --> H[Handler]\n H --> RES[Response]`,
    },
  },
  "web-dev-javascript-and-typescript-javascript-memory-and-garbage-collection":
    {
      intro: `JavaScript engines manage memory automatically: objects are allocated, reachable objects survive, and the garbage collector reclaims the rest. Understanding this lifecycle matters because invisible retention — detached DOM nodes, growing closures, endless listener lists — turns fast apps into sluggish ones that crash long sessions. The subject is the heap, the reachability model, how modern collectors actually work (generational mark-and-sweep), and how to find and fix leaks in production. you cannot free memory by hand, but you can control what stays reachable.`,
      foundations: `Allocation: creating objects/primitives; objects live on the heap, primitives in registers/stack where possible. Reachability: roots are globals, the stack, and closure environments; anything reachable from roots survives; unreachable cycles are collectable. Modern V8 collects with a generational scavenger (young generation, frequent, fast) and a mark-sweep-compact old generation (rare, thorough). Weak references: WeakMap/WeakSet keys do not prevent collection; weak-ref objects observe collection. Memory leaks in JS = unintended strong roots/retention.`,
      concepts: [
        {
          title: "Reachability and the GC cycle.",
          body: `The collector walks from roots, marks everything reachable, then sweeps unmarked objects (free-list them) and optionally compacts to reduce fragmentation. Generational hypothesis: most objects die young, so the young generation is collected often and cheaply by copying survivors; survivors that age promote to the old generation, collected rarely with full mark-compact. Remembered sets track old-to-young pointers so young collection stays cheap. Cycles are fine — reachability, not reference counts, decides survival (no cycles problem as in naive refcounting).`,
        },
        {
          title: "What actually leaks: the usual suspects.",
          body: `Leak patterns: detached DOM nodes held by JS references (element removed from tree but listener/closure keeps it alive); closures retaining large scopes (a small function closing over a huge array captures it); unbounded caches (never-invalidated Maps that grow forever); forgotten timers/intervals and observers (setInterval callback pinning entire graph; IntersectionObserver without disconnect); global accumulation (module-scope arrays of records); event listeners never removed on unmount. Detached nodes are especially sneaky: the heap grows with no obvious root chain.`,
        },
        {
          title: "WeakMap, WeakSet, and FinalizationRegistry.",
          body: `WeakMap/WeakSet hold weak keys (objects only): keys do not keep values or themselves alive; use them for metadata attached to objects without pinning those objects (node → expand state, user → session cache). Structured as identity maps, they shrink automatically when keys are collected. WeakRef and FinalizationRegistry let code observe collection for caches and cleanup — powerful but easy to misuse; prefer WeakMap for most cases. Never use weak structures to dodge logging leaks — they hide them.`,
        },
        {
          title: "Finding leaks: heap snapshots and profiling.",
          body: `Chrome DevTools > Memory: take heap snapshots at idle, after actions, after forced GC (collect garbage button). Compare snapshots (three-snapshot technique): objects that grew without bound between two intervals stand out. Filter by constructor (Detached HTMLDivElement), look at retained size (bytes kept alive by retaining), and dominators (objects retaining whole subgraphs). Node: --inspect with Chrome DevTools, or clinic heap-profiler; look for allocations per action in long sessions. Performance tab long tasks often correlate with GC pressure from churn.`,
        },
        {
          title: "Keeping apps light in practice.",
          body: `Tactics: unsubscribe on unmount (removeEventListener, observer.disconnect, unobserve); clear intervals and timeouts on teardown; avoid module-scope mutable caches without eviction (use LRU); prefer streams/chunked processing over giant arrays; use object pools only for extreme hot paths (rarely needed); measure again. Content-visibility: auto lets the browser skip offscreen rendering work. Above all: measure — leaks are invisible until they are not; production memory telemetry (heap used over time) is the earliest alarm.`,
        },
      ],
      worked: [
        {
          title: "Leak-free component lifecycle.",
          body: `Mount: create listeners/observers once in effect body; return cleanup: observer.disconnect(); window.removeEventListener(...); clearInterval(id); mounted = false. Every async continuation checks the flag (or aborts via AbortController) before touching state. Result: navigating away frees the whole subtree; the pattern is mandatory for SPAs and universal for data-heavy views.`,
        },
        {
          title: "Bound a cache that grows forever.",
          body: `A module-level Map caches fetched users keyed by id and never shrinks; after hours the heap balloons. Fix: LRU-ish bounded cache — track insertion order (Map preserves it), evict oldest once size exceeds N (say 500); or TTL entries with expiry checked on read; or WeakMap keyed by the request owner object when lifetime is naturally bounded by its owner. Always ask: what is the eviction policy of every long-lived structure.`,
        },
        {
          title: "Hunt a growing heap with three snapshots.",
          body: `Open Memory tab; snapshot A at app idle; perform the suspected action 20 times; snapshot B; trigger GC; snapshot C. Compare A vs C: retained size of the suspect constructor should be flat; if it grows per iteration with count proportional to actions, you found a leak; walk the retainer chain to find the root: an observer never disconnected on route change. Fix, re-measure the same scenario, confirm flat. Evidence beats intuition.`,
        },
      ],
      exam: [
        {
          question: "Why can a removed DOM node still consume memory?",
          answer:
            "The node was detached from the document tree, but if JavaScript still references it — a listener closure, a stored query result, a detached parent — the GC cannot reclaim it; its subtree stays alive along with the reference chain until all references are dropped.",
        },
        {
          question:
            "What is the generational hypothesis and how do engines exploit it?",
          answer:
            "Most objects die young; collectors concentrate effort on the young generation with frequent, cheap, copying collections, and collect the old generation rarely with full mark-compact; this matches allocation-heavy code patterns and keeps GC pauses short.",
        },
        {
          question: "When should you use WeakMap instead of Map?",
          answer:
            "When keys are objects and values should not keep keys alive — metadata attached to DOM nodes or objects whose lifetime is controlled elsewhere; weak keys vanish when unreachable, so the map cannot pin what it indexes; not for primitives, not when you need enumeration.",
        },
        {
          question: "Describe the three-snapshot technique for finding a leak.",
          answer:
            "Snapshot at idle; perform the suspect work; force GC and snapshot again; if specific constructors or retainer chains grew between snapshots in proportion to the work done, that path retains objects unintentionally; follow the retainers to the root that pins them and remove that reference on teardown.",
        },
      ],
      cheat: [
        "Roots: globals, stack, closures; reachable survives; cycles collectable.",
        "Young gen scavenged often; old gen mark-sweep-compact rarely.",
        "Detached DOM nodes: remove references and listeners on teardown.",
        "closure over huge scope retains it all — keep closures lean.",
        "Every long-lived structure needs an eviction policy.",
        "WeakMap/WeakSet for object-keyed metadata; keys never pinned.",
        "Three snapshots: idle → work → GC; compare retained growth.",
        "unsubscribe on unmount; clear timers; disconnect observers.",
      ],
      recap: `The engine collects by reachability, not manual freeing; leaks are invisible strong references: detached nodes, fat closures, endless caches, forgotten timers and observers; WeakMap removes pinning for object keys; DevTools heap snapshots and the three-snapshot technique reveal growth; every long-lived structure and lifecycle hook deserves an explicit cleanup policy, and measurement is the only trustworthy judge.`,
      code: {
        title: "Auto-cleaning subscription helper",
        language: "javascript",
        code: `function listen(target, type, fn) {\n target.addEventListener(type, fn);\n return () => target.removeEventListener(type, fn);\n}\nconst off = listen(window, 'resize', onResize);\noff();`,
        explanation:
          "Returning an unsubscribe function forces callers to receive the cleanup; paired with useEffect cleanup in React, every subscription gets torn down exactly once.",
      },
      diagram: {
        title: "Reachability determines survival",
        caption: "From roots to live objects; the rest is reclaimed.",
        mermaid: `flowchart TD\n R[Roots] --> A[Live objects]\n A --> B[Unreachable subgraph]\n B --> G[Reclaimed]`,
      },
    },
};
