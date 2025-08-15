import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/components/theme-provider';

// Mock the next-themes ThemeProvider
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="next-themes-provider" {...props}>
      {children}
    </div>
  )
}));

describe('ThemeProvider Component', () => {
  it('should render with children', () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );
    
    const provider = getByTestId('next-themes-provider');
    expect(provider).toBeInTheDocument();
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ThemeProvider>
    );
    
    const provider = getByTestId('next-themes-provider');
    expect(provider).toBeInTheDocument();
    expect(getByText('Child 1')).toBeInTheDocument();
    expect(getByText('Child 2')).toBeInTheDocument();
    expect(getByText('Child 3')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    const { getByTestId } = render(<ThemeProvider />);
    
    const provider = getByTestId('next-themes-provider');
    expect(provider).toBeInTheDocument();
  });

  it('should accept props without errors', () => {
    const testProps = {
      attribute: 'class',
      defaultTheme: 'system',
      enableSystem: true
    };

    expect(() => {
      render(
        <ThemeProvider {...testProps}>
          <div>Test Child</div>
        </ThemeProvider>
      );
    }).not.toThrow();
  });
});