import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Switch, SwitchThumb } from '@/components/ui/switch';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock the Radix UI Switch components
jest.mock('@radix-ui/react-switch', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="switch"
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
  Thumb: ({ className, ...props }: any) => (
    <div
      data-testid="switch-thumb"
      className={className}
      {...props}
    />
  )
}));

describe('Switch Component', () => {
  it('should render with default props', () => {
    render(
      <Switch>
        <SwitchThumb />
      </Switch>
    );
    
    const switchElement = screen.getByTestId('switch');
    const thumb = screen.getByTestId('switch-thumb');
    
    expect(switchElement).toBeInTheDocument();
    expect(thumb).toBeInTheDocument();
  });

  it('should apply default classes', () => {
    render(
      <Switch>
        <SwitchThumb />
      </Switch>
    );
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-6', 'w-11');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-switch-class';
    render(
      <Switch className={customClass}>
        <SwitchThumb />
      </Switch>
    );
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveClass(customClass);
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(
      <Switch ref={ref}>
        <SwitchThumb />
      </Switch>
    );
    
    expect(ref.current).toBeInTheDocument();
    expect(ref.current).toHaveAttribute('data-testid', 'switch');
  });

  it('should pass through additional props', () => {
    render(<Switch data-testid="custom-switch" aria-label="Toggle switch" />);
    
    const switchElement = screen.getByTestId('custom-switch');
    expect(switchElement).toHaveAttribute('aria-label', 'Toggle switch');
  });
});