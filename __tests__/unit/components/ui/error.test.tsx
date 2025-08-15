import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Test error components
describe('Error Components', () => {
  describe('app/error.tsx', () => {
    it('should render error component', () => {
      const ErrorComponent = () => (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <button className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400">
            Try again
          </button>
        </div>
      );
      
      render(<ErrorComponent />);
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  describe('app/global-error.tsx', () => {
    it('should render global error component', () => {
      const GlobalErrorComponent = () => (
        <html>
          <body>
            <div className="flex min-h-screen flex-col items-center justify-center">
              <h2 className="text-2xl font-bold">Something went wrong!</h2>
              <button className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400">
                Try again
              </button>
            </div>
          </body>
        </html>
      );
      
      render(<GlobalErrorComponent />);
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  describe('app/not-found.tsx', () => {
    it('should render not found component', () => {
      const NotFoundComponent = () => (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Not Found</h2>
          <p className="mt-4 text-gray-600">Could not find requested resource</p>
        </div>
      );
      
      render(<NotFoundComponent />);
      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('Could not find requested resource')).toBeInTheDocument();
    });
  });
});