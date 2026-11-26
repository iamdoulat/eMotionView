import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
    const adminUser = await requireAdmin(req);
    if (!adminUser) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { endpoint, accessKey, secretKey, bucket } = await req.json();
        if (!endpoint || !accessKey || !secretKey) {
            return NextResponse.json({ success: false, error: 'Endpoint, Access Key, and Secret Key are required' }, { status: 400 });
        }
        const client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
        await client.send(new ListBucketsCommand({}));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
