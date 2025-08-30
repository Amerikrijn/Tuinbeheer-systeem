/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics for the application
 */

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

interface MemoryMetric {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private memoryMetrics: MemoryMetric[] = []
  private renderCounts: Map<string, number> = new Map()
  private slowQueryThreshold = 1000 // ms
  private memoryCheckInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    
    // Monitor memory usage every 10 seconds
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.memoryCheckInterval = setInterval(() => {
        this.recordMemoryUsage()
      }, 10000)
    }

    // Log initial memory state
    this.recordMemoryUsage()
    
    console.log('🚀 Performance monitoring started')
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring() {
    if (!this.isMonitoring) return
    
    this.isMonitoring = false
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = null
    }
    
    console.log('🛑 Performance monitoring stopped')
    this.generateReport()
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName: string, metadata?: Record<string, any>) {
    this.metrics.set(operationName, {
      name: operationName,
      startTime: performance.now(),
      metadata
    })
  }

  /**
   * End timing an operation
   */
  endTimer(operationName: string): number {
    const metric = this.metrics.get(operationName)
    if (!metric) {
      console.warn(`No timer found for operation: ${operationName}`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime
    
    metric.endTime = endTime
    metric.duration = duration

    // Warn if operation is slow
    if (duration > this.slowQueryThreshold) {
      console.warn(`⚠️ Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`, metric.metadata)
    }

    return duration
  }

  /**
   * Track component render
   */
  trackRender(componentName: string) {
    const count = this.renderCounts.get(componentName) || 0
    this.renderCounts.set(componentName, count + 1)
    
    // Warn about excessive re-renders
    if (count > 10 && count % 10 === 0) {
      console.warn(`⚠️ Component "${componentName}" has rendered ${count} times`)
    }
  }

  /**
   * Record current memory usage
   */
  private recordMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) return
    
    const memory = (performance as any).memory
    if (!memory) return

    const metric: MemoryMetric = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }

    this.memoryMetrics.push(metric)

    // Keep only last 100 memory metrics
    if (this.memoryMetrics.length > 100) {
      this.memoryMetrics.shift()
    }

    // Check for memory leaks
    const usagePercent = (metric.usedJSHeapSize / metric.jsHeapSizeLimit) * 100
    if (usagePercent > 90) {
      console.error(`🚨 Critical memory usage: ${usagePercent.toFixed(1)}%`)
    } else if (usagePercent > 75) {
      console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`)
    }
  }

  /**
   * Check for memory leaks
   */
  checkMemoryLeak(): boolean {
    if (this.memoryMetrics.length < 10) return false

    // Check if memory is consistently increasing
    const recent = this.memoryMetrics.slice(-10)
    let increasingCount = 0

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].usedJSHeapSize > recent[i - 1].usedJSHeapSize) {
        increasingCount++
      }
    }

    const isLeaking = increasingCount >= 8 // 80% of samples show increase
    
    if (isLeaking) {
      const firstMemory = recent[0].usedJSHeapSize
      const lastMemory = recent[recent.length - 1].usedJSHeapSize
      const increase = ((lastMemory - firstMemory) / firstMemory) * 100
      
      console.error(`🚨 Potential memory leak detected! Memory increased by ${increase.toFixed(1)}% over last ${recent.length} samples`)
    }

    return isLeaking
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.group('📊 Performance Report')
    
    // Operation timings
    console.group('⏱️ Operation Timings')
    const timings = Array.from(this.metrics.values())
      .filter(m => m.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
    
    timings.slice(0, 10).forEach(metric => {
      const status = metric.duration! > this.slowQueryThreshold ? '🔴' : '🟢'
      console.log(`${status} ${metric.name}: ${metric.duration!.toFixed(2)}ms`, metric.metadata || '')
    })
    console.groupEnd()

    // Render counts
    console.group('🔄 Component Render Counts')
    const renders = Array.from(this.renderCounts.entries())
      .sort((a, b) => b[1] - a[1])
    
    renders.slice(0, 10).forEach(([component, count]) => {
      const status = count > 50 ? '🔴' : count > 20 ? '🟡' : '🟢'
      console.log(`${status} ${component}: ${count} renders`)
    })
    console.groupEnd()

    // Memory usage
    if (this.memoryMetrics.length > 0) {
      console.group('💾 Memory Usage')
      const latest = this.memoryMetrics[this.memoryMetrics.length - 1]
      const usedMB = (latest.usedJSHeapSize / 1024 / 1024).toFixed(2)
      const totalMB = (latest.totalJSHeapSize / 1024 / 1024).toFixed(2)
      const limitMB = (latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
      const usagePercent = (latest.usedJSHeapSize / latest.jsHeapSizeLimit * 100).toFixed(1)
      
      console.log(`Used: ${usedMB} MB / ${totalMB} MB (${usagePercent}% of ${limitMB} MB limit)`)
      
      // Check for memory leak
      this.checkMemoryLeak()
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear()
    this.memoryMetrics = []
    this.renderCounts.clear()
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-start monitoring in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring()
  
  // Generate report every 30 seconds in development
  setInterval(() => {
    performanceMonitor.generateReport()
  }, 30000)
}

// Export utility functions
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, any>
): T | Promise<T> {
  performanceMonitor.startTimer(name, metadata)
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        performanceMonitor.endTimer(name)
      })
    }
    
    performanceMonitor.endTimer(name)
    return result
  } catch (error) {
    performanceMonitor.endTimer(name)
    throw error
  }
}

export function useRenderTracking(componentName: string) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    performanceMonitor.trackRender(componentName)
  }
}