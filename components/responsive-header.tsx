"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Menu, X, Home, Calendar, Users, Camera, Leaf } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/hooks/use-language"
import { t } from "@/lib/translations"

interface User {
  id: number | string
  name: string
  email: string
  role: "admin" | "volunteer"
}

interface ResponsiveHeaderProps {
  title?: string
  subtitle?: string
  currentUser?: User | null
  currentWeather?: any
  weatherIcon?: React.ReactNode
  className?: string
  showAdminButton?: boolean
}

export function ResponsiveHeader({
  title = "Garden Calendar",
  subtitle,
  currentUser,
  currentWeather,
  weatherIcon,
  className = "bg-green-600",
  showAdminButton = true,
}: ResponsiveHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const navigationItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/mobile", icon: Users, label: "Mobile View" },
    { href: "/progress", icon: Camera, label: "Progress" },
  ]

  const adminItems = [
    { href: "/admin", icon: Settings, label: "Admin Panel" },
    { href: "/admin/plant-beds", icon: Leaf, label: "Plant Beds" },
  ]

  return (
    <header className={`${className} text-white sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left side - Title and weather */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-black/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div>
              <h1 className="text-lg sm:text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm opacity-90">{subtitle}</p>}
              {currentUser && (
                <div className="flex items-center gap-4 text-xs sm:text-sm opacity-90 mt-1">
                  <span className="hidden sm:inline">
                    {t("welcome.back", language)}, {currentUser.name} ({t(currentUser.role, language)})
                  </span>
                  <span className="sm:hidden">{currentUser.name}</span>
                  {currentWeather && (
                    <div className="flex items-center gap-2">
                      {weatherIcon}
                      <span>{currentWeather.temperature}°C</span>
                      <span className="hidden sm:inline">{currentWeather.description}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className="text-white hover:bg-black/20"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}

            {currentUser?.role === "admin" && showAdminButton && (
              <>
                <div className="w-px h-6 bg-white/20 mx-2" />
                {adminItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className="text-white hover:bg-black/20"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </>
            )}
          </nav>

          {/* Right side - Language switcher and logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            {currentUser && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-black/20">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("logout", language)}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-black/20"
                  onClick={() => {
                    router.push(item.href)
                    setMobileMenuOpen(false)
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}

              {currentUser?.role === "admin" && (
                <>
                  <div className="border-t border-white/20 my-2" />
                  {adminItems.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-black/20"
                      onClick={() => {
                        router.push(item.href)
                        setMobileMenuOpen(false)
                      }}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
