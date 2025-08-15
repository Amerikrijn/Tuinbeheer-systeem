import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading from '@/app/loading';

describe('Loading Component', () => {
  it('should render loading page with correct content', () => {
    render(<Loading />);

    // Check loading text
    expect(screen.getByText('Laden...')).toBeInTheDocument();
    expect(screen.getByText('Een moment geduld alstublieft')).toBeInTheDocument();
  });

  it('should have proper heading structure', () => {
    render(<Loading />);

    // Check that the loading heading is properly structured
    expect(screen.getByRole('heading', { name: 'Laden...' })).toBeInTheDocument();
  });

  it('should display loading spinner icon', () => {
    render(<Loading />);

    // Check that the Loader2 icon is present with correct classes
    const spinner = document.querySelector('.h-12.w-12.animate-spin.text-green-600');
    expect(spinner).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<Loading />);

    // Check that the main container has proper classes
    const container = document.querySelector('.min-h-screen.flex.items-center.justify-center.bg-gradient-to-br.from-green-50.to-blue-50');
    expect(container).toBeInTheDocument();

    // Check that the content container has proper classes
    const contentContainer = document.querySelector('.text-center.space-y-4');
    expect(contentContainer).toBeInTheDocument();
  });

  it('should have proper text colors', () => {
    render(<Loading />);

    // Check that the heading has the correct text color class
    const heading = document.querySelector('.text-xl.font-semibold.text-gray-700');
    expect(heading).toBeInTheDocument();

    // Check that the description has the correct text color class
    const description = document.querySelector('.text-gray-500');
    expect(description).toBeInTheDocument();
  });

  it('should be centered on the screen', () => {
    render(<Loading />);

    // Check that the component uses flexbox centering
    const container = document.querySelector('.flex.items-center.justify-center');
    expect(container).toBeInTheDocument();
  });
});