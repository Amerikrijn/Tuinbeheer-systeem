import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/components/theme-provider';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the next-themes ThemeProvider
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="next-themes-provider" {...props}>
      {children}
    </div>
  )
}));

describe('ThemeProvider Component', () => {
  it('should render with children', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<ThemeProvider></ThemeProvider>);
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should accept props without errors', () => {
    expect(() => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );
    }).not.toThrow();
  });
});