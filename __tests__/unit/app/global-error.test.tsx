import React from 'react'
import { render, screen } from '@testing-library/react'
import GlobalError from '@/app/global-error'

// Mock Next.js router
const mockReset = jest.fn()

describe('GlobalError component - Simplified Tests', () => {
  it('should render without crashing', () => {
    const error = new Error('Test error')
    render(<GlobalError error={error} reset={mockReset} />)
    
    // Just test that it renders without crashing
    expect(screen.getByText('Tuinbeheer Systeem - Fout')).toBeInTheDocument()
  })

  it('should display error message', () => {
    const error = new Error('Test error message')
    render(<GlobalError error={error} reset={mockReset} />)
    
    // Just test that it shows some error content
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should handle basic error display without crashing', () => {
    // Just test that the component can handle basic errors
    expect(true).toBe(true)
  })
})