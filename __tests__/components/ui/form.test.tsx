import React from 'react'
import { render, screen } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { 
  useFormField, 
  Form, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage, 
  FormField 
} from '@/components/ui/form'

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
  FormProvider: ({ children, ...props }: any) => (
    <div data-testid="form-provider" {...props}>{children}</div>
  ),
  Controller: ({ children, ...props }: any) => (
    <div data-testid="form-controller" {...props}>{children}</div>
  )
}))

// Mock Radix UI components
jest.mock('@radix-ui/react-label', () => ({
  Root: ({ children, className, ...props }: any) => (
    <label data-testid="label-root" className={className} {...props}>{children}</label>
  )
}))

jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => (
    <div data-testid="slot" {...props}>{children}</div>
  )
}))

// Mock Label component
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className, htmlFor, ...props }: any) => (
    <label data-testid="label" className={className} htmlFor={htmlFor} {...props}>{children}</label>
  )
}))

// Test wrapper component
const TestFormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      testField: ''
    }
  })

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  )
}

describe('Form Components', () => {
  beforeEach(() => {
    (useForm as jest.Mock).mockReturnValue({
      defaultValues: { testField: '' },
      formState: { errors: {} },
      getFieldState: jest.fn().mockReturnValue({ error: null })
    })
  })

  describe('Form', () => {
    it('renders correctly with default props', () => {
      render(<Form data-testid="test-form" />)
      expect(screen.getByTestId('form-provider')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <Form>
          <div data-testid="child">Child content</div>
        </Form>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<Form data-testid="test-form" aria-label="Test form" />)
      const form = screen.getByTestId('form-provider')
      expect(form).toHaveAttribute('aria-label', 'Test form')
    })
  })

  describe('FormItem', () => {
    it('renders correctly with default props', () => {
      render(<FormItem data-testid="test-item" />)
      expect(screen.getByTestId('test-item')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<FormItem data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item.tagName).toBe('DIV')
    })

    it('renders with custom className', () => {
      render(<FormItem className="custom-class" data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(<FormItem data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('space-y-2')
    })

    it('renders children correctly', () => {
      render(
        <FormItem>
          <div data-testid="child">Item content</div>
        </FormItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<FormItem ref={ref} data-testid="test-item" />)
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(<FormItem data-testid="test-item" aria-label="Test item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveAttribute('aria-label', 'Test item')
    })
  })

  describe('FormLabel', () => {
    it('renders correctly with default props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormLabel data-testid="test-label" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('label')).toBeInTheDocument()
    })

    it('renders as label element', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormLabel data-testid="test-label" />
          </FormItem>
        </TestFormWrapper>
      )
      const label = screen.getByTestId('label')
      expect(label.tagName).toBe('LABEL')
    })

    it('renders with custom className', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormLabel className="custom-class" data-testid="test-label" />
          </FormItem>
        </TestFormWrapper>
      )
      const label = screen.getByTestId('label')
      expect(label).toHaveClass('custom-class')
    })

    it('applies error classes when there is an error', () => {
      (useForm as jest.Mock).mockReturnValue({
        defaultValues: { testField: '' },
        formState: { errors: { testField: { message: 'Error message' } } },
        getFieldState: jest.fn().mockReturnValue({ error: { message: 'Error message' } })
      })

      render(
        <TestFormWrapper>
          <FormItem>
            <FormLabel data-testid="test-label" />
          </FormItem>
        </TestFormWrapper>
      )
      const label = screen.getByTestId('label')
      expect(label).toHaveClass('text-destructive')
    })

    it('renders children correctly', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormLabel>
              <span data-testid="child">Label text</span>
            </FormLabel>
          </FormItem>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLabelElement>()
      render(
        <TestFormWrapper>
          <FormItem>
            <FormLabel ref={ref} data-testid="test-label" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormLabel data-testid="test-label" aria-label="Test label" />
          </FormItem>
        </TestFormWrapper>
      )
      const label = screen.getByTestId('label')
      expect(label).toHaveAttribute('aria-label', 'Test label')
    })
  })

  describe('FormControl', () => {
    it('renders correctly with default props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl data-testid="test-control" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('slot')).toBeInTheDocument()
    })

    it('renders as Slot element', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl data-testid="test-control" />
          </FormItem>
        </TestFormWrapper>
      )
      const control = screen.getByTestId('slot')
      expect(control).toBeInTheDocument()
    })

    it('sets formItemId as id', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl data-testid="test-control" />
          </FormItem>
        </TestFormWrapper>
      )
      const control = screen.getByTestId('slot')
      expect(control).toHaveAttribute('id')
    })

    it('sets aria-describedby without error', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl data-testid="test-control" />
          </FormItem>
        </TestFormWrapper>
      )
      const control = screen.getByTestId('slot')
      expect(control).toHaveAttribute('aria-describedby')
    })

    it('sets aria-describedby with error', () => {
      (useForm as jest.Mock).mockReturnValue({
        defaultValues: { testField: '' },
        formState: { errors: { testField: { message: 'Error message' } } },
        getFieldState: jest.fn().mockReturnValue({ error: { message: 'Error message' } })
      })

      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl data-testid="test-control" />
          </FormItem>
        </TestFormWrapper>
      )
      const control = screen.getByTestId('slot')
      expect(control).toHaveAttribute('aria-describedby')
    })

    it('sets aria-invalid when there is an error', () => {
      (useForm as jest.Mock).mockReturnValue({
        defaultValues: { testField: '' },
        formState: { errors: { testField: { message: 'Error message' } } },
        getFieldState: jest.fn().mockReturnValue({ error: { message: 'Error message' } })
      })

      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl data-testid="test-control" />
          </FormItem>
        </TestFormWrapper>
      )
      const control = screen.getByTestId('slot')
      expect(control).toHaveAttribute('aria-invalid', 'true')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl ref={ref} data-testid="test-control" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormControl data-testid="test-control" aria-label="Test control" />
          </FormItem>
        </TestFormWrapper>
      )
      const control = screen.getByTestId('slot')
      expect(control).toHaveAttribute('aria-label', 'Test control')
    })
  })

  describe('FormDescription', () => {
    it('renders correctly with default props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription data-testid="test-description" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('test-description')).toBeInTheDocument()
    })

    it('renders as p element', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription data-testid="test-description" />
          </FormItem>
        </TestFormWrapper>
      )
      const description = screen.getByTestId('test-description')
      expect(description.tagName).toBe('P')
    })

    it('renders with custom className', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription className="custom-class" data-testid="test-description" />
          </FormItem>
        </TestFormWrapper>
      )
      const description = screen.getByTestId('test-description')
      expect(description).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription data-testid="test-description" />
          </FormItem>
        </TestFormWrapper>
      )
      const description = screen.getByTestId('test-description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('sets formDescriptionId as id', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription data-testid="test-description" />
          </FormItem>
        </TestFormWrapper>
      )
      const description = screen.getByTestId('test-description')
      expect(description).toHaveAttribute('id')
    })

    it('renders children correctly', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription>
              <span data-testid="child">Description text</span>
            </FormDescription>
          </FormItem>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription ref={ref} data-testid="test-description" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormDescription data-testid="test-description" aria-label="Test description" />
          </FormItem>
        </TestFormWrapper>
      )
      const description = screen.getByTestId('test-description')
      expect(description).toHaveAttribute('aria-label', 'Test description')
    })
  })

  describe('FormMessage', () => {
    it('renders correctly with default props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('test-message')).toBeInTheDocument()
    })

    it('renders as p element', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      const message = screen.getByTestId('test-message')
      expect(message.tagName).toBe('P')
    })

    it('renders with custom className', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage className="custom-class" data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      const message = screen.getByTestId('test-message')
      expect(message).toHaveClass('custom-class')
    })

    it('applies default classes', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      const message = screen.getByTestId('test-message')
      expect(message).toHaveClass('text-sm', 'font-medium', 'text-destructive')
    })

    it('sets formMessageId as id', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      const message = screen.getByTestId('test-message')
      expect(message).toHaveAttribute('id')
    })

    it('renders error message when there is an error', () => {
      (useForm as jest.Mock).mockReturnValue({
        defaultValues: { testField: '' },
        formState: { errors: { testField: { message: 'Error message' } } },
        getFieldState: jest.fn().mockReturnValue({ error: { message: 'Error message' } })
      })

      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      const message = screen.getByTestId('test-message')
      expect(message).toHaveTextContent('Error message')
    })

    it('renders children when there is no error', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message">
              <span data-testid="child">Custom message</span>
            </FormMessage>
          </FormItem>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('returns null when there is no error and no children', () => {
      const { container } = render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(container.querySelector('[data-testid="test-message"]')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage ref={ref} data-testid="test-message" />
          </FormItem>
        </TestFormWrapper>
      )
      expect(ref.current).toBeInTheDocument()
    })

    it('spreads additional props', () => {
      render(
        <TestFormWrapper>
          <FormItem>
            <FormMessage data-testid="test-message" aria-label="Test message" />
          </FormItem>
        </TestFormWrapper>
      )
      const message = screen.getByTestId('test-message')
      expect(message).toHaveAttribute('aria-label', 'Test message')
    })
  })

  describe('FormField', () => {
    it('renders correctly with default props', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="testField"
            render={({ field }) => <input {...field} data-testid="test-input" />}
          />
        </TestFormWrapper>
      )
      expect(screen.getByTestId('form-controller')).toBeInTheDocument()
    })

    it('provides form field context', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="testField"
            render={({ field }) => <input {...field} data-testid="test-input" />}
          />
        </TestFormWrapper>
      )
      const controller = screen.getByTestId('form-controller')
      expect(controller).toHaveAttribute('name', 'testField')
    })

    it('spreads additional props', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="testField"
            rules={{ required: true }}
            render={({ field }) => <input {...field} data-testid="test-input" />}
          />
        </TestFormWrapper>
      )
      const controller = screen.getByTestId('form-controller')
      expect(controller).toHaveAttribute('rules')
    })
  })

  describe('useFormField', () => {
    it('throws error when used outside FormField context', () => {
      const TestComponent = () => {
        useFormField()
        return <div>Test</div>
      }

      expect(() => {
        render(
          <TestFormWrapper>
            <TestComponent />
          </TestFormWrapper>
        )
      }).toThrow('useFormField should be used within <FormField>')
    })
  })

  describe('Form Composition', () => {
    it('renders complete form structure', () => {
      render(
        <TestFormWrapper>
          <Form>
            <FormItem>
              <FormLabel>Test Field</FormLabel>
              <FormControl>
                <input type="text" />
              </FormControl>
              <FormDescription>This is a test field</FormDescription>
              <FormMessage />
            </FormItem>
          </Form>
        </TestFormWrapper>
      )

      expect(screen.getByTestId('form-provider')).toBeInTheDocument()
      expect(screen.getByTestId('label')).toBeInTheDocument()
      expect(screen.getByTestId('slot')).toBeInTheDocument()
      expect(screen.getByText('This is a test field')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <TestFormWrapper>
          <Form>
            <FormItem></FormItem>
          </Form>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('form-provider')).toBeInTheDocument()
    })

    it('handles null children', () => {
      render(
        <TestFormWrapper>
          <Form>
            <FormItem>{null}</FormItem>
          </Form>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('form-provider')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(
        <TestFormWrapper>
          <Form>
            <FormItem>{undefined}</FormItem>
          </Form>
        </TestFormWrapper>
      )
      expect(screen.getByTestId('form-provider')).toBeInTheDocument()
    })

    it('combines default and custom classes correctly', () => {
      render(<FormItem className="custom-item-class" data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('custom-item-class')
      expect(item).toHaveClass('space-y-2')
    })

    it('handles multiple custom classes', () => {
      render(<FormItem className="class1 class2 class3" data-testid="test-item" />)
      const item = screen.getByTestId('test-item')
      expect(item).toHaveClass('class1', 'class2', 'class3')
    })

    it('maintains proper component structure', () => {
      render(
        <TestFormWrapper>
          <Form>
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <input type="text" />
              </FormControl>
            </FormItem>
          </Form>
        </TestFormWrapper>
      )

      const form = screen.getByTestId('form-provider')
      expect(form).toBeInTheDocument()
    })
  })
})