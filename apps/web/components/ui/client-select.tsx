"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClientSelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function ClientSelect({ value, onValueChange, children }: ClientSelectProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a basic HTML select during SSR
    return (
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {/* Convert children to options - this is a simplified version */}
        <option value="">Select an option</option>
      </select>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      {children}
    </Select>
  )
}
