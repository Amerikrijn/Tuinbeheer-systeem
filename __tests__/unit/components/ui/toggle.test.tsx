import React from 'react'
import { render, screen } from '@testing-library/react'
import { Toggle } from '@/components/ui/toggle'

describe('Toggle Component - Simplified Tests', () => {
  it('should render with basic content', () => {
    render(<Toggle>Toggle Button</Toggle>)
    
    const toggle = screen.getByRole('button')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveTextContent('Toggle Button')
  })

  it('should render with different variants', () => {
    const { rerender } = render(<Toggle variant="default">Default</Toggle>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Toggle variant="outline">Outline</Toggle>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Toggle variant="secondary">Secondary</Toggle>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<Toggle size="default">Default</Toggle>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Toggle size="sm">Small</Toggle>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Toggle size="lg">Large</Toggle>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Toggle className="custom-toggle">Custom</Toggle>)
    
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('custom-toggle')
  })

  it('should handle disabled state', () => {
    render(<Toggle disabled>Disabled</Toggle>)
    
    const toggle = screen.getByRole('button')
    expect(toggle).toBeDisabled()
  })

  it('should pass through additional props', () => {
    render(<Toggle aria-label="Custom toggle" data-testid="test-toggle">Props</Toggle>)
    
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('aria-label', 'Custom toggle')
    expect(toggle).toHaveAttribute('data-testid', 'test-toggle')
  })

  it('should handle pressed state', () => {
    render(<Toggle data-state="on">Pressed</Toggle>)
    
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('data-state', 'on')
  })
})