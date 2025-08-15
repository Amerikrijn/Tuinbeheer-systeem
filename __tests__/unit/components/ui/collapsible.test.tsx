import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

jest.mock('@radix-ui/react-collapsible', () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="collapsible-root" {...props}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({ children, ...props }: any) => (
    <button data-testid="collapsible-trigger" {...props}>
      {children}
    </button>
  ),
  CollapsibleContent: ({ children, ...props }: any) => (
    <div data-testid="collapsible-content" {...props}>
      {children}
    </div>
  )
}));

describe('Collapsible Components', () => {
  describe('Collapsible', () => {
    it('should render children', () => {
      render(
        <Collapsible>
          <div>Collapsible content</div>
        </Collapsible>
      );
      expect(screen.getByTestId('collapsible-root')).toBeInTheDocument();
      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Collapsible data-testid="custom-collapsible" className="custom-class">
          Content
        </Collapsible>
      );
      const collapsible = screen.getByTestId('custom-collapsible');
      expect(collapsible).toHaveClass('custom-class');
    });

    it('should handle multiple children', () => {
      render(
        <Collapsible>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Collapsible>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('CollapsibleTrigger', () => {
    it('should render children', () => {
      render(
        <CollapsibleTrigger>
          <span>Toggle content</span>
        </CollapsibleTrigger>
      );
      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('Toggle content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <CollapsibleTrigger
          data-testid="custom-trigger"
          className="custom-trigger"
          aria-expanded="false"
        >
          Custom trigger
        </CollapsibleTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle button attributes', () => {
      render(
        <CollapsibleTrigger type="button" disabled>
          Disabled trigger
        </CollapsibleTrigger>
      );
      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('disabled');
    });
  });

  describe('CollapsibleContent', () => {
    it('should render children', () => {
      render(
        <CollapsibleContent>
          <p>Hidden content</p>
        </CollapsibleContent>
      );
      const content = screen.getByTestId('collapsible-content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('Hidden content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <CollapsibleContent
          data-testid="custom-content"
          className="custom-content"
          aria-hidden="true"
        >
          Custom content
        </CollapsibleContent>
      );
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveAttribute('aria-hidden', 'true');
    });

    it('should handle complex content', () => {
      render(
        <CollapsibleContent>
          <div>
            <h3>Section Title</h3>
            <p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </div>
        </CollapsibleContent>
      );
      
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('This is a paragraph with')).toBeInTheDocument();
      expect(screen.getByText('bold text')).toBeInTheDocument();
      expect(screen.getByText('italic text')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render complete collapsible structure', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Click to expand</CollapsibleTrigger>
          <CollapsibleContent>
            <div>This content can be collapsed</div>
            <p>Additional information here</p>
          </CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByTestId('collapsible-root')).toBeInTheDocument();
      expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('collapsible-content')).toBeInTheDocument();
      expect(screen.getByText('Click to expand')).toBeInTheDocument();
      expect(screen.getByText('This content can be collapsed')).toBeInTheDocument();
      expect(screen.getByText('Additional information here')).toBeInTheDocument();
    });

    it('should handle multiple collapsible sections', () => {
      render(
        <div>
          <Collapsible>
            <CollapsibleTrigger>Section 1</CollapsibleTrigger>
            <CollapsibleContent>Content 1</CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger>Section 2</CollapsibleTrigger>
            <CollapsibleContent>Content 2</CollapsibleContent>
          </Collapsible>
        </div>
      );

      const roots = screen.getAllByTestId('collapsible-root');
      const triggers = screen.getAllByTestId('collapsible-trigger');
      const contents = screen.getAllByTestId('collapsible-content');

      expect(roots).toHaveLength(2);
      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle nested collapsible content', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Main Section</CollapsibleTrigger>
          <CollapsibleContent>
            <div>Main content</div>
            <Collapsible>
              <CollapsibleTrigger>Subsection</CollapsibleTrigger>
              <CollapsibleContent>Subsection content</CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByText('Main Section')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByText('Subsection')).toBeInTheDocument();
      expect(screen.getByText('Subsection content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Accessible trigger</CollapsibleTrigger>
          <CollapsibleContent>Accessible content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      const content = screen.getByTestId('collapsible-content');

      expect(trigger.tagName).toBe('BUTTON');
      expect(content.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger aria-expanded="false" aria-controls="content-1">
            Toggle
          </CollapsibleTrigger>
          <CollapsibleContent id="content-1" aria-hidden="true">
            Content
          </CollapsibleTrigger>
        </Collapsible>
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      const content = screen.getByTestId('collapsible-content');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-controls', 'content-1');
      expect(content).toHaveAttribute('aria-hidden', 'true');
    });
  });
});