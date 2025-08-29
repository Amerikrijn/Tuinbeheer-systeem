import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import { ErrorBoundary } from '@/components/error-boundary'

const ProblemChild = ({ message }: { message?: string }) => {
  throw new Error(message ?? 'boom')
}

describe('ErrorBoundary component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText(
        'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('provides guidance for Supabase errors', () => {
    jest.spyOn(ErrorBoundary, 'getDerivedStateFromError').mockImplementation(error => ({
      hasError: true,
      error,
    }))

    render(
      <ErrorBoundary>
        <ProblemChild message="supabaseKey missing" />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Supabase Configuration Issue/)).toBeInTheDocument()
    expect(screen.getByText(/\.env\.local/)).toBeInTheDocument()
    expect(screen.getByText(/SUPABASE_SETUP.md/)).toBeInTheDocument()
  })

  it('resets when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )

    act(() => {
      fireEvent.click(screen.getByText('Try Again'))
      rerender(
        <ErrorBoundary>
          <div data-testid="safe">content</div>
        </ErrorBoundary>
      )
    })

    expect(screen.getByTestId('safe')).toBeInTheDocument()
  })
})

