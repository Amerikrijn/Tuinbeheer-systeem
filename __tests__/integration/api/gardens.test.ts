// Mock Next.js dependencies
global.Request = class Request {
  constructor(input: string | URL | Request, init?: RequestInit) {
    // Mock implementation
  }
} as any

global.Response = class Response {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    // Mock implementation
  }
} as any

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase(),
  }
})

// Get the mocked supabase instance
const { supabase } = require('@/lib/supabase')

describe('Gardens API - Integration Tests', () => {
  let mockSupabase: any

  beforeEach(() => {
    // Get a fresh mock instance for each test
    const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
    mockSupabase = createMockSupabase()
    
    // Replace the mocked supabase with our fresh instance
    jest.doMock('@/lib/supabase', () => ({
      supabase: mockSupabase
    }))
    
    jest.clearAllMocks()
  })

  describe('GET /api/gardens', () => {
    it('should return all gardens successfully', async () => {
      const mockGardens = [
        {
          id: 'garden-1',
          name: 'Test Garden 1',
          location: 'North Side',
          description: 'A beautiful test garden',
          established_date: '2023-01-01',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'garden-2',
          name: 'Test Garden 2',
          location: 'South Side',
          description: 'Another beautiful test garden',
          established_date: '2023-02-01',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      // Mock successful retrieval
      mockSupabase.mockQueryBuilder.setData(mockGardens)

      // Import the handler dynamically to avoid module loading issues
      const { GET } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabase.mockQueryBuilder.setError(new Error('Database connection failed'))

      const { GET } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBeDefined()
    })
  })

  describe('POST /api/gardens', () => {
    it('should create a new garden successfully', async () => {
      const newGardenData = {
        name: 'New Test Garden',
        location: 'East Side',
        description: 'A newly created test garden',
        established_date: '2023-03-01'
      }

      const mockCreatedGarden = {
        id: 'garden-new',
        ...newGardenData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Mock successful creation
      mockSupabase.mockQueryBuilder.setData(mockCreatedGarden)

      const { POST } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGardenData)
      })

      const response = await POST(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data).toBeDefined()
      expect(data.name).toBe(newGardenData.name)
    })

    it('should validate required fields', async () => {
      const invalidGardenData = {
        name: '',
        location: 'West Side'
        // Missing required fields
      }

      const { POST } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidGardenData)
      })

      const response = await POST(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBeDefined()
    })
  })
})