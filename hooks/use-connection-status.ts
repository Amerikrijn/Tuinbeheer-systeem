'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ConnectionStatus {
  isOnline: boolean
  isConnected: boolean
  lastChecked: Date | null
  error: string | null
  latency: number | null
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnected: false,
    lastChecked: null,
    error: null,
    latency: null
  })

  const checkConnection = async (): Promise<boolean> => {
    const startTime = performance.now()
    
    try {
      // Quick health check query
      const { error } = await supabase
        .from('gardens')
        .select('count')
        .limit(1)
        .abortSignal(AbortSignal.timeout(5000)) // 5 second timeout
      
      const latency = performance.now() - startTime
      
      if (error) {
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          error: error.message,
          latency: null,
          lastChecked: new Date()
        }))
        return false
      }

      setStatus(prev => ({
        ...prev,
        isConnected: true,
        error: null,
        latency: Math.round(latency),
        lastChecked: new Date()
      }))
      return true

    } catch (error) {
      const latency = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Connection failed'
      
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        error: errorMessage,
        latency: latency > 5000 ? null : Math.round(latency),
        lastChecked: new Date()
      }))
      return false
    }
  }

  useEffect(() => {
    // Initial connection check
    checkConnection()

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
      checkConnection()
    }

    const handleOffline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false, 
        isConnected: false,
        error: 'Device is offline'
      }))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    // Periodic connection check (every 30 seconds)
    const interval = setInterval(() => {
      if (status.isOnline) {
        checkConnection()
      }
    }, 30000)

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
      clearInterval(interval)
    }
  }, [status.isOnline])

  return {
    ...status,
    checkConnection,
    isHealthy: status.isOnline && status.isConnected && !status.error,
    getStatusMessage: (): string => {
      if (!status.isOnline) return 'Geen internetverbinding'
      if (!status.isConnected) return status.error || 'Verbinding met database mislukt'
      if (status.latency && status.latency > 3000) return 'Langzame verbinding'
      return 'Verbinding OK'
    },
    getStatusColor: (): 'green' | 'yellow' | 'red' => {
      if (!status.isOnline || !status.isConnected) return 'red'
      if (status.latency && status.latency > 3000) return 'yellow'
      return 'green'
    }
  }
}