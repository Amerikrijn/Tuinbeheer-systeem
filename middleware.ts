import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl
  
  // Allow caching for static assets and public pages
  const isStaticAsset = pathname.startsWith('/_next/static') || 
                       pathname.startsWith('/favicon') ||
                       pathname.endsWith('.png') ||
                       pathname.endsWith('.jpg') ||
                       pathname.endsWith('.jpeg') ||
                       pathname.endsWith('.svg') ||
                       pathname.endsWith('.ico')
  
  const isPublicPage = pathname === '/auth/login' ||
                      pathname === '/auth/forgot-password' ||
                      pathname.startsWith('/api/auth')
  
  // Allow short-term caching for public pages and longer caching for static assets
  if (isStaticAsset) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (isPublicPage) {
    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate') // 5 minutes
  } else {
    // For authenticated pages, use shorter cache with revalidation
    response.headers.set('Cache-Control', 'private, max-age=60, must-revalidate') // 1 minute
    response.headers.set('Pragma', 'no-cache')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately
     * - _next/static (static files) - but we handle these above
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file) - but we handle this above
     */
    '/((?!api|_next/image).*)',
  ],
}