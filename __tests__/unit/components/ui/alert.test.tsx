import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => 'mock-alert-classes')
}));

describe('Alert Components', () => {
  describe('Alert', () => {
    it('should render with default props', () => {
      render(<Alert>Alert message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Alert message');
      expect(alert.tagName).toBe('DIV');
      expect(alert).toHaveClass('mock-alert-classes');
    });

    it('should render with default variant', () => {
      render(<Alert variant="default">Default alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Default alert');
    });

    it('should render with destructive variant', () => {
      render(<Alert variant="destructive">Destructive alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Destructive alert');
    });

    it('should render with custom className', () => {
      render(<Alert className="custom-alert">Custom alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('should pass through additional props', () => {
      render(
        <Alert
          data-testid="custom-alert"
          aria-label="Custom alert"
          title="Alert tooltip"
        >
          Props test
        </Alert>
      );
      const alert = screen.getByTestId('custom-alert');
      expect(alert).toHaveAttribute('aria-label', 'Custom alert');
      expect(alert).toHaveAttribute('title', 'Alert tooltip');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Alert ref={ref}>Ref test</Alert>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(<Alert />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('mock-alert-classes');
    });

    it('should handle complex children', () => {
      render(
        <Alert>
          <div>
            <strong>Important:</strong> This is a <em>critical</em> message.
          </div>
          <p>Additional details here.</p>
        </Alert>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('Important:')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('Additional details here.')).toBeInTheDocument();
    });

    it('should handle multiple alerts', () => {
      render(
        <div>
          <Alert variant="default">Info message</Alert>
          <Alert variant="destructive">Error message</Alert>
        </div>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('AlertTitle', () => {
    it('should render with children', () => {
      render(<AlertTitle>Alert Title</AlertTitle>);
      const title = screen.getByText('Alert Title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H5');
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
    });

    it('should render with custom className', () => {
      render(<AlertTitle className="custom-title">Custom Title</AlertTitle>);
      const title = screen.getByText('Custom Title');
      expect(title).toHaveClass('custom-title');
    });

    it('should pass through additional props', () => {
      render(
        <AlertTitle
          data-testid="custom-title"
          aria-label="Custom title"
        >
          Props test
        </AlertTitle>
      );
      const title = screen.getByTestId('custom-title');
      expect(title).toHaveAttribute('aria-label', 'Custom title');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(<AlertTitle ref={ref}>Ref test</AlertTitle>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('AlertDescription', () => {
    it('should render with children', () => {
      render(<AlertDescription>Alert description text</AlertDescription>);
      const description = screen.getByText('Alert description text');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('DIV');
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed');
    });

    it('should render with custom className', () => {
      render(<AlertDescription className="custom-description">Custom description</AlertDescription>);
      const description = screen.getByText('Custom description');
      expect(description).toHaveClass('custom-description');
    });

    it('should pass through additional props', () => {
      render(
        <AlertDescription
          data-testid="custom-description"
          aria-label="Custom description"
        >
          Props test
        </AlertDescription>
      );
      const description = screen.getByTestId('custom-description');
      expect(description).toHaveAttribute('aria-label', 'Custom description');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<AlertDescription ref={ref}>Ref test</AlertDescription>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for Alert', () => {
      expect(Alert.displayName).toBe('Alert');
    });

    it('should have correct displayName for AlertTitle', () => {
      expect(AlertTitle.displayName).toBe('AlertTitle');
    });

    it('should have correct displayName for AlertDescription', () => {
      expect(AlertDescription.displayName).toBe('AlertDescription');
    });
  });

  describe('Integration', () => {
    it('should render complete alert structure', () => {
      render(
        <Alert>
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            This is an important message that requires your attention.
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      const title = screen.getByText('Important Notice');
      const description = screen.getByText('This is an important message that requires your attention.');

      expect(alert).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(title.tagName).toBe('H5');
      expect(description.tagName).toBe('DIV');
    });

    it('should handle multiple alerts with different variants', () => {
      render(
        <div>
          <Alert variant="default">
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>This is an informational message.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong!</AlertDescription>
          </Alert>
        </div>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('This is an informational message.')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Alert>
          <AlertTitle>Accessible Alert</AlertTitle>
          <AlertDescription>This alert is accessible.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      const title = screen.getByText('Accessible Alert');
      const description = screen.getByText('This alert is accessible.');

      expect(alert.tagName).toBe('DIV');
      expect(title.tagName).toBe('H5');
      expect(description.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Alert
          aria-label="Custom alert"
          aria-describedby="alert-help"
          aria-live="polite"
        >
          <AlertTitle>Aria Alert</AlertTitle>
          <AlertDescription>Aria attributes test</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', 'Custom alert');
      expect(alert).toHaveAttribute('aria-describedby', 'alert-help');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });
});