import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction
} from '@/components/ui/toast';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-toast', () => ({
  Provider: ({ children, ...props }: any) => (
    <div data-testid="toast-provider" {...props}>
      {children}
    </div>
  ),
  Viewport: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="toast-viewport"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Root: React.forwardRef(({ className, variant, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="toast-root"
      data-variant={variant || 'default'}
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Action: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="toast-action"
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
  Close: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="toast-close"
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
  Title: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="toast-title"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Description: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="toast-description"
      className={className}
      {...props}
    >
      {children}
    </div>
  ))
}));

jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => jest.fn(() => 'mock-toast-classes'))
}));

jest.mock('lucide-react', () => ({
  X: ({ className, ...props }: any) => (
    <span data-testid="x-icon" className={className} {...props}>✕</span>
  )
}));

describe('Toast Components', () => {
  describe('ToastProvider', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <div>Provider content</div>
        </ToastProvider>
      );
      const provider = screen.getByTestId('toast-provider');
      expect(provider).toBeInTheDocument();
      expect(screen.getByText('Provider content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <ToastProvider
          data-testid="custom-provider"
          className="custom-provider"
        >
          Props test
        </ToastProvider>
      );
      const provider = screen.getByTestId('custom-provider');
      expect(provider).toHaveClass('custom-provider');
    });
  });

  describe('ToastViewport', () => {
    it('should render with default props', () => {
      render(
        <ToastViewport>
          <div>Viewport content</div>
        </ToastViewport>
      );
      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveClass('fixed', 'top-0', 'z-[100]', 'flex', 'max-h-screen', 'w-full', 'flex-col-reverse', 'p-4', 'sm:bottom-0', 'sm:right-0', 'sm:top-auto', 'sm:flex-col', 'md:max-w-[420px]');
      expect(screen.getByText('Viewport content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastViewport className="custom-viewport">
          Custom viewport
        </ToastViewport>
      );
      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport).toHaveClass('custom-viewport');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ToastViewport ref={ref}>Ref test</ToastViewport>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Toast', () => {
    it('should render with default props', () => {
      render(
        <Toast>
          <div>Toast content</div>
        </Toast>
      );
      const toast = screen.getByTestId('toast-root');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('data-variant', 'default');
      expect(toast).toHaveClass('mock-toast-classes');
      expect(screen.getByText('Toast content')).toBeInTheDocument();
    });



    it('should render with custom className', () => {
      render(
        <Toast className="custom-toast">
          Custom toast
        </Toast>
      );
      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveClass('custom-toast');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Toast ref={ref}>Ref test</Toast>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastAction', () => {
    it('should render with default props', () => {
      render(
        <ToastAction>
          Action button
        </ToastAction>
      );
      const action = screen.getByTestId('toast-action');
      expect(action).toBeInTheDocument();
      expect(action.tagName).toBe('BUTTON');
      expect(action).toHaveClass('inline-flex', 'h-8', 'shrink-0', 'items-center', 'justify-center', 'rounded-md', 'border', 'bg-transparent', 'px-3', 'text-sm', 'font-medium', 'ring-offset-background', 'transition-colors', 'hover:bg-secondary', 'focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2', 'disabled:pointer-events-none', 'disabled:opacity-50', 'group-[.destructive]:border-muted/40', 'group-[.destructive]:hover:border-destructive/30', 'group-[.destructive]:hover:bg-destructive', 'group-[.destructive]:hover:text-destructive-foreground', 'group-[.destructive]:focus:ring-destructive');
      expect(screen.getByText('Action button')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastAction className="custom-action">
          Custom action
        </ToastAction>
      );
      const action = screen.getByTestId('toast-action');
      expect(action).toHaveClass('custom-action');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<ToastAction ref={ref}>Ref test</ToastAction>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastClose', () => {
    it('should render with default props', () => {
      render(<ToastClose />);
      const close = screen.getByTestId('toast-close');
      const icon = screen.getByTestId('x-icon');
      
      expect(close).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(close.tagName).toBe('BUTTON');
      expect(close).toHaveClass('absolute', 'right-2', 'top-2', 'rounded-md', 'p-1', 'text-foreground/50', 'opacity-0', 'transition-opacity', 'hover:text-foreground', 'focus:opacity-100', 'focus:outline-none', 'focus:ring-2', 'group-hover:opacity-100', 'group-[.destructive]:text-red-300', 'group-[.destructive]:hover:text-red-50', 'group-[.destructive]:focus:ring-red-400', 'group-[.destructive]:focus:ring-offset-red-600');
      expect(close).toHaveAttribute('toast-close', '');
    });

    it('should render with custom className', () => {
      render(<ToastClose className="custom-close" />);
      const close = screen.getByTestId('toast-close');
      expect(close).toHaveClass('custom-close');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<ToastClose ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastTitle', () => {
    it('should render with default props', () => {
      render(<ToastTitle>Toast title</ToastTitle>);
      const title = screen.getByTestId('toast-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-sm', 'font-semibold');
      expect(title).toHaveTextContent('Toast title');
    });

    it('should render with custom className', () => {
      render(<ToastTitle className="custom-title">Custom title</ToastTitle>);
      const title = screen.getByTestId('toast-title');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ToastTitle ref={ref}>Ref test</ToastTitle>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastDescription', () => {
    it('should render with default props', () => {
      render(<ToastDescription>Toast description</ToastDescription>);
      const description = screen.getByTestId('toast-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'opacity-90');
      expect(description).toHaveTextContent('Toast description');
    });

    it('should render with custom className', () => {
      render(<ToastDescription className="custom-description">Custom description</ToastDescription>);
      const description = screen.getByTestId('toast-description');
      expect(description).toHaveClass('custom-description');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ToastDescription ref={ref}>Ref test</ToastDescription>);
      expect(ref.current).toBeInTheDocument();
    });
  });



  describe('Integration', () => {
    it('should render complete toast structure', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle>Success!</ToastTitle>
              <ToastDescription>Your action was completed successfully.</ToastDescription>
              <ToastAction>Undo</ToastAction>
              <ToastClose />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
      expect(screen.getByTestId('toast-viewport')).toBeInTheDocument();
      expect(screen.getByTestId('toast-root')).toBeInTheDocument();
      expect(screen.getByTestId('toast-title')).toBeInTheDocument();
      expect(screen.getByTestId('toast-description')).toBeInTheDocument();
      expect(screen.getByTestId('toast-action')).toBeInTheDocument();
      expect(screen.getByTestId('toast-close')).toBeInTheDocument();
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Your action was completed successfully.')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('should handle multiple toasts', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle>First toast</ToastTitle>
              <ToastDescription>First message</ToastDescription>
            </Toast>
            <Toast>
              <ToastTitle>Second toast</ToastTitle>
              <ToastDescription>Second message</ToastDescription>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      const toasts = screen.getAllByTestId('toast-root');
      const titles = screen.getAllByTestId('toast-title');
      const descriptions = screen.getAllByTestId('toast-description');

      expect(toasts).toHaveLength(2);
      expect(titles).toHaveLength(2);
      expect(descriptions).toHaveLength(2);
      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
    });



    it('should handle toast with actions', () => {
      render(
        <Toast>
          <ToastTitle>Action required</ToastTitle>
          <ToastDescription>Please confirm your action.</ToastDescription>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ToastAction>Confirm</ToastAction>
            <ToastAction>Cancel</ToastAction>
          </div>
        </Toast>
      );

      const actions = screen.getAllByTestId('toast-action');
      expect(actions).toHaveLength(2);
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Toast>
          <ToastTitle>Accessible toast</ToastTitle>
          <ToastDescription>Accessible description</ToastDescription>
        </Toast>
      );

      const toast = screen.getByTestId('toast-root');
      const title = screen.getByTestId('toast-title');
      const description = screen.getByTestId('toast-description');

      expect(toast.tagName).toBe('DIV');
      expect(title.tagName).toBe('DIV');
      expect(description.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Toast
          aria-label="Toast notification"
          aria-describedby="toast-description"
        >
          <ToastTitle>Toast</ToastTitle>
          <ToastDescription id="toast-description">Description</ToastDescription>
        </Toast>
      );

      const toast = screen.getByTestId('toast-root');
      const description = screen.getByTestId('toast-description');

      expect(toast).toHaveAttribute('aria-label', 'Toast notification');
      expect(toast).toHaveAttribute('aria-describedby', 'toast-description');
      expect(description).toHaveAttribute('id', 'toast-description');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<Toast>Styled toast</Toast>);
      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveClass('mock-toast-classes');
    });

    it('should combine custom classes with default classes', () => {
      render(<Toast className="border border-gray-300">Custom styled</Toast>);
      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveClass('border', 'border-gray-300');
    });


  });
});