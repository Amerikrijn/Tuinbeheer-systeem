import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/gardens/route'
import { mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  apiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  databaseLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
  AuditLogger: { logUserAction: vi.fn(), logDataAccess: vi.fn() },
  PerformanceLogger: { startTimer: vi.fn(), endTimer: vi.fn() }
}))

vi.mock('@/lib/banking-security', () => ({
  logClientSecurityEvent: vi.fn(),
  validateApiInput: vi.fn()
}))

vi.mock('@/lib/validation', () => ({
  validateTuinFormData: vi.fn()
}))

vi.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase()
  }
})

// Get mocked instances
const { supabase } = require('@/lib/supabase')
const mockSupabase = supabase
const mockValidateApiInput = require('@/lib/banking-security').validateApiInput as any
const mockValidateTuinFormData = require('@/lib/validation').validateTuinFormData as any

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

describe('API Workflow: Complete Question to Response Chain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.mockQueryBuilder.reset()
    mockValidateApiInput.mockReturnValue(true)
    mockValidateTuinFormData.mockReturnValue({ isValid: true, errors: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/gardens - Complete Workflow', () => {
    it('should handle complete GET workflow with search and pagination', async () => {
      // Step 1: Test basic GET request
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data?.data).toEqual(mockGardensArray)

      // Step 2: Test GET with search parameters
      const searchRequest = createMockNextRequest(
        'http://localhost:3000/api/gardens?search=Test&page=1&pageSize=5&sort=name&direction=asc'
      )
      
      mockSupabase.mockQueryBuilder.mockSuccess([mockGardensArray[0]])
      
      const searchResponse = await GET(searchRequest)
      expect(searchResponse.status).toBe(200)
      
      const searchData = await searchResponse.json()
      expect(searchData.success).toBe(true)
      expect(searchData.data?.data).toHaveLength(1)

      // Step 3: Test GET with pagination
      const paginationRequest = createMockNextRequest(
        'http://localhost:3000/api/gardens?page=2&pageSize=3'
      )
      
      const paginatedData = mockGardensArray.slice(0, 3)
      mockSupabase.mockQueryBuilder.mockSuccess(paginatedData)
      
      const paginationResponse = await GET(paginationRequest)
      expect(paginationResponse.status).toBe(200)
      
      const paginationData = await paginationResponse.json()
      expect(paginationData.success).toBe(true)
      expect(paginationData.data?.page).toBe(2)
    })

    it('should handle authentication workflow correctly', async () => {
      // Test unauthorized access
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unauthorized' }
      })

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')

      // Test authorized access
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })

      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)
      
      const authorizedResponse = await GET(request)
      expect(authorizedResponse.status).toBe(200)
    })

    it('should handle database errors gracefully', async () => {
      // Test database connection failure
      mockSupabase.mockQueryBuilder.mockError({ 
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR'
      })

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe('POST /api/gardens - Complete Workflow', () => {
    const newGarden = {
      name: 'New Test Garden',
      description: 'A comprehensive test garden',
      location: 'Test Location',
      garden_type: 'vegetable',
      total_area: '100m²',
      length: '10m',
      width: '10m',
      established_date: '2024-01-01',
      season_year: 2024,
      notes: 'Test garden notes',
      is_active: true
    }

    it('should handle complete POST workflow with validation', async () => {
      // Step 1: Test successful garden creation
      const createdGarden = { ...newGarden, id: 'new-garden-id' }
      mockSupabase.mockQueryBuilder.mockSuccess([createdGarden])

      const request = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: newGarden
      })
      
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data?.name).toBe('New Test Garden')

      // Step 2: Test validation workflow
      mockValidateTuinFormData.mockReturnValue({ 
        isValid: false, 
        errors: ['Name is required'] 
      })

      const invalidRequest = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: { ...newGarden, name: '' }
      })
      
      const invalidResponse = await POST(invalidRequest)
      expect(invalidResponse.status).toBe(400)
      
      const invalidData = await invalidResponse.json()
      expect(invalidData.success).toBe(false)
      expect(invalidData.error).toContain('Name is required')

      // Step 3: Test database error during creation
      mockValidateTuinFormData.mockReturnValue({ isValid: true, errors: [] })
      mockSupabase.mockQueryBuilder.mockError({ 
        message: 'Insert failed',
        code: 'INSERT_ERROR'
      })

      const errorRequest = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: newGarden
      })
      
      const errorResponse = await POST(errorRequest)
      expect(errorResponse.status).toBe(500)
      
      const errorData = await errorResponse.json()
      expect(errorData.success).toBe(false)
    })

    it('should handle malformed request data', async () => {
      // Test invalid JSON
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

      // Test missing required fields
      const incompleteGarden = { name: 'Incomplete Garden' }
      
      const incompleteRequest = createMockNextRequest('http://localhost:3000/api/gardens', {
        method: 'POST',
        body: incompleteGarden
      })
      
      mockValidateTuinFormData.mockReturnValue({ 
        isValid: false, 
        errors: ['Description is required', 'Location is required'] 
      })

      const incompleteResponse = await POST(incompleteRequest)
      expect(incompleteResponse.status).toBe(400)
      
      const incompleteData = await incompleteResponse.json()
      expect(incompleteData.error).toContain('Description is required')
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle network timeouts gracefully', async () => {
      // Mock timeout scenario
      mockSupabase.mockQueryBuilder.mockTimeout()

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle partial data scenarios', async () => {
      // Mock partial data response
      mockSupabase.mockQueryBuilder.mockPartialSuccess(mockGardensArray.slice(0, 1))

      const request = createMockNextRequest('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data?.data).toHaveLength(1)
    })

    it('should validate input parameters correctly', async () => {
      // Test invalid page parameter
      const invalidPageRequest = createMockNextRequest(
        'http://localhost:3000/api/gardens?page=invalid&pageSize=abc'
      )
      
      const response = await GET(invalidPageRequest)
      
      // Should still work with default values
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  describe('Performance and Security', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeGardenArray = Array.from({ length: 1000 }, (_, i) => ({
        ...mockGardensArray[0],
        id: `garden-${i}`,
        name: `Garden ${i}`,
        created_at: new Date(2024, 0, i + 1).toISOString()
      }))

      mockSupabase.mockQueryBuilder.mockSuccess(largeGardenArray)

      const request = createMockNextRequest('http://localhost:3000/api/gardens?pageSize=100')
      const startTime = Date.now()
      
      const response = await GET(request)
      const endTime = Date.now()
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data?.data).toHaveLength(100)
    })

    it('should enforce security measures', async () => {
      // Test input validation
      const maliciousRequest = createMockNextRequest(
        'http://localhost:3000/api/gardens?search=<script>alert("xss")</script>'
      )
      
      mockValidateApiInput.mockReturnValue(false)
      
      const response = await GET(maliciousRequest)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid input detected')

      // Test SQL injection prevention
      const sqlInjectionRequest = createMockNextRequest(
        'http://localhost:3000/api/gardens?search=1; DROP TABLE gardens;--'
      )
      
      mockValidateApiInput.mockReturnValue(false)
      
      const sqlResponse = await GET(sqlInjectionRequest)
      expect(sqlResponse.status).toBe(400)
    })
  })
})