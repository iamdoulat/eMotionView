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

export async function GET() {
    try {
        const content = await fs.readFile(ENV_PATH, 'utf-8');
        const vars = parseEnv(content);
        return NextResponse.json({ success: true, vars });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, vars: {} }, { status: 500 });
    }
}
