import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  navigationMenuTriggerStyle, 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuContent, 
  NavigationMenuTrigger, 
  NavigationMenuLink, 
  NavigationMenuIndicator, 
  NavigationMenuViewport 
} from '@/components/ui/navigation-menu'

// Mock Radix UI components
jest.mock('@radix-ui/react-navigation-menu', () => ({
  Root: ({ children, className, ...props }: any) => (
    <div data-testid="navigation-menu-root" className={className} {...props}>{children}</div>
  ),
  List: ({ children, className, ...props }: any) => (
    <ul data-testid="navigation-menu-list" className={className} {...props}>{children}</ul>
  ),
  Item: ({ children, ...props }: any) => (
    <li data-testid="navigation-menu-item" {...props}>{children}</li>
  ),
  Trigger: ({ children, className, ...props }: any) => (
    <button data-testid="navigation-menu-trigger" className={className} {...props}>{children}</button>
  ),
  Content: ({ children, className, ...props }: any) => (
    <div data-testid="navigation-menu-content" className={className} {...props}>{children}</div>
  ),
  Link: ({ children, ...props }: any) => (
    <a data-testid="navigation-menu-link" {...props}>{children}</a>
  ),
  Viewport: ({ children, className, ...props }: any) => (
    <div data-testid="navigation-menu-viewport" className={className} {...props}>{children}</div>
  ),
  Indicator: ({ children, className, ...props }: any) => (
    <div data-testid="navigation-menu-indicator" className={className} {...props}>{children}</div>
  )
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronDown: ({ className, 'aria-hidden': ariaHidden }: any) => (
    <svg data-testid="chevron-down-icon" className={className} aria-hidden={ariaHidden} />
  )
}))

describe('NavigationMenu Components', () => {
  describe('NavigationMenu', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenu data-testid="test-navigation-menu" />)
      expect(screen.getByTestId('navigation-menu-root')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<NavigationMenu className="custom-class" data-testid="test-navigation-menu" />)
      const navigationMenu = screen.getByTestId('navigation-menu-root')
      expect(navigationMenu).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<NavigationMenu data-testid="test-navigation-menu" />)
      const navigationMenu = screen.getByTestId('navigation-menu-root')
      expect(navigationMenu).toHaveClass('relative', 'z-10', 'flex', 'max-w-max', 'flex-1', 'items-center', 'justify-center')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenu>
          <div data-testid="child">Child content</div>
        </NavigationMenu>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders NavigationMenuViewport', () => {
      render(<NavigationMenu data-testid="test-navigation-menu" />)
      expect(screen.getByTestId('navigation-menu-viewport')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<NavigationMenu ref={ref} data-testid="test-navigation-menu" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenu data-testid="test-navigation-menu" aria-label="Test navigation menu" />)
      const navigationMenu = screen.getByTestId('navigation-menu-root')
      expect(navigationMenu).toHaveAttribute('aria-label', 'Test navigation menu')
    })
  })

  describe('NavigationMenuList', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenuList data-testid="test-list" />)
      expect(screen.getByTestId('navigation-menu-list')).toBeInTheDocument()
    })

    it('renders as ul element', () => {
      render(<NavigationMenuList data-testid="test-list" />)
      const list = screen.getByTestId('navigation-menu-list')
      expect(list.tagName).toBe('UL')
    })

    it('renders with custom className', () => {
      render(<NavigationMenuList className="custom-class" data-testid="test-list" />)
      const list = screen.getByTestId('navigation-menu-list')
      expect(list).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<NavigationMenuList data-testid="test-list" />)
      const list = screen.getByTestId('navigation-menu-list')
      expect(list).toHaveClass('group', 'flex', 'flex-1', 'list-none', 'items-center', 'justify-center', 'space-x-1')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenuList>
          <div data-testid="child">List content</div>
        </NavigationMenuList>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLUListElement>()
      render(<NavigationMenuList ref={ref} data-testid="test-list" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenuList data-testid="test-list" aria-label="Test list" />)
      const list = screen.getByTestId('navigation-menu-list')
      expect(list).toHaveAttribute('aria-label', 'Test list')
    })
  })

  describe('NavigationMenuItem', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenuItem data-testid="test-item" />)
      expect(screen.getByTestId('navigation-menu-item')).toBeInTheDocument()
    })

    it('renders as li element', () => {
      render(<NavigationMenuItem data-testid="test-item" />)
      const item = screen.getByTestId('navigation-menu-item')
      expect(item.tagName).toBe('LI')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenuItem>
          <div data-testid="child">Item content</div>
        </NavigationMenuItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenuItem data-testid="test-item" aria-label="Test item" />)
      const item = screen.getByTestId('navigation-menu-item')
      expect(item).toHaveAttribute('aria-label', 'Test item')
    })
  })

  describe('NavigationMenuTrigger', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenuTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('navigation-menu-trigger')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<NavigationMenuTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('navigation-menu-trigger')
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders with custom className', () => {
      render(<NavigationMenuTrigger className="custom-class" data-testid="test-trigger" />)
      const trigger = screen.getByTestId('navigation-menu-trigger')
      expect(trigger).toHaveClass('custom-class')
    })

    it('applies navigationMenuTriggerStyle classes', () => {
      render(<NavigationMenuTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('navigation-menu-trigger')
      expect(trigger).toHaveClass('group', 'inline-flex', 'h-10', 'w-max', 'items-center', 'justify-center', 'rounded-md', 'bg-background', 'px-4', 'py-2', 'text-sm', 'font-medium', 'transition-colors')
    })

    it('renders chevron down icon', () => {
      render(<NavigationMenuTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    })

    it('applies chevron icon classes', () => {
      render(<NavigationMenuTrigger data-testid="test-trigger" />)
      const chevron = screen.getByTestId('chevron-down-icon')
      expect(chevron).toHaveClass('relative', 'top-[1px]', 'ml-1', 'h-3', 'w-3', 'transition', 'duration-200', 'group-data-[state=open]:rotate-180')
    })

    it('sets aria-hidden on chevron icon', () => {
      render(<NavigationMenuTrigger data-testid="test-trigger" />)
      const chevron = screen.getByTestId('chevron-down-icon')
      expect(chevron).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenuTrigger>
          <span data-testid="child">Trigger text</span>
        </NavigationMenuTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<NavigationMenuTrigger ref={ref} data-testid="test-trigger" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenuTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('navigation-menu-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('NavigationMenuContent', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenuContent data-testid="test-content" />)
      expect(screen.getByTestId('navigation-menu-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<NavigationMenuContent className="custom-class" data-testid="test-content" />)
      const content = screen.getByTestId('navigation-menu-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<NavigationMenuContent data-testid="test-content" />)
      const content = screen.getByTestId('navigation-menu-content')
      expect(content).toHaveClass('left-0', 'top-0', 'w-full', 'data-[motion^=from-]:animate-in', 'data-[motion^=to-]:animate-out', 'data-[motion^=from-]:fade-in', 'data-[motion^=to-]:fade-out', 'data-[motion=from-end]:slide-in-from-right-52', 'data-[motion=from-start]:slide-in-from-left-52', 'data-[motion=to-end]:slide-out-to-right-52', 'data-[motion=to-start]:slide-out-to-left-52', 'md:absolute', 'md:w-auto')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenuContent>
          <div data-testid="child">Content text</div>
        </NavigationMenuContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<NavigationMenuContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenuContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('navigation-menu-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })
  })

  describe('NavigationMenuLink', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenuLink data-testid="test-link" />)
      expect(screen.getByTestId('navigation-menu-link')).toBeInTheDocument()
    })

    it('renders as a element', () => {
      render(<NavigationMenuLink data-testid="test-link" />)
      const link = screen.getByTestId('navigation-menu-link')
      expect(link.tagName).toBe('A')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenuLink>
          <span data-testid="child">Link text</span>
        </NavigationMenuLink>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenuLink data-testid="test-link" href="/test" aria-label="Test link" />)
      const link = screen.getByTestId('navigation-menu-link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveAttribute('aria-label', 'Test link')
    })
  })

  describe('NavigationMenuViewport', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenuViewport data-testid="test-viewport" />)
      expect(screen.getByTestId('navigation-menu-viewport')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<NavigationMenuViewport className="custom-class" data-testid="test-viewport" />)
      const viewport = screen.getByTestId('navigation-menu-viewport')
      expect(viewport).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<NavigationMenuViewport data-testid="test-viewport" />)
      const viewport = screen.getByTestId('navigation-menu-viewport')
      expect(viewport).toHaveClass('origin-top-center', 'relative', 'mt-1.5', 'h-[var(--radix-navigation-menu-viewport-height)]', 'w-full', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'text-popover-foreground', 'shadow-lg', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-90', 'md:w-[var(--radix-navigation-menu-viewport-width)]')
    })

    it('applies wrapper classes', () => {
      render(<NavigationMenuViewport data-testid="test-viewport" />)
      const wrapper = screen.getByTestId('navigation-menu-viewport').parentElement
      expect(wrapper).toHaveClass('absolute', 'left-0', 'top-full', 'flex', 'justify-center')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenuViewport>
          <div data-testid="child">Viewport content</div>
        </NavigationMenuViewport>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<NavigationMenuViewport ref={ref} data-testid="test-viewport" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenuViewport data-testid="test-viewport" aria-label="Test viewport" />)
      const viewport = screen.getByTestId('navigation-menu-viewport')
      expect(viewport).toHaveAttribute('aria-label', 'Test viewport')
    })
  })

  describe('NavigationMenuIndicator', () => {
    it('renders correctly with default props', () => {
      render(<NavigationMenuIndicator data-testid="test-indicator" />)
      expect(screen.getByTestId('navigation-menu-indicator')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<NavigationMenuIndicator className="custom-class" data-testid="test-indicator" />)
      const indicator = screen.getByTestId('navigation-menu-indicator')
      expect(indicator).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<NavigationMenuIndicator data-testid="test-indicator" />)
      const indicator = screen.getByTestId('navigation-menu-indicator')
      expect(indicator).toHaveClass('top-full', 'z-[1]', 'flex', 'h-1.5', 'items-end', 'justify-center', 'overflow-hidden', 'data-[state=visible]:animate-in', 'data-[state=hidden]:animate-out', 'data-[state=hidden]:fade-out', 'data-[state=visible]:fade-in')
    })

    it('renders indicator arrow', () => {
      render(<NavigationMenuIndicator data-testid="test-indicator" />)
      const arrow = screen.getByTestId('navigation-menu-indicator').querySelector('.relative.top-\\[60%\\].h-2.w-2.rotate-45.rounded-tl-sm.bg-border.shadow-md')
      expect(arrow).toBeInTheDocument()
    })

    it('applies arrow classes', () => {
      render(<NavigationMenuIndicator data-testid="test-indicator" />)
      const arrow = screen.getByTestId('navigation-menu-indicator').querySelector('.relative.top-\\[60%\\].h-2.w-2.rotate-45.rounded-tl-sm.bg-border.shadow-md')
      expect(arrow).toHaveClass('relative', 'top-[60%]', 'h-2', 'w-2', 'rotate-45', 'rounded-tl-sm', 'bg-border', 'shadow-md')
    })

    it('renders children correctly', () => {
      render(
        <NavigationMenuIndicator>
          <div data-testid="child">Indicator content</div>
        </NavigationMenuIndicator>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<NavigationMenuIndicator ref={ref} data-testid="test-indicator" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<NavigationMenuIndicator data-testid="test-indicator" aria-label="Test indicator" />)
      const indicator = screen.getByTestId('navigation-menu-indicator')
      expect(indicator).toHaveAttribute('aria-label', 'Test indicator')
    })
  })

  describe('navigationMenuTriggerStyle', () => {
    it('returns a function', () => {
      expect(typeof navigationMenuTriggerStyle).toBe('function')
    })

    it('returns default classes when called without arguments', () => {
      const result = navigationMenuTriggerStyle()
      expect(result).toContain('group')
      expect(result).toContain('inline-flex')
      expect(result).toContain('h-10')
      expect(result).toContain('w-max')
      expect(result).toContain('items-center')
      expect(result).toContain('justify-center')
      expect(result).toContain('rounded-md')
      expect(result).toContain('bg-background')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('text-sm')
      expect(result).toContain('font-medium')
      expect(result).toContain('transition-colors')
      expect(result).toContain('hover:bg-accent')
      expect(result).toContain('hover:text-accent-foreground')
      expect(result).toContain('focus:bg-accent')
      expect(result).toContain('focus:text-accent-foreground')
      expect(result).toContain('focus:outline-none')
      expect(result).toContain('disabled:pointer-events-none')
      expect(result).toContain('disabled:opacity-50')
      expect(result).toContain('data-[active]:bg-accent/50')
      expect(result).toContain('data-[state=open]:bg-accent/50')
    })
  })

  describe('NavigationMenu Composition', () => {
    it('renders complete navigation menu structure', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Product content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      expect(screen.getByTestId('navigation-menu-root')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-menu-list')).toBeInTheDocument()
      expect(screen.getAllByTestId('navigation-menu-item')).toHaveLength(2)
      expect(screen.getByTestId('navigation-menu-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-menu-content')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-menu-link')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-menu-viewport')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList></NavigationMenuList>
        </NavigationMenu>
      )
      expect(screen.getByTestId('navigation-menu-root')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>{null}</NavigationMenuList>
        </NavigationMenu>
      )
      expect(screen.getByTestId('navigation-menu-root')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>{undefined}</NavigationMenuList>
        </NavigationMenu>
      )
      expect(screen.getByTestId('navigation-menu-root')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<NavigationMenu className="custom-navigation-class" data-testid="test-navigation-menu" />)
      const navigationMenu = screen.getByTestId('navigation-menu-root')
      expect(navigationMenu).toHaveClass('custom-navigation-class')
      expect(navigationMenu).toHaveClass('relative', 'z-10', 'flex')
    })

    it('handles multiple custom classes', () => {
      render(<NavigationMenu className="class1 class2 class3" data-testid="test-navigation-menu" />)
      const navigationMenu = screen.getByTestId('navigation-menu-root')
      expect(navigationMenu).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>Content</NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const navigationMenu = screen.getByTestId('navigation-menu-root')
      const list = screen.getByTestId('navigation-menu-list')
      expect(navigationMenu).toContainElement(list)
    })

    it('renders with complex navigation structure', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Product content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Service content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      expect(screen.getAllByTestId('navigation-menu-item')).toHaveLength(4)
      expect(screen.getAllByTestId('navigation-menu-trigger')).toHaveLength(2)
      expect(screen.getAllByTestId('navigation-menu-content')).toHaveLength(2)
      expect(screen.getAllByTestId('navigation-menu-link')).toHaveLength(2)
    })

    it('renders with navigation menu indicator', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Product content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>
      )

      expect(screen.getByTestId('navigation-menu-indicator')).toBeInTheDocument()
    })
  })
})