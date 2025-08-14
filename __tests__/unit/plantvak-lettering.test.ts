// Mock the supabase import to prevent config errors
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null }))
    }
  }
}))

import { PlantvakService } from '@/lib/services/plantvak.service'

// Unit Tests for Plantvak Lettering System
describe('Plantvak Lettering System - Unit Tests', () => {
  describe('generateNextLetterCode', () => {
    test('should generate A for empty array', () => {
      const result = PlantvakService.generateNextLetterCode([])
      expect(result).toBe('A')
    })

    test('should generate B when A exists', () => {
      const result = PlantvakService.generateNextLetterCode(['A'])
      expect(result).toBe('B')
    })

    test('should generate A1 after Z', () => {
      const result = PlantvakService.generateNextLetterCode(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])
      expect(result).toBe('A1')
    })

    test('should handle complex sequences', () => {
      const existingCodes = ['A', 'B', 'C', 'A1', 'A2', 'B1', 'B2']
      const result = PlantvakService.generateNextLetterCode(existingCodes)
      expect(result).toBe('D') // D is the next available single letter
    })
  })

  describe('isValidLetterCode', () => {
    test('should validate simple letters', () => {
      expect(PlantvakService.isValidLetterCode('A')).toBe(true)
      expect(PlantvakService.isValidLetterCode('Z')).toBe(true)
      expect(PlantvakService.isValidLetterCode('M')).toBe(true)
    })

    test('should validate compound codes', () => {
      expect(PlantvakService.isValidLetterCode('A1')).toBe(true)
      expect(PlantvakService.isValidLetterCode('B5')).toBe(true)
      expect(PlantvakService.isValidLetterCode('Z99')).toBe(true)
    })

    test('should reject invalid codes', () => {
      expect(PlantvakService.isValidLetterCode('')).toBe(false)
      expect(PlantvakService.isValidLetterCode('1')).toBe(false)
      expect(PlantvakService.isValidLetterCode('1A')).toBe(false)
      expect(PlantvakService.isValidLetterCode('AA')).toBe(false)
      expect(PlantvakService.isValidLetterCode('A0')).toBe(false)
    })
  })

  describe('sortLetterCodes', () => {
    test('should sort simple letters', () => {
      const codes = ['C', 'A', 'B']
      const result = PlantvakService.sortLetterCodes(codes)
      expect(result).toEqual(['A', 'B', 'C'])
    })

    test('should sort compound codes', () => {
      const codes = ['A2', 'A1', 'B1', 'A3']
      const result = PlantvakService.sortLetterCodes(codes)
      expect(result).toEqual(['A1', 'A2', 'A3', 'B1'])
    })

    test('should handle mixed codes', () => {
      const codes = ['Z', 'A1', 'B', 'A', 'B1']
      const result = PlantvakService.sortLetterCodes(codes)
      // The function sorts single letters alphabetically first, then compound codes
      expect(result).toEqual(['A', 'B', 'Z', 'A1', 'B1'])
    })

    test('should handle empty array', () => {
      const result = PlantvakService.sortLetterCodes([])
      expect(result).toEqual([])
    })
  })
})