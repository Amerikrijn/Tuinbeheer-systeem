import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('renders badge element correctly', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toBeInTheDocument()
    expect(badge.tagName).toBe('DIV')
  })

  it('applies default variant classes', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold')
    expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground')
  })

  it('applies secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>)
    const badge = screen.getByText('Secondary Badge')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('applies destructive variant classes', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>)
    const badge = screen.getByText('Destructive Badge')
    expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline Badge</Badge>)
    const badge = screen.getByText('Outline Badge')
    expect(badge).toHaveClass('text-foreground')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom Badge</Badge>)
    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-badge')
  })

  it('spreads additional props', () => {
    render(
      <Badge 
        data-testid="custom-badge" 
        aria-label="Custom badge"
        id="test-badge"
      >
        Props Test
      </Badge>
    )
    const badge = screen.getByTestId('custom-badge')
    expect(badge).toHaveAttribute('aria-label', 'Custom badge')
    expect(badge).toHaveAttribute('id', 'test-badge')
  })

  it('handles different variant combinations', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-primary')

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('text-foreground')
  })

  it('maintains base classes across all variants', () => {
    render(<Badge variant="secondary">Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold')
  })
})