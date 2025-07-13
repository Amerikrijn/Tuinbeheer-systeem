"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
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
 * loaded before children render.  Persists the chosen language in
 * localStorage for subsequent visits.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("nl")
  const [translationsLoaded, setTranslationsLoaded] = useState(false)

  /* Load saved language preference and translation bundle on mount */
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("language")) as Language | null

    if (saved === "en" || saved === "nl") {
      setLanguageState(saved)
    }

    loadTranslations().then(() => setTranslationsLoaded(true))
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
  }

  const contextValue: LanguageContextValue = {
    language,
    setLanguage: handleSetLanguage,
    translationsLoaded,
    t: (key: string) => translate(key, language),
  }

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
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
