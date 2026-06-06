import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(req: NextRequest) {
    try {
        const { uri, db: dbName } = await req.json();
        if (!uri) {
            return NextResponse.json({ success: false, error: 'MongoDB URI is required' }, { status: 400 });
        }
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName || 'test');
        await db.command({ ping: 1 });
        await client.close();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
