import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/gardens/route'
import { mockGardensArray } from '@/__tests__/setup/supabase-mock'

jest.setTimeout(20000)

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  apiLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  databaseLogger: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
  AuditLogger: { logUserAction: jest.fn(), logDataAccess: jest.fn() },
  PerformanceLogger: { startTimer: jest.fn(), endTimer: jest.fn() }
}))

jest.mock('@/lib/banking-security', () => ({
  logClientSecurityEvent: jest.fn(),
  validateApiInput: jest.fn()
}))

jest.mock('@/lib/validation', () => ({
  validateTuinFormData: jest.fn()
}))

jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase()
  }
})

// Get mocked instances
const { supabase } = require('@/lib/supabase')
const mockSupabase = supabase
const mockValidateApiInput = require('@/lib/banking-security').validateApiInput as jest.Mock
const mockValidateTuinFormData = require('@/lib/validation').validateTuinFormData as jest.Mock

// Helper to create a mock NextRequest
function createMockNextRequest(
  url: string,
  options: { method?: string; body?: any } = {}
): NextRequest {
  const { method = 'GET', body } = options
  const urlObj = new URL(url)
  return {
    method,
    nextUrl: urlObj,
    headers: new Headers(),
    json: async () => body
  } as unknown as NextRequest
}

describe('Gardens API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.mockQueryBuilder.reset()
    mockValidateApiInput.mockReturnValue(true)
    mockValidateTuinFormData.mockReturnValue({ isValid: true, errors: [] })
  })

  describe('GET /api/gardens', () => {
    it('should return all gardens', async () => {
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data?.data).toEqual(mockGardensArray)
    })

    it('should handle database errors', async () => {
      mockSupabase.mockQueryBuilder.mockError({ message: 'Database error' })

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
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

    it('should create new garden successfully', async () => {
      mockSupabase.mockQueryBuilder.mockSuccess([{ ...newGarden, id: 'new-id' }])

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: newGarden
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data?.name).toBe('New Garden')
    })

    it('should handle invalid JSON', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST'
      })
      ;(request as any).json = async () => {
        throw new Error('Invalid JSON')
      }

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid JSON in request body')
    })

    it('should handle database errors during creation', async () => {
      mockSupabase.mockQueryBuilder.mockError({ message: 'Database error' })

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: newGarden
      })
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })
})

