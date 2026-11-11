import type { TopicLesson } from "../topicLessons.js";

/**
 * React Ecosystem — 8 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, deep concept
 * sections, real code, exam practice, cheat sheet, trailing revision
 * schedule only. No shared templates.
 */
export const reactEcosystem: Record<string, TopicLesson> = {
  "web-dev-react-ecosystem-react-fundamentals": {
    intro: `React is the UI library that ships the answer to one question over and over: given state that changed, what exactly should the DOM become now — and how little work does that take? The subject covers the mental model (UI = f(state)), the component contract, JSX as function calls, props vs state, hooks mechanics, effects and cleanup, rendering and reconciliation, and the mistakes every codebase makes before it learns the rules of hooks.`,
    foundations: `React model: UI = f(state) — a render is a pure function from props and state to a virtual tree; React diffs successive trees (reconciliation) and commits the minimal set of DOM mutations; keys identify identity across renders. Components are functions (or once, classes) receiving props; state is component-local via useState; lifting state shares it; context propagates it without prop drilling. Hooks rules: (1) call only at the top level (never in conditions/loops/after early returns), (2) call only from React functions (components or custom hooks) — the linter enforces both because hook state lives in a per-fiber linked list indexed by call order — reordering calls reorders state slots. Effect = synchronization with the external world; cleanup runs before re-run and on unmount; dependencies are the trigger — every observed closed-over value belongs in the array (exhaustive-deps lint). StrictMode double-invokes in dev to expose impure renders.`,
    concepts: [
      {
        title: "The render contract: pure function, committed DOM.",
        body: `A render must be pure — no network, no timers, no mutation of outer variables — because React may call it at will (StrictMode doubles it in dev, concurrent mode replays it, Suspense suspends and resumes it) and any side effect inside fires per call. Event handlers (onClick, onSubmit) are where mutations belong — React fires them at browser time, and every state update schedules exactly one more render; renders are batched (React 18 flushes updates in microtasks), so a handler with three setStates costs one render, not three. Components without JSX targets return null; every root needs createRoot and a container; hydration reuses server-rendered markup by matching tree shape — mismatches warn and client-render instead. Keys on list children give identity: missing/duplicate keys cause wrong component instances to persist and internal state to leak across rows.`,
      },
      {
        title: "Hooks in practice: useState, useCallback, useMemo, useRef.",
        body: `useState returns [value, setter] — the setter accepts a value or updater (prev => next) — always prefer the updater form when the new state derives from the old (queue correctness under batching). useCallback memoizes a function identity (stable reference for memoized children / dependency arrays); useMemo memoizes a computed value — both exist to defeat referential instability and to skip expensive derived work; neither is free (compare+store) — profile before sprinkling; every useCallback on every inline function is premature optimization by someone who read an article once. useRef holds a mutable slot never triggering renders — DOM refs, previous values, interval ids, any value that must survive renders without scheduling them. Refs are the pocket knife: react outlaws it, react never leaks it, always give the lint a reason.`,
      },
      {
        title: "Effects: synchronization, deps, cleanup.",
        body: `useEffect(() => { subscribe(...); return () => unsubscribe(); }, [dep]) — the effect re-runs when any dep changes (Object-is comparison), cleanup runs before each re-run and on unmount — ordering: cleanup old → effect new. Empty deps = mount/unmount only; missing deps = stale closure serving week-old state while your lint stays silent (exhaustive-deps exists because every production dashboard with 'it worked Tuesday' was this). Not every 'do X once' is an effect: event-ish work belongs in handlers; derived values belong in render; effects exist to sync React state with systems that live outside React (subscriptions, timers, network, manual DOM). Infinite loops: setState inside effect with no dep, or dep always-fresh identity — linter + discipline end it.`,
      },
      {
        title: "State management: local, lifted, context, server cache.",
        body: `Local state for the leaf's own transient needs (inputs, toggles, hover); lifted to the nearest common ancestor when siblings must agree (two tabs, filter+list); context for dependency-style values (theme, locale, session, feature flags) — one provider per concern, narrow scope to avoid re-render storms (every consumer re-renders on any value change — memoize the value); server cache (TanStack Query/SWR) for anything remote — dedup, stale-while-revalidate, retries, invalidation — the engine that makes 'fetch in effect' obsolete; external stores (Redux/Zustand) for cross-page client state that outlives the tree — carts, wizard drafts; every state-tool decision reduces to: what is the source of truth, who owns it, how many consumers exist — answer those and the library escolhe itself.`,
      },
      {
        title: "Reconciliation and why keys and refs matter.",
        body: `React walks the new tree vs old tree in parallel: different element type at a position → unmount old, mount new (everything inside resets); same type → keep instance, update props; list items matched by key — same key keeps the instance regardless of position (reorder by changing keys or React destroys/recreates — owning DOM state like input focus dies with the instance). Fiber architecture: renders are interruptible units of work — concurrent rendering can pause mid-tree; input events can preempt a render; Suspense boundary resolution resumes the paused branch — the machinery the whole concurrency story rests on. Every 'input loses focus after reorder' bug in list rendering is a missing/unstable key; every 'component state leaks into the wrong row' is keys reused across types.`,
      },
    ],
    worked: [
      {
        title: "Predict the renders when an event fires twice.",
        body: `Button onClick fires twice per pointer event on some browsers (React 18 dedupes pointer events internally; on double events still fire per your handler count). Code: const [n, setN] = useState(0); <button onClick={() => { setN(n + 1); setN(n + 1); }}> — renders n=1, not n=2 — stale n captured twice from the same render snapshot; fix: setN(prev => prev + 1) twice → n=2. The batching lesson: two updaters within one batch both receive the latest prev — async-ish accumulation without waiting for anything.`,
      },
      {
        title: "Fix the stale feed with the dep array.",
        body: `useEffect(() => { fetch('/api/feed?id=' + id).then(setFeed); }, []); — component mounts once with the first id; parent navigates to /feed/2 — the effect never re-runs; feed still shows feed/1 — silent product bug on half your dashboard. Fix: [id] — effect re-runs per id; add cancellation or the previous fetch can commit after the new one (race) — use AbortController in cleanup or a stale-guard boolean: closed-over flag flips false on cleanup; setFeed checks it. Every production 'wrong data after navigation' report traces to this pattern missing one of the two details.`,
      },
      {
        title: "Lift state between sibling forms.",
        body: `Two siblings <Filter /> and <Results /> need the same query string — neither is parent of the other; the common parent holds const [q, setQ] = useState(''); passes q down and setQ down; every source of truth sits above every reader; when props chain more than 2-3 levels, context or a store replaces the drilling — never earlier. The boundary: colocate state to the nearest ancestor that needs it — farther means more re-renders, tighter means simpler.`,
      },
      {
        title: "Memo a component to stop render storms.",
        body: `const Row = React.memo(({ item, onSelect }) => { ... }); — props compared shallowly; parent re-render recreates items but stable onSelect (useCallback) keeps rows from re-rendering; the entire list performance story — unstable prop lambdas (onClick={() => onSelect(id)}) defeat memo at the door; name stable handlers and memoized children together or neither pays off. Measure before memoizing: React DevTools profiler ranked by render duration tells you exactly which rows re-rendered and why.`,
      },
    ],
    exam: [
      {
        question: "Why do hooks have ordering rules?",
        answer:
          "React tracks hooks as a per-fiber linked list indexed by call position, not by name — the runtime has no other way to associate state slots with specific calls; calling hooks conditionally shifts every subsequent slot and corrupts all state below — hence the top-only rule enforced by lint.",
      },
      {
        question: "What does useEffect cleanup run before?",
        answer:
          "Before the next effect invocation and on unmount — never synchronously with the effect that created it, never during render; the order is always old-cleanup → new-effect, so subscriptions swap atomically between dependent values.",
      },
      {
        question:
          "What is the correct fix for missing keys in a list of inputs?",
        answer:
          "Give each row a stable unique key derived from the item's identity (item.id), not the index — index keys work only for static lists and break instances under reordering/filtering — React destroys and recreates the DOM node instead of moving it, resetting input focus and internal state.",
      },
      {
        question: "When does useMemo actually pay off?",
        answer:
          "When the computation is expensive (large derivations, filter/sort of big arrays, deep serialization) AND the component re-renders frequently with unchanged inputs — otherwise useMemo's comparison tax costs more than the saved work; profile with DevTools, then memoize by evidence.",
      },
    ],
    cheat: [
      "UI = f(state); renders pure; events in handlers; batching flushes one render per event.",
      "Hooks: top level only, React functions only — order IS the identity.",
      "useState updater form (prev => next) for counters/chained updates.",
      "Effects = sync with outside world; cleanup pairs with subscribe; deps are the trigger.",
      "State location: local → lifted → context (dependency) → store (cross-page) → server cache.",
      "Keys identify identity — missing/index keys = wrong instance, leaked state.",
      "memo/useCallback pay off only with stable props + measured hot lists.",
    ],
    recap: `React is the trade of manual DOM for declarative functions — because the entire model holds only while renders stay pure and state stays owned by someone specific, every bug React produces is a contract broken somewhere upstream; respect the render contract and the reconciliation does the impossible for free.`,
    code: {
      title: "One state, one render, batched",
      language: "javascript",
      code: "setA(x + 1); setB(y + 1); // one render with both updates — React batches in events",
      explanation:
        "Two setters, one flush — the reason React event handlers feel synchronous.",
    },
    diagram: {
      title: "UI = f(state) loop",
      caption:
        "State change → render → reconcile → commit — the circle every React app orbits.",
      mermaid: `flowchart LR\n  S[State] --> R[Render]\n  R --> C[Reconcile]\n  C --> D[Commit DOM]\n  D --> S`,
    },
  },
  "web-dev-react-ecosystem-react-architecture": {
    intro: `React architecture is the discipline of where things live — components, state, data access, routes, design system boundaries — because codebases fail at the seams long before they fail at the syntax, the subject covers folder structures, feature colocation, container/presentational splits, custom hooks as logic extraction, dependency direction, and the API boundaries (server actions, RPC, BFF) that let React scale past its first three developers.`,
    foundations: `Architectural axes: (1) file organization — by type (components/, hooks/, utils/) vs by feature (features/checkout/cart, features/checkout/components) — feature-first wins past ~30 files; (2) dependency direction — UI imports logic only via hooks/selectors/services, never directly; feature modules never import sibling feature internals, only their public API (index.ts re-exports); (3) boundaries — presentational (dumb) components pure of data and effects; container hooks own fetch/timer/store; (4) state ownership — colocation first, lift second, store third; (5) server/client split (Next.js App Router): server components for data + HTML shell, client components for interactivity leaves; (6) testing architecture = component seams = every component prop/component boundary is a contract. Every boundary is a promise the next developer relies on — the architecture is a contract with the future, not a file-tree cosplay.`,
    concepts: [
      {
        title: "Feature-first folders: the architecture that survives.",
        body: `Type-based layout: components/Button.tsx, components/Modal.tsx, hooks/useAuth.ts — after 200 files you can't tell which Button variants belong to checkout or onboarding; every move becomes a risky shared-file edit. Feature-first: features/checkout/{components, hooks, api, fixtures, tests}, features/checkout/index.ts is the public door — everything internal is private by structure; importing from checkout internals from settings is a tier violation the linter can flag (eslint boundaries plugin); delete-unused becomes trivial when you grep one directory; every SaaS at scale has converged here — module federation and micro-frontends are this at the repo level.`,
      },
      {
        title: "Custom hooks: extracting behavior, not views.",
        body: `Any logic with useState/useEffect/effects+subscriptions belongs in a hook the moment it shows up twice — useCart(), useDebounce, useLocalStorage, useMediaQuery — hooks compose (a hook calls hooks), hooks share logic without JSX overhead, hooks test in isolation with renderHook (Testing Library). Hooks are the inheritance replacement in React — prefer hooks to HOCs and render props for logic sharing; the escape rule: if a hook takes JSX, it wants to be a component; if it returns only data/derived values/effects, it's the right tool. Naming: always useX; one responsibility each; document deps; cap hook depth (hooks-of-hooks beyond 2 levels rots into black magic).`,
      },
      {
        title: "Feature public APIs and dependency rules.",
        body: `Each feature: index.ts exposing exactly its public surface (exports: components used by others, types, hooks; NOTHING internal); internal files never imported cross-feature; shared primitives (design system, lib/) imported everywhere (leaf); app/ as composition root — the only place features meet; the dependency graph is a DAG — no cycles (circular imports = runtime TDZ landmines + bundle duplication); enforce with unimported/cycles plugins. The shape mirrors package managers — features are packages with an API; releases are PRs against the public index; refactors inside a feature never ripple outside; the repo stops feeling like one 40,000-line file.`,
      },
      {
        title: "Server/client split and data access boundaries.",
        body: `RSC makes components server-only by default — data fetch in body, zero client JS shipped for static branches, streaming + Suspense boundaries per subtree; client components ('use client') hold interactivity: inputs, effects, browser APIs; the composition: server shell → client islands. Data access: services/ or api/ layer per feature — functions like getUser(), listOrders() — server routes call services, client hooks call services through fetch wrappers or server actions; the client never assembles SQL or knows table names; every query key lives in one place (TanStack Query keys factory); every endpoint URL string lives in one constants file; every component receives typed data, never fetch responses raw — the layering is the architecture.`,
      },
      {
        title: "Testing architecture and the seam contract.",
        body: `Every boundary in the architecture is a test seam: components test render+events (RTL) without hitting network (MSW); hooks test state machines without mounting (renderHook); services test with mocked fetch layer or real testcontainers for DB; server actions test as plain functions; pages compose seams with e2e (Playwright) — the shape mirrors the layers, coverage follows the risk: presentation deterministic (unit), orchestration mocked (integration), the top smoke test fires (e2e). Architecture with no seams costs double the tests for the same confidence — the file tree IS the test plan.`,
      },
    ],
    worked: [
      {
        title: "Refactor the 'mega components'/ directory into features.",
        body: `Before: 140 files flat in src/components + src/hooks — imports everywhere. After: src/features/{checkout,catalog,account}/{components,hooks,api}, src/ui/ design system (Button, Input, Modal — imported everywhere), src/app/ routes — src/app/routes/checkout.tsx imports { CheckoutPage } from 'features/checkout'; — zero imports cross feature boundaries; deleting the account feature is rm -rf and one commit; onboarding times drop by half for every new hire; every refactor of any feature's internals ends at the same door (its index.ts).`,
      },
      {
        title: "Extract a useDebouncedSearch hook from a page.",
        body: `Before: page has useState + useEffect with setTimeout inline. After: function useDebouncedSearch(fetcher, delay = 250) { const [q, setQ] = useState(''); const [data, setData] = useState(null); useEffect(() => { const id = setTimeout(() => fetcher(q).then(setData), delay); return () => clearTimeout(id); }, [q, delay, fetcher]); return { q, setQ, data }; } — the page calls const { q, setQ, data } = useDebouncedSearch(searchProducts); — effect retired into a tested, reused unit; every page that searches ships one line.`,
      },
      {
        title: "Feature public API: write the index.ts door.",
        body: `features/checkout/index.ts: export { CheckoutPage } from './CheckoutPage'; export { useCheckout } from './hooks/useCheckout'; export type { Order } from './types'; — everything else private; app/routes/checkout.tsx imports only those three names; an import of '.../checkout/internal/Totals' anywhere else breaks the eslint import-boundary rule in CI — the architecture is a CI gate, not a wiki page.`,
      },
      {
        title: "Server action for form submit, client component for the field.",
        body: `'use server' async function subscribe(formData: FormData) { const email = String(formData.get('email')); await save(email); return { ok: true }; } — client: const [state, action] = useFormState(subscribe, { ok: false }); <form action={action}><input name='email'/>... — zero fetch boilerplate, server-side authority, progressive enhancement; the island-and-shell composition at its cleanest; every form in the App Router converges here or to route handlers with explicit JSON when JS must own the flow.`,
      },
    ],
    exam: [
      {
        question:
          "What does feature-first layout give you that type-first doesn't?",
        answer:
          "Locality — every piece of a feature lives together (components, hooks, api, tests, fixtures), cross-feature imports become impossible by structure, deletion/refactor of a feature is one directory, and the dependency graph stays a DAG instead of a mesh; type-first folders maximize proximity of similar-shaped files and minimize locality of meaning.",
      },
      {
        question: "What is the public API boundary of a feature?",
        answer:
          "Its index.ts (or package.json exports) — the exact set of names other features may import; everything internal is private by directory traversal rules and enforced by import-boundary lint; every feature becomes a package whose internals are free to change; every other feature's code survives.",
      },
      {
        question: "Why does React favor composition over inheritance?",
        answer:
          "UI shapes compose better as functions and elements than as class hierarchies — children/slot props and components-as-values give every layout flexibility without the Diamond's fragile-base permissions; inheritance chains fossilize one hierarchy's assumptions into every subclass — composition keeps every consumer free to recombine.",
      },
      {
        question: "What belongs behind the API layer vs inside components?",
        answer:
          "Everything that touches the network, storage, or serialization — endpoints, payload shapes, retries, auth headers, error normalization — components consume typed data and events, never URLs or fetch plumbing; when the backend changes shape, you change one layer, not forty components.",
      },
    ],
    cheat: [
      "Feature folders with index.ts public doors; ui/ for design system; app/ composes.",
      "Dependencies point inward → outward: features never import siblings' internals.",
      "Custom hooks extract behavior (state + effects); components extract view.",
      "Data access: one services/api layer per feature; components receive typed data.",
      "RSC: server shell for data + HTML, 'use client' islands for interaction.",
      "Public API = the export surface; everything else is private; enforce with lint.",
      "Tests map to layers: unit (component), integration (seams), e2e (top).",
    ],
    recap: `React architecture is dependency management wearing a file tree: because every import is a promise, the feature door is where the promise is enforced — codebases either converge on explicit public surfaces with inward-pointing dependencies, or they rot into mutually recursive fog where every edit is a treasure hunt; the repo's shape is the team's mental model of the product.`,
    code: {
      title: "Feature door",
      language: "typescript",
      code: "// features/checkout/index.ts\nexport { CheckoutPage } from './CheckoutPage';\nexport { useCheckout } from './useCheckout';\nexport type { Order } from './types';",
      explanation:
        "Three lines that make every other feature's internals unreachable.",
    },
    diagram: {
      title: "Feature dependency DAG",
      caption:
        "Features import ui and lib, never each other's guts — app/ composes them.",
      mermaid: `flowchart LR\n  A[Features] --> U[UI system]\n  A --> L[Lib]\n  App[App routes] --> A`,
    },
  },
  "web-dev-react-ecosystem-react-forms-and-validation-libraries": {
    intro: `Forms are where the product touches its users most intimately: every typo, every resubmit, every abandoned checkout is a decision about error messaging, validation timing, and state ownership — because React makes form state trivially local but just as trivially sprawled, the subject covers React Hook Form, Formik, uncontrolled vs controlled inputs, schema-driven validation with Zod, accessible error wiring, async validation, and the failure modes of every form nobody finished.`,
    foundations: `Two worldviews: uncontrolled (input.value read at submit, no state per keystroke — fastest, minimal rerenders) vs controlled (every keystroke flows through state — simpler to reason about, re-renders all); React Hook Form (RHF) wires the two: register fields into a ref/observer system, derive values on-demand at submit or per-field subscription — practically controlled semantics with uncontrolled render cost; Formik stores the whole form in context state — simpler small forms, heavier at scale; React 18 + actions: useFormState/useFormStatus in App Router. Validation layers: scalar rules (required/min/max/pattern via HTML validation and native hints) vs schema validation (Zod/Yup — arbitrary cross-field logic, coercion, transforms; the resolver pattern plugs Zod into RHF via @hookform/resolvers); client-side is courtesy, server-side is authority — always validate twice. UX: validate on blur and on submit (never violently per keystroke — except password strength meters); aria-invalid + aria-describedby + role='alert' wiring; error summary at top with jump links for screen readers; disabled vs read-only semantics — disabled controls submit nothing; optimistic submit with spinner; preserve input on failure — always.`,
    concepts: [
      {
        title: "Uncontrolled vs controlled — and how RHF has both.",
        body: `Controlled: <input value={v} onChange={e => setV(e.target.value)}> — state per keystroke; predictable, but every letter re-renders the form; large forms with nested arrays become sluggish (Formik territory). Uncontrolled: <input ref={ref} defaultValue='...'> — the DOM owns value; you read at submit — cheap, native-feel, but derived logic (cross-field live rules, conditional visibility based on inputs) gets hard to orchestrate — every lesson the DOM teaches React with a vengeance. React Hook Form: register('email') returns ref/onChange/onBlur; the library subscribes per-field, re-renders only those components; watch() subscribes to one field; formState tracks errors/submitting; the same API reads like controlled (watch, setValue) and performs like uncontrolled (per-field subscription) — the best of both worlds because someone built the bridge exactly once.`,
      },
      {
        title: "Zod schemas: one source of truth for both ends.",
        body: `const schema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(12, 'At least 12 chars'), confirm: z.string() }).refine(d => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] }); — every form rule one line, coerced and validated (.coerce.number()), transformed (trim, toLowerCase); the same schema feeds @hookform/resolvers/zod for the client and safeParse in the server action — one truth both ends; mismatches become impossible as a class. Every password strength rule, every date-range comparison, every 'must be unique' async check lives here or in the server — never in ad-hoc JS scattered through handlers.`,
      },
      {
        title: "Error wiring: aria-invalid, describedby, role=alert.",
        body: `Every failing field: element gets aria-invalid='true'; error text rendered with id='email-error'; aria-describedby='email-error' — the screen reader announces the error on focus; invalid components that only style red fail the audit; every input group needs a persistent label (never placeholder-only — placeholders vanish); required sign: asterisk + legend in fieldset; for multiple errors: role='alert' container at top listing problems with anchor links to fields ('#email'); moving focus to the first invalid on failed submit; keeping the user's input intact on server rejection — the cardinal rule of forms nobody stated but everybody ships until it costs them signups.`,
      },
      {
        title: "Async validation and server-authoritative checks.",
        body: `Username availability: debounce 300-500 ms; fire GET /check-username; each response tagged with a sequence id — ignore stale arrivals (never let the 'taken' answer from 5 seconds ago overwrite the fresh one); spinner near field, green check on available, error with suggestions on taken; server re-validates at submit with final authority — client check is advisory. Password strength meters (zxcvbn) run on change with their own cadence; file uploads: validate size/type client-side, magic-bytes server-side; unique constraints in DB → 409 Conflict → map back to the field with 'already taken' — the full loop never vanishes into a generic toast; every serious form treats server errors as first-class form state.`,
      },
      {
        title: "Multi-step forms and draft persistence.",
        body: `Long wizards: state per step own its validation (you can't proceed past step 2 with invalid step 2); progress sticky header; back preserves values; localStorage draft after step with debounced autosave ('Saved 2 minutes ago'); abandoned cart recovery — the return flag and TTL expiry; every 40-field visa application is a step wizard with aggressive persistence and humane labels; inline review at the end — edit any step without leaving the summary; submission as the single atomic action — all-or-nothing, clear the draft on success, restore on revisit; the difference between a form that loses work and the one that isn't abandoned at minute 9 is this exact design discipline.`,
      },
    ],
    worked: [
      {
        title: "Wire RHF + Zod in 15 lines, ship signup.",
        body: `const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), mode: 'onBlur' }); const onSubmit = data => save(data).catch(setServerError); <form onSubmit={handleSubmit(onSubmit)}> <input {...register('email')} aria-invalid={!!errors.email} /> {errors.email && <p id='email-error' role='alert'>{errors.email.message}</p>} <button disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Create account'}</button> </form> — mode:'onBlur' gives gentle validation; server errors set state and render as field-adjacent alerts; the double-submit death never happens because disabled gates the button; total code reading the same at 4 PM and 4 AM.`,
      },
      {
        title: "Async username check with race protection.",
        body: `const seq = useRef(0); const handle = e => { const my = ++seq.current; setChecking(true); setStatus(null); fetch('/api/check?u=' + encodeURIComponent(e.target.value)).then(r => r.json()).then(({ available }) => { if (my === seq.current) { setChecking(false); setStatus(available ? 'ok' : 'taken'); } }); }; — every response older than the latest is discarded — no backwards flip; debounced input or hold-to-type; the entire pattern in ten lines and the end of 'takes-then-disappears' bugs.`,
      },
      {
        title: "Error summary for screen readers.",
        body: `On failed submit: setSummary([{ field: 'email', msg: 'Invalid email' }]); focus management: summaryRef.current?.focus(); {summary && <div role='alert' tabIndex={-1}>{summary.length} errors… <a href='#email'>email</a></div>} — NVDA/VoiceOver announces immediately; sighted users see a list; nobody scans the whole form hunting — the single highest-impact a11y move for forms, and the least-shipped.`,
      },
      {
        title: "Draft autosave with TTL.",
        body: `useEffect(() => { const id = setTimeout(() => localStorage.setItem('draft-' + step, JSON.stringify(values)), 500); return () => clearTimeout(id); }, [values, step]); on mount: const saved = localStorage.getItem('draft-' + step); if (saved) { setValues(JSON.parse(saved)); setNotice('Draft restored'); } — reset clears the key; every long application form you ship with persistence stops losing work to a misclick; users forgive hesitation, never loss.`,
      },
    ],
    exam: [
      {
        question: "What does RHF give you over naked controlled inputs?",
        answer:
          "Per-field subscription and uncontrolled performance — inputs stay DOM-owned (zero re-render per keystroke), validation reads at field events, and you keep controlled semantics for watch/setValue/errors; naked controlled re-renders the whole form on every character; Formik re-renders everything always.",
      },
      {
        question:
          "Why must the server re-validate even with perfect client validation?",
        answer:
          "Client checks run on the client's machine — always bypassable; business rules, referential integrity, uniqueness, and security invariants live on the server; client validation exists for UX; server validation is the only enforcement that cannot be skipped — every breach of this rule has been the CVE.",
      },
      {
        question: "What ARIA attributes associate an input with its error?",
        answer:
          "aria-invalid='true' on the control plus aria-describedby pointing at the error element's id — every screen reader announces the error text the moment focus lands; without them color-only validation is decorative for assistive tech users.",
      },
      {
        question: "When is disabled worse than a submit error message?",
        answer:
          "Almost always — a disabled button is unfocusable and unannounced; the user cannot learn what is missing; an enabled button with validation errors teaches exactly what's wrong and where; reserve disabled for 'nothing to submit yet', never for validation.",
      },
    ],
    cheat: [
      "RHF default: register + zodResolver + mode:'onBlur' + disabled submit during flight.",
      "Schema: one Zod truth for client + server; refine for cross-field rules.",
      "ARIA: aria-invalid + aria-describedby + role=alert; persistent labels; focused error summary.",
      "Async checks: debounce + sequence guard; server is final authority — 409 mapped to the field.",
      "Never label placeholders; never keep disabled dead-ends; never discard user input on error.",
      "long forms: steps + draft autosave (localStorage, debounced + TTL); atomic submit.",
      "Server revalidates everything; client is courtesy only.",
    ],
    recap: `Forms are data-gathering machinery that punishes haste: because every error message your users see is either a sentence they can act on or a reason to leave, the discipline is mechanical — one schema, one validator pair, one error protocol, one preservation rule — and the reward is measured in completion rates nobody notices going up.`,
    code: {
      title: "RHF + Zod one-liner per field",
      language: "tsx",
      code: "const { register } = useForm({ resolver: zodResolver(schema) });\n<input {...register('email')} aria-describedby='err' />",
      explanation:
        "The whole wiring of one validated field — every form you ever ship is ten copies of this line.",
    },
    diagram: {
      title: "Validation pipeline",
      caption:
        "Blur/submit → schema check → field errors → ARIA wiring → server — two authorities, one truth.",
      mermaid: `flowchart LR\n  I[Input event] --> C[Zod client]\n  C --> E[Field errors + ARIA]\n  C --> S[Server re-checks]`,
    },
  },
  "web-dev-react-ecosystem-next-js": {
    intro: `Next.js is the React framework that makes the deployment story boring: file-based routing, server components, streaming SSR, static generation, ISR, API routes, image/build optimization — because the worst production bugs in React are re-invented infrastructure, the subject covers the App Router mental model, rendering modes (static/ISR/SSR/streaming/PPR), data fetching with cache semantics, server actions, route handlers, and the performance realities nobody benchmarks until users complain.`,
    foundations: `App Router: the filesystem is the router — app/page.tsx, layout.tsx (shared shells), loading.tsx (instant skeleton), error.tsx (error boundary), route.ts (API), not-found.tsx (404), parallel routes (@slot), intercepting routes ((.)segment). Server components render on the server — zero JS shipped for their subtree — direct DB/KV access allowed; client components with 'use client' interactivize; everything defaults to server. Rendering modes: static (build-time HTML, revalidate=N for ISR), dynamic (request-time, by force-dynamic or dynamic APIs: cookies(), headers(), searchParams), streaming (Suspense boundaries flush progressively — the page shows partial content instantly), PPR (static shell + dynamic holes). Caching: fetch caching (force-cache, no-store, revalidate), router cache (client-side RSC payload cache), data cache, full route cache — every freshness question reduces to picking the right layer. Images: next/image with sizes/priority/alt for LCP; fonts: next/font for zero-CLS; metadata API for SEO; route handlers as the API surface.`,
    concepts: [
      {
        title: "Server components first: what runs where.",
        body: `Server component (default): executes on the server per request (or at build), imports data-layer code freely, ships zero JS for its own subtree — the default must be server for anything that is HTML with no client state; 'use client' boundary: state, effects, browser APIs, event handlers — everything below the boundary ships as JS — the tree interleaves server and client by stacking boundaries; the cardinal sin: marking an entire page 'use client' because one button needed state — the fix is the boundary leaf (a small client component for the toggle, everything else server). Every codebase that started 2020-era React with 'use client' on everything is shipping ~200 KB of unshipped-JS tax on every route.`,
      },
      {
        title: "Rendering modes: static, ISR, dynamic, streaming, PPR.",
        body: `Static: fetch at build, HTML forever — fastest possible byte delivery, zero server work per view — perfect for docs, marketing, blog, previews shared to bots; revalidate: 3600 → ISR — serves stale instantly, revalidates in background after a miss (stale-while-revalidate at framework scale); dynamic: rendered per request — nondeterministic data (dashboards, auth-gated); streaming with Suspense: the shell renders instantly, slow subtrees flush as they resolve — TTFB drops to milliseconds, users see content while the long query runs; PPR: static shell contains dynamic 'holes' — static + dynamic in one HTML document, the best of both worlds — every product page at modern SaaS scale converges here; the decision chart: data changes never → static; minutes → ISR; per-user → dynamic; user shells → PPR/streaming.`,
      },
      {
        title: "Data fetching and the four-layer cache.",
        body: `fetch(url, { cache: 'force-cache' }) default caches in Data Cache; no-store opts out per request; revalidate: 60 makes it ISR-style; router.cache() client-side caches RSC payloads — instant back-nav, surprise cache semantics for mutation authors (router.refresh() refreshes). Cache keys: full URL; POST fetches uncached always; any mutation invalidates by path/tag: revalidatePath('/products'), revalidateTag('products') — the correct invalidation primitive — every 'I changed the CMS but the page shows stale' ticket is a cache layer you didn't invalidate; every 'my DB hit is 400× expected' is a missing cache layer you should have. The four layers exist; every performance call is 'which layer, what TTL'.`,
      },
      {
        title: "Server actions and route handlers as the write path.",
        body: `'use server' functions: called from client (form action={subscribe}) — arguments serialized, action runs server-side with headers/cookies accessible, return values stream back into useFormState on the client — no fetch boilerplate, no endpoint JSON plumbing, authentication checks colocated with mutation (no client bypass possible); mutations revalidate paths automatically; route handlers (app/api/x/route.ts) — every non-form case: GET/POST/PUT/PATCH/DELETE with JSON, auth, pagination, webhooks from Stripe/GitHub; the boundary: form actions for UI-adjacent writes, route handlers for integration/automation/REST consumers; every server action leaking secrets into client bundles began with an env var read at module top-level of a file imported by client code — secrets live in server-only modules.`,
      },
      {
        title: "Images, fonts, and the CWV budget.",
        body: `next/image: automatic WebP/AVIF, sizes/srcset, lazy by default, priority on LCP candidates, blur placeholder (lqip) with explicit dimensions — every 2024+ site that ships next/image has zero CLS from images as a matter of course; next/font: self-hosted, zero layout shift, no requests to Google Fonts; metadata API (export const metadata = { title, description, openGraph }) — every page declares its identity; scripts with next/script strategy='afterInteractive'; every Lighthouse report above 90 has these three lines; the 10-line page and the 100-line page differ by discipline, not by talent.`,
      },
    ],
    worked: [
      {
        title: "Convert a client-heavy page to server + island.",
        body: `Page awaits db.query() at module scope — async server component; 'use client' PlayButton renders with children passed as props (icon); the rest stays server — JS dropped by 88%; nav in <Suspense fallback={<Skeleton/>}> streams instantly; users stop waiting on the slowest API not being on the critical path — TTFB measured 200 ms → 90 ms; lighthouse performance 62 → 94; one boundary, one morning.`,
      },
      {
        title: "ISR recipe for a 10k-product catalog.",
        body: `export const revalidate = 30; fetch(...) cache default; 404-checked via notFound(); static params for top 200 products at build, rest on-demand lazy ISR; every product page pre-warmed on request, served stale-instant for 30 s after; origin egress drops 90%; every catalog-at-scale engineer re-implements exactly this; the CDN/edge numbers only make sense until you see the origin CPU drop.`,
      },
      {
        title: "Server action with auth + revalidation.",
        body: `'use server' export async function addToCart(sku) { const session = await auth(); if (!session) throw new Error('sign in'); await db.cart.upsert({ userId: session.id, sku }); revalidateTag('cart'); return { ok: true }; } — one function, zero endpoints, auth inline, cache broken correctly; the client does action(sku) from a form — no JSON, no fetch, no CSRF token dance (actions carry origin checks by framework) — three security properties by default instead of by diligence.`,
      },
      {
        title: "Fix the stale product page after CMS edit.",
        body: `CMS calls revalidatePath('/products/' + slug) via webhook route handler — page fresh within seconds for every visitor, no cache TTL waiting game; every 'updated prices but old prices for users' incident traces to a missing revalidate hook; the webhook is five lines; the discipline is remembering to add it on every entity create/update/delete path — one forgotten callout, infinite mystery.`,
      },
    ],
    exam: [
      {
        question: "When is a Next.js page static vs dynamic by default?",
        answer:
          "Static when it fetches without request-time APIs and opts into caching at build; dynamic when it reads cookies()/headers()/searchParams, opts out of fetch cache (no-store/force-dynamic), or exports revalidate = 0 — the build report labels each route; you read it and learn.",
      },
      {
        question: "What does a 'use client' boundary do mechanically?",
        answer:
          "It marks everything below this directive as client components: they ship JS to the browser and run in both environments, enabling state/effects/handlers; everything above stays server-only — the boundary is the firewall between HTML-first rendering and interactive JS.",
      },
      {
        question: "How do you bust a stale Data Cache entry?",
        answer:
          "revalidateTag(tag) or revalidatePath(path) from a server action or route handler — the whole cached tree keyed by that path/tag is discarded server-side and re-rendered fresh on next request; every fetch carries a next.tags option to join a tag; no tags → revalidate by time only.",
      },
      {
        question:
          "Why must fetch caches be invalidated on writes even with ISR?",
        answer:
          "ISR serves stale HTML until its TTL lapses or a revalidation is triggered; a write that skips revalidation leaves users buying the old price for the TTL window; the webhook pair (CMS → revalidatePath) closes the window — the framework won't guess which content your write affected.",
      },
    ],
    cheat: [
      "Server component default; 'use client' = interactivity islands; never mark a page client for one button.",
      "Rendering: static < ISR < dynamic; Suspense streams shells fast; PPR static+holes.",
      "fetch cache: force-cache (default) / no-store / revalidate+tags; router.refresh for client nav.",
      "Writes: server actions with inline auth + revalidateTag/Path — CSRF-free by origin checks.",
      "next/image with sizes+priority; next/font zero-CLS; metadata API = SEO by artifact.",
      "Route handlers for REST/webhooks; server actions for UI writes; never fetch client-side for what server can do.",
      "Images: fetchpriority=high + explicit dimensions kills CLS and preloads LCP.",
    ],
    recap: `Next.js is the framework that makes React's rendering hierarchy a deployment product: because static, ISR, dynamic, streaming and PPR are chosen per route — not per app — every page gets the cheapest rendering its data permits; the skill is not memorizing the modes but knowing which corner of the data-freshness triangle your content sits in, and letting the file system execute the answer.`,
    code: {
      title: "Suspense streaming recipe",
      language: "tsx",
      code: "<Layout><Header/><Suspense fallback={<Skeleton/>}><SlowData/></Suspense></Layout>",
      explanation:
        "Header and shell byte instantly; the slow branch streams when the query resolves — TTFB wins.",
    },
    diagram: {
      title: "App Router shell",
      caption:
        "Server components surround client islands; the boundary is one directive.",
      mermaid: `flowchart LR\n  S[Server components] --> I[Client islands]`,
    },
  },
  "web-dev-react-ecosystem-state-and-data-libraries": {
    intro: `State and data libraries are the decision layer beneath every React app large enough to have more than three async sources: which 0-10 stores to keep, what belongs in the server cache, what is ephemeral UI state, and what is URL state — because the failure mode is not picking wrong, it is having picked nothing and letting every component invent its own cache — the subject covers TanStack Query and SWR as server cache, Redux Toolkit and Zustand as client stores, URL state as a first-class citizen, and the taxonomy that ends the 'where does this go' argument forever.`,
    foundations: `The four buckets: (1) server cache — remote data owned by the server (users, products, feeds), fetched and cached client-side with dedup/staleness/revalidation (TanStack Query/SWR): stale-while-revalidate, exponential backoff, cache keys, invalidation on mutation — the default for everything that comes from an API; (2) client session state — cross-page client state that outlives a tree and is not remote (cart draft, wizard, auth session): Zustand (minimal, hook-native, no boilerplate) or Redux Toolkit (predictable, devtools, middleware — schema discipline at scale); (3) URL state — page-local shareable values (filters, pagination, tabs, selected id): searchParams — refresh-safe, bookmarkable, back-button-friendly — the cheapest bag always underused; (4) UI state — transient local state (modal open, hovered, input focus): useState/useReducer — colocate. Every 'why is this in Redux' war ends with the taxonomy: filter in URL, list from server, cart in Zustand, modal locally.`,
    concepts: [
      {
        title: "TanStack Query: the server cache you actually want.",
        body: `useQuery({ queryKey, queryFn }) — a hook that fetches, dedups identical keys app-wide, caches with staleTime (fresh window) and gcTime (eviction), refetches on window focus/reconnect/mount (all configurable), returns { data, isPending, isError, refetch } — every remote GET your app makes should route through this funnel: no more useEffect fetch races, no more forgotten stale guards; useMutation for POSTs with onSuccess invalidation (queryClient.invalidateQueries({ queryKey }) — the cache entry re-fetched everywhere automatically); optimistic updates: onMutate snapshot → setQueryData → onError roll back — every like button, every cart increment; parallel: useQueries; infinite scroll: useInfiniteQuery with cursors; every 'wait for both' replaces with single hook calls; the library retires the entire category of client-server sync bugs by owning the remote truth centrally.`,
      },
      {
        title: "Zustand vs Redux Toolkit — the honest trade.",
        body: `Zustand: create((set, get) => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) })) — one hook, no provider needed, no actions boilerplate, selectors per-slice subscribe; devtools middleware, persist middleware (localStorage) for free; perfect for most app state; critiques: no enforced action/reducer separation, store shape can sprawl without discipline — needs naming conventions and small stores; Redux Toolkit: createSlice({ name, initialState, reducers }) — actions generated, immer drafts inside reducers, RTK Query built-in fetching/cache, middleware ecosystem, redux-saga/thunk for complex async flows, time-travel devtools; the overhead: more files, more ceremony, more files again; the payoff: enforced architecture, deterministic snapshots for debugging, battle-tested at any scale; rule of thumb: new projects lean Zustand, enterprise reduxesan knowledge bases lean RTK; migrating from useState-everything to either is a one-sprint refactor that ends the 'where is this data' fights.`,
      },
      {
        title: "URL state: the most-forgotten global store.",
        body: `?q=shoes&page=3&sort=price — every filter, sort, pagination, selected tab belongs here: refresh keeps them, back button navigates through them, share links carry them, every e2e test can bookmark straight into view. useSearchParams() reads/writes; nuqs (or App Router's searchParams) gives typed state management on top; every dashboard with 12 useState filter variables is re-implementing the browser for worse — searchParams replace the whole pile; the pattern: page.tsx reads searchParams server-side for SSR correctness, client components use the hook for interactivity; every 'why does my refresh lose my filters' review comment ends with one hook moved to URL.`,
      },
      {
        title: "SWR vs TanStack — one line of separation.",
        body: `SWR (Vercel's, smaller surface, stale-while-revalidate built into fetch promise) and TanStack Query (bigger API, more control, infinite queries, per-query config, optimizer-friendly) — new projects pick either license-free; every serious app benefits from TanStack's richer API (refetch policies, placeholder data, structural sharing); both make 'fetch in render' correct — stop hand-rolling unless real-time websocket updates demand custom stores (WebSocket → setQueryData directly — the only reason to touch the cache API by hand).`,
      },
      {
        title: "Mutation patterns and optimistic UI.",
        body: `Every mutation: POST → onSettled invalidation (always); optimistic: snapshot current query data → apply predicted change → on error rollback; onSuccess re-invalidate to server truth; every 'the spinner lies for 400ms' moment is an optimistic update away; every 'double-click charged the user twice' fix ever shipped was mutation deduplication plus disabled-while-pending; every 'the list lost my new item until reload' bug was a missed invalidation; the taxonomy is short and every line saves a support ticket.`,
      },
    ],
    worked: [
      {
        title: "Replace fetch-in-effect with useQuery.",
        body: `Before: useEffect(() => { fetch('/api/me').then(r => r.json()).then(setUser).catch(() => setError(true)); }, []); — no dedup (every mounting component re-fetches), no cache, no abort, no retries, race on id change, setState-after-unmount guard needed. After: const { data: user, isPending, error } = useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 60_000 }); — every mounting consumer shares the cache, abort is automatic, retries and freshness are configured once, no handler soup; the effect count drops to zero; every 'why is this refetching' conversation moves from mystery to config.`,
      },
      {
        title: "Zustand cart in 12 lines.",
        body: `const useCart = create(persist((set, get) => ({ items: [], add: sku => set(s => ({ items: [...s.items, sku] })), remove: i => set(s => ({ items: s.items.filter((_, x) => x !== i) })), clear: () => set({ items: [] }) }), { name: 'cart' })); — persist to localStorage auto; every component calls useCart(s => s.items); no provider; devtools middleware next door; the entire cart as one file; every migration from Redux here smells like deleting 80% of the actions.`,
      },
      {
        title: "Wire URL filters with nuqs.",
        body: `const [q, setQ] = useQueryState('q', { defaultValue: '', history: 'push' }); const [page, setPage] = useQueryState('page', { defaultValue: 1, parse: parseAsInteger }); — setQ debounced; every change hits the URL; refresh keeps state; share link perfect; every 'why are my filters gone after reload' bug inherits this twenty-line fix.`,
      },
      {
        title: "Optimistic like button with rollback.",
        body: `useMutation({ mutationFn: toggleLike, onMutate: async id => { await qc.cancelQueries({ queryKey: ['post', id] }); const prev = qc.getQueryData(['post', id]); qc.setQueryData(['post', id], p => ({ ...p, likes: p.likes + (p.liked ? -1 : 1), liked: !p.liked })); return { prev }; }, onError: (_e, id, ctx) => qc.setQueryData(['post', id], ctx.prev), onSettled: id => qc.invalidateQueries({ queryKey: ['post', id] }) }); — instant feedback, rollback on failure, server truth restored; the template every social app re-discovers in production.`,
      },
    ],
    exam: [
      {
        question: "What does TanStack Query dedupe?",
        answer:
          "Identical queryKey+queryFn pairs app-wide — every mounting consumer shares one network request and one cache entry; N components asking for 'me' produce one request, not N; with structural sharing, unchanged data never triggers renders.",
      },
      {
        question: "When does useQuery refetch by default?",
        answer:
          "On mount, on window reconnect, on window focus, and whenever its queryKey changes — all configurable (refetchOnMount/WindowFocus/Reconnect, staleTime makes freshness windows); every 'why does it fetch again' mystery resolves by reading the four flags.",
      },
      {
        question: "What is the URL state replacement for useState filters?",
        answer:
          "useSearchParams/nuqs — filters, pagination, sort, selected ids live in ?q=... — refreshable, shareable, back-button friendly; every list page loses ten useState hooks in one stroke; the shareability side effect is the only reason half the app becomes embeddable.",
      },
      {
        question: "When is Redux Toolkit the right tool?",
        answer:
          "Large teams, complex cross-slice logic, strict action/audit discipline, middleware (analytics/logging/saga), time-travel debugging, or RTK Query consolidation — the ceremony pays for itself at scale; for one-page-app state, Zustand is faster to wire and just as correct.",
      },
    ],
    cheat: [
      "Server data → TanStack Query (keys factory, staleTime, invalidation on mutation).",
      "Cross-page client state → Zustand (minimal) or Redux Toolkit (scale/middleware).",
      "Shareable local state → URL searchParams (refresh- and share-safe).",
      "Ephemeral per-page UI → useState/useReducer (modal/hover/input).",
      "Mutations: onMutate optimistic → onError rollback → onSettled invalidate.",
      "useQuery retries/focus/reconnect/mount — know the flags, or they surprise you.",
      "Every remote GET through the cache — never fetch inside effects in 2026.",
    ],
    recap: `State and data libraries end the taxonomy war: server cache owns the network, client stores own the session, the URL owns the page, local useState owns the moment — because once 'which bucket' is the only question a junior needs to ask, every 'global state' debate dissolves into routing the data to its right owner.`,
    code: {
      title: "Complete server-fetch component",
      language: "typescript",
      code: "const { data, isPending, error } = useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 60_000 });",
      explanation:
        "Dedup, abort, retry, cache — one line of config instead of an effect graveyard.",
    },
    diagram: {
      title: "The four buckets",
      caption:
        "Server cache → URL → store → local — every value routes to an owner.",
      mermaid: `flowchart LR\n  S[Server cache] --> U[URL]\n  U --> Z[Client store]\n  Z --> L[Local state]`,
    },
  },
  "web-dev-react-ecosystem-ui-systems-and-design-engineering": {
    intro: `UI systems and design engineering are where design decisions become code contracts: tokens, variant APIs, compound components, accessibility baked in, documentation, visual regression — because the cost of a wrong pixel multiplies by every consumer, the subject covers design tokens, Tailwind + cva, component API design, compound components and slots, headless UI with Radix, a11y-first defaults, Storybook and Chromatic, and design system governance at scale.`,
    foundations: `Layers: (1) tokens — primitive (colors, spacing, radius, shadows, typography scales) → semantic (--surface, --text-muted, --accent) → theme swaps via data-theme attr — never raw hex in components; (2) primitives — Box/Flex/Text for spacing/layout invariants; (3) components — Button/Input/Modal — variant-typed APIs (cva: variants × sizes × states), compound slots for composition; (4) documentation — Storybook stories per variant × args, controls for every knob; (5) governance — token review, API review, versioning, codemods for breaking changes, changelogs; (6) testing — RTL behavior tests + Chromatic/Playwright screenshots + a11y audits (axe) per story. Library reality: Tailwind for utilities, CVA for variants, Radix for headless behavior (focus management, keyboard, portal, aria), React Aria for maximal correctness; every design system worth its name treats a11y as its own release-gated artifact, not as a vibe.`,
    concepts: [
      {
        title: "Tokens: decisions out of the components.",
        body: `Primitive tokens from the design tool: --blue-600, --space-4, --font-body; semantic aliases: --surface, --surface-raised, --text, --text-muted, --accent, --border, --danger — components reference aliases only; dark mode flips the alias block in one place; every rebrand is a token change, not a sed of hex codes; Style Dictionary generates the same tokens for web/iOS/Android — one source, three platforms; every 'make it darker' request that stalls for a week died in this paragraph — the fix is always in the alias layer and never in the component.`,
      },
      {
        title: "Component API design: the cva + variants contract.",
        body: `const button = cva('inline-flex items-center rounded-md font-medium transition-colors', { variants: { intent: { primary: 'bg-accent text-on-accent hover:bg-accent-strong', ghost: 'hover:bg-surface-hover', danger: 'bg-danger text-on-danger' }, size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-11 px-5 text-lg' }, }, defaultVariants: { intent: 'primary', size: 'md' } }); — every variant typed; autocomplete at the call site; adding size/tone = one object; nobody spreads raw classNames; every design-system button passes the same five-line audit: variants × sizes × icons × loading state × disabled rubric; every 'our button shows raw text on purple' bug is a missing token behind one variant.`,
      },
      {
        title: "Compound components and slots.",
        body: `<Card> <Card.Header><Card.Title/></Card.Header> ... </Card> — parent controls structure, children compose freely — no 12-prop APIs; flexibility without coupling; every ButtonGroup/Tabs/Accordion is a compound component; Headless UI/Radix implement the behavior (focus trap in Modal, roving tabindex in Tabs, arrow keys in Select) and you style the skin — Tailwind classes on top of Radix primitives is the default arrangement when you want accessibility that nobody in the room argues about; the alternative (hand-rolled focus traps and roving tabindex) is where support tickets breed.`,
      },
      {
        title: "A11y is a release gate, not a feature.",
        body: `Every shipped component: role/name/value announced correctly; keyboard-operable end to end (Tab reach, Enter/Space activate, Escape dismiss, arrow keys in groups); focus visible; contrast ≥ 4.5:1 text; reduced-motion honored; axe-core zero issues per story in Chromatic/CI — the system's a11y score drops only by explicit override in code review; every third-party component from the internet that ignores focus management is a trapdoor your users with keyboards fall through forever; the system ships the fix once, 300 consumers inherit it.`,
      },
      {
        title: "Governance: change control for the design system.",
        body: `Every token/component change: PR with design-eng review; breaking changes behind deprecation windows with migration codemods; versioned packages (semver); Storybook as the API contract (every merged PR ships its story update); changelog generated; consumers never surprise-breaking — the system that treats itself like a public library serves its own teams better than any npm package you pay for; codemods (jscodeshift) automate renames at scale — every breaking release = one flagged PR per consumer repo, not a hundred manual greps.`,
      },
    ],
    worked: [
      {
        title: "Build a Button with cva in ten lines.",
        body: `const button = cva(base, { variants: { tone: {...}, size: {...} }, defaultVariants: { tone: 'primary', size: 'md' } }); function Button({ tone, size, ...props }) { return <button className={button({ tone, size })} {...props} />; } — every state: hover/focus-visible/disabled/loading; every story: args drive matrix; every consumer: <Button tone='danger' size='sm'>Delete</Button> — the whole class library behavior encoded in exactly one file; every redesign last quarter was one edit away from done.`,
      },
      {
        title: "Add dark mode with two CSS files.",
        body: `:root { --surface: #fff; --text: #111; --accent: #2563eb; } [data-theme='dark'] { --surface: #141414; --text: #f2f2f2; --accent: #60a5fa; } — every component references var(--surface) etc.; toggle: document.documentElement.dataset.theme = 'dark' (or prefers-color-scheme default); zero component changes; storage in localStorage; the statusbar reads instantly recognizable; the system absorbed the whole theme in one file's worth of alias flips.`,
      },
      {
        title: "Ship accessible Modal with Radix.",
        body: `import * as Dialog from '@radix-ui/react-dialog'; <Dialog.Root open={open} onOpenChange={setOpen}> <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger> <Dialog.Portal> <Dialog.Overlay /> <Dialog.Content aria-labelledby='title'> <Dialog.Title id='title'>Confirm delete</Dialog.Title> <Dialog.Description>…</Dialog.Description> <Dialog.Close asChild><Button>Cancel</Button></Dialog.Close> </Dialog.Content> </Dialog.Portal> </Dialog.Root> — focus trapped, restored, Escape closes, aria attributes manual in one line; every consumer inherits focus hygiene for free; the manual alternative cost a team three sprints once upon a support forum.`,
      },
      {
        title: "Chromatic visual regression pass.",
        body: `Every story snapshot diff'd per commit; PR shows red/green images; every unintended shift (rounded corner from 4→6, font weight upgrade) flagged pre-merge; every intended one re-baselined with one click; the visual layer no longer drifts silently — the only regression suite that catches what humans cannot see at 2 AM on a Friday deploy.`,
      },
    ],
    exam: [
      {
        question: "What is the semantic token layer for?",
        answer:
          "It decouples components from raw color values — --accent is a decision ('the brand's action color') not a hex code; themes swap aliases (light/dark/brand variants) without touching components; every design retune becomes a 30-line alias review instead of a 700-line hunt.",
      },
      {
        question: "What does cva give you that hand-written classnames don't?",
        answer:
          "Typed, exhaustive variant matrices — intent × size, disabled/loading states defined once, autocomplete at the call site, every component in the system sharing one shape; adding a dimension (corner radius, elevation) touches exactly one object — every button in the product updates coherently forever.",
      },
      {
        question: "Why are Radix primitives usually preferable to hand-rolled?",
        answer:
          "Behavior-critical correctness for free: focus trapping/restoration, roving tabindex, portals, aria roles/labels/state, keyboard contracts — the exact bugs that take senior engineers weeks to ship poqu and hours to debug; styling stays yours (Tailwind on top) while semantics stop being on your conscience.",
      },
      {
        question: "What does Chromatic/Playwright visual regression give you?",
        answer:
          "A separate pixel-metric truth: every screenshot compared per story per commit — drift becomes visible, intentional change becomes re-baselined, surprise changes die in review; it is the only suite that catches what eyes miss at merge time.",
      },
    ],
    cheat: [
      "Alias tokens only in components; primitives never inline; themes flip aliases.",
      "cva for variant matrices; defaultVariants; typed autocomplete forever.",
      "Compound components for composition (Tabs/Menu/Dialog/Card slots).",
      "Radix/Headless for focus/keyboard/aria; you style the skin.",
      "A11y per story: roles, keyboard, contrast, reduced-motion, axe zero issues.",
      "Governance: semver + changelogs + codemod deprecations; Storybook as contract.",
      "Visual regression: Chromatic/Playwright per story; re-baseline intentionally.",
    ],
    recap: `A UI system is a promise about every pixel you didn't draw this week: because components derive from tokens and behavior from headless primitives, every screen you'll ever ship stands on the parts reviewers already accepted — the alternative, component-by-component magic, is the architecture of tomorrow's regression nightmares.`,
    code: {
      title: "cva button core",
      language: "tsx",
      code: "const button = cva('rounded-md font-medium', { variants: { tone: { primary: 'bg-accent text-on-accent', ghost: 'hover:bg-surface-hover' } }, defaultVariants: { tone: 'primary' } });",
      explanation:
        "One variant map powering every button in the product — the five-line nucleus.",
    },
    diagram: {
      title: "Token flow",
      caption:
        "Design tool → primitive → alias → component — decisions flow down, themes swap aliases.",
      mermaid: `flowchart LR\n  T[Design tool] --> P[Primitive tokens]\n  P --> A[Alias layer]\n  A --> C[Components]`,
    },
  },
  "web-dev-react-ecosystem-advanced-react-patterns": {
    intro: `Advanced React patterns are the compound extensions of the base model that separate maintenance-worthy codebases from the ones every engineer fears: compound components, render props, HOCs, context injection, portal escapes, control objects, the headless pattern, and the anti-patterns that made people love Vue for a year — because React rewards composition more than philosophy, the subject names the patterns that buy API ergonomics and the ones that buy only indirection.`,
    foundations: `Pattern catalog with impulses and costs: (1) compound components (Tabs/Menu/Dialog) — parent holds shared state, children slots read it via Context — buys ergonomic JSX, costs a context ceremony; (2) render props — children as functions, {children(data)} — maximum inline flexibility, every call site a closure; (3) HOC — function wrapping component injecting props — legacy, replaced by hooks for most cases; (4) headless/hooks-first — behavior into hooks + unstyled primitives (Radix model) — the dominant pattern of 2026; (5) control objects — {value, onChange} replacing id refs for input groups; (6) portal — createPortal(node, domNode) — escape overflow/z-index traps for popovers/toasts/modals; (7) suspension — children suspending on data with error+loading boundaries; (8) render-as-a-prop explosion vs tree alignment (naive prop drilling of 8+ handlers screams for context or composition). Anti-patterns: provider-everything (top of tree with all state — re-renders world), context-for-constants (theming done right is tokens), HOC pyramids (withAuth(withRouter(withTheme(C)))).`,
    concepts: [
      {
        title: "Compound components: state shared privately.",
        body: `const TabsCtx = createContext(); function Tabs({ children, value, onChange }) { return <TabsCtx.Provider value={{ value, onChange }}><div role='tablist'>{children}</div></TabsCtx.Provider>; } Tabs.Tab = ({ value: v, children }) => { const { value, onChange } = useContext(TabsCtx); return <button role='tab' aria-selected={value === v} onClick={() => onChange(v)}>{children}</button>; }; — every consumer composes <Tabs value={t} onChange={setT}><Tabs.Tab value='a'>One</Tabs.Tab>…</Tabs> — a single API surface, slots free, no prop clutter on the parent; the pattern lives in every menu/accordion/modal you depend on daily; the React docs' own <Toggle/> example is exactly this shape.`,
      },
      {
        title: "Render props vs hooks — the migration of a generation.",
        body: `Classic: <DataProvider render={data => <View data={data} />} /> vs children as function: <Mouse>{({x, y}) => ...}</Mouse> — logic-state lives in the provider, view picks its shape — maximal reuse; hooks killed them for stateful logic (useMouse() = same API without the wrapper component nesting); render props survive where the inversion is intentional: list/virtualization slots, react-table columns, error boundaries with fallback-as-function; every pattern survey from 2015-2019 lists render props #1 — in 2026 they're reserved for structural slots, not behavior sharing.`,
      },
      {
        title: "Context as dependency injection — scoped, not global.",
        body: `Provider sits next to its consumers (one feature, one context) — theme, locale, auth session, router — never the 'uber-provider' at the root (every consumer re-renders per change; always-moved-back-to-slicing smell); memoize the value object or inline object identity regenerates every parent's render — every 'why is my tree re-rendering at 60 fps' question ends at an unmemoized context value with a pull of five hooks above; split contexts by change frequency — auth rarely, theme occasionally, cart often; the discipline buys elasticity without redux.`,
      },
      {
        title: "Portals: escape the ancestor trap.",
        body: `createPortal(<Toast/>, document.body) — escapes overflow:hidden clipping, stacking contexts, transform-parent traps — every dropdown/tooltip/modal inside a scroll container or a transformed card dies of ancestor positioning without a portal; every portal still belongs to the React tree for events, context, unmount, SSR hydration; the z-index war ends the moment every overlay renders in one body-level layer with controlled stacking.`,
      },
      {
        title: "Control objects and the form API.",
        body: `const control = { value, onChange }; <Field {...control} /> — every input-ish component accepts the same pair; every form library is just a giant control orchestrator (RHF mounts refs onto its own inputs and owns the pair internally); control-object patterns replace spread-twenty-props APIs with one typed bundle — fewer override points, more predictability, less spelling mistakes; the TS advantage: const handle = { value, onChange }; Type 'FieldProps' accepts it structurally — one interface, infinite consumers.`,
      },
    ],
    worked: [
      {
        title: "Build <Tabs> compound in 20 lines.",
        body: `const Ctx = createContext(null); function Tabs({ value, onChange, children }) { return <Ctx.Provider value={{ value, onChange }}><div>{children}</div></Ctx.Provider>; } function Tab({ v, children }) { const { value, onChange } = useContext(Ctx); return <button aria-selected={value === v} onClick={() => onChange(v)}>{children}</button>; } Tabs.Tab = Tab; — usage: <Tabs value={t} onChange={setT}><Tabs.Tab v='overview'>Overview</Tabs.Tab><Tabs.Tab v='pricing'>Pricing</Tabs.Tab></Tabs> — every consumer's markup stays free of drag-and-drop state plumbing; adding panels/counts never changes the parent API.`,
      },
      {
        title: "HOC for auth gating — then hookify it.",
        body: `const withAuth = C => props => { const { user, loading } = useAuth(); if (loading) return <Spinner />; return user ? <C {...props} /> : <Navigate to='/login' />; }; — every protected page wrapped once; vs hooks: useRequireAuth() inside the component — one line, no wrapper component in tree, no prop drilling, but hides the guard in each component (documented in code review); hooks version wins in 2026 — compound logic no longer needs HOCs for guard/permission logic.`,
      },
      {
        title: "Fix context value identity storm.",
        body: `<Ctx.Provider value={{ theme, setTheme }}> — new object every render → every consumer re-renders on ANY provider render (even unmounted branches elsewhere re-compute children). Fix: const value = useMemo(() => ({ theme, setTheme }), [theme]); — identity stable across renders; consumers stop re-rendering; the ten lines that end the mystery 'children of X re-render constantly' war.`,
      },
      {
        title: "Toast rendered in a portal.",
        body: `createPortal(<div className='toast'>{msg}</div>, document.body); — overflow containers can't clip it; every toast/notification/coachmark in the product reuses this escape hatch; the rest of the tree doesn't know or care — React trees portal freely without context loss.`,
      },
    ],
    exam: [
      {
        question: "What shared structure do compound component members use?",
        answer:
          "React Context — parent provides state, children consume it at their level via useContext; components stay ignorant of each other's internals while sharing state privately — every slot composes freely and the parent owns the shape.",
      },
      {
        question: "How did hooks change HOC/render-prop usage?",
        answer:
          "Logic sharing moved into hooks — useMouse, useAuth replace wrapper-component stacking; wrappers remain where children-level inversion is intentional (virtualized rows, table cells rendered per row, per-item slots); provider-decorated trees collapsed into flat custom hooks.",
      },
      {
        question:
          "Why does inlining a context value object cause re-render storms?",
        answer:
          "Fresh object identity per render fails React's Object-is comparison — every consumer of that context re-renders whenever ANY provider ancestor re-renders, regardless of slice changes; useMemo the value or split contexts; the linter won't catch it — every DevTools flame graph shows it first.",
      },
      {
        question: "When must you use a portal?",
        answer:
          "When the UI must escape an ancestor's clipping or stacking context — overflow:hidden/scroll containers, transform/filter ancestors creating new containing blocks, or z-index wars against sticky/fixed relatives — portal mounts at body level while staying in your React tree for events, context and lifecycle.",
      },
    ],
    cheat: [
      "Compound components = Context + slots; parent owns state, children render free.",
      "Render props survive for slot inversions (virtualizers); hooks own stateful logic.",
      "Context: scope per concern, memoize value, split by change frequency.",
      "Portals escape clip/z-index traps; tree membership preserved.",
      "HOCs mostly obsolete — prefer hooks or RHF-style registration.",
      "Control object {value, onChange} unifies every input API.",
      "Anti-pattern: provider-everything; cure: colocate state near consumers.",
    ],
    recap: `Advanced patterns are scale tools for API shape: because composition always beats inheritance in React, every pattern here is a named trade in the composition currency — the anti-patterns all arrived the same way, by paying the first three times and stopping the fourth; choose patterns that buy ergonomics, not ceremony.`,
    code: {
      title: "Compound tab skeleton",
      language: "tsx",
      code: "const Ctx = createContext(null); const Tab = ({ v, children }) => { const { value, onChange } = useContext(Ctx); return <button aria-selected={value === v} onClick={() => onChange(v)}>{children}</button>; };",
      explanation:
        "Context + slot — every compound component ever shipped in miniature.",
    },
    diagram: {
      title: "Pattern decision",
      caption:
        "Slots want slots, behavior wants hooks, screens want server/client islands — no inheritance anywhere.",
      mermaid: `flowchart LR\n  Slots --> Context\n  Behavior --> Hooks\n  Screens --> Islands`,
    },
  },
  "web-dev-react-ecosystem-react-performance-optimization": {
    intro: `React performance is the art of fewer renders, less DOM, and honest measurement: every keystroke that re-renders 500 components is a bug wearing a feature badge — because the profiling tools show you exactly what stopped and why, the subject covers render attribution (DevTools profiler, 'why did you render'), memoization discipline (memo/useMemo/useCallback), virtualization (windowing), code splitting, Suspense-driven loading, stable references at the boundary, and the habits that keep large apps feeling native.`,
    foundations: `Render equation: cost = number of components re-rendered × their average work + commit work (DOM updates). React skips subtrees whose props didn't change (reference equality via Object.is) — unstable prop identity defeats the skip: new arrow-function props per render, inline object spreads, parent-state-dependent children all bust memo at the door. Tools: DevTools Profiler (flame graph ranked by render duration, 'highlight updates' box), why-did-you-render (logs renders with reasons in dev), Chrome Performance (long tasks, layout thrash), React.memo for leaf consumers, useMemo for derived heavy values (filter/sort over 10k rows), useCallback for handlers feeding memoized children; windowing (react-window/tanstack-virtual) renders only visible rows — every 10k-row table needs it; Suspense + React.lazy for route-level splitting; server components as the ultimate reduction (no client JS at all); key stability everywhere (no index keys on mutable lists).`,
    concepts: [
      {
        title: "Render attribution: find the guilty component.",
        body: `Profiler: record 5 seconds, see which components took the longest per commit, why they re-rendered (owner props/state change), every render plotted against interaction; why-did-you-render in dev logs 'Component re-rendered because props changed: {a: 1 -> 1}' — the identity crime scene in console form; the ritual: measure before memoizing, never the reverse; every 'memoize everything' reflex creates seven dependencies and zero gains; the discipline: hot components first (lists, cells, cards), stable the boundary above them, leave the rest to React — because most renders cost microseconds and the major ones pay for the measurement ten times over.`,
      },
      {
        title: "Memoization discipline — when each tool pays.",
        body: `React.memo: shallow compare props; pays for leaf components re-rendered frequently with stable-ish props (rows, badges, cells) — pair with stable onSelect/onChange handlers (useCallback free functions); useMemo: cache computed values through re-renders (filter on 10k rows — 0.8 ms → 0.001 ms); pays for expensive aggregations/serializations; never for trivial values; useCallback: identity-stable function for memoized children/effect deps — the only three uses that matter; anti-pattern: wrapping every setState/callback in useCallback 'just in case' — pure tax, zero upside, double the review noise. Every useMemo/useCallback pairs with a measured cost in the commit graph or it gets deleted in review.`,
      },
      {
        title: "Virtualization and windowing.",
        body: `Render only ~30 rows of a 10,000-row table; spacer divs above/below keep the scrollbar honest; react-window/tanstack-virtual; row heights variable supported (measure or estimate+correct); every grid/list/chat/log viewer in production past 500 items virtualizes or dies by 60-fps's hand; every infinite scroll feed is its own virtualization problem; the React Server Components alternative: render 10k rows to HTML server-side, zero JS rows shipped — both are the answer to 'too many rows' — the server variant when content is static, the virtualizer when updates are live.`,
      },
      {
        title: "Code splitting and the Suspense contract.",
        body: `React.lazy(() => import('./Heavy')) — the chunk downloads on first render; Suspense fallback shows during fetch; every route is a split point by default in App Router (each page.tsx is a chunk); every modal/datepicker/editor feels instant when deferred until opened; every 'app feels heavy' bundle analysis chart begins and ends with lazy boundaries — the fix is ten minutes and one Suspense tag per boundary; every admin/analytics route should cost zero on the user path unless the user navigates there.`,
      },
      {
        title: "Stable props at the boundary — the whole trick.",
        body: `const handle = useCallback(id => select(id), []); // stable identity, never recreated; const rows = useMemo(() => data.filter(pred), [data]); — the memoized leaf below re-renders only when rows change; the pattern is one useCallback + one useMemo per memoized subtree root; everything else React handles by identity — the fifth repetition of this recipe in one file is always too many; three uses, one boundary, done.`,
      },
    ],
    worked: [
      {
        title: "Stop a 300-row list from re-rendering on hover.",
        body: `Hover sets state in parent → every Row re-renders (new style object per render). Fix: Row = React.memo(Row); stable style objects; stable onSelect via useCallback; rows' style prop becomes a constant — Chromatic render times 45 ms → 2 ms; every 'list feels janky' bug report ends exactly here — the fix is always a stable identity, not a bigger computer.`,
      },
      {
        title: "Derive expensive groupings once with useMemo.",
        body: `const grouped = useMemo(() => groupBy(transactions, t => t.accountId), [transactions]); — on 20k records, grouping is 12 ms every render otherwise; memo holds it until transactions reference changes; the table renders at 60 fps again; the only honest useMemo of the week; every dependency in the array read as a subscription — miss one stale group forever.`,
      },
      {
        title: "Virtualize a chat message list.",
        body: `const opts = useRef({ itemCount: msgs.length, initialRect }).current; tanstack-virtual getVirtualItems() over container ref; every message mounts only when within overscan of the viewport — DOM nodes capped at 60; scrolling a 10k-message thread is now constant — the chat product shipping at all on low-end Androids exists because someone virtualized the scrollback.`,
      },
      {
        title: "Split an editor bundle with React.lazy.",
        body: `const Editor = lazy(() => import('./Editor')); const [open, setOpen] = useState(false); {open && <Suspense fallback={<Slot/>}><Editor /></Suspense>} — first open pays the chunk fetch once, every user who never opened the editor saved ~250 KB compressed; the product manager sees the first-paint graph move down and to the left; every below-fold widget is this redirect or it isn't shipping.`,
      },
    ],
    exam: [
      {
        question:
          "Why doesn't React.memo help if the parent spreads new object props each render?",
        answer:
          "Object-is comparison fails on fresh identity — {...style} yields new references per render, beating memo's shallow compare; the fix is stable references above the memo boundary (constants, useMemo for computed objects, useCallback for handlers) — memo only honors identity, never deep equality.",
      },
      {
        question: "What is the primary DOM saving of virtualization?",
        answer:
          "It caps concurrently mounted rows (typically 30-50 plus overscan) regardless of list size — layout/paint and memory stay constant; scroll position gets reconstructed from offset math — every long feed/grid/log viewer must do this past ~500 items.",
      },
      {
        question: "When does useMemo make things slower?",
        answer:
          "When the computation is trivial (comparison, formatting one string) — the memo overhead (dependency comparison, storage lookup) exceeds what it saves; memo existing everywhere is a tax, not a virtue; profile before you wire.",
      },
      {
        question:
          "Why must stable handler identity pair with memoized children?",
        answer:
          "memo's shallow compare checks function identity — a new arrow per parent render fails identically every time, so the child re-renders and the memoization is pure overhead; stable useCallback no-ops when deps never change — both sides of the equation or neither.",
      },
    ],
    cheat: [
      "Profile first: DevTools Profiler + why-did-you-render in dev; memoize what profiler names.",
      "memo + stable handlers/objects on hot leaves; useMemo for expensive derives only.",
      "useCallback for handlers consumed by memoized children/effect deps — nothing else.",
      "> 500 rows → windowing (tanstack-virtual/react-window); constant DOM size.",
      "Route-level lazy + Suspense; below-fold = deferred always.",
      "Server components ship zero JS for static branches — the final performance lever.",
      "Every unstable reference past a memo = the whole memoization void.",
    ],
    recap: `React performance is identity management plus deletion: because React re-renders what references change, every fast app is a stable-identity regime of handlers and objects above memoized leaves, with windowing for bulk and lazy boundaries for depth — because the slowest component is the one that re-rendered for no reason at all; measure, dispose, stabilize, delete.`,
    code: {
      title: "One stable leaf",
      language: "tsx",
      code: "const onSelect = useCallback(selectRow, []);\nconst Row = React.memo(({ row, onSelect }) => <li onClick={() => onSelect(row.id)}>{row.name}</li>);",
      explanation:
        "Two declarations and the whole list skips when untouched rows exist.",
    },
    diagram: {
      title: "Render skip ladder",
      caption: "Prop identity equal → subtree skipped — every level is a gate.",
      mermaid: `flowchart LR\n  P[Parent render] --> C{Memo diff}\n  C -->|same props| S[Skip subtree]\n  C -->|diff| R[Re-render]`,
    },
  },
};
