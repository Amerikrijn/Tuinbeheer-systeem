import React from 'react'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock Radix UI components with proper ref forwarding
jest.mock('@radix-ui/react-avatar', () => ({
  Root: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div ref={ref} className={className} {...props}>{children}</div>
  )),
  Image: React.forwardRef(({ className, ...props }: any, ref: any) => (
    <img ref={ref} className={className} {...props} />
  )),
  Fallback: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div ref={ref} className={className} {...props}>{children}</div>
  )),
}))

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('renders correctly with default props', () => {
      render(<Avatar data-testid="test-avatar" />)
      expect(screen.getByTestId('test-avatar')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Avatar className="custom-class" data-testid="test-avatar" />)
      const avatar = screen.getByTestId('test-avatar')
      expect(avatar).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<Avatar data-testid="test-avatar" />)
      const avatar = screen.getByTestId('test-avatar')
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'shrink-0', 'overflow-hidden', 'rounded-full')
    })

    it('renders children correctly', () => {
      render(
        <Avatar data-testid="test-avatar">
          <div data-testid="child">Child content</div>
        </Avatar>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Avatar ref={ref} data-testid="test-avatar" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Avatar data-testid="test-avatar" aria-label="Test avatar" />)
      const avatar = screen.getByTestId('test-avatar')
      expect(avatar).toHaveAttribute('aria-label', 'Test avatar')
    })
  })

  describe('AvatarImage', () => {
    it('renders correctly with default props', () => {
      render(<AvatarImage data-testid="test-image" />)
      expect(screen.getByTestId('test-image')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<AvatarImage className="custom-class" data-testid="test-image" />)
      const image = screen.getByTestId('test-image')
      expect(image).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<AvatarImage data-testid="test-image" />)
      const image = screen.getByTestId('test-image')
      expect(image).toHaveClass('aspect-square', 'h-full', 'w-full')
    })

    it('renders as img element', () => {
      render(<AvatarImage data-testid="test-image" />)
      const image = screen.getByTestId('test-image')
      expect(image.tagName).toBe('IMG')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLImageElement>()
      render(<AvatarImage ref={ref} data-testid="test-image" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<AvatarImage data-testid="test-image" src="/test.jpg" alt="Test avatar" />)
      const image = screen.getByTestId('test-image')
      expect(image).toHaveAttribute('src', '/test.jpg')
      expect(image).toHaveAttribute('alt', 'Test avatar')
    })
  })

  describe('AvatarFallback', () => {
    it('renders correctly with default props', () => {
      render(<AvatarFallback data-testid="test-fallback" />)
      expect(screen.getByTestId('test-fallback')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<AvatarFallback className="custom-class" data-testid="test-fallback" />)
      const fallback = screen.getByTestId('test-fallback')
      expect(fallback).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<AvatarFallback data-testid="test-fallback" />)
      const fallback = screen.getByTestId('test-fallback')
      expect(fallback).toHaveClass('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'rounded-full', 'bg-muted')
    })

    it('renders as div element', () => {
      render(<AvatarFallback data-testid="test-fallback" />)
      const fallback = screen.getByTestId('test-fallback')
      expect(fallback.tagName).toBe('DIV')
    })

    it('renders children correctly', () => {
      render(
        <AvatarFallback data-testid="test-fallback">
          <span data-testid="child">JD</span>
        </AvatarFallback>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<AvatarFallback ref={ref} data-testid="test-fallback" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<AvatarFallback data-testid="test-fallback" aria-label="Test fallback" />)
      const fallback = screen.getByTestId('test-fallback')
      expect(fallback).toHaveAttribute('aria-label', 'Test fallback')
    })
  })

  describe('Avatar Composition', () => {
    it('combines default and custom classes correctly', () => {
      render(<Avatar className="custom-avatar-class" data-testid="test-avatar" />)
      const avatar = screen.getByTestId('test-avatar')
      expect(avatar).toHaveClass('custom-avatar-class')
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10')
    })

    it('handles multiple custom classes', () => {
      render(<Avatar className="class1 class2 class3" data-testid="test-avatar" />)
      const avatar = screen.getByTestId('test-avatar')
      expect(avatar).toHaveClass('class1', 'class2', 'class3')
    })

    it('renders complete avatar structure', () => {
      render(
        <Avatar data-testid="test-avatar">
          <AvatarImage data-testid="test-image" src="/test.jpg" alt="Test" />
          <AvatarFallback data-testid="test-fallback">JD</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByTestId('test-avatar')).toBeInTheDocument()
      expect(screen.getByTestId('test-image')).toBeInTheDocument()
      expect(screen.getByTestId('test-fallback')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(<Avatar data-testid="test-avatar" />)
      expect(screen.getByTestId('test-avatar')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<Avatar data-testid="test-avatar">{null}</Avatar>)
      expect(screen.getByTestId('test-avatar')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Avatar data-testid="test-avatar">{undefined}</Avatar>)
      expect(screen.getByTestId('test-avatar')).toBeInTheDocument()
    })
  })
})