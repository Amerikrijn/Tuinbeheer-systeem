import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from '@/components/ui/progress';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-progress', () => ({
  Root: React.forwardRef(({ className, children, value, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="progress-root"
      {...props}
    >
      {children}
      <div
        data-testid="progress-indicator"
        style={{ transform: `translateX(${Math.max(-100, Math.min(0, -(100 - (value || 0)))})%` }}
      />
    </div>
  )),
}));

describe('Progress Component', () => {
  describe('Progress', () => {
    it('should render with default props', () => {
      render(<Progress />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary');
    });

    it('should render with custom className', () => {
      render(<Progress className="custom-progress" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('custom-progress');
    });

    it('should render with default value (0)', () => {
      render(<Progress />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should render with value 50', () => {
      render(<Progress value={50} />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should render with value 100', () => {
      render(<Progress value={100} />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(0%)' });
    });

    it('should render with value 25', () => {
      render(<Progress value={25} />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
    });

    it('should render with value 75', () => {
      render(<Progress value={75} />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
    });

    it('should render with value 0', () => {
      render(<Progress value={0} />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should handle undefined value', () => {
      render(<Progress value={undefined} />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should handle null value', () => {
      render(<Progress value={null as any} />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should pass through additional props', () => {
      render(
        <Progress
          data-testid="custom-progress"
          aria-label="Custom progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
        />
      );
      const progress = screen.getByTestId('custom-progress');
      expect(progress).toHaveAttribute('aria-label', 'Custom progress');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
      expect(progress).toHaveAttribute('aria-valuenow', '50');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Progress ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should render indicator with correct classes', () => {
      render(<Progress />);
      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('h-full', 'w-full', 'flex-1', 'bg-primary', 'transition-all');
    });

    it('should handle edge case values', () => {
      const { rerender } = render(<Progress value={99.9} />);
      let indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-0.1%)' });

      rerender(<Progress value={-10} />);
      indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Progress.displayName).toBe('Root');
    });
  });

  describe('Integration', () => {
    it('should handle multiple progress bars', () => {
      render(
        <div>
          <Progress value={25} />
          <Progress value={50} />
          <Progress value={75} />
        </div>
      );

      const progressBars = screen.getAllByRole('progressbar');
      const indicators = screen.getAllByTestId('progress-indicator');

      expect(progressBars).toHaveLength(3);
      expect(indicators).toHaveLength(3);

      expect(indicators[0]).toHaveStyle({ transform: 'translateX(-75%)' });
      expect(indicators[1]).toHaveStyle({ transform: 'translateX(-50%)' });
      expect(indicators[2]).toHaveStyle({ transform: 'translateX(-25%)' });
    });

    it('should handle progress with labels', () => {
      render(
        <div>
          <label htmlFor="progress1">Upload Progress</label>
          <Progress id="progress1" value={60} />
          <span>60%</span>
        </div>
      );

      const progress = screen.getByRole('progressbar');
      const label = screen.getByText('Upload Progress');
      const percentage = screen.getByText('60%');

      expect(progress).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
      expect(progress).toHaveAttribute('id', 'progress1');
    });

    it('should handle progress with different sizes', () => {
      render(
        <div>
          <Progress value={30} className="h-2" />
          <Progress value={60} className="h-6" />
          <Progress value={90} className="h-8" />
        </div>
      );

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars[0]).toHaveClass('h-2');
      expect(progressBars[1]).toHaveClass('h-6');
      expect(progressBars[2]).toHaveClass('h-8');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Progress />);
      const progress = screen.getByRole('progressbar');
      expect(progress.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Progress
          aria-label="File upload progress"
          aria-describedby="progress-help"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={45}
        />
      );
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-label', 'File upload progress');
      expect(progress).toHaveAttribute('aria-describedby', 'progress-help');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
      expect(progress).toHaveAttribute('aria-valuenow', '45');
    });

    it('should handle role attribute', () => {
      render(<Progress role="progressbar" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should handle tabIndex', () => {
      render(<Progress tabIndex={0} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<Progress />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary');
    });

    it('should combine custom classes with default classes', () => {
      render(<Progress className="border border-gray-300" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('border', 'border-gray-300');
    });

    it('should handle conditional classes', () => {
      const isComplete = true;
      render(
        <Progress
          className={isComplete ? 'border-green-500' : 'border-gray-300'}
          value={100}
        />
      );
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('border-green-500');
    });
  });
});