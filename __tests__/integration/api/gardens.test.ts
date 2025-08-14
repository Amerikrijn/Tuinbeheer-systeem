import { createRequest, createResponse } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/gardens/route'
import { mockGardenData, mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock the supabase client
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase(),
  }
})

// Get the mocked supabase instance
const { supabase } = require('@/lib/supabase')
const mockSupabase = supabase

// Helper function to create a proper NextRequest mock with searchParams
function createMockNextRequest(url: string): NextRequest {
  const mockRequest = {
    nextUrl: {
      searchParams: new URL(url).searchParams,
      pathname: new URL(url).pathname,
      href: url,
      origin: new URL(url).origin,
      protocol: new URL(url).protocol,
      host: new URL(url).host,
      hostname: new URL(url).hostname,
      port: new URL(url).port,
      username: new URL(url).username,
      password: new URL(url).password,
      hash: new URL(url).hash,
      search: new URL(url).search,
    }
  } as NextRequest

  return mockRequest
}

describe('Gardens API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.mockQueryBuilder.reset()
  })

  describe('GET /api/gardens', () => {
    it.skip('should return all gardens', async () => {
      // Mock successful response
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.gardens).toEqual(mockGardensArray)
    })

    it.skip('should handle database errors', async () => {
      // Mock error response
      mockSupabase.mockQueryBuilder.mockError({ message: 'Database error' })

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch gardens')
    })

    it.skip('should handle empty gardens list', async () => {
      // Mock empty response
      mockSupabase.mockQueryBuilder.mockSuccess([])

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.gardens).toEqual([])
    })

    it.skip('should handle pagination parameters', async () => {
      // Mock paginated response
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray.slice(0, 5))

      const request = createMockNextRequest('http://localhost:3000/api/gardens?page=1&limit=5')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.gardens).toHaveLength(5)
    })
  })

  describe('POST /api/gardens', () => {
    const newGarden = {
      name: 'New Garden',
      description: 'A new test garden',
      location: 'Test Location',
      garden_type: 'vegetable',
      total_area: '50m²',
      length: '5m',
      width: '10m',
      established_date: '2024-01-01',
      season_year: 2024,
      notes: 'New garden notes',
      is_active: true
    }

    it.skip('should create new garden successfully', async () => {
      // Mock successful creation
      mockSupabase.mockQueryBuilder.mockSuccess([{ ...newGarden, id: 'new-id' }])

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.garden).toBeDefined()
      expect(data.garden.name).toBe('New Garden')
    })

    it.skip('should handle validation errors', async () => {
      const invalidGarden = {
        name: '', // Invalid: empty name
        description: 'A new test garden',
        location: 'Test Location'
      }

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Validation failed')
    })

    it.skip('should handle invalid JSON', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid JSON')
    })

    it.skip('should handle database errors during creation', async () => {
      // Mock database error
      mockSupabase.mockQueryBuilder.mockError({ message: 'Database error' })

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create garden')
    })

    it.skip('should handle missing required fields', async () => {
      const incompleteGarden = {
        description: 'A new test garden',
        location: 'Test Location'
        // Missing required fields like name, garden_type
      }

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Validation failed')
    })

    it.skip('should handle empty request body', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Request body is required')
    })
  })

  describe('API Response Format', () => {
    it.skip('should return consistent error format', async () => {
      // Mock error response
      mockSupabase.mockQueryBuilder.mockError({ message: 'Test error' })

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('timestamp')
      expect(typeof data.error).toBe('string')
      expect(typeof data.timestamp).toBe('string')
    })

    it.skip('should return consistent success format for GET', async () => {
      // Mock successful response
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('gardens')
      expect(data).toHaveProperty('count')
      expect(data).toHaveProperty('timestamp')
      expect(Array.isArray(data.gardens)).toBe(true)
      expect(typeof data.count).toBe('number')
      expect(typeof data.timestamp).toBe('string')
    })

    it.skip('should return consistent success format for POST', async () => {
      // Mock successful creation
      const newGarden = { ...mockGardenData, id: 'new-id' }
      mockSupabase.mockQueryBuilder.mockSuccess([newGarden])

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('garden')
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('timestamp')
      expect(data.garden).toBeDefined()
      expect(typeof data.message).toBe('string')
      expect(typeof data.timestamp).toBe('string')
    })
  })
})