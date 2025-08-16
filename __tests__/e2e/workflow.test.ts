import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HomePageContent } from '@/app/page'
import { TuinService } from '@/lib/services/database.service'
import { mockGardensArray } from '@/__tests__/setup/supabase-mock'

// Mock dependencies
vi.mock('@/lib/services/database.service', () => ({
  TuinService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAdmin: false,
    signOut: vi.fn()
  })
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

vi.mock('@/hooks/use-view-preference', () => ({
  useViewPreference: () => ({
    isVisualView: false,
    toggleView: vi.fn()
  })
}))

vi.mock('@/lib/logger', () => ({
  uiLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
  AuditLogger: { logUserAction: vi.fn() }
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    }
  }
}))

// Get mocked instances
const mockTuinService = TuinService as jest.Mocked<typeof TuinService>

describe('End-to-End Workflow: Question to Preview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock responses
    mockTuinService.getAll.mockResolvedValue({
      success: true,
      data: {
        data: mockGardensArray,
        page: 1,
        total_pages: 1,
        total_count: mockGardensArray.length
      },
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Workflow: Create Garden Question to Preview', () => {
    it('should handle complete workflow from question to preview', async () => {
      // Step 1: Render the application
      render(<HomePageContent />)

      // Step 2: Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByText('Test Garden')).toBeInTheDocument()
      })

      // Step 3: Verify search functionality (question input)
      const searchInput = screen.getByPlaceholderText(/zoeken/i)
      expect(searchInput).toBeInTheDocument()

      // Step 4: Test search functionality
      fireEvent.change(searchInput, { target: { value: 'Second Garden' } })
      
      // Step 5: Verify search results update
      await waitFor(() => {
        expect(screen.getByText('Second Garden')).toBeInTheDocument()
        expect(screen.queryByText('Test Garden')).not.toBeInTheDocument()
      })

      // Step 6: Test view toggle (visual vs list view)
      const viewToggle = screen.getByRole('button', { name: /toggle view/i })
      if (viewToggle) {
        fireEvent.click(viewToggle)
        // Verify view change (this would depend on your view implementation)
      }

      // Step 7: Test pagination (if applicable)
      const loadMoreButton = screen.queryByText(/meer laden/i)
      if (loadMoreButton) {
        fireEvent.click(loadMoreButton)
        // Verify more data loads
      }

      // Step 8: Test garden deletion workflow
      const deleteButtons = screen.getAllByRole('button', { name: /verwijderen/i })
      if (deleteButtons.length > 0) {
        // Mock the confirmation dialog
        const originalConfirm = window.confirm
        window.confirm = vi.fn().mockReturnValue(true)

        // Mock successful deletion
        mockTuinService.delete.mockResolvedValue({
          success: true,
          data: null,
          error: null
        })

        fireEvent.click(deleteButtons[0])

        // Verify deletion was called
        await waitFor(() => {
          expect(mockTuinService.delete).toHaveBeenCalled()
        })

        // Restore original confirm
        window.confirm = originalConfirm
      }

      // Step 9: Test error handling
      mockTuinService.getAll.mockResolvedValue({
        success: false,
        data: null,
        error: 'Database connection failed'
      })

      // Trigger a new search to test error handling
      fireEvent.change(searchInput, { target: { value: 'error-test' } })

      // Verify error is handled gracefully
      await waitFor(() => {
        expect(screen.getByText(/fout bij laden van tuinen/i)).toBeInTheDocument()
      })

      // Step 10: Test recovery from error
      mockTuinService.getAll.mockResolvedValue({
        success: true,
        data: {
          data: mockGardensArray,
          page: 1,
          total_pages: 1,
          total_count: mockGardensArray.length
        },
        error: null
      })

      const retryButton = screen.getByRole('button', { name: /opnieuw proberen/i })
      if (retryButton) {
        fireEvent.click(retryButton)
        
        // Verify recovery
        await waitFor(() => {
          expect(screen.getByText('Test Garden')).toBeInTheDocument()
        })
      }
    })

    it('should handle garden creation workflow', async () => {
      render(<HomePageContent />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Garden')).toBeInTheDocument()
      })

      // Test garden creation (if there's a create button)
      const createButton = screen.queryByRole('button', { name: /nieuwe tuin/i })
      if (createButton) {
        fireEvent.click(createButton)

        // Mock successful creation
        const newGarden = {
          id: 'new-garden-id',
          name: 'New Test Garden',
          description: 'A newly created garden',
          location: 'New Location',
          garden_type: 'vegetable',
          total_area: '150m²',
          length: '15m',
          width: '10m',
          established_date: '2024-01-01',
          season_year: 2024,
          notes: 'New garden notes',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          canvas_width: 900,
          canvas_height: 700,
          grid_size: 22,
          default_zoom: 1,
          show_grid: true,
          snap_to_grid: true,
          background_color: '#d0d0d0'
        }

        mockTuinService.create.mockResolvedValue({
          success: true,
          data: newGarden,
          error: null
        })

        // Verify creation workflow
        await waitFor(() => {
          expect(mockTuinService.create).toHaveBeenCalled()
        })
      }
    })

    it('should handle responsive design and accessibility', async () => {
      render(<HomePageContent />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Garden')).toBeInTheDocument()
      })

      // Test accessibility features
      const mainContent = screen.getByRole('main') || screen.getByRole('region') || document.body
      
      // Verify proper heading structure
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Verify search input has proper label
      const searchInput = screen.getByPlaceholderText(/zoeken/i)
      expect(searchInput).toHaveAttribute('aria-label') || expect(searchInput).toHaveAttribute('aria-labelledby')

      // Verify garden cards have proper structure
      const gardenCards = screen.getAllByRole('article') || screen.getAllByRole('button')
      expect(gardenCards.length).toBeGreaterThan(0)

      // Test keyboard navigation
      searchInput.focus()
      expect(searchInput).toHaveFocus()

      // Test tab navigation
      const focusableElements = screen.getAllByRole('button').concat(screen.getAllByRole('input'))
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
        expect(focusableElements[0]).toHaveFocus()
      }
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle large datasets efficiently', async () => {
      // Create a large dataset
      const largeGardenArray = Array.from({ length: 100 }, (_, i) => ({
        ...mockGardensArray[0],
        id: `garden-${i}`,
        name: `Garden ${i}`,
        created_at: new Date(2024, 0, i + 1).toISOString()
      }))

      mockTuinService.getAll.mockResolvedValue({
        success: true,
        data: {
          data: largeGardenArray.slice(0, 12), // First page
          page: 1,
          total_pages: Math.ceil(largeGardenArray.length / 12),
          total_count: largeGardenArray.length
        },
        error: null
      })

      render(<HomePageContent />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Garden 0')).toBeInTheDocument()
      })

      // Verify pagination works with large datasets
      const loadMoreButton = screen.queryByText(/meer laden/i)
      if (loadMoreButton) {
        // Mock next page
        mockTuinService.getAll.mockResolvedValue({
          success: true,
          data: {
            data: largeGardenArray.slice(12, 24), // Second page
            page: 2,
            total_pages: Math.ceil(largeGardenArray.length / 12),
            total_count: largeGardenArray.length
          },
          error: null
        })

        fireEvent.click(loadMoreButton)

        // Verify second page loads
        await waitFor(() => {
          expect(screen.getByText('Garden 12')).toBeInTheDocument()
        })
      }
    })

    it('should handle network failures gracefully', async () => {
      // Mock network failure
      mockTuinService.getAll.mockRejectedValue(new Error('Network error'))

      render(<HomePageContent />)

      // Verify error state is shown
      await waitFor(() => {
        expect(screen.getByText(/fout bij laden van tuinen/i)).toBeInTheDocument()
      })

      // Test retry functionality
      const retryButton = screen.getByRole('button', { name: /opnieuw proberen/i })
      if (retryButton) {
        // Mock successful retry
        mockTuinService.getAll.mockResolvedValue({
          success: true,
          data: {
            data: mockGardensArray,
            page: 1,
            total_pages: 1,
            total_count: mockGardensArray.length
          },
          error: null
        })

        fireEvent.click(retryButton)

        // Verify recovery
        await waitFor(() => {
          expect(screen.getByText('Test Garden')).toBeInTheDocument()
        })
      }
    })
  })
})