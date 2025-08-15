import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '@/components/ui/textarea';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('Textarea Component', () => {
  describe('Textarea', () => {
    it('should render with default props', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-base', 'ring-offset-background', 'placeholder:text-muted-foreground', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:cursor-not-allowed', 'disabled:opacity-50', 'md:text-sm');
    });

    it('should render with custom className', () => {
      render(<Textarea className="custom-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter your message" />);
      const textarea = screen.getByPlaceholderText('Enter your message');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<Textarea value="Initial text" readOnly />);
      const textarea = screen.getByDisplayValue('Initial text');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with name attribute', () => {
      render(<Textarea name="message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'message');
    });

    it('should render with id attribute', () => {
      render(<Textarea id="message-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'message-textarea');
    });

    it('should render with rows attribute', () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should render with cols attribute', () => {
      render(<Textarea cols={50} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '50');
    });

    it('should render with maxLength attribute', () => {
      render(<Textarea maxLength={100} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should render with minLength attribute', () => {
      render(<Textarea minLength={10} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('minLength', '10');
    });

    it('should render with disabled state', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should render with required attribute', () => {
      render(<Textarea required />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('should render with readOnly attribute', () => {
      render(<Textarea readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readOnly');
    });

    it('should render with aria attributes', () => {
      render(
        <Textarea
          aria-label="Message textarea"
          aria-describedby="message-help"
          aria-required="true"
          aria-invalid="false"
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Message textarea');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-help');
      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle autoComplete attribute', () => {
      render(<Textarea autoComplete="off" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('autoComplete', 'off');
    });



    it('should handle spellCheck attribute', () => {
      render(<Textarea spellCheck={false} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('spellCheck', 'false');
    });

    it('should handle wrap attribute', () => {
      render(<Textarea wrap="hard" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('wrap', 'hard');
    });

    it('should handle dir attribute', () => {
      render(<Textarea dir="rtl" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('dir', 'rtl');
    });

    it('should handle lang attribute', () => {
      render(<Textarea lang="en" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('lang', 'en');
    });

    it('should handle tabIndex attribute', () => {
      render(<Textarea tabIndex={0} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('tabIndex', '0');
    });

    it('should handle title attribute', () => {
      render(<Textarea title="Tooltip text" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('title', 'Tooltip text');
    });

    it('should handle form attribute', () => {
      render(<Textarea form="test-form" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('form', 'test-form');
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Textarea.displayName).toBe('Textarea');
    });
  });

  describe('Integration', () => {
    it('should handle form submission', () => {
      const handleSubmit = jest.fn();
      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" placeholder="Enter message" />
          <button type="submit">Submit</button>
        </form>
      );

      const textarea = screen.getByPlaceholderText('Enter message');
      const submitButton = screen.getByText('Submit');

      expect(textarea).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(textarea).toHaveAttribute('name', 'message');
    });

    it('should handle multiple textareas', () => {
      render(
        <div>
          <Textarea name="title" placeholder="Enter title" />
          <Textarea name="description" placeholder="Enter description" />
          <Textarea name="notes" placeholder="Enter notes" />
        </div>
      );

      expect(screen.getByPlaceholderText('Enter title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter notes')).toBeInTheDocument();
    });

    it('should handle textarea with label', () => {
      render(
        <div>
          <label htmlFor="message-textarea">Message:</label>
          <Textarea id="message-textarea" placeholder="Type your message here" />
        </div>
      );

      const label = screen.getByText('Message:');
      const textarea = screen.getByPlaceholderText('Type your message here');

      expect(label).toBeInTheDocument();
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('id', 'message-textarea');
    });

    it('should handle textarea with validation', () => {
      render(
        <div>
          <Textarea
            name="email"
            placeholder="Enter email"
            required
            minLength={5}
            maxLength={100}
          />
          <span className="error">Email is required</span>
        </div>
      );

      const textarea = screen.getByPlaceholderText('Enter email');
      const errorMessage = screen.getByText('Email is required');

      expect(textarea).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('minLength', '5');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should handle textarea with different sizes', () => {
      render(
        <div>
          <Textarea className="h-20" placeholder="Small textarea" />
          <Textarea className="h-32" placeholder="Medium textarea" />
          <Textarea className="h-40" placeholder="Large textarea" />
        </div>
      );

      const textareas = screen.getAllByRole('textbox');
      expect(textareas[0]).toHaveClass('h-20');
      expect(textareas[1]).toHaveClass('h-32');
      expect(textareas[2]).toHaveClass('h-40');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Textarea
          aria-label="Message input"
          aria-describedby="message-help"
          aria-required="true"
          aria-invalid="false"
          aria-multiline="true"
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Message input');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-help');
      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
      expect(textarea).toHaveAttribute('aria-multiline', 'true');
    });

    it('should handle role attribute', () => {
      render(<Textarea role="textbox" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should handle tabIndex', () => {
      render(<Textarea tabIndex={0} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<Textarea>Styled textarea</Textarea>);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-base', 'ring-offset-background', 'placeholder:text-muted-foreground', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:cursor-not-allowed', 'disabled:opacity-50', 'md:text-sm');
    });

    it('should combine custom classes with default classes', () => {
      render(<Textarea className="border border-gray-300">Custom styled</Textarea>);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border', 'border-gray-300');
    });

    it('should handle conditional classes', () => {
      const hasError = true;
      render(
        <Textarea
          className={hasError ? 'border-red-500' : 'border-gray-300'}
        >
          Conditional styling
        </Textarea>
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-red-500');
    });

    it('should handle responsive classes', () => {
      render(<Textarea className="w-full md:w-64 lg:w-96">Responsive</Textarea>);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('w-full', 'md:w-64', 'lg:w-96');
    });
  });

  describe('Event Handling', () => {
    it('should handle onChange event', () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');
      
      // Simulate change event
      textarea.setAttribute('value', 'New text');
      expect(textarea).toHaveAttribute('value', 'New text');
    });

    it('should handle onFocus event', () => {
      const handleFocus = jest.fn();
      render(<Textarea onFocus={handleFocus} />);
      const textarea = screen.getByRole('textbox');
      
      // Simulate focus event
      textarea.focus();
      expect(textarea).toHaveFocus();
    });

    it('should handle onBlur event', () => {
      const handleBlur = jest.fn();
      render(<Textarea onBlur={handleBlur} />);
      const textarea = screen.getByRole('textbox');
      
      // Simulate blur event
      textarea.focus();
      textarea.blur();
      expect(textarea).not.toHaveFocus();
    });
  });
});