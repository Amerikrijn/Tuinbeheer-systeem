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
      className={className}
      data-testid="avatar-root"
      {...props}
    >
      {children}
    </div>
  )),
  Image: React.forwardRef(({ className, src, alt, ...props }: any, ref: any) => (
    <img
      ref={ref}
      className={className}
      src={src}
      alt={alt}
      data-testid="avatar-image"
      {...props}
    />
  )),
  Fallback: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="avatar-fallback"
      {...props}
    >
      {children}
    </div>
  )),
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
      render(
        <Avatar>
          <AvatarImage src="/test-image.jpg" alt="Test avatar" />
        </Avatar>
      );
      const image = screen.getByTestId('avatar-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test avatar');
      expect(image).toHaveClass('aspect-square', 'h-full', 'w-full');
    });

    it('should render with custom className', () => {
      render(
        <Avatar>
          <AvatarImage className="custom-image" src="/test.jpg" alt="Test" />
        </Avatar>
      );
      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveClass('custom-image');
    });

    it('should pass through additional props', () => {
      render(
        <Avatar>
          <AvatarImage
            data-testid="custom-image"
            src="/test.jpg"
            alt="Test"
            loading="lazy"
          />
        </Avatar>
      );
      const image = screen.getByTestId('custom-image');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLImageElement>();
      render(
        <Avatar>
          <AvatarImage ref={ref} src="/test.jpg" alt="Test" />
        </Avatar>
      );
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('AvatarFallback', () => {
    it('should render with default props', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('JD');
      expect(fallback).toHaveClass('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'rounded-full', 'bg-muted');
    });

    it('should render with custom className', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback">Custom</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('custom-fallback');
    });

    it('should pass through additional props', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="custom-fallback" aria-label="Custom fallback">
            Props test
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('custom-fallback');
      expect(fallback).toHaveAttribute('aria-label', 'Custom fallback');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Avatar>
          <AvatarFallback ref={ref}>Ref test</AvatarFallback>
        </Avatar>
      );
      expect(ref.current).toBeInTheDocument();
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