import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-hover-card', () => {
  const Root = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="hover-card-root"
      {...props}
    >
      {children}
    </div>
  ));
  Root.displayName = 'Root';

  const Trigger = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="hover-card-trigger"
      {...props}
    >
      {children}
    </div>
  ));
  Trigger.displayName = 'Trigger';

  const Content = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="hover-card-content"
      {...props}
    >
      {children}
    </div>
  ));
  Content.displayName = 'Content';

  return { Root, Trigger, Content };
});

describe('HoverCard Components', () => {
  describe('HoverCard', () => {
    it('should render children', () => {
      render(
        <HoverCard>
          <div>Hover card content</div>
        </HoverCard>
      );
      expect(screen.getByTestId('hover-card-root')).toBeInTheDocument();
      expect(screen.getByText('Hover card content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <HoverCard data-testid="custom-hover-card" className="custom-class">
          Content
        </HoverCard>
      );
      const hoverCard = screen.getByTestId('custom-hover-card');
      expect(hoverCard).toHaveClass('custom-class');
    });

    it('should handle multiple children', () => {
      render(
        <HoverCard>
          <div>Child 1</div>
          <div>Child 2</div>
        </HoverCard>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('HoverCardTrigger', () => {
    it('should render children', () => {
      render(
        <HoverCardTrigger>
          <span>Hover me</span>
        </HoverCardTrigger>
      );
      const trigger = screen.getByTestId('hover-card-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <HoverCardTrigger
          data-testid="custom-trigger"
          className="custom-trigger"
          disabled
        >
          Custom trigger
        </HoverCardTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveAttribute('disabled');
    });

    it('should handle button attributes', () => {
      render(
        <HoverCardTrigger type="button" aria-label="Hover for more info">
          Button trigger
        </HoverCardTrigger>
      );
      const trigger = screen.getByTestId('hover-card-trigger');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('aria-label', 'Hover for more info');
    });
  });

  describe('HoverCardContent', () => {
    it('should render with default props', () => {
      render(<HoverCardContent>Content text</HoverCardContent>);
      const content = screen.getByTestId('hover-card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content text');
      expect(content).toHaveAttribute('data-align', 'center');
      expect(content).toHaveAttribute('data-side-offset', '4');
      expect(content).toHaveClass('z-50', 'w-64', 'rounded-md', 'border', 'bg-popover', 'p-4', 'text-popover-foreground', 'shadow-md', 'outline-none', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95', 'data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2');
    });

    it('should render with custom align', () => {
      render(<HoverCardContent align="start">Start aligned</HoverCardContent>);
      const content = screen.getByTestId('hover-card-content');
      expect(content).toHaveAttribute('data-align', 'start');
    });

    it('should render with custom sideOffset', () => {
      render(<HoverCardContent sideOffset={8}>Custom offset</HoverCardContent>);
      const content = screen.getByTestId('hover-card-content');
      expect(content).toHaveAttribute('data-side-offset', '8');
    });

    it('should render with custom className', () => {
      render(<HoverCardContent className="custom-content">Custom class</HoverCardContent>);
      const content = screen.getByTestId('hover-card-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should pass through additional props', () => {
      render(
        <HoverCardContent
          data-testid="custom-content"
          aria-label="Custom content"
          role="tooltip"
        >
          Props test
        </HoverCardContent>
      );
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveAttribute('aria-label', 'Custom content');
      expect(content).toHaveAttribute('role', 'tooltip');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<HoverCardContent ref={ref}>Ref test</HoverCardContent>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle complex content', () => {
      render(
        <HoverCardContent>
          <div>
            <h3>User Profile</h3>
            <p>Name: <strong>John Doe</strong></p>
            <p>Role: <em>Developer</em></p>
            <ul>
              <li>Frontend</li>
              <li>Backend</li>
            </ul>
          </div>
        </HoverCardContent>
      );
      
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Name:')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Role:')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for HoverCardContent', () => {
      expect(HoverCardContent.displayName).toBe('Content');
    });
  });

  describe('Integration', () => {
    it('should render complete hover card structure', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>Hover for info</HoverCardTrigger>
          <HoverCardContent>
            <div>Additional information</div>
            <p>This appears on hover</p>
          </HoverCardContent>
        </HoverCard>
      );

      expect(screen.getByTestId('hover-card-root')).toBeInTheDocument();
      expect(screen.getByTestId('hover-card-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
      expect(screen.getByText('Hover for info')).toBeInTheDocument();
      expect(screen.getByText('Additional information')).toBeInTheDocument();
      expect(screen.getByText('This appears on hover')).toBeInTheDocument();
    });

    it('should handle multiple hover cards', () => {
      render(
        <div>
          <HoverCard>
            <HoverCardTrigger>Card 1</HoverCardTrigger>
            <HoverCardContent>Content 1</HoverCardContent>
          </HoverCard>
          <HoverCard>
            <HoverCardTrigger>Card 2</HoverCardTrigger>
            <HoverCardContent>Content 2</HoverCardContent>
          </HoverCard>
        </div>
      );

      const roots = screen.getAllByTestId('hover-card-root');
      const triggers = screen.getAllByTestId('hover-card-trigger');
      const contents = screen.getAllByTestId('hover-card-content');

      expect(roots).toHaveLength(2);
      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle different alignments and offsets', () => {
      render(
        <div>
          <HoverCard>
            <HoverCardTrigger>Start aligned</HoverCardTrigger>
            <HoverCardContent align="start" sideOffset={2}>
              Start content
            </HoverCardContent>
          </HoverCard>
          <HoverCard>
            <HoverCardTrigger>End aligned</HoverCardTrigger>
            <HoverCardContent align="end" sideOffset={6}>
              End content
            </HoverCardContent>
          </HoverCard>
        </div>
      );

      const contents = screen.getAllByTestId('hover-card-content');
      expect(contents[0]).toHaveAttribute('data-align', 'start');
      expect(contents[0]).toHaveAttribute('data-side-offset', '2');
      expect(contents[1]).toHaveAttribute('data-align', 'end');
      expect(contents[1]).toHaveAttribute('data-side-offset', '6');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>Accessible trigger</HoverCardTrigger>
          <HoverCardContent>Accessible content</HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByTestId('hover-card-trigger');
      const content = screen.getByTestId('hover-card-content');

      expect(trigger.tagName).toBe('BUTTON');
      expect(content.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <HoverCard>
          <HoverCardTrigger aria-describedby="hover-content">
            Trigger
          </HoverCardTrigger>
          <HoverCardContent id="hover-content" role="tooltip">
            Tooltip content
          </HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByTestId('hover-card-trigger');
      const content = screen.getByTestId('hover-card-content');

      expect(trigger).toHaveAttribute('aria-describedby', 'hover-content');
      expect(content).toHaveAttribute('id', 'hover-content');
      expect(content).toHaveAttribute('role', 'tooltip');
    });
  });
});