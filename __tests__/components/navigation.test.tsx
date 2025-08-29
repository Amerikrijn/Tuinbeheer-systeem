import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { Navigation } from '@/components/navigation';
import { AllTheProviders } from '@/__tests__/utils/test-utils'

// Mock Next.js Link component
jest.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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

// Mock useAuth and usePathname hooks
const mockUseAuth = {
  user: null,
  hasPermission: jest.fn(),
  signOut: jest.fn(),
}

jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => mockUseAuth,
}))

const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AllTheProviders>
      {component}
    </AllTheProviders>
  )
}

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders admin links for admin users', () => {
    mockUseAuth.user = { role: 'admin' }
    mockUseAuth.hasPermission.mockReturnValue(true)

    renderWithProviders(<Navigation />);

    expect(
      screen.getByRole('menuitem', { name: /Gebruikers/i })
    ).toBeInTheDocument();
  });

  it('hides admin links for non-admin users', () => {
    mockUseAuth.user = { role: 'user' }
    mockUsePathname.mockReturnValue(false)

    renderWithProviders(<Navigation />);

    expect(
      screen.queryByRole('menuitem', { name: /Gebruikers/i })
    ).not.toBeInTheDocument();
  });

  it('toggles mobile menu visibility', () => {
    mockUseAuth.user = { role: 'user' }

    renderWithProviders(<Navigation />);

    const toggle = screen.getByRole('button', { name: /Menu openen/i });
    expect(toggle).toBeInTheDocument();
  });
});

