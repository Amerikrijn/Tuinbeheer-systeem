import React from 'react';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/components/ui/use-mobile';

describe('useIsMobile Hook', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Set up a default mock for matchMedia before each test
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    // Restore original matchMedia after each test
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
    
    // Restore original innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });
  });

  describe('useIsMobile', () => {
    it('should return false for desktop screens', () => {
      // Override default mock for desktop behavior
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('should return true for mobile screens', () => {
      // Override default mock for mobile behavior
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });


  });

  describe('Integration', () => {
    it('should handle different screen sizes', () => {
      // Test desktop size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });

      const { result: desktopResult } = renderHook(() => useIsMobile());
      expect(desktopResult.current).toBe(false);

      // Test mobile size with a new hook instance
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      });
      
      const { result: mobileResult } = renderHook(() => useIsMobile());
      expect(mobileResult.current).toBe(true);
    });
  });
});