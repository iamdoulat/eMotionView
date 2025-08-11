
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // If no session cookie, redirect to sign-in for protected routes
  if (!session) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  // Verify the session cookie
  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-ID', decodedClaims.uid);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Session cookie is invalid, delete it and redirect to sign-in
    console.error('Error verifying session cookie:', error);
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and files with extensions (e.g. .png, .svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
