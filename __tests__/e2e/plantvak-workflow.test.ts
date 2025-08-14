import { PlantvakService } from '@/lib/services/plantvak.service'

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase()
  }
})

describe('Plantvak Workflow - E2E Tests', () => {
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

  describe('Complete Plantvak Lifecycle', () => {
    it('should complete full plantvak workflow from creation to deletion', async () => {
      const gardenId = 'test-garden-123'
      const plantvakData = {
        garden_id: gardenId,
        location: 'North Side'
      }

      // Mock successful creation
      const mockCreatedPlantvak = {
        id: 'plantvak-1',
        name: 'A',
        garden_id: gardenId,
        location: 'North Side',
        letter_code: 'A',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.mockQueryBuilder.setData(mockCreatedPlantvak)

      const created = await PlantvakService.create(plantvakData)

      expect(created).toBeDefined()
      expect(created?.letter_code).toBe('A')
      expect(created?.garden_id).toBe(gardenId)

      // Mock successful retrieval
      mockSupabase.mockQueryBuilder.setData(mockCreatedPlantvak)

      const retrieved = await PlantvakService.getById(created!.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.letter_code).toBe('A')

      // Mock successful update
      const updatedData = { location: 'South Side' }
      const mockUpdatedPlantvak = { ...mockCreatedPlantvak, location: 'South Side' }
      mockSupabase.mockQueryBuilder.setData(mockUpdatedPlantvak)

      const updated = await PlantvakService.update(created!.id, updatedData)

      expect(updated).toBeDefined()
      expect(updated?.location).toBe('South Side')

      // Mock successful deletion
      mockSupabase.mockQueryBuilder.setData({ success: true })

      const deleted = await PlantvakService.delete(created!.id)

      expect(deleted).toBe(true)
    })

    it('should handle multiple plantvakken with sequential letter codes', async () => {
      const gardenId = 'test-garden-123'
      const plantvakken = []

      // Create multiple plantvakken
      for (let i = 0; i < 3; i++) {
        const mockResponse = {
          id: `plantvak-${i + 1}`,
          name: String.fromCharCode(65 + i), // A, B, C
          garden_id: gardenId,
          location: `Side ${i + 1}`,
          letter_code: String.fromCharCode(65 + i),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        mockSupabase.mockQueryBuilder.setData(mockResponse)

        const created = await PlantvakService.create({
          garden_id: gardenId,
          location: `Side ${i + 1}`
        })

        expect(created).toBeDefined()
        expect(created?.letter_code).toBe(String.fromCharCode(65 + i))
        plantvakken.push(created!)
      }

      // Mock retrieval of all plantvakken
      mockSupabase.mockQueryBuilder.setData(plantvakken)

      const retrieved = await PlantvakService.getByGarden(gardenId)

      expect(retrieved).toHaveLength(3)
      expect(retrieved[0].letter_code).toBe('A')
      expect(retrieved[1].letter_code).toBe('B')
      expect(retrieved[2].letter_code).toBe('C')
    })

    it('should handle concurrent plantvak operations', async () => {
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

  describe('Error Handling & Recovery', () => {
    it('should handle database connection failures gracefully', async () => {
      // Mock database connection failure
      mockSupabase.mockQueryBuilder.setError(new Error('Database connection failed'))

      const result = await PlantvakService.create({
        garden_id: 'test-garden-123',
        location: 'North Side'
      })

      expect(result).toBeNull()
    })

    it('should handle validation errors and continue workflow', async () => {
      const invalidData = {
        garden_id: '',
        location: 'North Side'
      }

      // Mock validation error
      mockSupabase.mockQueryBuilder.setError(new Error('Garden ID is required'))

      const result = await PlantvakService.create(invalidData)

      expect(result).toBeNull()

      // Should be able to continue with valid data
      const validData = {
        garden_id: 'test-garden-123',
        location: 'North Side'
      }

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

      mockSupabase.mockQueryBuilder.setData(mockResponse)

      const validResult = await PlantvakService.create(validData)

      expect(validResult).toBeDefined()
      expect(validResult?.letter_code).toBe('A')
    })

    it('should recover from partial failures', async () => {
      const gardenId = 'test-garden-123'

      // First plantvak creation succeeds
      const mockResponse1 = {
        id: 'plantvak-1',
        name: 'A',
        garden_id: gardenId,
        location: 'North Side',
        letter_code: 'A',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.mockQueryBuilder.setData(mockResponse1)

      const result1 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'North Side'
      })

      expect(result1).toBeDefined()
      expect(result1?.letter_code).toBe('A')

      // Mock database error for second plantvak
      mockSupabase.mockQueryBuilder.setError(new Error('Database error'))

      const result2 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'East Side'
      })

      expect(result2).toBeNull()

      // Third plantvak creation succeeds again
      const mockResponse3 = {
        id: 'plantvak-3',
        name: 'B',
        garden_id: gardenId,
        location: 'South Side',
        letter_code: 'B',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.mockQueryBuilder.setData(mockResponse3)

      const result3 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'South Side'
      })

      expect(result3).toBeDefined()
      expect(result3?.letter_code).toBe('B')
    })
  })

  describe('Performance & Scalability', () => {
    it('should handle large numbers of plantvakken efficiently', async () => {
      const gardenId = 'test-garden-123'
      const startTime = Date.now()

      // Mock creation of 100 plantvakken
      const mockPlantvakken = Array.from({ length: 100 }, (_, i) => ({
        id: `plantvak-${i + 1}`,
        name: String.fromCharCode(65 + (i % 26)), // A-Z repeating
        garden_id: gardenId,
        location: `Location ${i + 1}`,
        letter_code: String.fromCharCode(65 + (i % 26)),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Mock successful creation
      mockSupabase.mockQueryBuilder.setData(mockPlantvakken[0])

      // Create plantvakken
      for (let i = 0; i < 100; i++) {
        await PlantvakService.create({
          garden_id: gardenId,
          location: `Location ${i + 1}`
        })
      }

      // Mock retrieval
      mockSupabase.mockQueryBuilder.setData(mockPlantvakken)

      const retrieved = await PlantvakService.getByGarden(gardenId)
      const endTime = Date.now()

      expect(retrieved).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should maintain performance with complex queries', async () => {
      const gardenId = 'test-garden-123'
      const startTime = Date.now()

      // Mock complex query with filters
      const mockPlantvakken = Array.from({ length: 50 }, (_, i) => ({
        id: `plantvak-${i + 1}`,
        name: String.fromCharCode(65 + (i % 26)),
        garden_id: gardenId,
        location: `Location ${i + 1}`,
        letter_code: String.fromCharCode(65 + (i % 26)),
        is_active: true,
        size: `${Math.floor(Math.random() * 10) + 1}x${Math.floor(Math.random() * 10) + 1}m`,
        soil_type: ['clay', 'sandy', 'loamy'][i % 3],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Mock complex query with filters
      mockSupabase.mockQueryBuilder.setData(mockPlantvakken)

      const retrieved = await PlantvakService.getByGarden(gardenId, {
        is_active: true,
        size: '3x4m'
      })
      const endTime = Date.now()

      expect(retrieved).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms

      // Verify data integrity
      retrieved.forEach((plantvak, index) => {
        expect(plantvak.garden_id).toBe(gardenId)
        expect(plantvak.is_active).toBe(true)
      })
    })
  })
})