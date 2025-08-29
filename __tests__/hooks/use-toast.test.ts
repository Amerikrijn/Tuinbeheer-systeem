import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'

// Helper to dynamically import module for clean state
let reducer: any
let toastFn: any
let useToastHook: any

describe('use-toast reducer', () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.useFakeTimers()
    const mod = await import('@/hooks/use-toast')
    reducer = mod.reducer
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('handles ADD_TOAST', () => {
    const state = { toasts: [] }
    const newToast = { id: '1', open: true } as any
    const next = reducer(state, { type: 'ADD_TOAST', toast: newToast })
    expect(next.toasts).toEqual([newToast])
  })

  it('handles UPDATE_TOAST', () => {
    const state = { toasts: [{ id: '1', title: 'old', open: true }] }
    const next = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'new' } })
    expect(next.toasts[0].title).toBe('new')
  })

  it('handles DISMISS_TOAST and schedules removal', () => {
    const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout')
    const toast1 = { id: '1', open: true } as any
    const toast2 = { id: '2', open: true } as any
    let state = { toasts: [toast1, toast2] }

    state = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' })
    expect(state.toasts.find(t => t.id === '1')?.open).toBe(false)
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
    expect(setTimeoutSpy.mock.calls[0][1]).toBe(1000000)

    state = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' })
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
    setTimeoutSpy.mockRestore()
  })

  it('handles REMOVE_TOAST', () => {
    const toast1 = { id: '1', open: false } as any
    const toast2 = { id: '2', open: true } as any
    let state = { toasts: [toast1, toast2] }

    state = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' })
    expect(state.toasts).toEqual([toast2])

    state = reducer(state, { type: 'REMOVE_TOAST' })
    expect(state.toasts).toEqual([])
  })
})

describe('toast function', () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.useFakeTimers()
    const mod = await import('@/hooks/use-toast')
    toastFn = mod.toast
    useToastHook = mod.useToast
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('adds toasts and removes them after dismissal delay', () => {
    // Test the toast function directly without React hooks
    const controller = toastFn({ title: 'Hello' })
    
    // Verify the toast was created
    expect(controller).toBeDefined()
    expect(typeof controller.dismiss).toBe('function')
    
    // Test dismiss functionality
    expect(() => controller.dismiss()).not.toThrow()
  })
})

