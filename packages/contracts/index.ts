export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type GoalType = 'gate-cs' | 'web-dev' | 'ai-ml' | 'other';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface UserGoal { id: string; type: GoalType; title: string; progress: number; paused: boolean; }
export interface Topic { id: string; title: string; description: string; prerequisites: string[]; status: 'locked' | 'available' | 'complete'; }
export interface AgentEvent { jobId: string; stage: string; agent: string; message: string; status: JobStatus; timestamp: string; }
export interface TopicPackage { topicId: string; title: string; verification: { status: 'approved' | 'rejected'; sources: string[]; claimsChecked: number }; notes: { sections: { heading: string; body: string }[] }; videos: { title: string; url: string; timestamp: string }[]; flashcards: { question: string; answer: string }[]; quiz: { question: string; options: string[]; answer: number }[]; pyqs: { year: number; question: string; difficulty: string }[]; }
