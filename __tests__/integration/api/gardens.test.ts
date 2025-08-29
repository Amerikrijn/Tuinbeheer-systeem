import { createRequest, createResponse } from 'node-mocks-http'
import { GET, POST } from '@/app/api/gardens/route'
import { mockGardenData, mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock NextRequest from next/server to use our mock
jest.mock('next/server', () => ({
  NextRequest: global.NextRequest,
  NextResponse: global.NextResponse
}));

// Import after mocking
import { NextRequest } from 'next/server'

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
function createMockNextRequest(url: string, options?: RequestInit): NextRequest {
  const mockRequest = new NextRequest(url, options) as any
  
  // Mock the nextUrl.searchParams
  const urlObj = new URL(url)
  mockRequest.nextUrl = {
    searchParams: urlObj.searchParams
  }
  
  return mockRequest
}

describe('Gardens API Integration Tests', () => {
  beforeEach(() => {
    mockSupabase.mockQueryBuilder.reset()
    jest.clearAllMocks()
  })

  describe('GET /api/gardens', () => {
    it.skip('should return all gardens successfully', async () => {
      // Mock successful connection validation and data retrieval
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.data).toHaveLength(2)
      expect(data.data.page).toBe(1)
      expect(data.data.page_size).toBe(10)
      expect(data.data.count).toBe(2)
      expect(data.error).toBeNull()
    })

    it.skip('should handle search query parameter', async () => {
      const filteredResults = [mockGardensArray[0]]
      mockSupabase.mockQueryBuilder.mockSuccess(filteredResults)
      mockSupabase.mockQueryBuilder.countValue = filteredResults.length

      const request = createMockNextRequest('http://localhost:3000/api/gardens?search=rose')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.data).toHaveLength(1)
      expect(data.data.count).toBe(1)
    })

    it.skip('should handle pagination parameters', async () => {
      const paginatedResults = [mockGardensArray[1]]
      mockSupabase.mockQueryBuilder.mockSuccess(paginatedResults)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const request = createMockNextRequest('http://localhost:3000/api/gardens?page=2&page_size=5')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.page).toBe(2)
      expect(data.data.page_size).toBe(5)
      expect(data.data.count).toBe(mockGardensArray.length)
    })

    it.skip('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.mockError(mockError)

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unable to connect to database')
    })

    it.skip('should handle empty results', async () => {
      mockSupabase.mockQueryBuilder.mockEmpty()

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.data).toHaveLength(0)
      expect(data.data.count).toBe(0)
    })

    it.skip('should handle large page size limit', async () => {
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const request = createMockNextRequest('http://localhost:3000/api/gardens?page_size=1000')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Should be limited to max page size (100)
      expect(data.data.page_size).toBe(100)
    })
  })

  describe('POST /api/gardens', () => {
    it('should create a garden successfully', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden',
        garden_type: 'vegetable',
        total_area: '100m²'
      }

      const createdGarden = {
        ...newGarden,
        id: 'new-1',
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.mockSuccess(createdGarden)

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGarden)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdGarden)
    })

    it('should handle validation errors', async () => {
      const invalidGarden = {
        name: '', // Empty name should trigger validation error
        location: 'Test Location'
      }

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidGarden)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Dit veld is verplicht') // Dutch validation message
    })

    it('should handle malformed JSON', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid JSON in request body')
    })

    it('should handle database errors during creation', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden'
      }

      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.mockError(mockError)

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGarden)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unable to connect to database')
    })

    it('should trim whitespace from input fields', async () => {
      const newGarden = {
        name: '  New Garden  ',
        location: '  Test Location  ',
        description: '  A beautiful garden  '
      }

      const expectedTrimmedGarden = {
        ...newGarden,
        id: 'new-1',
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.mockSuccess(expectedTrimmedGarden)

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGarden)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.name).toBe('New Garden')
      expect(data.data.location).toBe('Test Location')
      expect(data.data.description).toBe('A beautiful garden')
    })

    it('should handle missing Content-Type header', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location'
      }

      const createdGarden = {
        ...newGarden,
        id: 'new-1',
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.mockSuccess(createdGarden)

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden)
      })

      const response = await POST(request)

      // Should still work - Next.js handles JSON parsing automatically
      expect(response.status).toBe(201)
    })

    it('should handle empty request body', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ''
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Request body is required')
    })
  })

  describe('API Response Format', () => {
    it.skip('should return consistent response format for success', async () => {
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('error')
      expect(data.success).toBe(true)
      expect(data.data).toBeTruthy()
      expect(data.error).toBeNull()
    })

    it.skip('should return consistent response format for errors', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.mockError(mockError)

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('error')
      expect(data.success).toBe(false)
      expect(data.data).toBeNull()
      expect(data.error).toBeTruthy()
    })
  })
})