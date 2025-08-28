import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl
  
  // Basic security headers (Vercel-compatible)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // ✅ Intelligente caching op basis van content type en route
  const isStaticAsset = pathname.startsWith('/_next/static') || 
                       pathname.startsWith('/favicon') ||
                       pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  
  const isPublicPage = pathname === '/auth/login' ||
                      pathname === '/auth/forgot-password' ||
                      pathname === '/auth/reset-password' ||
                      pathname === '/auth/accept-invitation' ||
                      pathname === '/auth/accept-invite' ||
                      pathname === '/auth/change-password' ||
                      pathname === '/auth/pending' ||
                      pathname.startsWith('/api/auth')
  
  const isApiRoute = pathname.startsWith('/api/') && !pathname.includes('/auth/')
  const isGardenPage = pathname.startsWith('/gardens/') || pathname.startsWith('/plants/') || pathname.startsWith('/tasks/')
  const isDashboardPage = pathname === '/' || pathname === '/user-dashboard' || pathname === '/admin'
  
  // ✅ Intelligente cache strategieën
  if (isStaticAsset) {
    // Static assets: lange cache (1 jaar)
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (isPublicPage) {
    // Auth pages: korte cache (5 minuten)
    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate')
  } else if (isApiRoute) {
    // API routes: korte cache voor data (1 minuut)
    response.headers.set('Cache-Control', 'public, max-age=60, must-revalidate')
  } else if (isGardenPage) {
    // Garden pages: medium cache (10 minuten) - data verandert niet vaak
    response.headers.set('Cache-Control', 'public, max-age=600, must-revalidate')
  } else if (isDashboardPage) {
    // Dashboard: korte cache (2 minuten) - data kan veranderen
    response.headers.set('Cache-Control', 'public, max-age=120, must-revalidate')
  } else {
    // Andere pagina's: korte cache (5 minuten)
    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate')
  }
  
  // ✅ Performance headers toevoegen
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  
  // ✅ Compressie optimalisatie
  if (pathname.match(/\.(css|js|html|xml|txt)$/)) {
    response.headers.set('Vary', 'Accept-Encoding')
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