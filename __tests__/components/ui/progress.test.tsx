import React from 'react'
import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

// Mock Radix UI Progress primitives
jest.mock('@radix-ui/react-progress', () => ({
  Root: React.forwardRef(({ children, className, ...props }: any, ref) => (
    <div 
      role="progressbar" 
      className={className} 
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )),
  Indicator: ({ className, style, ...props }: any) => (
    <div 
      className={className} 
      style={style}
      data-testid="progress-indicator"
      {...props}
    />
  ),
}))

describe('Progress Component', () => {
  it('renders correctly with default props', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toBeInTheDocument()
    expect(progress.tagName).toBe('DIV')
  })

  it('applies default styling classes', () => {
    render(<Progress />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary')
  })

  it('applies custom className', () => {
    render(<Progress className="custom-progress-class" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('custom-progress-class')
  })

  it('combines default and custom classes correctly', () => {
    render(<Progress className="h-8" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('relative', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary', 'h-8')
  })

  it('renders progress indicator', () => {
    render(<Progress value={75} />)
    const indicator = screen.getByTestId('progress-indicator')
    expect(indicator).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Progress ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <Progress 
        data-testid="custom-progress" 
        aria-label="Download progress"
        style={{ width: '200px' }}
      />
    )
    const progress = screen.getByTestId('custom-progress')
    expect(progress).toHaveAttribute('aria-label', 'Download progress')
    expect(progress).toHaveStyle({ width: '200px' })
  })

  it('maintains accessibility attributes', () => {
    render(
      <Progress 
        id="test-progress"
        value={25}
        aria-describedby="description"
      />
    )
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('id', 'test-progress')
    expect(progress).toHaveAttribute('aria-describedby', 'description')
  })

  it('can be used for different progress types', () => {
    render(
      <div>
        <Progress value={30} className="mb-2" />
        <Progress value={60} className="mb-2" />
        <Progress value={90} />
      </div>
    )
    
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(3)
  })
})