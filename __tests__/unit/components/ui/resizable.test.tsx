import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('react-resizable-panels', () => ({
  PanelGroup: ({ className, children, ...props }: any) => (
    <div
      data-testid="resizable-panel-group"
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Panel: ({ children, ...props }: any) => (
    <div
      data-testid="resizable-panel"
      {...props}
    >
      {children}
    </div>
  ),
  PanelResizeHandle: ({ className, children, withHandle, ...props }: any) => (
    <div
      data-testid="resizable-handle"
      className={className}
      {...props}
    >
      {children}
      {withHandle && (
        <div data-testid="handle-grip" className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <span data-testid="grip-icon">⋮</span>
        </div>
      )}
    </div>
  )
}));

jest.mock('lucide-react', () => ({
  GripVertical: ({ className, ...props }: any) => (
    <span data-testid="grip-vertical-icon" className={className} {...props}>⋮</span>
  )
}));

describe('Resizable Components', () => {
  describe('ResizablePanelGroup', () => {
    it('should render with default props', () => {
      render(
        <ResizablePanelGroup>
          <div>Panel group content</div>
        </ResizablePanelGroup>
      );
      const panelGroup = screen.getByTestId('resizable-panel-group');
      expect(panelGroup).toBeInTheDocument();
      expect(panelGroup).toHaveClass('flex', 'h-full', 'w-full', 'data-[panel-group-direction=vertical]:flex-col');
      expect(screen.getByText('Panel group content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ResizablePanelGroup className="custom-panel-group">
          Custom panel group
        </ResizablePanelGroup>
      );
      const panelGroup = screen.getByTestId('resizable-panel-group');
      expect(panelGroup).toHaveClass('custom-panel-group');
    });

    it('should pass through additional props', () => {
      render(
        <ResizablePanelGroup
          data-testid="custom-panel-group"
          direction="vertical"
          autoSaveId="test-group"
        >
          Props test
        </ResizablePanelGroup>
      );
      const panelGroup = screen.getByTestId('custom-panel-group');
      expect(panelGroup).toHaveAttribute('direction', 'vertical');
      expect(panelGroup).toHaveAttribute('autoSaveId', 'test-group');
    });

    it('should handle multiple children', () => {
      render(
        <ResizablePanelGroup>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ResizablePanelGroup>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('ResizablePanel', () => {
    it('should render with default props', () => {
      render(
        <ResizablePanel>
          <div>Panel content</div>
        </ResizablePanel>
      );
      const panel = screen.getByTestId('resizable-panel');
      expect(panel).toBeInTheDocument();
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <ResizablePanel
          data-testid="custom-panel"
          id="panel1"
          order={1}
          defaultSize={50}
        >
          Props test
        </ResizablePanel>
      );
      const panel = screen.getByTestId('custom-panel');
      expect(panel).toHaveAttribute('id', 'panel1');
      expect(panel).toHaveAttribute('order', '1');
      expect(panel).toHaveAttribute('defaultSize', '50');
    });

    it('should handle complex content', () => {
      render(
        <ResizablePanel>
          <div>
            <h3>Panel Title</h3>
            <p>This is a <strong>rich</strong> content with <em>formatting</em>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </div>
        </ResizablePanel>
      );
      
      expect(screen.getByText('Panel Title')).toBeInTheDocument();
      expect(screen.getByText('This is a')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });
  });

  describe('ResizableHandle', () => {
    it('should render without handle by default', () => {
      render(<ResizableHandle />);
      const handle = screen.getByTestId('resizable-handle');
      expect(handle).toBeInTheDocument();
      expect(handle).toHaveClass('relative', 'flex', 'w-px', 'items-center', 'justify-center', 'bg-border', 'after:absolute', 'after:inset-y-0', 'after:left-1/2', 'after:w-1', 'after:-translate-x-1/2', 'focus-visible:outline-none', 'focus-visible:ring-1', 'focus-visible:ring-ring', 'focus-visible:ring-offset-1', 'data-[panel-group-direction=vertical]:h-px', 'data-[panel-group-direction=vertical]:w-full', 'data-[panel-group-direction=vertical]:after:left-0', 'data-[panel-group-direction=vertical]:after:h-1', 'data-[panel-group-direction=vertical]:after:w-full', 'data-[panel-group-direction=vertical]:after:-translate-y-1/2', 'data-[panel-group-direction=vertical]:after:translate-x-0', '[&[data-panel-group-direction=vertical]>div]:rotate-90');
      expect(screen.queryByTestId('handle-grip')).not.toBeInTheDocument();
    });

    it('should render with handle when withHandle is true', () => {
      render(<ResizableHandle withHandle />);
      const handle = screen.getByTestId('resizable-handle');
      const grip = screen.getByTestId('handle-grip');
      
      expect(handle).toBeInTheDocument();
      expect(grip).toBeInTheDocument();
      expect(grip).toHaveClass('z-10', 'flex', 'h-4', 'w-3', 'items-center', 'justify-center', 'rounded-sm', 'border', 'bg-border');
    });

    it('should render with custom className', () => {
      render(<ResizableHandle className="custom-handle" />);
      const handle = screen.getByTestId('resizable-handle');
      expect(handle).toHaveClass('custom-handle');
    });

    it('should pass through additional props', () => {
      render(
        <ResizableHandle
          data-testid="custom-handle"
          id="handle1"
          direction="vertical"
        />
      );
      const handle = screen.getByTestId('custom-handle');
      expect(handle).toHaveAttribute('id', 'handle1');
      expect(handle).toHaveAttribute('direction', 'vertical');
    });

    it('should render grip icon when withHandle is true', () => {
      render(<ResizableHandle withHandle />);
      const gripIcon = screen.getByTestId('grip-icon');
      expect(gripIcon).toBeInTheDocument();
      expect(gripIcon).toHaveTextContent('⋮');
    });
  });

  describe('Integration', () => {
    it('should render complete resizable structure', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>
            <div>Left panel content</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <div>Right panel content</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      );

      expect(screen.getByTestId('resizable-panel-group')).toBeInTheDocument();
      expect(screen.getAllByTestId('resizable-panel')).toHaveLength(2);
      expect(screen.getByTestId('resizable-handle')).toBeInTheDocument();
      expect(screen.getByText('Left panel content')).toBeInTheDocument();
      expect(screen.getByText('Right panel content')).toBeInTheDocument();
    });

    it('should handle multiple panels with handles', () => {
      render(
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>
            <div>Top panel</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <div>Middle panel</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <div>Bottom panel</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      );

      const panelGroup = screen.getByTestId('resizable-panel-group');
      const panels = screen.getAllByTestId('resizable-panel');
      const handles = screen.getAllByTestId('resizable-handle');

      expect(panelGroup).toHaveAttribute('direction', 'vertical');
      expect(panels).toHaveLength(3);
      expect(handles).toHaveLength(2);
      expect(screen.getByText('Top panel')).toBeInTheDocument();
      expect(screen.getByText('Middle panel')).toBeInTheDocument();
      expect(screen.getByText('Bottom panel')).toBeInTheDocument();
    });

    it('should handle horizontal layout', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30}>
            <div>Sidebar</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70}>
            <div>Main content</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      );

      const panelGroup = screen.getByTestId('resizable-panel-group');
      const panels = screen.getAllByTestId('resizable-panel');
      const handle = screen.getByTestId('resizable-handle');

      expect(panelGroup).toHaveAttribute('direction', 'horizontal');
      expect(panels).toHaveLength(2);
      expect(panels[0]).toHaveAttribute('defaultSize', '30');
      expect(panels[1]).toHaveAttribute('defaultSize', '70');
      expect(handle).toBeInTheDocument();
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });

    it('should handle panels with different sizes', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel defaultSize={25} minSize={20}>
            <div>Small panel</div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={75} maxSize={80}>
            <div>Large panel</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      );

      const panels = screen.getAllByTestId('resizable-panel');
      expect(panels[0]).toHaveAttribute('defaultSize', '25');
      expect(panels[0]).toHaveAttribute('minSize', '20');
      expect(panels[1]).toHaveAttribute('defaultSize', '75');
      expect(panels[1]).toHaveAttribute('maxSize', '80');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel />
          <ResizableHandle />
          <ResizablePanel />
        </ResizablePanelGroup>
      );

      const panelGroup = screen.getByTestId('resizable-panel-group');
      const panels = screen.getAllByTestId('resizable-panel');
      const handle = screen.getByTestId('resizable-handle');

      expect(panelGroup.tagName).toBe('DIV');
      expect(panels[0].tagName).toBe('DIV');
      expect(panels[1].tagName).toBe('DIV');
      expect(handle.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <ResizablePanelGroup
          aria-label="Resizable layout"
          aria-describedby="layout-help"
        >
          <ResizablePanel aria-label="Left panel" />
          <ResizableHandle aria-label="Resize handle" />
          <ResizablePanel aria-label="Right panel" />
        </ResizablePanelGroup>
      );

      const panelGroup = screen.getByTestId('resizable-panel-group');
      const panels = screen.getAllByTestId('resizable-panel');
      const handle = screen.getByTestId('resizable-handle');

      expect(panelGroup).toHaveAttribute('aria-label', 'Resizable layout');
      expect(panelGroup).toHaveAttribute('aria-describedby', 'layout-help');
      expect(panels[0]).toHaveAttribute('aria-label', 'Left panel');
      expect(panels[1]).toHaveAttribute('aria-label', 'Right panel');
      expect(handle).toHaveAttribute('aria-label', 'Resize handle');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<ResizablePanelGroup>Styled panel group</ResizablePanelGroup>);
      const panelGroup = screen.getByTestId('resizable-panel-group');
      expect(panelGroup).toHaveClass('flex', 'h-full', 'w-full', 'data-[panel-group-direction=vertical]:flex-col');
    });

    it('should combine custom classes with default classes', () => {
      render(<ResizablePanelGroup className="p-4 border">Custom styled</ResizablePanelGroup>);
      const panelGroup = screen.getByTestId('resizable-panel-group');
      expect(panelGroup).toHaveClass('p-4', 'border');
    });

    it('should handle conditional classes', () => {
      const isVertical = true;
      render(
        <ResizablePanelGroup
          className={isVertical ? 'flex-col' : 'flex-row'}
        >
          Conditional styling
        </ResizablePanelGroup>
      );
      const panelGroup = screen.getByTestId('resizable-panel-group');
      expect(panelGroup).toHaveClass('flex-col');
    });
  });
});