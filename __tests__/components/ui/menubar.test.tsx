import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Menubar, 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator, 
  MenubarLabel, 
  MenubarCheckboxItem, 
  MenubarRadioGroup, 
  MenubarRadioItem, 
  MenubarPortal, 
  MenubarSubContent, 
  MenubarSubTrigger, 
  MenubarGroup, 
  MenubarSub, 
  MenubarShortcut 
} from '@/components/ui/menubar'

// Mock Radix UI components
jest.mock('@radix-ui/react-menubar', () => ({
  Root: ({ children, className, ...props }: any) => (
    <div data-testid="menubar-root" className={className} {...props}>{children}</div>
  ),
  Menu: ({ children, ...props }: any) => (
    <div data-testid="menubar-menu" {...props}>{children}</div>
  ),
  Trigger: ({ children, className, ...props }: any) => (
    <button data-testid="menubar-trigger" className={className} {...props}>{children}</button>
  ),
  Content: ({ children, className, align, alignOffset, sideOffset, ...props }: any) => (
    <div data-testid="menubar-content" className={className} data-align={align} data-align-offset={alignOffset} data-side-offset={sideOffset} {...props}>{children}</div>
  ),
  Item: ({ children, className, inset, ...props }: any) => (
    <div data-testid="menubar-item" className={className} data-inset={inset} {...props}>{children}</div>
  ),
  CheckboxItem: ({ children, className, checked, ...props }: any) => (
    <div data-testid="menubar-checkbox-item" className={className} data-checked={checked} {...props}>{children}</div>
  ),
  RadioItem: ({ children, className, ...props }: any) => (
    <div data-testid="menubar-radio-item" className={className} {...props}>{children}</div>
  ),
  Label: ({ children, className, inset, ...props }: any) => (
    <div data-testid="menubar-label" className={className} data-inset={inset} {...props}>{children}</div>
  ),
  Separator: ({ children, className, ...props }: any) => (
    <div data-testid="menubar-separator" className={className} {...props}>{children}</div>
  ),
  Group: ({ children, ...props }: any) => (
    <div data-testid="menubar-group" {...props}>{children}</div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="menubar-portal" {...props}>{children}</div>
  ),
  Sub: ({ children, ...props }: any) => (
    <div data-testid="menubar-sub" {...props}>{children}</div>
  ),
  SubTrigger: ({ children, className, inset, ...props }: any) => (
    <div data-testid="menubar-sub-trigger" className={className} data-inset={inset} {...props}>{children}</div>
  ),
  SubContent: ({ children, className, ...props }: any) => (
    <div data-testid="menubar-sub-content" className={className} {...props}>{children}</div>
  ),
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="menubar-radio-group" {...props}>{children}</div>
  ),
  ItemIndicator: ({ children, ...props }: any) => (
    <div data-testid="menubar-item-indicator" {...props}>{children}</div>
  )
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Check: ({ className }: any) => <svg data-testid="check-icon" className={className} />,
  ChevronRight: ({ className }: any) => <svg data-testid="chevron-right-icon" className={className} />,
  Circle: ({ className, fill }: any) => <svg data-testid="circle-icon" className={className} data-fill={fill} />
}))

describe('Menubar Components', () => {
  describe('Menubar', () => {
    it('renders correctly with default props', () => {
      render(<Menubar data-testid="test-menubar" />)
      expect(screen.getByTestId('menubar-root')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Menubar className="custom-class" data-testid="test-menubar" />)
      const menubar = screen.getByTestId('menubar-root')
      expect(menubar).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<Menubar data-testid="test-menubar" />)
      const menubar = screen.getByTestId('menubar-root')
      expect(menubar).toHaveClass('flex', 'h-10', 'items-center', 'space-x-1', 'rounded-md', 'border', 'bg-background', 'p-1')
    })

    it('renders children correctly', () => {
      render(
        <Menubar>
          <div data-testid="child">Child content</div>
        </Menubar>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Menubar ref={ref} data-testid="test-menubar" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Menubar data-testid="test-menubar" aria-label="Test menubar" />)
      const menubar = screen.getByTestId('menubar-root')
      expect(menubar).toHaveAttribute('aria-label', 'Test menubar')
    })
  })

  describe('MenubarMenu', () => {
    it('renders correctly with default props', () => {
      render(<MenubarMenu data-testid="test-menu" />)
      expect(screen.getByTestId('menubar-menu')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarMenu>
          <div data-testid="child">Menu content</div>
        </MenubarMenu>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarMenu data-testid="test-menu" aria-label="Test menu" />)
      const menu = screen.getByTestId('menubar-menu')
      expect(menu).toHaveAttribute('aria-label', 'Test menu')
    })
  })

  describe('MenubarTrigger', () => {
    it('renders correctly with default props', () => {
      render(<MenubarTrigger data-testid="test-trigger" />)
      expect(screen.getByTestId('menubar-trigger')).toBeInTheDocument()
    })

    it('renders as button element', () => {
      render(<MenubarTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('menubar-trigger')
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders with custom className', () => {
      render(<MenubarTrigger className="custom-class" data-testid="test-trigger" />)
      const trigger = screen.getByTestId('menubar-trigger')
      expect(trigger).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarTrigger data-testid="test-trigger" />)
      const trigger = screen.getByTestId('menubar-trigger')
      expect(trigger).toHaveClass('flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'px-3', 'py-1.5', 'text-sm', 'font-medium', 'outline-none', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[state=open]:bg-accent', 'data-[state=open]:text-accent-foreground')
    })

    it('renders children correctly', () => {
      render(
        <MenubarTrigger>
          <span data-testid="child">Trigger text</span>
        </MenubarTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<MenubarTrigger ref={ref} data-testid="test-trigger" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarTrigger data-testid="test-trigger" aria-label="Test trigger" />)
      const trigger = screen.getByTestId('menubar-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test trigger')
    })
  })

  describe('MenubarContent', () => {
    it('renders correctly with default props', () => {
      render(<MenubarContent data-testid="test-content" />)
      expect(screen.getByTestId('menubar-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarContent className="custom-class" data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarContent data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveClass('z-50', 'min-w-[12rem]', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'p-1', 'text-popover-foreground', 'shadow-md')
    })

    it('applies animation classes', () => {
      render(<MenubarContent data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95')
    })

    it('applies slide animation classes', () => {
      render(<MenubarContent data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveClass('data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2')
    })

    it('sets default align to start', () => {
      render(<MenubarContent data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveAttribute('data-align', 'start')
    })

    it('allows customizing align', () => {
      render(<MenubarContent align="center" data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveAttribute('data-align', 'center')
    })

    it('sets default alignOffset to -4', () => {
      render(<MenubarContent data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveAttribute('data-align-offset', '-4')
    })

    it('allows customizing alignOffset', () => {
      render(<MenubarContent alignOffset={0} data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveAttribute('data-align-offset', '0')
    })

    it('sets default sideOffset to 8', () => {
      render(<MenubarContent data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveAttribute('data-side-offset', '8')
    })

    it('allows customizing sideOffset', () => {
      render(<MenubarContent sideOffset={16} data-testid="test-content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveAttribute('data-side-offset', '16')
    })

    it('renders children correctly', () => {
      render(
        <MenubarContent>
          <div data-testid="child">Content text</div>
        </MenubarContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarContent ref={ref} data-testid="test-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarContent data-testid="test-content" aria-label="Test content" />)
      const content = screen.getByTestId('menubar-content')
      expect(content).toHaveAttribute('aria-label', 'Test content')
    })
  })

  describe('MenubarItem', () => {
    it('renders correctly with default props', () => {
      render(<MenubarItem data-testid="test-item" />)
      expect(screen.getByTestId('menubar-item')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarItem className="custom-class" data-testid="test-item" />)
      const item = screen.getByTestId('menubar-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarItem data-testid="test-item" />)
      const item = screen.getByTestId('menubar-item')
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'px-2', 'py-1.5', 'text-sm', 'outline-none', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
    })

    it('applies inset classes when inset is true', () => {
      render(<MenubarItem inset data-testid="test-item" />)
      const item = screen.getByTestId('menubar-item')
      expect(item).toHaveAttribute('data-inset', 'true')
    })

    it('renders children correctly', () => {
      render(
        <MenubarItem>
          <span data-testid="child">Item text</span>
        </MenubarItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarItem ref={ref} data-testid="test-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarItem data-testid="test-item" aria-label="Test item" />)
      const item = screen.getByTestId('menubar-item')
      expect(item).toHaveAttribute('aria-label', 'Test item')
    })
  })

  describe('MenubarCheckboxItem', () => {
    it('renders correctly with default props', () => {
      render(<MenubarCheckboxItem data-testid="test-checkbox-item" />)
      expect(screen.getByTestId('menubar-checkbox-item')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarCheckboxItem className="custom-class" data-testid="test-checkbox-item" />)
      const item = screen.getByTestId('menubar-checkbox-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarCheckboxItem data-testid="test-checkbox-item" />)
      const item = screen.getByTestId('menubar-checkbox-item')
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'py-1.5', 'pl-8', 'pr-2', 'text-sm', 'outline-none', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
    })

    it('sets checked attribute', () => {
      render(<MenubarCheckboxItem checked data-testid="test-checkbox-item" />)
      const item = screen.getByTestId('menubar-checkbox-item')
      expect(item).toHaveAttribute('data-checked', 'true')
    })

    it('renders check icon indicator', () => {
      render(<MenubarCheckboxItem data-testid="test-checkbox-item" />)
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarCheckboxItem>
          <span data-testid="child">Checkbox text</span>
        </MenubarCheckboxItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarCheckboxItem ref={ref} data-testid="test-checkbox-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarCheckboxItem data-testid="test-checkbox-item" aria-label="Test checkbox" />)
      const item = screen.getByTestId('menubar-checkbox-item')
      expect(item).toHaveAttribute('aria-label', 'Test checkbox')
    })
  })

  describe('MenubarRadioItem', () => {
    it('renders correctly with default props', () => {
      render(<MenubarRadioItem data-testid="test-radio-item" />)
      expect(screen.getByTestId('menubar-radio-item')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarRadioItem className="custom-class" data-testid="test-radio-item" />)
      const item = screen.getByTestId('menubar-radio-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarRadioItem data-testid="test-radio-item" />)
      const item = screen.getByTestId('menubar-radio-item')
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'py-1.5', 'pl-8', 'pr-2', 'text-sm', 'outline-none', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
    })

    it('renders circle icon indicator', () => {
      render(<MenubarRadioItem data-testid="test-radio-item" />)
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarRadioItem>
          <span data-testid="child">Radio text</span>
        </MenubarRadioItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarRadioItem ref={ref} data-testid="test-radio-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarRadioItem data-testid="test-radio-item" aria-label="Test radio" />)
      const item = screen.getByTestId('menubar-radio-item')
      expect(item).toHaveAttribute('aria-label', 'Test radio')
    })
  })

  describe('MenubarLabel', () => {
    it('renders correctly with default props', () => {
      render(<MenubarLabel data-testid="test-label" />)
      expect(screen.getByTestId('menubar-label')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarLabel className="custom-class" data-testid="test-label" />)
      const label = screen.getByTestId('menubar-label')
      expect(label).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarLabel data-testid="test-label" />)
      const label = screen.getByTestId('menubar-label')
      expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold')
    })

    it('applies inset classes when inset is true', () => {
      render(<MenubarLabel inset data-testid="test-label" />)
      const label = screen.getByTestId('menubar-label')
      expect(label).toHaveAttribute('data-inset', 'true')
    })

    it('renders children correctly', () => {
      render(
        <MenubarLabel>
          <span data-testid="child">Label text</span>
        </MenubarLabel>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarLabel ref={ref} data-testid="test-label" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarLabel data-testid="test-label" aria-label="Test label" />)
      const label = screen.getByTestId('menubar-label')
      expect(label).toHaveAttribute('aria-label', 'Test label')
    })
  })

  describe('MenubarSeparator', () => {
    it('renders correctly with default props', () => {
      render(<MenubarSeparator data-testid="test-separator" />)
      expect(screen.getByTestId('menubar-separator')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarSeparator className="custom-class" data-testid="test-separator" />)
      const separator = screen.getByTestId('menubar-separator')
      expect(separator).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('menubar-separator')
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarSeparator ref={ref} data-testid="test-separator" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarSeparator data-testid="test-separator" aria-label="Test separator" />)
      const separator = screen.getByTestId('menubar-separator')
      expect(separator).toHaveAttribute('aria-label', 'Test separator')
    })
  })

  describe('MenubarShortcut', () => {
    it('renders correctly with default props', () => {
      render(<MenubarShortcut data-testid="test-shortcut" />)
      expect(screen.getByTestId('test-shortcut')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      render(<MenubarShortcut data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut.tagName).toBe('SPAN')
    })

    it('renders with custom className', () => {
      render(<MenubarShortcut className="custom-class" data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarShortcut data-testid="test-shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'text-muted-foreground')
    })

    it('renders children correctly', () => {
      render(
        <MenubarShortcut>
          <span data-testid="child">⌘K</span>
        </MenubarShortcut>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarShortcut data-testid="test-shortcut" aria-label="Test shortcut" />)
      const shortcut = screen.getByTestId('test-shortcut')
      expect(shortcut).toHaveAttribute('aria-label', 'Test shortcut')
    })
  })

  describe('MenubarGroup', () => {
    it('renders correctly with default props', () => {
      render(<MenubarGroup data-testid="test-group" />)
      expect(screen.getByTestId('menubar-group')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarGroup>
          <div data-testid="child">Group content</div>
        </MenubarGroup>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarGroup data-testid="test-group" aria-label="Test group" />)
      const group = screen.getByTestId('menubar-group')
      expect(group).toHaveAttribute('aria-label', 'Test group')
    })
  })

  describe('MenubarPortal', () => {
    it('renders correctly with default props', () => {
      render(<MenubarPortal data-testid="test-portal" />)
      expect(screen.getByTestId('menubar-portal')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarPortal>
          <div data-testid="child">Portal content</div>
        </MenubarPortal>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarPortal data-testid="test-portal" aria-label="Test portal" />)
      const portal = screen.getByTestId('menubar-portal')
      expect(portal).toHaveAttribute('aria-label', 'Test portal')
    })
  })

  describe('MenubarSub', () => {
    it('renders correctly with default props', () => {
      render(<MenubarSub data-testid="test-sub" />)
      expect(screen.getByTestId('menubar-sub')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarSub>
          <div data-testid="child">Sub content</div>
        </MenubarSub>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarSub data-testid="test-sub" aria-label="Test sub" />)
      const sub = screen.getByTestId('menubar-sub')
      expect(sub).toHaveAttribute('aria-label', 'Test sub')
    })
  })

  describe('MenubarSubTrigger', () => {
    it('renders correctly with default props', () => {
      render(<MenubarSubTrigger data-testid="test-sub-trigger" />)
      expect(screen.getByTestId('menubar-sub-trigger')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarSubTrigger className="custom-class" data-testid="test-sub-trigger" />)
      const trigger = screen.getByTestId('menubar-sub-trigger')
      expect(trigger).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarSubTrigger data-testid="test-sub-trigger" />)
      const trigger = screen.getByTestId('menubar-sub-trigger')
      expect(trigger).toHaveClass('flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'px-2', 'py-1.5', 'text-sm', 'outline-none', 'focus:bg-accent', 'focus:text-accent-foreground', 'data-[state=open]:bg-accent', 'data-[state=open]:text-accent-foreground')
    })

    it('applies inset classes when inset is true', () => {
      render(<MenubarSubTrigger inset data-testid="test-sub-trigger" />)
      const trigger = screen.getByTestId('menubar-sub-trigger')
      expect(trigger).toHaveAttribute('data-inset', 'true')
    })

    it('renders chevron right icon', () => {
      render(<MenubarSubTrigger data-testid="test-sub-trigger" />)
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarSubTrigger>
          <span data-testid="child">Sub trigger text</span>
        </MenubarSubTrigger>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarSubTrigger ref={ref} data-testid="test-sub-trigger" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarSubTrigger data-testid="test-sub-trigger" aria-label="Test sub trigger" />)
      const trigger = screen.getByTestId('menubar-sub-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Test sub trigger')
    })
  })

  describe('MenubarSubContent', () => {
    it('renders correctly with default props', () => {
      render(<MenubarSubContent data-testid="test-sub-content" />)
      expect(screen.getByTestId('menubar-sub-content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<MenubarSubContent className="custom-class" data-testid="test-sub-content" />)
      const content = screen.getByTestId('menubar-sub-content')
      expect(content).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<MenubarSubContent data-testid="test-sub-content" />)
      const content = screen.getByTestId('menubar-sub-content')
      expect(content).toHaveClass('z-50', 'min-w-[8rem]', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'p-1', 'text-popover-foreground')
    })

    it('applies animation classes', () => {
      render(<MenubarSubContent data-testid="test-sub-content" />)
      const content = screen.getByTestId('menubar-sub-content')
      expect(content).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95')
    })

    it('applies slide animation classes', () => {
      render(<MenubarSubContent data-testid="test-sub-content" />)
      const content = screen.getByTestId('menubar-sub-content')
      expect(content).toHaveClass('data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2')
    })

    it('renders children correctly', () => {
      render(
        <MenubarSubContent>
          <div data-testid="child">Sub content text</div>
        </MenubarSubContent>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<MenubarSubContent ref={ref} data-testid="test-sub-content" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarSubContent data-testid="test-sub-content" aria-label="Test sub content" />)
      const content = screen.getByTestId('menubar-sub-content')
      expect(content).toHaveAttribute('aria-label', 'Test sub content')
    })
  })

  describe('MenubarRadioGroup', () => {
    it('renders correctly with default props', () => {
      render(<MenubarRadioGroup data-testid="test-radio-group" />)
      expect(screen.getByTestId('menubar-radio-group')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <MenubarRadioGroup>
          <div data-testid="child">Radio group content</div>
        </MenubarRadioGroup>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<MenubarRadioGroup data-testid="test-radio-group" aria-label="Test radio group" />)
      const group = screen.getByTestId('menubar-radio-group')
      expect(group).toHaveAttribute('aria-label', 'Test radio group')
    })
  })

  describe('Menubar Composition', () => {
    it('renders complete menubar structure', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarLabel>File</MenubarLabel>
                <MenubarItem>New</MenubarItem>
                <MenubarItem>Open</MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem checked>Show hidden files</MenubarCheckboxItem>
                <MenubarRadioGroup>
                  <MenubarRadioItem>Option 1</MenubarRadioItem>
                  <MenubarRadioItem>Option 2</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByTestId('menubar-root')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-menu')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-content')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-group')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-label')).toBeInTheDocument()
      expect(screen.getAllByTestId('menubar-item')).toHaveLength(2)
      expect(screen.getByTestId('menubar-separator')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-checkbox-item')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-radio-group')).toBeInTheDocument()
      expect(screen.getAllByTestId('menubar-radio-item')).toHaveLength(2)
    })

    it('handles empty children', () => {
      render(
        <Menubar>
          <MenubarMenu></MenubarMenu>
        </Menubar>
      )
      expect(screen.getByTestId('menubar-root')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <Menubar>
          <MenubarMenu>{null}</MenubarMenu>
        </Menubar>
      )
      expect(screen.getByTestId('menubar-root')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <Menubar>
          <MenubarMenu>{undefined}</MenubarMenu>
        </Menubar>
      )
      expect(screen.getByTestId('menubar-root')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<Menubar className="custom-menubar-class" data-testid="test-menubar" />)
      const menubar = screen.getByTestId('menubar-root')
      expect(menubar).toHaveClass('custom-menubar-class')
      expect(menubar).toHaveClass('flex', 'h-10', 'items-center')
    })

    it('handles multiple custom classes', () => {
      render(<Menubar className="class1 class2 class3" data-testid="test-menubar" />)
      const menubar = screen.getByTestId('menubar-root')
      expect(menubar).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const menubar = screen.getByTestId('menubar-root')
      const menu = screen.getByTestId('menubar-menu')
      expect(menubar).toContainElement(menu)
    })

    it('renders with different align values', () => {
      const alignValues = ['start', 'center', 'end'] as const
      
      alignValues.forEach(align => {
        const { unmount } = render(
          <MenubarContent align={align} data-testid={`test-content-${align}`} />
        )
        const content = screen.getByTestId(`test-content-${align}`)
        expect(content).toHaveAttribute('data-align', align)
        unmount()
      })
    })

    it('renders with different alignOffset values', () => {
      const alignOffsetValues = [-8, -4, 0, 4, 8] as const
      
      alignOffsetValues.forEach(offset => {
        const { unmount } = render(
          <MenubarContent alignOffset={offset} data-testid={`test-content-${offset}`} />
        )
        const content = screen.getByTestId(`test-content-${offset}`)
        expect(content).toHaveAttribute('data-align-offset', offset.toString())
        unmount()
      })
    })

    it('renders with different sideOffset values', () => {
      const sideOffsetValues = [0, 4, 8, 16] as const
      
      sideOffsetValues.forEach(offset => {
        const { unmount } = render(
          <MenubarContent sideOffset={offset} data-testid={`test-content-${offset}`} />
        )
        const content = screen.getByTestId(`test-content-${offset}`)
        expect(content).toHaveAttribute('data-side-offset', offset.toString())
        unmount()
      })
    })

    it('renders with complex menubar structure', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarLabel>File</MenubarLabel>
                <MenubarItem>New</MenubarItem>
                <MenubarItem>Open</MenubarItem>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>More</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Advanced</MenubarItem>
                    <MenubarCheckboxItem checked>Show hidden</MenubarCheckboxItem>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getAllByTestId('menubar-menu')).toHaveLength(2)
      expect(screen.getAllByTestId('menubar-trigger')).toHaveLength(2)
      expect(screen.getAllByTestId('menubar-content')).toHaveLength(2)
      expect(screen.getByTestId('menubar-sub')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-sub-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('menubar-sub-content')).toBeInTheDocument()
    })
  })
})