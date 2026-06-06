import 'server-only';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ENDPOINT_KEY = 'R2_ENDPOINT';
const R2_ACCESS_KEY_KEY = 'R2_ACCESS_KEY';
const R2_SECRET_KEY_KEY = 'R2_SECRET_KEY';
const R2_BUCKET_KEY = 'R2_BUCKET';
const R2_PUBLIC_URL_KEY = 'R2_PUBLIC_URL';

interface R2Config {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicUrl: string;
}

let cachedClient: S3Client | null = null;
let cachedConfig: R2Config | null = null;
let configLoadPromise: Promise<R2Config> | null = null;

async function loadR2ConfigFromDb(): Promise<R2Config | null> {
  try {
    const { getMongoDb } = await import('@/lib/mongodb');
    const db = await getMongoDb();
    const settings = await db.collection('settings').findOne({ _id: 'storage' } as any);
    if (settings?.endpoint && settings?.accessKey && settings?.secretKey && settings?.bucket) {
      return {
        endpoint: settings.endpoint,
        accessKey: settings.accessKey,
        secretKey: settings.secretKey,
        bucket: settings.bucket,
        publicUrl: settings.publicUrl || '',
      };
    }
  } catch {}
  return null;
}

export async function getR2Config(): Promise<R2Config> {
  if (cachedConfig) return cachedConfig;
  if (!configLoadPromise) {
    configLoadPromise = (async () => {
      const dbConfig = await loadR2ConfigFromDb();
      if (dbConfig) return dbConfig;
      return {
        endpoint: process.env[R2_ENDPOINT_KEY] || '',
        accessKey: process.env[R2_ACCESS_KEY_KEY] || '',
        secretKey: process.env[R2_SECRET_KEY_KEY] || '',
        bucket: process.env[R2_BUCKET_KEY] || '',
        publicUrl: process.env[R2_PUBLIC_URL_KEY] || '',
      };
    })();
  }
  cachedConfig = await configLoadPromise;
  return cachedConfig;
}

function validateConfig(config: R2Config): boolean {
  return !!(config.endpoint && config.accessKey && config.secretKey && config.bucket);
}

export async function getR2Client(): Promise<S3Client> {
  if (cachedClient) return cachedClient;
  const config = await getR2Config();
  if (!validateConfig(config)) {
    throw new Error('R2 is not configured. Please configure it in the admin settings.');
  }
  cachedClient = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  });
  return cachedClient;
}

export async function uploadFile(key: string, body: Buffer | Blob | File, contentType?: string): Promise<string> {
  const client = await getR2Client();
  const config = await getR2Config();
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType || (typeof body === 'string' ? 'text/plain' : 'application/octet-stream'),
  });
  await client.send(command);
  return getPublicUrl(key);
}

export async function getFileUrl(key: string): Promise<string> {
  const config = await getR2Config();
  if (config.publicUrl) {
    return `${config.publicUrl.replace(/\/$/, '')}/${key}`;
  }
  const client = await getR2Client();
  const command = new GetObjectCommand({ Bucket: config.bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function getPublicUrl(key: string): Promise<string> {
  const config = await getR2Config();
  if (config.publicUrl) {
    return `${config.publicUrl.replace(/\/$/, '')}/${key}`;
  }
  return `${config.endpoint}/${config.bucket}/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  const client = await getR2Client();
  const config = await getR2Config();
  const command = new DeleteObjectCommand({ Bucket: config.bucket, Key: key });
  await client.send(command);
}

export async function listFiles(prefix: string): Promise<string[]> {
  const client = await getR2Client();
  const config = await getR2Config();
  const command = new ListObjectsV2Command({ Bucket: config.bucket, Prefix: prefix });
  const response = await client.send(command);
  return (response.Contents || []).map(obj => obj.Key || '').filter(Boolean);
}

export async function getFileKeyFromUrl(url: string): Promise<string | null> {
  const config = await getR2Config();
  if (config.publicUrl && url.startsWith(config.publicUrl)) {
    return url.replace(config.publicUrl.replace(/\/$/, '') + '/', '');
  }
  if (config.endpoint && url.includes(config.endpoint)) {
    const parts = url.split('/');
    const bucketIndex = parts.indexOf(config.bucket);
    if (bucketIndex >= 0) {
      return parts.slice(bucketIndex + 1).join('/');
    }
  }
  return null;
}
