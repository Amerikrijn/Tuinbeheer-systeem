import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-popover', () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="popover-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="popover-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: any) => (
    <div data-testid="popover-portal">
      {children}
    </div>
  ),
  Content: React.forwardRef(({ className, align, sideOffset, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="popover-content"
      data-align={align}
      data-side-offset={sideOffset}
      className={className}
      {...props}
    >
      {children}
    </div>
  ))
}));

describe('Popover Components', () => {
  describe('Popover', () => {
    it('should render children', () => {
      render(
        <Popover>
          <div>Popover content</div>
        </Popover>
      );
      expect(screen.getByTestId('popover-root')).toBeInTheDocument();
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Popover data-testid="custom-popover" className="custom-class">
          Content
        </Popover>
      );
      const popover = screen.getByTestId('custom-popover');
      expect(popover).toHaveClass('custom-class');
    });

    it('should handle multiple children', () => {
      render(
        <Popover>
          <div>Child 1</div>
          <div>Child 2</div>
        </Popover>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('PopoverTrigger', () => {
    it('should render children', () => {
      render(
        <PopoverTrigger>
          <span>Click me</span>
        </PopoverTrigger>
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <PopoverTrigger
          data-testid="custom-trigger"
          className="custom-trigger"
          disabled
        >
          Custom trigger
        </PopoverTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveAttribute('disabled');
    });

    it('should handle button attributes', () => {
      render(
        <PopoverTrigger type="button" aria-label="Open popover">
          Button trigger
        </PopoverTrigger>
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('aria-label', 'Open popover');
    });
  });

  describe('PopoverContent', () => {
    it('should render with default props', () => {
      render(<PopoverContent>Content text</PopoverContent>);
      const content = screen.getByTestId('popover-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content text');
      expect(content).toHaveAttribute('data-align', 'center');
      expect(content).toHaveAttribute('data-side-offset', '4');
      expect(content).toHaveClass('z-50', 'w-72', 'rounded-md', 'border', 'bg-popover', 'p-4', 'text-popover-foreground', 'shadow-md', 'outline-none', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95', 'data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2');
    });

    it('should render with custom align', () => {
      render(<PopoverContent align="start">Start aligned</PopoverContent>);
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-align', 'start');
    });

    it('should render with custom sideOffset', () => {
      render(<PopoverContent sideOffset={8}>Custom offset</PopoverContent>);
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-side-offset', '8');
    });

    it('should render with custom className', () => {
      render(<PopoverContent className="custom-content">Custom class</PopoverContent>);
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should pass through additional props', () => {
      render(
        <PopoverContent
          data-testid="custom-content"
          aria-label="Custom content"
          role="dialog"
        >
          Props test
        </PopoverContent>
      );
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveAttribute('aria-label', 'Custom content');
      expect(content).toHaveAttribute('role', 'dialog');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<PopoverContent ref={ref}>Ref test</PopoverContent>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should render with portal', () => {
      render(<PopoverContent>Portal content</PopoverContent>);
      expect(screen.getByTestId('popover-portal')).toBeInTheDocument();
      expect(screen.getByText('Portal content')).toBeInTheDocument();
    });

    it('should handle complex content', () => {
      render(
        <PopoverContent>
          <div>
            <h3>Popover Title</h3>
            <p>This is a <strong>rich</strong> content with <em>formatting</em>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
            <button>Action button</button>
          </div>
        </PopoverContent>
      );
      
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
      expect(screen.getByText('This is a')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
      expect(screen.getByText('Action button')).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for PopoverContent', () => {
      expect(PopoverContent.displayName).toBe('Content');
    });
  });

  describe('Integration', () => {
    it('should render complete popover structure', () => {
      render(
        <Popover>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>
            <div>Popover content here</div>
            <p>Additional information</p>
          </PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('popover-root')).toBeInTheDocument();
      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      expect(screen.getByText('Open popover')).toBeInTheDocument();
      expect(screen.getByText('Popover content here')).toBeInTheDocument();
      expect(screen.getByText('Additional information')).toBeInTheDocument();
    });

    it('should handle multiple popovers', () => {
      render(
        <div>
          <Popover>
            <PopoverTrigger>Popover 1</PopoverTrigger>
            <PopoverContent>Content 1</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>Popover 2</PopoverTrigger>
            <PopoverContent>Content 2</PopoverContent>
          </Popover>
        </div>
      );

      const roots = screen.getAllByTestId('popover-root');
      const triggers = screen.getAllByTestId('popover-trigger');
      const contents = screen.getAllByTestId('popover-content');

      expect(roots).toHaveLength(2);
      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
      expect(screen.getByText('Popover 1')).toBeInTheDocument();
      expect(screen.getByText('Popover 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle different alignments and offsets', () => {
      render(
        <div>
          <Popover>
            <PopoverTrigger>Start aligned</PopoverTrigger>
            <PopoverContent align="start" sideOffset={2}>
              Start content
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>End aligned</PopoverTrigger>
            <PopoverContent align="end" sideOffset={6}>
              End content
            </PopoverContent>
          </Popover>
        </div>
      );

      const contents = screen.getAllByTestId('popover-content');
      expect(contents[0]).toHaveAttribute('data-align', 'start');
      expect(contents[0]).toHaveAttribute('data-side-offset', '2');
      expect(contents[1]).toHaveAttribute('data-align', 'end');
      expect(contents[1]).toHaveAttribute('data-side-offset', '6');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Popover>
          <PopoverTrigger>Accessible trigger</PopoverTrigger>
          <PopoverContent>Accessible content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByTestId('popover-trigger');
      const content = screen.getByTestId('popover-content');

      expect(trigger.tagName).toBe('BUTTON');
      expect(content.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Popover>
          <PopoverTrigger aria-expanded="false" aria-haspopup="dialog">
            Trigger
          </PopoverTrigger>
          <PopoverContent id="popover-content" role="dialog" aria-label="Popover">
            Content
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByTestId('popover-trigger');
      const content = screen.getByTestId('popover-content');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(content).toHaveAttribute('id', 'popover-content');
      expect(content).toHaveAttribute('role', 'dialog');
      expect(content).toHaveAttribute('aria-label', 'Popover');
    });
  });
});