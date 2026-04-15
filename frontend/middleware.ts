import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Protected paths that require a valid session */
const PROTECTED = ['/'];
const ADMIN_ONLY = ['/admin'];
const AUTH_PATHS = ['/login', '/change-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * The actual auth check for protected pages is handled client-side by the
   * (dashboard)/layout.tsx which reads from AuthContext.
   *
   * This middleware only handles a simple cookie presence check for fast
   * redirects, reducing unnecessary renders.
   */
  const hasRefreshToken = request.cookies.has('refreshToken');

  // Redirect logged-in users away from auth pages
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && hasRefreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect logged-out users away from protected pages
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/')) && !AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
