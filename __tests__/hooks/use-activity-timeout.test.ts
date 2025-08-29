import { renderHook, act } from '@testing-library/react'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import React from 'react'

// Mock the hooks before importing the component
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: '123' },
    signOut: jest.fn(async () => {}),
  })),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))

// Import after mocking
import { useActivityTimeout } from '@/hooks/use-activity-timeout'

describe('useActivityTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('returns functions when auth is available', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    // Verify the hook returns the expected functions
    expect(result.current).toBeDefined()
    expect(typeof result.current.resetTimeout).toBe('function')
    expect(typeof result.current.clearTimeouts).toBe('function')
  })

  it('returns undefined when auth is not available', () => {
    // Mock useAuth to return undefined to simulate auth not being available
    const mockUseAuth = require('@/hooks/use-supabase-auth').useAuth
    mockUseAuth.mockImplementationOnce(() => undefined)

    const { result } = renderHook(() => useActivityTimeout())
    
    // When auth is not available, the hook should return undefined
    expect(result.current).toBeUndefined()
    
    // Restore the original mock
    mockUseAuth.mockRestore()
  })

  it('returns undefined when user is not available', () => {
    // Mock useAuth to return auth without user
    const mockUseAuth = require('@/hooks/use-supabase-auth').useAuth
    mockUseAuth.mockImplementationOnce(() => ({
      user: null,
      signOut: jest.fn(),
    }))

    const { result } = renderHook(() => useActivityTimeout())
    
    // When user is not available, the hook should return undefined
    expect(result.current).toBeUndefined()
    
    // Restore the original mock
    mockUseAuth.mockRestore()
  })

  it('returns undefined when signOut is not available', () => {
    // Mock useAuth to return auth without signOut
    const mockUseAuth = require('@/hooks/use-supabase-auth').useAuth
    mockUseAuth.mockImplementationOnce(() => ({
      user: { id: '123' },
      signOut: null,
    }))

    const { result } = renderHook(() => useActivityTimeout())
    
    // When signOut is not available, the hook should return undefined
    expect(result.current).toBeUndefined()
    
    // Restore the original mock
    mockUseAuth.mockRestore()
  })
})
