/**
 * EduSwarm Interview Simulator Engine
 * -----------------------------------
 * Real multi-round interviews: warm-up concepts → live coding → deep
 * concepts → system design → behavioral. Each answer is evaluated locally
 * (keyword coverage, code test results, design key points, STAR structure)
 * with coaching feedback, strengths/gaps, and follow-up questions — then a
 * final report with dimension scores, verdict, and study links.
 *
 * Deterministic per interviewId (seeded shuffle) so retrying an interview
 * gives the same questions; evaluation is heuristic but explainable.
 */

import { challengeById, type CodeChallenge } from './challenges.js';
import { runJavaScript } from './codeRunner.js';
import { filterQuestions, questionById, type Question } from './questionBank.js';
import { getCatalog } from './curriculum.js';
import { seededShuffle } from './intelligence.js';
import {
  BEHAVIORAL_PROMPTS, DESIGN_PROMPTS, TRACK_CODE, TRACK_META,
  type BehavioralPrompt, type DesignPrompt, type InterviewTrack,
} from './interviewBank.js';

export type { InterviewTrack };
export type InterviewItemKind = 'concept' | 'code' | 'design' | 'behavioral';
export type InterviewItem = {
  id: string; kind: InterviewItemKind; round: string; title: string;
  timeLimitSec: number; payload: any;
};
export type InterviewFlow = { interviewId: string; track: InterviewTrack; title: string; rounds: string[]; items: InterviewItem[] };
export type EvalResult = { score: number; feedback: string; strengths: string[]; gaps: string[]; followUp: string };
export type InterviewReport = {
  interviewId: string; track: InterviewTrack; overall: number; verdict: string;
  dimensions: { label: string; score: number; note: string }[];
  strengths: string[]; gaps: string[]; studyLinks: { label: string; topicId: string }[]; perItem: EvalResult[];
};

const STOP = new Set('the,a,an,and,or,but,of,to,in,on,for,with,is,are,was,were,be,been,being,it,its,that,this,these,those,as,at,by,from,into,over,after,before,so,than,too,very,can,will,just,should,would,could,has,have,had,not,no,yes,if,then,else,when,what,which,who,whom,how,why,where,do,does,did,using,use,used,also,each,other,such,only,both,either,neither,between,among,within,without,because,while,there,their,they,them,you,your,we,our,all,any,some,more,most,many,much'.split(','));

export function keyTerms(text: string, limit = 14): string[] {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9+#]+/)) {
    const w = raw.trim();
    if (w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)) counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, limit).map(([w]) => w);
}

export function buildInterview(track: InterviewTrack, interviewId: string): InterviewFlow {
  const meta = TRACK_META[track];
  const warmPool = filterQuestions({ course: meta.goal }).filter((q) => q.difficulty === 'easy');
  const deepPool = filterQuestions({ course: meta.goal }).filter((q) => q.difficulty !== 'easy');
  const warm = seededShuffle(warmPool, `${track}:${interviewId}:warm`).slice(0, 2);
  const deep = seededShuffle(deepPool, `${track}:${interviewId}:deep`).slice(0, 3);
  const prompts = DESIGN_PROMPTS.filter((p) => p.track === track);
  const design = prompts.length ? seededShuffle(prompts, `${track}:${interviewId}:design`)[0] : DESIGN_PROMPTS[0];
  const behavioral = seededShuffle([...BEHAVIORAL_PROMPTS], `${track}:${interviewId}:behavioral`)[0];
  const codeId = seededShuffle([...TRACK_CODE[track]], `${track}:${interviewId}:code`)[0];
  const code = challengeById(codeId) || challengeById('two-sum')!;

  const conceptItem = (q: Question, round: string): InterviewItem => ({
    id: `concept-${q.id}`, kind: 'concept', round, title: q.topic, timeLimitSec: 180,
    payload: { question: q.question, options: q.options, subject: q.subject, topic: q.topic, questionId: q.id },
  });
  const items: InterviewItem[] = [
    ...warm.map((q) => conceptItem(q, meta.rounds[0])),
    {
      id: `code-${code.id}`, kind: 'code', round: meta.rounds[1], title: code.title, timeLimitSec: 900,
      payload: { prompt: code.prompt, signature: code.signature, starter: code.starter, hints: code.hints, examples: code.tests.slice(0, 3), testCount: code.tests.length },
    },
    ...deep.map((q) => conceptItem(q, meta.rounds[2])),
    {
      id: `design-${design.id}`, kind: 'design', round: meta.rounds[3], title: design.title, timeLimitSec: 600,
      payload: { prompt: design.prompt },
    },
    {
      id: `behavioral-${behavioral.id}`, kind: 'behavioral', round: meta.rounds[4], title: behavioral.title, timeLimitSec: 240,
      payload: { prompt: behavioral.prompt },
    },
  ];
  return { interviewId, track, title: meta.title, rounds: meta.rounds, items };
}

/** Resolve an item back to its source material for evaluation. */
function resolveItem(track: InterviewTrack, interviewId: string, itemId: string): { item: InterviewItem; question?: Question; challenge?: CodeChallenge; design?: DesignPrompt; behavioral?: BehavioralPrompt } {
  const flow = buildInterview(track, interviewId);
  const item = flow.items.find((i) => i.id === itemId);
  if (!item) throw new Error('Unknown interview item');
  if (item.kind === 'concept') return { item, question: questionById(itemId.replace(/^concept-/, '')) };
  if (item.kind === 'code') return { item, challenge: challengeById(itemId.replace(/^code-/, '')) };
  if (item.kind === 'design') return { item, design: DESIGN_PROMPTS.find((p) => `design-${p.id}` === itemId) };
  return { item, behavioral: BEHAVIORAL_PROMPTS.find((p) => `behavioral-${p.id}` === itemId) };
}

export function evaluateAnswer(track: InterviewTrack, interviewId: string, itemId: string, input: { selected?: number; explanation?: string; code?: string; answerText?: string }): EvalResult {
  const { item, question, challenge, design, behavioral } = resolveItem(track, interviewId, itemId);
  if (item.kind === 'concept' && question) return evaluateConcept(question, input.selected, input.explanation || '');
  if (item.kind === 'code' && challenge) return evaluateCode(challenge, input.code || '');
  if (item.kind === 'design' && design) return evaluateDesign(design, input.answerText || input.explanation || '');
  if (item.kind === 'behavioral' && behavioral) return evaluateBehavioral(behavioral, input.answerText || input.explanation || '');
  return { score: 0, feedback: 'Could not evaluate this answer — try again.', strengths: [], gaps: ['Unevaluated answer'], followUp: 'Please resubmit your answer.' };
}

// --------------------------------------------------------------- evaluators

function coverageOf(answer: string, terms: string[]): { hit: string[]; missed: string[] } {
  const lower = answer.toLowerCase();
  const hit: string[] = []; const missed: string[] = [];
  for (const term of terms) (lower.includes(term) ? hit : missed).push(term);
  return { hit, missed };
}

function evaluateConcept(q: Question, selected: number | undefined, explanation: string): EvalResult {
  const correct = selected === q.answer;
  const terms = keyTerms(`${q.question} ${q.explanation} ${q.options[q.answer]}`, 12);
  const { hit, missed } = coverageOf(explanation, terms);
  const coverage = terms.length ? hit.length / terms.length : 0;
  const hasExample = /for example|for instance|e\.g\.|such as|consider/i.test(explanation);
  const words = explanation.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.max(0, Math.min(10, Math.round((correct ? 5 : 1) + coverage * 4 + (hasExample ? 0.5 : 0) + (words >= 40 ? 0.5 : 0))));
  const strengths: string[] = [];
  const gaps: string[] = [];
  if (correct) strengths.push(`Correct option (${'ABCD'[q.answer]})`); else gaps.push(`Wrong option — correct answer is ${'ABCD'[q.answer]}: ${q.options[q.answer]}`);
  if (hit.length >= 3) strengths.push(`Covered key ideas: ${hit.slice(0, 4).join(', ')}`);
  if (missed.length) gaps.push(`Missed key points: ${missed.slice(0, 4).join(', ')}`);
  if (!hasExample) gaps.push('Add a concrete example — interviewers weight them heavily');
  if (words < 15) gaps.push('Explanation too short — reason aloud, not just the answer');
  const feedback = `${correct ? 'Correct choice.' : 'Incorrect choice.'} ${q.explanation} Your explanation covered ${hit.length}/${terms.length} key terms${hit.length ? ` (${hit.slice(0, 5).join(', ')})` : ''}${missed.length ? ` — strengthen: ${missed.slice(0, 4).join(', ')}` : ' — thorough coverage'}.`;
  const followUp = missed.length
    ? `Follow-up: explain how "${missed[0]}" applies here — what breaks if you ignore it?`
    : 'Follow-up: change one constraint in this problem — does your answer still hold, and why?';
  return { score, feedback, strengths, gaps, followUp };
}

function evaluateCode(challenge: CodeChallenge, code: string): EvalResult {
  const strengths: string[] = []; const gaps: string[] = [];
  if (!code.trim()) return { score: 0, feedback: 'No code submitted.', strengths, gaps: ['Empty submission'], followUp: 'Start with the brute force, then optimize.' };
  const result = runJavaScript(code, challenge.tests, 600);
  if (!result.ok) {
    gaps.push(`Runtime error: ${result.error}`);
    return { score: 1, feedback: `Your code did not run: ${result.error}. Fix the crash first, then handle edge cases.`, strengths, gaps, followUp: 'What input triggers this error, and where is it thrown?' };
  }
  const passRate = result.total ? result.passed / result.total : 0;
  const failed = result.cases.find((c) => !c.passed);
  const failedDetail = failed ? ` First miss (${failed.label}): got ${JSON.stringify(failed.actual)}, want ${JSON.stringify(failed.expected)}.` : '';
  const mentionsComplexity = /o\(|complexity|time|space/i.test(code);
  const handlesEdges = /if\s*\(|length\s*===?\s*0|null|undefined|edge/i.test(code);
  const score = Math.max(0, Math.min(10, Math.round(passRate * 8 + (mentionsComplexity ? 1 : 0) + (handlesEdges ? 1 : 0))));
  if (result.passed === result.total && result.total) strengths.push(`All ${result.total} test cases pass`);
  else if (result.passed) strengths.push(`${result.passed}/${result.total} test cases pass`);
  else gaps.push('No test cases pass yet — get the smallest example working first');
  if (mentionsComplexity) strengths.push('Complexity considered');
  if (passRate < 1) gaps.push(`${result.total - result.passed} failing case${result.total - result.passed === 1 ? '' : 's'} — trace the first miss by hand`);
  if (!mentionsComplexity) gaps.push('State time/space complexity unprompted');
  if (!handlesEdges) gaps.push('No visible edge-case handling (empty, null, bounds)');
  const feedback = `Tests: ${result.passed}/${result.total} passing.${failedDetail} ${passRate === 1 ? 'Clean run — now argue optimality.' : 'Debug the first miss before optimizing.'}`;
  const followUp = passRate === 1
    ? 'Follow-up: prove your complexity bound, then solve it with stricter space (or without the helper structure).'
    : 'Follow-up: trace your code on the failing input line by line — which invariant breaks?';
  return { score, feedback, strengths, gaps, followUp };
}

function evaluateDesign(prompt: DesignPrompt, answer: string): EvalResult {
  const strengths: string[] = []; const gaps: string[] = [];
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const lower = answer.toLowerCase();
  const hits = prompt.keyPoints.filter((kp) => kp.keywords.some((k) => lower.includes(k)));
  const misses = prompt.keyPoints.filter((kp) => !kp.keywords.some((k) => lower.includes(k)));
  const hasNumbers = /\d+\s*(k|m|rps|ms|gb|tb|%|million|thousand)?/i.test(answer);
  const hasTradeoff = /trade-?off|versus|vs\.|instead of|alternatively|however|downside/i.test(answer);
  const score = Math.max(0, Math.min(10, Math.round((hits.length / prompt.keyPoints.length) * 8 + (hasNumbers ? 1 : 0) + (hasTradeoff ? 1 : 0))));
  for (const h of hits) strengths.push(`Addressed: ${h.label}`);
  for (const m of misses.slice(0, 3)) gaps.push(`Missed: ${m.label} — ${m.hint}`);
  if (!hasNumbers) gaps.push('No capacity numbers — interviewers expect back-of-envelope math');
  if (!hasTradeoff) gaps.push('No explicit trade-offs — every choice needs a rejected alternative');
  if (words < 60) gaps.push('Answer too short — a design round needs breadth across all key areas');
  const feedback = `Covered ${hits.length}/${prompt.keyPoints.length} key areas${hits.length ? ` (${hits.map((h) => h.label).join('; ')})` : ''}.${misses.length ? ` Biggest gap: ${misses[0].label} — ${misses[0].hint}` : ' Excellent breadth.'}`;
  return { score, feedback, strengths, gaps, followUp: `Follow-up: ${prompt.followUps[answer.length % prompt.followUps.length]}` };
}

function evaluateBehavioral(prompt: BehavioralPrompt, answer: string): EvalResult {
  const strengths: string[] = []; const gaps: string[] = [];
  const lower = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const star = {
    situation: /situation|context|when i|at (my|the)|background/.test(lower),
    task: /task|goal|responsib|had to|needed to/.test(lower),
    action: /i (did|built|wrote|led|decided|proposed|implemented|debugged|convinced)/.test(lower),
    result: /result|outcome|improved|reduced|increased|shipped|passed|learned|metric|%/.test(lower),
  };
  const starHit = Object.values(star).filter(Boolean).length;
  const hasMetrics = /\d+\s*(%|x|ms|s|days?|weeks?|users?|marks?|points?)/i.test(answer) || /improved|reduced|increased/.test(lower);
  const score = Math.max(0, Math.min(10, Math.round(starHit * 2 + (hasMetrics ? 1 : 0) + (words >= 80 ? 1 : 0))));
  if (star.situation && star.task) strengths.push('Clear situation and task');
  if (star.action) strengths.push('Concrete personal actions ("I did…")');
  if (star.result) strengths.push('Outcome stated');
  if (!star.action) gaps.push('Say what YOU did — "we" hides your contribution');
  if (!star.result) gaps.push('End with a measurable result or lesson');
  if (!hasMetrics) gaps.push('Add numbers — impact without metrics does not land');
  if (words < 60) gaps.push('Too short to judge — aim for a 2-minute story (~150 words)');
  const feedback = `STAR structure: ${starHit}/4 (${Object.entries(star).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none detected'}). Rubric for this question: ${prompt.rubric.join(' · ')}.`;
  return { score, feedback, strengths, gaps, followUp: 'Follow-up: what would you do differently with what you know now?' };
}

// ------------------------------------------------------------------- report

export function buildReport(track: InterviewTrack, interviewId: string, evals: EvalResult[]): InterviewReport {
  const flow = buildInterview(track, interviewId);
  const byKind: Record<InterviewItemKind, number[]> = { concept: [], code: [], design: [], behavioral: [] };
  flow.items.forEach((item, i) => { if (evals[i]) byKind[item.kind].push(evals[i].score); });
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const correctness = avg([...byKind.concept, ...byKind.code]);
  const depth = avg([...byKind.concept, ...byKind.design]);
  const problemSolving = avg([...byKind.code, ...byKind.design]);
  const communication = avg([...byKind.design, ...byKind.behavioral]);
  const overall = Math.round(((correctness + depth + problemSolving + communication) / 4) * 10) / 10;
  const verdict = overall >= 8 ? 'Strong hire lean — polish edge cases and you are ready.'
    : overall >= 6.5 ? 'Hire lean — close the gaps below to make it solid.'
    : overall >= 5 ? 'Mixed — focused repair on the gaps below will flip this.'
    : 'Needs preparation — work the study links, then retry this interview.';
  const strengths = [...new Set(evals.flatMap((e) => e.strengths))].slice(0, 6);
  const gaps = [...new Set(evals.flatMap((e) => e.gaps))].slice(0, 6);
  return {
    interviewId, track, overall, verdict,
    dimensions: [
      { label: 'Correctness', score: Math.round(correctness * 10) / 10, note: 'Right answers and passing tests.' },
      { label: 'Depth', score: Math.round(depth * 10) / 10, note: 'Key ideas covered, not just keywords.' },
      { label: 'Problem solving', score: Math.round(problemSolving * 10) / 10, note: 'Code + design under constraints.' },
      { label: 'Communication', score: Math.round(communication * 10) / 10, note: 'Structured reasoning and stories.' },
    ],
    strengths, gaps, studyLinks: studyLinksFor(track, gaps), perItem: evals,
  };
}

function studyLinksFor(track: InterviewTrack, gaps: string[]): { label: string; topicId: string }[] {
  const meta = TRACK_META[track];
  const catalog = getCatalog(meta.goal);
  const gapText = gaps.join(' ').toLowerCase();
  const gapWords = new Set(gapText.split(/[^a-z0-9+]+/).filter((w) => w.length > 3 && !STOP.has(w)));
  const scored = catalog.map((t) => {
    const text = `${t.title} ${t.description} ${t.module}`.toLowerCase();
    let score = 0;
    for (const w of gapWords) if (text.includes(w)) score += 1;
    return { t, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  return scored.map((s) => ({ label: s.t.title, topicId: s.t.id }));
}
