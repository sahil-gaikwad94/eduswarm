# Sprint 1.5 — working context and instructions for tomorrow

This file is the handoff. Read it before touching code. It records what is
already built, what is deliberately unfinished, and the exact standard the
remaining work must meet. It is not a pitch deck and not a wish list; it is the
working brief.

---

## 1. Non-negotiable ground rules

1. **Author every topic individually.** One topic, one lesson. No module-level
   essay, no shared template, no runtime composition, no AI fill-in for the
   local path. If a topic has no authored lesson, it is not finished.
2. **The subject comes first.** The first sentence of a lesson teaches the
   subject. No "mental model", no objectives list, no study-coach preamble, no
   "why this matters" throat-clearing.
3. **Meta material only at the end.** A short revision schedule may be the last
   section. No "traps", "build it yourself", "where next", or motivational
   filler.
4. **Original prose.** Research top sources for understanding and inspiration,
   then write the explanation yourself. Never paste or lightly paraphrase a
   source. Third-party reading belongs in the Reading Room, with attribution.
5. **Local first, instantly.** The authored chapter must render immediately
   without a model call. AI generation is a secondary, optional action.
6. **Mobile app, not a website.** Single-column phone layouts, bottom-tab
   navigation, 44–48px touch targets, bottom sheets, safe-area handling, and
   16–18px body text. Desktop is the wide version of the same app, not the
   primary design.
7. **No goal-setting in the profile.** Progress and experience are allowed;
   goal cards, target-setting, and "what do you want to achieve" prompts are
   not.

---

## 2. Current state (rework, 2026-11-10)

### Content authored

**All 259 topics across 35 modules are authored and registered.** Engineering Mathematics and Digital Logic set the quality bar; every other module was written or rewritten to the same depth standard (~1,400–1,900 words/topic, distinct prose, no module-level essay).

Total curriculum: **259 topics across 35 modules — coverage gate green**: `npm run check:lessons` reports `curriculum topics: 259`, `authored lessons: 259`, `missing lessons: 0`, `structure issues: 0` and exits 0.

The two completed modules are the quality bar. Engineering Mathematics is the
long-form reference (roughly 1,350–2,100 words per topic). Digital Logic is the
same standard with more worked gate/FSM examples (roughly 1,450–1,800 words per
topic). Do not shorten later modules to "catch up".

### Code state

- Branch: `sprint-1/prune-4tab-guest`
- Last pushed tip before this work: `4b38eb1`
- This session's work is a **local commit only**. Do not push.
- `apps/api/src/topicLessons.ts` defines `TopicLesson`, `TOPIC_LESSONS`,
  `lessonFor`, and `missingLessonIds`.
- `apps/api/src/lessons/engineering-mathematics.ts` contains 13 authored topics.
- `apps/api/src/lessons/digital-logic.ts` contains 7 authored topics.
- `apps/api/src/authoredPack.ts` renders an authored lesson into the existing
  study-kit shape (`notes.sections`, `codeExamples`, `diagrams`, `cheatSheet`,
  `flashcards`, `quiz`, `pyqs`, `verification`).
- `apps/api/src/localPack.ts` checks `lessonFor(topicId)` **first** and returns
  the authored pack. The legacy composer/kit path still exists below that check
  only so unauthored topics do not crash during the transition.

### Legacy path — DELETED (2026-11-10)

The legacy composer/kit path has been removed entirely:

- `apps/api/src/lessonComposer.ts` — deleted
- `apps/api/src/moduleKnowledge.ts` — deleted
- `apps/api/src/kitStore.ts` — deleted (and `scripts/seed-kits.mjs` with it)
- the seeded-kit branch, `buildKitPack`, the snippet library, and the diagram
  template library in `localPack.ts` — deleted
- `buildLocalPack` now **throws a clear error** when `lessonFor(topicId)` is
  missing. There is no fallback: a missing lesson is a build/test failure, not
  a learner-facing essay. CI runs `npm run check:lessons` (which also validates
  structural contract per lesson) and fails on any miss.

---

## 3. Authored lesson contract

```ts
type TopicLesson = {
  intro: string;                 // definition and scope, subject first
  foundations: string;           // notation, rules, assumptions
  concepts: Array<{ title: string; body: string }>;
  worked: Array<{ title: string; body: string }>;
  exam: Array<{ question: string; answer: string }>;
  cheat: string[];
  recap: string;
  code?: { title: string; language: string; code: string; explanation: string };
  diagram?: { title: string; caption: string; mermaid: string };
};
```

### Required order in the rendered chapter

1. Definition and scope (the intro, headed as the subject, not as "objectives")
2. Foundations
3. Core concepts, one section per concept
4. Worked examples, every step shown
5. Exam practice with full solutions and an explanation of the trap
6. Recap of the subject
7. Revision schedule (the only meta section, last)

Code and the cheat sheet stay separate structured UI assets. Do not bury them
in prose.

### Length and depth

- Minimum: ~1,200 words of substantive explanation per topic.
- Reference: 1,400–1,900 words.
- Every concept needs a concrete example or a precise rule, not just a
  definition.
- Every worked example must be solvable from the text alone.
- Every exam answer must explain why the wrong-looking answer is wrong.
- Do not pad with repeated definitions or generic study advice. Length comes
  from the subject, not from filler.

---

## 4. Remaining authoring queue

Author in this order. One module at a time, end to end: write all lessons, add
the file to `topicLessons.ts`, spot-check the rendered pack, then move on.

| # | Module | Topics | Status |
|---:|---|---:|---|
| 1 | Engineering Mathematics | 13 | done |
| 2 | Digital Logic | 7 | done |
| 3 | Computer Organization and Architecture | 7 | next |
| 4 | Programming and Data Structures | 8 | |
| 5 | Algorithms | 9 | |
| 6 | Theory of Computation | 6 | |
| 7 | Compiler Design | 5 | |
| 8 | Operating Systems | 6 | |
| 9 | Database Management Systems | 8 | |
| 10 | Computer Networks | 8 | |
| 11 | General Aptitude and GATE Strategy | 5 | |
| 12 | PYQ Marathons and Test Strategy | 11 | |
| 13 | Engineering Foundations | 3 | |
| 14 | Web Foundations | 11 | |
| 15 | JavaScript and TypeScript | 9 | |
| 16 | Design for Engineers | 5 | |
| 17 | React Ecosystem | 8 | |
| 18 | Backend with Node.js | 10 | |
| 19 | Data and Persistence | 7 | |
| 20 | Production Engineering | 9 | |
| 21 | System Design | 10 | |
| 22 | Advanced Frontend | 6 | |
| 23 | Testing and Delivery | 5 | |
| 24 | Python and Data Foundations | 7 | |
| 25 | Data Engineering Essentials | 4 | |
| 26 | Math and Statistics for ML | 5 | |
| 27 | Classical Machine Learning | 8 | |
| 28 | Deep Learning | 10 | |
| 29 | NLP and Language Models | 12 | |
| 30 | Generative AI Applications | 9 | |
| 31 | MLOps and Production AI | 9 | |
| 32 | Computer Vision in Depth | 5 | |
| 33 | Reinforcement Learning | 4 | |
| 34 | ML System Design | 6 | |
| 35 | AI Career Accelerator | 4 | |

The full topic inventory is at `/tmp/eduswarm-topics-full.txt` and in
`apps/api/src/curriculum.ts` (`catalogs`). Use the curriculum as the source of
truth for IDs, titles, and module names.

### Per-module definition of done

- [ ] Every topic ID in the module has its own entry in `lessons/<module>.ts`.
- [ ] The module registry is imported and spread into `TOPIC_LESSONS`.
- [ ] No entry reuses another topic's prose.
- [ ] Representative topic renders with the first section already teaching.
- [ ] Word count is in range; no placeholder sentences remain.
- [ ] Cheat sheet has 6–9 dense lines, not definitions copied from the intro.
- [ ] Code example (if the topic is technical) is runnable and explained.
- [ ] Diagram (if useful) is a real concept map, not decoration.
- [ ] Exam section has at least four questions with full solutions.

---

## 5. Sprint 1.5 issue checklist

These are the original issues plus the UI/UX upgrade. Treat each as a product
requirement, not a suggestion.

### 5.1 Logout

- Logout must clear the session, local caches, and any in-memory user state.
- After logout, the app returns to the guest-safe home screen.
- No stale avatar, streak, XP, notes, or flashcard counts may remain.
- Logout must work from the avatar menu on mobile and desktop.

### 5.2 Local lessons

- Authored local chapter renders before any network/model call.
- First paint shows real content, not a skeleton, when the pack is local.
- The local banner is honest: authored, reviewed, instant, no model call.
- The AI action is optional and visually secondary.
- A missing authored lesson must fail loudly in development; it must never
  silently show a module essay.

### 5.3 Syllabus coverage

- Every one of the 259 topic IDs maps to exactly one authored lesson.
- Add a validation script that prints missing IDs and exits non-zero.
- Wire the check into CI once the last lesson lands. Do not wire it earlier and
  block all work.
- The UI must not show a topic as "available" if its lesson is missing.

### 5.4 Research depth

- Each lesson should reflect the standard treatment of the topic: definitions,
  governing rules, worked examples, edge cases, and exam-style practice.
- Research is for correctness and coverage, not for copying.
- Prefer primary/standard sources (textbooks, RFCs, official docs, papers) for
  facts. Write the explanation in EduSwarm's voice.
- Do not add a bibliography to every lesson; the Reading Room and optional
  source links carry further reading.

### 5.5 Formatting

- One idea per paragraph; short paragraphs on mobile.
- Use headings, ordered steps, bullet lists, tables, and fenced code only where
  they improve comprehension.
- No walls of bold text. Bold for key terms and warnings, not whole sentences.
- Mathematical notation must be consistent within a lesson (same symbol for the
  same object).
- Code blocks must be syntax-highlightable and horizontally scrollable.
- The rendered chapter must use the full-article reader styles on mobile, not
  desktop typography squeezed into a phone.

### 5.6 Cheat sheets

- Separate card at the end of the chapter.
- 6–9 lines, each a rule, formula, or distinction worth memorizing.
- No duplicate of the intro; no vague "understand the concept" lines.
- Must be readable at a glance on a 390px screen.
- Download/print is optional; on-screen readability is required.

### 5.7 Reading redirects

- No lesson should send the learner out of the app to read the main article.
- Reading Room opens the full article inside the app (`ArticleReader`).
- External links are optional "read the original" actions, not the primary
  path.
- Preserve the original author/publisher attribution in the reader.
- Handle extraction failure with a clear in-app message and a link to the
  original, not a silent redirect.

### 5.8 Achievements and experience

This needs a real redesign, not a badge grid.

- **XP sources:** completing a chapter (base XP by depth), first-time
  completion bonus, exam set accuracy, flashcard review, discussion answer
  accepted, streak day, module completion.
- **Levels:** a visible level derived from total XP, with a progress bar to the
  next level. Level names should be subject-neutral and short.
- **Badges:** meaningful, earned once, with a clear criterion and date. No
  badge for opening the app.
- **Streak:** consecutive active days; grace/freeze rule must be stated in the
  UI. Do not punish a missed day silently.
- **Experience history:** a reverse-chronological list of XP events with
  source, amount, and timestamp. This is the audit trail for the level.
- **Idempotency:** refreshing or re-opening a completed chapter must not award
  XP twice. Server-side ledger is authoritative.
- **Privacy:** XP and badges can be hidden from the public profile.
- **No goals:** do not add "set a goal", "target XP", or "weekly goal" cards.

### 5.9 Profile

Social-media-style, complete, and not a settings page.

- Cover image, avatar, display name, handle (`@...`), bio.
- Stats row: chapters, streak, XP/level, badges (privacy-aware).
- Tabs: Overview, Chapters, Discussions, Badges, Settings.
- Overview: recent activity, completed modules, current level.
- Chapters: completed/in-progress list with dates.
- Discussions: threads started and replies.
- Badges: earned grid with locked states and criteria.
- Settings: edit profile, change handle/bio, privacy toggle, logout.
- Privacy toggle hides stats/activity from public view without hiding them from
  the owner.
- Mobile: cover/avatar block collapses cleanly; tabs scroll horizontally;
  settings open as a bottom sheet.
- **No goals section anywhere.**

### 5.10 Discussions

- Per-topic discussion thread, not a global chat.
- Post, reply, edit own post, delete own post, report.
- Sort by newest/top; show author handle and relative time.
- Empty state explains the thread is for questions about this topic.
- Moderation hooks: report reason, hidden state, moderator note.
- Mobile composer opens a bottom sheet with a 44px send button and safe-area
  padding.
- Loading, error, and optimistic states must be explicit.

### 5.11 Interactions

- Every button has a pressed/disabled/loading state.
- Destructive actions ask for confirmation.
- Toasts are used for success/failure, not for navigation.
- Keyboard focus is visible; Escape closes sheets/dialogs.
- Touch targets are at least 44×44px, preferably 48px.
- No hover-only affordances on mobile.
- Reduced-motion preference disables confetti and large transitions.

### 5.12 Flashcards

- Per-topic deck generated from the authored lesson's concepts and cheat sheet.
- SM-2-style scheduling with Again/Hard/Good/Easy.
- Due count visible on the home screen and flashcards tab.
- Review screen: prompt first, answer hidden until reveal, then grade.
- Session summary: reviewed, correct, again, next due.
- No duplicate cards from the same concept.
- Cards must be editable/deletable by the owner.
- Mobile: one card per screen, large tap targets, swipe optional but not
  required.

---

## 6. Mobile UI/UX specification

The product is a phone app. Design at 390px first.

### Layout

- Single column, 16px side padding, max readable line length on desktop.
- Bottom tab bar: Home, Plan/Study, Practice, Library, Profile (labels short).
- Active tab is obvious; tab bar respects `env(safe-area-inset-bottom)`.
- Sticky lesson header with back, title, and progress; it must not cover
  content when the keyboard opens.
- Bottom sheets for settings, filters, composers, and confirmations.
- No horizontal scrolling except code blocks and tab strips.

### Typography

- Body: 16–18px, line-height 1.55–1.7.
- Headings: clear hierarchy, no more than three levels in a lesson.
- Code: 13–14px monospace, horizontal scroll, copy button.
- Tables: horizontal scroll wrapper with a visible hint.

### Touch and motion

- Minimum 44×44px, primary actions 48px.
- 8px spacing grid; 12–16px between cards.
- Pressed state is visible within 100ms.
- Sheets slide up, dialogs fade; respect `prefers-reduced-motion`.
- Confetti only on completion, never on navigation.

### Safe areas and keyboard

- Use `env(safe-area-inset-top/bottom)` for fixed bars.
- Inputs scroll into view when the keyboard opens.
- Bottom sheets must not be trapped under the keyboard.
- Test at 390×844 and 360×800.

### Desktop

- Same components, wider container, optional side rail for section navigation.
- Do not build a separate desktop-only product.

---

## 7. Lesson rendering and reading UX

- Lesson header: module, title, reading time, local/authored chip.
- Table of contents: collapsible on mobile, sticky on desktop.
- Section numbers are visual only; they must not break screen-reader order.
- Code blocks: language label, copy, and an explanation directly below.
- Diagrams: render Mermaid; if rendering fails, show the source as a code block.
- Cheat sheet: separate card, high contrast, no nested scroll.
- Exam section: question first, answer behind a reveal control, then "show full
  solution" with the complete reasoning.
- Reading progress bar is optional; do not animate it on every scroll event.
- Completion action is sticky at the end, with a confirmation state.

---

## 8. Achievement/experience data model (proposed)

Keep the server authoritative.

```ts
type XpEvent = {
  id: string;
  userId: string;
  source: 'chapter' | 'exam' | 'flashcard' | 'discussion' | 'streak' | 'module';
  refId: string;          // topicId, examId, threadId, etc.
  amount: number;
  createdAt: string;
  dedupeKey: string;      // unique per user + source + refId + period
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  criterion: string;
  icon: string;
  earnedAt?: string;
  progress?: { current: number; target: number };
};
```

Rules:

- XP is additive and never negative.
- `dedupeKey` makes awards idempotent.
- Level thresholds are monotonic; a level never goes down.
- Badge criteria are evaluated server-side after each event.
- Public profile reads a projection; private fields are stripped server-side.

---

## 9. Testing and acceptance

Do not rely on "it builds". Verify behavior.

- API: `GET /api/learning/content/:topicId` returns `authored: true`,
  `verification.status: 'local'`, and a first section that starts with the
  subject.
- API: a missing authored topic returns an explicit error once the fallback is
  removed.
- Web: open a completed chapter at 390px; no horizontal overflow; body text is
  at least 16px; code scrolls.
- Web: Reading Room opens a full article in-app and shows attribution.
- Web: logout clears the session and returns to guest home.
- Web: profile tabs, privacy toggle, and settings sheet work on mobile.
- Web: discussion post/reply/delete/report flows work with loading and error
  states.
- Web: flashcard review grades and schedules a card; due count updates.
- Web: XP is awarded once per chapter completion; refresh does not duplicate.
- Accessibility: keyboard-only navigation, visible focus, labels on icon
  buttons, contrast checks.

Known environment notes:

- API tests on ARM64 have shown a file-level `free(): invalid pointer` crash;
  CI x86_64 is authoritative.
- Local `pip install` can time out against `files.pythonhosted.org`; do not
  block work on Python-only checks.
- The API needs `PORT=4000 node apps/api/dist/server.js` in this shell; the
  default `PORT` may be `46091`.
- Build/typecheck need `NODE_OPTIONS=--max-old-space-size=4096`.
- `gh` is unavailable in the sandbox, so PR/CI status must be checked outside.

---

## 10. What not to do

- Do not write a module-level lesson and reuse it for every topic.
- Do not generate a lesson at runtime from keywords, templates, or an LLM.
- Do not use the composer, module knowledge packs, seeded kits, or generic
  snippet/diagram libraries as the local lesson.
- Do not add "mental model", "learning objectives", "traps", "build it
  yourself", or "where next" sections.
- Do not add goals to the profile.
- Do not push this branch until the work is reviewed.
- Do not delete the legacy composer until all 259 lessons are authored; when
  you do, delete it completely and make missing lessons fail loudly.

---

## 11. Tomorrow’s exact sequence

1. Read this file and `docs/sprints/SPRINT-1.5.md`.
2. Confirm `git status` and the local commit hash.
3. Author **Computer Organization and Architecture** (7 topics), one lesson per
   topic. Add `lessons/computer-organization.ts`, spread it into
   `TOPIC_LESSONS`, spot-check one rendered pack.
4. Author **Programming and Data Structures** (8 topics), same standard.
5. Author **Algorithms** (9 topics), same standard.
6. Only after those three modules: fix any rendering/formatting issue found in
   the spot-checks.
7. Continue down the queue. Do not skip a module to "finish" the count.
8. ~~When all 259 are authored: remove the legacy composer/module packs/kit
   fallback, add the CI coverage check~~ **DONE 2026-11-10** — composer/packs/kits
   deleted; CI coverage check added (`npm run check:lessons`). The full mobile
   acceptance pass has NOT been re-run; do it before calling the product done.
9. Then and only then: push the branch and update the sprint document.

---

## 12. File map

| File | Purpose |
|---|---|
| `apps/api/src/curriculum.ts` | Source of truth: 259 topics, 35 modules |
| `apps/api/src/topicLessons.ts` | Lesson type, merged registry, `lessonFor`, `missingLessonIds` |
| `apps/api/src/lessons/engineering-mathematics.ts` | 13 authored reference lessons |
| `apps/api/src/lessons/digital-logic.ts` | 7 authored lessons |
| `apps/api/src/authoredPack.ts` | Authored lesson → study-kit renderer |
| `apps/api/src/localPack.ts` | Local content entry point; authored first, legacy fallback below |
| `apps/api/scripts/check-lesson-coverage.ts` | CI coverage gate: 259 topic ids → authored lesson, structural contract |
| `apps/api/src/reader.ts` | In-app article extraction, cache, redirects, SSRF guard |
| `apps/api/src/server.ts` | Learning-content route, reader route, profile PATCH |
| `apps/web/src/pages/learn.tsx` | Local-first lesson UI |
| `apps/web/src/components/Reader.tsx` | Full-article in-app reader |
| `apps/web/src/pages/library.tsx` | Reading Room |
| `apps/web/src/pages/insight.tsx` | Social profile redesign |
| `apps/web/src/styles.css` | Mobile, reader, profile, lesson styles |
| `docs/sprints/SPRINT-1.5.md` | Original sprint issue log |

---

## 13. Definition of finished

Sprint 1.5 is finished when:

- all 259 topics have a distinct authored lesson;
- no local topic can fall back to a composer, module pack, seeded kit, or AI
  fill;
- the local chapter renders instantly and the first section teaches the
  subject;
- the full-article reader works in-app with attribution;
- the profile is a complete social profile with privacy and no goals;
- achievements, XP, levels, and streaks are server-authoritative and
  idempotent;
- discussions and flashcards work end to end on a 390px phone;
- logout, formatting, cheat sheets, and reading redirects are all verified;
- the mobile acceptance checklist passes at 390×844 and 360×800.

Until then, the work is not done. Do not describe it as done.
