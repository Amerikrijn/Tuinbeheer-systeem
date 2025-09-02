import { renderHook, act } from '@testing-library/react'
import { useNavigationHistory } from '@/hooks/use-navigation-history'

// Mock window object for Node.js environment
const mockWindow = {
  history: {
    back: jest.fn(),
    length: 3
  }
}

// Set up global window mock
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
})

// Mock Next.js router
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

// Mock window.history
const mockHistoryBack = jest.fn()
Object.defineProperty(mockWindow, 'history', {
  value: {
    back: mockHistoryBack,
    length: 3
  },
  writable: true
})

describe('useNavigationHistory hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset history length
    Object.defineProperty(mockWindow.history, 'length', {
      value: 3,
      writable: true
    })
  })

  it('returns navigation functions and router', () => {
    const { result } = renderHook(() => useNavigationHistory())
    
    expect(result.current.goBack).toBeDefined()
    expect(result.current.navigateTo).toBeDefined()
    expect(result.current.router).toBeDefined()
  })

  it('calls window.history.back when history length > 1 and succeeds', () => {
    Object.defineProperty(window.history, 'length', {
      value: 3,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('falls back to router.push when history length <= 1', () => {
    Object.defineProperty(window.history, 'length', {
      value: 1,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/plant-beds')
  })

  it('falls back to router.push when history.back throws error', () => {
    Object.defineProperty(window.history, 'length', {
      value: 3,
      writable: true
    })
    
    // Mock history.back to throw error
    mockHistoryBack.mockImplementation(() => {
      throw new Error('Navigation blocked')
    })
    
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/plant-beds')
  })

  it('calls router.push with correct path', () => {
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.navigateTo('/dashboard')
    })
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('handles multiple navigation calls correctly', () => {
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.navigateTo('/page1')
      result.current.navigateTo('/page2')
      result.current.navigateTo('/page3')
    })
    
    expect(mockPush).toHaveBeenCalledWith('/page1')
    expect(mockPush).toHaveBeenCalledWith('/page2')
    expect(mockPush).toHaveBeenCalledWith('/page3')
  })

  it('handles goBack with minimal history gracefully', () => {
    Object.defineProperty(window.history, 'length', {
      value: 0,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/plant-beds')
  })

  it('handles goBack with single page history gracefully', () => {
    Object.defineProperty(window.history, 'length', {
      value: 1,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.goBack()
    })
    
    expect(mockHistoryBack).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/plant-beds')
  })

  it('handles navigation with empty paths', () => {
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.navigateTo('')
    })
    
    expect(mockPush).toHaveBeenCalledWith('')
  })

  it('handles navigation with special characters in paths', () => {
    const { result } = renderHook(() => useNavigationHistory())
    
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

  it('handles navigation with relative paths', () => {
    const { result } = renderHook(() => useNavigationHistory())
    
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

  it('maintains function references between renders', () => {
    const { result, rerender } = renderHook(() => useNavigationHistory())
    
    const firstRender = {
      goBack: result.current.goBack,
      navigateTo: result.current.navigateTo
    }
    
    rerender()
    
    expect(result.current.goBack).toBe(firstRender.goBack)
    expect(result.current.navigateTo).toBe(firstRender.navigateTo)
  })

  it('handles server-side rendering gracefully', () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window
    delete (global as any).window
    
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.goBack()
    })
    
    // Should fall back to router.push('/plant-beds') when window is undefined
    expect(mockPush).toHaveBeenCalledWith('/plant-beds')
    
    // Restore window
    global.window = originalWindow
  })

  it('handles window.history not being available', () => {
    // Mock history as undefined
    const originalHistory = window.history
    delete (window as any).history
    
    const { result } = renderHook(() => useNavigationHistory())
    
    act(() => {
      result.current.goBack()
    })
    
    // Should fall back to router.push('/plant-beds') when history is undefined
    expect(mockPush).toHaveBeenCalledWith('/plant-beds')
    
    // Restore history
    window.history = originalHistory
  })

  it('handles window.history.back throwing different types of errors', () => {
    Object.defineProperty(window.history, 'length', {
      value: 3,
      writable: true
    })
    
    const errorTypes = [
      new Error('Navigation blocked'),
      new TypeError('Invalid navigation'),
      'String error',
      500,
      null,
      undefined
    ]
    
    errorTypes.forEach(error => {
      mockHistoryBack.mockImplementation(() => {
        throw error
      })
      
      const { result } = renderHook(() => useNavigationHistory())
      
      act(() => {
        result.current.goBack()
      })
      
      expect(mockHistoryBack).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/plant-beds')
      
      // Reset for next iteration
      jest.clearAllMocks()
    })
  })

  it('handles rapid goBack calls correctly', () => {
    Object.defineProperty(window.history, 'length', {
      value: 3,
      writable: true
    })
    
    const { result } = renderHook(() => useNavigationHistory())
    
    // Call goBack multiple times rapidly
    act(() => {
      result.current.goBack()
      result.current.goBack()
      result.current.goBack()
    })
    
    expect(mockHistoryBack).toHaveBeenCalledTimes(3)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles rapid navigateTo calls correctly', () => {
    const { result } = renderHook(() => useNavigationHistory())
    
    // Call navigateTo multiple times rapidly
    act(() => {
      result.current.navigateTo('/page1')
      result.current.navigateTo('/page2')
      result.current.navigateTo('/page3')
    })
    
    expect(mockPush).toHaveBeenCalledWith('/page1')
    expect(mockPush).toHaveBeenCalledWith('/page2')
    expect(mockPush).toHaveBeenCalledWith('/page3')
  })

  it('handles multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useNavigationHistory())
    const { result: result2 } = renderHook(() => useNavigationHistory())
    
    // Change first hook
    act(() => {
      result1.current.navigateTo('/page1')
    })
    
    // Second hook should remain unchanged
    expect(mockPush).toHaveBeenCalledWith('/page1')
    
    // Change second hook
    act(() => {
      result2.current.navigateTo('/page2')
    })
    
    expect(mockPush).toHaveBeenCalledWith('/page2')
  })

  it('handles edge case history lengths', () => {
    const edgeCases = [
      { length: 0, expectedFallback: true },
      { length: 1, expectedFallback: true },
      { length: 2, expectedFallback: false },
      { length: 3, expectedFallback: false },
      { length: 100, expectedFallback: false },
      { length: -1, expectedFallback: true },
      { length: 1.5, expectedFallback: true }
    ]
    
    edgeCases.forEach(({ length, expectedFallback }) => {
      Object.defineProperty(window.history, 'length', {
        value: length,
        writable: true
      })
      
      const { result } = renderHook(() => useNavigationHistory())
      
      act(() => {
        result.current.goBack()
      })
      
      if (expectedFallback) {
        expect(mockPush).toHaveBeenCalledWith('/plant-beds')
        expect(mockHistoryBack).not.toHaveBeenCalled()
      } else {
        expect(mockHistoryBack).toHaveBeenCalledTimes(1)
        expect(mockPush).not.toHaveBeenCalled()
      }
      
      // Reset for next iteration
      jest.clearAllMocks()
    })
  })
})