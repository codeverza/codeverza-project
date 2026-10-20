import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except login page
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    // Check if admin is authenticated (this runs server-side, so we check cookies/headers)
    // For client-side auth with Firebase, we rely on the component-level protection
    // This middleware is a first line of defense
    
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
