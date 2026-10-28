// Admin tool: permanently delete a poll and its votes (e.g. after an opt-out request).
// Usage: npm run purge -- <pollId or full poll URL>
import { MongoClient } from 'mongodb';
import { loadEnv } from './_env.mjs';

const env = loadEnv();
const arg = process.argv[2] || '';
const m = arg.match(/[abcdefghjkmnpqrstuvwxyz23456789]{10}/);
if (!m) {
  console.error('Usage: npm run purge -- <pollId or poll URL>');
  process.exit(1);
}
if (!env.MONGODB_URI) {
  console.error('MONGODB_URI is not set.');
  process.exit(1);
}
const client = new MongoClient(env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(env.MONGODB_DB || 'friendpoll');
  const v = await db.collection('votes').deleteMany({ quizId: m[0] });
  const q = await db.collection('quizzes').deleteOne({ _id: m[0] });
  await db.collection('optouts').updateMany({ quizId: m[0] }, { $set: { status: 'done' } });
  console.log(`Deleted poll ${m[0]}: ${q.deletedCount} poll, ${v.deletedCount} votes.`);
} finally {
  await client.close();
}
