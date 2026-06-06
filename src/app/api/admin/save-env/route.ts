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

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
