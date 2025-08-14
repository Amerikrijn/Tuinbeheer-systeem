import React from 'react'
import { render, screen } from '@testing-library/react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Mock Radix UI components with proper ref forwarding
jest.mock('@radix-ui/react-accordion', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props}>{children}</div>
  )),
  Item: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div ref={ref} className={className} {...props}>{children}</div>
  )),
  Header: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  Trigger: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <button ref={ref} className={className} {...props}>{children}</button>
  )),
  Content: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div 
      ref={ref} 
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )),
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronDown: () => <svg data-testid="chevron-down" className="h-4 w-4 shrink-0 transition-transform duration-200" />,
}))

describe('Accordion Components', () => {
  describe('Accordion', () => {
    it('renders correctly with default props', () => {
      render(<Accordion data-testid="test-accordion" />)
      expect(screen.getByTestId('test-accordion')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Accordion className="custom-class" data-testid="test-accordion" />)
      const accordion = screen.getByTestId('test-accordion')
      expect(accordion).toHaveClass('custom-class')
    })

    it('renders children correctly', () => {
      render(
        <Accordion data-testid="test-accordion">
          <div data-testid="child">Child content</div>
        </Accordion>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Accordion ref={ref} data-testid="test-accordion" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Accordion data-testid="test-accordion" aria-label="Test accordion" />)
      const accordion = screen.getByTestId('test-accordion')
      expect(accordion).toHaveAttribute('aria-label', 'Test accordion')
    })
  })

  describe('AccordionItem', () => {
    it('renders correctly with default props', () => {
      render(<AccordionItem data-testid="test-item" />)
      expect(screen.getByTestId('test-item')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<AccordionItem className="custom-class" data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('custom-class')
    })

    it('renders children correctly', () => {
      render(
        <AccordionItem data-testid="test-item">
          <div data-testid="child">Child content</div>
        </AccordionItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<AccordionItem ref={ref} data-testid="test-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<AccordionItem data-testid="test-item" aria-label="Test item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveAttribute('aria-label', 'Test item')
    })
  })

  describe('AccordionTrigger', () => {
    it('renders correctly with default props', () => {
      render(<AccordionTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<AccordionTrigger className="custom-class" data-testid="test-trigger" />)
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<AccordionTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveClass('flex', 'flex-1', 'items-center', 'justify-between', 'py-4', 'font-medium', 'transition-all', 'hover:underline')
    })

    it('renders children correctly', () => {
      render(
        <AccordionTrigger data-testid="test-trigger">
          <span data-testid="child">Trigger text</span>
        </AccordionTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<AccordionTrigger ref={ref} data-testid="test-trigger" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<AccordionTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('AccordionContent', () => {
    it('renders correctly with default props', () => {
      render(<AccordionContent data-testid="test-content" />)
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<AccordionContent data-testid="test-content" />)
      const content = screen.getByTestId('test-content')
      expect(content).toHaveClass('overflow-hidden', 'text-sm', 'transition-all', 'data-[state=closed]:animate-accordion-up', 'data-[state=open]:animate-accordion-down')
    })

    it('renders children correctly', () => {
      render(
        <AccordionContent data-testid="test-content">
          <div data-testid="child">Content text</div>
        </AccordionContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<AccordionContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<AccordionContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('test-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })
  })

  describe('Accordion Composition', () => {
    it('combines default and custom classes correctly', () => {
      render(<AccordionItem className="custom-item-class" data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('custom-item-class')
    })

    it('handles multiple custom classes', () => {
      render(<AccordionItem className="class1 class2 class3" data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('class1', 'class2', 'class3')
    })
  })
})