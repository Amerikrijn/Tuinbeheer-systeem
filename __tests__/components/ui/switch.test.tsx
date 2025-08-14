import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from '@/components/ui/switch'

describe('Switch Component', () => {
  it('renders correctly with default props', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
  })

  it('renders with custom className', () => {
    render(<Switch className="custom-class" />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Switch ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('spreads additional props', () => {
    render(<Switch data-testid="custom-switch" aria-label="Test switch" />)
    const switchElement = screen.getByTestId('custom-switch')
    expect(switchElement).toHaveAttribute('aria-label', 'Test switch')
  })

  it('applies default classes', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-6', 'w-11', 'shrink-0', 'cursor-pointer')
  })

  it('can be disabled', () => {
    render(<Switch disabled />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
  })

  it('can be checked by default', () => {
    render(<Switch defaultChecked />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()
  })

  it('can be controlled', () => {
    render(<Switch checked />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    
    expect(switchElement).not.toBeChecked()
    await user.click(switchElement)
    expect(switchElement).toBeChecked()
  })

  it('can be unchecked', async () => {
    const user = userEvent.setup()
    render(<Switch defaultChecked />)
    const switchElement = screen.getByRole('switch')
    
    expect(switchElement).toBeChecked()
    await user.click(switchElement)
    expect(switchElement).not.toBeChecked()
  })

  it('renders with custom id', () => {
    render(<Switch id="test-switch" />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('id', 'test-switch')
  })

  it('has correct ARIA attributes', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('role', 'switch')
  })
})