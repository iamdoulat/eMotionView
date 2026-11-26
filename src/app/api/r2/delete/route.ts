import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/r2-server';
import { requireAdmin } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    const adminUser = await requireAdmin(req);
    if (!adminUser) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
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
