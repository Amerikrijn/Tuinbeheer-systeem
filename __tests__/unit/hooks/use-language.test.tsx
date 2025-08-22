import { renderHook, act, render } from '@testing-library/react'
import { useLanguage, LanguageProvider } from '@/hooks/use-language'
import { loadTranslations, t as translate } from '@/lib/translations'

// Mock translations
jest.mock('@/lib/translations', () => ({
  loadTranslations: jest.fn(),
  t: jest.fn(),
  Language: {
    EN: 'en',
    NL: 'nl'
  }
}))

const mockLoadTranslations = loadTranslations as jest.MockedFunction<typeof loadTranslations>
const mockTranslate = translate as jest.MockedFunction<typeof translate>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

describe('LanguageProvider and useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLoadTranslations.mockResolvedValue(undefined)
    mockTranslate.mockImplementation((key: string, lang: string) => `${key}_${lang}`)
  })

  describe('LanguageProvider', () => {
    it('renders children with language context', () => {
      const TestComponent = () => {
        const { language } = useLanguage()
        return <div data-testid="language">{language}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      expect(getByTestId('language')).toHaveTextContent('nl')
    })

    it('initializes with Dutch language by default', () => {
      const TestComponent = () => {
        const { language } = useLanguage()
        return <div data-testid="language">{language}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      expect(getByTestId('language')).toHaveTextContent('nl')
    })

    it('loads saved language preference from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('en')

      const TestComponent = () => {
        const { language } = useLanguage()
        return <div data-testid="language">{language}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('language')
      expect(getByTestId('language')).toHaveTextContent('en')
    })

    it('ignores invalid saved language preference', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid')

      const TestComponent = () => {
        const { language } = useLanguage()
        return <div data-testid="language">{language}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      expect(getByTestId('language')).toHaveTextContent('nl') // Default to Dutch
    })

    it('loads translations on mount', () => {
      render(
        <LanguageProvider>
          <div>Test</div>
        </LanguageProvider>
      )

      expect(mockLoadTranslations).toHaveBeenCalledTimes(1)
    })

    it('sets translationsLoaded to true after translations load', async () => {
      const TestComponent = () => {
        const { translationsLoaded } = useLanguage()
        return <div data-testid="loaded">{translationsLoaded.toString()}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      // Initially false
      expect(getByTestId('loaded')).toHaveTextContent('false')

      // Wait for translations to load
      await act(async () => {
        await mockLoadTranslations.mock.results[0].value
      })

      expect(getByTestId('loaded')).toHaveTextContent('true')
    })

    it('handles server-side rendering gracefully', () => {
      // Mock window as undefined to simulate SSR
      const originalWindow = global.window
      delete (global as any).window

      expect(() => {
        render(
          <LanguageProvider>
            <div>Test</div>
          </LanguageProvider>
        )
      }).not.toThrow()

      // Restore window
      global.window = originalWindow
    })
  })

  describe('useLanguage hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    )

    it('returns language context values', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.language).toBe('nl')
      expect(result.current.setLanguage).toBeDefined()
      expect(result.current.translationsLoaded).toBe(false)
      expect(result.current.t).toBeDefined()
    })

    it('throws error when used outside LanguageProvider', () => {
      expect(() => {
        renderHook(() => useLanguage())
      }).toThrow('useLanguage must be used within a LanguageProvider')
    })

    it('changes language when setLanguage is called', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    it('persists language change to localStorage', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('en')
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    it('translates text using current language', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      const translated = result.current.t('hello')

      expect(mockTranslate).toHaveBeenCalledWith('hello', 'nl')
      expect(translated).toBe('hello_nl')
    })

    it('updates translation when language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Initial translation
      result.current.t('hello')
      expect(mockTranslate).toHaveBeenCalledWith('hello', 'nl')

      // Change language
      act(() => {
        result.current.setLanguage('en')
      })

      // New translation
      result.current.t('hello')
      expect(mockTranslate).toHaveBeenCalledWith('hello', 'en')
    })

    it('handles multiple language changes correctly', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      const languages = ['nl', 'en', 'nl', 'en', 'nl']

      languages.forEach(lang => {
        act(() => {
          result.current.setLanguage(lang as 'nl' | 'en')
        })

        expect(result.current.language).toBe(lang)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', lang)
      })
    })

    it('maintains function references between renders', () => {
      const { result, rerender } = renderHook(() => useLanguage(), { wrapper })

      const firstRender = {
        setLanguage: result.current.setLanguage,
        t: result.current.t
      }

      rerender()

      expect(result.current.setLanguage).toBe(firstRender.setLanguage)
      expect(result.current.t).toBe(firstRender.t)
    })

    it('handles rapid language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('en')
        result.current.setLanguage('nl')
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3)
    })

    it('handles empty translation keys', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      const translated = result.current.t('')

      expect(mockTranslate).toHaveBeenCalledWith('', 'nl')
      expect(translated).toBe('_nl')
    })

    it('handles special characters in translation keys', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      const specialKeys = [
        'key with spaces',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key!@#$%^&*()',
        'key/with/slashes',
        'key\\with\\backslashes'
      ]

      specialKeys.forEach(key => {
        result.current.t(key)
        expect(mockTranslate).toHaveBeenCalledWith(key, 'nl')
      })
    })

    it('handles multiple hook instances independently', () => {
      const { result: result1 } = renderHook(() => useLanguage(), { wrapper })
      const { result: result2 } = renderHook(() => useLanguage(), { wrapper })

      // Change language on first hook
      act(() => {
        result1.current.setLanguage('en')
      })

      // Second hook should remain unchanged
      expect(result1.current.language).toBe('en')
      expect(result2.current.language).toBe('nl')
    })

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Should not crash when setting language
      expect(() => {
        act(() => {
          result.current.setLanguage('en')
        })
      }).not.toThrow()

      // Language should still change in memory
      expect(result.current.language).toBe('en')
    })

    it('handles loadTranslations errors gracefully', () => {
      mockLoadTranslations.mockRejectedValue(new Error('Translation load failed'))

      expect(() => {
        render(
          <LanguageProvider>
            <div>Test</div>
          </LanguageProvider>
        )
      }).not.toThrow()
    })

    it('handles translate errors gracefully', () => {
      mockTranslate.mockImplementation(() => {
        throw new Error('Translation error')
      })

      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Should not crash when translating
      expect(() => {
        result.current.t('hello')
      }).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('handles null localStorage.getItem result', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const TestComponent = () => {
        const { language } = useLanguage()
        return <div data-testid="language">{language}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      expect(getByTestId('language')).toHaveTextContent('nl') // Default to Dutch
    })

    it('handles undefined localStorage.getItem result', () => {
      mockLocalStorage.getItem.mockReturnValue(undefined)

      const TestComponent = () => {
        const { language } = useLanguage()
        return <div data-testid="language">{language}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      expect(getByTestId('language')).toHaveTextContent('nl') // Default to Dutch
    })

    it('handles empty string localStorage.getItem result', () => {
      mockLocalStorage.getItem.mockReturnValue('')

      const TestComponent = () => {
        const { language } = useLanguage()
        return <div data-testid="language">{language}</div>
      }

      const { getByTestId } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      )

      expect(getByTestId('language')).toHaveTextContent('nl') // Default to Dutch
    })
  })
})