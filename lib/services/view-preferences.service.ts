export type ViewMode = 'visual' | 'list'

export class ViewPreferencesService {
  private static readonly STORAGE_KEY = 'tuinbeheer_view_mode'

  // Detect if user is on mobile device
  static isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(max-width: 768px)').matches || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Get the preferred view mode
  static getViewMode(): ViewMode {
    if (typeof window === 'undefined') return 'visual'
    
    // Check if user has a saved preference
    const savedMode = localStorage.getItem(this.STORAGE_KEY) as ViewMode
    if (savedMode) {
      return savedMode
    }
    
    // Default to visual view (original behavior)
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