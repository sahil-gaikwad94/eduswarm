/**
 * Lesson Composer
 * ---------------
 * Builds a long-form chapter from an authored module pack plus topic-specific
 * knowledge. The chapter leads with the subject itself:
 *
 *   definition → foundations → key facts → core concepts → worked examples
 *   → exam practice with full solutions → recap → revision schedule (last).
 *
 * No study-coach preamble, no "mental model" framing before the teaching.
 * The learner reads the actual topic first; reflection and spacing come at the
 * end, where they belong.
 */

import { getTopic } from './curriculum.js';
import type { Question } from './questionBank.js';
import type { LocalKnowledge, LocalReference } from './localKnowledge.js';
import { MODULE_KNOWLEDGE, type ConceptCard, type ModulePack } from './moduleKnowledge.js';

export type ComposeDepth = 'eli5' | 'standard' | 'deep';

export type ComposeTopic = { title: string; description: string; module?: string };

export type ComposeInput = {
  topicId: string;
  topic: ComposeTopic;
  depth: ComposeDepth;
  knowledge: LocalKnowledge;
  related: Question[];
  snippets: { title: string; language: string; code: string; explanation: string }[];
  diagrams: { title: string; caption: string; mermaid: string }[];
  references: LocalReference[];
};

type Section = { heading: string; body: string };

const wordCount = (text: string) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

function firstSentence(text: string): string {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  const match = clean.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : clean).trim();
}

function tokenize(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((word) => word.length > 2);
}

/** Rank concept cards by relevance to this exact topic. */
function rankConcepts(pack: ModulePack | undefined, topic: ComposeTopic): { card: ConceptCard; score: number; index: number }[] {
  if (!pack) return [];
  const haystack = `${topic.title} ${topic.description}`.toLowerCase();
  const titleTokens = new Set(tokenize(topic.title));
  return pack.concepts
    .map((card, index) => {
      let score = 0;
      for (const keyword of card.keywords) {
        if (haystack.includes(keyword.toLowerCase())) score += 5 + keyword.split(/\s+/).length * 2;
      }
      for (const token of tokenize(card.title)) if (titleTokens.has(token)) score += 7;
      return { card, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

function primaryConcepts(ranked: { card: ConceptCard; score: number; index: number }[], limit: number): ConceptCard[] {
  const primary = ranked.filter((item) => item.score > 0).slice(0, limit);
  // Keep the authored module order inside the primary set so the narrative
  // still flows from definitions to applications.
  return primary.sort((a, b) => a.index - b.index).map((item) => item.card);
}

function widerConcepts(ranked: { card: ConceptCard; score: number; index: number }[], limit: number): ConceptCard[] {
  return ranked.filter((item) => item.score <= 0).slice(0, limit).map((item) => item.card);
}

/** Worked examples that actually mention this topic's vocabulary. */
function relevantWorked(pack: ModulePack | undefined, topic: ComposeTopic, limit: number): { title: string; body: string }[] {
  if (!pack?.worked?.length) return [];
  const haystack = `${topic.title} ${topic.description}`.toLowerCase();
  const scored = pack.worked.map((example, index) => {
    const text = `${example.title} ${example.body}`.toLowerCase();
    const score = tokenize(topic.title).filter((token) => token.length > 3 && text.includes(token)).length;
    return { example, index, score };
  });
  const relevant = scored.filter((item) => item.score > 0).slice(0, limit);
  return (relevant.length ? relevant : scored.slice(0, Math.min(limit, 1)))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.example);
}

function prerequisiteLine(topicId: string): string {
  const current = getTopic(topicId);
  const prereqs = (current?.prerequisites || [])
    .map((id) => getTopic(id))
    .filter(Boolean)
    .map((item) => item!.title);
  if (!prereqs.length) return '';
  return `*Builds on: ${prereqs.join('; ')}.*`;
}

function bankSection(questions: Question[], limit: number): Section | null {
  if (!questions.length) return null;
  const blocks = questions.slice(0, limit).map((question, index) => {
    const options = question.options.map((option, optionIndex) => `- **${String.fromCharCode(65 + optionIndex)}.** ${option}`).join('\n');
    const answer = question.options[question.answer] ?? 'See explanation';
    return `**Q${index + 1} — ${question.subject}${question.year ? `, ${question.year}` : ''}.** ${question.question}\n\n${options}\n\n**Solution.** **${String.fromCharCode(65 + question.answer)}. ${answer}** — ${question.explanation}`;
  });
  return {
    heading: 'Exam practice: solve before reading the solution',
    body: `Work each question on paper first, then check the solution.\n\n${blocks.join('\n\n')}`,
  };
}

function shortAnswerSection(pack: ModulePack | undefined, startAt: number, limit: number): Section | null {
  if (!pack?.exam?.length) return null;
  const blocks = pack.exam.slice(0, limit).map((item, index) => `**Q${startAt + index + 1}.** ${item.question}\n\n**Solution.** ${item.answer}`);
  return {
    heading: 'Exam practice: short answers',
    body: blocks.join('\n\n'),
  };
}

function recapSection(topic: ComposeTopic, knowledge: LocalKnowledge, pack: ModulePack | undefined, concepts: ConceptCard[]): Section {
  const points = concepts.map((card) => `- **${card.title}.** ${firstSentence(card.body)}`).join('\n');
  const rule = knowledge.cheatSheet?.[0] || pack?.cheat?.[0] || '';
  return {
    heading: 'Recap',
    body: `${points}${rule ? `\n\n**The one-line rule.** ${rule}` : ''}`,
  };
}

function revisionSection(topic: ComposeTopic): Section {
  return {
    heading: 'Revision schedule',
    body: `- **Today:** re-derive the main worked example from a blank page.\n- **Tomorrow:** answer the exam-practice questions again without looking.\n- **In 3 days:** solve one mixed question from a neighbouring topic.\n- **In 7 days:** explain ${topic.title} aloud in two minutes using one diagram.\n- **In 30 days:** take a mixed practice set and attempt this topic cold.`,
  };
}

export function composeLesson(input: ComposeInput): any {
  const { topicId, topic, depth, knowledge, related, snippets, diagrams, references } = input;
  const pack = MODULE_KNOWLEDGE[topic.module || ''] as ModulePack | undefined;
  const conceptLimit = depth === 'eli5' ? 5 : depth === 'deep' ? 10 : 8;
  const ranked = rankConcepts(pack, topic);
  const concepts = primaryConcepts(ranked, conceptLimit);
  const wider = widerConcepts(ranked, depth === 'eli5' ? 2 : depth === 'deep' ? 5 : 3);
  const sections: Section[] = [];

  // 1 — The subject itself. Definition, explanation, scope.
  // Hand-authored flagship entries are topic-specific. Broad profile entries
  // cover whole module families, so their study heuristics and examples are
  // not forced onto a topic they were not written for; the module pack below
  // is the reliable spine for every other topic.
  const topicSpecific = knowledge.tier === 'flagship';
  const definition = topicSpecific
    ? `**${topic.title}** is ${knowledge.focus}. ${topic.description}\n\n${knowledge.mentalModel}${pack?.overview ? `\n\n${pack.overview}` : ''}`
    : `**${topic.title}.** ${topic.description}${pack?.overview ? `\n\n${pack.overview}` : ''}`;
  const prereq = prerequisiteLine(topicId);
  sections.push({
    heading: `What ${topic.title} is`,
    body: `${definition}${prereq ? `\n\n${prereq}` : ''}`,
  });

  // 2 — The theory this topic stands on.
  if (pack?.foundations?.length) {
    sections.push({
      heading: 'Foundations',
      body: pack.foundations.join('\n\n'),
    });
  }

  // 3 — The topic's load-bearing facts, stated plainly.
  if (topicSpecific && knowledge.mechanics?.length) {
    sections.push({
      heading: 'Key facts',
      body: knowledge.mechanics.map((item) => `- ${item}`).join('\n'),
    });
  }

  // 4 — Core concepts, each as its own teachable segment. The first concepts
  // are the ones that genuinely match this topic; the rest of the module is
  // kept as clearly-labelled wider reading so the chapter is long without
  // pretending unrelated material is the main lesson.
  for (const card of concepts) {
    sections.push({ heading: card.title, body: card.body });
  }
  if (wider.length) {
    sections.push({
      heading: `Wider module reading: ${topic.module || 'related material'}`,
      body: wider.map((card) => `### ${card.title}\n\n${card.body}`).join('\n\n'),
    });
  }

  // 5 — Worked examples in full, ranked by how clearly they belong here.
  const workedLimit = depth === 'eli5' ? 2 : depth === 'deep' ? 4 : 3;
  const worked: { title: string; body: string }[] = [];
  if (topicSpecific && knowledge.workedExample) {
    worked.push({ title: topic.title, body: knowledge.workedExample });
  }
  for (const example of relevantWorked(pack, topic, Math.max(1, workedLimit - worked.length))) worked.push(example);
  worked.slice(0, workedLimit).forEach((example) => {
    sections.push({
      heading: `Worked example: ${example.title}`,
      body: example.body,
    });
  });

  // 6 — Exam practice with answers.
  const bank = bankSection(related, depth === 'eli5' ? 4 : depth === 'deep' ? 8 : 6);
  if (bank) sections.push(bank);
  const shortAnswers = shortAnswerSection(pack, Math.min(related.length, depth === 'eli5' ? 4 : depth === 'deep' ? 8 : 6), depth === 'eli5' ? 2 : depth === 'deep' ? 4 : 3);
  if (shortAnswers) sections.push(shortAnswers);

  // 7 — Technical recap, then the only meta section at the very end.
  sections.push(recapSection(topic, knowledge, pack, concepts));
  sections.push(revisionSection(topic));

  // Structured lesson assets.
  const codeExamples = [topicSpecific ? knowledge.code : undefined, pack?.code, ...snippets]
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((candidate: any) => candidate.title === (item as any).title) === index)
    .slice(0, depth === 'deep' ? 3 : 2)
    .map((item: any) => ({ title: item.title, language: item.language, code: item.code, explanation: item.explanation }));

  const cheatSheet = Array.from(new Set([
    ...(topicSpecific ? knowledge.cheatSheet || [] : []),
    ...(pack?.cheat || []),
  ])).slice(0, depth === 'deep' ? 10 : 7);

  const flashcardPool = [
    { question: `Define ${topic.title}.`, answer: firstSentence(knowledge.mentalModel) },
    ...concepts.map((card) => ({ question: `Explain ${card.title} in ${topic.title}.`, answer: card.body })),
    ...(topicSpecific ? knowledge.mechanics.slice(0, 5).map((item, index) => ({ question: `${topic.title}: key fact ${index + 1}?`, answer: item })) : []),
    ...related.slice(0, 3).map((question) => ({ question: question.question, answer: `${question.options[question.answer]} — ${question.explanation}` })),
  ].filter((item) => item.answer && item.question);
  const flashcards = flashcardPool.slice(0, depth === 'eli5' ? 6 : depth === 'deep' ? 10 : 8);

  const quiz = related.slice(0, depth === 'eli5' ? 3 : depth === 'deep' ? 6 : 5).map((question) => ({
    question: question.question,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation,
  }));

  const allDiagrams = [topicSpecific ? knowledge.diagram : undefined, ...diagrams]
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((candidate: any) => candidate.title === (item as any).title) === index)
    .slice(0, 2)
    .map((item: any) => ({ title: item.title, caption: item.caption, mermaid: item.mermaid }));

  const totalWords = sections.reduce((total, section) => total + wordCount(section.heading) + wordCount(section.body), 0);

  return {
    topicId,
    title: topic.title,
    depth,
    generatedAt: new Date().toISOString(),
    readingMinutes: Math.max(7, Math.round(totalWords / 200)),
    verification: {
      status: 'local',
      evidenceMode: 'authored-curriculum',
      provider: 'EduSwarm authored curriculum',
      fallbackReason: '',
      sources: references.map((reference) => `${reference.publisher}: ${reference.title}`),
      sourceRefs: references,
      claimsChecked: related.length,
    },
    notes: { sections },
    codeExamples,
    diagrams: allDiagrams,
    cheatSheet,
    videos: references.map((reference) => ({ title: `${reference.publisher}: ${reference.title}`, url: reference.url, timestamp: 'Next step' })),
    flashcards,
    quiz,
    pyqs: related.slice(0, 4).map((question) => ({ year: question.year, question: question.question, difficulty: question.difficulty })),
  };
}
