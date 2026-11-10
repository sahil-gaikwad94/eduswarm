import type { TopicLesson } from "../topicLessons.js";

/**
 * JavaScript and TypeScript — 9 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, deep concept
 * sections, worked examples with real code, exam practice, cheat sheet,
 * and a trailing revision schedule only. No shared templates, no filler.
 */
export const javascriptAndTypeScript: Record<string, TopicLesson> = {
  "web-dev-javascript-and-typescript-modern-javascript": {
    intro: `Modern JavaScript is the language after ES2015 stopped treating scripting as an afterthought: block-scoped let and const, arrow functions, destructuring, template literals, classes, modules, promises, and iterators. The subject is the working grammar of the platform — how scope and closures actually behave, how objects and prototypes are wired, how arrays and objects behave under the modern operators, and what the runtime guarantees so that first-class functions and structured iteration stop being cargo-cult magic.`,
    foundations: `The execution model: single-threaded run-to-completion, an event loop that never interrupts a running script but schedules its continuation, heap-allocated objects reclaimed by a generational mark-and-sweep GC. Lexical scoping: variables are resolved by the static structure of the code, not by the call site — closures capture bindings, not values. Objects: prototype delegation — a property lookup walks the own-property chain then the [[Prototype]] chain (Object.create, class extends). Primitives vs objects: strings/numbers/booleans/symbols/bigints/undefined/null are values; arrays/functions/objects are references; typeof, instanceof, and Object.prototype.toString exist because of this split. Equality: === (no coercion), == (with coercion — avoid outside narrow patterns), Object.is (NaN and signed zero correct). Iteration: for-of (iterators, values), for-in (enumerable string keys — avoid on arrays), array methods (map/filter/reduce), spread/rest. Async is first-class: promises are the future-value primitive.`,
    concepts: [
      {
        title: "Scope, closures, and the function object.",
        body: `let/const are block-scoped (a block is any brace pair); var is function-scoped and hoisted to its function top with an undefined value — legacy behavior that still leaks into interview questions. A closure is a function plus the environment in which it was created — the environment holds bindings, not snapshots: counter() { let n = 0; return () => ++n; } — every call shares and increments the same n. Closures are how JavaScript expresses private state, factories, event handlers, and the entire React hook model. Functions declared with function keyword are hoisted (callable before definition in source order within the same scope) — arrow functions are not (they're const/let bindings). Function identity: two declarations never produce the same object, function declarations in the same scope overwrite each other, and methods on objects lose their receiver when detached (const f = obj.m; f()) — the lost 'this' trap is the single most misread mechanic in the language; bind defaults or use arrow wrappers to attach the receiver.`,
      },
      {
        title: "Objects, prototypes, and class desugaring.",
        body: `JavaScript objects are bags of keys with a live prototype link. obj.prop resolves: own property → prototype's own property → ... → Object.prototype → undefined (absent) — not an error. class is syntax over prototypes: class Dog extends Animal desugars to Dog.prototype inheriting from Animal.prototype and super constructor wiring; methods live on the prototype (shared), instance fields live on the object (per-instance). Constructor functions vs classes vs object literals vs Object.create(proto) — four builders, one delegation mechanism. get/set accessors, computed property names, and spread {...obj} (shallow, enumerable own properties only) cover 95% of object work. Symbol keys for collision-proof extension points; Map for non-string keys and honest iteration order semantics; Set for uniqueness. WeakMap/WeakSet hold keys by weak reference so unreachables vanish — the correct backbone of caches and metadata attached to objects without pinning them forever.`,
      },
      {
        title: "Destructuring, spread, rest, and template literals.",
        body: `const { a, b: renamed, rest = 1 } = obj — destructuring pulls shape out of values in one line; nested patterns a, { b: { c } } work recursively; arrays destructure by position const [first, , third] = arr (skips allowed); defaults apply only to undefined (not null). Spread in literals: { ...obj, b: 2 } — later properties override earlier, but shared references persist (nested objects are shared, not cloned). Rest: function f(...args) — an honest array (arguments object is not). Template literals: embedded expressions in the dollar-brace form, multi-line by default, tag functions for custom processing (styled-components-style tagged templates, i18n l10n-style translators); the raw-string tag suppresses escape processing — the only reason backticks exist in CSS-in-JS tooling. Every one of these is syntax sugar with real memory and evaluation order — destructured variables are new bindings, spread copies references, defaults evaluate lazily per access.`,
      },
      {
        title: "Collections: Map, Set, WeakMap, WeakSet, arrays deep.",
        body: `Array methods chain like a functional DSL: map (1:1 transform), filter (subsequence), reduce (fold — the only loop that needs no mutable variable, the only one people misuse — always return the accumulator), find/findIndex (short-circuit search), some/every (predicates), includes (SameValueZero — NaN found, -0 === 0), sort (in-place, default lexicographic! — always pass (a, b) => a - b for numbers — the single most common JS bug of the decade), flat/flatMap (one level), Array.from and Array.of (creation). Map: insertion-ordered keys of any type, size property, for-of iteration — never leak keys by accident; Set: uniqueness via SameValueZero — [...new Set(arr)] dedupes in one line. WeakMap: object keys, non-iterable, GC by reachability — attaching private state without holding values forever. Performance: prefer Map/Set for frequent membership tests, plain arrays for ordered homogeneous storage; both iterate in insertion order — an ordering contract that makes cache designs natural and correct.`,
      },
      {
        title: "Equality, coercion, and the NaN swamp.",
        body: `=== compares type-and-value with no coercion except for the special cases NaN !== NaN (nobody expects it, everybody spreads) and -0 === 0 (fine until Object.is matters, e.g. distinguishing sign via -Infinity or 1/x). == coerces via the abstract equality rules (ES spec: ToNumber/ToPrimitive with hint) — '1' == 1 true, null == undefined true, null == 0 false; the only safe uses are const-null-ish checks and the legacy typeof cascade — prefer === and explicit boolean coercion (!!x). NaN: the answer to every impossible IEEE-754 float question; NaN !== NaN means includes() would fail where indexOf === NaN fails too — use Number.isNaN (not the global isNaN, which coerces), Object.is(NaN, NaN) true. Mixed-type equality is the source of every 'why is my array a string now' story — the JS 'addition operator' chart (number + string → string; everything else coerces) is where the rules live; the mitigation is TypeScript and discipline.`,
      },
    ],
    worked: [
      {
        title: "Read this program without running it.",
        body: `const obj = { a: 1, b: { c: 2 } };\nconst { a, b: { c } } = obj;\nb = {...b, d: 3};\nb === obj.b; // ?; c; // ? — b destructured as a copy of the reference; spread created a new object {c:2,d:3}; b === obj.b is false (new identity for the top level), obj.b.d is undefined (d was added to the copy, not the original); c = 2 through nested destructuring of the original b — the captured reference at destructure time, untouched by the later reassignment. The whole puzzle is reference semantics with three different lifetimes; every JS interview ever run tests exactly this.`,
      },
      {
        title: "Rewrite this callback soup with map/filter/reduce.",
        body: `const totals = orders.filter(o => o.status === 'paid').map(o => o.total).reduce((sum, n) => sum + n, 0); — the three lines a junior writes in 9 lines of loops, and the reason modern JS reads like algebra: predicate → transform → fold with a 0 identity element; debugging is trivial (log intermediate arrays); parallelism-friendly; no mutable accumulator hiding off by one errors. Every performance question in this shape: the array methods are single-pass, allocation-efficient, and near-native speed; the loop is not faster — it is only older.`,
      },
      {
        title: "Closure counter bug — spot and fix.",
        body: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); — prints 3, 3, 3 because var is function-scoped: one binding shared by all three closures, mutated to 3 before any callback runs. Fix 1: let (block-scoped — fresh binding per iteration — prints 0, 1, 2). Fix 2: IIFE capture ((i) => {...})(i) — every old codebase has this scar. Fix 3: const inside loop with for-of [0,1,2].forEach(const...) — same semantics. Every interview drill this decade has been re-skinned this exact question; the lesson is lexical capture, not loops.`,
      },
      {
        title: "Sort by number, ascending.",
        body: `const xs = [10, 2, 3, 100]; xs.sort((a, b) => a - b); // [2,3,10,100] — without the comparator it sorts lexicographically ('10' < '2'). Ascending: a - b; descending: b - a; sort is stable in modern engines (ES2019); it mutates in place — copy first with [...arr].sort(...) if you need the original intact. The same idiom with localeCompare for strings and with (a, b) => a.total - b.total for objects-of-money — four one-line programs that cover 90% of sort bugs in production reviews.`,
      },
    ],
    exam: [
      {
        question: "What does console.log(typeof null) print and why?",
        answer:
          "'object' — a first-edition implementation artifact frozen into the spec for backward compatibility (the low bit of the type tag was 0 for null and for object pointers). Every output-focusing question wants this answer first, then the context: typeof is a cheap tag check with three legacy scars (null, arrays ('object'), function ('function')).",
      },
      {
        question:
          "Is === transitive with NaN, and what should you use instead?",
        answer:
          "No — NaN !== NaN breaks transitivity; every Set/Map implementation relies on SameValueZero (NaN equals NaN for dedup purposes). Use Number.isNaN for checks, Set/Map for collections, and Object.is for exact semantics (NaN true, -0 !== 0 intentional).",
      },
      {
        question:
          "What's the difference between spread {...a} and Object.assign({}, a)?",
        answer:
          "Functionally identical for plain enumerable own string-keyed properties: both are shallow, both copy references (nested objects are shared), both ignore non-enumerable and symbol-named keys unless told otherwise. Spread is terse and literal-friendly in JSX props and reducer updates; assign is variadic for merging many sources. Neither clones.",
      },
      {
        question: "How does for-in differ from for-of?",
        answer:
          "for-in iterates enumerable string keys (including inherited — filter with hasOwnProperty or Object.keys); for-of iterates values of any iterable (arrays, strings, maps, sets, generators). for-of is the honest loop for ordered data; for-in belongs to legacy object-property tooling; using for-of on a plain object throws TypeError because plain objects are not iterable.",
      },
    ],
    cheat: [
      "let/const block scope; var function scope + hoisting; closures capture bindings, not values.",
      "arr[i] access is not type-checked; Map/Set for O(1) lookup/uniqueness; weak keys for caches.",
      "=== strict; avoid ==; Object.is for NaN and ±0; Number.isNaN not isNaN.",
      "Spread = shallow copy of own enumerable props; nested objects shared; nothing is cloned.",
      "sort() is lexicographic — pass (a,b) => a - b; flat(1); reduce must return accumulator.",
      "Prototype chain walks own props then [[Prototype]] until Object.prototype.",
      "this binding: arrow captures lexical this; detached method loses receiver — use bind/arrow.",
    ],
    recap: `Modern JavaScript is the composition of eight mechanisms — scope, closures, prototypes, references, strict equality, iteration, promises, modules — because every bug report with 'object changed unexpectedly' is a reference being shared, every 'undefined is not a function' is a detached receiver, and every 'weird sort' is the missing comparator; the whole language reduces to one lesson: identity, ownership, and order — narrow them and the rest follows.`,
    code: {
      title: "SameValueZero vs strict equality",
      language: "javascript",
      code: "new Set([NaN, NaN, -0, 0]).size; // 2 — NaN deduped, -0 === 0 by SameValueZero",
      explanation:
        "Three characters of spec and the entire reason Map/Set beat object lookup for mixed keys.",
    },
    diagram: {
      title: "Property resolution chain",
      caption:
        "Own property → prototype → Object.prototype → undefined; never an exception until you call on it.",
      mermaid: `flowchart LR\n  O[obj.prop] --> W{own?}\n  W -->|yes| V[value]\n  W -->|no| P[[[Prototype]] chain]`,
    },
  },
  "web-dev-javascript-and-typescript-async-javascript-and-the-event-loop": {
    intro: `Async JavaScript is the engine room of the platform: one thread, run-to-completion, an event loop that drains queues of promised continuations and callbacks between tasks — so that nothing blocks and everything eventually arrives. The subject covers the call stack, the task and microtask queues, promise mechanics, async/await desugaring, error propagation through await, and the engineering rules that keep UI responsive and servers honest.`,
    foundations: `The runtime: call stack (one), heap (objects), Web APIs / Node APIs (timers, IO, fetch), task queues (timers, IO, UI events) and microtask queue (promise jobs). The loop: run one task → drain microtasks until empty → poll rendering/graphics → next task. Microtasks preempt the next task — every await chain finishes before the next task runs — the reason two promise callbacks interleave predictably while setTimeout callbacks alternate. Promises: pending → fulfilled/rejected, irreversibly, exactly once; .then/.catch/.finally register reactions; async/await is sugar over promise chains (return value → resolved; throw → rejection). Error model: await throws rejections; try/catch around await works; .catch avoids unhandled rejection warnings; requestAnimationFrame for paint-synced work; setTimeout(fn, 0) is a task, not a microtask.`,
    concepts: [
      {
        title: "Call stack, tasks, and microtasks — the priority order.",
        body: `The stack is where frames accumulate: global → function calls → returns — block until empty, then the loop begins. Microtasks (promise reactions, queueMicrotask, process.nextTick in Node) run immediately after every stack-clearing point and before any rendering or next task — promise chains therefore never interleave with timers or IO between their steps. Tasks (macrotasks): timers, IO callbacks, message events, UI events — one per iteration of the loop. Rendering steps (style/layout/paint) happen between tasks — that is why await pages update at most once per task batch. Two innocent-looking programs: setTimeout(f, 0) vs Promise.resolve().then(f) — the second always runs f before the first; every event-loop interview question reduces to writing this order out by hand; every ordering bug in real code is an await where a setTimeout belongs or vice versa.`,
      },
      {
        title: "Promises are state machines, not callbacks.",
        body: `Promise<T>: exactly one of pending, fulfilled (with value), rejected (with reason) — irreversible, settled once, forever. .then(onFulfilled) consumes fulfillment to either transform a value (return new value) or chain work (return a promise) — flattening flattens a promise-of-promise into one level (.then returns adoption of the inner promise — the reason return f() inside .then chains just works). .catch handles any rejection upstream; .finally(always run after settlement — cleanup without seeing the value). A promise is a memoized computation with split channels — the design moves error flow from in-band (arguments, return codes) to out-of-band (separate channel) — the reason modern APIs don't pass (err, data) tuples anymore. Never forget: a rejected promise with no .catch (or try/await) triggers an unhandledRejection event — in browsers a console error; in Node, a crash by default in modern runtimes.`,
      },
      {
        title: "async/await desugaring and the try/catch discipline.",
        body: `async function f() { return x; } ≡ f = () => Promise.resolve(x); — the wrapper promise is added even around sync returns; async function that throws x ≡ rejected promise with x. await p suspends the async function (not the thread) and resumes in a future microtask with p's settlement — await inside loops serializes (await a; await b; await c;) while Promise.all([a,b,c]) runs them concurrently — the single biggest performance misconception in beginner async code; always parallelize independent awaits with Promise.all/allSettled/race/any. Error model: await throws rejections, so try/catch around await works — but try/catch can't see errors inside .then chains you forgot await; mixing both styles in one function is asking for double-handling. finally blocks run regardless — every lock release belongs there.`,
      },
      {
        title: "Concurrency combinators: all, allSettled, race, any.",
        body: `Promise.all(p1, …pn): all succeed → array of results in order; first rejection fails the whole with that reason — the default when partial failure invalidates the batch (transaction-ish). allSettled: never rejects — gives you [{status:'fulfilled', value} … {status:'rejected', reason}] — the tool for best-effort pages where each panel can fail independently (sports scoreboards, dashboards). race: first to settle wins (value or error) — timeouts implemented as race(work, timeout(5000)); any: first to FULFILL wins (rejections skipped until all reject) — fastest-mirror fetching. every combinator shares the shape promise → settlement array → your logic — learn them once as one shape, not as four APIs.`,
      },
      {
        title: "Node versus browser event loops — where the rules differ.",
        body: `Browsers: render (rAF + style/layout/paint) happens as a special task between microtask drains; Node: six phases (timers → pending callbacks → idle/prepare → poll → check (setImmediate) → close callbacks) with nextTick queue and microtasks interposed after EACH callback, not just between tasks — difference: setImmediate beats setTimeout(0) inside IO callbacks, and nextTick starves the loop if you recurse it (process.nextTick runs before I/O continuation). Browsers never have nextTick; servers always do. The practical rule: in Promise code both runtimes behave identically (microtasks first); in callback code Node and browser genuinely diverge — which is why every 'who runs first' puzzle is always asked about the browser event loop, and Node engineers learn phases separately.`,
      },
    ],
    worked: [
      {
        title: "Predict the output order.",
        body: `console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\n(async () => { console.log('4'); await null; console.log('5'); })();\nconsole.log('6'); — answer: 1, 4, 6, 3, 5, 2. Chain: the async IIFE runs sync up to await (prints 4), suspends; stack clears printing 4 already, then 6; then microtasks drain: .then prints 3; then the async continuation resumes (after the null promise) printing 5; await null still scheduled as microtask — 3 and 5 order by registration (3 registered first via .then before async registered its resume? await null's resume registers at the await point — registered after the .then callback was queued at the Promise.resolve().then line — so 3 then 5); finally the timeout task prints 2. The whole skill is two-queue bookkeeping forever.`,
      },
      {
        title: "Serialize vs parallelize: fix a slow page.",
        body: `async function load() { const a = await fetchA(); const b = await fetchB(); return combine(a, b); } — latency = A + B; independent requests should be [a, b] = await Promise.all([fetchA(), fetchB()]); — latency = max(A, B). The fix appears in every performance review of pages that 'await everything in order'. The rule: only chain awaits when one depends on the previous result; otherwise fan out and combine; every fetch waterfall you killed in the Network waterfall was this exact bug.`,
      },
      {
        title: "Timeout wrapper via race.",
        body: `function withTimeout(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]); } — the promise never settles twice so the loser's callbacks are GC-safe; caller: await withTimeout(fetch(url), 5000) — on timeout you get a rejection you can retry or degrade around; the losing fetch keeps running (fetch has no cancel unless you hold an AbortController — wire the controller in for a true cancellation: every serious wrapper does).`,
      },
      {
        title: "Error handling of three dependent awaits.",
        body: `async function handler(req, res) { try { const user = await auth(req); const data = await load(user.id); const saved = await save(data); res.json(saved); } catch (err) { log(err); res.status(500).json({ error: 'failed' }); } } — one try covers the whole dependency chain, and one failure response covers every error — that is the entire value proposition of await over .then chains without .catch at every link; the alternative (.then(...).then(...).catch(...)) buys the same thing with less nesting than 2012 promised-callback style but still demands you remember the catch — the missing catch is the bug class await solves.`,
      },
    ],
    exam: [
      {
        question: "Can a promise become pending again after settling?",
        answer:
          "No — state is irreversible and settles exactly once; every further .then triggers immediately with the memoized outcome; the machine has no retry button inside the promise itself — retries live in wrappers that build NEW promises.",
      },
      {
        question: "What queue does Promise.resolve().then callback use?",
        answer:
          "The microtask queue — drained completely between stack-clearing points, before timers, IO, and paint; that is why two .then callbacks always run before any setTimeout(fn, 0) even when both are scheduled while the stack is empty.",
      },
      {
        question:
          "Why does await inside a for-loop serialize independent fetches?",
        answer:
          "Each iteration awaits the previous promise — execution of iteration k+1 doesn't begin until iteration k settles; the stack alternates between the two awaits with no overlap in flight. Promise.all([urls.map(fetch)]) starts all requests immediately; latency becomes max instead of sum.",
      },
      {
        question: "How does await turn a thrown value into control flow?",
        answer:
          "Await rejects to a thrown exception in the async function — try/catch catches it, .catch() on the caller catches anything not caught inside, and a never-caught rejection surfaces as unhandledRejection (browser console error; Node: crash by default). Error propagation is exactly the same shape as synchronous throws, just across time.",
      },
    ],
    cheat: [
      "One stack; microtasks (promise jobs) drain before tasks (timers/IO) and before paint.",
      "await = suspend function; resume in microtask when promise settles — not thread sleep.",
      "Parallel independent work: Promise.all — the #1 async perf fix.",
      ".catch at chain end or try/await wrap; never leave unhandled rejections.",
      "Promise.all (fail-fast), allSettled (never rejects), race (timeout), any (first fulfill).",
      "Microtask = after stack clear, before IO; Node nextTick runs before promise microtasks.",
      "await serializes; map + all parallelizes; Map preserves insertion order.",
    ],
    recap: `Async JavaScript is one thread orchestrated by priority: stack, microtasks, tasks, paint — because the platform forbids blocking, every program is a continuation scheduled around those queues, and the engineers who master promise settlement, suspension points, and queue order stop being surprised by order-of-callback puzzles forever.`,
    code: {
      title: "Predict the print order",
      language: "javascript",
      code: "setTimeout(() => console.log('task'), 0);\nPromise.resolve().then(() => console.log('microtask'));\nconsole.log('stack'); // stack, microtask, task",
      explanation:
        "Three lines that encode the whole scheduler — burn them in.",
    },
    diagram: {
      title: "Event loop queue order",
      caption:
        "Stack → microtask drain → tasks → render — microtasks always preempt pending tasks.",
      mermaid: `flowchart LR\n  S[Call stack clears] --> M[Microtasks drain empty]\n  M --> R[Render / paint]\n  R --> T[Next task]`,
    },
  },
  "web-dev-javascript-and-typescript-browser-apis-and-performance": {
    intro: `Browser APIs are the platform's standard library: DOM, Fetch/XHR, storage, timers, IntersectionObserver, Web Workers, caching, media, and the observer family — because the browser gives 60fps frames away or takes them back silently, the subject covers the APIs that actually move pages, the performance cliffs of layout thrash and re-render, and the measurement discipline (Lighthouse, performance.mark, the Performance panel) that turns guesses into deltas.`,
    foundations: `The browser's pipeline per frame: task → JS (your work) → style recalc → layout → paint → composite. Layout (reflow) and paint are the expensive stages — touching geometry in loops causes layout thrash (repeated forced sync layout); reading offsetWidth/getBoundingClientRect after writes forces synchronous layout; batching reads then writes eliminates it. Fetch API + AbortController + streaming bodies; storage tiers: cookies (4 KB, sent with every request — session cookies, SameSite), localStorage (5–10 MB, sync, string-only, per origin), sessionStorage (tab lifetime), IndexedDB (async, big, structured records — the only client database worth the name for real data), Cache API (HTTP response cache — offline, instant repeat visits). Observers: IntersectionObserver (lazy images, infinite scroll), MutationObserver (DOM changes), ResizeObserver (component size). Performance measurement: performance.now() monotonic, performance.mark/measure, the Performance panel flame charts, Lighthouse audits, and the Core Web Vitals (LCP, INP, CLS) as the contract with users.`,
    concepts: [
      {
        title: "DOM surgery is layout's price: batch, read-then-write.",
        body: `querySelector returns the first match — CSS selectors at full speed; querySelectorAll returns a static NodeList — not live (unlike getElementsByClassName). Template literals + insertAdjacentHTML edit fast but skip the tree (and bypass sanitization — every innerHTML with user data is an XSS waiting for approval; use textContent or sanitize). The write-read trap: el.style.width = '200px'; const h = el.offsetHeight; — the read forces layout to be consistent NOW, before paint; doing it in a loop = layout thrash (n× reflow). Pattern: collect reads, then writes (requestAnimationFrame batches naturally inside the frame). classList.toggle beats style.display toggling for performance AND debuggability; dataset for custom attributes; every mutation you throttle through fragments (DocumentFragment — one append), not a hundred. The profiler line: 'Forced reflow is a layout.net-paid attorney — visible in the Performance panel, burning frames.'`,
      },
      {
        title: "Fetch done right: abort, stream, and error discipline.",
        body: `fetch(url, { signal }) — AbortController cancels in-flight requests (component unmount, navigation); every effect with fetch must own a controller or risk the classic setState-after-unmount leak. fetch throws ONLY on network failure — 404/500 are normal responses, check res.ok (res.ok === false for status ≥ 400) — the #1 misread mechanic of the whole API (an un-thrown 500 looks like success data otherwise). Response bodies are streams — res.json() (JSON), res.text(), res.blob(), res.formData(), or for huge payloads, const reader = res.body.getReader() — the only way to stream progress without mounting everything in memory. Headers: request headers merge with browser defaults — Content-Type must match body exactly or preflight/opacity rules snap in; CORS preflight (OPTIONS) is triggered by non-simple methods/headers — the 100% guarantee your fetch 'does nothing' is a preflight failing somewhere you never watch.`,
      },
      {
        title:
          "Storage hierarchy: cookies vs localStorage vs IndexedDB vs Cache API.",
        body: `Cookies: automatic, every request, small (4 KB), flags: HttpOnly (no JS), Secure, SameSite=Lax/Strict/None — the only place with a built-in request-transport guarantee — the session/JWT hammer. localStorage: synchronous key-value strings, 5–10 MB, per origin, forever (fragile in private browsing — wrap access in try/catch), quota errors on full — the config/flag cache (never the data layer). sessionStorage: tab-scoped localStorage — per-tab scratchpads. IndexedDB: async object store of arbitrary structured data — the correct home for offline-first apps, large user content, and queueing (service workers write, pages read). Cache API: Response objects from fetch — offline fallback pages, instant repeat loads (service worker + cache.match). Every multi-tab consistency question across tabs resolves via BroadcastChannel or storage events; every quota error path resolves via try/catch + graceful degradation or IndexedDB.`,
      },
      {
        title: "Observers: IntersectionObserver and family.",
        body: `IntersectionObserver(callback, { root, rootMargin, threshold }) — fires when elements enter/leave viewport or root — lazy-loaded images (loading='lazy' is now native and preferred; the observer is for custom layout IO), infinite scroll sentinels, scroll-triggered animations (with reduced-motion respect). MutationObserver — watch childList/attributes/subtree — the tool for DOM-heavy widget embeds where you can't own the host; run after mutation batches, not per mutation. ResizeObserver — element size changes — the 'why do I keep doing ResizeObserver when I have flex' question answers itself on dashboards/canvases. PerformanceObserver — paint timing, long tasks (> 50 ms blocks), layout shift entries — the first-party telemetry without shipping your own profiler, feeding your RUM dashboards. Every observer is cheaper than its scroll/resize listener counterpart by orders of magnitude — stop listening to wheel/resize for visibility; observe intersections instead.`,
      },
      {
        title: "Core Web Vitals and measurement ritual.",
        body: `LCP (largest contentful image/text ≤ 2.5 s at p75 field, 4 s acceptable, 6+ bad), INP (interaction→next paint ≤ 200 ms, 500 bad — every input handler budget), CLS (≤ 0.1 — reserve space for media/injected ads). Lab vs field: Lighthouse (lab, repeatable, CI-able — catches what CI can see) + CrUX/web-vitals library (field, real-user p75s — the only numbers Google penalizes). Measure in code: performance.mark('x'); …performance.measure('x', 'x', 'end'); — dump into Performance panel or your analytics with attribution; long tasks (> 50 ms) visible as 'Long Tasks'; forced reflow entries visible with Layout Shift attribution. The ritual: reproduce, profile, mark, measure, verify on 3G/throttling in DevTools; never ship optimizations you haven't re-measured.`,
      },
    ],
    worked: [
      {
        title: "Kill a layout-thrash loop reading offsetWidth.",
        body: `for (const el of items) { el.style.left = computeLeft(el); el.offsetWidth; } — every iteration reads a geometry property that was just dirtied by the write, forcing sync layout: n× reflow. Fix: batch — const widths = items.map(el => el.offsetWidth); /* reads */ for (const [el, w] of zip(items, widths)) el.style.left = ...; /* writes */ — one layout total. The browsers' DevTools Performance panel flags 'Forced reflow' — every fix begins there, never with guessing.`,
      },
      {
        title: "Escape the double-fetch waterfall.",
        body: `Home page: const me = await fetch('/api/me'); const feed = await fetch('/api/feed/' + me.id); — two sequential round trips, a serial waterfall of exactly the bytes you already parallelized as [me, feed] = await Promise.all([...]); even better: /api/home returns both in one response (BFF pattern) — every request chain you removed in the waterfall chart is a page that feels instant without a single byte less content.`,
      },
      {
        title: "AbortController cleans a settler on unmount.",
        body: `useEffect(() => { const c = new AbortController(); fetch('/api/x', { signal: c.signal }).then(r => r.json()).then(d => mounted && setData(d)); return () => c.abort(); }, []); — abort flips fetch to reject with AbortError; the .then chain never fires; setState-on-unmounted gone; the router unmounting during navigation no longer leaks handlers or fires state updates into detached trees. The canonical first-party cleanup for every data fetch in React.`,
      },
      {
        title: "Calculate the LCP candidate and how to preload it.",
        body: `Hero <img> at 1200 px; LCP metric = its render time. Fix: <link rel='preload' as='image' imagesrcset='hero.avif' fetchpriority='high'> + <img width height fetchpriority='high'> — dimensions stop CLS, preload starts decode before <img> parse, fetchpriority bumps it past everything else competing for bandwidth — LCP drops because discovery latency and priority, not network, were the problem. Watch Lighthouse 'Preload key request' — the exact recommendation shipped from the same machinery.`,
      },
    ],
    exam: [
      {
        question: "Why doesn't fetch throw on a 404 response?",
        answer:
          "Fetch rejects only on network-level failure (DNS, TLS, offline, abort) — HTTP error statuses are valid responses to the application layer. Check res.ok (or res.status) yourself; .catch() alone never sees 404/500. Every REST client built 2015-2018 tripped on this once, at least.",
      },
      {
        question:
          "How do you distinguish cookies from localStorage for tokens?",
        answer:
          "Cookies ride every request automatically and can be HttpOnly/Secure/SameSite — the only option protected from JS theft; localStorage is JS-accessible, persists indefinitely across sessions, and is sent nowhere automatically — fine for flags/prefs, the wrong home for session secrets; IndexedDB for data volume, nowhere for anything a server needs per-request unless you explicitly fetch it.",
      },
      {
        question: "What is forced synchronous layout and how does it happen?",
        answer:
          "Any read of layout geometry (offsetWidth, getBoundingClientRect, scrollHeight...) after a style/DOM mutation forces the browser to finalize layout before answering — an invisible sync reflow, cheap once but expensive inside loops; the fix is always read-then-write batching, and the detection is the 'Forced reflow is a layout thrash' warning in DevTools.",
      },
      {
        question:
          "Which API replaces scroll listeners for 'element entered view'?",
        answer:
          "IntersectionObserver — fires without burning a main-thread callback on every scroll pixel, with configurable threshold and rootMargin, usable for lazy loading, sentinel-based infinite scroll, and reveal animations; event-driven visibility, not per-frame polling; every lazy image system in production uses it (or the native loading='lazy' equivalent for images).",
      },
    ],
    cheat: [
      "Batch DOM reads, then writes; never interleave style writes with geometry reads in loops.",
      "fetch: res.ok check; AbortController for cancel; stream bodies for big payloads.",
      "Cookies = transport secrets (HttpOnly); localStorage = flags; IndexedDB = offline data.",
      "IntersectionObserver for visibility; MutationObserver for DOM changes; ResizeObserver for size.",
      "LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 — field p75 is what ships to users; Lighthouse is the lab.",
      "performance.mark/measure + web-vitals library for real RUM numbers.",
      "Content-visibility: auto for below-fold sections; contain:strict isolates layout.",
    ],
    recap: `The browser is a frame budget wearing an API catalogue: because every mutation is a negotiation with style, layout, paint and composite, the APIs that win (observers, batched DOM, IndexedDB, Cache) are the ones that stop unnecessary work; because LCP/INP/CLS are the only three numbers users can feel, every performance question reduces to 'what just forced work on the main thread, and why?' — and the answer is never 'nothing', always 'something, somewhere, batched wrong.'`,
    code: {
      title: "One round of forced reflow prevention",
      language: "javascript",
      code: "const rs = els.map(el => el.offsetWidth);\nels.forEach((el, i) => { el.style.width = rs[i] + 'px'; });",
      explanation:
        "Two passes — collect first, mutate second: the layout bill drops from n to 1.",
    },
    diagram: {
      title: "Frame pipeline",
      caption:
        "Task → JS → style → layout → paint → composite — every layout pass starts with a write someone forgot.",
      mermaid: `flowchart LR\n  T[Task] --> J[JS]\n  J --> S[Style recalc]\n  S --> L[Layout]\n  L --> P[Paint]\n  P --> C[Composite]`,
    },
  },
  "web-dev-javascript-and-typescript-modules-bundlers-and-build-tools": {
    intro: `JavaScript modules define the unit of sharing — what you import is what you get, hoisted by the bundler, resolved at build time — and the bundler stitches thousands of files into the handful of assets a browser actually downloads. The subject covers ES modules and CommonJS lineage, the import/export contract, tree shaking, side effects, chunking, source maps, and the three tools every project eventually meets (esbuild/rollup/vite), plus the deception that bundlers 'never break anything'.`,
    foundations: `ES modules (ESM): export/import keywords, static structure (all imports hoisted to top, resolved before execution), live bindings (imported names see later assignments, not snapshots), strict mode by default; CommonJS (CJS): require/module.exports, dynamic, executed in order, mutable cached exports, sync; interop: Node and bundlers emulate both. Static analyzability is why bundlers can tree-shake: unused exports eliminated when sideEffects: false or per-module no-side-effects; side effects are statements that run at import time (polyfills, registries, css injections) — they pin modules into the bundle unless flagged. Chunking strategies: route-based (most wins), vendor/runtime split (browser caching), dynamic import() at the boundary; source maps (.map) stack-trace back to original TS/JSX regardless of minification; watch mode and HMR replace reload — vite: no-bundle dev served as ESM, production = Rollup, sub-100ms starts for most apps.`,
    concepts: [
      {
        title: "ESM mechanics: live bindings and hoisting.",
        body: `import x from './x.js' — default import gets the default export; named imports map to exported bindings by name; namespace import * as m gets all exports as one object; the imported binding is LIVE: if the module reassigns its own export (export let count = 0; increment()), importers see the new value — CommonJS copies values at require time; ESM never copies, ever. Imports are hoisted to the top — they execute before any other statements in the importing file; cyclic imports therefore link before any code runs — the cycle yields partial exports (TDZ errors, or undefined for function declarations). Static structure: no dynamic string concatenation in import paths (import(expr) is a separate dynamic-import feature, not static analysis). Every file is a module iff it contains import/export; otherwise it is a classic script — mixing semantics in one file is the leading cause of 'it works in the bundler but breaks in Node'.`,
      },
      {
        title: "CommonJS vs ESM vs the interop mess.",
        body: `CJS: require returns the finished module.exports object — mutated by the module as it runs; nested requires get the cached object; synchronous, single-shot evaluation; module.exports = a function/class happens to replace the object (module.exports = fn) vs adding props (module.exports.fn = fn) — two different import styles with two different shapes. ESM: exports are analyzed, not executed — named imports resolve at link time; live both ways. Interop: Node and bundlers synthesize default/interop behavior (require() an ESM gets you namespace-ish object; import a CJS module gets you the module.exports as default). Dual package hazard: shipping both builds means two copies of every singleton — one library identity, two state worlds — every senior burned by version pinning knows this as the 'instanceof fails in the other universe' bug.`,
      },
      {
        title: "Tree shaking and the sideEffects contract.",
        body: `Tree shaking = erasing code nothing imports: it requires static ESM and that the erased export have no import-time side effects. package.json "sideEffects": false tells bundlers nothing happens at import time in any module → all unreferenced code is dropped; a list ["./polyfill.js"] keeps only those; leaving it unset forces conservative retention (everything ships). Real-world collapse modes: (1) whole-library imports — import _ from 'lodash' pins everything; use lodash-es or per-path imports; (2) CSS injected by JS packages (side-effectful by design — must be listed or watch for silent erase); (3) Object.create polysills; (4) import 'core-js' chains. Every 'bundle is 800 KB for a form' ticket starts with this section.`,
      },
      {
        title: "Chunking strategy and dynamic import.",
        body: `code splitting: import('./HeavyEditor') returns promise of the module — bundler emits it as a separate chunk, loaded on demand; frameworks wrap this as lazy routes/suspects (React.lazy + Suspense); the chunk graph — entry → routes → shared chunks (common modules hoisted to a shared chunk so they cache across routes) — every build output visualizes it in 'npm run analyze' (webpack-bundle-analyzer, source-map-explorer). Vendor chunk: stable bytes (node_modules) hashed into long-cache busting-immune filenames — browser revalidates never change unless the version changes; runtime chunk carries webpack/runtime manifest. Real-world: dynamic imports for below-fold widgets, modals, charts, and admin-only tools — cuts entry bundles by 30-60%; LCP is never the editor you deferred successfully.`,
      },
      {
        title: "Source maps, workers, and the minifier contract.",
        body: `Source maps: every file carries .map JSON (names, mappings VLQ) — DevTools/Debuggers display original sources even from minified code; always ship maps to error reporters via upload, never to production users (statement-level exposure); every crash report without sourcemaps is archaeology. Workers: new Worker(new URL('./worker.ts', import.meta.url)) — bundlers build the worker as separate entry; SharedArrayBuffer in isolated cross-origin contexts (COOP/COEP) — the atoms/promises postMessage protocol underneath; Web Worker for CPU-bound parsing/crypto/compression — the only free lunch for main-thread latency left on the web. Terser/esbuild/swc minifiers: identifier mangling respects reserved words and exported names; legal for any build output you ever serve.`,
      },
    ],
    worked: [
      {
        title: "Diagnose an 1.4 MB bundle with one command.",
        body: `npx source-map-explorer dist/assets/*.js — output: 38% lodash, 22% moment, 11% core-js; killing all three (lodash → lodash-es/pick/map/deburr per path, moment → date-fns/Intl, core-js → targeted browserslist) drops the bundle to ~470 KB; wire bundlephobia.com checks or bundlesize CI to fail future regressions at > 100 KB; every 'optimize our bundle' task ever has followed this exact loop — measure, replace, enforce in CI, done.`,
      },
      {
        title: "Fix dual-package instanceof failure.",
        body: `app imports lib from 'lib' (ESM); server imports same version (CJS); instanceof lib.Foo fails across the boundary — two module classes, two identities. Fix: bundle ESM everywhere possible (type: module + import), or require consistently (CJS interop), or pin 'exports' map in the lib's package.json pointing everyone at one build — long-term: dependency has 'exports' field with 'import' and 'require' subpaths both pointing to dual-compiled files — the library author fixes it; the consuming team aligns their module system — same lesson forever.`,
      },
      {
        title: "Defer an admin panel with dynamic import.",
        body: `const AdminPanel = lazy(() => import('./admin/AdminPanel')); — users who never visit /admin never download it; visible chart: initial load drops 340 KB; route-level code splitting is the single highest-ROI change for enterprise SPAs; every 'first paint feels instant' app of the last decade did this exact move.`,
      },
      {
        title: "Why does adding one CSS import double the bundle?",
        body: `Imports like import 'chart.js/dist/chart.min.css' execute side-effectful code (register font faces, inject styles); sideEffects unset → bundler cannot erase; 280 KB of CSS/components arrive for one color property. Fix: list './dist/chart.min.css' explicitly in sideEffects retain list (or replace with targeted import of the 2 KB theme file you actually use) — the bundle drops by orders; finding this one line was a year's worth of performance budget on one real project.`,
      },
    ],
    exam: [
      {
        question: "Why can ESM be statically analyzed but CommonJS cannot?",
        answer:
          "ESM imports/exports are syntactic contracts resolved at link time before any execution (names and files fixed by the spec, hoisted); require() takes arbitrary runtime strings computed from anything, evaluated whenever it appears — the bundler cannot know what you import until your code runs — the fundamental reason tree shaking is an ESM superpower.",
      },
      {
        question: "What is the purpose of the sideEffects field?",
        answer:
          "It tells the bundler that importing a module has no effects beyond the imports themselves — enabling it to erase unused modules entirely (not just unused exports); leaving it unset forces retention of everything that might have import-time effects — the contract in reverse, and the usual cause of enormous bundles with tiny usage.",
      },
      {
        question: "What does dynamic import() return and what does it enable?",
        answer:
          "A promise of the module namespace; it splits code at runtime — the imported module (and its dependency subtree) becomes a separate bundle fetched on demand; frameworks build lazy routes and Suspense boundaries on top of exactly this one primitive.",
      },
      {
        question: "How do live bindings differ from CommonJS exports?",
        answer:
          "ESM named imports are aliases to the module's mutable export variable — every importer sees the current value whenever accessed; CJS captures the value at require-time — later mutations never propagate; the subtle consequence: ESM supports live read of counters/phase-flags, CJS does not without getter theater.",
      },
    ],
    cheat: [
      "ESM: static, hoisted, live bindings, always strict; CJS: dynamic, runtime, cached, mutable copies.",
      "sideEffects:false erases unreferenced modules; unset means retain everything.",
      "Default vs named import shapes differ per module system — interop flattens both to one.",
      "Dynamic import() = route-level splits; framework lazy() sugar on top; LCP killer #1.",
      "Vendor chunk = stable long-cache; entry chunk = your code; runtime chunk = manifest.",
      "Source maps everywhere for errors, never for users; source-map-explorer for audits.",
      "Module cycle = linked-before-executed; TDZ errors mark the wound, not the rule.",
    ],
    recap: `Modules are a static contract the platform trusts before it trusts you: because ESM structure is frozen at link time, every byte of your bundle is deductible before it ships — the entire perf discipline of the modern web (tree shaking, code splitting, caching) is that contract kept honest by the bundler.`,
    code: {
      title: "Dynamic route split",
      language: "javascript",
      code: "const Admin = lazy(() => import('./Admin')); // fetched only when /admin is visited",
      explanation:
        "One line, 340 KB back — the mental image every bundle audit attempts to reproduce.",
    },
    diagram: {
      title: "Bundle graph after code splitting",
      caption: "Entry → routes; shared deps hoisted to a cached vendor chunk.",
      mermaid: `flowchart LR\n  E[Entry] --> R1[Route A]\n  E --> R2[Route B]\n  R1 --> V[Vendor chunk]\n  R2 --> V`,
    },
  },
  "web-dev-javascript-and-typescript-typescript-deep-dive": {
    intro: `TypeScript is JavaScript with a compile-time proof layer: every value carries a type the compiler can trace, erase, and verify before the first byte runs — making whole classes of runtime failure unrepresentable. The subject covers the type system end to end — inference, narrowing, generics, structural subtyping, unions/intersections, utility types, mapped/conditional types, and declaration files — taught to the depth where reading a type error is a skill instead of a plea for help.`,
    foundations: `TypeScript's type system is structural (duck typing), not nominal: compatible shapes are compatible types regardless of name — { x: number } matches { x: number; y?: string }. Inference is global: const exports literal types, function params infer from call sites optionally, return types from body. Union types (string | number) and intersections (A & B) compose; narrowing (typeof/instanceof/in/equality checks) refines unions along control-flow paths; discriminated unions (a common literal tag field) turn unions into the switch-based state machines you'd write anyway. Generics: parametric polymorphism over types T with constraints (extends) — Generic<T extends UserSchema>; conditional types (T extends U ? X : Y), mapped types ({ [K in keyof T]: ... }), and utility types (Partial, Required, Pick, Omit, Record, ReturnType, Parameters, Awaited) package the machinery. Declaration files (.d.ts) map JS libraries to types; tsconfig: strict, target, moduleResolution 'bundler', paths/baseUrl for aliases — strict is the only mode where TypeScript earns its keep; `,
    concepts: [
      {
        title: "Inference, widening, and literal types.",
        body: `const x = 'a' keeps the literal type 'a'; let y = 'a' widens to string — const-ness is the anchor of literal precision, and the reason const assertions (as const) propagate invariants into objects and arrays ({ a: 1 } as const freezes values and key identities). Inference follows the flow: const inference → const-like (literal), let/var → widened base; function return inference is structural from the body; generic call sites instantiate T from arguments — function picks the narrow union, argument the concrete members. Widening loses exact string-literal identity (necessary for mutability); narrowing happens at branches (x === 'a' refines string to 'a' through the truthy half of the condition). Every mysterious 'string is not assignable to 'a'' error you ever fixed was one of these three rules with the wrong anchor point — the fix is always (1) declare the narrow type, (2) const it, (3) assert as const — in that order.`,
      },
      {
        title: "Narrowing, control flow, and discriminated unions.",
        body: `typeof narrows: 'string', 'number', 'boolean', 'undefined', 'object', 'function' — union members exit one at a time. instanceof narrows class instances. 'in' narrows on property presence ({ a: string } | { b: number } — 'a' in x). Truthiness narrows nullables. Equality narrows: x === null or !== null, discriminant equality tag: if (u.kind === 'circle') u is Circle — the killer pattern: model a union with a shared literal field, switch on it, get each branch fully typed — exhaustiveness checking via never: default: { const _x: never = u; } — a missing case is a compile error forever; the most valuable types in the system look exactly like this. Type predicates (isX(x): x is Foo), assertion signatures (asserts x is Foo), and satisfies operator (annotation that doesn't widen: const cfg = {...} satisfies Config — checked, inferred literally) — the last three you'll reach for weekly in library code.`,
      },
      {
        title: "Generics: parametric polymorphism with constraints.",
        body: `function identity<T>(x: T): T { return x; } — T is inferred at call site; generic functions don't need type arguments at call sites 95% of the time. Constraints: T extends keyof U, T extends { id: string }, T extends string | number — narrowing inside bodies comes from constraints; defaults (T = unknown) for library entry points; inference from multiple positions — two params with same T force consistency ([a, b] must both satisfy T). Generic interfaces and classes: interface Box<T> { value: T }; class Result<T, E = Error> { ... }. Real uses: useState<T>(init), useEffect deps are typed by usage, promise pipelines Promise<T>, collection types (Map<K,V>, Set<T>, Record<K, T>). Every generic you ever shipped was a useState<T> in disguise; writing new ones when actual inference can't be depended on, or when the API must commit to a shape for compile-time guarantees the caller's site can't prove.`,
      },
      {
        title: "Unions, intersections, and the unknown/any/never triangle.",
        body: `Unions = one-of — the only sane way to model null/undefined (T | null), discriminant states, and result channels ({ ok: true; value: T } | { ok: false; error: Error }); exhaustive switch covers both. Intersections = all-of — { a } & { b } merges properties; intersection of primitives collapses to never (string & number impossible) — that never propagates upward and blank-outs anything in its reach — the error you see is correct even when it looks bottomless. any = compiler surrender — nothing is checked, propagates silently, disables narrowing — the escape hatch that destroys the entire value proposition of the language; never appears when a function must always throw or a union is provably exhausted; unknown = audited any — requires narrowing before use — the only honest 'could be anything' marker; every public boundary (JSON.parse, fetch.json()) should produce unknown, not any (lib defaults buy you any unless you enable unknownForJson-style wrappers — write your own decodeJson: (s: string): unknown => JSON.parse(s)).`,
      },
      {
        title:
          "Declaration files, module augmentation, and tsconfig discipline.",
        body: `.d.ts files map JavaScript APIs to types: declare module 'pkg', interface Window, module augmentation (declare module 'express-serve-static-core' { interface Request { userId: string } }) — the mechanism for every 'why doesn't my middleware see req.user' bug in every Express app ever. Triple-slash references, node16 vs bundler resolution, paths aliases ('#app/*'), declaration: true for libraries to emit .d.ts for consumers. Strict mode evangelist: strict includes strictNullChecks, noImplicitAny, strictFunctionTypes, useUnknownInCatchVariables — half your professor-grade bugs vanish overnight; without it TypeScript is a sugared JSDoc. Anti-patterns worth memorizing as cautionary: @ts-ignore without a comment (hides anything), @ts-expect-error with reason (visible), any leaking from JSON.parse, enum in public APIs (nominal branding that silently breaks across copies — prefer const objects + as const).`,
      },
    ],
    worked: [
      {
        title: "Exhaustive discriminated union — complete state handling.",
        body: `type Action = { kind: 'inc' } | { kind: 'dec'; by: number } | { kind: 'reset' };\nfunction reducer(state: number, action: Action): number {\n  switch (action.kind) {\n    case 'inc': return state + 1;\n    case 'dec': return state - action.by;\n    case 'reset': return 0;\n    default: { const _exhaustive: never = action; return _exhaustive; }\n  }\n} — default pulls action down to never; if a 4th case 'set' is added, this default fails to compile ('set' is not assignable to never) — the compile-time guarantee that every UI state is handled forever, without runtime checks; this is the crowning pattern of the entire type system and every Redux-style codebase lives on it.`,
      },
      {
        title: "Write a typed groupBy.",
        body: `function groupBy<T, K extends PropertyKey>(xs: T[], key: (x: T) => K): Record<K, T[]> {\n  const out = {} as Record<K, T[]>;\n  for (const x of xs) { const k = key(x); (out[k] ??= []).push(x); }\n  return out;\n} — callers: groupBy(users, u => u.role) → { admin: [...], user: [...] } fully typed with literal keys; the function is generic over both the element and the key type — no cast at the call site, no any, no overload glue — five lines of the most common utility shape in existence.`,
      },
      {
        title: "Type-safe event emitter in 10 lines.",
        body: `interface Events { login: (user: string) => void; error: (e: Error) => void; }\nclass Emitter<M extends Record<string, any>> {\n  private map = new Map<keyof M, Function[]>();\n  on<K extends keyof M>(ev: K, fn: M[K]) { (this.map.get(ev) ?? this.map.set(ev, []).get(ev)!).push(fn); return () => this.off(ev, fn); }\n  emit<K extends keyof M>(ev: K, ...args: Parameters<M[K]>) { (this.map.get(ev) ?? []).forEach(f => f(...args)); }\n} — Parameters<M[K]> ties emit arguments to the handler signature at compile time; adding 'click' to Events breaks every call site that emits with wrong args or unknown event names — the entire component lifecycle of modern typed frontends rests on this shape.`,
      },
      {
        title: "JSON.parse typed honestly.",
        body: `function parseJSON<T>(s: string): unknown { try { return JSON.parse(s); } catch { throw new Error('invalid JSON'); } } — unknown forces the caller to narrow: if (typeof data?.id === 'string') {...} — the decoupling of 'I have bytes' from 'I know shape' that 90% of JS code routes around entirely; every websocket message, every API response, every localStorage read starts exactly here.`,
      },
    ],
    exam: [
      {
        question: "What does strict mode turn on at minimum?",
        answer:
          "strictNullChecks (null/undefined aren't assignable everywhere), noImplicitAny (untyped parameters are errors), strictFunctionTypes (function-parameter bivariance holes closed), strictPropertyInitialization (class fields must be initialized), and a handful of others strictFunctionTypes, noImplicitThis, useUnknownInCatchVariables — the baseline without which TypeScript is mostly documentation.",
      },
      {
        question: "What is the difference between never and unknown?",
        answer:
          "never = the bottom type — nothing satisfies it; appears as the return of functions that never return (throw/loop forever) and as the unreachable branch of an exhaustive check; unknown = the top type — everything satisfies it; usable only after narrowing; both are duals — never erases unions to nothing, unknown preserves them all.",
      },
      {
        question:
          "What is a discriminated union and why prefer it over booleans?",
        answer:
          "A union of object types sharing a literal tag field (kind/status/type) such that narrowing the tag refines the whole object to that variant — a loading/error/data tri-state where isLoading && !data is invalid by construction; boolean flags pair-wise(isLoading, isError, isSuccess) permit impossible combinations (isLoading && isSuccess); the discriminated union makes them unrepresentable.",
      },
      {
        question: "What does the satisfies operator do?",
        answer:
          "Annotates an expression as checked against a type WITHOUT widening — the inferred type stays as narrow as possible (literal types, exact keys) while still verified against the annotation; the canonical fix for 'I want config validated but autocomplete to stay literal' — never lost existence before TS 4.9.",
      },
    ],
    cheat: [
      "Structural typing: shapes match, names don't; const preserves literals; let widens.",
      "Narrow with typeof/instanceof/in/equality; discriminated unions + exhaustive never default.",
      "any surrenders the compiler; unknown demands narrowing; never marks impossibility.",
      "Generics carry the caller's types — no casts; constrained T extends Schema for domain safety.",
      "as const for immutable literal config; satisfies for checked-but-inferred literals.",
      "strict: null checks + implicit any + function variance; without it TS is documentation.",
      "Declaration files = typed maps for JS libraries; module augmentation patches third-party types.",
    ],
    recap: `TypeScript is not a new language bolted onto JavaScript; it is the discipline of making JavaScript's everything-is-possible runtime show its author's intent at compile time — because the compiler only knows what your types say, the best TypeScript code says less and proves more; every annotation is a hypothesis the machine tests millions of times per second, forever.`,
    code: {
      title: "Exhaustive state check",
      language: "typescript",
      code: "default: { const _: never = state; throw new Error('unhandled'); }",
      explanation:
        "The two-line insurance policy every discriminated union deserves.",
    },
    diagram: {
      title: "Flow of a narrow-down",
      caption:
        "Union → branch → refined: the same mental geometry as a firewall ruleset.",
      mermaid: `flowchart TD\n  U[T union] --> C{Discriminant check}\n  C -->|tag A| A[Type A refined]\n  C -->|tag B| B[Type B refined]`,
    },
  },
  "web-dev-javascript-and-typescript-testing-javascript-applications": {
    intro: `Testing JavaScript is the engineering of certainty at speed: fast unit tests near the logic, integration tests across module seams, and end-to-end checks over real browsers — because the platform breaks silently under refactor pressure, the subject covers vitest/Jest, React Testing Library, fake timers, mocks and spies, component and contract testing, CI integration, and the one metric that actually matters: did the test fail when the code broke, and pass when it didn't.`,
    foundations: `The test pyramid: many unit tests (fast, isolated, logic-level), fewer integration tests (several units together, module/DB seams), rare E2E (whole app in browser). Test frameworks: vitest/Jest — describe/it, expect matchers (toBe/toEqual/toHaveBeenCalled), snapshot testing (toMatchSnapshot — for UI structure, brittle by design, keep narrow). React Testing Library: query by role/label/text like a user (getByRole('button', { name: 'Save' })), fire events with userEvent (real-ish interactions), await findBy for async UI; philosophy: test behavior not implementation (no component instance poking). Mocking: dependency injection (pass collaborators), module mocks (vi.mock), spies (vi.spyOn), fake timers (vi.useFakeTimers) for time-dependent code, test doubles for network (MSW) — the single biggest shift from unit to integration confidence. Property-based testing (fast-check) generates adversarial inputs. Coverage: lines/branches/functions/statements — signal, not target; 100% coverage locally green CI ≠ production health.`,
    concepts: [
      {
        title: "Unit tests: the contract, not the implementation.",
        body: `A good unit test asserts what the function promises — input → output or output + side effect — never the staircase of internal calls that produced it. vi.fn() spy-argument capture, mockReturnValue/mockResolvedValue for async doubles, mockRejectedValue for failure paths, clearAllMocks in beforeEach; every oracle is one of: exact output equality (toEqual for objects — deep equality, not reference), error assertions (expect(() => f()).toThrow('message')), async rejections (rejects.toThrow), snapshot of stable serialized output, or an invariant over many examples (fast-check). Untestable code is always the same bug: side effects baked into pure logic — the cure is one seam, one parameter, one clock to inject. Naming: describe('login', () => { it('rejects wrong password', ...) }) — failing test names in CI are your on-call friend at 2 AM.`,
      },
      {
        title: "React Testing Library: user-centric queries.",
        body: `RTL queries in priority order: getByRole (button/link/textbox — accessibility-first), getByLabelText (forms), getByText, getByTestId (last resort — every testid is a confession that the UI isn't accessible enough). async patterns: findByRole waits for the element (retry 1s default), waitFor for state assertions, userEvent.click/type/keyboard for realistic interaction (dispatches full event chain including focus/blur). The philosophy: 'The more your tests resemble the way your app is used, the more confidence they carry' — never query by class/id/state; never assert internal state; always assert what the user perceives — text visible, button enabled, message in the DOM. Common failure: act() warnings = un-awaited state updates — await userEvent or await findBy and the warnings vanish.`,
      },
      {
        title: "Fake timers, mocked network, MSW.",
        body: `vi.useFakeTimers() freezes Date and timers — vi.advanceTimersByTime(1000) — essential for debounce/throttle/auto-save/backoff logic; combine with async in the same test with care (never both fake timers and real sleep). MSW (Mock Service Worker): intercepts fetch at the network boundary with a service worker — no code changes to producers — request handlers shared between tests and dev server; the single best tool for app-level integration without standing infrastructure. Old-style per-test stubs (vi.stubGlobal('fetch', ...)) work but leak — clear globals; MSW's beforeAll/afterEach lifecycle keeps tests hermetic. Every integration test past the unit boundary rests on one of MSW or a real container (testcontainers) — pick by fidelity need.`,
      },
      {
        title: "Coverage, CI, and the mutation-testing truth.",
        body: `Coverage reports (vitest --coverage) count executed lines — it proves the tests touched the code, not that the assertions caught the bugs. Any file with 100% coverage can still let subtly broken behavior through — mutation testing (Stryker) injects faults and sees if a test fails — killed/survived counts the true assertion quality; the practical acceptance: keep new-code coverage strict (90%+ branches), treat 100% as an alarm bell, and run Stryker on modules carrying critical logic (payments, auth, reducers) at least once. CI integration: run unit on every push, integration on PRs, E2E nightly (or per release); flakes quarantine with them; branch protection gates on check runs — 'test failed' visible before merge, not after deploy; every pipeline ever built converges to this gate.`,
      },
      {
        title: "Snapshot testing: where it helps and where it lies.",
        body: `Snapshots serialize the rendered tree/output — adding a new icon auto-writes a new snapshot; reviewers see the delta as text — the one sane use: pinning huge HTML structures where the exact output is the spec; everywhere else they rot into 'update snapshot' button-mashing that never inspects anything. Mitigate: small targeted assertions instead ('the button shows Pending'), toMatchInlineSnapshot (visibility inside the file) for small outputs, and explicit review rituals for any snapshot change past N lines. Rule: if a snapshot fails you should be able to see exactly which character changed and decide deliberately.`,
      },
    ],
    worked: [
      {
        title: "Write the flaky date test — then fix it.",
        body: `Test: expect(greet()).toBe('Good morning') — fails at 9 AM depending on runner timezone. Fix: vi.useFakeTimers().setSystemTime(new Date('2026-11-10T08:00:00')); in beforeEach; vi.useRealTimers() in afterEach — deterministic forever, no timezones leaking in. Every 'works on my machine' CI log with time-dependent tests was this exact antipattern; ten minutes of fake-timer discipline pays for every project you ever touch.`,
      },
      {
        title: "Component test of login form — the shape.",
        body: `render(<LoginForm onSubmit={fn} />); await userEvent.type(screen.getByLabelText('Email'), 'me@example.com'); await userEvent.type(screen.getByLabelText('Password'), 'secret12'); await userEvent.click(screen.getByRole('button', { name: 'Sign in' })); expect(fn).toHaveBeenCalledWith({ email: 'me@example.com', password: 'secret12' }); — zero implementation details, pure user flow, async submit observable via findBy role-status; the whole login regression suite in one screen; every RTL tutorial converges here.`,
      },
      {
        title: "Mock network with MSW for fetch flows.",
        body: `const server = setupServer(http.get('/api/user', () => HttpResponse.json({ id: 7, name: 'Ada' }))); beforeAll(() => server.listen()); afterEach(() => server.resetHandlers()); afterAll(() => server.close()); — test asserts the component rendered 'Ada' from MSW's service worker response, no backend required; change the handler per-test for error paths with server.use(http.get('/api/user', () => new HttpResponse(null, { status: 401 }))); — the exact pattern that finally ended mock-fetch-spy-hell.`,
      },
      {
        title: "Mutation test the reducer once.",
        body: `Run Stryker against counter reducer: it flips + to −, swaps < to ≤, deletes a return — all three tests fail — good ('killed'). The moment Stryker reports 'survived', you have a test that passes on broken code — perfect evidence that your assertions were decorative; run it on auth/payments/reducer modules before you trust their coverage badge.`,
      },
    ],
    exam: [
      {
        question: "What does RTL's userEvent give you over fireEvent?",
        answer:
          "Real-ish interaction chains — userEvent.type dispatches keydown→keypress→keyup→input per character (respecting focus and disabled states); fireEvent sends one synthetic event directly; every form assertion that cares about validation-on-input or focus/blur behavior must use userEvent; fireEvent suffices for single isolated events.",
      },
      {
        question: "When does getByRole beat getByTestId?",
        answer:
          "Always, structurally: role queries bind to the accessibility tree — tests that don't care about accessibility fail loudly when roles are missing, forcing correct ARIA and semantics; testid is the honest escape hatch for leaf elements with no semantic identity (icons, dividers) — every query-priority guide lives on this hierarchy.",
      },
      {
        question: "What does vi.useFakeTimers() do to async code?",
        answer:
          "It freezes setTimeout/setInterval/Date so advanceTimersByTime(ms) drives the event loop deterministically without wall-clock waits; async/await chains still interleave correctly with the fake clock — you advance time, then await Promise.resolve() (or flushPromises) to collect them.",
      },
      {
        question: "Why does 100% coverage not mean the tests are good?",
        answer:
          "Coverage counts executed lines, not the correctness of assertions — a test may execute the function and assert nothing, or assert a tautology (true === true), passing silently; mutation testing provides the falsifiable metric (killed vs survived mutants) and is the only way to prove the tests actually guard against bugs.",
      },
    ],
    cheat: [
      "Pyramid: many fast units, some integration, rare E2E; unit boundaries are injected clocks/network/files.",
      "RTL: query by role/label like a user; userEvent > fireEvent; test behavior, assert DOM output.",
      "vi.spyOn + mockReturnValue/RejectedValue; fake timers for time logic; MSW for network seams.",
      "Coverage = touched code, not correct code; Stryker mutation = the assertion quality lie-detector.",
      "Snapshots pin large serialized output; narrow everything else to explicit assertions.",
      "describe/it naming doubles as incident documentation; beforeEach wipes mocks/globals.",
      "CI gates on unit (push) + integration (PR) + E2E (nightly) with quarantine for flakes.",
    ],
    recap: `Testing is the discipline of failing loudly at the earliest cheap moment: because every refactor eventually deletes someone else's safety net, the tests you keep are the ones that broke when the code did and stayed silent when it didn't — everything else is wallpaper for green checkmarks.`,
    code: {
      title: "User-flow login test",
      language: "javascript",
      code: "await userEvent.type(screen.getByLabelText('Email'), 'me@x.com');\nawait userEvent.click(screen.getByRole('button', { name: 'Sign in' }));\nexpect(fn).toHaveBeenCalledWith({ email: 'me@x.com' });",
      explanation:
        "Four lines — no selectors, no instance poking, only the user story.",
    },
    diagram: {
      title: "Test pyramid",
      caption:
        "Many unit tests, fewer integration, rare E2E — the confidence cost curve.",
      mermaid: `flowchart TD\n  E[E2E] --> I[Integration]\n  I --> U[Unit]`,
    },
  },
  "web-dev-javascript-and-typescript-functional-programming-in-javascript": {
    intro: `Functional programming in JavaScript is about expressing computation as the composition of pure functions — data in, data out, no shared mutable state, no hidden side effects — because the platform is I/O heavy and state traps multiply quadratically with module count, the subject covers first-class functions, purity, immutability, currying, composition, functors, monads in disguise, pipelines, and the engineering discipline of choosing pure cores with imperative shells.`,
    foundations: `Core principles: purity (same arguments → same result, no observable effect outside return), immutability (never mutate — build new values), referential transparency (expressions replaceable with their values), totality (defined for all inputs in the type — no partial functions throwing). JavaScript supports all of it: closures give captured environments (memoization, dependency injection without classes), arrow functions are lambdas without this, rest/spread give local immutability, Array methods give collection pipelines. Currying: f(a, b) → f(a)(b) — one argument at a time — variadic specialization and hook reuse; every React hook ever written is a closure curry in disguise. Composition: pipe/compose — right-to-left vs left-to-right; point-free style (omitting argument mentions where the data describes itself). TypeScript enforces purity posture in interfaces; the language erases it at runtime — discipline is on you.`,
    concepts: [
      {
        title: "Purity and side effects — the purity boundary.",
        body: `A pure function's behavior is fully determined by its arguments — no reads of globals, no writes to anything observable, no random, no clock, no IO — because the same inputs always yield the same outputs, they memoize cleanly, parallelize trivially, and test with argument tables alone. Every program bifurcates into: pure core (decisions, transforms — test-heavy) and imperative shell (IO, timers, DOM — thin, mockable at the seam). Hidden effects sneak through logging, Object.assign on shared params, Date.now, Math.random, transitive writes through nested objects (pure signature, dirty interior) — audit every shared mutable parameter like an enemy mailbox. The discipline: pure at the leaf, as close to pure at the branch as engineering permits, shell at the application edge — exactly the shape React's effect/render split codified.`,
      },
      {
        title: "Immutability patterns — structural sharing.",
        body: `Never mutate: always construct: [...arr, x] (append), arr.filter(p) (select), {...obj, key: v} (override) — because mutation poisons memoization (Object-is comparability breaks) and defeats React's reference-equality skipping — the entire useMemo/useCallback economy lives on fresh references only when inputs change. Structural sharing: changing one leaf of a 1000-node object allocates only the path to that leaf — O(log n) extra nodes, every other subtree reused — the trick Immutable.js/immer implement; immer: mutate a draft, get the frozen original back — push/splice inside produce are safe, aliasing contained, identity-preserving. The rule write once on the wall: if a function receives an object, never assign to its properties; return a new object; consumers keep referential truth without snapshots.`,
      },
      {
        title: "Higher-order functions and array pipelines.",
        body: `Functions that take or return functions: map/filter/reduce (project/select/fold), every/some (quantifiers), find/findIndex (search), flatMap (sequences), sort (annotating). Parameter order matters for currying (data last: const fn = curriedSort; list.sort(fn)). Pipeline style: const total = pipe(orders, filter(isPaid), map(totalOf), sum); — readable at a glance, each stage a reusable predicate, no mutable accumulator; Point-free variants compress further but at the cost of debuggability — balance the two. reduce is the nuclear option — the only fold capable of everything; when in doubt, stop reaching for it: a map + sum elsewhere is clearer to the next reader. Every collection decision reduces to: project, select, fold, sort — in that order.`,
      },
      {
        title: "Currying, partial application, and hooks as FP.",
        body: `curry(f)(a)(b) splits one 2-arg call into two unary calls — specialization by stage: const isPaid = curry((o) => o.status === 'paid'); orders.filter(isPaid) — partial application fixes some arguments leaving the rest later: const isAdmin = partial(hasRole, 'admin'). Not the same as currying (single use at a time vs partial = subset at once); they interact: curry-then-partial = point-free in one line. Hooks are literal curried closures: useCallback((x) => fetch(...x), [deps]) — the dependency array is the closure's captured argument list — every hook evaluation memoizes a closure over its captured environment; 'rules of hooks' = never conditional-capture order-dependent state in a language without type-level capture proofs. Every modern React codebase is FP wearing JSX.`,
      },
      {
        title: "Functors, monads, and the honesty of types.",
        body: `Optional (maybe, Either): data not available — Option.of(x) / None vs Some — every null check chain eliminated by construction: Option.map(x => x.user?.id) composes; Result/Either: success-or-error unification with map/flatMap and no exceptions — every failure channel typed, the 'hapless undefined crash' retired as a category. JS has no native versions (fp-ts ships them); TS approximation: { ok: true, value: T } | { ok: false, error: E } — every feature branch forces handling. filter/map are functors — they preserve structure while transforming payloads; flatMap chains collapse nested wrappers — every async chain all the way up is ultimately a flatmap with error semantics — knowing this unifies Promises, Options, Results, Streams, arrays: one shape, one vocabulary, learn once.`,
      },
    ],
    worked: [
      {
        title: "Refactor imperative loop to pipeline.",
        body: `Before: let total = 0; for (const o of orders) { if (o.status === 'paid' && !o.refunded) total += o.total; } — after: const total = orders.filter(o => o.status === 'paid' && !o.refunded).map(o => o.total).reduce((s, n) => s + n, 0); — all intermediate arrays are O(n) each, allocations trivial vs. readability gain; if profiling proves the intermediate arrays hot, fuse filter+map into a reduce manually. The transformation is mechanical: predicate, project, fold — applicable at scale, a code reviewer's free pass.`,
      },
      {
        title: "Memoization as one-liner.",
        body: `const memo = fn => { const cache = new Map(); return (...args) => { const key = JSON.stringify(args); if (!cache.has(key)) cache.set(key, fn(...args)); return cache.get(key); }; }; — every expensive pure function gets O(1) repeat calls; every useMemo/uses/react pipelines memoize a closure's capture set the same way; the Map is the whole function — ten lines from which an entire caching discipline descends.`,
      },
      {
        title: "Curry a validation function and partially apply.",
        body: `const validate = curry((rule, value) => rule(value) ? null : rule.name + ' failed'); const isEmail = v => /.+@.+/.test(v); const emailOK = validate(isEmail); const err = emailOK('me@x.com'); // null — every field rule becomes a pre-bound validator, every form reducer folds them uniformly; this is how big form libraries were born (final-form, formik validation resolvers).`,
      },
      {
        title: "Convert callback-style API to Result pipeline.",
        body: `readFile(path, (err, buf) => ...) becomes const disk = { read: p => p.then(r => r).catch(e => ({ ok: false, error: e })) }; const pipeline = async () => { const a = await disk.read('./a.json'); if (!a.ok) return a; const b = await disk.read('./b.json'); if (!b.ok) return b; return { ok: true, value: combine(a.value, b.value) }; }; — errors are values; no throws anywhere; the chain reads as a single transactional dataflow — TypeScript types carry it without any extra machinery.`,
      },
    ],
    exam: [
      {
        question: "What is a referentially transparent expression?",
        answer:
          "One replaceable by its value without changing program behavior — f(2, 3) can be written 6 everywhere; functions with side effects in expressions (logging, Date.now()) violate it — referential transparency is what makes memoization and equational refactoring safe; without it 'pure' is a label, not a property.",
      },
      {
        question: "Why is Object.freeze not deep immutability?",
        answer:
          "freeze makes the top-level properties read-only but nested objects remain mutable; spread copies freeze references — deeper freezes need manual recursion or libraries (immer produce, Immutable.js); the common trap: const newObj = { ...original } — still shares nested references — every deep-freeze helper must walk the tree to leaf primitives.",
      },
      {
        question: "What distinguishes currying from partial application?",
        answer:
          "Currying rewrites f(a, b, c) as f(a)(b)(c) — unary at every step; partial application fixes any subset of arguments returning a function of the rest — both erase arities gradually, but currying is the uniform mathematical transform while partial is a convenience specialization; every JS library loosely blends them under either name.",
      },
      {
        question: "What does flatMap give you that map doesn't?",
        answer:
          "map applies f then leaves arrays of arrays; flatMap applies f and flattens one level — the engine of monadic sequencing (fetch → tokens → keys flattened into one stream) and of transducer-style pipelines in JS; it is the only collection method that encodes both transform and collapse in one pass.",
      },
    ],
    cheat: [
      "Pure = same input, same output, zero observable effect; memoizable; testable by tables.",
      "Every mutation hides in a shared reference — spread new objects, never assign through params.",
      "Structural sharing: copy only the path to the change; every other branch stays shared.",
      "map/filter/reduce/some/every/find — project, select, fold, quantifier, search.",
      "Curry = f(a)(b); partial = fix subset of args; point-free = omit arg mentions.",
      "Options/Results as values retire exceptions from domain code; fp-ts or {ok, value|error}.",
      "Purity boundary: pure core, imperative shell; effects injected at the edge only.",
    ],
    recap: `Functional programming in JS is not a shrine to category theory; it is the discipline of small, total, honest functions with effects pinned to the margin — because the language gives you everything needed to be pure and never forces it, every production codebase silently regresses to callback hell unless the author chose purity on purpose; the reward is the only codebase you've ever debugged without a repro.`,
    code: {
      title: "Pipeline in one screen",
      language: "javascript",
      code: "const total = orders.filter(isPaid).map(o => o.total).reduce((s, n) => s + n, 0);",
      explanation:
        "Project, select, fold — the entire FP vocabulary on one line.",
    },
    diagram: {
      title: "Purity boundary",
      caption:
        "Pure center decides; shell does IO — test the center, mock the boundary.",
      mermaid: `flowchart LR\n  IO[Shell: IO] --> P[Pure core]\n  P --> IO`,
    },
  },
  "web-dev-javascript-and-typescript-design-patterns-in-javascript": {
    intro: `Design patterns are named solutions to recurring forces — because JavaScript is a language where the patterns wore different hats over three decades, the subject covers constructor patterns, modules, factories, observers, decorators, singletons, commands, strategies, state machines, proxies, and the anti-patterns born from each (cargo-cult ObserverFired on every click or callback forests of 2010).`,
    foundations: `Patterns are not laws; they are compression: a single word unlocking an experienced conversation about a force and a resolution. Creational: constructor/class, factory (decide which class), prototype (clone-and-extend), singleton (one instance — disfavored outside caches). Structural: module (IIFE/ESM privacy), decorator (wrapping behavior), proxy (intercept operations), adapter/facade (interface translation), composite. Behavioral: observer (pub/sub — every listener fires per event), command (method object with undo/history), strategy (interchangeable algorithms), state machine (transitions per event, finite set), chain of responsibility, mediator. Functional equivalents: HOFs replace most Command/Strategy; iterators/generators replace Composites; promise combinators replace Observer coordination. Anti-patterns: global event bus as trash can, observer chains through five components (every click = 40 handlers), inheritance ladders instead of composition, singletons that serialize every test file, proxy-of-proxy layering.`,
    concepts: [
      {
        title: "Module, constructor, factory — the object birth trilogy.",
        body: `The module pattern: IIFE or ESM exports close over private state — the foundation of privacy before classes: const Counter = (() => { let n = 0; return { inc() { return ++n; }, get() { return n; } }; })(); — n is unreachable from outside forever; every config, every registry derives from this two decades old instinct. Constructors (class): ES6 class = prototype-linked constructor function — new Dog('rex') wires this to the fresh object; the extends chain desugars super() — always call super before this in subclass constructors or the TDZ catches you. Factory: a function returning the right implementation (dog vs cat by argument) — no inheritance, no new on the caller's side, substitution by code not by hierarchy; every DI container is a factory in a trench coat; ES6 class factories: const makeLogger = level => new Logger(level); — the entire object birth catalog is three move choices: module, factory, constructor — frequency among them says everything about your architecture's decoupling budget.`,
      },
      {
        title: "Observer done with discipline — and its failures.",
        body: `Observer: subject maintains list of subscribers; on mutation, every subscriber is called with the event; subscribers may be anonymous or named, add via on/subscribe, remove via returned unsubscribe — every React hook (useSyncExternalStore), every Node EventEmitter, every DOM event system is an observer — the pattern is the platform, not your invention. Failure modes: (1) unbounded listener accumulation (leaks) — every subscription needs a teardown path; (2) synchronous cascade storms (one event → 50 handlers → re-entrancy) — use microtask queues or command bus; (3) no unsubscribe = page-level leak until reload; (4) observer loop (handler A emits B triggering A's handler) — cycle detection and re-entrancy guards. The rule: every on() must have a paired off(), and the queue contract must match the use case — immediate for tight feedback, queued for cross-component storms.`,
      },
      {
        title: "Strategy and state machine — the control vocabulary.",
        body: `Strategy: inject the algorithm instead of switching on kind — const sorters = { quicksort, mergesort }; const sort = sorters[name]; every if-chain on type/status is a Strategy begging to be extracted; TypeScript exhausts by construction — the union type guarantees no missing case once extracted; every rules engine, pricing policy, and rendering backend is a strategy map in disguise. State machine: finite states + transitions — const machine = { idle: { start: 'loading', pause: 'paused' }, loading: { done: 'done', fail: 'error' } }; transition = machine[current][event] ?? throw — impossible states declared away at type level (data is { status: 'loading' } | { status: 'done', value }). Every multi-modal UI (media player, form wizard, websocket lifecycle) is a finite automaton whose correctness lives in the table — any presentation otherwise leaks invalid paths users will inevitably find.`,
      },
      {
        title: "Proxy, decorator, adapter — three wrappers.",
        body: `Decorator: wrap behavior, same interface — memoize, log, retry, trace — const withRetry = (fn, n) => async (...a) => { for (let i = 0; i < n; i++) { try { return await fn(...a); } catch (e) { if (i === n - 1) throw e; } } }; — every resilience layer in every service ever written is decorator-chained behavior; the composition order of decorators IS the policy (retry inside auth or outside?). Proxy (ES2015): intercept property access on any object — virtualization, lazy loading, validation, observability — new Proxy(target, { get, set }) — every reactivity system (Vue 3, MobX) was born from Proxies being fast enough to watch every read/write; validation boundaries, mock-by-name-injection, ORM lazy fields; proxy-of-proxy depth = latency and confusion; every proxy earns its cost or ships behind a dev flag. Adapter: translate one interface to another (XML-RPC legacy, gRPC ↔ REST, Date → Luxon) — wrap once, treat as native forever; the pattern exists so legacy never infects domain code.`,
      },
      {
        title: "Command and the undoable world.",
        body: `Command: encapsulate an action as an object — execute(), undo(), maybe serialize/log — the basis of every undo stack (editor history), every job queue (background transfers), every UI action replay (macros, snapshots). The pattern trades class count for uniform treatment: every user gesture becomes an entry pushed onto a stack — execute now, undo by popping, redo by re-pushing; every form auto-save cycle, every canvas, every terminal command history recycles this one move; the alternative (ad-hoc undo fields scattered through components) fails the first time you need atomic multi-field revert. Pairing with memento (snapshot full state for capture) vs inverse-operation replay (cheap) — pick per memory budget; every text editor ever built fought exactly this war.`,
      },
    ],
    worked: [
      {
        title: "Rewrite a five-if chain as strategies.",
        body: `Before: if (plan === 'free') quota = 5; else if (plan === 'pro') quota = 50; ... — after: const QUOTAS = { free: 5, pro: 50, team: 500 }; const quota = QUOTAS[plan] ?? 5; — ten lines to one table; adding a 'business' plan never touches the function; exhaustiveness becomes a Map lookup, not a ladder of strings every reviewer must re-audit forever.`,
      },
      {
        title: "Memoize with a decorator.",
        body: `const memoize = fn => { const cache = new Map(); return (...a) => { const k = JSON.stringify(a); if (!cache.has(k)) cache.set(k, fn(...a)); return cache.get(k); }; }; — one decorator, infinite applications; every selector in an app deserves it (or reselect's better selector caching); the free function version wins for ad-hoc hot paths; class-validator decorators elsewhere follow the identical shape.`,
      },
      {
        title: "Implement undo with commands.",
        body: `const undoStack = []; function do(action) { action.execute(); undoStack.push(action); } function undo() { undoStack.pop()?.undo(); } — rename operation, toggle style, insert characters: every action carries execute/undo pairs; final dispatch is a two-line stack push/pop; the entire history of your editor's Ctrl+Z is this scaffold with robust snapshot semantics inside the pair; the interview loves this exact demo.`,
      },
      {
        title: "State machine for fetch states.",
        body: `const fetcher = { idle: { run: 'loading' }, loading: { success: 'done', failure: 'error' }, done: { run: 'loading', reset: 'idle' }, error: { retry: 'loading', reset: 'idle' } }; const next = (state, event) => fetcher[state]?.[event] ?? (() => { throw new Error(state + ' cannot ' + event); })(); — impossible transitions throw instead of rendering broken UI; the enum of states is finite and readable; every 'stuck spinner forever' bug ever filed dies against this wall.`,
      },
    ],
    exam: [
      {
        question: "Which pattern guarantees single instance?",
        answer:
          "Singleton — module-level instance or a class with lazy cached static getInstance; the caveat: test isolation requires injection or reset APIs; every mono-style cache object (config, DB pool) is a singleton whether you named it or not — the naming only admits the decision.",
      },
      {
        question:
          "What does the Observer pattern enable and what is its main hazard?",
        answer:
          "One-to-many notification without compile-time coupling — subjects never know their subscribers; the hazard is unbounded subscription lifetimes (listeners accumulating, leaks, cascade storms) — mitigated always by paired unsubscribe contracts and queued delivery for cross-component storms.",
      },
      {
        question: "How does State differ from Strategy?",
        answer:
          "Both substitute behavior, but State transitions per event into the next state (form wizard, loading cycle — the transition table IS the policy), while Strategy is chosen once by the caller and stays fixed (sort algorithm by input size, pricing policy by plan) — the exam's favorite one-liner this decade.",
      },
      {
        question: "What problem does the Adapter pattern solve?",
        answer:
          "It translates an incompatible interface into one you expect — XML-RPC legacy, REST-to-gRPC bridges, Date to Luxon — so domain code never sees the foreign shape; adapters concentrate the conversion rules at one seam and ship in both unit tests and prod without ceremony; the design principle: translate at boundaries or drown in leaky abstractions.",
      },
    ],
    cheat: [
      "Creational trilogy: module (private IIFE/ESM), factory (by arg), constructor (class).",
      "Observer = on/off contract; every subscription must pair with teardown.",
      "State = transition table {state: {event: next}}; impossible transitions throw.",
      "Strategy = object map replacing if-ladders; open for new entries, closed to edits.",
      "Decorator = wrap behavior, same interface (memoize/retry/log/trace); order = policy.",
      "Proxy = intercept get/set/apply — validation, lazy load, observability, reactivity.",
      "Anti-patterns: god bean, singleton test jail, observer volcano, interface salad.",
    ],
    recap: `Patterns are a lexicon for forces you've already learned: every module is a closure, every strategy is a vtable, every observer chain is a pub/sub hub, every state machine is a truth table with memory — because the pattern NAMES the shape, the conversation happens at the shape level; un-named solutions congeal into codebases where nobody can agree on what happens when the user clicks.`,
    code: {
      title: "Strategy map in TS",
      language: "typescript",
      code: "const strategies = { byName: (a, b) => a.name.localeCompare(b.name), byTotal: (a, b) => b.total - a.total };\nrows.sort(strategies[choice]);",
      explanation:
        "A key, a function, a closed switch permanently outsourced to a table.",
    },
    diagram: {
      title: "Strategy substitution",
      caption:
        "Same interface, interchangeable algorithm — selected at the call site.",
      mermaid: `flowchart LR\n  C[Caller] --> I[Strategy interface]\n  I --> A[Algorithm A]\n  I --> B[Algorithm B]`,
    },
  },
  "web-dev-javascript-and-typescript-javascript-memory-and-garbage-collection":
    {
      intro: `JavaScript memory management is the unglamorous contract under every interface: objects live on a heap reclaimed by a generational mark-and-sweep collector, the main thread budget measures frames, and the only leaks left are the ones you hold open with forgetful references — the subject covers reachability, seven stubborn leak classes, weak collections, DevTools heap discipline, and the performance law that leaks read as GC pauses.`,
      foundations: `The heap: generational — young generation (new objects, scavenge-copied survivors) and old generation (long-lived, mark-sweep-compact); objects promote after surviving a scavenge; large objects go to their own space; infividual strings/numbers inline. Reachability roots: globals, current stack (roots for closures in flight), DOM nodes still referenced; anything not reachable dies at the next collection. Weak collections: WeakMap/WeakSet — keys held weakly, invisible to GC liveness; entries vanish when the key is otherwise unreachable; non-iterable by design. Leak classes: (1) detached DOM nodes held by JS (the classic), (2) accidental closure capture of giant objects, (3) unbounded caches (caches never evicted), (4) event listeners never removed (node removed, listener closure keeps whole object graph alive), (5) setInterval chains (closures pinned every tick), (6) this-context promiscuity (every detached method keeps the instance alive), (7) forgotten timeouts pending forever. DevTools: Memory panel — heap snapshot comparison (shallow/retained size), allocation timeline, GC profile; every leak hunt uses either a snapshot diff or a retainer path. Performance law: leak-driven GC pauses read as micro-stutters — 2-4 of them per minute on a bad dashboard are the signature.`,
      concepts: [
        {
          title: "Generational GC and the cost model.",
          body: `V8 scavenges young objects with a cheap semi-space copy in ~1 ms; objects surviving two scavenges promote; old generation scanned less frequently by mark-sweep-compact (expensive, seconds-scale); big objects skip promotion entirely. You cannot force a full GC (intentionally — every stop-the-world would be wielded against users); you can only shorten survival: allocate less, drop early. When GC pauses exceed frame budget (16 ms) you get long tasks; when they stack you get jank. The rule: your allocations come from your code — every temporary from map/filter inside render loops, every closure created per mousemove tick, every cached regex recompiled — reduce, reuse, hoist, or let it die young.`,
        },
        {
          title: "Detached DOM and retainer paths.",
          body: `const root = node.parentNode; root.removeChild(node); — the DOM tree is gone but root still references it — every listener, every bound object inside, every child subtree lives until root itself dies. The leak is not in the DOM (detached cleanly); it is in your closure holding the root. DevTools flow: Heap snapshot → filter 'Detached' → pick largest retained → 'Retainers' panel → walk up to YOUR function → unwind the chain (external class, options object, timeout closure). Node-specific: saved nodes in registries, WeakMap keys misuse, detached-then-re-added nodes surviving as zombies in virtual trees — every leaked DOM element the inspector ever surprised you with was retained by JS, not by the DOM.`,
        },
        {
          title: "Caches that never expire — the eternal leak.",
          body: `const cache = new Map(); function load(k) { if (!cache.has(k)) cache.set(k, expensive(k)); return cache.get(k); } — every key ever loaded lives forever; production happily serves terabytes until OOM. Fix taxonomy: (1) bounded LRU (max size, evict oldest — 50-200 entries per hot map); (2) TTL expiry (timestamp + periodic sweep); (3) WeakMap keyed on target objects (auto-vanish when target dies); (4) periodic full flush (clear on route change); (5) flattened strings as keys with bounded prefix (bounded keyspace). Every in-memory cache must answer two questions on review: what is the eviction policy, and who decides its size — silence to both is the bug.`,
        },
        {
          title: "Timers, intervals, and stuck callbacks.",
          body: `setInterval(poll, 10000) — every tick pushes a new closure; if poll captures page state, those states accumulate without limit; clearInterval in teardown — and when the tab is hidden, intervals get throttled to 1 Hz, but they continue — explicit lifecycle or they pile up forever. setTimeout chains (recursive setTimeout(delay)) same story with a different shape — every recursive poll must carry its own kill switch; every pending timeout at unload either fires into the void or pins the page's memory if the closure references heavy state; clearTimeout everything you can reach in beforeunload/unmount. The Node sibling: unresolved intervals accumulate handles → process never exits → memory rises with uptime — every leak list ever closed ranks timers in the top three.`,
        },
        {
          title: "Closures and the accidental capture.",
          body: `const make = () => { const huge = new Array(1e6).fill('x'); return () => huge.length; } — the returned closure keeps 'huge' alive as long as it is alive; the reference relationship is invisible, unavoidable by static lint, and fatal on a hot path. Every event listener referencing a containing object pins it; every subscribe without unsubscribe pins the whole component; every promise chain that captures a component's scope pins it past unmount. The remedy is not fear but explicit lifecycles (useEffect cleanup, AbortController), lint rules for complexity, and occasional snapshot diffs to catch slow drift — memory regressions tracked in CI as a metric, not as a rumor.`,
        },
      ],
      worked: [
        {
          title: "Snapshot diff finds a 24 MB ghost.",
          body: `Baseline snapshot 9 MB → repeat a drill → snapshot 33 MB; filter by 'Detached' — 24 MB retained by one object: a modal that never got cleared; retainer path showed a global event registry listener registered at mount holding a closure over the modal's full subtree — removing on unmount: registry.off('dismiss', handler) — snapshot repeat: no growth. Every leak in this shape ends in one retainer path once you know to look.`,
        },
        {
          title: "Cap the cache with LRUMap in 15 lines.",
          body: `class LRU { constructor(cap) { this.max = cap; this.map = new Map(); } get(k) { if (!this.map.has(k)) return; const v = this.map.get(k); this.map.delete(k); this.map.set(k, v); return v; } set(k, v) { if (this.map.has(k)) this.map.delete(k); else if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value); this.map.set(k, v); } } — get refreshes recency; set evicts the eldest when full; every cache boundary in your app becomes eviction-correct by construction; three functions, forever.`,
        },
        {
          title: "Hook up listeners with cleanup.",
          body: `useEffect(() => { const handler = e => process(e); target.addEventListener('x', handler); return () => target.removeEventListener('x', handler); }, []); — the return closure removes it; every subscription lifecycle is explicit from the moment it's created; every test asserting 'listeners called once after mount' passes; the GC never needs to scrub past the unmount boundary because nothing crosses it.`,
        },
        {
          title: "Kill the interval poll on route change.",
          body: `useEffect(() => { const id = setInterval(poll, 5000); return () => clearInterval(id); }, [route]); — route change re-arms; the old interval dies with its effect; every poll-consuming component self-cleans; leaks from this exact bug class went extinct years ago wherever effects cleanup is honored; older codebases search-replace their setInterval calls.`,
        },
      ],
      exam: [
        {
          question: "What are the three main leak classes that DevTools finds?",
          answer:
            "Detached DOM retained by JS (parent pointers surviving removal), forgotten subscriptions/listeners (mount without unsubscribe), and unbounded caches (no eviction ever); the retainer panel plus a two-snapshot diff covers all three — the exam asks the taxonomy, not the grep regex.",
        },
        {
          question: "Why can't you force garbage collection from code?",
          answer:
            "Deliberately not exposed — stop-the-world control would be weaponized by every web page against its users; GC is a contract where timing belongs to the engine, only reachability is yours to manage; 'forcing GC' browser flags exist purely for debugging invasive profiling.",
        },
        {
          question: "What does WeakMap buy you over Map?",
          answer:
            "Keys held weakly: entries disappear automatically once keys are otherwise unreachable, so a WeakMap used as a private-data registry never leaks objects and never needs cleanup — Map holds both keys and values forever; WeakMaps can't be enumerated (that's the price and the point).",
        },
        {
          question: "How do long-lived closures pin memory?",
          answer:
            "Every closure closes over its entire captured environment — variables it names survive as long as the closure is reachable; a listener, timeout, or promise chain referencing a component instance pins that instance and everything it transitively references, long after the user navigated away.",
        },
      ],
      cheat: [
        "Reachability: roots = globals + stack + DOM-in-code; GC reclaims the unreachable.",
        "Detached DOM: filter 'Detached' in Heap snapshot → walk retainers → unwind the chain.",
        "Bounded caches everywhere: LRU/TTL/capacity — answer eviction policy or it's a leak.",
        "Every on/addEventListener/setInterval must pair with off/remove/clear on teardown.",
        "WeakMap/WeakSet: weak keys, vanish with keys, not enumerable — registries of identity.",
        "Young gen fast; old gen mark-sweep-compact; allocate less, die young, promote rare.",
        "every effect needs a cleanup section; listeners pin entire components otherwise.",
      ],
      recap: `Memory management in JS is a reachability audit performed by you, forever: because the engine cannot promise to reclaim what you still reference, every leak ever filed is (1) a root you didn't notice and (2) a retainer path you refused to trace — because every detachment begins with removing the element and ends with the unsubscribe you wrote on purpose.`,
      code: {
        title: "Heap snapshot diff ritual",
        language: "text",
        code: "snapshot baseline -> drill -> snapshot -> filter 'Detached' -> Retainers -> fix -> re-snapshot",
        explanation:
          "Six steps that end every intermittent OOM postmortem ever written.",
      },
      diagram: {
        title: "Retainer chain",
        caption:
          "Every memory leak is a chain of references back to a root you hold.",
        mermaid: `flowchart LR\n  R[Root: window/global] --> C[Closure]\n  C --> O[Object graph]\n  O --> H[Detached DOM node]`,
      },
    },
};
