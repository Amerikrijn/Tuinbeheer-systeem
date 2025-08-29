"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative w-10 h-10 p-0 hover:bg-muted/80 transition-all duration-200 group"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100 text-blue-500" />
          
          {/* Enhanced hover effect */}
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          {/* Active theme indicator */}
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-blue-400 animate-pulse" />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 backdrop-blur-sm bg-background/95 border-2 border-border/50 shadow-lg"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer transition-all duration-200 hover:bg-muted/80 group"
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform duration-200" />
          <span>Licht</span>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer transition-all duration-200 hover:bg-muted/80 group"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
          <span>Donker</span>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer transition-all duration-200 hover:bg-muted/80 group"
        >
          <Monitor className="mr-2 h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
          <span>Systeem</span>
          {theme === "system" && (
            <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}