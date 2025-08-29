import { renderHook, act } from '@testing-library/react'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import React from 'react'

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
    const mockAuth = {
      user: { id: '123' },
      signOut: jest.fn(async () => {}),
    }

    const { result } = renderHook(() => useActivityTimeout(mockAuth))
    
    // Verify the hook returns the expected functions
    expect(result.current).toBeDefined()
    expect(typeof result.current.resetTimeout).toBe('function')
    expect(typeof result.current.clearTimeouts).toBe('function')
  })

  it('returns undefined when auth is not available', () => {
    const { result } = renderHook(() => useActivityTimeout(null))
    
    // When auth is not available, the hook should return undefined
    expect(result.current).toBeUndefined()
  })

  it('returns undefined when user is not available', () => {
    const mockAuth = {
      user: null,
      signOut: jest.fn(),
    }

    const { result } = renderHook(() => useActivityTimeout(mockAuth))
    
    // When user is not available, the hook should return undefined
    expect(result.current).toBeUndefined()
  })

  it('returns undefined when signOut is not available', () => {
    const mockAuth = {
      user: { id: '123' },
      signOut: null,
    }

    const { result } = renderHook(() => useActivityTimeout(mockAuth))
    
    // When signOut is not available, the hook should return undefined
    expect(result.current).toBeUndefined()
  })
})
