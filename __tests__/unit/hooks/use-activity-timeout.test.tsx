import { renderHook, act } from '@testing-library/react'
import { useActivityTimeout } from '@/hooks/use-activity-timeout'

// Mock dependencies
const mockSignOut = jest.fn()
const mockUser = { id: '1', email: 'test@example.com' }
const mockToast = jest.fn()
const mockPush = jest.fn()

// Mock useAuth hook
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut
  })
}))

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock timers
jest.useFakeTimers()

describe('useActivityTimeout hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    
    // Reset Date.now to a fixed timestamp
    jest.spyOn(Date, 'now').mockReturnValue(1000000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('initializes with user and sets up timeouts', () => {
    renderHook(() => useActivityTimeout())
    
    // Should set up warning timeout (25 minutes) and logout timeout (30 minutes)
    expect(setTimeout).toHaveBeenCalledTimes(2)
  })

  it('shows warning after 25 minutes of inactivity', () => {
    renderHook(() => useActivityTimeout())
    
    // Fast forward to just before warning time (24 minutes 59 seconds)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000 - 1000)
    })
    
    expect(mockToast).not.toHaveBeenCalled()
    
    // Fast forward to warning time (25 minutes)
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Sessie verloopt binnenkort',
      description: 'Je wordt over 5 minuten automatisch uitgelogd vanwege inactiviteit'
    })
  })

  it('logs out user after 30 minutes of inactivity', async () => {
    renderHook(() => useActivityTimeout())
    
    // Fast forward to just before logout time (29 minutes 59 seconds)
    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000 - 1000)
    })
    
    expect(mockSignOut).not.toHaveBeenCalled()
    
    // Fast forward to logout time (30 minutes)
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Automatisch uitgelogd',
      description: 'Je bent automatisch uitgelogd vanwege inactiviteit',
      variant: 'destructive'
    })
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('resets timeout when user activity is detected', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    // Fast forward to 31 seconds (more than 30 seconds threshold)
    act(() => {
      jest.advanceTimersByTime(31000)
    })
    
    // Simulate user activity
    act(() => {
      result.current.handleActivity()
    })
    
    // Should clear existing timeouts and set new ones
    expect(clearTimeout).toHaveBeenCalled()
    expect(setTimeout).toHaveBeenCalledTimes(4) // 2 initial + 2 new
  })

  it('does not reset timeout for activity within 30 seconds', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    // Fast forward to 25 seconds (less than 30 seconds threshold)
    act(() => {
      jest.advanceTimersByTime(25000)
    })
    
    // Simulate user activity
    act(() => {
      result.current.handleActivity()
    })
    
    // Should not reset timeout
    expect(clearTimeout).not.toHaveBeenCalled()
    expect(setTimeout).toHaveBeenCalledTimes(2) // Only initial timeouts
  })

  it('handles signOut errors gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign out failed'))
    
    renderHook(() => useActivityTimeout())
    
    // Fast forward to logout time
    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000)
    })
    
    // Should still show toast and redirect even if signOut fails
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Automatisch uitgelogd',
      description: 'Je bent automatisch uitgelogd vanwege inactiviteit',
      variant: 'destructive'
    })
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('cleans up timeouts on unmount', () => {
    const { unmount } = renderHook(() => useActivityTimeout())
    
    unmount()
    
    expect(clearTimeout).toHaveBeenCalledTimes(2)
  })

  it('handles rapid activity events correctly', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    // Fast forward to 31 seconds
    act(() => {
      jest.advanceTimersByTime(31000)
    })
    
    // Simulate rapid activity events
    act(() => {
      result.current.handleActivity()
      result.current.handleActivity()
      result.current.handleActivity()
    })
    
    // Should only reset timeout once due to 30-second threshold
    expect(clearTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledTimes(4) // 2 initial + 2 new
  })

  it('maintains correct timeout durations', () => {
    renderHook(() => useActivityTimeout())
    
    // Check that warning timeout is set for 25 minutes (INACTIVITY_TIMEOUT - WARNING_TIME)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 25 * 60 * 1000)
    
    // Check that logout timeout is set for 30 minutes (INACTIVITY_TIMEOUT)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 30 * 60 * 1000)
  })

  it('handles multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useActivityTimeout())
    const { result: result2 } = renderHook(() => useActivityTimeout())
    
    // Fast forward to 31 seconds
    act(() => {
      jest.advanceTimersByTime(31000)
    })
    
    // Simulate activity on first hook
    act(() => {
      result1.current.handleActivity()
    })
    
    // Second hook should remain unchanged
    expect(setTimeout).toHaveBeenCalledTimes(6) // 4 for first hook + 2 for second hook
  })

  it('handles edge case timing scenarios', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    // Test exactly 30 seconds threshold
    act(() => {
      jest.advanceTimersByTime(30000)
    })
    
    // Should not reset timeout
    act(() => {
      result.current.handleActivity()
    })
    
    expect(clearTimeout).not.toHaveBeenCalled()
    
    // Test exactly 30 seconds + 1ms threshold
    act(() => {
      jest.advanceTimersByTime(1)
    })
    
    // Should reset timeout
    act(() => {
      result.current.handleActivity()
    })
    
    expect(clearTimeout).toHaveBeenCalled()
  })

  it('handles Date.now changes correctly', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    // Mock Date.now to return different values
    const mockDateNow = jest.spyOn(Date, 'now')
    
    // First call returns 1000000
    mockDateNow.mockReturnValue(1000000)
    
    // Fast forward to 31 seconds
    act(() => {
      jest.advanceTimersByTime(31000)
    })
    
    // Second call returns 1031000 (31 seconds later)
    mockDateNow.mockReturnValue(1031000)
    
    // Simulate user activity
    act(() => {
      result.current.handleActivity()
    })
    
    // Should reset timeout due to 31 second difference
    expect(clearTimeout).toHaveBeenCalled()
  })

  it('handles rapid Date.now changes', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    const mockDateNow = jest.spyOn(Date, 'now')
    
    // Simulate rapid time changes
    act(() => {
      mockDateNow.mockReturnValue(1000000)
      jest.advanceTimersByTime(1000)
      
      mockDateNow.mockReturnValue(1001000)
      jest.advanceTimersByTime(1000)
      
      mockDateNow.mockReturnValue(1002000)
      jest.advanceTimersByTime(1000)
    })
    
    // Simulate user activity
    act(() => {
      result.current.handleActivity()
    })
    
    // Should not reset timeout due to small time differences
    expect(clearTimeout).not.toHaveBeenCalled()
  })

  it('handles very long inactivity periods', () => {
    renderHook(() => useActivityTimeout())
    
    // Fast forward to 1 hour (60 minutes)
    act(() => {
      jest.advanceTimersByTime(60 * 60 * 1000)
    })
    
    // Should have logged out
    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Automatisch uitgelogd',
      description: 'Je bent automatisch uitgelogd vanwege inactiviteit',
      variant: 'destructive'
    })
  })

  it('handles very short inactivity periods', () => {
    const { result } = renderHook(() => useActivityTimeout())
    
    // Fast forward to 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    // Simulate user activity
    act(() => {
      result.current.handleActivity()
    })
    
    // Should not reset timeout
    expect(clearTimeout).not.toHaveBeenCalled()
  })
})