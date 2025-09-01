'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 60 minutes in milliseconds  
const WARNING_TIME = 10 * 60 * 1000 // Show warning 10 minutes before logout

export function useActivityTimeout(authOverride?: any) {
  // Get auth, but handle gracefully if not available
  let auth: any;
  
  if (authOverride !== undefined && authOverride !== null) {
    auth = authOverride;
  } else {
    try {
      auth = useAuth();
    } catch (error) {
      // In test environment or when context is not available, return undefined
      return;
    }
  }
  
  const user = auth?.user
  const signOut = auth?.signOut
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Early return if auth is not available
  if (!auth || !user || !signOut) {
    return
  }
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  
  // 🚀 PERFORMANCE FIX: Throttle activity handling
  const activityThrottleRef = useRef<number>(0)
  const ACTIVITY_THROTTLE = 1000 // 1 second throttle

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
    try {
      await signOut?.()
      toast({
        title: "Automatisch uitgelogd",
        description: "Je bent automatisch uitgelogd vanwege inactiviteit",
        variant: "destructive",
      })
      router.push('/auth/login')
    } catch (error) {
      // 🚀 PERFORMANCE FIX: Silent fail to prevent crashes
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

  // 🚀 PERFORMANCE FIX: Throttled activity handler
  const handleActivity = useCallback(() => {
    if (!user) return
    
    const now = Date.now()
    
    // 🚀 PERFORMANCE FIX: Throttle activity to prevent excessive calls
    if (now - activityThrottleRef.current < ACTIVITY_THROTTLE) {
      return
    }
    activityThrottleRef.current = now
    
    const timeSinceLastActivity = now - lastActivityRef.current

    // Only reset if it's been more than 30 seconds since last activity
    // This prevents excessive timeout resets
    if (timeSinceLastActivity > 30000) {
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
      resetTimeout()
    }, 1000) // 1 second delay

    // 🚀 PERFORMANCE FIX: Reduced event listeners for better performance
    const events = [
      'mousedown',
      'keypress',
      'click'
    ]
    
    // 🚀 MEMORY LEAK FIX: Use passive listeners and proper cleanup
    const eventHandlers = new Map<string, EventListener>()
    
    events.forEach(event => {
      const handler = (e: Event) => handleActivity()
      eventHandlers.set(event, handler)
      document.addEventListener(event, handler, { passive: true })
    })

    // 🚀 PERFORMANCE FIX: Cleanup function with proper event listener removal
    return () => {
      clearTimeout(setupTimer)
      clearTimeouts()
      
      // 🚀 MEMORY LEAK FIX: Remove all event listeners
      events.forEach(event => {
        const handler = eventHandlers.get(event)
        if (handler) {
          document.removeEventListener(event, handler)
          eventHandlers.delete(event)
        }
      })
    }
  }, [user, resetTimeout, clearTimeouts, handleActivity])

  // 🚀 PERFORMANCE FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts()
    }
  }, [clearTimeouts])
}