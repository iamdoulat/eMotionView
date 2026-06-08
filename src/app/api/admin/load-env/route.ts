import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { resolve } from 'path';

const ENV_PATH = resolve(process.cwd(), '.env');

function parseEnv(content: string): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        vars[key] = value;
    }
    return vars;
}

async function loadFromMongoDB(): Promise<Record<string, string>> {
    const vars: Record<string, string> = {};
    try {
        const { getMongoDb } = await import('@/lib/mongodb');
        const db = await getMongoDb();

        // Load database settings
        const dbSettings = await db.collection('settings').findOne({ _id: 'database' } as any);
        if (dbSettings?.uri) vars['MONGODB_URI'] = dbSettings.uri;
        if (dbSettings?.dbName) vars['MONGODB_DB'] = dbSettings.dbName;

        // Load storage settings
        const storageSettings = await db.collection('settings').findOne({ _id: 'storage' } as any);
        if (storageSettings?.endpoint) vars['R2_ENDPOINT'] = storageSettings.endpoint;
        if (storageSettings?.accessKey) vars['R2_ACCESS_KEY'] = storageSettings.accessKey;
        if (storageSettings?.secretKey) vars['R2_SECRET_KEY'] = storageSettings.secretKey;
        if (storageSettings?.bucket) vars['R2_BUCKET'] = storageSettings.bucket;
        if (storageSettings?.publicUrl) vars['R2_PUBLIC_URL'] = storageSettings.publicUrl;
    } catch (error) {
        console.error('Failed to load settings from MongoDB:', error);
    }
    return vars;
}

export async function GET() {
    const envVars: Record<string, string> = {};

    // Load from process.env
    const envKeys = [
        'MONGODB_URI', 'MONGODB_DB',
        'R2_ENDPOINT', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL',
        'NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID',
        'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    ];
    for (const key of envKeys) {
        if (process.env[key]) envVars[key] = process.env[key]!;
    }

    // Try reading .env file (works in local dev, but read-only on Vercel)
    try {
        const content = await fs.readFile(ENV_PATH, 'utf-8');
        const fileVars = parseEnv(content);
        for (const [key, value] of Object.entries(fileVars)) {
            if (value) envVars[key] = value;
        }
    } catch {}

    // Override with MongoDB-stored settings (these are the user-configured values which should take precedence on Vercel)
    try {
        const dbVars = await loadFromMongoDB();
        for (const [key, value] of Object.entries(dbVars)) {
            if (value) envVars[key] = value;
        }
    } catch {}

    return NextResponse.json({ success: true, vars: envVars });
}
