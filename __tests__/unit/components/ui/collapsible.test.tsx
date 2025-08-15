import React from 'react';
import { render, screen } from '@testing-library/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

describe('Collapsible Components', () => {
  describe('Collapsible', () => {
    it('should render without crashing', () => {
      render(<Collapsible>Test collapsible</Collapsible>);
      expect(screen.getByText('Test collapsible')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Collapsible className="custom-collapsible">Custom collapsible</Collapsible>);
      const collapsible = screen.getByText('Custom collapsible');
      expect(collapsible).toHaveClass('custom-collapsible');
    });

    it('should pass through additional props', () => {
      render(<Collapsible data-testid="custom-collapsible">Props test</Collapsible>);
      expect(screen.getByTestId('custom-collapsible')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render complete collapsible structure', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content text</CollapsibleContent>
        </Collapsible>
      );
      
      expect(screen.getByText('Toggle Content')).toBeInTheDocument();
      // Content is hidden by default, so we check for the button and structure
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle multiple collapsibles', () => {
      render(
        <div>
          <Collapsible>First collapsible</Collapsible>
          <Collapsible>Second collapsible</Collapsible>
        </div>
      );
      
      expect(screen.getByText('First collapsible')).toBeInTheDocument();
      expect(screen.getByText('Second collapsible')).toBeInTheDocument();
    });

    it('should handle collapsible with complex content', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Complex Trigger</CollapsibleTrigger>
          <CollapsibleContent>
            <div>Content with <strong>rich</strong> <em>formatting</em></div>
          </CollapsibleContent>
        </Collapsible>
      );
      
      expect(screen.getByText('Complex Trigger')).toBeInTheDocument();
      // Content is hidden by default, so we check for the button structure
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });
});