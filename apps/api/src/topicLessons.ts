/**
 * Authored topic lessons — the primary local content source.
 *
 * Every topic in the curriculum gets its own lesson entry. These are not
 * runtime-generated, not module-level templates, and not shared between
 * topics. A lesson opens with the subject itself (definition, theory, worked
 * examples), and only puts revision/meta material at the very end.
 */
export type TopicLesson = {
  /** What the topic is, in plain language. Actual subject content from word one. */
  intro: string;
  /** Foundations: definitions, notation, rules, scope, and how the topic works. */
  foundations: string;
  /** Core concepts, each a real teachable section. */
  concepts: Array<{ title: string; body: string }>;
  /** Worked examples with complete solutions. */
  worked: Array<{ title: string; body: string }>;
  /** Exam-style practice with full solutions, including why wrong answers fail. */
  exam: Array<{ question: string; answer: string }>;
  /** Dense revision lines, shown as a separate cheat-sheet card. */
  cheat: string[];
  /** Short closing summary of the actual subject (not study advice). */
  recap: string;
  /** Optional code walkthrough for technical topics. */
  code?: { title: string; language: string; code: string; explanation: string };
  /** Optional visual map. */
  diagram?: { title: string; caption: string; mermaid: string };
};

import { engineeringMathematics } from './lessons/engineering-mathematics.js';
import { digitalLogic } from './lessons/digital-logic.js';

export const TOPIC_LESSONS: Record<string, TopicLesson> = {
  ...engineeringMathematics,
  ...digitalLogic,
};

export function lessonFor(topicId: string): TopicLesson | undefined {
  return TOPIC_LESSONS[topicId];
}

/** Build-time integrity: every topic id in the curriculum must be authored. */
export function missingLessonIds(topicIds: string[]): string[] {
  return topicIds.filter((id) => !TOPIC_LESSONS[id]);
}
