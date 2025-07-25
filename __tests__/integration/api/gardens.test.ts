import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/gardens/route'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock logger to avoid console output during tests
jest.mock('@/lib/logger', () => ({
  apiLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  AuditLogger: {
    logUserAction: jest.fn(),
    logDataAccess: jest.fn(),
  },
  PerformanceLogger: {
    startTimer: jest.fn(),
    endTimer: jest.fn(),
  },
}))

describe('Gardens API Integration Tests', () => {
  const mockSupabaseChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain)
  })

  describe('GET /api/gardens', () => {
    it('should return all gardens successfully', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Garden 1' },
        { ...global.testUtils.mockGarden, id: '2', name: 'Garden 2' },
      ]

      // Mock connection validation (select('count').limit(1))
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      // Mock the actual data query
      mockSupabaseChain.range.mockResolvedValue({ 
        data: mockGardens, 
        error: null, 
        count: 2 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.data).toHaveLength(2)
      expect(data.data.page).toBe(1)
      expect(data.data.page_size).toBe(10)
    })

    it('should handle search query parameter', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Rose Garden' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({ 
        data: mockGardens, 
        error: null, 
        count: 1 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens?search=rose')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSupabaseChain.or).toHaveBeenCalledWith(
        'name.ilike.%rose%,description.ilike.%rose%,location.ilike.%rose%'
      )
    })

    it('should handle pagination parameters', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '6', name: 'Garden 6' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({ 
        data: mockGardens, 
        error: null, 
        count: 10 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens?page=2&pageSize=5')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.page).toBe(2)
      expect(data.data.page_size).toBe(5)
      expect(mockSupabaseChain.range).toHaveBeenCalledWith(5, 9) // (page-1) * pageSize, page * pageSize - 1
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }

      // Mock connection validation to fail
      mockSupabaseChain.limit.mockResolvedValue({ error: mockError })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unable to connect to database')
    })

    it('should handle empty results', async () => {
      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 0 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.data).toHaveLength(0)
      expect(data.data.count).toBe(0)
    })

    it('should handle large page size limit', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Garden 1' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({ 
        data: mockGardens, 
        error: null, 
        count: 1 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens?pageSize=1000')
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
        total_area: '100m²',
        garden_type: 'vegetable',
      }

      const createdGarden = {
        ...newGarden,
        id: 'new-id',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
      }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      // Mock insert operation
      mockSupabaseChain.single.mockResolvedValue({ 
        data: createdGarden, 
        error: null 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdGarden)
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New Garden',
          location: 'Test Location',
        })
      ])
    })

    it('should handle validation errors', async () => {
      const invalidGarden = {
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(invalidGarden),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Dit veld is verplicht') // Dutch validation message
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
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
      }

      // Mock connection validation to fail
      mockSupabaseChain.limit.mockResolvedValue({ 
        error: { code: 'PGRST301', message: 'Database error' } 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
        headers: { 'Content-Type': 'application/json' },
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
        description: '  A beautiful garden  ',
      }

      const createdGarden = {
        name: 'New Garden', // trimmed
        location: 'Test Location', // trimmed
        description: 'A beautiful garden', // trimmed
        id: 'new-id',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
      }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({ 
        data: createdGarden, 
        error: null 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New Garden',
          location: 'Test Location',
        })
      ])
    })

    it('should handle missing Content-Type header', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
      }

      const createdGarden = {
        ...newGarden,
        id: 'new-id',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
      }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({ 
        data: createdGarden, 
        error: null 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
        // No Content-Type header
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still work - Next.js handles JSON parsing automatically
      expect(response.status).toBe(201)
    })

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Dit veld is verplicht') // Dutch validation message for required field
    })
  })

  describe('API Response Format', () => {
    it('should return consistent response format for success', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Garden 1' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({ 
        data: mockGardens, 
        error: null, 
        count: 1 
      })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('error')
      expect(data.success).toBe(true)
      expect(data.data).toBeTruthy()
      expect(data.error).toBeNull()
    })

    it('should return consistent response format for errors', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      // Mock connection validation to fail
      mockSupabaseChain.limit.mockResolvedValue({ error: mockError })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('error')
      expect(data.success).toBe(false)
      expect(data.data).toBeNull()
      expect(typeof data.error).toBe('string')
    })
  })
})