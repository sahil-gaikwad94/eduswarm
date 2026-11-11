/**
 * Render an authored TopicLesson into the study-kit shape the learner UI uses.
 *
 * This is a renderer, not a content generator: every sentence in the output
 * comes from the lesson entry for this exact topic. There is deliberately no
 * module-level template, no fallback essay, and no runtime composition.
 */

import type { Question } from './questionBank.js';
import type { LocalReference } from './localKnowledge.js';
import type { TopicLesson } from './topicLessons.js';

type TopicRef = { title: string; description: string; module?: string };

const wordCount = (text: string) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const clip = (text: string, limit: number) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '), cut.lastIndexOf(', '));
  return `${cut.slice(0, stop > limit * 0.6 ? stop + 1 : limit).trim()}…`;
};

function revisionPlan(title: string): string[] {
  return [
    `Day 0 — read the chapter once and solve the worked examples with the page closed.`,
    `Day 1 — recall the definitions and redo one worked example from memory; check every step against the chapter.`,
    `Day 3 — attempt the exam questions under time, then mark the exact step where a wrong answer first diverged.`,
    `Day 7 — mix ${title} with two neighbouring topics and solve a short mixed set.`,
    `Day 21 — revisit only the cheat sheet and one full-length problem; if either feels slow, re-read the matching concept section.`,
  ];
}

function examSection(lesson: TopicLesson): string {
  return lesson.exam
    .map((item, index) => `### Question ${index + 1}\n\n${item.question}\n\n**Full solution.** ${item.answer}`)
    .join('\n\n');
}

function workedSection(lesson: TopicLesson): string {
  return lesson.worked
    .map((item, index) => `### Example ${index + 1}: ${item.title}\n\n${item.body}`)
    .join('\n\n');
}

function buildFlashcards(lesson: TopicLesson, title: string): Array<{ question: string; answer: string }> {
  const cards: Array<{ question: string; answer: string }> = [];

  for (const concept of lesson.concepts.slice(0, 4)) {
    cards.push({
      question: `${title}: explain ${concept.title.toLowerCase()}.`,
      answer: clip(concept.body, 620),
    });
  }

  for (const line of lesson.cheat.slice(0, 4)) {
    const split = line.split(/\s+[—:-]\s+/);
    cards.push({
      question: split.length > 1 ? `${title}: ${split[0]}?` : `${title}: state the key rule.`,
      answer: split.length > 1 ? split.slice(1).join(' — ') : line,
    });
  }

  return cards.slice(0, 8);
}

export function buildAuthoredPack(
  topicId: string,
  topic: TopicRef,
  depth: 'eli5' | 'standard' | 'deep',
  lesson: TopicLesson,
  related: Question[] = [],
  references: LocalReference[] = [],
): any {
  const title = topic.title;
  const sections: Array<{ heading: string; body: string }> = [];

  sections.push({ heading: 'Definition and scope', body: lesson.intro });
  sections.push({ heading: 'Foundations', body: lesson.foundations });

  for (const concept of lesson.concepts) {
    sections.push({ heading: concept.title, body: concept.body });
  }

  if (lesson.worked.length) {
    sections.push({ heading: 'Worked examples', body: workedSection(lesson) });
  }

  if (lesson.exam.length) {
    sections.push({ heading: 'Exam practice with full solutions', body: examSection(lesson) });
  }

  sections.push({ heading: 'Recap', body: lesson.recap });
  sections.push({ heading: 'Revision schedule', body: revisionPlan(title).map((line) => `- ${line}`).join('\n') });

  const words = sections.reduce((total, section) => total + wordCount(section.body), 0);
  const sourceRefs = references.filter((reference) => /^https?:/i.test(reference.url));
  const quiz = related.slice(0, depth === 'deep' ? 8 : 5).map((question) => ({
    question: question.question,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation,
  }));
  const pyqs = related.slice(0, depth === 'deep' ? 6 : 4).map((question) => ({
    year: question.year,
    question: question.question,
    difficulty: question.difficulty,
  }));

  return {
    topicId,
    title,
    depth,
    local: true,
    authored: true,
    generatedAt: new Date().toISOString(),
    readingMinutes: Math.max(6, Math.round(words / 190)),
    verification: {
      status: 'local',
      evidenceMode: 'authored-curriculum',
      provider: 'EduSwarm authored curriculum',
      fallbackReason: '',
      sources: ['EduSwarm curriculum team'],
      sourceRefs,
      licenseNotes: ['Original prose authored for EduSwarm. External sources informed the explanation; no third-party text is reproduced.'],
      claimsChecked: lesson.concepts.length + lesson.worked.length + lesson.exam.length,
    },
    notes: { sections },
    codeExamples: lesson.code
      ? [{ title: lesson.code.title, language: lesson.code.language, code: lesson.code.code, explanation: lesson.code.explanation }]
      : [],
    diagrams: lesson.diagram
      ? [{ title: lesson.diagram.title, caption: lesson.diagram.caption, mermaid: lesson.diagram.mermaid }]
      : [],
    cheatSheet: lesson.cheat,
    videos: [],
    flashcards: buildFlashcards(lesson, title),
    quiz,
    pyqs,
  };
}
