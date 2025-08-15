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
  Item: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <input
      ref={ref}
      data-testid="radio-group-item"
      type="radio"
      className={className}
      {...props}
    />
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
      expect(radioItem).toBeInTheDocument();
      expect(radioItem).toHaveAttribute('type', 'radio');
      expect(radioItem).toHaveClass('aspect-square', 'h-4', 'w-4', 'rounded-full', 'border', 'border-primary', 'text-primary', 'ring-offset-background', 'focus:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:cursor-not-allowed', 'disabled:opacity-50');
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
      expect(indicator).toHaveClass('flex', 'items-center', 'justify-center');
      expect(circleIcon).toHaveClass('h-2.5', 'w-2.5', 'fill-current', 'text-current');
    });

    it('should pass through additional props', () => {
      render(
        <RadioGroupItem
          data-testid="custom-radio-item"
          name="test-radio"
          value="option1"
          checked
        />
      );
      const radioItem = screen.getByTestId('custom-radio-item');
      expect(radioItem).toHaveAttribute('name', 'test-radio');
      expect(radioItem).toHaveAttribute('value', 'option1');
      expect(radioItem).toHaveAttribute('checked');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<RadioGroupItem ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle checked state', () => {
      render(<RadioGroupItem checked />);
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveAttribute('checked');
    });

    it('should handle disabled state', () => {
      render(<RadioGroupItem disabled />);
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toBeDisabled();
    });

    it('should handle required state', () => {
      render(<RadioGroupItem required />);
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toBeRequired();
    });

    it('should handle name attribute', () => {
      render(<RadioGroupItem name="test-radio" />);
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveAttribute('name', 'test-radio');
    });

    it('should handle value attribute', () => {
      render(<RadioGroupItem value="test-value" />);
      const radioItem = screen.getByTestId('radio-group-item');
      expect(radioItem).toHaveAttribute('value', 'test-value');
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for RadioGroup', () => {
      expect(RadioGroup.displayName).toBe('Root');
    });

    it('should have correct displayName for RadioGroupItem', () => {
      expect(RadioGroupItem.displayName).toBe('Item');
    });
  });

  describe('Integration', () => {
    it('should render complete radio group structure', () => {
      render(
        <RadioGroup name="preferences">
          <RadioGroupItem value="option1" id="opt1" />
          <RadioGroupItem value="option2" id="opt2" />
          <RadioGroupItem value="option3" id="opt3" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const radioItems = screen.getAllByTestId('radio-group-item');

      expect(radioGroup).toBeInTheDocument();
      expect(radioItems).toHaveLength(3);
      expect(radioGroup).toHaveAttribute('name', 'preferences');
    });

    it('should handle radio group with labels', () => {
      render(
        <RadioGroup name="fruit">
          <label htmlFor="apple">
            <RadioGroupItem value="apple" id="apple" />
            Apple
          </label>
          <label htmlFor="banana">
            <RadioGroupItem value="banana" id="banana" />
            Banana
          </label>
          <label htmlFor="orange">
            <RadioGroupItem value="orange" id="orange" />
            Orange
          </label>
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const radioItems = screen.getAllByTestId('radio-group-item');
      const labels = screen.getAllByText(/Apple|Banana|Orange/);

      expect(radioGroup).toBeInTheDocument();
      expect(radioItems).toHaveLength(3);
      expect(labels).toHaveLength(3);
      expect(radioGroup).toHaveAttribute('name', 'fruit');
    });

    it('should handle multiple radio groups', () => {
      render(
        <div>
          <RadioGroup name="color">
            <RadioGroupItem value="red" />
            <RadioGroupItem value="blue" />
          </RadioGroup>
          <RadioGroup name="size">
            <RadioGroupItem value="small" />
            <RadioGroupItem value="large" />
          </RadioGroup>
        </div>
      );

      const radioGroups = screen.getAllByRole('radiogroup');
      const radioItems = screen.getAllByTestId('radio-group-item');

      expect(radioGroups).toHaveLength(2);
      expect(radioItems).toHaveLength(4);
      expect(radioGroups[0]).toHaveAttribute('name', 'color');
      expect(radioGroups[1]).toHaveAttribute('name', 'size');
    });

    it('should handle radio group with descriptions', () => {
      render(
        <RadioGroup name="plan">
          <div>
            <RadioGroupItem value="basic" id="basic" />
            <label htmlFor="basic">Basic Plan</label>
            <p>Simple features for beginners</p>
          </div>
          <div>
            <RadioGroupItem value="pro" id="pro" />
            <label htmlFor="pro">Pro Plan</label>
            <p>Advanced features for professionals</p>
          </div>
        </RadioGroup>
      );

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Simple features for beginners')).toBeInTheDocument();
      expect(screen.getByText('Advanced features for professionals')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <RadioGroup>
          <RadioGroupItem />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole('radiogroup');
      const radioItem = screen.getByTestId('radio-group-item');

      expect(radioGroup.tagName).toBe('DIV');
      expect(radioItem.tagName).toBe('INPUT');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <RadioGroup
          aria-label="Select your preference"
          aria-describedby="help-text"
        >
          <RadioGroupItem
            aria-label="Option 1"
            aria-describedby="option1-desc"
          />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole('radiogroup');
      const radioItem = screen.getByTestId('radio-group-item');

      expect(radioGroup).toHaveAttribute('aria-label', 'Select your preference');
      expect(radioGroup).toHaveAttribute('aria-describedby', 'help-text');
      expect(radioItem).toHaveAttribute('aria-label', 'Option 1');
      expect(radioItem).toHaveAttribute('aria-describedby', 'option1-desc');
    });

    it('should handle role attribute', () => {
      render(<RadioGroup role="radiogroup" />);
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
    });

    it('should handle tabIndex', () => {
      render(<RadioGroup tabIndex={0} />);
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<RadioGroup>Styled radio group</RadioGroup>);
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveClass('grid', 'gap-2');
    });

    it('should combine custom classes with default classes', () => {
      render(<RadioGroup className="p-4 border">Custom styled</RadioGroup>);
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveClass('p-4', 'border');
    });

    it('should handle conditional classes', () => {
      const isVertical = true;
      render(
        <RadioGroup
          className={isVertical ? 'flex-col' : 'flex-row'}
        >
          Conditional styling
        </RadioGroup>
      );
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveClass('flex-col');
    });
  });
});