import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { fail, guard, json, readJson, serverError } from '@/lib/server/http';
import { optoutSchema } from '@/lib/server/validation';
import { ID_RE } from '@/lib/server/quiz';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const blocked = await guard(req, db, 'optout', 5, 3600, true);
    if (blocked) return blocked;
    const body = await readJson(req);
    if (!body) return fail(400, 'Invalid request.');
    const parsed = optoutSchema.safeParse(body);
    if (!parsed.success) return fail(400, parsed.error.issues[0]?.message || 'Invalid input.');
    const d = parsed.data;
    if (d.website) return fail(400, 'Invalid request.');
    const m = d.ref.match(/[abcdefghjkmnpqrstuvwxyz23456789]{10}/);
    const quizId = m && ID_RE.test(m[0]) ? m[0] : null;
    await db.collection('optouts').insertOne({
      ref: d.ref,
      quizId,
      nameAsListed: d.name,
      contact: d.contact,
      reason: d.reason,
      status: 'new',
      createdAt: new Date(),
    });
    return json({ ok: true }, 201);
  } catch (e) {
    return serverError(e);
  }
}
