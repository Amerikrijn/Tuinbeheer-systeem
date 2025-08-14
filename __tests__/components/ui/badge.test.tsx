import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('renders correctly with default props', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toBeInTheDocument()
    expect(badge.tagName).toBe('DIV')
  })

  it('renders with custom className', () => {
    render(<Badge className="custom-class">Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('applies default variant classes', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground')
  })

  it('applies secondary variant classes', () => {
    render(<Badge variant="secondary">Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground')
  })

  it('applies destructive variant classes', () => {
    render(<Badge variant="destructive">Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground')
  })

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('text-foreground')
  })



  it('spreads additional props', () => {
    render(<Badge data-testid="test-badge" id="badge-1">Test Badge</Badge>)
    const badge = screen.getByTestId('test-badge')
    expect(badge).toHaveAttribute('id', 'badge-1')
  })

  it('applies base classes', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border')
  })

  it('applies sizing classes', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs')
  })

  it('applies typography classes', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('font-semibold')
  })

  it('applies transition classes', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('transition-colors')
  })

  it('applies focus classes', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2')
  })

  it('handles empty children', () => {
    render(<Badge data-testid="badge-container" />)
    const badge = screen.getByTestId('badge-container')
    expect(badge).toBeInTheDocument()
  })

  it('handles null children', () => {
    render(<Badge data-testid="badge-container">{null}</Badge>)
    const badge = screen.getByTestId('badge-container')
    expect(badge).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<Badge data-testid="badge-container">{undefined}</Badge>)
    const badge = screen.getByTestId('badge-container')
    expect(badge).toBeInTheDocument()
  })

  it('combines variant and custom classes correctly', () => {
    render(<Badge variant="secondary" className="extra-class">Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('bg-secondary', 'extra-class')
  })
})