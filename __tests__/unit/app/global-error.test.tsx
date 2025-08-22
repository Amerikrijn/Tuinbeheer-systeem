import { render, screen, fireEvent } from '@testing-library/react'
import GlobalError from '@/app/global-error'

// Mock Next.js navigation
const mockReset = jest.fn()

// Mock window.location
const mockLocation = {
  href: '',
  reload: jest.fn()
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

// Mock process.env
const originalEnv = process.env

describe('GlobalError component', () => {
  const mockError = {
    message: 'Test global error message',
    digest: 'test-global-digest-123',
    name: 'TestGlobalError',
    stack: 'Test global stack trace'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('renders global error page with correct title and description', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Tuinbeheer Systeem - Fout')).toBeInTheDocument()
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument()
  })

  it('displays error message and digest', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Foutdetails:')).toBeInTheDocument()
    expect(screen.getByText('Test global error message')).toBeInTheDocument()
    expect(screen.getByText('Error ID: test-global-digest-123')).toBeInTheDocument()
  })

  it('displays fallback error message when no error message is provided', () => {
    const errorWithoutMessage = { ...mockError, message: '' }
    render(<GlobalError error={errorWithoutMessage} reset={mockReset} />)
    
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument()
  })

  it('displays helpful instructions for users', () => {
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

  it('displays stack trace in development environment', () => {
    process.env.NODE_ENV = 'development'
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Stack trace (development only)')).toBeInTheDocument()
    expect(screen.getByText('Test global stack trace')).toBeInTheDocument()
  })

  it('does not display stack trace in production environment', () => {
    process.env.NODE_ENV = 'production'
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.queryByText('Stack trace (development only)')).not.toBeInTheDocument()
    expect(screen.queryByText('Test global stack trace')).not.toBeInTheDocument()
  })

  it('handles error without digest gracefully', () => {
    const errorWithoutDigest = { ...mockError, digest: undefined }
    render(<GlobalError error={errorWithoutDigest} reset={mockReset} />)
    
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const errorDetails = screen.getByText('Foutdetails:').closest('.bg-red-50')
    expect(errorDetails).toBeInTheDocument()
    
    const instructions = screen.getByText('Wat kunt u doen:').closest('.bg-yellow-50')
    expect(instructions).toBeInTheDocument()
    
    const technicalInfo = screen.getByText('Technische informatie:').closest('.bg-blue-50')
    expect(technicalInfo).toBeInTheDocument()
  })

  it('renders buttons with correct styling', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const retryButton = screen.getByText('Opnieuw Proberen')
    const refreshButton = screen.getByText('Pagina Vernieuwen')
    const homeButton = screen.getByText('Hoofdpagina')
    
    expect(retryButton).toHaveClass('bg-green-600', 'hover:bg-green-700')
    expect(refreshButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700')
    expect(homeButton).toHaveClass('bg-gray-600', 'hover:bg-gray-700')
  })

  it('displays current timestamp in technical information', () => {
    const mockDate = new Date('2024-01-01T12:00:00Z')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
    
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText(/Tijdstip:/)).toBeInTheDocument()
    
    jest.restoreAllMocks()
  })

  it('displays platform information correctly', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText(/Platform: Browser/)).toBeInTheDocument()
  })

  it('displays environment information', () => {
    process.env.NODE_ENV = 'test'
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText(/Omgeving: test/)).toBeInTheDocument()
  })

  it('handles empty error object gracefully', () => {
    const emptyError = {} as Error
    render(<GlobalError error={emptyError} reset={mockReset} />)
    
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument()
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
  })

  it('renders all required icons', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    // Check if TreePine icon is present
    const treePineIcon = document.querySelector('svg')
    expect(treePineIcon).toBeInTheDocument()
    
    // Check if other icons are present in buttons
    expect(screen.getByText('Opnieuw Proberen').querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('Pagina Vernieuwen').querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('Hoofdpagina').querySelector('svg')).toBeInTheDocument()
  })
})