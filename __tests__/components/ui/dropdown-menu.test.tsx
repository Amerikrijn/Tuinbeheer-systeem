import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuCheckboxItem, 
  DropdownMenuRadioItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuShortcut, 
  DropdownMenuGroup, 
  DropdownMenuPortal, 
  DropdownMenuSub, 
  DropdownMenuSubContent, 
  DropdownMenuSubTrigger, 
  DropdownMenuRadioGroup 
} from '@/components/ui/dropdown-menu'

// Mock Radix UI components
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="dropdown-menu-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="dropdown-menu-trigger" {...props}>{children}</button>
  ),
  Content: ({ children, className, sideOffset, ...props }: any) => (
    <div data-testid="dropdown-menu-content" className={className} data-side-offset={sideOffset} {...props}>{children}</div>
  ),
  Item: ({ children, className, inset, ...props }: any) => (
    <div data-testid="dropdown-menu-item" className={className} data-inset={inset} {...props}>{children}</div>
  ),
  CheckboxItem: ({ children, className, checked, ...props }: any) => (
    <div data-testid="dropdown-menu-checkbox-item" className={className} data-checked={checked} {...props}>{children}</div>
  ),
  RadioItem: ({ children, className, ...props }: any) => (
    <div data-testid="dropdown-menu-radio-item" className={className} {...props}>{children}</div>
  ),
  Label: ({ children, className, inset, ...props }: any) => (
    <div data-testid="dropdown-menu-label" className={className} data-inset={inset} {...props}>{children}</div>
  ),
  Separator: ({ children, className, ...props }: any) => (
    <div data-testid="dropdown-menu-separator" className={className} {...props}>{children}</div>
  ),
  Group: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-group" {...props}>{children}</div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-portal" {...props}>{children}</div>
  ),
  Sub: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-sub" {...props}>{children}</div>
  ),
  SubTrigger: ({ children, className, inset, ...props }: any) => (
    <div data-testid="dropdown-menu-sub-trigger" className={className} data-inset={inset} {...props}>{children}</div>
  ),
  SubContent: ({ children, className, ...props }: any) => (
    <div data-testid="dropdown-menu-sub-content" className={className} {...props}>{children}</div>
  ),
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-radio-group" {...props}>{children}</div>
  ),
  ItemIndicator: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-item-indicator" {...props}>{children}</div>
  )
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Check: ({ className }: any) => <svg data-testid="check-icon" className={className} />,
  ChevronRight: ({ className }: any) => <svg data-testid="chevron-right-icon" className={className} />,
  Circle: ({ className, fill }: any) => <svg data-testid="circle-icon" className={className} data-fill={fill} />
}))

describe('DropdownMenu Components', () => {
  describe('DropdownMenu', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenu data-testid="test-dropdown" />)
      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenu>
          <div data-testid="child">Child content</div>
        </DropdownMenu>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenu data-testid="test-dropdown" aria-label="Test dropdown" />)
      const dropdown = screen.getByTestId('dropdown-menu-root')
      expect(dropdown).toHaveAttribute('aria-label', 'Test dropdown')
    })
  })

  describe('DropdownMenuTrigger', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<DropdownMenuTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('dropdown-menu-trigger')
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuTrigger>
          <span data-testid="child">Open Menu</span>
        </DropdownMenuTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('dropdown-menu-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('DropdownMenuContent', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuContent data-testid="test-content" />)
      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuContent className="custom-class" data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuContent data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveClass('z-50', 'min-w-[8rem]', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'p-1', 'text-popover-foreground', 'shadow-md')
    })

    it('applies animation classes', () => {
      render(<DropdownMenuContent data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95')
    })

    it('applies slide animation classes', () => {
      render(<DropdownMenuContent data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveClass('data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2')
    })

    it('sets default sideOffset to 4', () => {
      render(<DropdownMenuContent data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveAttribute('data-side-offset', '4')
    })

    it('allows customizing sideOffset', () => {
      render(<DropdownMenuContent sideOffset={8} data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveAttribute('data-side-offset', '8')
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuContent>
          <div data-testid="child">Content text</div>
        </DropdownMenuContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })
  })

  describe('DropdownMenuItem', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuItem data-testid="test-item" />)
      expect(screen.getByTestId('dropdown-menu-item')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuItem className="custom-class" data-testid="test-item" />)
      const item = screen.getByTestId('dropdown-menu-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuItem data-testid="test-item" />)
      const item = screen.getByTestId('dropdown-menu-item')
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'select-none', 'items-center', 'gap-2', 'rounded-sm', 'px-2', 'py-1.5', 'text-sm', 'outline-none', 'transition-colors', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
    })

    it('applies svg classes', () => {
      render(<DropdownMenuItem data-testid="test-item" />)
      const item = screen.getByTestId('dropdown-menu-item')
      expect(item).toHaveClass('[&_svg]:pointer-events-none', '[&_svg]:size-4', '[&_svg]:shrink-0')
    })

    it('applies inset classes when inset is true', () => {
      render(<DropdownMenuItem inset data-testid="test-item" />)
      const item = screen.getByTestId('dropdown-menu-item')
      expect(item).toHaveAttribute('data-inset', 'true')
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuItem>
          <span data-testid="child">Item text</span>
        </DropdownMenuItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuItem ref={ref} data-testid="test-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuItem data-testid="test-item" aria-label="Test item" />)
      const item = screen.getByTestId('dropdown-menu-item')
      expect(item).toHaveAttribute('aria-label', 'Test item')
    })
  })

  describe('DropdownMenuCheckboxItem', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuCheckboxItem data-testid="test-checkbox-item" />)
      expect(screen.getByTestId('dropdown-menu-checkbox-item')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuCheckboxItem className="custom-class" data-testid="test-checkbox-item" />)
      const item = screen.getByTestId('dropdown-menu-checkbox-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuCheckboxItem data-testid="test-checkbox-item" />)
      const item = screen.getByTestId('dropdown-menu-checkbox-item')
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'py-1.5', 'pl-8', 'pr-2', 'text-sm', 'outline-none', 'transition-colors', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
    })

    it('sets checked attribute', () => {
      render(<DropdownMenuCheckboxItem checked data-testid="test-checkbox-item" />)
      const item = screen.getByTestId('dropdown-menu-checkbox-item')
      expect(item).toHaveAttribute('data-checked', 'true')
    })

    it('renders check icon indicator', () => {
      render(<DropdownMenuCheckboxItem data-testid="test-checkbox-item" />)
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuCheckboxItem>
          <span data-testid="child">Checkbox text</span>
        </DropdownMenuCheckboxItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuCheckboxItem ref={ref} data-testid="test-checkbox-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuCheckboxItem data-testid="test-checkbox-item" aria-label="Test checkbox" />)
      const item = screen.getByTestId('dropdown-menu-checkbox-item')
      expect(item).toHaveAttribute('aria-label', 'Test checkbox')
    })
  })

  describe('DropdownMenuRadioItem', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuRadioItem data-testid="test-radio-item" />)
      expect(screen.getByTestId('dropdown-menu-radio-item')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuRadioItem className="custom-class" data-testid="test-radio-item" />)
      const item = screen.getByTestId('dropdown-menu-radio-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuRadioItem data-testid="test-radio-item" />)
      const item = screen.getByTestId('dropdown-menu-radio-item')
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'py-1.5', 'pl-8', 'pr-2', 'text-sm', 'outline-none', 'transition-colors', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
    })

    it('renders circle icon indicator', () => {
      render(<DropdownMenuRadioItem data-testid="test-radio-item" />)
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuRadioItem>
          <span data-testid="child">Radio text</span>
        </DropdownMenuRadioItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuRadioItem ref={ref} data-testid="test-radio-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuRadioItem data-testid="test-radio-item" aria-label="Test radio" />)
      const item = screen.getByTestId('dropdown-menu-radio-item')
      expect(item).toHaveAttribute('aria-label', 'Test radio')
    })
  })

  describe('DropdownMenuLabel', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuLabel data-testid="test-label" />)
      expect(screen.getByTestId('dropdown-menu-label')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuLabel className="custom-class" data-testid="test-label" />)
      const label = screen.getByTestId('dropdown-menu-label')
      expect(label).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuLabel data-testid="test-label" />)
      const label = screen.getByTestId('dropdown-menu-label')
      expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold')
    })

    it('applies inset classes when inset is true', () => {
      render(<DropdownMenuLabel inset data-testid="test-label" />)
      const label = screen.getByTestId('dropdown-menu-label')
      expect(label).toHaveAttribute('data-inset', 'true')
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuLabel>
          <span data-testid="child">Label text</span>
        </DropdownMenuLabel>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuLabel ref={ref} data-testid="test-label" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuLabel data-testid="test-label" aria-label="Test label" />)
      const label = screen.getByTestId('dropdown-menu-label')
      expect(label).toHaveAttribute('aria-label', 'Test label')
    })
  })

  describe('DropdownMenuSeparator', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuSeparator data-testid="test-separator" />)
      expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuSeparator className="custom-class" data-testid="test-separator" />)
      const separator = screen.getByTestId('dropdown-menu-separator')
      expect(separator).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('dropdown-menu-separator')
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuSeparator ref={ref} data-testid="test-separator" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuSeparator data-testid="test-separator" aria-label="Test separator" />)
      const separator = screen.getByTestId('dropdown-menu-separator')
      expect(separator).toHaveAttribute('aria-label', 'Test separator')
    })
  })

  describe('DropdownMenuShortcut', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuShortcut data-testid="test-shortcut" />)
      expect(screen.getByTestId('test-shortcut')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      render(<DropdownMenuShortcut data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut.tagName).toBe('SPAN')
    })

    it('renders with custom className', () => {
      render(<DropdownMenuShortcut className="custom-class" data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuShortcut data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'opacity-60')
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuShortcut>
          <span data-testid="child">⌘K</span>
        </DropdownMenuShortcut>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuShortcut data-testid="test-shortcut" aria-label="Test shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveAttribute('aria-label', 'Test shortcut')
    })
  })

  describe('DropdownMenuGroup', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuGroup data-testid="test-group" />)
      expect(screen.getByTestId('dropdown-menu-group')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuGroup>
          <div data-testid="child">Group content</div>
        </DropdownMenuGroup>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuGroup data-testid="test-group" aria-label="Test group" />)
      const group = screen.getByTestId('dropdown-menu-group')
      expect(group).toHaveAttribute('aria-label', 'Test group')
    })
  })

  describe('DropdownMenuPortal', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuPortal data-testid="test-portal" />)
      expect(screen.getByTestId('dropdown-menu-portal')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuPortal>
          <div data-testid="child">Portal content</div>
        </DropdownMenuPortal>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuPortal data-testid="test-portal" aria-label="Test portal" />)
      const portal = screen.getByTestId('dropdown-menu-portal')
      expect(portal).toHaveAttribute('aria-label', 'Test portal')
    })
  })

  describe('DropdownMenuSub', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuSub data-testid="test-sub" />)
      expect(screen.getByTestId('dropdown-menu-sub')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuSub>
          <div data-testid="child">Sub content</div>
        </DropdownMenuSub>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuSub data-testid="test-sub" aria-label="Test sub" />)
      const sub = screen.getByTestId('dropdown-menu-sub')
      expect(sub).toHaveAttribute('aria-label', 'Test sub')
    })
  })

  describe('DropdownMenuSubTrigger', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuSubTrigger data-testid="test-sub-trigger" />)
      expect(screen.getByTestId('dropdown-menu-sub-trigger')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuSubTrigger className="custom-class" data-testid="test-sub-trigger" />)
      const trigger = screen.getByTestId('dropdown-menu-sub-trigger')
      expect(trigger).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuSubTrigger data-testid="test-sub-trigger" />)
      const trigger = screen.getByTestId('dropdown-menu-sub-trigger')
      expect(trigger).toHaveClass('flex', 'cursor-default', 'gap-2', 'select-none', 'items-center', 'rounded-sm', 'px-2', 'py-1.5', 'text-sm', 'outline-none', 'focus:bg-accent', 'data-[state=open]:bg-accent')
    })

    it('applies svg classes', () => {
      render(<DropdownMenuSubTrigger data-testid="test-sub-trigger" />)
      const trigger = screen.getByTestId('dropdown-menu-sub-trigger')
      expect(trigger).toHaveClass('[&_svg]:pointer-events-none', '[&_svg]:size-4', '[&_svg]:shrink-0')
    })

    it('applies inset classes when inset is true', () => {
      render(<DropdownMenuSubTrigger inset data-testid="test-sub-trigger" />)
      const trigger = screen.getByTestId('dropdown-menu-sub-trigger')
      expect(trigger).toHaveAttribute('data-inset', 'true')
    })

    it('renders chevron right icon', () => {
      render(<DropdownMenuSubTrigger data-testid="test-sub-trigger" />)
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuSubTrigger>
          <span data-testid="child">Sub trigger text</span>
        </DropdownMenuSubTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuSubTrigger ref={ref} data-testid="test-sub-trigger" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuSubTrigger data-testid="test-sub-trigger" aria-label="Test sub trigger" />)
      const trigger = screen.getByTestId('dropdown-menu-sub-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test sub trigger')
    })
  })

  describe('DropdownMenuSubContent', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuSubContent data-testid="test-sub-content" />)
      expect(screen.getByTestId('dropdown-menu-sub-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<DropdownMenuSubContent className="custom-class" data-testid="test-sub-content" />)
      const content = screen.getByTestId('dropdown-menu-sub-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<DropdownMenuSubContent data-testid="test-sub-content" />)
      const content = screen.getByTestId('dropdown-menu-sub-content')
      expect(content).toHaveClass('z-50', 'min-w-[8rem]', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'p-1', 'text-popover-foreground', 'shadow-lg')
    })

    it('applies animation classes', () => {
      render(<DropdownMenuSubContent data-testid="test-sub-content" />)
      const content = screen.getByTestId('dropdown-menu-sub-content')
      expect(content).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95')
    })

    it('applies slide animation classes', () => {
      render(<DropdownMenuSubContent data-testid="test-sub-content" />)
      const content = screen.getByTestId('dropdown-menu-sub-content')
      expect(content).toHaveClass('data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2')
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuSubContent>
          <div data-testid="child">Sub content text</div>
        </DropdownMenuSubContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DropdownMenuSubContent ref={ref} data-testid="test-sub-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuSubContent data-testid="test-sub-content" aria-label="Test sub content" />)
      const content = screen.getByTestId('dropdown-menu-sub-content')
      expect(content).toHaveAttribute('aria-label', 'Test sub content')
    })
  })

  describe('DropdownMenuRadioGroup', () => {
    it('renders correctly with default props', () => {
      render(<DropdownMenuRadioGroup data-testid="test-radio-group" />)
      expect(screen.getByTestId('dropdown-menu-radio-group')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <DropdownMenuRadioGroup>
          <div data-testid="child">Radio group content</div>
        </DropdownMenuRadioGroup>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<DropdownMenuRadioGroup data-testid="test-radio-group" aria-label="Test radio group" />)
      const group = screen.getByTestId('dropdown-menu-radio-group')
      expect(group).toHaveAttribute('aria-label', 'Test radio group')
    })
  })

  describe('DropdownMenu Composition', () => {
    it('renders complete dropdown menu structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Copy</DropdownMenuItem>
              <DropdownMenuItem>Paste</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>Show notifications</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem>Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem>Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-group')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-label')).toBeInTheDocument()
      expect(screen.getAllByTestId('dropdown-menu-item')).toHaveLength(2)
      expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-checkbox-item')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-radio-group')).toBeInTheDocument()
      expect(screen.getAllByTestId('dropdown-menu-radio-item')).toHaveLength(2)
    })

    it('handles empty children', () => {
      render(
        <DropdownMenu>
          <DropdownMenuContent>
            <DropdownMenuGroup></DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <DropdownMenu>
          <DropdownMenuContent>
            <DropdownMenuGroup>{null}</DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <DropdownMenu>
          <DropdownMenuContent>
            <DropdownMenuGroup>{undefined}</DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<DropdownMenuContent className="custom-content-class" data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveClass('custom-content-class')
      expect(content).toHaveClass('z-50', 'min-w-[8rem]')
    })

    it('handles multiple custom classes', () => {
      render(<DropdownMenuContent className="class1 class2 class3" data-testid="test-content" />)
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const dropdown = screen.getByTestId('dropdown-menu-root')
      const content = screen.getByTestId('dropdown-menu-content')
      expect(dropdown).toContainElement(content)
    })
  })
})