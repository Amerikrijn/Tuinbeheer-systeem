import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('should handle conditional classes with false', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class');
      expect(result).toBe('base-class valid-class');
    });

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'valid-class');
      expect(result).toBe('base-class valid-class');
    });

    it('should handle arrays of classes', () => {
      const result = cn('base-class', ['class1', 'class2']);
      expect(result).toBe('base-class class1 class2');
    });

    it('should handle objects with conditional classes', () => {
      const result = cn('base-class', { 'conditional-class': true, 'other-class': false });
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle mixed input types', () => {
      const result = cn(
        'base-class',
        ['array-class1', 'array-class2'],
        { 'object-class': true },
        'string-class'
      );
      expect(result).toBe('base-class array-class1 array-class2 object-class string-class');
    });
  });
});