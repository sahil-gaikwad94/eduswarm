/**
 * EduSwarm Code Lab challenges.
 * Functional `solve(...)` tasks mapped to curriculum concepts so code practice
 * feeds the same mastery model as quizzes and lessons.
 */
import type { RunCase } from './codeRunner.js';

export type CodeChallenge = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
  prompt: string;
  signature: string;
  starter: string;
  tests: RunCase[];
  hints: string[];
};

export const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    subject: 'Data Structures',
    topic: 'Hashing',
    prompt: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Each input has exactly one solution; do not reuse an element.',
    signature: 'solve(nums, target)',
    starter: 'function solve(nums, target) {\n  // Return [i, j] such that nums[i] + nums[j] === target\n  return [0, 1];\n}',
    tests: [
      { label: 'basic', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { label: 'unordered', args: [[3, 2, 4], 6], expected: [1, 2] },
      { label: 'duplicates', args: [[3, 3], 6], expected: [0, 1] },
      { label: 'negative', args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
    ],
    hints: ['A hash map turns the O(n²) scan into O(n).', 'For each value, look up (target − value) before inserting.'],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    subject: 'Data Structures',
    topic: 'Stacks',
    prompt: 'Given a string s containing only ()[]{} characters, decide whether brackets are closed in the correct order.',
    signature: 'solve(s)',
    starter: 'function solve(s) {\n  // Return true if brackets are balanced\n  return false;\n}',
    tests: [
      { label: 'simple', args: ['()'], expected: true },
      { label: 'nested', args: ['()[]{}'], expected: true },
      { label: 'mismatch', args: ['(]'], expected: false },
      { label: 'interleaved', args: ['([)]'], expected: false },
      { label: 'deep', args: ['{[]}'], expected: true },
    ],
    hints: ['Push opening brackets; pop on closings.', 'A closing bracket must match the most recent opening.'],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'easy',
    subject: 'Algorithms',
    topic: 'Searching',
    prompt: 'Given a sorted array nums and a target, return its index or −1. Your solution must run in O(log n).',
    signature: 'solve(nums, target)',
    starter: 'function solve(nums, target) {\n  // Return the index of target or -1\n  return -1;\n}',
    tests: [
      { label: 'found', args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { label: 'missing', args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { label: 'single-hit', args: [[5], 5], expected: 0 },
      { label: 'single-miss', args: [[5], 3], expected: -1 },
      { label: 'empty', args: [[], 1], expected: -1 },
    ],
    hints: ['Maintain the invariant: target (if present) is always within [lo, hi].', 'Use mid = lo + ((hi − lo) >> 1) to avoid overflow.'],
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'medium',
    subject: 'Algorithms',
    topic: 'Sorting',
    prompt: 'Given interval pairs [start, end], merge all overlapping intervals and return the merged list sorted by start.',
    signature: 'solve(intervals)',
    starter: 'function solve(intervals) {\n  // Return merged intervals, e.g. [[1,6],[8,10]]\n  return intervals;\n}',
    tests: [
      { label: 'overlap', args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { label: 'touching', args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { label: 'nested', args: [[[1, 10], [2, 3], [4, 8]]], expected: [[1, 10]] },
      { label: 'disjoint', args: [[[1, 2], [3, 4]]], expected: [[1, 2], [3, 4]] },
    ],
    hints: ['Sort by start first; then one linear pass suffices.', 'Touching intervals ([1,4],[4,5]) count as overlapping here.'],
  },
  {
    id: 'postfix-eval',
    title: 'Postfix Evaluator',
    difficulty: 'medium',
    subject: 'Data Structures',
    topic: 'Stacks',
    prompt: 'Evaluate an arithmetic expression in Reverse Polish Notation. Tokens are integers or +, −, *, /. Division truncates toward zero.',
    signature: 'solve(tokens)',
    starter: 'function solve(tokens) {\n  // Return the integer result\n  return 0;\n}',
    tests: [
      { label: 'gate-classic', args: [['5', '3', '2', '*', '+']], expected: 11 },
      { label: 'div-trunc', args: [['4', '13', '5', '/', '+']], expected: 6 },
      { label: 'complex', args: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], expected: 22 },
    ],
    hints: ['Operands go on the stack; operators pop two operands.', 'Careful with order: second-popped is the left operand.'],
  },
  {
    id: 'queue-state',
    title: 'Circular Queue State',
    difficulty: 'medium',
    subject: 'Data Structures',
    topic: 'Queues',
    prompt: 'A circular queue of capacity N uses the sacrificed-slot convention. Given front index, rear index, and capacity, return "full", "empty", or "partial".',
    signature: 'solve(front, rear, capacity)',
    starter: 'function solve(front, rear, capacity) {\n  // Return "full" | "empty" | "partial"\n  return "partial";\n}',
    tests: [
      { label: 'empty', args: [0, 0, 8], expected: 'empty' },
      { label: 'full', args: [0, 7, 8], expected: 'full' },
      { label: 'wrapped-full', args: [3, 2, 8], expected: 'full' },
      { label: 'partial', args: [2, 5, 8], expected: 'partial' },
    ],
    hints: ['Empty iff front == rear.', 'Full iff (rear + 1) % N == front.'],
  },
  {
    id: 'bst-search',
    title: 'BST Search',
    difficulty: 'medium',
    subject: 'Data Structures',
    topic: 'Trees',
    prompt: 'Trees are nested arrays [value, left, right] with null for missing children. Return true if key exists in the BST.',
    signature: 'solve(root, key)',
    starter: 'function solve(root, key) {\n  // Return true if key is present\n  return false;\n}',
    tests: [
      { label: 'present', args: [[4, [2, [1, null, null], [3, null, null]], [7, null, null]], 3], expected: true },
      { label: 'absent', args: [[4, [2, [1, null, null], [3, null, null]], [7, null, null]], 5], expected: false },
      { label: 'empty-tree', args: [null, 1], expected: false },
      { label: 'root-only', args: [[9, null, null], 9], expected: true },
    ],
    hints: ['Use the BST property to discard half the tree per step.', 'Handle the null base case before destructuring.'],
  },
  {
    id: 'subnet-hosts',
    title: 'Subnet Host Count',
    difficulty: 'easy',
    subject: 'Computer Networks',
    topic: 'IP Addressing',
    prompt: 'Given a CIDR string like "192.168.1.0/26", return the number of usable host addresses (exclude network and broadcast; return 0 when none remain).',
    signature: 'solve(cidr)',
    starter: 'function solve(cidr) {\n  // Return usable host count, e.g. solve("10.0.0.0/24") === 254\n  return 0;\n}',
    tests: [
      { label: '/24', args: ['10.0.0.0/24'], expected: 254 },
      { label: '/26', args: ['192.168.1.0/26'], expected: 62 },
      { label: '/30', args: ['172.16.0.0/30'], expected: 2 },
      { label: '/32', args: ['8.8.8.8/32'], expected: 0 },
    ],
    hints: ['Usable hosts = 2^(32 − prefix) − 2, floored at 0.', 'Split the string on "/" to get the prefix length.'],
  },
  {
    id: 'linked-cycle',
    title: 'Cycle Detection',
    difficulty: 'medium',
    subject: 'Algorithms',
    topic: 'Two Pointers',
    prompt: 'A linked list is given as values[] plus pos (the index the tail links back to, or −1 for no cycle). Return true if a cycle exists. Aim for O(1) extra space.',
    signature: 'solve(values, pos)',
    starter: 'function solve(values, pos) {\n  // Return true if the list has a cycle\n  return false;\n}',
    tests: [
      { label: 'cycle', args: [[3, 2, 0, -4], 1], expected: true },
      { label: 'self-loop', args: [[1], 0], expected: true },
      { label: 'acyclic', args: [[1, 2, 3], -1], expected: false },
      { label: 'single-acyclic', args: [[1], -1], expected: false },
    ],
    hints: ['Model the list, then run Floyd’s tortoise and hare.', 'Empty input (pos −1) must never report a cycle.'],
  },
  {
    id: 'edit-distance',
    title: 'Edit Distance',
    difficulty: 'hard',
    subject: 'Algorithms',
    topic: 'Dynamic Programming',
    prompt: 'Return the minimum insertions, deletions, and substitutions needed to convert word1 into word2 (Levenshtein distance).',
    signature: 'solve(word1, word2)',
    starter: 'function solve(word1, word2) {\n  // Return the minimum edit distance\n  return 0;\n}',
    tests: [
      { label: 'classic', args: ['horse', 'ros'], expected: 3 },
      { label: 'insert-heavy', args: ['', 'abc'], expected: 3 },
      { label: 'equal', args: ['gate', 'gate'], expected: 0 },
      { label: 'substitution', args: ['intention', 'execution'], expected: 5 },
    ],
    hints: ['dp[i][j] = cost for the first i / j characters.', 'Match → dp[i−1][j−1]; else 1 + min(delete, insert, replace).'],
  },
];

export function challengeById(id: string): CodeChallenge | undefined {
  return CODE_CHALLENGES.find((c) => c.id === id);
}

/** Public listing hides hidden tests but keeps two worked examples. */
export function publicChallenges(): Array<Omit<CodeChallenge, 'tests'> & { examples: RunCase[]; testCount: number }> {
  return CODE_CHALLENGES.map(({ tests, ...rest }) => ({
    ...rest,
    examples: tests.slice(0, 2),
    testCount: tests.length,
  }));
}
