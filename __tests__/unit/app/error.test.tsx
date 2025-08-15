import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Import the component after setting up mocks
let ErrorComponent: any;
beforeAll(async () => {
  const module = await import('@/app/error');
  ErrorComponent = module.default;
});

describe('Error Component', () => {
  const mockError = new Error('Test error message');
  const mockReset = jest.fn();

  beforeEach(() => {
    mockReset.mockClear();
  });

  it('should render error page with correct content', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    // Check main heading and description
    expect(screen.getByText('Tuinbeheer Systeem')).toBeInTheDocument();
    expect(screen.getByText('Garden Management System')).toBeInTheDocument();

    // Check error title
    expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();

    // Check error message
    expect(screen.getByText('Foutmelding:')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByText('Probeer Opnieuw')).toBeInTheDocument();
    expect(screen.getByText('Naar Hoofdpagina')).toBeInTheDocument();

    // Check help text
    expect(screen.getByText('Wat kunt u doen:')).toBeInTheDocument();
    expect(screen.getByText(/Probeer de pagina te vernieuwen/)).toBeInTheDocument();
  });

  it('should call reset function when retry button is clicked', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    const retryButton = screen.getByText('Probeer Opnieuw');
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should handle error without message', () => {
    const errorWithoutMessage = new Error();
    render(<ErrorComponent error={errorWithoutMessage} reset={mockReset} />);

    expect(screen.getByText('Er is een onverwachte fout opgetreden')).toBeInTheDocument();
  });

  it('should display error digest when available', () => {
    const errorWithDigest = new Error('Test error');
    (errorWithDigest as any).digest = 'error-123';
    
    render(<ErrorComponent error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText('Error ID: error-123')).toBeInTheDocument();
  });

  it('should not display error digest when not available', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it('should log error to console', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith('Application error:', mockError);
  });

  it('should have proper accessibility attributes', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    // Check that buttons are accessible
    expect(screen.getByRole('button', { name: 'Probeer Opnieuw' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Naar Hoofdpagina' })).toBeInTheDocument();

    // Check that headings are properly structured
    expect(screen.getByRole('heading', { name: 'Tuinbeheer Systeem' })).toBeInTheDocument();
  });
});