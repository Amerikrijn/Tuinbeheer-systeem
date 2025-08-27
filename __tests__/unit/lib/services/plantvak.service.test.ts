import { PlantvakService } from '@/lib/services/plantvak.service'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: {
                      id: 'test-id',
                      garden_id: 'test-garden-id',
                      name: 'A',
                      letter_code: 'A',
                      location: 'Test location',
                      size: '2x3',
                      soil_type: 'klei',
                      sun_exposure: 'full-sun',
                      description: 'Test description',
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    },
                    error: null
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}))

describe('PlantvakService', () => {
  describe('generateNextLetterCode', () => {
    it('should generate A for first plantvak', () => {
      const existingCodes = []
      const result = PlantvakService.generateNextLetterCode(existingCodes)
      expect(result).toBe('A')
    })

    it('should generate B for second plantvak', () => {
      const existingCodes = ['A']
      const result = PlantvakService.generateNextLetterCode(existingCodes)
      expect(result).toBe('B')
    })

    it('should generate Z for 26th plantvak', () => {
      const existingCodes = 'ABCDEFGHIJKLMNOPQRSTUVWXY'.split('')
      const result = PlantvakService.generateNextLetterCode(existingCodes)
      expect(result).toBe('Z')
    })

    it('should generate A1 for 27th plantvak', () => {
      const existingCodes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      const result = PlantvakService.generateNextLetterCode(existingCodes)
      expect(result).toBe('A1')
    })

    it('should generate A2 for 28th plantvak', () => {
      const existingCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'A1']
      const result = PlantvakService.generateNextLetterCode(existingCodes)
      expect(result).toBe('A2')
    })

    it('should handle gaps in sequence', () => {
      const existingCodes = ['A', 'C', 'E']
      const result = PlantvakService.generateNextLetterCode(existingCodes)
      expect(result).toBe('B')
    })
  })

  describe('getByGarden', () => {
    it('should return empty array when no plantvakken exist', async () => {
      // Mock empty response
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      })

      const result = await PlantvakService.getByGarden('test-garden-id')
      expect(result).toEqual([])
    })
  })

  describe('create', () => {
    it('should create plantvak with automatic letter code', async () => {
      const plantvakData = {
        garden_id: 'test-garden-id',
        location: 'Test location',
        size: '2x3',
        soil_type: 'klei',
        sun_exposure: 'full-sun',
        description: 'Test description'
      }

      const result = await PlantvakService.create(plantvakData)
      
      expect(result).toBeTruthy()
      expect(result.letter_code).toBe('A')
      expect(result.name).toBe('A')
      expect(result.garden_id).toBe('test-garden-id')
      expect(result.location).toBe('Test location')
    })

    it('should throw error when garden_id is missing', async () => {
      const plantvakData = {
        garden_id: '',
        location: 'Test location'
      }

      await expect(PlantvakService.create(plantvakData)).rejects.toThrow('Garden ID is required')
    })
  })
})