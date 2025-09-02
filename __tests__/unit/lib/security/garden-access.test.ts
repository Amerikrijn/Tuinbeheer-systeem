import { validateGardenAccess, validateMultipleGardenAccess, filterAccessibleGardens, getUserAccessibleGardens, User } from '@/lib/security/garden-access'

describe('Garden Access Security', () => {
  let mockUser: User
  let mockAdmin: User

  beforeEach(() => {
    jest.clearAllMocks()

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

  describe('validateGardenAccess', () => {
    it('should return false when user is null', () => {
      const result = validateGardenAccess(null, 'garden-1')
      expect(result).toBe(false)
    })

    it('should return false when user is undefined', () => {
      const result = validateGardenAccess(undefined as any, 'garden-1')
      expect(result).toBe(false)
    })

    it('should grant admin access to any garden', () => {
      const result = validateGardenAccess(mockAdmin, 'garden-999')
      expect(result).toBe(true)
    })

    it('should grant user access to authorized garden', () => {
      const result = validateGardenAccess(mockUser, 'garden-1')
      expect(result).toBe(true)
    })

    it('should deny user access to unauthorized garden', () => {
      const result = validateGardenAccess(mockUser, 'garden-999')
      expect(result).toBe(false)
    })

    it('should handle user with empty garden access', () => {
      const userWithNoAccess = { ...mockUser, garden_access: [] }
      const result = validateGardenAccess(userWithNoAccess, 'garden-1')
      expect(result).toBe(false)
    })

    it('should handle user with undefined garden access', () => {
      const userWithUndefinedAccess = { ...mockUser, garden_access: undefined as any }
      const result = validateGardenAccess(userWithUndefinedAccess, 'garden-1')
      expect(result).toBe(false)
    })
  })

  describe('validateMultipleGardenAccess', () => {
    it('should return false when user is null', () => {
      const result = validateMultipleGardenAccess(null, ['garden-1'])
      expect(result).toBe(false)
    })

    it('should return false when user is undefined', () => {
      const result = validateMultipleGardenAccess(undefined as any, ['garden-1'])
      expect(result).toBe(false)
    })

    it('should grant admin access to multiple gardens', () => {
      const result = validateMultipleGardenAccess(mockAdmin, ['garden-1', 'garden-999'])
      expect(result).toBe(true)
    })

    it('should grant user access to authorized gardens', () => {
      const result = validateMultipleGardenAccess(mockUser, ['garden-1', 'garden-2'])
      expect(result).toBe(true)
    })

    it('should deny user access when any garden is unauthorized', () => {
      const result = validateMultipleGardenAccess(mockUser, ['garden-1', 'garden-999'])
      expect(result).toBe(false)
    })

    it('should handle empty garden list', () => {
      const result = validateMultipleGardenAccess(mockUser, [])
      expect(result).toBe(true)
    })
  })

  describe('filterAccessibleGardens', () => {
    it('should return empty array when user is null', () => {
      const result = filterAccessibleGardens(null, ['garden-1'])
      expect(result).toEqual([])
    })

    it('should return empty array when user is undefined', () => {
      const result = filterAccessibleGardens(undefined as any, ['garden-1'])
      expect(result).toEqual([])
    })

    it('should return all gardens for admin', () => {
      const result = filterAccessibleGardens(mockAdmin, ['garden-1', 'garden-999'])
      expect(result).toEqual(['garden-1', 'garden-999'])
    })

    it('should return only accessible gardens for user', () => {
      const result = filterAccessibleGardens(mockUser, ['garden-1', 'garden-2', 'garden-999'])
      expect(result).toEqual(['garden-1', 'garden-2'])
    })

    it('should return empty array when user has no access to any gardens', () => {
      const result = filterAccessibleGardens(mockUser, ['garden-999', 'garden-888'])
      expect(result).toEqual([])
    })

    it('should handle empty garden list', () => {
      const result = filterAccessibleGardens(mockUser, [])
      expect(result).toEqual([])
    })
  })

  describe('getUserAccessibleGardens', () => {
    it('should return empty array when user is null', () => {
      const result = getUserAccessibleGardens(null)
      expect(result).toEqual([])
    })

    it('should return empty array when user is undefined', () => {
      const result = getUserAccessibleGardens(undefined as any)
      expect(result).toEqual([])
    })

    it('should return empty array for admin (indicating access to all gardens)', () => {
      const result = getUserAccessibleGardens(mockAdmin)
      expect(result).toEqual([])
    })

    it('should return user garden access for regular user', () => {
      const result = getUserAccessibleGardens(mockUser)
      expect(result).toEqual(['garden-1', 'garden-2'])
    })

    it('should handle user with empty garden access', () => {
      const userWithNoAccess = { ...mockUser, garden_access: [] }
      const result = getUserAccessibleGardens(userWithNoAccess)
      expect(result).toEqual([])
    })

    it('should handle user with undefined garden access', () => {
      const userWithUndefinedAccess = { ...mockUser, garden_access: undefined as any }
      const result = getUserAccessibleGardens(userWithUndefinedAccess)
      expect(result).toEqual([])
    })
  })
})