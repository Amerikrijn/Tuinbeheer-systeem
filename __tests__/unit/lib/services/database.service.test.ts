import { TuinService, DatabaseError, ValidationError, NotFoundError } from '@/lib/services/database.service'
import { supabase } from '@/lib/supabase'
import { databaseLogger, AuditLogger, PerformanceLogger } from '@/lib/logger'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
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
    })),
  },
}))

jest.mock('@/lib/logger', () => ({
  databaseLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
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

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: mockGardens,
              error: null,
              count: 2,
            }),
          }),
        }),
      })

      const result = await TuinService.getAll()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        data: mockGardens,
        count: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      })
      expect(supabase.from).toHaveBeenCalledWith('gardens')
      expect(AuditLogger.logDataAccess).toHaveBeenCalledWith(
        null,
        'READ',
        'gardens',
        undefined,
        expect.any(Object)
      )
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'PGRST301', message: 'Database error' }
      
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
              count: 0,
            }),
          }),
        }),
      })

      const result = await TuinService.getAll()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch gardens')
      expect(result.data).toBeNull()
    })

    it('should apply search filters correctly', async () => {
      const mockGardens = [{ ...global.testUtils.mockGarden }]
      const filters = { query: 'test garden' }

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          or: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            order: jest.fn().mockReturnValue({
              ...mockSupabaseChain,
              range: jest.fn().mockResolvedValue({
                data: mockGardens,
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      })

      const result = await TuinService.getAll(filters)

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.or).toHaveBeenCalledWith(
        'name.ilike.%test garden%,description.ilike.%test garden%,location.ilike.%test garden%'
      )
    })

    it('should validate pagination parameters', async () => {
      const mockGardens = [{ ...global.testUtils.mockGarden }]

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: mockGardens,
              error: null,
              count: 1,
            }),
          }),
        }),
      })

      // Test with invalid pagination (should be corrected)
      const result = await TuinService.getAll(undefined, undefined, -1, 200)

      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(1) // Corrected from -1
      expect(result.data?.page_size).toBe(100) // Corrected from 200 (max allowed)
    })
  })

  describe('getById', () => {
    it('should successfully fetch garden by ID', async () => {
      const mockGarden = { ...global.testUtils.mockGarden }

      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          eq: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            single: jest.fn().mockResolvedValue({
              data: mockGarden,
              error: null,
            }),
          }),
        }),
      })

      const result = await TuinService.getById('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGarden)
      expect(AuditLogger.logDataAccess).toHaveBeenCalledWith(null, 'READ', 'gardens', '1')
    })

    it('should handle not found error', async () => {
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          eq: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      })

      const result = await TuinService.getById('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden with ID nonexistent not found')
    })

    it('should validate ID parameter', async () => {
      const result = await TuinService.getById('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden ID is required')
    })

    it('should validate ID parameter with null', async () => {
      const result = await TuinService.getById(null as any)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden ID is required')
    })
  })

  describe('create', () => {
    it('should successfully create a garden', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
        description: 'A test garden',
      }
      const createdGarden = { ...global.testUtils.mockGarden, ...newGarden }

      mockSupabaseChain.insert.mockReturnValue({
        ...mockSupabaseChain,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          single: jest.fn().mockResolvedValue({
            data: createdGarden,
            error: null,
          }),
        }),
      })

      const result = await TuinService.create(newGarden)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdGarden)
      expect(AuditLogger.logUserAction).toHaveBeenCalledWith(
        null,
        'CREATE',
        'gardens',
        createdGarden.id,
        { name: createdGarden.name }
      )
    })

    it('should validate required fields - name', async () => {
      const invalidGarden = {
        name: '',
        location: 'Test Location',
      }

      const result = await TuinService.create(invalidGarden)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden name is required')
    })

    it('should validate required fields - location', async () => {
      const invalidGarden = {
        name: 'Test Garden',
        location: '',
      }

      const result = await TuinService.create(invalidGarden)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden location is required')
    })

    it('should trim whitespace from inputs', async () => {
      const newGarden = {
        name: '  New Garden  ',
        location: '  Test Location  ',
      }
      const createdGarden = {
        ...global.testUtils.mockGarden,
        name: 'New Garden',
        location: 'Test Location',
      }

      mockSupabaseChain.insert.mockReturnValue({
        ...mockSupabaseChain,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          single: jest.fn().mockResolvedValue({
            data: createdGarden,
            error: null,
          }),
        }),
      })

      const result = await TuinService.create(newGarden)

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Garden',
          location: 'Test Location',
          is_active: true,
        })
      )
    })

    it('should handle database errors', async () => {
      const newGarden = {
        name: 'New Garden',
        location: 'Test Location',
      }
      const mockError = { code: 'PGRST301', message: 'Database error' }

      mockSupabaseChain.insert.mockReturnValue({
        ...mockSupabaseChain,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      })

      const result = await TuinService.create(newGarden)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create garden')
    })
  })

  describe('update', () => {
    it('should successfully update a garden', async () => {
      const updates = { name: 'Updated Garden' }
      const updatedGarden = { ...global.testUtils.mockGarden, ...updates }

      // Mock getById to return existing garden
      mockSupabaseChain.select.mockReturnValueOnce({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          eq: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            single: jest.fn().mockResolvedValue({
              data: global.testUtils.mockGarden,
              error: null,
            }),
          }),
        }),
      })

      // Mock update
      mockSupabaseChain.update.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          eq: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            select: jest.fn().mockReturnValue({
              ...mockSupabaseChain,
              single: jest.fn().mockResolvedValue({
                data: updatedGarden,
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await TuinService.update('1', updates)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedGarden)
      expect(AuditLogger.logUserAction).toHaveBeenCalledWith(
        null,
        'UPDATE',
        'gardens',
        '1',
        updates
      )
    })

    it('should validate empty name updates', async () => {
      const result = await TuinService.update('1', { name: '' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden name cannot be empty')
    })

    it('should validate empty location updates', async () => {
      const result = await TuinService.update('1', { location: '' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden location cannot be empty')
    })

    it('should handle non-existent garden', async () => {
      // Mock getById to return not found
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          eq: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      })

      const result = await TuinService.update('nonexistent', { name: 'Updated' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden with ID nonexistent not found')
    })
  })

  describe('delete', () => {
    it('should successfully soft delete a garden', async () => {
      // Mock getById to return existing garden
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          eq: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            single: jest.fn().mockResolvedValue({
              data: global.testUtils.mockGarden,
              error: null,
            }),
          }),
        }),
      })

      // Mock update for soft delete
      mockSupabaseChain.update.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      const result = await TuinService.delete('1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(AuditLogger.logUserAction).toHaveBeenCalledWith(
        null,
        'DELETE',
        'gardens',
        '1'
      )
      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
        })
      )
    })

    it('should handle non-existent garden', async () => {
      // Mock getById to return not found
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          eq: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      })

      const result = await TuinService.delete('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Garden with ID nonexistent not found')
    })

    it('should validate ID parameter', async () => {
      const result = await TuinService.delete('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Garden ID is required')
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      mockSupabaseChain.select.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await TuinService.getAll()

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
      expect(databaseLogger.error).toHaveBeenCalled()
    })
  })

  describe('Performance Monitoring', () => {
    it('should track performance metrics', async () => {
      mockSupabaseChain.select.mockReturnValue({
        ...mockSupabaseChain,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseChain,
          order: jest.fn().mockReturnValue({
            ...mockSupabaseChain,
            range: jest.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      })

      await TuinService.getAll()

      expect(PerformanceLogger.startTimer).toHaveBeenCalled()
      expect(PerformanceLogger.endTimer).toHaveBeenCalledWith(
        expect.any(String),
        'TuinService.getAll',
        expect.any(Object)
      )
    })
  })
})