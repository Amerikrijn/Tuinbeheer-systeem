import { TuinService } from '@/lib/services/database.service'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock logger to avoid console output during tests
jest.mock('@/lib/logger', () => ({
  databaseLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
  },
  AuditLogger: {
    logDataAccess: jest.fn(),
    logUserAction: jest.fn(),
  },
  PerformanceLogger: {
    startTimer: jest.fn(),
    endTimer: jest.fn(),
  },
}))

describe('TuinService', () => {
  const mockSupabaseChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain)
  })

  describe('getAll', () => {
    it('should successfully fetch all gardens with pagination', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Garden 1' },
        { ...global.testUtils.mockGarden, id: '2', name: 'Garden 2' },
      ]

      // Mock connection validation (select('count').limit(1))
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      // Mock data query
      mockSupabaseChain.range.mockResolvedValue({
        data: mockGardens,
        error: null,
        count: 2,
      })

      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data?.data).toHaveLength(2)
      expect(result.data?.count).toBe(2)
      expect(result.data?.page).toBe(1)
      expect(result.data?.page_size).toBe(10)
    })

    it('should handle pagination correctly', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '6', name: 'Garden 6' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({
        data: mockGardens,
        error: null,
        count: 10,
      })

      const result = await TuinService.getAll(undefined, undefined, 2, 5)

      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(2)
      expect(result.data?.page_size).toBe(5)
      expect(mockSupabaseChain.range).toHaveBeenCalledWith(5, 9) // (page-1) * pageSize, page * pageSize - 1
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      
      // Mock connection validation to fail
      mockSupabaseChain.limit.mockResolvedValue({ error: mockError })

      const result = await TuinService.getAll()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unable to connect to database')
    }, 10000) // Increase timeout

    it('should return empty results when no gardens found', async () => {
      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data?.data).toHaveLength(0)
      expect(result.data?.count).toBe(0)
    })

    it('should apply search filters correctly', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Test Garden' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({
        data: mockGardens,
        error: null,
        count: 1,
      })

      const filters = { query: 'test garden' }
      const result = await TuinService.getAll(filters)

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.or).toHaveBeenCalledWith(
        'name.ilike.%test garden%,description.ilike.%test garden%,location.ilike.%test garden%'
      )
    })

    it('should apply sorting correctly', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Garden A' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({
        data: mockGardens,
        error: null,
        count: 1,
      })

      const sort = { field: 'name', direction: 'asc' as const }
      const result = await TuinService.getAll(undefined, sort)

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.order).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('should limit page size to maximum allowed', async () => {
      const mockGardens = [
        { ...global.testUtils.mockGarden, id: '1', name: 'Garden 1' },
      ]

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.range.mockResolvedValue({
        data: mockGardens,
        error: null,
        count: 1,
      })

      const result = await TuinService.getAll(undefined, undefined, 1, 1000)

      expect(result.success).toBe(true)
      expect(result.data?.page_size).toBe(100) // Should be limited to max
    })
  })

  describe('getById', () => {
    it('should successfully fetch a garden by ID', async () => {
      const mockGarden = { ...global.testUtils.mockGarden, id: 'test-id' }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: mockGarden,
        error: null,
      })

      const result = await TuinService.getById('test-id')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGarden)
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', 'test-id')
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('should handle garden not found', async () => {
      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await TuinService.getById('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent-id not found')
    })

    it('should handle database errors', async () => {
      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST301', message: 'Database error' },
      })

      const result = await TuinService.getById('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch garden')
    })

    it('should validate ID parameter', async () => {
      const result = await TuinService.getById('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden ID is required and must be a non-empty string')
    })
  })

  describe('create', () => {
    it('should successfully create a garden', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden',
        total_area: '100m²',
        garden_type: 'vegetable',
      }

      const createdGarden = {
        ...newGarden,
        id: 'new-id',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
      }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      // Mock insert operation
      mockSupabaseChain.single.mockResolvedValue({
        data: createdGarden,
        error: null,
      })

      const result = await TuinService.create(newGarden)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdGarden)
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New Garden',
          location: 'Test Location',
          is_active: true,
        })
      ])
    })

    it('should validate required fields', async () => {
      const invalidGarden = {
        name: '',
        location: 'Test Location',
      }

      const result = await TuinService.create(invalidGarden as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden name is required')
    })

    it('should validate location field', async () => {
      const invalidGarden = {
        name: 'Test Garden',
        location: '',
      }

      const result = await TuinService.create(invalidGarden as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden location is required')
    })

    it('should trim whitespace from input fields', async () => {
      const newGarden = {
        name: '  New Garden  ',
        location: '  Test Location  ',
        description: '  A beautiful garden  ',
      }

      const createdGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A beautiful garden',
        id: 'new-id',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
      }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: createdGarden,
        error: null,
      })

      const result = await TuinService.create(newGarden as any)

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New Garden',
          location: 'Test Location',
          description: 'A beautiful garden',
        })
      ])
    })

    it('should handle database errors', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
      }

      // Mock connection validation to fail
      mockSupabaseChain.limit.mockResolvedValue({ 
        error: { code: 'PGRST301', message: 'Database error' } 
      })

      const result = await TuinService.create(newGarden as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unable to connect to database')
    }, 10000) // Increase timeout

    it('should handle unique constraint violations', async () => {
      const newGarden = {
        name: 'Duplicate Garden',
        location: 'Test Location',
      }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      })

      const result = await TuinService.create(newGarden as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create garden')
    })
  })

  describe('update', () => {
    it('should successfully update a garden', async () => {
      const updateData = {
        name: 'Updated Garden',
        description: 'Updated description',
      }

      const updatedGarden = {
        ...global.testUtils.mockGarden,
        ...updateData,
        updated_at: '2023-01-01T00:00:00Z',
      }

      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: updatedGarden,
        error: null,
      })

      const result = await TuinService.update('test-id', updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedGarden)
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', 'test-id')
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('should handle garden not found during update', async () => {
      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await TuinService.update('non-existent-id', { name: 'Updated' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent-id not found')
    })
  })

  describe('delete', () => {
    it('should successfully soft delete a garden', async () => {
      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: { ...global.testUtils.mockGarden, is_active: false },
        error: null,
      })

      const result = await TuinService.delete('test-id')

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.update).toHaveBeenCalledWith({ is_active: false })
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', 'test-id')
    })

    it('should handle garden not found during delete', async () => {
      // Mock connection validation
      mockSupabaseChain.limit.mockResolvedValueOnce({ error: null })
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await TuinService.delete('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden with ID non-existent-id not found')
    })
  })
})