import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons used in navigation
vi.mock('lucide-react', () => ({
  TreePine: () => <span data-testid="tree-pine-icon" />, 
  BookOpen: () => <span data-testid="book-open-icon" />, 
  ClipboardList: () => <span data-testid="clipboard-list-icon" />, 
  User: () => <span data-testid="user-icon" />, 
  Menu: () => <span data-testid="menu-icon" />, 
  X: () => <span data-testid="x-icon" />,
}));

// Mock UI components to avoid dependencies
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="badge">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

// Mock useAuth and usePathname hooks
const mockUseAuth = vi.fn();
vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

import { Navigation } from '@/components/navigation';

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders admin links for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin', full_name: 'Admin', email: 'admin@example.com' },
      hasPermission: vi.fn(() => true),
    });

    render(<Navigation />);

    expect(
      screen.getByRole('menuitem', { name: /Gebruikers/i })
    ).toBeInTheDocument();
  });

  it('hides admin links for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'user', full_name: 'User', email: 'user@example.com' },
      hasPermission: vi.fn(() => true),
    });

    render(<Navigation />);

    expect(
      screen.queryByRole('menuitem', { name: /Gebruikers/i })
    ).not.toBeInTheDocument();
  });

  it('toggles mobile menu visibility', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'user', full_name: 'User', email: 'user@example.com' },
      hasPermission: vi.fn(() => true),
    });

    render(<Navigation />);

    const toggle = screen.getByRole('button', { name: /Menu openen/i });
    expect(
      screen.queryByRole('menu', { name: /Mobiele navigatie/i })
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(
      screen.getByRole('menu', { name: /Mobiele navigatie/i })
    ).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(
      screen.queryByRole('menu', { name: /Mobiele navigatie/i })
    ).not.toBeInTheDocument();
  });
});

