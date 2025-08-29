import { renderHook, act } from '@testing-library/react'
import { useNavigation } from '@/hooks/use-navigation'

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  usePathname: () => '/',
}))

describe('useNavigation', () => {
  beforeEach(() => {
    // Clear all mocks and reset mock function calls
    jest.clearAllMocks()
    mockPush.mockClear()
    mockReplace.mockClear()
    mockBack.mockClear()
  })

  afterEach(() => {
    // Ensure mocks are restored
    jest.restoreAllMocks()
  })

  it('navigateTo calls router.push with correct path', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.navigateTo('/test')
    })

    expect(mockPush).toHaveBeenCalledWith('/test')
  })

  it('replace calls router.replace with correct path', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.replace('/new')
    })

    expect(mockReplace).toHaveBeenCalledWith('/new')
  })

  it('goBack calls router.back', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.goBack()
    })

    expect(mockBack).toHaveBeenCalled()
  })

  it('falls back to router.push when history is unavailable', () => {
    // Mock window.history as undefined
    const originalHistory = window.history
    Object.defineProperty(window, 'history', {
      value: undefined,
      writable: true
    })

    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.navigateTo('/')
    })

    expect(mockPush).toHaveBeenCalledWith('/')

    // Restore original history
    Object.defineProperty(window, 'history', {
      value: originalHistory,
      writable: true
    })
  })
})
