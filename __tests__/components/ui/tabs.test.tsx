import React from 'react'
import { render, screen } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Mock Radix UI Tabs primitives
jest.mock('@radix-ui/react-tabs', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )),
  List: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Trigger: React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      role="tab"
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
  Content: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tabpanel"
      className={className}
      {...props}
    >
      {children}
    </div>
  ))
}))

describe('Tabs Components', () => {
  describe('Tabs (Root)', () => {
    it('renders correctly with default props', () => {
      render(<Tabs>Test Tabs</Tabs>)
      const tabs = screen.getByRole('tablist')
      expect(tabs).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(<Tabs>Test Content</Tabs>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Tabs data-testid="test-tabs" id="tabs-1">Test Tabs</Tabs>)
      const tabs = screen.getByTestId('test-tabs')
      expect(tabs).toHaveAttribute('id', 'tabs-1')
    })
  })

  describe('TabsList', () => {
    it('renders correctly with default props', () => {
      render(<TabsList>Test List</TabsList>)
      const list = screen.getByText('Test List')
      expect(list).toBeInTheDocument()
      expect(list.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<TabsList className="custom-list">Test List</TabsList>)
      const list = screen.getByText('Test List')
      expect(list).toHaveClass('custom-list')
    })

    it('applies default classes', () => {
      render(<TabsList>Test List</TabsList>)
      const list = screen.getByText('Test List')
      expect(list).toHaveClass('inline-flex', 'h-10', 'items-center', 'justify-center', 'rounded-md', 'bg-muted', 'p-1', 'text-muted-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<TabsList ref={ref}>Test List</TabsList>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<TabsList data-testid="test-list" id="list-1">Test List</TabsList>)
      const list = screen.getByTestId('test-list')
      expect(list).toHaveAttribute('id', 'list-1')
    })
  })

  describe('TabsTrigger', () => {
    it('renders correctly with default props', () => {
      render(<TabsTrigger>Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders with custom className', () => {
      render(<TabsTrigger className="custom-trigger">Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('applies default classes', () => {
      render(<TabsTrigger>Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveClass('inline-flex', 'items-center', 'justify-center', 'whitespace-nowrap', 'rounded-sm', 'px-3', 'py-1.5', 'text-sm', 'font-medium')
    })

    it('applies transition classes', () => {
      render(<TabsTrigger>Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveClass('transition-all')
    })

    it('applies focus classes', () => {
      render(<TabsTrigger>Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2')
    })

    it('applies disabled classes', () => {
      render(<TabsTrigger>Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('applies active state classes', () => {
      render(<TabsTrigger>Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveClass('data-[state=active]:bg-background', 'data-[state=active]:text-foreground', 'data-[state=active]:shadow-sm')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<TabsTrigger ref={ref}>Test Trigger</TabsTrigger>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('spreads additional props', () => {
      render(<TabsTrigger data-testid="test-trigger" id="trigger-1">Test Trigger</TabsTrigger>)
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveAttribute('id', 'trigger-1')
    })
  })

  describe('TabsContent', () => {
    it('renders correctly with default props', () => {
      render(<TabsContent>Test Content</TabsContent>)
      const content = screen.getByRole('tabpanel')
      expect(content).toBeInTheDocument()
      expect(content.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<TabsContent className="custom-content">Test Content</TabsContent>)
      const content = screen.getByRole('tabpanel')
      expect(content).toHaveClass('custom-content')
    })

    it('applies default classes', () => {
      render(<TabsContent>Test Content</TabsContent>)
      const content = screen.getByRole('tabpanel')
      expect(content).toHaveClass('mt-2', 'ring-offset-background')
    })

    it('applies focus classes', () => {
      render(<TabsContent>Test Content</TabsContent>)
      const content = screen.getByRole('tabpanel')
      expect(content).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<TabsContent ref={ref}>Test Content</TabsContent>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<TabsContent data-testid="test-content" id="content-1">Test Content</TabsContent>)
      const content = screen.getByTestId('test-content')
      expect(content).toHaveAttribute('id', 'content-1')
    })
  })

  describe('Tabs Composition', () => {
    it('renders complete tabs structure', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(2)
      expect(screen.getAllByRole('tabpanel')).toHaveLength(2)
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(<Tabs />)
      const tabs = screen.getByRole('tablist')
      expect(tabs).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<Tabs>{null}</Tabs>)
      const tabs = screen.getByRole('tablist')
      expect(tabs).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Tabs>{undefined}</Tabs>)
      const tabs = screen.getByRole('tablist')
      expect(tabs).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<TabsList className="extra-class">Test List</TabsList>)
      const list = screen.getByText('Test List')
      expect(list).toHaveClass('inline-flex', 'h-10', 'items-center', 'justify-center', 'rounded-md', 'bg-muted', 'p-1', 'text-muted-foreground', 'extra-class')
    })

    it('handles multiple custom classes', () => {
      render(<TabsTrigger className="class1 class2 class3">Test Trigger</TabsTrigger>)
      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains accessibility roles', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tab')).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })
  })
})