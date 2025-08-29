"use client"

import { useState, useEffect, useCallback } from 'react'
import { ViewPreferencesService, ViewMode } from '@/lib/services/view-preferences.service'

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>('visual')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      // Load preference from ViewPreferencesService (includes mobile detection)
      const initialMode = ViewPreferencesService.getViewMode()
      setViewMode(initialMode)
    } catch (error) {
      // Fallback to default view mode if service fails
      console.warn('Failed to load view preference:', error)
      setViewMode('visual')
    } finally {
      setIsInitialized(true)
    }

    // Listen for view mode changes from other components
    const cleanup = ViewPreferencesService.onViewModeChange((newMode) => {
      setViewMode(newMode)
    })

    return cleanup
  }, [])

  const setViewPreference = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    ViewPreferencesService.setViewMode(mode)
  }, [])

  const toggleView = useCallback(() => {
    const newMode = viewMode === 'visual' ? 'list' : 'visual'
    setViewPreference(newMode)
  }, [viewMode, setViewPreference])

  return {
    viewMode,
    setViewPreference,
    toggleView,
    isInitialized,
    isVisualView: viewMode === 'visual',
    isListView: viewMode === 'list'
  }
}