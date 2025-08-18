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
          <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
          <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToggleGroup className="custom-toggle-group">
          <ToggleGroupItem value="item1">Custom item</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toHaveClass('custom-toggle-group');
    });

    it('should pass through additional props', () => {
      render(
        <ToggleGroup
          data-testid="custom-toggle-group"
          aria-label="Custom toggle group"
        >
          <ToggleGroupItem value="item1">Props test</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('custom-toggle-group');
      expect(toggleGroup).toHaveAttribute('aria-label', 'Custom toggle group');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ToggleGroup ref={ref}>
          <ToggleGroupItem value="item1">Ref test</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle multiple items', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1">First</ToggleGroupItem>
          <ToggleGroupItem value="item2">Second</ToggleGroupItem>
          <ToggleGroupItem value="item3">Third</ToggleGroupItem>
        </ToggleGroup>
      );
      const items = screen.getAllByTestId('toggle-group-item');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('First');
      expect(items[1]).toHaveTextContent('Second');
      expect(items[2]).toHaveTextContent('Third');
    });
  });

  describe('ToggleGroupItem', () => {
    it('should render with default props', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1">Toggle item</ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('toggle-group-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent('Toggle item');
      expect(item.tagName).toBe('BUTTON');
    });

    it('should render with custom className', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1" className="custom-item">Custom item</ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('toggle-group-item');
      expect(item).toHaveClass('custom-item');
    });

    it('should render with custom variant', () => {
      render(
        <ToggleGroup variant="outline">
          <ToggleGroupItem value="item1">Outline variant</ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('toggle-group-item');
      expect(item).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(
        <ToggleGroup size="sm">
          <ToggleGroupItem value="item1">Small size</ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('toggle-group-item');
      expect(item).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem
            value="item1"
            data-testid="custom-item"
            aria-label="Custom toggle item"
            disabled
          >
            Props test
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('custom-item');
      expect(item).toHaveAttribute('aria-label', 'Custom toggle item');
      expect(item).toBeDisabled();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1" ref={ref}>Ref test</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1" disabled>Disabled item</ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('toggle-group-item');
      expect(item).toBeDisabled();
    });

    it('should handle aria-pressed attribute', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1" aria-pressed="true">Pressed item</ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('toggle-group-item');
      expect(item).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Integration', () => {
    it('should render complete toggle group structure', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1">First</ToggleGroupItem>
          <ToggleGroupItem value="item2">Second</ToggleGroupItem>
          <ToggleGroupItem value="item3">Third</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('toggle-group-root')).toBeInTheDocument();
      const items = screen.getAllByTestId('toggle-group-item');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('First');
      expect(items[1]).toHaveTextContent('Second');
      expect(items[2]).toHaveTextContent('Third');
    });

    it('should handle different variants and sizes', () => {
      render(
        <ToggleGroup variant="outline" size="sm">
          <ToggleGroupItem value="item1">Small outline</ToggleGroupItem>
          <ToggleGroupItem value="item2">Another item</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('toggle-group-root')).toBeInTheDocument();
      const items = screen.getAllByTestId('toggle-group-item');
      expect(items).toHaveLength(2);
    });

    it('should handle mixed states', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="item1">Normal item</ToggleGroupItem>
          <ToggleGroupItem value="item2" disabled>Disabled item</ToggleGroupItem>
          <ToggleGroupItem value="item3" aria-pressed="true">Pressed item</ToggleGroupItem>
        </ToggleGroup>
      );

      const items = screen.getAllByTestId('toggle-group-item');
      expect(items[0]).not.toBeDisabled();
      expect(items[1]).toBeDisabled();
      expect(items[2]).toHaveAttribute('aria-pressed', 'true');
    });
  });
});