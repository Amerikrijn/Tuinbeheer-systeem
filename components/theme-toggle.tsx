'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Monitor className="h-4 w-4" />
        <span className="sr-only">Theme toggle laden...</span>
      </Button>
    )
  }

  // Determine which icon to show
  const getThemeIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  // Get current theme description
  const getThemeDescription = () => {
    if (theme === 'system') {
      return `Systeem (${systemTheme === 'dark' ? 'Donker' : 'Licht'})`
    }
    return theme === 'dark' ? 'Donker' : 'Licht'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-primary"
          aria-label={`Huidige thema: ${getThemeDescription()}. Klik om te wijzigen.`}
        >
          {getThemeIcon()}
          <span className="sr-only">Thema wijzigen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border border-border">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="focus:bg-muted focus:text-foreground"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Licht</span>
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="focus:bg-muted focus:text-foreground"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Donker</span>
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="focus:bg-muted focus:text-foreground"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Systeem</span>
          {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}