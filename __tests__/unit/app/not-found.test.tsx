import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '@/app/not-found';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('NotFound Component', () => {
  it('should render 404 page with correct content', () => {
    render(<NotFound />);

    // Check main heading and description
    expect(screen.getByText('Tuinbeheer Systeem')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();

    // Check 404 title
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();

    // Check error message
    expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument();

    // Check debug information
    expect(screen.getByText('Debug Informatie')).toBeInTheDocument();
    expect(screen.getByText(/Pagina niet gevonden/)).toBeInTheDocument();

    // Check common pages section
    expect(screen.getByText('Common Pages:')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tuinen')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    // Check quick actions section
    expect(screen.getByText('Quick Actions:')).toBeInTheDocument();
    expect(screen.getByText('Go to Home Page')).toBeInTheDocument();
    expect(screen.getByText('View Gardens')).toBeInTheDocument();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('should have proper navigation links', () => {
    render(<NotFound />);

    // Check that all navigation links are present
    const homeLink = screen.getByRole('link', { name: /Dashboard/ });
    const gardensLink = screen.getByRole('link', { name: /Tuinen/ });
    
    // There are multiple Admin links, so use getAllByRole
    const adminLinks = screen.getAllByRole('link', { name: /Admin/ });
    expect(adminLinks).toHaveLength(2);

    expect(homeLink).toHaveAttribute('href', '/');
    expect(gardensLink).toHaveAttribute('href', '/gardens');
    expect(adminLinks[0]).toHaveAttribute('href', '/admin');
    expect(adminLinks[1]).toHaveAttribute('href', '/admin');
  });

  it('should have proper button accessibility', () => {
    render(<NotFound />);

    // Check that the action links are accessible (they're rendered as links, not buttons)
    expect(screen.getByRole('link', { name: 'Go to Home Page' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Gardens' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin Panel' })).toBeInTheDocument();
  });

  it('should have proper heading structure', () => {
    render(<NotFound />);

    // Check that headings are properly structured
    expect(screen.getByRole('heading', { name: 'Tuinbeheer Systeem' })).toBeInTheDocument();
    
    // The 404 title is not a heading, it's a div with text
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });

  it('should display correct icons', () => {
    render(<NotFound />);

    // Check that TreePine icon is present in the header
    const treeIcon = document.querySelector('.h-7.w-7.text-green-600');
    expect(treeIcon).toBeInTheDocument();

    // Check that AlertCircle icon is present in the error title
    const alertIcon = document.querySelector('.h-5.w-5');
    expect(alertIcon).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<NotFound />);

    // Check that the main container has proper classes
    const container = document.querySelector('.container.mx-auto.space-y-6.p-6');
    expect(container).toBeInTheDocument();

    // Check that the error card has proper styling
    const errorCard = document.querySelector('.border-red-200.bg-red-50');
    expect(errorCard).toBeInTheDocument();
  });
});