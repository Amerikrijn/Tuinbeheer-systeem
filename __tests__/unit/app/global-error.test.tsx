import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalError from '@/app/global-error';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock window.location
const mockLocation = {
  reload: jest.fn(),
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe.skip('GlobalError Component', () => {
  const mockError = new Error('Test global error message');
  const mockReset = jest.fn();

  beforeEach(() => {
    mockReset.mockClear();
    mockLocation.reload.mockClear();
    mockLocation.href = '';
  });

  it('should render global error page with correct content', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    // Check main heading and description
    expect(screen.getByText('Tuinbeheer Systeem - Fout')).toBeInTheDocument();
    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument();

    // Check error details section
    expect(screen.getByText('Foutdetails:')).toBeInTheDocument();
    expect(screen.getByText('Test global error message')).toBeInTheDocument();

    // Check help section
    expect(screen.getByText('Wat kunt u doen:')).toBeInTheDocument();
    expect(screen.getByText(/Probeer de pagina te vernieuwen/)).toBeInTheDocument();

    // Check technical information section
    expect(screen.getByText('Technische informatie:')).toBeInTheDocument();
    expect(screen.getByText(/Tijdstip:/)).toBeInTheDocument();
    expect(screen.getByText(/Platform:/)).toBeInTheDocument();
    expect(screen.getByText(/Omgeving:/)).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByText('Opnieuw Proberen')).toBeInTheDocument();
    expect(screen.getByText('Pagina Vernieuwen')).toBeInTheDocument();
    expect(screen.getByText('Hoofdpagina')).toBeInTheDocument();
  });

  it('should call reset function when retry button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const retryButton = screen.getByText('Opnieuw Proberen');
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should reload page when refresh button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const refreshButton = screen.getByText('Pagina Vernieuwen');
    fireEvent.click(refreshButton);

    expect(mockLocation.reload).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home when home button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const homeButton = screen.getByText('Hoofdpagina');
    fireEvent.click(homeButton);

    expect(mockLocation.href).toBe('/');
  });

  it('should handle error without message', () => {
    const errorWithoutMessage = new Error();
    render(<GlobalError error={errorWithoutMessage} reset={mockReset} />);

    // There are multiple elements with this text, so use getAllByText
    const elements = screen.getAllByText('Er is een onverwachte fout opgetreden');
    expect(elements).toHaveLength(2);
  });

  it('should display error digest when available', () => {
    const errorWithDigest = new Error('Test error');
    (errorWithDigest as any).digest = 'global-error-123';
    
    render(<GlobalError error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText('Error ID: global-error-123')).toBeInTheDocument();
  });

  it('should not display error digest when not available', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it('should log error to console', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith('Global error:', mockError);
  });

  it('should have proper accessibility attributes', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    // Check that buttons are accessible
    expect(screen.getByRole('button', { name: 'Opnieuw Proberen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pagina Vernieuwen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hoofdpagina' })).toBeInTheDocument();

    // Check that headings are properly structured
    expect(screen.getByRole('heading', { name: 'Tuinbeheer Systeem - Fout' })).toBeInTheDocument();
  });

  it('should display current timestamp', () => {
    const mockDate = new Date('2024-01-01T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText(/Tijdstip:/)).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it('should display platform information', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    // Should show 'Browser' since we're in a test environment
    expect(screen.getByText(/Platform: Browser/)).toBeInTheDocument();
  });

  it('should display environment information', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText(/Omgeving: test/)).toBeInTheDocument();
  });
});