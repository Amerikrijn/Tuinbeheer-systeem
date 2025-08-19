import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox Component', () => {
  it('renders checkbox element correctly', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.tagName).toBe('BUTTON') // Radix checkbox renders as button
  })

  it('applies default classes', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('peer', 'h-4', 'w-4', 'shrink-0', 'rounded-sm', 'border')
  })

  it('applies custom className', () => {
    render(<Checkbox className="custom-class" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Checkbox ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <Checkbox 
        data-testid="custom-checkbox" 
        aria-label="Custom checkbox"
        id="test-checkbox"
      />
    )
    const checkbox = screen.getByTestId('custom-checkbox')
    expect(checkbox).toHaveAttribute('aria-label', 'Custom checkbox')
    expect(checkbox).toHaveAttribute('id', 'test-checkbox')
  })

  it('can be checked and unchecked', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    
    expect(checkbox).not.toBeChecked()
    
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('can be disabled', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('can be controlled with checked prop', () => {
    render(<Checkbox checked />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('has correct display name', () => {
    expect(Checkbox.displayName).toBe('Checkbox')
  })
})