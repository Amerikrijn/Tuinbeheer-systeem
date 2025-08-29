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

    expect(screen.getByText('Er is iets misgegaan bij het laden van de applicatie.')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(screen.getByText('Opnieuw Proberen')).toBeInTheDocument()
    expect(screen.getByText('Naar Home')).toBeInTheDocument()
    expect(screen.getByText('Pagina Herladen')).toBeInTheDocument()
  })

  it('provides guidance for Supabase errors', () => {
    render(
      <ErrorBoundary>
        <ProblemChild message="supabaseKey missing" />
      </ErrorBoundary>
    )

    expect(screen.getByText('supabaseKey missing')).toBeInTheDocument()
    expect(screen.getByText('Ontbrekende of ongeldige omgevingsvariabelen')).toBeInTheDocument()
  })

  it('resets when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )

    act(() => {
      fireEvent.click(screen.getByText('Opnieuw Proberen'))
      rerender(
        <ErrorBoundary>
          <div data-testid="safe">content</div>
        </ErrorBoundary>
      )
    })

    expect(screen.getByTestId('safe')).toBeInTheDocument()
  })
})

