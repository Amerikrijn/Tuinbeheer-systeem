"use client"

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useNavigationHistory() {
  const router = useRouter()

  const goBack = useCallback(() => {
    // First try to use browser's back navigation
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Check if we can go back in browser history
      try {
        window.history.back()
        return
      } catch (e) {
        // Console logging removed for banking standards.log('Browser back navigation failed, using fallback')
      }
    }
    
    // Fallback to plant-beds overview if browser back doesn't work
    router.push('/plant-beds')
  }, [router])

  const navigateTo = useCallback((path: string) => {
    router.push(path)
  }, [router])

  return { goBack, navigateTo, router }
}