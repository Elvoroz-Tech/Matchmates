import { z } from 'zod';

const clean = (s: string) => s.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim();

const personName = z
  .string()
  .max(200)
  .transform(clean)
  .refine((v) => v.length >= 1 && v.length <= 28, 'Names must be 1–28 characters.');

const nick = z
  .string()
  .max(200)
  .transform(clean)
  .refine((v) => v.length <= 20, 'Nickname can be at most 20 characters.');

const token = z.string().regex(/^[a-f0-9]{32,64}$/, 'Invalid device token.');

export const createSchema = z.object({
  subjectName: personName,
  subjectGender: z.enum(['male', 'female']),
  occasion: z.enum(['karwa', 'shaadi', 'fun']),
  candidates: z.array(personName).min(2, 'Add at least 2 people.').max(8, 'Max 8 people.'),
  nick,
  pickIndex: z.number().int().min(0).max(7),
  voterToken: token,
  website: z.string().max(100).optional(),
});

export const voteSchema = z.object({
  voterToken: token,
  candidateId: z.string().regex(/^[a-f0-9]{8}$/, 'Invalid candidate.'),
  nick,
});

export const optoutSchema = z.object({
  ref: z.string().max(300).transform(clean).refine((v) => v.length >= 3, 'Paste the poll link or ID.'),
  name: z.string().max(100).transform(clean),
  contact: z.string().max(150).transform(clean),
  reason: z.string().max(600).transform(clean),
  website: z.string().max(100).optional(),
});
