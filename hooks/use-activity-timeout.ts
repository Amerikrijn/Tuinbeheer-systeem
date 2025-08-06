'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 60 minutes in milliseconds  
const WARNING_TIME = 10 * 60 * 1000 // Show warning 10 minutes before logout

export function useActivityTimeout() {
  // Try to get auth, but don't throw if not available
  let user = null
  let signOut = null
  let authAvailable = false
  
  try {
    const auth = useAuth()
    user = auth.user
    signOut = auth.signOut
    authAvailable = true
  } catch (error) {
    // Auth not available, skip activity timeout
    authAvailable = false
  }
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Early return if auth is not available
  if (!authAvailable) {
    return
  }
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
      description: "Je wordt over 5 minuten automatisch uitgelogd vanwege inactiviteit",
    })
  }, [toast])

  const resetTimeout = useCallback(() => {
    if (!user) return

    lastActivityRef.current = Date.now()
    clearTimeouts()

    // Set warning timeout (25 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      showWarning()
    }, INACTIVITY_TIMEOUT - WARNING_TIME)

    // Set logout timeout (30 minutes)
    timeoutRef.current = setTimeout(() => {
      handleAutoLogout()
    }, INACTIVITY_TIMEOUT)
  }, [user, clearTimeouts, showWarning, handleAutoLogout])

  const handleActivity = useCallback(() => {
    if (!user) return
    
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current

    // Only reset if it's been more than 30 seconds since last activity
    // This prevents excessive timeout resets
    if (timeSinceLastActivity > 30000) {
      console.log('🔍 User activity detected, resetting timeout')
      resetTimeout()
    }
  }, [resetTimeout, user])

  useEffect(() => {
    if (!user) {
      clearTimeouts()
      return
    }

    // Delay initial setup to avoid immediate logout
    const setupTimer = setTimeout(() => {
      console.log('🔍 Setting up activity timeout for user:', user.email)
      resetTimeout()
    }, 1000) // 1 second delay

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
      clearTimeout(setupTimer)
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