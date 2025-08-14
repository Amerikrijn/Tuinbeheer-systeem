import React from 'react'
import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

// Mock Radix UI Progress primitives
jest.mock('@radix-ui/react-progress', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Indicator: React.forwardRef<HTMLDivElement, any>(({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={style}
      {...props}
    />
  ))
}))

describe('Progress Component', () => {
  it('renders correctly with default props', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Progress className="custom-progress" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('custom-progress')
  })

  it('applies default classes', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Progress ref={ref} />)
    expect(ref.current).toBeInTheDocument()
    expect(ref.current?.tagName).toBe('DIV')
  })

  it('spreads additional props', () => {
    render(<Progress data-testid="test-progress" id="progress-1" />)
    const progress = screen.getByTestId('test-progress')
    expect(progress).toHaveAttribute('id', 'progress-1')
  })

  it('renders indicator with correct classes', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div') // Child div is the indicator
    expect(indicator).toHaveClass('h-full', 'w-full', 'flex-1', 'bg-primary', 'transition-all')
  })

  it('handles value prop correctly', () => {
    render(<Progress value={50} />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' })
  })

  it('handles undefined value prop', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' })
  })

  it('handles zero value prop', () => {
    render(<Progress value={0} />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' })
  })

  it('handles 100 value prop', () => {
    render(<Progress value={100} />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' })
  })

  it('combines default and custom classes correctly', () => {
    render(<Progress className="extra-class" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary', 'extra-class')
  })

  it('handles multiple custom classes', () => {
    render(<Progress className="class1 class2 class3" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('class1', 'class2', 'class3')
  })

  it('handles aria attributes', () => {
    render(<Progress aria-label="Upload progress" />)
    const progress = screen.getByLabelText('Upload progress')
    expect(progress).toBeInTheDocument()
  })

  it('handles data attributes', () => {
    render(<Progress data-test="progress-bar" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('data-test', 'progress-bar')
  })

  it('handles value between 0 and 100', () => {
    render(<Progress value={75} />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' })
  })

  it('handles decimal values', () => {
    render(<Progress value={33.5} />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(-66.5%)' })
  })

  it('maintains accessibility role', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toBeInTheDocument()
  })

  it('handles empty children', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toBeInTheDocument()
  })

  it('handles null children', () => {
    render(<Progress>{null}</Progress>)
    const progress = screen.getByRole('progressbar')
    expect(progress).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<Progress>{undefined}</Progress>)
    const progress = screen.getByRole('progressbar')
    expect(progress).toBeInTheDocument()
  })

  it('renders complete progress structure', () => {
    render(<Progress value={50} />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toBeInTheDocument()
    
    // Check that indicator is rendered
    const indicator = progress.querySelector('div')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('h-full', 'w-full', 'flex-1', 'bg-primary', 'transition-all')
  })

  it('handles negative values gracefully', () => {
    render(<Progress value={-10} />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(-110%)' })
  })

  it('handles values over 100 gracefully', () => {
    render(<Progress value={150} />)
    const progress = screen.getByRole('progressbar')
    const indicator = progress.querySelector('div')
    expect(indicator).toHaveStyle({ transform: 'translateX(--50%)' })
  })
})