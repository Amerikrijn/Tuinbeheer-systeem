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
        eq: jest.fn(() => ({
          not: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        count: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          not: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        count: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock auth hook
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
    hasPermission: jest.fn(() => false),
    isAdmin: jest.fn(() => false),
    hasGardenAccess: jest.fn(() => false),
    getAccessibleGardens: jest.fn(() => []),
    refreshUser: jest.fn(),
    forceRefreshUser: jest.fn(),
    loadGardenAccess: jest.fn(),
  }),
  useSupabaseAuth: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
    hasPermission: jest.fn(() => false),
    isAdmin: jest.fn(() => false),
    hasGardenAccess: jest.fn(() => false),
    getAccessibleGardens: jest.fn(() => []),
    refreshUser: jest.fn(),
    forceRefreshUser: jest.fn(),
    loadGardenAccess: jest.fn(),
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
