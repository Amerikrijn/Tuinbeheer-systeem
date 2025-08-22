import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({
      headers: {
        set: jest.fn()
      }
    }))
  }
}))

describe('Middleware', () => {
  let mockResponse: any
  let mockHeaders: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockHeaders = {
      set: jest.fn()
    }
    
    mockResponse = {
      headers: mockHeaders
    }
    
    ;(NextResponse.next as jest.Mock).mockReturnValue(mockResponse)
  })

  it('sets basic security headers for all requests', () => {
    const request = new NextRequest('https://example.com/test')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    expect(mockHeaders.set).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin')
  })

  it('sets long-term caching for static assets', () => {
    const staticAssetPaths = [
      '/_next/static/chunks/main.js',
      '/favicon.ico',
      '/image.png',
      '/photo.jpg',
      '/icon.svg',
      '/logo.jpeg'
    ]
    
    staticAssetPaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'public, max-age=31536000, immutable'
      )
    })
  })

  it('sets short-term caching for public pages', () => {
    const publicPagePaths = [
      '/auth/login',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/accept-invitation',
      '/auth/accept-invite',
      '/auth/change-password',
      '/auth/pending',
      '/api/auth/callback'
    ]
    
    publicPagePaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'public, max-age=300, must-revalidate'
      )
    })
  })

  it('sets no-cache headers for authenticated pages', () => {
    const authenticatedPagePaths = [
      '/dashboard',
      '/profile',
      '/admin',
      '/gardens',
      '/plants'
    ]
    
    authenticatedPagePaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'private, no-cache, no-store, must-revalidate'
      )
      expect(mockHeaders.set).toHaveBeenCalledWith('Pragma', 'no-cache')
      expect(mockHeaders.set).toHaveBeenCalledWith('Expires', '0')
    })
  })

  it('handles root path correctly', () => {
    const request = new NextRequest('https://example.com/')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith(
      'Cache-Control', 
      'private, no-cache, no-store, must-revalidate'
    )
  })

  it('handles nested paths correctly', () => {
    const request = new NextRequest('https://example.com/admin/users')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith(
      'Cache-Control', 
      'private, no-cache, no-store, must-revalidate'
    )
  })

  it('handles query parameters correctly', () => {
    const request = new NextRequest('https://example.com/search?q=test')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith(
      'Cache-Control', 
      'private, no-cache, no-store, must-revalidate'
    )
  })

  it('handles hash fragments correctly', () => {
    const request = new NextRequest('https://example.com/page#section')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith(
      'Cache-Control', 
      'private, no-cache, no-store, must-revalidate'
    )
  })

  it('handles different file extensions for static assets', () => {
    const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.ico']
    
    extensions.forEach(ext => {
      const request = new NextRequest(`https://example.com/file${ext}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'public, max-age=31536000, immutable'
      )
    })
  })

  it('handles mixed case file extensions', () => {
    const request = new NextRequest('https://example.com/image.PNG')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith(
      'Cache-Control', 
      'private, no-cache, no-store, must-revalidate'
    )
  })

  it('handles Next.js internal paths correctly', () => {
    const nextPaths = [
      '/_next/static/chunks/main.js',
      '/_next/static/css/app.css',
      '/_next/image?url=test&w=100&q=75'
    ]
    
    nextPaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      if (path.startsWith('/_next/static')) {
        expect(mockHeaders.set).toHaveBeenCalledWith(
          'Cache-Control', 
          'public, max-age=31536000, immutable'
        )
      } else {
        expect(mockHeaders.set).toHaveBeenCalledWith(
          'Cache-Control', 
          'private, no-cache, no-store, must-revalidate'
        )
      }
    })
  })

  it('handles API routes correctly', () => {
    const apiPaths = [
      '/api/users',
      '/api/gardens',
      '/api/plants'
    ]
    
    apiPaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'private, no-cache, no-store, must-revalidate'
      )
    })
  })

  it('handles auth API routes correctly', () => {
    const authApiPaths = [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/refresh'
    ]
    
    authApiPaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'public, max-age=300, must-revalidate'
      )
    })
  })

  it('handles complex URLs correctly', () => {
    const complexUrls = [
      'https://example.com:3000/admin/users?page=1&sort=name#top',
      'https://subdomain.example.com/gardens/123/plants?filter=active',
      'https://example.com/api/data/123?include=details&format=json'
    ]
    
    complexUrls.forEach(url => {
      const request = new NextRequest(url)
      middleware(request)
      
      // Should set no-cache for complex authenticated paths
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'private, no-cache, no-store, must-revalidate'
      )
    })
  })

  it('handles malformed URLs gracefully', () => {
    const malformedUrls = [
      'https://example.com/',
      'https://example.com//',
      'https://example.com/   ',
      'https://example.com/%20'
    ]
    
    malformedUrls.forEach(url => {
      const request = new NextRequest(url)
      expect(() => middleware(request)).not.toThrow()
    })
  })
})