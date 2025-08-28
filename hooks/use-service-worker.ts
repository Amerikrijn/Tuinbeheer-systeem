'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isInstalled: boolean
  isActive: boolean
  isWaiting: boolean
  isControlling: boolean
  registration: ServiceWorkerRegistration | null
  error: string | null
}

interface CacheInfo {
  [key: string]: number
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isActive: false,
    isWaiting: false,
    isControlling: false,
    registration: null,
    error: null
  })

  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({})
  const [isOnline, setIsOnline] = useState(true)
  const messageChannel = useRef<MessageChannel | null>(null)

  // Check if service worker is supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator
    setState(prev => ({ ...prev, isSupported: supported }))
    
    if (!supported) {
      setState(prev => ({ ...prev, error: 'Service Worker not supported in this browser' }))
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!state.isSupported) {
      throw new Error('Service Worker not supported')
    }

    try {
      console.log('🚀 Registering Service Worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log('✅ Service Worker registered successfully:', registration)

      // Set up message channel for communication
      messageChannel.current = new MessageChannel()
      
      // Listen for messages from service worker
      messageChannel.current.port1.onmessage = (event) => {
        const { type, data, error } = event.data
        
        if (error) {
          console.error('❌ Service Worker error:', error)
          return
        }
        
        switch (type) {
          case 'CACHE_INFO':
            setCacheInfo(data)
            break
          case 'BACKGROUND_SYNC':
            console.log('🔄 Background sync completed:', data)
            break
          default:
            console.log('📨 Service Worker message:', { type, data })
        }
      }

      // Start listening
      messageChannel.current.port1.start()

      setState(prev => ({
        ...prev,
        registration,
        isInstalled: !!registration.installing,
        isActive: !!registration.active,
        isWaiting: !!registration.waiting,
        isControlling: !!registration.active && registration.active.state === 'activated'
      }))

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New Service Worker available')
              setState(prev => ({ ...prev, isWaiting: true }))
            } else if (newWorker.state === 'activated') {
              console.log('✅ New Service Worker activated')
              setState(prev => ({ 
                ...prev, 
                isActive: true, 
                isWaiting: false,
                isInstalling: false 
              }))
            }
          })
        }
      })

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed')
        setState(prev => ({ ...prev, isControlling: true }))
      })

      return registration
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Registration failed' }))
      throw error
    }
  }, [state.isSupported])

  // Unregister service worker
  const unregisterServiceWorker = useCallback(async () => {
    if (!state.registration) {
      throw new Error('No Service Worker registered')
    }

    try {
      console.log('🗑️ Unregistering Service Worker...')
      
      const unregistered = await state.registration.unregister()
      
      if (unregistered) {
        console.log('✅ Service Worker unregistered successfully')
        setState(prev => ({
          ...prev,
          registration: null,
          isInstalled: false,
          isActive: false,
          isWaiting: false,
          isControlling: false
        }))
      } else {
        throw new Error('Failed to unregister Service Worker')
      }
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error)
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unregistration failed' }))
      throw error
    }
  }, [state.registration])

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (!state.registration) {
      throw new Error('No Service Worker registered')
    }

    try {
      console.log('🔄 Updating Service Worker...')
      
      await state.registration.update()
      console.log('✅ Service Worker update initiated')
    } catch (error) {
      console.error('❌ Service Worker update failed:', error)
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Update failed' }))
      throw error
    }
  }, [state.registration])

  // Skip waiting (activate new service worker immediately)
  const skipWaiting = useCallback(async () => {
    if (!state.registration || !state.registration.waiting) {
      throw new Error('No waiting Service Worker')
    }

    try {
      console.log('⏭️ Skipping waiting...')
      
      // Send skip waiting message
      if (messageChannel.current) {
        messageChannel.current.port2.postMessage({ type: 'SKIP_WAITING' })
      }
      
      // Also call skipWaiting directly
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      console.log('✅ Skip waiting message sent')
    } catch (error) {
      console.error('❌ Skip waiting failed:', error)
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Skip waiting failed' }))
      throw error
    }
  }, [state.registration])

  // Clear all caches
  const clearCaches = useCallback(async () => {
    if (!state.registration) {
      throw new Error('No Service Worker registered')
    }

    try {
      console.log('🗑️ Clearing caches...')
      
      // Send clear cache message
      if (messageChannel.current) {
        messageChannel.current.port2.postMessage({ type: 'CLEAR_CACHE' })
      }
      
      // Also clear caches directly
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      
      setCacheInfo({})
      console.log('✅ All caches cleared')
    } catch (error) {
      console.error('❌ Cache clearing failed:', error)
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Cache clearing failed' }))
      throw error
    }
  }, [state.registration])

  // Get cache information
  const getCacheInfo = useCallback(async () => {
    if (!state.registration) {
      throw new Error('No Service Worker registered')
    }

    try {
      console.log('📊 Getting cache info...')
      
      // Send get cache info message
      if (messageChannel.current) {
        messageChannel.current.port2.postMessage({ type: 'GET_CACHE_INFO' })
      }
      
      // Also get cache info directly
      const cacheNames = await caches.keys()
      const info: CacheInfo = {}
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        info[cacheName] = keys.length
      }
      
      setCacheInfo(info)
      return info
    } catch (error) {
      console.error('❌ Getting cache info failed:', error)
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Cache info failed' }))
      throw error
    }
  }, [state.registration])

  // Auto-register service worker on mount
  useEffect(() => {
    if (state.isSupported && !state.registration) {
      registerServiceWorker().catch(console.error)
    }
  }, [state.isSupported, state.registration, registerServiceWorker])

  // Cleanup message channel on unmount
  useEffect(() => {
    return () => {
      if (messageChannel.current) {
        messageChannel.current.port1.close()
        messageChannel.current.port2.close()
      }
    }
  }, [])

  return {
    // State
    ...state,
    cacheInfo,
    isOnline,
    
    // Actions
    registerServiceWorker,
    unregisterServiceWorker,
    updateServiceWorker,
    skipWaiting,
    clearCaches,
    getCacheInfo
  }
}