import React from 'react'
import { render, screen } from '@testing-library/react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

// Mock Radix UI AspectRatio primitive
jest.mock('@radix-ui/react-aspect-ratio', () => ({
  Root: React.forwardRef((props: any, ref: any) => {
    const { children, className, ratio, ...rest } = props
    return (
      <div 
        className={className} 
        data-ratio={ratio}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    )
  }),
}))

describe('AspectRatio Component', () => {
  it('renders children correctly', () => {
    render(
      <AspectRatio>
        <img src="/test.jpg" alt="Test image" />
      </AspectRatio>
    )
    const image = screen.getByAltText('Test image')
    expect(image).toBeInTheDocument()
  })

  it('renders as div element', () => {
    render(<AspectRatio>Content</AspectRatio>)
    const aspectRatio = screen.getByText('Content').parentElement
    expect(aspectRatio?.tagName).toBe('DIV')
  })

  it('applies custom className', () => {
    render(<AspectRatio className="custom-aspect-ratio-class">Content</AspectRatio>)
    const aspectRatio = screen.getByText('Content').closest('div')
    expect(aspectRatio).toHaveClass('custom-aspect-ratio-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<AspectRatio ref={ref}>Ref Test</AspectRatio>)
    expect(ref).toHaveBeenCalled()
  })

  it('spreads additional props', () => {
    render(
      <AspectRatio 
        data-testid="custom-aspect-ratio" 
        aria-label="Aspect ratio container"
        style={{ width: '100%' }}
      >
        Content
      </AspectRatio>
    )
    const aspectRatio = screen.getByTestId('custom-aspect-ratio')
    expect(aspectRatio).toHaveAttribute('aria-label', 'Aspect ratio container')
    expect(aspectRatio).toHaveStyle({ width: '100%' })
  })

  it('maintains accessibility attributes', () => {
    render(
      <AspectRatio 
        id="test-aspect-ratio"
        role="img"
        aria-label="Image container"
        data-testid="test-aspect-ratio"
      >
        <img src="/test.jpg" alt="Test" />
      </AspectRatio>
    )
    const aspectRatio = screen.getByTestId('test-aspect-ratio')
    expect(aspectRatio).toHaveAttribute('id', 'test-aspect-ratio')
    expect(aspectRatio).toHaveAttribute('aria-label', 'Image container')
  })

  it('can be used to maintain image aspect ratios', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="/test.jpg" alt="16:9 image" />
      </AspectRatio>
    )
    const aspectRatio = screen.getByAltText('16:9 image').parentElement
    expect(aspectRatio).toHaveAttribute('data-ratio', '1.7777777777777777')
  })

  it('handles different aspect ratios', () => {
    const { rerender } = render(
      <AspectRatio ratio={4 / 3}>
        <img src="/test.jpg" alt="4:3 image" />
      </AspectRatio>
    )
    let aspectRatio = screen.getByAltText('4:3 image').parentElement
    expect(aspectRatio).toHaveAttribute('data-ratio', '1.3333333333333333')

    rerender(
      <AspectRatio ratio={1}>
        <img src="/test.jpg" alt="1:1 image" />
      </AspectRatio>
    )
    aspectRatio = screen.getByAltText('1:1 image').parentElement
    expect(aspectRatio).toHaveAttribute('data-ratio', '1')
  })

  it('can contain various content types', () => {
    render(
      <AspectRatio>
        <div>Text content</div>
        <button>Button</button>
        <span>Span content</span>
      </AspectRatio>
    )
    
    expect(screen.getByText('Text content')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Span content')).toBeInTheDocument()
  })
})