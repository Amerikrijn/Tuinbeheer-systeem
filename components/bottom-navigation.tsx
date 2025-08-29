"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Calendar, Users, Camera, Settings, Leaf } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface User {
  id: number | string
  name: string
  email: string
  role: "admin" | "volunteer"
}

interface BottomNavigationProps {
  currentUser?: User | null
}

export function BottomNavigation({ currentUser }: BottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()

  const navigationItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/mobile", icon: Users, label: "Sessions" },
    { href: "/progress", icon: Camera, label: "Progress" },
  ]

  const adminItems = [
    { href: "/admin", icon: Settings, label: "Admin" },
    { href: "/admin/plant-beds", icon: Leaf, label: "Plants" },
  ]

  const items =
    currentUser?.role === "admin"
      ? [...navigationItems.slice(0, 3), ...adminItems.slice(0, 1), navigationItems[3]]
      : navigationItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 md:hidden z-40">
      <div className="flex justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push(item.href)}
              className={`flex-col gap-1 h-12 px-2 min-w-0 flex-1 ${
                isActive ? "bg-green-600 hover:bg-green-700 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs truncate">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
