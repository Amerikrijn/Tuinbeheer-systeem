import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

// Mock Radix UI components to avoid context issues
jest.mock('@radix-ui/react-label', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => {
    return React.createElement('label', { ref, className, ...props }, children);
  }),
}));

describe('Label Component', () => {
  it('renders label with text', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Test Label</Label>);
    expect(ref.current).toBeInTheDocument();
  });

  it('spreads additional props', () => {
    render(<Label data-testid="custom-label" id="test-label">Test Label</Label>);
    const label = screen.getByTestId('custom-label');
    expect(label).toHaveAttribute('id', 'test-label');
  });
});