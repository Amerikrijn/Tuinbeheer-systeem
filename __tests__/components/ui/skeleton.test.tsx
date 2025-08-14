import React from 'react'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton Component', () => {
  it('renders correctly with default props', () => {
    render(<Skeleton data-testid="default-skeleton" />)
    const skeleton = screen.getByTestId('default-skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton.tagName).toBe('DIV')
  })

  it('renders with custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="custom-skeleton" />)
    const skeleton = screen.getByTestId('custom-skeleton')
    expect(skeleton).toHaveClass('custom-skeleton')
  })

  it('applies default classes', () => {
    render(<Skeleton data-testid="default-skeleton" />)
    const skeleton = screen.getByTestId('default-skeleton')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('spreads additional props', () => {
    render(<Skeleton data-testid="test-skeleton" id="skeleton-1" />)
    const skeleton = screen.getByTestId('test-skeleton')
    expect(skeleton).toHaveAttribute('id', 'skeleton-1')
  })

  it('handles empty children', () => {
    render(<Skeleton data-testid="empty-skeleton" />)
    const skeleton = screen.getByTestId('empty-skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('handles null children', () => {
    render(<Skeleton data-testid="null-skeleton">{null}</Skeleton>)
    const skeleton = screen.getByTestId('null-skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<Skeleton data-testid="undefined-skeleton">{undefined}</Skeleton>)
    const skeleton = screen.getByTestId('undefined-skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('combines default and custom classes correctly', () => {
    render(<Skeleton className="extra-class" data-testid="extra-skeleton" />)
    const skeleton = screen.getByTestId('extra-skeleton')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'extra-class')
  })

  it('handles multiple custom classes', () => {
    render(<Skeleton className="class1 class2 class3" data-testid="multi-skeleton" />)
    const skeleton = screen.getByTestId('multi-skeleton')
    expect(skeleton).toHaveClass('class1', 'class2', 'class3')
  })

  it('handles aria attributes', () => {
    render(<Skeleton aria-label="Loading content" />)
    const skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toBeInTheDocument()
  })

  it('handles data attributes', () => {
    render(<Skeleton data-loading="true" data-testid="data-skeleton" />)
    const skeleton = screen.getByTestId('data-skeleton')
    expect(skeleton).toHaveAttribute('data-loading', 'true')
  })

  it('handles style attributes', () => {
    render(<Skeleton style={{ width: '100px', height: '20px' }} data-testid="style-skeleton" />)
    const skeleton = screen.getByTestId('style-skeleton')
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' })
  })

  it('handles event handlers', () => {
    const handleClick = jest.fn()
    render(<Skeleton onClick={handleClick} data-testid="click-skeleton" />)
    const skeleton = screen.getByTestId('click-skeleton')
    skeleton.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('maintains animation classes', () => {
    render(<Skeleton className="custom-class" data-testid="animation-skeleton" />)
    const skeleton = screen.getByTestId('animation-skeleton')
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('maintains background classes', () => {
    render(<Skeleton className="custom-class" data-testid="background-skeleton" />)
    const skeleton = screen.getByTestId('background-skeleton')
    expect(skeleton).toHaveClass('bg-muted')
  })

  it('maintains border radius classes', () => {
    render(<Skeleton className="custom-class" data-testid="border-skeleton" />)
    const skeleton = screen.getByTestId('border-skeleton')
    expect(skeleton).toHaveClass('rounded-md')
  })
})