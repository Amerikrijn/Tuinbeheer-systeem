import { PlantvakService } from '@/lib/services/plantvak.service'

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase()
  }
})

describe('PlantvakService - Integration Tests', () => {
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

  const mockPlantvakData = {
    garden_id: 'test-garden-123',
    location: 'North Side'
  }

  describe('Service Integration', () => {
    it('should create plantvak with automatic letter code', async () => {
      const mockResponse = {
        id: 'plantvak-1',
        name: 'A',
        garden_id: 'test-garden-123',
        location: 'North Side',
        letter_code: 'A',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Mock successful creation
      mockSupabase.mockQueryBuilder.setData(mockResponse)

      const result = await PlantvakService.create(mockPlantvakData)

      expect(result).toBeDefined()
      expect(result?.letter_code).toBe('A')
      expect(result?.name).toBe('A')
      expect(result?.garden_id).toBe('test-garden-123')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabase.mockQueryBuilder.setError(new Error('Database connection failed'))

      const result = await PlantvakService.create(mockPlantvakData)

      expect(result).toBeNull()
    })

    it('should retrieve plantvakken by garden', async () => {
      const gardenId = 'test-garden-123'
      const mockPlantvakken = [
        {
          id: 'plantvak-1',
          name: 'A',
          garden_id: gardenId,
          letter_code: 'A',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'plantvak-2',
          name: 'B',
          garden_id: gardenId,
          letter_code: 'B',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      // Mock successful retrieval
      mockSupabase.mockQueryBuilder.setData(mockPlantvakken)

      const result = await PlantvakService.getByGarden(gardenId)

      expect(result).toBeDefined()
      expect(result).toHaveLength(2)
      expect(result[0].letter_code).toBe('A')
      expect(result[1].letter_code).toBe('B')
    })

    it('should update plantvak successfully', async () => {
      const plantvakId = 'plantvak-1'
      const updateData = {
        location: 'South Side',
        size: '3x4m'
      }

      const mockUpdatedResponse = {
        id: plantvakId,
        name: 'A',
        garden_id: 'test-garden-123',
        location: 'South Side',
        size: '3x4m',
        letter_code: 'A',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Mock successful update
      mockSupabase.mockQueryBuilder.setData(mockUpdatedResponse)

      const result = await PlantvakService.update(plantvakId, updateData)

      expect(result).toBeDefined()
      expect(result?.location).toBe('South Side')
      expect(result?.size).toBe('3x4m')
    })

    it('should delete plantvak successfully', async () => {
      const plantvakId = 'plantvak-1'

      // Mock successful deletion
      mockSupabase.mockQueryBuilder.setData({ success: true })

      const result = await PlantvakService.delete(plantvakId)

      expect(result).toBe(true)
    })
  })

  describe('Business Logic Integration', () => {
    it('should maintain letter code uniqueness within garden', async () => {
      const gardenId = 'test-garden-123'
      
      // Mock existing plantvakken with A, B, C
      const existingPlantvakken = [
        { letter_code: 'A' },
        { letter_code: 'B' },
        { letter_code: 'C' }
      ]

      mockSupabase.mockQueryBuilder.setData(existingPlantvakken)

      // Create new plantvak - should get 'D'
      const mockResponse = {
        id: 'plantvak-4',
        name: 'D',
        garden_id: gardenId,
        location: 'West Side',
        letter_code: 'D',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.mockQueryBuilder.setData(mockResponse)

      const result = await PlantvakService.create({
        garden_id: gardenId,
        location: 'West Side'
      })

      expect(result).toBeDefined()
      expect(result?.letter_code).toBe('D')
      expect(result?.name).toBe('D')
    })

    it('should handle concurrent plantvak creation', async () => {
      const gardenId = 'test-garden-123'
      const concurrentData = [
        { location: 'North Side' },
        { location: 'East Side' },
        { location: 'South Side' }
      ]

      // Mock successful creation for each concurrent request
      const mockResponses = concurrentData.map((data, index) => ({
        id: `plantvak-${index + 1}`,
        name: String.fromCharCode(65 + index), // A, B, C
        garden_id: gardenId,
        location: data.location,
        letter_code: String.fromCharCode(65 + index),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Mock each creation call
      mockSupabase.mockQueryBuilder.setData(mockResponses[0])

      const results = await Promise.all(
        concurrentData.map(data => 
          PlantvakService.create({ ...data, garden_id })
        )
      )

      results.forEach((result, index) => {
        expect(result).toBeDefined()
        expect(result?.letter_code).toBe(String.fromCharCode(65 + index))
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle missing garden_id gracefully', async () => {
      const invalidData = {
        garden_id: '',
        location: 'North Side'
      }

      // Mock validation error
      mockSupabase.mockQueryBuilder.setError(new Error('Garden ID is required'))

      const result = await PlantvakService.create(invalidData)

      expect(result).toBeNull()
    })

    it('should handle invalid plantvak data', async () => {
      const invalidData = {
        garden_id: 'test-garden-123',
        location: '',
        size: 'invalid-size',
        soil_type: 'invalid-soil'
      }

      // Mock successful creation with default values
      const mockResponse = {
        id: 'plantvak-1',
        name: 'A',
        garden_id: 'test-garden-123',
        location: '',
        size: 'invalid-size',
        soil_type: 'invalid-soil',
        letter_code: 'A',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.mockQueryBuilder.setData(mockResponse)

      const result = await PlantvakService.create(invalidData)

      expect(result).toBeDefined()
      // Should still create with default values
      expect(result?.letter_code).toBe('A')
    })
  })
})