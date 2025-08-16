import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Error from '@/app/error'

// Mock window.location
const mockLocation = {
  href: ''
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('Error Component', () => {
  const mockError = {
    message: 'Test error message',
    digest: 'error-123',
    name: 'TestError',
    stack: 'Error stack trace'
  }

  const mockReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
  })

  it('renders error component with error message', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Tuinbeheer Systeem')).toBeInTheDocument()
    expect(screen.getByText('Garden Management System')).toBeInTheDocument()
    expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('displays error digest when available', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Error ID: error-123')).toBeInTheDocument()
  })

  it('shows default error message when no message is provided', () => {
    const errorWithoutMessage = { ...mockError, message: '' }
    render(<Error error={errorWithoutMessage} reset={mockReset} />)
    
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument()
  })

  it('displays helpful instructions', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Wat kunt u doen:')).toBeInTheDocument()
    expect(screen.getByText('• Probeer de pagina te vernieuwen')).toBeInTheDocument()
    expect(screen.getByText('• Controleer uw internetverbinding')).toBeInTheDocument()
    expect(screen.getByText('• Wacht een moment en probeer het opnieuw')).toBeInTheDocument()
    expect(screen.getByText('• Ga terug naar de hoofdpagina')).toBeInTheDocument()
  })

  it('calls reset function when retry button is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    const retryButton = screen.getByText('Probeer Opnieuw')
    fireEvent.click(retryButton)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('navigates to home page when home button is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    const homeButton = screen.getByText('Naar Hoofdpagina')
    fireEvent.click(homeButton)
    
    expect(mockLocation.href).toBe('/')
  })

  it('displays contact information for persistent issues', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText(/Als dit probleem blijft bestaan/)).toBeInTheDocument()
    expect(screen.getByText(/neem dan contact op met de systeembeheerder/)).toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    const errorCard = screen.getByText('Er is een fout opgetreden').closest('.border-red-200')
    expect(errorCard).toBeInTheDocument()
    
    const instructionsBox = screen.getByText('Wat kunt u doen:').closest('.bg-yellow-50')
    expect(instructionsBox).toBeInTheDocument()
  })

  it('handles error without digest gracefully', () => {
    const errorWithoutDigest = { ...mockError }
    delete errorWithoutDigest.digest
    
    render(<Error error={errorWithoutDigest} reset={mockReset} />)
    
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })

  it('renders error component with minimal error object', () => {
    const minimalError = {
      message: 'Minimal error',
      name: 'MinimalError'
    }
    
    render(<Error error={minimalError} reset={mockReset} />)
    
    expect(screen.getByText('Minimal error')).toBeInTheDocument()
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })

  it('displays all UI elements correctly', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    // Check icons are present
    expect(screen.getByTestId('tree-pine-icon')).toBeInTheDocument()
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('refresh-cw-icon')).toBeInTheDocument()
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
  })
})