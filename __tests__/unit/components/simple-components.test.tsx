import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock auth hook for navigation components
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: null,
    signOut: jest.fn(),
    isAdmin: jest.fn(() => false),
  }),
}))

// Mock BankingNavigation used within AuthNavigation
jest.mock('@/components/navigation', () => ({
  BankingNavigation: () => <nav data-testid="banking-navigation" />,
}))

describe('Simple Component Files', () => {
  it('renders the real ErrorBoundary component', async () => {
    const { ErrorBoundary } = await import('@/components/error-boundary')
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders the real ThemeToggle component', async () => {
    const { ThemeToggle } = await import('@/components/theme-toggle')
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders the real PlantPhotoGallery component', async () => {
    const { PlantPhotoGallery } = await import('@/components/plant-photo-gallery')
    render(<PlantPhotoGallery plantId="test-plant" plantName="Test Plant" />)
    expect(screen.getByText(/Foto's van/i)).toBeInTheDocument()
  })

  it('renders AuthNavigation for unauthenticated users', async () => {
    const { AuthNavigation } = await import('@/components/navigation/auth-nav')
    render(<AuthNavigation />)
    expect(screen.getByText('Inloggen')).toBeInTheDocument()
  })
})
