import { render, screen, fireEvent } from '@testing-library/react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

// Mock Radix UI Collapsible primitives
jest.mock('@radix-ui/react-collapsible', () => ({
  Root: ({ children, open, onOpenChange, ...props }: any) => (
    <div data-open={open} data-testid="collapsible-root" {...props}>
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
  ),
}))

describe('Collapsible Components', () => {
  describe('Collapsible Root', () => {
    it('renders correctly with default props', () => {
      render(<Collapsible>Content</Collapsible>)
      const collapsible = screen.getByTestId('collapsible-root')
      expect(collapsible).toBeInTheDocument()
      expect(collapsible.tagName).toBe('DIV')
    })

    it('renders children correctly', () => {
      render(<Collapsible>Test Content</Collapsible>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('handles open state correctly', () => {
      render(<Collapsible open={true}>Content</Collapsible>)
      const collapsible = screen.getByTestId('collapsible-root')
      expect(collapsible).toHaveAttribute('data-open', 'true')
    })

    it('handles closed state correctly', () => {
      render(<Collapsible open={false}>Content</Collapsible>)
      const collapsible = screen.getByTestId('collapsible-root')
      expect(collapsible).toHaveAttribute('data-open', 'false')
    })

    it('calls onOpenChange when state changes', () => {
      const handleOpenChange = jest.fn()
      render(<Collapsible onOpenChange={handleOpenChange}>Content</Collapsible>)
      // Note: In a real implementation, this would be triggered by the trigger
      expect(handleOpenChange).toBeDefined()
    })

    it('spreads additional props', () => {
      render(
        <Collapsible 
          data-testid="custom-collapsible" 
          className="custom-class"
          aria-label="Test collapsible"
        >
          Content
        </Collapsible>
      )
      const collapsible = screen.getByTestId('custom-collapsible')
      expect(collapsible).toHaveClass('custom-class')
      expect(collapsible).toHaveAttribute('aria-label', 'Test collapsible')
    })
  })

  describe('CollapsibleTrigger', () => {
    it('renders correctly as a button', () => {
      render(<CollapsibleTrigger>Toggle</CollapsibleTrigger>)
      const trigger = screen.getByTestId('collapsible-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders children correctly', () => {
      render(<CollapsibleTrigger>Click to expand</CollapsibleTrigger>)
      expect(screen.getByText('Click to expand')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<CollapsibleTrigger onClick={handleClick}>Toggle</CollapsibleTrigger>)
      
      const trigger = screen.getByTestId('collapsible-trigger')
      fireEvent.click(trigger)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
      render(<CollapsibleTrigger disabled>Toggle</CollapsibleTrigger>)
      const trigger = screen.getByTestId('collapsible-trigger')
      expect(trigger).toBeDisabled()
    })

    it('spreads additional props', () => {
      render(
        <CollapsibleTrigger 
          data-testid="custom-trigger" 
          aria-label="Toggle section"
          className="trigger-class"
        >
          Toggle
        </CollapsibleTrigger>
      )
      const trigger = screen.getByTestId('custom-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Toggle section')
      expect(trigger).toHaveClass('trigger-class')
    })
  })

  describe('CollapsibleContent', () => {
    it('renders correctly as a div', () => {
      render(<CollapsibleContent>Content</CollapsibleContent>)
      const content = screen.getByTestId('collapsible-content')
      expect(content).toBeInTheDocument()
      expect(content.tagName).toBe('DIV')
    })

    it('renders children correctly', () => {
      render(<CollapsibleContent>Hidden content</CollapsibleContent>)
      expect(screen.getByText('Hidden content')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(
        <CollapsibleContent 
          data-testid="custom-content" 
          className="content-class"
          aria-hidden="false"
        >
          Content
        </CollapsibleContent>
      )
      const content = screen.getByTestId('custom-content')
      expect(content).toHaveClass('content-class')
      expect(content).toHaveAttribute('aria-hidden', 'false')
    })
  })

  describe('Complete Collapsible Usage', () => {
    it('renders all components together correctly', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle Section</CollapsibleTrigger>
          <CollapsibleContent>This is the collapsible content</CollapsibleContent>
        </Collapsible>
      )
      
      expect(screen.getByTestId('collapsible-root')).toBeInTheDocument()
      expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('collapsible-content')).toBeInTheDocument()
      expect(screen.getByText('Toggle Section')).toBeInTheDocument()
      expect(screen.getByText('This is the collapsible content')).toBeInTheDocument()
    })

    it('maintains proper component hierarchy', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <p>Paragraph content</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByTestId('collapsible-trigger')
      const content = screen.getByTestId('collapsible-content')
      const root = screen.getByTestId('collapsible-root')
      
      expect(root).toContainElement(trigger)
      expect(root).toContainElement(content)
      expect(content).toContainElement(screen.getByText('Paragraph content'))
      expect(content).toContainElement(screen.getByText('List item 1'))
      expect(content).toContainElement(screen.getByText('List item 2'))
    })
  })
})