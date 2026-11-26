import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If an Authorization Bearer token was provided, ensure session cookie is present
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const cookieStore = await cookies();
      const existingSession = cookieStore.get('session')?.value;
      if (!existingSession && token && auth && typeof auth.createSessionCookie === 'function') {
        try {
          const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
          const sessionCookie = await auth.createSessionCookie(token, { expiresIn });
          cookieStore.set('session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expiresIn / 1000,
            path: '/',
          });
        } catch {}
      }
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
