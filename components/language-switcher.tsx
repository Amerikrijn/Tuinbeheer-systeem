"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "nl" ? "en" : "nl")}
      className="text-white hover:bg-green-700"
    >
      <Globe className="h-4 w-4 mr-2" />
      {language === "nl" ? "EN" : "NL"}
    </Button>
  )
}
