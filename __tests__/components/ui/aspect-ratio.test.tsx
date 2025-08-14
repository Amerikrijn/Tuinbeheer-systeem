import React from 'react'
import { render, screen } from '@testing-library/react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

// Mock Radix UI components with proper ref forwarding
jest.mock('@radix-ui/react-aspect-ratio', () => ({
  Root: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div 
      ref={ref} 
      className={`relative w-full overflow-hidden ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )),
}))

describe('AspectRatio Component', () => {
  it('renders correctly with default props', () => {
    render(<AspectRatio data-testid="test-aspect-ratio" />)
    expect(screen.getByTestId('test-aspect-ratio')).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(
      <AspectRatio data-testid="test-aspect-ratio">
        <div data-testid="child">Child content</div>
      </AspectRatio>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<AspectRatio className="custom-class" data-testid="test-aspect-ratio" />)
    const aspectRatio = screen.getByTestId('test-aspect-ratio')
    expect(aspectRatio).toHaveClass('custom-class')
  })

  it('applies default classes', () => {
    render(<AspectRatio data-testid="test-aspect-ratio" />)
    const aspectRatio = screen.getByTestId('test-aspect-ratio')
    expect(aspectRatio).toHaveClass('relative', 'w-full', 'overflow-hidden')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<AspectRatio ref={ref} data-testid="test-aspect-ratio" />)
    expect(ref.current).toBeInTheDocument()
  })

  it('spreads additional props', () => {
    render(<AspectRatio data-testid="test-aspect-ratio" aria-label="Test aspect ratio" />)
    const aspectRatio = screen.getByTestId('test-aspect-ratio')
    expect(aspectRatio).toHaveAttribute('aria-label', 'Test aspect ratio')
  })

  it('handles empty children', () => {
    render(<AspectRatio data-testid="test-aspect-ratio" />)
    expect(screen.getByTestId('test-aspect-ratio')).toBeInTheDocument()
  })

  it('handles null children', () => {
    render(<AspectRatio data-testid="test-aspect-ratio">{null}</AspectRatio>)
    expect(screen.getByTestId('test-aspect-ratio')).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<AspectRatio data-testid="test-aspect-ratio">{undefined}</AspectRatio>)
    expect(screen.getByTestId('test-aspect-ratio')).toBeInTheDocument()
  })

  it('combines multiple props correctly', () => {
    render(
      <AspectRatio 
        className="custom-class" 
        data-testid="test-aspect-ratio" 
        aria-label="Test"
        style={{ width: '100px' }}
      />
    )
    const aspectRatio = screen.getByTestId('test-aspect-ratio')
    expect(aspectRatio).toHaveClass('custom-class')
    expect(aspectRatio).toHaveAttribute('aria-label', 'Test')
    expect(aspectRatio).toHaveStyle({ width: '100px' })
  })
})