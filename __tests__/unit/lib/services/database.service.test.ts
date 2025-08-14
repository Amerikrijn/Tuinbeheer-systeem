import { TuinService } from '@/lib/services/database.service'
import { mockGardenData, mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase()
  }
})

describe('TuinService', () => {
  let mockSupabase: unknown

  beforeEach(() => {
    // Get a fresh mock instance for each test
    const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
    mockSupabase = createMockSupabase() as any;
    
    // Replace the mocked supabase with our fresh instance
    jest.doMock('@/lib/supabase', () => ({
      supabase: mockSupabase
    }))
    
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all gardens successfully', async () => {
      // Mock successful response
      mockSupabase.mockQueryBuilder.setData(mockGardensArray)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual(mockGardensArray)
      expect(result.data?.count).toBe(mockGardensArray.length)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.setError(mockError)

      const result = await TuinService.getAll()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })

    it('should return empty array when no gardens exist', async () => {
      // Mock empty response
      mockSupabase.mockQueryBuilder.setData([])
      mockSupabase.mockQueryBuilder.countValue = 0

      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual([])
      expect(result.data?.count).toBe(0)
    })

    it('should handle pagination correctly', async () => {
      const page = 2
      const pageSize = 5
      const paginatedResults = mockGardensArray.slice(5, 10)
      
      mockSupabase.mockQueryBuilder.setData(paginatedResults)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const result = await TuinService.getAll(undefined, undefined, page, pageSize)

      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(page)
      expect(result.data?.page_size).toBe(pageSize)
      expect(result.data?.count).toBe(mockGardensArray.length)
    })

    it('should handle search queries correctly', async () => {
      const searchQuery = 'Test'
      const filteredResults = [mockGardensArray[0]]
      
      mockSupabase.mockQueryBuilder.setData(filteredResults)
      mockSupabase.mockQueryBuilder.countValue = filteredResults.length

      const result = await TuinService.getAll({ query: searchQuery })

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual(filteredResults)
      expect(result.data?.count).toBe(filteredResults.length)
    })
  })

  describe('getById', () => {
    it('should return a garden by ID successfully', async () => {
      const gardenId = '1'
      mockSupabase.mockQueryBuilder.setData(mockGardenData)

      const result = await TuinService.getById(gardenId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGardenData)
    })

    it('should handle garden not found', async () => {
      const gardenId = 'non-existent'
      mockSupabase.mockQueryBuilder.setError({ code: 'PGRST116', message: 'Not found' })

      const result = await TuinService.getById(gardenId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.setError(mockError)

      const result = await TuinService.getById('1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })

    it('should validate ID parameter', async () => {
      const result = await TuinService.getById('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid garden ID')
    })
  })

  describe('create', () => {
    it('should successfully create a garden', async () => {
      const gardenData = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden',
        garden_type: 'vegetable' as const,
        total_area: '100m²',
        season_year: 2024
      }

      const createdGarden = {
        ...gardenData,
        id: 'new-1',
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.setData(createdGarden)

      const result = await TuinService.create(gardenData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdGarden)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        location: 'Test Location'
      }

      const result = await TuinService.create(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Name is required')
    })

    it('should validate location field', async () => {
      const invalidData = {
        name: 'Test Garden',
        location: ''
      }

      const result = await TuinService.create(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Location is required')
    })

    it('should trim whitespace from input fields', async () => {
      const gardenData = {
        name: '  New Garden  ',
        location: '  Test Location  ',
        description: '  A beautiful garden  ',
        garden_type: 'vegetable' as const,
        total_area: '100m²',
        season_year: 2024
      }

      const expectedTrimmedData = {
        ...gardenData,
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden',
        id: 'new-1',
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.setData(expectedTrimmedData)

      const result = await TuinService.create(gardenData as any)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('New Garden')
      expect(result.data?.location).toBe('Test Location')
      expect(result.data?.description).toBe('A beautiful garden')
    })

    it('should handle database errors gracefully', async () => {
      const gardenData = {
        name: 'New Garden',
        location: 'Test Location',
        garden_type: 'vegetable' as const,
        total_area: '100m²',
        season_year: 2024
      }

      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.setError(mockError)

      const result = await TuinService.create(gardenData as any)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })
  })

  describe('update', () => {
    it('should successfully update a garden', async () => {
      const updateData = {
        name: 'Updated Garden',
        description: 'Updated description'
      }

      const updatedGarden = {
        ...mockGardenData,
        ...updateData,
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.setData(updatedGarden)

      const result = await TuinService.update('1', updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedGarden)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should handle garden not found during update', async () => {
      mockSupabase.mockQueryBuilder.setError({ code: 'PGRST116', message: 'Not found' })

      const result = await TuinService.update('non-existent', { name: 'Updated' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })

  describe('delete', () => {
    it('should successfully soft delete a garden', async () => {
      // Mock the getById call first (used internally by delete)
      mockSupabase.mockQueryBuilder.setData(mockGardenData)

      const result = await TuinService.delete('1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should handle garden not found during delete', async () => {
      mockSupabase.mockQueryBuilder.setError({ code: 'PGRST116', message: 'Not found' })

      const result = await TuinService.delete('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })
})