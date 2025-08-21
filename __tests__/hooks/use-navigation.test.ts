import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useNavigation } from '@/hooks/use-navigation'
import { useRouter } from 'next/navigation'

let push: ReturnType<typeof vi.fn>
let replace: ReturnType<typeof vi.fn>

describe('useNavigation', () => {
  beforeEach(() => {
    push = vi.fn()
    replace = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push,
      replace,
    } as any)
    vi.clearAllMocks()
  })

  afterEach(() => {
    // reset history length to default
    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 })
    vi.restoreAllMocks()
  })

  it('uses browser history when available', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    Object.defineProperty(window.history, 'length', { configurable: true, value: 2 })

    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.goBack()
    })

    expect(backSpy).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('falls back to router.push when history is unavailable', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 })

    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.goBack()
    })

    expect(backSpy).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/')
  })

  it('navigateTo calls router.push with correct path', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.navigateTo('/test')
    })

    expect(push).toHaveBeenCalledWith('/test')
  })

  it('replace calls router.replace with correct path', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.replace('/new')
    })

    expect(replace).toHaveBeenCalledWith('/new')
  })
})
