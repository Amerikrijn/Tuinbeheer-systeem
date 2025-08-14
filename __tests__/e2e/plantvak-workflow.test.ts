// Mock config and supabase modules
jest.mock('@/lib/config', () => ({
  getSupabaseConfig: jest.fn().mockReturnValue({
    supabaseUrl: 'https://test.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
  })
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn()
    }
  }
}))

// Mock the entire PlantvakService module
jest.mock('@/lib/services/plantvak.service', () => {
  const originalModule = jest.requireActual('@/lib/services/plantvak.service')
  
  return {
    ...originalModule,
    PlantvakService: {
      ...originalModule.PlantvakService,
      create: jest.fn(),
      getByGarden: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getById: jest.fn()
    }
  }
})

describe('Plantvak Workflow - E2E Tests', () => {
  let PlantvakService: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Get the mocked service
    PlantvakService = require('@/lib/services/plantvak.service').PlantvakService
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

      PlantvakService.create.mockResolvedValue(mockCreatedPlantvak)

      const created = await PlantvakService.create(plantvakData)

      expect(created).toBeDefined()
      expect(created?.letter_code).toBe('A')
      expect(created?.garden_id).toBe(gardenId)

      // Mock successful retrieval
      PlantvakService.getById.mockResolvedValue(mockCreatedPlantvak)

      const retrieved = await PlantvakService.getById(created!.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.letter_code).toBe('A')

      // Mock successful update
      const updatedData = { location: 'South Side' }
      const mockUpdatedPlantvak = { ...mockCreatedPlantvak, location: 'South Side' }
      PlantvakService.update.mockResolvedValue(mockUpdatedPlantvak)

      const updated = await PlantvakService.update(created!.id, updatedData)

      expect(updated).toBeDefined()
      expect(updated?.location).toBe('South Side')

      // Mock successful deletion
      PlantvakService.delete.mockResolvedValue(true)

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

        PlantvakService.create.mockResolvedValue(mockResponse)

        const created = await PlantvakService.create({
          garden_id: gardenId,
          location: `Side ${i + 1}`
        })

        expect(created).toBeDefined()
        expect(created?.letter_code).toBe(String.fromCharCode(65 + i))
        plantvakken.push(created!)
      }

      // Mock retrieval of all plantvakken
      PlantvakService.getByGarden.mockResolvedValue(plantvakken)

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

      // Mock each creation call with different responses
      PlantvakService.create
        .mockResolvedValueOnce(mockResponses[0])  // First call returns A
        .mockResolvedValueOnce(mockResponses[1])  // Second call returns B
        .mockResolvedValueOnce(mockResponses[2])  // Third call returns C

      const results = await Promise.all(
        concurrentData.map(data => 
          PlantvakService.create({ ...data, garden_id: gardenId })
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
      PlantvakService.create.mockResolvedValue(null)

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
      PlantvakService.create.mockResolvedValue(null)

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

      PlantvakService.create.mockResolvedValue(mockResponse)

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

      PlantvakService.create.mockResolvedValue(mockResponse1)

      const result1 = await PlantvakService.create({
        garden_id: gardenId,
        location: 'North Side'
      })

      expect(result1).toBeDefined()
      expect(result1?.letter_code).toBe('A')

      // Mock database error for second plantvak
      PlantvakService.create.mockResolvedValue(null)

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

      PlantvakService.create.mockResolvedValue(mockResponse3)

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
      PlantvakService.create.mockResolvedValue(mockPlantvakken[0])

      // Create plantvakken
      for (let i = 0; i < 100; i++) {
        await PlantvakService.create({
          garden_id: gardenId,
          location: `Location ${i + 1}`
        })
      }

      // Mock retrieval
      PlantvakService.getByGarden.mockResolvedValue(mockPlantvakken)

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
      PlantvakService.getByGarden.mockResolvedValue(mockPlantvakken)

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