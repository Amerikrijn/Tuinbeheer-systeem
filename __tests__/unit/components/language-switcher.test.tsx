import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageSwitcher } from '@/components/language-switcher';

// Mock the useLanguage hook
const mockUseLanguage = jest.fn();
jest.mock('@/hooks/use-language', () => ({
  useLanguage: () => mockUseLanguage()
}));

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-testid="language-switcher-button"
      {...props}
    >
      {children}
    </button>
  )
}));

// Mock the Globe icon
jest.mock('lucide-react', () => ({
  Globe: ({ className, ...props }: any) => (
    <span data-testid="globe-icon" className={className} {...props}>
      🌐
    </span>
  )
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    mockUseLanguage.mockClear();
  });

  it('should render with Dutch language by default', () => {
    mockUseLanguage.mockReturnValue({
      language: 'nl',
      setLanguage: jest.fn()
    });

    render(<LanguageSwitcher />);
    
    const button = screen.getByTestId('language-switcher-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('EN');
    expect(button).toHaveClass('text-white', 'hover:bg-green-700');
  });

  it('should render with English language when set', () => {
    mockUseLanguage.mockReturnValue({
      language: 'en',
      setLanguage: jest.fn()
    });

    render(<LanguageSwitcher />);
    
    const button = screen.getByTestId('language-switcher-button');
    expect(button).toHaveTextContent('NL');
  });

  it('should render with Dutch language when language is undefined', () => {
    mockUseLanguage.mockReturnValue({
      language: undefined,
      setLanguage: jest.fn()
    });

    render(<LanguageSwitcher />);
    
    const button = screen.getByTestId('language-switcher-button');
    expect(button).toHaveTextContent('EN');
  });

  it('should call setLanguage with correct language when clicked', () => {
    const mockSetLanguage = jest.fn();
    mockUseLanguage.mockReturnValue({
      language: 'nl',
      setLanguage: mockSetLanguage
    });

    render(<LanguageSwitcher />);
    
    const button = screen.getByTestId('language-switcher-button');
    fireEvent.click(button);
    
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('should call setLanguage with Dutch when current language is English', () => {
    const mockSetLanguage = jest.fn();
    mockUseLanguage.mockReturnValue({
      language: 'en',
      setLanguage: mockSetLanguage
    });

    render(<LanguageSwitcher />);
    
    const button = screen.getByTestId('language-switcher-button');
    fireEvent.click(button);
    
    expect(mockSetLanguage).toHaveBeenCalledWith('nl');
  });

  it('should render globe icon', () => {
    mockUseLanguage.mockReturnValue({
      language: 'nl',
      setLanguage: jest.fn()
    });

    render(<LanguageSwitcher />);
    
    const globeIcon = screen.getByTestId('globe-icon');
    expect(globeIcon).toBeInTheDocument();
    expect(globeIcon).toHaveClass('h-4', 'w-4', 'mr-2');
  });
});