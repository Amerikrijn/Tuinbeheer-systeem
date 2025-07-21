"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  // Ensure language is always valid to prevent React error #418
  const currentLanguage = language || "nl"
  const displayText = currentLanguage === "nl" ? "EN" : "NL"
  const nextLanguage = currentLanguage === "nl" ? "en" : "nl"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(nextLanguage)}
      className="text-white hover:bg-green-700"
    >
      <Globe className="h-4 w-4 mr-2" />
      {displayText}
    </Button>
  )
}
