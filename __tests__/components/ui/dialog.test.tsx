import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Dialog, 
  DialogPortal, 
  DialogOverlay, 
  DialogClose, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'

// Mock Radix UI components
jest.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="dialog-root" {...props}>{children}</div>,
  Portal: ({ children, ...props }: any) => <div data-testid="dialog-portal" {...props}>{children}</div>,
  Overlay: ({ children, className, ...props }: any) => (
    <div data-testid="dialog-overlay" className={className} {...props}>{children}</div>
  ),
  Close: ({ children, className, ...props }: any) => (
    <button data-testid="dialog-close" className={className} {...props}>{children}</button>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="dialog-trigger" {...props}>{children}</button>
  ),
  Content: ({ children, className, ...props }: any) => (
    <div data-testid="dialog-content" className={className} {...props}>{children}</div>
  ),
  Title: ({ children, className, ...props }: any) => (
    <h2 data-testid="dialog-title" className={className} {...props}>{children}</h2>
  ),
  Description: ({ children, className, ...props }: any) => (
    <p data-testid="dialog-description" className={className} {...props}>{children}</p>
  )
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: ({ className }: any) => <svg data-testid="x-icon" className={className} />
}))

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('renders correctly with default props', () => {
      render(<Dialog data-testid="test-dialog" />)
      expect(screen.getByTestId('dialog-root')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <Dialog>
          <div data-testid="child">Child content</div>
        </Dialog>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Dialog data-testid="test-dialog" aria-label="Test dialog" />)
      const dialog = screen.getByTestId('dialog-root')
      expect(dialog).toHaveAttribute('aria-label', 'Test dialog')
    })
  })

  describe('DialogPortal', () => {
    it('renders correctly with default props', () => {
      render(<DialogPortal data-testid="test-portal" />)
      expect(screen.getByTestId('dialog-portal')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DialogPortal>
          <div data-testid="child">Portal content</div>
        </DialogPortal>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogPortal data-testid="test-portal" aria-label="Test portal" />)
      const portal = screen.getByTestId('dialog-portal')
      expect(portal).toHaveAttribute('aria-label', 'Test portal')
    })
  })

  describe('DialogOverlay', () => {
    it('renders correctly with default props', () => {
      render(<DialogOverlay data-testid="test-overlay" />)
      expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DialogOverlay className="custom-class" data-testid="test-overlay" />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DialogOverlay data-testid="test-overlay" />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black/50')
    })

    it('applies animation classes', () => {
      render(<DialogOverlay data-testid="test-overlay" />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DialogOverlay ref={ref} data-testid="test-overlay" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogOverlay data-testid="test-overlay" aria-label="Test overlay" />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveAttribute('aria-label', 'Test overlay')
    })
  })

  describe('DialogClose', () => {
    it('renders correctly with default props', () => {
      render(<DialogClose data-testid="test-close" />)
      expect(screen.getByTestId('dialog-close')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<DialogClose data-testid="test-close" />)
      const close = screen.getByTestId('dialog-close')
      expect(close.tagName).toBe('BUTTON')
    })

    it('renders with custom className', () => {
      render(<DialogClose className="custom-class" data-testid="test-close" />)
      const close = screen.getByTestId('dialog-close')
      expect(close).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DialogClose data-testid="test-close" />)
      const close = screen.getByTestId('dialog-close')
      expect(close).toHaveClass('absolute', 'right-4', 'top-4', 'rounded-sm', 'opacity-70', 'ring-offset-background', 'transition-opacity', 'hover:opacity-100', 'focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2', 'disabled:pointer-events-none', 'data-[state=open]:bg-accent', 'data-[state=open]:text-muted-foreground')
    })

    it('renders X icon', () => {
      render(<DialogClose data-testid="test-close" />)
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('renders screen reader text', () => {
      render(<DialogClose data-testid="test-close" />)
      expect(screen.getByText('Close')).toBeInTheDocument()
      expect(screen.getByText('Close')).toHaveClass('sr-only')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<DialogClose ref={ref} data-testid="test-close" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogClose data-testid="test-close" aria-label="Test close" />)
      const close = screen.getByTestId('dialog-close')
      expect(close).toHaveAttribute('aria-label', 'Test close')
    })
  })

  describe('DialogTrigger', () => {
    it('renders correctly with default props', () => {
      render(<DialogTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<DialogTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('dialog-trigger')
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders children correctly', () => {
      render(
        <DialogTrigger>
          <span data-testid="child">Open Dialog</span>
        </DialogTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('dialog-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('DialogContent', () => {
    it('renders correctly with default props', () => {
      render(<DialogContent data-testid="test-content" />)
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DialogContent className="custom-class" data-testid="test-content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DialogContent data-testid="test-content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('fixed', 'left-[50%]', 'top-[50%]', 'z-50', 'grid', 'w-full', 'max-w-lg', 'translate-x-[-50%]', 'translate-y-[-50%]', 'gap-4', 'border', 'bg-background', 'p-6', 'shadow-lg', 'duration-200')
    })

    it('applies animation classes', () => {
      render(<DialogContent data-testid="test-content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95')
    })

    it('applies slide animation classes', () => {
      render(<DialogContent data-testid="test-content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('data-[state=closed]:slide-out-to-left-1/2', 'data-[state=closed]:slide-out-to-top-[48%]', 'data-[state=open]:slide-in-from-left-1/2', 'data-[state=open]:slide-in-from-top-[48%]')
    })

    it('applies responsive classes', () => {
      render(<DialogContent data-testid="test-content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('sm:rounded-lg')
    })

    it('renders children correctly', () => {
      render(
        <DialogContent>
          <div data-testid="child">Content text</div>
        </DialogContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<DialogContent data-testid="test-content" />)
      expect(screen.getByTestId('dialog-close')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DialogContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })
  })

  describe('DialogHeader', () => {
    it('renders correctly with default props', () => {
      render(<DialogHeader data-testid="test-header" />)
      expect(screen.getByTestId('test-header')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<DialogHeader data-testid="test-header" />)
      const header = screen.getByTestId('test-header')
      expect(header.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<DialogHeader className="custom-class" data-testid="test-header" />)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DialogHeader data-testid="test-header" />)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'text-center', 'sm:text-left')
    })

    it('renders children correctly', () => {
      render(
        <DialogHeader>
          <span data-testid="child">Header text</span>
        </DialogHeader>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogHeader data-testid="test-header" aria-label="Test header" />)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveAttribute('aria-label', 'Test header')
    })
  })

  describe('DialogFooter', () => {
    it('renders correctly with default props', () => {
      render(<DialogFooter data-testid="test-footer" />)
      expect(screen.getByTestId('test-footer')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<DialogFooter data-testid="test-footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<DialogFooter className="custom-class" data-testid="test-footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DialogFooter data-testid="test-footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveClass('flex', 'flex-col-reverse', 'sm:flex-row', 'sm:justify-end', 'sm:space-x-2')
    })

    it('renders children correctly', () => {
      render(
        <DialogFooter>
          <span data-testid="child">Footer text</span>
        </DialogFooter>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogFooter data-testid="test-footer" aria-label="Test footer" />)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveAttribute('aria-label', 'Test footer')
    })
  })

  describe('DialogTitle', () => {
    it('renders correctly with default props', () => {
      render(<DialogTitle data-testid="test-title" />)
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    })

    it('renders as h2 element', () => {
      render(<DialogTitle data-testid="test-title" />)
      const title = screen.getByTestId('dialog-title')
      expect(title.tagName).toBe('H2')
    })

    it('renders with custom className', () => {
      render(<DialogTitle className="custom-class" data-testid="test-title" />)
      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DialogTitle data-testid="test-title" />)
      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('renders children correctly', () => {
      render(
        <DialogTitle>
          <span data-testid="child">Dialog Title</span>
        </DialogTitle>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      render(<DialogTitle ref={ref} data-testid="test-title" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogTitle data-testid="test-title" aria-label="Test title" />)
      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveAttribute('aria-label', 'Test title')
    })
  })

  describe('DialogDescription', () => {
    it('renders correctly with default props', () => {
      render(<DialogDescription data-testid="test-description" />)
      expect(screen.getByTestId('dialog-description')).toBeInTheDocument()
    })

    it('renders as p element', () => {
      render(<DialogDescription data-testid="test-description" />)
      const description = screen.getByTestId('dialog-description')
      expect(description.tagName).toBe('P')
    })

    it('renders with custom className', () => {
      render(<DialogDescription className="custom-class" data-testid="test-description" />)
      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DialogDescription data-testid="test-description" />)
      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('renders children correctly', () => {
      render(
        <DialogDescription>
          <span data-testid="child">Dialog description</span>
        </DialogDescription>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<DialogDescription ref={ref} data-testid="test-description" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DialogDescription data-testid="test-description" aria-label="Test description" />)
      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveAttribute('aria-label', 'Test description')
    })
  })

  describe('Dialog Composition', () => {
    it('renders complete dialog structure', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog description</DialogDescription>
            </DialogHeader>
            <div>Dialog content</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId('dialog-root')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-description')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <Dialog>
          <DialogContent>
            <DialogHeader></DialogHeader>
            <DialogFooter></DialogFooter>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByTestId('dialog-root')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <Dialog>
          <DialogContent>
            <DialogHeader>{null}</DialogHeader>
            <DialogFooter>{null}</DialogFooter>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByTestId('dialog-root')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <Dialog>
          <DialogContent>
            <DialogHeader>{undefined}</DialogHeader>
            <DialogFooter>{undefined}</DialogFooter>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByTestId('dialog-root')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<DialogContent className="custom-content-class" data-testid="test-content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('custom-content-class')
      expect(content).toHaveClass('fixed', 'left-[50%]', 'top-[50%]')
    })

    it('handles multiple custom classes', () => {
      render(<DialogContent className="class1 class2 class3" data-testid="test-content" />)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByTestId('dialog-root')
      const content = screen.getByTestId('dialog-content')
      expect(dialog).toContainElement(content)
    })
  })
})