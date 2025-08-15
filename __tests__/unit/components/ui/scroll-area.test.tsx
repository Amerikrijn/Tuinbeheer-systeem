import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-scroll-area', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="scroll-area-root"
      {...props}
    >
      {children}
    </div>
  )),
  Corner: ({ ...props }: any) => (
    <div data-testid="scroll-area-corner" {...props} />
  ),
  Scrollbar: ({ className, children, ...props }: any) => (
    <div
      className={className}
      data-testid="scroll-area-scrollbar"
      {...props}
    >
      {children}
    </div>
  ),
  Thumb: ({ className, ...props }: any) => (
    <div
      className={className}
      data-testid="scroll-area-thumb"
      {...props}
    />
  ),
  Viewport: ({ className, children, ...props }: any) => (
    <div
      className={className}
      data-testid="scroll-area-viewport"
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('ScrollArea Components', () => {
  describe('ScrollArea', () => {
    it('should render with default props', () => {
      render(
        <ScrollArea>
          <div>Scroll area content</div>
        </ScrollArea>
      );
      const scrollArea = screen.getByTestId('scroll-area-root');
      const viewport = screen.getByTestId('scroll-area-viewport');
      const scrollBar = screen.getByTestId('scroll-bar');
      const corner = screen.getByTestId('scroll-area-corner');

      expect(scrollArea).toBeInTheDocument();
      expect(viewport).toBeInTheDocument();
      expect(scrollBar).toBeInTheDocument();
      expect(corner).toBeInTheDocument();
      expect(scrollArea).toHaveClass('relative', 'overflow-hidden');
      expect(viewport).toHaveClass('h-full', 'w-full', 'rounded-[inherit]');
      expect(screen.getByText('Scroll area content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ScrollArea className="custom-scroll-area">
          Custom scroll area
        </ScrollArea>
      );
      const scrollArea = screen.getByTestId('scroll-area-root');
      expect(scrollArea).toHaveClass('custom-scroll-area');
    });

    it('should pass through additional props', () => {
      render(
        <ScrollArea
          data-testid="custom-scroll-area"
          aria-label="Custom scroll area"
          tabIndex={0}
        >
          Props test
        </ScrollArea>
      );
      const scrollArea = screen.getByTestId('custom-scroll-area');
      expect(scrollArea).toHaveAttribute('aria-label', 'Custom scroll area');
      expect(scrollArea).toHaveAttribute('tabIndex', '0');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ScrollArea ref={ref}>Ref test</ScrollArea>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle complex content', () => {
      render(
        <ScrollArea>
          <div>
            <h3>Scroll Area Title</h3>
            <p>This is a <strong>rich</strong> content with <em>formatting</em>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
              <li>List item 3</li>
              <li>List item 4</li>
              <li>List item 5</li>
            </ul>
            <p>More content to make it scrollable...</p>
          </div>
        </ScrollArea>
      );
      
      expect(screen.getByText('Scroll Area Title')).toBeInTheDocument();
      expect(screen.getByText('This is a')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 5')).toBeInTheDocument();
      expect(screen.getByText('More content to make it scrollable...')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <ScrollArea>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ScrollArea>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('ScrollBar', () => {
    it('should render with default props (vertical)', () => {
      render(<ScrollBar />);
      const scrollBar = screen.getByTestId('scroll-bar');
      const thumb = screen.getByTestId('scroll-area-thumb');

      expect(scrollBar).toBeInTheDocument();
      expect(thumb).toBeInTheDocument();
      expect(scrollBar).toHaveAttribute('data-orientation', 'vertical');
      expect(scrollBar).toHaveClass('flex', 'touch-none', 'select-none', 'transition-colors', 'h-full', 'w-2.5', 'border-l', 'border-l-transparent', 'p-[1px]');
      expect(thumb).toHaveClass('relative', 'flex-1', 'rounded-full', 'bg-border');
    });

    it('should render with horizontal orientation', () => {
      render(<ScrollBar orientation="horizontal" />);
      const scrollBar = screen.getByTestId('scroll-bar');
      expect(scrollBar).toHaveAttribute('data-orientation', 'horizontal');
      expect(scrollBar).toHaveClass('h-2.5', 'flex-col', 'border-t', 'border-t-transparent', 'p-[1px]');
    });

    it('should render with custom className', () => {
      render(<ScrollBar className="custom-scroll-bar" />);
      const scrollBar = screen.getByTestId('scroll-bar');
      expect(scrollBar).toHaveClass('custom-scroll-bar');
    });

    it('should pass through additional props', () => {
      render(
        <ScrollBar
          data-testid="custom-scroll-bar"
          aria-label="Custom scroll bar"
          role="scrollbar"
        />
      );
      const scrollBar = screen.getByTestId('custom-scroll-bar');
      expect(scrollBar).toHaveAttribute('aria-label', 'Custom scroll bar');
      expect(scrollBar).toHaveAttribute('role', 'scrollbar');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ScrollBar ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle both orientations with custom classes', () => {
      const { rerender } = render(<ScrollBar orientation="vertical" className="custom-vertical" />);
      let scrollBar = screen.getByTestId('scroll-bar');
      expect(scrollBar).toHaveClass('custom-vertical', 'h-full', 'w-2.5', 'border-l', 'border-l-transparent');

      rerender(<ScrollBar orientation="horizontal" className="custom-horizontal" />);
      scrollBar = screen.getByTestId('scroll-bar');
      expect(scrollBar).toHaveClass('custom-horizontal', 'h-2.5', 'flex-col', 'border-t', 'border-t-transparent');
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for ScrollArea', () => {
      expect(ScrollArea.displayName).toBe('Root');
    });

    it('should have correct displayName for ScrollBar', () => {
      expect(ScrollBar.displayName).toBe('ScrollAreaScrollbar');
    });
  });

  describe('Integration', () => {
    it('should render complete scroll area structure', () => {
      render(
        <ScrollArea>
          <div style={{ height: '200px' }}>
            <h2>Long Content</h2>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>Paragraph {i + 1} with some content to make it scrollable</p>
            ))}
          </div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area-viewport')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-bar')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area-corner')).toBeInTheDocument();
      expect(screen.getByText('Long Content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1 with some content to make it scrollable')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 20 with some content to make it scrollable')).toBeInTheDocument();
    });

    it('should handle multiple scroll areas', () => {
      render(
        <div>
          <ScrollArea className="h-32">
            <div>First scroll area</div>
          </ScrollArea>
          <ScrollArea className="h-32">
            <div>Second scroll area</div>
          </ScrollArea>
        </div>
      );

      const scrollAreas = screen.getAllByTestId('scroll-area-root');
      const scrollBars = screen.getAllByTestId('scroll-bar');

      expect(scrollAreas).toHaveLength(2);
      expect(scrollBars).toHaveLength(2);
      expect(screen.getByText('First scroll area')).toBeInTheDocument();
      expect(screen.getByText('Second scroll area')).toBeInTheDocument();
    });

    it('should handle nested scroll areas', () => {
      render(
        <ScrollArea className="h-64">
          <div>Outer content</div>
          <ScrollArea className="h-32">
            <div>Inner scroll area</div>
          </ScrollArea>
        </ScrollArea>
      );

      const scrollAreas = screen.getAllByTestId('scroll-area-root');
      const scrollBars = screen.getAllByTestId('scroll-bar');

      expect(scrollAreas).toHaveLength(2);
      expect(scrollBars).toHaveLength(2);
      expect(screen.getByText('Outer content')).toBeInTheDocument();
      expect(screen.getByText('Inner scroll area')).toBeInTheDocument();
    });

    it('should handle scroll areas with different orientations', () => {
      render(
        <div>
          <ScrollArea>
            <div>Vertical scroll area</div>
          </ScrollArea>
          <ScrollBar orientation="horizontal" />
        </div>
      );

      const scrollArea = screen.getByTestId('scroll-area-root');
      const horizontalScrollBar = screen.getByTestId('scroll-bar');

      expect(scrollArea).toBeInTheDocument();
      expect(horizontalScrollBar).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <ScrollArea>
          <div>Accessible content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area-root');
      const viewport = screen.getByTestId('scroll-area-viewport');
      const scrollBar = screen.getByTestId('scroll-bar');

      expect(scrollArea.tagName).toBe('DIV');
      expect(viewport.tagName).toBe('DIV');
      expect(scrollBar.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <ScrollArea
          aria-label="Scrollable content area"
          aria-describedby="scroll-help"
        >
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area-root');
      expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content area');
      expect(scrollArea).toHaveAttribute('aria-describedby', 'scroll-help');
    });

    it('should handle role attribute', () => {
      render(<ScrollArea role="region">Role test</ScrollArea>);
      const scrollArea = screen.getByTestId('scroll-area-root');
      expect(scrollArea).toHaveAttribute('role', 'region');
    });

    it('should handle tabIndex', () => {
      render(<ScrollArea tabIndex={0}>Tab test</ScrollArea>);
      const scrollArea = screen.getByTestId('scroll-area-root');
      expect(scrollArea).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<ScrollArea>Styled scroll area</ScrollArea>);
      const scrollArea = screen.getByTestId('scroll-area-root');
      expect(scrollArea).toHaveClass('relative', 'overflow-hidden');
    });

    it('should combine custom classes with default classes', () => {
      render(<ScrollArea className="border border-gray-300">Custom styled</ScrollArea>);
      const scrollArea = screen.getByTestId('scroll-area-root');
      expect(scrollArea).toHaveClass('border', 'border-gray-300');
    });

    it('should handle conditional classes', () => {
      const hasBorder = true;
      render(
        <ScrollArea
          className={hasBorder ? 'border border-gray-300' : 'border-0'}
        >
          Conditional styling
        </ScrollArea>
      );
      const scrollArea = screen.getByTestId('scroll-area-root');
      expect(scrollArea).toHaveClass('border', 'border-gray-300');
    });
  });
});