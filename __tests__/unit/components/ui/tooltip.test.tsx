import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children, ...props }: any) => (
    <div data-testid="tooltip-provider" {...props}>
      {children}
    </div>
  ),
  Root: ({ children, ...props }: any) => (
    <div data-testid="tooltip-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="tooltip-trigger" {...props}>
      {children}
    </button>
  ),
  Content: React.forwardRef(({ className, sideOffset, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="tooltip-content"
      data-side-offset={sideOffset}
      className={className}
      {...props}
    >
      {children}
    </div>
  ))
}));

describe('Tooltip Components', () => {
  describe('TooltipProvider', () => {
    it('should render with default props', () => {
      render(
        <TooltipProvider>
          <div>Provider content</div>
        </TooltipProvider>
      );
      const provider = screen.getByTestId('tooltip-provider');
      expect(provider).toBeInTheDocument();
      expect(screen.getByText('Provider content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <TooltipProvider
          data-testid="custom-provider"
          className="custom-provider"
        >
          Props test
        </TooltipProvider>
      );
      const provider = screen.getByTestId('custom-provider');
      expect(provider).toHaveClass('custom-provider');
    });
  });

  describe('Tooltip', () => {
    it('should render with default props', () => {
      render(
        <Tooltip>
          <div>Tooltip content</div>
        </Tooltip>
      );
      const tooltip = screen.getByTestId('tooltip-root');
      expect(tooltip).toBeInTheDocument();
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Tooltip
          data-testid="custom-tooltip"
          className="custom-tooltip"
        >
          Props test
        </Tooltip>
      );
      const tooltip = screen.getByTestId('custom-tooltip');
      expect(tooltip).toHaveClass('custom-tooltip');
    });
  });

  describe('TooltipTrigger', () => {
    it('should render with default props', () => {
      render(
        <TooltipTrigger>
          <span>Hover me</span>
        </TooltipTrigger>
      );
      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <TooltipTrigger
          data-testid="custom-trigger"
          className="custom-trigger"
          disabled
        >
          Custom trigger
        </TooltipTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('TooltipContent', () => {
    it('should render with default props', () => {
      render(<TooltipContent>Tooltip text</TooltipContent>);
      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Tooltip text');
      expect(content).toHaveAttribute('data-side-offset', '4');
      expect(content).toHaveClass('z-50', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'px-3', 'py-1.5', 'text-sm', 'text-popover-foreground', 'shadow-md', 'animate-in', 'fade-in-0', 'zoom-in-95', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=closed]:zoom-out-95', 'data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2');
    });

    it('should render with custom sideOffset', () => {
      render(<TooltipContent sideOffset={8}>Custom offset</TooltipContent>);
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side-offset', '8');
    });

    it('should render with custom className', () => {
      render(<TooltipContent className="custom-content">Custom class</TooltipContent>);
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should pass through additional props', () => {
      render(
        <TooltipContent
          data-testid="custom-content"
          aria-label="Custom tooltip"
          role="tooltip"
        >
          Props test
        </TooltipContent>
      );
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveAttribute('aria-label', 'Custom tooltip');
      expect(content).toHaveAttribute('role', 'tooltip');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<TooltipContent ref={ref}>Ref test</TooltipContent>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for TooltipContent', () => {
      expect(TooltipContent.displayName).toBe('Content');
    });
  });

  describe('Integration', () => {
    it('should render complete tooltip structure', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover for tooltip</TooltipTrigger>
            <TooltipContent>
              This is a helpful tooltip message
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      expect(screen.getByText('Hover for tooltip')).toBeInTheDocument();
      expect(screen.getByText('This is a helpful tooltip message')).toBeInTheDocument();
    });

    it('should handle multiple tooltips', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>First tooltip</TooltipTrigger>
            <TooltipContent>First content</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second tooltip</TooltipTrigger>
            <TooltipContent>Second content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltips = screen.getAllByTestId('tooltip-root');
      const triggers = screen.getAllByTestId('tooltip-trigger');
      const contents = screen.getAllByTestId('tooltip-content');

      expect(tooltips).toHaveLength(2);
      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
      expect(screen.getByText('First tooltip')).toBeInTheDocument();
      expect(screen.getByText('Second tooltip')).toBeInTheDocument();
    });

    it('should handle tooltip with different side offsets', () => {
      render(
        <div>
          <Tooltip>
            <TooltipTrigger>Small offset</TooltipTrigger>
            <TooltipContent sideOffset={2}>Small offset content</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Large offset</TooltipTrigger>
            <TooltipContent sideOffset={12}>Large offset content</TooltipContent>
          </Tooltip>
        </div>
      );

      const contents = screen.getAllByTestId('tooltip-content');
      expect(contents[0]).toHaveAttribute('data-side-offset', '2');
      expect(contents[1]).toHaveAttribute('data-side-offset', '12');
    });

    it('should handle tooltip with complex content', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Complex tooltip</TooltipTrigger>
          <TooltipContent>
            <div>
              <h4>Tooltip Title</h4>
              <p>This is a <strong>rich</strong> tooltip with <em>formatting</em>.</p>
              <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      );

      expect(screen.getByText('Complex tooltip')).toBeInTheDocument();
      expect(screen.getByText('Tooltip Title')).toBeInTheDocument();
      expect(screen.getByText('This is a')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Accessible trigger</TooltipTrigger>
          <TooltipContent>Accessible content</TooltipContent>
        </Tooltip>
      );

      const tooltip = screen.getByTestId('tooltip-root');
      const trigger = screen.getByTestId('tooltip-trigger');
      const content = screen.getByTestId('tooltip-content');

      expect(tooltip.tagName).toBe('DIV');
      expect(trigger.tagName).toBe('BUTTON');
      expect(content.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Tooltip>
          <TooltipTrigger
            aria-label="Tooltip trigger"
            aria-describedby="tooltip-content"
          >
            Aria trigger
          </TooltipTrigger>
          <TooltipContent
            id="tooltip-content"
            aria-label="Tooltip content"
          >
            Aria content
          </TooltipContent>
        </Tooltip>
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      const content = screen.getByTestId('tooltip-content');

      expect(trigger).toHaveAttribute('aria-label', 'Tooltip trigger');
      expect(trigger).toHaveAttribute('aria-describedby', 'tooltip-content');
      expect(content).toHaveAttribute('id', 'tooltip-content');
      expect(content).toHaveAttribute('aria-label', 'Tooltip content');
    });

    it('should handle role attribute', () => {
      render(<Tooltip role="tooltip">Role test</Tooltip>);
      const tooltip = screen.getByTestId('tooltip-root');
      expect(tooltip).toHaveAttribute('role', 'tooltip');
    });

    it('should handle tabIndex', () => {
      render(<Tooltip tabIndex={0}>Tab test</Tooltip>);
      const tooltip = screen.getByTestId('tooltip-root');
      expect(tooltip).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<TooltipContent>Styled tooltip</TooltipContent>);
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('z-50', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'px-3', 'py-1.5', 'text-sm', 'text-popover-foreground', 'shadow-md', 'animate-in', 'fade-in-0', 'zoom-in-95', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=closed]:zoom-out-95', 'data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2');
    });

    it('should combine custom classes with default classes', () => {
      render(<TooltipContent className="border border-gray-300">Custom styled</TooltipContent>);
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('border', 'border-gray-300');
    });

    it('should handle conditional classes', () => {
      const isVisible = true;
      render(
        <TooltipContent
          className={isVisible ? 'opacity-100' : 'opacity-0'}
        >
          Conditional styling
        </TooltipContent>
      );
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('opacity-100');
    });

    it('should handle responsive classes', () => {
      render(<TooltipContent className="text-xs md:text-sm lg:text-base">Responsive</TooltipContent>);
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('text-xs', 'md:text-sm', 'lg:text-base');
    });
  });

  describe('Event Handling', () => {
    it('should handle trigger click events', () => {
      const handleClick = jest.fn();
      render(
        <TooltipTrigger onClick={handleClick}>
          Clickable trigger
        </TooltipTrigger>
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      trigger.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle trigger focus events', () => {
      const handleFocus = jest.fn();
      render(
        <TooltipTrigger onFocus={handleFocus}>
          Focusable trigger
        </TooltipTrigger>
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      trigger.focus();

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle trigger hover events', () => {
      const handleMouseEnter = jest.fn();
      render(
        <TooltipTrigger onMouseEnter={handleMouseEnter}>
          Hoverable trigger
        </TooltipTrigger>
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });
  });
});