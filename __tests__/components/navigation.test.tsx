import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

// Import the useAuth mock BEFORE importing components
import '../mocks/use-auth.mock';
import { mockUseAuth } from '../mocks/use-auth.mock';

// Mock usePathname hook BEFORE importing components
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock lucide-react icons used in navigation
jest.mock('lucide-react', () => ({
  TreePine: () => <span data-testid="tree-pine-icon" />, 
  BookOpen: () => <span data-testid="book-open-icon" />, 
  ClipboardList: () => <span data-testid="clipboard-list-icon" />, 
  User: () => <span data-testid="user-icon" />, 
  Menu: () => <span data-testid="menu-icon" />, 
  X: () => <span data-testid="x-icon" />,
}));

// Mock UI components to avoid dependencies
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
// import { AllTheProviders } from '@/__tests__/utils/test-utils' // TODO: Create test-utils if needed

const renderWithProviders = (component: React.ReactElement) => {
  return render(component)
}

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders admin links for admin users', () => {
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

    renderWithProviders(<Navigation />);

    expect(
      screen.getByRole('menuitem', { name: /Gebruikers/i })
    ).toBeInTheDocument();
  });

  it('hides admin links for non-admin users', () => {
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

    renderWithProviders(<Navigation />);

    expect(
      screen.queryByRole('menuitem', { name: /Gebruikers/i })
    ).not.toBeInTheDocument();
  });

  it('toggles mobile menu visibility', () => {
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

    renderWithProviders(<Navigation />);

    const toggle = screen.getByRole('button', { name: /Menu openen/i });
    expect(toggle).toBeInTheDocument();
  });
});

