'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000 // Show warning 2 minutes before logout

export function useActivityTimeout() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
  }, [])

  const handleAutoLogout = useCallback(async () => {
    console.log('🔍 Auto logout triggered due to inactivity')
    try {
      await signOut()
      toast({
        title: "Automatisch uitgelogd",
        description: "Je bent automatisch uitgelogd vanwege inactiviteit",
        variant: "destructive",
      })
      router.push('/auth/login')
    } catch (error) {
      console.error('Auto logout failed:', error)
    }
  }, [signOut, toast, router])

  const showWarning = useCallback(() => {
    toast({
      title: "Sessie verloopt binnenkort",
      description: "Je wordt over 2 minuten automatisch uitgelogd vanwege inactiviteit",
    })
  }, [toast])

  const resetTimeout = useCallback(() => {
    if (!user) return

    lastActivityRef.current = Date.now()
    clearTimeouts()

    // Set warning timeout (8 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      showWarning()
    }, INACTIVITY_TIMEOUT - WARNING_TIME)

    // Set logout timeout (10 minutes)
    timeoutRef.current = setTimeout(() => {
      handleAutoLogout()
    }, INACTIVITY_TIMEOUT)
  }, [user, clearTimeouts, showWarning, handleAutoLogout])

  const handleActivity = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current

    // Only reset if it's been more than 30 seconds since last activity
    // This prevents excessive timeout resets
    if (timeSinceLastActivity > 30000) {
      resetTimeout()
    }
  }, [resetTimeout])

  useEffect(() => {
    if (!user) {
      clearTimeouts()
      return
    }

    // Initial timeout setup
    resetTimeout()

    // Activity event listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Add event listeners with throttling
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup
    return () => {
      clearTimeouts()
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [user, resetTimeout, handleActivity, clearTimeouts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts()
    }
  }, [clearTimeouts])

  return {
    resetTimeout,
    clearTimeouts
  }
}