import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('handles false conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class')
  })

  it('handles undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'valid-class')
    expect(result).toBe('base-class valid-class')
  })

  it('handles empty strings', () => {
    const result = cn('base-class', '', 'valid-class')
    expect(result).toBe('base-class valid-class')
  })

  it('handles arrays of classes', () => {
    const result = cn('base-class', ['array-class1', 'array-class2'])
    expect(result).toBe('base-class array-class1 array-class2')
  })

  it('handles objects with boolean values', () => {
    const result = cn('base-class', { 'conditional-class': true, 'false-class': false })
    expect(result).toBe('base-class conditional-class')
  })

  it('handles mixed input types', () => {
    const result = cn(
      'base-class',
      'string-class',
      ['array-class'],
      { 'object-class': true },
      false && 'false-class',
      true && 'true-class'
    )
    expect(result).toBe('base-class string-class array-class object-class true-class')
  })
})