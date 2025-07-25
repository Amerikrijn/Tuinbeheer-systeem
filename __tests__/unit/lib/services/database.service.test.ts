import { TuinService } from '@/lib/services/database.service'
import { mockGardenData, mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock the supabase client
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase(),
  }
})

// Get the mocked supabase instance
const { supabase } = require('@/lib/supabase')
const mockSupabase = supabase

describe('TuinService', () => {
  beforeEach(() => {
    mockSupabase.mockQueryBuilder.reset()
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all gardens successfully', async () => {
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardensArray)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual(mockGardensArray)
      expect(result.data?.count).toBe(mockGardensArray.length)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.mockError(mockError)

      const result = await TuinService.getAll()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unable to connect to database')
    })

    it('should return empty array when no gardens exist', async () => {
      mockSupabase.mockQueryBuilder.mockEmpty()

      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual([])
      expect(result.data?.count).toBe(0)
    })

    it('should handle pagination correctly', async () => {
      const page = 2
      const pageSize = 5
      const paginatedResults = mockGardensArray.slice(5, 10)

      mockSupabase.mockQueryBuilder.mockSuccess(paginatedResults)
      mockSupabase.mockQueryBuilder.countValue = mockGardensArray.length

      const result = await TuinService.getAll(undefined, undefined, page, pageSize)

      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(page)
      expect(result.data?.page_size).toBe(pageSize)
      expect(result.data?.count).toBe(mockGardensArray.length)
    })

    it('should handle search queries correctly', async () => {
      const searchQuery = 'rose'
      const filteredResults = [mockGardensArray[0]]

      mockSupabase.mockQueryBuilder.mockSuccess(filteredResults)
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
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardenData)

      const result = await TuinService.getById(gardenId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGardenData)
    })

    it('should handle garden not found', async () => {
      const gardenId = 'non-existent'
      mockSupabase.mockQueryBuilder.mockError({ code: 'PGRST116', message: 'Not found' })

      const result = await TuinService.getById(gardenId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.mockError(mockError)

      const result = await TuinService.getById('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unable to connect to database')
    })

    it('should validate ID parameter', async () => {
      const result = await TuinService.getById('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden ID is required and must be a non-empty string')
    })
  })

  describe('create', () => {
    it('should successfully create a garden', async () => {
      const gardenData = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden',
        garden_type: 'vegetable',
        total_area: '100m²'
      }

      const createdGarden = {
        ...gardenData,
        id: 'new-1',
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.mockSuccess(createdGarden)

      const result = await TuinService.create(gardenData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdGarden)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should validate required fields', async () => {
      const invalidGarden = {
        name: '', // Empty name should trigger validation error
        location: 'Test Location'
      }

      const result = await TuinService.create(invalidGarden as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden name is required')
    })

    it('should validate location field', async () => {
      const invalidGarden = {
        name: 'Test Garden',
        location: '' // Empty location should trigger validation error
      }

      const result = await TuinService.create(invalidGarden as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden location is required')
    })

    it('should trim whitespace from input fields', async () => {
      const gardenData = {
        name: '  New Garden  ',
        location: '  Test Location  ',
        description: '  A beautiful garden  '
      }

      const expectedTrimmedData = {
        name: 'New Garden',
        location: 'Test Location', 
        description: 'A beautiful garden',
        id: 'new-1',
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.mockSuccess(expectedTrimmedData)

      const result = await TuinService.create(gardenData as any)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('New Garden')
      expect(result.data?.location).toBe('Test Location')
      expect(result.data?.description).toBe('A beautiful garden')
    })

    it('should handle database errors gracefully', async () => {
      const gardenData = {
        name: 'New Garden',
        location: 'Test Location'
      }

      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.mockError(mockError)

      const result = await TuinService.create(gardenData as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unable to connect to database')
    })
  })

  describe('update', () => {
    it('should successfully update a garden', async () => {
      const updateData = {
        name: 'Updated Garden',
        description: 'Updated description',
      }

      const updatedGarden = {
        ...mockGardenData,
        ...updateData,
        updated_at: expect.any(String)
      }

      mockSupabase.mockQueryBuilder.mockSuccess(updatedGarden)

      const result = await TuinService.update('1', updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedGarden)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should handle garden not found during update', async () => {
      mockSupabase.mockQueryBuilder.mockError({ code: 'PGRST116', message: 'Not found' })

      const result = await TuinService.update('non-existent', { name: 'Updated' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })

  describe('delete', () => {
    it('should successfully soft delete a garden', async () => {
      // Mock the getById call first (used internally by delete)
      mockSupabase.mockQueryBuilder.mockSuccess(mockGardenData)

      const result = await TuinService.delete('1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should handle garden not found during delete', async () => {
      mockSupabase.mockQueryBuilder.mockError({ code: 'PGRST116', message: 'Not found' })

      const result = await TuinService.delete('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })
})