import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
  it('renders correctly with children', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
  })

  it('renders with custom className', () => {
    render(<Label className="custom-class">Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('custom-class')
  })

  it('applies default classes', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>()
    render(<Label ref={ref}>Test Label</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('spreads additional props', () => {
    render(<Label data-testid="custom-label" htmlFor="input-id">Test Label</Label>)
    const label = screen.getByTestId('custom-label')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('can be associated with form controls', () => {
    render(<Label htmlFor="email-input">Email Address</Label>)
    const label = screen.getByText('Email Address')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('handles empty children', () => {
    render(<Label></Label>)
    const label = screen.getByRole('generic')
    expect(label).toBeInTheDocument()
  })
})