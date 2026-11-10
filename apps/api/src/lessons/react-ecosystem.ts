import type { TopicLesson } from "../topicLessons.js"; /** * React Ecosystem — 8 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const reactEcosystem: Record<string, TopicLesson> = {
  "web-dev-react-ecosystem-react-fundamentals": {
    intro: `React is a library for building user interfaces from components — functions that take props and return UI — with state managed by hooks and rendered efficiently through reconciliation. The subject is the mental machine every React developer needs: rendering and re-rendering, props vs state, effects, refs, and keys. React is a declarative UI runtime where your UI is a function of state, and React decides how to get there.`,
    foundations: `Components are functions returning JSX (or trees of elements); elements are plain objects describing what to render. Rendering = calling the component and diffing the returned tree against the previous one. State (useState) is per component instance; props flow down one way; parent re-render re-renders children unless memoized. useEffect runs after the DOM commits and declares synchronization with external systems; its cleanup runs before re-running or unmounting. Keys identify identity in lists; refs hold mutable values that do not trigger renders; controlled inputs bind form values to state.`,
    concepts: [
      {
        title: "Rendering and re-rendering: what actually happens.",
        body: `On a state change, React schedules a re-render: it calls your component function again and compares the new output tree with the previous one; changes are committed as minimal DOM mutations. Re-renders produce new elements; the DOM only updates where the tree differs — you describe the desired UI, not the steps. Strict Mode double-renders in dev to surface impurities. Batching: state updates inside one event handler or promise microtask are batched into one render (React 18); updates in timeouts are batched too, so the render count stays predictable. Never mutate state; always produce a new value.`,
      },
      {
        title: "Props vs state; one-way data flow.",
        body: `Props are arguments injected into a component by its parent — read-only, versioned contracts; state is private data managed by the component. Data flows down; events flow up (callbacks). Lifting state: when siblings share data, move the state to their nearest common ancestor. If a component needs to mutate props, it is misdesigned; parent passes a new object or callback instead. Default prop values and destructuring with defaults keep signatures tidy; children as a prop (children) enables composition.`,
      },
      {
        title: "useEffect: synchronization, not lifecycle ceremony.",
        body: `Effects sync your component with an external system (network, DOM, subscription, timer) after commit. Anatomy: useEffect(() => { subscribe(); return () => unsubscribe(); }, [deps]) — deps decide when to re-sync; empty array = once on mount; no array = every render; cleanup runs before re-running and on unmount. Every effect is an eat-or-throw relationship: read-or-react to external state. Common bugs: missing deps (stale closures), missing cleanup (leaks), doing in effects what belongs in render (derived state) — derive with useMemo/plain computation instead.`,
      },
      {
        title: "Keys, refs, and controlled inputs.",
        body: `Keys tell React which array item is which across renders — use stable unique IDs, never array indices when items reorder; wrong keys produce ghost state (inputs showing wrong values after sort). Refs (useRef) hold mutable values for DOM nodes and imperative handles that must not trigger renders; forwardRef exposes a ref to the parent; useImperativeHandle narrows what the parent sees. Controlled inputs: value + onChange bound to state gives full control (validation, masking, formatting); uncontrolled inputs use defaultValue + a ref and read on submit — fine for simple forms when no per-keystroke logic is needed.`,
      },
      {
        title: "Context: dependency injection, not state management.",
        body: `Context passes values without threading props: const ThemeContext = createContext(default); Provider value={} wraps the tree; consumers useContext read it and re-render on any change of the value identity. Context is for low-frequency, broadly-needed data: theme, auth, locale, feature flags — not for chatty server states; every consumer re-renders when the context value changes, so split contexts by concern (ThemeContext vs AuthContext) or memoize the value object. Context does not replace state management; it is scoped dependency injection.`,
      },
    ],
    worked: [
      {
        title: "Fix a stale interval counter in a clock.",
        body: `Bug: useEffect(() => { const id = setInterval(() => setCount(count + 1), 1000); return () => clearInterval(id); }, []) — interval closes over count = 0 forever. Fix 1: setCount(c => c + 1) functional update. Fix 2: include count in deps — resets interval every tick (works but chatty). Anatomy: the closure captured the binding at creation time; functional updates read the latest state from the queue; the fix is semantic, not a lint silence.`,
      },
      {
        title: "Make a list survive sorting and filtering.",
        body: `Task list with search and drag-sort: key items by item.id, not index; inputs inside filtered rows keep their focus and values through reorders; when a new item is appended, React maps the new tree onto the old by key; deleting an item removes exactly its node. Bonus: React.memo the row component to skip re-rendering rows whose props did not change; combined with stable keys, sorting a 500-row list renders only the changed positions.`,
      },
      {
        title: "Refactor prop-drilling into context cleanly.",
        body: `Thread: App → Sidebar → NavItem each passing user and onLogout down 4 levels. Refactor: AuthContext = createContext; <AuthProvider> wraps App; NavItem reads const { user, logout } = useContext(AuthContext). Split contexts: AuthContext (user) and AuthActions (stable callbacks memoized with useCallback) so value changes rarely; document that context is for DI, not for high-frequency updates; keep server state in TanStack Query instead of context.`,
      },
    ],
    exam: [
      {
        question: "What does React do on a state update, at a high level?",
        answer:
          "It schedules a re-render: calls the component, diffs the new element tree against the old, and commits only the differences as DOM operations; batching collapses multiple updates in one task into a single render pass.",
      },
      {
        question: "Why are index keys dangerous in lists that reorder?",
        answer:
          "Keys define identity; index defines position; after a reorder, React maps old item N to new item M, reusing state incorrectly — inputs, focus, and animations attach to the wrong row; stable IDs keep identity with the data regardless of position.",
      },
      {
        question:
          "What is wrong with useEffect(() => { fetch(...) }, []) when you then read items to sort them for render?",
        answer:
          "Nothing inherently — fetching in an effect is correct — but sorting derived from items in another effect creates a second source of truth and an extra render; better: derive the sorted list with useMemo(items) directly in render; effects synchronize external systems, render derives UI.",
      },
      {
        question: "When should state live in Context instead of props?",
        answer:
          "When a value (theme, locale, auth, feature flags) is needed by many components across the tree at low frequency; props are still preferred for local data because they keep data flow explicit; high-frequency or selective updates belong in a store or query cache, not context.",
      },
    ],
    cheat: [
      "UI is a function of state; React reconciles trees.",
      "State local; props read-only; lift shared state up.",
      "useEffect = sync with external world; cleanup on re-run and unmount.",
      "Keys by stable id; refs for mutable non-render values.",
      "Controlled inputs: value + onChange; uncontrolled: defaultValue + ref.",
      "Context = DI for theme/auth/locale; split by concern; memoize value.",
      "Batching: one render per task; functional updates for latest state.",
      "Derive with render/useMemo; effect only for external sync.",
    ],
    recap: `React is a declarative runtime: you express the UI as a function of state, and React reconciles re-renders against the previous tree; props flow down, callbacks flow up; hooks manage state (useState), effects sync external systems with cleanup, refs hold imperative handles, context provides dependency injection; keys anchor identity in lists; and the render derives everything that can be derived, leaving effects to what truly is external.`,
    code: {
      title: "Controlled input with validation",
      language: "tsx",
      code: `const [email, setEmail] = useState('');\nconst valid = /.+@.+\\..+/.test(email);\n<input value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!valid} />`,
      explanation:
        "State holds the value; every keystroke re-renders with the new value; aria-invalid reflects validity; derived validation computed inline, never stored in state.",
    },
    diagram: {
      title: "One-way data flow",
      caption: "State flows down; events flow up.",
      mermaid: `flowchart TD\n P[Parent state] --> C1[Child A]\n P --> C2[Child B]\n C1 -->|callback| P`,
    },
  },
  "web-dev-react-ecosystem-react-architecture": {
    intro: `React architecture is how a large codebase stays navigable: feature-first folder ownership, composition over inheritance, custom hooks for shared logic, context for dependencies, server state in query caches, and error boundaries for blast-radius containment. The subject is the structure that keeps a hundred components coherent at scale — rather than the mechanics of any single one. architecture is the decisions that make change cheap.`,
    foundations: `Composition: build UIs by nesting components, not by inheritance; slots via children/props; render prop and compound components express variability. Custom hooks (use*) extract stateful logic into reusable functions with their own hooks. Feature folders: src/features/billing/{components,hooks,api,types} — colocated by domain, not by kind; shared/ for cross-cutting. Server state (data from APIs) belongs to TanStack Query or similar, not to useState/context. Error boundaries catch render-time errors in subtrees; Suspense handles async loading boundaries. Feature flags hide unfinished work.`,
    concepts: [
      {
        title: "Composition and custom hooks.",
        body: `Compose small components instead of parameterizing giant ones (<Card><Card.Header/><Card.Body/></Card> beats <Card title=... footer=... showIcon=... 12-variant props/>). Custom hooks package behavior: useSearch(query) returns debounced results and status; useLocalStorage(key, initial) persists and parses; useAuth() wraps context. Hooks share logic, components share JSX; neither shares via inheritance. Hooks must run unconditionally and in the same order; name public ones useXxx; keep internals in one feature folder; a good hook is a shipped feature, not plumbing.`,
      },
      {
        title: "Feature folders vs layer folders.",
        body: `Layer folders (components/, hooks/, pages/) scatter one domain's files across the tree — renaming "billing" touches ten folders. Feature folders colocate components, hooks, api clients, types, and styles per domain; shared/ holds generic primitives (Button, Modal). Import rules: features import shared/ and their own folder; cross-feature imports go through the public index, never reach into internals; dependency direction points inward toward shared primitives. Ownership per feature = PRs stay bounded, reviews stay local.`,
      },
      {
        title: "Server state vs client state.",
        body: `Distinguish: server state is remote, shared, and out of date the moment you fetch it — caching, invalidation, refetching, retries, deduping are its concerns; TanStack Query handles exactly this. Client state is ephemeral and local: form drafts, UI toggles, theme preference — useState/reducer or Zustand. Do not stuff server data into context or Redux without a reason; query cache gives you optimistic updates, background refetch, and garbage collection of stale entries for free. The split keeps mental models simple: render = f(clientState) + useQuery(serverState).`,
      },
      {
        title: "Error boundaries and graceful degradation.",
        body: `Errors in render propagate to the nearest error boundary, which catches them and replaces the subtree with fallback UI; without one, one bad component whitescreens the app. Boundaries around risky integrations (embeds, charts, payment widgets) isolate blast radius; log errors with context (Sentry); recovery via retry buttons or route boundaries. Suspense boundaries pair with lazy/data loaders; place them per feature so one slow widget does not block the page; boundaries are part of the architecture, not decoration.`,
      },
      {
        title: "Data fetching placement and route structure.",
        body: `Fetch as close to the data's consumer as is reasonable; parallelize with Promise.all or useSuspense; avoid waterfalls (component awaits before children start). In Next.js App Router, fetch in server components with caching directives; in client SPAs, use useQuery. Route boundaries define loading/error states per section. Prefetch on navigation triggers when predictable (hover, route enter). Cache keys encode identity (['user', id]); mutations invalidate exact keys, avoiding global refetch storms.`,
      },
    ],
    worked: [
      {
        title:
          "Extract a useDebounce hook from three duplicated implementations.",
        body: `Three search boxes each spelled out their own debounce with subtle differences — one leaked timeouts, one raced. Extract: function useDebounce(value, delay = 250) { const [debounced, setDebounced] = useState(value); useEffect(() => { const id = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(id); }, [value, delay]); return debounced; } — now one correct implementation, unit-tested; the search boxes share it; the fix propagates everywhere automatically; the codebase got smaller by deleting code.`,
      },
      {
        title: "Split a monolithic Dashboard into feature modules.",
        body: `Dashboard grew to 40 files in one folder. Restructure: features/billing/ (BillingPanel, useInvoices, billingApi), features/insights/ (charts, useMetrics), features/alerts/; shared/ui for primitives; each feature exports one index; the dashboard composes three <Section> boundaries with Suspense + error boundaries per feature; shipping the page now touches each feature independently; ownership assigned per feature; onboarding docs point at feature READMEs.`,
      },
      {
        title: "Replace context-held API data with TanStack Query.",
        body: `User profile was fetched in AuthContext on mount and stored in state; every consumer re-rendered; cache staleness handled manually with a refresh button. Migrate: useQuery(['me'], fetchMe, { staleTime: 60_000 }) in a useCurrentUser hook; mutations (update profile) invalidate ['me']; the context holds only session identity; the UI updates across the app instantly on edit; loading/error states are declarative; delete 150 lines of manual fetch/effect plumbing.`,
      },
    ],
    exam: [
      {
        question:
          "Why is feature-first folder structure preferred over type-first at scale?",
        answer:
          "Because change is local: a feature change touches one folder with its components, hooks, API and types, bounded by clear public boundaries; review, ownership and deletion become trivial, and features rarely collide; type-first scatters the domain across the tree, coupling every rename to every folder.",
      },
      {
        question: "What belongs in a custom hook vs a component?",
        answer:
          "Hooks encapsulate stateful behavior (subscriptions, timers, fetch logic, form state) that multiple components share; components render; when a component holds logic beyond layout, extract until components read as wiring plus JSX and hooks read as tested units of behavior.",
      },
      {
        question: "What does an error boundary catch and what does it not?",
        answer:
          "It catches errors thrown during render, lifecycle methods, and constructors of its subtree, replacing it with fallback UI; it does NOT catch async errors outside render (fetch rejections handled elsewhere), event handler exceptions, or errors in the boundary itself — handle those with query errors and try/catch.",
      },
      {
        question:
          "When should data live in the query cache instead of React state?",
        answer:
          "Remote, shared, cacheable data that benefits from deduping, background refresh, retries, stale-while-revalidate, and optimistic updates; local ephemeral UI state (input drafts, toggles) stays in React state; the two systems complement each other rather than compete.",
      },
    ],
    cheat: [
      "Composition > parameterization; children and slots over prop soup.",
      "Feature folders: colocated domain code, public index, inward dependencies.",
      "Custom hooks share logic; components render; test hooks directly.",
      "Server state → query cache; client state → React state or Zustand.",
      "Context = DI; memoize value; split by concern; avoid high-frequency data.",
      "Error boundaries isolate subtrees; Suspense per feature.",
      "Fetch near consumer; parallelize; stable query keys; invalidate precisely.",
    ],
    recap: `React architecture at scale is folder ownership by feature, composition over inheritance, hooks as the unit of shared behavior, query-managed server state distinct from client state, context for dependencies, and error/Suspense boundaries to contain failure and loading; structure code around domains, not kinds, and change becomes local, reviewable, and safe.`,
    code: {
      title: "A feature-scoped custom hook",
      language: "tsx",
      code: `export function useSearch(query: string) {\n const debounced = useDebounce(query, 250);\n return useQuery({ queryKey: ['search', debounced], queryFn: () => searchApi(debounced), enabled: debounced.length > 1 });\n}`,
      explanation:
        "Colocates debounce + fetch + cache key in one tested unit; components call useSearch(query) and get data, pending, error without plumbing; the cache key encodes the query.",
    },
    diagram: {
      title: "Feature module anatomy",
      caption: "Everything a domain needs, colocated.",
      mermaid: `flowchart TD\n D[Feature folder] --> C[Components]\n D --> H[Hooks]\n D --> A[API client]`,
    },
  },
  "web-dev-react-ecosystem-react-forms-and-validation-libraries": {
    intro: `React forms are where users meet your model of their data; validation libraries turn typing into either confidence or error messages that teach. The subject is building forms that validate honestly and accessibly — React Hook Form for performance and ergonomics, Zod for schemas shared between client and server, and patterns for async validation and error feedback. a form is a contract with the user, and the contract must be checked on both sides of the wire.`,
    foundations: `Controlled state per keystroke (re-render each change) vs uncontrolled with ref reads (fast, default in RHF). React Hook Form registers inputs (ref-managed), validates on submit/blur/change per rules, and returns errors, isSubmitting, handleSubmit. Zod defines schemas (z.string().email()) used for both client validation and server-side parsing; z.infer gives the static type. Validation timing: on error vs on blur vs on submit; async rules (unique username) need dedupe and cancellation. Accessible forms: labels associated (htmlFor/id), errors via aria-describedby, focus moved to first error, role="alert" for announcements, aria-invalid.`,
    concepts: [
      {
        title: "React Hook Form: uncontrolled speed with RHF ergonomics.",
        body: `RHF uncontrolled inputs avoid re-rendering per keystroke (values live in refs); register('email', { required: 'Required', pattern: { value: /.+@.+\..+/, message: 'Invalid email' } }); handleSubmit(onValid, onInvalid) gates submission; errors.email?.message renders inline; watch() subscribes to values selectively. Performance: field-level subscriptions, memoized components, mode: 'onBlur' for expensive validation. Large forms stay smooth because only errors/submits trigger renders, unlike controlled state which re-renders the whole form per key.`,
      },
      {
        title: "Zod schemas shared client and server.",
        body: `const Signup = z.object({ email: z.string().email(), password: z.string().min(8) }); type SignupInput = z.infer<typeof Signup>; — parse at the boundary (server: Signup.parse(body), returns typed data or throws ZodError → 400 with issues); on the client, zodResolver adapts the schema into RHF rules; one source of truth; types generated, not duplicated; messages centralized. Schema composition (pick, omit, extend, refine) builds variants: signup vs login vs profile update from one base.`,
      },
      {
        title: "Async validation and debounce.",
        body: `Unique-username/email checks must not fire per keystroke: debounce 300-500 ms, cancel stale requests (AbortController), treat race as normal (only the latest result counts), cache results, show inline pending state (spinner) without blocking typing. Server-side check is authoritative; the client is a UX courtesy. Avoid validating what the server will also reject — leak nothing about existence ("taken" reveals account existence; decide deliberately whether that matters for your threat model).`,
      },
      {
        title: "Accessible error reporting.",
        body: `Label every input (htmlFor/id); describe errors via aria-describedby="email-error"; set aria-invalid="true" on failure; put errors in role="alert" or aria-live="assertive" so screen readers announce them; move focus to the first invalid field on submit; disable submit while validating; keep error text human ("Enter your work email, like name@company.com" beats "invalid input"); color plus icon plus text, never color alone. Keyboard-only flows must reach every control and escape every error.`,
      },
      {
        title: "Form UX states: idle, submitting, success, failure.",
        body: `Disable the submit while submitting; show progress (spinner inside button; button label "Saving..."); on success, confirm visibly (toast + inline checkmark; clear or keep draft per context); on failure, preserve the entered data (never wipe), focus the error summary, and give a concrete retry path; optimistic UIs show pending success then reconcile. Network failure mid-submit: retry safely, warn about duplicates, offer idempotency. Forms are where trust is built or lost; honest state machines make them feel solid.`,
      },
    ],
    worked: [
      {
        title: "Wire Signup with RHF + Zod end to end.",
        body: `const schema = z.object({ email: z.string().email('Use work email'), password: z.string().min(8, 'At least 8 characters') }); useForm({ resolver: zodResolver(schema) }); <input {...register('email')} aria-describedby="email-error" />; {errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}; onValid posts to /api/signup; server re-parses with the same schema; 409 → setError('email', { message: 'Already registered' }) maps to field; success → redirect + toast. One schema, two sides, zero drift.`,
      },
      {
        title: "Debounced availability check for a username.",
        body: `const [status, setStatus] = useState('idle'); watch('username') with useEffect debounced 400 ms; AbortController per call; result feeds setStatus('available' | 'taken' | 'error'); inline icon spinner → green check or red x with message; server endpoint re-checks on submit authoritatively; the UI never blocks submit while pending unless you choose to (don't); stale responses discarded via the abort.`,
      },
      {
        title: "Convert a 300-line controlled form to RHF.",
        body: `Before: useState per field, giant handleChange switch, nested errors object, re-rendered on every keystroke, lag on mobile. After: register fields, rules from the shared schema, errors from RHF, isSubmitting for the button, watch only for the character count display; render count drops; validation messages unify with server parity; the form component shrinks to wiring; tests now target schema behavior (pure) instead of DOM choreography.`,
      },
    ],
    exam: [
      {
        question:
          "Why is zodResolver a better default than writing RHF rules by hand?",
        answer:
          "One schema drives client and server validation; rules live in one tested module; messages centralize; the static type comes from z.infer; changes apply everywhere; no drift between two hand-maintained rule sets.",
      },
      {
        question: "What are the three risks of naive async validation?",
        answer:
          "Request per keystroke hammering the server; stale-response races showing outdated results; and leaking existence information — all mitigated by debounce, abort/cancellation, and treating only the latest response as valid.",
      },
      {
        question: "Which ARIA attributes make form errors accessible?",
        answer:
          'aria-invalid="true" on the field; aria-describedby pointing to the error element; the error element carrying role="alert" or aria-live; a label associated via for/id; plus moving focus to the first invalid field on failed submit.',
      },
      {
        question: "Why preserve entered data after a failed submit?",
        answer:
          "Losing a filled form is a product failure, not a validation outcome; keeping entered values (RHF does by default) and focusing the error summary lets the user fix only what failed; wiping input destroys trust and forces full re-entry, which is worse than almost any error message.",
      },
    ],
    cheat: [
      "Uncontrolled + register: no per-keystroke re-render; validate on blur/submit.",
      "zod schema: one source client+server; z.infer for types; zodResolver for RHF.",
      "Debounce async checks 300-500ms; abort stale; latest wins.",
      "aria-describedby + aria-invalid + role=alert; focus first error.",
      "Errors in human language; color + icon + text.",
      "Disable submit while pending; preserve input on failure; confirm success.",
      "Server is the authority; client validation is courtesy.",
    ],
    recap: `Forms are contracts with users: React Hook Form keeps them fast via uncontrolled registration and declarative rules; Zod provides the single schema shared by client and server with inferred types; async validation is debounced, cancellable, and server-authoritative; accessible errors use associated labels, aria-describedby, role=alert and focus management; and every state — idle, submitting, success, failure — is honest and recoverable.`,
    code: {
      title: "RHF + Zod minimal form",
      language: "tsx",
      code: `const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });\n<input {...register('email')} aria-describedby="email-err" />\n{errors.email && <p id="email-err" role="alert">{errors.email.message}</p>}`,
      explanation:
        "register wires the field to RHF; zodResolver validates against the shared schema; errors drive accessible markup; isSubmitting disables the button during save.",
    },
    diagram: {
      title: "Form submit pipeline",
      caption: "Validate, submit, reconcile, report.",
      mermaid: `flowchart LR\n I[Input] --> V[Zod validate]\n V -->|ok| S[Submit]\n S -->|fail| E[Error summary]\n S -->|ok| D[Done]`,
    },
  },
  "web-dev-react-ecosystem-next-js": {
    intro: `Next.js is a React framework that ships production web apps with routing, rendering, and data fetching as first-class features; the App Router model composes Server Components, Server Actions, and streaming into one pipeline. The subject is how to structure and ship with it — layouts, caching, metadata, and deployment — rather than React basics again. Next.js turns React from a library you wire up into a framework where the defaults are production-ready.`,
    foundations: `App Router: file-system routing (app/route segments), layouts persist across navigation, loading.tsx streams Suspense fallbacks, error.tsx catches segment errors, not-found.tsx and route.ts are handlers. Server Components render on the server with zero client JS, can await data directly, and pass serializable props to Client Components (use client). Server Actions are RPC functions invoked from forms/events. Caching layers: request memoization, Data Cache (fetch caching), Full Route Cache (static), Router Cache (client). Metadata API exports titles/OG; generateStaticParams prerenders dynamic routes; deploys to Vercel or Node/standalone.`,
    concepts: [
      {
        title: "App Router architecture: layouts, segments, boundaries.",
        body: `app/ contains segments per route folder: page.tsx (UI), layout.tsx (shared shell preserving state), loading.tsx (instant Suspense fallback streamed while server renders), error.tsx (boundary with reset), template.tsx (re-mount boundary, rare), route.ts (API handler), default.tsx (parallel routes). Layouts nest: root layout mandates html/body; intermediate layouts wrap sections. Route groups ((marketing)) organize without URL impact; parallel routes (@modal) render multiple pages in slots. Colocation: each segment owns its loading/error states — the architecture ships resilience per route by construction.`,
      },
      {
        title: "Server Components vs Client Components.",
        body: `Server Components (default) run only on the server: zero JS, direct data access (DB, filesystem), streaming. Client Components opt in via 'use client' — they do hydrate and handle interactivity (hooks, events). Rule: push client boundaries as far down the tree as possible; keep pages/layouts as server components that fetch and pass data down; client islands handle the interactive 10-20%. Passing functions/classes as props to client components is illegal (non-serializable); pass data or event descriptors (actions) instead. Bundle win: heavy deps in server components never reach the browser.`,
      },
      {
        title: "Data fetching, caching, and revalidation.",
        body: `fetch in server components defaults to cached (Next 15: defaults to uncached per fetch — check version semantics); cache: 'force-cache' | 'no-store'; next: { revalidate: 60 } opts into ISR. Data Cache persists across requests/deploys; Full Route Cache stores prerendered HTML (static routes with no dynamic APIs); Router Cache caches visited segments client-side (instant back nav; bust via router.refresh() or action revalidation). revalidatePath('/billing') and revalidateTag('billing') invalidate after mutations; server actions pair naturally with revalidation to keep UI fresh.`,
      },
      {
        title: "Server Actions and mutation flows.",
        body: `Define async function updateProfile(formData) with 'use server'; wire to <form action={updateProfile}> or call inside transitions; the framework POSTs, runs the action (server-side), and re-renders the affected UI (with revalidation). Progressive enhancement: forms work without JS. Actions must validate input (zod) server-side — treat them as public endpoints; return structured results instead of throwing to the client when you want inline errors; optimistic UI via useOptimistic; combine with useFormStatus/pending for button states.`,
      },
      {
        title: "Metadata, SEO, and deployment.",
        body: `Metadata API: export const metadata = { title, description, openGraph } or generateMetadata({ params }) for dynamic pages; it emits correct tags without manual <Head>; robots.ts/sitemap.ts generate crawl rules and sitemaps; opengraph-image.tsx generates social cards at build. Deploy: Vercel (zero-config: preview per PR, analytics, edge network) or self-host with output: 'standalone' + node server.js, or Docker. Environment variables: NEXT_PUBLIC_ prefix exposes to browser; everything else is server-only; secrets never cross the boundary. Preview deployments are the review superpower: every PR is a shareable URL.`,
      },
    ],
    worked: [
      {
        title: "Server-rendered product page with ISR.",
        body: `app/products/[id]/page.tsx: export async function generateStaticParams (top 100 ids) → build-time prerender; page fetches the product API with next revalidate 300; export async function generateMetadata pulls title, description and OG; the page renders fully server-side with zero client fetch; a small AddToCartButton ('use client') hydrates for interactivity; LCP excellent (static), TTFB fine, SEO complete via metadata; stale-while-revalidate keeps it fresh every 5 minutes.`,
      },
      {
        title: "Mutation with Server Action + optimistic UI.",
        body: `actions.ts: 'use server'; export async function toggleLike(id) { auth(); db.likes.toggle(id); revalidatePath('/posts/' + id); } — client: const [optimistic, addOptimistic] = useOptimistic(likes, (state, delta) => state + delta); <button onClick={() => startTransition(async () => { addOptimistic(+1); await toggleLike(id); })}> — instant feedback; server confirms and revalidates; failure rolls back on next render; no client cache plumbing required.`,
      },
      {
        title: "Split a page into server and client islands.",
        body: `Dashboard: page.tsx (server) fetches invoices and metrics; renders header + <InvoiceTable data={invoices} /> (server, zero JS) + <InvoiceActions /> (client; filters via URL search params); <FilterPanel /> client island syncs ?status=open to the server-rendered table through links; no client data fetching at all; client JS ships ~12 KB instead of 180; the table updates from server on navigation; interactivity localized exactly where the user touches it.`,
      },
    ],
    exam: [
      {
        question:
          "What problem do layouts solve that plain nested components do not?",
        answer:
          "They persist across navigation within their segment — state and DOM survive route changes (no remount, no flash), loading and error boundaries are declarative per segment, and shared chrome (nav, sidebars) is expressed once per level of the hierarchy instead of re-rendered per page.",
      },
      {
        question: "Why push client boundaries to the leaves of the tree?",
        answer:
          "Server Components ship zero JavaScript and fetch data directly; moving use client down keeps heavy logic and dependencies off the wire, preserves server rendering benefits (streaming, caching, SEO), and confines hydration cost to the interactive islands only.",
      },
      {
        question: "What invalidates the client Router Cache after a mutation?",
        answer:
          "revalidatePath/revalidateTag in the action (or a full data refetch); the router then re-fetches affected segments on next visit — otherwise users see stale client-side cached routes until a hard navigation or a new visit.",
      },
      {
        question:
          "How do Server Actions change form submission security considerations?",
        answer:
          "They are public HTTP endpoints; every action must authenticate, authorize, and validate input server-side (zod/schema), assume the client can be bypassed, and never trust client-computed state; treat them like any API route, not like private functions.",
      },
    ],
    cheat: [
      "App Router: file routing; layout persists; loading/error per segment.",
      "Server Components default; zero JS; fetch direct; serializable props.",
      "use client for interactive islands; minimal, at the leaves.",
      "Revalidate via revalidatePath/Tag after mutations.",
      "Metadata API for SEO; sitemap.ts/robots.ts; standalone for self-host.",
      "NEXT_PUBLIC_ = browser-visible; everything else server-only.",
      "Server Actions = public RPC; always validate + authserver-side.",
    ],
    recap: `Next.js App Router composes server-first rendering (layouts, Server Components, streaming) with minimal client islands (interactivity), explicit caching and revalidation, Server Actions for mutations with progressive enhancement, and file-based routing with per-segment loading and error boundaries; metadata and deployment (Vercel or standalone) are first-class; the skill is keeping the client boundary as small as it can be.`,
    code: {
      title: "A server page with client island",
      language: "tsx",
      code: `export default async function Page() {\n const data = await fetch('/api/stats', { cache: 'no-store' }).then(r => r.json());\n return (<main><Stats data={data} /><AddButton /></main>);\n}`,
      explanation:
        "Page renders on the server with fresh data; Stats prints without JS; AddButton (use client) hydrates for interaction; the server ships an HTML shell with a small client island.",
    },
    diagram: {
      title: "Request flow with islands",
      caption: "Server renders shell; client hydrates islands.",
      mermaid: `flowchart LR\n C[Client request] --> S[Server render]\n S --> H[HTML + islands]\n H --> I[Islands hydrate]`,
    },
  },
  "web-dev-react-ecosystem-state-and-data-libraries": {
    intro: `State and data libraries decide where your data lives between renders and across the network: query caches for server state, tiny stores for client state, and the URL as the ultimate shareable state. The subject is choosing and wiring them — TanStack Query for fetching/caching/invalidation, Redux Toolkit or Zustand for client state, URL state for navigable state, and optimistic updates for perceived speed. most state bugs are architecture bugs — data in the wrong place with the wrong guarantees.`,
    foundations: `Server state (remote, shared, stale-able): caching, retries, invalidation in the query layer; client state (ephemeral, local): React state, context, or a store. TanStack Query: query keys, staleTime, gcTime, refetch triggers, mutation + invalidate flow. Zustand: minimal store, selectors, no provider needed. Redux Toolkit: slices, immer reducers, typed hooks, middleware; great for complex state logic. URL state: useSearchParams — shareable, bookmarkable, server-renderable. Optimistic updates: update cache immediately, reconcile on success/failure. Invalidate precisely; avoid refetch storms.`,
    concepts: [
      {
        title: "TanStack Query mental model.",
        body: `useQuery({ queryKey: ['todos', { status }], queryFn: () => fetch(...) }) — keys are identity; a change = new query or refetch; staleTime marks data fresh (no auto refetch) vs stale (background refetch on mount/focus); gcTime retains unused cache entries (default 5 min); placeholderData and keepPreviousData smooth transitions; select transforms without refetching. Mutations: useMutation({ mutationFn: createTodo, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }) }) — server state stays consistent by invalidation, not by prop drilling or manual refresh buttons.`,
      },
      {
        title: "Invalidations and optimistic updates.",
        body: `Invalidation should be targeted: invalidate the exact key(s) that changed, not the whole client; broad invalidation (invalidateQueries()) causes background refetch avalanches. Optimistic updates: onMutate writes the new cache value, keeps the old one for rollback; onError restores; onSettled invalidates. Use for high-frequency UI (likes, toggles, list CRUD). Persist caches across reloads with persistQueryClient when appropriate (long-lived read-only data); never optimistic-update without rollback — silent inconsistency is worse than a spinner.`,
      },
      {
        title: "Zustand for client state.",
        body: `const useStore = create((set, get) => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) })); — tiny API; selectors (useStore(s => s.count)) subscribe components to slices; no provider needed (module singleton) unless you want scoped instances; middleware for persistence (persist). Great for UI state, preferences, cross-component events. Avoid shoving server data into it — that is the query layer's job; mixing roles creates two sources of truth to synchronize by hand.`,
      },
      {
        title: "Redux Toolkit when state logic gets serious.",
        body: `RTK slices: createSlice({ name, initialState, reducers: { inc } built with immer produce syntax }); configureStore with typed hooks (useAppDispatch/useAppSelector); middleware for thunks/sagas for async. RTK shines with complex derived logic, undo/redo, offline sync engines, and large teams needing predictable patterns + DevTools time-travel. Its cost is ceremony; skip it for small apps. RTK Query handles server state too — still, prefer TanStack Query for fetching alone unless you want one tool.`,
      },
      {
        title: "URL as state: shareability and deep links.",
        body: `Search params are state with superpowers: bookmarkable, shareable, refreshable, server-renderable, back-button-correct. Filters, pagination, selected tab, search query belong in the URL; components read via useSearchParams and navigate via router.replace (no history spam per keystroke) or router.push (when it should undo-able). Debounced writes; typed parsing; fallback defaults. State split heuristic: URL for anything the user would copy and paste to a colleague; store for the rest.`,
      },
    ],
    worked: [
      {
        title: "Convert manual fetch logic to useQuery + invalidation.",
        body: `Before: useEffect + useState for users and loading and errors; manual refetch after create; race conditions on unmount; duplicate fetches in two sibling components (both useEffect-fetched). After: useQuery(['users'], fetchUsers) shared via module-level queryClient — both siblings read cache, dedupe one request; createTodo mutation invalidates ['users']; background refetch syncs everyone; loading states handled by isLoading vs isFetching; error boundaries for failures; 60 lines deleted, correctness up.`,
      },
      {
        title: "Add optimistic toggle to a like button.",
        body: `useMutation({ mutationFn: toggleLike, onMutate: async (id) => { await queryClient.cancelQueries({ queryKey: ['post', id] }); const prev = queryClient.getQueryData(['post', id]); queryClient.setQueryData(['post', id], (p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) })); return { prev }; }, onError: (_e, _v, ctx) => queryClient.setQueryData(['post', _v], ctx.prev), onSettled: () => queryClient.invalidateQueries({ queryKey: ['post', _v] }) }) — instant flip; rollback on error; server truth restored on settle.`,
      },
      {
        title: "Move filter state into the URL.",
        body: `Dashboard filters (status, date range, query) were useState — refreshing lost everything, links were useless. Refactor: useSearchParams; onChange navigate('?status=open&q=refund', { replace: true }) with 250 ms debounce; initial render reads params (server-renderable in Next); share links restore exact views; back button steps through filter history naturally; the store became thinner and the product more shareable.`,
      },
    ],
    exam: [
      {
        question: "What does queryKey identity control?",
        answer:
          "Everything: it names the cache entry; identical keys dedupe fetches, share data across components, control invalidation targeting, and drive stale/background behavior; a small key change (e.g., { status } inside) forks a separate cache namespace.",
      },
      {
        question:
          "Why prefer invalidation over manual cache writes for mutations?",
        answer:
          "Manual writes risk drift between cached shape and server reality; invalidation refetches from the authority — simpler, always correct — at the cost of one refetch; targeted invalidation keeps the refetch bounded.",
      },
      {
        question: "When is Zustand a better fit than Redux Toolkit?",
        answer:
          "Small-to-medium apps needing a tiny API, selector-based subscriptions, no provider, and minimal ceremony; Zustand excels for UI and preferences; Redux Toolkit when state logic complexity, offline flows, undo, or team conventions demand slices, DevTools, and middleware structure.",
      },
      {
        question: "Which state belongs in the URL and why?",
        answer:
          "Anything worth sharing or restoring: active filters, search queries, pagination, selected tabs; URL state makes views bookmarkable, refresh-safe, and server-renderable, and the back button works naturally; transient and private UI state stays in memory.",
      },
    ],
    cheat: [
      "Server state → query cache (TanStack Query); client state → stores.",
      "Keys are identity; staleTime fresh vs background refetch.",
      "Mutations invalidate targeted keys; avoid global invalidate storms.",
      "Optimistic: cancel, snapshot, set, rollback on error, settle-invalidate.",
      "Zustand: selectors + module singleton; Redux Toolkit for complex logic.",
      "URL state: useSearchParams; debounce; replace vs push; typed parsing.",
      "Never duplicate server truth in client state stores.",
    ],
    recap: `State libraries exist to classify and own data: query caches own server truth with keys, staleness, invalidation and optimistic flows; Zustand and Redux Toolkit own client truth with selectors and reducers; URLs own shareable view state; the discipline is assigning each piece of state exactly one owner with the right guarantees, and deleting every hand-rolled sync mechanism.`,
    code: {
      title: "Optimistic toggle skeleton",
      language: "tsx",
      code: `const mutation = useMutation({ mutationFn: like, onMutate: async (v) => { await qc.cancelQueries({ queryKey: key }); const prev = qc.getQueryData(key); qc.setQueryData(key, updater); return { prev }; } });`,
      explanation:
        "The three incantations every optimistic update shares: cancel in-flight, snapshot previous, set optimistic; error handler restores; settle invalidates; rollback is two lines.",
    },
    diagram: {
      title: "Two kinds of state, two owners",
      caption: "Server truth vs client truth.",
      mermaid: `flowchart LR\n SV[Server] --> Q[Query cache]\n Q --> C1[Components]\n ST[Client state] --> C2[Components]`,
    },
  },
  "web-dev-react-ecosystem-ui-systems-and-design-engineering": {
    intro: `UI systems and design engineering is where design systems become shipped code: Tailwind for pragmatic styling, Radix for unstyled accessible primitives, shadcn/ui for copy-in components, and tokens for the source of truth. The subject is building a component layer that is accessible, composable, and beautiful without a framework getting in your way — plus the QA discipline (visual regression, tokens audits) that keeps it honest. a good UI system makes the right thing the easy thing.`,
    foundations: `Radix primitives: headless, accessible behavior (focus, keyboard, aria) with zero styles; you style with Tailwind or CSS. shadcn/ui: copy-in, composable components built on Radix + cva (class variance authority) — you own the code, not a dependency. Tailwind: utility-first, consistent scale, co-located styles, JIT; organize with @layer components for repeated patterns; design tokens as Tailwind theme extensions (colors, spacing, fonts) so utilities read like the system. Accessibility: Radix handles most; verify focus-visible, keyboard escape/traps, contrast; visual regression via Storybook + Chromatic or Playwright screenshots.`,
    concepts: [
      {
        title: "Headless primitives and the component API contract.",
        body: `Radix gives behavior (Dialog: focus trap, escape close, aria-modal, scroll lock; Popover: toggle, dismiss, collision) — you supply CSS. Component APIs should follow patterns: controlled vs uncontrolled (open/defaultOpen), composition via children (Dialog.Root/Trigger/Content) or slots, forwardRef everywhere, cva for variants (size, tone, variant), asChild for render composition (Slot merges props into child). Good APIs minimize ceremony: <Button variant="danger" size="sm"> reads like intent, not like DOM archaeology.`,
      },
      {
        title: "Tailwind strategy: utilities plus layered components.",
        body: `Utilities keep styles adjacent to markup; avoid anonymous class soup by extracting repeated strings into components (@layer components .card { @apply rounded-lg p-4 ... } when genuinely reused). Design tokens (colors: surface, border, accent; spacing; radii) live in tailwind.config theme extension — utilities then say bg-surface, text-muted, border-line, not hex codes. Arbitrary values (w-[37px]) signal missing tokens; promote recurring ones into theme. Keep content scanning configured; purge removes unused CSS; dark: variant swaps under a class or media query.`,
      },
      {
        title: "shadcn/ui and copy-in ownership.",
        body: `shadcn/ui is not an npm dependency — the CLI copies accessible component source into your repo; you own and edit it. Advantages: full control (no version lock, no monkey-patching), guaranteed a11y from Radix, consistent cva patterns. Costs: you must maintain local copies; drift across apps needs a design-system repo or package extraction when scale demands. Workflow: npx shadcn add button dialog; review the source; customize tokens and variants; keep a components.json sync for future adds.`,
      },
      {
        title: "Tokens wiring: theme as single source.",
        body: `Define semantic tokens in tailwind theme (surface, surfaceRaised, text, textMuted, border, accent, danger); components consume utilities generated from tokens; Style Dictionary (or plain CSS variables) keeps native/web in lockstep; Storybook documents variants with side-by-side themes; ESLint/Strictmode rules ban raw hex in components. The payoff: a re-theme is a config diff, not a 600-file find-replace.`,
      },
      {
        title: "Visual QA and regression gates.",
        body: `Visual regression catches what unit tests ignore: layout breaks, wrong colors, missing states. Storybook isolates every component + state; Chromatic/Playwright screenshot diffs fail PRs on unintended visual changes; review diffs deliberately. Also audit runtime: contrast checks via axe in Storybook, focus ring visibility, disabled/loading/empty states per component; test in dark theme; test at 320 px; test with long localized strings. Design engineering is 50% building and 50% proving it still looks right after every change.`,
      },
    ],
    worked: [
      {
        title: "Build a Button with cva variants, accessible by construction.",
        body: `const button = cva('inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none', { variants: { intent: { primary: 'bg-accent text-on-accent hover:bg-accent-hover', ghost: 'hover:bg-surface-hover', danger: 'bg-danger text-on-danger hover:bg-danger-hover' }, size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' } }, defaultVariants: { intent: 'primary', size: 'md' } }); — one cva maps intents × sizes; focus-visible ring always present (never outline-none without replacement); danger is a token role, not a color; tests assert class output per variant; a11y inherited from focus and contrast decisions.`,
      },
      {
        title: "Ship a Dialog that traps focus and restores it.",
        body: `Radix Dialog: <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay /><Dialog.Content aria-describedby={descId}><Dialog.Title>..</Dialog.Title>...<Dialog.Close asChild><Button variant="ghost">Close</Button></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root> — focus trap, escape, aria-modal, scroll lock free; your job: overlay click-to-close choice, max-height with internal scroll on small screens, and contrast-checked title/description text.`,
      },
      {
        title: "Add dark theme without touching components.",
        body: `Define tokens in tailwind theme: surface: 'var(--surface)', text: 'var(--text)', accent: 'var(--accent)' with :root and [data-theme="dark"] values; every utility class (bg-surface, text-muted) resolves through the variable; flip one attribute; verify all component states both themes (disabled text contrast, borders visible); screenshot diff proves zero visual regressions outside intentional changes; document token contract for contributors.`,
      },
    ],
    exam: [
      {
        question:
          "Why start from headless Radix primitives instead of a styled library?",
        answer:
          "They encode hard-won a11y behavior (focus management, keyboard, aria) and zero styling opinions, so your design system stays consistent with your tokens instead of fighting a stranger's theme; you own the look, they guarantee the interaction contract.",
      },
      {
        question: "What does cva buy you in a component API?",
        answer:
          "A single typed function mapping variant props to resolved class sets — declarative variants instead of ternary soup, type-safe variant combinations, and one testable seam for all visual branches of the component.",
      },
      {
        question: "When does @layer components make sense in Tailwind?",
        answer:
          "For repeated utility clusters that form a real component — cards, inputs, page shells — where a named class reduces duplication; not for one-off layouts (utility-first is the point); extract only when the same recipe appears in multiple places.",
      },
      {
        question:
          "What does visual regression testing catch that unit tests cannot?",
        answer:
          "Layout and appearance drift: spacing shifts, color regressions, missing responsive rules, z-index collisions, font fallback changes — things with no logic to assert but every pixel of user impact; snapshot diffs in CI gate them like code review gates logic.",
      },
    ],
    cheat: [
      "Radix = headless a11y behavior; you own style.",
      "shadcn/ui = copy-in ownership; review before committing.",
      "cva for typed variants; asChild/Slot for composition.",
      "Tokens in theme; utilities say surface/accent, not hex.",
      "Never outline-none without a replacement focus ring.",
      "Storybook isolates states; screenshot diffs gate PRs.",
      "Dark theme via one attribute + token swap; audit both themes.",
    ],
    recap: `UI systems are engineering the consistency layer: headless accessible primitives (Radix) for behavior, Tailwind for pragmatic utility styling wired to semantic tokens, cva for typed variants, shadcn/ui when you want owned component source, and Storybook with visual diffs to prove the system holds after every change; the goal is the right component, the right states, the right contrast — every time, without heroics.`,
    code: {
      title: "Button with cva and tokens",
      language: "tsx",
      code: `const button = cva('rounded-md font-medium transition-colors', {\n variants: { intent: { primary: 'bg-accent text-on-accent', ghost: 'hover:bg-surface-hover' } },\n});`,
      explanation:
        "One typed variant map powers the whole button family; adding size/tone costs one object; classes reference tokens, not hex; components stay declarative.",
    },
    diagram: {
      title: "Design engineering stack",
      caption: "Tokens feed utilities feed components.",
      mermaid: `flowchart LR\n T[Tokens] --> TW[Tailwind theme]\n TW --> C[Components]\n C --> SB[Storybook QA]`,
    },
  },
  "web-dev-react-ecosystem-advanced-react-patterns": {
    intro: `Advanced React patterns are the idioms components reach for when primitives like props and state are not enough: compound components, render props, headless UI, portals, and polymorphic APIs. The subject is when and how to deploy them — and when a simpler alternative beats them — so the codebase gets expressive rather than baroque. patterns are vocabulary for communicating with future maintainers, not trophies for cleverness.`,
    foundations: `Compound components: a family sharing implicit context (Select.Root/Trigger/Content/Item) — flexible composition, shared state via context; render props: children as function receiving state/handlers; headless UI: behavior + a11y without styles; portals: render outside parent DOM subtree (modals, tooltips); polymorphic as/prop: one component renders many element types with correct typing; slots: named children for multiple content regions; hooks over HOCs — higher-order components are legacy; custom hooks+composition cover the same ground.`,
    concepts: [
      {
        title: "Compound components with implicit context.",
        body: `API: <Select value={v} onChange={...}><Select.Trigger>Label</Select.Trigger><Select.List><Select.Item value="a">A</Select.Item></Select.List></Select> — children share state via internal context; consumers never wire props; adding items reorders freely; styling per subcomponent stays independent. Design notes: static subcomponents (Select.Trigger not SelectTrigger), context typed strictly, controlled + uncontrolled both supported, roving tabindex for keyboard nav. Compound is the right fit for dropdowns, tabs, accordions, radio groups — family-like APIs.`,
      },
      {
        title: "Render props and children-as-function.",
        body: `A component passes its internal state/handlers to a function child: <DataLoader url="/api">{(data, { loading, error, refetch }) => loading ? <Skeleton/> : <List rows={data}/>}</DataLoader> — inversion of control without new components; the parent decides presentation. Modern equivalent: hooks returning the same tuple (useFetch) — render props remain idiomatic for headless UI and libraries where rendering must stay inside the package. Prefer hooks for your own app code; render props when the component must own the lifecycle.`,
      },
      {
        title: "Headless UI vs styled libraries.",
        body: `Headless (Radix, React Aria, downshift) = behavior + accessibility, no styles; perfect when your design system defines the look — each part is restyled to tokens. Styled-component libraries = look + behavior opinionated; faster start, fights your brand eventually. Choose headless for product surfaces, styled kits for internal tools with standard visuals. Either way: verify the aria wiring and keyboard flows yourself with tests — a11y regressions hide in library upgrades.`,
      },
      {
        title: "Portals for overlays.",
        body: `createPortal(<Modal/>, document.body) renders outside the parent subtree — escapes stacking contexts, overflow clipping, and z-index wars; overlay interactions need: focus trap, escape to close, scroll lock, aria-modal, restore focus on close. Portals reorder the DOM but events still bubble through the React tree, so context and state keep working. Use portals for modals, popovers, tooltips, toast containers; never portals for ordinary layout — they break visual hierarchy of the tree and complicate testing.`,
      },
      {
        title: "Polymorphic components and the as prop.",
        body: `A Button that renders <button>, <a>, or Link with correct props and types: <Button as="a" href="/docs"> or <Button as={Link} to="/docs">; implementation via ElementType + generic props (PropsOf<'a'> | PropsOf<Link>); typed union though inference is imperfect — keep three allowed tags rather than open ElementType to preserve sanity. Polymorphism is for semantic variants of one behavior; do not use it to make Button into everything — semantic overload makes maintenance miserable; when in doubt, separate components.`,
      },
    ],
    worked: [
      {
        title: "Build an accordion as compound components.",
        body: `<Accordion defaultValue="a"><Accordion.Item value="a"><Accordion.Trigger>Title</Accordion.Trigger><Accordion.Content>Body</Accordion.Content></Accordion.Item></Accordion> — Accordion provides context { value, toggle, open }; Trigger renders button with aria-expanded/aria-controls; Content sets hidden + regions; roving focus; internal state uncontrolled with optional controlled props; adding animation is a Content styling concern (grid-rows trick); subcomponents stay small and re-orderable.`,
      },
      {
        title: "Refactor a render-prop loader to a hook.",
        body: `Before: <Fetch url userId>{(user, s) => ...}</Fetch> — nested, awkward in terse trees. After: const { data: user, isLoading, error, refetch } = useUser(userId); if (isLoading) return <Skeleton/>; if (error) return <ErrorState onRetry={refetch}/>; return <Profile user={user}/>; — the hook shares logic with other consumers (chart + profile both need user), tests target it directly, and the tree stays flat; render props survive in headless libs, not in app code.`,
      },
      {
        title: "Portal a confirm dialog with focus restoration.",
        body: `<Dialog> triggered from a table row button; createPortal to body; on open, focus first field; Escape closes; on close, focus returns to the triggering button (document.activeElement captured before open, restored after unmount); scroll lock via overflow hidden on html; aria-modal and labelledby from Dialog primitives; the table underneath never re-renders; DOM order divorced from visual order handled by portals deliberately.`,
      },
    ],
    exam: [
      {
        question: "What problem do compound components solve?",
        answer:
          "Flexible, reordering-tolerant composition for families of related parts (Select, Tabs, Accordion) sharing implicit state without prop drilling; consumers compose the layout freely while the component owns behavior and a11y.",
      },
      {
        question: "Why keep portals for overlays rather than all components?",
        answer:
          "Overlays must escape clipping, stacking contexts and z-index traps while events still bubble up React tree; overusing portals fragments DOM structure, complicates testing, and breaks spatial expectations of the tree — overlays are exactly the case where the exception earns its keep.",
      },
      {
        question: "What is a polymorphic as prop and when is it appropriate?",
        answer:
          "A prop letting one component render different element types (button vs anchor vs router Link) with type-correct props; appropriate for semantic variants of a single behavior with finite, known element set; open-ended polymorphism becomes untypeable and unmaintainable.",
      },
      {
        question:
          "When do you choose headless UI over rebuilding behavior yourself?",
        answer:
          "When a11y behavior is non-trivial (focus traps, keyboard nav, roving tabindex, screen-reader semantics): reimplementing is error-prone and slow; headless libraries ship tested contracts; verify with your own tests anyway, especially around library majors.",
      },
    ],
    cheat: [
      "Compound components: implicit context family APIs (Select, Tabs, Accordion).",
      "Render props: children as function; hooks are the app-code equivalent.",
      "Headless = behavior not styles; build style on top with tokens.",
      "Portals for modals/popovers; escape stacking and clipping; keep events flowing.",
      "as prop: finite semantic variants only; closed set of tags.",
      "custom hooks + composition > HOCs in modern code.",
      "Every pattern must read simpler after, not fancier.",
    ],
    recap: `Advanced patterns extend React's composition vocabulary: compound components build family APIs on shared implicit context; render props (and their modern hook form) invert control; headless libraries supply tested behavior you restyle; portals rescue overlays from stacking hell; polymorphic elements serve finite semantic variants — deploy each where it removes friction, not where it demonstrates cleverness; the yardstick is always readability for the next maintainer.`,
    code: {
      title: "Minimal compound Select",
      language: "tsx",
      code: `const Select = ({ children, value, onChange }) => <SelectCtx.Provider value={{ value, onChange }}>{children}</SelectCtx.Provider>;\nSelect.Item = ({ value: v, children }) => <li onClick={() => ctx.onChange(v)}>{children}</li>;`,
      explanation:
        "Parent shares state; items consume context; consumer composes the markup; adding an Item never changes the parent API — the pattern scales without prop growth.",
    },
    diagram: {
      title: "Compound component anatomy",
      caption: "Shared context, composed parts.",
      mermaid: `flowchart TD\n R[Select.Root] --> P[Trigger]\n R --> L[List]\n L --> I[Item]`,
    },
  },
  "web-dev-react-ecosystem-react-performance-optimization": {
    intro: `React performance optimization is the discipline of making updates cheap and visible — fewer re-renders, cheaper commits, and fast perceived load. The subject is the toolkit: memoization (useMemo, useCallback, React.memo), virtualization of long lists, code splitting, suspense boundaries, and profiling to find the actual bottleneck before touching anything. optimize the verified slow part, not the suspicious-looking code.`,
    foundations: `Re-render = component call + reconciliation; cheap for small trees, expensive for big ones. React.memo skips rendering when props are referentially equal; useMemo caches computed values; useCallback caches function identity. memo is only as strong as prop stability — inline object/array/function props defeat it. Long lists: virtualize (react-window, @tanstack/virtual) to render only visible rows. Code splitting: lazy()+Suspense per route/heavy widget; prefetch on intent. Profiling before optimizing: React DevTools Profiler, why-did-you-render, flamegraphs; INP is the field metric to move.`,
    concepts: [
      {
        title: "Memoization that actually works.",
        body: `React.memo on a pure leaf component; props must stay stable: memoize callbacks (useCallback) and objects (useMemo) at the parent; primitives and stable references pass free. useMemo for expensive derived values (filter/sort of big lists) and for referential identity handed to memoized children; do not memoize cheap values (addition). measure: Profiler commit count per state change; remove memos with no measurable effect — they cost complexity and can hide bugs (stale closures). Memo is a scalpel, not seasoning.`,
      },
      {
        title: "Virtualization for long lists.",
        body: `Render only what is visible: react-window (FixedSizeList) or @tanstack/virtual — a 50,000-row table shows ~20 rows + overscan; scroll position drives rendering. Cost model: items must have known or measured heights (variable-size rows need measurement caches or estimates); accessibility: manage focus across rows carefully (aria-rowindex); keyboard nav needs custom handling; SSR: server renders a placeholder or first N rows. When virtualization feels heavy, first reduce data (pagination, pagination server-side) — infinite scroll of 10k items is still an app decision.`,
      },
      {
        title: "Code splitting and Suspense boundaries.",
        body: `lazy(() => import('./HeavyChart')) loads on demand; Suspense shows fallback while loading; boundaries per section keep one slow import from blocking the page; error boundaries per section localize failure. Route-level splitting is table stakes; widget-level splitting (charts, editors, maps) drives big wins on heavy pages; prefetch on hover/intent (import() in mouseenter) hides latency for predictable navigations; shared chunks dedupe the vendor bundle; webpack/vite analyze for accidental duplicates (two lodash copies after mixed ESM/CJS).`,
      },
      {
        title: "Analyzing re-render storms.",
        body: `Symptoms: typing lags, animations stutter, INP > 200 ms. Diagnose: React DevTools Profiler (record renders, see columns for components re-rendered per commit); why-did-you-render logs each re-render with cause; usually the culprit chain is: context value identity changes every render → 200 consumers re-render → new inline props defeat memo. Fixes: memoize context value, split contexts, move state down toward consumers, selector subscriptions, and colocate high-frequency state. Fix the cause, not the symptom.`,
      },
      {
        title: "Perceived performance and loading UX.",
        body: `Users feel speed, not benchmarks: skeleton screens for pending content, optimistic updates for writes, streaming server rendering for fast first bytes, route prefetch, prefetching critical chunks on idle, content-visibility: auto for long offscreen sections. Measure LCP, INP, CLS in the field (web-vitals library to analytics); regression budgets in CI for bundle size (budget 200 KB initial JS); a fast app is also one that never ships unnecessary code — measure, delete, measure again.`,
      },
    ],
    worked: [
      {
        title: "Fix a typing-lag table with memo + stable keys.",
        body: `Profile showed every keystroke re-rendered all 2,000 rows (inline style object prop). Fix: extract Row = memo(RowInner); stabilize props (useCallback for onSelect, useMemo for rowStyle or class constants); parent derives visible slice via useMemo from the filter string; result: keystroke re-renders only the ~15 visible rows; INP drops from 340 ms to 40 ms; the memos survive review because they have a measured justification.`,
      },
      {
        title: "Virtualize an infinite feed.",
        body: `Feed renders 5,000 posts; scroll janks to 20 fps. @tanstack/virtual: const virtualizer = useVirtualizer({ count, getScrollElement: () => ref.current, estimateSize: () => 240, overscan: 5 }); map virtualItems to absolutely positioned articles at translateY(index * size); dynamic heights via measureElement; resize observer for late images; list now renders ~8 items regardless of feed length; memory flat; smooth on low-end phones.`,
      },
      {
        title: "Ship a dashboard 40% lighter with splitting.",
        body: `Bundle analyzer showed 1.8 MB initial JS including charting (400 KB), editor (300 KB). Actions: route-level lazy for analytics page; charts/editor behind Suspense with skeleton fallbacks; prefetch analytics chunk on nav hover; drop duplicate date-fns by aligning package versions; add bundle-size budget check in CI (fail > 500 KB); initial load 1.8 MB → 1.1 MB; mobile LCP 4.2 s → 2.4 s; INP unaffected because heavy widgets mount later.`,
      },
    ],
    exam: [
      {
        question: "Why does React.memo sometimes not prevent re-renders?",
        answer:
          "Props referentially change every render — inline objects, arrays, or callbacks — so shallow equality always fails; memoizing the unstable props at the parent (useMemo/useCallback) is what restores the memo contract; primitives always pass.",
      },
      {
        question: "When is virtualization the right answer for a list?",
        answer:
          "When rows are many (hundreds+), rendering cost is real, and scroll performance sags; with fixed or estimable heights to position rows; when pagination or server-side windowing is infeasible; and with deliberate keyboard/SSR handling — otherwise paginate or reduce data first.",
      },
      {
        question: "What is the first step before applying any memo?",
        answer:
          "Profile: React DevTools Profiler to see which components re-render per commit and why-did-you-render to log causes; optimize the measured chain, usually context identity, inline props, or lifted state, not the symptom.",
      },
      {
        question: "How do Suspense and code splitting interact?",
        answer:
          "lazy-loaded chunks suspend until loaded; Suspense boundaries show fallback UI during fetch; error boundaries catch load failures; boundaries per route/widget localize both loading and failure; prefetching turns fallback into instant for predictable navigations.",
      },
    ],
    cheat: [
      "Measure first: Profiler + why-did-you-render; fix context identity.",
      "memo needs stable props: useMemo objects, useCallback functions.",
      "Virtualize hundreds+ rows; paginate first if possible.",
      "Suspense per widget; prefetch on hover; lazy routes and heavy deps.",
      "content-visibility: auto for long offscreen sections.",
      "Bundle budgets in CI; analyze for duplicates; code split by route.",
      "INP is the metric: < 200ms; field data over lab guesses.",
    ],
    recap: `React performance work is measurement-led: find the actual re-render chain or commit cost with Profiler, then fix the cause — memoized props for memoized components, virtualization for long lists, code splitting with Suspense for heavy modules, context identity discipline — and keep the gains with field metrics (INP, LCP, CLS) and CI bundle budgets; every optimization must be traceable to a profile, never to a hunch.`,
    code: {
      title: "Stable memo props pattern",
      language: "tsx",
      code: `const onSelect = useCallback(selectRow, []);\nconst rows = useMemo(() => data.filter(pred), [data, pred]);\n{rows.map(r => <Row key={r.id} row={r} onSelect={onSelect} />)}`,
      explanation:
        "Stable function and derived array keep React.memo useful; rows keyed by id; only changed rows re-render; the memo justifications are the two lines above, not vibes.",
    },
    diagram: {
      title: "Render cost pipeline",
      caption: "Where the work goes in a commit.",
      mermaid: `flowchart TD\n S[State update] --> R[Component calls]\n R --> D[Diff vs previous tree]\n D --> C[DOM mutations]`,
    },
  },
};
