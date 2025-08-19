import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders alert element correctly', () => {
      render(<Alert>Alert content</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert.tagName).toBe('DIV')
    })

    it('applies default variant classes', () => {
      render(<Alert>Default Alert</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4')
      expect(alert).toHaveClass('bg-background', 'text-foreground')
    })

    it('applies destructive variant classes', () => {
      render(<Alert variant="destructive">Destructive Alert</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive')
    })

    it('applies custom className', () => {
      render(<Alert className="custom-alert">Custom Alert</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-alert')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Alert ref={ref}>Ref Test</Alert>)
      expect(ref).toHaveBeenCalled()
    })

    it('spreads additional props', () => {
      render(
        <Alert 
          data-testid="custom-alert" 
          aria-label="Custom alert"
        >
          Props Test
        </Alert>
      )
      const alert = screen.getByTestId('custom-alert')
      expect(alert).toHaveAttribute('aria-label', 'Custom alert')
    })

    it('has correct display name', () => {
      expect(Alert.displayName).toBe('Alert')
    })
  })

  describe('AlertTitle', () => {
    it('renders title correctly', () => {
      render(<AlertTitle>Alert Title</AlertTitle>)
      const title = screen.getByText('Alert Title')
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('H5')
    })

    it('applies default classes', () => {
      render(<AlertTitle>Test</AlertTitle>)
      const title = screen.getByText('Test')
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight')
    })

    it('applies custom className', () => {
      render(<AlertTitle className="custom-title">Custom Title</AlertTitle>)
      const title = screen.getByText('Custom Title')
      expect(title).toHaveClass('custom-title')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<AlertTitle ref={ref}>Ref Test</AlertTitle>)
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(AlertTitle.displayName).toBe('AlertTitle')
    })
  })

  describe('AlertDescription', () => {
    it('renders description correctly', () => {
      render(<AlertDescription>Alert Description</AlertDescription>)
      const description = screen.getByText('Alert Description')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('DIV')
    })

    it('applies default classes', () => {
      render(<AlertDescription>Test</AlertDescription>)
      const description = screen.getByText('Test')
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed')
    })

    it('applies custom className', () => {
      render(<AlertDescription className="custom-desc">Custom Description</AlertDescription>)
      const description = screen.getByText('Custom Description')
      expect(description).toHaveClass('custom-desc')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<AlertDescription ref={ref}>Ref Test</AlertDescription>)
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(AlertDescription.displayName).toBe('AlertDescription')
    })
  })

  describe('Alert composition', () => {
    it('renders complete alert structure', () => {
      render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
          <AlertDescription>Test Description</AlertDescription>
        </Alert>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders with icon and content', () => {
      render(
        <Alert>
          <svg data-testid="alert-icon" />
          <div>Alert content</div>
        </Alert>
      )

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
      expect(screen.getByText('Alert content')).toBeInTheDocument()
    })
  })
})