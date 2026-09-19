/**
 * Seeded local study kits: real tutorial content, structured for teaching.
 * ------------------------------------------------------------------------
 * When the model chain fails, `buildLocalPack` still has to hand the learner a
 * usable lesson. Its own curated profiles cover the big topics well, but for
 * the long tail they degrade to generic study advice. A seeded kit replaces
 * that with the actual explanation from a publisher we have rights to
 * (GeeksforGeeks, MDN, W3Schools), already parsed into sections, code samples,
 * key points and definitions.
 *
 * Kits are DATA, not code:
 *  - they live outside the Git checkout (`EDUSWARM_KITS_DIR`, default
 *    `.data/kits`), so no third-party article text is ever committed;
 *  - they are produced by `npm run seed:kits`, which honours robots.txt,
 *    records the source URL and licence note on every extract, and skips any
 *    publisher not on the allow-list;
 *  - this module only *reads* what has already been seeded and cleared.
 *
 * Missing kits are normal. Every function degrades to null/empty so the
 * existing curated pack keeps working unchanged.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type KitSource = {
  publisher: string;
  title: string;
  url: string;
  /** Why we are allowed to store this extract; carried through to the UI. */
  licenseNote?: string;
};

export type KitSection = {
  heading: string;
  body: string;
  /** Index into `sources`, so every paragraph stays attributable. */
  sourceIndex: number;
};

export type KitCode = {
  title: string;
  language: string;
  code: string;
  explanation: string;
  sourceIndex: number;
};

export type KitDefinition = { term: string; meaning: string; sourceIndex: number };

export type StudyKit = {
  topicId: string;
  title: string;
  fetchedAt: string;
  sources: KitSource[];
  sections: KitSection[];
  codeExamples: KitCode[];
  keyPoints: string[];
  definitions: KitDefinition[];
};

/** A kit must clear this bar before it is preferred over curated content. */
const MIN_SECTIONS = 3;
const MIN_BODY_CHARS = 240;

export function kitsDir(): string {
  return resolve(process.env.EDUSWARM_KITS_DIR || join(process.cwd(), '.data', 'kits'));
}

/** Filesystem-safe name for a topic id that may arrive from a request. */
export function kitFileName(topicId: string): string {
  return `${String(topicId).replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 160)}.json`;
}

const cache = new Map<string, { kit: StudyKit | null; mtimeMs: number }>();

function isUsable(kit: any): kit is StudyKit {
  if (!kit || typeof kit !== 'object') return false;
  if (!Array.isArray(kit.sources) || !kit.sources.length) return false;
  const sections = Array.isArray(kit.sections) ? kit.sections : [];
  const solid = sections.filter(
    (section: any) => section && String(section.heading || '').trim() && String(section.body || '').trim().length >= 60,
  );
  if (solid.length < MIN_SECTIONS) return false;
  const total = solid.reduce((sum: number, section: any) => sum + String(section.body).length, 0);
  return total >= MIN_BODY_CHARS;
}

/**
 * Load one topic's seeded kit, or null. Cached by file mtime so a re-seed is
 * picked up without a restart, and a missing directory is not an error.
 */
export function loadKit(topicId: string): StudyKit | null {
  const path = join(kitsDir(), kitFileName(topicId));
  let mtimeMs: number;
  try {
    mtimeMs = statSync(path).mtimeMs;
  } catch {
    return null;
  }
  const hit = cache.get(path);
  if (hit && hit.mtimeMs === mtimeMs) return hit.kit;

  let kit: StudyKit | null = null;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    kit = isUsable(parsed) ? normalise(parsed) : null;
  } catch {
    kit = null;
  }
  cache.set(path, { kit, mtimeMs });
  return kit;
}

/** Drop unusable fragments and clamp every list to a teachable size. */
function normalise(kit: StudyKit): StudyKit {
  const sourceCount = kit.sources.length;
  const valid = (index: any) => (Number.isInteger(index) && index >= 0 && index < sourceCount ? index : 0);
  return {
    ...kit,
    sections: kit.sections
      .filter((section) => String(section?.heading || '').trim() && String(section?.body || '').trim().length >= 60)
      .map((section) => ({ heading: String(section.heading).trim(), body: String(section.body).trim(), sourceIndex: valid(section.sourceIndex) }))
      .slice(0, 14),
    codeExamples: (kit.codeExamples || [])
      .filter((item) => String(item?.code || '').trim().length > 20)
      .map((item) => ({
        title: String(item.title || 'Example').trim(),
        language: String(item.language || 'text').trim(),
        code: String(item.code).trim().slice(0, 2400),
        explanation: String(item.explanation || '').trim(),
        sourceIndex: valid(item.sourceIndex),
      }))
      .slice(0, 4),
    keyPoints: (kit.keyPoints || []).map((point) => String(point).trim()).filter((point) => point.length > 15).slice(0, 8),
    definitions: (kit.definitions || [])
      .filter((item) => String(item?.term || '').trim() && String(item?.meaning || '').trim().length > 15)
      .map((item) => ({ term: String(item.term).trim(), meaning: String(item.meaning).trim(), sourceIndex: valid(item.sourceIndex) }))
      .slice(0, 8),
  };
}

export function hasKit(topicId: string): boolean {
  return loadKit(topicId) !== null;
}

/** Topic ids with a seeded kit — used by the coverage report and tests. */
export function seededTopics(): string[] {
  const directory = kitsDir();
  if (!existsSync(directory)) return [];
  try {
    return readdirSync(directory)
      .filter((name) => name.endsWith('.json'))
      .map((name) => name.replace(/\.json$/, ''))
      .sort();
  } catch {
    return [];
  }
}

/** Test helper: forget cached kits after writing fixtures. */
export function clearKitCache(): void {
  cache.clear();
}
