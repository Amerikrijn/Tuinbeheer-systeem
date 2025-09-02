import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock window object for Node.js environment
const mockWindow = {
  matchMedia: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  innerWidth: 1024
}

// Set up global window mock
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
})

// Mock window.matchMedia
const mockMatchMedia = jest.fn()
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

Object.defineProperty(mockWindow, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
})

Object.defineProperty(mockWindow, 'addEventListener', {
  writable: true,
  value: mockAddEventListener
})

Object.defineProperty(mockWindow, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener
})

describe('useIsMobile hook', () => {
  let mockMediaQueryList: any
  let mockChangeCallback: (() => void) | null = null

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset window.innerWidth
    Object.defineProperty(mockWindow, 'innerWidth', {
      writable: true,
      value: 1024
    })
    
    // Mock MediaQueryList
    mockMediaQueryList = {
      addEventListener: jest.fn((event, callback) => {
        if (event === 'change') {
          mockChangeCallback = callback
        }
      }),
      removeEventListener: jest.fn(),
      matches: false
    }
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList)
  })

  it('initializes with false to prevent hydration issues', () => {
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('detects mobile screen width correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375 // Mobile width
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('detects desktop screen width correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024 // Desktop width
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('detects tablet screen width correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 768 // Tablet width (exactly at breakpoint)
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('detects small tablet screen width correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767 // Just below breakpoint
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('sets up media query listener on mount', () => {
    renderHook(() => useIsMobile())
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('updates state when media query changes', () => {
    const { result } = renderHook(() => useIsMobile())
    
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024
    })
    
    expect(result.current).toBe(false)
    
    // Simulate media query change to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375
      })
      
      if (mockChangeCallback) {
        mockChangeCallback()
      }
    })
    
    expect(result.current).toBe(true)
  })

  it('updates state when media query changes to desktop', () => {
    const { result } = renderHook(() => useIsMobile())
    
    // Start with mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375
    })
    
    expect(result.current).toBe(true)
    
    // Simulate media query change to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024
      })
      
      if (mockChangeCallback) {
        mockChangeCallback()
      }
    })
    
    expect(result.current).toBe(false)
  })

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())
    
    unmount()
    
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('handles server-side rendering gracefully', () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window
    delete (global as any).window
    
    const { result } = renderHook(() => useIsMobile())
    
    // Should return false during SSR
    expect(result.current).toBe(false)
    
    // Restore window
    global.window = originalWindow
  })

  it('handles window.matchMedia not being available', () => {
    // Mock matchMedia as undefined
    const originalMatchMedia = window.matchMedia
    delete (window as any).matchMedia
    
    const { result } = renderHook(() => useIsMobile())
    
    // Should return false when matchMedia is not available
    expect(result.current).toBe(false)
    
    // Restore matchMedia
    window.matchMedia = originalMatchMedia
  })

  it('handles edge case screen widths', () => {
    const edgeCases = [
      { width: 0, expected: true },      // Very small
      { width: 1, expected: true },      // Minimal
      { width: 766, expected: true },    // Just below breakpoint
      { width: 767, expected: true },    // At breakpoint boundary
      { width: 768, expected: false },   // At breakpoint
      { width: 769, expected: false },   // Just above breakpoint
      { width: 9999, expected: false },  // Very large
      { width: 1000000, expected: false } // Extremely large
    ]
    
    edgeCases.forEach(({ width, expected }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: width
      })
      
      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(expected)
    })
  })

  it('maintains state consistency during rapid changes', () => {
    const { result } = renderHook(() => useIsMobile())
    
    // Rapidly change screen sizes
    const sizes = [375, 1024, 375, 1024, 375]
    
    sizes.forEach((width, index) => {
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: width
        })
        
        if (mockChangeCallback) {
          mockChangeCallback()
        }
      })
      
      const expected = width < 768
      expect(result.current).toBe(expected)
    })
  })

  it('handles multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useIsMobile())
    const { result: result2 } = renderHook(() => useIsMobile())
    
    // Change screen size
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375
      })
      
      if (mockChangeCallback) {
        mockChangeCallback()
      }
    })
    
    // Both hooks should update
    expect(result1.current).toBe(true)
    expect(result2.current).toBe(true)
  })

  it('handles fractional screen widths', () => {
    const fractionalWidths = [
      { width: 767.5, expected: true },   // Just below breakpoint
      { width: 767.9, expected: true },   // Very close to breakpoint
      { width: 768.0, expected: false },  // Exactly at breakpoint
      { width: 768.1, expected: false },  // Just above breakpoint
      { width: 768.5, expected: false }   // Above breakpoint
    ]
    
    fractionalWidths.forEach(({ width, expected }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: width
      })
      
      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(expected)
    })
  })

  it('handles negative screen widths gracefully', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: -100
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    // Should handle negative values gracefully
    expect(result.current).toBe(true)
  })

  it('handles undefined screen width gracefully', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: undefined
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    // Should handle undefined values gracefully
    expect(result.current).toBe(false)
  })
})