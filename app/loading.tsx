'use client'

import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
        <h2 className="text-xl font-semibold text-foreground">Laden...</h2>
        <p className="text-muted-foreground">Een moment geduld alstublieft</p>
      </div>
    </div>
  )
}