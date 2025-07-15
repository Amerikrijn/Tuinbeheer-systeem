"use client"

import { useState } from "react"
import { Search, Bell, User, Settings, Sun, Moon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

interface ModernHeaderProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  actions?: React.ReactNode
}

export function ModernHeader({ 
  title, 
  subtitle, 
  showSearch = true, 
  actions 
}: ModernHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Title and Subtitle */}
          <div className="flex items-center gap-4">
            {title && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek tuinen, plantvakken, bloemen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
                />
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Custom Actions */}
            {actions}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-3 gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                      TU
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Tuinbeheerder</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profiel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaties
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}