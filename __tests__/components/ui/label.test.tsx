import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock Radix UI components to avoid context issues
jest.mock('@radix-ui/react-label', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <label
      ref={ref}
      className={className}
      data-testid="label-root"
      {...props}
    >
      {children}
    </label>
  ))
}));

describe('Label Component', () => {
  it('renders label text correctly', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders as label element', () => {
    render(<Label>Test</Label>)
    const label = screen.getByText('Test')
    expect(label.tagName).toBe('LABEL')
  })

  it('applies default variant classes', () => {
    render(<Label>Default Label</Label>)
    const label = screen.getByText('Default Label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('applies custom className', () => {
    render(<Label className="custom-class">Custom Label</Label>)
    const label = screen.getByText('Custom Label')
    expect(label).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Label ref={ref}>Ref Test</Label>)
    expect(ref).toHaveBeenCalled()
  })

  it('has correct display name', () => {
    expect(Label.displayName).toBe('Label')
  })
})