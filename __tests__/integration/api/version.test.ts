import { GET } from '@/app/api/version/route'
import { NextResponse } from 'next/server'
import { APP_VERSION } from '@/lib/version'

describe('Version API', () => {
  it('GET /api/version returns app version', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.version).toBe(APP_VERSION)
  })

  it('GET /api/version handles errors', async () => {
    const originalJson = NextResponse.json
    ;(NextResponse as any).json = () => {
      throw new Error('Test error')
    }
    await expect(GET()).rejects.toThrow('Test error')
    NextResponse.json = originalJson
  })
})
