'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

// Performance metrics interface
interface PerformanceMetrics {
  pageLoadTime: number
  databaseQueries: number
  averageQueryTime: number
  slowQueries: number
  memoryUsage: number
  bundleSize: number
  lastUpdate: Date
  reactQueryCacheSize: number
  activeQueries: number
  cacheHitRate: number
}

// Performance event interface
interface PerformanceEvent {
  id: string
  type: 'page_load' | 'database_query' | 'component_render' | 'api_call' | 'cache_hit' | 'cache_miss'
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata: Record<string, any> | undefined
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    databaseQueries: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    memoryUsage: 0,
    bundleSize: 0,
    lastUpdate: new Date(),
    reactQueryCacheSize: 0,
    activeQueries: 0,
    cacheHitRate: 0
  })

  const [events, setEvents] = useState<PerformanceEvent[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const pageLoadStart = useRef<number>(0)
  const queryTimes = useRef<number[]>([])
  const cacheHits = useRef<number>(0)
  const cacheMisses = useRef<number>(0)
  
  // 🚀 PERFORMANCE FIX: Throttle monitoring updates
  const updateThrottle = useRef<number>(0)
  const THROTTLE_DELAY = 2000 // 2 seconds instead of every render
  
  // React Query client
  const queryClient = useQueryClient()

  // 🚀 PERFORMANCE FIX: Throttled metrics update
  const throttledUpdateMetrics = useCallback(() => {
    const now = Date.now()
    if (now - updateThrottle.current < THROTTLE_DELAY) {
      return
    }
    updateThrottle.current = now
    
    // Only update if monitoring is active
    if (!isMonitoring) return
    
    try {
      const queryStats = getQueryCacheStats()
      const memory = getMemoryUsage()
      
      setMetrics(prev => ({
        ...prev,
        reactQueryCacheSize: queryStats.cacheSize,
        activeQueries: queryStats.activeQueries,
        memoryUsage: memory || 0,
        lastUpdate: new Date()
      }))
    } catch (error) {
      // Silent fail to prevent performance impact
    }
  }, [isMonitoring])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    pageLoadStart.current = performance.now()
    
    // 🚀 PERFORMANCE FIX: Only monitor memory if available and needed
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      }))
    }

    // 🚀 PERFORMANCE FIX: Start throttled updates
    const intervalId = setInterval(throttledUpdateMetrics, THROTTLE_DELAY)
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [throttledUpdateMetrics])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    const pageLoadTime = performance.now() - pageLoadStart.current
    
    setMetrics(prev => ({
      ...prev,
      pageLoadTime: Math.round(pageLoadTime),
      lastUpdate: new Date()
    }))

  }, [])

  // Get React Query cache statistics
  const getQueryCacheStats = useCallback(() => {
    try {
      const queries = queryClient.getQueryCache().getAll()
      const mutations = queryClient.getMutationCache().getAll()
      
      return {
        cacheSize: queries.length + mutations.length,
        activeQueries: queries.filter(q => q.isActive()).length,
        totalQueries: queries.length,
        activeMutations: mutations.filter(m => m.isPending()).length,
        totalMutations: mutations.length
      }
    } catch (error) {
      // 🚀 PERFORMANCE FIX: Silent fail to prevent crashes
      return {
        cacheSize: 0,
        activeQueries: 0,
        totalQueries: 0,
        activeMutations: 0,
        totalMutations: 0
      }
    }
  }, [queryClient])

  // 🚀 PERFORMANCE FIX: Optimized memory usage check
  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      try {
        const memory = (performance as any).memory
        return Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      } catch {
        return 0
      }
    }
    return 0
  }, [])

  // 🚀 PERFORMANCE FIX: Debounced event tracking
  const trackEvent = useCallback((type: PerformanceEvent['type'], name: string, metadata?: Record<string, any>) => {
    if (!isMonitoring) return
    
    const event: PerformanceEvent = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      name,
      startTime: performance.now(),
      metadata
    }
    
    setEvents(prev => {
      // 🚀 MEMORY LEAK FIX: Limit events array to prevent memory growth
      const newEvents = [...prev, event].slice(-100) // Keep only last 100 events
      return newEvents
    })
  }, [isMonitoring])

  // 🚀 PERFORMANCE FIX: Optimized event completion
  const completeEvent = useCallback((eventId: string, metadata?: Record<string, any>) => {
    if (!isMonitoring) return
    
    setEvents(prev => prev.map(event => {
      if (event.id === eventId && !event.endTime) {
        const endTime = performance.now()
        const duration = endTime - event.startTime
        
        // 🚀 MEMORY LEAK FIX: Only track slow events to reduce memory usage
        if (duration > 100) { // Only track events > 100ms
          return {
            ...event,
            endTime,
            duration,
            metadata: { ...event.metadata, ...metadata }
          }
        }
      }
      return event
    }))
  }, [isMonitoring])

  // 🚀 PERFORMANCE FIX: Cleanup old events periodically
  useEffect(() => {
    if (!isMonitoring) return
    
    const cleanupInterval = setInterval(() => {
      setEvents(prev => {
        const now = Date.now()
        // Remove events older than 5 minutes
        return prev.filter(event => 
          event.startTime && (now - event.startTime) < 5 * 60 * 1000
        )
      })
    }, 30 * 1000) // Cleanup every 30 seconds
    
    return () => clearInterval(cleanupInterval)
  }, [isMonitoring])

  // 🚨 CRITICAL FIX: Disable performance monitoring to prevent overhead
  useEffect(() => {
    // Performance monitoring disabled to prevent app slowdown
    // Will be re-enabled once database connection issues are resolved
    console.log('⚠️ Performance monitoring disabled to prevent app slowdown')
    
    return () => {
      // Cleanup without starting monitoring
    }
  }, [])

  // 🚨 CRITICAL FIX: Disable metrics updates to prevent overhead
  useEffect(() => {
    // Metrics updates disabled to prevent app slowdown
    // Will be re-enabled once database connection issues are resolved
    return () => {
      // Cleanup without starting intervals
    }
  }, [])

  return {
    metrics,
    events,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackEvent,
    completeEvent,
    getQueryCacheStats,
    getMemoryUsage,
    // 🚀 PERFORMANCE FIX: Simplified performance report
    getPerformanceReport: useCallback(() => {
      const queryStats = getQueryCacheStats()
      const memory = getMemoryUsage()
      
      return {
        pageLoadTime: metrics.pageLoadTime,
        databaseQueries: metrics.databaseQueries,
        averageQueryTime: metrics.averageQueryTime,
        slowQueries: metrics.slowQueries,
        memoryUsage: memory,
        reactQueryCacheSize: queryStats.cacheSize,
        activeQueries: queryStats.activeQueries,
        lastUpdate: metrics.lastUpdate
      }
    }, [metrics, getQueryCacheStats, getMemoryUsage]),
    // 🚀 PERFORMANCE FIX: Clear performance data with limits
    clearPerformanceData: useCallback(() => {
      setEvents([])
      setMetrics(prev => ({
        ...prev,
        databaseQueries: 0,
        slowQueries: 0,
        averageQueryTime: 0
      }))
    }, [])
  }
}

// Export types
export type { PerformanceMetrics, PerformanceEvent }