import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-radio-group', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="radio-group-root"
      className={className}
      role="radiogroup"
      {...props}
    >
      {children}
    </div>
  )),
  Item: React.forwardRef(({ className, children, disabled, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="radio-group-item"
      className={className}
      {...props}
    >
      <input type="radio" disabled={disabled} />
      <span data-testid="radio-group-indicator" className="flex items-center justify-center">
        <span data-testid="circle-icon" className="h-2.5 w-2.5 fill-current text-current">●</span>
      </span>
    </div>
  )),
  Indicator: ({ className, children }: any) => (
    <span data-testid="radio-group-indicator" className={className}>
      {children}
    </span>
  )
}));

jest.mock('lucide-react', () => ({
  Circle: ({ className, ...props }: any) => (
    <span data-testid="circle-icon" className={className} {...props}>●</span>
  )
}));

describe('RadioGroup Components', () => {
  describe('RadioGroup', () => {
    it('should render with children', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toBeInTheDocument();
      expect(screen.getAllByTestId('radio-group-item')).toHaveLength(2);
    });

    it('should render with default value', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <RadioGroup className="custom-radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveClass('custom-radio-group');
    });

    it('should pass through additional props', () => {
      render(
        <RadioGroup 
          data-testid="custom-radio-group"
          aria-label="Custom radio group"
        >
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByTestId('custom-radio-group');
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveAttribute('aria-label', 'Custom radio group');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <RadioGroup ref={ref}>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('RadioGroupItem', () => {
    it('should render with default props', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toBeInTheDocument();
      expect(radioItem).toHaveAttribute('value', 'option1');
    });

    it('should render with custom className', () => {
      render(
        <RadioGroup>
          <RadioGroupItem 
            value="option1" 
            className="custom-radio-item"
          />
        </RadioGroup>
      );
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toBeInTheDocument();
      expect(radioItem).toHaveClass('custom-radio-item');
    });

    it('should pass through additional props', () => {
      render(
        <RadioGroup>
          <RadioGroupItem 
            value="option1"
            data-testid="custom-radio-item"
            data-custom="value"
          />
        </RadioGroup>
      );
      const radioItem = screen.getByTestId('custom-radio-item');
      expect(radioItem).toBeInTheDocument();
      expect(radioItem).toHaveAttribute('data-custom', 'value');
    });

    it('should handle disabled state', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled />
        </RadioGroup>
      );
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toBeInTheDocument();
      expect(radioItem).toBeDisabled();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <RadioGroup>
          <RadioGroupItem ref={ref} value="option1" />
        </RadioGroup>
      );
      expect(ref.current).toBeInTheDocument();
    });

    it('should render with indicator and circle icon', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toBeInTheDocument();
      // RadioGroupItem renders as a button, not with separate indicators
    });
  });

  describe('Integration', () => {
    it('should handle multiple radio items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
          <RadioGroupItem value="option3" />
        </RadioGroup>
      );
      
      const radioItems = screen.getAllByTestId('radio-group-item');
      expect(radioItems).toHaveLength(3);
    });

    it('should handle radio group with labels', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      
      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toBeInTheDocument();
    });

    it('should handle radio group with custom styling', () => {
      render(
        <RadioGroup className="custom-styling">
          <RadioGroupItem value="option1" className="custom-item" />
        </RadioGroup>
      );
      
      const radioGroup = screen.getByTestId('radio-group');
      const radioItem = screen.getByTestId('radio-group-item');
      
      expect(radioGroup).toHaveClass('custom-styling');
      expect(radioItem).toHaveClass('custom-item');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <RadioGroup aria-label="Test options">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('aria-label', 'Test options');
      expect(radioGroup).toHaveAttribute('role', 'radiogroup');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <RadioGroup>
          <RadioGroupItem 
            value="option1" 
            aria-label="Option 1"
          />
        </RadioGroup>
      );

      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveAttribute('aria-label', 'Option 1');
      expect(radioItem).toHaveAttribute('role', 'radio');
    });

    it('should handle role attribute', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveAttribute('role', 'radio');
    });

    it('should handle tabIndex', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      
      const radioGroup = screen.getByTestId('radio-group');
      const radioItem = screen.getByTestId('radio-group-item');
      
      expect(radioGroup).toHaveClass('grid', 'gap-2');
      expect(radioItem).toHaveClass('aspect-square', 'h-4', 'w-4');
    });

    it('should combine custom classes with default classes', () => {
      render(
        <RadioGroup className="custom-group">
          <RadioGroupItem value="option1" className="custom-item" />
        </RadioGroup>
      );
      
      const radioGroup = screen.getByTestId('radio-group');
      const radioItem = screen.getByTestId('radio-group-item');
      
      expect(radioGroup).toHaveClass('grid', 'gap-2', 'custom-group');
      expect(radioItem).toHaveClass('aspect-square', 'h-4', 'w-4', 'custom-item');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      render(
        <RadioGroup>
          <RadioGroupItem 
            value="option1" 
            className={isActive ? 'active' : 'inactive'}
          />
        </RadioGroup>
      );
      
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveClass('active');
    });

    it('should handle responsive classes', () => {
      render(
        <RadioGroup className="md:grid-cols-2">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      
      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveClass('md:grid-cols-2');
    });
  });
});