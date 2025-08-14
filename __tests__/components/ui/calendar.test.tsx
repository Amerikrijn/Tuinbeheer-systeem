import React from 'react'
import { render, screen } from '@testing-library/react'
import { Calendar } from '@/components/ui/calendar'

// Mock react-day-picker
jest.mock('react-day-picker', () => ({
  DayPicker: ({ 
    className, 
    classNames, 
    showOutsideDays, 
    components, 
    ...props 
  }: any) => (
    <div data-testid="day-picker" className={className} {...props}>
      <div data-testid="day-picker-props">
        <span data-testid="show-outside-days">{showOutsideDays.toString()}</span>
        <span data-testid="class-names-count">{Object.keys(classNames || {}).length}</span>
        <span data-testid="components-count">{Object.keys(components || {}).length}</span>
      </div>
      <div data-testid="calendar-content">
        <div data-testid="months" className={classNames?.months}>Months container</div>
        <div data-testid="month" className={classNames?.month}>Month container</div>
        <div data-testid="caption" className={classNames?.caption}>Caption container</div>
        <div data-testid="caption-label" className={classNames?.caption_label}>Caption label</div>
        <div data-testid="nav" className={classNames?.nav}>Navigation container</div>
        <div data-testid="nav-button" className={classNames?.nav_button}>Navigation button</div>
        <div data-testid="nav-button-previous" className={classNames?.nav_button_previous}>Previous button</div>
        <div data-testid="nav-button-next" className={classNames?.nav_button_next}>Next button</div>
        <div data-testid="table" className={classNames?.table}>Table container</div>
        <div data-testid="head-row" className={classNames?.head_row}>Header row</div>
        <div data-testid="head-cell" className={classNames?.head_cell}>Header cell</div>
        <div data-testid="row" className={classNames?.row}>Row container</div>
        <div data-testid="cell" className={classNames?.cell}>Cell container</div>
        <div data-testid="day" className={classNames?.day}>Day button</div>
        <div data-testid="day-range-end" className={classNames?.day_range_end}>Day range end</div>
        <div data-testid="day-selected" className={classNames?.day_selected}>Selected day</div>
        <div data-testid="day-today" className={classNames?.day_today}>Today</div>
        <div data-testid="day-outside" className={classNames?.day_outside}>Outside day</div>
        <div data-testid="day-disabled" className={classNames?.day_disabled}>Disabled day</div>
        <div data-testid="day-range-middle" className={classNames?.day_range_middle}>Range middle</div>
        <div data-testid="day-hidden" className={classNames?.day_hidden}>Hidden day</div>
      </div>
      <div data-testid="custom-components">
        {components?.IconLeft && <components.IconLeft data-testid="icon-left" />}
        {components?.IconRight && <components.IconRight data-testid="icon-right" />}
      </div>
    </div>
  )
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronLeft: ({ className }: any) => <svg data-testid="chevron-left" className={className} />,
  ChevronRight: ({ className }: any) => <svg data-testid="chevron-right" className={className} />
}))

// Mock button component
jest.mock('@/components/ui/button', () => ({
  buttonVariants: ({ variant }: any) => `button-${variant || 'default'}`
}))

describe('Calendar Component', () => {
  it('renders correctly with default props', () => {
    render(<Calendar data-testid="test-calendar" />)
    expect(screen.getByTestId('day-picker')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Calendar className="custom-class" data-testid="test-calendar" />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveClass('custom-class')
  })

  it('applies default classes', () => {
    render(<Calendar data-testid="test-calendar" />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveClass('p-3')
  })

  it('sets showOutsideDays to true by default', () => {
    render(<Calendar data-testid="test-calendar" />)
    expect(screen.getByTestId('show-outside-days')).toHaveTextContent('true')
  })

  it('allows customizing showOutsideDays', () => {
    render(<Calendar showOutsideDays={false} data-testid="test-calendar" />)
    expect(screen.getByTestId('show-outside-days')).toHaveTextContent('false')
  })

  it('applies default classNames', () => {
    render(<Calendar data-testid="test-calendar" />)
    
    // Check that all default class names are applied
    expect(screen.getByTestId('months')).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'space-y-4', 'sm:space-x-4', 'sm:space-y-0')
    expect(screen.getByTestId('month')).toHaveClass('space-y-4')
    expect(screen.getByTestId('caption')).toHaveClass('flex', 'justify-center', 'pt-1', 'relative', 'items-center')
    expect(screen.getByTestId('caption-label')).toHaveClass('text-sm', 'font-medium')
    expect(screen.getByTestId('nav')).toHaveClass('space-x-1', 'flex', 'items-center')
    expect(screen.getByTestId('nav-button')).toHaveClass('button-outline', 'h-7', 'w-7', 'bg-transparent', 'p-0', 'opacity-50', 'hover:opacity-100')
    expect(screen.getByTestId('nav-button-previous')).toHaveClass('absolute', 'left-1')
    expect(screen.getByTestId('nav-button-next')).toHaveClass('absolute', 'right-1')
    expect(screen.getByTestId('table')).toHaveClass('w-full', 'border-collapse', 'space-y-1')
    expect(screen.getByTestId('head-row')).toHaveClass('flex')
    expect(screen.getByTestId('head-cell')).toHaveClass('text-muted-foreground', 'rounded-md', 'w-9', 'font-normal', 'text-[0.8rem]')
    expect(screen.getByTestId('row')).toHaveClass('flex', 'w-full', 'mt-2')
    expect(screen.getByTestId('cell')).toHaveClass('h-9', 'w-9', 'text-center', 'text-sm', 'p-0', 'relative')
    expect(screen.getByTestId('day')).toHaveClass('button-ghost', 'h-9', 'w-9', 'p-0', 'font-normal', 'aria-selected:opacity-100')
    expect(screen.getByTestId('day-range-end')).toHaveClass('day-range-end')
    expect(screen.getByTestId('day-selected')).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary', 'hover:text-primary-foreground', 'focus:bg-primary', 'focus:text-primary-foreground')
    expect(screen.getByTestId('day-today')).toHaveClass('bg-accent', 'text-accent-foreground')
    expect(screen.getByTestId('day-outside')).toHaveClass('day-outside', 'text-muted-foreground', 'aria-selected:bg-accent/50', 'aria-selected:text-muted-foreground')
    expect(screen.getByTestId('day-disabled')).toHaveClass('text-muted-foreground', 'opacity-50')
    expect(screen.getByTestId('day-range-middle')).toHaveClass('aria-selected:bg-accent', 'aria-selected:text-accent-foreground')
    expect(screen.getByTestId('day-hidden')).toHaveClass('invisible')
  })

  it('renders custom components', () => {
    render(<Calendar data-testid="test-calendar" />)
    expect(screen.getByTestId('icon-left')).toBeInTheDocument()
    expect(screen.getByTestId('icon-right')).toBeInTheDocument()
  })

  it('allows customizing classNames', () => {
    const customClassNames = {
      months: 'custom-months',
      month: 'custom-month',
      caption: 'custom-caption'
    }
    
    render(<Calendar classNames={customClassNames} data-testid="test-calendar" />)
    
    expect(screen.getByTestId('months')).toHaveClass('custom-months')
    expect(screen.getByTestId('month')).toHaveClass('custom-month')
    expect(screen.getByTestId('caption')).toHaveClass('custom-caption')
  })

  it('spreads additional props to DayPicker', () => {
    render(
      <Calendar 
        data-testid="test-calendar"
        mode="range"
        selected={{ from: new Date(), to: new Date() }}
        disabled={{ before: new Date() }}
      />
    )
    
    const dayPicker = screen.getByTestId('day-picker')
    expect(dayPicker).toHaveAttribute('mode', 'range')
    expect(dayPicker).toHaveAttribute('selected')
    expect(dayPicker).toHaveAttribute('disabled')
  })

  it('combines default and custom classes correctly', () => {
    render(<Calendar className="custom-calendar-class" data-testid="test-calendar" />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveClass('p-3', 'custom-calendar-class')
  })

  it('handles empty classNames', () => {
    render(<Calendar classNames={{}} data-testid="test-calendar" />)
    expect(screen.getByTestId('class-names-count')).toHaveTextContent('0')
  })

  it('handles undefined classNames', () => {
    render(<Calendar data-testid="test-calendar" />)
    expect(screen.getByTestId('class-names-count')).toHaveTextContent('0')
  })

  it('maintains proper component structure', () => {
    render(<Calendar data-testid="test-calendar" />)
    
    const dayPicker = screen.getByTestId('day-picker')
    const calendarContent = screen.getByTestId('calendar-content')
    const customComponents = screen.getByTestId('custom-components')
    
    expect(dayPicker).toContainElement(calendarContent)
    expect(dayPicker).toContainElement(customComponents)
  })

  it('handles complex classNames with CSS selectors', () => {
    render(<Calendar data-testid="test-calendar" />)
    
    const cell = screen.getByTestId('cell')
    expect(cell).toHaveClass('[&:has([aria-selected].day-range-end)]:rounded-r-md')
    expect(cell).toHaveClass('[&:has([aria-selected].day-outside)]:bg-accent/50')
    expect(cell).toHaveClass('[&:has([aria-selected])]:bg-accent')
    expect(cell).toHaveClass('first:[&:has([aria-selected])]:rounded-l-md')
    expect(cell).toHaveClass('last:[&:has([aria-selected])]:rounded-r-md')
    expect(cell).toHaveClass('focus-within:relative')
    expect(cell).toHaveClass('focus-within:z-20')
  })

  it('renders with all default props and maintains functionality', () => {
    render(<Calendar data-testid="test-calendar" />)
    
    // Verify all key elements are present
    expect(screen.getByTestId('day-picker')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-content')).toBeInTheDocument()
    expect(screen.getByTestId('custom-components')).toBeInTheDocument()
    
    // Verify navigation components
    expect(screen.getByTestId('icon-left')).toBeInTheDocument()
    expect(screen.getByTestId('icon-right')).toBeInTheDocument()
    
    // Verify calendar structure elements
    expect(screen.getByTestId('months')).toBeInTheDocument()
    expect(screen.getByTestId('month')).toBeInTheDocument()
    expect(screen.getByTestId('table')).toBeInTheDocument()
  })
})