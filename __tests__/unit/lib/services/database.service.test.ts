import { TuinService } from '@/lib/services/database.service'
import { mockGardenData, mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    supabase: createMockSupabase()
  }
})

// Mock the logger module to avoid console output during tests
jest.mock('@/lib/logger', () => ({
  databaseLogger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  },
  AuditLogger: {
    logDataAccess: jest.fn(),
    logUserAction: jest.fn()
  },
  PerformanceLogger: {
    startTimer: jest.fn(),
    endTimer: jest.fn()
  }
}))

describe('TuinService', () => {
  let mockSupabase: any

  beforeEach(() => {
    // Get a fresh mock instance for each test
    const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
    mockSupabase = createMockSupabase()
    
    // Replace the mocked supabase with our fresh instance
    jest.doMock('@/lib/supabase', () => ({
      supabase: mockSupabase
    }))
    
    // Clear all mocks
    jest.clearAllMocks()
    
    // Reset the mock query builder
    mockSupabase.mockQueryBuilder.reset()
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
      const mockError = { code: 'PGRST116', message: 'Not found' }
      mockSupabase.mockQueryBuilder.setError(mockError)

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
      expect(result.error).toContain('Garden ID is required and must be a non-empty string')
    })
  })

  describe('create', () => {
    const gardenData = {
      name: 'New Garden',
      description: 'A beautiful garden',
      location: 'Test Location',
      garden_type: 'vegetable',
      total_area: '100m²',
      season_year: 2024
    }

    it('should successfully create a garden', async () => {
      const createdGarden = { ...gardenData, id: '1', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', is_active: true }
      mockSupabase.mockQueryBuilder.setData(createdGarden)

      const result = await TuinService.create(gardenData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdGarden)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should validate required fields', async () => {
      const invalidData = { ...gardenData, name: '' }

      const result = await TuinService.create(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden name is required')
    })

    it('should validate location field', async () => {
      const invalidData = { ...gardenData, location: '' }

      const result = await TuinService.create(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden location is required')
    })

    it('should trim whitespace from input fields', async () => {
      const dataWithWhitespace = {
        name: '  New Garden  ',
        description: '  A beautiful garden  ',
        location: '  Test Location  ',
        garden_type: 'vegetable',
        total_area: '100m²',
        season_year: 2024
      }
      const createdGarden = { ...dataWithWhitespace, id: '1', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', is_active: true }
      mockSupabase.mockQueryBuilder.setData(createdGarden)

      const result = await TuinService.create(dataWithWhitespace as any)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('New Garden')
      expect(result.data?.location).toBe('Test Location')
      expect(result.data?.description).toBe('A beautiful garden')
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      mockSupabase.mockQueryBuilder.setError(mockError)

      const result = await TuinService.create(gardenData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })
  })

  describe('update', () => {
    it('should successfully update a garden', async () => {
      const updateData = { name: 'Updated Garden', description: 'Updated description' }
      const updatedGarden = { ...mockGardenData, ...updateData, updated_at: '2023-01-02T00:00:00Z' }
      mockSupabase.mockQueryBuilder.setData(updatedGarden)

      const result = await TuinService.update('1', updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedGarden)
      expect(mockSupabase.from).toHaveBeenCalledWith('gardens')
    })

    it('should handle garden not found during update', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      mockSupabase.mockQueryBuilder.setError(mockError)

      const result = await TuinService.update('non-existent', { name: 'Updated' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })

  describe('delete', () => {
    it('should successfully soft delete a garden', async () => {
      const deletedGarden = { ...mockGardenData, is_active: false, updated_at: '2023-01-02T00:00:00Z' }
      mockSupabase.mockQueryBuilder.setData(deletedGarden)

      const result = await TuinService.delete('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(deletedGarden)
    })

    it('should handle garden not found during delete', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      mockSupabase.mockQueryBuilder.setError(mockError)

      const result = await TuinService.delete('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })
})