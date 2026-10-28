import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { clientIp } from '@/lib/server/security';
import { fail, guard, json, readJson, serverError } from '@/lib/server/http';
import { voteSchema } from '@/lib/server/validation';
import { castVote, getResults, ID_RE } from '@/lib/server/quiz';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!ID_RE.test(id)) return fail(404, 'Poll not found.');
    const db = await getDb();
    const blocked = await guard(req, db, 'vote', 40, 600, true);
    if (blocked) return blocked;

    const body = await readJson(req);
    if (!body) return fail(400, 'Invalid request.');
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) return fail(400, parsed.error.issues[0]?.message || 'Invalid input.');
    const d = parsed.data;

    const out = await castVote(db, id, { ...d, ip: clientIp(req) });
    if (!out.ok) {
      switch (out.code) {
        case 'NOT_FOUND':
          return fail(404, 'This poll was not found or has expired.', { code: out.code });
        case 'DUPLICATE':
          return fail(409, 'You already voted in this poll. Votes are final.', { code: out.code });
        case 'BAD_CANDIDATE':
          return fail(400, 'That person is not in this poll.', { code: out.code });
        case 'FULL':
          return fail(409, 'This poll reached its vote limit.', { code: out.code });
        default:
          return fail(429, 'Too many votes from this network for this poll.', { code: out.code });
      }
    }
    const results = await getResults(db, id, d.voterToken);
    return json(results, 201);
  } catch (e) {
    return serverError(e);
  }
}
