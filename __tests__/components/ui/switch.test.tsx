import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from '@/components/ui/switch'

describe('Switch Component', () => {
  it('renders switch element correctly', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement.tagName).toBe('BUTTON') // Radix switch renders as button
  })

  it('applies default classes', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-6', 'w-11', 'shrink-0', 'cursor-pointer')
  })

  it('applies custom className', () => {
    render(<Switch className="custom-class" />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Switch ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <Switch 
        data-testid="custom-switch" 
        aria-label="Custom switch"
        id="test-switch"
      />
    )
    const switchElement = screen.getByTestId('custom-switch')
    expect(switchElement).toHaveAttribute('aria-label', 'Custom switch')
    expect(switchElement).toHaveAttribute('id', 'test-switch')
  })

  it('can be toggled on and off', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
    
    fireEvent.click(switchElement)
    expect(switchElement).toHaveAttribute('data-state', 'checked')
    
    fireEvent.click(switchElement)
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('can be disabled', () => {
    render(<Switch disabled />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
  })

  it('can be controlled with checked prop', () => {
    render(<Switch checked />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('has correct display name', () => {
    // The component uses SwitchPrimitives.Root.displayName
    expect(Switch.displayName).toBeDefined()
    expect(typeof Switch.displayName).toBe('string')
  })
})