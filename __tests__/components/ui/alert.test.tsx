import React from 'react'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders correctly with default props', () => {
      render(<Alert data-testid="test-alert" />)
      expect(screen.getByTestId('test-alert')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Alert className="custom-class" data-testid="test-alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveClass('custom-class')
    })

    it('applies default variant classes', () => {
      render(<Alert data-testid="test-alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveClass('bg-background', 'text-foreground')
    })

    it('applies destructive variant classes', () => {
      render(<Alert variant="destructive" data-testid="test-alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive', 'dark:border-destructive')
    })

    it('applies base classes', () => {
      render(<Alert data-testid="test-alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4')
    })

    it('has correct role attribute', () => {
      render(<Alert data-testid="test-alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveAttribute('role', 'alert')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Alert ref={ref} data-testid="test-alert" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Alert data-testid="test-alert" aria-label="Test alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveAttribute('aria-label', 'Test alert')
    })

    it('renders children correctly', () => {
      render(
        <Alert>
          <div data-testid="child">Child content</div>
        </Alert>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('AlertTitle', () => {
    it('renders correctly with default props', () => {
      render(<AlertTitle data-testid="test-title" />)
      expect(screen.getByTestId('test-title')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<AlertTitle className="custom-class" data-testid="test-title" />)
      const title = screen.getByTestId('test-title')
      expect(title).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<AlertTitle data-testid="test-title" />)
      const title = screen.getByTestId('test-title')
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight')
    })

    it('renders as h5 element', () => {
      render(<AlertTitle data-testid="test-title" />)
      const title = screen.getByTestId('test-title')
      expect(title.tagName).toBe('H5')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      render(<AlertTitle ref={ref} data-testid="test-title" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<AlertTitle data-testid="test-title" aria-label="Test title" />)
      const title = screen.getByTestId('test-title')
      expect(title).toHaveAttribute('aria-label', 'Test title')
    })

    it('renders children correctly', () => {
      render(
        <AlertTitle>
          <span data-testid="title-text">Title text</span>
        </AlertTitle>
      )
      expect(screen.getByTestId('title-text')).toBeInTheDocument()
    })
  })

  describe('AlertDescription', () => {
    it('renders correctly with default props', () => {
      render(<AlertDescription data-testid="test-description" />)
      expect(screen.getByTestId('test-description')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<AlertDescription className="custom-class" data-testid="test-description" />)
      const description = screen.getByTestId('test-description')
      expect(description).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<AlertDescription data-testid="test-description" />)
      const description = screen.getByTestId('test-description')
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed')
    })

    it('renders as div element', () => {
      render(<AlertDescription data-testid="test-description" />)
      const description = screen.getByTestId('test-description')
      expect(description.tagName).toBe('DIV')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<AlertDescription ref={ref} data-testid="test-description" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<AlertDescription data-testid="test-description" aria-label="Test description" />)
      const description = screen.getByTestId('test-description')
      expect(description).toHaveAttribute('aria-label', 'Test description')
    })

    it('renders children correctly', () => {
      render(
        <AlertDescription>
          <p data-testid="description-text">Description text</p>
        </AlertDescription>
      )
      expect(screen.getByTestId('description-text')).toBeInTheDocument()
    })
  })

  describe('Alert Composition', () => {
    it('renders complete alert structure', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert description text</AlertDescription>
        </Alert>
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert description text')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <Alert>
          <AlertTitle></AlertTitle>
          <AlertDescription></AlertDescription>
        </Alert>
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <Alert>
          <AlertTitle>{null}</AlertTitle>
          <AlertDescription>{null}</AlertDescription>
        </Alert>
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <Alert>
          <AlertTitle>{undefined}</AlertTitle>
          <AlertDescription>{undefined}</AlertDescription>
        </Alert>
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<Alert className="custom-alert-class" data-testid="test-alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveClass('custom-alert-class')
      expect(alert).toHaveClass('bg-background', 'text-foreground')
    })

    it('handles multiple custom classes', () => {
      render(<Alert className="class1 class2 class3" data-testid="test-alert" />)
      const alert = screen.getByTestId('test-alert')
      expect(alert).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains accessibility role', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})