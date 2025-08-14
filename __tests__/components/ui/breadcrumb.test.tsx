import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator, 
  BreadcrumbEllipsis 
} from '@/components/ui/breadcrumb'

// Mock Radix UI components
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div data-testid="slot" {...props}>{children}</div>
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronRight: ({ className }: any) => <svg data-testid="chevron-right" className={className} />,
  MoreHorizontal: ({ className }: any) => <svg data-testid="more-horizontal" className={className} />
}))

describe('Breadcrumb Components', () => {
  describe('Breadcrumb', () => {
    it('renders correctly with default props', () => {
      render(<Breadcrumb data-testid="test-breadcrumb" />)
      expect(screen.getByTestId('test-breadcrumb')).toBeInTheDocument()
    })

    it('renders as nav element', () => {
      render(<Breadcrumb data-testid="test-breadcrumb" />)
      const breadcrumb = screen.getByTestId('test-breadcrumb')
      expect(breadcrumb.tagName).toBe('NAV')
    })

    it('has correct aria-label', () => {
      render(<Breadcrumb data-testid="test-breadcrumb" />)
      const breadcrumb = screen.getByTestId('test-breadcrumb')
      expect(breadcrumb).toHaveAttribute('aria-label', 'breadcrumb')
    })

    it('renders children correctly', () => {
      render(
        <Breadcrumb>
          <div data-testid="child">Child content</div>
        </Breadcrumb>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLElement>()
      render(<Breadcrumb ref={ref} data-testid="test-breadcrumb" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Breadcrumb data-testid="test-breadcrumb" aria-label="Custom breadcrumb" />)
      const breadcrumb = screen.getByTestId('test-breadcrumb')
      expect(breadcrumb).toHaveAttribute('aria-label', 'Custom breadcrumb')
    })
  })

  describe('BreadcrumbList', () => {
    it('renders correctly with default props', () => {
      render(<BreadcrumbList data-testid="test-list" />)
      expect(screen.getByTestId('test-list')).toBeInTheDocument()
    })

    it('renders as ol element', () => {
      render(<BreadcrumbList data-testid="test-list" />)
      const list = screen.getByTestId('test-list')
      expect(list.tagName).toBe('OL')
    })

    it('renders with custom className', () => {
      render(<BreadcrumbList className="custom-class" data-testid="test-list" />)
      const list = screen.getByTestId('test-list')
      expect(list).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<BreadcrumbList data-testid="test-list" />)
      const list = screen.getByTestId('test-list')
      expect(list).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-1.5', 'break-words', 'text-sm', 'text-muted-foreground', 'sm:gap-2.5')
    })

    it('renders children correctly', () => {
      render(
        <BreadcrumbList>
          <li data-testid="child">Child item</li>
        </BreadcrumbList>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLOListElement>()
      render(<BreadcrumbList ref={ref} data-testid="test-list" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<BreadcrumbList data-testid="test-list" aria-label="Test list" />)
      const list = screen.getByTestId('test-list')
      expect(list).toHaveAttribute('aria-label', 'Test list')
    })
  })

  describe('BreadcrumbItem', () => {
    it('renders correctly with default props', () => {
      render(<BreadcrumbItem data-testid="test-item" />)
      expect(screen.getByTestId('test-item')).toBeInTheDocument()
    })

    it('renders as li element', () => {
      render(<BreadcrumbItem data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item.tagName).toBe('LI')
    })

    it('renders with custom className', () => {
      render(<BreadcrumbItem className="custom-class" data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<BreadcrumbItem data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('inline-flex', 'items-center', 'gap-1.5')
    })

    it('renders children correctly', () => {
      render(
        <BreadcrumbItem>
          <span data-testid="child">Item content</span>
        </BreadcrumbItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLIElement>()
      render(<BreadcrumbItem ref={ref} data-testid="test-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<BreadcrumbItem data-testid="test-item" aria-label="Test item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveAttribute('aria-label', 'Test item')
    })
  })

  describe('BreadcrumbLink', () => {
    it('renders correctly with default props', () => {
      render(<BreadcrumbLink data-testid="test-link" />)
      expect(screen.getByTestId('test-link')).toBeInTheDocument()
    })

    it('renders as anchor element by default', () => {
      render(<BreadcrumbLink data-testid="test-link" />)
      const link = screen.getByTestId('test-link')
      expect(link.tagName).toBe('A')
    })

    it('renders with custom className', () => {
      render(<BreadcrumbLink className="custom-class" data-testid="test-link" />)
      const link = screen.getByTestId('test-link')
      expect(link).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<BreadcrumbLink data-testid="test-link" />)
      const link = screen.getByTestId('test-link')
      expect(link).toHaveClass('transition-colors', 'hover:text-foreground')
    })

    it('renders children correctly', () => {
      render(
        <BreadcrumbLink>
          <span data-testid="child">Link text</span>
        </BreadcrumbLink>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLAnchorElement>()
      render(<BreadcrumbLink ref={ref} data-testid="test-link" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<BreadcrumbLink data-testid="test-link" href="/test" aria-label="Test link" />)
      const link = screen.getByTestId('test-link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveAttribute('aria-label', 'Test link')
    })

    it('renders as Slot when asChild is true', () => {
      render(
        <BreadcrumbLink asChild>
          <button data-testid="custom-button">Custom button</button>
        </BreadcrumbLink>
      )
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })

  describe('BreadcrumbPage', () => {
    it('renders correctly with default props', () => {
      render(<BreadcrumbPage data-testid="test-page" />)
      expect(screen.getByTestId('test-page')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      render(<BreadcrumbPage data-testid="test-page" />)
      const page = screen.getByTestId('test-page')
      expect(page.tagName).toBe('SPAN')
    })

    it('renders with custom className', () => {
      render(<BreadcrumbPage className="custom-class" data-testid="test-page" />)
      const page = screen.getByTestId('test-page')
      expect(page).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<BreadcrumbPage data-testid="test-page" />)
      const page = screen.getByTestId('test-page')
      expect(page).toHaveClass('font-normal', 'text-foreground')
    })

    it('has correct role and aria attributes', () => {
      render(<BreadcrumbPage data-testid="test-page" />)
      const page = screen.getByTestId('test-page')
      expect(page).toHaveAttribute('role', 'link')
      expect(page).toHaveAttribute('aria-disabled', 'true')
      expect(page).toHaveAttribute('aria-current', 'page')
    })

    it('renders children correctly', () => {
      render(
        <BreadcrumbPage>
          <span data-testid="child">Page text</span>
        </BreadcrumbPage>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSpanElement>()
      render(<BreadcrumbPage ref={ref} data-testid="test-page" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<BreadcrumbPage data-testid="test-page" aria-label="Test page" />)
      const page = screen.getByTestId('test-page')
      expect(page).toHaveAttribute('aria-label', 'Test page')
    })
  })

  describe('BreadcrumbSeparator', () => {
    it('renders correctly with default props', () => {
      render(<BreadcrumbSeparator data-testid="test-separator" />)
      expect(screen.getByTestId('test-separator')).toBeInTheDocument()
    })

    it('renders as li element', () => {
      render(<BreadcrumbSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator.tagName).toBe('LI')
    })

    it('renders with custom className', () => {
      render(<BreadcrumbSeparator className="custom-class" data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<BreadcrumbSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveClass('[&>svg]:w-3.5', '[&>svg]:h-3.5')
    })

    it('has correct role and aria attributes', () => {
      render(<BreadcrumbSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveAttribute('role', 'presentation')
      expect(separator).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders default ChevronRight icon', () => {
      render(<BreadcrumbSeparator data-testid="test-separator" />)
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(
        <BreadcrumbSeparator>
          <span data-testid="custom-separator">/</span>
        </BreadcrumbSeparator>
      )
      expect(screen.getByTestId('custom-separator')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<BreadcrumbSeparator data-testid="test-separator" aria-label="Test separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveAttribute('aria-label', 'Test separator')
    })
  })

  describe('BreadcrumbEllipsis', () => {
    it('renders correctly with default props', () => {
      render(<BreadcrumbEllipsis data-testid="test-ellipsis" />)
      expect(screen.getByTestId('test-ellipsis')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      render(<BreadcrumbEllipsis data-testid="test-ellipsis" />)
      const ellipsis = screen.getByTestId('test-ellipsis')
      expect(ellipsis.tagName).toBe('SPAN')
    })

    it('renders with custom className', () => {
      render(<BreadcrumbEllipsis className="custom-class" data-testid="test-ellipsis" />)
      const ellipsis = screen.getByTestId('test-ellipsis')
      expect(ellipsis).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<BreadcrumbEllipsis data-testid="test-ellipsis" />)
      const ellipsis = screen.getByTestId('test-ellipsis')
      expect(ellipsis).toHaveClass('flex', 'h-9', 'w-9', 'items-center', 'justify-center')
    })

    it('has correct role and aria attributes', () => {
      render(<BreadcrumbEllipsis data-testid="test-ellipsis" />)
      const ellipsis = screen.getByTestId('test-ellipsis')
      expect(ellipsis).toHaveAttribute('role', 'presentation')
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders MoreHorizontal icon', () => {
      render(<BreadcrumbEllipsis data-testid="test-ellipsis" />)
      expect(screen.getByTestId('more-horizontal')).toBeInTheDocument()
    })

    it('renders screen reader text', () => {
      render(<BreadcrumbEllipsis data-testid="test-ellipsis" />)
      expect(screen.getByText('More')).toBeInTheDocument()
      expect(screen.getByText('More')).toHaveClass('sr-only')
    })

    it('spreads additional props', () => {
      render(<BreadcrumbEllipsis data-testid="test-ellipsis" aria-label="Test ellipsis" />)
      const ellipsis = screen.getByTestId('test-ellipsis')
      expect(ellipsis).toHaveAttribute('aria-label', 'Test ellipsis')
    })
  })

  describe('Breadcrumb Composition', () => {
    it('renders complete breadcrumb structure', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Current Page')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>{null}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>{undefined}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<BreadcrumbList className="custom-list-class" data-testid="test-list" />)
      const list = screen.getByTestId('test-list')
      expect(list).toHaveClass('custom-list-class')
      expect(list).toHaveClass('flex', 'flex-wrap', 'items-center')
    })

    it('handles multiple custom classes', () => {
      render(<BreadcrumbList className="class1 class2 class3" data-testid="test-list" />)
      const list = screen.getByTestId('test-list')
      expect(list).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains accessibility roles', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })
})