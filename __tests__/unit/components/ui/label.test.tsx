import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from '@/components/ui/label';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-label', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <label
      ref={ref}
      data-testid="label-root"
      className={className}
      {...props}
    >
      {children}
    </label>
  ))
}));

jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => 'mock-label-classes')
}));

describe('Label Component', () => {
  describe('Label', () => {
    it('should render with default props', () => {
      render(<Label>Form Label</Label>);
      const label = screen.getByTestId('label-root');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Form Label');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveClass('mock-label-classes');
    });

    it('should render with custom className', () => {
      render(<Label className="custom-label">Custom Label</Label>);
      const label = screen.getByTestId('label-root');
      expect(label).toHaveClass('custom-label');
    });

    it('should render with htmlFor attribute', () => {
      render(<Label htmlFor="input-id">Input Label</Label>);
      const label = screen.getByTestId('label-root');
      expect(label).toHaveAttribute('for', 'input-id');
    });

    it('should render with id attribute', () => {
      render(<Label id="label-id">Label with ID</Label>);
      const label = screen.getByTestId('label-root');
      expect(label).toHaveAttribute('id', 'label-id');
    });

    it('should pass through additional props', () => {
      render(
        <Label
          data-testid="custom-label"
          aria-label="Custom label"
          title="Tooltip text"
        >
          Props test
        </Label>
      );
      const label = screen.getByTestId('custom-label');
      expect(label).toHaveAttribute('aria-label', 'Custom label');
      expect(label).toHaveAttribute('title', 'Tooltip text');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLLabelElement>();
      render(<Label ref={ref}>Ref test</Label>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(<Label />);
      const label = screen.getByTestId('label-root');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('mock-label-classes');
    });

    it('should handle complex children', () => {
      render(
        <Label>
          <span>Required</span>
          <span className="text-red-500">*</span>
          <span>Field</span>
        </Label>
      );
      const label = screen.getByTestId('label-root');
      expect(label).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Field')).toBeInTheDocument();
    });

    it('should handle multiple labels', () => {
      render(
        <div>
          <Label htmlFor="first">First Name</Label>
          <Label htmlFor="last">Last Name</Label>
          <Label htmlFor="email">Email Address</Label>
        </div>
      );

      const labels = screen.getAllByTestId('label-root');
      expect(labels).toHaveLength(3);
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('should handle label with form control', () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </div>
      );

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');
      
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('should handle label with checkbox', () => {
      render(
        <div>
          <Label htmlFor="agree">
            <input id="agree" type="checkbox" />
            I agree to the terms and conditions
          </Label>
        </div>
      );

      const label = screen.getByTestId('label-root');
      const checkbox = screen.getByRole('checkbox');
      
      expect(label).toBeInTheDocument();
      expect(checkbox).toBeInTheDocument();
      expect(label).toHaveTextContent('I agree to the terms and conditions');
    });

    it('should handle label with radio buttons', () => {
      render(
        <fieldset>
          <legend>Select your preference:</legend>
          <Label htmlFor="option1">
            <input id="option1" name="preference" type="radio" value="1" />
            Option 1
          </Label>
          <Label htmlFor="option2">
            <input id="option2" name="preference" type="radio" value="2" />
            Option 2
          </Label>
        </fieldset>
      );

      const labels = screen.getAllByTestId('label-root');
      const radios = screen.getAllByRole('radio');
      
      expect(labels).toHaveLength(2);
      expect(radios).toHaveLength(2);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Label.displayName).toBe('Root');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Label>Accessible label</Label>);
      const label = screen.getByTestId('label-root');
      expect(label.tagName).toBe('LABEL');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Label
          aria-label="Screen reader label"
          aria-describedby="help-text"
          aria-required="true"
        >
          Aria Label
        </Label>
      );
      const label = screen.getByTestId('label-root');
      expect(label).toHaveAttribute('aria-label', 'Screen reader label');
      expect(label).toHaveAttribute('aria-describedby', 'help-text');
      expect(label).toHaveAttribute('aria-required', 'true');
    });

    it('should handle role attribute', () => {
      render(<Label role="heading">Role Label</Label>);
      const label = screen.getByRole('heading');
      expect(label).toBeInTheDocument();
    });

    it('should handle tabIndex', () => {
      render(<Label tabIndex={0}>Focusable Label</Label>);
      const label = screen.getByTestId('label-root');
      expect(label).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<Label>Styled Label</Label>);
      const label = screen.getByTestId('label-root');
      expect(label).toHaveClass('mock-label-classes');
    });

    it('should combine custom classes with default classes', () => {
      render(<Label className="text-lg font-bold">Large Bold Label</Label>);
      const label = screen.getByTestId('label-root');
      expect(label).toHaveClass('text-lg', 'font-bold');
    });

    it('should handle conditional classes', () => {
      const isRequired = true;
      render(
        <Label className={isRequired ? 'text-red-500' : 'text-gray-500'}>
          Conditional Label
        </Label>
      );
      const label = screen.getByTestId('label-root');
      expect(label).toHaveClass('text-red-500');
    });
  });
});