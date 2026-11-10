/**
 * Lesson coverage gate — every curriculum topic must have an authored lesson.
 *
 * Reads the source of truth (`catalogs` in src/curriculum.ts), asks the
 * registry (`missingLessonIds` / `lessonFor` in src/topicLessons.ts), and
 * validates the structure of every lesson. Exits non-zero on any miss so CI
 * fails loudly instead of shipping a silent fallback.
 */
import { catalogs } from '../src/curriculum.js';
import { TOPIC_LESSONS, lessonFor, missingLessonIds } from '../src/topicLessons.js';

const ids = Object.values(catalogs).flat().map((topic) => topic.id);
const uniqueIds = new Set(ids);
if (uniqueIds.size !== ids.length) {
  console.error('FAIL: duplicate topic ids in curriculum source of truth.');
  process.exit(1);
}

const missing = missingLessonIds(ids);
let issues = 0;
const fail = (id: string, problem: string) => {
  issues += 1;
  console.error(`FAIL ${id}: ${problem}`);
};

for (const id of ids) {
  const lesson = lessonFor(id);
  if (!lesson) continue; // already reported as missing
  if (!lesson.intro || lesson.intro.trim().length < 40) fail(id, 'intro missing or too short');
  if (!lesson.foundations || lesson.foundations.trim().length < 40) fail(id, 'foundations missing or too short');
  if (!Array.isArray(lesson.concepts) || lesson.concepts.length < 3) fail(id, `expected at least 3 concept sections, got ${lesson.concepts?.length ?? 0}`);
  for (const concept of lesson.concepts ?? []) {
    if (!concept.title?.trim()) fail(id, 'concept with empty title');
    if (!concept.body || concept.body.trim().length < 80) fail(id, `concept "${concept.title}" body too short (<80 chars)`);
  }
  if (!Array.isArray(lesson.worked) || lesson.worked.length < 1) fail(id, 'no worked example');
  if (!Array.isArray(lesson.exam) || lesson.exam.length < 2) fail(id, `expected at least 2 exam items, got ${lesson.exam?.length ?? 0}`);
  if (!Array.isArray(lesson.cheat) || lesson.cheat.length < 3) fail(id, `cheat sheet too thin (${lesson.cheat?.length ?? 0} lines)`);
  if (!lesson.recap || lesson.recap.trim().length < 40) fail(id, 'recap missing or too short');
}

console.log(`curriculum topics: ${ids.length}`);
console.log(`authored lessons:  ${Object.keys(TOPIC_LESSONS).length}`);
console.log(`missing lessons:   ${missing.length}${missing.length ? ' -> ' + missing.join(', ') : ''}`);
console.log(`structure issues:  ${issues}`);

if (missing.length || issues) {
  console.error('\nLESSON COVERAGE CHECK FAILED — a missing lesson is a build/test failure, not a learner-facing generic chapter.');
  process.exit(1);
}
console.log('lesson coverage check passed.');
