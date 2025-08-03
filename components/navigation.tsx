"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TreePine, BookOpen, Home, Settings } from "lucide-react"

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Logboek",
    href: "/logbook",
    icon: BookOpen,
  },
  {
    name: "Taken",
    href: "/tasks",
    icon: Settings,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Home Button */}
          <Link href="/" className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === "/"
              ? "bg-green-100 text-green-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}>
            <div className="p-1 bg-green-100 rounded-lg">
              <TreePine className="h-4 w-4 text-green-600" />
            </div>
            <span>Home</span>
          </Link>

          {/* Navigation items */}
          <div className="flex items-center space-x-1">
            {navigationItems.filter(item => item.href !== "/").map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:block">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}