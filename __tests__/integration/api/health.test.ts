import { GET, POST } from '@/app/api/health/route'
import { NextResponse } from 'next/server'

describe('Health API', () => {
  it('GET /api/health returns healthy status', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('healthy')
  })

  it('GET /api/health handles errors', async () => {
    const originalJson = NextResponse.json
    ;(NextResponse as any).json = () => {
      throw new Error('Test error')
    }
    await expect(GET()).rejects.toThrow('Test error')
    NextResponse.json = originalJson
  })

  it('POST /api/health returns healthy status', async () => {
    const res = await POST()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.method).toBe('POST')
  })

  it('POST /api/health handles errors', async () => {
    const originalJson = NextResponse.json
    ;(NextResponse as any).json = () => {
      throw new Error('Test error')
    }
    await expect(POST()).rejects.toThrow('Test error')
    NextResponse.json = originalJson
  })
})
