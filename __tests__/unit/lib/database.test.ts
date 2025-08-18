import { DatabaseService } from '@/lib/services/database.service'
import { getSupabaseClient } from '@/lib/supabase'
import * as database from '@/lib/database'

// Mock dependencies
jest.mock('@/lib/services/database.service')
jest.mock('@/lib/supabase')

const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe.skip('Database Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Garden Functions', () => {
    const mockGarden = {
      id: 'garden-1',
      name: 'Test Garden',
      description: 'Test Description',
      location: 'Test Location',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    describe('getGardens', () => {
      it('should fetch gardens successfully', async () => {
        mockDatabaseService.Tuin.getAll.mockResolvedValue({
          success: true,
          data: { data: [mockGarden] }
        })

        const result = await database.getGardens()

        expect(result).toEqual([mockGarden])
        expect(mockDatabaseService.Tuin.getAll).toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith('Fetching gardens...')
        expect(console.log).toHaveBeenCalledWith('Gardens fetched successfully:', 1)
      })

      it('should handle service failure', async () => {
        mockDatabaseService.Tuin.getAll.mockResolvedValue({
          success: false,
          error: 'Service error'
        })

        const result = await database.getGardens()

        expect(result).toEqual([])
        expect(console.error).toHaveBeenCalledWith('Error fetching gardens:', 'Service error')
      })

      it('should handle empty data', async () => {
        mockDatabaseService.Tuin.getAll.mockResolvedValue({
          success: true,
          data: { data: [] }
        })

        const result = await database.getGardens()

        expect(result).toEqual([])
        expect(console.log).toHaveBeenCalledWith('Gardens fetched successfully:', 0)
      })
    })

    describe('getGarden', () => {
      it('should fetch specific garden by ID', async () => {
        mockDatabaseService.Tuin.getById.mockResolvedValue({
          success: true,
          data: mockGarden
        })

        const result = await database.getGarden('garden-1')

        expect(result).toEqual(mockGarden)
        expect(mockDatabaseService.Tuin.getById).toHaveBeenCalledWith('garden-1')
      })

      it('should return first garden when no ID provided', async () => {
        mockDatabaseService.Tuin.getAll.mockResolvedValue({
          success: true,
          data: { data: [mockGarden] }
        })

        const result = await database.getGarden()

        expect(result).toEqual(mockGarden)
        expect(mockDatabaseService.Tuin.getAll).toHaveBeenCalled()
      })

      it('should handle service failure when fetching by ID', async () => {
        mockDatabaseService.Tuin.getById.mockResolvedValue({
          success: false,
          error: 'Service error'
        })

        const result = await database.getGarden('garden-1')

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error fetching garden:', 'Service error')
      })

      it('should handle empty gardens list when no ID provided', async () => {
        mockDatabaseService.Tuin.getAll.mockResolvedValue({
          success: true,
          data: { data: [] }
        })

        const result = await database.getGarden()

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error fetching default garden:', undefined)
      })
    })

    describe('createGarden', () => {
      const gardenData = {
        name: 'New Garden',
        description: 'New Description',
        location: 'New Location'
      }

      it('should create garden successfully', async () => {
        // Mock the table test
        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [{}], error: null })
          })
        } as any)

        // Mock the insert
        mockSupabase.from.mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockGarden, error: null })
            })
          })
        } as any)

        const result = await database.createGarden(gardenData)

        expect(result).toEqual(mockGarden)
        expect(console.log).toHaveBeenCalledWith('Creating garden with data:', gardenData)
        expect(console.log).toHaveBeenCalledWith('Table exists, proceeding with insert...')
        expect(console.log).toHaveBeenCalledWith('Garden created successfully:', mockGarden)
      })

      it('should handle missing table error', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: '42P01', message: 'Missing table' } 
            })
          })
        } as any)

        await expect(database.createGarden(gardenData)).rejects.toThrow(
          'Database tables not found. Please run the migration first.'
        )
        expect(console.error).toHaveBeenCalledWith('Table test failed:', { code: '42P01', message: 'Missing table' })
      })
    })
  })

  describe('Plant Functions', () => {
    const mockPlant = {
      id: 'plant-1',
      plant_bed_id: 'bed-1',
      name: 'Test Plant',
      color: 'red'
    }

    describe('getPlant', () => {
      it('should fetch plant by ID', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockPlant, error: null })
            })
          })
        } as any)

        const result = await database.getPlant('plant-1')

        expect(result).toEqual(mockPlant)
      })

      it('should handle fetch error', async () => {
        const fetchError = { message: 'Fetch failed' }
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: fetchError })
            })
          })
        } as any)

        const result = await database.getPlant('plant-1')

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error fetching plant:', fetchError)
      })
    })
  })

  describe('Visual Plant Designer Functions', () => {
    const mockPlantWithPosition = {
      id: 'plant-1',
      plant_bed_id: 'bed-1',
      name: 'Visual Plant',
      position_x: 100,
      position_y: 200,
      visual_width: 50,
      visual_height: 50,
      emoji: '🌱'
    }

    describe('getPlantsWithPositions', () => {
      it('should fetch plants with positions successfully', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [mockPlantWithPosition], error: null })
            })
          })
        } as any)

        const result = await database.getPlantsWithPositions('bed-1')

        expect(result).toEqual([mockPlantWithPosition])
      })

      it('should handle fetch error', async () => {
        const fetchError = { message: 'Fetch failed' }
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: null, error: fetchError })
            })
          })
        } as any)

        const result = await database.getPlantsWithPositions('bed-1')

        expect(result).toEqual([])
        expect(console.error).toHaveBeenCalledWith('Error fetching plants with positions:', fetchError)
      })

      it('should apply default values for missing position properties', async () => {
        const plantWithoutPosition = {
          id: 'plant-2',
          plant_bed_id: 'bed-1',
          name: 'Plant Without Position'
        }
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [plantWithoutPosition], error: null })
            })
          })
        } as any)

        const result = await database.getPlantsWithPositions('bed-1')

        expect(result[0]).toHaveProperty('position_x')
        expect(result[0]).toHaveProperty('position_y')
        expect(result[0]).toHaveProperty('visual_width', 40)
        expect(result[0]).toHaveProperty('visual_height', 40)
      })
    })
  })
})