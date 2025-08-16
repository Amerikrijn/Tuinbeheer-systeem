import { GET, HEAD } from '@/app/api/status/route'
import { NextRequest, NextResponse } from 'next/server'

function createMockNextRequest(url: string, headers: Record<string, string> = {}): NextRequest {
  return {
    headers: new Headers(headers),
    nextUrl: new URL(url)
  } as unknown as NextRequest
}

describe('Status API', () => {
  it('GET /api/status returns operational status', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/status', {
      'user-agent': 'jest',
      accept: 'application/json'
    })
    const res = await GET(request)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('operational')
    expect(data.headers.userAgent).toBe('jest')
  })

  it('GET /api/status handles errors', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/status')
    const originalJson = NextResponse.json
    ;(NextResponse as any).json = () => {
      throw new Error('Test error')
    }
    await expect(GET(request)).rejects.toThrow('Test error')
    NextResponse.json = originalJson
  })

  it('HEAD /api/status returns 200', async () => {
    const res = await HEAD()
    expect(res.status).toBe(200)
  })

  it('HEAD /api/status handles errors', async () => {
    const originalJson = NextResponse.json
    ;(NextResponse as any).json = () => {
      throw new Error('Test error')
    }
    await expect(HEAD()).rejects.toThrow('Test error')
    NextResponse.json = originalJson
  })
})
