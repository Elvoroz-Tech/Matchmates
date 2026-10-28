import { MongoClient, type Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __fpMongo: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var __fpIndexes: Promise<void> | undefined;
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection('quizzes').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('votes').createIndex({ quizId: 1, voterHash: 1 }, { unique: true }),
    db.collection('votes').createIndex({ quizId: 1, ipHash: 1 }),
    db.collection('votes').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('ratelimits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('optouts').createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 }),
  ]);
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  if (!globalThis.__fpMongo) {
    globalThis.__fpMongo = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 })
      .connect()
      .catch((err) => {
        globalThis.__fpMongo = undefined;
        throw err;
      });
  }
  const client = await globalThis.__fpMongo;
  const db = client.db(process.env.MONGODB_DB || 'friendpoll');
  if (!globalThis.__fpIndexes) {
    globalThis.__fpIndexes = ensureIndexes(db).catch((err) => {
      globalThis.__fpIndexes = undefined;
      console.error('[db] index creation failed', err);
    });
  }
  await globalThis.__fpIndexes;
  return db;
}
