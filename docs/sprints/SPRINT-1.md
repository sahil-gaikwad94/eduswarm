# Sprint 1 — Codebase Pruning & 4-Tab Dock Refactor (Days 1–3)

**Status:** Implemented on branch `sprint-1/prune-4tab-guest`
**Source of truth:** `Eduswarm Principal Audit And Upgrade Blueprint.md` §3, §10 (Sprint 1), §1 (P1 findings)

## What Sprint 1 is for

The audit found four structural bottlenecks. Sprint 1 owns two of them and clears the
runway for the rest:

1. **7-tab mobile dock with unrelated personas** (`Home, Quiz, Mocks, Code, Agents, Reading, Mock HR`) — P1 High.
2. **Mandatory auth wall + no discussions surface** — P1 High (70%+ top-of-funnel drop-off), and the 4th dock tab cannot exist without a real destination.

Sprint 1 does **not** touch the LLM swarm (Sprint 2), TTS/Practice Hub consolidation
(Sprint 3), or Razorpay/friends/pods (Sprint 4). The Practice *route* consolidation is
partially done now because the dock needs a single `Practice` destination; the full
three-mode hub (pre-cached hints, mock simulator rules, mistakes spaced repair) stays
scheduled for Sprint 3.

## Research conclusions (web search integration was unavailable; blueprint used as the sourced baseline)

- **4-tab dock is the right density.** iOS HIG and Material guidance both land on 3–5 tabs;
  7 targets on a 390px viewport = ~51px tap width (below the 44pt minimum and far below
  comfortable thumb reach). Four tabs ≈ 95px each. Core habit loop: *read → recall → repair → share*.
- **Reverse-onboarding beats auth-wall.** The blueprint's H1 (10/10) is the single
  highest-leverage change for launch conversion: unauthenticated visitors must see real,
  working content (curated baseline + PYQ quiz + public discussions) before any sign-in
  request. Sprint 1 opens the guest read-only routes server-side and wires a guest mode
  in the web shell.
- **Social isolation is the retention moat.** Discussions is a first-class dock tab,
  not a hidden forum. Sprint 1 ships a functional Phase-1 Discussions (public doubts &
  thoughts feed, topic tags, upvotes, comments, resolve, seeded cold-start content).
  Friends/pods/chat/TL0–TL3 and the 15-second @Dean SLA are Sprint 4, as planned.
- **Cold start must be engineered, not hoped for.** Seeded, high-quality curated threads
  (real pedagogical content, `+20 XP peer challenge`) are inserted idempotently at boot so
  the feed is never empty on day one — the blueprint's answer to the empty-feed failure mode.

## Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| `Practice` dock tab | New unified hub inside `drills.tsx` (`PracticeHub`): segmented control `Sprint · Mocks · Mistakes` | Sprint 3 deepens it; the dock must not ship 3 quiz-ish tabs |
| Saved-kit retrieval quiz | Moved to `/kit-practice` route, reachable from the lesson footer | Keeps "Take saved practice quiz" without squatting on the hub route |
| Profile & Progress | Top-right **avatar menu** (Profile / Progress / Mistake notebook / Log out); mobile dock drops them | Audit §3 — utility analytics out of primary nav |
| Desktop sidebar | Grouped: `ESSENTIALS` (Home/Practice/Discussions/Reading) · `LEARNING` (Lesson/Today/Flashcards) · `YOU` (Progress/Mistakes/Profile) | Same IA, lower cognitive load |
| Guest access | `GET /api/session` 401 → app enters **guest mode** (read-only): dashboard/library/discussions/curated lesson readable; all write actions open a sign-in sheet | H1 reverse-onboarding; zero new backend attack surface |
| Guest lesson | `GET /api/learning/content/:topicId` returns the **curated local pack** for guests (never persisted), with `guest: true` | Curated baseline is ₹0 and 100% verified (Tier A in blueprint §6) |
| Discussions store | New `discussions` collection/map in `Store` (Memory + Mongo), `upvoterIds` kept server-side, stripped in serialization | Matches existing `MongoRedisStore`/`MemoryStore` pattern |
| Discussions seeding | `discussionSeeds.ts` — 8 curated threads (GATE + AI/ML), inserted by **insert-if-missing** at `store.connect()` | Idempotent; survives deploys; never overwrites user upvotes/comments |
| Agent swarm purge | `agentBrain.ts` replaced by `doubtBrain.ts` (doubt-scoped prompt + offline reply); `/api/doubt` keeps its three-tier answer path | Audit §3 — swarm becomes invisible infrastructure |
| Achievements | `coder-1 "Hands On"` → `helper-1 "Community Voice"` (5 upvotes in Discussions) | No dangling achievement for a deleted feature |
| `/api/challenge/daily` | Now returns the PYQ only (no Code Lab teaser) | Code runner deleted |
| Store cleanliness | `agentSessions` removed from `Store` interface + both implementations | Dead code after `/api/agents/*` purge |

## Purge list (blueprint §3, exactly)

- `apps/web/src/pages/interview.tsx` — Mock HR simulator
- `apps/api/src/interview.ts`, `apps/api/src/interviewBank.ts`
- `apps/api/src/codeRunner.ts` — VM-sandboxed JS runner
- `apps/api/src/challenges.ts` — Code Lab challenge bank
- `apps/api/src/agentBrain.ts` — specialist agent personas (replaced by `doubtBrain.ts`)
- `CodeLab` (drills.tsx), `Agents`/`BrainStatus` (insight.tsx), `AgentChat` (ui.tsx)
- `/api/code/*`, `/api/interviews*`, `/api/agents` (directory), `/api/agents/sessions*`, `/api/agents/status`
- `CodeTestCase` / `CodeChallenge` / `CodeRunResult` from contracts
- Mobile dock: `Code`, `Agents`, `Mock HR` removed; `Quiz`+`Mocks` merged into `Practice`; `Discussions` added

## What lands in Sprint 2–4 (not this branch)

- Sprint 2: multi-provider circuit-breaker router (Groq/Gemini/Cerebras/Cloudflare), canonical `canonical_kits` worm B, 2-pass LangGraph, raw-429 sanitization
- Sprint 3: Web Speech TTS reader + Unified Practice Hub deepening (hints, mock simulator, spaced repair)
- Sprint 4: friends/pods/1:1 chat/TL0–TL3/@Dean SLA, Razorpay INR 99/199 + exam pass, Kokoro HD voices

## Verification gates

`npm test` (API suite incl. new discussions + guest tests — 61/62 pass, the one
file-level failure is a **pre-existing native exit crash** reproduced identically
on the untouched `origin/main` build on this machine; CI depends on x86_64) ·
`npm run build` (API tsc + web tsc/vite) · `npm run lint` · live boot smoke
(`scripts/api-smoke.mjs`, spawns the real server, exits 0) · Playwright screenshot
of the 4-tab dock (desktop + 390px mobile)

## Verified results (this branch)

- Purge complete: 6 files deleted; all `/api/code/*`, `/api/interviews*`,
  `/api/agents*` routes removed; achievements rewired to Discussions; contracts
  cleaned; desktop sidebar grouped (ESSENTIALS / ONGOING / YOU); mobile dock is
  exactly 4 tabs (~95px targets at 390px).
- Discussions ship end-to-end: public feed, doubt/thought kinds, topic anchoring,
  upvote toggle with server-side id sets, comments, author-only resolve, 20
  posts/60 comments per-user-per-day caps, boot-time insert-if-missing seeds
  (8 curated PYQ-grade threads).
- Guest reverse-trial works: landing CTA "explore without signing in" → read-only
  shell (Home, Practice read-only quiz, Reading, Discussions); curated baseline
  lesson renders at every topic with zero LLM calls; write actions raise a
  sign-in sheet; forged identities rejected (401/403 verified by API tests).
- Verified live in the browser: authed app shell, Discussions tab (desktop
  full-page screenshot in `evidence/`), Practice hub (Sprint/Mocks/Mistakes),
  mobile 4-tab dock, guest mode (banner + locked mocks/mistakes + shared PYQ lab),
  curated baseline lesson, fresh job completing offline through the local fallback.
- Notable bugs fixed en route: seeded-comment `authorStreak` type, Mongo `$push`
  strict-type rejection, `?previewLanding` stranding the guest CTA, remembered
  non-guest page bypassing guest gating, silent 404 console noise from
  `/api/notes/:id`, unquoted mermaid label breaking the DP diagram.
- Env note: this sandbox's ARM64 toolchain SIGABRTs Node *after* the test runner
  reports results ("free(): invalid pointer") — confirmed on pristine `origin/main`.
  Content is green; GitHub CI (ubuntu-latest) is the authoritative gate.
