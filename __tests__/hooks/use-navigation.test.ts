import { renderHook, act } from '@testing-library/react'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { useNavigation } from '@/hooks/use-navigation'

// Mock the useRouter hook
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  })
}))

let push: ReturnType<typeof jest.fn>
let replace: ReturnType<typeof jest.fn>

describe('useNavigation', () => {
  beforeEach(() => {
    push = mockPush
    replace = mockReplace
    jest.clearAllMocks()
  })

  afterEach(() => {
    // reset history length to default
    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 })
    jest.restoreAllMocks()
  })

  it('uses browser history when available', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {})
    Object.defineProperty(window.history, 'length', { configurable: true, value: 2 })

    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.goBack()
    })

    expect(backSpy).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('falls back to router.push when history is unavailable', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {})
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
