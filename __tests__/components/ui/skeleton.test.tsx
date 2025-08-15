import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton Component', () => {
  it('renders correctly with default props', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton.tagName).toBe('DIV')
  })

  it('applies default skeleton classes', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton-class" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-skeleton-class')
  })

  it('combines default and custom classes correctly', () => {
    render(<Skeleton className="w-20 h-20" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'w-20', 'h-20')
  })

  it('spreads additional props', () => {
    render(
      <Skeleton 
        data-testid="custom-skeleton" 
        aria-label="Loading skeleton"
        style={{ width: '100px' }}
      />
    )
    const skeleton = screen.getByTestId('custom-skeleton')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading skeleton')
    expect(skeleton).toHaveStyle({ width: '100px' })
  })

  it('maintains accessibility attributes', () => {
    render(
      <Skeleton 
        id="test-skeleton"
        role="status"
        aria-live="polite"
        data-testid="skeleton"
      />
    )
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('id', 'test-skeleton')
    expect(skeleton).toHaveAttribute('role', 'status')
    expect(skeleton).toHaveAttribute('aria-live', 'polite')
  })

  it('handles empty props gracefully', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('can be used as a loading placeholder', () => {
    render(
      <div>
        <Skeleton data-testid="text-skeleton" className="h-4 w-32" />
        <Skeleton data-testid="avatar-skeleton" className="h-12 w-12 rounded-full" />
      </div>
    )
    
    const textSkeleton = screen.getByTestId('text-skeleton')
    const avatarSkeleton = screen.getByTestId('avatar-skeleton')
    
    expect(textSkeleton).toBeInTheDocument()
    expect(avatarSkeleton).toBeInTheDocument()
    expect(textSkeleton).toHaveClass('h-4', 'w-32')
    expect(avatarSkeleton).toHaveClass('h-12', 'w-12', 'rounded-full')
  })
})