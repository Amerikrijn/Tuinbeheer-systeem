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

// Test real app files by importing them
describe('Real App File Tests', () => {
  describe('app/page.tsx', () => {
    it('should render the real home page', async () => {
      // Import the real component using named export
      const { default: HomePage } = await import('@/app/page');
      
      render(<HomePage />);
      
      // Test actual rendered content - the page shows loading initially
      expect(screen.getByText(/Laden/i)).toBeInTheDocument();
    });
  });

  describe('app/layout.tsx', () => {
    it('should render the real layout', async () => {
      // Import the real component using named export
      const { default: Layout } = await import('@/app/layout');
      
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );
      
      // Test actual rendered content - the layout shows error boundary when auth fails
      expect(screen.getByText(/Application Error/i)).toBeInTheDocument();
    });
  });

  describe('app/gardens/page.tsx', () => {
    it('should render the real gardens page', async () => {
      // Import the real component using named export
      const { default: GardensPage } = await import('@/app/gardens/page');
      
      render(<GardensPage />);
      
      // Test actual rendered content
      expect(screen.getByText(/Doorverwijzen naar tuinen overzicht/i)).toBeInTheDocument();
    });
  });

  describe('app/tasks/page.tsx', () => {
    it('should render the real tasks page', async () => {
      // Import the real component using named export
      const { default: TasksPage } = await import('@/app/tasks/page');
      
      render(<TasksPage />);
      
      // Test actual rendered content - the page shows loading initially
      expect(screen.getByText(/Laden/i)).toBeInTheDocument();
    });
  });
});