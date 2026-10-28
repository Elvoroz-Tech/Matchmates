import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { fail, guard, json, serverError, TOKEN_RE } from '@/lib/server/http';
import { getResults, ID_RE } from '@/lib/server/quiz';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };

// Results are sealed: they are only returned to a device that has already voted.
export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!ID_RE.test(id)) return fail(404, 'Poll not found.');
    const token = req.headers.get('x-voter-token') || '';
    if (!TOKEN_RE.test(token)) return fail(403, 'Vote first to unlock the results.');
    const db = await getDb();
    const blocked = await guard(req, db, 'results', 120, 60);
    if (blocked) return blocked;
    const results = await getResults(db, id, token);
    if (!results) return fail(403, 'Vote first to unlock the results.');
    return json(results);
  } catch (e) {
    return serverError(e);
  }
}
