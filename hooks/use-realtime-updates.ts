'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface RealtimeUpdateOptions {
  table: string
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  enabled?: boolean
}

interface RealtimeStatus {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastUpdate: Date | null
}

export function useRealtimeUpdates(options: RealtimeUpdateOptions) {
  const { toast } = useToast()
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastUpdate: null
  })
  
  const subscriptionRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(async () => {
    if (!options.enabled || subscriptionRef.current) return

    setStatus(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Create subscription
      const subscription = supabase
        .channel(`realtime-${options.table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: options.table,
            filter: options.filter
          },
          (payload) => {
            console.log('🔄 Real-time update received:', payload)
            
            setStatus(prev => ({
              ...prev,
              lastUpdate: new Date(),
              error: null
            }))

            // Handle different event types
            switch (payload.eventType) {
              case 'INSERT':
                options.onInsert?.(payload)
                break
              case 'UPDATE':
                options.onUpdate?.(payload)
                break
              case 'DELETE':
                options.onDelete?.(payload)
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Real-time subscription status:', status)
          
          if (status === 'SUBSCRIBED') {
            setStatus(prev => ({
              ...prev,
              isConnected: true,
              isConnecting: false,
              error: null
            }))
            reconnectAttempts.current = 0
          } else if (status === 'CHANNEL_ERROR') {
            setStatus(prev => ({
              ...prev,
              isConnected: false,
              isConnecting: false,
              error: 'Real-time verbinding gefaald'
            }))
            handleReconnect()
          } else if (status === 'TIMED_OUT') {
            setStatus(prev => ({
              ...prev,
              isConnected: false,
              isConnecting: false,
              error: 'Real-time verbinding timeout'
            }))
            handleReconnect()
          }
        })

      subscriptionRef.current = subscription

    } catch (error: any) {
      console.error('❌ Real-time connection error:', error)
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message || 'Real-time verbinding gefaald'
      }))
      handleReconnect()
    }
  }, [options.table, options.filter, options.enabled])

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🔌 Disconnecting real-time subscription')
      supabase.removeChannel(subscriptionRef.current)
      subscriptionRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setStatus(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false
    }))
  }, [])

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setStatus(prev => ({
        ...prev,
        error: 'Maximale herverbindingspogingen bereikt'
      }))
      return
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
    reconnectAttempts.current++

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`)

    reconnectTimeoutRef.current = setTimeout(() => {
      disconnect()
      connect()
    }, delay)
  }, [connect, disconnect])

  // Auto-connect when enabled
  useEffect(() => {
    if (options.enabled) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [options.enabled, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    status,
    connect,
    disconnect,
    isConnected: status.isConnected,
    isConnecting: status.isConnecting,
    error: status.error,
    lastUpdate: status.lastUpdate
  }
}

// Specialized hook for user dashboard data
export function useUserDashboardRealtime(userId: string) {
  const [tasks, setTasks] = useState<any[]>([])
  const [logbookEntries, setLogbookEntries] = useState<any[]>([])
  const [gardens, setGardens] = useState<any[]>([])

  // Real-time updates for tasks
  const tasksRealtime = useRealtimeUpdates({
    table: 'tasks',
    filter: `user_id=eq.${userId}`,
    enabled: !!userId,
    onInsert: (payload) => {
      setTasks(prev => [...prev, payload.new])
    },
    onUpdate: (payload) => {
      setTasks(prev => 
        prev.map(task => 
          task.id === payload.new.id ? payload.new : task
        )
      )
    },
    onDelete: (payload) => {
      setTasks(prev => 
        prev.filter(task => task.id !== payload.old.id)
      )
    }
  })

  // Real-time updates for logbook entries
  const logbookRealtime = useRealtimeUpdates({
    table: 'logbook_entries',
    filter: `user_id=eq.${userId}`,
    enabled: !!userId,
    onInsert: (payload) => {
      setLogbookEntries(prev => [...prev, payload.new])
    },
    onUpdate: (payload) => {
      setLogbookEntries(prev => 
        prev.map(entry => 
          entry.id === payload.new.id ? payload.new : entry
        )
      )
    },
    onDelete: (payload) => {
      setLogbookEntries(prev => 
        prev.filter(entry => entry.id !== payload.old.id)
      )
    }
  })

  // Real-time updates for gardens (if user has access)
  const gardensRealtime = useRealtimeUpdates({
    table: 'gardens',
    enabled: !!userId,
    onInsert: (payload) => {
      setGardens(prev => [...prev, payload.new])
    },
    onUpdate: (payload) => {
      setGardens(prev => 
        prev.map(garden => 
          garden.id === payload.new.id ? payload.new : garden
        )
      )
    },
    onDelete: (payload) => {
      setGardens(prev => 
        prev.filter(garden => garden.id !== payload.old.id)
      )
    }
  })

  return {
    tasks,
    setTasks,
    logbookEntries,
    setLogbookEntries,
    gardens,
    setGardens,
    realtimeStatus: {
      tasks: tasksRealtime.status,
      logbook: logbookRealtime.status,
      gardens: gardensRealtime.status
    }
  }
}
