/**
 * Connection Monitor for Supabase Pooler
 * 
 * Monitors database connection health, performance metrics, and connection pooling status
 * Provides real-time insights into connection usage and performance
 */

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  averageResponseTime: number;
  lastHealthCheck: string;
  connectionType: 'pooled' | 'direct' | 'unknown';
  isHealthy: boolean;
  errorRate: number;
  peakResponseTime: number;
  minResponseTime: number;
}

interface HealthCheckResult {
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: string;
  connectionInfo?: {
    isPooledConnection: boolean;
    poolerPort: boolean;
    hasPgbouncer: boolean;
  };
}

class ConnectionMonitor {
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date().toISOString(),
    connectionType: 'unknown',
    isHealthy: true,
    errorRate: 0,
    peakResponseTime: 0,
    minResponseTime: Infinity,
  };

  private healthCheckHistory: HealthCheckResult[] = [];
  private readonly maxHistorySize = 100;

  /**
   * Perform a comprehensive health check
   */
  async checkConnectionHealth(): Promise<boolean> {
    try {
      const startTime = performance.now();
      
      // Use the health check endpoint
      const response = await fetch('/api/db-check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      const responseTime = performance.now() - startTime;
      
      const healthResult: HealthCheckResult = {
        success: result.ok,
        responseTime,
        timestamp: new Date().toISOString(),
        connectionInfo: {
          isPooledConnection: result.isPooledConnection || false,
          poolerPort: result.poolerPort || false,
          hasPgbouncer: result.hasPgbouncer || false,
        }
      };
      
      // Update metrics
      this.updateMetrics(healthResult);
      
      // Add to history
      this.addToHistory(healthResult);
      
      if (result.ok) {
        console.log(`✅ Database health check passed: ${responseTime.toFixed(0)}ms`);
        return true;
      } else {
        console.error(`❌ Database health check failed:`, result.error);
        return false;
      }
    } catch (error) {
      const healthResult: HealthCheckResult = {
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
      
      this.updateMetrics(healthResult);
      this.addToHistory(healthResult);
      
      console.error(`❌ Database health check error:`, error);
      return false;
    }
  }

  /**
   * Perform a comprehensive connection test
   */
  async performComprehensiveTest(): Promise<{
    success: boolean;
    tests: any[];
    summary: any;
  }> {
    try {
      const response = await fetch('/api/db-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log(`✅ Comprehensive connection test passed: ${result.summary.totalDuration}ms`);
      } else {
        console.error(`❌ Comprehensive connection test failed:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Comprehensive connection test error:`, error);
      return {
        success: false,
        tests: [],
        summary: { totalTests: 0, passedTests: 0, failedTests: 1, totalDuration: 0 }
      };
    }
  }

  /**
   * Update metrics based on health check result
   */
  private updateMetrics(result: HealthCheckResult): void {
    this.metrics.totalConnections++;
    this.metrics.lastHealthCheck = result.timestamp;
    
    if (result.success) {
      this.metrics.activeConnections++;
      this.metrics.isHealthy = true;
      
      // Update response time metrics
      if (result.responseTime > 0) {
        this.metrics.averageResponseTime = 
          (this.metrics.averageResponseTime + result.responseTime) / 2;
        
        this.metrics.peakResponseTime = Math.max(
          this.metrics.peakResponseTime, 
          result.responseTime
        );
        
        this.metrics.minResponseTime = Math.min(
          this.metrics.minResponseTime, 
          result.responseTime
        );
      }
      
      // Update connection type
      if (result.connectionInfo) {
        if (result.connectionInfo.isPooledConnection && result.connectionInfo.poolerPort) {
          this.metrics.connectionType = 'pooled';
        } else {
          this.metrics.connectionType = 'direct';
        }
      }
    } else {
      this.metrics.failedConnections++;
      this.metrics.isHealthy = false;
    }
    
    // Calculate error rate
    this.metrics.errorRate = (this.metrics.failedConnections / this.metrics.totalConnections) * 100;
  }

  /**
   * Add health check result to history
   */
  private addToHistory(result: HealthCheckResult): void {
    this.healthCheckHistory.push(result);
    
    // Keep only the last N results
    if (this.healthCheckHistory.length > this.maxHistorySize) {
      this.healthCheckHistory = this.healthCheckHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get health check history
   */
  getHealthCheckHistory(): HealthCheckResult[] {
    return [...this.healthCheckHistory];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageResponseTime: number;
    peakResponseTime: number;
    minResponseTime: number;
    errorRate: number;
    uptime: number;
    connectionType: string;
    isHealthy: boolean;
  } {
    const recentHistory = this.healthCheckHistory.slice(-10); // Last 10 checks
    const recentSuccesses = recentHistory.filter(h => h.success);
    
    return {
      averageResponseTime: this.metrics.averageResponseTime,
      peakResponseTime: this.metrics.peakResponseTime,
      minResponseTime: this.metrics.minResponseTime === Infinity ? 0 : this.metrics.minResponseTime,
      errorRate: this.metrics.errorRate,
      uptime: recentHistory.length > 0 ? (recentSuccesses.length / recentHistory.length) * 100 : 100,
      connectionType: this.metrics.connectionType,
      isHealthy: this.metrics.isHealthy,
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      averageResponseTime: 0,
      lastHealthCheck: new Date().toISOString(),
      connectionType: 'unknown',
      isHealthy: true,
      errorRate: 0,
      peakResponseTime: 0,
      minResponseTime: Infinity,
    };
    
    this.healthCheckHistory = [];
  }

  /**
   * Start automatic health monitoring
   */
  startMonitoring(intervalMs: number = 30000): () => void {
    const interval = setInterval(async () => {
      await this.checkConnectionHealth();
    }, intervalMs);
    
    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Get connection status for display
   */
  getConnectionStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    recommendations: string[];
  } {
    const summary = this.getPerformanceSummary();
    const recommendations: string[] = [];
    
    if (summary.isHealthy && summary.errorRate < 5 && summary.averageResponseTime < 200) {
      return {
        status: 'healthy',
        message: 'Database connection is healthy and performing well',
        recommendations: []
      };
    }
    
    if (summary.errorRate > 5) {
      recommendations.push('High error rate detected - check Supabase project status');
    }
    
    if (summary.averageResponseTime > 500) {
      recommendations.push('Slow response times - consider optimizing queries or checking connection pooling');
    }
    
    if (summary.connectionType === 'direct') {
      recommendations.push('Using direct connection - consider switching to pooled connection for better performance');
    }
    
    if (summary.uptime < 95) {
      recommendations.push('Low uptime - check for intermittent connection issues');
    }
    
    const status = summary.errorRate > 20 || summary.averageResponseTime > 1000 ? 'unhealthy' : 'degraded';
    const message = status === 'unhealthy' 
      ? 'Database connection has serious issues'
      : 'Database connection has minor issues';
    
    return {
      status,
      message,
      recommendations
    };
  }
}

// Export singleton instance
export const connectionMonitor = new ConnectionMonitor();

// Export types for use in components
export type { ConnectionMetrics, HealthCheckResult };
