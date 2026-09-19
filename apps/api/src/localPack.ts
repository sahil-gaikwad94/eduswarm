/**
 * EduSwarm Local Study-Kit Generator
 * ----------------------------------
 * Builds deep, topic-aware study kits without any LLM provider. It weaves
 * together curriculum context, real bank questions on the topic, a code
 * snippet library, and mermaid diagram templates — so even the offline path
 * teaches with worked examples, code, visuals, and exam drills.
 *
 * Output shape matches the agent runtime package (notes, codeExamples,
 * diagrams, cheatSheet, videos, flashcards, quiz, pyqs, verification).
 */

import { QUESTION_BANK, type Question } from './questionBank.js';
import { localKnowledgeFor, referencesFor } from './localKnowledge.js';

export type PackDepth = 'eli5' | 'standard' | 'deep';
export type TopicRef = { title: string; description: string; module?: string };

type Snippet = { match: string[]; title: string; language: string; code: string; explanation: string };
type Diagram = { match: string[]; title: string; caption: string; mermaid: string };

// ------------------------------------------------------------ code library

const SNIPPETS: Snippet[] = [
  {
    match: ['binary search', 'sorted array', 'searching'], title: 'Binary search with an explicit invariant', language: 'javascript',
    code: 'function binarySearch(nums, target) {\n  let lo = 0, hi = nums.length - 1; // invariant: target in [lo, hi] if present\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}',
    explanation: 'The invariant is the proof: every iteration discards the half that cannot contain the target, so log n steps always suffice on sorted input.',
  },
  {
    match: ['hash', 'two sum', 'lookup', 'map', 'dictionary'], title: 'Hash map trade: memory for O(1) lookup', language: 'javascript',
    code: 'function twoSum(nums, target) {\n  const seen = new Map(); // value -> index\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}',
    explanation: 'Looking up the complement before inserting turns an O(n²) scan into O(n) expected time — the canonical hashing payoff.',
  },
  {
    match: ['stack', 'parentheses', 'postfix', 'expression'], title: 'Stack discipline: matching brackets', language: 'javascript',
    code: 'function isBalanced(s) {\n  const stack = [], pairs = { ")": "(", "]": "[", "}": "{" };\n  for (const ch of s) {\n    if ("([{".includes(ch)) stack.push(ch);\n    else if (stack.pop() !== pairs[ch]) return false;\n  }\n  return stack.length === 0;\n}',
    explanation: 'LIFO order mirrors nesting: a closing bracket must match the most recent unmatched opener, which is exactly the stack top.',
  },
  {
    match: ['queue', 'circular', 'buffer'], title: 'Circular queue with a sacrificed slot', language: 'javascript',
    code: 'class CircularQueue {\n  constructor(n) { this.a = new Array(n); this.front = 0; this.rear = 0; }\n  full() { return (this.rear + 1) % this.a.length === this.front; }\n  empty() { return this.rear === this.front; }\n  enqueue(x) { if (this.full()) throw new Error("full"); this.a[this.rear] = x; this.rear = (this.rear + 1) % this.a.length; }\n  dequeue() { if (this.empty()) throw new Error("empty"); const x = this.a[this.front]; this.front = (this.front + 1) % this.a.length; return x; }\n}',
    explanation: 'Sacrificing one slot disambiguates full from empty with pure index arithmetic — a favorite GATE implementation question.',
  },
  {
    match: ['bst', 'binary search tree', 'traversal', 'tree'], title: 'BST search follows one path', language: 'javascript',
    code: 'function bstSearch(root, key) {\n  let node = root;\n  while (node) {\n    if (key === node.val) return true;\n    node = key < node.val ? node.left : node.right;\n  }\n  return false;\n}',
    explanation: 'The BST property discards half the remaining tree per comparison: O(h) time, O(log n) when balanced, O(n) when degenerate.',
  },
  {
    match: ['merge', 'divide and conquer', 'sorting', 'sort'], title: 'Merge sort: divide, conquer, combine', language: 'javascript',
    code: 'function mergeSort(a) {\n  if (a.length <= 1) return a;\n  const mid = a.length >> 1;\n  return merge(mergeSort(a.slice(0, mid)), mergeSort(a.slice(mid)));\n}\nfunction merge(l, r) {\n  const out = [];\n  while (l.length && r.length) out.push(l[0] <= r[0] ? l.shift() : r.shift());\n  return out.concat(l, r);\n}',
    explanation: 'Halving guarantees O(n log n) worst case and stability (note <=), at the cost of O(n) extra space for merging.',
  },
  {
    match: ['dijkstra', 'shortest path'], title: "Dijkstra's shortest paths", language: 'python',
    code: 'import heapq\ndef dijkstra(graph, src):\n    dist = {src: 0}\n    pq = [(0, src)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d != dist[u]: continue  # stale entry\n        for v, w in graph[u]:\n            if d + w < dist.get(v, float("inf")):\n                dist[v] = d + w\n                heapq.heappush(pq, (d + w, v))\n    return dist',
    explanation: 'The priority queue always finalizes the closest unsettled vertex — valid only for non-negative weights.',
  },
  {
    match: ['union', 'disjoint', 'kruskal', 'mst', 'spanning'], title: 'Union-Find with path compression', language: 'python',
    code: 'class DSU:\n    def __init__(self, n): self.p = list(range(n)); self.r = [0]*n\n    def find(self, x):\n        while self.p[x] != x: self.p[x] = self.p[self.p[x]]; x = self.p[x]\n        return x\n    def union(self, a, b):\n        a, b = self.find(a), self.find(b)\n        if a == b: return False\n        if self.r[a] < self.r[b]: a, b = b, a\n        self.p[b] = a\n        self.r[a] += self.r[a] == self.r[b]\n        return True',
    explanation: 'Near-constant amortized operations make Kruskal O(E log E), dominated by sorting edges.',
  },
  {
    match: ['join', 'relational', 'sql'], title: 'JOINs preserve or filter rows', language: 'sql',
    code: 'SELECT e.name, d.name AS dept\nFROM employees e\nLEFT JOIN departments d ON d.id = e.dept_id\nWHERE e.salary > 50000\nORDER BY e.name;',
    explanation: 'LEFT JOIN keeps every employee row, filling NULLs where no department matches — the most-tested JOIN semantic.',
  },
  {
    match: ['aggregation', 'group by'], title: 'Aggregation with HAVING', language: 'sql',
    code: 'SELECT dept_id, COUNT(*) AS headcount, AVG(salary) AS avg_pay\nFROM employees\nGROUP BY dept_id\nHAVING COUNT(*) >= 5;',
    explanation: 'WHERE filters rows before grouping; HAVING filters groups after — mixing them up is the classic SQL trap.',
  },
  {
    match: ['cache', 'lru', 'locality', 'replacement'], title: 'LRU cache in O(1)', language: 'python',
    code: 'from collections import OrderedDict\nclass LRUCache:\n    def __init__(self, capacity): self.cap = capacity; self.m = OrderedDict()\n    def get(self, key):\n        if key not in self.m: return -1\n        self.m.move_to_end(key)\n        return self.m[key]\n    def put(self, key, val):\n        self.m[key] = val; self.m.move_to_end(key)\n        if len(self.m) > self.cap: self.m.popitem(last=False)',
    explanation: 'Hash map plus recency order gives O(1) get/put — the same locality principle behind CPU caches and CDN edges.',
  },
  {
    match: ['subnet', 'cidr', 'ip address', 'prefix'], title: 'Usable hosts from a CIDR prefix', language: 'javascript',
    code: 'function usableHosts(cidr) {\n  const prefix = Number(cidr.split("/")[1]);\n  return Math.max(0, 2 ** (32 - prefix) - 2); // minus network + broadcast\n}\nusableHosts("192.168.1.0/26"); // 62',
    explanation: 'Host bits = 32 − prefix; subtract network and broadcast addresses. /26 → 64 − 2 = 62 usable hosts.',
  },
  {
    match: ['rate limit', 'throttle', 'token bucket', 'api design'], title: 'Token-bucket rate limiter', language: 'javascript',
    code: 'function makeLimiter(ratePerSec, burst) {\n  let tokens = burst, last = Date.now();\n  return () => {\n    const now = Date.now();\n    tokens = Math.min(burst, tokens + (now - last) / 1000 * ratePerSec);\n    last = now;\n    if (tokens < 1) return false;\n    tokens -= 1;\n    return true;\n  };\n}',
    explanation: 'Bursts pass while sustained abuse is throttled — the standard API fairness mechanism.',
  },
  {
    match: ['gradient', 'descent', 'optimization', 'learning rate'], title: 'Gradient descent in six lines', language: 'python',
    code: 'def descend(start, lr=0.1, steps=100):\n    x = start\n    for _ in range(steps):\n        grad = 2 * x  # d/dx of x^2\n        x = x - lr * grad\n    return x  # converges toward 0 for small lr',
    explanation: 'Too-large lr diverges, too-small crawls: the learning rate is the most consequential hyperparameter.',
  },
  {
    match: ['attention', 'transformer'], title: 'Scaled dot-product attention', language: 'python',
    code: 'import numpy as np\ndef attention(Q, K, V):\n    scores = Q @ K.T / np.sqrt(K.shape[1])\n    weights = np.exp(scores) / np.exp(scores).sum(axis=-1, keepdims=True)\n    return weights @ V  # weighted mix of values',
    explanation: 'Every token mixes every other token by learned relevance — O(n²) memory is the price of global context.',
  },
  {
    match: ['react', 'hook', 'effect', 'component'], title: 'Effect with correct cleanup', language: 'javascript',
    code: 'useEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal }).then(setData);\n  return () => controller.abort(); // runs before re-run + unmount\n}, [url]);',
    explanation: 'Cleanup prevents setState-on-unmounted races — the most common React data-fetching bug.',
  },
  {
    match: ['normalization', 'functional dependenc', 'bcnf', '3nf'], title: 'Closure finds the keys', language: 'python',
    code: 'def closure(attrs, fds):\n    known = set(attrs)\n    changed = True\n    while changed:\n        changed = False\n        for lhs, rhs in fds:\n            if set(lhs) <= known and not set(rhs) <= known:\n                known |= set(rhs); changed = True\n    return known\n# closure({"A"}, [(("A",),("B",)), (("B",),("C",))]) == {"A","B","C"}',
    explanation: 'Attribute closure is the engine: candidate keys, normal-form checks, and lossless tests all reduce to it.',
  },
  {
    match: ['thread', 'semaphore', 'synchronization', 'producer', 'mutex'], title: 'Producer-consumer with semaphores', language: 'python',
    code: 'import threading\nempty = threading.Semaphore(5)  # free slots\nfull = threading.Semaphore(0)   # filled slots\nmutex = threading.Lock()\nbuf = []\ndef produce(x):\n    empty.acquire(); mutex.acquire(); buf.append(x); mutex.release(); full.release()\ndef consume():\n    full.acquire(); mutex.acquire(); x = buf.pop(0); mutex.release(); empty.release()\n    return x',
    explanation: 'Counting semaphores track resources, the mutex guards the buffer — acquiring in a fixed order avoids deadlock.',
  },
];

const GENERIC_SNIPPET: Snippet = {
  match: [], title: 'Invariant-first problem solving', language: 'javascript',
  code: 'function solve(input) {\n  // 1. Validate preconditions (empty? sorted? bounds?)\n  // 2. Preserve the invariant after every step\n  // 3. Check termination: a measure that strictly decreases\n  // 4. State complexity beside the code\n  return input;\n}',
  explanation: 'Nearly every exam and interview solution follows this skeleton: preconditions, invariant, termination, complexity.',
};

// ---------------------------------------------------------- diagram library

const DIAGRAMS: Diagram[] = [
  {
    match: ['binary search', 'sorted array'], title: 'Binary search decision flow', caption: 'Each comparison discards half the interval.',
    mermaid: 'flowchart TD\n  A[lo=0, hi=n-1] --> B{lo <= hi?}\n  B -- No --> Z[Return -1]\n  B -- Yes --> M[mid = lo + (hi-lo)/2]\n  M --> C{a[mid] vs target?}\n  C -- Equal --> F[Return mid]\n  C -- Less --> L[lo = mid + 1]\n  C -- Greater --> H[hi = mid - 1]\n  L --> B\n  H --> B',
  },
  {
    match: ['bst', 'binary search tree'], title: 'BST shape and search path', caption: 'Left < node < right at every level.',
    mermaid: 'graph TD\n  R((4)) --> L((2))\n  R --> G((7))\n  L --> A((1))\n  L --> B((3))\n  G --> H((9))\n  style R fill:#eeeaff,stroke:#7557f5',
  },
  {
    match: ['tcp', 'handshake', 'transport'], title: 'TCP three-way handshake', caption: 'SYN → SYN-ACK → ACK before any data flows.',
    mermaid: 'sequenceDiagram\n  participant C as Client\n  participant S as Server\n  C->>S: SYN (seq=x)\n  S->>C: SYN-ACK (seq=y, ack=x+1)\n  C->>S: ACK (ack=y+1)\n  Note over C,S: Connection ESTABLISHED',
  },
  {
    match: ['cache', 'memory hierarchy', 'locality'], title: 'Memory hierarchy pyramid', caption: 'Faster is smaller: locality decides what lives where.',
    mermaid: 'flowchart TB\n  R[Registers] --> L1[L1 Cache]\n  L1 --> L2[L2 / L3 Cache]\n  L2 --> M[Main Memory]\n  M --> D[SSD / Disk]',
  },
  {
    match: ['osi', 'tcp/ip', 'layer'], title: 'OSI vs TCP/IP layers', caption: 'Each layer adds its own header on the way down.',
    mermaid: 'flowchart TD\n  A[7 Application] --> B[4 Transport]\n  B --> C[3 Network]\n  C --> D[2 Data Link]\n  D --> E[1 Physical]',
  },
  {
    match: ['process', 'thread', 'scheduling', 'state'], title: 'Process state transitions', caption: 'Ready → running → waiting → terminated.',
    mermaid: 'stateDiagram-v2\n  [*] --> New\n  New --> Ready: admitted\n  Ready --> Running: dispatched\n  Running --> Ready: preempted\n  Running --> Waiting: I/O request\n  Waiting --> Ready: I/O done\n  Running --> Terminated: exit',
  },
  {
    match: ['deadlock'], title: 'Circular wait: the deadlock ring', caption: 'Break any edge (e.g. lock ordering) to prevent it.',
    mermaid: 'flowchart LR\n  P1((P1)) -- holds R1<br/>wants R2 --> P2((P2))\n  P2 -- holds R2<br/>wants R1 --> P1',
  },
  {
    match: ['pipeline', 'datapath'], title: 'Classic 5-stage pipeline', caption: 'One instruction completes per cycle at steady state.',
    mermaid: 'flowchart LR\n  IF[Fetch] --> ID[Decode]\n  ID --> EX[Execute]\n  EX --> MEM[Memory]\n  MEM --> WB[Write-back]',
  },
  {
    match: ['b-tree', 'b+ tree', 'index'], title: 'B+ tree: keys above, records in leaves', caption: 'Leaves are linked for fast range scans.',
    mermaid: 'graph TD\n  R[10 | 20] --> A[5]\n  R --> B[15]\n  R --> C[25 | 30]\n  A -.-> B\n  B -.-> C',
  },
  {
    match: ['merge', 'divide and conquer'], title: 'Merge sort recursion tree', caption: 'log n levels × n work per level.',
    mermaid: 'graph TD\n  N([8 4 2 6]) --> L([8 4])\n  N --> R([2 6])\n  L --> L1([8])\n  L --> L2([4])\n  R --> R1([2])\n  R --> R2([6])',
  },
  {
    match: ['dynamic programming', 'recurrence'], title: 'DP: overlap once, reuse forever', caption: 'Memoization turns exponential trees into DAGs.',
    mermaid: 'flowchart TD\n  F5[f(5)] --> F4[f(4)]\n  F5 --> F3a[f(3)]\n  F4 --> F3b[f(3) cached]\n  F4 --> F2[f(2)]',
  },
  {
    match: ['ml', 'training', 'model', 'mlops'], title: 'ML lifecycle loop', caption: 'Monitor → retrain → redeploy, forever.',
    mermaid: 'flowchart LR\n  D[Data] --> T[Train]\n  T --> E[Evaluate]\n  E --> S[Serve]\n  S --> M[Monitor]\n  M --> D',
  },
  {
    match: ['rag', 'retrieval', 'embedding'], title: 'RAG pipeline', caption: 'Retrieve evidence, then generate with citations.',
    mermaid: 'flowchart LR\n  Q[Query] --> R[Retrieve top-k chunks]\n  R --> G[Generate + cite]\n  G --> A[Answer]',
  },
  {
    match: ['normalization', 'functional dependenc'], title: 'Normalization ladder', caption: 'Each rung removes a class of redundancy.',
    mermaid: 'flowchart TD\n  U[UNF: nested data] --> F[1NF: atomic values]\n  F --> S[2NF: no partial dependency]\n  S --> T[3NF: no transitive dependency]\n  T --> B[BCNF: every determinant a superkey]',
  },
];

const GENERIC_DIAGRAM: Diagram = {
  match: [], title: 'The learning loop', caption: 'Recall → apply → verify → repair, on repeat.',
  mermaid: 'flowchart LR\n  R[Recall from memory] --> A[Apply to an example]\n  A --> V[Verify against the invariant]\n  V --> X{Correct?}\n  X -- Yes --> N[Next problem]\n  X -- No --> F[Repair the assumption]\n  F --> R',
};

// ------------------------------------------------------------------ matching

function haystackOf(topic: TopicRef): string {
  return `${topic.title} ${topic.description} ${topic.module || ''}`.toLowerCase();
}

function matchScore(haystack: string, phrases: string[]): number {
  let score = 0;
  for (const phrase of phrases) {
    if (phrase && haystack.includes(phrase.toLowerCase())) score += phrase.split(' ').length + 1;
  }
  return score;
}

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

function pickSnippets(topic: TopicRef, count = 3): Snippet[] {
  const haystack = haystackOf(topic);
  const ranked = SNIPPETS.map((s) => ({ s, score: matchScore(haystack, s.match) }))
    .filter((r) => r.score > 0).sort((a, b) => b.score - a.score).map((r) => r.s);
  return [...ranked, GENERIC_SNIPPET].slice(0, count);
}

function pickDiagrams(topic: TopicRef, count = 3): Diagram[] {
  const haystack = haystackOf(topic);
  const ranked = DIAGRAMS.map((d) => ({ d, score: matchScore(haystack, d.match) }))
    .filter((r) => r.score > 0).sort((a, b) => b.score - a.score).map((r) => r.d);
  return [...ranked, GENERIC_DIAGRAM].slice(0, count);
}

// ------------------------------------------------------------------- builder

/**
 * Build a compact, source-linked local tutorial.  This intentionally follows a
 * familiar reference-tutorial flow (overview → concepts → worked example →
 * implementation → pitfalls → practice) instead of filling every topic with
 * the same generic essay.  It is original local material, designed to be read
 * in one focused sitting while the linked docs remain available for detail.
 */
export function buildLocalPack(topicId: string, topic: TopicRef, depth: PackDepth = 'standard'): any {
  const knowledge = localKnowledgeFor({ ...topic, id: topicId });
  const references = referencesFor({ ...topic, id: topicId });
  const related = relatedQuestions(topic, 6);
  const matchedSnippets = pickSnippets(topic, depth === 'eli5' ? 1 : 2);
  const matchedDiagrams = pickDiagrams(topic, 1);
  const codeExamples = [knowledge.code, ...matchedSnippets]
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((candidate: any) => candidate.title === (item as any).title) === index)
    .slice(0, depth === 'deep' ? 3 : 2)
    .map((item: any) => ({ title: item.title, language: item.language, code: item.code, explanation: item.explanation }));
  const diagrams = [knowledge.diagram, ...matchedDiagrams]
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((candidate: any) => candidate.title === (item as any).title) === index)
    .slice(0, 2)
    .map((item: any) => ({ title: item.title, caption: item.caption, mermaid: item.mermaid }));
  const S = (heading: string, body: string) => ({ heading, body });
  const title = topic.title;
  const module = topic.module || 'this module';
  const quickFacts = knowledge.mechanics.map((item) => `• ${item}`).join('\n');
  const buildSteps = knowledge.buildSteps.map((item, index) => `${index + 1}. ${item}`).join('\n');
  const bankExample = related[0]
    ? `**Practice anchor — ${related[0].subject}, ${related[0].year}:** ${related[0].question}\n\nBefore reading the answer, choose an option and state the rule you used. **Answer:** ${related[0].options[related[0].answer]}. ${related[0].explanation}`
    : `Create a tiny example for ${title}: write the input, the state after each step, and the expected result. Then change one boundary condition and explain why the result changes or stays the same.`;

  const sections: any[] = [
    S(`Introduction to ${title}`, `${title} is about ${knowledge.focus}. ${topic.description}\n\n**By the end of this local tutorial, you should be able to:** define the key terms in plain language, trace one realistic example, make the important trade-off, and recognize the failure mode that makes an otherwise plausible answer wrong. This is a compact reference-style lesson: read it once, work the example, then use the source links for API-level detail.`),
    S('Core idea and vocabulary', `${knowledge.mentalModel}\n\n${quickFacts}`),
    S('How it works: a guided example', `${knowledge.workedExample}\n\n${bankExample}`),
    S('Build or apply it', `${buildSteps}\n\nWhen you implement or solve a question, write the contract first: what comes in, what result must come out, and which condition must remain true while you work. That turns the example into a reusable method rather than a memorized answer.`),
    S('Common mistakes and a fast self-check', `**The trap:** ${knowledge.trap}\n\n**Check yourself:** ${knowledge.check}\n\nUse this exit test before moving on: explain the mental model without the page, solve the smallest non-trivial case, then name one input, workload, or assumption where your first approach would fail. If any step is fuzzy, repeat only that section and retry the example.`),
    S(`Where ${title} fits next`, `${title} is one link in ${module}. Review any prerequisite that you could not use during the example; then move to the next syllabus topic only after you can retrieve this lesson’s model, procedure, and trap from memory.\n\n**Reference reading:** start with ${references[0].title} for the canonical vocabulary, use ${references[1].title} for a second explanation, and keep ${references[2].title} for examples or practice. The links are provided as sources—not copied text—so you can verify details and go deeper.`),
  ];

  if (depth === 'eli5') {
    sections.splice(1, 1, S('The simple picture', `${knowledge.mentalModel}\n\nThink of the worked example as a small story: identify what goes in, what changes, and what comes out. Do not memorize terms until you can tell that story.`));
    sections.splice(3, 1);
  }
  if (depth === 'deep') {
    sections.splice(4, 0,
      S('Trade-offs and transfer', `Strong answers compare alternatives instead of presenting one technique as magic. For ${title}, name the precondition that makes the standard approach valid, the resource it consumes (time, memory, complexity, or operational risk), and the signal that tells you to choose a different approach.\n\nTransfer drill: take the guided example and change its scale, ordering, failure mode, or correctness requirement. Re-state the invariant or contract before deciding whether the same solution still holds.`),
      S('Prove it, test it, teach it', `Use a four-beat proof or review: **initialization** (why the starting state is valid), **maintenance** (why each step preserves the rule), **termination** (why progress cannot continue forever), and **conclusion** (why the final state solves the original problem).\n\nThen teach ${title} in two minutes using one diagram, one example, and the trap above. A clear explanation under this constraint is a stronger signal of mastery than a longer summary.`),
    );
  }

  const flashcards = [
    { question: `What is the core mental model for ${title}?`, answer: knowledge.mentalModel },
    ...knowledge.mechanics.slice(0, 3).map((mechanic, index) => ({ question: `${title}: key idea ${index + 1}?`, answer: mechanic })),
    { question: `What is the most important trap in ${title}?`, answer: knowledge.trap },
    { question: `How do you check your understanding of ${title}?`, answer: knowledge.check },
    ...related.slice(0, 2).map((q) => ({ question: q.question, answer: `${q.options[q.answer]} — ${q.explanation}` })),
  ].slice(0, depth === 'eli5' ? 5 : 7);

  const quiz = [
    ...related.slice(0, 3).map((q) => ({ question: q.question, options: q.options, answer: q.answer, explanation: q.explanation })),
    {
      question: `What is the strongest way to begin a ${title} problem?`,
      options: ['Memorise a final answer', 'State the model, inputs, assumptions, and success condition', 'Optimise before checking correctness', 'Ignore the smallest example'],
      answer: 1,
      explanation: `The local method for ${title} starts with an explicit model and preconditions; that makes the procedure, trade-off, and edge cases checkable.`,
    },
    {
      question: `Which habit best protects against the common ${title} mistake?`,
      options: ['Choose the familiar-looking option first', 'Test only a large happy-path example', 'Name the assumption and test a boundary or failure case', 'Skip source documentation'],
      answer: 2,
      explanation: `The key trap is: ${knowledge.trap} Making assumptions and boundaries explicit is the quickest way to catch it.`,
    },
  ].slice(0, depth === 'eli5' ? 4 : 5);

  const cheatSheet = [
    `Purpose: ${knowledge.focus}.`,
    `Mental model: ${knowledge.mentalModel}`,
    ...knowledge.mechanics.slice(0, 3),
    `Trap: ${knowledge.trap}`,
    `Recall check: ${knowledge.check}`,
  ].slice(0, 7);
  // Hard guarantee, matching the AI lesson: 5-6 sections at eli5/standard, and
  // genuinely more at deep rather than the same lesson with a different label.
  const maxSections = depth === 'deep' ? 9 : 6;
  if (sections.length > maxSections) sections.length = maxSections;
  while (sections.length < 5) {
    sections.push(S(`Retrieval practice for ${title}`, `Close the page and write down, from memory: the mental model, the procedure you would follow, and the trap that makes a plausible answer wrong. Then reopen the lesson and mark the part you could not reproduce.\n\n**Check yourself:** ${knowledge.check}`));
  }
  const words = sections.reduce((total, section) => total + String(section.body).trim().split(/\s+/).length, 0);

  return {
    topicId,
    title,
    depth,
    generatedAt: new Date().toISOString(),
    readingMinutes: Math.max(4, Math.round(words / 190)),
    verification: {
      status: 'fallback',
      evidenceMode: 'local-fallback',
      provider: 'local-curated-tutorials',
      fallbackReason: 'The agent runtime or provider was unavailable; this original source-linked local tutorial is ready to study.',
      sources: references.map((reference) => `${reference.publisher}: ${reference.title}`),
      sourceRefs: references,
      claimsChecked: related.length,
    },
    notes: { sections },
    codeExamples,
    diagrams,
    cheatSheet,
    videos: references.map((reference) => ({ title: `${reference.publisher}: ${reference.title}`, url: reference.url, timestamp: 'Read next' })),
    flashcards,
    quiz,
    pyqs: related.slice(0, 3).map((q) => ({ year: q.year, question: q.question, difficulty: q.difficulty })),
  };
}
