import type { CreatePayload, CreateResponse, QuizResults } from '../types';

export type ApiRes<T> = { ok: true; data: T } | { ok: false; status: number; error: string; code?: string };

async function call<T>(url: string, init?: RequestInit): Promise<ApiRes<T>> {
  try {
    const r = await fetch(url, { ...init, cache: 'no-store' });
    const j = (await r.json().catch(() => ({}))) as { error?: string; code?: string };
    if (!r.ok) return { ok: false, status: r.status, error: j.error || 'Something went wrong. Try again.', code: j.code };
    return { ok: true, data: j as T };
  } catch {
    return { ok: false, status: 0, error: 'Network error. Check your connection and try again.' };
  }
}

const post = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const createQuizApi = (p: CreatePayload) => call<CreateResponse>('/api/quizzes', post(p));
export const voteApi = (id: string, body: { voterToken: string; candidateId: string; nick: string }) =>
  call<QuizResults>(`/api/quizzes/${id}/vote`, post(body));
export const resultsApi = (id: string, token: string) =>
  call<QuizResults>(`/api/quizzes/${id}/results`, { headers: { 'x-voter-token': token } });
export const deleteApi = (id: string, key: string) =>
  call<{ ok: true }>(`/api/quizzes/${id}`, { method: 'DELETE', headers: { 'x-creator-key': key } });
export const optoutApi = (body: { ref: string; name: string; contact: string; reason: string; website: string }) =>
  call<{ ok: true }>('/api/optout', post(body));
