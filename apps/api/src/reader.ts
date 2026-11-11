/**
 * In-app article reader.
 *
 * The Reading Room must show the full article inside EduSwarm instead of
 * redirecting the learner to a publisher's page. This module fetches a public
 * http(s) page, strips chrome, and converts the main content to the small
 * markdown dialect our RichText renderer understands.
 *
 * Security: publisher URLs are untrusted input, so the fetch path is guarded
 * against SSRF (private/link-local/metadata addresses, redirects, credentials)
 * and bounded by size and time. Extraction is intentionally dependency-free;
 * when a page is JS-only we return a short, honest fallback instead of a blank
 * reader.
 */
import { promises as dns } from 'node:dns';

export type ReaderArticle = {
  url: string;
  finalUrl: string;
  title: string;
  byline: string;
  publisher: string;
  excerpt: string;
  markdown: string;
  wordCount: number;
  readingMinutes: number;
  extracted: boolean;
  fetchedAt: string;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 80;
const MAX_HTML_BYTES = 2_000_000;
const MAX_REDIRECTS = 4;
const FETCH_TIMEOUT_MS = 14_000;
const USER_AGENT = 'EduSwarmReader/1.0 (+https://eduswarm.app; educational reader)';

const cache = new Map<string, { at: number; article: ReaderArticle }>();

// ---------------------------------------------------------------- URL guard

const BLOCKED_HOSTS = new Set([
  'localhost', 'localhost.localdomain', 'metadata.google.internal',
  'metadata', 'instance-data', '169.254.169.254',
]);

function ipv4Private(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 198 && (b === 18 || b === 19));
}

function ipv6Private(ip: string): boolean {
  const normalized = ip.toLowerCase().split('%')[0];
  if (normalized === '::1' || normalized === '::') return true;
  // Unique-local (fc00::/7), link-local (fe80::/10), and IPv4-mapped forms.
  if (/^f[cd][0-9a-f]{2}:/.test(normalized)) return true;
  if (/^fe[89ab][0-9a-f]:/.test(normalized)) return true;
  if (normalized.startsWith('::ffff:')) return ipv4Private(normalized.slice(7));
  return false;
}

function isPrivateAddress(address: string): boolean {
  const family = address.includes(':') ? 6 : 4;
  return family === 6 ? ipv6Private(address) : ipv4Private(address);
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error('That reading link is not a valid URL.'); }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only public http(s) reading links are supported.');
  if (url.username || url.password) throw new Error('Links with embedded credentials are not supported.');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host || BLOCKED_HOSTS.has(host) || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost')) {
    throw new Error('That host is not available to the reader.');
  }
  const addresses = await dns.lookup(host, { all: true, verbatim: true }).catch(() => []);
  if (!addresses.length) throw new Error('The publisher host could not be resolved.');
  if (addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new Error('That host resolves to a private network address.');
  }
  return url;
}

async function guardedFetch(raw: string): Promise<{ response: Response; finalUrl: string }> {
  let current = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'accept-language': 'en',
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      void response.body?.cancel();
      const location = response.headers.get('location');
      if (!location) throw new Error('The publisher returned an empty redirect.');
      current = await assertPublicUrl(new URL(location, current).toString());
      continue;
    }
    return { response, finalUrl: current.toString() };
  }
  throw new Error('The publisher redirected too many times.');
}

// ---------------------------------------------------------------- extraction

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', middot: '·', bull: '•', copy: '©',
  reg: '®', trade: '™', deg: '°', times: '×', divide: '÷',
};

function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&([a-z][a-z0-9]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

function meta(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]).trim();
  }
  return '';
}

function stripNoise(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|svg|canvas|iframe|object|embed|form|nav|footer|header|aside|dialog|button|select|textarea|input)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(script|style|noscript|template|svg|canvas|iframe|object|embed|form|nav|footer|header|aside|dialog|button|select|textarea|input)\b[^>]*\/?>/gi, ' ');
}

function htmlToMarkdown(html: string): string {
  let text = stripNoise(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, inner) => `\n\n## ${inner}\n\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => `\n\n> ${inner}\n\n`)
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, inner) => `\n\n\`\`\`\n${inner.replace(/<[^>]+>/g, '')}\n\`\`\`\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `\n- ${inner}\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => `\n\n${inner}\n\n`)
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  text = decodeEntities(text)
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();

  // Remove obvious boilerplate fragments that survive stripping: cookie
  // notices, subscribe prompts, and one-word navigation labels.
  const cleaned = text.split('\n\n').filter((block) => {
    const plain = block.replace(/^#+\s*/, '').trim();
    if (plain.length < 3) return false;
    if (/^(cookie|accept all|subscribe|sign in|log in|advertisement|share this|related articles)$/i.test(plain)) return false;
    return true;
  });
  return cleaned.join('\n\n');
}

function articleContainer(html: string): string {
  const candidates = [
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]+(?:id|class)=["'][^"']*(?:article|post|content|entry|markdown|prose)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];
  for (const pattern of candidates) {
    const match = html.match(pattern);
    if (match?.[1] && match[1].replace(/<[^>]+>/g, '').trim().length > 500) return match[1];
  }
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return body?.[1] || html;
}

function toArticle(html: string, finalUrl: string): ReaderArticle {
  const title = meta(html, 'og:title') || meta(html, 'twitter:title')
    || decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim())
    || new URL(finalUrl).hostname;
  const byline = meta(html, 'author') || meta(html, 'article:author') || meta(html, 'twitter:creator');
  const publisher = meta(html, 'og:site_name') || new URL(finalUrl).hostname.replace(/^www\./, '');
  const excerpt = meta(html, 'og:description') || meta(html, 'description');
  let markdown = htmlToMarkdown(articleContainer(html));
  const plain = markdown.replace(/[#>*`-]/g, ' ').replace(/\s+/g, ' ').trim();
  const extracted = plain.length >= 400;
  if (!extracted) {
    markdown = [
      excerpt ? `## About this article\n\n${excerpt}` : '',
      `The publisher did not expose the full article text to the in-app reader. Open the original page to read it with the author's layout and media intact.`,
    ].filter(Boolean).join('\n\n');
  }
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  return {
    url: finalUrl,
    finalUrl,
    title: title.slice(0, 240),
    byline: byline.slice(0, 160),
    publisher: publisher.slice(0, 120),
    excerpt: excerpt.slice(0, 500),
    markdown,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 220)),
    extracted,
    fetchedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------- public API

export async function readArticle(rawUrl: string): Promise<ReaderArticle> {
  const cached = cache.get(rawUrl);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.article;

  const { response, finalUrl } = await guardedFetch(rawUrl);
  if (!response.ok) throw new Error(`The publisher returned ${response.status}. Try the original page.`);
  const contentType = response.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
    throw new Error('That link is not an HTML article.');
  }
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > MAX_HTML_BYTES) throw new Error('That article is too large for the in-app reader.');
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_HTML_BYTES) throw new Error('That article is too large for the in-app reader.');
  const html = new TextDecoder('utf-8').decode(buffer);
  const article = toArticle(html, finalUrl);

  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(rawUrl, { at: Date.now(), article });
  return article;
}
