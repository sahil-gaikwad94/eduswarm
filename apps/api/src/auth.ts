/**
 * EduSwarm Token Auth
 * -------------------
 * Cross-origin session cookies (SameSite=None; Secure) are treated as
 * third-party trackers and blocked by Safari, Firefox, and Chrome Incognito —
 * which caused the endless "sign in with Google again" loop on new browsers.
 *
 * Fix: after OAuth, the API redirects to the web app with a single-use login
 * code. The app exchanges it for a long-lived signed Bearer token stored in
 * localStorage and sent as an Authorization header. Cookies remain as a
 * best-effort fallback for same-origin deployments.
 *
 * Tokens and codes are HMAC-signed with SESSION_SECRET (stateless, no store).
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

function secret(): string {
  return process.env.SESSION_SECRET || 'development-only-session-secret';
}

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const CODE_TTL_MS = 1000 * 60 * 5;
const usedCodes = new Set<string>();

function b64urlEncode(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64url');
}

function b64urlDecode(text: string): string | null {
  try {
    return Buffer.from(text, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

function signatureFor(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function verifiedPayload(token: string): Record<string, any> | null {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return null;
  const expected = signatureFor(payload);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return null;
  try {
    const parsed = JSON.parse(b64urlDecode(payload) || '');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/** Long-lived Bearer token binding a user id. */
export function issueToken(userId: string): string {
  const payload = b64urlEncode(JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${signatureFor(payload)}`;
}

/** Returns the user id when the token is valid and unexpired. */
export function verifyToken(token: string | null | undefined): string | null {
  const parsed = verifiedPayload(token || '');
  if (!parsed || typeof parsed.sub !== 'string' || typeof parsed.exp !== 'number') return null;
  if (parsed.exp < Date.now()) return null;
  return parsed.sub;
}

/** Single-use login code issued at the end of the OAuth dance. */
export function issueLoginCode(userId: string): string {
  const nonce = randomBytes(16).toString('base64url');
  const payload = b64urlEncode(JSON.stringify({ sub: userId, nonce, exp: Date.now() + CODE_TTL_MS }));
  return `${payload}.${signatureFor(payload)}`;
}

/** Redeems a login code exactly once; returns the user id or null. */
export function redeemLoginCode(code: string | null | undefined): string | null {
  const raw = String(code || '');
  if (!raw || usedCodes.has(raw)) return null;
  const parsed = verifiedPayload(raw);
  if (!parsed || typeof parsed.sub !== 'string' || typeof parsed.exp !== 'number') return null;
  if (parsed.exp < Date.now()) return null;
  usedCodes.add(raw);
  // Bound memory: codes are short-lived; prune opportunistically.
  if (usedCodes.size > 5000) usedCodes.clear();
  return parsed.sub;
}

/** Extracts a Bearer token from an Authorization header value. */
export function bearerFromHeader(value: string | string[] | undefined): string | null {
  const header = Array.isArray(value) ? value[0] : value;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
