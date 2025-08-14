import React from 'react'
import { render, screen } from '@testing-library/react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Mock Radix UI RadioGroup primitives
jest.mock('@radix-ui/react-radio-group', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="radiogroup"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  Item: React.forwardRef<HTMLInputElement, any>(({ className, defaultChecked, ...props }, ref) => (
    <div
      ref={ref}
      role="radio"
      className={className}
      data-state={defaultChecked ? 'checked' : 'unchecked'}
      {...props}
    >
      <input type="radio" style={{ display: 'none' }} defaultChecked={defaultChecked} />
      <span className="flex items-center justify-center">
        <svg className="h-2.5 w-2.5 fill-current text-current" data-testid="circle-icon" />
      </span>
    </div>
  )),
  Indicator: React.forwardRef<HTMLSpanElement, any>(({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </span>
  ))
}))

// Mock lucide-react Circle icon
jest.mock('lucide-react', () => ({
  Circle: ({ className, ...props }: any) => (
    <svg
      className={className}
      data-testid="circle-icon"
      {...props}
    />
  )
}))

describe('RadioGroup Components', () => {
  describe('RadioGroup', () => {
    it('renders correctly with default props', () => {
      render(<RadioGroup>Test Group</RadioGroup>)
      const group = screen.getByRole('radiogroup')
      expect(group).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<RadioGroup className="custom-group">Test Group</RadioGroup>)
      const group = screen.getByRole('radiogroup')
      expect(group).toHaveClass('custom-group')
    })

    it('applies default classes', () => {
      render(<RadioGroup>Test Group</RadioGroup>)
      const group = screen.getByRole('radiogroup')
      expect(group).toHaveClass('grid', 'gap-2')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<RadioGroup ref={ref}>Test Group</RadioGroup>)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<RadioGroup data-testid="test-group" id="group-1">Test Group</RadioGroup>)
      const group = screen.getByTestId('test-group')
      expect(group).toHaveAttribute('id', 'group-1')
    })

    it('renders children correctly', () => {
      render(<RadioGroup>Test Content</RadioGroup>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('RadioGroupItem', () => {
    it('renders correctly with default props', () => {
      render(<RadioGroupItem />)
      const item = screen.getByRole('radio')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<RadioGroupItem className="custom-item" />)
      const item = screen.getByRole('radio')
      expect(item).toHaveClass('custom-item')
    })

    it('applies default classes', () => {
      render(<RadioGroupItem />)
      const item = screen.getByRole('radio')
      expect(item).toHaveClass('aspect-square', 'h-4', 'w-4', 'rounded-full', 'border', 'border-primary', 'text-primary')
    })

    it('applies ring offset classes', () => {
      render(<RadioGroupItem />)
      const item = screen.getByRole('radio')
      expect(item).toHaveClass('ring-offset-background')
    })

    it('applies focus classes', () => {
      render(<RadioGroupItem />)
      const item = screen.getByRole('radio')
      expect(item).toHaveClass('focus:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2')
    })

    it('applies disabled classes', () => {
      render(<RadioGroupItem />)
      const item = screen.getByRole('radio')
      expect(item).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<RadioGroupItem ref={ref} />)
      expect(ref.current).toBeInTheDocument()
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('spreads additional props', () => {
      render(<RadioGroupItem data-testid="test-item" id="item-1" name="test" value="option1" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveAttribute('id', 'item-1')
      expect(item).toHaveAttribute('name', 'test')
      expect(item).toHaveAttribute('value', 'option1')
    })

    it('renders indicator with Circle icon', () => {
      render(<RadioGroupItem />)
      const item = screen.getByRole('radio')
      const indicator = item.querySelector('span')
      const circleIcon = indicator?.querySelector('[data-testid="circle-icon"]')
      
      expect(indicator).toBeInTheDocument()
      expect(circleIcon).toBeInTheDocument()
      expect(indicator).toHaveClass('flex', 'items-center', 'justify-center')
      expect(circleIcon).toHaveClass('h-2.5', 'w-2.5', 'fill-current', 'text-current')
    })
  })

  describe('RadioGroup Composition', () => {
    it('renders complete radio group structure', () => {
      render(
        <RadioGroup>
          <RadioGroupItem name="test" value="option1" />
          <RadioGroupItem name="test" value="option2" />
          <RadioGroupItem name="test" value="option3" />
        </RadioGroup>
      )

      const group = screen.getByRole('radiogroup')
      const items = screen.getAllByRole('radio')
      
      expect(group).toBeInTheDocument()
      expect(items).toHaveLength(3)
      expect(items[0]).toHaveAttribute('value', 'option1')
      expect(items[1]).toHaveAttribute('value', 'option2')
      expect(items[2]).toHaveAttribute('value', 'option3')
    })

    it('handles empty children', () => {
      render(<RadioGroup />)
      const group = screen.getByRole('radiogroup')
      expect(group).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(<RadioGroup>{null}</RadioGroup>)
      const group = screen.getByRole('radiogroup')
      expect(group).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<RadioGroup>{undefined}</RadioGroup>)
      const group = screen.getByRole('radiogroup')
      expect(group).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<RadioGroup className="extra-class">Test Group</RadioGroup>)
      const group = screen.getByRole('radiogroup')
      expect(group).toHaveClass('grid', 'gap-2', 'extra-class')
    })

    it('handles multiple custom classes', () => {
      render(<RadioGroupItem className="class1 class2 class3" />)
      const item = screen.getByRole('radio')
      expect(item).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains accessibility roles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem name="test" value="option1" />
        </RadioGroup>
      )

      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
      expect(screen.getByRole('radio')).toBeInTheDocument()
    })

    it('handles radio group with labels', () => {
      render(
        <RadioGroup>
          <label>
            <RadioGroupItem name="test" value="option1" />
            Option 1
          </label>
          <label>
            <RadioGroupItem name="test" value="option2" />
            Option 2
          </label>
        </RadioGroup>
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getAllByRole('radio')).toHaveLength(2)
    })

    it('handles disabled state', () => {
      render(<RadioGroupItem disabled />)
      const item = screen.getByRole('radio')
      expect(item).toHaveAttribute('disabled')
    })

    it('handles checked state', () => {
      render(<RadioGroupItem defaultChecked />)
      const item = screen.getByRole('radio')
      expect(item).toHaveAttribute('data-state', 'checked')
    })

    it('handles value prop', () => {
      render(<RadioGroupItem value="test-value" />)
      const item = screen.getByRole('radio')
      expect(item).toHaveAttribute('value', 'test-value')
    })

    it('handles name prop', () => {
      render(<RadioGroupItem name="test-name" />)
      const item = screen.getByRole('radio')
      expect(item).toHaveAttribute('name', 'test-name')
    })
  })
})