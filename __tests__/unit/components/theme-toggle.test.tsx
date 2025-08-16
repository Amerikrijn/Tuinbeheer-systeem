import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe.skip('ThemeToggle', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the mounted state to be false initially
    jest.spyOn(React, 'useState').mockImplementation((initialValue) => {
      if (initialValue === false) {
        return [false, jest.fn()]
      }
      return [initialValue, jest.fn()]
    })
    
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'light',
      systemTheme: 'light',
      resolvedTheme: 'light'
    })
  })

  it('renders loading state initially', () => {
    render(<ThemeToggle />)
    
    expect(screen.getByText('Theme toggle laden...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders light theme icon when theme is light', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'light',
      systemTheme: 'light',
      resolvedTheme: 'light'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Huidige thema: Licht/)).toBeInTheDocument()
    })
    
    expect(screen.getByText('Thema wijzigen')).toBeInTheDocument()
  })

  it('renders dark theme icon when theme is dark', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'dark',
      systemTheme: 'light',
      resolvedTheme: 'dark'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Huidige thema: Donker/)).toBeInTheDocument()
    })
  })

  it('renders system theme icon when theme is system', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'system',
      systemTheme: 'dark',
      resolvedTheme: 'dark'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Huidige thema: Systeem \(Donker\)/)).toBeInTheDocument()
    })
  })

  it('opens dropdown menu when clicked', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const triggerButton = screen.getByRole('button')
    fireEvent.click(triggerButton)
    
    expect(screen.getByText('Licht')).toBeInTheDocument()
    expect(screen.getByText('Donker')).toBeInTheDocument()
    expect(screen.getByText('Systeem')).toBeInTheDocument()
  })

  it('calls setTheme with light when light option is clicked', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const triggerButton = screen.getByRole('button')
    fireEvent.click(triggerButton)
    
    const lightOption = screen.getByText('Licht')
    fireEvent.click(lightOption)
    
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme with dark when dark option is clicked', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const triggerButton = screen.getByRole('button')
    fireEvent.click(triggerButton)
    
    const darkOption = screen.getByText('Donker')
    fireEvent.click(darkOption)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme with system when system option is clicked', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const triggerButton = screen.getByRole('button')
    fireEvent.click(triggerButton)
    
    const systemOption = screen.getByText('Systeem')
    fireEvent.click(systemOption)
    
    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })

  it('shows checkmark for current light theme', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'light',
      systemTheme: 'light',
      resolvedTheme: 'light'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const triggerButton = screen.getByRole('button')
    fireEvent.click(triggerButton)
    
    const lightOption = screen.getByText('Licht').closest('[role="menuitem"]')
    expect(lightOption).toHaveTextContent('✓')
  })

  it('shows checkmark for current dark theme', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'dark',
      systemTheme: 'light',
      resolvedTheme: 'dark'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const triggerButton = screen.getByRole('button')
    fireEvent.click(triggerButton)
    
    const darkOption = screen.getByText('Donker').closest('[role="menuitem"]')
    expect(darkOption).toHaveTextContent('✓')
  })

  it('shows checkmark for current system theme', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'system',
      systemTheme: 'dark',
      resolvedTheme: 'dark'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const triggerButton = screen.getByRole('button')
    fireEvent.click(triggerButton)
    
    const systemOption = screen.getByText('Systeem').closest('[role="menuitem"]')
    expect(systemOption).toHaveTextContent('✓')
  })

  it('displays correct theme description for system theme with light system', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'system',
      systemTheme: 'light',
      resolvedTheme: 'light'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Huidige thema: Systeem \(Licht\)/)).toBeInTheDocument()
    })
  })

  it('displays correct theme description for system theme with dark system', async () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'system',
      systemTheme: 'dark',
      resolvedTheme: 'dark'
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Huidige thema: Systeem \(Donker\)/)).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
    expect(button).toHaveAttribute('class')
  })

  it('renders with correct styling classes', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-muted-foreground', 'hover:text-foreground', 'focus:ring-2', 'focus:ring-primary')
  })

  it('handles theme changes correctly', async () => {
    const { rerender } = render(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    
    // Change theme to dark
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'dark',
      systemTheme: 'light',
      resolvedTheme: 'dark'
    })
    
    rerender(<ThemeToggle />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Huidige thema: Donker/)).toBeInTheDocument()
    })
  })
})