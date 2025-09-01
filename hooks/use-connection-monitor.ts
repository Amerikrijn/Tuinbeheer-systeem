/**
 * Database Connection Monitor Hook
 * Monitors Supabase connection status and prevents app slowdown
 * Banking-grade: Secure monitoring without performance impact
 */

import { useState, useEffect, useCallback } from 'react'
import { connectionManager, type ConnectionStats } from '../lib/services/connection-manager'

export function useConnectionMonitor() {
  const [stats, setStats] = useState<ConnectionStats>({
    activeConnections: 0,
    totalQueries: 0,
    failedQueries: 0,
    lastCleanup: new Date(),
    connectionErrors: []
  })
  
  const [isHealthy, setIsHealthy] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Update stats every 10 seconds (not too frequent)
  const updateStats = useCallback(() => {
    try {
      const currentStats = connectionManager.getStats()
      setStats(currentStats)
      setLastUpdate(new Date())
      
      // Check if connections are healthy
      const healthy = currentStats.activeConnections <= 3 && 
                     currentStats.failedQueries < 5
      setIsHealthy(healthy)
      
      // Auto-cleanup if too many connections
      if (currentStats.activeConnections >= 3) {
        console.warn('⚠️ Too many active connections, forcing cleanup...')
        connectionManager.forceCleanup()
      }
    } catch (error) {
      console.error('Failed to update connection stats:', error)
    }
  }, [])

  // Monitor connections
  useEffect(() => {
    const interval = setInterval(updateStats, 10000) // 10 seconds
    
    return () => clearInterval(interval)
  }, [updateStats])

  // Force cleanup function
  const forceCleanup = useCallback(() => {
    try {
      connectionManager.forceCleanup()
      updateStats() // Refresh stats immediately
    } catch (error) {
      console.error('Failed to force cleanup:', error)
    }
  }, [updateStats])

  // Get connection health status
  const getHealthStatus = useCallback(() => {
    if (stats.activeConnections === 0) return 'idle'
    if (stats.activeConnections <= 2) return 'healthy'
    if (stats.activeConnections === 3) return 'warning'
    return 'critical'
  }, [stats.activeConnections])

  // Get health color for UI
  const getHealthColor = useCallback(() => {
    const status = getHealthStatus()
    switch (status) {
      case 'idle': return 'text-gray-500'
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }, [getHealthStatus])

  return {
    stats,
    isHealthy,
    lastUpdate,
    forceCleanup,
    getHealthStatus,
    getHealthColor,
    updateStats
  }
}
