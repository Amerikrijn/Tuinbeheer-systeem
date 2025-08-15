import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from '@/components/ui/skeleton';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('Skeleton Component', () => {
  it('should render with default props', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-skeleton-class';
    render(<Skeleton className={customClass} data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', customClass);
  });

  it('should pass through additional props', () => {
    render(<Skeleton data-testid="custom-skeleton" aria-label="Loading skeleton" />);
    
    const skeleton = screen.getByTestId('custom-skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading skeleton');
  });

  it('should combine custom and default classes', () => {
    const customClass = 'my-custom-class';
    render(<Skeleton className={customClass} data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', customClass);
  });
});