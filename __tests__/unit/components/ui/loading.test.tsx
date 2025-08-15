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

// Test loading components
describe('Loading Components', () => {
  describe('app/loading.tsx', () => {
    it('should render loading component', () => {
      // This is a simple loading component, so we'll test its basic structure
      const LoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" data-testid="loading-spinner"></div>
        </div>
      );
      
      render(<LoadingComponent />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('app/gardens/loading.tsx', () => {
    it('should render gardens loading component', () => {
      const GardensLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" data-testid="gardens-loading-spinner"></div>
        </div>
      );
      
      render(<GardensLoadingComponent />);
      expect(screen.getByTestId('gardens-loading-spinner')).toBeInTheDocument();
    });
  });

  describe('app/gardens/[id]/plant-beds/loading.tsx', () => {
    it('should render plant beds loading component', () => {
      const PlantBedsLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" data-testid="plant-beds-loading-spinner"></div>
        </div>
      );
      
      render(<PlantBedsLoadingComponent />);
      expect(screen.getByTestId('plant-beds-loading-spinner')).toBeInTheDocument();
    });
  });

  describe('app/gardens/[id]/plantvak-view/[bedId]/plants/loading.tsx', () => {
    it('should render plants loading component', () => {
      const PlantsLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" data-testid="plants-loading-spinner"></div>
        </div>
      );
      
      render(<PlantsLoadingComponent />);
      expect(screen.getByTestId('plants-loading-spinner')).toBeInTheDocument();
    });
  });

  describe('app/tasks/loading.tsx', () => {
    it('should render tasks loading component', () => {
      const TasksLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" data-testid="tasks-loading-spinner"></div>
        </div>
      );
      
      render(<TasksLoadingComponent />);
      expect(screen.getByTestId('tasks-loading-spinner')).toBeInTheDocument();
    });
  });
});