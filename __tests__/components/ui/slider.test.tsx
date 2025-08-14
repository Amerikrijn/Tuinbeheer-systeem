import React from 'react'
import { render, screen } from '@testing-library/react'
import { Slider } from '@/components/ui/slider'

// Mock Radix UI Slider primitives
jest.mock('@radix-ui/react-slider', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ className, children, disabled, ...props }, ref) => (
    <div
      ref={ref}
      role="slider"
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </div>
  )),
  Track: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Range: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  )),
  Thumb: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  ))
}))

describe('Slider Component', () => {
  it('renders correctly with default props', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Slider className="custom-slider" />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('custom-slider')
  })

  it('applies default classes', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('relative', 'flex', 'w-full', 'touch-none', 'select-none', 'items-center')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Slider ref={ref} />)
    expect(ref.current).toBeInTheDocument()
    expect(ref.current?.tagName).toBe('DIV')
  })

  it('spreads additional props', () => {
    render(<Slider data-testid="test-slider" id="slider-1" />)
    const slider = screen.getByTestId('test-slider')
    expect(slider).toHaveAttribute('id', 'slider-1')
  })

  it('renders track with correct classes', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    const track = slider.querySelector('div') // First child div is the track
    expect(track).toHaveClass('relative', 'h-2', 'w-full', 'grow', 'overflow-hidden', 'rounded-full', 'bg-secondary')
  })

  it('renders range with correct classes', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    const range = slider.querySelectorAll('div')[1] // Second child div is the range
    expect(range).toHaveClass('absolute', 'h-full', 'bg-primary')
  })

  it('renders thumb with correct classes', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    const thumb = slider.querySelectorAll('div')[2] // Third child div is the thumb
    expect(thumb).toHaveClass('block', 'h-5', 'w-5', 'rounded-full', 'border-2', 'border-primary', 'bg-background')
  })

  it('combines default and custom classes correctly', () => {
    render(<Slider className="extra-class" />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('relative', 'flex', 'w-full', 'touch-none', 'select-none', 'items-center', 'extra-class')
  })

  it('handles multiple custom classes', () => {
    render(<Slider className="class1 class2 class3" />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('class1', 'class2', 'class3')
  })

  it('handles aria attributes', () => {
    render(<Slider aria-label="Volume control" />)
    const slider = screen.getByLabelText('Volume control')
    expect(slider).toBeInTheDocument()
  })

  it('handles data attributes', () => {
    render(<Slider data-orientation="horizontal" />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('handles value props', () => {
    render(<Slider defaultValue={[50]} max={100} step={1} />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Slider disabled />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('disabled')
  })

  it('handles min and max values', () => {
    render(<Slider min={0} max={100} />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('handles step value', () => {
    render(<Slider step={5} />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('handles orientation', () => {
    render(<Slider orientation="vertical" />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('maintains accessibility role', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('handles empty children', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('handles null children', () => {
    render(<Slider>{null}</Slider>)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<Slider>{undefined}</Slider>)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('renders complete slider structure', () => {
    render(<Slider />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
    
    // Check that all three sub-components are rendered
    const children = slider.querySelectorAll('div')
    expect(children).toHaveLength(3) // Track, Range, Thumb
  })
})