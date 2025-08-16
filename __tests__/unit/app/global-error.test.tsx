import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import GlobalError from '@/app/global-error'

// Mock window.location
const mockLocation = {
  href: '',
  reload: jest.fn()
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('GlobalError Component', () => {
  const mockError = {
    message: 'Global test error message',
    digest: 'global-error-123',
    name: 'GlobalTestError',
    stack: 'Global error stack trace'
  }

  const mockReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
    mockLocation.reload.mockClear()
  })

  it('renders global error component with error message', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Tuinbeheer Systeem - Fout')).toBeInTheDocument()
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument()
    expect(screen.getByText('Global test error message')).toBeInTheDocument()
  })

  it('displays error digest when available', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Error ID: global-error-123')).toBeInTheDocument()
  })

  it('shows default error message when no message is provided', () => {
    const errorWithoutMessage = { ...mockError, message: '' }
    render(<GlobalError error={errorWithoutMessage} reset={mockReset} />)
    
    // There are multiple elements with this text, so use getAllByText
    const elements = screen.getAllByText('Er is een onverwachte fout opgetreden')
    expect(elements).toHaveLength(2)
  })

  it('displays helpful instructions', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Wat kunt u doen:')).toBeInTheDocument()
    expect(screen.getByText('• Probeer de pagina te vernieuwen')).toBeInTheDocument()
    expect(screen.getByText('• Controleer uw internetverbinding')).toBeInTheDocument()
    expect(screen.getByText('• Wacht een moment en probeer het opnieuw')).toBeInTheDocument()
    expect(screen.getByText('• Ga terug naar de hoofdpagina')).toBeInTheDocument()
  })

  it('displays technical information', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Technische informatie:')).toBeInTheDocument()
    expect(screen.getByText(/Tijdstip:/)).toBeInTheDocument()
    expect(screen.getByText(/Platform:/)).toBeInTheDocument()
    expect(screen.getByText(/Omgeving:/)).toBeInTheDocument()
  })

  it('calls reset function when retry button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const retryButton = screen.getByText('Opnieuw Proberen')
    fireEvent.click(retryButton)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('reloads page when refresh button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const refreshButton = screen.getByText('Pagina Vernieuwen')
    fireEvent.click(refreshButton)
    
    expect(mockLocation.reload).toHaveBeenCalledTimes(1)
  })

  it('navigates to home page when home button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const homeButton = screen.getByText('Hoofdpagina')
    fireEvent.click(homeButton)
    
    expect(mockLocation.href).toBe('/')
  })

  it('shows stack trace in development mode', () => {
    // Mock NODE_ENV to development
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Stack trace (development only)')).toBeInTheDocument()
    expect(screen.getByText('Global error stack trace')).toBeInTheDocument()
    
    // Restore original env
    process.env.NODE_ENV = originalEnv
  })

  it('hides stack trace in production mode', () => {
    // Mock NODE_ENV to production
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.queryByText('Stack trace (development only)')).not.toBeInTheDocument()
    expect(screen.queryByText('Global error stack trace')).not.toBeInTheDocument()
    
    // Restore original env
    process.env.NODE_ENV = originalEnv
  })

  it('handles error without digest gracefully', () => {
    const errorWithoutDigest = { ...mockError }
    delete errorWithoutDigest.digest
    
    render(<GlobalError error={errorWithoutDigest} reset={mockReset} />)
    
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const errorDetailsBox = screen.getByText('Foutdetails:').closest('.bg-red-50')
    expect(errorDetailsBox).toBeInTheDocument()
    
    const instructionsBox = screen.getByText('Wat kunt u doen:').closest('.bg-yellow-50')
    expect(instructionsBox).toBeInTheDocument()
    
    const technicalInfoBox = screen.getByText('Technische informatie:').closest('.bg-blue-50')
    expect(technicalInfoBox).toBeInTheDocument()
  })

  it('displays current timestamp', () => {
    const mockDate = new Date('2024-01-15T10:30:00')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
    
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText(/Tijdstip:/)).toBeInTheDocument()
    
    jest.restoreAllMocks()
  })

  it('detects browser environment correctly', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText(/Platform: Browser/)).toBeInTheDocument()
  })

  it('renders with minimal error object', () => {
    const minimalError = {
      message: 'Minimal global error',
      name: 'MinimalGlobalError'
    }
    
    render(<GlobalError error={minimalError} reset={mockReset} />)
    
    expect(screen.getByText('Minimal global error')).toBeInTheDocument()
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })
})