'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Performance metrics interface
interface PerformanceMetrics {
  pageLoadTime: number
  databaseQueries: number
  averageQueryTime: number
  slowQueries: number
  memoryUsage: number
  bundleSize: number
  lastUpdate: Date
}

// Performance event interface
interface PerformanceEvent {
  id: string
  type: 'page_load' | 'database_query' | 'component_render' | 'api_call'
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
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
    lastUpdate: new Date()
  })

  const [events, setEvents] = useState<PerformanceEvent[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const pageLoadStart = useRef<number>(0)
  const queryTimes = useRef<number[]>([])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    pageLoadStart.current = performance.now()
    
    // Monitor memory usage (browser support dependent)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      }))
    }
    
    console.log('🚀 Performance monitoring started')
  }, [])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    const pageLoadTime = performance.now() - pageLoadStart.current
    
    setMetrics(prev => ({
      ...prev,
      pageLoadTime: Math.round(pageLoadTime),
      lastUpdate: new Date()
    }))
    
    console.log(`📊 Page load completed in ${pageLoadTime.toFixed(2)}ms`)
  }, [])

  // Track database query performance
  const trackDatabaseQuery = useCallback(async <T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ data: T; duration: number }> {
    if (!isMonitoring) {
      return { data: await queryFn(), duration: 0 }
    }

    const eventId = `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    
    // Add event
    const event: PerformanceEvent = {
      id: eventId,
      type: 'database_query',
      name: queryName,
      startTime,
      metadata
    }
    
    setEvents(prev => [...prev, event])
    
    try {
      const data = await queryFn()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Update event
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, endTime, duration }
          : e
      ))
      
      // Update metrics
      queryTimes.current.push(duration)
      const newAverageQueryTime = queryTimes.current.reduce((a, b) => a + b, 0) / queryTimes.current.length
      
      setMetrics(prev => ({
        ...prev,
        databaseQueries: prev.databaseQueries + 1,
        averageQueryTime: Math.round(newAverageQueryTime),
        slowQueries: prev.slowQueries + (duration > 1000 ? 1 : 0),
        lastUpdate: new Date()
      }))
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`⚠️ Slow database query: ${queryName} took ${duration.toFixed(2)}ms`, metadata)
      }
      
      return { data, duration }
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Update event with error
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, endTime, duration, metadata: { ...metadata, error: true } }
          : e
      ))
      
      console.error(`❌ Database query failed: ${queryName} took ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }, [isMonitoring])

  // Track component render performance
  const trackComponentRender = useCallback((componentName: string, metadata?: Record<string, any>) => {
    if (!isMonitoring) return

    const eventId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    
    const event: PerformanceEvent = {
      id: eventId,
      type: 'component_render',
      name: componentName,
      startTime,
      metadata
    }
    
    setEvents(prev => [...prev, event])
    
    // Return cleanup function
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, endTime, duration }
          : e
      ))
      
      // Log slow renders
      if (duration > 100) {
        console.warn(`⚠️ Slow component render: ${componentName} took ${duration.toFixed(2)}ms`, metadata)
      }
    }
  }, [isMonitoring])

  // Track API call performance
  const trackApiCall = useCallback(async <T>(
    apiName: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ data: T; duration: number }> {
    if (!isMonitoring) {
      return { data: await apiCall(), duration: 0 }
    }

    const eventId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    
    const event: PerformanceEvent = {
      id: eventId,
      type: 'api_call',
      name: apiName,
      startTime,
      metadata
    }
    
    setEvents(prev => [...prev, event])
    
    try {
      const data = await apiCall()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Update event
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, endTime, duration }
          : e
      ))
      
      // Log slow API calls
      if (duration > 2000) {
        console.warn(`⚠️ Slow API call: ${apiName} took ${duration.toFixed(2)}ms`, metadata)
      }
      
      return { data, duration }
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Update event with error
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, endTime, duration, metadata: { ...metadata, error: true } }
          : e
      ))
      
      console.error(`❌ API call failed: ${apiName} took ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }, [isMonitoring])

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const completedEvents = events.filter(e => e.duration !== undefined)
    const totalEvents = completedEvents.length
    
    if (totalEvents === 0) return null
    
    const avgDuration = completedEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / totalEvents
    const slowEvents = completedEvents.filter(e => (e.duration || 0) > 1000).length
    
    return {
      totalEvents,
      avgDuration: Math.round(avgDuration),
      slowEvents,
      eventsByType: completedEvents.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      metrics
    }
  }, [events, metrics])

  // Clear performance data
  const clearPerformanceData = useCallback(() => {
    setEvents([])
    queryTimes.current = []
    setMetrics({
      pageLoadTime: 0,
      databaseQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0,
      memoryUsage: 0,
      bundleSize: 0,
      lastUpdate: new Date()
    })
  }, [])

  // Auto-start monitoring on mount
  useEffect(() => {
    startMonitoring()
    
    // Auto-stop monitoring after 30 seconds
    const timer = setTimeout(() => {
      stopMonitoring()
    }, 30000)
    
    return () => {
      clearTimeout(timer)
      stopMonitoring()
    }
  }, [startMonitoring, stopMonitoring])

  // Log performance summary periodically
  useEffect(() => {
    if (metrics.databaseQueries > 0 && metrics.databaseQueries % 10 === 0) {
      console.log('📊 Performance Summary:', {
        queries: metrics.databaseQueries,
        avgTime: metrics.averageQueryTime + 'ms',
        slowQueries: metrics.slowQueries,
        memory: metrics.memoryUsage + 'MB'
      })
    }
  }, [metrics])

  return {
    // State
    metrics,
    events,
    isMonitoring,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    trackDatabaseQuery,
    trackComponentRender,
    trackApiCall,
    getPerformanceReport,
    clearPerformanceData
  }
}

// Export types
export type { PerformanceMetrics, PerformanceEvent }