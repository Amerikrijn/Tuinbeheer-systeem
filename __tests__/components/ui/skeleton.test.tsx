import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton Component', () => {
  it('renders skeleton element correctly', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton.tagName).toBe('DIV')
  })

  it('applies default classes', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-skeleton')
  })

  it('spreads additional props', () => {
    render(
      <Skeleton 
        data-testid="custom-skeleton" 
        aria-label="Loading skeleton"
        id="test-skeleton"
        style={{ width: '100px', height: '20px' }}
      />
    )
    const skeleton = screen.getByTestId('custom-skeleton')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading skeleton')
    expect(skeleton).toHaveAttribute('id', 'test-skeleton')
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' })
  })

  it('can render with children', () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Loading content</span>
      </Skeleton>
    )
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveTextContent('Loading content')
  })

  it('can be used as a loading placeholder', () => {
    render(
      <div>
        <Skeleton data-testid="title-skeleton" className="h-8 w-32" />
        <Skeleton data-testid="content-skeleton" className="h-20 w-full mt-4" />
      </div>
    )
    
    const titleSkeleton = screen.getByTestId('title-skeleton')
    const contentSkeleton = screen.getByTestId('content-skeleton')
    
    expect(titleSkeleton).toHaveClass('h-8', 'w-32')
    expect(contentSkeleton).toHaveClass('h-20', 'w-full', 'mt-4')
  })
})