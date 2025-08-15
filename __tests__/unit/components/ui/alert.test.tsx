import React from 'react';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock cva to return a simple function
jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => jest.fn(() => 'mock-classes'))
}));

describe('Alert Components', () => {
  describe('Alert', () => {
    it('should render without crashing', () => {
      render(<Alert>Test alert</Alert>);
      expect(screen.getByText('Test alert')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Alert className="custom-alert">Custom alert</Alert>);
      const alert = screen.getByText('Custom alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('should pass through additional props', () => {
      render(<Alert data-testid="custom-alert">Props test</Alert>);
      expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
    });
  });

  describe('AlertTitle', () => {
    it('should render without crashing', () => {
      render(<AlertTitle>Test title</AlertTitle>);
      expect(screen.getByText('Test title')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<AlertTitle className="custom-title">Custom title</AlertTitle>);
      const title = screen.getByText('Custom title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('AlertDescription', () => {
    it('should render without crashing', () => {
      render(<AlertDescription>Test description</AlertDescription>);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<AlertDescription className="custom-description">Custom description</AlertDescription>);
      const description = screen.getByText('Custom description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('Integration', () => {
    it('should render complete alert structure', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert description text</AlertDescription>
        </Alert>
      );
      
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert description text')).toBeInTheDocument();
    });

    it('should handle multiple alerts', () => {
      render(
        <div>
          <Alert>First alert</Alert>
          <Alert>Second alert</Alert>
        </div>
      );
      
      expect(screen.getByText('First alert')).toBeInTheDocument();
      expect(screen.getByText('Second alert')).toBeInTheDocument();
    });
  });
});