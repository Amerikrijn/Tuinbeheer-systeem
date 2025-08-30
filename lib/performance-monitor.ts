/**
 * Performance monitoring utilities for detecting and preventing memory leaks
 */

class PerformanceMonitor {
  private observers: Set<PerformanceObserver> = new Set()
  private metrics: Map<string, number[]> = new Map()
  private eventListeners: Map<string, Set<EventListener>> = new Set()
  private activeTimers: Set<NodeJS.Timeout> = new Set()
  private activeIntervals: Set<NodeJS.Timeout> = new Set()

  /**
   * Track component mount/unmount to detect memory leaks
   */
  trackComponent(componentName: string, action: 'mount' | 'unmount') {
    if (process.env.NODE_ENV !== 'development') return

    const key = `component:${componentName}`
    const counts = this.metrics.get(key) || [0, 0]
    
    if (action === 'mount') {
      counts[0]++
    } else {
      counts[1]++
    }
    
    this.metrics.set(key, counts)
    
    // Warn if there's a significant imbalance (potential memory leak)
    const [mounts, unmounts] = counts
    if (mounts - unmounts > 10) {
      console.warn(`⚠️ Potential memory leak in ${componentName}: ${mounts} mounts, ${unmounts} unmounts`)
    }
  }

  /**
   * Track event listeners to ensure cleanup
   */
  trackEventListener(
    element: EventTarget,
    type: string,
    listener: EventListener,
    action: 'add' | 'remove'
  ) {
    if (process.env.NODE_ENV !== 'development') return

    const key = `${element.constructor.name}:${type}`
    
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set())
    }
    
    const listeners = this.eventListeners.get(key)!
    
    if (action === 'add') {
      listeners.add(listener)
    } else {
      listeners.delete(listener)
    }
    
    // Warn if too many listeners (potential leak)
    if (listeners.size > 20) {
      console.warn(`⚠️ Many event listeners (${listeners.size}) for ${key}`)
    }
  }

  /**
   * Track timers to ensure cleanup
   */
  trackTimer(timer: NodeJS.Timeout, type: 'timeout' | 'interval', action: 'set' | 'clear') {
    if (process.env.NODE_ENV !== 'development') return

    const set = type === 'timeout' ? this.activeTimers : this.activeIntervals
    
    if (action === 'set') {
      set.add(timer)
    } else {
      set.delete(timer)
    }
    
    // Warn if too many active timers
    if (set.size > 10) {
      console.warn(`⚠️ Many active ${type}s: ${set.size}`)
    }
  }

  /**
   * Measure render performance
   */
  measureRender(componentName: string, startTime: number) {
    if (process.env.NODE_ENV !== 'development') return

    const duration = performance.now() - startTime
    
    const key = `render:${componentName}`
    const durations = this.metrics.get(key) || []
    durations.push(duration)
    
    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift()
    }
    
    this.metrics.set(key, durations)
    
    // Warn if render is slow
    if (duration > 16) { // More than one frame (60fps = 16.67ms per frame)
      console.warn(`⚠️ Slow render in ${componentName}: ${duration.toFixed(2)}ms`)
    }
    
    // Log average render time periodically
    if (durations.length === 100) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length
      console.log(`📊 Average render time for ${componentName}: ${avg.toFixed(2)}ms`)
    }
  }

  /**
   * Monitor memory usage
   */
  monitorMemory() {
    if (process.env.NODE_ENV !== 'development') return
    if (typeof window === 'undefined') return
    if (!(performance as any).memory) return

    const memory = (performance as any).memory
    const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
    const totalMB = Math.round(memory.totalJSHeapSize / 1048576)
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)
    
    // Warn if memory usage is high
    const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    if (usage > 90) {
      console.error(`🚨 Critical memory usage: ${usedMB}MB / ${limitMB}MB (${usage.toFixed(1)}%)`)
    } else if (usage > 70) {
      console.warn(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB (${usage.toFixed(1)}%)`)
    }
    
    return {
      used: usedMB,
      total: totalMB,
      limit: limitMB,
      percentage: usage
    }
  }

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (process.env.NODE_ENV !== 'development') return
    if (typeof window === 'undefined') return

    // Monitor memory every 30 seconds
    setInterval(() => {
      this.monitorMemory()
    }, 30000)

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`, entry)
            }
          }
        })
        
        observer.observe({ entryTypes: ['longtask'] })
        this.observers.add(observer)
      } catch (e) {
        // Long task observer not supported
      }
    }

    console.log('🚀 Performance monitoring started')
  }

  /**
   * Stop monitoring and clean up
   */
  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.metrics.clear()
    this.eventListeners.clear()
    this.activeTimers.clear()
    this.activeIntervals.clear()
  }

  /**
   * Get performance report
   */
  getReport() {
    const report: any = {
      components: {},
      eventListeners: {},
      timers: {
        timeouts: this.activeTimers.size,
        intervals: this.activeIntervals.size
      },
      memory: this.monitorMemory()
    }
    
    // Component mount/unmount balance
    this.metrics.forEach((value, key) => {
      if (key.startsWith('component:')) {
        const name = key.replace('component:', '')
        const [mounts, unmounts] = value
        report.components[name] = {
          mounts,
          unmounts,
          leaked: mounts - unmounts
        }
      }
    })
    
    // Event listeners
    this.eventListeners.forEach((listeners, key) => {
      report.eventListeners[key] = listeners.size
    })
    
    return report
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Helper hooks
export function useComponentTracking(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return

  // Track mount
  performanceMonitor.trackComponent(componentName, 'mount')
  
  // Track unmount on cleanup
  return () => {
    performanceMonitor.trackComponent(componentName, 'unmount')
  }
}

export function useRenderTracking(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return

  const startTime = performance.now()
  performanceMonitor.measureRender(componentName, startTime)
}

// Safe event listener wrapper
export function addTrackedEventListener(
  element: EventTarget,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
) {
  performanceMonitor.trackEventListener(element, type, listener, 'add')
  element.addEventListener(type, listener, options)
  
  return () => {
    performanceMonitor.trackEventListener(element, type, listener, 'remove')
    element.removeEventListener(type, listener, options)
  }
}

// Safe timer wrappers
export function setTrackedTimeout(callback: () => void, delay: number) {
  const timer = setTimeout(() => {
    performanceMonitor.trackTimer(timer, 'timeout', 'clear')
    callback()
  }, delay)
  
  performanceMonitor.trackTimer(timer, 'timeout', 'set')
  return timer
}

export function clearTrackedTimeout(timer: NodeJS.Timeout) {
  performanceMonitor.trackTimer(timer, 'timeout', 'clear')
  clearTimeout(timer)
}

export function setTrackedInterval(callback: () => void, delay: number) {
  const timer = setInterval(callback, delay)
  performanceMonitor.trackTimer(timer, 'interval', 'set')
  return timer
}

export function clearTrackedInterval(timer: NodeJS.Timeout) {
  performanceMonitor.trackTimer(timer, 'interval', 'clear')
  clearInterval(timer)
}

// Auto-start monitoring in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring()
  
  // Expose to window for debugging
  (window as any).__performanceMonitor = performanceMonitor
  console.log('💡 Performance monitor available at window.__performanceMonitor.getReport()')
}