import { render, screen } from '@testing-library/react'
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card element correctly', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card.tagName).toBe('DIV')
    })

    it('applies default classes', () => {
      render(<Card>Test</Card>)
      const card = screen.getByText('Test')
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
    })

    it('applies custom className', () => {
      render(<Card className="custom-class">Custom Card</Card>)
      const card = screen.getByText('Custom Card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Card ref={ref}>Ref Test</Card>)
      expect(ref).toHaveBeenCalled()
    })

    it('spreads additional props', () => {
      render(
        <Card 
          data-testid="custom-card" 
          aria-label="Custom card"
        >
          Props Test
        </Card>
      )
      const card = screen.getByTestId('custom-card')
      expect(card).toHaveAttribute('aria-label', 'Custom card')
    })

    it('has correct display name', () => {
      expect(Card.displayName).toBe('Card')
    })
  })

  describe('CardHeader', () => {
    it('renders header correctly', () => {
      render(<CardHeader>Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardHeader>Test</CardHeader>)
      const header = screen.getByText('Test')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Custom Header</CardHeader>)
      const header = screen.getByText('Custom Header')
      expect(header).toHaveClass('custom-header')
    })

    it('has correct display name', () => {
      expect(CardHeader.displayName).toBe('CardHeader')
    })
  })

  describe('CardTitle', () => {
    it('renders title correctly', () => {
      render(<CardTitle>Card Title</CardTitle>)
      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardTitle>Test</CardTitle>)
      const title = screen.getByText('Test')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>)
      const title = screen.getByText('Custom Title')
      expect(title).toHaveClass('custom-title')
    })

    it('has correct display name', () => {
      expect(CardTitle.displayName).toBe('CardTitle')
    })
  })

  describe('CardDescription', () => {
    it('renders description correctly', () => {
      render(<CardDescription>Card Description</CardDescription>)
      const description = screen.getByText('Card Description')
      expect(description).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardDescription>Test</CardDescription>)
      const description = screen.getByText('Test')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Custom Description</CardDescription>)
      const description = screen.getByText('Custom Description')
      expect(description).toHaveClass('custom-desc')
    })

    it('has correct display name', () => {
      expect(CardDescription.displayName).toBe('CardDescription')
    })
  })

  describe('CardContent', () => {
    it('renders content correctly', () => {
      render(<CardContent>Card Content</CardContent>)
      const content = screen.getByText('Card Content')
      expect(content).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardContent>Test</CardContent>)
      const content = screen.getByText('Test')
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Custom Content</CardContent>)
      const content = screen.getByText('Custom Content')
      expect(content).toHaveClass('custom-content')
    })

    it('has correct display name', () => {
      expect(CardContent.displayName).toBe('CardContent')
    })
  })

  describe('CardFooter', () => {
    it('renders footer correctly', () => {
      render(<CardFooter>Card Footer</CardFooter>)
      const footer = screen.getByText('Card Footer')
      expect(footer).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardFooter>Test</CardFooter>)
      const footer = screen.getByText('Test')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Custom Footer</CardFooter>)
      const footer = screen.getByText('Custom Footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('has correct display name', () => {
      expect(CardFooter.displayName).toBe('CardFooter')
    })
  })

  describe('Card composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Test Footer')).toBeInTheDocument()
    })
  })
})