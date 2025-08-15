import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Separator } from '@/components/ui/separator';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock the Radix UI Separator component
jest.mock('@radix-ui/react-separator', () => {
  const mockSeparatorPrimitive = {
    Root: React.forwardRef(({ className, orientation, decorative, ...props }: any, ref: any) => {
      return React.createElement('div', {
        ref,
        className,
        'data-orientation': orientation,
        'data-decorative': decorative,
        ...props,
        'data-testid': props['data-testid'] || 'separator'
      });
    })
  };

  // Set the displayName property
  mockSeparatorPrimitive.Root.displayName = 'Root';
  
  return mockSeparatorPrimitive;
});

describe('Separator Component', () => {
  it('should render with default props', () => {
    render(<Separator />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-decorative', 'true');
  });

  it('should render with custom orientation', () => {
    render(<Separator orientation="vertical" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should render with custom decorative value', () => {
    render(<Separator decorative={false} />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-decorative', 'false');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-separator-class';
    render(<Separator className={customClass} />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass(customClass);
  });

  it('should apply default classes', () => {
    render(<Separator />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('shrink-0', 'bg-border');
  });

  it('should apply horizontal orientation classes by default', () => {
    render(<Separator />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-[1px]', 'w-full');
  });

  it('should apply vertical orientation classes when specified', () => {
    render(<Separator orientation="vertical" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-full', 'w-[1px]');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    
    expect(ref.current).toBeInTheDocument();
    expect(ref.current).toHaveAttribute('data-testid', 'separator');
  });

  it('should pass through additional props', () => {
    render(<Separator data-testid="custom-separator" aria-label="Section divider" />);
    
    const separator = screen.getByTestId('custom-separator');
    expect(separator).toHaveAttribute('aria-label', 'Section divider');
  });

  it('should combine custom and default classes', () => {
    const customClass = 'my-custom-class';
    render(<Separator className={customClass} />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('shrink-0', 'bg-border', 'h-[1px]', 'w-full', customClass);
  });

  it('should handle multiple custom classes', () => {
    const customClasses = 'class1 class2 class3';
    render(<Separator className={customClasses} />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('class1', 'class2', 'class3');
  });

  it('should maintain proper display name', () => {
    expect(Separator.displayName).toBe('Root');
  });
});