import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useIsMobile } from '@/components/ui/use-mobile';

// Mock window.matchMedia
const mockMatchMedia = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
});

describe('useIsMobile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });
  });

  it('should return false for desktop', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true for mobile', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should set up event listeners on mount', () => {
    renderHook(() => useIsMobile());
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useIsMobile());
    const { result: result2 } = renderHook(() => useIsMobile());

    expect(result1.current).toBe(false);
    expect(result2.current).toBe(false);
  });

  it('should handle rapid width changes', () => {
    const { result } = renderHook(() => useIsMobile());

    // Simulate rapid changes
    act(() => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });
      // Trigger change event
      const changeHandler = mockAddEventListener.mock.calls[0][1];
      changeHandler({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it('should handle edge case widths', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should maintain consistent behavior across re-renders', () => {
    const { result, rerender } = renderHook(() => useIsMobile());
    
    const initialValue = result.current;
    
    rerender();
    expect(result.current).toBe(initialValue);
    
    rerender();
    expect(result.current).toBe(initialValue);
  });
});