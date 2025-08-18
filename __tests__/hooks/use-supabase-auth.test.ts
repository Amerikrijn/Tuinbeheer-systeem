import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAuth } from '@/hooks/use-supabase-auth'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(),
}

// Mock the getSupabaseClient function
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    consoleSpy.mockClear()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should handle signIn successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user' as const,
      status: 'active' as const,
      permissions: ['read:garden'],
      garden_access: ['garden-1'],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null,
    })

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should handle signIn errors', async () => {
    const errorMessage = 'Invalid credentials'
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: errorMessage },
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'wrongpassword')
      } catch (error) {
        // Expected to throw
      }
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
    })
  })

  it('should handle signOut successfully', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signOut()
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should handle signUp successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'new@example.com',
      role: 'user' as const,
      status: 'pending' as const,
      permissions: ['read:garden'],
      garden_access: [],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signUp('new@example.com', 'password123')
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })
    })
  })

  it('should handle resetPassword successfully', async () => {
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.resetPassword('test@example.com')
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('should check user permissions correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      role: 'admin' as const,
      status: 'active' as const,
      permissions: ['read:garden', 'write:garden', 'admin:users'],
      garden_access: ['garden-1', 'garden-2'],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth())

    // Mock the user state
    act(() => {
      // This would normally be set by the auth state change
      // For testing, we'll simulate it
    })

    // Test permission checks
    expect(result.current.hasPermission('read:garden')).toBe(true)
    expect(result.current.hasPermission('write:garden')).toBe(true)
    expect(result.current.hasPermission('admin:users')).toBe(true)
    expect(result.current.hasPermission('nonexistent:permission')).toBe(false)
  })

  it('should check admin status correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      role: 'admin' as const,
      status: 'active' as const,
      permissions: ['admin:users'],
      garden_access: ['garden-1'],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth())

    // Test admin check
    expect(result.current.isAdmin()).toBe(true)
  })

  it('should check garden access correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      role: 'user' as const,
      status: 'active' as const,
      permissions: ['read:garden'],
      garden_access: ['garden-1', 'garden-3'],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth())

    // Test garden access checks
    expect(result.current.hasGardenAccess('garden-1')).toBe(true)
    expect(result.current.hasGardenAccess('garden-3')).toBe(true)
    expect(result.current.hasGardenAccess('garden-2')).toBe(false)
  })

  it('should get accessible gardens correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      role: 'user' as const,
      status: 'active' as const,
      permissions: ['read:garden'],
      garden_access: ['garden-1', 'garden-3'],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth())

    // Test getting accessible gardens
    const accessibleGardens = result.current.getAccessibleGardens()
    expect(accessibleGardens).toEqual(['garden-1', 'garden-3'])
  })

  it('should handle Supabase client initialization errors', () => {
    // Mock getSupabaseClient to throw an error
    vi.mocked(require('@/lib/supabase').getSupabaseClient).mockImplementation(() => {
      throw new Error('Supabase client unavailable')
    })

    // This should not crash the hook
    expect(() => renderHook(() => useAuth())).not.toThrow()
  })

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })

    // This should not crash the hook
    expect(() => renderHook(() => useAuth())).not.toThrow()
  })

  it('should refresh user data correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user' as const,
      status: 'active' as const,
      permissions: ['read:garden'],
      garden_access: ['garden-1'],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.refreshUser()
    })

    // Should call the database to refresh user data
    expect(mockSupabaseClient.from).toHaveBeenCalled()
  })

  it('should force refresh user data correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user' as const,
      status: 'active' as const,
      permissions: ['read:garden'],
      garden_access: ['garden-1'],
      created_at: '2024-01-01T00:00:00Z',
    }

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.forceRefreshUser()
    })

    // Should call the database to force refresh user data
    expect(mockSupabaseClient.from).toHaveBeenCalled()
  })
})