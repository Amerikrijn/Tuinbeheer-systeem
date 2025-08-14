import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      // Check that the card wrapper exists
      expect(card.closest('div')).toBeInTheDocument()
    })

    it('should render card with custom className', () => {
      render(<Card className="custom-card">Custom card</Card>)
      
      const card = screen.getByText('Custom card')
      expect(card).toBeInTheDocument()
      // Check that the custom class is applied to the card wrapper
      expect(card.closest('div')).toHaveClass('custom-card')
    })
  })

  describe('CardHeader', () => {
    it('should render card header with children', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex flex-col space-y-1.5 p-6')
    })

    it('should render card header with custom className', () => {
      render(<CardHeader className="custom-header">Custom header</CardHeader>)
      
      const header = screen.getByText('Custom header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render card title with children', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight')
    })

    it('should render card title with custom className', () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>)
      
      const title = screen.getByText('Custom Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render card description with children', () => {
      render(<CardDescription>Card description</CardDescription>)
      
      const description = screen.getByText('Card description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm text-muted-foreground')
    })

    it('should render card description with custom className', () => {
      render(<CardDescription className="custom-description">Custom description</CardDescription>)
      
      const description = screen.getByText('Custom description')
      expect(description).toHaveClass('custom-description')
    })
  })

  describe('CardContent', () => {
    it('should render card content with children', () => {
      render(<CardContent>Content here</CardContent>)
      
      const content = screen.getByText('Content here')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6 pt-0')
    })

    it('should render card content with custom className', () => {
      render(<CardContent className="custom-content">Custom content</CardContent>)
      
      const content = screen.getByText('Custom content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('should render card footer with children', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex items-center p-6 pt-0')
    })

    it('should render card footer with custom className', () => {
      render(<CardFooter className="custom-footer">Custom footer</CardFooter>)
      
      const footer = screen.getByText('Custom footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Card Composition', () => {
    it('should render complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument()
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument()
      expect(screen.getByText('Action Button')).toBeInTheDocument()
    })

    it('should handle nested content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <h3>Nested Title</h3>
              <p>Nested paragraph</p>
            </div>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Nested Title')).toBeInTheDocument()
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument()
    })
  })
})