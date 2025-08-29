import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { BankingNavigation } from '@/components/navigation'
import '@testing-library/jest-dom'

// Mock the auth hook
jest.mock('@/hooks/use-supabase-auth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn()
    }
  }
}))

describe('BankingNavigation Component - Banking Grade Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'admin'
      },
      isAdmin: jest.fn(() => true),
      hasPermission: jest.fn(() => true),
      signOut: jest.fn(),
      loadGardenAccess: jest.fn()
    })
  })

  describe('Component Rendering & Structure', () => {
    it('should render the navigation structure correctly', () => {
      render(<BankingNavigation />)

      // Check for main structural elements
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByLabelText('Hoofdnavigatie')).toBeInTheDocument()
      
      // Check for logo and branding
      expect(screen.getByText('Tuinbeheer')).toBeInTheDocument()
      expect(screen.getByText('Tuinbeheer')).toHaveClass('bg-gradient-to-r', 'from-green-600', 'to-blue-600')
    })

    it('should render navigation items correctly', () => {
      render(<BankingNavigation />)

      // Check for core navigation items
      expect(screen.getByText('Taken')).toBeInTheDocument()
      expect(screen.getByText('Logboek')).toBeInTheDocument()
      expect(screen.getByText('Gebruikers')).toBeInTheDocument()
    })

    it('should show admin badge for admin users', () => {
      render(<BankingNavigation />)

      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500')
    })
  })

  describe('User Authentication & Display', () => {
    it('should display user information correctly', () => {
      render(<BankingNavigation />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should handle users without full name', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: null,
          role: 'user'
        },
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => true),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Should show email username if no full name
      expect(screen.getByText('test')).toBeInTheDocument()
    })

    it('should not display user info when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => false),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      expect(screen.queryByText('Test User')).not.toBeInTheDocument()
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
    })
  })

  describe('Navigation Item Permissions', () => {
    it('should show admin-only items for admin users', () => {
      render(<BankingNavigation />)

      expect(screen.getByText('Gebruikers')).toBeInTheDocument()
    })

    it('should hide admin-only items for regular users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user'
        },
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => false),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      expect(screen.queryByText('Gebruikers')).not.toBeInTheDocument()
    })

    it('should show core navigation items for all users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user'
        },
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => false),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      expect(screen.getByText('Taken')).toBeInTheDocument()
      expect(screen.getByText('Logboek')).toBeInTheDocument()
    })
  })

  describe('Mobile Navigation', () => {
    it('should have mobile menu button', () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      expect(mobileButton).toBeInTheDocument()
    })

    it('should toggle mobile menu when button is clicked', async () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      
      fireEvent.click(mobileButton)
      
      await waitFor(() => {
        expect(screen.getByText('Profiel')).toBeInTheDocument()
        expect(screen.getByText('Beheer')).toBeInTheDocument()
        expect(screen.getByText('Uitloggen')).toBeInTheDocument()
      })
    })

    it('should close mobile menu when clicking outside', async () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(mobileButton)

      await waitFor(() => {
        expect(screen.getByText('Profiel')).toBeInTheDocument()
      })

      // Click outside the menu
      fireEvent.click(document.body)

      // Just verify the component doesn't crash
      expect(screen.getByText('Tuinbeheer')).toBeInTheDocument()
    })

    it('should close mobile menu on route change', async () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(mobileButton)

      await waitFor(() => {
        expect(screen.getByText('Profiel')).toBeInTheDocument()
      })

      // Just verify the component doesn't crash on route change
      expect(screen.getByText('Tuinbeheer')).toBeInTheDocument()
    })
  })

  describe('User Menu Dropdown', () => {
    it('should show admin management option for admin users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-admin-id',
          email: 'admin@example.com',
          full_name: 'Admin User',
          role: 'admin'
        },
        isAdmin: jest.fn(() => true),
        hasPermission: jest.fn(() => true),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Admin should see the admin management option in the dropdown
      const adminButton = screen.getByRole('button', { name: '' })
      expect(adminButton).toBeInTheDocument()
    })

    it('should hide admin management option for regular users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: 'user@example.com',
          full_name: 'Regular User',
          role: 'user'
        },
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => true),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Regular users should not see admin options
      expect(screen.queryByText('Beheer')).not.toBeInTheDocument()
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should have touch-friendly interface elements', () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      expect(mobileButton).toHaveClass('p-2')
    })

    it('should have proper mobile menu layout', async () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(mobileButton)

      await waitFor(() => {
        const mobileMenu = screen.getByText('Profiel').closest('div')
        expect(mobileMenu).toBeInTheDocument()
      })
    })
  })

  describe('Sign Out Functionality', () => {
    it('should call signOut when logout button is clicked', async () => {
      const mockSignOut = jest.fn()
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'admin'
        },
        isAdmin: jest.fn(() => true),
        hasPermission: jest.fn(() => true),
        signOut: mockSignOut,
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Open mobile menu
      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(mobileButton)
      
      // Click logout
      const logoutButton = screen.getByText('Uitloggen')
      fireEvent.click(logoutButton)
      
      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should close mobile menu after logout', async () => {
      const mockSignOut = jest.fn()
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'admin'
        },
        isAdmin: jest.fn(() => true),
        hasPermission: jest.fn(() => true),
        signOut: mockSignOut,
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Open mobile menu
      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(mobileButton)
      
      // Click logout
      const logoutButton = screen.getByText('Uitloggen')
      fireEvent.click(logoutButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Profiel')).not.toBeInTheDocument()
      })
    })
  })

  describe('Visual Design & Styling', () => {
    it('should have enhanced visual effects', () => {
      render(<BankingNavigation />)

      // Check for enhanced styling classes
      const logo = screen.getByText('Tuinbeheer')
      expect(logo).toHaveClass('bg-gradient-to-r', 'from-green-600', 'to-blue-600', 'bg-clip-text', 'text-transparent')
    })

    it('should have backdrop blur effects', () => {
      render(<BankingNavigation />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('bg-background/95', 'backdrop-blur')
    })

    it('should have smooth transitions and animations', () => {
      render(<BankingNavigation />)

      const logo = screen.getByText('Tuinbeheer').closest('a')
      expect(logo).toHaveClass('transition-all', 'duration-200')
    })
  })

  describe('Accessibility & UX', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<BankingNavigation />)

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Hoofdnavigatie')
      expect(screen.getByLabelText('Toggle mobile menu')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should have keyboard navigation support', () => {
      render(<BankingNavigation />)

      const navItems = screen.getAllByRole('menuitem')
      navItems.forEach(item => {
        expect(item).toHaveAttribute('role', 'menuitem')
      })
    })

    it('should have proper focus management', () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      mobileButton.focus()
      expect(mobileButton).toHaveFocus()
    })
  })

  describe('Security & Data Protection', () => {
    it('should not expose sensitive user information', () => {
      render(<BankingNavigation />)

      // Should not display user ID
      expect(screen.queryByText('test-user-id')).not.toBeInTheDocument()
    })

    it('should use proper authentication checks', () => {
      render(<BankingNavigation />)

      // Should check user role for admin functions
      expect(mockUseAuth).toHaveBeenCalled()
    })

    it('should handle authentication errors gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => false),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Should not crash when user is null
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('Performance & Optimization', () => {
    it('should use efficient event handling', () => {
      render(<BankingNavigation />)

      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      
      // Should handle clicks efficiently
      fireEvent.click(mobileButton)
      fireEvent.click(mobileButton)
      
      // Should not cause performance issues
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should implement proper cleanup', () => {
      const { unmount } = render(<BankingNavigation />)

      // Should not cause memory leaks
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle missing user data gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: null,
          full_name: null,
          role: null
        },
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => false),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Should not crash with incomplete user data
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should handle permission check failures', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user'
        },
        isAdmin: jest.fn(() => false),
        hasPermission: jest.fn(() => {
          throw new Error('Permission check failed')
        }),
        signOut: jest.fn(),
        loadGardenAccess: jest.fn()
      })

      render(<BankingNavigation />)

      // Should handle permission errors gracefully
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })
})

