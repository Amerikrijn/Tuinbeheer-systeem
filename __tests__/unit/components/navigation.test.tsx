import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mocks
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

const mockUseAuth = jest.fn();
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { Navigation } from '@/components/navigation';

describe('Navigation', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin', full_name: 'Admin', email: 'admin@example.com' },
      hasPermission: jest.fn(() => true),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correct navigation links', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navigation />);

    expect(screen.getByRole('menuitem', { name: /Taken/i })).toHaveAttribute('href', '/tasks');
    expect(screen.getByRole('menuitem', { name: /Logboek/i })).toHaveAttribute('href', '/logbook');
    expect(screen.getByRole('menuitem', { name: /Gebruikers/i })).toHaveAttribute('href', '/admin/users');
  });

  it('marks active route', () => {
    mockUsePathname.mockReturnValue('/tasks');
    render(<Navigation />);

    const activeLink = screen.getByRole('menuitem', { name: /Taken/i });
    const inactiveLink = screen.getByRole('menuitem', { name: /Logboek/i });

    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });
});

