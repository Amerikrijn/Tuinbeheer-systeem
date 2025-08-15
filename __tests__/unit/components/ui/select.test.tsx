import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from '@/components/ui/select';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-select', () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="select-root" {...props}>
      {children}
    </div>
  ),
  Group: ({ children, ...props }: any) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  ),
  Value: ({ children, ...props }: any) => (
    <span data-testid="select-value" {...props}>
      {children}
    </span>
  ),
  Trigger: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="select-trigger"
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
  Portal: ({ children }: any) => (
    <div data-testid="select-portal">
      {children}
    </div>
  ),
  Content: React.forwardRef(({ className, position, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="select-content"
      data-position={position}
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Label: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="select-label"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Item: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="select-item"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  ItemIndicator: ({ children }: any) => (
    <span data-testid="select-item-indicator">
      {children}
    </span>
  ),
  ItemText: ({ children }: any) => (
    <span data-testid="select-item-text">
      {children}
    </span>
  ),
  Separator: React.forwardRef(({ className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="select-separator"
      className={className}
      {...props}
    />
  )),
  ScrollUpButton: React.forwardRef(({ className, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="select-scroll-up-button"
      className={className}
      {...props}
    />
  )),
  ScrollDownButton: React.forwardRef(({ className, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="select-scroll-down-button"
      className={className}
      {...props}
    />
  )),
  Viewport: ({ className, children }: any) => (
    <div data-testid="select-viewport" className={className}>
      {children}
    </div>
  ),
  Icon: ({ children }: any) => (
    <span data-testid="select-icon">
      {children}
    </span>
  ),
}));

jest.mock('lucide-react', () => ({
  Check: ({ ...props }: any) => (
    <span data-testid="check-icon" {...props}>✓</span>
  ),
  ChevronDown: ({ ...props }: any) => (
    <span data-testid="chevron-down-icon" {...props}>▼</span>
  ),
  ChevronUp: ({ ...props }: any) => (
    <span data-testid="chevron-up-icon" {...props}>▲</span>
  ),
}));

describe('Select Components', () => {
  describe('Select', () => {
    it('should render children', () => {
      render(
        <Select>
          <div>Select content</div>
        </Select>
      );
      expect(screen.getByTestId('select-root')).toBeInTheDocument();
      expect(screen.getByText('Select content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Select data-testid="custom-select" className="custom-class">
          Content
        </Select>
      );
      const select = screen.getByTestId('custom-select');
      expect(select).toHaveClass('custom-class');
    });
  });

  describe('SelectGroup', () => {
    it('should render children', () => {
      render(
        <SelectGroup>
          <div>Group content</div>
        </SelectGroup>
      );
      expect(screen.getByTestId('select-group')).toBeInTheDocument();
      expect(screen.getByText('Group content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <SelectGroup
          data-testid="custom-group"
          className="custom-group"
        >
          Custom group
        </SelectGroup>
      );
      const group = screen.getByTestId('custom-group');
      expect(group).toHaveClass('custom-group');
    });
  });

  describe('SelectValue', () => {
    it('should render children', () => {
      render(<SelectValue>Selected value</SelectValue>);
      expect(screen.getByTestId('select-value')).toBeInTheDocument();
      expect(screen.getByText('Selected value')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <SelectValue
          data-testid="custom-value"
          className="custom-value"
        >
          Custom value
        </SelectValue>
      );
      const value = screen.getByTestId('custom-value');
      expect(value).toHaveClass('custom-value');
    });
  });

  describe('SelectTrigger', () => {
    it('should render with default props', () => {
      render(<SelectTrigger>Select option</SelectTrigger>);
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Select option');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveClass('flex', 'h-10', 'w-full', 'items-center', 'justify-between', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-sm', 'ring-offset-background', 'placeholder:text-muted-foreground', 'focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2', 'disabled:cursor-not-allowed', 'disabled:opacity-50', '[&>span]:line-clamp-1');
    });

    it('should render with custom className', () => {
      render(<SelectTrigger className="custom-trigger">Custom trigger</SelectTrigger>);
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should render with icon', () => {
      render(<SelectTrigger>Trigger with icon</SelectTrigger>);
      expect(screen.getByTestId('select-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <SelectTrigger
          data-testid="custom-trigger"
          disabled
          aria-label="Select an option"
        >
          Props test
        </SelectTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('disabled');
      expect(trigger).toHaveAttribute('aria-label', 'Select an option');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<SelectTrigger ref={ref}>Ref test</SelectTrigger>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('SelectContent', () => {
    it('should render with default props', () => {
      render(<SelectContent>Content text</SelectContent>);
      const content = screen.getByTestId('select-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content text');
      expect(content).toHaveAttribute('data-position', 'popper');
      expect(content).toHaveClass('relative', 'z-50', 'max-h-96', 'min-w-[8rem]', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'text-popover-foreground', 'shadow-md', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95', 'data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2');
    });

    it('should render with custom position', () => {
      render(<SelectContent position="item">Item position</SelectContent>);
      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'item');
    });

    it('should render with custom className', () => {
      render(<SelectContent className="custom-content">Custom class</SelectContent>);
      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should render with portal', () => {
      render(<SelectContent>Portal content</SelectContent>);
      expect(screen.getByTestId('select-portal')).toBeInTheDocument();
    });

    it('should render with scroll buttons and viewport', () => {
      render(<SelectContent>Content with scroll</SelectContent>);
      expect(screen.getByTestId('select-scroll-up-button')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-down-button')).toBeInTheDocument();
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SelectContent ref={ref}>Ref test</SelectContent>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('SelectLabel', () => {
    it('should render with default props', () => {
      render(<SelectLabel>Select Label</SelectLabel>);
      const label = screen.getByTestId('select-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Select Label');
      expect(label).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm', 'font-semibold');
    });

    it('should render with custom className', () => {
      render(<SelectLabel className="custom-label">Custom label</SelectLabel>);
      const label = screen.getByTestId('select-label');
      expect(label).toHaveClass('custom-label');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SelectLabel ref={ref}>Ref test</SelectLabel>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('SelectItem', () => {
    it('should render with default props', () => {
      render(<SelectItem>Select Item</SelectItem>);
      const item = screen.getByTestId('select-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent('Select Item');
      expect(item).toHaveClass('relative', 'flex', 'w-full', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'py-1.5', 'pl-8', 'pr-2', 'text-sm', 'outline-none', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50');
    });

    it('should render with custom className', () => {
      render(<SelectItem className="custom-item">Custom item</SelectItem>);
      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('custom-item');
    });

    it('should render with indicator and text', () => {
      render(<SelectItem>Item with indicator</SelectItem>);
      expect(screen.getByTestId('select-item-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-text')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SelectItem ref={ref}>Ref test</SelectItem>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('SelectSeparator', () => {
    it('should render with default props', () => {
      render(<SelectSeparator />);
      const separator = screen.getByTestId('select-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });

    it('should render with custom className', () => {
      render(<SelectSeparator className="custom-separator" />);
      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveClass('custom-separator');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SelectSeparator ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('SelectScrollUpButton', () => {
    it('should render with default props', () => {
      render(<SelectScrollUpButton />);
      const button = screen.getByTestId('select-scroll-up-button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveClass('flex', 'cursor-default', 'items-center', 'justify-center', 'py-1');
    });

    it('should render with chevron up icon', () => {
      render(<SelectScrollUpButton />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<SelectScrollUpButton className="custom-scroll-up" />);
      const button = screen.getByTestId('select-scroll-up-button');
      expect(button).toHaveClass('custom-scroll-up');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<SelectScrollUpButton ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('SelectScrollDownButton', () => {
    it('should render with default props', () => {
      render(<SelectScrollDownButton />);
      const button = screen.getByTestId('select-scroll-down-button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveClass('flex', 'cursor-default', 'items-center', 'justify-center', 'py-1');
    });

    it('should render with chevron down icon', () => {
      render(<SelectScrollDownButton />);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<SelectScrollDownButton className="custom-scroll-down" />);
      const button = screen.getByTestId('select-scroll-down-button');
      expect(button).toHaveClass('custom-scroll-down');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<SelectScrollDownButton ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });



  describe('Integration', () => {
    it('should render complete select structure', () => {
      render(
        <Select>
          <SelectTrigger>Choose option</SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Options</SelectLabel>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectSeparator />
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-root')).toBeInTheDocument();
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.getByTestId('select-group')).toBeInTheDocument();
      expect(screen.getByTestId('select-label')).toBeInTheDocument();
      expect(screen.getAllByTestId('select-item')).toHaveLength(3);
      expect(screen.getByTestId('select-separator')).toBeInTheDocument();
    });

    it('should handle multiple select instances', () => {
      render(
        <div>
          <Select>
            <SelectTrigger>Select 1</SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Item 1</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>Select 2</SelectTrigger>
            <SelectContent>
              <SelectItem value="2">Item 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

      const triggers = screen.getAllByTestId('select-trigger');
      const contents = screen.getAllByTestId('select-content');
      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Select>
          <SelectTrigger>Accessible select</SelectTrigger>
          <SelectContent>
            <SelectItem value="accessible">Accessible option</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      const content = screen.getByTestId('select-content');
      const item = screen.getByTestId('select-item');

      expect(trigger.tagName).toBe('BUTTON');
      expect(content.tagName).toBe('DIV');
      expect(item.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Select>
          <SelectTrigger
            aria-label="Select an option"
            aria-describedby="select-help"
            aria-expanded="false"
          >
            Aria select
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aria">Aria option</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select an option');
      expect(trigger).toHaveAttribute('aria-describedby', 'select-help');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });
});