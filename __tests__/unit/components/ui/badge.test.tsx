import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge, badgeVariants } from '@/components/ui/badge';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => 'mock-badge-classes')
}));

describe('Badge Component', () => {
  describe('Badge', () => {
    it('should render with default props', () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText('Default Badge');
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('DIV');
      expect(badge).toHaveClass('mock-badge-classes');
    });

    it('should render with default variant', () => {
      render(<Badge variant="default">Default variant</Badge>);
      const badge = screen.getByText('Default variant');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('mock-badge-classes');
    });

    it('should render with secondary variant', () => {
      render(<Badge variant="secondary">Secondary variant</Badge>);
      const badge = screen.getByText('Secondary variant');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('mock-badge-classes');
    });

    it('should render with destructive variant', () => {
      render(<Badge variant="destructive">Destructive variant</Badge>);
      const badge = screen.getByText('Destructive variant');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('mock-badge-classes');
    });

    it('should render with outline variant', () => {
      render(<Badge variant="outline">Outline variant</Badge>);
      const badge = screen.getByText('Outline variant');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('mock-badge-classes');
    });

    it('should render with custom className', () => {
      render(<Badge className="custom-badge">Custom class</Badge>);
      const badge = screen.getByText('Custom class');
      expect(badge).toHaveClass('custom-badge');
    });

    it('should pass through additional props', () => {
      render(
        <Badge
          data-testid="custom-badge"
          aria-label="Custom badge"
          title="Badge tooltip"
        >
          Props test
        </Badge>
      );
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveAttribute('aria-label', 'Custom badge');
      expect(badge).toHaveAttribute('title', 'Badge tooltip');
    });

    it('should handle children correctly', () => {
      render(
        <Badge>
          <span>Badge with</span>
          <strong>rich</strong>
          <em>content</em>
        </Badge>
      );
      const badge = screen.getByText('Badge with');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(<Badge />);
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('mock-badge-classes');
    });
  });

  describe('badgeVariants', () => {
    it('should be a function', () => {
      expect(typeof badgeVariants).toBe('function');
    });

    it('should be mocked correctly', () => {
      expect(badgeVariants).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should handle multiple badges with different variants', () => {
      render(
        <div>
          <Badge variant="default">Info</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      );

      const badges = screen.getAllByText(/Info|Secondary|Error|Outline/);
      expect(badges).toHaveLength(4);
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('should handle badges with complex content', () => {
      render(
        <div>
          <Badge>
            <span className="icon">📊</span>
            <span>Analytics</span>
            <span className="count">42</span>
          </Badge>
          <Badge variant="destructive">
            <span className="icon">⚠️</span>
            <span>Warning</span>
          </Badge>
        </div>
      );

      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should handle badges with custom styling', () => {
      render(
        <div>
          <Badge className="bg-blue-500 text-white">Blue Badge</Badge>
          <Badge className="bg-green-500 text-white">Green Badge</Badge>
          <Badge className="bg-red-500 text-white">Red Badge</Badge>
        </div>
      );

      const badges = screen.getAllByText(/Blue|Green|Red/);
      expect(badges).toHaveLength(3);
      expect(screen.getByText('Blue Badge')).toHaveClass('bg-blue-500', 'text-white');
      expect(screen.getByText('Green Badge')).toHaveClass('bg-green-500', 'text-white');
      expect(screen.getByText('Red Badge')).toHaveClass('bg-red-500', 'text-white');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Badge>Accessible Badge</Badge>);
      const badge = screen.getByText('Accessible Badge');
      expect(badge.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Badge
          aria-label="Status badge"
          aria-describedby="badge-help"
          role="status"
        >
          Status
        </Badge>
      );
      const badge = screen.getByText('Status');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
      expect(badge).toHaveAttribute('aria-describedby', 'badge-help');
      expect(badge).toHaveAttribute('role', 'status');
    });
  });
});