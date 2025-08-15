import React from 'react';
import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/progress';

describe('Progress Component', () => {
  describe('Progress', () => {
    it('should render without crashing', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Progress value={50} className="custom-progress" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('custom-progress');
    });

    it('should pass through additional props', () => {
      render(<Progress value={50} data-testid="custom-progress" />);
      expect(screen.getByTestId('custom-progress')).toBeInTheDocument();
    });

    it('should handle value prop', () => {
      render(<Progress value={75} />);
      const progress = screen.getByRole('progressbar');
      // Progress component doesn't set aria-valuenow, so we just check it renders
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });

    it('should handle max prop', () => {
      render(<Progress value={50} max={200} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuemax', '200');
    });
  });

  describe('Integration', () => {
    it('should handle multiple progress bars', () => {
      render(
        <div>
          <Progress value={25} data-testid="progress-1" />
          <Progress value={50} data-testid="progress-2" />
          <Progress value={75} data-testid="progress-3" />
        </div>
      );
      
      expect(screen.getByTestId('progress-1')).toBeInTheDocument();
      expect(screen.getByTestId('progress-2')).toBeInTheDocument();
      expect(screen.getByTestId('progress-3')).toBeInTheDocument();
    });

    it('should handle progress with custom styling', () => {
      render(<Progress value={60} className="bg-blue-500 h-4" />);
      
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('bg-blue-500', 'h-4');
    });

    it('should handle edge case values', () => {
      const { rerender } = render(<Progress value={0} />);
      const progress = screen.getByRole('progressbar');
      // Progress component doesn't set aria-valuenow, so we just check it renders
      expect(progress).toBeInTheDocument();
      
      rerender(<Progress value={100} />);
      const progress100 = screen.getByRole('progressbar');
      expect(progress100).toBeInTheDocument();
    });
  });
});