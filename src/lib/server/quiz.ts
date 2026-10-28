import { randomBytes, randomInt } from 'node:crypto';
import type { Db } from 'mongodb';
import type { Candidate, Gender, Occasion, QuizMeta, QuizResults } from '../types';
import { MAX_VOTES, MAX_VOTES_PER_IP, TTL_DAYS } from './env';
import { hmac, safeEqual } from './security';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export const ID_RE = /^[abcdefghjkmnpqrstuvwxyz23456789]{10}$/;

interface QuizDoc {
  _id: string;
  creatorKeyHash: string;
  subjectName: string;
  subjectGender: Gender;
  occasion: Occasion;
  candidates: Candidate[];
  createdAt: Date;
  expiresAt: Date;
}
interface VoteDoc {
  quizId: string;
  voterHash: string;
  ipHash: string;
  candidateId: string;
  nick: string | null;
  createdAt: Date;
  expiresAt: Date;
}

const newId = () => {
  let s = '';
  for (let i = 0; i < 10; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
};
const isDup = (e: unknown) => (e as { code?: number } | null)?.code === 11000;

export async function createQuiz(
  db: Db,
  input: {
    subjectName: string;
    subjectGender: Gender;
    occasion: Occasion;
    candidates: string[];
    nick: string;
    pickIndex: number;
    voterToken: string;
    ip: string;
  },
) {
  const quizzes = db.collection<QuizDoc>('quizzes');
  const votes = db.collection<VoteDoc>('votes');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_DAYS * 86_400_000);
  const creatorKey = randomBytes(24).toString('hex');
  const candidates: Candidate[] = input.candidates.map((name) => ({ id: randomBytes(4).toString('hex'), name }));

  let id = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    id = newId();
    try {
      await quizzes.insertOne({
        _id: id,
        creatorKeyHash: hmac(creatorKey),
        subjectName: input.subjectName,
        subjectGender: input.subjectGender,
        occasion: input.occasion,
        candidates,
        createdAt: now,
        expiresAt,
      });
      break;
    } catch (e) {
      if (isDup(e) && attempt < 3) continue;
      throw e;
    }
  }

  const pick = candidates[input.pickIndex];
  await votes.insertOne({
    quizId: id,
    voterHash: hmac(`${id}:${input.voterToken}`),
    ipHash: hmac(`${id}:${input.ip}`),
    candidateId: pick.id,
    nick: input.nick || null,
    createdAt: now,
    expiresAt,
  });
  return { id, creatorKey, candidates, pickId: pick.id };
}

export async function getQuizMeta(db: Db, id: string): Promise<QuizMeta | null> {
  if (!ID_RE.test(id)) return null;
  const doc = await db.collection<QuizDoc>('quizzes').findOne({ _id: id });
  if (!doc || doc.expiresAt.getTime() < Date.now()) return null;
  const voteCount = await db.collection<VoteDoc>('votes').countDocuments({ quizId: id });
  return {
    id: doc._id,
    subjectName: doc.subjectName,
    subjectGender: doc.subjectGender,
    occasion: doc.occasion,
    candidates: doc.candidates,
    voteCount,
    createdAt: doc.createdAt.toISOString(),
    expiresAt: doc.expiresAt.toISOString(),
  };
}

export type VoteOutcome =
  | { ok: true }
  | { ok: false; code: 'NOT_FOUND' | 'DUPLICATE' | 'BAD_CANDIDATE' | 'FULL' | 'IP_LIMIT' };

export async function castVote(
  db: Db,
  id: string,
  input: { voterToken: string; candidateId: string; nick: string; ip: string },
): Promise<VoteOutcome> {
  const quiz = await db.collection<QuizDoc>('quizzes').findOne({ _id: id });
  if (!quiz || quiz.expiresAt.getTime() < Date.now()) return { ok: false, code: 'NOT_FOUND' };
  if (!quiz.candidates.some((c) => c.id === input.candidateId)) return { ok: false, code: 'BAD_CANDIDATE' };

  const votes = db.collection<VoteDoc>('votes');
  const ipHash = hmac(`${id}:${input.ip}`);
  const [total, fromIp] = await Promise.all([
    votes.countDocuments({ quizId: id }),
    votes.countDocuments({ quizId: id, ipHash }),
  ]);
  if (total >= MAX_VOTES) return { ok: false, code: 'FULL' };
  if (fromIp >= MAX_VOTES_PER_IP) return { ok: false, code: 'IP_LIMIT' };

  try {
    await votes.insertOne({
      quizId: id,
      voterHash: hmac(`${id}:${input.voterToken}`),
      ipHash,
      candidateId: input.candidateId,
      nick: input.nick || null,
      createdAt: new Date(),
      expiresAt: quiz.expiresAt,
    });
    return { ok: true };
  } catch (e) {
    if (isDup(e)) return { ok: false, code: 'DUPLICATE' };
    throw e;
  }
}

/** Returns results ONLY if this device token has already voted in this poll. */
export async function getResults(db: Db, id: string, voterToken: string): Promise<QuizResults | null> {
  if (!ID_RE.test(id)) return null;
  const votes = db.collection<VoteDoc>('votes');
  const mine = await votes.findOne({ quizId: id, voterHash: hmac(`${id}:${voterToken}`) });
  if (!mine) return null;
  const docs = await votes.find({ quizId: id }).sort({ createdAt: -1 }).limit(MAX_VOTES).toArray();
  const tallies: Record<string, number> = {};
  for (const d of docs) tallies[d.candidateId] = (tallies[d.candidateId] || 0) + 1;
  return {
    total: docs.length,
    tallies,
    voters: docs.slice(0, 200).map((d) => ({ nick: d.nick, candidateId: d.candidateId, at: d.createdAt.getTime() })),
  };
}

export async function deleteQuiz(db: Db, id: string, creatorKey: string): Promise<boolean> {
  const doc = await db.collection<QuizDoc>('quizzes').findOne({ _id: id });
  if (!doc || !safeEqual(doc.creatorKeyHash, hmac(creatorKey))) return false;
  await db.collection<VoteDoc>('votes').deleteMany({ quizId: id });
  await db.collection<QuizDoc>('quizzes').deleteOne({ _id: id });
  return true;
}
