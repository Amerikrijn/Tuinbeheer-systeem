import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('input-otp', () => ({
  OTPInput: React.forwardRef(({ className, containerClassName, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="otp-input"
      className={className}
      data-container-class={containerClassName}
      {...props}
    >
      {children}
    </div>
  )),
  OTPInputContext: React.createContext({
    slots: {
      0: { char: '', hasFakeCaret: false, isActive: false },
      1: { char: '1', hasFakeCaret: true, isActive: true },
      2: { char: '2', hasFakeCaret: false, isActive: false },
      3: { char: '3', hasFakeCaret: false, isActive: false }
    }
  })
}));

jest.mock('lucide-react', () => ({
  Dot: ({ ...props }: any) => (
    <span data-testid="dot-icon" {...props}>•</span>
  )
}));

describe('InputOTP Components', () => {
  describe('InputOTP', () => {
    it('should render with default props', () => {
      render(<InputOTP />);
      const input = screen.getByTestId('otp-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveAttribute('data-container-class', 'flex items-center gap-2 has-[:disabled]:opacity-50');
    });

    it('should render with custom className', () => {
      render(<InputOTP className="custom-input" />);
      const input = screen.getByTestId('otp-input');
      expect(input).toHaveClass('custom-input');
    });

    it('should render with custom containerClassName', () => {
      render(<InputOTP containerClassName="custom-container" />);
      const input = screen.getByTestId('otp-input');
      expect(input).toHaveAttribute('data-container-class', 'custom-container');
    });

    it('should pass through additional props', () => {
      render(
        <InputOTP
          data-testid="custom-otp"
          maxLength={6}
          placeholder="Enter code"
        />
      );
      const input = screen.getByTestId('custom-otp');
      expect(input).toHaveAttribute('maxLength', '6');
      expect(input).toHaveAttribute('placeholder', 'Enter code');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<InputOTP ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle children', () => {
      render(
        <InputOTP>
          <div>OTP content</div>
        </InputOTP>
      );
      expect(screen.getByText('OTP content')).toBeInTheDocument();
    });
  });

  describe('InputOTPGroup', () => {
    it('should render with default props', () => {
      render(<InputOTPGroup>Group content</InputOTPGroup>);
      const group = screen.getByText('Group content');
      expect(group).toBeInTheDocument();
      expect(group.tagName).toBe('DIV');
      expect(group).toHaveClass('flex', 'items-center');
    });

    it('should render with custom className', () => {
      render(<InputOTPGroup className="custom-group">Custom group</InputOTPGroup>);
      const group = screen.getByText('Custom group');
      expect(group).toHaveClass('custom-group');
    });

    it('should pass through additional props', () => {
      render(
        <InputOTPGroup
          data-testid="custom-group"
          aria-label="OTP group"
        >
          Props test
        </InputOTPGroup>
      );
      const group = screen.getByTestId('custom-group');
      expect(group).toHaveAttribute('aria-label', 'OTP group');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<InputOTPGroup ref={ref}>Ref test</InputOTPGroup>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('InputOTPSlot', () => {
    it('should render with default props', () => {
      render(<InputOTPSlot index={0} />);
      const slot = screen.getByTestId('otp-input');
      expect(slot).toBeInTheDocument();
      expect(slot).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'items-center', 'justify-center', 'border-y', 'border-r', 'border-input', 'text-sm', 'transition-all', 'first:rounded-l-md', 'first:border-l', 'last:rounded-r-md');
    });

    it('should render with custom className', () => {
      render(<InputOTPSlot index={1} className="custom-slot" />);
      const slot = screen.getByTestId('otp-input');
      expect(slot).toHaveClass('custom-slot');
    });

    it('should handle active state', () => {
      render(<InputOTPSlot index={1} />);
      const slot = screen.getByTestId('otp-input');
      expect(slot).toHaveClass('z-10', 'ring-2', 'ring-ring', 'ring-offset-background');
    });

    it('should pass through additional props', () => {
      render(
        <InputOTPSlot
          index={2}
          data-testid="custom-slot"
          aria-label="OTP slot 2"
        />
      );
      const slot = screen.getByTestId('custom-slot');
      expect(slot).toHaveAttribute('aria-label', 'OTP slot 2');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<InputOTPSlot index={3} ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle different indices', () => {
      const { rerender } = render(<InputOTPSlot index={0} />);
      
      // Test first slot
      let slot = screen.getByTestId('otp-input');
      expect(slot).toHaveClass('first:rounded-l-md', 'first:border-l');
      
      // Test last slot
      rerender(<InputOTPSlot index={3} />);
      slot = screen.getByTestId('otp-input');
      expect(slot).toHaveClass('last:rounded-r-md');
    });
  });

  describe('InputOTPSeparator', () => {
    it('should render with default props', () => {
      render(<InputOTPSeparator />);
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
      expect(screen.getByTestId('dot-icon')).toBeInTheDocument();
      expect(screen.getByText('•')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <InputOTPSeparator
          data-testid="custom-separator"
          className="custom-separator"
        />
      );
      const separator = screen.getByTestId('custom-separator');
      expect(separator).toHaveClass('custom-separator');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<InputOTPSeparator ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for InputOTP', () => {
      expect(InputOTP.displayName).toBe('InputOTP');
    });

    it('should have correct displayName for InputOTPGroup', () => {
      expect(InputOTPGroup.displayName).toBe('InputOTPGroup');
    });

    it('should have correct displayName for InputOTPSlot', () => {
      expect(InputOTPSlot.displayName).toBe('InputOTPSlot');
    });

    it('should have correct displayName for InputOTPSeparator', () => {
      expect(InputOTPSeparator.displayName).toBe('InputOTPSeparator');
    });
  });

  describe('Integration', () => {
    it('should render complete OTP input structure', () => {
      render(
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSeparator />
            <InputOTPSlot index={1} />
            <InputOTPSeparator />
            <InputOTPSlot index={2} />
            <InputOTPSeparator />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      );

      expect(screen.getByTestId('otp-input')).toBeInTheDocument();
      expect(screen.getAllByRole('separator')).toHaveLength(3);
      expect(screen.getAllByTestId('dot-icon')).toHaveLength(3);
    });

    it('should handle multiple OTP inputs', () => {
      render(
        <div>
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
          </InputOTP>
          <InputOTP maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      );

      const otpInputs = screen.getAllByTestId('otp-input');
      expect(otpInputs).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <InputOTP>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSeparator />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>
      );

      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should handle aria attributes correctly', () => {
      render(
        <InputOTP
          aria-label="Enter verification code"
          aria-describedby="otp-help"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>
      );

      const input = screen.getByTestId('otp-input');
      expect(input).toHaveAttribute('aria-label', 'Enter verification code');
      expect(input).toHaveAttribute('aria-describedby', 'otp-help');
    });
  });
});