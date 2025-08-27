import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toBe('base-class conditional-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('should handle mixed types', () => {
      const result = cn('base-class', 'string-class', 123, { object: 'class' }, ['array', 'class'])
      expect(result).toBe('base-class string-class 123 object array class')
    })

    it('should return empty string for no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle single class', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })
  })
})