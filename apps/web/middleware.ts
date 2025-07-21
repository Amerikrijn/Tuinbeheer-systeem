import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    // Add security headers
    const response = NextResponse.next()
    
    // Add headers to prevent common issues
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Add cache control for static assets
    if (request.nextUrl.pathname.startsWith('/_next/static/')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }
    
    // Handle API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`)
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return a fallback response if middleware fails
    return new NextResponse(
      JSON.stringify({
        error: 'Middleware error',
        message: 'Er is een fout opgetreden in de middleware',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}