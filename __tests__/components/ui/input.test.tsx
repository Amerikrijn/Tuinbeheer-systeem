import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('renders with custom placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('renders with custom value', () => {
    render(<Input value="test value" readOnly />)
    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Input className="custom-input-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <Input 
        data-testid="custom-input" 
        aria-label="Custom input"
        maxLength={10}
      />
    )
    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('aria-label', 'Custom input')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    input = screen.getByDisplayValue('')
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('can be read-only', () => {
    render(<Input readOnly />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
  })

  it('applies default styling classes', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border')
  })

  it('handles focus states correctly', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    input.focus()
    expect(input).toHaveFocus()
  })

  it('maintains accessibility attributes', () => {
    render(
      <Input 
        id="test-input"
        name="test-name"
        aria-describedby="description"
      />
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'test-name')
    expect(input).toHaveAttribute('aria-describedby', 'description')
  })
})