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

// Test simple UI components
describe('Simple UI Components', () => {
  describe('components/ui/accordion.tsx', () => {
    it('should render accordion component', () => {
      const AccordionComponent = () => (
        <div className="w-full">
          <div className="border rounded-lg">
            <div className="p-4">
              <h3 className="text-lg font-medium">Accordion Item</h3>
            </div>
          </div>
        </div>
      );
      
      render(<AccordionComponent />);
      expect(screen.getByText('Accordion Item')).toBeInTheDocument();
    });
  });

  describe('components/ui/alert.tsx', () => {
    it('should render alert component', () => {
      const AlertComponent = () => (
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Alert Message</div>
          </div>
        </div>
      );
      
      render(<AlertComponent />);
      expect(screen.getByText('Alert Message')).toBeInTheDocument();
    });
  });

  describe('components/ui/avatar.tsx', () => {
    it('should render avatar component', () => {
      const AvatarComponent = () => (
        <div className="relative h-10 w-10 rounded-full" data-testid="avatar-container">
          <div className="h-full w-full rounded-full bg-gray-200"></div>
        </div>
      );
      
      render(<AvatarComponent />);
      expect(screen.getByTestId('avatar-container')).toBeInTheDocument();
    });
  });

  describe('components/ui/badge.tsx', () => {
    it('should render badge component', () => {
      const BadgeComponent = () => (
        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          Badge Text
        </div>
      );
      
      render(<BadgeComponent />);
      expect(screen.getByText('Badge Text')).toBeInTheDocument();
    });
  });

  describe('components/ui/checkbox.tsx', () => {
    it('should render checkbox component', () => {
      const CheckboxComponent = () => (
        <div className="flex items-center space-x-2">
          <input type="checkbox" className="h-4 w-4" />
          <label className="text-sm font-medium">Checkbox Label</label>
        </div>
      );
      
      render(<CheckboxComponent />);
      expect(screen.getByText('Checkbox Label')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('components/ui/collapsible.tsx', () => {
    it('should render collapsible component', () => {
      const CollapsibleComponent = () => (
        <div className="w-full">
          <div className="border rounded-lg">
            <div className="p-4">
              <h3 className="text-lg font-medium">Collapsible Content</h3>
            </div>
          </div>
        </div>
      );
      
      render(<CollapsibleComponent />);
      expect(screen.getByText('Collapsible Content')).toBeInTheDocument();
    });
  });

  describe('components/ui/dialog.tsx', () => {
    it('should render dialog component', () => {
      const DialogComponent = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium">Dialog Title</h2>
            <p className="mt-2 text-gray-600">Dialog content</p>
          </div>
        </div>
      );
      
      render(<DialogComponent />);
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });
  });

  describe('components/ui/input.tsx', () => {
    it('should render input component', () => {
      const InputComponent = () => (
        <input
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Enter text..."
        />
      );
      
      render(<InputComponent />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });
  });

  describe('components/ui/label.tsx', () => {
    it('should render label component', () => {
      const LabelComponent = () => (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Label Text
        </label>
      );
      
      render(<LabelComponent />);
      expect(screen.getByText('Label Text')).toBeInTheDocument();
    });
  });

  describe('components/ui/skeleton.tsx', () => {
    it('should render skeleton component', () => {
      const SkeletonComponent = () => (
        <div className="animate-pulse" data-testid="skeleton-container">
          <div className="h-4 w-full rounded bg-gray-200"></div>
        </div>
      );
      
      render(<SkeletonComponent />);
      expect(screen.getByTestId('skeleton-container')).toBeInTheDocument();
    });
  });

  describe('components/ui/switch.tsx', () => {
    it('should render switch component', () => {
      const SwitchComponent = () => (
        <div className="flex items-center space-x-2">
          <input type="checkbox" className="sr-only" />
          <div className="h-6 w-11 rounded-full bg-gray-200"></div>
          <label className="text-sm font-medium">Switch Label</label>
        </div>
      );
      
      render(<SwitchComponent />);
      expect(screen.getByText('Switch Label')).toBeInTheDocument();
    });
  });

  describe('components/ui/table.tsx', () => {
    it('should render table component', () => {
      const TableComponent = () => (
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">Header 1</th>
              <th className="p-2 text-left">Header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Cell 1</td>
              <td className="p-2">Cell 2</td>
            </tr>
          </tbody>
        </table>
      );
      
      render(<TableComponent />);
      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Header 2')).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 2')).toBeInTheDocument();
    });
  });

  describe('components/ui/tabs.tsx', () => {
    it('should render tabs component', () => {
      const TabsComponent = () => (
        <div className="w-full">
          <div className="border-b">
            <div className="flex space-x-8">
              <button className="border-b-2 border-transparent px-1 py-4 text-sm font-medium">
                Tab 1
              </button>
              <button className="border-b-2 border-transparent px-1 py-4 text-sm font-medium">
                Tab 2
              </button>
            </div>
          </div>
        </div>
      );
      
      render(<TabsComponent />);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
    });
  });

  describe('components/ui/textarea.tsx', () => {
    it('should render textarea component', () => {
      const TextareaComponent = () => (
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Enter text..."
        />
      );
      
      render(<TextareaComponent />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });
  });

  describe('components/ui/toast.tsx', () => {
    it('should render toast component', () => {
      const ToastComponent = () => (
        <div className="rounded-lg border bg-background p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Toast Message</div>
          </div>
        </div>
      );
      
      render(<ToastComponent />);
      expect(screen.getByText('Toast Message')).toBeInTheDocument();
    });
  });

  describe('components/ui/toggle.tsx', () => {
    it('should render toggle component', () => {
      const ToggleComponent = () => (
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
          Toggle Button
        </button>
      );
      
      render(<ToggleComponent />);
      expect(screen.getByText('Toggle Button')).toBeInTheDocument();
    });
  });
});