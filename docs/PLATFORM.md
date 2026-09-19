# EduSwarm Platform Blueprint

How EduSwarm goes from "AI demo" to an intelligent learning platform: the agent
system, the evidence contract, the offline-first intelligence engine, and the
roadmap ahead.

## 1. Product vision

Most learning apps are content libraries with a chatbot taped on. EduSwarm is a
**study operating system**: it decides what to learn next, generates the
material with cited evidence, drills recall on a forgetting-curve schedule,
tests under exam conditions, and coaches with specialists — while every signal
(mastery, streaks, mistakes, mocks) compounds into the next decision.

Design principles:

1. **Intelligence must degrade, never disappear.** Every LLM feature has a
   deterministic floor (local kits, static code review, guided doubt ladders,
   planner fallback). Offline still teaches.
2. **Evidence before eloquence.** Generated lessons publish only with
   claim-level citations against retrieved sources. Fallback kits are labeled
   as such — never silently passed off as verified.
3. **The browser is untrusted.** Correctness, grading, XP, and scheduling are
   computed server-side. Answer keys never ship before submission.
4. **Every action feeds the model.** Attempts, reviews, mocks, code runs, and
   lesson completions all flow into mastery, XP, streaks, and plans.

## 2. The agent team

### Lesson pipeline (LangGraph, checkpointed)

```
Dean → Researcher → Notes Author (notes + practice) → Local Practice Curator → Fact-Checker → Publisher
```

- **Dean** scopes the topic to the learner's level and daily budget, then assigns
  the local companion (worked code, diagrams, recall checks, and source links).
- **Researcher** hybrid-retrieves Qdrant evidence (vector + keyword rerank).
  Three evidence tiers, in order: indexed Qdrant chunks → **seeded local study
  kits** (`app/local_kits.py`, `evidence_mode: local-kit`) → an explicitly
  labeled curriculum preview. A kit is attributed tutorial text stored as JSON
  outside the checkout (`EDUSWARM_LOCAL_KITS_DIR`), written by
  `python seed_knowledge.py --local-kits`, which fetches only robots-permitted
  pages and keeps the source URL with every extract. A kit is used only when it
  carries two independent sources, which is the citation gate's threshold, so a
  topic stays teachable with Qdrant empty and no network.
- **Notes Author** writes the compact evidence-sensitive lesson **and** its
  claim-linked practice in one structured call: 5/6/9 sections at ELI5/Standard/
  Deep and a 620/900/1700-word target. Five sections is a hard floor enforced by
  `check_lesson_shape`, so a model that returns two paragraphs is skipped rather
  than published; deep also gets a larger 6000-token output budget so its extra
  sections cannot truncate the JSON. The local kit follows the same shape. The standard lesson stays around two
  pages rather than producing a generic three-page wall of text, and the smaller
  budget leaves room inside `max_tokens` for the practice JSON so replies are not
  truncated. A reply that fails the shape check costs one model attempt, not the
  job — `structured_generate(prompt, validator=check_lesson_shape)` tells the
  router to move on.
- **Practice Team** is now a deterministic curator: it checks claim provenance,
  retains good generated recall items, and fills missing ones from verified
  claims without a second slow provider request.
- **Fact-Checker** enforces the gate: ≥2 independent sources, every claim cited
  with two distinct chunk ids from two different sources, every artifact carrying
  provenance. Weaker free models routinely miscite, so a citation failure earns
  **one** repair call that lists the valid chunk ids and their sources and asks
  for corrected claims only — citations are never invented locally. If the repair
  also fails validation, the job still fails closed and visibly.
- **Publisher** assembles the concise cited lesson plus the clearly labeled local
  companion. State checkpoints (`EDUSWARM_STATE_DIR`) plus job leases make
  execution resumable (`/resume`).

### Model routing (`app/llm_router.py`, mirrored in `apps/api/src/llm.ts`)

Free model ids are not configuration — they are a moving target, so the platform
treats them as discovered infrastructure:

- **Catalogue.** `GET {base}/models` is cached for 20 minutes; a failed fetch
  keeps the previous cache and retries after 60s. Generation never blocks on it,
  and `/health` reads the cache only (`model_chain(fetch=False)`) so Render's
  health check cannot be slowed by a provider incident.
- **Eligibility.** Free (prompt and completion priced at 0), text-only output,
  not expired, ≥32k context, ≥20B parameters when the size is discoverable, and
  the id must not look like a guard/embedding/media/tiny model. Models that
  advertise `response_format` or `structured_outputs` are preferred, then newest.
- **Order.** env hints that still exist → last-known-good → curated list →
  up to 8 newest discovered free models → `openrouter/free` → the optional paid
  model. Cool-down ledger: 404/410 → 6h, 400/422 → 1h, 402/403 → 1h, 429 → 2m
  (3h for a per-day limit), 5xx/timeout → 2m, empty or invalid output → 15m.
  Cooled models move to the end rather than being removed, so a total outage
  still has something to attempt. Only a 401 aborts the chain.
- **Per-model request policy.** JSON mode with `reasoning: {enabled: false}`; a
  400/422 triggers a bare resend; an empty reply triggers one retry with
  `reasoning: {effort: "low"}`; an HTTP 200 carrying an `error` body is an error;
  a `content` that is null, a list, or drained into `message.reasoning` is all
  handled.
- **Budgets are fixed constants**, not settings: `max_tokens` 4096 (6000 for a
  deep lesson), 6 attempts,
  150s per attempt and 480s total for a lesson (1400 / 75s / 200s for chat) —
  comfortably inside `AGENT_RUNTIME_MAX_WAIT_MS=600000`. Nothing about model
  behaviour is read from the environment, so no deployment can mistune it and a
  stale variable left over from an older deploy is inert.
- **Tolerant parsing.** `<think>` blocks and Markdown fences are stripped, the
  parser starts at the first `{` and uses `raw_decode` (so trailing prose is
  ignored), trailing commas are removed, and a reply truncated by the token limit
  is repaired by dropping the dangling tail and closing open quotes/brackets. A
  repaired reply is only accepted when the validator passes.

Regression coverage lives in `services/agent-runtime/test_llm_router.py` and
`apps/api/src/llm.test.ts`, both driven by a fake OpenRouter on localhost.

### Offline lesson path: licensed tutorial kits

When every model fails, `buildLocalPack` still has to hand back a real lesson.
It has two tiers:

1. **Seeded kit** (`apps/api/src/kitStore.ts`, `evidenceMode: local-kit`) — the
   publisher's actual explanation for that exact topic, extracted into sections,
   code samples, definitions and key points, each tagged with the source it came
   from. Produced by `npm run seed:kits`, which:
   - only fetches from an explicit allow-list (GeeksforGeeks, MDN, W3Schools —
     the publishers we hold rights for). Any other host is skipped and reported.
   - obeys `robots.txt` per origin and paces requests.
   - writes to `EDUSWARM_KITS_DIR` (gitignored `.data/kits` locally, a Render
     disk in production). **No third-party article text is ever committed.**
   - records the URL and a licence note on every extract, which the lesson
     renders as a `*Source: …*` line under each section and surfaces in
     `verification.licenseNotes`.
   A kit needs ≥3 substantial sections to be used; thinner ones are rejected.
2. **Curated tutorial** (`evidenceMode: local-fallback`) — the original
   hand-written profiles. Always available, used for any topic without a kit.

Both tiers emit the same lesson shape and the same 5-6 section window (more at
deep), so the UI and the learner see one consistent artifact regardless of which
path produced it. `npm run kits:report` prints coverage.

### Specialist sessions (stateful chat)

Seven persistent personas share one grounded chat endpoint: Socratic Tutor, PYQ
Coach, Doubt Solver, Code Reviewer, Mock Examiner, Revision Planner, Career
Mentor.

**Three-tier answer path.** `POST /api/agents/sessions/:id/messages` builds one
system prompt in `apps/api/src/agentBrain.ts` — persona, open lesson, universe,
learner level, and their weak topics — then tries, in order:

1. **Agent runtime** (`/v1/agent-chat`): the same prompt plus Qdrant retrieval.
2. **Direct model from the API** (`apps/api/src/llm.ts`): walks the chain
   discovered from OpenRouter's live catalogue, so an asleep or misconfigured
   runtime cannot silently downgrade the learner's answers.
3. **Curriculum brain** (`localSpecialistReply`): not a canned paragraph — a
   pasted PYQ is matched against the question bank and answered with its real
   explanation and option eliminations, pasted code gets a structural review,
   and common stuck-points (recursion blow-up, Master theorem, Belady, BCNF,
   self-attention, stale closures…) get their actual mechanism.

Every assistant message is stored with `provider` and `model`, and the chat UI
prints that label — so a learner can always tell whether a model answered or the
offline curriculum did. The local brain now resolves a topic-specific teaching
profile (for example, Node’s event loop/streams, React render snapshots, SQL
plans, RAG validation, or GATE invariants) plus an attributed reference route;
it does not fall back to one canned paragraph. `GET /api/agents/status` reports
the live path.

### Intelligence endpoints (structured JSON)

`/v1/doubt-solve` (evidence + lesson context), `/v1/study-plan`,
`/v1/evaluate-code` (rubric + corrected code), `/v1/mock-analysis`
(strengths/weaknesses/next steps). The API calls these with timeouts and always
keeps a local equivalent.

## 3. The mastery model

Per topic (0–100):

```
score = round(accuracy(last 10) × 72 + completed×14 + min(reviews,10) + min(attempts,10)×0.4)
band  = nascent <25 · developing <55 · strong <80 · mastered ≥80
```

Modules average their topics for the dashboard heatmap. XP is
difficulty-weighted (easy 10 / medium 15 / hard 25, wrong 3 for effort) plus
completion/review/mock/code bonuses across 11 levels. Streaks derive from the
union of attempts, completions, and activity dates — no separate tracking table
to drift.

## 4. Memory: SM-2 scheduling

Reviews carry `{efactor, intervalDays, repetitions, nextDueAt}`. Grades map
Again=1, Hard=3, Good=4, Easy=5. Again resurfaces within the hour so repair
loops stay tight; Easy compounds a 1.3× bonus. The due queue merges overdue
reviews with fresh cards from saved kits, so new lessons automatically enter
the rotation.

## 5. Assessment integrity

- Question bank (78 items) is canonical; the API re-derives correctness.
- Diagnostics and mocks ship **answer-stripped** questions; grading happens
  server-side with GATE negative marking.
- Mock wrong answers auto-create mistake-notebook entries with explanations.
- Adaptive ranking (repeated misses → unseen → level-matched) powers
  "next best question" and weak-topic drills.

## 6. Code lab sandbox

`node:vm` contexts with no `require`/`process`/network, per-case timeouts,
20 KB code cap, 20-case cap, truncated logs, and float-tolerant deep equality.
Ten curriculum-mapped challenges (hashing, stacks, BSTs, DP, subnetting…)
feed the same XP/mastery model as quizzes.

## 7. Data model (Mongo/Redis, memory fallback)

`users · sessions · jobs · contents · progress(+attempts) · agentSessions ·
mistakes · reviews · mocks · activities` — all owner-scoped; Redis pub/sub
(`eduswarm:job:*`) streams job events to SSE. MemoryStore mirrors the full
interface so tests and demos run dependency-free.

## 7b. Sessions, the Reading Room, and switching universes

**Token sessions.** The web app and API are on different domains, so a session
cookie is third-party and gets blocked by Safari/Firefox/Chrome — the cause of
the repeated "sign in with Google" loop. `apps/api/src/auth.ts` signs a
single-use login code at the end of OAuth; the SPA exchanges it for a 30-day
HMAC Bearer token and sends it as an `Authorization` header. Cookies stay as a
same-origin fallback, and the SSE job stream takes the token as `?token=`
because `EventSource` cannot set headers.

**Reading Room.** The former Clubs section is now a curated library of popular,
genuinely insightful *free* blogs and reading lists. `apps/api/src/resources.ts`
stores a shelf per learning universe, each resource tagged with the exact
syllabus modules of that universe, so `GET /api/resources?goal=&module=&q=`
returns a list that changes when the learner switches universe — fully dynamic.

**Topic regeneration.** A fresh topic may still fall back to the local kit when
the agent runtime is offline, so learning never stops. But a **regeneration**
(`POST /api/jobs` with `regenerate: true`) records that the learner already has
a saved kit (`hadContent`); if the runtime or LLM is unreachable, the job
*fails loudly* and keeps the existing kit byte-for-byte instead of overwriting
it with another placeholder. When the AI team comes back, regenerating produces
the full evidence-backed kit. The runtime also receives `force_research: true`
on regeneration so it re-runs research rather than replaying a cached artifact.

**Active universe.** `PATCH /api/me { activeGoal }` persists the learner's
universe on the account (and adds the matching goal), so switching from GATE CSE
to AI/ML survives reloads and devices. Home renders that universe's complete
syllabus; everything else — today's mission, daily challenge, insights, weekly
XP — lives on the Today's mission page.

## 8. Roadmap

- **Now:** seed Qdrant in production (`seed_knowledge.py`), add provider
  fallback models, per-subject mock blueprints.
- **Next:** group study rooms + shared mocks, flexible rubric evaluations for
  subjective answers, voice doubt input, PWA offline kits.
- **Later:** interview simulator with resume mapping, institute dashboards,
  regional-language lesson variants, learning-graph recommendations across
  universes.
