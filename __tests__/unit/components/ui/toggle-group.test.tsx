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

jest.mock('@radix-ui/react-toggle-group', () => ({
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
      data-value={value}
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
      const toggleGroup = screen.getByRole('group');
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
      const toggleGroup = screen.getByRole('group');
      expect(toggleGroup).toHaveClass('custom-toggle-group');
    });

    it('should render with custom variant', () => {
      render(
        <ToggleGroup variant="outline">
          <div>Outline variant</div>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByRole('group');
      expect(toggleGroup).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(
        <ToggleGroup size="sm">
          <div>Small size</div>
        </ToggleGroup>
      );
      const toggleGroup = screen.getByRole('group');
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

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ToggleGroup ref={ref}>Ref test</ToggleGroup>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <ToggleGroup>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ToggleGroup>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('ToggleGroupItem', () => {
    it('should render with default props', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem>Toggle item</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeInTheDocument();
      expect(toggleItem.tagName).toBe('BUTTON');
      expect(toggleItem).toHaveClass('mock-toggle-classes');
      expect(screen.getByText('Toggle item')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem className="custom-toggle-item">
            Custom toggle item
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toHaveClass('custom-toggle-item');
    });

    it('should render with custom variant', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem variant="outline">Outline item</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem size="lg">Large item</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem
            data-testid="custom-toggle-item"
            value="item1"
            disabled
          >
            Props test
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleItem = screen.getByTestId('custom-toggle-item');
      expect(toggleItem).toHaveAttribute('value', 'item1');
      expect(toggleItem).toBeDisabled();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <ToggleGroup>
          <ToggleGroupItem ref={ref}>Ref test</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem disabled>Disabled item</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeDisabled();
    });

    it('should handle value attribute', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem value="toggle1">Value item</ToggleGroupItem>
        </ToggleGroup>
      );
      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toHaveAttribute('value', 'toggle1');
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for ToggleGroup', () => {
      expect(ToggleGroup.displayName).toBe('Root');
    });

    it('should have correct displayName for ToggleGroupItem', () => {
      expect(ToggleGroupItem.displayName).toBe('Item');
    });
  });

  describe('Integration', () => {
    it('should render complete toggle group structure', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('toggle-group-root')).toBeInTheDocument();
      expect(screen.getAllByTestId('toggle-group-item')).toHaveLength(3);
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();
      expect(screen.getByText('Underline')).toBeInTheDocument();
    });

    it('should handle multiple toggle groups', () => {
      render(
        <div>
          <ToggleGroup type="single">
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="center">Center</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="multiple">
            <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
            <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );

      const toggleGroups = screen.getAllByTestId('toggle-group-root');
      const toggleItems = screen.getAllByTestId('toggle-group-item');

      expect(toggleGroups).toHaveLength(2);
      expect(toggleItems).toHaveLength(5);
      expect(toggleGroups[0]).toHaveAttribute('type', 'single');
      expect(toggleGroups[1]).toHaveAttribute('type', 'multiple');
    });

    it('should handle toggle group with different variants', () => {
      render(
        <div>
          <ToggleGroup variant="default">
            <ToggleGroupItem>Default</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup variant="outline">
            <ToggleGroupItem>Outline</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );

      const toggleGroups = screen.getAllByTestId('toggle-group-root');
      expect(toggleGroups).toHaveLength(2);
    });

    it('should handle toggle group with different sizes', () => {
      render(
        <div>
          <ToggleGroup size="sm">
            <ToggleGroupItem>Small</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup size="lg">
            <ToggleGroupItem>Large</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );

      const toggleGroups = screen.getAllByTestId('toggle-group-root');
      expect(toggleGroups).toHaveLength(2);
    });

    it('should handle toggle group with context inheritance', () => {
      render(
        <ToggleGroup variant="outline" size="sm">
          <ToggleGroupItem>Inherited variant and size</ToggleGroupItem>
          <ToggleGroupItem variant="default" size="lg">Override variant and size</ToggleGroupItem>
        </ToggleGroup>
      );

      const toggleItems = screen.getAllByTestId('toggle-group-item');
      expect(toggleItems).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <ToggleGroup>
          <ToggleGroupItem>Accessible item</ToggleGroupItem>
        </ToggleGroup>
      );

      const toggleGroup = screen.getByTestId('toggle-group-root');
      const toggleItem = screen.getByTestId('toggle-group-item');

      expect(toggleGroup.tagName).toBe('DIV');
      expect(toggleItem.tagName).toBe('BUTTON');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <ToggleGroup
          aria-label="Text formatting options"
          aria-describedby="formatting-help"
        >
          <ToggleGroupItem
            aria-label="Bold text"
            aria-describedby="bold-help"
          >
            Bold
          </ToggleGroupItem>
        </ToggleGroup>
      );

      const toggleGroup = screen.getByTestId('toggle-group-root');
      const toggleItem = screen.getByTestId('toggle-group-item');

      expect(toggleGroup).toHaveAttribute('aria-label', 'Text formatting options');
      expect(toggleGroup).toHaveAttribute('aria-describedby', 'formatting-help');
      expect(toggleItem).toHaveAttribute('aria-label', 'Bold text');
      expect(toggleItem).toHaveAttribute('aria-describedby', 'bold-help');
    });

    it('should handle role attribute', () => {
      render(<ToggleGroup role="group">Role test</ToggleGroup>);
      const toggleGroup = screen.getByRole('group');
      expect(toggleGroup).toBeInTheDocument();
    });

    it('should handle tabIndex', () => {
      render(<ToggleGroup tabIndex={0}>Tab test</ToggleGroup>);
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<ToggleGroup>Styled toggle group</ToggleGroup>);
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toHaveClass('flex', 'items-center', 'justify-center', 'gap-1');
    });

    it('should combine custom classes with default classes', () => {
      render(<ToggleGroup className="border border-gray-300">Custom styled</ToggleGroup>);
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toHaveClass('border', 'border-gray-300');
    });

    it('should handle conditional classes', () => {
      const isVertical = true;
      render(
        <ToggleGroup
          className={isVertical ? 'flex-col' : 'flex-row'}
        >
          Conditional styling
        </ToggleGroup>
      );
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toHaveClass('flex-col');
    });

    it('should handle responsive classes', () => {
      render(<ToggleGroup className="gap-1 md:gap-2 lg:gap-3">Responsive</ToggleGroup>);
      const toggleGroup = screen.getByTestId('toggle-group-root');
      expect(toggleGroup).toHaveClass('gap-1', 'md:gap-2', 'lg:gap-3');
    });
  });

  describe('Context Usage', () => {
    it('should provide context to children', () => {
      render(
        <ToggleGroup variant="outline" size="sm">
          <ToggleGroupItem>Context item</ToggleGroupItem>
        </ToggleGroup>
      );

      const toggleGroup = screen.getByTestId('toggle-group-root');
      const toggleItem = screen.getByTestId('toggle-group-item');

      expect(toggleGroup).toBeInTheDocument();
      expect(toggleItem).toBeInTheDocument();
      expect(toggleItem).toHaveClass('mock-toggle-classes');
    });

    it('should allow context override', () => {
      render(
        <ToggleGroup variant="outline" size="sm">
          <ToggleGroupItem variant="default" size="lg">
            Override context
          </ToggleGroupItem>
        </ToggleGroup>
      );

      const toggleItem = screen.getByTestId('toggle-group-item');
      expect(toggleItem).toBeInTheDocument();
      expect(toggleItem).toHaveClass('mock-toggle-classes');
    });
  });
});