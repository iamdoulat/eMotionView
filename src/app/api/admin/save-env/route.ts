import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { resolve } from 'path';

const ENV_PATH = resolve(process.cwd(), '.env');

function parseEnv(content: string): Map<string, string> {
    const vars = new Map<string, string>();
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
        vars.set(key, value);
    }
    return vars;
}

function serializeEnv(vars: Map<string, string>, originalContent: string): string {
    const lines = originalContent.split('\n');
    const updatedLines: string[] = [];
    const updatedKeys = new Set<string>();

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            updatedLines.push(line);
            continue;
        }
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) {
            updatedLines.push(line);
            continue;
        }
        const key = trimmed.slice(0, eqIdx).trim();
        if (vars.has(key)) {
            const value = vars.get(key)!;
            const escaped = value.includes(' ') || value.includes('#') || value.includes("'") ? `"${value}"` : value;
            updatedLines.push(`${key}=${escaped}`);
            updatedKeys.add(key);
        } else {
            updatedLines.push(line);
        }
    }

    for (const [key, value] of vars) {
        if (!updatedKeys.has(key)) {
            const escaped = value.includes(' ') || value.includes('#') || value.includes("'") ? `"${value}"` : value;
            updatedLines.push(`${key}=${escaped}`);
        }
    }

    return updatedLines.join('\n') + '\n';
}

// Map of env var keys to their MongoDB settings collection fields
const STORAGE_ENV_KEYS: Record<string, string> = {
    'R2_ENDPOINT': 'endpoint',
    'R2_ACCESS_KEY': 'accessKey',
    'R2_SECRET_KEY': 'secretKey',
    'R2_BUCKET': 'bucket',
    'R2_PUBLIC_URL': 'publicUrl',
};

const DATABASE_ENV_KEYS: Record<string, string> = {
    'MONGODB_URI': 'uri',
    'MONGODB_DB': 'dbName',
};

async function saveToMongoDB(vars: Record<string, string>): Promise<void> {
    try {
        const { getMongoDb } = await import('@/lib/mongodb');
        const db = await getMongoDb();

        // Check if we have any storage settings to save
        const storageData: Record<string, any> = {};
        for (const [envKey, dbField] of Object.entries(STORAGE_ENV_KEYS)) {
            if (vars[envKey] !== undefined) storageData[dbField] = vars[envKey];
        }
        if (Object.keys(storageData).length > 0) {
            await db.collection('settings').updateOne(
                { _id: 'storage' } as any,
                { $set: storageData },
                { upsert: true }
            );
        }

        // Check if we have any database settings to save
        const dbData: Record<string, any> = {};
        for (const [envKey, dbField] of Object.entries(DATABASE_ENV_KEYS)) {
            if (vars[envKey] !== undefined) dbData[dbField] = vars[envKey];
        }
        if (Object.keys(dbData).length > 0) {
            await db.collection('settings').updateOne(
                { _id: 'database' } as any,
                { $set: dbData },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error('Failed to save settings to MongoDB:', error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { vars = {} } = body;

        // Backward compatibility with old R2-specific format
        if (body.endpoint) vars['R2_ENDPOINT'] = body.endpoint;
        if (body.accessKey) vars['R2_ACCESS_KEY'] = body.accessKey;
        if (body.secretKey) vars['R2_SECRET_KEY'] = body.secretKey;
        if (body.bucket) vars['R2_BUCKET'] = body.bucket;
        if (body.publicUrl) vars['R2_PUBLIC_URL'] = body.publicUrl;

        // Always save to MongoDB (works on both local and Vercel)
        await saveToMongoDB(vars);

        // Try to save to .env file (only works in local dev, not on Vercel)
        try {
            let originalContent = '';
            try {
                originalContent = await fs.readFile(ENV_PATH, 'utf-8');
            } catch {
                // File doesn't exist yet, start fresh
            }

            const existing = parseEnv(originalContent);

            for (const [key, value] of Object.entries(vars)) {
                if (value) existing.set(key, value as string);
            }

            await fs.writeFile(ENV_PATH, serializeEnv(existing, originalContent || ''), 'utf-8');
        } catch {
            // .env file write failed (expected on Vercel with read-only filesystem)
            // Settings are already saved to MongoDB above, so this is fine
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
