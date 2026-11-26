import { NextRequest, NextResponse } from 'next/server';
import { findMany, findOne, insertOne, updateOne, deleteOne } from '@/lib/mongodb';
import { getAuthenticatedUser, isAdminRole, requireAdmin } from '@/lib/server-auth';

const PUBLIC_READ_COLLECTIONS = new Set([
  'products',
  'categories',
  'brands',
  'suppliers',
  'attributes',
  'public_content',
  'pages',
  'reviews',
  'settings',
  'admin_settings',
]);

const SECRET_PAYMENT_FIELDS = new Set([
  'appKey',
  'appSecret',
  'username',
  'password',
  'storeId',
  'storePassword',
  'secretKey',
  'secret',
]);

function rewriteR2Value(item: any): any {
  if (typeof item === 'string' && item.includes('.r2.cloudflarestorage.com')) {
    try {
      const urlObj = new URL(item);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (urlObj.hostname.split('.').length <= 4) {
        parts.shift();
      }
      const fileKey = decodeURIComponent(parts.join('/'));
      return `/api/r2/proxy?key=${encodeURIComponent(fileKey)}`;
    } catch {
      return item;
    }
  }
  if (Array.isArray(item)) return item.map(rewriteR2Value);
  if (item && typeof item === 'object') {
    const out: Record<string, any> = {};
    for (const k of Object.keys(item)) {
      out[k] = rewriteR2Value(item[k]);
    }
    return out;
  }
  return item;
}

function sanitizePublicDoc(collection: string, doc: any, isAdmin: boolean) {
  if (!doc) return doc;
  const rewritten = rewriteR2Value(doc);
  if (isAdmin) return rewritten;

  if (collection === 'admin_settings') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(rewritten)) {
      if (!SECRET_PAYMENT_FIELDS.has(k)) clean[k] = v;
    }
    return clean;
  }
  return rewritten;
}

function buildMongoFilter(rawFilters: string | null): Record<string, any> {
  const filter: Record<string, any> = {};
  if (!rawFilters) return filter;
  try {
    const parsed = JSON.parse(rawFilters);
    if (!Array.isArray(parsed)) return filter;
    for (const f of parsed) {
      if (!f || typeof f.field !== 'string') continue;
      switch (f.op) {
        case '==': filter[f.field] = f.value; break;
        case '!=': filter[f.field] = { $ne: f.value }; break;
        case '>': filter[f.field] = { $gt: f.value }; break;
        case '>=': filter[f.field] = { $gte: f.value }; break;
        case '<': filter[f.field] = { $lt: f.value }; break;
        case '<=': filter[f.field] = { $lte: f.value }; break;
        case 'in': filter[f.field] = { $in: f.value }; break;
        case 'array-contains': filter[f.field] = { $in: [f.value] }; break;
        case 'not-in': filter[f.field] = { $nin: f.value }; break;
        default: filter[f.field] = f.value;
      }
    }
  } catch {}
  return filter;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const field = url.searchParams.get('field');
  const value = url.searchParams.get('value');
  const rawFilters = url.searchParams.get('filters');
  const sortField = url.searchParams.get('sort');
  const sortDir = url.searchParams.get('dir') === 'desc' ? -1 : 1;
  const limitCount = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : undefined;

  const user = await getAuthenticatedUser(req);
  const isAdmin = isAdminRole(user?.role);

  if (!PUBLIC_READ_COLLECTIONS.has(collection)) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (collection === 'analytics' && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if ((collection === 'users' || collection === 'customers' || collection === 'wishlists') && !isAdmin) {
      if (!id || id !== user.uid) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  try {
    if (id) {
      if (collection === 'settings' && (id === 'database' || id === 'storage') && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const doc = await findOne(collection, { _id: id } as any);
      if (!doc) {
        if (collection === 'admin_settings') {
          if (id === 'currency') return NextResponse.json({ _id: 'currency', currency: 'BDT' });
          if (id === 'shipping') {
            return NextResponse.json({
              _id: 'shipping',
              methods: [{ id: 'flat_rate', type: 'flat_rate', title: 'Flat Rate', cost: 5, isEnabled: true, description: 'Standard shipping' }],
            });
          }
          if (id === 'cod_payment') return NextResponse.json({ _id: 'cod_payment', isEnabled: true });
          if (id.endsWith('_payment')) return NextResponse.json({ _id: id, isEnabled: false });
        }
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      if (collection === 'orders' && !isAdmin && doc.userId !== user?.uid) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json(sanitizePublicDoc(collection, doc, isAdmin));
    }

    const filter = buildMongoFilter(rawFilters);
    if (field && value !== null) {
      filter[field] = value;
    }

    if (collection === 'orders' && !isAdmin) {
      filter.userId = user!.uid;
    }
    if (collection === 'reviews' && !isAdmin && !filter.status) {
      filter.status = 'approved';
    }
    if (collection === 'settings' && !isAdmin) {
      filter._id = { $nin: ['database', 'storage'] };
    }

    const docs = await findMany(
      collection,
      filter as any,
      sortField ? ({ [sortField]: sortDir } as any) : undefined,
      limitCount
    );
    return NextResponse.json(docs.map((d: any) => sanitizePublicDoc(collection, d, isAdmin)));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const isAdmin = isAdminRole(user.role);

  try {
    const body = await req.json();

    if (!isAdmin) {
      if (collection === 'customers') {
        body._id = user.uid;
        body.uid = user.uid;
        body.role = 'Customer';
      } else if (collection === 'wishlists') {
        body._id = user.uid;
      } else if (collection === 'orders') {
        body.userId = user.uid;
      } else if (collection === 'reviews') {
        body.userId = user.uid;
        body.status = 'pending';
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const id = await insertOne(collection, body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const isAdmin = isAdminRole(user.role);

  try {
    const body = await req.json();
    const { _id, ...data } = body;
    const url = new URL(req.url);
    const targetId = _id || url.searchParams.get('id');
    if (!targetId) return NextResponse.json({ error: '_id is required' }, { status: 400 });

    if (!isAdmin) {
      if ((collection === 'customers' || collection === 'wishlists') && targetId === user.uid) {
        if (collection === 'customers') {
          delete data.role;
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await updateOne(collection, { _id: targetId } as any, data, true);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const adminUser = await requireAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
