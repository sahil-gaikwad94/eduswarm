#!/usr/bin/env node
/**
 * Seed local study kits from licensed tutorial sources.
 * -----------------------------------------------------
 * Fetches the tutorial page for each curriculum topic and extracts it into the
 * structured shape `apps/api/src/kitStore.ts` reads: sections, code samples,
 * definitions and key points, each tagged with the source it came from.
 *
 *   node scripts/seed-kits.mjs                  # every topic
 *   node scripts/seed-kits.mjs --limit 5        # smoke run
 *   node scripts/seed-kits.mjs --topic algo-dp  # one topic
 *   node scripts/seed-kits.mjs --report         # coverage only, no fetching
 *
 * Guardrails, because this stores third-party article text:
 *  - ALLOWED_PUBLISHERS is an explicit allow-list. Only GeeksforGeeks, MDN and
 *    W3Schools are enabled, because those are the rights we hold. Anything else
 *    is skipped and reported, never silently cached.
 *  - robots.txt is checked per origin and obeyed.
 *  - Requests are serialised with a delay; this is not a crawler.
 *  - Output goes to EDUSWARM_KITS_DIR (default `.data/kits`), which is
 *    gitignored. No article text is ever committed to the repository.
 *  - Every extract records its URL and a licence note, which the UI displays.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(process.env.EDUSWARM_KITS_DIR || join(ROOT, '.data', 'kits'));
const UA = 'EduSwarmKitSeeder/1.0 (+https://github.com/sahil-gaikwad94/eduswarm)';
const DELAY_MS = Number(process.env.KIT_SEED_DELAY_MS || 1200);

/** Only publishers we hold rights for. Add a host ONLY with a signed licence. */
const ALLOWED_PUBLISHERS = [
  { host: 'www.geeksforgeeks.org', publisher: 'GeeksforGeeks', licenseNote: 'Stored under EduSwarm’s content licence with GeeksforGeeks.' },
  { host: 'geeksforgeeks.org', publisher: 'GeeksforGeeks', licenseNote: 'Stored under EduSwarm’s content licence with GeeksforGeeks.' },
  { host: 'developer.mozilla.org', publisher: 'MDN Web Docs', licenseNote: 'MDN prose is CC-BY-SA 2.5; attribution retained with every extract.' },
  { host: 'www.w3schools.com', publisher: 'W3Schools', licenseNote: 'Stored under EduSwarm’s content licence with W3Schools.' },
];

function publisherFor(url) {
  const host = new URL(url).hostname;
  return ALLOWED_PUBLISHERS.find((entry) => entry.host === host) || null;
}

// --------------------------------------------------------------- robots.txt

const robotsCache = new Map();

async function robotsAllows(url) {
  const { origin, pathname } = new URL(url);
  if (!robotsCache.has(origin)) {
    let rules = [];
    try {
      const response = await fetch(`${origin}/robots.txt`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10_000) });
      if (response.ok) rules = parseRobots(await response.text());
      else rules = [];
    } catch {
      rules = null; // unknown policy is not consent
    }
    robotsCache.set(origin, rules);
  }
  const rules = robotsCache.get(origin);
  if (rules === null) return false;
  // Longest matching rule wins, per the robots specification.
  let verdict = true;
  let matched = -1;
  for (const rule of rules) {
    if (pathname.startsWith(rule.path) && rule.path.length > matched) {
      matched = rule.path.length;
      verdict = rule.allow;
    }
  }
  return verdict;
}

function parseRobots(text) {
  const rules = [];
  let applies = false;
  for (const raw of text.split('\n')) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') applies = value === '*' || UA.toLowerCase().includes(value.toLowerCase());
    else if (applies && (key === 'allow' || key === 'disallow') && value) rules.push({ path: value, allow: key === 'allow' });
  }
  return rules;
}

// ------------------------------------------------------------- HTML parsing

const BLOCK_TAGS = /<\/?(script|style|noscript|svg|nav|footer|header|aside|form|iframe)[^>]*>/gi;

function stripTags(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function decode(text) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", ldquo: '“', rdquo: '”', mdash: '—', ndash: '–' };
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const key = entity.toLowerCase();
    if (named[key]) return named[key];
    if (key.startsWith('#x')) return String.fromCodePoint(parseInt(key.slice(2), 16));
    if (key.startsWith('#')) return String.fromCodePoint(Number(key.slice(1)));
    return match;
  });
}

/** Drop the chrome so headings and paragraphs come from the article itself. */
function articleHtml(html) {
  const cleaned = html.replace(/<(script|style|noscript|svg|nav|footer|header|aside|form|iframe)[\s\S]*?<\/\1>/gi, ' ').replace(BLOCK_TAGS, ' ');
  for (const pattern of [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]+class="[^"]*(?:text|article|entry|content|w3-example)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ]) {
    const match = cleaned.match(pattern);
    if (match && match[1].length > 800) return match[1];
  }
  return cleaned;
}

/** Split the article into heading-led sections with real prose bodies. */
function extractSections(html, sourceIndex) {
  const body = articleHtml(html);
  const parts = body.split(/<h[23][^>]*>/i);
  const sections = [];
  for (const part of parts.slice(1)) {
    const close = part.search(/<\/h[23]>/i);
    if (close < 0) continue;
    const heading = stripTags(part.slice(0, close));
    const rest = part.slice(close);
    const paragraphs = [...rest.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((match) => stripTags(match[2]))
      .filter((text) => text.length > 45 && !/^(advertisement|next|previous|related|similar reads|try it yourself)/i.test(text));
    const text = paragraphs.slice(0, 5).join('\n\n');
    // Keep a shorter section when it introduces a code block: on tutorial sites
    // the explanation is often one line followed by the listing.
    const hasCode = /<pre[\s>]/i.test(rest);
    const enough = text.length > 140 || (hasCode && text.length > 60);
    if (heading.length > 2 && heading.length < 120 && enough && !/^(comment|share|related|more|advertis)/i.test(heading)) {
      sections.push({ heading, body: text.slice(0, 1800), sourceIndex });
    }
  }
  if (!sections.length) {
    // No usable headings: fall back to the leading prose as one section.
    const paragraphs = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => stripTags(match[1])).filter((text) => text.length > 60);
    if (paragraphs.length) sections.push({ heading: 'Overview', body: paragraphs.slice(0, 5).join('\n\n').slice(0, 1800), sourceIndex });
  }
  return sections.slice(0, 12);
}

function extractCode(html, sourceIndex, topicTitle) {
  const blocks = [...articleHtml(html).matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)]
    .map((match) => decode(match[1].replace(/<[^>]+>/g, '')).trim())
    .filter((code) => code.length > 40 && code.length < 2400 && code.includes('\n'));
  const language = /<code[^>]+(?:class|data-lang)="[^"]*(javascript|python|java|typescript|html|css|sql|cpp|c\+\+)/i.exec(html)?.[1] || 'text';
  return [...new Set(blocks)].slice(0, 4).map((code, index) => ({
    title: `${topicTitle} — example ${index + 1}`,
    language: language.toLowerCase().replace('c++', 'cpp'),
    code,
    explanation: 'Worked example taken from the linked tutorial. Run it, change one input, and predict the result before re-running.',
    sourceIndex,
  }));
}

/** Sentences of the form "X is/are …" make reliable glossary entries. */
function extractDefinitions(sections, sourceIndex) {
  const definitions = [];
  const seen = new Set();
  for (const section of sections) {
    for (const sentence of section.body.split(/(?<=\.)\s+/)) {
      const match = /^([A-Z][A-Za-z0-9 .+#-]{2,42})\s+(?:is|are|refers to|means)\s+(.{40,300}\.)/.exec(sentence.trim());
      if (!match) continue;
      const term = match[1].trim();
      // Reject sentence fragments ("The idea of X", "One benefit of Y").
      if (seen.has(term.toLowerCase()) || term.split(' ').length > 5) continue;
      // Reject adverbial/pronoun openers: "Below is …", "There are …".
      if (/^(the|a|an|this|that|it|one|each|these|those|there|here|below|above|following|next|first|second|both|all|some|many|most|such|other|another|its|their|they|we|you|now|then|so|also)\b/i.test(term)) continue;
      seen.add(term.toLowerCase());
      definitions.push({ term, meaning: match[2].trim(), sourceIndex });
      if (definitions.length >= 8) return definitions;
    }
  }
  return definitions;
}

function extractKeyPoints(sections) {
  const points = [];
  for (const section of sections) {
    for (const sentence of section.body.split(/(?<=\.)\s+/)) {
      const text = sentence.trim();
      if (text.length > 60 && text.length < 240 && /\b(must|should|always|never|note that|important|remember|cannot|only|ensures?)\b/i.test(text)) {
        points.push(text);
        if (points.length >= 8) return points;
      }
    }
  }
  return points;
}

// ------------------------------------------------------------------ fetching

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function fetchPage(url) {
  const response = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(25_000), redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!String(response.headers.get('content-type') || '').includes('html')) throw new Error('not HTML');
  return (await response.text()).slice(0, 1_500_000);
}

async function buildKit(topicId, title, urls) {
  const sources = [];
  let sections = [];
  let codeExamples = [];

  for (const url of urls) {
    const allowed = publisherFor(url);
    if (!allowed) {
      console.log(`    skip (not licensed): ${new URL(url).hostname}`);
      continue;
    }
    if (!(await robotsAllows(url))) {
      console.log(`    skip (robots.txt): ${url}`);
      continue;
    }
    let html;
    try {
      html = await fetchPage(url);
    } catch (error) {
      console.log(`    skip (${error.message}): ${url}`);
      continue;
    }
    await sleep(DELAY_MS);
    const sourceIndex = sources.length;
    const pageSections = extractSections(html, sourceIndex);
    if (!pageSections.length) {
      console.log(`    skip (no extractable prose): ${url}`);
      continue;
    }
    const pageTitle = stripTags(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || title).slice(0, 140);
    sources.push({ publisher: allowed.publisher, title: pageTitle, url, licenseNote: allowed.licenseNote });
    sections = sections.concat(pageSections);
    codeExamples = codeExamples.concat(extractCode(html, sourceIndex, title));
  }

  if (!sources.length || sections.length < 3) return null;
  return {
    topicId,
    title,
    fetchedAt: new Date().toISOString(),
    sources,
    sections: sections.slice(0, 14),
    codeExamples: codeExamples.slice(0, 4),
    keyPoints: extractKeyPoints(sections),
    definitions: extractDefinitions(sections, 0),
  };
}

// --------------------------------------------------------------- curriculum

async function curriculumTopics() {
  const built = join(ROOT, 'apps/api/dist/curriculum.js');
  if (!existsSync(built)) throw new Error('Build the API first: npm run build --workspace apps/api');
  const { catalogs } = await import(built);
  // One flat, de-duplicated list in catalogue order.
  const seen = new Set();
  return Object.values(catalogs).flat().filter((topic) => !seen.has(topic.id) && seen.add(topic.id));
}

/**
 * Candidate tutorial URLs for a topic, restricted to licensed publishers.
 * Slug guesses that 404 are simply skipped, so a wrong guess costs one request.
 */
function candidateUrls(topic) {
  const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const urls = [`https://www.geeksforgeeks.org/${slug}/`];
  const id = String(topic.id || '');
  if (id.startsWith('web-dev-')) {
    const text = `${topic.title} ${topic.module || ''}`.toLowerCase();
    const mdnArea = text.includes('css') ? 'CSS' : text.includes('html') ? 'HTML' : 'JavaScript';
    urls.push(`https://developer.mozilla.org/en-US/docs/Web/${mdnArea}`);
    urls.push(`https://www.w3schools.com/${mdnArea.toLowerCase()}/default.asp`);
  }
  return urls;
}

// -------------------------------------------------------------------- main

function report(topics) {
  const seeded = new Set(existsSync(OUT_DIR) ? readdirSync(OUT_DIR).filter((n) => n.endsWith('.json')).map((n) => n.replace(/\.json$/, '')) : []);
  const missing = topics.filter((topic) => !seeded.has(topic.id.replace(/[^A-Za-z0-9_-]/g, '-')));
  console.log(`\nKit coverage: ${topics.length - missing.length}/${topics.length} topics seeded in ${OUT_DIR}`);
  if (missing.length) console.log(`Not yet seeded (${missing.length}): ${missing.slice(0, 15).map((t) => t.id).join(', ')}${missing.length > 15 ? '…' : ''}`);
  console.log('Topics without a kit fall back to the curated local tutorial, which always works.');
}

async function main() {
  const args = process.argv.slice(2);
  const limit = Number(args[args.indexOf('--limit') + 1]) || null;
  const only = args.includes('--topic') ? args[args.indexOf('--topic') + 1] : null;
  const topics = await curriculumTopics();

  if (args.includes('--report')) return report(topics);

  mkdirSync(OUT_DIR, { recursive: true });
  const selected = only ? topics.filter((topic) => topic.id === only) : limit ? topics.slice(0, limit) : topics;
  console.log(`Seeding ${selected.length} topic(s) into ${OUT_DIR}`);
  console.log(`Licensed publishers: ${[...new Set(ALLOWED_PUBLISHERS.map((p) => p.publisher))].join(', ')}\n`);

  let written = 0;
  for (const [index, topic] of selected.entries()) {
    console.log(`[${index + 1}/${selected.length}] ${topic.title}`);
    let kit = null;
    try {
      kit = await buildKit(topic.id, topic.title, candidateUrls(topic));
    } catch (error) {
      console.log(`    failed: ${error.message}`);
    }
    if (!kit) {
      console.log('    -> no kit (curated tutorial will be used)');
      continue;
    }
    writeFileSync(join(OUT_DIR, `${topic.id.replace(/[^A-Za-z0-9_-]/g, '-')}.json`), JSON.stringify(kit, null, 2));
    written += 1;
    console.log(`    -> kit: ${kit.sections.length} sections, ${kit.codeExamples.length} code, ${kit.definitions.length} terms, from ${kit.sources.map((s) => s.publisher).join(' + ')}`);
  }
  console.log(`\nWrote ${written} kits.`);
  report(topics);
}

// Only run when executed directly, so tests can import the extractors.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { extractSections, extractCode, extractDefinitions, extractKeyPoints, publisherFor, parseRobots };
