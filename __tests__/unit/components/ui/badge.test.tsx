import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

// Mock cva to return a simple function
jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => jest.fn(() => 'mock-badge-classes'))
}));

describe('Badge Component', () => {
  describe('Badge', () => {
    it('should render without crashing', () => {
      render(<Badge>Test badge</Badge>);
      expect(screen.getByText('Test badge')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Badge className="custom-badge">Custom badge</Badge>);
      const badge = screen.getByText('Custom badge');
      expect(badge).toHaveClass('custom-badge');
    });

    it('should pass through additional props', () => {
      render(<Badge data-testid="custom-badge">Props test</Badge>);
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    it('should handle variant prop', () => {
      render(<Badge variant="secondary">Secondary badge</Badge>);
      expect(screen.getByText('Secondary badge')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle multiple badges', () => {
      render(
        <div>
          <Badge>First badge</Badge>
          <Badge variant="secondary">Second badge</Badge>
        </div>
      );
      
      expect(screen.getByText('First badge')).toBeInTheDocument();
      expect(screen.getByText('Second badge')).toBeInTheDocument();
    });

    it('should handle badges with complex content', () => {
      render(
        <Badge>
          <span>Badge with</span> <strong>complex</strong> <em>content</em>
        </Badge>
      );
      
      expect(screen.getByText('Badge with')).toBeInTheDocument();
      expect(screen.getByText('complex')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should handle badges with custom styling', () => {
      render(
        <Badge className="bg-blue-500 text-white px-3 py-1">
          Styled badge
        </Badge>
      );
      
      const badge = screen.getByText('Styled badge');
      expect(badge).toHaveClass('bg-blue-500', 'text-white', 'px-3', 'py-1');
    });
  });
});