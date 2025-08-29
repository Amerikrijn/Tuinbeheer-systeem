import { renderHook, act, waitFor } from '@testing-library/react'
import { useLanguage } from '@/hooks/use-language'
import { LanguageProvider } from '@/hooks/use-language'

// Mock the loadTranslations function
jest.mock('@/lib/translations', () => ({
  loadTranslations: jest.fn().mockResolvedValue({
    nl: { common: { save: 'Opslaan' } },
    en: { common: { save: 'Save' } }
  }),
  t: jest.fn((key: string, lang: string) => {
    if (!key) return ''
    const translations = {
      nl: { common: { save: 'Opslaan' } },
      en: { common: { save: 'Save' } }
    }
    return translations[lang as keyof typeof translations]?.common?.save || key
  })
}))

describe('useLanguage', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
  })

  it('should initialize with default language nl and load translations', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => {
      expect(result.current.language).toBe('nl')
    })
  })

  it('should persist language changes to localStorage', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => {
      expect(result.current.language).toBe('nl')
    })

    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.language).toBe('en')
  })

  it('should translate strings based on current language', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => {
      expect(result.current.language).toBe('nl')
    })

    // Default language nl
    expect(result.current.t('common.save')).toBe('Opslaan')

    // Change to English
    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.t('common.save')).toBe('Save')
  })
})
