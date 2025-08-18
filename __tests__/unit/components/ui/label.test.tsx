import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from '@/components/ui/label';

// Remove mock to use actual classes

describe('Label Component', () => {
  it('should render with children', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByTestId('label-root');
    expect(label).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<Label className="custom-label">Custom Label</Label>);
    const label = screen.getByTestId('label-root');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('custom-label');
  });

  it('should render with htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Input Label</Label>);
    const label = screen.getByTestId('label-root');
    expect(label).toBeInTheDocument();
    // Check if htmlFor is passed through props
    expect(label).toHaveAttribute('htmlFor', 'test-input');
  });

  it('should render with disabled state', () => {
    render(<Label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Disabled Label</Label>);
    const label = screen.getByTestId('label-root');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
  });

  it('should render with default styling', () => {
    render(<Label>Default Label</Label>);
    const label = screen.getByTestId('label-root');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
  });
});