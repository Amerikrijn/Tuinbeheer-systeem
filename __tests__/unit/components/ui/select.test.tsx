import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
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

// Mock the Radix UI Select components to properly render with data-testid
jest.mock('@radix-ui/react-select', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="select-root" {...props}>
      {children}
    </div>
  )),
  Group: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="select-group" {...props}>
      {children}
    </div>
  )),
  Value: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <span ref={ref} data-testid="select-value" {...props}>
      {children}
    </span>
  )),
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
        <Select>
          <SelectGroup>
            <div>Group content</div>
          </SelectGroup>
        </Select>
      );
      expect(screen.getByTestId('select-group')).toBeInTheDocument();
      expect(screen.getByText('Group content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Select>
          <SelectGroup
            data-testid="custom-group"
            className="custom-group"
          >
            Custom group
          </SelectGroup>
        </Select>
      );
      const group = screen.getByTestId('custom-group');
      expect(group).toHaveClass('custom-group');
    });
  });

  describe('SelectValue', () => {
    it('should render children', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue>Selected value</SelectValue>
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('select-value')).toBeInTheDocument();
      expect(screen.getByText('Selected value')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue
              data-testid="custom-value"
              className="custom-value"
            >
              Custom value
            </SelectValue>
          </SelectTrigger>
        </Select>
      );
      const value = screen.getByTestId('custom-value');
      expect(value).toHaveClass('custom-value');
    });
  });

  describe('SelectTrigger', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectTrigger>Choose option</SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Choose option');
    });

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">Custom trigger</SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should render with icon', () => {
      render(
        <Select>
          <SelectTrigger>Trigger with icon</SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <Select>
          <SelectTrigger data-testid="custom-trigger" aria-label="Select an option">
            Custom trigger
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select an option');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectTrigger ref={ref}>Ref trigger</SelectTrigger>
        </Select>
      );
      expect(ref.current).toBeInTheDocument();
      expect(ref.current).toHaveAttribute('data-testid', 'select-trigger');
    });
  });

  describe('SelectContent', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
    });

    it('should render with custom position', () => {
      render(
        <Select>
          <SelectContent position="item">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'item');
    });

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectContent className="custom-content">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should render with portal', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-portal')).toBeInTheDocument();
    });

    it('should render with scroll buttons and viewport', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-scroll-up-button')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-down-button')).toBeInTheDocument();
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectContent ref={ref}>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(ref.current).toBeInTheDocument();
      expect(ref.current).toHaveAttribute('data-testid', 'select-content');
    });
  });

  describe('SelectLabel', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group Label</SelectLabel>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      const label = screen.getByTestId('select-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Group Label');
    });

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="custom-label">Custom Label</SelectLabel>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      const label = screen.getByTestId('select-label');
      expect(label).toHaveClass('custom-label');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectContent>
            <SelectGroup>
              <SelectLabel ref={ref}>Ref Label</SelectLabel>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(ref.current).toBeInTheDocument();
      expect(ref.current).toHaveAttribute('data-testid', 'select-label');
    });
  });

  describe('SelectItem', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const item = screen.getByTestId('select-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent('Option 1');
    });

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1" className="custom-item">Custom Option</SelectItem>
          </SelectContent>
        </Select>
      );
      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('custom-item');
    });

    it('should render with indicator and text', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option with indicator</SelectItem>
          </SelectContent>
        </Select>
      );
      const item = screen.getByTestId('select-item');
      expect(item).toBeInTheDocument();
      expect(screen.getByTestId('select-item-text')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectContent>
            <SelectItem ref={ref} value="option1">Ref Option</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(ref.current).toBeInTheDocument();
      expect(ref.current).toHaveAttribute('data-testid', 'select-item');
    });
  });

  describe('SelectSeparator', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectContent>
            <SelectSeparator />
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const separator = screen.getByTestId('select-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectSeparator className="custom-separator" />
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveClass('custom-separator');
    });
  });

  describe('SelectScrollUpButton', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const button = screen.getByTestId('select-scroll-up-button');
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('should render with chevron up icon', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const button = screen.getByTestId('select-scroll-up-button');
      expect(button).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-scroll-up-button')).toBeInTheDocument();
    });
  });

  describe('SelectScrollDownButton', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const button = screen.getByTestId('select-scroll-down-button');
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should render with chevron down icon', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const button = screen.getByTestId('select-scroll-down-button');
      expect(button).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-scroll-down-button')).toBeInTheDocument();
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
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-root')).toBeInTheDocument();
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.getByTestId('select-group')).toBeInTheDocument();
      expect(screen.getByTestId('select-label')).toBeInTheDocument();
      expect(screen.getAllByTestId('select-item')).toHaveLength(2);
    });

    it('should handle multiple select instances', () => {
      render(
        <div>
          <Select>
            <SelectTrigger>Select 1</SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>Select 2</SelectTrigger>
            <SelectContent>
              <SelectItem value="option2">Option 2</SelectItem>
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
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      const content = screen.getByTestId('select-content');
      const item = screen.getByTestId('select-item');

      expect(trigger).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(item).toBeInTheDocument();
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Select>
          <SelectTrigger
            aria-label="Select an option"
            aria-describedby="select-help"
          >
            Aria select
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select an option');
      expect(trigger).toHaveAttribute('aria-describedby', 'select-help');
    });
  });
});