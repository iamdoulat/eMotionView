
import { type NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // If no session cookie, redirect to sign-in for protected routes
  if (!session) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  // Since we cannot verify the cookie in the middleware runtime,
  // we will pass it through and let the server components or API routes handle verification.
  // The presence of the cookie is a good first-level check.
  try {
    // We can't set headers with user info here anymore, but our useAuth hook will handle user state on the client.
    return NextResponse.next();

  } catch (error) {
    // This catch block might not be effective without the verification call,
    // but we'll keep it for safety.
    console.error('An error occurred in middleware, but session cookie could not be verified here.');
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
