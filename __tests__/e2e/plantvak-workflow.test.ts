import { PlantvakService } from '@/lib/services/plantvak.service'
import { mockGardenData } from '@/__tests__/setup/supabase-mock'

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase()
  }
})

describe('Plantvak Workflow - E2E Tests', () => {
  let mockSupabase: unknown

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

      // Mock successful creation
      mockSupabase.mockQueryBuilder.setData(mockCreatedPlantvak)

      const created = await PlantvakService.create({
        garden_id: gardenId,
        location: 'North Side'
      })

      expect(created).toBeDefined()
      expect(created?.letter_code).toBe('A')
      expect(created?.garden_id).toBe(gardenId)

      // Mock successful retrieval
      mockSupabase.mockQueryBuilder.setData([created])

      const retrieved = await PlantvakService.getByGarden(gardenId)
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].id).toBe(created?.id)

      // Mock successful update
      const updatedPlantvak = { ...created, location: 'South Side' }
      mockSupabase.mockQueryBuilder.setData(updatedPlantvak)

      const updated = await PlantvakService.update(created!.id, { location: 'South Side' })
      expect(updated?.location).toBe('South Side')

      // Mock successful deletion
      mockSupabase.mockQueryBuilder.setData({ success: true })

      const deleted = await PlantvakService.delete(created!.id)
      expect(deleted).toBeDefined()
    })

    it('should handle multiple plantvakken with sequential letter codes', async () => {
      const gardenId = 'test-garden-123'
      const plantvakken = []

      // Create multiple plantvakken
      for (let i = 0; i < 3; i++) {
        const mockPlantvak = {
          id: `plantvak-${i + 1}`,
          name: String.fromCharCode(65 + i), // A, B, C
          garden_id: gardenId,
          letter_code: String.fromCharCode(65 + i),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Mock successful creation
        mockSupabase.mockQueryBuilder.setData(mockPlantvak)

        const created = await PlantvakService.create({
          garden_id: gardenId,
          location: `Side ${i + 1}`
        })

        expect(created).toBeDefined()
        expect(created?.letter_code).toBe(String.fromCharCode(65 + i))
        plantvakken.push(created!)
      }

      // Mock successful retrieval
      mockSupabase.mockQueryBuilder.setData(plantvakken)

      const retrieved = await PlantvakService.getByGarden(gardenId)
      expect(retrieved).toHaveLength(3)
      expect(retrieved[0].letter_code).toBe('A')
      expect(retrieved[1].letter_code).toBe('B')
      expect(retrieved[2].letter_code).toBe('C')
    })

    it('should handle concurrent plantvak operations', async () => {
      const gardenId = 'test-garden-123'
      const concurrentOperations = []

      // Mock concurrent operations
      mockSupabase.mockQueryBuilder.setData([])

      for (let i = 0; i < 3; i++) {
        const mockPlantvak = {
          id: `plantvak-${i + 1}`,
          name: String.fromCharCode(65 + i), // A, B, C
          garden_id: gardenId,
          letter_code: String.fromCharCode(65 + i),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Mock successful creation
        mockSupabase.mockQueryBuilder.setData(mockPlantvak)

        concurrentOperations.push(
          PlantvakService.create({
            garden_id: gardenId,
            location: `Side ${i + 1}`
          })
        )
      }

      const results = await Promise.all(concurrentOperations)
      expect(results).toHaveLength(3)
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
      const result = await PlantvakService.create({
        garden_id: '',
        location: 'North Side'
      })

      expect(result).toBeNull()
    })

    it('should recover from partial failures', async () => {
      const gardenId = 'test-garden-123'

      // Mock successful creation for first plantvak
      const mockPlantvak1 = {
        id: 'plantvak-1',
        name: 'A',
        garden_id: gardenId,
        letter_code: 'A',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.mockQueryBuilder.setData(mockPlantvak1)

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
        location: 'South Side'
      })

      expect(result2).toBeNull()

      // Mock successful creation for third plantvak
      const mockPlantvak3 = {
        id: 'plantvak-3',
        name: 'B',
        garden_id: gardenId,
        letter_code: 'B',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.mockQueryBuilder.setData(mockPlantvak3)

      const result3 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'East Side'
      })

      expect(result3).toBeDefined()
      expect(result3?.letter_code).toBe('B')
    })
  })

  describe('Performance & Scalability', () => {
    it('should handle large numbers of plantvakken efficiently', async () => {
      const gardenId = 'test-garden-123'
      const largeDataset = []

      // Create large dataset
      for (let i = 0; i < 100; i++) {
        largeDataset.push({
          id: `plantvak-${i + 1}`,
          name: String.fromCharCode(65 + (i % 26)), // A-Z repeating
          garden_id: gardenId,
          letter_code: String.fromCharCode(65 + (i % 26)),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      // Mock retrieval of large dataset
      mockSupabase.mockQueryBuilder.setData(largeDataset)

      const startTime = Date.now()
      const retrieved = await PlantvakService.getByGarden(gardenId)
      const endTime = Date.now()

      expect(retrieved).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should maintain performance with complex queries', async () => {
      const gardenId = 'test-garden-123'
      const complexData = []

      // Create complex dataset with various properties
      for (let i = 0; i < 50; i++) {
        complexData.push({
          id: `plantvak-${i + 1}`,
          name: String.fromCharCode(65 + (i % 26)),
          garden_id: gardenId,
          letter_code: String.fromCharCode(65 + (i % 26)),
          location: `Side ${i % 4}`,
          size: `${(i % 5) + 1}x${(i % 5) + 1}m`,
          soil_type: ['clay', 'sand', 'loam'][i % 3],
          sun_exposure: ['full-sun', 'partial-sun', 'shade'][i % 3],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      // Mock complex query
      mockSupabase.mockQueryBuilder.setData(complexData)

      const startTime = Date.now()
      const retrieved = await PlantvakService.getByGarden(gardenId)
      const endTime = Date.now()

      expect(retrieved).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms

      // Verify data integrity
      retrieved.forEach((plantvak, index) => {
        expect(plantvak.id).toBe(`plantvak-${index + 1}`)
        expect(plantvak.garden_id).toBe(gardenId)
        expect(plantvak.letter_code).toBe(String.fromCharCode(65 + (index % 26)))
      })
    })
  })
})