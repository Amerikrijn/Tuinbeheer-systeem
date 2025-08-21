import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'

// Mock window.location
const mockLocation = {
  href: ''
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary')
  }
  return <div>No error</div>
}

// Custom fallback component for testing
const CustomFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div>
    <h2>Custom Error: {error.message}</h2>
    <button onClick={reset}>Custom Reset</button>
  </div>
)

describe.skip('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
    
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('catches errors and renders default error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong while loading the application.')).toBeInTheDocument()
    expect(screen.getByText('Test error for error boundary')).toBeInTheDocument()
  })

  it('uses custom fallback component when provided', () => {
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom Error: Test error for error boundary')).toBeInTheDocument()
    expect(screen.getByText('Custom Reset')).toBeInTheDocument()
  })

  it('resets error state when reset button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    
    const resetButton = screen.getByText('Try Again')
    fireEvent.click(resetButton)
    
    // Re-render with no error to test reset
    rerender(
      <ErrorBoundary>
        <div>Test content after reset</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content after reset')).toBeInTheDocument()
  })

  it('navigates to home when home button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const homeButton = screen.getByText('Go Home')
    fireEvent.click(homeButton)
    
    expect(mockLocation.href).toBe('/')
  })

  it('displays possible causes of errors', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Possible causes:')).toBeInTheDocument()
    expect(screen.getByText('• Missing or invalid environment variables')).toBeInTheDocument()
    expect(screen.getByText('• Database connection issues')).toBeInTheDocument()
    expect(screen.getByText('• Network connectivity problems')).toBeInTheDocument()
    expect(screen.getByText('• JavaScript runtime errors')).toBeInTheDocument()
  })

  it('handles error without message gracefully', () => {
    const ThrowErrorWithoutMessage = () => {
      const error = new Error()
      error.message = ''
      throw error
    }
    
    render(
      <ErrorBoundary>
        <ThrowErrorWithoutMessage />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
  })

  it('resets error state when custom fallback reset is called', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom Error: Test error for error boundary')).toBeInTheDocument()
    
    const customResetButton = screen.getByText('Custom Reset')
    fireEvent.click(customResetButton)
    
    // Re-render with no error to test reset
    rerender(
      <ErrorBoundary fallback={CustomFallback}>
        <div>Test content after custom reset</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content after custom reset')).toBeInTheDocument()
  })

  it('maintains error state across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    
    // Re-render with same error state
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const errorCard = screen.getByText('Application Error').closest('.border-red-200')
    expect(errorCard).toBeInTheDocument()
    
    const causesBox = screen.getByText('Possible causes:').closest('.bg-card')
    expect(causesBox).toBeInTheDocument()
  })

  it('handles multiple errors sequentially', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test error for error boundary')).toBeInTheDocument()
    
    // Reset error
    const resetButton = screen.getByText('Try Again')
    fireEvent.click(resetButton)
    
    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <div>Test content after first reset</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content after first reset')).toBeInTheDocument()
    
    // Throw another error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test error for error boundary')).toBeInTheDocument()
  })
})