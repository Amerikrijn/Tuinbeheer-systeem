import { renderHook, act } from '@testing-library/react'
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia
  let trigger: ((event: MediaQueryListEvent) => void) | null = null

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: window.innerWidth < 768,
        media: query,
        addEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
          trigger = cb
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    })
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })
    trigger = null
    vi.clearAllMocks()
  })

  it('updates state when crossing the 768px breakpoint', () => {
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    act(() => {
      window.innerWidth = 500
      trigger && trigger({} as MediaQueryListEvent)
    })

    expect(result.current).toBe(true)

    act(() => {
      window.innerWidth = 800
      trigger && trigger({} as MediaQueryListEvent)
    })

    expect(result.current).toBe(false)
  })
})
