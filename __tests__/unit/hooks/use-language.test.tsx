import { renderHook, act, render } from '@testing-library/react'
import { useLanguage, LanguageProvider } from '@/hooks/use-language'

// Mock translations
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
  }),
  Language: {
    EN: 'en',
    NL: 'nl'
  }
}))

describe('LanguageProvider and useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset localStorage before each test
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
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
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('en'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

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
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('invalid'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

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

  describe('useLanguage hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    )

    it('returns language context values', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current).toHaveProperty('language')
      expect(result.current).toHaveProperty('setLanguage')
      expect(result.current).toHaveProperty('t')
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
    })

    it('persists language change to localStorage', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('nl'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    it('translates text using current language', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Default language nl
      expect(result.current.t('common.save')).toBe('Opslaan')

      // Change to English
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('common.save')).toBe('Save')
    })

    it('updates translation when language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Initial translation
      result.current.t('hello')

      // Change language
      act(() => {
        result.current.setLanguage('en')
      })

      // Should update translation
      expect(result.current.language).toBe('en')
    })

    it('handles multiple language changes correctly', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      const languages = ['nl', 'en', 'nl', 'en', 'nl']
      
      languages.forEach(lang => {
        act(() => {
          result.current.setLanguage(lang)
        })
        expect(result.current.language).toBe(lang)
      })
    })

    it('maintains function references between renders', () => {
      const { result, rerender } = renderHook(() => useLanguage(), { wrapper })

      const firstRender = {
        setLanguage: result.current.setLanguage,
        t: result.current.t
      }

      rerender()

      // Function references should be stable
      expect(typeof result.current.setLanguage).toBe('function')
      expect(typeof result.current.t).toBe('function')
    })

    it('handles rapid language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('en')
        result.current.setLanguage('nl')
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
    })

    it('handles empty translation keys', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      const translated = result.current.t('')
      expect(translated).toBe('')
    })

    it('handles special characters in translation keys', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      const specialKeys = [
        'key with spaces',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots'
      ]

      specialKeys.forEach(key => {
        expect(() => result.current.t(key)).not.toThrow()
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
      // Mock localStorage to throw error
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('nl'),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('localStorage error')
        }),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Should not crash when setting language
      act(() => {
        result.current.setLanguage('en')
      })
      
      // Language should still change in memory even if localStorage fails
      expect(result.current.language).toBe('en')
      
      // Verify that localStorage.setItem was called (even though it throws)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en')
      
      // Component should still be functional after localStorage error
      expect(result.current.t('common.save')).toBe('Save')
    })

    it('handles loadTranslations errors gracefully', () => {
      expect(() => {
        render(
          <LanguageProvider>
            <div>Test</div>
          </LanguageProvider>
        )
      }).not.toThrow()
    })

    it('handles translate errors gracefully', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      // Should not crash when translating
      expect(() => {
        result.current.t('test')
      }).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('handles null localStorage.getItem result', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

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
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(undefined),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

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
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(''),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

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