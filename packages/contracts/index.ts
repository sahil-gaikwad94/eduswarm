export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type GoalType = 'gate-cs' | 'web-dev' | 'ai-ml' | 'other';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export interface Evidence { id: string; title: string; url: string; excerpt: string; }
export interface Claim { text: string; evidenceIds: string[]; }

export interface UserGoal { id: string; type: GoalType; title: string; progress: number; paused: boolean; }
export interface Topic { id: string; title: string; description: string; prerequisites: string[]; status: 'locked' | 'available' | 'complete'; }
export interface AgentEvent { jobId: string; stage: string; agent: string; message: string; status: JobStatus; timestamp: string; }
export interface TopicPackage { topicId: string; title: string; verification: { status: 'approved' | 'rejected'; sources: string[]; claimsChecked: number }; notes: { sections: { heading: string; body: string; claimIds?: number[] }[] }; videos: { title: string; url: string; timestamp: string }[]; flashcards: { question: string; answer: string; claimIds?: number[] }[]; quiz: { question: string; options: string[]; answer: number; explanation?: string; claimIds?: number[] }[]; pyqs: { year: number; question: string; difficulty: string; claimIds?: number[] }[]; }

// ---------------------------------------------------------------- platform
export type MasteryBand = 'nascent' | 'developing' | 'strong' | 'mastered';
export interface TopicMastery { topicId: string; score: number; band: MasteryBand; attempts: number; accuracy: number; completed: boolean; }
export interface ModuleMastery { module: string; score: number; completed: number; topics: number; }
export interface LevelInfo { level: number; into: number; needed: number; progress: number; }
export interface StreakInfo { current: number; longest: number; activeToday: boolean; activeDays: number; }
export interface NextAction { kind: string; icon: string; title: string; detail: string; page: string; topicId?: string; }
export interface Dashboard {
  goal: string; xp: number; level: LevelInfo; streak: StreakInfo;
  completedTopics: number; totalTopics: number; accuracy: number; totalAttempts: number;
  dueReviews: number; mistakes: number; mastery: ModuleMastery[]; topicMastery: TopicMastery[];
  nextActions: NextAction[]; insights: string[];
  week: Array<{ date: string; attempts: number; correct: number; xp: number }>;
}
export interface PlanBlock { kind: string; title: string; detail: string; minutes: number; topicId?: string; page?: string; }
export interface StudyPlan { goal: string; date: string; provider: string; totalMinutes: number; intensity: string; blocks: PlanBlock[]; }
export interface QuizQuestion {
  id: string; course: string; source: string; year: number; subject: string; topic: string;
  difficulty: 'easy' | 'medium' | 'hard'; marks: number; question: string; options: string[]; answer: number; explanation: string;
}
export interface MockResult {
  score: number; maxMarks: number; correct: number; wrong: number; skipped: number;
  accuracy: number; pct: number; timeUsedSec: number;
  perQuestion: Array<{ id: string; selected: number | null; correctAnswer: number; isCorrect: boolean; skipped: boolean; marks: number; delta: number }>;
}
export interface CodeTestCase { args: unknown[]; expected: unknown; label?: string; }
export interface CodeChallenge {
  id: string; title: string; difficulty: 'easy' | 'medium' | 'hard'; subject: string; topic: string;
  prompt: string; signature: string; starter: string; hints: string[];
  examples: CodeTestCase[]; testCount: number;
}
export interface CodeRunResult {
  ok: boolean; error?: string; logs: string[]; passed: number; total: number; solved?: boolean;
  cases: Array<{ label: string; passed: boolean; actual?: unknown; expected?: unknown; error?: string }>;
}
export interface Achievement { id: string; title: string; desc: string; unlocked: boolean; current: number; target: number; }
export interface FlashcardDue { cardKey: string; topicId: string; question: string; answer: string; fresh: boolean; }
