import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/gardens/route'
import { supabase } from '@/lib/supabase'

// Mock Supabase for integration tests
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
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

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: mockGardens,
              error: null,
              count: 2,
            }),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.data).toEqual(mockGardens)
      expect(data.data.count).toBe(2)
    })

    it('should handle search query parameter', async () => {
      const mockGardens = [{ ...global.testUtils.mockGarden, name: 'Rose Garden' }]

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          or: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            order: jest.fn().mockReturnValue({
              ...mockSupabaseChain,
              range: jest.fn().mockResolvedValue({
                data: mockGardens,
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
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
      const mockGardens = [{ ...global.testUtils.mockGarden }]

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: mockGardens,
              error: null,
              count: 1,
            }),
          }),
        }),
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
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST301', message: 'Database error' },
              count: 0,
            }),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch gardens')
    })

    it('should validate and correct invalid pagination parameters', async () => {
      const mockGardens = [{ ...global.testUtils.mockGarden }]

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: mockGardens,
              error: null,
              count: 1,
            }),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/gardens?page=-1&pageSize=200')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.page).toBe(1) // Corrected from -1
      expect(data.data.page_size).toBe(100) // Corrected from 200 (max allowed)
    })
  })

  describe('POST /api/gardens', () => {
    it('should create a garden successfully', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful test garden',
      }
      const createdGarden = { ...global.testUtils.mockGarden, ...newGarden }

      mockSupabaseChain.insert.mockReturnValue({
        ...mockSupabaseChain,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          single: jest.fn().mockResolvedValue({
            data: createdGarden,
            error: null,
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdGarden)
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: newGarden.name,
          location: newGarden.location,
          description: newGarden.description,
          is_active: true,
        })
      )
    })

    it('should validate required fields', async () => {
      const invalidGarden = {
        name: '',
        location: 'Test Location',
      }

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(invalidGarden),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Garden name is required')
    })

    it('should validate location field', async () => {
      const invalidGarden = {
        name: 'Test Garden',
        location: '',
      }

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(invalidGarden),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Garden location is required')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should handle database errors during creation', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
      }

      mockSupabaseChain.insert.mockReturnValue({
        ...mockSupabaseChain,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST301', message: 'Database error' },
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create garden')
    })

    it('should trim whitespace from input fields', async () => {
      const newGarden = {
        name: '  New Garden  ',
        location: '  Test Location  ',
        description: '  A test garden  ',
      }
      const createdGarden = {
        ...global.testUtils.mockGarden,
        name: 'New Garden',
        location: 'Test Location',
        description: 'A test garden',
      }

      mockSupabaseChain.insert.mockReturnValue({
        ...mockSupabaseChain,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          single: jest.fn().mockResolvedValue({
            data: createdGarden,
            error: null,
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Garden',
          location: 'Test Location',
          is_active: true,
        })
      )
    })

    it('should handle missing Content-Type header', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
      }

      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: JSON.stringify(newGarden),
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still work - Next.js handles JSON parsing automatically
      expect(response.status).toBe(201)
    })

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: '',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })
  })

  describe('API Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      mockSupabaseChain.select.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('An unexpected error occurred')
    })
  })

  describe('API Response Format', () => {
    it('should return consistent response format for success', async () => {
      const mockGardens = [{ ...global.testUtils.mockGarden }]

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: mockGardens,
              error: null,
              count: 1,
            }),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('error')
      expect(data.success).toBe(true)
      expect(data.error).toBeNull()
    })

    it('should return consistent response format for errors', async () => {
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST301', message: 'Database error' },
              count: 0,
            }),
          }),
        }),
      })

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