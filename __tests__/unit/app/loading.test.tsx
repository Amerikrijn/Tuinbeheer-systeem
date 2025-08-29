import { render, screen } from '@testing-library/react'
import Loading from '@/app/loading'

describe('Loading component', () => {
  it('renders loading message', () => {
    render(<Loading />)
    
    expect(screen.getByText('Laden...')).toBeInTheDocument()
    expect(screen.getByText('Een moment geduld alstublieft')).toBeInTheDocument()
  })

  it('centers content properly', () => {
    render(<Loading />)
    
    const contentContainer = screen.getByText('Laden...').closest('.text-center')
    expect(contentContainer).toHaveClass('space-y-6')
  })

  it('renders with proper heading structure', () => {
    render(<Loading />)
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Laden...')
    expect(heading).toHaveClass('text-xl', 'font-semibold', 'text-foreground')
  })

  it('displays descriptive text with correct styling', () => {
    render(<Loading />)
    
    const description = screen.getByText('Een moment geduld alstublieft')
    expect(description).toHaveClass('text-muted-foreground')
  })

  it('has proper accessibility structure', () => {
    render(<Loading />)
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Laden...')
  })
})