import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toggle } from '@/components/ui/toggle';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock the Radix UI Toggle component
jest.mock('@radix-ui/react-toggle', () => ({
  Root: React.forwardRef(({ className, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="toggle"
      className={className}
      {...props}
    />
  ))
}));

describe('Toggle Component', () => {
  it('should render with default props', () => {
    render(<Toggle>Toggle</Toggle>);
    
    const toggle = screen.getByTestId('toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent('Toggle');
  });

  it('should apply default variant and size classes', () => {
    render(<Toggle>Toggle</Toggle>);
    
    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('bg-transparent', 'h-10', 'px-3', 'min-w-10');
  });

  it('should apply outline variant', () => {
    render(<Toggle variant="outline">Toggle</Toggle>);
    
    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('border', 'border-input', 'bg-transparent');
  });

  it('should apply small size', () => {
    render(<Toggle size="sm">Toggle</Toggle>);
    
    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('h-9', 'px-2.5', 'min-w-9');
  });

  it('should apply large size', () => {
    render(<Toggle size="lg">Toggle</Toggle>);
    
    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('h-11', 'px-5', 'min-w-11');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-toggle-class';
    render(<Toggle className={customClass}>Toggle</Toggle>);
    
    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass(customClass);
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Toggle ref={ref}>Toggle</Toggle>);
    
    expect(ref.current).toBeInTheDocument();
    expect(ref.current).toHaveAttribute('data-testid', 'toggle');
  });

  it('should pass through additional props', () => {
    render(<Toggle data-testid="custom-toggle" aria-label="Toggle button">Toggle</Toggle>);
    
    const toggle = screen.getByTestId('custom-toggle');
    expect(toggle).toHaveAttribute('aria-label', 'Toggle button');
  });
});