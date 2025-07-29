"use client"

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useNavigation() {
  const router = useRouter()

  const goBack = useCallback(() => {
    // Always go back one step in browser history
    // This ensures consistent behavior regardless of how user arrived
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      // Fallback to home if no history
      router.push('/')
    }
  }, [router])

  const navigateTo = useCallback((path: string) => {
    router.push(path)
  }, [router])

  const replace = useCallback((path: string) => {
    router.replace(path)
  }, [router])

  return {
    goBack,
    navigateTo,
    replace,
    router
  }
}