import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This middleware doesn't modify the request but can be used
  // to set up bindings or handle other concerns in the future
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
}; 