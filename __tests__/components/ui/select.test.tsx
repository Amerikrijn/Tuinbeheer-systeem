import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Select, 
  SelectGroup, 
  SelectValue, 
  SelectTrigger, 
  SelectContent, 
  SelectLabel, 
  SelectItem, 
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from '@/components/ui/select'

// Mock Radix UI Select primitives
jest.mock('@radix-ui/react-select', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
    <div
      ref={ref}
      role="combobox"
      {...props}
    >
      {children}
    </div>
  )),
  Group: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      {...props}
    >
      {children}
    </div>
  )),
  Value: React.forwardRef<HTMLSpanElement, any>(({ children, ...props }, ref) => (
    <span
      ref={ref}
      {...props}
    >
      {children}
    </span>
  )),
  Trigger: React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      role="combobox"
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
  Portal: ({ children }: any) => <div data-testid="portal">{children}</div>,
  Content: React.forwardRef<HTMLDivElement, any>(({ className, children, position, ...props }, ref) => (
    <div
      ref={ref}
      role="listbox"
      className={className}
      data-position={position}
      {...props}
    >
      {children}
    </div>
  )),
  ScrollUpButton: React.forwardRef<HTMLButtonElement, any>(({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={className}
      {...props}
    >
      <svg className="h-4 w-4" data-testid="chevron-up" />
    </button>
  )),
  ScrollDownButton: React.forwardRef<HTMLButtonElement, any>(({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={className}
      {...props}
    >
      <svg className="h-4 w-4" data-testid="chevron-down" />
    </button>
  )),
  Viewport: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Label: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  )),
  Item: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="option"
      className={className}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <div className="item-indicator">
          <svg className="h-4 w-4" data-testid="check-icon" />
        </div>
      </span>
      <span className="item-text">{children}</span>
    </div>
  )),
  Separator: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  )),
  Icon: ({ children, asChild }: any) => {
    if (asChild) return children
    return <div className="select-icon">{children}</div>
  },
  ItemIndicator: ({ children }: any) => <div className="item-indicator">{children}</div>,
  ItemText: ({ children }: any) => <span className="item-text">{children}</span>
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: ({ className, ...props }: any) => (
    <svg className={className} data-testid="check-icon" {...props} />
  ),
  ChevronDown: ({ className, ...props }: any) => (
    <svg className={className} data-testid="chevron-down" {...props} />
  ),
  ChevronUp: ({ className, ...props }: any) => (
    <svg className={className} data-testid="chevron-up" {...props} />
  )
}))

describe('Select Components', () => {
  describe('Select (Root)', () => {
    it('renders correctly with default props', () => {
      render(<Select>Test Select</Select>)
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(<Select>Test Content</Select>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Select data-testid="test-select" id="select-1">Test Select</Select>)
      const select = screen.getByTestId('test-select')
      expect(select).toHaveAttribute('id', 'select-1')
    })
  })

  describe('SelectGroup', () => {
    it('renders correctly with default props', () => {
      render(<SelectGroup>Test Group</SelectGroup>)
      const group = screen.getByRole('group')
      expect(group).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(<SelectGroup>Test Content</SelectGroup>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<SelectGroup data-testid="test-group" id="group-1">Test Group</SelectGroup>)
      const group = screen.getByTestId('test-group')
      expect(group).toHaveAttribute('id', 'group-1')
    })
  })

  describe('SelectValue', () => {
    it('renders correctly with default props', () => {
      render(<SelectValue>Test Value</SelectValue>)
      const value = screen.getByText('Test Value')
      expect(value).toBeInTheDocument()
      expect(value.tagName).toBe('SPAN')
    })

    it('renders children correctly', () => {
      render(<SelectValue>Test Content</SelectValue>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<SelectValue data-testid="test-value" id="value-1">Test Value</SelectValue>)
      const value = screen.getByTestId('test-value')
      expect(value).toHaveAttribute('id', 'value-1')
    })
  })

  describe('SelectTrigger', () => {
    it('renders correctly with default props', () => {
      render(<SelectTrigger>Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('renders with custom className', () => {
      render(<SelectTrigger className="custom-trigger">Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('applies default classes', () => {
      render(<SelectTrigger>Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('flex', 'h-10', 'w-full', 'items-center', 'justify-between', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-sm')
    })

    it('applies ring offset classes', () => {
      render(<SelectTrigger>Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('ring-offset-background')
    })

    it('applies focus classes', () => {
      render(<SelectTrigger>Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2')
    })

    it('applies disabled classes', () => {
      render(<SelectTrigger>Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('applies span line clamp classes', () => {
      render(<SelectTrigger>Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('[&>span]:line-clamp-1')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<SelectTrigger ref={ref}>Test Trigger</SelectTrigger>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('spreads additional props', () => {
      render(<SelectTrigger data-testid="test-trigger" id="trigger-1">Test Trigger</SelectTrigger>)
      const trigger = screen.getByTestId('test-trigger')
      expect(trigger).toHaveAttribute('id', 'trigger-1')
    })

    it('renders chevron down icon', () => {
      render(<SelectTrigger>Test Trigger</SelectTrigger>)
      const chevronDown = screen.getByTestId('chevron-down')
      expect(chevronDown).toBeInTheDocument()
      expect(chevronDown).toHaveClass('h-4', 'w-4', 'opacity-50')
    })
  })

  describe('SelectContent', () => {
    it('renders correctly with default props', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const content = screen.getByRole('listbox')
      expect(content).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<SelectContent className="custom-content">Test Content</SelectContent>)
      const content = screen.getByRole('listbox')
      expect(content).toHaveClass('custom-content')
    })

    it('applies default classes', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const content = screen.getByRole('listbox')
      expect(content).toHaveClass('relative', 'z-50', 'max-h-96', 'min-w-[8rem]', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'text-popover-foreground', 'shadow-md')
    })

    it('applies animation classes', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const content = screen.getByRole('listbox')
      expect(content).toHaveClass('data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0')
    })

    it('applies zoom classes', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const content = screen.getByRole('listbox')
      expect(content).toHaveClass('data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95')
    })

    it('applies slide classes', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const content = screen.getByRole('listbox')
      expect(content).toHaveClass('data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2')
    })

    it('applies popper position classes when position is popper', () => {
      render(<SelectContent position="popper">Test Content</SelectContent>)
      const content = screen.getByRole('listbox')
      expect(content).toHaveClass('data-[side=bottom]:translate-y-1', 'data-[side=left]:-translate-x-1', 'data-[side=right]:translate-x-1', 'data-[side=top]:-translate-y-1')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<SelectContent ref={ref}>Test Content</SelectContent>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<SelectContent data-testid="test-content" id="content-1">Test Content</SelectContent>)
      const content = screen.getByTestId('test-content')
      expect(content).toHaveAttribute('id', 'content-1')
    })

    it('renders portal wrapper', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const portal = screen.getByTestId('portal')
      expect(portal).toBeInTheDocument()
    })

    it('renders scroll up and down buttons', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const scrollUp = screen.getByTestId('chevron-up')
      const scrollDown = screen.getByTestId('chevron-down')
      expect(scrollUp).toBeInTheDocument()
      expect(scrollDown).toBeInTheDocument()
    })

    it('renders viewport with correct classes', () => {
      render(<SelectContent>Test Content</SelectContent>)
      const viewport = screen.getByRole('listbox').querySelector('div')
      expect(viewport).toHaveClass('p-1')
    })

    it('applies popper viewport classes when position is popper', () => {
      render(<SelectContent position="popper">Test Content</SelectContent>)
      const viewport = screen.getByRole('listbox').querySelector('div')
      expect(viewport).toHaveClass('h-[var(--radix-select-trigger-height)]', 'w-full', 'min-w-[var(--radix-select-trigger-width)]')
    })
  })

  describe('SelectLabel', () => {
    it('renders correctly with default props', () => {
      render(<SelectLabel>Test Label</SelectLabel>)
      const label = screen.getByText('Test Label')
      expect(label).toBeInTheDocument()
      expect(label.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<SelectLabel className="custom-label">Test Label</SelectLabel>)
      const label = screen.getByText('Test Label')
      expect(label).toHaveClass('custom-label')
    })

    it('applies default classes', () => {
      render(<SelectLabel>Test Label</SelectLabel>)
      const label = screen.getByText('Test Label')
      expect(label).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm', 'font-semibold')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<SelectLabel ref={ref}>Test Label</SelectLabel>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<SelectLabel data-testid="test-label" id="label-1">Test Label</SelectLabel>)
      const label = screen.getByTestId('test-label')
      expect(label).toHaveAttribute('id', 'label-1')
    })
  })

  describe('SelectItem', () => {
    it('renders correctly with default props', () => {
      render(<SelectItem>Test Item</SelectItem>)
      const item = screen.getByRole('option')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<SelectItem className="custom-item">Test Item</SelectItem>)
      const item = screen.getByRole('option')
      expect(item).toHaveClass('custom-item')
    })

    it('applies default classes', () => {
      render(<SelectItem>Test Item</SelectItem>)
      const item = screen.getByRole('option')
      expect(item).toHaveClass('relative', 'flex', 'w-full', 'cursor-default', 'select-none', 'items-center', 'rounded-sm', 'py-1.5', 'pl-8', 'pr-2', 'text-sm', 'outline-none')
    })

    it('applies focus classes', () => {
      render(<SelectItem>Test Item</SelectItem>)
      const item = screen.getByRole('option')
      expect(item).toHaveClass('focus:bg-accent', 'focus:text-accent-foreground')
    })

    it('applies disabled classes', () => {
      render(<SelectItem>Test Item</SelectItem>)
      const item = screen.getByRole('option')
      expect(item).toHaveClass('data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<SelectItem ref={ref}>Test Item</SelectItem>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<SelectItem data-testid="test-item" id="item-1" value="option1">Test Item</SelectItem>)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveAttribute('id', 'item-1')
      expect(item).toHaveAttribute('value', 'option1')
    })

    it('renders check icon indicator', () => {
      render(<SelectItem>Test Item</SelectItem>)
      const item = screen.getByRole('option')
      const checkIcon = item.querySelector('[data-testid="check-icon"]')
      expect(checkIcon).toBeInTheDocument()
      expect(checkIcon).toHaveClass('h-4', 'w-4')
    })

    it('renders item text', () => {
      render(<SelectItem>Test Item</SelectItem>)
      const itemText = screen.getByText('Test Item')
      expect(itemText).toBeInTheDocument()
    })
  })

  describe('SelectSeparator', () => {
    it('renders correctly with default props', () => {
      render(<SelectSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toBeInTheDocument()
      expect(separator.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<SelectSeparator className="custom-separator" data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveClass('custom-separator')
    })

    it('applies default classes', () => {
      render(<SelectSeparator data-testid="test-separator" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<SelectSeparator ref={ref} />)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<SelectSeparator data-testid="test-separator" id="separator-1" />)
      const separator = screen.getByTestId('test-separator')
      expect(separator).toHaveAttribute('id', 'separator-1')
    })
  })

  describe('SelectScrollUpButton', () => {
    it('renders correctly with default props', () => {
      render(<SelectScrollUpButton />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<SelectScrollUpButton className="custom-scroll-up" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-scroll-up')
    })

    it('applies default classes', () => {
      render(<SelectScrollUpButton />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('flex', 'cursor-default', 'items-center', 'justify-center', 'py-1')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<SelectScrollUpButton ref={ref} />)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('spreads additional props', () => {
      render(<SelectScrollUpButton data-testid="test-scroll-up" id="scroll-up-1" />)
      const button = screen.getByTestId('test-scroll-up')
      expect(button).toHaveAttribute('id', 'scroll-up-1')
    })

    it('renders chevron up icon', () => {
      render(<SelectScrollUpButton />)
      const chevronUp = screen.getByTestId('chevron-up')
      expect(chevronUp).toBeInTheDocument()
      expect(chevronUp).toHaveClass('h-4', 'w-4')
    })
  })

  describe('SelectScrollDownButton', () => {
    it('renders correctly with default props', () => {
      render(<SelectScrollDownButton />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<SelectScrollDownButton className="custom-scroll-down" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-scroll-down')
    })

    it('applies default classes', () => {
      render(<SelectScrollDownButton />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('flex', 'cursor-default', 'items-center', 'justify-center', 'py-1')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<SelectScrollDownButton ref={ref} />)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('spreads additional props', () => {
      render(<SelectScrollDownButton data-testid="test-scroll-down" id="scroll-down-1" />)
      const button = screen.getByTestId('test-scroll-down')
      expect(button).toHaveAttribute('id', 'scroll-down-1')
    })

    it('renders chevron down icon', () => {
      render(<SelectScrollDownButton />)
      const chevronDown = screen.getByTestId('chevron-down')
      expect(chevronDown).toBeInTheDocument()
      expect(chevronDown).toHaveClass('h-4', 'w-4')
    })
  })

  describe('Select Composition', () => {
    it('renders complete select structure', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Options</SelectLabel>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      )

      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes).toHaveLength(2) // Root and Trigger
      const trigger = comboboxes[1] // The button trigger
      expect(trigger.querySelector('[placeholder="Select an option"]')).toBeInTheDocument()
      expect(screen.getByText('Options')).toBeInTheDocument()
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(<Select />)
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<Select>{null}</Select>)
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Select>{undefined}</Select>)
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<SelectTrigger className="extra-class">Test Trigger</SelectTrigger>)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('flex', 'h-10', 'w-full', 'items-center', 'justify-between', 'rounded-md', 'border', 'border-input', 'bg-background', 'px-3', 'py-2', 'text-sm', 'extra-class')
    })

    it('handles multiple custom classes', () => {
      render(<SelectItem className="class1 class2 class3">Test Item</SelectItem>)
      const item = screen.getByRole('option')
      expect(item).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains accessibility roles', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue>Select</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes).toHaveLength(2) // Root and Trigger
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getByRole('option')).toBeInTheDocument()
    })
  })
})