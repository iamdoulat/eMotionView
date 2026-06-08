import { NextRequest, NextResponse } from 'next/server';
import { getR2Client, getR2Config } from '@/lib/r2-server';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://emotionview.vercel.app'
];

function getCorsHeaders(req: NextRequest) {
    const origin = req.headers.get('origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': 'ETag',
        'Access-Control-Max-Age': '3600',
    };
}

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(req),
    });
}

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

        const stream = response.Body.transformToWebStream();

        return new NextResponse(stream, {
            status: 200,
            headers: {
                ...getCorsHeaders(req),
                'Content-Type': response.ContentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=31536000, immutable',
                ...(response.ContentLength && { 'Content-Length': String(response.ContentLength) }),
            },
        });
    } catch (error: any) {
        console.error('R2 proxy error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
