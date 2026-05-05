import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || process.env.MONGO_URL || '';
const dbName = process.env.MONGODB_DB || 'nf_system';

type MongoCache = { client: MongoClient | null };

declare global {
  // global cache for single client in dev
  var _mongo: MongoCache | undefined;
}

const cached: MongoCache = globalThis._mongo || { client: null };
globalThis._mongo = cached;

export async function getMongoClient(): Promise<MongoClient> {
  if (cached.client) return cached.client as MongoClient;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Set MONGODB_URI to your MongoDB connection string.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  cached.client = client;
  return client;
}

export async function getDatabase(targetDbName = dbName) {
  const client = await getMongoClient();
  return client.db(targetDbName);
}
