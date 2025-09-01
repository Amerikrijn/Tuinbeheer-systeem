import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock usePathname hook
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TreePine: () => <span data-testid="tree-pine-icon" />, 
  BookOpen: () => <span data-testid="book-open-icon" />, 
  ClipboardList: () => <span data-testid="clipboard-list-icon" />, 
  User: () => <span data-testid="user-icon" />, 
  Menu: () => <span data-testid="menu-icon" />, 
  X: () => <span data-testid="x-icon" />,
}));

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="badge">{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

// Import components AFTER mocks
import { Navigation } from '@/components/navigation';

describe('Navigation - Minimal Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders without crashing for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin' },
      hasPermission: jest.fn().mockReturnValue(true),
      signOut: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
      profile: null,
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<Navigation />);
    
    // Just test that it doesn't crash
    expect(true).toBe(true);
  });

  it('renders without crashing for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'user' },
      hasPermission: jest.fn().mockReturnValue(false),
      signOut: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
      profile: null,
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<Navigation />);
    
    // Just test that it doesn't crash
    expect(true).toBe(true);
  });

  it('renders without crashing for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      hasPermission: jest.fn().mockReturnValue(false),
      signOut: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<Navigation />);
    
    // Just test that it doesn't crash
    expect(true).toBe(true);
  });

  it('renders without crashing for loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      hasPermission: jest.fn().mockReturnValue(false),
      signOut: jest.fn(),
      isLoading: true,
      isAuthenticated: false,
      profile: null,
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<Navigation />);
    
    // Just test that it doesn't crash
    expect(true).toBe(true);
  });

  it('renders without crashing on different paths', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'user' },
      hasPermission: jest.fn().mockReturnValue(false),
      signOut: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
      profile: null,
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    mockUsePathname.mockReturnValue('/gardens');
    render(<Navigation />);
    
    // Just test that it doesn't crash
    expect(true).toBe(true);
  });
});

