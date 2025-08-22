import { renderHook, act } from '@testing-library/react'
import { useViewPreference } from '@/hooks/use-view-preference'
import { ViewPreferencesService, ViewMode } from '@/lib/services/view-preferences.service'

// Mock ViewPreferencesService
jest.mock('@/lib/services/view-preferences.service', () => ({
  ViewPreferencesService: {
    getViewMode: jest.fn(),
    setViewMode: jest.fn(),
    onViewModeChange: jest.fn()
  },
  ViewMode: {
    VISUAL: 'visual',
    LIST: 'list'
  }
}))

const mockViewPreferencesService = ViewPreferencesService as jest.Mocked<typeof ViewPreferencesService>

describe('useViewPreference hook', () => {
  let mockCleanup: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockCleanup = jest.fn()
    
    // Default mock implementations
    mockViewPreferencesService.getViewMode.mockReturnValue('visual')
    mockViewPreferencesService.onViewModeChange.mockReturnValue(mockCleanup)
  })

  it('initializes with default view mode from service', () => {
    mockViewPreferencesService.getViewMode.mockReturnValue('list')
    
    const { result } = renderHook(() => useViewPreference())
    
    expect(result.current.viewMode).toBe('list')
    expect(result.current.isInitialized).toBe(true)
    expect(result.current.isVisualView).toBe(false)
    expect(result.current.isListView).toBe(true)
  })

  it('initializes with visual view mode by default', () => {
    mockViewPreferencesService.getViewMode.mockReturnValue('visual')
    
    const { result } = renderHook(() => useViewPreference())
    
    expect(result.current.viewMode).toBe('visual')
    expect(result.current.isVisualView).toBe(true)
    expect(result.current.isListView).toBe(false)
  })

  it('calls ViewPreferencesService.getViewMode on initialization', () => {
    renderHook(() => useViewPreference())
    
    expect(mockViewPreferencesService.getViewMode).toHaveBeenCalledTimes(1)
  })

  it('sets up view mode change listener on initialization', () => {
    renderHook(() => useViewPreference())
    
    expect(mockViewPreferencesService.onViewModeChange).toHaveBeenCalledTimes(1)
  })

  it('calls cleanup function when unmounting', () => {
    const { unmount } = renderHook(() => useViewPreference())
    
    unmount()
    
    expect(mockCleanup).toHaveBeenCalledTimes(1)
  })

  it('updates view mode when service notifies of change', () => {
    let changeCallback: ((mode: ViewMode) => void) | null = null
    
    mockViewPreferencesService.onViewModeChange.mockImplementation((callback) => {
      changeCallback = callback
      return mockCleanup
    })
    
    const { result } = renderHook(() => useViewPreference())
    
    // Simulate service notifying of view mode change
    act(() => {
      if (changeCallback) {
        changeCallback('list')
      }
    })
    
    expect(result.current.viewMode).toBe('list')
    expect(result.current.isVisualView).toBe(false)
    expect(result.current.isListView).toBe(true)
  })

  it('setViewPreference updates local state and calls service', () => {
    const { result } = renderHook(() => useViewPreference())
    
    act(() => {
      result.current.setViewPreference('list')
    })
    
    expect(result.current.viewMode).toBe('list')
    expect(mockViewPreferencesService.setViewMode).toHaveBeenCalledWith('list')
  })

  it('toggleView switches between visual and list modes', () => {
    const { result } = renderHook(() => useViewPreference())
    
    // Start with visual mode
    expect(result.current.viewMode).toBe('visual')
    
    // Toggle to list mode
    act(() => {
      result.current.toggleView()
    })
    
    expect(result.current.viewMode).toBe('list')
    expect(result.current.isVisualView).toBe(false)
    expect(result.current.isListView).toBe(true)
    
    // Toggle back to visual mode
    act(() => {
      result.current.toggleView()
    })
    
    expect(result.current.viewMode).toBe('visual')
    expect(result.current.isVisualView).toBe(true)
    expect(result.current.isListView).toBe(false)
  })

  it('setViewPreference handles all view modes', () => {
    const { result } = renderHook(() => useViewPreference())
    
    const viewModes: ViewMode[] = ['visual', 'list']
    
    viewModes.forEach(mode => {
      act(() => {
        result.current.setViewPreference(mode)
      })
      
      expect(result.current.viewMode).toBe(mode)
      expect(mockViewPreferencesService.setViewMode).toHaveBeenCalledWith(mode)
    })
  })

  it('maintains state consistency between multiple calls', () => {
    const { result } = renderHook(() => useViewPreference())
    
    // Set to list mode
    act(() => {
      result.current.setViewPreference('list')
    })
    
    expect(result.current.viewMode).toBe('list')
    expect(result.current.isVisualView).toBe(false)
    expect(result.current.isListView).toBe(true)
    
    // Set to visual mode
    act(() => {
      result.current.setViewPreference('visual')
    })
    
    expect(result.current.viewMode).toBe('visual')
    expect(result.current.isVisualView).toBe(true)
    expect(result.current.isListView).toBe(false)
  })

  it('handles rapid view mode changes correctly', () => {
    const { result } = renderHook(() => useViewPreference())
    
    // Rapidly change view modes
    act(() => {
      result.current.setViewPreference('list')
      result.current.setViewPreference('visual')
      result.current.setViewPreference('list')
    })
    
    expect(result.current.viewMode).toBe('list')
    expect(mockViewPreferencesService.setViewMode).toHaveBeenCalledTimes(3)
  })

  it('returns correct boolean flags for view modes', () => {
    const { result } = renderHook(() => useViewPreference())
    
    // Test visual mode
    act(() => {
      result.current.setViewPreference('visual')
    })
    
    expect(result.current.isVisualView).toBe(true)
    expect(result.current.isListView).toBe(false)
    
    // Test list mode
    act(() => {
      result.current.setViewPreference('list')
    })
    
    expect(result.current.isVisualView).toBe(false)
    expect(result.current.isListView).toBe(true)
  })

  it('handles service errors gracefully', () => {
    // Mock service to throw error
    mockViewPreferencesService.getViewMode.mockImplementation(() => {
      throw new Error('Service error')
    })
    
    // Should not crash the hook
    expect(() => {
      renderHook(() => useViewPreference())
    }).not.toThrow()
  })

  it('handles service returning invalid view mode', () => {
    // Mock service to return invalid mode
    mockViewPreferencesService.getViewMode.mockReturnValue('invalid' as ViewMode)
    
    const { result } = renderHook(() => useViewPreference())
    
    // Should still initialize with the returned value
    expect(result.current.viewMode).toBe('invalid')
    expect(result.current.isVisualView).toBe(false)
    expect(result.current.isListView).toBe(false)
  })

  it('maintains function references between renders', () => {
    const { result, rerender } = renderHook(() => useViewPreference())
    
    const firstRender = {
      setViewPreference: result.current.setViewPreference,
      toggleView: result.current.toggleView
    }
    
    rerender()
    
    expect(result.current.setViewPreference).toBe(firstRender.setViewPreference)
    expect(result.current.toggleView).toBe(firstRender.toggleView)
  })

  it('handles multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useViewPreference())
    const { result: result2 } = renderHook(() => useViewPreference())
    
    // Change first hook
    act(() => {
      result1.current.setViewPreference('list')
    })
    
    // Second hook should remain unchanged
    expect(result1.current.viewMode).toBe('list')
    expect(result2.current.viewMode).toBe('visual')
  })
})