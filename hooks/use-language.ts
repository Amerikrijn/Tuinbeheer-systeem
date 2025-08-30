"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, createElement } from "react"
import { loadTranslations, type Language, t as translate } from "@/lib/translations"

/**
 * Context shape for language handling.
 */
interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  translationsLoaded: boolean
  /**
   * Translation helper bound to the current language.
   */
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Provides language state (English / Dutch) and ensures translations are
 * loaded before children render. Persists the chosen language in
 * localStorage for subsequent visits.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with a default language to prevent hydration issues
  const [language, setLanguageState] = useState<Language>("nl")
  const [translationsLoaded, setTranslationsLoaded] = useState(false)

  /* Load saved language preference and translation bundle on mount */
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language | null

      if (saved === "en" || saved === "nl") {
        setLanguageState(saved)
      }

      loadTranslations().then(() => setTranslationsLoaded(true))
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("language", lang)
      } catch (error) {
        // Silently fail if localStorage is not available or throws an error
        // The language change is still applied in memory

      }
    }
  }

  const translateHelper = (key: string): string => {
    return translate(key, language)
  }

  const contextValue: LanguageContextValue = {
    language,
    setLanguage: handleSetLanguage,
    translationsLoaded,
    t: translateHelper
  }

  return createElement(LanguageContext.Provider, { value: contextValue }, children)
}

/**
 * Hook to consume the LanguageContext.
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
