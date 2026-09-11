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
Dean → Researcher → Notes Author → Practice Team → Fact-Checker → Publisher
```

- **Dean** scopes the topic to the learner's level and daily budget.
- **Researcher** hybrid-retrieves Qdrant evidence (vector + keyword rerank);
  unindexed topics get labeled curriculum-preview briefs instead of failing.
- **Notes Author** writes 5–7 substantial sections with `claimIds` per section.
- **Practice Team** derives flashcards/quiz/PYQs **only** from verified claims.
- **Fact-Checker** enforces the gate: ≥2 independent sources, every claim cited
  twice, every artifact carrying provenance. Rejects fail the job visibly.
- **Publisher** assembles the package. State checkpoints (`EDUSWARM_STATE_DIR`)
  plus job leases make execution resumable (`/resume`).

### Specialist sessions (stateful chat)

Seven persistent personas share one RAG-grounded chat endpoint with per-agent
system prompts and local fallback playbooks: Socratic Tutor, PYQ Coach, Doubt
Solver, Code Reviewer, Mock Examiner, Revision Planner, Career Mentor.

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

## 8. Roadmap

- **Now:** seed Qdrant in production (`seed_knowledge.py`), add provider
  fallback models, per-subject mock blueprints.
- **Next:** group study rooms + shared mocks, flexible rubric evaluations for
  subjective answers, voice doubt input, PWA offline kits.
- **Later:** interview simulator with resume mapping, institute dashboards,
  regional-language lesson variants, learning-graph recommendations across
  universes.
