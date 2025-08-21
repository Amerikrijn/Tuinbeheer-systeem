import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useActivityTimeout } from '@/hooks/use-activity-timeout'

const signOutMock = vi.fn(async () => {})
const toastMock = vi.fn()
const pushMock = vi.fn()

vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: { id: '123' },
    signOut: signOutMock,
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('useActivityTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('schedules warning and sign out after inactivity', async () => {
    renderHook(() => useActivityTimeout())

    vi.advanceTimersByTime(1000)

    vi.advanceTimersByTime(3_000_000)
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Sessie verloopt binnenkort',
      description: 'Je wordt over 5 minuten automatisch uitgelogd vanwege inactiviteit',
    })

    vi.advanceTimersByTime(600_000)
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

    vi.advanceTimersByTime(1000)

    act(() => {
      result.current.resetTimeout()
    })

    vi.advanceTimersByTime(2_999_999)
    expect(toastMock).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Sessie verloopt binnenkort',
      description: 'Je wordt over 5 minuten automatisch uitgelogd vanwege inactiviteit',
    })
  })

  it('clearTimeouts cancels scheduled timers', () => {
    const { result } = renderHook(() => useActivityTimeout())

    vi.advanceTimersByTime(1000)

    act(() => {
      result.current.clearTimeouts()
    })

    vi.advanceTimersByTime(3_600_000)
    expect(toastMock).not.toHaveBeenCalled()
    expect(signOutMock).not.toHaveBeenCalled()
  })
})
