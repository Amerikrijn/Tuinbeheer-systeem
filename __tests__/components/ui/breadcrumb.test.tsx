import { render, screen } from '@testing-library/react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'

describe('Breadcrumb Components', () => {
  describe('Breadcrumb', () => {
    it('renders breadcrumb element correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const breadcrumb = screen.getByRole('navigation')
      expect(breadcrumb).toBeInTheDocument()
      expect(breadcrumb.tagName).toBe('NAV')
    })

    it('applies custom separator', () => {
      render(
        <Breadcrumb separator=">">
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbSeparator>Home</BreadcrumbSeparator>
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const breadcrumb = screen.getByRole('navigation')
      expect(breadcrumb).toBeInTheDocument()
    })

    it('has correct aria-label', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Test</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const breadcrumb = screen.getByRole('navigation')
      expect(breadcrumb).toHaveAttribute('aria-label', 'breadcrumb')
    })

    it('has correct display name', () => {
      expect(Breadcrumb.displayName).toBe('Breadcrumb')
    })
  })

  describe('BreadcrumbList', () => {
    it('renders list correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>List Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const list = screen.getByText('List Item').closest('ol')
      expect(list).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Test</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const list = screen.getByText('Test').closest('ol')
      expect(list).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-1.5', 'break-words', 'text-sm')
    })

    it('applies custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList className="custom-list">
            <BreadcrumbItem>Custom List</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const list = screen.getByText('Custom List').closest('ol')
      expect(list).toHaveClass('custom-list')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Breadcrumb>
          <BreadcrumbList ref={ref}>
            <BreadcrumbItem>Ref Test</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(BreadcrumbList.displayName).toBe('BreadcrumbList')
    })
  })

  describe('BreadcrumbItem', () => {
    it('renders item correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const item = screen.getByText('Item')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('LI')
    })

    it('applies default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Test</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const item = screen.getByText('Test')
      expect(item).toHaveClass('inline-flex', 'items-center', 'gap-1.5')
    })

    it('applies custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="custom-item">Custom Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const item = screen.getByText('Custom Item')
      expect(item).toHaveClass('custom-item')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem ref={ref}>Ref Test</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(BreadcrumbItem.displayName).toBe('BreadcrumbItem')
    })
  })

  describe('BreadcrumbLink', () => {
    it('renders link correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const link = screen.getByText('Home')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('applies default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/test">Test</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const link = screen.getByText('Test')
      expect(link).toHaveClass('transition-colors', 'hover:text-foreground')
    })

    it('applies custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/custom" className="custom-link">Custom Link</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const link = screen.getByText('Custom Link')
      expect(link).toHaveClass('custom-link')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/ref" ref={ref}>Ref Test</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(BreadcrumbLink.displayName).toBe('BreadcrumbLink')
    })
  })

  describe('BreadcrumbPage', () => {
    it('renders page correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const page = screen.getByText('Current Page')
      expect(page).toBeInTheDocument()
      expect(page.tagName).toBe('SPAN')
    })

    it('applies default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Test</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const page = screen.getByText('Test')
      expect(page).toHaveClass('font-normal', 'text-foreground')
    })

    it('applies custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="custom-page">Custom Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const page = screen.getByText('Custom Page')
      expect(page).toHaveClass('custom-page')
    })

    it('has correct attributes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Test</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const page = screen.getByText('Test')
      expect(page).toHaveAttribute('role', 'link')
      expect(page).toHaveAttribute('aria-disabled', 'true')
      expect(page).toHaveAttribute('aria-current', 'page')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage ref={ref}>Ref Test</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(BreadcrumbPage.displayName).toBe('BreadcrumbPage')
    })
  })

  describe('BreadcrumbSeparator', () => {
    it('renders separator correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const separator = screen.getByRole('presentation')
      expect(separator).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const separator = screen.getByRole('presentation')
      expect(separator).toHaveClass('[&>svg]:w-3.5', '[&>svg]:h-3.5')
    })

    it('applies custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbSeparator className="custom-separator" />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const separator = screen.getByRole('presentation')
      expect(separator).toHaveClass('custom-separator')
    })

    it('has correct attributes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const separator = screen.getByRole('presentation')
      expect(separator).toHaveAttribute('role', 'presentation')
      expect(separator).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders default chevron icon', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const separator = screen.getByRole('presentation')
      const icon = separator.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders custom separator', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbSeparator>→</BreadcrumbSeparator>
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const separator = screen.getByText('→')
      expect(separator).toBeInTheDocument()
    })

    it('has correct display name', () => {
      expect(BreadcrumbSeparator.displayName).toBe('BreadcrumbSeparator')
    })
  })

  describe('BreadcrumbEllipsis', () => {
    it('renders ellipsis correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbEllipsis />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const ellipsis = screen.getByText('More')
      expect(ellipsis).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbEllipsis />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const ellipsis = screen.getByText('More').closest('span')
      expect(ellipsis).toHaveClass('flex', 'h-9', 'w-9', 'items-center', 'justify-center')
    })

    it('applies custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbEllipsis className="custom-ellipsis" />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const ellipsis = screen.getByText('More').closest('span')
      expect(ellipsis).toHaveClass('custom-ellipsis')
    })

    it('has correct attributes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbEllipsis />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const ellipsis = screen.getByText('More').closest('span')
      expect(ellipsis).toHaveAttribute('role', 'presentation')
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders more horizontal icon', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbEllipsis />
            <BreadcrumbItem>About</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      const ellipsis = screen.getByText('More').closest('span')
      const icon = ellipsis?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('has correct display name', () => {
      expect(BreadcrumbEllipsis.displayName).toBe('BreadcrumbElipssis')
    })
  })

  describe('Breadcrumb composition', () => {
    it('renders complete breadcrumb structure', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Current Product')).toBeInTheDocument()
      expect(screen.getAllByRole('presentation')).toHaveLength(2)
    })
  })
})