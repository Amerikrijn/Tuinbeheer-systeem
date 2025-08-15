import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('Card Components', () => {
  describe('Card', () => {
    it('should render with default props', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe('DIV');
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('should render with custom className', () => {
      render(<Card className="custom-card">Custom card</Card>);
      const card = screen.getByText('Custom card');
      expect(card).toHaveClass('custom-card');
    });

    it('should pass through additional props', () => {
      render(
        <Card
          data-testid="custom-card"
          aria-label="Custom card"
          title="Card tooltip"
        >
          Props test
        </Card>
      );
      const card = screen.getByTestId('custom-card');
      expect(card).toHaveAttribute('aria-label', 'Custom card');
      expect(card).toHaveAttribute('title', 'Card tooltip');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Ref test</Card>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(<Card />);
      const card = screen.getByRole('generic');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('should handle complex children', () => {
      render(
        <Card>
          <div>
            <h2>Card Title</h2>
            <p>This is a <strong>rich</strong> content with <em>formatting</em>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
            <button>Action button</button>
          </div>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
      expect(screen.getByText('Action button')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('should render with default props', () => {
      render(<CardHeader>Header content</CardHeader>);
      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('DIV');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should render with custom className', () => {
      render(<CardHeader className="custom-header">Custom header</CardHeader>);
      const header = screen.getByText('Custom header');
      expect(header).toHaveClass('custom-header');
    });

    it('should pass through additional props', () => {
      render(
        <CardHeader
          data-testid="custom-header"
          aria-label="Card header"
        >
          Props test
        </CardHeader>
      );
      const header = screen.getByTestId('custom-header');
      expect(header).toHaveAttribute('aria-label', 'Card header');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Ref test</CardHeader>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <CardHeader>
          <div>Child 1</div>
          <div>Child 2</div>
        </CardHeader>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render with default props', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('should render with custom className', () => {
      render(<CardTitle className="custom-title">Custom title</CardTitle>);
      const title = screen.getByText('Custom title');
      expect(title).toHaveClass('custom-title');
    });

    it('should pass through additional props', () => {
      render(
        <CardTitle
          data-testid="custom-title"
          aria-level="1"
        >
          Props test
        </CardTitle>
      );
      const title = screen.getByTestId('custom-title');
      expect(title).toHaveAttribute('aria-level', '1');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardTitle ref={ref}>Ref test</CardTitle>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle complex title content', () => {
      render(
        <CardTitle>
          <span>Main</span>
          <span className="text-blue-500">Title</span>
          <span>!</span>
        </CardTitle>
      );
      expect(screen.getByText('Main')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('!')).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('should render with default props', () => {
      render(<CardDescription>Card description text</CardDescription>);
      const description = screen.getByText('Card description text');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('DIV');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should render with custom className', () => {
      render(<CardDescription className="custom-description">Custom description</CardDescription>);
      const description = screen.getByText('Custom description');
      expect(description).toHaveClass('custom-description');
    });

    it('should pass through additional props', () => {
      render(
        <CardDescription
          data-testid="custom-description"
          aria-describedby="card-help"
        >
          Props test
        </CardDescription>
      );
      const description = screen.getByTestId('custom-description');
      expect(description).toHaveAttribute('aria-describedby', 'card-help');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardDescription ref={ref}>Ref test</CardDescription>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle long description text', () => {
      const longText = 'This is a very long description that might wrap to multiple lines and contain various types of content including numbers (123), special characters (!@#), and different formatting.';
      render(<CardDescription>{longText}</CardDescription>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('should render with default props', () => {
      render(<CardContent>Content text</CardContent>);
      const content = screen.getByText('Content text');
      expect(content).toBeInTheDocument();
      expect(content.tagName).toBe('DIV');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should render with custom className', () => {
      render(<CardContent className="custom-content">Custom content</CardContent>);
      const content = screen.getByText('Custom content');
      expect(content).toHaveClass('custom-content');
    });

    it('should pass through additional props', () => {
      render(
        <CardContent
          data-testid="custom-content"
          aria-label="Card content"
        >
          Props test
        </CardContent>
      );
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveAttribute('aria-label', 'Card content');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Ref test</CardContent>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle complex content structure', () => {
      render(
        <CardContent>
          <section>
            <h3>Section Title</h3>
            <p>Section content with <a href="#">link</a> and <code>code</code>.</p>
            <blockquote>Important quote here</blockquote>
          </section>
        </CardContent>
      );
      
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('link')).toBeInTheDocument();
      expect(screen.getByText('code')).toBeInTheDocument();
      expect(screen.getByText('Important quote here')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render with default props', () => {
      render(<CardFooter>Footer content</CardFooter>);
      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('DIV');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should render with custom className', () => {
      render(<CardFooter className="custom-footer">Custom footer</CardFooter>);
      const footer = screen.getByText('Custom footer');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should pass through additional props', () => {
      render(
        <CardFooter
          data-testid="custom-footer"
          aria-label="Card footer"
        >
          Props test
        </CardFooter>
      );
      const footer = screen.getByTestId('custom-footer');
      expect(footer).toHaveAttribute('aria-label', 'Card footer');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Ref test</CardFooter>);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle action buttons', () => {
      render(
        <CardFooter>
          <button className="btn-primary">Save</button>
          <button className="btn-secondary">Cancel</button>
          <button className="btn-danger">Delete</button>
        </CardFooter>
      );
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for Card', () => {
      expect(Card.displayName).toBe('Card');
    });

    it('should have correct displayName for CardHeader', () => {
      expect(CardHeader.displayName).toBe('CardHeader');
    });

    it('should have correct displayName for CardTitle', () => {
      expect(CardTitle.displayName).toBe('CardTitle');
    });

    it('should have correct displayName for CardDescription', () => {
      expect(CardDescription.displayName).toBe('CardDescription');
    });

    it('should have correct displayName for CardContent', () => {
      expect(CardContent.displayName).toBe('CardContent');
    });

    it('should have correct displayName for CardFooter', () => {
      expect(CardFooter.displayName).toBe('CardFooter');
    });
  });

  describe('Integration', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByText('Main content area')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should handle multiple cards', () => {
      render(
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
            </CardHeader>
            <CardContent>Content 1</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card 2</CardTitle>
            </CardHeader>
            <CardContent>Content 2</CardContent>
          </Card>
        </div>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should handle cards with different layouts', () => {
      render(
        <div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Full Width Card</CardTitle>
            </CardHeader>
            <CardContent>Full width content</CardContent>
          </Card>
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>Half Width Card</CardTitle>
            </CardHeader>
            <CardContent>Half width content</CardContent>
          </Card>
        </div>
      );

      const cards = screen.getAllByText(/Full Width|Half Width/);
      expect(cards).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>Accessible description</CardDescription>
          </CardHeader>
          <CardContent>Accessible content</CardContent>
          <CardFooter>Accessible footer</CardFooter>
        </Card>
      );

      const card = screen.getByText('Accessible Card').closest('div');
      const header = screen.getByText('Accessible description').closest('div');
      const title = screen.getByText('Accessible Card');
      const description = screen.getByText('Accessible description');
      const content = screen.getByText('Accessible content');
      const footer = screen.getByText('Accessible footer');

      expect(card?.tagName).toBe('DIV');
      expect(header?.tagName).toBe('DIV');
      expect(title.tagName).toBe('DIV');
      expect(description.tagName).toBe('DIV');
      expect(content.tagName).toBe('DIV');
      expect(footer.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Card
          aria-label="Main card"
          aria-describedby="card-description"
          role="article"
        >
          <CardHeader>
            <CardTitle>Card with Aria</CardTitle>
            <CardDescription id="card-description">Aria attributes test</CardDescription>
          </CardHeader>
          <CardContent>Content with aria</CardContent>
        </Card>
      );

      const card = screen.getByText('Card with Aria').closest('div');
      expect(card).toHaveAttribute('aria-label', 'Main card');
      expect(card).toHaveAttribute('aria-describedby', 'card-description');
      expect(card).toHaveAttribute('role', 'article');
    });

    it('should handle focus management', () => {
      render(
        <Card tabIndex={0}>
          <CardHeader>
            <CardTitle>Focusable Card</CardTitle>
          </CardHeader>
          <CardContent>Focusable content</CardContent>
        </Card>
      );

      const card = screen.getByText('Focusable Card').closest('div');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
});