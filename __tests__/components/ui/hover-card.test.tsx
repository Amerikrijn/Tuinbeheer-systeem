import React from 'react'
import { render, screen } from '@testing-library/react'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'

// Mock Radix UI components
jest.mock('@radix-ui/react-hover-card', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="hover-card-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="hover-card-trigger" {...props}>{children}</div>
  ),
  Content: ({ children, className, align, sideOffset, ...props }: any) => (
    <div data-testid="hover-card-content" className={className} data-align={align} data-side-offset={sideOffset} {...props}>{children}</div>
  )
}))

describe('HoverCard Components', () => {
  describe('HoverCard', () => {
    it('renders correctly with default props', () => {
      render(<HoverCard data-testid="test-hover-card" />)
      expect(screen.getByTestId('hover-card-root')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <HoverCard>
          <div data-testid="child">Child content</div>
        </HoverCard>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<HoverCard data-testid="test-hover-card" aria-label="Test hover card" />)
      const hoverCard = screen.getByTestId('hover-card-root')
      expect(hoverCard).toHaveAttribute('aria-label', 'Test hover card')
    })
  })

  describe('HoverCardTrigger', () => {
    it('renders correctly with default props', () => {
      render(<HoverCardTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('hover-card-trigger')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <HoverCardTrigger>
          <span data-testid="child">Trigger text</span>
        </HoverCardTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<HoverCardTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('hover-card-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('HoverCardContent', () => {
    it('renders correctly with default props', () => {
      render(<HoverCardContent data-testid="test-content" />)
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<HoverCardContent className="custom-class" data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<HoverCardContent data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveClass('z-50', 'w-64', 'rounded-md', 'border', 'bg-popover', 'p-4', 'text-popover-foreground', 'shadow-md', 'outline-none')
    })

    it('applies animation classes', () => {
      render(<HoverCardContent data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95')
    })

    it('applies slide animation classes', () => {
      render(<HoverCardContent data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveClass('data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2')
    })

    it('sets default align to center', () => {
      render(<HoverCardContent data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveAttribute('data-align', 'center')
    })

    it('allows customizing align', () => {
      render(<HoverCardContent align="start" data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveAttribute('data-align', 'start')
    })

    it('sets default sideOffset to 4', () => {
      render(<HoverCardContent data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveAttribute('data-side-offset', '4')
    })

    it('allows customizing sideOffset', () => {
      render(<HoverCardContent sideOffset={8} data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveAttribute('data-side-offset', '8')
    })

    it('renders children correctly', () => {
      render(
        <HoverCardContent>
          <div data-testid="child">Content text</div>
        </HoverCardContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<HoverCardContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<HoverCardContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })
  })

  describe('HoverCard Composition', () => {
    it('renders complete hover card structure', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>Hover me</HoverCardTrigger>
          <HoverCardContent>
            <div>Hover card content</div>
          </HoverCardContent>
        </HoverCard>
      )

      expect(screen.getByTestId('hover-card-root')).toBeInTheDocument()
      expect(screen.getByTestId('hover-card-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <HoverCard>
          <HoverCardTrigger></HoverCardTrigger>
          <HoverCardContent></HoverCardContent>
        </HoverCard>
      )
      expect(screen.getByTestId('hover-card-root')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>{null}</HoverCardTrigger>
          <HoverCardContent>{null}</HoverCardContent>
        </HoverCard>
      )
      expect(screen.getByTestId('hover-card-root')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>{undefined}</HoverCardTrigger>
          <HoverCardContent>{undefined}</HoverCardContent>
        </HoverCard>
      )
      expect(screen.getByTestId('hover-card-root')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<HoverCardContent className="custom-content-class" data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveClass('custom-content-class')
      expect(content).toHaveClass('z-50', 'w-64')
    })

    it('handles multiple custom classes', () => {
      render(<HoverCardContent className="class1 class2 class3" data-testid="test-content" />)
      const content = screen.getByTestId('hover-card-content')
      expect(content).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent>Content</HoverCardContent>
        </HoverCard>
      )

      const hoverCard = screen.getByTestId('hover-card-root')
      const trigger = screen.getByTestId('hover-card-trigger')
      const content = screen.getByTestId('hover-card-content')
      expect(hoverCard).toContainElement(trigger)
      expect(hoverCard).toContainElement(content)
    })

    it('handles different align values', () => {
      const alignValues = ['start', 'center', 'end'] as const
      
      alignValues.forEach(align => {
        const { unmount } = render(
          <HoverCardContent align={align} data-testid={`test-content-${align}`} />
        )
        const content = screen.getByTestId(`test-content-${align}`)
        expect(content).toHaveAttribute('data-align', align)
        unmount()
      })
    })

    it('handles different sideOffset values', () => {
      const sideOffsetValues = [0, 4, 8, 16] as const
      
      sideOffsetValues.forEach(offset => {
        const { unmount } = render(
          <HoverCardContent sideOffset={offset} data-testid={`test-content-${offset}`} />
        )
        const content = screen.getByTestId(`test-content-${offset}`)
        expect(content).toHaveAttribute('data-side-offset', offset.toString())
        unmount()
      })
    })

    it('renders with complex content structure', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>
            <button>Hover button</button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div>
              <h3>Title</h3>
              <p>Description</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </HoverCardContent>
        </HoverCard>
      )

      expect(screen.getByText('Hover button')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })
})