import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@/components/ui/toggle', () => ({
  toggleVariants: jest.fn(() => 'mock-toggle-classes')
}));

jest.mock('radix-ui/react-toggle-group', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="toggle-group-root"
      {...props}
    >
      {children}
    </div>
  )),
  Item: React.forwardRef(({ className, children, value, ...props }: any, ref: any) => (
    <button
      ref={ref}
      className={className}
      data-testid="toggle-group-item"
      value={value}
      {...props}
    >
      {children}
    </button>
  )),
}));

jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => 'mock-cva-classes')
}));

describe('ToggleGroup Components', () => {
  describe('ToggleGroup', () => {
    it('should render with default props', () => {
      render(
        <ToggleGroup>
          <div>Toggle group content</div>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toBeInTheDocument();
      expect(toggleGroup).toHaveClass('flex', 'items-center', 'justify-center', 'gap-1');
      expect(screen.getByText('Toggle group content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToggleGroup className="custom-toggle-group">
          Custom toggle group
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toHaveClass('custom-toggle-group');
    });

    it('should render with custom variant', () => {
      render(
        <ToggleGroup variant="outline">
          <div>Outline variant</div>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(
        <ToggleGroup size="sm">
          <div>Small size</div>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <ToggleGroup
          data-testid="custom-toggle-group"
          aria-label="Custom toggle group"
          type="single"
        >
          Props test
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('custom-toggle-group');
      expect(toggleGroup).toHaveAttribute('aria-label', 'Custom toggle group');
      expect(toggleGroup).toHaveAttribute('type', 'single');
    });
  });

  describe('ToggleGroupItem', () => {
    it('should render with default props', () => {
      render(
        <ToggleGroupItem>
          <div>Toggle item content</div>
        </ToggleGroupItem>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeInTheDocument();
      expect(screen.getByText('Toggle item content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToggleGroupItem className="custom-toggle-item">
          Custom toggle item
        </ToggleGroupItem>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toHaveClass('custom-toggle-item');
    });

    it('should render with custom variant', () => {
      render(
        <ToggleGroupItem variant="outline">
          <div>Outline variant</div>
        </ToggleGroupItem>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(
        <ToggleGroupItem size="sm">
          <div>Small size</div>
        </ToggleGroupItem>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeInTheDocument();
    });

    it('should handle value attribute', () => {
      render(
        <ToggleGroupItem value="toggle1">
          <div>Toggle 1</div>
        </ToggleGroupItem>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toHaveAttribute('value', 'toggle1');
    });

    it('should pass through additional props', () => {
      render(
        <ToggleGroupItem
          data-testid="custom-toggle-item"
          disabled
          value="item1"
        >
          <div>Props test</div>
        </ToggleGroupItem>
      );
      const toggleItem = screen.getByTestId('custom-toggle-item');
      expect(toggleItem).toHaveAttribute('value', 'item1');
      expect(toggleItem).toBeDisabled();
    });
  });

  describe('Integration', () => {
    it('should render complete toggle group structure', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
          <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('toggle-group-root')).toBeInTheDocument();
      expect(screen.getAllByTestId('toggle-group-item')).toHaveLength(2);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle multiple toggle group items', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      );

      const items = screen.getAllByTestId('toggle-group-item');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveAttribute('value', 'option1');
      expect(items[1]).toHaveAttribute('value', 'option2');
      expect(items[2]).toHaveAttribute('value', 'option3');
    });
  });
});