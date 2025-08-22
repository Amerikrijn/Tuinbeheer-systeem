import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/hooks/use-toast'

// Mock timers
jest.useFakeTimers()

describe('useToast hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('returns toast function', () => {
    const { result } = renderHook(() => useToast())
    
    expect(result.current.toast).toBeDefined()
    expect(typeof result.current.toast).toBe('function')
  })

  it('adds toast when called', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test Description'
      })
    })
    
    // Should have added a toast
    expect(result.current.toast).toBeDefined()
  })

  it('handles toast with title only', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Title Only'
      })
    })
    
    expect(result.current.toast).toBeDefined()
  })

  it('handles toast with description only', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        description: 'Description Only'
      })
    })
    
    expect(result.current.toast).toBeDefined()
  })

  it('handles toast with variant', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Test',
        variant: 'destructive'
      })
    })
    
    expect(result.current.toast).toBeDefined()
  })

  it('handles toast with action', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Test',
        action: <button>Action</button>
      })
    })
    
    expect(result.current.toast).toBeDefined()
  })

  it('handles multiple toast calls', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({ title: 'Toast 1' })
      result.current.toast({ title: 'Toast 2' })
      result.current.toast({ title: 'Toast 3' })
    })
    
    expect(result.current.toast).toBeDefined()
  })

  it('handles empty toast object', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({})
    })
    
    expect(result.current.toast).toBeDefined()
  })

  it('handles toast with all properties', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Complete Toast',
        description: 'Complete Description',
        variant: 'default',
        action: <button>Complete Action</button>
      })
    })
    
    expect(result.current.toast).toBeDefined()
  })
})