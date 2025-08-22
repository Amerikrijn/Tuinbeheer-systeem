import { render, screen } from '@testing-library/react'
import Loading from '@/app/loading'

describe('Loading component', () => {
  it('renders loading page with correct content', () => {
    render(<Loading />)
    
    expect(screen.getByText('Laden...')).toBeInTheDocument()
    expect(screen.getByText('Een moment geduld alstublieft')).toBeInTheDocument()
  })

  it('displays loading spinner icon', () => {
    render(<Loading />)
    
    const spinnerIcon = document.querySelector('.animate-spin')
    expect(spinnerIcon).toBeInTheDocument()
    expect(spinnerIcon).toHaveClass('h-12', 'w-12', 'text-green-600')
  })

  it('applies correct styling classes', () => {
    render(<Loading />)
    
    const container = screen.getByText('Laden...').closest('.min-h-screen')
    expect(container).toHaveClass('flex', 'items-center', 'justify-center')
    expect(container).toHaveClass('bg-gradient-to-br', 'from-green-50', 'to-blue-50')
  })

  it('centers content properly', () => {
    render(<Loading />)
    
    const contentContainer = screen.getByText('Laden...').closest('.text-center')
    expect(contentContainer).toHaveClass('space-y-4')
  })

  it('renders with proper heading structure', () => {
    render(<Loading />)
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Laden...')
    expect(heading).toHaveClass('text-xl', 'font-semibold', 'text-gray-700')
  })

  it('displays descriptive text with correct styling', () => {
    render(<Loading />)
    
    const description = screen.getByText('Een moment geduld alstublieft')
    expect(description).toHaveClass('text-gray-500')
  })

  it('has proper accessibility attributes', () => {
    render(<Loading />)
    
    // Check if the component has proper semantic structure
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByText('Een moment geduld alstublieft')).toBeInTheDocument()
  })

  it('renders with full screen height', () => {
    render(<Loading />)
    
    const fullScreenContainer = document.querySelector('.min-h-screen')
    expect(fullScreenContainer).toBeInTheDocument()
  })

  it('applies gradient background correctly', () => {
    render(<Loading />)
    
    const gradientContainer = document.querySelector('.bg-gradient-to-br.from-green-50.to-blue-50')
    expect(gradientContainer).toBeInTheDocument()
  })

  it('displays loading text in Dutch', () => {
    render(<Loading />)
    
    expect(screen.getByText('Laden...')).toBeInTheDocument()
    expect(screen.getByText('Een moment geduld alstublieft')).toBeInTheDocument()
  })
})