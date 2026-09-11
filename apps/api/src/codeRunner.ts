/**
 * EduSwarm Code Runner
 * --------------------
 * Sandboxed JavaScript execution for the Code Lab. Learner code must define
 * `function solve(...args)`. Each test case invokes solve with JSON-safe
 * arguments inside a fresh `node:vm` context with no require/process/network
 * access and a hard wall-clock timeout.
 *
 * This is intentionally JavaScript-only: it runs dependency-free on any Node
 * host (including Render free tier) without containers or external judges.
 */

import vm from 'node:vm';

export type RunCase = { args: unknown[]; expected: unknown; label?: string };
export type CaseResult = {
  label: string;
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  error?: string;
};
export type RunResult = {
  ok: boolean;
  error?: string;
  logs: string[];
  passed: number;
  total: number;
  cases: CaseResult[];
};

const MAX_CODE_BYTES = 20_000;
const MAX_CASES = 20;

function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) < 1e-9;
  }
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => deepEqual(item, b[index]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as Record<string, unknown>).sort();
    const bKeys = Object.keys(b as Record<string, unknown>).sort();
    if (!deepEqual(aKeys, bKeys)) return false;
    return aKeys.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
    );
  }
  return false;
}

function safePreview(value: unknown): unknown {
  try {
    const text = JSON.stringify(value);
    if (text && text.length > 500) return `${text.slice(0, 500)}…`;
    return value === undefined ? 'undefined' : JSON.parse(text || 'null');
  } catch {
    return String(value).slice(0, 500);
  }
}

export function runJavaScript(code: string, cases: RunCase[], timeoutMs = 900): RunResult {
  if (typeof code !== 'string' || !code.trim()) {
    return { ok: false, error: 'No code was submitted.', logs: [], passed: 0, total: 0, cases: [] };
  }
  if (code.length > MAX_CODE_BYTES) {
    return { ok: false, error: 'Code exceeds the 20 KB limit.', logs: [], passed: 0, total: 0, cases: [] };
  }
  if (!Array.isArray(cases) || cases.length === 0 || cases.length > MAX_CASES) {
    return { ok: false, error: `Provide between 1 and ${MAX_CASES} test cases.`, logs: [], passed: 0, total: 0, cases: [] };
  }

  const logs: string[] = [];
  const sandbox: Record<string, unknown> = {
    console: {
      log: (...items: unknown[]) => {
        if (logs.length < 20) logs.push(items.map((item) => String(item)).join(' ').slice(0, 200));
      },
    },
    solve: undefined,
    __args: [],
  };
  vm.createContext(sandbox, { name: 'eduswarm-codelab' });

  try {
    const probe = new vm.Script(`${code}\n;typeof solve;`, { filename: 'solution.js' });
    const typeofSolve = probe.runInContext(sandbox, { timeout: timeoutMs });
    if (typeofSolve !== 'function') {
      return { ok: false, error: 'Define a function named solve(...). Example: function solve(nums, target) { … }', logs, passed: 0, total: cases.length, cases: [] };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/timed out/i.test(message)) {
      return { ok: false, error: 'Your code timed out while loading (possible infinite loop at top level).', logs, passed: 0, total: cases.length, cases: [] };
    }
    return { ok: false, error: `Your code could not be parsed: ${message}`, logs, passed: 0, total: cases.length, cases: [] };
  }

  const results: CaseResult[] = cases.map((test, index) => {
    const label = test.label || `Case ${index + 1}`;
    try {
      sandbox.__args = Array.isArray(test.args) ? test.args : [test.args];
      const actual = new vm.Script('solve.apply(null, __args)').runInContext(sandbox, { timeout: timeoutMs });
      const passed = deepEqual(actual, test.expected);
      return passed
        ? { label, passed: true, actual: safePreview(actual), expected: safePreview(test.expected) }
        : { label, passed: false, actual: safePreview(actual), expected: safePreview(test.expected) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        label,
        passed: false,
        expected: safePreview(test.expected),
        error: /timed out/i.test(message) ? 'Timed out — check for an infinite loop.' : message.slice(0, 300),
      };
    }
  });

  return { ok: true, logs, passed: results.filter((r) => r.passed).length, total: results.length, cases: results };
}
