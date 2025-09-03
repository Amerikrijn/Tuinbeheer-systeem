import { DatabaseService } from '@/lib/services/database.service'
import { getSupabaseClient } from '@/lib/supabase'
import * as database from '@/lib/database'

// Mock dependencies
jest.mock('@/lib/services/database.service')
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}))

const supabase = getSupabaseClient()
const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>
const mockSupabase = supabase as any

describe('Database Functions', () => {
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

  describe('Plant Bed Functions', () => {
    const mockPlantBed = {
      id: 'bed-1',
      garden_id: 'garden-1',
      name: 'Test Bed',
      location: 'North Side',
      size: '2x3m',
      soil_type: 'clay',
      sun_exposure: 'full-sun',
      description: 'A test plant bed'
    }

    describe('getPlantBeds', () => {
      it('should fetch plant beds successfully', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [mockPlantBed], error: null })
            })
          })
        } as any)

        const result = await database.getPlantBeds('garden-1')

        expect(result).toEqual([mockPlantBed])
        expect(console.log).toHaveBeenCalledWith('Fetching plant beds for garden:', 'garden-1')
      })

      it('should fetch all plant beds when no garden ID provided', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockPlantBed], error: null })
          })
        } as any)

        const result = await database.getPlantBeds()

        expect(result).toEqual([mockPlantBed])
        expect(console.log).toHaveBeenCalledWith('Fetching all plant beds...')
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

        const result = await database.getPlantBeds('garden-1')

        expect(result).toEqual([])
        expect(console.error).toHaveBeenCalledWith('Error fetching plant beds:', fetchError)
      })
    })

    describe('getPlantBed', () => {
      it('should fetch specific plant bed by ID', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockPlantBed, error: null })
            })
          })
        } as any)

        const result = await database.getPlantBed('bed-1')

        expect(result).toEqual(mockPlantBed)
        expect(console.log).toHaveBeenCalledWith('Fetching plant bed:', 'bed-1')
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

        const result = await database.getPlantBed('bed-1')

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error fetching plant bed:', fetchError)
      })
    })

    describe('createPlantBed', () => {
      const plantBedData = {
        garden_id: 'garden-1',
        name: 'New Bed',
        location: 'South Side',
        size: '3x4m',
        soil_type: 'sandy',
        sun_exposure: 'partial-sun' as const,
        description: 'A new plant bed'
      }

      it('should create plant bed successfully', async () => {
        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockPlantBed, error: null })
            })
          })
        } as any)

        const result = await database.createPlantBed(plantBedData)

        expect(result).toEqual(mockPlantBed)
        expect(console.log).toHaveBeenCalledWith('Creating plant bed with data:', plantBedData)
      })

      it('should handle creation error', async () => {
        const createError = { message: 'Creation failed' }
        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: createError })
            })
          })
        } as any)

        const result = await database.createPlantBed(plantBedData)

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error creating plant bed:', createError)
      })
    })

    describe('updatePlantBed', () => {
      const updates = { name: 'Updated Bed', description: 'Updated description' }

      it('should update plant bed successfully', async () => {
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { ...mockPlantBed, ...updates }, error: null })
              })
            })
          })
        } as any)

        const result = await database.updatePlantBed('bed-1', updates)

        expect(result).toEqual({ ...mockPlantBed, ...updates })
        expect(console.log).toHaveBeenCalledWith('Updating plant bed:', 'bed-1', updates)
      })

      it('should handle update error', async () => {
        const updateError = { message: 'Update failed' }
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: updateError })
              })
            })
          })
        } as any)

        const result = await database.updatePlantBed('bed-1', updates)

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error updating plant bed:', updateError)
      })
    })

    describe('deletePlantBed', () => {
      it('should delete plant bed successfully', async () => {
        mockSupabase.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        } as any)

        await database.deletePlantBed('bed-1')

        expect(console.log).toHaveBeenCalledWith('Deleting plant bed:', 'bed-1')
        expect(console.log).toHaveBeenCalledWith('Plant bed deleted successfully')
      })

      it('should handle delete error', async () => {
        const deleteError = { message: 'Delete failed' }
        mockSupabase.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: deleteError })
          })
        } as any)

        await database.deletePlantBed('bed-1')

        expect(console.error).toHaveBeenCalledWith('Error deleting plant bed:', deleteError)
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

    describe('createPlant', () => {
      const plantData = {
        plant_bed_id: 'bed-1',
        name: 'New Plant',
        color: 'blue',
        scientific_name: 'Plantus testus',
        variety: 'Test Variety'
      }

      it('should create plant successfully', async () => {
        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockPlant, error: null })
            })
          })
        } as any)

        const result = await database.createPlant(plantData)

        expect(result).toEqual(mockPlant)
        expect(console.log).toHaveBeenCalledWith('Creating plant with data:', plantData)
      })

      it('should handle creation error', async () => {
        const createError = { message: 'Creation failed' }
        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: createError })
            })
          })
        } as any)

        const result = await database.createPlant(plantData)

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error creating plant:', createError)
      })
    })

    describe('updatePlant', () => {
      const updates = { name: 'Updated Plant', color: 'green' }

      it('should update plant successfully', async () => {
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { ...mockPlant, ...updates }, error: null })
              })
            })
          })
        } as any)

        const result = await database.updatePlant('plant-1', updates)

        expect(result).toEqual({ ...mockPlant, ...updates })
        expect(console.log).toHaveBeenCalledWith('Updating plant:', 'plant-1', updates)
      })

      it('should handle update error', async () => {
        const updateError = { message: 'Update failed' }
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: updateError })
              })
            })
          })
        } as any)

        const result = await database.updatePlant('plant-1', updates)

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error updating plant:', updateError)
      })
    })

    describe('deletePlant', () => {
      it('should delete plant successfully', async () => {
        mockSupabase.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        } as any)

        await database.deletePlant('plant-1')

        expect(console.log).toHaveBeenCalledWith('Deleting plant:', 'plant-1')
        expect(console.log).toHaveBeenCalledWith('Plant deleted successfully')
      })

      it('should handle delete error', async () => {
        const deleteError = { message: 'Delete failed' }
        mockSupabase.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: deleteError })
          })
        } as any)

        await database.deletePlant('plant-1')

        expect(console.error).toHaveBeenCalledWith('Error deleting plant:', deleteError)
      })
    })

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

    describe('createVisualPlant', () => {
      const visualPlantData = {
        plant_bed_id: 'bed-1',
        name: 'Visual Plant',
        position_x: 100,
        position_y: 200,
        visual_width: 50,
        visual_height: 50,
        emoji: '🌱'
      }

      it('should create visual plant successfully', async () => {
        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockPlantWithPosition, error: null })
            })
          })
        } as any)

        const result = await database.createVisualPlant(visualPlantData)

        expect(result).toEqual(mockPlantWithPosition)
        expect(console.log).toHaveBeenCalledWith('Creating visual plant with data:', visualPlantData)
      })

      it('should handle creation error', async () => {
        const createError = { message: 'Creation failed' }
        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: createError })
            })
          })
        } as any)

        const result = await database.createVisualPlant(visualPlantData)

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error creating visual plant:', createError)
      })
    })

    describe('updatePlantPosition', () => {
      const positionUpdates = {
        position_x: 150,
        position_y: 250,
        visual_width: 60,
        visual_height: 60,
        rotation: 45,
        z_index: 2,
        color_code: '#FF0000'
      }

      it('should update plant position successfully', async () => {
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { ...mockPlantWithPosition, ...positionUpdates }, error: null })
              })
            })
          })
        } as any)

        const result = await database.updatePlantPosition('plant-1', positionUpdates)

        expect(result).toEqual({ ...mockPlantWithPosition, ...positionUpdates })
        expect(console.log).toHaveBeenCalledWith('Updating plant position:', 'plant-1', positionUpdates)
      })

      it('should handle update error', async () => {
        const updateError = { message: 'Update failed' }
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: updateError })
              })
            })
          })
        } as any)

        const result = await database.updatePlantPosition('plant-1', positionUpdates)

        expect(result).toBeNull()
        expect(console.error).toHaveBeenCalledWith('Error updating plant position:', updateError)
      })
    })
  })
})