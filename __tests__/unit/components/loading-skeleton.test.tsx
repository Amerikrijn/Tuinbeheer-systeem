import React from 'react';
import { render, screen } from '@testing-library/react';
import { BankingLoadingState, LoadingSkeleton } from '@/components/loading-skeleton';

// Mock Math.random to return predictable values
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;

describe('LoadingSkeleton Components', () => {
  describe('BankingLoadingState', () => {
    it('should render with default props', () => {
      render(<BankingLoadingState />);
      
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('banking-loading');
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-label', 'Laden...');
    });

    it('should render with custom message', () => {
      render(<BankingLoadingState message="Loading data..." />);
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data...');
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should render page type with correct configuration', () => {
      render(<BankingLoadingState type="page" />);
      
      const skeletons = screen.getAllByText('', { selector: '.skeleton' });
      expect(skeletons).toHaveLength(8); // 8 rows for page type
      
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('h-4'); // height for page type
        expect(skeleton).toHaveClass('bg-green-100', 'dark:bg-green-900/30', 'rounded');
      });
    });

    it('should render component type with correct configuration', () => {
      render(<BankingLoadingState type="component" />);
      
      const skeletons = screen.getAllByText('', { selector: '.skeleton' });
      expect(skeletons).toHaveLength(3); // 3 rows for component type
      
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('h-3'); // height for component type
      });
    });

    it('should render button type with correct configuration', () => {
      render(<BankingLoadingState type="button" />);
      
      const skeletons = screen.getAllByText('', { selector: '.skeleton' });
      expect(skeletons).toHaveLength(1); // 1 row for button type
      
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('h-8'); // height for button type
      });
    });

    it('should render table type with correct configuration', () => {
      render(<BankingLoadingState type="table" />);
      
      const skeletons = screen.getAllByText('', { selector: '.skeleton' });
      expect(skeletons).toHaveLength(5); // 5 rows for table type
      
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('h-4'); // height for table type
      });
    });

    it('should apply random width to skeleton rows', () => {
      render(<BankingLoadingState type="component" />);
      
      const skeletons = screen.getAllByText('', { selector: '.skeleton' });
      skeletons.forEach(skeleton => {
        // With mock Math.random() returning 0.5, width should be 80% (60 + 0.5 * 40)
        expect(skeleton).toHaveStyle({ width: '80%' });
      });
    });

    it('should have proper accessibility attributes', () => {
      render(<BankingLoadingState message="Loading..." />);
      
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-label', 'Loading...');
      
      // Check for screen reader text
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('LoadingSkeleton', () => {
    it('should render with default props', () => {
      render(<LoadingSkeleton />);
      
      // Should render BankingLoadingState with component type
      const skeletons = screen.getAllByText('', { selector: '.skeleton' });
      expect(skeletons).toHaveLength(3); // 3 rows for component type
    });

    it('should render with custom className', () => {
      render(<LoadingSkeleton className="custom-loading" />);
      
      const container = screen.getByText('', { selector: '.custom-loading' });
      expect(container).toBeInTheDocument();
    });

    it('should maintain backwards compatibility', () => {
      render(<LoadingSkeleton />);
      
      // Should still render the same structure
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Laden...')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render multiple loading states together', () => {
      render(
        <div>
          <BankingLoadingState type="page" message="Loading page..." />
          <BankingLoadingState type="button" message="Loading button..." />
        </div>
      );
      
      const statusElements = screen.getAllByRole('status');
      expect(statusElements).toHaveLength(2);
      
      const pageSkeletons = screen.getAllByText('', { selector: '.skeleton' });
      expect(pageSkeletons).toHaveLength(9); // 8 + 1
    });
  });
});