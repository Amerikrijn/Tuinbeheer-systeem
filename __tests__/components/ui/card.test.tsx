import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly with default props', () => {
      render(<Card>Test Card</Card>)
      const card = screen.getByText('Test Card')
      expect(card).toBeInTheDocument()
      expect(card.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<Card className="custom-class">Test Card</Card>)
      const card = screen.getByText('Test Card')
      expect(card).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<Card>Test Card</Card>)
      const card = screen.getByText('Test Card')
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Test Card</Card>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<Card data-testid="test-card" id="card-1">Test Card</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('id', 'card-1')
    })
  })

  describe('CardHeader', () => {
    it('renders correctly with default props', () => {
      render(<CardHeader>Test Header</CardHeader>)
      const header = screen.getByText('Test Header')
      expect(header).toBeInTheDocument()
      expect(header.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<CardHeader className="custom-header">Test Header</CardHeader>)
      const header = screen.getByText('Test Header')
      expect(header).toHaveClass('custom-header')
    })

    it('applies default classes', () => {
      render(<CardHeader>Test Header</CardHeader>)
      const header = screen.getByText('Test Header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardHeader ref={ref}>Test Header</CardHeader>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<CardHeader data-testid="test-header" id="header-1">Test Header</CardHeader>)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveAttribute('id', 'header-1')
    })
  })

  describe('CardTitle', () => {
    it('renders correctly with default props', () => {
      render(<CardTitle>Test Title</CardTitle>)
      const title = screen.getByText('Test Title')
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<CardTitle className="custom-title">Test Title</CardTitle>)
      const title = screen.getByText('Test Title')
      expect(title).toHaveClass('custom-title')
    })

    it('applies default classes', () => {
      render(<CardTitle>Test Title</CardTitle>)
      const title = screen.getByText('Test Title')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardTitle ref={ref}>Test Title</CardTitle>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<CardTitle data-testid="test-title" id="title-1">Test Title</CardTitle>)
      const title = screen.getByTestId('test-title')
      expect(title).toHaveAttribute('id', 'title-1')
    })
  })

  describe('CardDescription', () => {
    it('renders correctly with default props', () => {
      render(<CardDescription>Test Description</CardDescription>)
      const description = screen.getByText('Test Description')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<CardDescription className="custom-description">Test Description</CardDescription>)
      const description = screen.getByText('Test Description')
      expect(description).toHaveClass('custom-description')
    })

    it('applies default classes', () => {
      render(<CardDescription>Test Description</CardDescription>)
      const description = screen.getByText('Test Description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardDescription ref={ref}>Test Description</CardDescription>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<CardDescription data-testid="test-description" id="description-1">Test Description</CardDescription>)
      const description = screen.getByTestId('test-description')
      expect(description).toHaveAttribute('id', 'description-1')
    })
  })

  describe('CardContent', () => {
    it('renders correctly with default props', () => {
      render(<CardContent>Test Content</CardContent>)
      const content = screen.getByText('Test Content')
      expect(content).toBeInTheDocument()
      expect(content.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<CardContent className="custom-content">Test Content</CardContent>)
      const content = screen.getByText('Test Content')
      expect(content).toHaveClass('custom-content')
    })

    it('applies default classes', () => {
      render(<CardContent>Test Content</CardContent>)
      const content = screen.getByText('Test Content')
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardContent ref={ref}>Test Content</CardContent>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<CardContent data-testid="test-content" id="content-1">Test Content</CardContent>)
      const content = screen.getByTestId('test-content')
      expect(content).toHaveAttribute('id', 'content-1')
    })
  })

  describe('CardFooter', () => {
    it('renders correctly with default props', () => {
      render(<CardFooter>Test Footer</CardFooter>)
      const footer = screen.getByText('Test Footer')
      expect(footer).toBeInTheDocument()
      expect(footer.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<CardFooter className="custom-footer">Test Footer</CardFooter>)
      const footer = screen.getByText('Test Footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('applies default classes', () => {
      render(<CardFooter>Test Footer</CardFooter>)
      const footer = screen.getByText('Test Footer')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardFooter ref={ref}>Test Footer</CardFooter>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<CardFooter data-testid="test-footer" id="footer-1">Test Footer</CardFooter>)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveAttribute('id', 'footer-1')
    })
  })

  describe('Card Composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
      expect(screen.getByText('Card Footer')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(<Card data-testid="empty-card" />)
      const card = screen.getByTestId('empty-card')
      expect(card).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<Card data-testid="null-card">{null}</Card>)
      const card = screen.getByTestId('null-card')
      expect(card).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Card data-testid="undefined-card">{undefined}</Card>)
      const card = screen.getByTestId('undefined-card')
      expect(card).toBeInTheDocument()
    })
  })
})