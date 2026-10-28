import { NextResponse, type NextRequest } from 'next/server';
import type { Db } from 'mongodb';
import { clientIp, hmac, rateLimit, sameOrigin } from './security';

export function json(data: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function fail(status: number, error: string, extra?: Record<string, unknown>, headers?: Record<string, string>) {
  return json({ error, ...extra }, status, headers);
}

export function serverError(e: unknown) {
  console.error('[api]', e);
  return fail(500, 'Something went wrong on our side. Please try again in a moment.');
}

export async function readJson(req: Request, maxBytes = 8192): Promise<unknown | null> {
  const len = Number(req.headers.get('content-length') || '0');
  if (len > maxBytes) return null;
  const type = req.headers.get('content-type') || '';
  if (!type.includes('application/json')) return null;
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Origin check (for writes) + per-IP rate limiting. Returns a response if blocked. */
export async function guard(
  req: NextRequest,
  db: Db,
  bucket: string,
  limit: number,
  windowSec: number,
  write = false,
): Promise<NextResponse | null> {
  if (write && !sameOrigin(req)) return fail(403, 'Request blocked (invalid origin).');
  const ipKey = hmac(clientIp(req));
  const rl = await rateLimit(db, `${bucket}:${ipKey}`, limit, windowSec);
  if (!rl.ok) {
    return fail(429, 'Too many requests. Take a breath and try again shortly.', undefined, {
      'Retry-After': String(rl.retryAfter),
    });
  }
  return null;
}

export const TOKEN_RE = /^[a-f0-9]{32,64}$/;
export const CREATOR_RE = /^[a-f0-9]{48}$/;
