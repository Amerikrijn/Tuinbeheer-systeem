import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-accordion', () => ({
  Root: ({ className, children, ...props }: any) => (
    <div
      className={className}
      data-testid="accordion-root"
      {...props}
    >
      {children}
    </div>
  ),
  Item: ({ className, children, value, ...props }: any) => (
    <div
      className={className}
      data-testid="accordion-item"
      data-value={value}
      {...props}
    >
      {children}
    </div>
  ),
  Header: ({ className, children, ...props }: any) => (
    <div
      className={className}
      data-testid="accordion-header"
      {...props}
    >
      {children}
    </div>
  ),
  Trigger: ({ className, children, ...props }: any) => (
    <button
      className={className}
      data-testid="accordion-trigger"
      {...props}
    >
      {children}
    </button>
  ),
  Content: ({ className, children, ...props }: any) => {
    const { cn } = require('@/lib/utils');
    return (
      <div
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        data-testid="accordion-content"
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      </div>
    );
  },
}));

jest.mock('lucide-react', () => ({
  ChevronDown: ({ className, ...props }: any) => (
    <span data-testid="chevron-down" className={className} {...props}>▼</span>
  ),
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
      expect(content).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
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

  describe('Integration', () => {
    it('should render complete accordion structure', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-item')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-content')).toBeInTheDocument();
    });
  });
});