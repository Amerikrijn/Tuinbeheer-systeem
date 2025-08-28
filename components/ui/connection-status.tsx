'use client'

import React from 'react'
import { useConnectionStatus } from '@/hooks/use-connection-status'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  showDetails?: boolean
  className?: string
  compact?: boolean
}

export function ConnectionStatus({ 
  showDetails = false, 
  className,
  compact = false 
}: ConnectionStatusProps) {
  const connection = useConnectionStatus()

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2",
        className
      )}>
        <div 
          className={cn(
            "w-2 h-2 rounded-full",
            connection.getStatusColor() === 'green' && "bg-green-500",
            connection.getStatusColor() === 'yellow' && "bg-yellow-500", 
            connection.getStatusColor() === 'red' && "bg-red-500"
          )}
          title={connection.getStatusMessage()}
        />
        {showDetails && (
          <span className="text-xs text-gray-600">
            {connection.latency ? `${connection.latency}ms` : ''}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      connection.getStatusColor() === 'green' && "bg-green-50 border-green-200",
      connection.getStatusColor() === 'yellow' && "bg-yellow-50 border-yellow-200",
      connection.getStatusColor() === 'red' && "bg-red-50 border-red-200",
      className
    )}>
      <div 
        className={cn(
          "w-3 h-3 rounded-full",
          connection.getStatusColor() === 'green' && "bg-green-500",
          connection.getStatusColor() === 'yellow' && "bg-yellow-500",
          connection.getStatusColor() === 'red' && "bg-red-500"
        )}
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          connection.getStatusColor() === 'green' && "text-green-800",
          connection.getStatusColor() === 'yellow' && "text-yellow-800",
          connection.getStatusColor() === 'red' && "text-red-800"
        )}>
          {connection.getStatusMessage()}
        </p>
        
        {showDetails && (
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            {connection.latency && (
              <div>Reactietijd: {connection.latency}ms</div>
            )}
            {connection.lastChecked && (
              <div>
                Laatst gecontroleerd: {connection.lastChecked.toLocaleTimeString()}
              </div>
            )}
            {connection.error && (
              <div className="text-red-600">Fout: {connection.error}</div>
            )}
          </div>
        )}
      </div>

      {!connection.isHealthy && (
        <button
          onClick={() => connection.checkConnection()}
          className={cn(
            "px-3 py-1 text-xs rounded border font-medium",
            "hover:bg-white transition-colors",
            connection.getStatusColor() === 'yellow' && "border-yellow-300 text-yellow-700",
            connection.getStatusColor() === 'red' && "border-red-300 text-red-700"
          )}
        >
          Opnieuw proberen
        </button>
      )}
    </div>
  )
}

// Loading state component that shows connection status
export function LoadingWithConnectionStatus({ 
  message = "Gegevens laden...",
  className 
}: { 
  message?: string
  className?: string 
}) {
  const connection = useConnectionStatus()

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">{message}</p>
      
      {!connection.isHealthy && (
        <ConnectionStatus showDetails className="max-w-md" />
      )}
    </div>
  )
}