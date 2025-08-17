import { render, screen } from '@testing-library/react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

describe('Pagination Components', () => {
  describe('Pagination', () => {
    it('renders pagination element correctly', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>1</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
      expect(pagination.tagName).toBe('NAV')
    })

    it('applies default classes', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>Test</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const pagination = screen.getByRole('navigation')
      expect(pagination).toHaveClass('mx-auto', 'flex', 'w-full', 'justify-center')
    })

    it('applies custom className', () => {
      render(
        <Pagination className="custom-pagination">
          <PaginationContent>
            <PaginationItem>Custom Pagination</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const pagination = screen.getByRole('navigation')
      expect(pagination).toHaveClass('custom-pagination')
    })

    it('has correct aria-label', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>Test</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const pagination = screen.getByRole('navigation')
      expect(pagination).toHaveAttribute('aria-label', 'pagination')
    })

    it('has correct display name', () => {
      expect(Pagination.displayName).toBe('Pagination')
    })
  })

  describe('PaginationContent', () => {
    it('renders content correctly', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>Content</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const content = screen.getByText('Content').closest('ul')
      expect(content).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>Test</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const content = screen.getByText('Test').closest('ul')
      expect(content).toHaveClass('flex', 'flex-row', 'items-center', 'gap-1')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Pagination>
          <PaginationContent ref={ref}>
            <PaginationItem>Ref Test</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(PaginationContent.displayName).toBe('PaginationContent')
    })
  })

  describe('PaginationItem', () => {
    it('renders item correctly', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>Item</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const item = screen.getByText('Item')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('LI')
    })

    it('applies custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem className="custom-item">Custom Item</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const item = screen.getByText('Custom Item')
      expect(item).toHaveClass('custom-item')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem ref={ref}>Ref Test</PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(PaginationItem.displayName).toBe('PaginationItem')
    })
  })

  describe('PaginationLink', () => {
    it('renders link correctly', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const link = screen.getByText('1')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('applies active state classes', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" isActive>1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const link = screen.getByText('1')
      expect(link).toHaveAttribute('aria-current', 'page')
    })

    it('applies custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" className="custom-link">Custom Link</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const link = screen.getByText('Custom Link')
      expect(link).toHaveClass('custom-link')
    })

    it('has correct display name', () => {
      expect(PaginationLink.displayName).toBe('PaginationLink')
    })
  })

  describe('PaginationPrevious', () => {
    it('renders previous button correctly', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const previous = screen.getByText('Previous')
      expect(previous).toBeInTheDocument()
      expect(previous.tagName).toBe('A')
    })

    it('applies default classes', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const previous = screen.getByText('Previous')
      expect(previous).toHaveClass('gap-1', 'pl-2.5')
    })

    it('applies custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" className="custom-previous" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const previous = screen.getByText('Previous')
      expect(previous).toHaveClass('custom-previous')
    })

    it('has correct aria-label', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const previous = screen.getByText('Previous')
      expect(previous).toHaveAttribute('aria-label', 'Go to previous page')
    })

    it('renders chevron icon', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const chevron = screen.getByText('Previous').querySelector('svg')
      expect(chevron).toBeInTheDocument()
    })

    it('has correct display name', () => {
      expect(PaginationPrevious.displayName).toBe('PaginationPrevious')
    })
  })

  describe('PaginationNext', () => {
    it('renders next button correctly', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const next = screen.getByText('Next')
      expect(next).toBeInTheDocument()
      expect(next.tagName).toBe('A')
    })

    it('applies default classes', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const next = screen.getByText('Next')
      expect(next).toHaveClass('gap-1', 'pr-2.5')
    })

    it('applies custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" className="custom-next" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const next = screen.getByText('Next')
      expect(next).toHaveClass('custom-next')
    })

    it('has correct aria-label', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const next = screen.getByText('Next')
      expect(next).toHaveAttribute('aria-label', 'Go to next page')
    })

    it('renders chevron icon', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const chevron = screen.getByText('Next').querySelector('svg')
      expect(chevron).toBeInTheDocument()
    })

    it('has correct display name', () => {
      expect(PaginationNext.displayName).toBe('PaginationNext')
    })
  })

  describe('PaginationEllipsis', () => {
    it('renders ellipsis correctly', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const ellipsis = screen.getByText('More pages')
      expect(ellipsis).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const ellipsis = screen.getByText('More pages').closest('span')
      expect(ellipsis).toHaveClass('flex', 'h-9', 'w-9', 'items-center', 'justify-center')
    })

    it('applies custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis className="custom-ellipsis" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const ellipsis = screen.getByText('More pages').closest('span')
      expect(ellipsis).toHaveClass('custom-ellipsis')
    })

    it('has correct aria-hidden attribute', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const ellipsis = screen.getByText('More pages').closest('span')
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders more horizontal icon', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
      const icon = screen.getByText('More pages').closest('span')?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('has correct display name', () => {
      expect(PaginationEllipsis.displayName).toBe('PaginationEllipsis')
    })
  })

  describe('Pagination composition', () => {
    it('renders complete pagination structure', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/10">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="/page/11" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('More pages')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })
})