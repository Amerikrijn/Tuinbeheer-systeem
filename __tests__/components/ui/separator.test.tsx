import React from 'react'
import { render, screen } from '@testing-library/react'
import { Separator } from '@/components/ui/separator'

// Mock Radix UI Separator primitive
jest.mock('@radix-ui/react-separator', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ className, orientation, decorative, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      data-orientation={orientation}
      data-decorative={decorative}
      className={className}
      {...props}
    />
  ))
}))

describe('Separator Component', () => {
  it('renders correctly with default props', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Separator className="custom-separator" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('custom-separator')
  })

  it('applies default classes', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('shrink-0', 'bg-border')
  })

  it('applies horizontal orientation classes by default', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('h-[1px]', 'w-full')
  })

  it('applies vertical orientation classes when specified', () => {
    render(<Separator orientation="vertical" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('h-full', 'w-[1px]')
  })

  it('sets decorative attribute to true by default', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-decorative', 'true')
  })

  it('sets decorative attribute to false when specified', () => {
    render(<Separator decorative={false} />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-decorative', 'false')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Separator ref={ref} />)
    expect(ref.current).toBeInTheDocument()
    expect(ref.current?.tagName).toBe('DIV')
  })

  it('spreads additional props', () => {
    render(<Separator data-testid="test-separator" id="separator-1" />)
    const separator = screen.getByTestId('test-separator')
    expect(separator).toHaveAttribute('id', 'separator-1')
  })

  it('combines orientation and custom classes correctly', () => {
    render(<Separator orientation="vertical" className="extra-class" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('h-full', 'w-[1px]', 'extra-class')
  })

  it('handles horizontal orientation explicitly', () => {
    render(<Separator orientation="horizontal" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
    expect(separator).toHaveClass('h-[1px]', 'w-full')
  })

  it('handles vertical orientation explicitly', () => {
    render(<Separator orientation="vertical" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
    expect(separator).toHaveClass('h-full', 'w-[1px]')
  })

  it('applies all base classes regardless of orientation', () => {
    render(<Separator orientation="vertical" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('shrink-0', 'bg-border')
  })

  it('handles empty children', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
  })

  it('handles null children', () => {
    render(<Separator>{null}</Separator>)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<Separator>{undefined}</Separator>)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
  })

  it('maintains accessibility role', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
  })

  it('combines multiple custom classes', () => {
    render(<Separator className="class1 class2 class3" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('class1', 'class2', 'class3')
  })
})