import React from 'react'
import { render, screen } from '@testing-library/react'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'

// Mock input-otp
jest.mock('input-otp', () => ({
  OTPInput: ({ children, className, containerClassName, ...props }: any) => (
    <div data-testid="otp-input" className={className} data-container-class={containerClassName} {...props}>{children}</div>
  ),
  OTPInputContext: React.createContext({
    slots: [
      { char: '1', hasFakeCaret: false, isActive: false },
      { char: '2', hasFakeCaret: true, isActive: true },
      { char: '3', hasFakeCaret: false, isActive: false },
      { char: '4', hasFakeCaret: false, isActive: false }
    ]
  })
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Dot: ({ className }: any) => <svg data-testid="dot-icon" className={className} />
}))

describe('InputOTP Components', () => {
  describe('InputOTP', () => {
    it('renders correctly with default props', () => {
      render(<InputOTP data-testid="test-input-otp" />)
      expect(screen.getByTestId('otp-input')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<InputOTP className="custom-class" data-testid="test-input-otp" />)
      const input = screen.getByTestId('otp-input')
      expect(input).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<InputOTP data-testid="test-input-otp" />)
      const input = screen.getByTestId('otp-input')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
    })

    it('applies containerClassName', () => {
      render(<InputOTP containerClassName="custom-container" data-testid="test-input-otp" />)
      const input = screen.getByTestId('otp-input')
      expect(input).toHaveAttribute('data-container-class', 'custom-container')
    })

    it('applies default container classes', () => {
      render(<InputOTP data-testid="test-input-otp" />)
      const input = screen.getByTestId('otp-input')
      expect(input).toHaveAttribute('data-container-class', 'flex items-center gap-2 has-[:disabled]:opacity-50')
    })

    it('renders children correctly', () => {
      render(
        <InputOTP>
          <div data-testid="child">Child content</div>
        </InputOTP>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<InputOTP ref={ref} data-testid="test-input-otp" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<InputOTP data-testid="test-input-otp" aria-label="Test input" />)
      const input = screen.getByTestId('otp-input')
      expect(input).toHaveAttribute('aria-label', 'Test input')
    })
  })

  describe('InputOTPGroup', () => {
    it('renders correctly with default props', () => {
      render(<InputOTPGroup data-testid="test-group" />)
      expect(screen.getByTestId('test-group')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<InputOTPGroup data-testid="test-group" />)
      const group = screen.getByTestId('test-group')
      expect(group.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<InputOTPGroup className="custom-class" data-testid="test-group" />)
      const group = screen.getByTestId('test-group')
      expect(group).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<InputOTPGroup data-testid="test-group" />)
      const group = screen.getByTestId('test-group')
      expect(group).toHaveClass('flex', 'items-center')
    })

    it('renders children correctly', () => {
      render(
        <InputOTPGroup>
          <div data-testid="child">Group content</div>
        </InputOTPGroup>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<InputOTPGroup ref={ref} data-testid="test-group" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<InputOTPGroup data-testid="test-group" aria-label="Test group" />)
      const group = screen.getByTestId('test-group')
      expect(group).toHaveAttribute('aria-label', 'Test group')
    })
  })

  describe('InputOTPSlot', () => {
    it('renders correctly with default props', () => {
      render(<InputOTPSlot index={0} data-testid="test-slot" />)
      expect(screen.getByTestId('test-slot')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<InputOTPSlot index={0} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<InputOTPSlot index={0} className="custom-class" data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<InputOTPSlot index={0} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'items-center', 'justify-center', 'border-y', 'border-r', 'border-input', 'text-sm', 'transition-all')
    })

    it('applies first slot classes', () => {
      render(<InputOTPSlot index={0} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot).toHaveClass('first:rounded-l-md', 'first:border-l')
    })

    it('applies last slot classes', () => {
      render(<InputOTPSlot index={3} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot).toHaveClass('last:rounded-r-md')
    })

    it('applies active state classes when isActive is true', () => {
      render(<InputOTPSlot index={1} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot).toHaveClass('z-10', 'ring-2', 'ring-ring', 'ring-offset-background')
    })

    it('renders character from context', () => {
      render(<InputOTPSlot index={0} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot).toHaveTextContent('1')
    })

    it('renders fake caret when hasFakeCaret is true', () => {
      render(<InputOTPSlot index={1} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      const caret = slot.querySelector('.animate-caret-blink')
      expect(caret).toBeInTheDocument()
    })

    it('applies fake caret classes', () => {
      render(<InputOTPSlot index={1} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      const caret = slot.querySelector('.animate-caret-blink')
      expect(caret).toHaveClass('pointer-events-none', 'absolute', 'inset-0', 'flex', 'items-center', 'justify-center')
    })

    it('applies caret line classes', () => {
      render(<InputOTPSlot index={1} data-testid="test-slot" />)
      const slot = screen.getByTestId('test-slot')
      const caretLine = slot.querySelector('.h-4.w-px.animate-caret-blink.bg-foreground.duration-1000')
      expect(caretLine).toHaveClass('h-4', 'w-px', 'animate-caret-blink', 'bg-foreground', 'duration-1000')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<InputOTPSlot index={0} ref={ref} data-testid="test-slot" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<InputOTPSlot index={0} data-testid="test-slot" aria-label="Test slot" />)
      const slot = screen.getByTestId('test-slot')
      expect(slot).toHaveAttribute('aria-label', 'Test slot')
    })
  })

  describe('InputOTPSeparator', () => {
    it('renders correctly with default props', () => {
      render(<InputOTPSeparator data-testid="test-separator" />)
      expect(screen.getByTestId('test-separator')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<InputOTPSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator.tagName).toBe('DIV')
    })

    it('sets role to separator', () => {
      render(<InputOTPSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveAttribute('role', 'separator')
    })

    it('renders dot icon', () => {
      render(<InputOTPSeparator data-testid="test-separator" />)
      expect(screen.getByTestId('dot-icon')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<InputOTPSeparator ref={ref} data-testid="test-separator" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<InputOTPSeparator data-testid="test-separator" aria-label="Test separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveAttribute('aria-label', 'Test separator')
    })
  })

  describe('InputOTP Composition', () => {
    it('renders complete OTP input structure', () => {
      render(
        <InputOTP>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSeparator />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      )

      expect(screen.getByTestId('otp-input')).toBeInTheDocument()
      expect(screen.getByTestId('test-group')).toBeInTheDocument()
      expect(screen.getAllByTestId('test-slot')).toHaveLength(4)
      expect(screen.getByTestId('test-separator')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <InputOTP>
          <InputOTPGroup></InputOTPGroup>
        </InputOTP>
      )
      expect(screen.getByTestId('otp-input')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <InputOTP>
          <InputOTPGroup>{null}</InputOTPGroup>
        </InputOTP>
      )
      expect(screen.getByTestId('otp-input')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <InputOTP>
          <InputOTPGroup>{undefined}</InputOTPGroup>
        </InputOTP>
      )
      expect(screen.getByTestId('otp-input')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<InputOTP className="custom-input-class" data-testid="test-input-otp" />)
      const input = screen.getByTestId('otp-input')
      expect(input).toHaveClass('custom-input-class')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
    })

    it('handles multiple custom classes', () => {
      render(<InputOTP className="class1 class2 class3" data-testid="test-input-otp" />)
      const input = screen.getByTestId('otp-input')
      expect(input).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <InputOTP>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>
      )

      const input = screen.getByTestId('otp-input')
      const group = screen.getByTestId('test-group')
      expect(input).toContainElement(group)
    })

    it('renders with different slot indices', () => {
      render(
        <InputOTP>
          <InputOTPGroup>
            <InputOTPSlot index={0} data-testid="slot-0" />
            <InputOTPSlot index={1} data-testid="slot-1" />
            <InputOTPSlot index={2} data-testid="slot-2" />
            <InputOTPSlot index={3} data-testid="slot-3" />
          </InputOTPGroup>
        </InputOTP>
      )

      expect(screen.getByTestId('slot-0')).toBeInTheDocument()
      expect(screen.getByTestId('slot-1')).toBeInTheDocument()
      expect(screen.getByTestId('slot-2')).toBeInTheDocument()
      expect(screen.getByTestId('slot-3')).toBeInTheDocument()
    })

    it('renders with multiple separators', () => {
      render(
        <InputOTP>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSeparator />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSeparator />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      )

      const separators = screen.getAllByTestId('test-separator')
      expect(separators).toHaveLength(2)
    })

    it('renders with complex OTP structure', () => {
      render(
        <InputOTP>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSeparator />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSeparator />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            <InputOTPSeparator />
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
          </InputOTPGroup>
        </InputOTP>
      )

      expect(screen.getAllByTestId('test-slot')).toHaveLength(8)
      expect(screen.getAllByTestId('test-separator')).toHaveLength(3)
    })
  })
})