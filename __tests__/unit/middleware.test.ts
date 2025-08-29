import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url: string) => {
    try {
      const urlObj = new URL(url)
      return {
        url,
        nextUrl: {
          pathname: urlObj.pathname,
          search: urlObj.search,
          hash: urlObj.hash
        }
      }
    } catch {
      // Handle malformed URLs gracefully
      return {
        url,
        nextUrl: {
          pathname: '/',
          search: '',
          hash: ''
        }
      }
    }
  }),
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

  it('sets appropriate caching for authenticated pages', () => {
    const dashboardPaths = ['/', '/user-dashboard', '/admin']
    
    dashboardPaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'public, max-age=120, must-revalidate'
      )
    })
  })

  it('sets appropriate caching for garden pages', () => {
    const gardenPaths = ['/gardens/123', '/plants/456', '/tasks/789']
    
    gardenPaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'public, max-age=600, must-revalidate'
      )
    })
  })

  it('handles root path correctly', () => {
    const request = new NextRequest('https://example.com/')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
  })

  it('handles nested paths correctly', () => {
    const request = new NextRequest('https://example.com/admin/users')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
  })

  it('handles query parameters correctly', () => {
    const request = new NextRequest('https://example.com/search?q=test')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
  })

  it('handles hash fragments correctly', () => {
    const request = new NextRequest('https://example.com/page#section')
    middleware(request)
    
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
  })

  it('handles different file extensions for static assets', () => {
    const extensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2']
    
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
    
    // The middleware uses case-sensitive regex, so .PNG won't match
    // It will get default caching instead of static asset caching
    expect(mockHeaders.set).toHaveBeenCalledWith(
      'Cache-Control', 
      'public, max-age=300, must-revalidate'
    )
  })

  it('handles Next.js internal paths correctly', () => {
    const nextPaths = [
      '/_next/static/chunks/main.js',
      '/_next/static/css/app.css',
      '/_next/image',
      '/_next/webpack-hmr'
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
        // Other Next.js paths get default caching
        expect(mockHeaders.set).toHaveBeenCalledWith(
          'Cache-Control', 
          'public, max-age=300, must-revalidate'
        )
      }
    })
  })

  it('handles API routes correctly', () => {
    const apiPaths = [
      '/api/health',
      '/api/gardens',
      '/api/plants',
      '/api/users'
    ]
    
    apiPaths.forEach(path => {
      const request = new NextRequest(`https://example.com${path}`)
      middleware(request)
      
      expect(mockHeaders.set).toHaveBeenCalledWith(
        'Cache-Control', 
        'public, max-age=60, must-revalidate'
      )
    })
  })

  it('handles auth API routes correctly', () => {
    const authApiPaths = [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/refresh',
      '/api/auth/verify'
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
      'https://example.com/admin/users?role=admin&page=2#users-table',
      'https://example.com/gardens/123/plants?season=summer&type=vegetable#harvest',
      'https://example.com/api/search?q=test&category=plants&limit=20'
    ]
    
    complexUrls.forEach(url => {
      const request = new NextRequest(url)
      middleware(request)
      
      // Should set basic security headers for all requests
      expect(mockHeaders.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
      expect(mockHeaders.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    })
  })

  it('handles malformed URLs gracefully', () => {
    const malformedUrls = [
      'not-a-url',
      'http://',
      'https://',
      'ftp://example.com',
      'file:///path/to/file'
    ]
    
    malformedUrls.forEach(url => {
      const request = new NextRequest(url)
      expect(() => middleware(request)).not.toThrow()
    })
  })
})