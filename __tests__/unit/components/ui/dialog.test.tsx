import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-dialog', () => {
  const Root = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="dialog-root"
      {...props}
    >
      {children}
    </div>
  ));
  Root.displayName = 'Root';

  const Trigger = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      className={className}
      data-testid="dialog-trigger"
      {...props}
    >
      {children}
    </button>
  ));
  Trigger.displayName = 'Trigger';

  const Portal = ({ className, children, ...props }: any) => (
    <div
      className={className}
      data-testid="dialog-portal"
      {...props}
    >
      {children}
    </div>
  );
  Portal.displayName = 'Portal';

  const Overlay = React.forwardRef(({ className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="dialog-overlay"
      {...props}
    />
  ));
  Overlay.displayName = 'Overlay';

  const Content = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="dialog-content"
      {...props}
    >
      {children}
    </div>
  ));
  Content.displayName = 'Content';

  const Close = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      className={className}
      data-testid="dialog-close"
      {...props}
    >
      {children}
    </button>
  ));
  Close.displayName = 'Close';

  const Header = ({ className, children, ...props }: any) => (
    <div
      className={className}
      data-testid="dialog-header"
      {...props}
    >
      {children}
    </div>
  );
  Header.displayName = 'Header';

  const Footer = ({ className, children, ...props }: any) => (
    <div
      className={className}
      data-testid="dialog-footer"
      {...props}
    >
      {children}
    </div>
  );
  Footer.displayName = 'Footer';

  const Title = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <h2
      ref={ref}
      className={className}
      data-testid="dialog-title"
      {...props}
    >
      {children}
    </h2>
  ));
  Title.displayName = 'Title';

  const Description = React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <p
      ref={ref}
      className={className}
      data-testid="dialog-description"
      {...props}
    >
      {children}
    </p>
  ));
  Description.displayName = 'Description';

  return { Root, Trigger, Portal, Overlay, Content, Close, Header, Footer, Title, Description };
});

jest.mock('lucide-react', () => ({
  X: ({ ...props }: any) => (
    <span data-testid="x-icon" {...props}>×</span>
  ),
}));

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('should render children', () => {
      render(
        <Dialog>
          <div>Dialog content</div>
        </Dialog>
      );
      expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('should pass through props', () => {
      render(
        <Dialog data-testid="custom-dialog" className="custom-class">
          Content
        </Dialog>
      );
      const dialog = screen.getByTestId('custom-dialog');
      expect(dialog).toHaveClass('custom-class');
    });
  });

  describe('DialogTrigger', () => {
    it('should render children', () => {
      render(<DialogTrigger>Open dialog</DialogTrigger>);
      const trigger = screen.getByTestId('dialog-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open dialog');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('should pass through props', () => {
      render(
        <DialogTrigger
          data-testid="custom-trigger"
          className="custom-trigger"
          disabled
        >
          Custom trigger
        </DialogTrigger>
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveAttribute('disabled');
    });
  });

  describe('DialogPortal', () => {
    it('should render children', () => {
      render(
        <DialogPortal>
          <div>Portal content</div>
        </DialogPortal>
      );
      expect(screen.getByTestId('dialog-portal')).toBeInTheDocument();
      expect(screen.getByText('Portal content')).toBeInTheDocument();
    });
  });

  describe('DialogOverlay', () => {
    it('should render with default props', () => {
      render(<DialogOverlay />);
      const overlay = screen.getByTestId('dialog-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay.tagName).toBe('DIV');
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black/50', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0');
    });

    it('should render with custom className', () => {
      render(<DialogOverlay className="custom-overlay" />);
      const overlay = screen.getByTestId('dialog-overlay');
      expect(overlay).toHaveClass('custom-overlay');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<DialogOverlay ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('DialogContent', () => {
    it('should render with default props', () => {
      render(<DialogContent>Content text</DialogContent>);
      const content = screen.getByTestId('dialog-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content text');
      expect(content.tagName).toBe('DIV');
      expect(content).toHaveClass('fixed', 'left-[50%]', 'top-[50%]', 'z-50', 'grid', 'w-full', 'max-w-lg', 'translate-x-[-50%]', 'translate-y-[-50%]', 'gap-4', 'border', 'bg-background', 'p-6', 'shadow-lg', 'duration-200', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95', 'data-[state=closed]:slide-out-to-left-1/2', 'data-[state=closed]:slide-out-to-top-[48%]', 'data-[state=open]:slide-in-from-left-1/2', 'data-[state=open]:slide-in-from-top-[48%]', 'sm:rounded-lg');
    });

    it('should render with custom className', () => {
      render(<DialogContent className="custom-content">Custom class</DialogContent>);
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should render with portal and overlay', () => {
      render(<DialogContent>Content with portal</DialogContent>);
      expect(screen.getByTestId('dialog-portal')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<DialogContent>Content with close</DialogContent>);
      expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<DialogContent ref={ref}>Ref test</DialogContent>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('DialogClose', () => {
    it('should render with default props', () => {
      render(<DialogClose>Close button</DialogClose>);
      const close = screen.getByTestId('dialog-close');
      expect(close).toBeInTheDocument();
      expect(close).toHaveTextContent('Close button');
      expect(close.tagName).toBe('BUTTON');
    });

    it('should render with custom className', () => {
      render(<DialogClose className="custom-close">Custom close</DialogClose>);
      const close = screen.getByTestId('dialog-close');
      expect(close).toHaveClass('custom-close');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<DialogClose ref={ref}>Ref test</DialogClose>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('DialogHeader', () => {
    it('should render with default props', () => {
      render(<DialogHeader>Header content</DialogHeader>);
      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('DIV');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'text-center', 'sm:text-left');
    });

    it('should render with custom className', () => {
      render(<DialogHeader className="custom-header">Custom header</DialogHeader>);
      const header = screen.getByText('Custom header');
      expect(header).toHaveClass('custom-header');
    });

    it('should handle multiple children', () => {
      render(
        <DialogHeader>
          <div>Child 1</div>
          <div>Child 2</div>
        </DialogHeader>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('DialogFooter', () => {
    it('should render with default props', () => {
      render(<DialogFooter>Footer content</DialogFooter>);
      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('DIV');
      expect(footer).toHaveClass('flex', 'flex-col-reverse', 'sm:flex-row', 'sm:justify-end', 'sm:space-x-2');
    });

    it('should render with custom className', () => {
      render(<DialogFooter className="custom-footer">Custom footer</DialogFooter>);
      const footer = screen.getByText('Custom footer');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should handle action buttons', () => {
      render(
        <DialogFooter>
          <button className="btn-secondary">Cancel</button>
          <button className="btn-primary">Save</button>
        </DialogFooter>
      );
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('DialogTitle', () => {
    it('should render with default props', () => {
      render(<DialogTitle>Dialog Title</DialogTitle>);
      const title = screen.getByTestId('dialog-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Dialog Title');
      expect(title.tagName).toBe('H2');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('should render with custom className', () => {
      render(<DialogTitle className="custom-title">Custom title</DialogTitle>);
      const title = screen.getByTestId('dialog-title');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(<DialogTitle ref={ref}>Ref test</DialogTitle>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('DialogDescription', () => {
    it('should render with default props', () => {
      render(<DialogDescription>Dialog description text</DialogDescription>);
      const description = screen.getByTestId('dialog-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Dialog description text');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should render with custom className', () => {
      render(<DialogDescription className="custom-description">Custom description</DialogDescription>);
      const description = screen.getByTestId('dialog-description');
      expect(description).toHaveClass('custom-description');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(<DialogDescription ref={ref}>Ref test</DialogDescription>);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for DialogOverlay', () => {
      expect(DialogOverlay.displayName).toBe('DialogOverlay');
    });

    it('should have correct displayName for DialogContent', () => {
      expect(DialogContent.displayName).toBe('DialogContent');
    });

    it('should have correct displayName for DialogHeader', () => {
      expect(DialogHeader.displayName).toBe('DialogHeader');
    });

    it('should have correct displayName for DialogFooter', () => {
      expect(DialogFooter.displayName).toBe('DialogFooter');
    });

    it('should have correct displayName for DialogTitle', () => {
      expect(DialogTitle.displayName).toBe('DialogTitle');
    });

    it('should have correct displayName for DialogDescription', () => {
      expect(DialogDescription.displayName).toBe('DialogDescription');
    });
  });

  describe('Integration', () => {
    it('should render complete dialog structure', () => {
      render(
        <Dialog>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog description</DialogDescription>
            </DialogHeader>
            <div>Main content</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should handle multiple dialogs', () => {
      render(
        <div>
          <Dialog>
            <DialogTrigger>Dialog 1</DialogTrigger>
            <DialogContent>Content 1</DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger>Dialog 2</DialogTrigger>
            <DialogContent>Content 2</DialogContent>
          </Dialog>
        </div>
      );

      const roots = screen.getAllByTestId('dialog-root');
      const triggers = screen.getAllByTestId('dialog-trigger');
      const contents = screen.getAllByTestId('dialog-content');

      expect(roots).toHaveLength(2);
      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(
        <Dialog>
          <DialogTrigger>Accessible dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Accessible Title</DialogTitle>
            <DialogDescription>Accessible description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByTestId('dialog-trigger');
      const content = screen.getByTestId('dialog-content');
      const title = screen.getByTestId('dialog-title');
      const description = screen.getByTestId('dialog-description');

      expect(trigger.tagName).toBe('BUTTON');
      expect(content.tagName).toBe('DIV');
      expect(title.tagName).toBe('H2');
      expect(description.tagName).toBe('P');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Dialog>
          <DialogTrigger
            aria-haspopup="dialog"
            aria-expanded="false"
          >
            Trigger with aria
          </DialogTrigger>
          <DialogContent
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            role="dialog"
          >
            <DialogTitle id="dialog-title">Aria Title</DialogTitle>
            <DialogDescription id="dialog-description">Aria description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByTestId('dialog-trigger');
      const content = screen.getByTestId('dialog-content');

      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(content).toHaveAttribute('aria-labelledby', 'dialog-title');
      expect(content).toHaveAttribute('aria-describedby', 'dialog-description');
      expect(content).toHaveAttribute('role', 'dialog');
    });

    it('should handle focus management', () => {
      render(
        <Dialog>
          <DialogTrigger>Focusable trigger</DialogTrigger>
          <DialogContent>
            <DialogTitle>Focusable dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByTestId('dialog-trigger');
      const content = screen.getByTestId('dialog-content');

      expect(trigger).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });
});