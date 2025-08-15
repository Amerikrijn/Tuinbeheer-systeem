import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('Input Component', () => {
  describe('Input', () => {
    it('should render with default props', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-base', 'ring-offset-background', 'file:border-0', 'file:bg-transparent', 'file:text-sm', 'file:font-medium', 'file:text-foreground', 'placeholder:text-muted-foreground', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:cursor-not-allowed', 'disabled:opacity-50', 'md:text-sm');
    });

    it('should render with custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should render with custom type', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<Input value="John Doe" readOnly />);
      const input = screen.getByDisplayValue('John Doe');
      expect(input).toBeInTheDocument();
    });

    it('should render with name attribute', () => {
      render(<Input name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should render with id attribute', () => {
      render(<Input id="user-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'user-input');
    });

    it('should render with disabled state', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should render with required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should render with aria attributes', () => {
      render(
        <Input
          aria-label="Username input"
          aria-describedby="username-help"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Username input');
      expect(input).toHaveAttribute('aria-describedby', 'username-help');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle different input types', () => {
      const { rerender } = render(<Input type="text" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');

      rerender(<Input type="password" />);
      input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'password');

      rerender(<Input type="number" />);
      input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'number');

      rerender(<Input type="email" />);
      input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'email');

      rerender(<Input type="tel" />);
      input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'tel');

      rerender(<Input type="url" />);
      input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'url');

      rerender(<Input type="search" />);
      input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should handle file input type', () => {
      render(<Input type="file" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('should handle checkbox input type', () => {
      render(<Input type="checkbox" />);
      const input = screen.getByRole('checkbox');
      expect(input).toHaveAttribute('type', 'checkbox');
    });

    it('should handle radio input type', () => {
      render(<Input type="radio" name="test" />);
      const input = screen.getByRole('radio');
      expect(input).toHaveAttribute('type', 'radio');
    });

    it('should handle range input type', () => {
      render(<Input type="range" min="0" max="100" />);
      const input = screen.getByRole('slider');
      expect(input).toHaveAttribute('type', 'range');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should handle date input type', () => {
      render(<Input type="date" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'date');
    });

    it('should handle time input type', () => {
      render(<Input type="time" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'time');
    });

    it('should handle datetime-local input type', () => {
      render(<Input type="datetime-local" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'datetime-local');
    });

    it('should handle month input type', () => {
      render(<Input type="month" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'month');
    });

    it('should handle week input type', () => {
      render(<Input type="week" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'week');
    });

    it('should handle color input type', () => {
      render(<Input type="color" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'color');
    });

    it('should handle hidden input type', () => {
      render(<Input type="hidden" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'hidden');
    });

    it('should handle submit input type', () => {
      render(<Input type="submit" value="Submit" />);
      const input = screen.getByDisplayValue('Submit');
      expect(input).toHaveAttribute('type', 'submit');
    });

    it('should handle reset input type', () => {
      render(<Input type="reset" value="Reset" />);
      const input = screen.getByDisplayValue('Reset');
      expect(input).toHaveAttribute('type', 'reset');
    });

    it('should handle button input type', () => {
      render(<Input type="button" value="Click me" />);
      const input = screen.getByDisplayValue('Click me');
      expect(input).toHaveAttribute('type', 'button');
    });

    it('should handle image input type', () => {
      render(<Input type="image" src="/button.png" alt="Submit" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'image');
      expect(input).toHaveAttribute('src', '/button.png');
      expect(input).toHaveAttribute('alt', 'Submit');
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Input.displayName).toBe('Input');
    });
  });

  describe('Integration', () => {
    it('should handle form submission', () => {
      const handleSubmit = jest.fn();
      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" placeholder="Username" />
          <Input type="submit" value="Submit" />
        </form>
      );

      const usernameInput = screen.getByPlaceholderText('Username');
      const submitButton = screen.getByDisplayValue('Submit');

      expect(usernameInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('should handle multiple inputs', () => {
      render(
        <div>
          <Input name="first" placeholder="First name" />
          <Input name="last" placeholder="Last name" />
          <Input name="email" type="email" placeholder="Email" />
        </div>
      );

      expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Input
          aria-label="Username"
          aria-describedby="username-help"
          aria-required="true"
          aria-invalid="false"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Username');
      expect(input).toHaveAttribute('aria-describedby', 'username-help');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should handle role attribute', () => {
      render(<Input role="searchbox" />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });
  });
});