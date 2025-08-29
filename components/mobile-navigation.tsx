"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Calendar, Users, Camera, Settings, Leaf, LogOut } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { t } from "@/lib/translations"

interface User {
  id: number | string
  name: string
  email: string
  role: "admin" | "volunteer"
}

interface MobileNavigationProps {
  currentUser?: User | null
}

export function MobileNavigation({ currentUser }: MobileNavigationProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
    setOpen(false)
  }

  const navigationItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/mobile", icon: Users, label: "Sessions" },
    { href: "/progress", icon: Camera, label: "Progress" },
  ]

  const adminItems = [
    { href: "/admin", icon: Settings, label: "Admin Panel" },
    { href: "/admin/plant-beds", icon: Leaf, label: "Plant Beds" },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">{t("garden.volunteers", language)}</SheetTitle>
          {currentUser && (
            <div className="text-left text-sm text-gray-600">
              {currentUser.name} • {t(currentUser.role, language)}
            </div>
          )}
        </SheetHeader>

        <nav className="mt-6 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}

          {currentUser?.role === "admin" && (
            <>
              <div className="border-t my-4" />
              <div className="text-sm font-medium text-gray-500 px-3 py-2">Admin Tools</div>
              {adminItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </>
          )}

          {currentUser && (
            <>
              <div className="border-t my-4" />
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                {t("logout", language)}
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
