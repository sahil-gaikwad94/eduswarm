/** Typed EduSwarm API client with timeouts and consistent errors. */

export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type Page =
  | 'dashboard' | 'plan' | 'syllabus' | 'lesson' | 'flashcards' | 'practice'
  | 'quiz' | 'mocks' | 'codelab' | 'agents' | 'progress' | 'mistakes' | 'profile';

export type Topic = {
  id: string; module: string; title: string; description: string;
  prerequisites: string[]; status: string; minutes: number;
};

export type Pack = {
  topicId: string; title: string; verification: any;
  notes: { sections: any[] }; videos: any[]; flashcards: any[]; quiz: any[]; pyqs: any[];
};

export type Agent = {
  id: string; name: string; role: string; description: string; bestFor: string; icon: string;
};

async function request(path: string, init: RequestInit = {}, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API}${path}`, { credentials: 'include', ...init, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String((data as any)?.error || (data as any)?.message || `Request failed (${response.status})`));
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
export const apiPatch = (path: string, body?: unknown) =>
  request(path, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
export const apiDelete = (path: string) => request(path, { method: 'DELETE' });

export function greeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
