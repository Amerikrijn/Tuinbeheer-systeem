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
    // Mock matchMedia to return mobile width
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 768px)'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
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

    // Change to mobile
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 768px)'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('should handle edge case widths', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 768px)'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
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