import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2-server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const key = formData.get('key') as string;
        const contentType = formData.get('contentType') as string || file?.type || '';

        if (!file || !key) {
            return NextResponse.json({ success: false, error: 'file and key are required' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadFile(key, buffer, contentType);
        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
