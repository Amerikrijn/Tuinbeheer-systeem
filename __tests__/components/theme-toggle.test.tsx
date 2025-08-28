import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'light',
      systemTheme: 'light',
      resolvedTheme: 'light'
    })
  })

  it('renders current theme', async () => {
    render(<ThemeToggle />)

    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled())

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Huidige thema: Licht. Klik om te wijzigen.'
    )
  })

  it('changes theme when selecting option', async () => {
    render(<ThemeToggle />)

    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled())

    fireEvent.click(screen.getByRole('button'))
    
    // Wait for dropdown menu to appear
    await waitFor(() => expect(screen.getByText('Donker')).toBeInTheDocument())
    
    fireEvent.click(screen.getByText('Donker'))

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
