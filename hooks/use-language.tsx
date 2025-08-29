"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

export type Language = "en" | "nl"

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  translationsLoaded: boolean
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

// Simple translation function
function translate(key: string, language: Language): string {
  const translations: Record<string, Record<Language, string>> = {
    loading: { en: "Loading...", nl: "Laden..." },
    welcome: { en: "Welcome", nl: "Welkom" },
    "garden.management": { en: "Garden Management", nl: "Tuinbeheer" },
    "management.dashboard": { en: "Management Dashboard", nl: "Beheer Dashboard" },
    "select.function.manage": {
      en: "Select a function to manage your garden",
      nl: "Selecteer een functie om je tuin te beheren",
    },
    "garden.calendar": { en: "Garden Calendar", nl: "Tuinkalender" },
    "view.calendar.as.volunteers": {
      en: "View calendar as volunteers see it",
      nl: "Bekijk kalender zoals vrijwilligers het zien",
    },
    "view.manage.sessions": { en: "View and manage sessions", nl: "Bekijk en beheer sessies" },
    "track.update.tasks": { en: "Track and update tasks", nl: "Volg en update taken" },
    "view.photos.progress": { en: "View photos and progress", nl: "Bekijk foto's en voortgang" },
    "open.garden.calendar": { en: "Open Garden Calendar", nl: "Open Tuinkalender" },
    "plant.bed.management": { en: "Plant Bed Management", nl: "Plantvak Beheer" },
    "manage.all.plant.beds": { en: "Manage all plant beds", nl: "Beheer alle plantvakken" },
    "plant.beds.overview": { en: "Plant beds overview", nl: "Plantvakken overzicht" },
    "add.manage.plants": { en: "Add and manage plants", nl: "Voeg planten toe en beheer" },
    "track.growth.status": { en: "Track growth and status", nl: "Volg groei en status" },
    "manage.plant.beds": { en: "Manage Plant Beds", nl: "Beheer Plantvakken" },
    "add.events": { en: "Add Events", nl: "Evenementen Toevoegen" },
    "create.new.sessions": { en: "Create new garden sessions", nl: "Maak nieuwe tuinsessies" },
    "create.sessions": { en: "Create sessions", nl: "Maak sessies" },
    "recurring.events": { en: "Recurring events", nl: "Terugkerende evenementen" },
    "assign.tasks": { en: "Assign tasks", nl: "Wijs taken toe" },
    "add.event": { en: "Add Event", nl: "Evenement Toevoegen" },
    "quick.actions": { en: "Quick Actions", nl: "Snelle Acties" },
    "new.plant.bed": { en: "New Plant Bed", nl: "Nieuw Plantvak" },
    "new.session": { en: "New Session", nl: "Nieuwe Sessie" },
    "volunteer.view": { en: "Volunteer View", nl: "Vrijwilliger Weergave" },
  }

  return translations[key]?.[language] || key
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("nl")
  const [translationsLoaded, setTranslationsLoaded] = useState(true)

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("language")) as Language | null
    if (saved === "en" || saved === "nl") {
      setLanguageState(saved)
    }
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

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
