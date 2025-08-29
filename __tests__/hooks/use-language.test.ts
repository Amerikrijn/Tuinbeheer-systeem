import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { useLanguage, LanguageProvider } from '@/hooks/use-language'
import { loadTranslations } from '@/lib/translations'

// Mock loadTranslations to avoid actual async operations
jest.mock('@/lib/translations', async () => {
  const actual = await jest.importActual<typeof import('@/lib/translations')>('@/lib/translations')
  return {
    ...actual,
          loadTranslations: jest.fn().mockResolvedValue(undefined),
  }
})

// Mock localStorage
const localStorageMock = {
      getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default language nl and load translations', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => expect(loadTranslations).toHaveBeenCalled())
    expect(result.current.language).toBe('nl')
  })

  it('should persist language changes to localStorage', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => expect(loadTranslations).toHaveBeenCalled())

    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.language).toBe('en')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en')
  })

  it('should translate strings based on current language', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => expect(loadTranslations).toHaveBeenCalled())

    // Default language nl
    expect(result.current.t('common.save')).toBe('Opslaan')

    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.t('common.save')).toBe('Save')
  })
})
