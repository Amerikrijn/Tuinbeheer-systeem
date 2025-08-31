/**
 * Performance Monitoring Utility
 * Tracks and reports on application performance metrics
 */

interface PerformanceMark {
  name: string
  timestamp: number
}

interface PerformanceMeasure {
  name: string
  duration: number
  startMark: string
  endMark: string
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map()
  private measures: PerformanceMeasure[] = []
  private enabled: boolean = process.env.NODE_ENV === 'development'

  /**
   * Start a performance measurement
   */
  mark(name: string): void {
    if (!this.enabled) return
    
    this.marks.set(name, {
      name,
      timestamp: performance.now()
    })
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    if (!this.enabled) return null
    
    const start = this.marks.get(startMark)
    const end = this.marks.get(endMark)
    
    if (!start || !end) {
      console.warn(`Performance marks not found: ${startMark} or ${endMark}`)
      return null
    }
    
    const duration = end.timestamp - start.timestamp
    
    this.measures.push({
      name,
      duration,
      startMark,
      endMark
    })
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }

  /**
   * Simple timing helper
   */
  async time<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startMark = `${name}-start`
    const endMark = `${name}-end`
    
    this.mark(startMark)
    
    try {
      const result = await operation()
      this.mark(endMark)
      const duration = this.measure(name, startMark, endMark)
      
      if (duration && duration > 100) {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      this.mark(endMark)
      this.measure(name, startMark, endMark)
      throw error
    }
  }

  /**
   * Get performance report
   */
  getReport(): { marks: PerformanceMark[], measures: PerformanceMeasure[] } {
    return {
      marks: Array.from(this.marks.values()),
      measures: this.measures
    }
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.marks.clear()
    this.measures = []
  }

  /**
   * Check Core Web Vitals
   */
  checkWebVitals(): void {
    if (!this.enabled || typeof window === 'undefined') return
    
    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry as any
          const duration = lcp.renderTime || lcp.loadTime
          
          if (duration > 2500) {
            console.warn(`⚠️ LCP is ${duration.toFixed(0)}ms (target: <2500ms)`)
          } else {
            console.log(`✅ LCP is ${duration.toFixed(0)}ms`)
          }
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }

  /**
   * Log performance metrics
   */
  logMetrics(operation: string, metrics: Record<string, any>): void {
    if (!this.enabled) return
    
    const duration = metrics.duration || metrics.performanceDuration
    
    if (duration) {
      const durationMs = typeof duration === 'string' 
        ? parseFloat(duration.replace('ms', '')) 
        : duration
        
      // Color code based on performance
      let emoji = '🟢'
      if (durationMs > 3000) emoji = '🔴'
      else if (durationMs > 1000) emoji = '🟡'
      
      console.log(`${emoji} Performance: ${operation}`, {
        ...metrics,
        duration: `${durationMs.toFixed(2)}ms`
      })
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export helper functions
export const perfMark = (name: string) => performanceMonitor.mark(name)
export const perfMeasure = (name: string, start: string, end: string) => 
  performanceMonitor.measure(name, start, end)
export const perfTime = <T>(name: string, operation: () => Promise<T>) => 
  performanceMonitor.time(name, operation)
export const perfLog = (operation: string, metrics: Record<string, any>) =>
  performanceMonitor.logMetrics(operation, metrics)