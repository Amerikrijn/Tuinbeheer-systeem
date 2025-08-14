import { generateNextLetterCode, isValidLetterCode, sortLetterCodes } from '@/lib/supabase'

// Unit Tests for Plantvak Lettering System
describe('Plantvak Lettering System - Unit Tests', () => {
  describe('generateNextLetterCode', () => {
    test('should generate A for empty array', () => {
      const result = generateNextLetterCode([])
      expect(result).toBe('A')
    })

    test('should generate B when A exists', () => {
      const result = generateNextLetterCode(['A'])
      expect(result).toBe('B')
    })

    test('should generate A1 after Z', () => {
      const result = generateNextLetterCode(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])
      expect(result).toBe('A1')
    })

    test('should handle complex sequences', () => {
      const existingCodes = ['A', 'B', 'C', 'A1', 'A2', 'B1', 'B2']
      const result = generateNextLetterCode(existingCodes)
      expect(result).toBe('C1')
    })
  })

  describe('isValidLetterCode', () => {
    test('should validate simple letters', () => {
      expect(isValidLetterCode('A')).toBe(true)
      expect(isValidLetterCode('Z')).toBe(true)
      expect(isValidLetterCode('M')).toBe(true)
    })

    test('should validate compound codes', () => {
      expect(isValidLetterCode('A1')).toBe(true)
      expect(isValidLetterCode('B5')).toBe(true)
      expect(isValidLetterCode('Z99')).toBe(true)
    })

    test('should reject invalid codes', () => {
      expect(isValidLetterCode('')).toBe(false)
      expect(isValidLetterCode('1')).toBe(false)
      expect(isValidLetterCode('1A')).toBe(false)
      expect(isValidLetterCode('AA')).toBe(false)
      expect(isValidLetterCode('A0')).toBe(false)
    })
  })

  describe('sortLetterCodes', () => {
    test('should sort simple letters', () => {
      const codes = ['C', 'A', 'B']
      const result = sortLetterCodes(codes)
      expect(result).toEqual(['A', 'B', 'C'])
    })

    test('should sort compound codes', () => {
      const codes = ['A2', 'A1', 'B1', 'A3']
      const result = sortLetterCodes(codes)
      expect(result).toEqual(['A1', 'A2', 'A3', 'B1'])
    })

    test('should handle mixed codes', () => {
      const codes = ['Z', 'A1', 'B', 'A', 'B1']
      const result = sortLetterCodes(codes)
      expect(result).toEqual(['A', 'A1', 'B', 'B1', 'Z'])
    })

    test('should handle empty array', () => {
      const result = sortLetterCodes([])
      expect(result).toEqual([])
    })
  })
})