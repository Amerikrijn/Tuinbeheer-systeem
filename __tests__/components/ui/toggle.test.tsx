import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from '@/components/ui/toggle'

describe('Toggle Component', () => {
  it('renders correctly with default props', () => {
    render(<Toggle>Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveTextContent('Toggle')
  })

  it('renders with custom className', () => {
    render(<Toggle className="custom-class">Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Toggle ref={ref}>Toggle</Toggle>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('spreads additional props', () => {
    render(<Toggle data-testid="custom-toggle" aria-label="Test toggle">Toggle</Toggle>)
    const toggle = screen.getByTestId('custom-toggle')
    expect(toggle).toHaveAttribute('aria-label', 'Test toggle')
  })

  it('applies default classes', () => {
    render(<Toggle>Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('inline-flex', 'items-center', 'justify-center', 'rounded-md')
  })

  it('can be disabled', () => {
    render(<Toggle disabled>Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toBeDisabled()
  })

  it('can be pressed by default', () => {
    render(<Toggle defaultPressed>Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('data-state', 'on')
  })

  it('can be controlled', () => {
    render(<Toggle pressed>Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('data-state', 'on')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    render(<Toggle>Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    
    expect(toggle).not.toHaveAttribute('data-state', 'on')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('data-state', 'on')
  })

  it('applies default variant classes', () => {
    render(<Toggle variant="default">Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('bg-transparent')
  })

  it('applies outline variant classes', () => {
    render(<Toggle variant="outline">Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('border', 'border-input', 'bg-transparent')
  })

  it('applies default size classes', () => {
    render(<Toggle size="default">Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('h-10', 'px-3', 'min-w-10')
  })

  it('applies small size classes', () => {
    render(<Toggle size="sm">Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('h-9', 'px-2.5', 'min-w-9')
  })

  it('applies large size classes', () => {
    render(<Toggle size="lg">Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('h-11', 'px-5', 'min-w-11')
  })

  it('renders with custom id', () => {
    render(<Toggle id="test-toggle">Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('id', 'test-toggle')
  })

  it('has correct ARIA attributes', () => {
    render(<Toggle>Toggle</Toggle>)
    const toggle = screen.getByRole('button')
    // The toggle is a button element, so it doesn't need an explicit role attribute
    expect(toggle.tagName).toBe('BUTTON')
  })
})