import { renderHook, act } from '@testing-library/react'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { useActivityTimeout } from '@/hooks/use-activity-timeout'

const signOutMock = jest.fn(async () => {})
const toastMock = jest.fn()
const pushMock = jest.fn()

jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: { id: '123' },
    signOut: signOutMock,
  }),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

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

  it('schedules warning and sign out after inactivity', async () => {
    renderHook(() => useActivityTimeout())

    jest.advanceTimersByTime(1000)

    jest.advanceTimersByTime(3_000_000)
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Sessie verloopt binnenkort',
      description: 'Je wordt over 5 minuten automatisch uitgelogd vanwege inactiviteit',
    })

    jest.advanceTimersByTime(600_000)
    await Promise.resolve()

    expect(signOutMock).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/auth/login')
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Automatisch uitgelogd',
      description: 'Je bent automatisch uitgelogd vanwege inactiviteit',
      variant: 'destructive',
    })
  })

  it('resetTimeout reschedules timers', () => {
    const { result } = renderHook(() => useActivityTimeout())

    jest.advanceTimersByTime(1000)

    act(() => {
      result.current.resetTimeout()
    })

    jest.advanceTimersByTime(2_999_999)
    expect(toastMock).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Sessie verloopt binnenkort',
      description: 'Je wordt over 5 minuten automatisch uitgelogd vanwege inactiviteit',
    })
  })

  it('clearTimeouts cancels scheduled timers', () => {
    const { result } = renderHook(() => useActivityTimeout())

    jest.advanceTimersByTime(1000)

    act(() => {
      result.current.clearTimeouts()
    })

    jest.advanceTimersByTime(3_600_000)
    expect(toastMock).not.toHaveBeenCalled()
    expect(signOutMock).not.toHaveBeenCalled()
  })
})
