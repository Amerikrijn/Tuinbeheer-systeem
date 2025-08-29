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
        // Provide more specific error messages
        let errorMessage = error.message
        if (error.message.includes('JWT')) {
          errorMessage = 'Authenticatie fout. Log opnieuw in.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Database query timeout. Probeer het opnieuw.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Netwerkfout. Controleer je verbinding.'
        } else if (error.message.includes('permission')) {
          errorMessage = 'Geen toestemming. Controleer je rechten.'
        }
        
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          error: errorMessage,
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
      let errorMessage = 'Verbinding mislukt'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Database query timeout. Probeer het opnieuw.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Netwerkfout. Controleer je internetverbinding.'
        } else if (error.message.includes('permission')) {
          errorMessage = 'Geen toestemming voor database toegang.'
        } else {
          errorMessage = error.message
        }
      }
      
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
      if (!status.isConnected) {
        if (status.error) {
          // Provide more helpful messages based on error type
          if (status.error.includes('Authenticatie')) {
            return 'Log opnieuw in om toegang te krijgen'
          } else if (status.error.includes('timeout')) {
            return 'Database reageert traag. Probeer het opnieuw.'
          } else if (status.error.includes('Netwerkfout')) {
            return 'Controleer je internetverbinding'
          } else if (status.error.includes('toestemming')) {
            return 'Geen toegang tot database. Controleer je rechten.'
          }
          return status.error
        }
        return 'Verbinding met database mislukt'
      }
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