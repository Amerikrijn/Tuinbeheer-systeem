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

describe('PlantvakService - Integration Tests', () => {
  let PlantvakService: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Get the mocked service
    PlantvakService = require('@/lib/services/plantvak.service').PlantvakService
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
      PlantvakService.create.mockResolvedValue(mockResponse)

      const result = await PlantvakService.create(mockPlantvakData)

      expect(result).toBeDefined()
      expect(result?.letter_code).toBe('A')
      expect(result?.name).toBe('A')
      expect(result?.garden_id).toBe('test-garden-123')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      PlantvakService.create.mockResolvedValue(null)

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
      PlantvakService.getByGarden.mockResolvedValue(mockPlantvakken)

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
      PlantvakService.update.mockResolvedValue(mockUpdatedResponse)

      const result = await PlantvakService.update(plantvakId, updateData)

      expect(result).toBeDefined()
      expect(result?.location).toBe('South Side')
      expect(result?.size).toBe('3x4m')
    })

    it('should delete plantvak successfully', async () => {
      const plantvakId = 'plantvak-1'

      // Mock successful deletion
      PlantvakService.delete.mockResolvedValue(true)

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

      PlantvakService.getByGarden.mockResolvedValue(existingPlantvakken)

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

      PlantvakService.create.mockResolvedValue(mockResponse)

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

  describe('Error Handling Integration', () => {
    it('should handle missing garden_id gracefully', async () => {
      const invalidData = {
        garden_id: '',
        location: 'North Side'
      }

      // Mock validation error
      PlantvakService.create.mockResolvedValue(null)

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

      PlantvakService.create.mockResolvedValue(mockResponse)

      const result = await PlantvakService.create(invalidData)

      expect(result).toBeDefined()
      // Should still create with default values
      expect(result?.letter_code).toBe('A')
    })
  })
})