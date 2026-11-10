# EduSwarm Lesson Authoring Standards — v2 (Sprint 1.5)

## 0. The one rule that beats all others

**One topic = one lesson. One authored file per module. No runtime composition, no templates, no AI fill-in, no module-level essay reused across topics.** Every sentence in the rendered chapter comes from the `TopicLesson` entry for that exact topic.

---

## 1. Anatomy of a TopicLesson (the contract)

```ts
type TopicLesson = {
  intro: string;          // definition & scope — subject content in sentence 1
  foundations: string;    // notation, rules, assumptions, scope
  concepts: [{title, body}];        // one teachable section per concept
  worked: [{title, body}];          // complete worked solutions, every step shown
  exam: [{question, answer}];       // exam questions w/ full solutions + why-distractors-fail
  cheat: string[];        // 6–9 dense lines; rules/formulas/distinctions, memorize-able
  recap: string;          // short subject summary (NOT study advice)
  code?: {title, language, code, explanation};  // runnable, explained, language-appropriate
  diagram?: {title, caption, mermaid};          // real concept map, not decoration
};
```

### Required render order (matches `authoredPack.ts`)

1. Definition and scope (`intro`) — headed as the subject, NOT "objectives"
2. Foundations (`foundations`)
3. Core concepts — one heading per concept
4. Worked examples (`worked`) — every step shown, solvable from text alone
5. Exam practice (`exam`) — questions first, full solutions, trap explanation
6. Recap (`recap`)
7. Revision schedule (`revisionPlan` from `authoredPack.ts`, LAST)

Code, diagrams, cheat sheet are separate structured UI assets — never buried in prose.

---

## 2. Style rules (non-negotiable)

| Rule | Do | Don't |
|---|---|---|
| Opening sentence | Teach the subject immediately | No "mental model", no "why this matters", no objectives preamble |
| Meta material | Revision schedule is the ONLY meta section, at the very end | No "traps", "build it yourself", "where next", "learning objectives" |
| Prose | Original writing. Research informs; you write. | Paste or lightly paraphrase a source. |
| Paragraphs | One idea per paragraph; short paragraphs on mobile | Walls of bold text |
| Bold | Key terms and warnings | Whole sentences |
| Notation | Consistent symbol for the same object throughout | Mixed notation |
| Code | Syntax-highlightable, scrollable, language-appropriate to the track | JS in a Python lesson; Python in a GATE lesson |
| Length | 1,200+ substantive words; reference grade 1,400–1,900 | Filler, repeated definitions, generic study advice |
| Examples | Every concept has a concrete example or precise rule | Definition-only concepts |

---

## 3. Per-section depth guide

### intro (~120–200 words)
- What the topic IS in one strong first sentence.
- Scope: what it covers, what it does NOT cover in this lesson.
- Why it matters for the learner's track (GATE / web-dev / ai-ml) in 2–3 sentences — grounded in the subject, not motivation fluff.

### foundations (~200–350 words)
- Notation and definitions used throughout.
- Governing rules/laws the topic runs on.
- Edge cases and boundary assumptions.
- The "vocabulary" the learner must know.

### concepts (6–10 sections, each ~150–300 words)
- Each section: definition → why it works → worked mini-example → boundary/edge case.
- Build progressively: prerequisites first.
- Use tables where they compress (e.g., algorithm comparison, normal forms).
- Use Mermaid diagrams for structural relationships.

### worked (4–6 examples)
- Title = the task. Body = complete solution, every step shown, with intermediate values.
- Each solvable from the text alone.
- At least one example that exercises an edge case.

### exam (≥4 questions)
- Realistic format: MCQs with 4 options for GATE; short-answer style for others.
- Answer = full solution + explicit explanation of why each wrong-looking option fails.

### cheat (6–9 lines)
- Dense rules, formulas, distinctions. Memorize-able at a glance on 390px.
- No intro restatement; no vague "understand the concept".

### recap (~80–150 words)
- The subject in miniature. What to retain after closing the chapter.

### code (if technical)
- Runnable in the stated language.
- Explanation must name the invariant/principle, not paraphrase syntax.
- Language by track: web-dev → JS/TS/HTML/SQL; ai-ml → Python/SQL; gate-cs → Python + C-style where C is the exam language.

### diagram (if useful)
- A real concept map / state machine / data flow.
- Caption states the one thing to take away.

---

## 4. Language correctness matrix

| Track | Code language | Notes |
|---|---|---|
| gate-cs | Python for algorithms; C/C++ for OS / data structures where exam-relevant; pseudocode for proofs | GATE exams use C for the programming section |
| web-dev | JavaScript / TypeScript / HTML / SQL | Never Python snippets here |
| ai-ml | Python (NumPy, pandas, PyTorch, scikit-learn) | Never JS here |

---

## 5. Quality bar examples (from the reference modules)

Study these before writing:
- `apps/api/src/lessons/engineering-mathematics.ts` — 13 topics, reference-quality prose.
- `apps/api/src/lessons/digital-logic.ts` — 7 topics, gate/FSM worked examples.

Every concept in those files has a concrete example or precise rule. Every worked example can be solved from the text alone. Every exam answer explains why the wrong-looking answer is wrong. **Replicate that quality for all 259 topics.**

---

## 6. Definition of done per module

- [ ] Every topic ID in the module has its own entry in `lessons/<module>.ts`.
- [ ] Module file imported & spread into `TOPIC_LESSONS` in `topicLessons.ts`.
- [ ] No entry reuses another topic's prose.
- [ ] Word count in range (≥1,200; target 1,400–1,900).
- [ ] No placeholder sentences ("TODO", "insert example here").
- [ ] Cheat sheet 6–9 dense lines.
- [ ] Code example runnable & explained (technical topics).
- [ ] Diagram a real concept map (when useful).
- [ ] Exam section ≥4 questions with full solutions.

---

## 7. Authoring process (one module at a time)

1. Read the module's topics in `curriculum.ts` (title + description).
2. Research primary/standard sources (textbooks, RFCs, official docs, papers) for correctness and coverage.
3. Write the module file `apps/api/src/lessons/<module>.ts` with all topics.
4. Update `apps/api/src/topicLessons.ts` to import & spread the module.
5. Run the integrity check: `node /tmp/count_authored.cjs` → missing = 0.
6. Optionally spot-check one topic renders (build + `GET /api/learning/content/:id`).

---

## 8. After all 259 are authored (the cleanup pass) — DONE 2026-11-10

1. ✅ Delete `lessonComposer.ts`, `moduleKnowledge.ts`, and the kit-fallback path in `localPack.ts` (done; `kitStore.ts` and `scripts/seed-kits.mjs` deleted too; `doubtBrain.ts` was untouched — it never depended on the composer).
2. ✅ `buildLocalPack` throws a clear error when `lessonFor(topicId)` is missing (no fallback → build/test failure; covered by `server.test.ts` → "a missing authored lesson fails loudly").
3. ✅ CI coverage check exists and runs in CI — `apps/api/scripts/check-lesson-coverage.ts` (`npm run check:lessons`), prints missing ids and exits non-zero; wired into `.github/workflows/ci.yml`.
4. ✅ `SPRINT-1.5.md` updated — status changed to reworked content leg, with an honest rework log and remaining items (mobile acceptance NOT re-run).

---

## 9. Inspirations used for lesson design

- **Brilliant.org** — atomic lessons: one concept, one worked interactive step, one self-check, one named trap.
- **Harvard CS50x** — lecture → worked trace → practice loop; correctness, design, style.
- **MIT OCW 6.006 / 6.042** — problem sets + quizzes as the primary teaching instrument.
- **NPTEL** — lecture-grade rigor from IIT/IISc.
- **GATE Overflow / OSTEP / CLRS** — canonical treatments; we write original prose in EduSwarm's voice.
