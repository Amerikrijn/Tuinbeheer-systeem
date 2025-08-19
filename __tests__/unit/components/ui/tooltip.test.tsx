import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock Radix UI components to avoid context issues
jest.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children, ...props }: any) => (
    <div data-testid="tooltip-provider" {...props}>
      {children}
    </div>
  ),
  Root: ({ children, ...props }: any) => (
    <div data-testid="tooltip-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="tooltip-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="tooltip-content" {...props}>
      {children}
    </div>
  )
}));

describe('Tooltip Components', () => {
  describe('TooltipProvider', () => {
    it('should render with default props', () => {
      render(
        <TooltipProvider>
          <div>Provider content</div>
        </TooltipProvider>
      );
      expect(screen.getByText('Provider content')).toBeInTheDocument();
    });
  });
});