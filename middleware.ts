import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const response = NextResponse.next()
  const { pathname } = request.nextUrl
  
  // Set nonce header for CSP
  response.headers.set('x-nonce', nonce)
  
  // Content Security Policy with nonce-based script/style loading
  const csp = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `object-src 'none'`,
    `frame-src 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  // Set security headers
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
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
                      pathname === '/auth/reset-password' ||
                      pathname === '/auth/accept-invitation' ||
                      pathname === '/auth/accept-invite' ||
                      pathname === '/auth/change-password' ||
                      pathname === '/auth/pending' ||
                      pathname.startsWith('/api/auth')
  
  // Allow short-term caching for public pages and longer caching for static assets
  if (isStaticAsset) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (isPublicPage) {
    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate') // 5 minutes
  } else {
    // For authenticated pages, disable caching for critical updates
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}