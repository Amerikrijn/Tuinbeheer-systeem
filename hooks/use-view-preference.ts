"use client"

import { useState, useEffect } from 'react'
import { ViewPreferencesService, ViewMode } from '@/lib/services/view-preferences.service'

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>('visual')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Load preference from ViewPreferencesService (includes mobile detection)
    const initialMode = ViewPreferencesService.getViewMode()
    setViewMode(initialMode)
    setIsInitialized(true)

    // Listen for view mode changes from other components
    const cleanup = ViewPreferencesService.onViewModeChange((newMode) => {
      setViewMode(newMode)
    })

    return cleanup
  }, [])

  const setViewPreference = (mode: ViewMode) => {
    setViewMode(mode)
    ViewPreferencesService.setViewMode(mode)
  }

  const toggleView = () => {
    const newMode = viewMode === 'visual' ? 'list' : 'visual'
    setViewPreference(newMode)
  }

  return {
    viewMode,
    setViewPreference,
    toggleView,
    isInitialized,
    isVisualView: viewMode === 'visual',
    isListView: viewMode === 'list'
  }
}