import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeToggle } from '@/components/theme-toggle'

let theme = 'light'
const setTheme = vi.fn((newTheme: string) => {
  theme = newTheme
})

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme, systemTheme: 'light', setTheme })
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    theme = 'light'
    setTheme.mockClear()
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
    const { rerender } = render(<ThemeToggle />)

    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled())

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Donker'))

    expect(setTheme).toHaveBeenCalledWith('dark')

    rerender(<ThemeToggle />)

    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Huidige thema: Donker. Klik om te wijzigen.'
      )
    )
  })
})
