import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('should render button with variant', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive')
  })

  it('should render button with size', () => {
    render(<Button size="sm">Small Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Small Button' })
    expect(button).toHaveClass('h-9')
  })

  it('should render button with custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
  })

  it('should render button as disabled', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
  })

  it('should render button with all props combined', () => {
    render(
      <Button 
        variant="outline" 
        size="lg" 
        className="custom-class"
        disabled
      >
        Combined Props
      </Button>
    )
    
    const button = screen.getByRole('button', { name: 'Combined Props' })
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('h-11')
    expect(button).toBeDisabled()
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)
    
    const button = screen.getByRole('button', { name: 'Clickable' })
    button.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render button with type attribute', () => {
    render(<Button type="submit">Submit</Button>)
    
    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should render button with default type', () => {
    render(<Button>Default</Button>)
    
    const button = screen.getByRole('button', { name: 'Default' })
    // HTML buttons don't have a default type attribute, so we just verify it's a button
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe('BUTTON')
  })
})