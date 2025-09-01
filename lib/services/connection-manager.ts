/**
 * Database Connection Manager
 * Handles Supabase free tier connection limits and prevents app slowdown
 * Banking-grade: Secure connection management with proper cleanup
 */

import { createClient } from '@supabase/supabase-js'
import { getSafeSupabaseConfig } from '../config'

interface ConnectionStats {
  activeConnections: number
  totalQueries: number
  failedQueries: number
  lastCleanup: Date
  connectionErrors: string[]
}

class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager
  private connections: Set<any> = new Set()
  private stats: ConnectionStats = {
    activeConnections: 0,
    totalQueries: 0,
    failedQueries: 0,
    lastCleanup: new Date(),
    connectionErrors: []
  }
  
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly MAX_CONNECTIONS = 3 // Supabase free tier limit
  private readonly CLEANUP_INTERVAL = 30000 // 30 seconds
  private readonly QUERY_TIMEOUT = 25000 // 25 seconds (under 30s limit)

  private constructor() {
    this.startCleanupInterval()
  }

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager()
    }
    return DatabaseConnectionManager.instance
  }

  /**
   * Get a database connection with connection pooling
   */
  async getConnection() {
    // Check if we're at connection limit
    if (this.connections.size >= this.MAX_CONNECTIONS) {
      console.warn('⚠️ Connection limit reached, waiting for available connection...')
      await this.waitForConnection()
    }

    try {
      const config = getSafeSupabaseConfig()
      // Config is always available now, even during build time
      
      const connection = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false, // Prevent session persistence issues
          autoRefreshToken: false, // Manual token refresh
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-connection-id': `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
      })

      this.connections.add(connection)
      this.stats.activeConnections = this.connections.size
      this.stats.totalQueries++

      return connection
    } catch (error) {
      this.stats.failedQueries++
      this.stats.connectionErrors.push(error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(connection: any) {
    if (this.connections.has(connection)) {
      this.connections.delete(connection)
      this.stats.activeConnections = this.connections.size
    }
  }

  /**
   * Execute a query with timeout and connection management
   */
  async executeQuery<T>(
    queryFn: (connection: any) => Promise<T>,
    timeoutMs: number = this.QUERY_TIMEOUT
  ): Promise<T> {
    const connection = await this.getConnection()
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
      })

      const result = await Promise.race([
        queryFn(connection),
        timeoutPromise
      ])

      return result
    } finally {
      this.releaseConnection(connection)
    }
  }

  /**
   * Wait for an available connection
   */
  private async waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.connections.size < this.MAX_CONNECTIONS) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * Start periodic connection cleanup
   */
  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupConnections()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * Cleanup stale connections
   */
  private cleanupConnections() {
    const now = new Date()
    const timeSinceLastCleanup = now.getTime() - this.stats.lastCleanup.getTime()
    
    // Cleanup every 30 seconds
    if (timeSinceLastCleanup >= this.CLEANUP_INTERVAL) {
      // Force cleanup of all connections to prevent buildup
      this.connections.clear()
      this.stats.activeConnections = 0
      this.stats.lastCleanup = now
      
      console.log('🧹 Database connections cleaned up')
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    return { ...this.stats }
  }

  /**
   * Force cleanup all connections
   */
  forceCleanup() {
    this.connections.clear()
    this.stats.activeConnections = 0
    this.stats.lastCleanup = new Date()
    console.log('🧹 Forced database connection cleanup')
  }

  /**
   * Shutdown connection manager
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.connections.clear()
    this.stats.activeConnections = 0
  }
}

// Export singleton instance
export const connectionManager = DatabaseConnectionManager.getInstance()

// Export types
export type { ConnectionStats }
