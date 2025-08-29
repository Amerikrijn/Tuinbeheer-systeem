import { renderHook, act, waitFor } from '@testing-library/react'
import { useLanguage } from '@/hooks/use-language'
import { LanguageProvider } from '@/hooks/use-language'

// Mock the loadTranslations function
const mockLoadTranslations = jest.fn()
jest.mock('@/lib/translations', () => ({
  loadTranslations: mockLoadTranslations
}))

describe('useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLoadTranslations.mockResolvedValue({
      nl: { common: { save: 'Opslaan' } },
      en: { common: { save: 'Save' } }
    })
  })

  it('should initialize with default language nl and load translations', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => expect(mockLoadTranslations).toHaveBeenCalled())
    expect(result.current.language).toBe('nl')
  })

  it('should persist language changes to localStorage', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => expect(mockLoadTranslations).toHaveBeenCalled())

    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.language).toBe('en')
  })

  it('should translate strings based on current language', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider })

    await waitFor(() => expect(mockLoadTranslations).toHaveBeenCalled())

    // Default language nl
    expect(result.current.t('common.save')).toBe('Opslaan')

    // Change to English
    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.t('common.save')).toBe('Save')
  })
})
