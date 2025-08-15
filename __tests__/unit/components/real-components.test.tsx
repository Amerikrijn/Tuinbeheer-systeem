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
  usePathname: () => '/',
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock auth context
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    hasPermission: () => true,
  }),
}));

// Mock window.matchMedia for Jest
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test real component files by importing them
describe('Real Component Files', () => {
  describe('components/banking-form.tsx', () => {
    it('should render the real banking form', async () => {
      // Import the real component using named export
      const { BankingForm } = await import('@/components/banking-form');
      
      render(
        <BankingForm 
          title="Test Form"
          onSubmit={jest.fn()}
          schema={undefined} // Fix: don't pass empty object
        >
          <div>Form content</div>
        </BankingForm>
      );
      
      // Test actual rendered content
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });
  });

  describe('components/error-boundary.tsx', () => {
    it('should render the real error boundary', async () => {
      // Import the real component using named export
      const { ErrorBoundary } = await import('@/components/error-boundary');
      
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );
      
      // Test actual rendered content - the error boundary renders 2 generic elements
      expect(screen.getAllByRole('generic')).toHaveLength(2);
    });
  });

  describe('components/theme-toggle.tsx', () => {
    it('should render the real theme toggle', async () => {
      // Import the real component using named export
      const { ThemeToggle } = await import('@/components/theme-toggle');
      
      render(<ThemeToggle />);
      
      // Test actual rendered content
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('components/navigation.tsx', () => {
    it('should render the real navigation', async () => {
      // Import the real component using named export
      const { Navigation } = await import('@/components/navigation');
      
      render(<Navigation />);
      
      // Test actual rendered content - the component shows Dutch text
      expect(screen.getByText(/Taken/i)).toBeInTheDocument();
      expect(screen.getByText(/Logboek/i)).toBeInTheDocument();
    });
  });

  describe('components/plant-photo-gallery.tsx', () => {
    it('should render the real plant photo gallery', async () => {
      // Import the real component using named export
      const { PlantPhotoGallery } = await import('@/components/plant-photo-gallery');
      
      render(
        <PlantPhotoGallery 
          plantId="test-plant-123"
          plantName="Test Plant"
        />
      );
      
      // Test actual rendered content - the component shows "Foto's van" in Dutch
      expect(screen.getByText(/Foto's van/i)).toBeInTheDocument();
    });
  });
});