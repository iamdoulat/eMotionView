import { NextRequest, NextResponse } from 'next/server';
import { findMany, findOne, insertOne, updateOne, deleteOne, countDocuments } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const field = url.searchParams.get('field');
  const value = url.searchParams.get('value');
  const sortField = url.searchParams.get('sort');
  const sortDir = url.searchParams.get('dir') === 'desc' ? -1 : 1;
  const limitCount = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

  try {
    if (id) {
      const doc = await findOne(collection, { _id: id } as any);
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(doc);
    }
    if (field && value) {
      const docs = await findMany(collection, { [field]: value } as any, sortField ? { [sortField]: sortDir } as any : undefined, limitCount);
      return NextResponse.json(docs);
    }
    const docs = await findMany(collection, {}, sortField ? { [sortField]: sortDir } as any : undefined, limitCount);
    return NextResponse.json(docs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  try {
    const body = await req.json();
    const id = await insertOne(collection, body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  try {
    const body = await req.json();
    const { _id, ...data } = body;
    if (!_id) return NextResponse.json({ error: '_id is required' }, { status: 400 });
    await updateOne(collection, { _id } as any, data);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id query param required' }, { status: 400 });
  try {
    await deleteOne(collection, { _id: id } as any);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
