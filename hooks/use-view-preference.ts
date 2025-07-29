"use client"

import { useState, useEffect } from 'react'

export type ViewMode = 'visual' | 'list'

const VIEW_PREFERENCE_KEY = 'garden-view-preference'

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>('visual')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Load preference from localStorage on mount
    const savedPreference = localStorage.getItem(VIEW_PREFERENCE_KEY) as ViewMode
    if (savedPreference && (savedPreference === 'visual' || savedPreference === 'list')) {
      setViewMode(savedPreference)
    }
    setIsInitialized(true)
  }, [])

  const setViewPreference = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode)
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