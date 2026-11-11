/**
 * EduSwarm Local Study-Kit Generator
 * ----------------------------------
 * Serves the authored curriculum chapter for a topic, instantly, with no LLM
 * call and no fallback essay. One topic, one lesson: `lessonFor(topicId)` is
 * the only source of local content, rendered by `buildAuthoredPack`.
 *
 * A missing authored lesson is a build/test failure, never a learner-facing
 * generic chapter.
 */

import { QUESTION_BANK, type Question } from './questionBank.js';
import { referencesFor } from './localKnowledge.js';
import { lessonFor } from './topicLessons.js';
import { buildAuthoredPack } from './authoredPack.js';

export type PackDepth = 'eli5' | 'standard' | 'deep';
export type TopicRef = { title: string; description: string; module?: string };

function haystackOf(topic: TopicRef): string {
  return `${topic.title} ${topic.description} ${topic.module || ''}`.toLowerCase();
}

/** Related bank questions for quizzes and PYQ panels in the authored pack. */
export function relatedQuestions(topic: TopicRef, limit = 6): Question[] {
  const haystack = haystackOf(topic);
  const words = new Set(haystack.split(/[^a-z0-9+]+/).filter((w) => w.length > 2));
  const scored = QUESTION_BANK.map((q) => {
    const text = `${q.question} ${q.subject} ${q.topic}`.toLowerCase();
    let score = 0;
    for (const word of words) if (text.includes(word)) score += word.length > 5 ? 2 : 1;
    if (haystack.includes(q.subject.toLowerCase())) score += 4;
    if (haystack.includes(q.topic.toLowerCase())) score += 6;
    return { q, score };
  });
  return scored.filter((s) => s.score > 2).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.q);
}

/**
 * Build the local study pack for a topic.
 *
 * Throws when no authored lesson is registered — there is no legacy composer,
 * module pack, seeded kit, or module-level essay behind this function anymore.
 */
export function buildLocalPack(topicId: string, topic: TopicRef, depth: PackDepth = 'standard'): any {
  const authored = lessonFor(topicId);
  if (!authored) {
    throw new Error(
      `No authored lesson registered for topic "${topicId}"${topic.module ? ` (module "${topic.module}")` : ''}. ` +
      `Every curriculum topic must have an authored lesson in apps/api/src/lessons/<module>.ts that is spread into ` +
      `TOPIC_LESSONS in apps/api/src/topicLessons.ts. Register it before rendering, or run npm run check:lessons to see what is missing.`,
    );
  }
  return buildAuthoredPack(
    topicId,
    topic,
    depth,
    authored,
    relatedQuestions(topic, depth === 'deep' ? 10 : 6),
    referencesFor({ ...topic, id: topicId }),
  );
}
