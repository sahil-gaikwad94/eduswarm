/**
 * EduSwarm specialist brain
 * -------------------------
 * Prompt construction plus a genuinely useful *offline* specialist.
 *
 * The previous fallback answered every message with the same four-sentence
 * paragraph — which is why the agents read as "not even calling an LLM". This
 * module answers the message that was actually sent: a pasted PYQ gets its real
 * solution from the bank, pasted code gets a structural review, a concept
 * question gets the open lesson's own scope.
 */

import { QUESTION_BANK, type Question } from './questionBank.js';
import { getCatalog, getTopic, type CurriculumTopic } from './curriculum.js';
import { localKnowledgeFor, referencesFor } from './localKnowledge.js';

export type AgentContext = {
  agentId: string;
  agentName: string;
  agentRole: string;
  learnerName?: string;
  skillLevel?: string;
  dailyMinutes?: number;
  goal: string;
  goalTitle: string;
  topic?: CurriculumTopic | null;
  weakTopics?: string[];
  dueReviews?: number;
  accuracy?: number;
};

export const GOAL_TITLES: Record<string, string> = {
  'gate-cs': 'GATE CSE', 'web-dev': 'Full-stack Engineering', 'ai-ml': 'AI / ML Engineering',
};

export const AGENT_PERSONAS: Record<string, string> = {
  'socratic-tutor': "Guide with questions. Expose the assumption behind their answer with one small counterexample, then give the crisp resolution so they are not left hanging.",
  'pyq-coach': 'Exam strategist. Classify the question type, name the formula or invariant that solves it, eliminate each wrong option with a specific reason, give the timed drill to run next.',
  'doubt-solver': 'Concept debugger. Direct answer in one sentence, then the shortest correct derivation, then the exact misconception that makes the wrong answer tempting.',
  'code-reviewer': 'Senior engineer reviewing production code. Name the concrete failing input for each finding, state worst-case time and space, return corrected code in a fenced block.',
  'mock-examiner': 'Test analyst. Diagnose accuracy vs speed vs negative marks, prescribe question order and a per-section time budget, name the two topics to repair before the next paper.',
  'revision-planner': 'Study architect. Turn their confidence and weak topics into a dated, minute-budgeted plan with spaced reviews at 1/3/7/14 days.',
  'career-mentor': 'Pathfinder. Map the concept to the role that pays for it, the project that proves it, and the exact interview question they must answer cold.',
};

const STOPWORDS = new Set(
  'a an the and or but of to in on for with is are was were be been this that it its as at by from what which how why do does did can could should would my your you we our not no yes if else please help me explain tell about into over after before'.split(' '),
);

export function keywords(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

export function looksLikeCode(text: string): boolean {
  return /```/.test(text)
    || /(function\s+\w+|=>\s*[{(]|\bfor\s*\(|\bwhile\s*\(|\bdef\s+\w+|\bclass\s+\w+|console\.log|print\(|import\s+\w+)/.test(text);
}

export function extractOptions(text: string): string[] {
  const options: string[] = [];
  for (const line of String(text).split('\n').map((l) => l.trim()).filter(Boolean)) {
    const match = line.match(/^[\(\[]?([a-dA-D1-4])[\)\].:]\s*(.+)$/);
    if (match && match[2].length > 1) options.push(`${match[1].toUpperCase()}. ${match[2].trim()}`);
  }
  return options.length >= 2 ? options : [];
}

/** Closest bank question for a pasted problem, or null when nothing matches. */
export function matchBankQuestion(text: string, goal: string): { question: Question; score: number } | null {
  const tokens = keywords(text);
  if (tokens.length < 2) return null;
  const scoped = QUESTION_BANK.filter((q) => q.course === goal);
  const pool = scoped.length ? scoped : QUESTION_BANK;
  let best: { question: Question; score: number } | null = null;
  for (const question of pool) {
    const haystack = `${question.question} ${question.topic} ${question.subject} ${question.options.join(' ')}`.toLowerCase();
    const score = tokens.filter((t) => haystack.includes(t)).length / tokens.length;
    if (!best || score > best.score) best = { question, score };
  }
  // A pasted option list is strong evidence the learner copied a bank question.
  // Without options, demand a much closer match — a loose hit answers the wrong
  // question confidently, which is worse than no match at all.
  const threshold = extractOptions(text).length >= 2 ? 0.45 : 0.7;
  return best && best.score >= threshold ? best : null;
}

export function buildSystemPrompt(ctx: AgentContext): string {
  const topicLine = ctx.topic
    ? `Current lesson: "${ctx.topic.title}" (module ${ctx.topic.module}). Scope: ${ctx.topic.description}`
    : 'No lesson is open — answer from their message; do not stall by asking which lesson they are on.';
  const learnerLine = [
    ctx.learnerName ? `Learner: ${ctx.learnerName}` : '',
    ctx.skillLevel ? `level ${ctx.skillLevel}` : '',
    ctx.goalTitle ? `universe ${ctx.goalTitle}` : '',
    typeof ctx.accuracy === 'number' ? `recent accuracy ${ctx.accuracy}%` : '',
    ctx.weakTopics?.length ? `weak topics: ${ctx.weakTopics.slice(0, 5).join(', ')}` : '',
  ].filter(Boolean).join(' · ');

  return [
    `You are ${ctx.agentName}, EduSwarm's ${ctx.agentRole}.`,
    AGENT_PERSONAS[ctx.agentId] || 'Teach precisely with a worked example and a check for understanding.',
    '',
    `Context — ${learnerLine || 'new learner'}`,
    topicLine,
    '',
    'Answer rules:',
    '1. Answer the message they actually sent. Quote the specific concept, option, line of code, or number they mentioned.',
    '2. Never answer a concrete question with generic study advice ("make a plan", "revise regularly", "practise more").',
    '3. Structure: **Answer** (1-2 sentences) / **Why** (derivation, invariant, mechanism) / **Worked example or code** / **Trap** / **Next step**.',
    '4. Markdown sparingly: short bold labels, fenced code blocks. No preamble, no "great question".',
    '5. If they pasted options (A/B/C/D), eliminate each wrong option by name.',
    '6. If they pasted code, cite the failing input and give corrected code.',
    '7. Under 300 words. Dense beats long.',
    '8. Never invent facts, marks, or citations — say what is missing instead.',
  ].join('\n');
}

function optionLines(question: Question): string {
  const letters = ['A', 'B', 'C', 'D'];
  return question.options
    .map((option, i) => (i === question.answer
      ? `- **${letters[i]}. ${option}** — correct.`
      : `- ${letters[i]}. ${option} — not correct: the rule above rules it out.`))
    .join('\n');
}

function modulePeers(topic: CurriculumTopic): string[] {
  const goalKey = topic.id.startsWith('algo-') ? 'gate-cs' : topic.id.split('-')[0];
  const catalog = getCatalog(goalKey);
  return catalog.filter((t) => t.module === topic.module && t.id !== topic.id).slice(0, 3).map((t) => t.title);
}

/** Common stuck-points, so offline answers still explain the actual mechanism. */
const CONCEPT_HINTS: Array<{ match: RegExp; answer: string; why: string; trap: string }> = [
  {
    match: /recursi|fibonacci|memoi|overlapping subproblem/i,
    answer: 'Plain recursion re-solves the same subproblems, so the call count explodes.',
    why: 'fib(n) calls fib(n-1) and fib(n-2); the number of calls follows the Fibonacci sequence itself (about 1.6^n). At n = 45 that is roughly 10^9 calls. Memoize in a Map/array (top-down) or tabulate bottom-up and it becomes O(n).',
    trap: 'Adding a cache without handling the base case still recurses forever; check the cache first, store on the way back.',
  },
  {
    match: /master theorem|recurrence|t\(n\)|time complexity|big o|asymptot/i,
    answer: 'Match the recurrence to the Master theorem cases before you guess a bound.',
    why: 'For T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a): polynomially smaller gives case 1, equal (times log^k) gives case 2, polynomially larger with regularity gives case 3.',
    trap: 'Case 2 is the one people skip — when f(n) equals n^(log_b a) you pick up the extra log factor.',
  },
  {
    match: /binary search|midpoint|off by one|overflow in mid/i,
    answer: 'Binary search works only because each comparison provably discards half of the remaining range.',
    why: 'That guarantee needs a total order. With sorted input, comparing against the middle element tells you which half cannot contain the target, so the interval halves every step and you finish in O(log n). With unsorted input the target may sit in the half you just discarded, so the search can report "not found" for a value that is present.',
    trap: 'Boundary handling is the other half: keep the invariant "the answer is in [lo, hi]", shrink it in every branch, compute the midpoint as lo + ((hi - lo) >> 1) so it cannot overflow, and stop when lo > hi.',
  },
  {
    match: /cache|paging|page fault|lru|tlb/i,
    answer: 'Cache and paging questions turn on locality and the replacement rule.',
    why: 'Hit rate follows temporal and spatial locality; replacement policies differ in whether they are stack algorithms. FIFO is not, which is exactly why Belady\'s anomaly (more frames, more faults) can happen with it and not with LRU.',
    trap: 'Assuming more memory always reduces faults — that is true for LRU/OPT, false for FIFO.',
  },
  {
    match: /deadlock|mutex|semaphore|race condition|critical section/i,
    answer: 'Deadlock needs all four Coffman conditions at once; break any one and it cannot form.',
    why: 'Mutual exclusion, hold-and-wait, no preemption, circular wait. Practical fixes: impose a global lock ordering, use try-lock with backoff, or allow preemption.',
    trap: '"Adding a mutex" fixes races but can create deadlock if two threads take the same two locks in opposite order.',
  },
  {
    match: /normali|bcnf|3nf|functional depend|candidate key/i,
    answer: 'Normalization is a closure computation, not a judgement call.',
    why: 'Compute attribute closures to get candidate keys, then test each non-trivial FD: 2NF removes partial dependencies on part of a key, 3NF removes transitive ones, BCNF requires every determinant to be a superkey.',
    trap: 'Forgetting that a relation can have several candidate keys — a dependency on a non-chosen key still violates BCNF.',
  },
  {
    match: /tcp|congestion|slow start|three way|retransmi/i,
    answer: 'TCP behaviour is defined by the handshake and the congestion window rules.',
    why: 'Connection setup is SYN → SYN-ACK → ACK; the congestion window grows exponentially in slow start, then linearly in congestion avoidance, and halves (or resets) on loss depending on the algorithm.',
    trap: 'Confusing the receive window (flow control, receiver buffer) with the congestion window (network capacity) — the sender uses the minimum of the two.',
  },
  {
    match: /attention|transformer|self attention|positional encoding/i,
    answer: 'Self-attention lets every token read from every other token in one parallel step.',
    why: 'Score = softmax(QK^T / sqrt(d_k)) V. The sqrt(d_k) keeps dot products from saturating the softmax; positional encoding is required because attention itself is permutation invariant.',
    trap: 'Forgetting the causal mask in decoder attention leaks future tokens during training and inflates eval scores.',
  },
  {
    match: /vanishing gradient|exploding gradient|backprop|learning rate|gradient descent/i,
    answer: 'Vanishing and exploding gradients are about what repeated multiplication does to the signal.',
    why: 'Gradients are a product of layer derivatives; repeated factors below 1 shrink them geometrically, above 1 they blow up. Fixes: better initialization, normalization layers, residual connections, gradient clipping, and a sane learning rate.',
    trap: 'Raising the learning rate to escape a plateau usually diverges instead — scale the data or normalize first.',
  },
  {
    match: /usestate|useeffect|re-?render|react hook|stale closure/i,
    answer: 'Most React bugs are a stale closure or a render that should not have happened.',
    why: 'State updates are batched and the closure captures the values from the render that created it. Use the updater form setState(prev => ...) when the next value depends on the previous one, and list every value an effect reads in its dependency array.',
    trap: 'Mutating state or props directly — React compares references, so a mutated object looks unchanged and nothing re-renders.',
  },
  {
    match: /event loop|promise|async await|microtask|callback queue/i,
    answer: 'Order is decided by the queue a callback lands in, not by when it was written.',
    why: 'The call stack drains first, then the microtask queue (promise callbacks, queueMicrotask) fully, then one macrotask (setTimeout, I/O), then microtasks again. await is sugar that resumes in a microtask.',
    trap: 'Assuming setTimeout(fn, 0) runs before a resolved promise — microtasks always win.',
  },
  {
    match: /join|index|n\+1|query plan|explain analyze|sql performance/i,
    answer: 'Slow SQL is almost always a missing index or an N+1 access pattern.',
    why: 'Read the plan: a sequential scan on a large table means a missing or unusable index; N+1 means the ORM issued one query per row instead of a join or a batched IN (...) query.',
    trap: 'Indexing every column — writes slow down and the planner may still prefer a scan on low-selectivity columns.',
  },
];

function hintFor(text: string) {
  return CONCEPT_HINTS.find((hint) => hint.match.test(text)) || null;
}

function titleCase(value: string): string {
  return String(value || '').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Offline specialist reply: deterministic, but specific to what was asked. */
export function localSpecialistReply(ctx: AgentContext, text: string): string {
  const question = text.trim();
  const subject = question.length > 90 ? `${question.slice(0, 88)}…` : question;
  const topicLine = ctx.topic ? `Open lesson: ${ctx.topic.title} (${ctx.topic.module}).` : '';
  const matched = matchBankQuestion(question, ctx.goal);

  if (matched) {
    const q = matched.question;
    return [
      `**Answer:** ${q.options[q.answer]}.`,
      `**Why:** ${q.explanation}`,
      '',
      'Option by option:',
      optionLines(q),
      '',
      `**Trap:** the distractors here all look right if you skip the governing rule for ${q.topic}. Write that rule down before you read the options next time.`,
      `**Next step:** open ${q.subject} → ${q.topic} in the syllabus and run two more questions of this type under 90 seconds.`,
      `_(Matched from the EduSwarm ${q.source === 'gate-pyq' ? 'PYQ' : 'practice'} bank: ${q.subject} · ${q.topic} · ${q.year}.)_`,
    ].join('\n');
  }

  if (looksLikeCode(question)) {
    const lines = question.split('\n').filter((line) => line.trim());
    const findings: string[] = [];
    if (/\.sort\(\s*\)/.test(question)) findings.push('`Array.prototype.sort()` compares strings by default; ` [10, 2].sort()` becomes `[10, 2]`. Use `(a, b) => a - b` for numeric order.');
    if (/async\s+|await\s+/.test(question) && !/try\s*\{/.test(question)) findings.push('The async path has no visible error boundary. A rejected await needs `try/catch` (or a returned promise handled by the caller).');
    if (/\[[^\]]+\]/.test(question) && !/length|undefined|\?\./.test(question)) findings.push('Array/property access has no visible boundary guard; trace empty input and the last valid index before trusting it.');
    if (/while\s*\(/.test(question) && !/\+\+|--|-=|\*=/.test(question)) findings.push('The loop does not visibly update a progress variable; prove that its condition changes on every path.');
    const review = findings.length
      ? findings.slice(0, 3).map((finding, index) => `${index + 1}. ${finding}`).join('\n')
      : 'No single syntax-level defect is safe to claim from this snippet alone. The next useful review is a concrete trace against an expected result.';
    return [
      `**Review:** ${findings.length ? 'These are concrete risks visible in the code you pasted.' : `The ${lines.length}-line snippet needs its contract and a failing case to make a precise correctness claim.`}`,
      `**Why:** ${review}`,
      '**Test now:** run empty input, one-element input, a duplicate/boundary input, and the largest valid input. For each, write expected output before executing.',
      '**Complexity:** count the largest nested/recursive path and state auxiliary memory separately.',
      `**Next step:** paste one failing input with expected and actual output; I will trace the exact branch and return a minimal patch. ${topicLine}`.trim(),
    ].join('\n');
  }

  const hint = hintFor(question);

  if (hint) {
    return [
      `**Answer:** ${hint.answer}`,
      `**Why:** ${hint.why}`,
      `**Trap:** ${hint.trap}`,
      ctx.topic ? `**Next step:** finish the practice set in ${ctx.topic.title} and re-run this case with the fix applied.` : '**Next step:** apply the fix and re-run the failing case.',
      '_(Offline guidance — the model brain was unreachable, so this answer came from the built-in concept library.)_',
    ].join('\n');
  }

  if (ctx.agentId === 'revision-planner') {
    const minutes = Math.max(15, ctx.dailyMinutes || 60);
    const review = Math.min(15, Math.max(5, Math.round(minutes * 0.2)));
    const repair = Math.min(20, Math.max(5, Math.round(minutes * 0.3)));
    const focus = ctx.topic?.title || ctx.weakTopics?.[0] || 'the concept in your message';
    return [
      `**Today’s ${minutes}-minute plan:** make **${focus}** the concrete outcome, not a vague “revision” session.`,
      `1. **${review} min — retrieve:** answer due cards or write the core definition from memory.`,
      `2. **${repair} min — repair:** trace one small example and write the assumption that caused your latest miss${ctx.weakTopics?.length ? ` (${ctx.weakTopics.slice(0, 2).join(', ')})` : ''}.`,
      `3. **${Math.max(5, minutes - review - repair)} min — apply:** solve one timed question or implement one small function without notes.`,
      '**Spaced follow-up:** revisit the same recall prompt tomorrow, then on days 3, 7, and 14. Grade recall honestly; “hard” means redo the worked example.',
    ].join('\n');
  }

  if (ctx.agentId === 'mock-examiner') {
    const accuracy = typeof ctx.accuracy === 'number' ? `${ctx.accuracy}%` : 'not enough attempts yet';
    const repair = ctx.weakTopics?.slice(0, 2).filter(Boolean).join(' and ') || ctx.topic?.title || 'your two lowest-confidence topics';
    return [
      `**Exam read:** current accuracy is ${accuracy}. Do not spend the opening minutes proving a hard question to yourself.`,
      '**Order:** take direct-definition and familiar-method marks first; flag calculation-heavy or ambiguous questions; return only when the easy pass is complete.',
      '**Pacing:** use a hard stop for any question where you cannot state the governing rule within about 30 seconds. Protect accuracy before chasing attempts—negative marking makes random guesses expensive.',
      `**Repair before the next mock:** ${repair}. For each, do one untimed trace, then two timed questions with a written error label.`,
    ].join('\n');
  }

  if (ctx.agentId === 'career-mentor') {
    const route = ctx.goal === 'ai-ml'
      ? 'an AI/ML engineer who can frame, evaluate, and ship a measured model feature'
      : ctx.goal === 'web-dev'
        ? 'a full-stack engineer who can own an accessible, observable feature from browser to database'
        : 'a software engineer who can explain CS fundamentals clearly under interview constraints';
    return [
      `**Career connection:** ${titleCase(ctx.goalTitle || ctx.goal)} maps to ${route}.`,
      `**Proof project:** build one small artifact around ${ctx.topic?.title || 'the concept you asked about'} with a README that states the problem, constraints, trade-offs, tests, and one failure you fixed.`,
      '**Interview story:** practise “I chose X over Y because __; I measured __; when __ failed, I changed __.” That demonstrates judgment, not only tutorial completion.',
      '**Next step:** ship the smallest demonstrable slice this week and ask for a review against its rubric.',
    ].join('\n');
  }

  if (ctx.topic) {
    const peers = modulePeers(ctx.topic);
    const knowledge = localKnowledgeFor(ctx.topic);
    const refs = referencesFor(ctx.topic);
    const socratic = ctx.agentId === 'socratic-tutor'
      ? `**Check:** before looking below, what assumption must hold for your answer to “${subject}” to work?`
      : '';
    return [
      `**Answer:** ${knowledge.mentalModel}`,
      `**Why:** ${knowledge.mechanics.map((item) => `• ${item}`).join('\n')}`,
      `**Worked example:** ${knowledge.workedExample}`,
      `**Trap:** ${knowledge.trap}`,
      socratic,
      `**Next step:** ${knowledge.check}${peers.length ? ` Then connect it to ${peers[0]}.` : ''}`,
      `**Reference:** ${refs[0].publisher} — ${refs[0].title} (${refs[0].url})`,
      '_(Local curriculum brain — the model path was unavailable, so this answer uses the built-in topic guide.)_',
    ].filter(Boolean).join('\n\n');
  }

  const options = extractOptions(question);
  return [
    `**Answer:** let us work ${subject || 'your question'} from first principles.`,
    options.length ? `**Options seen:** ${options.join(' · ')}` : '**Why:** every exam question rewards one rule; find the rule before reading the options.',
    '**Worked approach:** name the concept, write its definition, build the smallest example, then test the boundary case.',
    `**Next step:** open the relevant tutorial in your ${ctx.goalTitle} syllabus and send me the question with its options for an option-by-option elimination.`,
    '_(Offline guidance — the model brain was unreachable.)_',
  ].join('\n');
}

export { getTopic };
