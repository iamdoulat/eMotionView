
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  cookies().delete('session');

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    await auth.revokeRefreshTokens(decodedClaims.sub);
  } catch (error) {
    console.error('Error revoking session cookie:', error);
  }

  return NextResponse.redirect(new URL('/', request.url));
}
