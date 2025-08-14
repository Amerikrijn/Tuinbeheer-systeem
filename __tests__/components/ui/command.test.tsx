import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Command, 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandShortcut, 
  CommandSeparator 
} from '@/components/ui/command'

// Mock cmdk
jest.mock('cmdk', () => ({
  Command: ({ children, className, ...props }: any) => (
    <div data-testid="command-primitive" className={className} {...props}>{children}</div>
  )
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Search: ({ className }: any) => <svg data-testid="search-icon" className={className} />
}))

// Mock dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, ...props }: any) => (
    <div data-testid="dialog" {...props}>{children}</div>
  ),
  DialogContent: ({ children, className, ...props }: any) => (
    <div data-testid="dialog-content" className={className} {...props}>{children}</div>
  )
}))

describe('Command Components', () => {
  describe('Command', () => {
    it('renders correctly with default props', () => {
      render(<Command data-testid="test-command" />)
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Command className="custom-class" data-testid="test-command" />)
      const command = screen.getByTestId('command-primitive')
      expect(command).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<Command data-testid="test-command" />)
      const command = screen.getByTestId('command-primitive')
      expect(command).toHaveClass('flex', 'h-full', 'w-full', 'flex-col', 'overflow-hidden', 'rounded-md', 'bg-popover', 'text-popover-foreground')
    })

    it('renders children correctly', () => {
      render(
        <Command>
          <div data-testid="child">Child content</div>
        </Command>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Command ref={ref} data-testid="test-command" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Command data-testid="test-command" aria-label="Test command" />)
      const command = screen.getByTestId('command-primitive')
      expect(command).toHaveAttribute('aria-label', 'Test command')
    })
  })

  describe('CommandDialog', () => {
    it('renders correctly with default props', () => {
      render(<CommandDialog data-testid="test-dialog" />)
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <CommandDialog>
          <div data-testid="child">Child content</div>
        </CommandDialog>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('applies dialog content classes', () => {
      render(<CommandDialog data-testid="test-dialog" />)
      const dialogContent = screen.getByTestId('dialog-content')
      expect(dialogContent).toHaveClass('overflow-hidden', 'p-0', 'shadow-lg')
    })

    it('applies command classes with cmdk selectors', () => {
      render(<CommandDialog data-testid="test-dialog" />)
      const command = screen.getByTestId('command-primitive')
      expect(command).toHaveClass('[&_[cmdk-group-heading]]:px-2', '[&_[cmdk-group-heading]]:font-medium', '[&_[cmdk-group-heading]]:text-muted-foreground')
    })

    it('spreads additional props', () => {
      render(<CommandDialog data-testid="test-dialog" aria-label="Test dialog" />)
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toHaveAttribute('aria-label', 'Test dialog')
    })
  })

  describe('CommandInput', () => {
    it('renders correctly with default props', () => {
      render(<CommandInput data-testid="test-input" />)
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<CommandInput className="custom-class" data-testid="test-input" />)
      const input = screen.getByTestId('command-primitive')
      expect(input).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<CommandInput data-testid="test-input" />)
      const input = screen.getByTestId('command-primitive')
      expect(input).toHaveClass('flex', 'h-11', 'w-full', 'rounded-md', 'bg-transparent', 'py-3', 'text-sm', 'outline-none', 'placeholder:text-muted-foreground', 'disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('renders search icon', () => {
      render(<CommandInput data-testid="test-input" />)
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('applies input wrapper classes', () => {
      render(<CommandInput data-testid="test-input" />)
      const wrapper = screen.getByTestId('command-primitive').parentElement
      expect(wrapper).toHaveClass('flex', 'items-center', 'border-b', 'px-3')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<CommandInput ref={ref} data-testid="test-input" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CommandInput data-testid="test-input" placeholder="Search..." />)
      const input = screen.getByTestId('command-primitive')
      expect(input).toHaveAttribute('placeholder', 'Search...')
    })
  })

  describe('CommandList', () => {
    it('renders correctly with default props', () => {
      render(<CommandList data-testid="test-list" />)
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<CommandList className="custom-class" data-testid="test-list" />)
      const list = screen.getByTestId('command-primitive')
      expect(list).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<CommandList data-testid="test-list" />)
      const list = screen.getByTestId('command-primitive')
      expect(list).toHaveClass('max-h-[300px]', 'overflow-y-auto', 'overflow-x-hidden')
    })

    it('renders children correctly', () => {
      render(
        <CommandList>
          <div data-testid="child">Child content</div>
        </CommandList>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CommandList ref={ref} data-testid="test-list" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CommandList data-testid="test-list" aria-label="Test list" />)
      const list = screen.getByTestId('command-primitive')
      expect(list).toHaveAttribute('aria-label', 'Test list')
    })
  })

  describe('CommandEmpty', () => {
    it('renders correctly with default props', () => {
      render(<CommandEmpty data-testid="test-empty" />)
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<CommandEmpty className="custom-class" data-testid="test-empty" />)
      const empty = screen.getByTestId('command-primitive')
      expect(empty).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<CommandEmpty data-testid="test-empty" />)
      const empty = screen.getByTestId('command-primitive')
      expect(empty).toHaveClass('py-6', 'text-center', 'text-sm')
    })

    it('renders children correctly', () => {
      render(
        <CommandEmpty>
          <span data-testid="child">No results found</span>
        </CommandEmpty>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CommandEmpty ref={ref} data-testid="test-empty" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CommandEmpty data-testid="test-empty" aria-label="Test empty" />)
      const empty = screen.getByTestId('command-primitive')
      expect(empty).toHaveAttribute('aria-label', 'Test empty')
    })
  })

  describe('CommandGroup', () => {
    it('renders correctly with default props', () => {
      render(<CommandGroup data-testid="test-group" />)
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<CommandGroup className="custom-class" data-testid="test-group" />)
      const group = screen.getByTestId('command-primitive')
      expect(group).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<CommandGroup data-testid="test-group" />)
      const group = screen.getByTestId('command-primitive')
      expect(group).toHaveClass('overflow-hidden', 'p-1', 'text-foreground')
    })

    it('applies cmdk group classes', () => {
      render(<CommandGroup data-testid="test-group" />)
      const group = screen.getByTestId('command-primitive')
      expect(group).toHaveClass('[&_[cmdk-group-heading]]:px-2', '[&_[cmdk-group-heading]]:py-1.5', '[&_[cmdk-group-heading]]:text-xs', '[&_[cmdk-group-heading]]:font-medium', '[&_[cmdk-group-heading]]:text-muted-foreground')
    })

    it('renders children correctly', () => {
      render(
        <CommandGroup>
          <div data-testid="child">Group content</div>
        </CommandGroup>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CommandGroup ref={ref} data-testid="test-group" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CommandGroup data-testid="test-group" aria-label="Test group" />)
      const group = screen.getByTestId('command-primitive')
      expect(group).toHaveAttribute('aria-label', 'Test group')
    })
  })

  describe('CommandSeparator', () => {
    it('renders correctly with default props', () => {
      render(<CommandSeparator data-testid="test-separator" />)
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<CommandSeparator className="custom-class" data-testid="test-separator" />)
      const separator = screen.getByTestId('command-primitive')
      expect(separator).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<CommandSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('command-primitive')
      expect(separator).toHaveClass('-mx-1', 'h-px', 'bg-border')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CommandSeparator ref={ref} data-testid="test-separator" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CommandSeparator data-testid="test-separator" aria-label="Test separator" />)
      const separator = screen.getByTestId('command-primitive')
      expect(separator).toHaveAttribute('aria-label', 'Test separator')
    })
  })

  describe('CommandItem', () => {
    it('renders correctly with default props', () => {
      render(<CommandItem data-testid="test-item" />)
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<CommandItem className="custom-class" data-testid="test-item" />)
      const item = screen.getByTestId('command-primitive')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<CommandItem data-testid="test-item" />)
      const item = screen.getByTestId('command-primitive')
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'gap-2', 'select-none', 'items-center', 'rounded-sm', 'px-2', 'py-1.5', 'text-sm', 'outline-none')
    })

    it('applies data attribute classes', () => {
      render(<CommandItem data-testid="test-item" />)
      const item = screen.getByTestId('command-primitive')
      expect(item).toHaveClass('data-[disabled=true]:pointer-events-none', 'data-[selected=\'true\']:bg-accent', 'data-[selected=true]:text-accent-foreground', 'data-[disabled=true]:opacity-50')
    })

    it('applies svg classes', () => {
      render(<CommandItem data-testid="test-item" />)
      const item = screen.getByTestId('command-primitive')
      expect(item).toHaveClass('[&_svg]:pointer-events-none', '[&_svg]:size-4', '[&_svg]:shrink-0')
    })

    it('renders children correctly', () => {
      render(
        <CommandItem>
          <span data-testid="child">Item text</span>
        </CommandItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CommandItem ref={ref} data-testid="test-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CommandItem data-testid="test-item" aria-label="Test item" />)
      const item = screen.getByTestId('command-primitive')
      expect(item).toHaveAttribute('aria-label', 'Test item')
    })
  })

  describe('CommandShortcut', () => {
    it('renders correctly with default props', () => {
      render(<CommandShortcut data-testid="test-shortcut" />)
      expect(screen.getByTestId('test-shortcut')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      render(<CommandShortcut data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut.tagName).toBe('SPAN')
    })

    it('renders with custom className', () => {
      render(<CommandShortcut className="custom-class" data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<CommandShortcut data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'text-muted-foreground')
    })

    it('renders children correctly', () => {
      render(
        <CommandShortcut>
          <span data-testid="child">⌘K</span>
        </CommandShortcut>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<CommandShortcut data-testid="test-shortcut" aria-label="Test shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveAttribute('aria-label', 'Test shortcut')
    })
  })

  describe('Command Composition', () => {
    it('renders complete command structure', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandGroup heading="Files">
              <CommandItem>file1.txt</CommandItem>
              <CommandItem>file2.txt</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Folders">
              <CommandItem>folder1</CommandItem>
              <CommandItem>folder2</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )

      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <Command>
          <CommandInput />
          <CommandList>
            <CommandGroup></CommandGroup>
          </CommandList>
        </Command>
      )
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <Command>
          <CommandInput>{null}</CommandInput>
          <CommandList>
            <CommandGroup>{null}</CommandGroup>
          </CommandList>
        </Command>
      )
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <Command>
          <CommandInput>{undefined}</CommandInput>
          <CommandList>
            <CommandGroup>{undefined}</CommandGroup>
          </CommandList>
        </Command>
      )
      expect(screen.getByTestId('command-primitive')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<Command className="custom-command-class" data-testid="test-command" />)
      const command = screen.getByTestId('command-primitive')
      expect(command).toHaveClass('custom-command-class')
      expect(command).toHaveClass('flex', 'h-full', 'w-full')
    })

    it('handles multiple custom classes', () => {
      render(<Command className="class1 class2 class3" data-testid="test-command" />)
      const command = screen.getByTestId('command-primitive')
      expect(command).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <Command>
          <CommandInput />
          <CommandList>
            <CommandGroup>
              <CommandItem>Item 1</CommandItem>
              <CommandItem>Item 2</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )

      const command = screen.getByTestId('command-primitive')
      expect(command).toBeInTheDocument()
    })
  })
})