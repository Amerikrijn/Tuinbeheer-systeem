import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './lib/config'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security configuration
const SECURITY_CONFIG = {
  maxRequestsPerMinute: 60,
  maxAuthAttemptsPerMinute: 5,
  sessionTimeout: 3600000, // 1 hour
  ipWhitelist: process.env.NODE_ENV === 'development' ? ['127.0.0.1', '::1'] : [],
} as const

// Generate nonce for CSP
function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
}

// Rate limiting function
function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now()
  const windowStart = now - 60000 // 1 minute window
  
  const record = rateLimitStore.get(key)
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const nonce = generateNonce()

  // Security logging
  console.log(`[SECURITY] ${new Date().toISOString()} - ${request.method} ${pathname} - IP: ${clientIP}`)

  // Rate limiting
  const rateLimitKey = `${clientIP}:${pathname.startsWith('/auth') ? 'auth' : 'general'}`
  const limit = pathname.startsWith('/auth') ? SECURITY_CONFIG.maxAuthAttemptsPerMinute : SECURITY_CONFIG.maxRequestsPerMinute
  
  if (!checkRateLimit(rateLimitKey, limit)) {
    console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIP}, path: ${pathname}`)
    return new NextResponse('Rate limit exceeded', { status: 429 })
  }

  // Strict Security Headers (NCSC/DNB compliant)
  const securityHeaders = {
    // Content Security Policy - Strict
    'Content-Security-Policy': [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests"
    ].join('; '),
    
    // Security headers
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Custom headers
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-Powered-By': '', // Remove server info
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add nonce to response for CSP
  response.headers.set('X-Nonce', nonce)

  // Handle static assets with long-term caching
  const isStaticAsset = pathname.startsWith('/_next/static') || 
                       pathname.startsWith('/favicon') ||
                       /\.(png|jpg|jpeg|svg|ico|css|js|woff|woff2)$/.test(pathname)

  if (isStaticAsset) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Public pages (login, forgot password)
  const isPublicPage = pathname === '/auth/login' ||
                      pathname === '/auth/forgot-password' ||
                      pathname === '/auth/accept-invitation' ||
                      pathname.startsWith('/api/auth')

  if (isPublicPage) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    return response
  }

  // Protected routes - require authentication
  const isProtectedRoute = !pathname.startsWith('/auth') && 
                          !pathname.startsWith('/_next') &&
                          !pathname.startsWith('/api/health')

  if (isProtectedRoute) {
    try {
      // Create Supabase client for server-side auth check
      const config = getSupabaseConfig()
      const supabase = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })

      // Get session from cookie
      const sessionCookie = request.cookies.get('sb-access-token')
      
      if (!sessionCookie) {
        console.warn(`[SECURITY] No session cookie for protected route: ${pathname} - IP: ${clientIP}`)
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      // Verify session server-side
      const { data: { user }, error } = await supabase.auth.getUser(sessionCookie.value)
      
      if (error || !user) {
        console.warn(`[SECURITY] Invalid session for protected route: ${pathname} - IP: ${clientIP} - Error: ${error?.message}`)
        const response = NextResponse.redirect(new URL('/auth/login', request.url))
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        return response
      }

      // Add user context to headers for downstream use
      response.headers.set('X-User-ID', user.id)
      response.headers.set('X-User-Email', user.email || '')

      // Session timeout check
      const sessionAge = Date.now() - new Date(user.last_sign_in_at || 0).getTime()
      if (sessionAge > SECURITY_CONFIG.sessionTimeout) {
        console.warn(`[SECURITY] Session timeout for user: ${user.email} - IP: ${clientIP}`)
        const response = NextResponse.redirect(new URL('/auth/login', request.url))
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        return response
      }

      // Admin route protection
      if (pathname.startsWith('/admin')) {
        const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
        if (!isAdmin) {
          console.warn(`[SECURITY] Unauthorized admin access attempt: ${user.email} - IP: ${clientIP}`)
          return new NextResponse('Forbidden', { status: 403 })
        }
      }

      console.log(`[SECURITY] Authorized access: ${user.email} - ${pathname} - IP: ${clientIP}`)

    } catch (error) {
      console.error(`[SECURITY] Auth middleware error: ${error} - IP: ${clientIP}`)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Set secure cache headers for authenticated pages
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}