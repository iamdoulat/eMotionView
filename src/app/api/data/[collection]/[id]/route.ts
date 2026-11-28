import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne, deleteOne } from '@/lib/mongodb';
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
  'googleClientSecret',
  'facebookAppSecret',
  'captchaSecretKey',
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

function sanitizeDoc(collection: string, doc: any, isAdmin: boolean) {
  const rewritten = rewriteR2Value(doc);
  if (isAdmin) return rewritten;
  if (collection === 'admin_settings' || (collection === 'settings' && doc?._id === 'general')) {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(rewritten)) {
      if (!SECRET_PAYMENT_FIELDS.has(k)) clean[k] = v;
    }
    return clean;
  }
  return rewritten;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const user = await getAuthenticatedUser(req);
  const isAdmin = isAdminRole(user?.role);

  if (!PUBLIC_READ_COLLECTIONS.has(collection)) {
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (collection === 'analytics' && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if ((collection === 'users' || collection === 'customers' || collection === 'wishlists') && !isAdmin && id !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if (collection === 'settings' && (id === 'database' || id === 'storage') && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    let doc = await findOne(collection, { _id: id } as any);
    if (!doc && (collection === 'users' || collection === 'customers')) {
      doc = await findOne(collection, { uid: id } as any);
      if (!doc && user?.email && (id === user.uid || isAdmin)) {
        doc = await findOne(collection, {
          $or: [
            { email: user.email },
            { email: user.email.toLowerCase() },
          ],
        } as any);
      }
    }
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
    return NextResponse.json(sanitizeDoc(collection, doc, isAdmin));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isAdmin = isAdminRole(user.role);

  try {
    const data = await req.json();
    if (!isAdmin) {
      if ((collection === 'customers' || collection === 'wishlists') && id === user.uid) {
        if (collection === 'customers') delete data.role;
      } else if (collection === 'orders') {
        const existing = await findOne('orders', { _id: id } as any);
        if (existing || data.userId !== user.uid) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else if (collection === 'reviews') {
        const existing = await findOne('reviews', { _id: id } as any);
        if (existing && existing.userId !== user.uid) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        data.userId = user.uid;
        if (!existing) data.status = 'pending';
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (data && typeof data === 'object') {
      delete data._id;
      delete data.id;
    }

    await updateOne(collection, { _id: id } as any, data, true);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const adminUser = await requireAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await deleteOne(collection, { _id: id } as any);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
