import { render, screen } from '@testing-library/react'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
  it('renders correctly with default props', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('renders with custom placeholder text', () => {
    render(<Textarea placeholder="Enter your message here" />)
    const textarea = screen.getByPlaceholderText('Enter your message here')
    expect(textarea).toBeInTheDocument()
  })

  it('renders with custom value', () => {
    render(<Textarea value="This is a test message" readOnly />)
    const textarea = screen.getByDisplayValue('This is a test message')
    expect(textarea).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea-class" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-textarea-class')
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
        aria-label="Message textarea"
        maxLength={500}
        rows={5}
        cols={50}
      />
    )
    const textarea = screen.getByTestId('custom-textarea')
    expect(textarea).toHaveAttribute('aria-label', 'Message textarea')
    expect(textarea).toHaveAttribute('maxLength', '500')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea).toHaveAttribute('cols', '50')
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('can be read-only', () => {
    render(<Textarea readOnly />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('readonly')
  })

  it('applies default styling classes', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border')
  })

  it('handles focus states correctly', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    textarea.focus()
    expect(textarea).toHaveFocus()
  })

  it('maintains accessibility attributes', () => {
    render(
      <Textarea 
        id="test-textarea"
        name="message"
        aria-describedby="description"
        required
      />
    )
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'test-textarea')
    expect(textarea).toHaveAttribute('name', 'message')
    expect(textarea).toHaveAttribute('aria-describedby', 'description')
    expect(textarea).toHaveAttribute('required')
  })

  it('handles different textarea sizes', () => {
    const { rerender } = render(<Textarea rows={3} />)
    let textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '3')

    rerender(<Textarea rows={10} />)
    textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '10')
  })

  it('can be used for form submissions', () => {
    render(
      <form>
        <Textarea name="comment" defaultValue="User comment" />
        <button type="submit">Submit</button>
      </form>
    )
    
    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button')
    
    expect(textarea).toHaveAttribute('name', 'comment')
    expect(textarea).toHaveDisplayValue('User comment')
    expect(submitButton).toBeInTheDocument()
  })

  it('handles multiline text correctly', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3'
    
    render(<Textarea value={multilineText} readOnly />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(multilineText)
  })

  it('can be styled with custom dimensions', () => {
    render(<Textarea className="h-32 w-96" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('h-32', 'w-96')
  })

  it('maintains proper form behavior', () => {
    render(
      <Textarea 
        name="feedback"
        placeholder="Enter feedback"
        required
        aria-required="true"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('name', 'feedback')
    expect(textarea).toHaveAttribute('placeholder', 'Enter feedback')
    expect(textarea).toHaveAttribute('required')
    expect(textarea).toHaveAttribute('aria-required', 'true')
  })
})