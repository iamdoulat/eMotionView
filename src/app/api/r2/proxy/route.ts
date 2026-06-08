import { NextRequest, NextResponse } from 'next/server';
import { getR2Client, getR2Config } from '@/lib/r2-server';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(req: NextRequest) {
    try {
        const key = req.nextUrl.searchParams.get('key');
        if (!key) {
            return NextResponse.json({ success: false, error: 'key query parameter is required' }, { status: 400 });
        }

        const client = await getR2Client();
        const config = await getR2Config();

        const command = new GetObjectCommand({
            Bucket: config.bucket,
            Key: key,
        });

        const response = await client.send(command);

        if (!response.Body) {
            return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
        }

        const bytes = await response.Body.transformToByteArray();

        return new NextResponse(bytes, {
            status: 200,
            headers: {
                'Content-Type': response.ContentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': String(bytes.length),
            },
        });
    } catch (error: any) {
        console.error('R2 proxy error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
