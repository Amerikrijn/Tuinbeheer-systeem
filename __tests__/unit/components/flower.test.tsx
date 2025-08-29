import { render, screen } from '@testing-library/react'
import { Flower, FlowerInstance } from '@/components/flower'

describe('Flower component', () => {
  const mockFlower: FlowerInstance = {
    id: '1',
    name: 'Test Flower',
    color: '#ff0000',
    emoji: '🌸',
    size: 50,
    x: 100,
    y: 100,
    opacity: 1,
    rotation: 45,
    isMainFlower: false
  }

  const mockMainFlower: FlowerInstance = {
    ...mockFlower,
    id: '2',
    isMainFlower: true,
    size: 80
  }

  it('renders flower with correct properties', () => {
    render(<Flower flower={mockFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    expect(flowerElement).toBeInTheDocument()
    
    // Check if emoji is displayed
    expect(screen.getByText('🌸')).toBeInTheDocument()
    
    // Check if name is displayed for flowers larger than 30px
    expect(screen.getByText('Test Flower')).toBeInTheDocument()
  })

  it('renders flower without name when size is small', () => {
    const smallFlower = { ...mockFlower, size: 25 }
    render(<Flower flower={smallFlower} />)
    
    expect(screen.getByText('🌸')).toBeInTheDocument()
    expect(screen.queryByText('Test Flower')).not.toBeInTheDocument()
  })

  it('applies correct positioning styles', () => {
    render(<Flower flower={mockFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    
    // Check that the element has the correct positioning attributes
    expect(flowerElement).toHaveAttribute('style')
    const style = flowerElement.getAttribute('style')
    expect(style).toContain('left: 75px')
    expect(style).toContain('top: 75px')
    
    // Position absolute comes from CSS class, not inline style
    expect(flowerElement).toHaveClass('absolute')
  })

  it('applies correct size styles', () => {
    render(<Flower flower={mockFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    
    expect(flowerElement).toHaveStyle({
      width: '50px',
      height: '50px'
    })
  })

  it('applies correct opacity and rotation', () => {
    render(<Flower flower={mockFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    
    expect(flowerElement).toHaveStyle({
      opacity: '1',
      transform: 'rotate(45deg)'
    })
  })

  it('renders main flower with glow effect', () => {
    render(<Flower flower={mockMainFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    
    // Check if glow effect div exists for main flower
    const glowEffect = flowerElement.querySelector('div[class*="blur-sm"]')
    expect(glowEffect).toBeInTheDocument()
  })

  it('does not render glow effect for non-main flower', () => {
    render(<Flower flower={mockFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    
    // Check that no glow effect exists for non-main flower
    const glowEffect = flowerElement.querySelector('div[style*="blur-sm"]')
    expect(glowEffect).not.toBeInTheDocument()
  })

  it('applies correct color styling', () => {
    render(<Flower flower={mockFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    const innerDiv = flowerElement.querySelector('div[class*="w-full h-full"]')
    
    expect(innerDiv).toHaveStyle({
      borderColor: '#ff000080',
      backgroundColor: '#ff000025'
    })
  })

  it('handles flower without emoji', () => {
    const flowerWithoutEmoji = { ...mockFlower, emoji: undefined }
    render(<Flower flower={flowerWithoutEmoji} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    expect(flowerElement).toBeInTheDocument()
    
    // Should still render the component even without emoji
    expect(flowerElement).toBeInTheDocument()
  })

  it('applies correct z-index for main flower', () => {
    render(<Flower flower={mockMainFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    
    expect(flowerElement).toHaveStyle({
      zIndex: '10'
    })
  })

  it('applies correct z-index for regular flower', () => {
    render(<Flower flower={mockFlower} />)
    
    const flowerElement = screen.getByTestId('flower-instance')
    
    expect(flowerElement).toHaveStyle({
      zIndex: '8'
    })
  })
})