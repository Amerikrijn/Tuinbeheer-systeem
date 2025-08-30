// Cache busting version system
// Update this timestamp whenever critical changes are made
export const APP_VERSION = '2024.12.19.001'
export const CACHE_BUST_TIMESTAMP = Date.now()

// Force cache invalidation for critical components
export const getCacheBustParam = () => `?v=${APP_VERSION}&t=${CACHE_BUST_TIMESTAMP}`

// Clear all local storage caches when version changes
export const clearStaleCache = () => {
  const currentVersion = localStorage.getItem('app_version')
  if (currentVersion !== APP_VERSION) {
    // Clear all tuinbeheer related cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('tuinbeheer_')) {
        localStorage.removeItem(key)
      }
    })
    localStorage.setItem('app_version', APP_VERSION)

  }
}