'use client'

import { Loader2 } from 'lucide-react'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { useConnectionStatus } from '@/hooks/use-connection-status'

export default function Loading() {
  const connection = useConnectionStatus()

  return (
    <div className=""min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className=""text-center space-y-6 max-w-md mx-auto px-4">
        <div className=""space-y-4">
          <div className=""h-12 w-12 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
          <h2 className=""text-xl font-semibold text-foreground">Laden...</h2>
          <p className=""text-muted-foreground">Een moment geduld alstublieft</p>
        </div>
        
        {!connection.isHealthy && (
          <ConnectionStatus showDetails className=""text-left" />
        )}
      </div>
    </div>
  )
}