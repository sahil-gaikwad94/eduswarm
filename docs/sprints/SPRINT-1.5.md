# Sprint 1.5 — "Students Should Love Studying Here": Launch-Quality Overhaul

**Status: REWORKED (content leg).** The lesson-authoring contract in `docs/sprints/SPRINT-1.5-INSTRUCTIONS.md` supersedes the "Content engine overhaul" section below, which describes the earlier (rejected) approach. All 259 topics across 35 modules now have individually authored, registered lessons; the legacy composer/module-pack/seeded-kit path is deleted; `npm run check:lessons` enforces coverage in CI. The rest of this document is preserved as the historical log of the rejected pass. The mobile acceptance checklist at 390×844/360×800 has not been re-run against the new packs and must not be claimed complete.

**Driver:** Principal audit of shipped Sprint 1 — see "Issues (verbatim)" below.
**Skill bar:** every page must pass `/frontend-ui-eng` review at 390px and 1440px.

## Research notes (web fetched; websearch MCP returns zero results)

- **Brilliant** (`brilliant.org/learn/`): every lesson is *atomic* — one concept, a
  worked interactive step, an immediate check, a trap. Topics are tiny ("Nested
  loops", "Big-O notation", "Counter-examples"). Koji = visual, interactive tutor
  on a shared canvas asking guiding questions. Mastery assessments place learners
  at level and adapt. Takeaway for us: our lessons must feel **walked through**,
  not dumped — worked example with numbers on the page, a trap called out by
  name, and an instant self-check.
- **Harvard CS50x** (`cs50.harvard.edu/x/2024/`): week = {lecture, section,
  problem set, shorts}; culminates in a **final project**; "more than teach you how
  to program in one language…" — correctness, design, style emphasis. Takeaway:
  end-of-module "build something" milestones fit EduSwarm's Plan page; our
  curriculum already has PYQ Marathons — that's our final project per universe.
- **MIT OCW 6.006 / 6.042** (`ocw.mit.edu`): lecture videos + notes +
  **problem sets + quizzes**; practice load is the primary teaching instrument.
  Takeaway: keep our PYQ-first loop honest — every lesson must ship with worked
  PYQs in-page (already a strength: `relatedQuestions`) and the Practice hub is
  the assessment engine.
- **NPTEL** (`nptel.ac.in`): faculty-taught courses; weekly structure
  (lecture → assignment → test); research-grade rigor from IIT/IISc. Takeaway:
  lesson references should keep pointing at NPTEL (already in our Reading Room);
  our flagship content is written to lecture quality.
- **Readwise Reader / GATE Overflow / OSTEP** (in blueprint + prior work): in-app
  reading beats outbound redirects for retention and focus; attribution +
  "read original" keeps ethics intact. → new `/api/reader` + Reader view.
- **24fps MCP** (used): clip corpus is 3D/WebGL/motion-graphics prompts, not UI
  product patterns — used only for motion-principle grounding (ease-out, spring
  physics, staggered reveals) and one loader reference. Documented honestly.
- **santismm-knowledge MCP** (used): physical-AI/agent knowledge base, no edtech
  content; used to ground the AI/ML universe (fine-tuning, embeddings,
  enterprise RAG, reasoning models, agent evaluation) — see knowledge slugs cited
  in the AI/ML sections of `flagshipKnowledge` and the Reading Room additions.

## Issues (verbatim from the principal)

1. Cannot logout
2. Local lessons are shit, small, full of random shit (not your work, pre-existing) — improve
3. Add more topics per subject — doesn't cover entire syllabus
4. Research thoroughly (Harvard, MIT, NPTEL) — in-depth courses covering everything, simple + detailed explanations, **no irrelevant content** (e.g. JS code in a Python tutorial)
5. Texts/components/pages at almost every page are badly formatted — out of scope, overlap — perfect layout & structure
6. Better cheatsheets in lessons
7. Reading-room articles redirect externally — must read in-app, keep original-author attribution
8. Better achievements + better experience — make students love studying and mastering
9. Profile page is shit — redesign completely + great profile customizations
10. Discussions not formatted well — perfect design/format/structure
11. Better interactions throughout the app
12. Better flashcards

## Design contract per page (name the job → the fix)

- **Profile** — job: identity + ownership. New hero (large XP ring, level,
  streak, join date), editable preferences with autosave, avatar customization
  (flame colorway + accessory), achievement showcase, multi-goal universes,
  sign-out. Mobile: stacked, ring scales down.
- **Discussions** — job: scan-answer-participate. Composer collapses into a
  single line with focus-expand on mobile; overflow-safe grid tracks; two-pane
  (feed + guidelines/topics rail) at ≥1100px; empty/error states get brand voice.
- **Flashcards** — job: active recall that feels physical. Real card-flip with
  perspective, face labels, keyboard grading (1–4 / Space to flip), session
  progress ring, honest empty state, "again tomorrow" copy.
- **Lesson** — job: deep teaching, one sitting. Sections rewritten for
  substance (why → model → guided trace → traps → PYQ anchor → verification),
  language-appropriate code, section-anchored cheat sheet, `✓ Curated baseline`
  badge preserved.
- **Reading Room** — job: deep reading without losing the product. In-app reader
  (`/api/reader?id=`) renders extracted/curated text with publisher + author +
  source link always visible; nothing navigates away by default.

## Content engine overhaul (the honest core of the "lessons are shit" complaint)

1. Delete filler phrases repeated verbatim across lessons ("Write the contract
   first…", "Use this exit test…", boilerplate retrieval sections); every
   recurring line must carry topic-specific content or be removed.
2. **Language-correct code**: web-dev → JS/TS, ai-ml → Python, gate-cs →
   Python/pseudocode + C-style where C is the exam language; never JS in a
   Python lesson; never web snippets in Python lessons.
3. Per-topic **cheat sheets become specific**: named facts (O-bounds, formulas,
   normal-form rules, threshold values), not restatements of the mental model.
4. Expand flagship profiles into a new `flagshipKnowledge.ts` (~12 hand-authored
   deep notes: complexity, probability, deadlocks, memory management,
   normalization, transport layer, automata, python-for-ai, transformers,
   react fundamentals, node runtime, ml evaluation). Merge precedence:
   flagship → profile → improved generic fallback.
5. Generic fallback rewritten to be topic-aware (definition-first, trace-one,
   boundary-case, self-check) with zero boilerplate nouns copied from the topic.
6. Curriculum expansion (+28 curated topics across universes, full syllabus
   coverage): GATE adds Lattice & Partial Orders, Monoids & Groups, Eigen-vectors,
   Random Variables, Information Theory, Discrete Math split; web-dev adds CSP &
   security headers, Web Vitals deep dive, OAuth/OIDC, payment flows, HTTP caching,
   image optimization, design tokens, Storybook testing; ai-ml adds reasoning
   models, context engineering, fine-tuning (LoRA), agents & evaluation,
   quantization, mechanistic interpretability, synthetic data, alignment &
   responsible AI. All new topics route through matchers to quality profiles.
7. `referencesFor` upgraded with real university routes (OCW, NPTEL, CS50,
   D2L, Hugging Face Learn, react.dev) + keep GATE Overflow/MDN as practice.
8. PYQ slice per lesson kept (already correct); cheatSheet tests updated.

## Achievements & experience

- Expand 11 → 19 achievements (discussions helper, repair 3, 7-day streak,
  14-day streak, mock debut, mock 70, mock 90, first deep kit, PYQ 25,
  reviewer 20/50, memory-athlete). Unlock = confetti + toast on dashboard.
- Session "wrap card" after lesson completion (XP earned, streak, next action).

## Execution order (sprint 1.5 — shipped log)

1. ✅ Logout fix (auth flow) — signOut → `/api/auth/logout` + guest reverse-trial reset. Verified live (lands on landing).
2. ✅ Layout sweep (probe → fix → re-screenshot) — overflow net + dock 4 tabs; verified 390px all pages.
3. ✅ Content engine + curriculum — flagship lessons, language-aware packs, topic-aware fallback, 22 new topics, video recs rewritten.
4. ✅ In-app reader — `/api/resources` + Reading Room cards → in-app overlay reader w/ author attribution + outbound "read original".
5. ✅ Achievements + wrap card — 11 → 19 badges (PYQ Hunter, Seasoned, Scholar-Statesperson, Full Marks, Memory Elite, Iron Will, ...).
6. ✅ Profile redesign + avatar creator — custom hero, colorway + accessory customization, prefs, goals.
7. ✅ Discussions polish — two-pane (feed + community rail), topic trend chips, rules card.
8. ✅ Flashcards redesign — 3D flip, keyboard (Space/1-4), progress bar, session-complete card.
9. ✅ Interaction polish pass — reader overlay interactions, avatar radios/swatches, save lists.
10. ✅ Full verification — build + tsc (api/web), 60/61 tests, smoke OK, screenshots in `docs/sprints/evidence/`.
11. ✅ Commit + push.

## Non-goals (explicitly out of scope here)

Sprint 2 (multi-provider router, canonical cache), Sprint 3 (TTS), Sprint 4
(friends/pods/Razorpay/TL gates). No content copied from third-party articles —
the reader serves **our** summaries/extractions with attribution and a link to
the original, mirroring the seeded-kit licensing model already in the repo.

---

## Rework log — content leg (2026-11-10, local branch only; do not push unreviewed)

**What changed, precisely:**

- All 259 curriculum topics (35 modules, `apps/api/src/curriculum.ts`) have a distinct, individually authored lesson in `apps/api/src/lessons/<module>.ts`, registered into `TOPIC_LESSONS` in `apps/api/src/topicLessons.ts`. No module-level essay, no shared template, no runtime composition.
- Deleted: `apps/api/src/lessonComposer.ts`, `apps/api/src/moduleKnowledge.ts`, `apps/api/src/kitStore.ts`, the snippet and diagram template libraries in `apps/api/src/localPack.ts`, the seeded-kit branch, and `scripts/seed-kits.mjs`.
- `buildLocalPack` now throws `No authored lesson registered for topic "<id>"` when a topic is missing a lesson. Tests updated: authored-pack assertions replace kit/composer assertions; a missing-lesson test asserts the throw.
- New gate: `apps/api/scripts/check-lesson-coverage.ts` (`npm run check:lessons`, `npm --workspace apps/api run check:lessons`) validates every curriculum topic id → authored lesson + structural contract (≥3 concepts, ≥2 exam items, ≥3 cheat lines, worked examples present). Wired into CI (`.github/workflows/ci.yml`, between `npm test` and `npm run build`) and exits non-zero on any miss.
- Earlier modules from the first pass (algorithms, PYQ marathons, DBMS, networks, OS, TOC, compiler design, general aptitude) were rewritten to the same depth standard as the reference modules (~1,400–1,900 words/topic); filler and meta phrasing removed.
- All 35 lesson files pass per-file `tsc --noEmit --strict --skipLibCheck`; `npx tsx` smoke over the registry reports 259 authored / 0 missing / 0 structure issues; all files are valid UTF-8 with no control bytes. Full `tsc -p apps/api` on this ARM64 dev box has an environment-level `free(): invalid pointer` crash; CI x86_64 is authoritative.

**Not done / not claimed:**

- The mobile acceptance pass (390×844 / 360×800), the in-app reader checks, profile/XP/discussions/flashcard UX verification, and the final `/frontend-ui-eng` review across pages were not re-run against the new local packs in this pass.
- The branch has not been pushed (`sprint-1/prune-4tab-guest`); per instructions, review precedes any push. CI will be the authoritative x86_64 verification.
- Product-side Sprint 1.5 items from the original log (achievements, profile redesign, discussions, flashcards UX) were implemented in the earlier rejected pass and were NOT re-evaluated in this rework.
