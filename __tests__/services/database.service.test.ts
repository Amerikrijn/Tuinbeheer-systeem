import { TuinService, PlantvakService, BloemService, BloemendatabaseService } from '../../lib/services/database.service'
import { supabase } from '../../lib/supabase'
import type { Tuin, Plantvak, Bloem } from '../../lib/types'

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Database Service Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the connection validation to succeed by default
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as any)
  })

  describe('TuinService', () => {
    const mockTuin: Tuin = {
      id: 'test-garden-1',
      name: 'Test Garden',
      description: 'A test garden',
      location: 'Test Location',
      total_area: '100m²',
      length: '10',
      width: '10',
      garden_type: 'vegetable',
      established_date: '2024-01-01',
      notes: 'Test notes',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    describe('getAll', () => {
      it('should return all active gardens successfully', async () => {
        const mockData = [mockTuin]
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        } as any)

        const result = await TuinService.getAll()

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
        expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
      })

      it('should handle database errors', async () => {
        const mockError = { code: 'TEST_ERROR', message: 'Test error' }
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            }),
          }),
        } as any)

        const result = await TuinService.getAll()

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Failed to fetch gardens')
      })

      it('should handle connection errors', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Connection failed')
        })

        const result = await TuinService.getAll()

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Unable to connect to database')
      })
    })

    describe('getById', () => {
      it('should return garden by ID successfully', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockTuin,
                  error: null,
                }),
              }),
            }),
          }),
        } as any)

        const result = await TuinService.getById('test-garden-1')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockTuin)
        expect(result.error).toBeNull()
      })

      it('should handle missing ID', async () => {
        const result = await TuinService.getById('')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Garden ID is required')
      })

      it('should handle not found error', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116', message: 'Not found' },
                }),
              }),
            }),
          }),
        } as any)

        const result = await TuinService.getById('nonexistent-id')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Garden not found')
      })
    })

    describe('create', () => {
      it('should create garden successfully', async () => {
        const newTuin = {
          name: 'New Garden',
          location: 'New Location',
          description: 'New description',
        }

        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...newTuin, id: 'new-garden-1', is_active: true },
                error: null,
              }),
            }),
          }),
        } as any)

        const result = await TuinService.create(newTuin as any)

        expect(result.success).toBe(true)
        expect(result.data).toMatchObject(newTuin)
        expect(result.error).toBeNull()
      })

      it('should handle missing required fields', async () => {
        const result = await TuinService.create({ name: '', location: '' } as any)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Name and location are required')
      })
    })

    describe('update', () => {
      it('should update garden successfully', async () => {
        const updates = { name: 'Updated Garden' }
        const updatedTuin = { ...mockTuin, ...updates }

        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: updatedTuin,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        } as any)

        const result = await TuinService.update('test-garden-1', updates)

        expect(result.success).toBe(true)
        expect(result.data).toMatchObject(updates)
        expect(result.error).toBeNull()
      })

      it('should handle missing ID', async () => {
        const result = await TuinService.update('', { name: 'Updated' })

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Garden ID is required')
      })
    })

    describe('delete', () => {
      it('should soft delete garden successfully', async () => {
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        } as any)

        const result = await TuinService.delete('test-garden-1')

        expect(result.success).toBe(true)
        expect(result.data).toBe(true)
        expect(result.error).toBeNull()
      })

      it('should handle missing ID', async () => {
        const result = await TuinService.delete('')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Garden ID is required')
      })
    })
  })

  describe('PlantvakService', () => {
    const mockPlantvak: Plantvak = {
      id: 'test-bed-1',
      garden_id: 'test-garden-1',
      name: 'Test Plant Bed',
      location: 'North Side',
      size: '2x3m',
      soil_type: 'clay',
      sun_exposure: 'full-sun',
      description: 'Test plant bed',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    describe('getByGardenId', () => {
      it('should return plant beds for garden successfully', async () => {
        const mockData = [mockPlantvak]
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockData,
                  error: null,
                }),
              }),
            }),
          }),
        } as any)

        const result = await PlantvakService.getByGardenId('test-garden-1')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
      })

      it('should handle missing garden ID', async () => {
        const result = await PlantvakService.getByGardenId('')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Garden ID is required')
      })
    })

    describe('getById', () => {
      it('should return plant bed by ID successfully', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockPlantvak,
                  error: null,
                }),
              }),
            }),
          }),
        } as any)

        const result = await PlantvakService.getById('test-bed-1')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockPlantvak)
        expect(result.error).toBeNull()
      })

      it('should handle missing ID', async () => {
        const result = await PlantvakService.getById('')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Plant bed ID is required')
      })
    })

    describe('create', () => {
      it('should create plant bed successfully', async () => {
        const newPlantvak = {
          garden_id: 'test-garden-1',
          name: 'New Plant Bed',
          location: 'South Side',
        }

        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...newPlantvak, id: 'new-bed-1', is_active: true },
                error: null,
              }),
            }),
          }),
        } as any)

        const result = await PlantvakService.create(newPlantvak as any)

        expect(result.success).toBe(true)
        expect(result.data).toMatchObject(newPlantvak)
        expect(result.error).toBeNull()
      })

      it('should handle missing required fields', async () => {
        const result = await PlantvakService.create({ name: '', garden_id: '' } as any)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Name and garden ID are required')
      })
    })
  })

  describe('BloemService', () => {
    const mockBloem: Bloem = {
      id: 'test-plant-1',
      plant_bed_id: 'test-bed-1',
      name: 'Test Plant',
      scientific_name: 'Testus plantus',
      variety: 'Test Variety',
      color: 'Red',
      height: 30,
      status: 'healthy',
      planting_date: '2024-01-01',
      notes: 'Test notes',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    describe('getByPlantvakId', () => {
      it('should return plants for plant bed successfully', async () => {
        const mockData = [mockBloem]
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        } as any)

        const result = await BloemService.getByPlantvakId('test-bed-1')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
      })

      it('should handle missing plant bed ID', async () => {
        const result = await BloemService.getByPlantvakId('')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Plant bed ID is required')
      })
    })

    describe('getById', () => {
      it('should return plant by ID successfully', async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockBloem,
                error: null,
              }),
            }),
          }),
        } as any)

        const result = await BloemService.getById('test-plant-1')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockBloem)
        expect(result.error).toBeNull()
      })

      it('should handle missing ID', async () => {
        const result = await BloemService.getById('')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Plant ID is required')
      })
    })

    describe('create', () => {
      it('should create plant successfully', async () => {
        const newBloem = {
          plant_bed_id: 'test-bed-1',
          name: 'New Plant',
          status: 'healthy' as const,
        }

        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...newBloem, id: 'new-plant-1' },
                error: null,
              }),
            }),
          }),
        } as any)

        const result = await BloemService.create(newBloem as any)

        expect(result.success).toBe(true)
        expect(result.data).toMatchObject(newBloem)
        expect(result.error).toBeNull()
      })

      it('should handle missing required fields', async () => {
        const result = await BloemService.create({ name: '', plant_bed_id: '' } as any)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Name and plant bed ID are required')
      })
    })

    describe('search', () => {
      it('should search plants with filters successfully', async () => {
        const mockData = [mockBloem]
        const mockCount = 1

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                range: jest.fn().mockResolvedValue({
                  data: mockData,
                  error: null,
                  count: mockCount,
                }),
              }),
            }),
          }),
        } as any)

        const result = await BloemService.search(
          { query: 'test' },
          { field: 'name', direction: 'asc' },
          1,
          10
        )

        expect(result.success).toBe(true)
        expect(result.data?.data).toEqual(mockData)
        expect(result.data?.count).toBe(mockCount)
        expect(result.data?.page).toBe(1)
        expect(result.data?.page_size).toBe(10)
        expect(result.error).toBeNull()
      })
    })
  })

  describe('BloemendatabaseService', () => {
    describe('getPopularFlowers', () => {
      it('should return popular flowers successfully', async () => {
        const mockData = [
          {
            name: 'Rose',
            scientific_name: 'Rosa',
            category: 'flower',
            color: 'Red',
            height: 50,
            bloom_period: 'Spring',
          },
        ]

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            not: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: mockData,
                  error: null,
                }),
              }),
            }),
          }),
        } as any)

        const result = await BloemendatabaseService.getPopularFlowers()

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeNull()
      })
    })

    describe('getStatistics', () => {
      it('should return statistics successfully', async () => {
        const mockCounts = [
          { count: 100 },
          { count: 10 },
          { count: 5 },
          { count: 2 },
        ]

        mockSupabase.from.mockImplementation((table) => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue(Promise.resolve(mockCounts.shift())),
            not: jest.fn().mockReturnValue(Promise.resolve(mockCounts.shift())),
          }),
        }))

        // Mock Promise.all to return our mock counts
        const originalPromiseAll = Promise.all
        Promise.all = jest.fn().mockResolvedValue(mockCounts)

        const result = await BloemendatabaseService.getStatistics()

        expect(result.success).toBe(true)
        expect(result.data).toEqual({
          total_plants: 100,
          total_categories: 10,
          total_plant_beds: 5,
          total_gardens: 2,
        })
        expect(result.error).toBeNull()

        // Restore Promise.all
        Promise.all = originalPromiseAll
      })
    })
  })
})