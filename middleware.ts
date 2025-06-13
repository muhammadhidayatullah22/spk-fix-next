import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Get session from cookie
  const sessionCookie = request.cookies.get('session_user');
  
  if (!sessionCookie) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    const userRole = sessionData.role;

    // Role-based route protection
    if (pathname.startsWith('/add-user')) {
      // Only admin can access add-user page
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/siswa', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid session data, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
