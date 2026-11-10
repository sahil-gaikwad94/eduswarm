import { catalogs } from '../src/curriculum.js';
import { lessonFor } from '../src/topicLessons.js';

const words = (s?: string) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const ids = Object.values(catalogs).flat().map((t: any) => t.id);
const rows = [];
for (const id of ids) {
  const l = lessonFor(id);
  if (!l) { console.log('MISSING', id); continue; }
  const conceptWords = l.concepts.reduce((a: number, c: any) => a + words(c.body), 0);
  const workedWords = l.worked.reduce((a: number, c: any) => a + words(c.body), 0);
  const examWords = l.exam.reduce((a: number, c: any) => a + words(c.answer), 0);
  const cheatWords = l.cheat.join(' ').trim().split(/\s+/).filter(Boolean).length;
  const total = words(l.intro) + words(l.foundations) + conceptWords + workedWords + examWords + words(l.recap) + cheatWords;
  rows.push({ id, total, concepts: l.concepts.length, worked: l.worked.length, exam: l.exam.length, cheat: l.cheat.length });
}
rows.sort((a, b) => a.total - b.total);
const below1000 = rows.filter((r) => r.total < 1000);
const below1100 = rows.filter((r) => r.total < 1100 && r.total >= 1000);
console.log('TOTAL', rows.length, '| <1000w:', below1000.length, '| 1000-1099w:', below1100.length);
console.log('\n--- below 1000 ---');
for (const r of below1000) console.log(String(r.total).padStart(4), r.id);
console.log('\n--- 1000-1099 ---');
for (const r of below1100) console.log(String(r.total).padStart(4), r.id);
