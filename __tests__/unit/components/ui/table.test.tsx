import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from '@/components/ui/table';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('Table Components', () => {
  describe('Table', () => {
    it('should render with default props', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <td>Table content</td>
            </tr>
          </tbody>
        </Table>
      );
      const table = screen.getByRole('table');
      const wrapper = table.parentElement;
      
      expect(table).toBeInTheDocument();
      expect(wrapper).toHaveClass('relative', 'w-full', 'overflow-auto');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
      expect(screen.getByText('Table content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <Table className="custom-table">
          <tbody>
            <tr>
              <td>Custom table</td>
            </tr>
          </tbody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toHaveClass('custom-table');
    });

    it('should pass through additional props', () => {
      render(
        <Table
          data-testid="custom-table"
          aria-label="Custom table"
          summary="Table summary"
        >
          <tbody>
            <tr>
              <td>Props test</td>
            </tr>
          </tbody>
        </Table>
      );
      const table = screen.getByTestId('custom-table');
      expect(table).toHaveAttribute('aria-label', 'Custom table');
      expect(table).toHaveAttribute('summary', 'Table summary');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableElement>();
      render(
        <Table ref={ref}>
          <tbody>
            <tr>
              <td>Ref test</td>
            </tr>
          </tbody>
        </Table>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('TableHeader', () => {
    it('should render with default props', () => {
      render(
        <TableHeader>
          <tr>
            <th>Header content</th>
          </tr>
        </TableHeader>
      );
      const thead = screen.getByRole('rowgroup');
      expect(thead).toBeInTheDocument();
      expect(thead.tagName).toBe('THEAD');
      expect(thead).toHaveClass('[&_tr]:border-b');
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <TableHeader className="custom-header">
          <tr>
            <th>Custom header</th>
          </tr>
        </TableHeader>
      );
      const thead = screen.getByRole('rowgroup');
      expect(thead).toHaveClass('custom-header');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <TableHeader ref={ref}>
          <tr>
            <th>Ref test</th>
          </tr>
        </TableHeader>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('TableBody', () => {
    it('should render with default props', () => {
      render(
        <TableBody>
          <tr>
            <td>Body content</td>
          </tr>
        </TableBody>
      );
      const tbody = screen.getByRole('rowgroup');
      expect(tbody).toBeInTheDocument();
      expect(tbody.tagName).toBe('TBODY');
      expect(tbody).toHaveClass('[&_tr:last-child]:border-0');
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <TableBody className="custom-body">
          <tr>
            <td>Custom body</td>
          </tr>
        </TableBody>
      );
      const tbody = screen.getByRole('rowgroup');
      expect(tbody).toHaveClass('custom-body');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <TableBody ref={ref}>
          <tr>
            <td>Ref test</td>
          </tr>
        </TableBody>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('TableFooter', () => {
    it('should render with default props', () => {
      render(
        <TableFooter>
          <tr>
            <td>Footer content</td>
          </tr>
        </TableFooter>
      );
      const tfoot = screen.getByRole('rowgroup');
      expect(tfoot).toBeInTheDocument();
      expect(tfoot.tagName).toBe('TFOOT');
      expect(tfoot).toHaveClass('border-t', 'bg-muted/50', 'font-medium', '[&>tr]:last:border-b-0');
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <TableFooter className="custom-footer">
          <tr>
            <td>Custom footer</td>
          </tr>
        </TableFooter>
      );
      const tfoot = screen.getByRole('rowgroup');
      expect(tfoot).toHaveClass('custom-footer');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <TableFooter ref={ref}>
          <tr>
            <td>Ref test</td>
          </tr>
        </TableFooter>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('TableRow', () => {
    it('should render with default props', () => {
      render(
        <TableRow>
          <td>Row content</td>
        </TableRow>
      );
      const row = screen.getByRole('row');
      expect(row).toBeInTheDocument();
      expect(row.tagName).toBe('TR');
      expect(row).toHaveClass('border-b', 'transition-colors', 'hover:bg-muted/50', 'data-[state=selected]:bg-muted');
      expect(screen.getByText('Row content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <TableRow className="custom-row">
          <td>Custom row</td>
        </TableRow>
      );
      const row = screen.getByRole('row');
      expect(row).toHaveClass('custom-row');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableRowElement>();
      render(
        <TableRow ref={ref}>
          <td>Ref test</td>
        </TableRow>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('TableHead', () => {
    it('should render with default props', () => {
      render(
        <TableHead>Header cell</TableHead>
      );
      const th = screen.getByRole('columnheader');
      expect(th).toBeInTheDocument();
      expect(th.tagName).toBe('TH');
      expect(th).toHaveClass('h-12', 'px-4', 'text-left', 'align-middle', 'font-medium', 'text-muted-foreground', '[&:has([role=checkbox])]:pr-0');
      expect(th).toHaveTextContent('Header cell');
    });

    it('should render with custom className', () => {
      render(
        <TableHead className="custom-head">Custom header</TableHead>
      );
      const th = screen.getByRole('columnheader');
      expect(th).toHaveClass('custom-head');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableCellElement>();
      render(<TableHead ref={ref}>Ref test</TableHead>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('TableCell', () => {
    it('should render with default props', () => {
      render(
        <TableCell>Cell content</TableCell>
      );
      const td = screen.getByRole('cell');
      expect(td).toBeInTheDocument();
      expect(td.tagName).toBe('TD');
      expect(td).toHaveClass('p-4', 'align-middle', '[&:has([role=checkbox])]:pr-0');
      expect(td).toHaveTextContent('Cell content');
    });

    it('should render with custom className', () => {
      render(
        <TableCell className="custom-cell">Custom cell</TableCell>
      );
      const td = screen.getByRole('cell');
      expect(td).toHaveClass('custom-cell');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableCellElement>();
      render(<TableCell ref={ref}>Ref test</TableCell>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('TableCaption', () => {
    it('should render with default props', () => {
      render(
        <TableCaption>Table caption</TableCaption>
      );
      const caption = screen.getByText('Table caption');
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('CAPTION');
      expect(caption).toHaveClass('mt-4', 'text-sm', 'text-muted-foreground');
    });

    it('should render with custom className', () => {
      render(
        <TableCaption className="custom-caption">Custom caption</TableCaption>
      );
      const caption = screen.getByText('Custom caption');
      expect(caption).toHaveClass('custom-caption');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTableCaptionElement>();
      render(<TableCaption ref={ref}>Ref test</TableCaption>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for Table', () => {
      expect(Table.displayName).toBe('Table');
    });

    it('should have correct displayName for TableHeader', () => {
      expect(TableHeader.displayName).toBe('TableHeader');
    });

    it('should have correct displayName for TableBody', () => {
      expect(TableBody.displayName).toBe('TableBody');
    });

    it('should have correct displayName for TableFooter', () => {
      expect(TableFooter.displayName).toBe('TableFooter');
    });

    it('should have correct displayName for TableRow', () => {
      expect(TableRow.displayName).toBe('TableRow');
    });

    it('should have correct displayName for TableHead', () => {
      expect(TableHead.displayName).toBe('TableHead');
    });

    it('should have correct displayName for TableCell', () => {
      expect(TableCell.displayName).toBe('TableCell');
    });

    it('should have correct displayName for TableCaption', () => {
      expect(TableCaption.displayName).toBe('TableCaption');
    });
  });

  describe('Integration', () => {
    it('should render complete table structure', () => {
      render(
        <Table>
          <TableCaption>User Data Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total: 2 users</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('User Data Table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Total: 2 users')).toBeInTheDocument();
    });

    it('should handle multiple tables', () => {
      render(
        <div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Table 1 content</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Table 2 content</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );

      const tables = screen.getAllByRole('table');
      expect(tables).toHaveLength(2);
      expect(screen.getByText('Table 1 content')).toBeInTheDocument();
      expect(screen.getByText('Table 2 content')).toBeInTheDocument();
    });

    it('should handle table with complex data', () => {
      const users = [
        { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
        { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'Moderator' }
      ];

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('charlie@example.com')).toBeInTheDocument();
      expect(screen.getByText('Moderator')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');
      const rowgroups = screen.getAllByRole('rowgroup');
      const thead = rowgroups[0]; // First rowgroup is thead
      const tbody = rowgroups[1]; // Second rowgroup is tbody
      const header = screen.getByRole('columnheader');
      const cell = screen.getByRole('cell');

      expect(table.tagName).toBe('TABLE');
      expect(thead.tagName).toBe('THEAD');
      expect(tbody.tagName).toBe('TBODY');
      expect(header.tagName).toBe('TH');
      expect(cell.tagName).toBe('TD');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Table
          aria-label="User data table"
          aria-describedby="table-description"
        >
          <TableCaption id="table-description">Table description</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');
      const caption = screen.getByText('Table description');

      expect(table).toHaveAttribute('aria-label', 'User data table');
      expect(table).toHaveAttribute('aria-describedby', 'table-description');
      expect(caption).toHaveAttribute('id', 'table-description');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<Table>Styled table</Table>);
      const table = screen.getByRole('table');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });

    it('should combine custom classes with default classes', () => {
      render(<Table className="border border-gray-300">Custom styled</Table>);
      const table = screen.getByRole('table');
      expect(table).toHaveClass('border', 'border-gray-300');
    });

    it('should handle conditional classes', () => {
      const isCompact = true;
      render(
        <Table
          className={isCompact ? 'text-xs' : 'text-sm'}
        >
          Conditional styling
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toHaveClass('text-xs');
    });
  });
});