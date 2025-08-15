import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-accordion', () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="accordion-root" {...props}>
      {children}
    </div>
  ),
  Item: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="accordion-item"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Header: ({ children, ...props }: any) => (
    <div data-testid="accordion-header" {...props}>
      {children}
    </div>
  ),
  Trigger: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      data-testid="accordion-trigger"
      className={className}
      {...props}
    >
      {children}
      <span data-testid="chevron-down">▼</span>
    </button>
  )),
  Content: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="accordion-content"
      className={className}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  ))
}));

jest.mock('lucide-react', () => ({
  ChevronDown: ({ className, ...props }: any) => (
    <span data-testid="chevron-icon" className={className} {...props}>▼</span>
  )
}));

describe('Accordion Components', () => {
  describe('Accordion', () => {
    it('should render children', () => {
      render(
        <Accordion>
          <div>Accordion Content</div>
        </Accordion>
      );
      expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
      expect(screen.getByText('Accordion Content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Accordion data-testid="custom-accordion" className="custom-class">
          Content
        </Accordion>
      );
      const accordion = screen.getByTestId('custom-accordion');
      expect(accordion).toHaveClass('custom-class');
    });
  });

  describe('AccordionItem', () => {
    it('should render with default props', () => {
      render(
        <AccordionItem>
          <div>Item Content</div>
        </AccordionItem>
      );
      const item = screen.getByTestId('accordion-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('border-b');
      expect(screen.getByText('Item Content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <AccordionItem className="custom-item">
          Custom Item
        </AccordionItem>
      );
      const item = screen.getByTestId('accordion-item');
      expect(item).toHaveClass('custom-item', 'border-b');
    });

    it('should pass through additional props', () => {
      render(
        <AccordionItem data-testid="custom-item" aria-label="Custom item">
          Custom Props
        </AccordionItem>
      );
      const item = screen.getByTestId('custom-item');
      expect(item).toHaveAttribute('aria-label', 'Custom item');
    });
  });

  describe('AccordionTrigger', () => {
    it('should render with children and chevron', () => {
      render(
        <AccordionTrigger>
          <span>Trigger Text</span>
        </AccordionTrigger>
      );
      const trigger = screen.getByTestId('accordion-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('Trigger Text')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <AccordionTrigger className="custom-trigger">
          Custom Trigger
        </AccordionTrigger>
      );
      const trigger = screen.getByTestId('accordion-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should pass through additional props', () => {
      render(
        <AccordionTrigger data-testid="custom-trigger" aria-expanded="false">
          Props Test
        </AccordionTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('AccordionContent', () => {
    it('should render with children', () => {
      render(
        <AccordionContent>
          <p>Content text</p>
        </AccordionContent>
      );
      const content = screen.getByTestId('accordion-content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('Content text')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <AccordionContent className="custom-content">
          Custom Content
        </AccordionContent>
      );
      const content = screen.getByTestId('accordion-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should pass through additional props', () => {
      render(
        <AccordionContent data-testid="custom-content" aria-hidden="false">
          Props Content
        </AccordionContent>
      );
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for AccordionItem', () => {
      expect(AccordionItem.displayName).toBe('AccordionItem');
    });

    it('should have correct displayName for AccordionTrigger', () => {
      expect(AccordionTrigger.displayName).toBe('Trigger');
    });

    it('should have correct displayName for AccordionContent', () => {
      expect(AccordionContent.displayName).toBe('Content');
    });
  });

  describe('Integration', () => {
    it('should render complete accordion structure', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem>
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
      expect(screen.getAllByTestId('accordion-item')).toHaveLength(2);
      expect(screen.getAllByTestId('accordion-trigger')).toHaveLength(2);
      expect(screen.getAllByTestId('accordion-content')).toHaveLength(2);
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });
});