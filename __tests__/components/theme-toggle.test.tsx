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

  it('shows correct theme description', async () => {
    render(<ThemeToggle />)

    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled())

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Huidige thema: Licht. Klik om te wijzigen.'
    )
  })

  it('renders theme toggle button', async () => {
    render(<ThemeToggle />)

    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled())

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Huidige thema: Licht. Klik om te wijzigen.')
  })
})
