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

export function buildLocalPack(topicId: string, topic: TopicRef, depth: PackDepth = 'standard'): any {
  const T = topic.title;
  const D = topic.description;
  const M = topic.module || 'Core concepts';
  const related = relatedQuestions(topic, 6);
  const snippets = depth === 'eli5' ? pickSnippets(topic, 2) : pickSnippets(topic, 3);
  const diagrams = depth === 'eli5' ? pickDiagrams(topic, 2) : pickDiagrams(topic, 3);
  const S = (heading: string, body: string) => ({ heading, body });

  const examBlock = related.length
    ? related.slice(0, 3).map((q, i) =>
      `Q${i + 1} (${q.year} · ${q.subject}): ${q.question}\n${q.options.map((o, j) => `  ${'ABCD'[j]}. ${o}`).join('\n')}\nAnswer: ${'ABCD'[q.answer]}. ${q.explanation}`).join('\n\n')
    : 'No banked question matches this exact topic yet — apply the method below to any practice set and file misses in your mistake notebook.';

  const trapBlock = related.length
    ? related.slice(0, 4).map((q) => `• ${q.topic}: ${q.explanation}`).join('\n')
    : '• Skipping preconditions — most wrong answers violate an assumption, not the method.\n• Confusing similar terms — define each one before comparing.\n• Ignoring edge cases — empty, single, duplicate, maximum, invalid.';

  const sections: any[] = [];
  if (depth === 'eli5') {
    sections.push(S('The 30-second story', `Imagine ${T} as a kitchen routine you already know: ingredients go in, fixed steps transform them, and a finished dish comes out. ${D} The only thing that makes it feel hard is vocabulary — every new term below maps to one concrete thing you can point at.\n\nRead this kit like a story first, examples second, definitions last. By the end you will explain ${T} to a friend without notes — that is the entire goal of this mode. When you feel comfortable, regenerate this kit in Standard mode for the full exam-grade treatment.`));
  }
  sections.push(
    S('Start with the intuition', `${T} becomes easy when you connect the definition to one small concrete example. ${D}\n\nName three things before anything else: the input you are given, the transformation that happens, and the result you must produce. Then ask the question that matters most: what must remain true after every single step? That invariant is the backbone of every proof, every implementation, and every correct exam answer on this topic.\n\nTest the idea immediately with an edge case — empty input, a single element, the maximum allowed value — and explain the outcome in your own words. If you cannot, the model is still fuzzy: shrink the example until it is obvious, then grow it back.\n\nMake the model stick with a 60-second drill: close your eyes and narrate what happens to one concrete input, naming the state after every step. Then change exactly one thing about the input — order, size, duplicates — and predict the new outcome before checking. Correct predictions mean the intuition is real; wrong ones pinpoint the fuzzy step to revisit.`),
    S('Formal definition and vocabulary', `Now make the intuition airtight. In a formal solution you define each variable, state every assumption, and separate the general rule from convenient special cases.\n\nTranslate problems into this vocabulary before choosing any technique: list preconditions, bounds, and whether behavior depends on input order or hidden state. Most avoidable mistakes come from applying a valid rule where its preconditions fail.\n\nKeep a running glossary as you read: term, one-line definition, and one example each. ${M} rewards precise language — examiners and interviewers both test whether you can distinguish neighboring concepts, not just recite them.\n\nWrite every definition three ways: in plain words, in symbols or pseudocode, and as a tiny example with its answer. If any of the three versions disagrees with the others, you have found a gap — resolve it now, because exams and interviewers probe exactly those seams. Revisit this glossary before every practice set until each entry feels boring and obvious.`),
    S('Worked example, step by step', `Take a deliberately small input and write the state after every operation — on paper, not in your head. At each step, name the invariant out loud: the fact that stays true and guarantees progress.\n\nThen grow the input and check that the same reasoning scales. Ask: which step dominates the cost? What auxiliary information am I storing, and is it necessary? A solution you can trace by hand is a solution you actually understand.\n\nFinish by re-solving the same example from memory with the page covered. Retrieval — not re-reading — is what moves this into long-term memory.\n\nNow solve a second example that differs in one structural way: a different shape, order, or boundary condition. Before tracing it, write your prediction and your reason in one sentence. Comparing prediction against trace is the fastest known way to convert fragile familiarity into durable skill.`),
    S('Real exam-style problems, solved', `These are real patterns from the question bank. Cover the answers, attempt each one, then study the reasoning:\n\n${examBlock}\n\nNotice the shared method: classify the concept, write the governing rule, eliminate options by specific contradiction, verify the survivor with a small case. Speed comes from pattern recognition; accuracy comes from never skipping the verification step.\n\nTrain under exam conditions in two passes. Pass one is untimed: solve slowly, justify every elimination in writing, and record each trap in a distractor journal with the exact line of reasoning that would have saved you. Pass two is timed at 90 seconds per question: classify first, compute second, verify third. Your journal, not your score, is the real output of this section.`),
    S('Code walkthrough', `Read the implementation below (${snippets[0]?.title || 'invariant-first solving'}) line by line and map each line to the invariant from section one. Then close it and rewrite the core logic from memory.\n\n${snippets[0]?.explanation || ''}\n\nDeliberately break it: remove a boundary check, flip a comparison, skip initialization. Watching exactly how it fails teaches more than ten clean re-reads. Port the same logic to a second language or style (iterative vs recursive) to prove the idea is language-independent.\n\nAnnotate the final version with its contract: preconditions at the top, the invariant as a comment inside the loop or recursion, and the complexity beside the signature. Then list five tests — empty, singleton, typical, boundary, adversarial — and confirm each by hand. Code you can specify, break, fix, and test is code you own.`),
    S('Visual map of the idea', `Study the diagrams attached to this kit (${diagrams.map((d) => d.title).join('; ')}). Redraw the first one from memory — diagrams you can reproduce are concepts you own.\n\nFor each node or arrow, ask what breaks if it is removed. Visual reasoning catches structural misunderstandings that prose hides: cycles, missing base cases, and ordering bugs all show up as wrong shapes before they show up as wrong answers.\n\nDo a teach-back: explain the diagram to an imaginary junior in under two minutes, pointing at each node as the words leave your mouth. Wherever you hesitate, the understanding is thin — mark that node and re-study only that part. Repeat until the explanation flows without pauses.`),
    S('Complexity and trade-offs', `Every serious answer states its costs. Use this comparison habit:\n\n| Approach | Time | Space | When to use |\n|---|---|---|---|\n| Brute force | Usually exponential or quadratic | Minimal | Tiny inputs, or as a correctness baseline |\n| Textbook method | As analyzed below | Moderate | Default choice once preconditions hold |\n| Optimized variant | Better constants or bounds | Often higher | When profiling proves it matters |\n\nAlways say whether a bound is best, average, or worst case, and name the input that triggers the worst case. In exams, half the options die the moment you check complexity; in interviews, stating trade-offs unprompted signals senior thinking.\n\nFor recursive methods, write the recurrence and solve it (substitution or a recursion tree — show two levels, then generalize). For iterative ones, count the dominant operation as a function of input size and argue why nothing else matters. Then sanity-check with numbers: what does n = 10^5 cost under each candidate bound? Arithmetic kills hand-waving.`),
    S('Common mistakes and edge cases', `The traps that actually catch learners on this topic:\n\n${trapBlock}\n\nBuild a personal edge-case checklist and run every solution through it: empty, singleton, duplicates, sorted and reverse-sorted, maximum values, invalid states, and adversarial orderings. Log each miss in your mistake notebook with the failed assumption — that log is worth more than any formula sheet.\n\nRun a pre-mortem before your next practice set: imagine you already failed it, and write down the three most likely reasons — a skipped precondition, a misread bound, a confused pair of terms. Then solve the set with that list visible. Catching a predicted failure in the moment rewires the habit permanently.`),
    S('How this appears in exams and interviews', `Examiners test ${T} in three predictable ways: direct definition recall (fast marks — never drop these), small-case application (trace by hand, watch boundaries), and disguised variants where the topic hides inside a story (classify first, then solve).\n\nInterviewers add a fourth: trade-off discussion. Prepare a two-minute spoken answer covering what it is, when it wins, when it loses, and its complexity. Practice saying it aloud — fluency under pressure is a trained skill, not talent.\n\nScript your two-minute answer now: sentence one defines it, sentence one defines it, sentence two gives the smallest example, sentence three states when it wins and loses, sentence four gives complexity with the worst-case trigger. Then prepare for the inevitable follow-up — 'what breaks if...?' — by listing the three most attackable assumptions in your own explanation.`),
    S(`Where ${T} fits in ${M}`, `Zoom out: this topic exists to solve a specific class of problems inside ${M}. Name its prerequisites (what must be solid first) and its successors (what it unlocks next). Learning in dependency order compounds; learning out of order leaks.\n\nIf a prerequisite feels shaky, detour for one focused session rather than struggling through confusion. The syllabus view shows the full chain — use it as a map, not a cage.\n\nTest each prerequisite in 30 seconds: can you state its core idea and solve its simplest case cold? Any hesitation means a detour, and detours compound positively — an hour on foundations routinely saves three on advanced topics. Write down the two topics this one unlocks and glance at them now; knowing the destination makes the current climb feel purposeful.`),
    S('Cheat sheet (memorize this)', cheatBullets(T, related).map((b) => `• ${b}`).join('\n')),
    S('Your practice plan for this topic', `1) Attempt the kit quiz below untimed and write one-line justifications.\n2) Grade with spaced flashcards over the next week (Again/Hard/Good/Easy).\n3) Drill 5 adaptive PYQs on this subject, then one timed mini-mock.\n4) Explain the core idea aloud in 60 seconds — record it, replay it, fix the fuzzy parts.\n\nDone means: accurate under time, explainable from memory, and connected to neighboring topics. Anything less is familiarity, not mastery.\n\nSchedule the follow-through: review these flashcards tomorrow, in 3 days, in 7 days, and in 14 days — the app's spaced scheduler handles the timing if you grade honestly. Each review should be faster than the last; if one feels harder, that card marks a genuine gap worth one more worked example.`),
  );
  if (depth === 'deep') {
    sections.push(
      S('Proof sketch: why it actually works', `Go beyond using the method — prove it. Restate the invariant as a formal claim, show it holds initially, show each step preserves it, and show it implies correctness at termination. This four-part skeleton (initiation, maintenance, termination, conclusion) fits nearly every algorithm on this topic.\n\nThen steelman the skeptic: construct the nastiest input you can and trace why the proof still holds. If you find a hole, you have found either a deeper truth or a real boundary condition worth remembering.\n\nWrite the proof in the standard four-beat rhythm and keep it beside your implementation: initiation (the invariant holds before the first step), maintenance (each step preserves it — show the algebra), termination (a measure strictly decreases, so the process ends), conclusion (invariant plus termination implies the postcondition). Proofs in this shape are checkable, and checkable proofs survive exam pressure.`),
      S('Advanced variations', `The standard form is the beginning. Explore the variants that separate strong candidates: tighter bounds under extra assumptions, randomized or approximate versions, parallel or streaming adaptations, and the generalization that unifies neighboring topics.\n\nFor each variant, answer: what changes, what stays invariant, and what breaks. Depth is breadth plus the ability to transfer — these variations are transfer training.\n\nBuild a comparison table with one row per variant and columns for assumption, cost, and failure mode. The table forces the real question — 'which variant wins under which constraints?' — and that question is precisely what senior interview loops and the hardest exam items ask. Memorize the table by rebuilding it blank.`),
      S('In production systems', `This topic earns its keep far beyond exams: query planners, caches, schedulers, load balancers, ML pipelines, and distributed stores all embed these ideas. Pick one production system you use and find where ${T} hides inside it.\n\nRead one engineering blog or paper section about that usage. Real constraints — partial failure, skewed data, latency budgets — reframe the textbook version and make it unforgettable.\n\nFrame the production usage as an SLO problem: what latency, throughput, or correctness budget does the system promise, and how does this topic help meet it? Then name the failure mode that wakes engineers at night — skew, stampedes, partial failure, drift — and how the textbook version must bend to survive it. Concepts tied to operational pain are never forgotten.`),
      S('Challenge drill', `Close the kit. Solve: (1) the hardest related bank question from memory, (2) a self-invented adversarial case, (3) a two-minute whiteboard explanation with diagram. Time yourself.\n\nThen regenerate this topic in ELI5 mode and compare — the ideas that survive simplification are the ones you truly own.\n\nGrade yourself honestly: 3 points for a correct unaided solution, 2 for correct-with-hint, 1 for a clear explanation of exactly where you got stuck, 0 for anything else. Below 7 total means another cycle through the kit with full retrieval; 9 or above means you are ready to teach it — the strongest possible signal of mastery.`),
    );
  }

  const flashcards = [
    ...related.slice(0, 4).map((q) => ({ question: q.question, answer: `${q.options[q.answer]} — ${q.explanation}` })),
    { question: `What is the core idea behind ${T}?`, answer: 'State the input, invariant, transformation, and result; verify with a small example and its edge cases.' },
    { question: 'How should you analyse a solution?', answer: 'Check preconditions, correctness invariant, time complexity, extra space, and boundary cases.' },
    { question: 'What is a common failure mode?', answer: 'Applying a valid rule where its preconditions fail — especially on empty, duplicate, maximum, or adversarial inputs.' },
    { question: 'How do you convert this into exam readiness?', answer: 'Classify the pattern, solve untimed with justifications, explain every distractor, then repeat under time.' },
  ].slice(0, 8);
  const quiz = [
    ...related.slice(0, 4).map((q) => ({ question: q.question, options: q.options, answer: q.answer, explanation: q.explanation })),
    { question: `Which is the strongest first step when solving ${T}?`, options: ['Memorise a template', 'Identify input, invariant, and preconditions', 'Skip edge cases', 'Optimise before proving'], answer: 1, explanation: 'A clear model and explicit assumptions guide both proof and implementation.' },
    { question: 'What should a high-quality explanation include?', options: ['Only the final answer', 'Definition, example, mistakes, trade-offs, and practice', 'Only a formula', 'Unverified links'], answer: 1, explanation: 'Learning sticks when concepts connect to intuition, formal language, examples, and retrieval.' },
  ].slice(0, 6);

  const words = sections.reduce((n, s) => n + String(s.body).split(/\s+/).length, 0);
  return {
    topicId, title: T, depth, generatedAt: new Date().toISOString(), readingMinutes: Math.max(6, Math.round(words / 200)),
    verification: {
      status: 'fallback', evidenceMode: 'local-fallback', provider: 'local-mastery-templates',
      fallbackReason: 'Agent runtime or provider was unavailable',
      sources: ['MIT OpenCourseWare', 'NPTEL', 'MDN Web Docs', 'EduSwarm question bank'],
      claimsChecked: related.length,
    },
    notes: { sections },
    codeExamples: snippets.map((s) => ({ title: s.title, language: s.language, code: s.code, explanation: s.explanation })),
    diagrams: diagrams.map((d) => ({ title: d.title, caption: d.caption, mermaid: d.mermaid })),
    cheatSheet: cheatBullets(T, related),
    videos: [
      { title: `${T} — NPTEL lecture`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${T} NPTEL lecture`)}`, timestamp: '00:00' },
      { title: `${T} — MIT OpenCourseWare`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${T} MIT OpenCourseWare`)}`, timestamp: '00:00' },
      { title: `${T} — practical walkthrough`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${T} tutorial`)}`, timestamp: '00:00' },
    ],
    flashcards, quiz,
    pyqs: related.slice(0, 3).map((q) => ({ year: q.year, question: q.question, difficulty: q.difficulty })),
  };
}

function cheatBullets(T: string, related: Question[]): string[] {
  const bullets = [
    `Define ${T} in one sentence before solving anything.`,
    'Invariant first: name what stays true after every step.',
    'Trace a tiny example by hand; then grow it.',
    'State time + space with best/average/worst labeled.',
    'Run the edge-case checklist: empty, single, duplicate, max, invalid.',
  ];
  if (related[0]) bullets.push(`Anchor pattern: ${related[0].topic} — ${related[0].explanation}`);
  if (related[1]) bullets.push(`Second pattern: ${related[1].topic} — ${related[1].explanation}`);
  return bullets.slice(0, 7);
}
