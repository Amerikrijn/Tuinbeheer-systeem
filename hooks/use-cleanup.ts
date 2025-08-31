"use client"

import { useEffect } from 'react'
import { cleanupPendingRequests } from '@/lib/supabase'

/**
 * Hook to cleanup pending Supabase requests when component unmounts
 * This prevents connection/memory leaks when navigating between pages
 */
export function useSupabaseCleanup() {
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanupPendingRequests()
    }
  }, [])
}

/**
 * Hook for pages that make many requests
 * Adds periodic cleanup to prevent buildup
 */
export function useAggressiveCleanup(intervalMs: number = 30000) {
  useEffect(() => {
    const interval = setInterval(() => {
      // Only cleanup if there are many pending requests
      const activeRequests = (window as any).__activeSupabaseRequests
      if (activeRequests && activeRequests.size > 5) {
        console.log(`🧹 Periodic cleanup: ${activeRequests.size} requests pending`)
        cleanupPendingRequests()
      }
    }, intervalMs)
    
    return () => {
      clearInterval(interval)
      cleanupPendingRequests()
    }
  }, [intervalMs])
}