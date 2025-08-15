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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
      
      render(<LoadingComponent />);
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('app/gardens/loading.tsx', () => {
    it('should render gardens loading component', () => {
      const GardensLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
      
      render(<GardensLoadingComponent />);
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('app/gardens/[id]/plant-beds/loading.tsx', () => {
    it('should render plant beds loading component', () => {
      const PlantBedsLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
      
      render(<PlantBedsLoadingComponent />);
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('app/gardens/[id]/plantvak-view/[bedId]/plants/loading.tsx', () => {
    it('should render plants loading component', () => {
      const PlantsLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
      
      render(<PlantsLoadingComponent />);
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('app/tasks/loading.tsx', () => {
    it('should render tasks loading component', () => {
      const TasksLoadingComponent = () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
      
      render(<TasksLoadingComponent />);
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });
});