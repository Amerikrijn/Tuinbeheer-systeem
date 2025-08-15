import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

// Mock Radix UI Label primitive
jest.mock('@radix-ui/react-label', () => ({
  Root: React.forwardRef((props: any, ref: any) => {
    const { children, className, ...rest } = props
    return (
      <label className={className} ref={ref} {...rest}>
        {children}
      </label>
    )
  }),
}))

describe('Label Component', () => {
  it('renders children correctly', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders as label element', () => {
    render(<Label>Test</Label>)
    const label = screen.getByText('Test')
    expect(label.tagName).toBe('LABEL')
  })

  it('applies default variant classes', () => {
    render(<Label>Default Label</Label>)
    const label = screen.getByText('Default Label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('applies custom className', () => {
    render(<Label className="custom-label-class">Custom</Label>)
    const label = screen.getByText('Custom')
    expect(label).toHaveClass('custom-label-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Label ref={ref}>Ref Test</Label>)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <Label 
        data-testid="custom-label" 
        htmlFor="input-id"
        aria-describedby="description"
      >
        Props Test
      </Label>
    )
    const label = screen.getByTestId('custom-label')
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).toHaveAttribute('aria-describedby', 'description')
  })

  it('maintains accessibility attributes', () => {
    render(
      <Label 
        id="test-label"
        className="test-class"
      >
        Accessible Label
      </Label>
    )
    const label = screen.getByText('Accessible Label')
    expect(label).toHaveAttribute('id', 'test-label')
    expect(label).toHaveClass('test-class')
  })

  it('handles empty children gracefully', () => {
    render(<Label />)
    const label = screen.getByRole('generic')
    expect(label).toBeInTheDocument()
  })

  it('combines default and custom classes correctly', () => {
    render(<Label className="additional-class">Combined</Label>)
    const label = screen.getByText('Combined')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none', 'additional-class')
  })
})