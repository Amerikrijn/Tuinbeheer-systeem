import { render, screen } from '@testing-library/react'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
  it('renders textarea element correctly', () => {
    render(<Textarea placeholder="Enter text" />)
    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('applies default classes', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Textarea ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <Textarea 
        data-testid="custom-textarea" 
        aria-label="Custom textarea"
        placeholder="Test placeholder"
        rows={5}
        cols={50}
      />
    )
    const textarea = screen.getByTestId('custom-textarea')
    expect(textarea).toHaveAttribute('aria-label', 'Custom textarea')
    expect(textarea).toHaveAttribute('placeholder', 'Test placeholder')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea).toHaveAttribute('cols', '50')
  })

  it('can be disabled', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />)
    const textarea = screen.getByPlaceholderText('Disabled textarea')
    expect(textarea).toBeDisabled()
  })

  it('can have a value', () => {
    render(<Textarea defaultValue="Initial value" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Initial value')
  })

  it('has correct display name', () => {
    expect(Textarea.displayName).toBe('Textarea')
  })

  it('handles different textarea attributes', () => {
    render(
      <Textarea 
        name="description"
        maxLength={100}
        minLength={10}
        required
        readOnly
      />
    )
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('name', 'description')
    expect(textarea).toHaveAttribute('maxLength', '100')
    expect(textarea).toHaveAttribute('minLength', '10')
    expect(textarea).toBeRequired()
    expect(textarea).toHaveAttribute('readOnly')
  })
})