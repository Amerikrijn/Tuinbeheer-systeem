'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface MemoryCleanupOptions {
  enableGarbageCollection?: boolean
  clearLocalStorage?: boolean
  clearSessionStorage?: boolean
  clearEventListeners?: boolean
  logMemoryUsage?: boolean
}

export function useMemoryCleanup(options: MemoryCleanupOptions = {}) {
  const {
    enableGarbageCollection = true,
    clearLocalStorage = false,
    clearSessionStorage = false,
    clearEventListeners = true,
    logMemoryUsage = true
  } = options

  const router = useRouter()
  const cleanupRefs = useRef<Set<() => void>>(new Set())
  const memorySnapshot = useRef<number>(0)
  
  // 🚀 PERFORMANCE FIX: Throttle memory logging
  const lastLogTime = useRef<number>(0)
  const LOG_THROTTLE = 5000 // 5 seconds

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      try {
        const memory = (performance as any).memory
        return {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
        }
      } catch (error) {
        // 🚀 PERFORMANCE FIX: Silent fail to prevent crashes
        return null
      }
    }
    return null
  }, [])

  // 🚀 PERFORMANCE FIX: Throttled memory logging
  const logMemory = useCallback((context: string) => {
    if (!logMemoryUsage) return
    
    const now = Date.now()
    if (now - lastLogTime.current < LOG_THROTTLE) {
      return
    }
    lastLogTime.current = now
    
    const memory = getMemoryUsage()
    if (memory) {
      const usage = memory.used
      const change = memorySnapshot.current > 0 ? usage - memorySnapshot.current : 0

      // 🚀 MEMORY LEAK DETECTION: Alert on significant memory growth
      if (change > 50) { // More than 50MB increase
        console.warn(`⚠️ Memory usage increased by ${change}MB in ${context}`)
      }

      memorySnapshot.current = usage
    }
  }, [logMemoryUsage, getMemoryUsage])

  // 🚀 PERFORMANCE FIX: Safe garbage collection
  const forceGarbageCollection = useCallback(() => {
    if (enableGarbageCollection && typeof window !== 'undefined' && 'gc' in window) {
      try {
        ;(window as any).gc()
        logMemory('after-garbage-collection')
      } catch (error) {
        // 🚀 PERFORMANCE FIX: Silent fail to prevent crashes
      }
    }
  }, [enableGarbageCollection, logMemory])

  // 🚀 PERFORMANCE FIX: Safe storage clearing
  const clearStorage = useCallback(() => {
    if (clearLocalStorage && typeof window !== 'undefined') {
      try {
        // 🚀 MEMORY LEAK FIX: Only clear tuinbeheer related items
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('tuinbeheer_') || key.includes('tuinbeheer')) {
            localStorage.removeItem(key)
          }
        })
        logMemory('after-localstorage-cleanup')
      } catch (error) {
        // 🚀 PERFORMANCE FIX: Silent fail to prevent crashes
      }
    }

    if (clearSessionStorage && typeof window !== 'undefined') {
      try {
        sessionStorage.clear()
        logMemory('after-sessionstorage-cleanup')
      } catch (error) {
        // 🚀 PERFORMANCE FIX: Silent fail to prevent crashes
      }
    }
  }, [clearLocalStorage, clearSessionStorage, logMemory])

  // Register cleanup function
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupRefs.current.add(cleanupFn)
  }, [])

  // 🚀 PERFORMANCE FIX: Execute cleanup with error handling
  const executeCleanup = useCallback(() => {
    const cleanupFunctions = Array.from(cleanupRefs.current)
    cleanupRefs.current.clear()

    // Execute registered cleanup functions
    cleanupFunctions.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        // 🚀 PERFORMANCE FIX: Silent fail to prevent crashes
      }
    })

    // 🚀 MEMORY LEAK FIX: Clear storage if enabled
    if (clearLocalStorage || clearSessionStorage) {
      clearStorage()
    }

    // 🚀 MEMORY LEAK FIX: Force garbage collection if enabled
    if (enableGarbageCollection) {
      forceGarbageCollection()
    }

    logMemory('after-cleanup-execution')
  }, [clearLocalStorage, clearSessionStorage, clearStorage, enableGarbageCollection, forceGarbageCollection, logMemory])

  // 🚀 PERFORMANCE FIX: Automatic cleanup on route change
  useEffect(() => {
    const handleRouteChange = () => {
      // 🚀 MEMORY LEAK FIX: Cleanup on route change to prevent accumulation
      if (cleanupRefs.current.size > 0) {
        executeCleanup()
      }
    }

    // Listen for route changes
    router.events?.on('routeChangeStart', handleRouteChange)
    
    return () => {
      router.events?.off('routeChangeStart', handleRouteChange)
    }
  }, [router, executeCleanup])

  // 🚀 PERFORMANCE FIX: Periodic memory monitoring
  useEffect(() => {
    if (!logMemoryUsage) return

    const intervalId = setInterval(() => {
      logMemory('periodic-check')
      
      // 🚀 MEMORY LEAK DETECTION: Auto-cleanup if memory usage is high
      const memory = getMemoryUsage()
      if (memory && memory.used > memory.limit * 0.8) { // 80% of limit
        console.warn('🚨 High memory usage detected, executing cleanup...')
        executeCleanup()
      }
    }, 30 * 1000) // Check every 30 seconds

    return () => clearInterval(intervalId)
  }, [logMemoryUsage, logMemory, getMemoryUsage, executeCleanup])

  // 🚀 PERFORMANCE FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      executeCleanup()
    }
  }, [executeCleanup])

  return {
    getMemoryUsage,
    logMemory,
    forceGarbageCollection,
    clearStorage,
    registerCleanup,
    executeCleanup,
    // 🚀 NEW: Memory health check
    getMemoryHealth: useCallback(() => {
      const memory = getMemoryUsage()
      if (!memory) return 'unknown'
      
      const percentage = (memory.used / memory.limit) * 100
      
      if (percentage > 80) return 'critical'
      if (percentage > 60) return 'warning'
      if (percentage > 40) return 'moderate'
      return 'healthy'
    }, [getMemoryUsage]),
    // 🚀 NEW: Auto-cleanup trigger
    triggerAutoCleanup: useCallback(() => {
      const health = getMemoryHealth()
      if (health === 'critical' || health === 'warning') {
        executeCleanup()
        return true
      }
      return false
    }, [getMemoryHealth, executeCleanup])
  }
}