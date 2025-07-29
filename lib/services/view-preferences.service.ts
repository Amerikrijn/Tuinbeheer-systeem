export type ViewMode = 'visual' | 'list'

export class ViewPreferencesService {
  private static readonly STORAGE_KEY = 'tuinbeheer_view_mode_v2' // Changed to clear old cache

  // Get the preferred view mode
  static getViewMode(): ViewMode {
    if (typeof window === 'undefined') return 'visual'
    
    // Clear old cache keys that might interfere
    const oldKeys = ['garden-view-preference', 'tuinbeheer_view_mode']
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
      }
    })
    
    // Check if user has a saved preference
    const savedMode = localStorage.getItem(this.STORAGE_KEY) as ViewMode
    if (savedMode && (savedMode === 'visual' || savedMode === 'list')) {
      return savedMode
    }
    
    // Always default to visual view
    return 'visual'
  }

  // Save the view mode preference
  static setViewMode(mode: ViewMode): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(this.STORAGE_KEY, mode)
    
    // Dispatch custom event so other components can listen
    window.dispatchEvent(new CustomEvent('viewModeChanged', { 
      detail: { mode } 
    }))
  }

  // Subscribe to view mode changes
  static onViewModeChange(callback: (mode: ViewMode) => void): () => void {
    if (typeof window === 'undefined') return () => {}
    
    const handler = (event: CustomEvent) => {
      callback(event.detail.mode)
    }
    
    window.addEventListener('viewModeChanged', handler as EventListener)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('viewModeChanged', handler as EventListener)
    }
  }
}