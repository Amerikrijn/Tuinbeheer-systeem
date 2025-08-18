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

describe('Toast Components', () => {
  describe('Toast', () => {
    it('should render with default props', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast data-testid="test-toast">Toast content</Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(screen.getByTestId('test-toast')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast className="custom-toast" data-testid="test-toast">Toast content</Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const toast = screen.getByTestId('test-toast');
      expect(toast).toHaveClass('custom-toast');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast ref={ref} data-testid="test-toast">Toast content</Toast>
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
              <ToastAction data-testid="test-action">Action</ToastAction>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(screen.getByTestId('test-action')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastAction className="custom-action" data-testid="test-action">Action</ToastAction>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const action = screen.getByTestId('test-action');
      expect(action).toHaveClass('custom-action');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastAction ref={ref} data-testid="test-action">Action</ToastAction>
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
              <ToastClose data-testid="test-close" />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(screen.getByTestId('test-close')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastClose className="custom-close" data-testid="test-close" />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const close = screen.getByTestId('test-close');
      expect(close).toHaveClass('custom-close');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastClose ref={ref} data-testid="test-close" />
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
              <ToastTitle data-testid="test-title">Title</ToastTitle>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(screen.getByTestId('test-title')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle className="custom-title" data-testid="test-title">Title</ToastTitle>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const title = screen.getByTestId('test-title');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastTitle ref={ref} data-testid="test-title">Title</ToastTitle>
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
              <ToastDescription data-testid="test-description">Description</ToastDescription>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      expect(screen.getByTestId('test-description')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastDescription className="custom-description" data-testid="test-description">Description</ToastDescription>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );
      const description = screen.getByTestId('test-description');
      expect(description).toHaveClass('custom-description');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast>
              <ToastDescription ref={ref} data-testid="test-description">Description</ToastDescription>
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
            <Toast data-testid="test-toast">
              <ToastTitle data-testid="test-title">Toast Title</ToastTitle>
              <ToastDescription data-testid="test-description">Toast Description</ToastDescription>
              <ToastAction data-testid="test-action">Action</ToastAction>
              <ToastClose data-testid="test-close" />
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      expect(screen.getByTestId('test-toast')).toBeInTheDocument();
      expect(screen.getByTestId('test-title')).toBeInTheDocument();
      expect(screen.getByTestId('test-description')).toBeInTheDocument();
      expect(screen.getByTestId('test-action')).toBeInTheDocument();
      expect(screen.getByTestId('test-close')).toBeInTheDocument();
    });

    it('should handle toast with actions', () => {
      render(
        <ToastProvider>
          <ToastViewport>
            <Toast data-testid="test-toast">
              <ToastAction data-testid="test-action">Action</ToastAction>
            </Toast>
          </ToastViewport>
        </ToastProvider>
      );

      expect(screen.getByTestId('test-toast')).toBeInTheDocument();
      expect(screen.getByTestId('test-action')).toBeInTheDocument();
    });
  });
});