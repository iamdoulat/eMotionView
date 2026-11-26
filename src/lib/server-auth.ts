import 'server-only';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { findOne } from '@/lib/mongodb';

export type AuthenticatedUser = {
  uid: string;
  email?: string;
  role?: string;
};

const ADMIN_ROLES = new Set(['admin', 'manager', 'staff', 'Admin', 'Manager', 'Staff']);

export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    if (!auth) {
      return null;
    }

    let decoded: { uid: string; email?: string } | null = null;

    const authHeader = req?.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token && typeof auth.verifyIdToken === 'function') {
        try {
          decoded = await auth.verifyIdToken(token);
        } catch {}
      }
    }

    if (!decoded) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session')?.value;
      if (!sessionCookie) return null;
      if (typeof auth.verifySessionCookie === 'function') {
        try {
          decoded = await auth.verifySessionCookie(sessionCookie, true);
        } catch {
          try {
            decoded = await auth.verifySessionCookie(sessionCookie, false);
          } catch {}
        }
      }
    }

    if (!decoded?.uid) return null;

    const emailFilter = decoded.email
      ? [
          { email: decoded.email },
          { email: decoded.email.toLowerCase() },
          { email: { $regex: new RegExp(`^${decoded.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        ]
      : [];

    const staffDoc = await findOne('users', {
      $or: [
        { _id: decoded.uid },
        { uid: decoded.uid },
        ...emailFilter,
      ],
    } as any);

    if (staffDoc?.role) {
      return { uid: decoded.uid, email: decoded.email, role: staffDoc.role };
    }

    // Direct fallback for developer/admin email
    if (decoded.email && (decoded.email.toLowerCase() === 'mddoulat@gmail.com' || decoded.email.toLowerCase() === 'admin@example.com')) {
      return { uid: decoded.uid, email: decoded.email, role: 'Admin' };
    }

    const customerDoc = await findOne('customers', {
      $or: [
        { _id: decoded.uid },
        { uid: decoded.uid },
        ...emailFilter,
      ],
    } as any);

    return {
      uid: decoded.uid,
      email: decoded.email,
      role: customerDoc?.role || 'Customer',
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(req?: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser(req);
  if (!user || !user.role || !isAdminRole(user.role)) {
    return null;
  }
  return user;
}

export function isAdminRole(role?: string): boolean {
  if (!role) return false;
  return ADMIN_ROLES.has(role) || ADMIN_ROLES.has(role.toLowerCase());
}
