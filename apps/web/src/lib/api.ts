/** Typed EduSwarm API client with timeouts and consistent errors. */

/**
 * API origin. In the Vite dev server we stay same-origin so the proxy in
 * vite.config.ts forwards /api to the local Express server — that keeps
 * browser previews (and anyone running the repo) working without env setup.
 * Production builds get an explicit VITE_API_URL.
 */
export const API = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:4000');

export type Page =
  | 'dashboard' | 'plan' | 'syllabus' | 'lesson' | 'flashcards' | 'practice'
  | 'quiz' | 'mocks' | 'codelab' | 'agents' | 'progress' | 'mistakes' | 'profile'
  | 'rooms' | 'interview';

export type Topic = {
  id: string; module: string; title: string; description: string;
  prerequisites: string[]; status: string; minutes: number;
};

export type Pack = {
  topicId: string; title: string; verification: any; depth?: string;
  readingMinutes?: number; generatedAt?: string;
  notes: { sections: any[] }; videos: any[]; flashcards: any[]; quiz: any[]; pyqs: any[];
  codeExamples?: any[]; diagrams?: any[]; cheatSheet?: string[];
};

export type Agent = {
  id: string; name: string; role: string; description: string; bestFor: string; icon: string;
};

const TOKEN_KEY = 'eduswarm.token';

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode */ }
}

async function request(path: string, init: RequestInit = {}, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
    const token = getToken();
    if (token && !headers.Authorization && !headers.authorization) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API}${path}`, { credentials: 'include', ...init, headers, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(String((data as any)?.error || (data as any)?.message || `Request failed (${response.status})`));
      (error as any).status = response.status;
      throw error;
    }
    return data;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('The request timed out — services may be waking up. Please retry.');
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export const apiGet = (path: string) => request(path);
export const apiPost = (path: string, body?: unknown) =>
  request(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
export const apiPut = (path: string, body?: unknown) =>
  request(path, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
export const apiPatch = (path: string, body?: unknown) =>
  request(path, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
export const apiDelete = (path: string) => request(path, { method: 'DELETE' });

export function greeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
