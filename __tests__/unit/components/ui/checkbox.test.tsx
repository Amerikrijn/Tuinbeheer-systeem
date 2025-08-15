import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from '@/components/ui/checkbox';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-checkbox', () => {
  const Root = React.forwardRef(({ className, children, checked, disabled, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="checkbox-root"
      data-state={checked ? 'checked' : 'unchecked'}
      {...props}
    >
      {children}
    </div>
  ));
  Root.displayName = 'Root';

  const Indicator = ({ className, ...props }: any) => (
    <div
      className={className}
      data-testid="checkbox-indicator"
      {...props}
    />
  );
  Indicator.displayName = 'Indicator';

  return { Root, Indicator };
});

jest.mock('lucide-react', () => ({
  Check: ({ ...props }: any) => (
    <span data-testid="check-icon" {...props}>✓</span>
  )
}));

describe('Checkbox Component', () => {
  describe('Checkbox', () => {
    it('should render with default props', () => {
      render(<Checkbox />);
      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveClass('peer', 'h-4', 'w-4', 'shrink-0', 'rounded-sm', 'border', 'border-primary', 'ring-offset-background', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:cursor-not-allowed', 'disabled:opacity-50', 'data-[state=checked]:bg-primary', 'data-[state=checked]:text-primary-foreground');
    });

    it('should render with custom className', () => {
      render(<Checkbox className="custom-checkbox" />);
      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveClass('custom-checkbox');
    });

    it('should handle checked state', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should handle disabled state', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('data-disabled', 'true');
    });

    it('should render indicator when checked', () => {
      render(<Checkbox checked />);
      const indicator = screen.getByTestId('checkbox-indicator');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <Checkbox
          data-testid="custom-checkbox"
          aria-label="Custom checkbox"
          id="test-checkbox"
        />
      );
      const checkbox = screen.getByTestId('custom-checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Custom checkbox');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle children', () => {
      render(
        <Checkbox>
          <span data-testid="custom-content">Custom content</span>
        </Checkbox>
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('should handle multiple checkboxes', () => {
      render(
        <div>
          <Checkbox id="checkbox1" />
          <Checkbox id="checkbox2" />
          <Checkbox id="checkbox3" />
        </div>
      );

      const checkboxes = screen.getAllByTestId('checkbox-root');
      expect(checkboxes).toHaveLength(3);
    });

    it('should handle checkbox with label', () => {
      render(
        <div>
          <Checkbox id="agree" />
          <label htmlFor="agree">I agree to terms</label>
        </div>
      );

      const checkbox = screen.getByTestId('checkbox-root');
      const label = screen.getByText('I agree to terms');
      
      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('id', 'agree');
      expect(label).toHaveAttribute('for', 'agree');
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Checkbox.displayName).toBe('Root');
    });
  });

  describe('Integration', () => {
    it('should handle form submission', () => {
      const handleSubmit = jest.fn();
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox name="agree" required />
          <button type="submit">Submit</button>
        </form>
      );

      const checkbox = screen.getByTestId('checkbox-root');
      const submitButton = screen.getByText('Submit');

      expect(checkbox).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('name', 'agree');
      expect(checkbox).toHaveAttribute('required');
    });

    it('should handle checkbox group', () => {
      render(
        <fieldset>
          <legend>Select your interests:</legend>
          <Checkbox id="sports" name="interests" value="sports" />
          <label htmlFor="sports">Sports</label>
          
          <Checkbox id="music" name="interests" value="music" />
          <label htmlFor="music">Music</label>
          
          <Checkbox id="books" name="interests" value="books" />
          <label htmlFor="books">Books</label>
        </fieldset>
      );

      const checkboxes = screen.getAllByTestId('checkbox-root');
      expect(checkboxes).toHaveLength(3);
      expect(screen.getByText('Sports')).toBeInTheDocument();
      expect(screen.getByText('Music')).toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Checkbox />);
      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Checkbox
          aria-label="Accept terms and conditions"
          aria-describedby="terms-help"
          aria-required="true"
        />
      );
      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms and conditions');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-help');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    it('should handle role attribute', () => {
      render(<Checkbox role="checkbox" />);
      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
    });
  });
});