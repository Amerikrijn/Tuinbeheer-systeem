import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button, buttonVariants } from '@/components/ui/button';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-slot', () => ({
  Slot: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="slot-component"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
}));

jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => 'mock-button-classes')
}));

describe('Button Component', () => {
  describe('Button', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveClass('mock-button-classes');
    });

    it('should render with custom className', () => {
      render(<Button className="custom-button">Custom button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
    });

    it('should render with default variant', () => {
      render(<Button variant="default">Default button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Default button');
    });

    it('should render with destructive variant', () => {
      render(<Button variant="destructive">Destructive button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Destructive button');
    });

    it('should render with outline variant', () => {
      render(<Button variant="outline">Outline button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Outline button');
    });

    it('should render with secondary variant', () => {
      render(<Button variant="secondary">Secondary button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Secondary button');
    });

    it('should render with ghost variant', () => {
      render(<Button variant="ghost">Ghost button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Ghost button');
    });

    it('should render with link variant', () => {
      render(<Button variant="link">Link button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Link button');
    });

    it('should render with default size', () => {
      render(<Button size="default">Default size</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Default size');
    });

    it('should render with small size', () => {
      render(<Button size="sm">Small button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Small button');
    });

    it('should render with large size', () => {
      render(<Button size="lg">Large button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Large button');
    });

    it('should render with icon size', () => {
      render(<Button size="icon">Icon button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Icon button');
    });

    it('should render as child when asChild is true', () => {
      render(
        <Button asChild>
          <span>Child span</span>
        </Button>
      );
      const slot = screen.getByTestId('slot-component');
      expect(slot).toBeInTheDocument();
      expect(slot).toHaveTextContent('Child span');
      expect(slot.tagName).toBe('DIV');
    });

    it('should pass through additional props', () => {
      render(
        <Button
          data-testid="custom-button"
          disabled
          type="submit"
          aria-label="Submit button"
        >
          Props test
        </Button>
      );
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('aria-label', 'Submit button');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref test</Button>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(<Button disabled>Disabled button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should handle different button types', () => {
      const { rerender } = render(<Button type="button">Button type</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');

      rerender(<Button type="submit">Submit type</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');

      rerender(<Button type="reset">Reset type</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable button</Button>);
      const button = screen.getByRole('button');
      
      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple buttons', () => {
      render(
        <div>
          <Button variant="default">Button 1</Button>
          <Button variant="destructive">Button 2</Button>
          <Button variant="outline">Button 3</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
      expect(screen.getByText('Button 3')).toBeInTheDocument();
    });

    it('should handle button with icon', () => {
      render(
        <Button>
          <span>Button text</span>
          <svg data-testid="icon">Icon</svg>
        </Button>
      );
      
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('icon');
      
      expect(button).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(button).toHaveTextContent('Button text');
    });

    it('should handle empty children', () => {
      render(<Button />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('mock-button-classes');
    });
  });

  describe('buttonVariants', () => {
    it('should be a function', () => {
      expect(typeof buttonVariants).toBe('function');
    });

    it('should be mocked correctly', () => {
      expect(buttonVariants).toBeDefined();
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Button.displayName).toBe('Button');
    });
  });

  describe('Integration', () => {
    it('should handle form submission', () => {
      const handleSubmit = jest.fn();
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveTextContent('Submit Form');
    });

    it('should handle button groups', () => {
      render(
        <div role="group" aria-label="Button group">
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Save</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should handle conditional rendering', () => {
      const isPrimary = true;
      render(
        <Button variant={isPrimary ? 'default' : 'secondary'}>
          Conditional Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Conditional Button');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Button>Accessible button</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Button
          aria-label="Custom button"
          aria-describedby="button-help"
          aria-pressed="false"
          aria-expanded="false"
        >
          Aria Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom button');
      expect(button).toHaveAttribute('aria-describedby', 'button-help');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle role attribute', () => {
      render(<Button role="menuitem">Menu item button</Button>);
      const button = screen.getByRole('menuitem');
      expect(button).toBeInTheDocument();
    });

    it('should handle tabIndex', () => {
      render(<Button tabIndex={0}>Focusable button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should handle disabled state accessibility', () => {
      render(
        <Button
          disabled
          aria-disabled="true"
          aria-describedby="disabled-reason"
        >
          Disabled button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-describedby', 'disabled-reason');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<Button>Styled button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('mock-button-classes');
    });

    it('should combine custom classes with default classes', () => {
      render(<Button className="text-lg font-bold">Large bold button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-lg', 'font-bold');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      render(
        <Button
          className={isActive ? 'bg-blue-500' : 'bg-gray-500'}
        >
          Conditional styled button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500');
    });
  });
});