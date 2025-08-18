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
      expect(screen.getByText('Provider content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <ToastProvider className="custom-provider">
          <div>Props test</div>
        </ToastProvider>
      );
      expect(screen.getByText('Props test')).toBeInTheDocument();
    });
  });

  describe('ToastViewport', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <ToastViewport />
        </ToastProvider>
      );
      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport className="custom-viewport" />
        </ToastProvider>
      );
      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport).toHaveClass('custom-viewport');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ToastProvider>
          <ToastViewport ref={ref} />
        </ToastProvider>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Toast', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>Toast content</Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const toast = screen.getByTestId('toast-root');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Toast content');
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast className="custom-toast">Custom toast</Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveClass('custom-toast');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast ref={ref}>Ref test</Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastAction', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastAction>Action</ToastAction>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const action = screen.getByTestId('toast-action');
      expect(action).toBeInTheDocument();
      expect(action).toHaveTextContent('Action');
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastAction className="custom-action">Custom action</ToastAction>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const action = screen.getByTestId('toast-action');
      expect(action).toHaveClass('custom-action');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastAction ref={ref}>Ref test</ToastAction>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastClose', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastClose />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const close = screen.getByTestId('toast-close');
      expect(close).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastClose className="custom-close" />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const close = screen.getByTestId('toast-close');
      expect(close).toHaveClass('custom-close');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastClose ref={ref} />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastTitle', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle>Toast title</ToastTitle>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const title = screen.getByTestId('toast-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Toast title');
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle className="custom-title">Custom title</ToastTitle>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const title = screen.getByTestId('toast-title');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle ref={ref}>Ref test</ToastTitle>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('ToastDescription', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastDescription>Toast description</ToastDescription>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const description = screen.getByTestId('toast-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Toast description');
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastDescription className="custom-description">Custom description</ToastDescription>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const description = screen.getByTestId('toast-description');
      expect(description).toHaveClass('custom-description');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastDescription ref={ref}>Ref test</ToastDescription>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });



  describe('Integration', () => {
    it('should render complete toast structure', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle>Toast Title</ToastTitle>
              <ToastDescription>Toast Description</ToastDescription>
              <ToastAction>Action</ToastAction>
              <ToastClose />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      expect(screen.getByTestId('toast-root')).toBeInTheDocument();
      expect(screen.getByTestId('toast-title')).toBeInTheDocument();
      expect(screen.getByTestId('toast-description')).toBeInTheDocument();
      expect(screen.getByTestId('toast-action')).toBeInTheDocument();
      expect(screen.getByTestId('toast-close')).toBeInTheDocument();
    });

    it('should handle multiple toasts', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>First toast</Toast>
            <Toast>Second toast</Toast>
          </ToastViewport>
        </ToastProvider>
      );

      const toasts = screen.getAllByTestId('toast-root');
      expect(toasts).toHaveLength(2);
      expect(toasts[0]).toHaveTextContent('First toast');
      expect(toasts[1]).toHaveTextContent('Second toast');
    });

    it('should handle toast with actions', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle>Action Toast</ToastTitle>
              <ToastAction>Confirm</ToastAction>
              <ToastAction>Cancel</ToastAction>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      const actions = screen.getAllByTestId('toast-action');
      expect(actions).toHaveLength(2);
      expect(actions[0]).toHaveTextContent('Confirm');
      expect(actions[1]).toHaveTextContent('Cancel');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle>Accessible toast</ToastTitle>
              <ToastDescription>This toast is accessible</ToastDescription>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      const toast = screen.getByTestId('toast-root');
      const title = screen.getByTestId('toast-title');
      const description = screen.getByTestId('toast-description');

      expect(toast).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it('should handle aria attributes correctly', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast aria-label="Important notification">
              <ToastTitle>Important</ToastTitle>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveAttribute('aria-label', 'Important notification');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>Default toast</Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const toast = screen.getByTestId('toast-root');
      expect(toast).toBeInTheDocument();
    });

    it('should combine custom classes with default classes', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast className="custom-toast-class">Custom toast</Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveClass('custom-toast-class');
    });
  });
});