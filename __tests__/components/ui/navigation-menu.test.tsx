import { render, screen } from '@testing-library/react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

describe('Navigation Menu Components', () => {
  describe('NavigationMenu', () => {
    it('renders navigation menu correctly', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const menu = screen.getByText('Menu')
      expect(menu).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Test</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const menu = screen.getByText('Test').closest('[role="navigation"]')
      expect(menu).toHaveClass('relative', 'z-10', 'flex', 'max-w-max', 'flex-1', 'items-center', 'justify-center')
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu className="custom-menu">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Custom Menu</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const menu = screen.getByText('Custom Menu').closest('[role="navigation"]')
      expect(menu).toHaveClass('custom-menu')
    })

    it('has correct display name', () => {
      expect(NavigationMenu.displayName).toBe('Root')
    })
  })

  describe('NavigationMenuList', () => {
    it('renders list correctly', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>List Item</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const list = screen.getByText('List Item').closest('ul')
      expect(list).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Test</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const list = screen.getByText('Test').closest('ul')
      expect(list).toHaveClass('group', 'flex', 'flex-1', 'list-none', 'items-center', 'justify-center', 'space-x-1')
    })

    it('has correct display name', () => {
      expect(NavigationMenuList.displayName).toBe('List')
    })
  })

  describe('NavigationMenuTrigger', () => {
    it('renders trigger correctly', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const trigger = screen.getByText('Trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('applies trigger style classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Test</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const trigger = screen.getByText('Test')
      expect(trigger).toHaveClass('group', 'inline-flex', 'h-10', 'w-max', 'items-center', 'justify-center')
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="custom-trigger">Custom Trigger</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const trigger = screen.getByText('Custom Trigger')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('renders chevron icon', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Test</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const chevron = screen.getByText('Test').querySelector('svg')
      expect(chevron).toBeInTheDocument()
    })

    it('has correct display name', () => {
      expect(NavigationMenuTrigger.displayName).toBe('Trigger')
    })
  })

  describe('NavigationMenuContent', () => {
    it('renders content correctly', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const content = screen.getByText('Content')
      expect(content).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Test</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const content = screen.getByText('Test').closest('[data-radix-navigation-menu-content]')
      expect(content).toHaveClass('left-0', 'top-0', 'w-full')
    })

    it('has correct display name', () => {
      expect(NavigationMenuContent.displayName).toBe('Content')
    })
  })

  describe('NavigationMenuIndicator', () => {
    it('renders indicator correctly', () => {
      render(
        <NavigationMenu>
          <NavigationMenuIndicator />
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const indicator = screen.getByRole('presentation')
      expect(indicator).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuIndicator />
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Test</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const indicator = screen.getByRole('presentation')
      expect(indicator).toHaveClass('top-full', 'z-[1]', 'flex', 'h-1.5', 'items-end', 'justify-center')
    })

    it('has correct display name', () => {
      expect(NavigationMenuIndicator.displayName).toBe('Indicator')
    })
  })

  describe('NavigationMenuViewport', () => {
    it('renders viewport correctly', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const viewport = screen.getByRole('presentation')
      expect(viewport).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Test</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const viewport = screen.getByRole('presentation')
      expect(viewport).toHaveClass('absolute', 'left-0', 'top-full', 'flex', 'justify-center')
    })

    it('has correct display name', () => {
      expect(NavigationMenuViewport.displayName).toBe('Viewport')
    })
  })

  describe('navigationMenuTriggerStyle', () => {
    it('returns trigger style classes', () => {
      const styles = navigationMenuTriggerStyle()
      expect(styles).toContain('group')
      expect(styles).toContain('inline-flex')
      expect(styles).toContain('h-10')
      expect(styles).toContain('w-max')
    })
  })

  describe('Navigation Menu composition', () => {
    it('renders complete navigation menu structure', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Product List</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>
      )

      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Product List')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByRole('presentation')).toBeInTheDocument()
    })
  })
})