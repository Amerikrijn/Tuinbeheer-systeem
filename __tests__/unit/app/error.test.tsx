import { render, screen, fireEvent } from '@testing-library/react'
import Error from '@/app/error'

// Mock Next.js navigation
const mockReset = jest.fn()

// Mock window.location
const mockLocation = {
  href: '',
  assign: jest.fn(),
  reload: jest.fn()
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('Error component', () => {
  const mockError = {
    message: 'Test error message',
    digest: 'test-digest-123',
    name: 'TestError',
    stack: 'Test stack trace'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
  })

  it('renders error page with correct title and description', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Tuinbeheer Systeem')).toBeInTheDocument()
    expect(screen.getByText('Garden Management System')).toBeInTheDocument()
    expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument()
  })

  it('displays error message and digest', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Foutmelding:')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByText('Error ID: test-digest-123')).toBeInTheDocument()
  })

  it('displays fallback error message when no error message is provided', () => {
    const errorWithoutMessage = { ...mockError, message: '' }
    render(<Error error={errorWithoutMessage} reset={mockReset} />)
    
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument()
  })

  it('displays error message when error message is provided', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('displays helpful instructions for users', () => {
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

  it('renders all required icons with data-testid', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByTestId('tree-pine-icon')).toBeInTheDocument()
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('refresh-cw-icon')).toBeInTheDocument()
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
  })

  it('displays contact information for persistent issues', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    expect(screen.getByText(/Als dit probleem blijft bestaan, neem dan contact op met de systeembeheerder/)).toBeInTheDocument()
  })

  it('handles error without digest gracefully', () => {
    const errorWithoutDigest = { ...mockError, digest: undefined }
    render(<Error error={errorWithoutDigest} reset={mockReset} />)
    
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    const errorCard = screen.getByText('Er is een fout opgetreden').closest('.border-red-200')
    expect(errorCard).toBeInTheDocument()
    
    const instructionsCard = screen.getByText('Wat kunt u doen:').closest('.bg-yellow-50')
    expect(instructionsCard).toBeInTheDocument()
  })

  it('renders buttons with correct variants and styling', () => {
    render(<Error error={mockError} reset={mockReset} />)
    
    const retryButton = screen.getByText('Probeer Opnieuw')
    const homeButton = screen.getByText('Naar Hoofdpagina')
    
    expect(retryButton).toHaveClass('bg-green-600', 'hover:bg-green-700')
    // Button component uses Tailwind classes, not variant-outline
    expect(homeButton).toHaveClass('border', 'bg-background')
  })

  it('handles empty error object gracefully', () => {
    const emptyError = {} as Error
    render(<Error error={emptyError} reset={mockReset} />)
    
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument()
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })
})