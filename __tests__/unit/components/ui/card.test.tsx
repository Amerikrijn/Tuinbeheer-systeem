import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render without crashing', () => {
      render(<Card>Test card</Card>);
      expect(screen.getByText('Test card')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Card className="custom-card">Custom card</Card>);
      const card = screen.getByText('Custom card');
      expect(card).toHaveClass('custom-card');
    });

    it('should pass through additional props', () => {
      render(<Card data-testid="custom-card">Props test</Card>);
      expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('should render without crashing', () => {
      render(<CardHeader>Test header</CardHeader>);
      expect(screen.getByText('Test header')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<CardHeader className="custom-header">Custom header</CardHeader>);
      const header = screen.getByText('Custom header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('should render without crashing', () => {
      render(<CardTitle>Test title</CardTitle>);
      expect(screen.getByText('Test title')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<CardTitle className="custom-title">Custom title</CardTitle>);
      const title = screen.getByText('Custom title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('should render without crashing', () => {
      render(<CardDescription>Test description</CardDescription>);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<CardDescription className="custom-description">Custom description</CardDescription>);
      const description = screen.getByText('Custom description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('CardContent', () => {
    it('should render without crashing', () => {
      render(<CardContent>Test content</CardContent>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<CardContent className="custom-content">Custom content</CardContent>);
      const content = screen.getByText('Custom content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('should render without crashing', () => {
      render(<CardFooter>Test footer</CardFooter>);
      expect(screen.getByText('Test footer')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<CardFooter className="custom-footer">Custom footer</CardFooter>);
      const footer = screen.getByText('Custom footer');
      expect(footer).toHaveClass('custom-footer');
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
          <CardContent>Card content text</CardContent>
          <CardFooter>Card footer</CardFooter>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByText('Card content text')).toBeInTheDocument();
      expect(screen.getByText('Card footer')).toBeInTheDocument();
    });

    it('should handle multiple cards', () => {
      render(
        <div>
          <Card>First card</Card>
          <Card>Second card</Card>
        </div>
      );
      
      expect(screen.getByText('First card')).toBeInTheDocument();
      expect(screen.getByText('Second card')).toBeInTheDocument();
    });

    it('should handle cards with complex content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complex Card</CardTitle>
            <CardDescription>With <strong>rich</strong> <em>content</em></CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content with <span>nested</span> elements</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('Complex Card')).toBeInTheDocument();
      expect(screen.getByText('With')).toBeInTheDocument();
      expect(screen.getByText('rich')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
      expect(screen.getByText(/Content with/)).toBeInTheDocument();
      expect(screen.getByText('nested')).toBeInTheDocument();
      expect(screen.getByText(/elements/)).toBeInTheDocument();
    });
  });
});