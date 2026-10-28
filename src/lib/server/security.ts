import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Db } from 'mongodb';
import { SITE_URL } from '../config';

function salt(): string {
  const s = process.env.SECURITY_SALT;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY_SALT must be set (>= 16 chars) in production.');
  }
  return 'dev-only-insecure-salt-change-me';
}

export function hmac(value: string): string {
  return createHmac('sha256', salt()).update(value).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || 'unknown';
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  try {
    const o = new URL(origin).host;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const site = new URL(SITE_URL).host;
    return o === host || o === site;
  } catch {
    return false;
  }
}

interface RateDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

export async function rateLimit(db: Db, key: string, limit: number, windowSec: number) {
  const col = db.collection<RateDoc>('ratelimits');
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));
  const id = `${key}:${bucket}`;
  const resetAt = (bucket + 1) * windowSec * 1000;
  const run = () =>
    col.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt + 60_000) } },
      { upsert: true, returnDocument: 'after' },
    );
  let doc;
  try {
    doc = await run();
  } catch {
    doc = await run(); // rare upsert race
  }
  const count = doc?.count ?? 1;
  return { ok: count <= limit, retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
}
