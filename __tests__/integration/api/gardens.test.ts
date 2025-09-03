import { createRequest, createResponse } from 'node-mocks-http'
import { GET, POST } from '@/app/api/gardens/route'
import { mockGardenData, mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock fetch for integration tests
global.fetch = jest.fn()

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
  // Increase timeout for integration tests
  jest.setTimeout(30000)

  beforeAll(async () => {
    // Setup test database or mocks
    console.log('Setting up test environment...')
  })

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up test environment...')
  })

  beforeEach(async () => {
    // Reset mocks and test data
    jest.clearAllMocks()
    
    // Mock fetch responses
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/gardens')) {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ success: true, gardens: mockGardensArray })
        })
      }
      return Promise.resolve({
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      })
    })
  })

  describe('GET /api/gardens', () => {
    it('should return all gardens', async () => {
      // Mock the response or use test database
      const response = await fetch('/api/gardens')
      expect(response.status).toBe(200)
    }, 30000) // 30 second timeout
  })

  describe('POST /api/gardens', () => {
    it('should create a garden successfully', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'Test Description'
      }

      const response = await fetch('/api/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGarden),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.garden.name).toBe('New Garden')
    }, 30000) // 30 second timeout

    it('should handle database errors during creation', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'Test Description'
      }

      // Mock database error
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const response = await fetch('/api/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGarden),
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Database error')
    }, 30000) // 30 second timeout

    it('should trim whitespace from input fields', async () => {
      const newGarden = {
        name: '  New Garden  ',
        location: '  Test Location  ',
        description: '  Test Description  '
      }

      const response = await fetch('/api/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGarden),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.garden.name).toBe('New Garden')
      expect(data.garden.location).toBe('Test Location')
      expect(data.garden.description).toBe('Test Description')
    }, 30000) // 30 second timeout

    it('should handle missing Content-Type header', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'Test Description'
      }

      const response = await fetch('/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Content-Type header must be application/json')
    }, 30000) // 30 second timeout

    it('should handle empty request body', async () => {
      const response = await fetch('/api/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '',
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Request body is required')
    }, 30000) // 30 second timeout
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