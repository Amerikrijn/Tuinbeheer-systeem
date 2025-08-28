/**
 * Performance Monitoring Utility
 * Tracks and reports on database query performance and authentication metrics
 */

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private readonly maxMetrics = 100 // Keep last 100 metrics in memory
  private readonly slowQueryThreshold = 3000 // 3 seconds
  private readonly criticalQueryThreshold = 10000 // 10 seconds

  /**
   * Start tracking a new metric
   */
  startMetric(name: string, metadata?: Record<string, any>): PerformanceMetric {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      success: false,
      metadata,
    }

    this.metrics.push(metric)

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    return metric
  }

  /**
   * Complete a metric tracking
   */
  endMetric(metric: PerformanceMetric, success: boolean, error?: string): void {
    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime
    metric.success = success
    metric.error = error

    // Log performance warnings
    if (metric.duration > this.criticalQueryThreshold) {
      console.error(`🚨 CRITICAL: ${metric.name} took ${metric.duration.toFixed(2)}ms`, {
        ...metric.metadata,
        error: metric.error,
      })
    } else if (metric.duration > this.slowQueryThreshold) {
      console.warn(`⚠️ SLOW: ${metric.name} took ${metric.duration.toFixed(2)}ms`, {
        ...metric.metadata,
        error: metric.error,
      })
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${metric.name} completed in ${metric.duration.toFixed(2)}ms`)
    }

    // Send to analytics if available
    this.sendToAnalytics(metric)
  }

  /**
   * Track an async operation
   */
  async track<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const metric = this.startMetric(name, metadata)

    try {
      const result = await operation()
      this.endMetric(metric, true)
      return result
    } catch (error) {
      this.endMetric(metric, false, error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const successfulMetrics = this.metrics.filter(m => m.success && m.duration)
    const failedMetrics = this.metrics.filter(m => !m.success)

    if (successfulMetrics.length === 0) {
      return {
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
        successRate: 0,
        totalRequests: this.metrics.length,
        slowQueries: 0,
        criticalQueries: 0,
      }
    }

    const durations = successfulMetrics
      .map(m => m.duration!)
      .sort((a, b) => a - b)

    const p50Index = Math.floor(durations.length * 0.5)
    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50Duration: durations[p50Index],
      p95Duration: durations[p95Index],
      p99Duration: durations[p99Index],
      successRate: (successfulMetrics.length / this.metrics.length) * 100,
      totalRequests: this.metrics.length,
      slowQueries: this.metrics.filter(m => m.duration && m.duration > this.slowQueryThreshold).length,
      criticalQueries: this.metrics.filter(m => m.duration && m.duration > this.criticalQueryThreshold).length,
      recentFailures: failedMetrics.slice(-5).map(m => ({
        name: m.name,
        error: m.error,
        metadata: m.metadata,
      })),
    }
  }

  /**
   * Send metrics to analytics service (if configured)
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Only send critical metrics to avoid noise
    if (!metric.duration || metric.duration < this.slowQueryThreshold) {
      return
    }

    // Check if we have analytics available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      try {
        (window as any).analytics.track('Database Performance Issue', {
          metricName: metric.name,
          duration: metric.duration,
          success: metric.success,
          error: metric.error,
          ...metric.metadata,
        })
      } catch (error) {
        console.debug('Failed to send analytics:', error)
      }
    }
  }

  /**
   * Export metrics for debugging
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2)
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    track: performanceMonitor.track.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    exportMetrics: performanceMonitor.exportMetrics.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  }
}

/**
 * Circuit Breaker implementation for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private successCount = 0

  constructor(
    private name: string,
    private threshold = 5,
    private timeout = 60000, // 1 minute
    private halfOpenSuccessThreshold = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime
      if (timeSinceLastFailure > this.timeout) {
        console.log(`🔄 Circuit breaker ${this.name} entering half-open state`)
        this.state = 'half-open'
        this.successCount = 0
      } else {
        const timeRemaining = Math.ceil((this.timeout - timeSinceLastFailure) / 1000)
        throw new Error(`Circuit breaker ${this.name} is open. Retry in ${timeRemaining}s`)
      }
    }

    try {
      const result = await fn()

      // Handle successful execution
      if (this.state === 'half-open') {
        this.successCount++
        if (this.successCount >= this.halfOpenSuccessThreshold) {
          console.log(`✅ Circuit breaker ${this.name} closed after successful recovery`)
          this.state = 'closed'
          this.failures = 0
        }
      } else if (this.state === 'closed') {
        // Reset failure count on success
        this.failures = 0
      }

      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      if (this.state === 'half-open') {
        console.error(`🚨 Circuit breaker ${this.name} reopened due to failure in half-open state`)
        this.state = 'open'
      } else if (this.failures >= this.threshold) {
        console.error(`🚨 Circuit breaker ${this.name} opened after ${this.failures} failures`)
        this.state = 'open'
      }

      throw error
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    }
  }

  reset() {
    this.state = 'closed'
    this.failures = 0
    this.successCount = 0
    console.log(`🔧 Circuit breaker ${this.name} manually reset`)
  }
}

// Export default circuit breaker for auth operations
export const authCircuitBreaker = new CircuitBreaker('auth', 5, 60000, 3)