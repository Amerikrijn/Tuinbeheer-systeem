import React from 'react';
import { render, screen } from '@testing-library/react';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox Component', () => {
  describe('Checkbox', () => {
    it('should render without crashing', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Checkbox className="custom-checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
    });

    it('should pass through additional props', () => {
      render(<Checkbox data-testid="custom-checkbox" />);
      expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
    });

    it('should handle checked state', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should handle disabled state', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveAttribute('data-disabled', '');
    });

    it('should render indicator when checked', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
      // Check that the SVG icon is present
      expect(checkbox.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle multiple checkboxes', () => {
      render(
        <div>
          <Checkbox data-testid="checkbox-1" />
          <Checkbox data-testid="checkbox-2" checked />
        </div>
      );
      
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-2')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-2')).toHaveAttribute('data-state', 'checked');
    });

    it('should handle checkbox with custom styling', () => {
      render(<Checkbox className="bg-blue-500 text-white" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('bg-blue-500', 'text-white');
    });
  });
});