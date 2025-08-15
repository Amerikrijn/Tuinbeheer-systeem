import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-avatar', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="avatar-root"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Image: React.forwardRef(({ className, ...props }: any, ref: any) => (
    <img
      ref={ref}
      data-testid="avatar-image"
      className={className}
      {...props}
    />
  )),
  Fallback: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="avatar-fallback"
      className={className}
      {...props}
    >
      {children}
    </div>
  ))
}));

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('should render with default props', () => {
      render(<Avatar>Avatar content</Avatar>);
      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveTextContent('Avatar content');
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'shrink-0', 'overflow-hidden', 'rounded-full');
    });

    it('should render with custom className', () => {
      render(<Avatar className="custom-avatar">Custom avatar</Avatar>);
      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('custom-avatar');
    });

    it('should pass through additional props', () => {
      render(
        <Avatar data-testid="custom-avatar" aria-label="Custom avatar">
          Props test
        </Avatar>
      );
      const avatar = screen.getByTestId('custom-avatar');
      expect(avatar).toHaveAttribute('aria-label', 'Custom avatar');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Avatar ref={ref}>Ref test</Avatar>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('AvatarImage', () => {
    it('should render with default props', () => {
      render(<AvatarImage src="/test-image.jpg" alt="Test avatar" />);
      const image = screen.getByTestId('avatar-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test avatar');
      expect(image).toHaveClass('aspect-square', 'h-full', 'w-full');
    });

    it('should render with custom className', () => {
      render(<AvatarImage className="custom-image" src="/test.jpg" alt="Test" />);
      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveClass('custom-image');
    });

    it('should pass through additional props', () => {
      render(
        <AvatarImage
          data-testid="custom-image"
          src="/test.jpg"
          alt="Test"
          loading="lazy"
        />
      );
      const image = screen.getByTestId('custom-image');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLImageElement>();
      render(<AvatarImage ref={ref} src="/test.jpg" alt="Test" />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('AvatarFallback', () => {
    it('should render with default props', () => {
      render(<AvatarFallback>JD</AvatarFallback>);
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('JD');
      expect(fallback).toHaveClass('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'rounded-full', 'bg-muted');
    });

    it('should render with custom className', () => {
      render(<AvatarFallback className="custom-fallback">Custom</AvatarFallback>);
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('custom-fallback');
    });

    it('should pass through additional props', () => {
      render(
        <AvatarFallback data-testid="custom-fallback" aria-label="Custom fallback">
          Props test
        </AvatarFallback>
      );
      const fallback = screen.getByTestId('custom-fallback');
      expect(fallback).toHaveAttribute('aria-label', 'Custom fallback');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<AvatarFallback ref={ref}>Ref test</AvatarFallback>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for Avatar', () => {
      expect(Avatar.displayName).toBe('Root');
    });

    it('should have correct displayName for AvatarImage', () => {
      expect(AvatarImage.displayName).toBe('Image');
    });

    it('should have correct displayName for AvatarFallback', () => {
      expect(AvatarFallback.displayName).toBe('Fallback');
    });
  });

  describe('Integration', () => {
    it('should render complete avatar structure', () => {
      render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar-root');
      const image = screen.getByTestId('avatar-image');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/user.jpg');
      expect(fallback).toHaveTextContent('JD');
    });

    it('should handle multiple avatars', () => {
      render(
        <div>
          <Avatar>
            <AvatarImage src="/user1.jpg" alt="User 1" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/user2.jpg" alt="User 2" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      );

      const avatars = screen.getAllByTestId('avatar-root');
      const images = screen.getAllByTestId('avatar-image');
      const fallbacks = screen.getAllByTestId('avatar-fallback');

      expect(avatars).toHaveLength(2);
      expect(images).toHaveLength(2);
      expect(fallbacks).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', '/user1.jpg');
      expect(images[1]).toHaveAttribute('src', '/user2.jpg');
      expect(fallbacks[0]).toHaveTextContent('JD');
      expect(fallbacks[1]).toHaveTextContent('AB');
    });

    it('should handle avatar without image', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar-root');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
    });
  });
});