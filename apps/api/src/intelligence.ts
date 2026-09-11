/**
 * EduSwarm Learning-Intelligence Engine
 * -------------------------------------
 * Pure, provider-independent functions that turn raw learning activity into
 * mastery scores, spaced-repetition schedules, XP/levels, streaks, study
 * plans, mock grades, achievements, and ranked next actions.
 *
 * Everything here is deterministic and testable without a database or LLM,
 * so the platform stays intelligent even when the agent runtime is offline.
 */

export type AttemptLike = {
  questionId?: string;
  correct?: boolean;
  answeredAt?: string;
  subject?: string;
  topic?: string;
};

export type ProgressLike = {
  topicId: string;
  completed?: boolean;
  solvedQuestions?: number;
  reviewedFlashcards?: number;
  attempts?: AttemptLike[];
  updatedAt?: string;
};

export type MasteryBand = 'nascent' | 'developing' | 'strong' | 'mastered';

export type TopicMastery = {
  topicId: string;
  score: number;
  band: MasteryBand;
  attempts: number;
  accuracy: number;
  completed: boolean;
};

export function bandFor(score: number): MasteryBand {
  if (score >= 80) return 'mastered';
  if (score >= 55) return 'strong';
  if (score >= 25) return 'developing';
  return 'nascent';
}

/** Topic mastery: recent accuracy dominates, completion + recall add signal. */
export function masteryForTopic(progress?: ProgressLike | null): TopicMastery {
  const topicId = progress?.topicId || '';
  const attempts = progress?.attempts || [];
  if (!progress || (attempts.length === 0 && !progress.completed)) {
    return { topicId, score: 0, band: 'nascent', attempts: 0, accuracy: 0, completed: false };
  }
  const recent = attempts.slice(-10);
  const accuracy = recent.length ? recent.filter((a) => a.correct).length / recent.length : 0;
  const completed = Boolean(progress.completed);
  const recallBonus = Math.min(progress.reviewedFlashcards || 0, 10);
  const volumeBonus = Math.min(attempts.length, 10);
  const score = Math.max(
    0,
    Math.min(100, Math.round(accuracy * 72 + (completed ? 14 : 0) + recallBonus + volumeBonus * 0.4)),
  );
  return {
    topicId,
    score,
    band: bandFor(score),
    attempts: attempts.length,
    accuracy: Math.round(accuracy * 100),
    completed,
  };
}

// ------------------------------------------------------------------ XP/level

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 6000, 8500];

export function xpForAttempt(correct: boolean, difficulty: string): number {
  if (!correct) return 3; // effort still counts
  if (difficulty === 'hard') return 25;
  if (difficulty === 'medium') return 15;
  return 10;
}

export function levelForXp(xp: number): { level: number; into: number; needed: number; progress: number } {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  const floor = LEVEL_THRESHOLDS[level - 1] || 0;
  const ceiling = LEVEL_THRESHOLDS[level] || floor + 2500;
  const into = Math.max(0, xp - floor);
  const needed = Math.max(1, ceiling - floor);
  return { level, into, needed, progress: Math.min(1, into / needed) };
}

// ------------------------------------------------------- Spaced repetition

export type Sm2State = { efactor: number; intervalDays: number; repetitions: number };

/**
 * SM-2 scheduling. Quality 0..5 (Again=0..2, Hard=3, Good=4, Easy=5).
 * `Again` returns the card within the hour so repair loops stay tight.
 */
export function sm2Schedule(
  quality: number,
  prev: Partial<Sm2State> = {},
  from: Date = new Date(),
): Sm2State & { nextDueAt: string } {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let efactor = prev.efactor ?? 2.5;
  let repetitions = prev.repetitions ?? 0;
  let intervalDays = prev.intervalDays ?? 0;

  efactor = Math.max(1.3, efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  if (q < 3) {
    repetitions = 0;
    intervalDays = q === 0 ? 1 / 144 : 1 / 24; // 10 min / 1 hr re-repair
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round((prev.intervalDays || 6) * efactor * (q === 5 ? 1.3 : 1));
  }
  const nextDueAt = new Date(from.getTime() + intervalDays * 86_400_000).toISOString();
  return { efactor: Math.round(efactor * 100) / 100, intervalDays, repetitions, nextDueAt };
}

// -------------------------------------------------------------------- streak

export function dateKey(iso: string | Date = new Date()): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export function streakInfo(dateKeys: string[], today = dateKey()): { current: number; longest: number; activeToday: boolean; activeDays: number } {
  const days = [...new Set(dateKeys.filter(Boolean))].sort();
  const set = new Set(days);
  let longest = 0;
  let run = 0;
  let prev = '';
  for (const day of days) {
    const expected = prev ? new Date(new Date(prev).getTime() + 86_400_000).toISOString().slice(0, 10) : day;
    run = day === expected || !prev ? run + 1 : 1;
    prev = day;
    longest = Math.max(longest, run);
  }
  let current = 0;
  let cursor = today;
  if (!set.has(cursor)) cursor = new Date(new Date(cursor).getTime() - 86_400_000).toISOString().slice(0, 10);
  while (set.has(cursor)) {
    current += 1;
    cursor = new Date(new Date(cursor).getTime() - 86_400_000).toISOString().slice(0, 10);
  }
  return { current, longest, activeToday: set.has(today), activeDays: days.length };
}

// ------------------------------------------------------------- mock grading

export type GradeInput = { id: string; answer: number; marks?: number };
export type MockGrade = {
  score: number;
  maxMarks: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  perQuestion: Array<{ id: string; selected: number | null; correctAnswer: number; isCorrect: boolean; skipped: boolean; marks: number; delta: number }>;
};

/** GATE scheme: +marks on correct, −marks/3 on wrong, 0 on skip. */
export function gradeMock(questions: GradeInput[], answers: Record<string, number | null>): MockGrade {
  let score = 0;
  let maxMarks = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  const perQuestion = questions.map((q) => {
    const marks = q.marks || 1;
    maxMarks += marks;
    const selected = answers[q.id] === undefined ? null : answers[q.id];
    if (selected === null || selected === undefined) {
      skipped += 1;
      return { id: q.id, selected: null, correctAnswer: q.answer, isCorrect: false, skipped: true, marks, delta: 0 };
    }
    if (selected === q.answer) {
      correct += 1;
      score += marks;
      return { id: q.id, selected, correctAnswer: q.answer, isCorrect: true, skipped: false, marks, delta: marks };
    }
    wrong += 1;
    const delta = -(marks / 3);
    score += delta;
    return { id: q.id, selected, correctAnswer: q.answer, isCorrect: false, skipped: false, marks, delta: Math.round(delta * 100) / 100 };
  });
  const attempted = correct + wrong;
  return {
    score: Math.round(score * 100) / 100,
    maxMarks,
    correct,
    wrong,
    skipped,
    accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
    perQuestion,
  };
}

// ------------------------------------------------------------ seeded shuffle

export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const output = [...items];
  let state = hashSeed(seed) || 1;
  const rand = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

// ------------------------------------------------------------------- search

export function searchScore(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 70;
  const words = q.split(/\s+/);
  let score = 0;
  for (const word of words) {
    if (word.length < 2) continue;
    if (t.includes(word)) score += t.split(word).length * 6 + (t.startsWith(word) ? 8 : 0);
  }
  return score;
}

// ------------------------------------------------------------- achievements

export type AchievementInput = {
  completedTopics: number;
  totalAttempts: number;
  accuracy: number;
  reviews: number;
  mocksSubmitted: number;
  bestMockPct: number;
  challengesSolved: number;
  comebacks: number;
  streak: number;
};

export type Achievement = { id: string; title: string; desc: string; unlocked: boolean; current: number; target: number };

export function achievementsFor(input: AchievementInput): Achievement[] {
  const defs: Array<[string, string, string, number, number]> = [
    ['first-steps', 'First Steps', 'Complete your first study kit', input.completedTopics, 1],
    ['scholar-5', 'Rising Scholar', 'Complete 5 study kits', input.completedTopics, 5],
    ['scholar-15', 'Deep Scholar', 'Complete 15 study kits', input.completedTopics, 15],
    ['sharpshooter', 'Sharpshooter', 'Hold 80%+ accuracy over 10+ attempts', input.totalAttempts >= 10 ? input.accuracy : 0, 80],
    ['streak-3', 'Warming Up', 'Learn 3 days in a row', input.streak, 3],
    ['streak-7', 'Unstoppable', 'Learn 7 days in a row', input.streak, 7],
    ['reviewer-20', 'Memory Athlete', 'Review 20 flashcards with SRS', input.reviews, 20],
    ['mock-debut', 'Exam Temperament', 'Submit your first mock exam', input.mocksSubmitted, 1],
    ['mock-70', 'Rank Material', 'Score 70%+ in a mock exam', input.bestMockPct, 70],
    ['coder-1', 'Hands On', 'Solve a code-lab challenge', input.challengesSolved, 1],
    ['comeback-kid', 'Comeback Kid', 'Fix a mistake by answering it right later', input.comebacks, 1],
  ];
  return defs.map(([id, title, desc, current, target]) => ({
    id,
    title,
    desc,
    current: Math.min(current, target),
    target,
    unlocked: current >= target,
  }));
}

// ------------------------------------------------------------ adaptive rank

export type Rankable = { id: string; difficulty?: string };

/** IRT-lite: repeated misses first, then unseen, then oldest — tuned by level. */
export function adaptiveRank<T extends Rankable>(
  candidates: T[],
  stats: Map<string, { wrong: number; seen: number; recent: number }>,
  skillLevel = 'beginner',
): T[] {
  const difficultyWeight = (difficulty?: string) => {
    if (skillLevel === 'advanced') return difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 0;
    if (skillLevel === 'intermediate') return difficulty === 'medium' ? 3 : difficulty === 'hard' ? 2 : 1;
    return difficulty === 'easy' ? 3 : difficulty === 'medium' ? 2 : 0;
  };
  return [...candidates].sort((a, b) => {
    const sa = stats.get(a.id) || { wrong: 0, seen: 0, recent: 0 };
    const sb = stats.get(b.id) || { wrong: 0, seen: 0, recent: 0 };
    if (sb.wrong !== sa.wrong) return sb.wrong - sa.wrong;
    if (sa.seen !== sb.seen) return sa.seen - sb.seen;
    const dw = difficultyWeight(b.difficulty) - difficultyWeight(a.difficulty);
    if (dw !== 0) return dw;
    return sa.recent - sb.recent;
  });
}

// --------------------------------------------------------------- study plan

export type PlanTopic = { id: string; title: string; module: string; minutes: number };
export type PlanBlock = { kind: string; title: string; detail: string; minutes: number; topicId?: string; page?: string };

export function generateStudyPlan(input: {
  topics: PlanTopic[];
  mastery: Map<string, TopicMastery>;
  completedIds: Set<string>;
  mistakeTopics: string[];
  dailyMinutes: number;
  dueReviews: number;
  targetDate?: string | null;
}): { totalMinutes: number; intensity: string; blocks: PlanBlock[] } {
  const budget = Math.max(15, Math.min(240, input.dailyMinutes || 60));
  const blocks: PlanBlock[] = [];
  let remaining = budget;

  const take = (minutes: number) => {
    const granted = Math.max(5, Math.min(remaining, minutes));
    remaining -= granted;
    return granted;
  };

  if (input.dueReviews > 0 && remaining >= 10) {
    blocks.push({
      kind: 'review',
      title: `Spaced review · ${input.dueReviews} due card${input.dueReviews === 1 ? '' : 's'}`,
      detail: 'Recall before you re-read. Grade honestly so the scheduler adapts.',
      minutes: take(Math.min(20, 5 + input.dueReviews * 2)),
      page: 'flashcards',
    });
  }
  if (input.mistakeTopics.length > 0 && remaining >= 10) {
    blocks.push({
      kind: 'repair',
      title: `Repair weak spot · ${input.mistakeTopics[0]}`,
      detail: 'Re-solve one missed pattern with a smaller example first.',
      minutes: take(12),
      page: 'mistakes',
    });
  }
  const nextNew = input.topics.find((t) => !input.completedIds.has(t.id));
  if (nextNew && remaining >= 20) {
    blocks.push({
      kind: 'learn',
      title: `New study kit · ${nextNew.title}`,
      detail: `${nextNew.module} — generate notes, then attempt the practice quiz.`,
      minutes: take(Math.min(nextNew.minutes, remaining >= 45 ? 40 : remaining)),
      topicId: nextNew.id,
      page: 'lesson',
    });
  }
  const weak = [...input.mastery.values()]
    .filter((m) => m.attempts > 0 && m.band !== 'mastered')
    .sort((a, b) => a.score - b.score)[0];
  if (weak && remaining >= 10) {
    blocks.push({
      kind: 'drill',
      title: 'Adaptive drill · weakest topic first',
      detail: 'Timed questions biased to your repeated misses.',
      minutes: take(Math.min(20, remaining)),
      topicId: weak.topicId,
      page: 'quiz',
    });
  }
  if (remaining >= 10 && input.completedIds.size >= 3) {
    blocks.push({
      kind: 'mock',
      title: 'Mini mock · exam temperament',
      detail: 'Mixed questions with negative marking and a countdown.',
      minutes: take(remaining),
      page: 'mocks',
    });
  } else if (remaining >= 5 && nextNew) {
    blocks.push({
      kind: 'recall',
      title: 'Write-back recall',
      detail: 'Explain today’s key idea from memory in two sentences.',
      minutes: take(remaining),
      topicId: nextNew.id,
      page: 'lesson',
    });
  }

  let intensity = 'steady';
  if (input.targetDate) {
    const days = Math.ceil((new Date(input.targetDate).getTime() - Date.now()) / 86_400_000);
    if (days <= 30) intensity = 'sprint';
    else if (days <= 90) intensity = 'focused';
  }
  return { totalMinutes: blocks.reduce((n, b) => n + b.minutes, 0), intensity, blocks };
}
