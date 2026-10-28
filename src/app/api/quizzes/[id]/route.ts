import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { CREATOR_RE, fail, guard, json, serverError } from '@/lib/server/http';
import { deleteQuiz, getQuizMeta, ID_RE } from '@/lib/server/quiz';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!ID_RE.test(id)) return fail(404, 'Poll not found.');
    const db = await getDb();
    const blocked = await guard(req, db, 'read', 120, 60);
    if (blocked) return blocked;
    const meta = await getQuizMeta(db, id);
    if (!meta) return fail(404, 'Poll not found or expired.');
    return json(meta);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!ID_RE.test(id)) return fail(404, 'Poll not found.');
    const key = req.headers.get('x-creator-key') || '';
    if (!CREATOR_RE.test(key)) return fail(403, 'Only the creator can delete this poll.');
    const db = await getDb();
    const blocked = await guard(req, db, 'delete', 10, 3600, true);
    if (blocked) return blocked;
    const ok = await deleteQuiz(db, id, key);
    if (!ok) return fail(403, 'Only the creator can delete this poll.');
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
