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

    expect(screen.getByText('Something went wrong while loading the application.')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
  })

  it('provides guidance for Supabase errors', () => {
    render(
      <ErrorBoundary>
        <ProblemChild message="supabaseKey missing" />
      </ErrorBoundary>
    )

    expect(screen.getByText('supabaseKey missing')).toBeInTheDocument()
    expect(screen.getByText('Missing or invalid environment variables')).toBeInTheDocument()
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

