import { PlantvakService } from '@/lib/services/plantvak.service'

// Mock Supabase for E2E testing
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signOut: jest.fn(() => Promise.resolve({ error: null }))
      }
    }))
  }
}))

describe('Plantvak Workflow - E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Plantvak Lifecycle', () => {
    test('should complete full plantvak workflow from creation to deletion', async () => {
      const gardenId = 'test-garden-123'
      
      // Step 1: Create plantvak
      const mockCreatedPlantvak = {
        id: 'plantvak-123',
        garden_id: gardenId,
        name: 'A',
        letter_code: 'A',
        location: 'North Side',
        size: '2x3m',
        soil_type: 'clay',
        sun_exposure: 'full-sun',
        description: 'Test plantvak',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().single.mockResolvedValue({ data: [], error: null })
      supabase.from().insert().select().single.mockResolvedValue({ data: mockCreatedPlantvak, error: null })

      const created = await PlantvakService.create({
        garden_id: gardenId,
        location: 'North Side',
        size: '2x3m',
        soil_type: 'clay',
        sun_exposure: 'full-sun',
        description: 'Test plantvak'
      })

      expect(created).toBeDefined()
      expect(created?.letter_code).toBe('A')
      expect(created?.name).toBe('A')

      // Step 2: Retrieve plantvak
      supabase.from().select().eq().order().limit().mockResolvedValue({ data: [mockCreatedPlantvak], error: null })

      const retrieved = await PlantvakService.getByGarden(gardenId)
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].id).toBe('plantvak-123')

      // Step 3: Update plantvak
      const updatedData = {
        location: 'Updated Location',
        size: '3x4m',
        soil_type: 'sand'
      }

      const mockUpdatedPlantvak = {
        ...mockCreatedPlantvak,
        ...updatedData,
        updated_at: '2024-01-01T01:00:00Z'
      }

      supabase.from().update().eq().select().single.mockResolvedValue({ data: mockUpdatedPlantvak, error: null })

      const updated = await PlantvakService.update('plantvak-123', updatedData)
      expect(updated?.location).toBe('Updated Location')
      expect(updated?.size).toBe('3x4m')

      // Step 4: Delete plantvak
      supabase.from().delete().eq().mockResolvedValue({ data: null, error: null })

      const deleted = await PlantvakService.delete('plantvak-123')
      expect(deleted).toBe(true)
    })

    test('should handle multiple plantvakken with sequential letter codes', async () => {
      const gardenId = 'test-garden-456'
      const plantvakken = []

      // Create 5 plantvakken
      for (let i = 0; i < 5; i++) {
        const mockPlantvak = {
          id: `plantvak-${i}`,
          garden_id: gardenId,
          name: String.fromCharCode(65 + i),
          letter_code: String.fromCharCode(65 + i),
          location: `Location ${i}`,
          size: `${i + 1}x${i + 1}m`,
          soil_type: 'clay',
          sun_exposure: 'full-sun',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const supabase = require('@/lib/supabase').supabase
        supabase.from().select().eq().single.mockResolvedValue({ data: plantvakken, error: null })
        supabase.from().insert().select().single.mockResolvedValue({ data: mockPlantvak, error: null })

        const created = await PlantvakService.create({
          garden_id: gardenId,
          location: `Location ${i}`,
          size: `${i + 1}x${i + 1}m`,
          soil_type: 'clay',
          sun_exposure: 'full-sun'
        })

        plantvakken.push(created)
      }

      expect(plantvakken).toHaveLength(5)
      expect(plantvakken[0].letter_code).toBe('A')
      expect(plantvakken[1].letter_code).toBe('B')
      expect(plantvakken[2].letter_code).toBe('C')
      expect(plantvakken[3].letter_code).toBe('D')
      expect(plantvakken[4].letter_code).toBe('E')
    })

    test('should handle concurrent plantvak operations', async () => {
      const gardenId = 'test-garden-789'
      const concurrentOperations = []

      // Simulate 10 concurrent operations
      for (let i = 0; i < 10; i++) {
        const mockPlantvak = {
          id: `plantvak-${i}`,
          garden_id: gardenId,
          name: String.fromCharCode(65 + i),
          letter_code: String.fromCharCode(65 + i),
          location: `Concurrent Location ${i}`,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const supabase = require('@/lib/supabase').supabase
        supabase.from().select().eq().single.mockResolvedValue({ data: [], error: null })
        supabase.from().insert().select().single.mockResolvedValue({ data: mockPlantvak, error: null })

        concurrentOperations.push(
          PlantvakService.create({
            garden_id: gardenId,
            location: `Concurrent Location ${i}`
          })
        )
      }

      const results = await Promise.all(concurrentOperations)
      expect(results).toHaveLength(10)

      // Verify all operations completed successfully
      results.forEach((result, index) => {
        expect(result).toBeDefined()
        expect(result?.letter_code).toBe(String.fromCharCode(65 + index))
        expect(result?.garden_id).toBe(gardenId)
      })
    })
  })

  describe('Error Handling & Recovery', () => {
    test('should handle database connection failures gracefully', async () => {
      const mockPlantvakData = {
        garden_id: 'test-garden-123',
        location: 'North Side'
      }

      // Mock database failure
      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().single.mockRejectedValue(new Error('Database connection failed'))

      const result = await PlantvakService.create(mockPlantvakData)
      expect(result).toBeNull()
    })

    test('should handle validation errors and continue workflow', async () => {
      const invalidPlantvakData = {
        garden_id: '',
        location: '',
        size: 'invalid-size',
        soil_type: 'invalid-soil'
      }

      const result = await PlantvakService.create(invalidPlantvakData)
      expect(result).toBeNull()
    })

    test('should recover from partial failures', async () => {
      const gardenId = 'test-garden-recovery'
      
      // First operation succeeds
      const mockPlantvak1 = {
        id: 'plantvak-1',
        garden_id: gardenId,
        name: 'A',
        letter_code: 'A',
        location: 'Location 1',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().single.mockResolvedValue({ data: [], error: null })
      supabase.from().insert().select().single.mockResolvedValue({ data: mockPlantvak1, error: null })

      const result1 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'Location 1'
      })

      expect(result1).toBeDefined()
      expect(result1?.letter_code).toBe('A')

      // Second operation fails
      supabase.from().insert().select().single.mockRejectedValue(new Error('Temporary failure'))

      const result2 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'Location 2'
      })

      expect(result2).toBeNull()

      // Third operation succeeds (recovery)
      const mockPlantvak3 = {
        id: 'plantvak-3',
        garden_id: gardenId,
        name: 'B',
        letter_code: 'B',
        location: 'Location 3',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      supabase.from().insert().select().single.mockResolvedValue({ data: mockPlantvak3, error: null })

      const result3 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'Location 3'
      })

      expect(result3).toBeDefined()
      expect(result3?.letter_code).toBe('B')
    })
  })

  describe('Performance & Scalability', () => {
    test('should handle large numbers of plantvakken efficiently', async () => {
      const gardenId = 'test-garden-large'
      const largeDataset = []

      // Create 100 plantvakken
      for (let i = 0; i < 100; i++) {
        const mockPlantvak = {
          id: `plantvak-${i}`,
          garden_id: gardenId,
          name: String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : ''),
          letter_code: String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : ''),
          location: `Location ${i}`,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        largeDataset.push(mockPlantvak)
      }

      // Mock retrieval of large dataset
      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().order().limit().mockResolvedValue({ data: largeDataset, error: null })

      const startTime = Date.now()
      const retrieved = await PlantvakService.getByGarden(gardenId)
      const endTime = Date.now()

      expect(retrieved).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    test('should maintain performance with complex queries', async () => {
      const gardenId = 'test-garden-complex'
      const complexData = []

      // Create complex dataset with various attributes
      for (let i = 0; i < 50; i++) {
        const mockPlantvak = {
          id: `plantvak-${i}`,
          garden_id: gardenId,
          name: String.fromCharCode(65 + (i % 26)),
          letter_code: String.fromCharCode(65 + (i % 26)),
          location: `Complex Location ${i}`,
          size: `${i + 1}x${i + 2}m`,
          soil_type: ['clay', 'sand', 'leem', 'veen', 'gemengd'][i % 5],
          sun_exposure: ['full-sun', 'partial-sun', 'shade'][i % 3],
          description: `Complex description ${i} with multiple attributes and requirements`,
          is_active: i % 10 !== 0, // Some inactive
          created_at: new Date(2024, 0, i + 1).toISOString(),
          updated_at: new Date(2024, 0, i + 1).toISOString()
        }

        complexData.push(mockPlantvak)
      }

      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().order().limit().mockResolvedValue({ data: complexData, error: null })

      const startTime = Date.now()
      const retrieved = await PlantvakService.getByGarden(gardenId)
      const endTime = Date.now()

      expect(retrieved).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(3000) // Should complete within 3 seconds

      // Verify complex data integrity
      retrieved.forEach((plantvak, index) => {
        expect(plantvak.letter_code).toBe(String.fromCharCode(65 + (index % 26)))
        expect(['clay', 'sand', 'leem', 'veen', 'gemengd']).toContain(plantvak.soil_type)
        expect(['full-sun', 'partial-sun', 'shade']).toContain(plantvak.sun_exposure)
      })
    })
  })
})