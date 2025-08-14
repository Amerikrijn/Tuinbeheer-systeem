import React from 'react'
import { render, screen } from '@testing-library/react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Mock Radix UI components with proper ref forwarding
jest.mock('@radix-ui/react-collapsible', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props}>{children}</div>
  )),
  Trigger: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <button ref={ref} {...props}>{children}</button>
  )),
  Content: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props}>{children}</div>
  )),
}))

describe('Collapsible Components', () => {
  describe('Collapsible', () => {
    it('renders correctly with default props', () => {
      render(<Collapsible data-testid="test-collapsible" />)
      expect(screen.getByTestId('test-collapsible')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <Collapsible data-testid="test-collapsible">
          <div data-testid="child">Child content</div>
        </Collapsible>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Collapsible ref={ref} data-testid="test-collapsible" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Collapsible data-testid="test-collapsible" aria-label="Test collapsible" />)
      const collapsible = screen.getByTestId('test-collapsible')
      expect(collapsible).toHaveAttribute('aria-label', 'Test collapsible')
    })

    it('handles empty children', () => {
      render(<Collapsible data-testid="test-collapsible" />)
      expect(screen.getByTestId('test-collapsible')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<Collapsible data-testid="test-collapsible">{null}</Collapsible>)
      expect(screen.getByTestId('test-collapsible')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Collapsible data-testid="test-collapsible">{undefined}</Collapsible>)
      expect(screen.getByTestId('test-collapsible')).toBeInTheDocument()
    })

    it('combines multiple props correctly', () => {
      render(
        <Collapsible 
          data-testid="test-collapsible"
          className="custom-class"
          role="region"
          style={{ width: '100%' }}
        />
      )
      const collapsible = screen.getByTestId('test-collapsible')
      expect(collapsible).toHaveClass('custom-class')
      expect(collapsible).toHaveStyle('width: 100%')
      expect(collapsible).toHaveAttribute('role', 'region')
    })
  })

  describe('CollapsibleTrigger', () => {
    it('renders correctly with default props', () => {
      render(<CollapsibleTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<CollapsibleTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders children correctly', () => {
      render(
        <CollapsibleTrigger data-testid="test-trigger">
          <span data-testid="child">Trigger text</span>
        </CollapsibleTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<CollapsibleTrigger ref={ref} data-testid="test-trigger" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CollapsibleTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })

    it('handles empty children', () => {
      render(<CollapsibleTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<CollapsibleTrigger data-testid="test-trigger">{null}</CollapsibleTrigger>)
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<CollapsibleTrigger data-testid="test-trigger">{undefined}</CollapsibleTrigger>)
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument()
    })

    it('combines multiple props correctly', () => {
      render(
        <CollapsibleTrigger 
          data-testid="test-trigger"
          className="custom-class"
          disabled
          style={{ color: 'red' }}
        />
      )
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveClass('custom-class')
      expect(trigger).toHaveStyle('color: red')
      expect(trigger).toBeDisabled()
    })
  })

  describe('CollapsibleContent', () => {
    it('renders correctly with default props', () => {
      render(<CollapsibleContent data-testid="test-content" />)
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<CollapsibleContent data-testid="test-content" />)
      const content = screen.getByTestId('test-content')
      expect(content.tagName).toBe('DIV')
    })

    it('renders children correctly', () => {
      render(
        <CollapsibleContent data-testid="test-content">
          <div data-testid="child">Content text</div>
        </CollapsibleContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CollapsibleContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CollapsibleContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('test-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })

    it('handles empty children', () => {
      render(<CollapsibleContent data-testid="test-content" />)
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<CollapsibleContent data-testid="test-content">{null}</CollapsibleContent>)
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<CollapsibleContent data-testid="test-content">{undefined}</CollapsibleContent>)
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('combines multiple props correctly', () => {
      render(
        <CollapsibleContent 
          data-testid="test-content"
          className="custom-class"
          role="region"
          style={{ padding: '20px' }}
        />
      )
      const content = screen.getByTestId('test-content')
      expect(content).toHaveClass('custom-class')
      expect(content).toHaveStyle('padding: 20px')
      expect(content).toHaveAttribute('role', 'region')
    })
  })

  describe('Collapsible Composition', () => {
    it('renders complete collapsible structure', () => {
      render(
        <Collapsible data-testid="test-collapsible">
          <CollapsibleTrigger data-testid="test-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent data-testid="test-content">Content</CollapsibleContent>
        </Collapsible>
      )

      expect(screen.getByTestId('test-collapsible')).toBeInTheDocument()
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('handles multiple children', () => {
      render(
        <Collapsible data-testid="test-collapsible">
          <CollapsibleTrigger data-testid="test-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent data-testid="test-content">Content 1</CollapsibleContent>
          <CollapsibleContent data-testid="test-content-2">Content 2</CollapsibleContent>
        </Collapsible>
      )

      expect(screen.getByTestId('test-collapsible')).toBeInTheDocument()
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByTestId('test-content-2')).toBeInTheDocument()
    })
  })
})