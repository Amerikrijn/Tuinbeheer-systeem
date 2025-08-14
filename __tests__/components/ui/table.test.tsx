import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from '@/components/ui/table'

describe('Table Components', () => {
  describe('Table', () => {
    it('renders correctly with default props', () => {
      render(<Table>Test Table</Table>)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Table className="custom-table">Test Table</Table>)
      const table = screen.getByRole('table')
      expect(table).toHaveClass('custom-table')
    })

    it('applies default classes', () => {
      render(<Table>Test Table</Table>)
      const table = screen.getByRole('table')
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm')
    })

    it('wraps table in scrollable container', () => {
      render(<Table>Test Table</Table>)
      const container = screen.getByRole('table').parentElement
      expect(container).toHaveClass('relative', 'w-full', 'overflow-auto')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableElement>()
      render(<Table ref={ref}>Test Table</Table>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('TABLE')
    })

    it('spreads additional props', () => {
      render(<Table data-testid="test-table" id="table-1">Test Table</Table>)
      const table = screen.getByTestId('test-table')
      expect(table).toHaveAttribute('id', 'table-1')
    })
  })

  describe('TableHeader', () => {
    it('renders correctly with default props', () => {
      render(<TableHeader>Test Header</TableHeader>)
      const header = screen.getByText('Test Header')
      expect(header).toBeInTheDocument()
      expect(header.tagName).toBe('THEAD')
    })

    it('renders with custom className', () => {
      render(<TableHeader className="custom-header">Test Header</TableHeader>)
      const header = screen.getByText('Test Header')
      expect(header).toHaveClass('custom-header')
    })

    it('applies default classes', () => {
      render(<TableHeader>Test Header</TableHeader>)
      const header = screen.getByText('Test Header')
      expect(header).toHaveClass('[&_tr]:border-b')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>()
      render(<TableHeader ref={ref}>Test Header</TableHeader>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('THEAD')
    })

    it('spreads additional props', () => {
      render(<TableHeader data-testid="test-header" id="header-1">Test Header</TableHeader>)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveAttribute('id', 'header-1')
    })
  })

  describe('TableBody', () => {
    it('renders correctly with default props', () => {
      render(<TableBody>Test Body</TableBody>)
      const body = screen.getByText('Test Body')
      expect(body).toBeInTheDocument()
      expect(body.tagName).toBe('TBODY')
    })

    it('renders with custom className', () => {
      render(<TableBody className="custom-body">Test Body</TableBody>)
      const body = screen.getByText('Test Body')
      expect(body).toHaveClass('custom-body')
    })

    it('applies default classes', () => {
      render(<TableBody>Test Body</TableBody>)
      const body = screen.getByText('Test Body')
      expect(body).toHaveClass('[&_tr:last-child]:border-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>()
      render(<TableBody ref={ref}>Test Body</TableBody>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('TBODY')
    })

    it('spreads additional props', () => {
      render(<TableBody data-testid="test-body" id="body-1">Test Body</TableBody>)
      const body = screen.getByTestId('test-body')
      expect(body).toHaveAttribute('id', 'body-1')
    })
  })

  describe('TableFooter', () => {
    it('renders correctly with default props', () => {
      render(<TableFooter>Test Footer</TableFooter>)
      const footer = screen.getByText('Test Footer')
      expect(footer).toBeInTheDocument()
      expect(footer.tagName).toBe('TFOOT')
    })

    it('renders with custom className', () => {
      render(<TableFooter className="custom-footer">Test Footer</TableFooter>)
      const footer = screen.getByText('Test Footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('applies default classes', () => {
      render(<TableFooter>Test Footer</TableFooter>)
      const footer = screen.getByText('Test Footer')
      expect(footer).toHaveClass('border-t', 'bg-muted/50', 'font-medium', '[&>tr]:last:border-b-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>()
      render(<TableFooter ref={ref}>Test Footer</TableFooter>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('TFOOT')
    })

    it('spreads additional props', () => {
      render(<TableFooter data-testid="test-footer" id="footer-1">Test Footer</TableFooter>)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveAttribute('id', 'footer-1')
    })
  })

  describe('TableRow', () => {
    it('renders correctly with default props', () => {
      render(<TableRow>Test Row</TableRow>)
      const row = screen.getByText('Test Row')
      expect(row).toBeInTheDocument()
      expect(row.tagName).toBe('TR')
    })

    it('renders with custom className', () => {
      render(<TableRow className="custom-row">Test Row</TableRow>)
      const row = screen.getByText('Test Row')
      expect(row).toHaveClass('custom-row')
    })

    it('applies default classes', () => {
      render(<TableRow>Test Row</TableRow>)
      const row = screen.getByText('Test Row')
      expect(row).toHaveClass('border-b', 'transition-colors', 'hover:bg-muted/50', 'data-[state=selected]:bg-muted')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableRowElement>()
      render(<TableRow ref={ref}>Test Row</TableRow>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('TR')
    })

    it('spreads additional props', () => {
      render(<TableRow data-testid="test-row" id="row-1">Test Row</TableRow>)
      const row = screen.getByTestId('test-row')
      expect(row).toHaveAttribute('id', 'row-1')
    })
  })

  describe('TableHead', () => {
    it('renders correctly with default props', () => {
      render(<TableHead>Test Head</TableHead>)
      const head = screen.getByText('Test Head')
      expect(head).toBeInTheDocument()
      expect(head.tagName).toBe('TH')
    })

    it('renders with custom className', () => {
      render(<TableHead className="custom-head">Test Head</TableHead>)
      const head = screen.getByText('Test Head')
      expect(head).toHaveClass('custom-head')
    })

    it('applies default classes', () => {
      render(<TableHead>Test Head</TableHead>)
      const head = screen.getByText('Test Head')
      expect(head).toHaveClass('h-12', 'px-4', 'text-left', 'align-middle', 'font-medium', 'text-muted-foreground', '[&:has([role=checkbox])]:pr-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableCellElement>()
      render(<TableHead ref={ref}>Test Head</TableHead>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('TH')
    })

    it('spreads additional props', () => {
      render(<TableHead data-testid="test-head" id="head-1">Test Head</TableHead>)
      const head = screen.getByTestId('test-head')
      expect(head).toHaveAttribute('id', 'head-1')
    })
  })

  describe('TableCell', () => {
    it('renders correctly with default props', () => {
      render(<TableCell>Test Cell</TableCell>)
      const cell = screen.getByText('Test Cell')
      expect(cell).toBeInTheDocument()
      expect(cell.tagName).toBe('TD')
    })

    it('renders with custom className', () => {
      render(<TableCell className="custom-cell">Test Cell</TableCell>)
      const cell = screen.getByText('Test Cell')
      expect(cell).toHaveClass('custom-cell')
    })

    it('applies default classes', () => {
      render(<TableCell>Test Cell</TableCell>)
      const cell = screen.getByText('Test Cell')
      expect(cell).toHaveClass('p-4', 'align-middle', '[&:has([role=checkbox])]:pr-0')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableCellElement>()
      render(<TableCell ref={ref}>Test Cell</TableCell>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('TD')
    })

    it('spreads additional props', () => {
      render(<TableCell data-testid="test-cell" id="cell-1">Test Cell</TableCell>)
      const cell = screen.getByTestId('test-cell')
      expect(cell).toHaveAttribute('id', 'cell-1')
    })
  })

  describe('TableCaption', () => {
    it('renders correctly with default props', () => {
      render(<TableCaption>Test Caption</TableCaption>)
      const caption = screen.getByText('Test Caption')
      expect(caption).toBeInTheDocument()
      expect(caption.tagName).toBe('CAPTION')
    })

    it('renders with custom className', () => {
      render(<TableCaption className="custom-caption">Test Caption</TableCaption>)
      const caption = screen.getByText('Test Caption')
      expect(caption).toHaveClass('custom-caption')
    })

    it('applies default classes', () => {
      render(<TableCaption>Test Caption</TableCaption>)
      const caption = screen.getByText('Test Caption')
      expect(caption).toHaveClass('mt-4', 'text-sm', 'text-muted-foreground')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableCaptionElement>()
      render(<TableCaption ref={ref}>Test Caption</TableCaption>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('CAPTION')
    })

    it('spreads additional props', () => {
      render(<TableCaption data-testid="test-caption" id="caption-1">Test Caption</TableCaption>)
      const caption = screen.getByTestId('test-caption')
      expect(caption).toHaveAttribute('id', 'caption-1')
    })
  })

  describe('Table Composition', () => {
    it('renders complete table structure', () => {
      render(
        <Table>
          <TableCaption>Sample Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>25</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>1</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Sample Table')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Age')).toBeInTheDocument()
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(<Table />)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<Table>{null}</Table>)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Table>{undefined}</Table>)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<Table className="extra-class">Test Table</Table>)
      const table = screen.getByRole('table')
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm', 'extra-class')
    })

    it('handles multiple custom classes', () => {
      render(<TableRow className="class1 class2 class3">Test Row</TableRow>)
      const row = screen.getByText('Test Row')
      expect(row).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper HTML structure', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      const table = screen.getByRole('table')
      const thead = table.querySelector('thead')
      const tr = thead?.querySelector('tr')
      const th = tr?.querySelector('th')

      expect(thead).toBeInTheDocument()
      expect(tr).toBeInTheDocument()
      expect(th).toBeInTheDocument()
      expect(th).toHaveTextContent('Header')
    })
  })
})