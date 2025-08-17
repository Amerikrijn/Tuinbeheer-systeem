import { render, screen } from '@testing-library/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

describe('Table Components', () => {
  describe('Table', () => {
    it('renders table element correctly', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <td>Table content</td>
            </tr>
          </tbody>
        </Table>
      )
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      expect(table.tagName).toBe('TABLE')
    })

    it('applies default classes', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </Table>
      )
      const table = screen.getByRole('table')
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm')
    })

    it('applies custom className', () => {
      render(
        <Table className="custom-table">
          <tbody>
            <tr>
              <td>Custom Table</td>
            </tr>
          </tbody>
        </Table>
      )
      const table = screen.getByRole('table')
      expect(table).toHaveClass('custom-table')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Table ref={ref}>
          <tbody>
            <tr>
              <td>Ref Test</td>
            </tr>
          </tbody>
        </Table>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('has correct display name', () => {
      expect(Table.displayName).toBe('Table')
    })
  })

  describe('TableHeader', () => {
    it('renders header correctly', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </Table>
      )
      const header = screen.getByText('Header')
      expect(header).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <th>Test</th>
            </tr>
          </TableHeader>
        </Table>
      )
      const header = screen.getByText('Test').closest('thead')
      expect(header).toHaveClass('[&_tr]:border-b')
    })

    it('has correct display name', () => {
      expect(TableHeader.displayName).toBe('TableHeader')
    })
  })

  describe('TableBody', () => {
    it('renders body correctly', () => {
      render(
        <Table>
          <TableBody>
            <tr>
              <td>Body content</td>
            </tr>
          </TableBody>
        </Table>
      )
      const body = screen.getByText('Body content')
      expect(body).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Table>
          <TableBody>
            <tr>
              <td>Test</td>
            </tr>
          </TableBody>
        </Table>
      )
      const body = screen.getByText('Test').closest('tbody')
      expect(body).toHaveClass('[&_tr:last-child]:border-0')
    })

    it('has correct display name', () => {
      expect(TableBody.displayName).toBe('TableBody')
    })
  })

  describe('TableFooter', () => {
    it('renders footer correctly', () => {
      render(
        <Table>
          <TableFooter>
            <tr>
              <td>Footer</td>
            </tr>
          </TableFooter>
        </Table>
      )
      const footer = screen.getByText('Footer')
      expect(footer).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Table>
          <TableFooter>
            <tr>
              <td>Test</td>
            </tr>
          </TableFooter>
        </Table>
      )
      const footer = screen.getByText('Test').closest('tfoot')
      expect(footer).toHaveClass('border-t', 'bg-muted/50', 'font-medium')
    })

    it('has correct display name', () => {
      expect(TableFooter.displayName).toBe('TableFooter')
    })
  })

  describe('TableRow', () => {
    it('renders row correctly', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <td>Row content</td>
            </tr>
          </TableBody>
        </Table>
      )
      const row = screen.getByText('Row content')
      expect(row).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <td>Test</td>
            </tr>
          </TableBody>
        </Table>
      )
      const row = screen.getByText('Test').closest('tr')
      expect(row).toHaveClass('border-b', 'transition-colors', 'hover:bg-muted/50')
    })

    it('has correct display name', () => {
      expect(TableRow.displayName).toBe('TableRow')
    })
  })

  describe('TableHead', () => {
    it('renders head correctly', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Header Cell</TableHead>
            </tr>
          </TableHeader>
        </Table>
      )
      const head = screen.getByText('Header Cell')
      expect(head).toBeInTheDocument()
      expect(head.tagName).toBe('TH')
    })

    it('applies default classes', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Test</TableHead>
            </tr>
          </TableHeader>
        </Table>
      )
      const head = screen.getByText('Test')
      expect(head).toHaveClass('h-12', 'px-4', 'text-left', 'align-middle', 'font-medium')
    })

    it('has correct display name', () => {
      expect(TableHead.displayName).toBe('TableHead')
    })
  })

  describe('TableCell', () => {
    it('renders cell correctly', () => {
      render(
        <Table>
          <TableBody>
            <tr>
              <TableCell>Cell content</TableCell>
            </tr>
          </TableBody>
        </Table>
      )
      const cell = screen.getByText('Cell content')
      expect(cell).toBeInTheDocument()
      expect(cell.tagName).toBe('TD')
    })

    it('applies default classes', () => {
      render(
        <Table>
          <TableBody>
            <tr>
              <TableCell>Test</TableCell>
            </tr>
          </TableBody>
        </Table>
      )
      const cell = screen.getByText('Test')
      expect(cell).toHaveClass('p-4', 'align-middle')
    })

    it('has correct display name', () => {
      expect(TableCell.displayName).toBe('TableCell')
    })
  })

  describe('TableCaption', () => {
    it('renders caption correctly', () => {
      render(
        <Table>
          <TableCaption>Table Caption</TableCaption>
          <TableBody>
            <tr>
              <td>Content</td>
            </tr>
          </TableBody>
        </Table>
      )
      const caption = screen.getByText('Table Caption')
      expect(caption).toBeInTheDocument()
      expect(caption.tagName).toBe('CAPTION')
    })

    it('applies default classes', () => {
      render(
        <Table>
          <TableCaption>Test</TableCaption>
          <TableBody>
            <tr>
              <td>Content</td>
            </tr>
          </TableBody>
        </Table>
      )
      const caption = screen.getByText('Test')
      expect(caption).toHaveClass('mt-4', 'text-sm', 'text-muted-foreground')
    })

    it('has correct display name', () => {
      expect(TableCaption.displayName).toBe('TableCaption')
    })
  })

  describe('Table composition', () => {
    it('renders complete table structure', () => {
      render(
        <Table>
          <TableCaption>Test Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total: 1</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      expect(screen.getByText('Test Table')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Total: 1')).toBeInTheDocument()
    })
  })
})