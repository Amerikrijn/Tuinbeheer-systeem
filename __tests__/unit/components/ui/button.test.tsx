import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

// Mock cva to return a function that properly handles className
jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => jest.fn(({ className }) => `mock-button-classes ${className || ''}`.trim()))
}));

// Mock utils.cn to properly combine classes
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('Button Component', () => {
  describe('Button', () => {
    it('should render without crashing', () => {
      render(<Button>Test button</Button>);
      expect(screen.getByText('Test button')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Button className="custom-button">Custom button</Button>);
      const button = screen.getByText('Custom button');
      expect(button).toHaveClass('custom-button');
    });

    it('should pass through additional props', () => {
      render(<Button data-testid="custom-button">Props test</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('should handle variant prop', () => {
      render(<Button variant="secondary">Secondary button</Button>);
      expect(screen.getByText('Secondary button')).toBeInTheDocument();
    });

    it('should handle size prop', () => {
      render(<Button size="lg">Large button</Button>);
      expect(screen.getByText('Large button')).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(<Button disabled>Disabled button</Button>);
      const button = screen.getByText('Disabled button');
      expect(button).toBeDisabled();
    });
  });

  describe('Integration', () => {
    it('should handle multiple buttons', () => {
      render(
        <div>
          <Button>First button</Button>
          <Button variant="secondary">Second button</Button>
        </div>
      );
      
      expect(screen.getByText('First button')).toBeInTheDocument();
      expect(screen.getByText('Second button')).toBeInTheDocument();
    });

    it('should handle buttons with complex content', () => {
      render(
        <Button>
          <span>Button with</span> <strong>complex</strong> <em>content</em>
        </Button>
      );
      
      expect(screen.getByText('Button with')).toBeInTheDocument();
      expect(screen.getByText('complex')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should handle buttons with icons', () => {
      render(
        <Button>
          <span>🚀</span> Launch
        </Button>
      );
      
      expect(screen.getByText('🚀')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
    });
  });
});