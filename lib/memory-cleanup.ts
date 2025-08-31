/**
 * Memory cleanup utilities to prevent memory leaks
 */

// Track active subscriptions and intervals
const activeSubscriptions = new Set<any>()
const activeIntervals = new Set<NodeJS.Timeout>()
const activeTimeouts = new Set<NodeJS.Timeout>()

/**
 * Register a subscription for cleanup
 */
export function registerSubscription(subscription: any): void {
  activeSubscriptions.add(subscription)
}

/**
 * Register an interval for cleanup
 */
export function registerInterval(interval: NodeJS.Timeout): void {
  activeIntervals.add(interval)
}

/**
 * Register a timeout for cleanup
 */
export function registerTimeout(timeout: NodeJS.Timeout): void {
  activeTimeouts.add(timeout)
}

/**
 * Clean up a specific subscription
 */
export function cleanupSubscription(subscription: any): void {
  if (activeSubscriptions.has(subscription)) {
    if (typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe()
    }
    activeSubscriptions.delete(subscription)
  }
}

/**
 * Clean up a specific interval
 */
export function cleanupInterval(interval: NodeJS.Timeout): void {
  if (activeIntervals.has(interval)) {
    clearInterval(interval)
    activeIntervals.delete(interval)
  }
}

/**
 * Clean up a specific timeout
 */
export function cleanupTimeout(timeout: NodeJS.Timeout): void {
  if (activeTimeouts.has(timeout)) {
    clearTimeout(timeout)
    activeTimeouts.delete(timeout)
  }
}

/**
 * Clean up all registered resources
 */
export function cleanupAll(): void {
  // Clean subscriptions
  activeSubscriptions.forEach(sub => {
    if (typeof sub.unsubscribe === 'function') {
      sub.unsubscribe()
    }
  })
  activeSubscriptions.clear()
  
  // Clean intervals
  activeIntervals.forEach(interval => clearInterval(interval))
  activeIntervals.clear()
  
  // Clean timeouts
  activeTimeouts.forEach(timeout => clearTimeout(timeout))
  activeTimeouts.clear()
  
  console.log('Memory cleanup completed')
}

/**
 * Monitor memory usage
 */
export function monitorMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const perfData = (performance as any).memory
    if (perfData) {
      const usedMB = Math.round(perfData.usedJSHeapSize / 1048576)
      const totalMB = Math.round(perfData.totalJSHeapSize / 1048576)
      const limitMB = Math.round(perfData.jsHeapSizeLimit / 1048576)
      
      const usage = (usedMB / totalMB) * 100
      
      if (usage > 90) {
        console.warn(`⚠️ High memory usage: ${usedMB}MB / ${totalMB}MB (${usage.toFixed(1)}%)`)
      } else if (usage > 75) {
        console.log(`📊 Memory usage: ${usedMB}MB / ${totalMB}MB (${usage.toFixed(1)}%)`)
      }
      
      return { used: usedMB, total: totalMB, limit: limitMB, percentage: usage }
    }
  }
  return null
}

// Set up periodic memory monitoring in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    monitorMemoryUsage()
  }, 60000) // Check every minute
}