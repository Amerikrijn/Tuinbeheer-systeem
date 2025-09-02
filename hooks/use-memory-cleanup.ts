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
    logMemoryUsage = true
  } = options

  const router = useRouter()
  const cleanupRefs = useRef<Set<() => void>>(new Set())
  const memorySnapshot = useRef<number>(0)

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
      }
    }
    return null
  }, [])

  // Log memory usage
  const logMemory = useCallback((context: string) => {
    if (!logMemoryUsage) return
    
    const memory = getMemoryUsage()
    if (memory) {
      const usage = memory.used
      const change = memorySnapshot.current > 0 ? usage - memorySnapshot.current : 0

      memorySnapshot.current = usage
    }
  }, [logMemoryUsage, getMemoryUsage])

  // Force garbage collection
  const forceGarbageCollection = useCallback(() => {
    if (enableGarbageCollection && typeof window !== 'undefined' && 'gc' in window) {
      try {
        ;(window as any).gc()

      } catch (error) {

      }
    }
  }, [enableGarbageCollection])

  // Clear storage - PERFORMANCE OPTIMIZED: Selective cleanup only
  const clearStorage = useCallback(() => {
    if (clearLocalStorage && typeof window !== 'undefined') {
      try {
        // PERFORMANCE OPTIMIZATION: Only clear tuinbeheer-related items, not everything
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('tuinbeheer_') || key.includes('tuinbeheer')) {
            localStorage.removeItem(key)
          }
        })

      } catch (error) {

      }
    }

    if (clearSessionStorage && typeof window !== 'undefined') {
      try {
        // PERFORMANCE OPTIMIZATION: Only clear tuinbeheer-related items
        const keys = Object.keys(sessionStorage)
        keys.forEach(key => {
          if (key.startsWith('tuinbeheer_') || key.includes('tuinbeheer')) {
            sessionStorage.removeItem(key)
          }
        })

      } catch (error) {

      }
    }
  }, [clearLocalStorage, clearSessionStorage])

  // Register cleanup function
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupRefs.current.add(cleanupFn)
  }, [])

  // Execute all cleanup functions
  const executeCleanup = useCallback(() => {

    // Execute registered cleanup functions
    cleanupRefs.current.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {

      }
    })
    cleanupRefs.current.clear()

    // Clear storage if enabled
    clearStorage()

    // Force garbage collection
    forceGarbageCollection()

    // Log final memory usage
    logMemory('after cleanup')
  }, [clearStorage, forceGarbageCollection, logMemory])

  // Route change cleanup
  useEffect(() => {
    const handleRouteChange = () => {
      logMemory('before route change')
      executeCleanup()
    }

    const handleBeforeUnload = () => {
      logMemory('before unload')
      executeCleanup()
    }

    // Listen for route changes - removed due to Next.js 13+ App Router compatibility
    
    // Listen for page unload
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Listen for visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logMemory('tab hidden')
      } else {
        logMemory('tab visible')
      }
    })

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', () => {})
    }
  }, [router, executeCleanup, logMemory])

  // Periodic memory check
  useEffect(() => {
    const interval = setInterval(() => {
      const memory = getMemoryUsage()
      if (memory && memory.used > memory.limit * 0.8) {

        executeCleanup()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [getMemoryUsage, executeCleanup])

  // Initial memory snapshot
  useEffect(() => {
    logMemory('initial')
  }, [logMemory])

  return {
    registerCleanup,
    executeCleanup,
    getMemoryUsage,
    forceGarbageCollection,
    logMemory
  }
}