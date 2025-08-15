import React from 'react'
import { render, screen } from '@testing-library/react'
import { Separator } from '@/components/ui/separator'

// Mock Radix UI Separator primitive
jest.mock('@radix-ui/react-separator', () => ({
  Root: React.forwardRef(({ className, orientation, decorative, ...props }: any, ref) => (
    <div 
      role="separator" 
      className={className} 
      data-orientation={orientation}
      data-decorative={decorative}
      ref={ref}
      {...props}
    />
  )),
}))

describe('Separator Component', () => {
  it('renders correctly with default props', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
    expect(separator.tagName).toBe('DIV')
  })

  it('applies default orientation (horizontal)', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('applies vertical orientation correctly', () => {
    render(<Separator orientation="vertical" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
  })

  it('applies default decorative prop (true)', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-decorative', 'true')
  })

  it('applies decorative false correctly', () => {
    render(<Separator decorative={false} />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('data-decorative', 'false')
  })

  it('applies default styling classes', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('shrink-0', 'bg-border')
  })

  it('applies horizontal orientation classes', () => {
    render(<Separator orientation="horizontal" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('h-[1px]', 'w-full')
  })

  it('applies vertical orientation classes', () => {
    render(<Separator orientation="vertical" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('h-full', 'w-[1px]')
  })

  it('applies custom className', () => {
    render(<Separator className="custom-separator-class" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('custom-separator-class')
  })

  it('combines default and custom classes correctly', () => {
    render(<Separator className="my-4" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('shrink-0', 'bg-border', 'my-4')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Separator ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <Separator 
        data-testid="custom-separator" 
        aria-label="Content separator"
        style={{ margin: '20px' }}
      />
    )
    const separator = screen.getByTestId('custom-separator')
    expect(separator).toHaveAttribute('aria-label', 'Content separator')
    expect(separator).toHaveStyle({ margin: '20px' })
  })

  it('maintains accessibility attributes', () => {
    render(
      <Separator 
        id="test-separator"
        role="separator"
        aria-orientation="horizontal"
      />
    )
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('id', 'test-separator')
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('handles orientation changes correctly', () => {
    const { rerender } = render(<Separator orientation="horizontal" />)
    let separator = screen.getByRole('separator')
    expect(separator).toHaveClass('h-[1px]', 'w-full')

    rerender(<Separator orientation="vertical" />)
    separator = screen.getByRole('separator')
    expect(separator).toHaveClass('h-full', 'w-[1px]')
  })

  it('can be used as a visual divider', () => {
    render(
      <div>
        <div>Content above</div>
        <Separator className="my-4" />
        <div>Content below</div>
      </div>
    )
    
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('my-4')
  })
})