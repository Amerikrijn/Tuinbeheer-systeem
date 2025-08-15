import React from 'react';
import { render, screen } from '@testing-library/react';
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
    it('should render with default props', () => {
      render(
        <RadioGroup>
          <div>Radio group content</div>
        </RadioGroup>
      );
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveClass('grid', 'gap-2');
      expect(screen.getByText('Radio group content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <RadioGroup className="custom-radio-group">
          Custom radio group
        </RadioGroup>
      );
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveClass('custom-radio-group');
    });

    it('should pass through additional props', () => {
      render(
        <RadioGroup
          data-testid="custom-radio-group"
          aria-label="Custom radio group"
          name="test-group"
        >
          Props test
        </RadioGroup>
      );
      const radioGroup = screen.getByTestId('custom-radio-group');
      expect(radioGroup).toHaveAttribute('aria-label', 'Custom radio group');
      expect(radioGroup).toHaveAttribute('name', 'test-group');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<RadioGroup ref={ref}>Ref test</RadioGroup>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <RadioGroup>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </RadioGroup>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('RadioGroupItem', () => {
    it('should render with default props', () => {
      render(<RadioGroupItem />);
      const radioItem = screen.getByTestId('radio-group-item');
      const input = radioItem.querySelector('input');
      expect(radioItem).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'radio');
    });

    it('should render with custom className', () => {
      render(<RadioGroupItem className="custom-radio-item" />);
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveClass('custom-radio-item');
    });

    it('should render with indicator and circle icon', () => {
      render(<RadioGroupItem />);
      const indicator = screen.getByTestId('radio-group-indicator');
      const circleIcon = screen.getByTestId('circle-icon');
      
      expect(indicator).toBeInTheDocument();
      expect(circleIcon).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <RadioGroupItem
          data-testid="custom-radio-item"
          name="test-radio"
          value="option1"
          disabled
        />
      );
      const radioItem = screen.getByTestId('custom-radio-item');
      const input = radioItem.querySelector('input');
      expect(radioItem).toHaveAttribute('name', 'test-radio');
      expect(radioItem).toHaveAttribute('value', 'option1');
      expect(input).toBeDisabled();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<RadioGroupItem ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle different values', () => {
      render(
        <RadioGroupItem value="option1" />
      );
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveAttribute('value', 'option1');
    });

    it('should handle disabled state', () => {
      render(<RadioGroupItem disabled />);
      const radioItem = screen.getByTestId('radio-group-item');
      const input = radioItem.querySelector('input');
      expect(input).toBeDisabled();
    });
  });

  describe('Integration', () => {
    it('should render complete radio group structure', () => {
      render(
        <RadioGroup name="test-group">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
          <RadioGroupItem value="option3" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByTestId('radio-group-item')).toHaveLength(3);
      expect(screen.getAllByTestId('radio-group-indicator')).toHaveLength(3);
      expect(screen.getAllByTestId('circle-icon')).toHaveLength(3);
    });

    it('should handle multiple radio groups', () => {
      render(
        <div>
          <RadioGroup name="group1">
            <RadioGroupItem value="a" />
            <RadioGroupItem value="b" />
          </RadioGroup>
          <RadioGroup name="group2">
            <RadioGroupItem value="x" />
            <RadioGroupItem value="y" />
          </RadioGroup>
        </div>
      );

      const radioGroups = screen.getAllByRole('radiogroup');
      const radioItems = screen.getAllByTestId('radio-group-item');

      expect(radioGroups).toHaveLength(2);
      expect(radioItems).toHaveLength(4);
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <RadioGroup aria-label="Test options">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const radioItem = screen.getByTestId('radio-group-item');
      const input = radioItem.querySelector('input');

      expect(radioGroup).toHaveAttribute('aria-label', 'Test options');
      expect(input).toHaveAttribute('type', 'radio');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <RadioGroup
          aria-label="Selection options"
          aria-describedby="help-text"
        >
          <RadioGroupItem
            aria-label="First option"
            aria-describedby="option1-help"
          />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const radioItem = screen.getByTestId('radio-group-item');

      expect(radioGroup).toHaveAttribute('aria-label', 'Selection options');
      expect(radioGroup).toHaveAttribute('aria-describedby', 'help-text');
      expect(radioItem).toHaveAttribute('aria-label', 'First option');
      expect(radioItem).toHaveAttribute('aria-describedby', 'option1-help');
    });
  });
});