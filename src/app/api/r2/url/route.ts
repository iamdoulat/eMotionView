import { NextRequest, NextResponse } from 'next/server';
import { getFileUrl } from '@/lib/r2-server';

export async function GET(req: NextRequest) {
    try {
        const key = req.nextUrl.searchParams.get('key');
        if (!key) {
            return NextResponse.json({ success: false, error: 'key query parameter is required' }, { status: 400 });
        }
        const url = await getFileUrl(key);
        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
