import { validateGardenAccess, validateMultipleGardenAccess, filterAccessibleGardens, getUserAccessibleGardens, User } from '@/lib/security/garden-access'

describe('Garden Access Security', () => {
  let mockUser: User
  let mockAdmin: User

  beforeEach(() => {
    // Reset console mocks to use the global mocked versions
    (console.log as jest.Mock).mockClear()
    ;(console.error as jest.Mock).mockClear()
    ;(console.warn as jest.Mock).mockClear()

    mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
      garden_access: ['garden-1', 'garden-2']
    }

    mockAdmin = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'admin',
      garden_access: ['garden-1']
    }
  })

  afterEach(() => {
    // Clear console mocks but don't restore them
    (console.log as jest.Mock).mockClear()
    ;(console.error as jest.Mock).mockClear()
    ;(console.warn as jest.Mock).mockClear()
  })

  describe('validateGardenAccess', () => {
    it('should return false when user is null', () => {
      const result = validateGardenAccess(null, 'garden-1')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: validateGardenAccess called without user')
    })

    it('should return false when user is undefined', () => {
      const result = validateGardenAccess(undefined as any, 'garden-1')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: validateGardenAccess called without user')
    })

    it('should grant admin access to any garden', () => {
      const result = validateGardenAccess(mockAdmin, 'garden-999')

      expect(result).toBe(true)
      expect(console.log).toHaveBeenCalledWith('✅ SECURITY: Admin access granted for garden:', 'garden-999')
    })

    it('should grant user access to authorized garden', () => {
      const result = validateGardenAccess(mockUser, 'garden-1')

      expect(result).toBe(true)
      expect(console.log).toHaveBeenCalledWith('✅ SECURITY: User access granted for garden:', { 
        user: 'user@example.com', 
        garden: 'garden-1' 
      })
    })

    it('should deny user access to unauthorized garden', () => {
      const result = validateGardenAccess(mockUser, 'garden-999')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: User attempted to access unauthorized garden:', {
        user: 'user@example.com',
        requestedGarden: 'garden-999',
        allowedGardens: ['garden-1', 'garden-2']
      })
    })

    it('should handle user with empty garden access', () => {
      const userWithNoAccess = { ...mockUser, garden_access: [] }
      const result = validateGardenAccess(userWithNoAccess, 'garden-1')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: User attempted to access unauthorized garden:', {
        user: 'user@example.com',
        requestedGarden: 'garden-1',
        allowedGardens: []
      })
    })

    it('should handle user with undefined garden access', () => {
      const userWithUndefinedAccess = { ...mockUser, garden_access: undefined }
      const result = validateGardenAccess(userWithUndefinedAccess, 'garden-1')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: User attempted to access unauthorized garden:', {
        user: 'user@example.com',
        requestedGarden: 'garden-1',
        allowedGardens: undefined
      })
    })
  })

  describe('validateMultipleGardenAccess', () => {
    it('should return false when user is null', () => {
      const result = validateMultipleGardenAccess(null, ['garden-1', 'garden-2'])

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: validateMultipleGardenAccess called without user')
    })

    it('should return false when user is undefined', () => {
      const result = validateMultipleGardenAccess(undefined as any, ['garden-1', 'garden-2'])

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: validateMultipleGardenAccess called without user')
    })

    it('should grant admin access to multiple gardens', () => {
      const result = validateMultipleGardenAccess(mockAdmin, ['garden-1', 'garden-999', 'garden-888'])

      expect(result).toBe(true)
    })

    it('should grant user access to all authorized gardens', () => {
      const result = validateMultipleGardenAccess(mockUser, ['garden-1', 'garden-2'])

      expect(result).toBe(true)
    })

    it('should deny user access when any garden is unauthorized', () => {
      const result = validateMultipleGardenAccess(mockUser, ['garden-1', 'garden-999'])

      expect(result).toBe(false)
    })

    it('should deny user access when all gardens are unauthorized', () => {
      const result = validateMultipleGardenAccess(mockUser, ['garden-999', 'garden-888'])

      expect(result).toBe(false)
    })

    it('should handle empty garden list', () => {
      const result = validateMultipleGardenAccess(mockUser, [])

      expect(result).toBe(true)
    })

    it('should handle single garden access check', () => {
      const result = validateMultipleGardenAccess(mockUser, ['garden-1'])

      expect(result).toBe(true)
    })
  })

  describe('filterAccessibleGardens', () => {
    it('should return empty array when user is null', () => {
      const result = filterAccessibleGardens(null, ['garden-1', 'garden-2'])

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: filterAccessibleGardens called without user')
    })

    it('should return empty array when user is undefined', () => {
      const result = filterAccessibleGardens(undefined as any, ['garden-1', 'garden-2'])

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('🚨 SECURITY VIOLATION: filterAccessibleGardens called without user')
    })

    it('should return all gardens for admin', () => {
      const result = filterAccessibleGardens(mockAdmin, ['garden-1', 'garden-999', 'garden-888'])

      expect(result).toEqual(['garden-1', 'garden-999', 'garden-888'])
      // Admin users don't get logged - they get direct access to all gardens
      expect(console.log).not.toHaveBeenCalled()
    })

    it('should return only accessible gardens for user', () => {
      const result = filterAccessibleGardens(mockUser, ['garden-1', 'garden-2', 'garden-999'])

      expect(result).toEqual(['garden-1', 'garden-2'])
      expect(console.log).toHaveBeenCalledWith('🔍 SECURITY: Filtered gardens for user:', {
        user: 'user@example.com',
        requested: ['garden-1', 'garden-2', 'garden-999'],
        accessible: ['garden-1', 'garden-2'],
        userAccess: ['garden-1', 'garden-2']
      })
    })

    it('should return empty array when user has no access to any gardens', () => {
      const result = filterAccessibleGardens(mockUser, ['garden-999', 'garden-888'])

      expect(result).toEqual([])
      expect(console.log).toHaveBeenCalledWith('🔍 SECURITY: Filtered gardens for user:', {
        user: 'user@example.com',
        requested: ['garden-999', 'garden-888'],
        accessible: [],
        userAccess: ['garden-1', 'garden-2']
      })
    })

    it('should handle empty garden list', () => {
      const result = filterAccessibleGardens(mockUser, [])

      expect(result).toEqual([])
      expect(console.log).toHaveBeenCalledWith('🔍 SECURITY: Filtered gardens for user:', {
        user: 'user@example.com',
        requested: [],
        accessible: [],
        userAccess: ['garden-1', 'garden-2']
      })
    })

    it('should handle user with empty garden access', () => {
      const userWithNoAccess = { ...mockUser, garden_access: [] }
      const result = filterAccessibleGardens(userWithNoAccess, ['garden-1', 'garden-2'])

      expect(result).toEqual([])
    })

    it('should handle user with undefined garden access', () => {
      const userWithUndefinedAccess = { ...mockUser, garden_access: undefined }
      const result = filterAccessibleGardens(userWithUndefinedAccess, ['garden-1', 'garden-2'])

      expect(result).toEqual([])
    })
  })

  describe('getUserAccessibleGardens', () => {
    it('should return empty array when user is null', () => {
      const result = getUserAccessibleGardens(null)

      expect(result).toEqual([])
      expect(console.warn).toHaveBeenCalledWith('⚠️ SECURITY: getUserAccessibleGardens called without user')
    })

    it('should return empty array when user is undefined', () => {
      const result = getUserAccessibleGardens(undefined as any)

      expect(result).toEqual([])
      expect(console.warn).toHaveBeenCalledWith('⚠️ SECURITY: getUserAccessibleGardens called without user')
    })

    it('should return empty array for admin (indicating access to all gardens)', () => {
      const result = getUserAccessibleGardens(mockAdmin)

      expect(result).toEqual([])
    })

    it('should return user garden access list for regular user', () => {
      const result = getUserAccessibleGardens(mockUser)

      expect(result).toEqual(['garden-1', 'garden-2'])
    })

    it('should return empty array for user with no garden access', () => {
      const userWithNoAccess = { ...mockUser, garden_access: [] }
      const result = getUserAccessibleGardens(userWithNoAccess)

      expect(result).toEqual([])
    })

    it('should return empty array for user with undefined garden access', () => {
      const userWithUndefinedAccess = { ...mockUser, garden_access: undefined }
      const result = getUserAccessibleGardens(userWithUndefinedAccess)

      expect(result).toEqual([])
    })
  })

  describe('Security Edge Cases', () => {
    it('should handle malformed user object gracefully', () => {
      const malformedUser = { id: 'user-1' } as any
      
      expect(validateGardenAccess(malformedUser, 'garden-1')).toBe(false)
      expect(validateMultipleGardenAccess(malformedUser, ['garden-1'])).toBe(false)
      expect(filterAccessibleGardens(malformedUser, ['garden-1'])).toEqual([])
      expect(getUserAccessibleGardens(malformedUser)).toEqual([])
    })

    it('should handle user with null garden access', () => {
      const userWithNullAccess = { ...mockUser, garden_access: null as any }
      
      expect(validateGardenAccess(userWithNullAccess, 'garden-1')).toBe(false)
      expect(validateMultipleGardenAccess(userWithNullAccess, ['garden-1'])).toBe(false)
      expect(filterAccessibleGardens(userWithNullAccess, ['garden-1'])).toEqual([])
      expect(getUserAccessibleGardens(userWithNullAccess)).toEqual([])
    })

    it('should handle very long garden IDs', () => {
      const longGardenId = 'garden-' + 'a'.repeat(1000)
      const userWithLongGarden = { ...mockUser, garden_access: [longGardenId] }
      
      expect(validateGardenAccess(userWithLongGarden, longGardenId)).toBe(true)
      expect(validateGardenAccess(userWithLongGarden, 'garden-1')).toBe(false)
    })

    it('should handle special characters in garden IDs', () => {
      const specialGardenId = 'garden-!@#$%^&*()_+-=[]{}|;:,.<>?'
      const userWithSpecialGarden = { ...mockUser, garden_access: [specialGardenId] }
      
      expect(validateGardenAccess(userWithSpecialGarden, specialGardenId)).toBe(true)
      expect(validateGardenAccess(userWithSpecialGarden, 'garden-1')).toBe(false)
    })
  })
})