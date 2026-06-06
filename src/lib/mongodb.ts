import { MongoClient, Db, Document, ObjectId, Filter as MongoFilter, Sort as MongoSort, OptionalUnlessRequiredId } from 'mongodb';

const MONGODB_URI_KEY = 'MONGODB_URI';
const MONGODB_DB_KEY = 'MONGODB_DB';

interface MongoConfig {
  uri: string;
  dbName: string;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let cachedConfig: MongoConfig | null = null;
let dbConfigLoaded = false;

function getEnvConfig(): MongoConfig {
  return {
    uri: process.env[MONGODB_URI_KEY] || 'mongodb://localhost:27017',
    dbName: process.env[MONGODB_DB_KEY] || 'emotionview',
  };
}

export async function getMongoConfig(): Promise<MongoConfig> {
  if (cachedConfig) return cachedConfig;
  if (dbConfigLoaded) return getEnvConfig();
  return getEnvConfig();
}

async function loadDbConfigFromDb(): Promise<MongoConfig | null> {
  if (dbConfigLoaded) return null;
  try {
    if (!cachedClient) return null;
    const db = cachedClient.db(getEnvConfig().dbName);
    const settings = await db.collection('settings').findOne({ _id: 'database' } as any);
    if (settings?.uri && settings?.dbName) {
      dbConfigLoaded = true;
      return { uri: settings.uri, dbName: settings.dbName };
    }
  } catch {}
  dbConfigLoaded = true;
  return null;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;

  const initialConfig = getEnvConfig();
  const client = new MongoClient(initialConfig.uri, {
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  cachedClient = client;

  const dbConfig = await loadDbConfigFromDb();
  if (dbConfig && (dbConfig.uri !== initialConfig.uri || dbConfig.dbName !== initialConfig.dbName)) {
    cachedConfig = dbConfig;
    await client.close();
    cachedClient = null;
    const newClient = new MongoClient(dbConfig.uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await newClient.connect();
    cachedClient = newClient;
  } else if (dbConfig) {
    cachedConfig = dbConfig;
  }

  return cachedClient!;
}

export async function getMongoDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  const client = await getMongoClient();
  const config = cachedConfig || getEnvConfig();
  cachedDb = client.db(config.dbName);
  return cachedDb;
}

export async function findOne(collectionName: string, filter: MongoFilter<Document> = {}) {
  const db = await getMongoDb();
  return db.collection(collectionName).findOne(filter);
}

export async function findMany(collectionName: string, filter: MongoFilter<Document> = {}, sort?: MongoSort, limitCount?: number) {
  const db = await getMongoDb();
  let cursor = db.collection(collectionName).find(filter);
  if (sort) cursor = cursor.sort(sort);
  if (limitCount !== undefined) cursor = cursor.limit(limitCount);
  return cursor.toArray();
}

export async function insertOne(collectionName: string, data: any) {
  const db = await getMongoDb();
  const result = await db.collection(collectionName).insertOne(data as OptionalUnlessRequiredId<Document>);
  return result.insertedId.toString();
}

export async function updateOne(collectionName: string, filter: MongoFilter<Document>, data: any, upsert = false) {
  const db = await getMongoDb();
  const result = await db.collection(collectionName).updateOne(filter, { $set: data }, { upsert });
  return result;
}

export async function replaceOne(collectionName: string, filter: MongoFilter<Document>, data: any) {
  const db = await getMongoDb();
  const result = await db.collection(collectionName).replaceOne(filter, data, { upsert: true });
  return result;
}

export async function deleteOne(collectionName: string, filter: MongoFilter<Document>) {
  const db = await getMongoDb();
  const result = await db.collection(collectionName).deleteOne(filter);
  return result;
}

export async function aggregate(collectionName: string, pipeline: Document[]) {
  const db = await getMongoDb();
  return db.collection(collectionName).aggregate(pipeline).toArray();
}

export async function countDocuments(collectionName: string, filter: MongoFilter<Document> = {}) {
  const db = await getMongoDb();
  return db.collection(collectionName).countDocuments(filter);
}

export function toPlainObject(doc: Document | null): any {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

export function toPlainObjects(docs: Document[]): any[] {
  return docs.map(toPlainObject);
}

export function objectId(id: string) {
  return new ObjectId(id);
}
