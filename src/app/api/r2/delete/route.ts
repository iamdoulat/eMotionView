import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/r2-server';

export async function POST(req: NextRequest) {
    try {
        const { key } = await req.json();
        if (!key) {
            return NextResponse.json({ success: false, error: 'key is required' }, { status: 400 });
        }
        await deleteFile(key);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
