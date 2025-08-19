import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  Toast, 
  ToastAction, 
  ToastClose, 
  ToastDescription, 
  ToastTitle,
  ToastProvider,
  ToastViewport
} from '@/components/ui/toast';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock Radix UI components to avoid context issues
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
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="toast-root"
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
  Description: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="toast-description"
      className={className}
      {...props}
    >
      {children}
    </div>
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
  ))
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
  });
});