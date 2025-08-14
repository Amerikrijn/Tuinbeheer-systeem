import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Drawer, 
  DrawerPortal, 
  DrawerOverlay, 
  DrawerClose, 
  DrawerTrigger, 
  DrawerContent, 
  DrawerHeader, 
  DrawerFooter, 
  DrawerTitle, 
  DrawerDescription 
} from '@/components/ui/drawer'

// Mock vaul
jest.mock('vaul', () => ({
  Drawer: {
    Root: ({ children, shouldScaleBackground, ...props }: any) => (
      <div data-testid="drawer-root" data-should-scale={shouldScaleBackground} {...props}>{children}</div>
    ),
    Portal: ({ children, ...props }: any) => (
      <div data-testid="drawer-portal" {...props}>{children}</div>
    ),
    Overlay: ({ children, className, ...props }: any) => (
      <div data-testid="drawer-overlay" className={className} {...props}>{children}</div>
    ),
    Close: ({ children, ...props }: any) => (
      <button data-testid="drawer-close" {...props}>{children}</button>
    ),
    Trigger: ({ children, ...props }: any) => (
      <button data-testid="drawer-trigger" {...props}>{children}</button>
    ),
    Content: ({ children, className, ...props }: any) => (
      <div data-testid="drawer-content" className={className} {...props}>{children}</div>
    ),
    Title: ({ children, className, ...props }: any) => (
      <h2 data-testid="drawer-title" className={className} {...props}>{children}</h2>
    ),
    Description: ({ children, className, ...props }: any) => (
      <p data-testid="drawer-description" className={className} {...props}>{children}</p>
    )
  }
}))

describe('Drawer Components', () => {
  describe('Drawer', () => {
    it('renders correctly with default props', () => {
      render(<Drawer data-testid="test-drawer" />)
      expect(screen.getByTestId('drawer-root')).toBeInTheDocument()
    })

    it('sets shouldScaleBackground to true by default', () => {
      render(<Drawer data-testid="test-drawer" />)
      const drawer = screen.getByTestId('drawer-root')
      expect(drawer).toHaveAttribute('data-should-scale', 'true')
    })

    it('allows customizing shouldScaleBackground', () => {
      render(<Drawer shouldScaleBackground={false} data-testid="test-drawer" />)
      const drawer = screen.getByTestId('drawer-root')
      expect(drawer).toHaveAttribute('data-should-scale', 'false')
    })

    it('renders children correctly', () => {
      render(
        <Drawer>
          <div data-testid="child">Child content</div>
        </Drawer>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Drawer data-testid="test-drawer" aria-label="Test drawer" />)
      const drawer = screen.getByTestId('drawer-root')
      expect(drawer).toHaveAttribute('aria-label', 'Test drawer')
    })
  })

  describe('DrawerPortal', () => {
    it('renders correctly with default props', () => {
      render(<DrawerPortal data-testid="test-portal" />)
      expect(screen.getByTestId('drawer-portal')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DrawerPortal>
          <div data-testid="child">Portal content</div>
        </DrawerPortal>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerPortal data-testid="test-portal" aria-label="Test portal" />)
      const portal = screen.getByTestId('drawer-portal')
      expect(portal).toHaveAttribute('aria-label', 'Test portal')
    })
  })

  describe('DrawerOverlay', () => {
    it('renders correctly with default props', () => {
      render(<DrawerOverlay data-testid="test-overlay" />)
      expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DrawerOverlay className="custom-class" data-testid="test-overlay" />)
      const overlay = screen.getByTestId('drawer-overlay')
      expect(overlay).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DrawerOverlay data-testid="test-overlay" />)
      const overlay = screen.getByTestId('drawer-overlay')
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black/80')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DrawerOverlay ref={ref} data-testid="test-overlay" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerOverlay data-testid="test-overlay" aria-label="Test overlay" />)
      const overlay = screen.getByTestId('drawer-overlay')
      expect(overlay).toHaveAttribute('aria-label', 'Test overlay')
    })
  })

  describe('DrawerClose', () => {
    it('renders correctly with default props', () => {
      render(<DrawerClose data-testid="test-close" />)
      expect(screen.getByTestId('drawer-close')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<DrawerClose data-testid="test-close" />)
      const close = screen.getByTestId('drawer-close')
      expect(close.tagName).toBe('BUTTON')
    })

    it('renders children correctly', () => {
      render(
        <DrawerClose>
          <span data-testid="child">Close</span>
        </DrawerClose>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerClose data-testid="test-close" aria-label="Test close" />)
      const close = screen.getByTestId('drawer-close')
      expect(close).toHaveAttribute('aria-label', 'Test close')
    })
  })

  describe('DrawerTrigger', () => {
    it('renders correctly with default props', () => {
      render(<DrawerTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('drawer-trigger')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<DrawerTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('drawer-trigger')
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders children correctly', () => {
      render(
        <DrawerTrigger>
          <span data-testid="child">Open Drawer</span>
        </DrawerTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('drawer-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('DrawerContent', () => {
    it('renders correctly with default props', () => {
      render(<DrawerContent data-testid="test-content" />)
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DrawerContent className="custom-class" data-testid="test-content" />)
      const content = screen.getByTestId('drawer-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DrawerContent data-testid="test-content" />)
      const content = screen.getByTestId('drawer-content')
      expect(content).toHaveClass('fixed', 'inset-x-0', 'bottom-0', 'z-50', 'mt-24', 'flex', 'h-auto', 'flex-col', 'rounded-t-[10px]', 'border', 'bg-background')
    })

    it('renders children correctly', () => {
      render(
        <DrawerContent>
          <div data-testid="child">Content text</div>
        </DrawerContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders drag handle', () => {
      render(<DrawerContent data-testid="test-content" />)
      const dragHandle = screen.getByTestId('drawer-content').querySelector('.mx-auto.mt-4.h-2.w-\\[100px\\].rounded-full.bg-muted')
      expect(dragHandle).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DrawerContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('drawer-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })
  })

  describe('DrawerHeader', () => {
    it('renders correctly with default props', () => {
      render(<DrawerHeader data-testid="test-header" />)
      expect(screen.getByTestId('test-header')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<DrawerHeader data-testid="test-header" />)
      const header = screen.getByTestId('test-header')
      expect(header.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<DrawerHeader className="custom-class" data-testid="test-header" />)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DrawerHeader data-testid="test-header" />)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveClass('grid', 'gap-1.5', 'p-4', 'text-center', 'sm:text-left')
    })

    it('renders children correctly', () => {
      render(
        <DrawerHeader>
          <span data-testid="child">Header text</span>
        </DrawerHeader>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerHeader data-testid="test-header" aria-label="Test header" />)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveAttribute('aria-label', 'Test header')
    })
  })

  describe('DrawerFooter', () => {
    it('renders correctly with default props', () => {
      render(<DrawerFooter data-testid="test-footer" />)
      expect(screen.getByTestId('test-footer')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<DrawerFooter data-testid="test-footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<DrawerFooter className="custom-class" data-testid="test-footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DrawerFooter data-testid="test-footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveClass('mt-auto', 'flex', 'flex-col', 'gap-2', 'p-4')
    })

    it('renders children correctly', () => {
      render(
        <DrawerFooter>
          <span data-testid="child">Footer text</span>
        </DrawerFooter>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerFooter data-testid="test-footer" aria-label="Test footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveAttribute('aria-label', 'Test footer')
    })
  })

  describe('DrawerTitle', () => {
    it('renders correctly with default props', () => {
      render(<DrawerTitle data-testid="test-title" />)
      expect(screen.getByTestId('drawer-title')).toBeInTheDocument()
    })

    it('renders as h2 element', () => {
      render(<DrawerTitle data-testid="test-title" />)
      const title = screen.getByTestId('drawer-title')
      expect(title.tagName).toBe('H2')
    })

    it('renders with custom className', () => {
      render(<DrawerTitle className="custom-class" data-testid="test-title" />)
      const title = screen.getByTestId('drawer-title')
      expect(title).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DrawerTitle data-testid="test-title" />)
      const title = screen.getByTestId('drawer-title')
      expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('renders children correctly', () => {
      render(
        <DrawerTitle>
          <span data-testid="child">Drawer Title</span>
        </DrawerTitle>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      render(<DrawerTitle ref={ref} data-testid="test-title" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerTitle data-testid="test-title" aria-label="Test title" />)
      const title = screen.getByTestId('drawer-title')
      expect(title).toHaveAttribute('aria-label', 'Test title')
    })
  })

  describe('DrawerDescription', () => {
    it('renders correctly with default props', () => {
      render(<DrawerDescription data-testid="test-description" />)
      expect(screen.getByTestId('drawer-description')).toBeInTheDocument()
    })

    it('renders as p element', () => {
      render(<DrawerDescription data-testid="test-description" />)
      const description = screen.getByTestId('drawer-description')
      expect(description.tagName).toBe('P')
    })

    it('renders with custom className', () => {
      render(<DrawerDescription className="custom-class" data-testid="test-description" />)
      const description = screen.getByTestId('drawer-description')
      expect(description).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DrawerDescription data-testid="test-description" />)
      const description = screen.getByTestId('drawer-description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('renders children correctly', () => {
      render(
        <DrawerDescription>
          <span data-testid="child">Drawer description</span>
        </DrawerDescription>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<DrawerDescription ref={ref} data-testid="test-description" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DrawerDescription data-testid="test-description" aria-label="Test description" />)
      const description = screen.getByTestId('drawer-description')
      expect(description).toHaveAttribute('aria-label', 'Test description')
    })
  })

  describe('Drawer Composition', () => {
    it('renders complete drawer structure', () => {
      render(
        <Drawer>
          <DrawerTrigger>Open Drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer Title</DrawerTitle>
              <DrawerDescription>Drawer description</DrawerDescription>
            </DrawerHeader>
            <div>Drawer content</div>
            <DrawerFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )

      expect(screen.getByTestId('drawer-root')).toBeInTheDocument()
      expect(screen.getByTestId('drawer-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
      expect(screen.getByTestId('drawer-title')).toBeInTheDocument()
      expect(screen.getByTestId('drawer-description')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <Drawer>
          <DrawerContent>
            <DrawerHeader></DrawerHeader>
            <DrawerFooter></DrawerFooter>
          </DrawerContent>
        </Drawer>
      )
      expect(screen.getByTestId('drawer-root')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <Drawer>
          <DrawerContent>
            <DrawerHeader>{null}</DrawerHeader>
            <DrawerFooter>{null}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      )
      expect(screen.getByTestId('drawer-root')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <Drawer>
          <DrawerContent>
            <DrawerHeader>{undefined}</DrawerHeader>
            <DrawerFooter>{undefined}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      )
      expect(screen.getByTestId('drawer-root')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<DrawerContent className="custom-content-class" data-testid="test-content" />)
      const content = screen.getByTestId('drawer-content')
      expect(content).toHaveClass('custom-content-class')
      expect(content).toHaveClass('fixed', 'inset-x-0', 'bottom-0')
    })

    it('handles multiple custom classes', () => {
      render(<DrawerContent className="class1 class2 class3" data-testid="test-content" />)
      const content = screen.getByTestId('drawer-content')
      expect(content).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <Drawer>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter>
              <button>Action</button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )

      const drawer = screen.getByTestId('drawer-root')
      const content = screen.getByTestId('drawer-content')
      expect(drawer).toContainElement(content)
    })

    it('renders drag handle with correct styling', () => {
      render(<DrawerContent data-testid="test-content" />)
      const dragHandle = screen.getByTestId('drawer-content').querySelector('.mx-auto.mt-4.h-2.w-\\[100px\\].rounded-full.bg-muted')
      expect(dragHandle).toBeInTheDocument()
      expect(dragHandle).toHaveClass('mx-auto', 'mt-4', 'h-2', 'w-[100px]', 'rounded-full', 'bg-muted')
    })
  })
})