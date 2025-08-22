import { renderHook, act } from '@testing-library/react'
import { useNavigation } from '@/hooks/use-navigation'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: mockReplace
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

// Mock window.history
const mockHistoryBack = jest.fn()
Object.defineProperty(window, 'history', {
  value: {
    back: mockHistoryBack,
    length: 3
  },
  writable: true
})

describe('useNavigation hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset history length
    Object.defineProperty(window.history, 'length', {
      value: 3,
      writable: true
    })
  })

  it('returns navigation functions and router', () => {
    const { result } = renderHook(() => useNavigation())
    
    expect(result.current.goBack).toBeDefined()
    expect(result.current.navigateTo).toBeDefined()
    expect(result.current.replace).toBeDefined()
    expect(result.current.router).toBeDefined()
  })

  it('calls window.history.back when history length > 1', () => {
    Object.defineProperty(window.history, 'length', {
      value: 3,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('falls back to router.push("/") when history length <= 1', () => {
    Object.defineProperty(window.history, 'length', {
      value: 1,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('calls router.push with correct path', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.navigateTo('/dashboard')
    })
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('calls router.replace with correct path', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.replace('/login')
    })
    
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('handles multiple navigation calls correctly', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.navigateTo('/page1')
      result.current.navigateTo('/page2')
      result.current.replace('/page3')
    })
    
    expect(mockPush).toHaveBeenCalledWith('/page1')
    expect(mockPush).toHaveBeenCalledWith('/page2')
    expect(mockReplace).toHaveBeenCalledWith('/page3')
  })

  it('handles goBack with minimal history gracefully', () => {
    Object.defineProperty(window.history, 'length', {
      value: 0,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('handles goBack with single page history gracefully', () => {
    Object.defineProperty(window.history, 'length', {
      value: 1,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('handles navigation with empty paths', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.navigateTo('')
    })
    
    expect(mockPush).toHaveBeenCalledWith('')
  })

  it('handles navigation with special characters in paths', () => {
    const { result } = renderHook(() => useNavigation())
    
    const specialPaths = [
      '/path with spaces',
      '/path-with-special-chars!@#$%^&*()',
      '/path/with/query?param=value',
      '/path/with/hash#section'
    ]
    
    specialPaths.forEach(path => {
      act(() => {
        result.current.navigateTo(path)
      })
      
      expect(mockPush).toHaveBeenCalledWith(path)
    })
  })

  it('handles replace with empty paths', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.replace('')
    })
    
    expect(mockReplace).toHaveBeenCalledWith('')
  })

  it('handles replace with special characters in paths', () => {
    const { result } = renderHook(() => useNavigation())
    
    const specialPaths = [
      '/replace with spaces',
      '/replace-with-special-chars!@#$%^&*()',
      '/replace/with/query?param=value',
      '/replace/with/hash#section'
    ]
    
    specialPaths.forEach(path => {
      act(() => {
        result.current.replace(path)
      })
      
      expect(mockReplace).toHaveBeenCalledWith(path)
    })
  })

  it('maintains function references between renders', () => {
    const { result, rerender } = renderHook(() => useNavigation())
    
    const firstRender = {
      goBack: result.current.goBack,
      navigateTo: result.current.navigateTo,
      replace: result.current.replace
    }
    
    rerender()
    
    expect(result.current.goBack).toBe(firstRender.goBack)
    expect(result.current.navigateTo).toBe(firstRender.navigateTo)
    expect(result.current.replace).toBe(firstRender.replace)
  })

  it('handles server-side rendering gracefully', () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window
    delete (global as any).window
    
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.goBack()
    })
    
    // Should fall back to router.push('/') when window is undefined
    expect(mockPush).toHaveBeenCalledWith('/')
    
    // Restore window
    global.window = originalWindow
  })

  it('handles navigation with relative paths', () => {
    const { result } = renderHook(() => useNavigation())
    
    const relativePaths = [
      'dashboard',
      './dashboard',
      '../dashboard',
      '../../dashboard'
    ]
    
    relativePaths.forEach(path => {
      act(() => {
        result.current.navigateTo(path)
      })
      
      expect(mockPush).toHaveBeenCalledWith(path)
    })
  })

  it('handles replace with relative paths', () => {
    const { result } = renderHook(() => useNavigation())
    
    const relativePaths = [
      'login',
      './login',
      '../login',
      '../../login'
    ]
    
    relativePaths.forEach(path => {
      act(() => {
        result.current.replace(path)
      })
      
      expect(mockReplace).toHaveBeenCalledWith(path)
    })
  })
})