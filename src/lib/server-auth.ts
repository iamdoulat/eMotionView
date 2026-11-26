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

const ADMIN_ROLES = new Set(['Admin', 'Manager', 'Staff']);

export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    if (!auth || typeof auth.verifySessionCookie !== 'function') {
      return null;
    }

    let decoded: { uid: string; email?: string } | null = null;

    const authHeader = req?.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        decoded = await auth.verifyIdToken(token);
      }
    }

    if (!decoded) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session')?.value;
      if (!sessionCookie) return null;
      decoded = await auth.verifySessionCookie(sessionCookie, true);
    }

    if (!decoded?.uid) return null;

    const staffDoc = await findOne('users', { _id: decoded.uid } as any);
    if (staffDoc?.role) {
      return { uid: decoded.uid, email: decoded.email, role: staffDoc.role };
    }

    const customerDoc = await findOne('customers', { _id: decoded.uid } as any);
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
  if (!user || !user.role || !ADMIN_ROLES.has(user.role)) {
    return null;
  }
  return user;
}

export function isAdminRole(role?: string): boolean {
  return Boolean(role && ADMIN_ROLES.has(role));
}
