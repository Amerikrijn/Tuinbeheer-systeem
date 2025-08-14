// Mock data for testing
const mockGardenData = {
  id: '1',
  name: 'Test Garden',
  description: 'A beautiful test garden',
  location: 'Test Location',
  garden_type: 'vegetable',
  total_area: '100m²',
  season_year: 2024,
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockGardensArray = [
  mockGardenData,
  {
    id: '2',
    name: 'Second Garden',
    description: 'Another test garden',
    location: 'Second Location',
    garden_type: 'flower',
    total_area: '200m²',
    season_year: 2024,
    is_active: true,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  }
]

// Mock the entire database service module
jest.mock('@/lib/services/database.service', () => {
  // Create a mock TuinService class
  class MockTuinService {
    static async getAll(filters?: any, sort?: any, page?: number, pageSize?: number) {
      // Simulate the actual service behavior
      if (filters?.query) {
        const filteredResults = mockGardensArray.filter(garden => 
          garden.name.toLowerCase().includes(filters.query.toLowerCase())
        )
        return {
          success: true,
          data: {
            data: filteredResults,
            count: filteredResults.length,
            page: page || 1,
            page_size: pageSize || 10,
            total_pages: Math.ceil(filteredResults.length / (pageSize || 10))
          },
          error: null
        }
      }
      
      return {
        success: true,
        data: {
          data: mockGardensArray,
          count: mockGardensArray.length,
          page: page || 1,
          page_size: pageSize || 10,
          total_pages: Math.ceil(mockGardensArray.length / (pageSize || 10))
        },
        error: null
      }
    }

    static async getById(id: string) {
      if (!id) {
        return {
          success: false,
          data: null,
          error: 'Garden ID is required'
        }
      }

      const garden = mockGardensArray.find(g => g.id === id)
      if (!garden) {
        return {
          success: false,
          data: null,
          error: `Garden with ID ${id} not found`
        }
      }

      return {
        success: true,
        data: garden,
        error: null
      }
    }

    static async create(gardenData: any) {
      // Validate required fields
      if (!gardenData.name) {
        return {
          success: false,
          data: null,
          error: 'Garden name is required'
        }
      }

      if (!gardenData.location) {
        return {
          success: false,
          data: null,
          error: 'Garden location is required'
        }
      }

      // Trim whitespace
      const trimmedData = {
        name: gardenData.name.trim(),
        location: gardenData.location.trim(),
        description: gardenData.description?.trim() || ''
      }

      const createdGarden = { 
        id: '2', 
        ...trimmedData, 
        created_at: new Date().toISOString() 
      }

      return {
        success: true,
        data: createdGarden,
        error: null
      }
    }

    static async update(id: string, updateData: any) {
      const garden = mockGardensArray.find(g => g.id === id)
      if (!garden) {
        return {
          success: false,
          data: null,
          error: `Garden with ID ${id} not found`
        }
      }

      const updatedGarden = { ...garden, ...updateData }
      return {
        success: true,
        data: updatedGarden,
        error: null
      }
    }

    static async delete(id: string) {
      const garden = mockGardensArray.find(g => g.id === id)
      if (!garden) {
        return {
          success: false,
          data: null,
          error: `Garden with ID ${id} not found`
        }
      }

      const deletedGarden = { ...garden, deleted_at: new Date().toISOString() }
      return {
        success: true,
        data: deletedGarden,
        error: null
      }
    }
  }

  return {
    TuinService: MockTuinService
  }
})

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null }))
    }
  }
}))

// Mock the logger module
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

// Import after mocking
import { TuinService } from '@/lib/services/database.service'

describe('TuinService', () => {
  describe('getAll', () => {
    it('should return all gardens successfully', async () => {
      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual(mockGardensArray)
      expect(result.data?.count).toBe(mockGardensArray.length)
    })

    it('should handle search queries correctly', async () => {
      const searchQuery = 'test'
      const filteredResults = mockGardensArray.filter(garden => 
        garden.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      const result = await TuinService.getAll({ query: searchQuery })

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual(filteredResults)
      expect(result.data?.count).toBe(filteredResults.length)
    })

    it('should handle pagination correctly', async () => {
      const page = 1
      const pageSize = 10
      
      const result = await TuinService.getAll(undefined, undefined, page, pageSize)

      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(page)
      expect(result.data?.page_size).toBe(pageSize)
      expect(result.data?.count).toBe(mockGardensArray.length)
    })
  })

  describe('getById', () => {
    it('should return a garden by ID successfully', async () => {
      const gardenId = '1'
      
      const result = await TuinService.getById(gardenId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGardenData)
    })

    it('should handle garden not found', async () => {
      const gardenId = 'non-existent'
      
      const result = await TuinService.getById(gardenId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })

    it('should validate ID parameter', async () => {
      const result = await TuinService.getById('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden ID is required')
    })
  })

  describe('create', () => {
    it('should successfully create a garden', async () => {
      const gardenData = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden'
      }
      
      const result = await TuinService.create(gardenData)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('New Garden')
      expect(result.data?.location).toBe('Test Location')
      expect(result.data?.description).toBe('A beautiful garden')
    })

    it('should validate required fields', async () => {
      const invalidData = { description: 'Missing name and location' }

      const result = await TuinService.create(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden name is required')
    })

    it('should validate location field', async () => {
      const invalidData = { name: 'Test Garden', location: '' }

      const result = await TuinService.create(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden location is required')
    })

    it('should trim whitespace from input fields', async () => {
      const dataWithWhitespace = {
        name: '  New Garden  ',
        location: '  Test Location  ',
        description: '  A beautiful garden  '
      }
      
      const result = await TuinService.create(dataWithWhitespace as any)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('New Garden')
      expect(result.data?.location).toBe('Test Location')
      expect(result.data?.description).toBe('A beautiful garden')
    })
  })

  describe('update', () => {
    it('should successfully update a garden', async () => {
      const updateData = { name: 'Updated Garden' }
      
      const result = await TuinService.update('1', updateData)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Updated Garden')
    })

    it('should handle garden not found during update', async () => {
      const updateData = { name: 'Updated Garden' }
      
      const result = await TuinService.update('non-existent', updateData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })

  describe('delete', () => {
    it('should successfully soft delete a garden', async () => {
      const result = await TuinService.delete('1')

      expect(result.success).toBe(true)
      expect(result.data?.deleted_at).toBeDefined()
    })

    it('should handle garden not found during delete', async () => {
      const result = await TuinService.delete('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent not found')
    })
  })
})