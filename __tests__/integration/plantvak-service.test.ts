import { PlantvakService } from '@/lib/services/plantvak.service'

// Mock Supabase client
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

describe('PlantvakService - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Service Integration', () => {
    test('should create plantvak with automatic letter code', async () => {
      const mockPlantvakData = {
        garden_id: 'test-garden-123',
        location: 'North Side',
        size: '2x3m',
        soil_type: 'clay',
        sun_exposure: 'full-sun' as const,
        description: 'Test plantvak'
      }

      const mockResponse = {
        id: 'plantvak-123',
        garden_id: 'test-garden-123',
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

      // Mock successful creation
      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().single.mockResolvedValue({ data: [], error: null })
      supabase.from().insert().select().single.mockResolvedValue({ data: mockResponse, error: null })

      const result = await PlantvakService.create(mockPlantvakData)

      expect(result).toBeDefined()
      expect(result?.letter_code).toBe('A')
      expect(result?.name).toBe('A')
      expect(result?.garden_id).toBe('test-garden-123')
    })

    test('should handle database errors gracefully', async () => {
      const mockPlantvakData = {
        garden_id: 'test-garden-123',
        location: 'North Side'
      }

      // Mock database error
      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().single.mockResolvedValue({ data: [], error: null })
      supabase.from().insert().select().single.mockRejectedValue(new Error('Database connection failed'))

      const result = await PlantvakService.create(mockPlantvakData)

      expect(result).toBeNull()
    })

    test('should retrieve plantvakken by garden', async () => {
      const gardenId = 'test-garden-123'
      const mockPlantvakken = [
        {
          id: 'plantvak-1',
          garden_id: gardenId,
          name: 'A',
          letter_code: 'A',
          location: 'North Side',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'plantvak-2',
          garden_id: gardenId,
          name: 'B',
          letter_code: 'B',
          location: 'South Side',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      // Mock successful retrieval
      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().order().limit().mockResolvedValue({ data: mockPlantvakken, error: null })

      const result = await PlantvakService.getByGarden(gardenId)

      expect(result).toEqual(mockPlantvakken)
      expect(result).toHaveLength(2)
      expect(result[0].letter_code).toBe('A')
      expect(result[1].letter_code).toBe('B')
    })

    test('should update plantvak successfully', async () => {
      const plantvakId = 'plantvak-123'
      const updateData = {
        location: 'Updated Location',
        size: '3x4m',
        soil_type: 'sand'
      }

      const mockUpdatedPlantvak = {
        id: plantvakId,
        garden_id: 'test-garden-123',
        name: 'A',
        letter_code: 'A',
        location: 'Updated Location',
        size: '3x4m',
        soil_type: 'sand',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // Mock successful update
      const supabase = require('@/lib/supabase').supabase
      supabase.from().update().eq().select().single.mockResolvedValue({ data: mockUpdatedPlantvak, error: null })

      const result = await PlantvakService.update(plantvakId, updateData)

      expect(result).toEqual(mockUpdatedPlantvak)
      expect(result?.location).toBe('Updated Location')
      expect(result?.size).toBe('3x4m')
      expect(result?.soil_type).toBe('sand')
    })

    test('should delete plantvak successfully', async () => {
      const plantvakId = 'plantvak-123'

      // Mock successful deletion
      const supabase = require('@/lib/supabase').supabase
      supabase.from().delete().eq().mockResolvedValue({ data: null, error: null })

      const result = await PlantvakService.delete(plantvakId)

      expect(result).toBe(true)
    })
  })

  describe('Business Logic Integration', () => {
    test('should maintain letter code uniqueness within garden', async () => {
      const gardenId = 'test-garden-123'
      const existingPlantvakken = [
        { letter_code: 'A' },
        { letter_code: 'B' },
        { letter_code: 'C' }
      ]

      // Mock existing plantvakken
      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().order().limit().mockResolvedValue({ data: existingPlantvakken, error: null })

      const mockResponse = {
        id: 'plantvak-4',
        garden_id: gardenId,
        name: 'D',
        letter_code: 'D',
        location: 'East Side',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      supabase.from().insert().select().single.mockResolvedValue({ data: mockResponse, error: null })

      const result = await PlantvakService.create({
        garden_id: gardenId,
        location: 'East Side'
      })

      expect(result?.letter_code).toBe('D')
      expect(existingPlantvakken.map(p => p.letter_code)).not.toContain('D')
    })

    test('should handle concurrent plantvak creation', async () => {
      const gardenId = 'test-garden-123'
      const concurrentCreations = []

      // Mock concurrent operations
      const supabase = require('@/lib/supabase').supabase
      supabase.from().select().eq().order().limit().mockResolvedValue({ data: [], error: null })

      for (let i = 0; i < 5; i++) {
        const mockResponse = {
          id: `plantvak-${i}`,
          garden_id: gardenId,
          name: String.fromCharCode(65 + i),
          letter_code: String.fromCharCode(65 + i),
          location: `Location ${i}`,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        supabase.from().insert().select().single.mockResolvedValue({ data: mockResponse, error: null })

        concurrentCreations.push(
          PlantvakService.create({
            garden_id: gardenId,
            location: `Location ${i}`
          })
        )
      }

      const results = await Promise.all(concurrentCreations)

      expect(results).toHaveLength(5)
      results.forEach((result, index) => {
        expect(result?.letter_code).toBe(String.fromCharCode(65 + index))
      })
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle missing garden_id gracefully', async () => {
      const mockPlantvakData = {
        garden_id: '',
        location: 'North Side'
      }

      const result = await PlantvakService.create(mockPlantvakData)

      expect(result).toBeNull()
    })

    test('should handle invalid plantvak data', async () => {
      const mockPlantvakData = {
        garden_id: 'test-garden-123',
        location: '',
        size: 'invalid-size',
        soil_type: 'invalid-soil'
      }

      const result = await PlantvakService.create(mockPlantvakData)

      expect(result).toBeNull()
    })
  })
})