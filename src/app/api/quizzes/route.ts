import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { clientIp } from '@/lib/server/security';
import { fail, guard, json, readJson, serverError } from '@/lib/server/http';
import { createSchema } from '@/lib/server/validation';
import { createQuiz } from '@/lib/server/quiz';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const blocked = await guard(req, db, 'create', 8, 3600, true);
    if (blocked) return blocked;

    const body = await readJson(req);
    if (!body) return fail(400, 'Invalid request.');
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return fail(400, parsed.error.issues[0]?.message || 'Invalid input.');
    const d = parsed.data;
    if (d.website) return fail(400, 'Invalid request.'); // honeypot
    const unique = new Set(d.candidates.map((n) => n.toLowerCase()));
    if (unique.size !== d.candidates.length) return fail(400, 'Each name must be different.');
    if (d.pickIndex >= d.candidates.length) return fail(400, 'Pick one of the listed people.');

    const out = await createQuiz(db, {
      subjectName: d.subjectName,
      subjectGender: d.subjectGender,
      occasion: d.occasion,
      candidates: d.candidates,
      nick: d.nick,
      pickIndex: d.pickIndex,
      voterToken: d.voterToken,
      ip: clientIp(req),
    });
    return json(out, 201);
  } catch (e) {
    return serverError(e);
  }
}
