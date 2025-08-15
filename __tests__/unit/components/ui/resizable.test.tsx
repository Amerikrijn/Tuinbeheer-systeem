import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the problematic module
jest.mock('react-resizable-panels', () => ({
  PanelGroup: ({ children, ...props }: any) => (
    <div data-testid="resizable-panel-group" {...props}>
      {children}
    </div>
  ),
  Panel: ({ children, ...props }: any) => (
    <div data-testid="resizable-panel" {...props}>
      {children}
    </div>
  ),
  PanelResizeHandle: ({ children, ...props }: any) => (
    <div data-testid="resizable-handle" {...props}>
      {children}
    </div>
  )
}));

// Import after mocking
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

describe('Resizable Components', () => {
  describe('ResizablePanelGroup', () => {
    it('should render without crashing', () => {
      render(<ResizablePanelGroup>Test panel group</ResizablePanelGroup>);
      expect(screen.getByTestId('resizable-panel-group')).toBeInTheDocument();
      expect(screen.getByText('Test panel group')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ResizablePanelGroup className="custom-panel-group">Custom panel group</ResizablePanelGroup>);
      const panelGroup = screen.getByTestId('resizable-panel-group');
      expect(panelGroup).toHaveClass('custom-panel-group');
    });

    it('should pass through additional props', () => {
      render(<ResizablePanelGroup data-testid="custom-panel-group">Props test</ResizablePanelGroup>);
      expect(screen.getByTestId('custom-panel-group')).toBeInTheDocument();
    });
  });

  describe('ResizablePanel', () => {
    it('should render without crashing', () => {
      render(<ResizablePanel>Test panel</ResizablePanel>);
      expect(screen.getByTestId('resizable-panel')).toBeInTheDocument();
      expect(screen.getByText('Test panel')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ResizablePanel className="custom-panel">Custom panel</ResizablePanel>);
      const panel = screen.getByTestId('resizable-panel');
      expect(panel).toHaveClass('custom-panel');
    });

    it('should pass through additional props', () => {
      render(<ResizablePanel data-testid="custom-panel">Props test</ResizablePanel>);
      expect(screen.getByTestId('custom-panel')).toBeInTheDocument();
    });
  });

  describe('ResizableHandle', () => {
    it('should render without crashing', () => {
      render(<ResizableHandle>Test handle</ResizableHandle>);
      expect(screen.getByTestId('resizable-handle')).toBeInTheDocument();
      // ResizableHandle doesn't render children, so we just check the element exists
    });

    it('should render with custom className', () => {
      render(<ResizableHandle className="custom-handle">Custom handle</ResizableHandle>);
      const handle = screen.getByTestId('resizable-handle');
      expect(handle).toHaveClass('custom-handle');
    });
  });

  describe('Integration', () => {
    it('should render complete resizable structure', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>Left panel content</ResizablePanel>
          <ResizableHandle>Resize handle</ResizableHandle>
          <ResizablePanel>Right panel content</ResizablePanel>
        </ResizablePanelGroup>
      );
      
      expect(screen.getByTestId('resizable-panel-group')).toBeInTheDocument();
      expect(screen.getAllByTestId('resizable-panel')).toHaveLength(2);
      expect(screen.getByTestId('resizable-handle')).toBeInTheDocument();
      expect(screen.getByText('Left panel content')).toBeInTheDocument();
      // ResizableHandle doesn't render children, so we don't check for the text
      expect(screen.getByText('Right panel content')).toBeInTheDocument();
    });

    it('should handle multiple panels', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle>Handle 1</ResizableHandle>
          <ResizablePanel>Panel 2</ResizablePanel>
          <ResizableHandle>Handle 2</ResizableHandle>
          <ResizablePanel>Panel 3</ResizablePanel>
        </ResizablePanelGroup>
      );
      
      expect(screen.getAllByTestId('resizable-panel')).toHaveLength(3);
      expect(screen.getAllByTestId('resizable-handle')).toHaveLength(2);
      expect(screen.getByText('Panel 1')).toBeInTheDocument();
      expect(screen.getByText('Panel 2')).toBeInTheDocument();
      expect(screen.getByText('Panel 3')).toBeInTheDocument();
      // ResizableHandle doesn't render children, so we don't check for the handle text
    });
  });
});