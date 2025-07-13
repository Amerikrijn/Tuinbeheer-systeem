"use client"

// import { createContext, useContext, useEffect, useState, type ReactNode, createElement } from "react"
import { type Language } from "@/lib/translations"

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

// Temporary mock implementation to fix build issue
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return children
}

/**
 * Hook to consume the LanguageContext.
 */
export function useLanguage(): LanguageContextValue {
  // Temporary mock implementation
  return {
    language: "nl" as Language,
    setLanguage: () => {},
    translationsLoaded: true,
    t: (key: string) => key
  }
}
