import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '@/components/ui/checkbox'

// Mock Radix UI Checkbox primitives
jest.mock('@radix-ui/react-checkbox', () => ({
  Root: React.forwardRef(({ children, className, checked, onCheckedChange, disabled, ...props }: any, ref) => (
    <button 
      type="button"
      role="checkbox" 
      className={className} 
      data-state={checked ? 'checked' : 'unchecked'}
      aria-checked={checked || false}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )),
  Indicator: ({ children, className, ...props }: any) => (
    <span 
      className={className} 
      data-testid="checkbox-indicator"
      {...props}
    >
      {children}
    </span>
  ),
}))

// Mock lucide-react Check icon
jest.mock('lucide-react', () => ({
  Check: ({ className, ...props }: any) => (
    <svg 
      className={className} 
      data-testid="check-icon"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
}))

describe('Checkbox Component', () => {
  it('renders correctly with default props', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.tagName).toBe('BUTTON')
  })

  it('renders in unchecked state by default', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  it('renders in checked state when checked prop is true', () => {
    render(<Checkbox checked={true} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'checked')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  it('renders checkbox indicator', () => {
    render(<Checkbox />)
    const indicator = screen.getByTestId('checkbox-indicator')
    expect(indicator).toBeInTheDocument()
  })

  it('renders check icon', () => {
    render(<Checkbox />)
    const checkIcon = screen.getByTestId('check-icon')
    expect(checkIcon).toBeInTheDocument()
  })

  it('applies default styling classes', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('peer', 'h-4', 'w-4', 'shrink-0', 'rounded-sm', 'border')
  })

  it('applies custom className', () => {
    render(<Checkbox className="custom-checkbox-class" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox-class')
  })

  it('combines default and custom classes correctly', () => {
    render(<Checkbox className="h-6 w-6" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('peer', 'shrink-0', 'rounded-sm', 'border', 'h-6', 'w-6')
  })

  it('can be disabled', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('applies disabled styling when disabled', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
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
        aria-label="Accept terms"
        id="terms-checkbox"
      />
    )
    const checkbox = screen.getByTestId('custom-checkbox')
    expect(checkbox).toHaveAttribute('aria-label', 'Accept terms')
    expect(checkbox).toHaveAttribute('id', 'terms-checkbox')
  })

  it('maintains accessibility attributes', () => {
    render(
      <Checkbox 
        id="test-checkbox"
        aria-describedby="description"
        aria-required="true"
      />
    )
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('id', 'test-checkbox')
    expect(checkbox).toHaveAttribute('aria-describedby', 'description')
    expect(checkbox).toHaveAttribute('aria-required', 'true')
  })

  it('handles state changes correctly', () => {
    const handleCheckedChange = jest.fn()
    render(<Checkbox onCheckedChange={handleCheckedChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('can be used in forms', () => {
    render(
      <form>
        <Checkbox name="agree" id="agree-checkbox" />
        <label htmlFor="agree-checkbox">I agree to the terms</label>
        <button type="submit">Submit</button>
      </form>
    )
    
    const checkbox = screen.getByRole('checkbox')
    const label = screen.getByText('I agree to the terms')
    const submitButton = screen.getByRole('button')
    
    expect(checkbox).toHaveAttribute('id', 'agree-checkbox')
    expect(label).toHaveAttribute('for', 'agree-checkbox')
    expect(submitButton).toBeInTheDocument()
  })

  it('can be controlled component', () => {
    const { rerender } = render(<Checkbox checked={false} />)
    let checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')

    rerender(<Checkbox checked={true} />)
    checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  it('maintains proper ARIA roles and states', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    
    expect(checkbox).toHaveAttribute('role', 'checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    expect(checkbox).toHaveAttribute('type', 'button')
  })

  it('can be used in checkbox groups', () => {
    render(
      <div role="group" aria-labelledby="preferences">
        <h3 id="preferences">Preferences</h3>
        <Checkbox id="email" aria-label="Email notifications" />
        <Checkbox id="sms" aria-label="SMS notifications" />
        <Checkbox id="push" aria-label="Push notifications" />
      </div>
    )
    
    const group = screen.getByRole('group')
    const checkboxes = screen.getAllByRole('checkbox')
    
    expect(group).toHaveAttribute('aria-labelledby', 'preferences')
    expect(checkboxes).toHaveLength(3)
    expect(checkboxes[0]).toHaveAttribute('aria-label', 'Email notifications')
    expect(checkboxes[1]).toHaveAttribute('aria-label', 'SMS notifications')
    expect(checkboxes[2]).toHaveAttribute('aria-label', 'Push notifications')
  })
})