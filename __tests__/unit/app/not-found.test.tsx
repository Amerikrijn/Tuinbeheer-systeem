import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('NotFound component', () => {
  it('renders 404 page with correct title and description', () => {
    render(<NotFound />)
    
    expect(screen.getByText('Tuinbeheer Systeem')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
  })

  it('displays error message explaining the issue', () => {
    render(<NotFound />)
    
    expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument()
    expect(screen.getByText(/It may have been moved, deleted, or you entered an incorrect URL/)).toBeInTheDocument()
  })

  it('displays debug information section', () => {
    render(<NotFound />)
    
    expect(screen.getByText('Debug Informatie')).toBeInTheDocument()
    expect(screen.getByText(/Pagina niet gevonden. Controleer de URL of ga terug naar een bekende pagina/)).toBeInTheDocument()
  })

  it('displays common pages links', () => {
    render(<NotFound />)
    
    expect(screen.getByText('Common Pages:')).toBeInTheDocument()
    
    // Check if all common page links are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Tuinen')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('displays quick actions section with buttons', () => {
    render(<NotFound />)
    
    expect(screen.getByText('Quick Actions:')).toBeInTheDocument()
    
    // Check if all quick action buttons are present
    expect(screen.getByText('Go to Home Page')).toBeInTheDocument()
    expect(screen.getByText('View Gardens')).toBeInTheDocument()
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  it('renders all required icons', () => {
    render(<NotFound />)
    
    // Check if TreePine icon is present in header
    const treePineIcon = document.querySelector('svg')
    expect(treePineIcon).toBeInTheDocument()
    
    // Check if other icons are present
    expect(screen.getByText('404 - Page Not Found').querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('Debug Informatie').querySelector('svg')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<NotFound />)
    
    // Check main error card styling
    const errorCard = screen.getByText('404 - Page Not Found').closest('.border-red-200')
    expect(errorCard).toBeInTheDocument()
    expect(errorCard).toHaveClass('bg-red-50')
    
    // Check debug section styling
    const debugSection = screen.getByText('Debug Informatie').closest('.bg-card')
    expect(debugSection).toBeInTheDocument()
    
    // Check quick actions section styling
    const quickActionsSection = screen.getByText('Quick Actions:').closest('.bg-card')
    expect(quickActionsSection).toBeInTheDocument()
  })

  it('renders links with correct href attributes', () => {
    render(<NotFound />)
    
    // Check if links have correct href attributes
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/')
    
    const gardensLink = screen.getByText('Tuinen').closest('a')
    expect(gardensLink).toHaveAttribute('href', '/gardens')
    
    const adminLink = screen.getByText('Admin').closest('a')
    expect(adminLink).toHaveAttribute('href', '/admin')
  })

  it('renders quick action buttons with correct styling', () => {
    render(<NotFound />)
    
    const homeButton = screen.getByText('Go to Home Page').closest('button')
    expect(homeButton).toHaveClass('bg-green-600', 'hover:bg-green-700')
    
    const gardensButton = screen.getByText('View Gardens').closest('button')
    expect(gardensButton).toHaveClass('variant-outline')
    
    const adminButton = screen.getByText('Admin Panel').closest('button')
    expect(adminButton).toHaveClass('variant-outline')
  })

  it('displays proper navigation structure', () => {
    render(<NotFound />)
    
    // Check if the component has proper navigation structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Tuinbeheer Systeem')).toBeInTheDocument()
  })

  it('handles responsive design classes', () => {
    render(<NotFound />)
    
    // Check if responsive classes are applied
    const container = screen.getByText('Tuinbeheer Systeem').closest('.container')
    expect(container).toHaveClass('mx-auto')
    
    const header = screen.getByText('Tuinbeheer Systeem').closest('h1')
    expect(header).toHaveClass('text-2xl', 'md:text-3xl')
  })

  it('displays error information in correct language', () => {
    render(<NotFound />)
    
    // Check Dutch text
    expect(screen.getByText('Debug Informatie')).toBeInTheDocument()
    expect(screen.getByText('Tuinen')).toBeInTheDocument()
    
    // Check English text
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByText('Go to Home Page')).toBeInTheDocument()
  })

  it('renders with proper accessibility attributes', () => {
    render(<NotFound />)
    
    // Check if headings are properly structured
    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(4) // h1 + 3 card titles
    
    // Check if links are properly accessible
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })
})