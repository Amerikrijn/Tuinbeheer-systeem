import { GET } from '@/app/api/plant-beds/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase', () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    then: jest.fn(),
  }
  return {
    supabase: {
      from: jest.fn(() => mockQuery),
      mockQuery,
    },
  }
})

jest.mock('@/lib/logger', () => ({
  apiLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

const { supabase } = require('@/lib/supabase')
const mockQuery = supabase.mockQuery

function createMockNextRequest(url: string): NextRequest {
  return {
    headers: new Headers(),
    nextUrl: new URL(url),
  } as unknown as NextRequest
}

describe('Plant Beds API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET /api/plant-beds returns plant beds', async () => {
    const mockData = [{ id: 'bed-1' }]
    mockQuery.then.mockImplementation((resolve) => resolve({ data: mockData, error: null }))

    const request = createMockNextRequest('http://localhost:3000/api/plant-beds')
    const res = await GET(request)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual(mockData)
  })

  it('GET /api/plant-beds handles database errors', async () => {
    mockQuery.then.mockImplementation((resolve) => resolve({ data: null, error: { message: 'Database error' } }))

    const request = createMockNextRequest('http://localhost:3000/api/plant-beds')
    const res = await GET(request)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Failed to fetch plant beds')
  })

  it('GET /api/plant-beds handles unexpected errors', async () => {
    ;(supabase.from as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected')
    })

    const request = createMockNextRequest('http://localhost:3000/api/plant-beds')
    const res = await GET(request)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Internal server error')
  })
})
