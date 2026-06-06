import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
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
