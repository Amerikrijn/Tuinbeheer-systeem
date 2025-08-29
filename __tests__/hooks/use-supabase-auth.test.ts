import { renderHook, act, waitFor } from '@testing-library/react'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'

// Mock crypto before any imports that might use it
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  }
});

// Mock the entire supabase module to avoid crypto issues
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => mockSupabaseClient),
}))

import { useAuth, SupabaseAuthProvider } from '@/hooks/use-supabase-auth'
import { getSupabaseClient } from '@/lib/supabase'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
      from: jest.fn(),
}

const createFromMock = (user: any) => {
  const single = jest.fn().mockResolvedValue({ data: user, error: null })
  const query = {
          eq: jest.fn(),
    single,
  }
  query.eq.mockReturnValue(query)
  return {
    select: jest.fn().mockReturnValue(query),
  }
}

// Mock already defined above

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    consoleSpy.mockClear()
    jest.mocked(getSupabaseClient).mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })
    
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

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })

    mockSupabaseClient.from.mockReturnValue(createFromMock(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

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

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

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

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

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

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

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

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

    await act(async () => {
      await result.current.resetPassword('test@example.com')
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/auth/reset-password') })
      )
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

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: mockUser.id } } },
      error: null,
    })
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })
    mockSupabaseClient.from.mockReturnValue(createFromMock(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })

    // Test permission checks
    expect(result.current.hasPermission('read:garden')).toBe(true)
    expect(result.current.hasPermission('write:garden')).toBe(true)
    expect(result.current.hasPermission('admin:users')).toBe(true)
    expect(result.current.hasPermission('nonexistent:permission')).toBe(true)
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

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: mockUser.id } } },
      error: null,
    })
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })
    mockSupabaseClient.from.mockReturnValue(createFromMock(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })

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

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: mockUser.id } } },
      error: null,
    })
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })
    mockSupabaseClient.from.mockReturnValue(createFromMock(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })
    act(() => {
      if (result.current.user) {
        result.current.user.garden_access = ['garden-1', 'garden-3']
      }
    })

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

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: mockUser.id } } },
      error: null,
    })
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })
    mockSupabaseClient.from.mockReturnValue(createFromMock(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })
    act(() => {
      if (result.current.user) {
        result.current.user.garden_access = ['garden-1', 'garden-3']
      }
    })

    // Test getting accessible gardens
    const accessibleGardens = result.current.getAccessibleGardens()
    expect(accessibleGardens).toEqual(['garden-1', 'garden-3'])
  })

  it('should handle Supabase client initialization errors', () => {
    // Mock getSupabaseClient to throw an error
    jest.mocked(getSupabaseClient).mockImplementation(() => {
      throw new Error('Supabase client unavailable')
    })

    // This should not crash the hook
    expect(() => renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })).not.toThrow()
  })

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })

    // This should not crash the hook
    expect(() => renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })).not.toThrow()
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

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: mockUser.id } } },
      error: null,
    })
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })
    mockSupabaseClient.from.mockReturnValue(createFromMock(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })
    mockSupabaseClient.from.mockClear()

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

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: mockUser.id } } },
      error: null,
    })
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })
    mockSupabaseClient.from.mockReturnValue(createFromMock(mockUser))

    const { result } = renderHook(() => useAuth(), { wrapper: SupabaseAuthProvider })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })
    mockSupabaseClient.from.mockClear()

    await act(async () => {
      await result.current.forceRefreshUser()
    })

    // Should call the database to force refresh user data
    expect(mockSupabaseClient.from).toHaveBeenCalled()
  })
})