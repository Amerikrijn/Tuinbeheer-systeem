import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="tabs-root" {...props}>
      {children}
    </div>
  ),
  List: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="tabs-list"
      className={className}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )),
  Trigger: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="tabs-trigger"
      className={className}
      role="tab"
      {...props}
    >
      {children}
    </button>
  )),
  Content: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="tabs-content"
      className={className}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  )),
}));

describe('Tabs Components', () => {
  describe('Tabs', () => {
    it('should render children', () => {
      render(
        <Tabs>
          <div>Tabs content</div>
        </Tabs>
      );
      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
      expect(screen.getByText('Tabs content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Tabs data-testid="custom-tabs" className="custom-class">
          Content
        </Tabs>
      );
      const tabs = screen.getByTestId('custom-tabs');
      expect(tabs).toHaveClass('custom-class');
    });

    it('should handle multiple children', () => {
      render(
        <Tabs>
          <div>Child 1</div>
          <div>Child 2</div>
        </Tabs>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('should render with default props', () => {
      render(<TabsList>Tab list content</TabsList>);
      const list = screen.getByTestId('tabs-list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveTextContent('Tab list content');
      expect(list).toHaveAttribute('role', 'tablist');
      expect(list).toHaveClass('inline-flex', 'h-10', 'items-center', 'justify-center', 'rounded-md', 'bg-muted', 'p-1', 'text-muted-foreground');
    });

    it('should render with custom className', () => {
      render(<TabsList className="custom-list">Custom list</TabsList>);
      const list = screen.getByTestId('tabs-list');
      expect(list).toHaveClass('custom-list');
    });

    it('should pass through additional props', () => {
      render(
        <TabsList
          data-testid="custom-list"
          aria-label="Tab navigation"
          orientation="horizontal"
        >
          Props test
        </TabsList>
      );
      const list = screen.getByTestId('custom-list');
      expect(list).toHaveAttribute('aria-label', 'Tab navigation');
      expect(list).toHaveAttribute('orientation', 'horizontal');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<TabsList ref={ref}>Ref test</TabsList>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle multiple tab triggers', () => {
      render(
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
      );

      const triggers = screen.getAllByTestId('tabs-trigger');
      expect(triggers).toHaveLength(3);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });
  });

  describe('TabsTrigger', () => {
    it('should render with default props', () => {
      render(<TabsTrigger value="tab1">Tab Trigger</TabsTrigger>);
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Tab Trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('role', 'tab');
      expect(trigger).toHaveClass('inline-flex', 'items-center', 'justify-center', 'whitespace-nowrap', 'rounded-sm', 'px-3', 'py-1.5', 'text-sm', 'font-medium', 'ring-offset-background', 'transition-all', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:pointer-events-none', 'disabled:opacity-50', 'data-[state=active]:bg-background', 'data-[state=active]:text-foreground', 'data-[state=active]:shadow-sm');
    });

    it('should render with custom className', () => {
      render(<TabsTrigger value="tab1" className="custom-trigger">Custom trigger</TabsTrigger>);
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should render with value attribute', () => {
      render(<TabsTrigger value="custom-tab">Value test</TabsTrigger>);
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveAttribute('value', 'custom-tab');
    });

    it('should pass through additional props', () => {
      render(
        <TabsTrigger
          value="tab1"
          data-testid="custom-trigger"
          disabled
          aria-selected="false"
        >
          Props test
        </TabsTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('disabled');
      expect(trigger).toHaveAttribute('aria-selected', 'false');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<TabsTrigger value="tab1" ref={ref}>Ref test</TabsTrigger>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(<TabsTrigger value="tab1" disabled>Disabled tab</TabsTrigger>);
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveAttribute('disabled');
    });

    it('should handle active state', () => {
      render(<TabsTrigger value="tab1" data-state="active">Active tab</TabsTrigger>);
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveAttribute('data-state', 'active');
    });
  });

  describe('TabsContent', () => {
    it('should render with default props', () => {
      render(<TabsContent value="tab1">Tab content here</TabsContent>);
      const content = screen.getByTestId('tabs-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Tab content here');
      expect(content).toHaveAttribute('role', 'tabpanel');
      expect(content).toHaveClass('mt-2', 'ring-offset-background', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2');
    });

    it('should render with custom className', () => {
      render(<TabsContent value="tab1" className="custom-content">Custom content</TabsContent>);
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should render with value attribute', () => {
      render(<TabsContent value="custom-tab">Value test</TabsContent>);
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveAttribute('value', 'custom-tab');
    });

    it('should pass through additional props', () => {
      render(
        <TabsContent
          value="tab1"
          data-testid="custom-content"
          aria-labelledby="tab1-trigger"
        >
          Props test
        </TabsContent>
      );
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveAttribute('aria-labelledby', 'tab1-trigger');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<TabsContent value="tab1" ref={ref}>Ref test</TabsContent>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle complex content', () => {
      render(
        <TabsContent value="tab1">
          <div>
            <h2>Tab Title</h2>
            <p>This is a <strong>rich</strong> content with <em>formatting</em>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
            <button>Action button</button>
          </div>
        </TabsContent>
      );
      
      expect(screen.getByText('Tab Title')).toBeInTheDocument();
      expect(screen.getByText('This is a')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
      expect(screen.getByText('Action button')).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for TabsList', () => {
      expect(TabsList.displayName).toBe('TabsList');
    });

    it('should have correct displayName for TabsTrigger', () => {
      expect(TabsTrigger.displayName).toBe('TabsTrigger');
    });

    it('should have correct displayName for TabsContent', () => {
      expect(TabsContent.displayName).toBe('TabsContent');
    });
  });

  describe('Integration', () => {
    it('should render complete tabs structure', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">First Tab</TabsTrigger>
            <TabsTrigger value="tab2">Second Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div>First tab content</div>
          </TabsContent>
          <TabsContent value="tab2">
            <div>Second tab content</div>
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('tabs-trigger')).toHaveLength(2);
      expect(screen.getAllByTestId('tabs-content')).toHaveLength(2);
      expect(screen.getByText('First Tab')).toBeInTheDocument();
      expect(screen.getByText('Second Tab')).toBeInTheDocument();
      expect(screen.getByText('First tab content')).toBeInTheDocument();
      expect(screen.getByText('Second tab content')).toBeInTheDocument();
    });

    it('should handle multiple tab sets', () => {
      render(
        <div>
          <Tabs defaultValue="set1-tab1">
            <TabsList>
              <TabsTrigger value="set1-tab1">Set 1 Tab 1</TabsTrigger>
            </TabsList>
            <TabsContent value="set1-tab1">Set 1 content</TabsContent>
          </Tabs>
          <Tabs defaultValue="set2-tab1">
            <TabsList>
              <TabsTrigger value="set2-tab1">Set 2 Tab 1</TabsTrigger>
            </TabsList>
            <TabsContent value="set2-tab1">Set 2 content</TabsContent>
          </Tabs>
        </div>
      );

      const roots = screen.getAllByTestId('tabs-root');
      const lists = screen.getAllByTestId('tabs-list');
      const triggers = screen.getAllByTestId('tabs-trigger');
      const contents = screen.getAllByTestId('tabs-content');

      expect(roots).toHaveLength(2);
      expect(lists).toHaveLength(2);
      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
    });

    it('should handle tabs with different orientations', () => {
      render(
        <Tabs defaultValue="tab1" orientation="vertical">
          <TabsList orientation="vertical">
            <TabsTrigger value="tab1">Vertical Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Vertical content</TabsContent>
        </Tabs>
      );

      const list = screen.getByTestId('tabs-list');
      expect(list).toHaveAttribute('orientation', 'vertical');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Accessible Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Accessible content</TabsContent>
        </Tabs>
      );

      const list = screen.getByTestId('tabs-list');
      const trigger = screen.getByTestId('tabs-trigger');
      const content = screen.getByTestId('tabs-content');

      expect(list).toHaveAttribute('role', 'tablist');
      expect(trigger).toHaveAttribute('role', 'tab');
      expect(content).toHaveAttribute('role', 'tabpanel');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Tabs>
          <TabsList aria-label="Main navigation">
            <TabsTrigger value="tab1" aria-selected="true" aria-controls="panel1">
              Selected Tab
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" id="panel1" aria-labelledby="tab1-trigger">
            Panel content
          </TabsContent>
        </Tabs>
      );

      const list = screen.getByTestId('tabs-list');
      const trigger = screen.getByTestId('tabs-trigger');
      const content = screen.getByTestId('tabs-content');

      expect(list).toHaveAttribute('aria-label', 'Main navigation');
      expect(trigger).toHaveAttribute('aria-selected', 'true');
      expect(trigger).toHaveAttribute('aria-controls', 'panel1');
      expect(content).toHaveAttribute('id', 'panel1');
      expect(content).toHaveAttribute('aria-labelledby', 'tab1-trigger');
    });

    it('should handle keyboard navigation attributes', () => {
      render(
        <TabsList>
          <TabsTrigger value="tab1" tabIndex={0}>Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" tabIndex={-1}>Tab 2</TabsTrigger>
        </TabsList>
      );

      const triggers = screen.getAllByTestId('tabs-trigger');
      expect(triggers[0]).toHaveAttribute('tabIndex', '0');
      expect(triggers[1]).toHaveAttribute('tabIndex', '-1');
    });
  });
});