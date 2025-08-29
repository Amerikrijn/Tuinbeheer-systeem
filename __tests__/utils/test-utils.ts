import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { LanguageProvider } from '@/hooks/use-language';
import { ThemeProvider } from 'next-themes';
import { SupabaseAuthProvider } from '@/components/auth/supabase-auth-provider';

// Mock providers for testing
const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(LanguageProvider, {}, children);
};

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(ThemeProvider, { 
    attribute: "class", 
    defaultTheme: "light", 
    enableSystem: true 
  }, children);
};

const MockSupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(SupabaseAuthProvider, {}, children);
};

// Custom render function with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(MockThemeProvider, {},
    React.createElement(MockSupabaseAuthProvider, {},
      React.createElement(MockLanguageProvider, {}, children)
    )
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Export individual providers for specific test needs
export { MockLanguageProvider, MockThemeProvider, MockSupabaseAuthProvider, AllTheProviders };