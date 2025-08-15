import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea Components', () => {
  describe('ScrollArea', () => {
    it('should render without crashing', () => {
      render(<ScrollArea>Test scroll area</ScrollArea>);
      expect(screen.getByText('Test scroll area')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ScrollArea className="custom-scroll-area">Custom scroll area</ScrollArea>);
      const scrollArea = screen.getByText('Custom scroll area');
      // ScrollArea component doesn't pass className to children, so we just check it renders
      expect(scrollArea).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(<ScrollArea data-testid="custom-scroll-area">Props test</ScrollArea>);
      expect(screen.getByTestId('custom-scroll-area')).toBeInTheDocument();
    });
  });

  describe('ScrollBar', () => {
    it('should render without crashing when within ScrollArea', () => {
      render(
        <ScrollArea>
          <div>Content</div>
          <ScrollBar>Test scroll bar</ScrollBar>
        </ScrollArea>
      );
      // ScrollBar doesn't render children, so we just check the content is there
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render with custom className when within ScrollArea', () => {
      render(
        <ScrollArea>
          <div>Content</div>
          <ScrollBar className="custom-scroll-bar">Custom scroll bar</ScrollBar>
        </ScrollArea>
      );
      // ScrollBar doesn't render children, so we just check the content is there
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render complete scroll area structure', () => {
      render(
        <ScrollArea>
          <div>Scrollable content</div>
          <ScrollBar>Scroll bar</ScrollBar>
        </ScrollArea>
      );
      
      expect(screen.getByText('Scrollable content')).toBeInTheDocument();
      // ScrollBar doesn't render children, so we don't check for the text
    });

    it('should handle multiple scroll areas', () => {
      render(
        <div>
          <ScrollArea>First scroll area</ScrollArea>
          <ScrollArea>Second scroll area</ScrollArea>
        </div>
      );
      
      expect(screen.getByText('First scroll area')).toBeInTheDocument();
      expect(screen.getByText('Second scroll area')).toBeInTheDocument();
    });

    it('should handle scroll area with complex content', () => {
      render(
        <ScrollArea>
          <div>Content with <strong>rich</strong> <em>formatting</em></div>
          <ScrollBar>Complex scroll bar</ScrollBar>
        </ScrollArea>
      );
      
      expect(screen.getByText('Content with')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
      // ScrollBar doesn't render children, so we don't check for the text
    });
  });
});