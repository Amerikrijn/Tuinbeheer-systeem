'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Database, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  BarChart3,
  Activity,
  Cpu,
  HardDrive
} from 'lucide-react'
import { usePerformanceMonitor, type PerformanceMetrics } from '@/hooks/use-performance-monitor'
import { useQueryClient } from '@tanstack/react-query'
import { useMemoryCleanup } from '@/hooks/use-memory-cleanup'

interface PerformanceDashboardProps {
  className?: string
  showDetails?: boolean
}

export function PerformanceDashboard({ className = '', showDetails = false }: PerformanceDashboardProps) {
  const performanceMonitor = usePerformanceMonitor()
  const { metrics, events, getPerformanceReport, clearPerformanceData } = performanceMonitor
  
  // React Query client for cache metrics
  const queryClient = useQueryClient()
  
  // Memory cleanup hook
  const { getMemoryUsage, executeCleanup, forceGarbageCollection } = useMemoryCleanup({
    enableGarbageCollection: true,
    logMemoryUsage: true
  })

  // Get React Query cache statistics
  const getQueryCacheStats = () => {
    const queries = queryClient.getQueryCache().getAll()
    const mutations = queryClient.getMutationCache().getAll()
    
    return {
      activeQueries: queries.filter(q => q.isActive()).length,
      totalQueries: queries.length,
      activeMutations: mutations.filter(m => m.isPending()).length,
      totalMutations: mutations.length,
      cacheSize: queries.length + mutations.length
    }
  }

  // Get memory usage
  const getCurrentMemoryUsage = () => {
    const memory = getMemoryUsage()
    return memory ? {
      used: memory.used,
      total: memory.total,
      limit: memory.limit,
      percentage: Math.round((memory.used / memory.limit) * 100)
    } : null
  }

  // Bereken real-time statistieken
  const completedEvents = events.filter(e => e.duration !== undefined)
  const slowEvents = completedEvents.filter(e => (e.duration || 0) > 1000).length
  const avgEventDuration = completedEvents.length > 0 
    ? Math.round(completedEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / completedEvents.length)
    : 0

  // Performance status bepalen
  const getPerformanceStatus = () => {
    const memory = getCurrentMemoryUsage()
    const queryStats = getQueryCacheStats()
    
    if (memory && memory.percentage > 80) return { status: 'error', text: 'High Memory Usage', color: 'bg-red-500 dark:bg-red-600' }
    if (metrics.slowQueries > 0) return { status: 'warning', text: 'Attention Needed', color: 'bg-yellow-500 dark:bg-yellow-600' }
    if (metrics.averageQueryTime > 500) return { status: 'warning', text: 'Medium Performance', color: 'bg-yellow-500 dark:bg-yellow-600' }
    if (metrics.averageQueryTime > 1000) return { status: 'error', text: 'Poor Performance', color: 'bg-red-500 dark:bg-red-600' }
    return { status: 'success', text: 'Excellent', color: 'bg-green-500 dark:bg-green-600' }
  }

  const performanceStatus = getPerformanceStatus()
  const queryStats = getQueryCacheStats()
  const memoryUsage = getCurrentMemoryUsage()

  return (
    <div className={{`space-y-4 ${className}`}>
      {/* Performance Overview Card */}
      <Card>
        <CardHeader className=""pb-3">
          <div className=""flex items-center justify-between">
            <div>
              <CardTitle className=""text-lg">Performance Dashboard</CardTitle>
              <CardDescription>Real-time app performance metrics</CardDescription>
            </div>
            <div className=""flex items-center space-x-2">
              <Badge variant="outline" className={performanceStatus.color}>
                {performanceStatus.text}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className=""h-8 w-8 p-0"
              >
                <RefreshCw className=""h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className=""grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Database Queries */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
                <Database className=""h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className=""text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.databaseQueries}</div>
              <div className=""text-sm text-muted-foreground">Database Queries</div>
            </div>

            {/* Average Query Time */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
                <Clock className=""h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className=""text-2xl font-bold text-green-600 dark:text-green-400">{metrics.averageQueryTime}ms</div>
              <div className=""text-sm text-muted-foreground">Avg Query Time</div>
            </div>

            {/* Memory Usage */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <Cpu className=""h-6 w-6 text-orange-600" />
              </div>
              <div className=""text-2xl font-bold text-orange-600">
                {memoryUsage ? `${memoryUsage.used}MB` : 'N/A'}
              </div>
              <div className=""text-sm text-muted-foreground">Memory Usage</div>
            </div>

            {/* Slow Queries */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg mx-auto mb-2">
                <AlertTriangle className=""h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className=""text-2xl font-bold text-red-600 dark:text-red-400">{metrics.slowQueries}</div>
              <div className=""text-sm text-muted-foreground">Slow Queries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* React Query Cache Status */}
      <Card>
        <CardHeader className=""pb-3">
          <div className=""flex items-center justify-between">
            <div>
              <CardTitle className=""text-lg">React Query Cache</CardTitle>
              <CardDescription>Query and mutation cache status</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.clear()}
              className=""text-xs"
            >
              Clear Cache
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className=""grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Active Queries */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <Activity className=""h-6 w-6 text-purple-600" />
              </div>
              <div className=""text-2xl font-bold text-purple-600">{queryStats.activeQueries}</div>
              <div className=""text-sm text-muted-foreground">Active Queries</div>
            </div>

            {/* Total Queries */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-2">
                <BarChart3 className=""h-6 w-6 text-indigo-600" />
              </div>
              <div className=""text-2xl font-bold text-indigo-600">{queryStats.totalQueries}</div>
              <div className=""text-sm text-muted-foreground">Total Queries</div>
            </div>

            {/* Active Mutations */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg mx-auto mb-2">
                <TrendingUp className=""h-6 w-6 text-pink-600" />
              </div>
              <div className=""text-2xl font-bold text-pink-600">{queryStats.activeMutations}</div>
              <div className=""text-sm text-muted-foreground">Active Mutations</div>
            </div>

            {/* Cache Size */}
            <div className=""text-center">
              <div className=""flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto mb-2">
                <HardDrive className=""h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div className=""text-2xl font-bold text-gray-600 dark:text-gray-300">{queryStats.cacheSize}</div>
              <div className=""text-sm text-muted-foreground">Cache Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Management */}
      <Card>
        <CardHeader className=""pb-3">
          <div className=""flex items-center justify-between">
            <div>
              <CardTitle className=""text-lg">Memory Management</CardTitle>
              <CardDescription>Memory usage and cleanup tools</CardDescription>
            </div>
            <div className=""flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={executeCleanup}
                className=""text-xs"
              >
                Cleanup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={forceGarbageCollection}
                className=""text-xs"
              >
                GC
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {memoryUsage ? (
            <div className=""space-y-4">
              {/* Memory Usage Bar */}
              <div>
                <div className=""flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>{memoryUsage.used}MB / {memoryUsage.limit}MB ({memoryUsage.percentage}%)</span>
                </div>
                <div className=""w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={{`h-2 rounded-full transition-all duration-300 ${
                      memoryUsage.percentage > 80 ? 'bg-red-500 dark:bg-red-600' : 
                      memoryUsage.percentage > 60 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-green-500 dark:bg-green-600'
                    }`}
                    style={{ width: `${memoryUsage.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory Stats */}
              <div className=""grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className=""text-lg font-semibold text-blue-600 dark:text-blue-400">{memoryUsage.used}MB</div>
                  <div className=""text-xs text-muted-foreground">Used</div>
                </div>
                <div>
                  <div className=""text-lg font-semibold text-green-600 dark:text-green-400">{memoryUsage.total}MB</div>
                  <div className=""text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className=""text-lg font-semibold text-purple-600">{memoryUsage.limit}MB</div>
                  <div className=""text-xs text-muted-foreground">Limit</div>
                </div>
              </div>
            </div>
          ) : (
            <div className=""text-center text-muted-foreground">
              Memory metrics not available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Events */}
      {showDetails && (
        <Card>
          <CardHeader className=""pb-3">
            <div className=""flex items-center justify-between">
              <div>
                <CardTitle className=""text-lg">Performance Events</CardTitle>
                <CardDescription>Recent performance events and metrics</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearPerformanceData}
                className=""text-xs"
              >
                Clear Events
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className=""space-y-2 max-h-64 overflow-y-auto">
              {events.length === 0 ? (
                <div className=""text-center text-muted-foreground py-4">
                  No performance events recorded
                </div>
              ) : (
                events.slice(-10).reverse().map((event) => (
                  <div key={event.id} className=""flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className=""flex items-center space-x-2">
                      <span className=""text-xs font-mono">{event.type}</span>
                      <span className=""text-sm">{event.name}</span>
                    </div>
                    <div className=""text-xs text-muted-foreground">
                      {event.duration ? `${event.duration}ms` : 'pending'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Summary */}
      <Card>
        <CardHeader className=""pb-3">
          <CardTitle className=""text-lg">Performance Summary</CardTitle>
          <CardDescription>Overall performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=""grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className=""text-center">
              <div className=""text-2xl font-bold text-blue-600 dark:text-blue-400">{completedEvents.length}</div>
              <div className=""text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className=""text-center">
              <div className=""text-2xl font-bold text-green-600 dark:text-green-400">{avgEventDuration}ms</div>
              <div className=""text-sm text-muted-foreground">Avg Duration</div>
            </div>
            <div className=""text-center">
              <div className=""text-2xl font-bold text-red-600 dark:text-red-400">{slowEvents}</div>
              <div className=""text-sm text-muted-foreground">Slow Events</div>
            </div>
            <div className=""text-center">
              <div className=""text-2xl font-bold text-purple-600">{metrics.pageLoadTime}ms</div>
              <div className=""text-sm text-muted-foreground">Page Load</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Compacte versie voor kleine schermen
export function PerformanceDashboardCompact({ className = '' }: { className?: string }) {
  const performanceMonitor = usePerformanceMonitor()
  const { metrics } = performanceMonitor

  return (
    <div className={{`flex items-center space-x-4 text-sm ${className}`}>
      <div className=""flex items-center space-x-1">
        <Database className=""h-4 w-4 text-blue-500 dark:text-blue-400" />
        <span className=""text-muted-foreground">{metrics.databaseQueries}</span>
      </div>
      <div className=""flex items-center space-x-1">
        <Clock className=""h-4 w-4 text-green-500 dark:text-green-400" />
        <span className=""text-muted-foreground">{metrics.averageQueryTime}ms</span>
      </div>
      <div className=""flex items-center space-x-1">
        <Memory className=""h-4 w-4 text-orange-500" />
        <span className=""text-muted-foreground">{metrics.memoryUsage}MB</span>
      </div>
      {metrics.slowQueries > 0 && (
        <div className=""flex items-center space-x-1">
          <AlertTriangle className=""h-4 w-4 text-red-500 dark:text-red-400" />
          <span className=""text-red-600 dark:text-red-400">{metrics.slowQueries}</span>
        </div>
      )}
    </div>
  )
}