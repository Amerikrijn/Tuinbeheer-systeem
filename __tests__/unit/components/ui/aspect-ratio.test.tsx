import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Mock the Radix UI AspectRatio component
jest.mock('@radix-ui/react-aspect-ratio', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="aspect-ratio"
      {...props}
    >
      {children}
    </div>
  ))
}));

describe('AspectRatio Component', () => {
  it('should render with children', () => {
    render(
      <AspectRatio>
        <img src="/test-image.jpg" alt="Test" />
      </AspectRatio>
    );
    
    const aspectRatio = screen.getByTestId('aspect-ratio');
    expect(aspectRatio).toBeInTheDocument();
    expect(aspectRatio).toContainElement(screen.getByAltText('Test'));
  });

  it('should pass through props', () => {
    render(
      <AspectRatio data-testid="custom-aspect-ratio" className="custom-class">
        <div>Content</div>
      </AspectRatio>
    );
    
    const aspectRatio = screen.getByTestId('custom-aspect-ratio');
    expect(aspectRatio).toHaveClass('custom-class');
    expect(aspectRatio).toContainElement(screen.getByText('Content'));
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <AspectRatio ref={ref}>
        <div>Content</div>
      </AspectRatio>
    );
    
    expect(ref.current).toBeInTheDocument();
    expect(ref.current).toHaveAttribute('data-testid', 'aspect-ratio');
  });
});