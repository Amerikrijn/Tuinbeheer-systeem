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
  HardDrive,
  Settings
} from 'lucide-react'
import { usePerformanceMonitor, type PerformanceMetrics } from '@/hooks/use-performance-monitor'
import { useQueryClient } from '@tanstack/react-query'
import { useMemoryCleanup } from '@/hooks/use-memory-cleanup'

interface PerformanceDashboardProps {
  className?: string
  showDetails?: boolean
}

export function PerformanceDashboard({ className = '', showDetails = false }: PerformanceDashboardProps) {
  // 🚀 PERFORMANCE FIX: Lazy load performance monitoring
  const [isMonitoringEnabled, setIsMonitoringEnabled] = React.useState(false)
  
  const performanceMonitor = usePerformanceMonitor()
  const { metrics, events, getPerformanceReport, clearPerformanceData } = performanceMonitor
  
  // React Query client for cache metrics
  const queryClient = useQueryClient()
  
  // Memory cleanup hook
  const { getMemoryUsage, executeCleanup, forceGarbageCollection, getMemoryHealth, triggerAutoCleanup } = useMemoryCleanup({
    enableGarbageCollection: true,
    logMemoryUsage: true
  })

  // 🚀 PERFORMANCE FIX: Throttled cache stats update
  const [queryStats, setQueryStats] = React.useState({
    activeQueries: 0,
    totalQueries: 0,
    activeMutations: 0,
    totalMutations: 0,
    cacheSize: 0
  })

  // 🚀 PERFORMANCE FIX: Update cache stats only when needed
  React.useEffect(() => {
    if (!isMonitoringEnabled) return
    
    const updateStats = () => {
      try {
        const queries = queryClient.getQueryCache().getAll()
        const mutations = queryClient.getMutationCache().getAll()
        
        setQueryStats({
          activeQueries: queries.filter(q => q.isActive()).length,
          totalQueries: queries.length,
          activeMutations: mutations.filter(m => m.isPending()).length,
          totalMutations: mutations.length,
          cacheSize: queries.length + mutations.length
        })
      } catch (error) {
        // Silent fail to prevent crashes
      }
    }

    // Update immediately
    updateStats()
    
    // Update every 10 seconds instead of every render
    const intervalId = setInterval(updateStats, 10000)
    
    return () => clearInterval(intervalId)
  }, [queryClient, isMonitoringEnabled])

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

  // 🚀 PERFORMANCE FIX: Simplified performance calculation
  const completedEvents = events.filter(e => e.duration !== undefined)
  const slowEvents = completedEvents.filter(e => (e.duration || 0) > 1000).length
  const avgEventDuration = completedEvents.length > 0 
    ? Math.round(completedEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / completedEvents.length)
    : 0

  // Performance status bepalen
  const getPerformanceStatus = () => {
    const memory = getCurrentMemoryUsage()
    
    if (memory && memory.percentage > 80) return { status: 'error', text: 'High Memory Usage', color: 'bg-red-500 dark:bg-red-600' }
    if (metrics.slowQueries > 0) return { status: 'warning', text: 'Attention Needed', color: 'bg-yellow-500 dark:bg-yellow-600' }
    if (metrics.averageQueryTime > 500) return { status: 'warning', text: 'Medium Performance', color: 'bg-yellow-500 dark:bg-yellow-600' }
    if (metrics.averageQueryTime > 1000) return { status: 'error', text: 'Poor Performance', color: 'bg-red-500 dark:bg-red-600' }
    return { status: 'success', text: 'Excellent', color: 'bg-green-500 dark:bg-green-600' }
  }

  const performanceStatus = getPerformanceStatus()
  const memoryUsage = getCurrentMemoryUsage()
  const memoryHealth = getMemoryHealth()

  // 🚀 PERFORMANCE FIX: Enable monitoring only when component is visible
  React.useEffect(() => {
    if (showDetails && !isMonitoringEnabled) {
      setIsMonitoringEnabled(true)
    } else if (!showDetails && isMonitoringEnabled) {
      setIsMonitoringEnabled(false)
    }
  }, [showDetails, isMonitoringEnabled])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Performance Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Performance Dashboard</CardTitle>
              <CardDescription>Real-time app performance metrics</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={performanceStatus.color}>
                {performanceStatus.text}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoringEnabled(!isMonitoringEnabled)}
                className="flex items-center gap-2"
              >
                {isMonitoringEnabled ? (
                  <>
                    <Activity className="h-4 w-4" />
                    Monitoring Aan
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    Monitoring Uit
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 🚀 PERFORMANCE FIX: Only show metrics when monitoring is enabled */}
          {isMonitoringEnabled ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.pageLoadTime}ms</div>
                  <div className="text-sm text-muted-foreground">Page Load</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.databaseQueries}</div>
                  <div className="text-sm text-muted-foreground">DB Queries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics.averageQueryTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Query</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{slowEvents}</div>
                  <div className="text-sm text-muted-foreground">Slow Events</div>
                </div>
              </div>

              {/* Memory Usage */}
              {memoryUsage && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <Badge 
                      variant={memoryHealth === 'critical' ? 'destructive' : memoryHealth === 'warning' ? 'secondary' : 'default'}
                    >
                      {memoryHealth}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        memoryHealth === 'critical' ? 'bg-red-500' : 
                        memoryHealth === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${memoryUsage.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{memoryUsage.used}MB</span>
                    <span>{memoryUsage.limit}MB</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Performance monitoring is uitgeschakeld</p>
              <p className="text-sm mt-2">Schakel monitoring in om real-time metrics te bekijken</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* React Query Cache Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>React Query Cache</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{queryStats.activeQueries}</div>
              <div className="text-sm text-muted-foreground">Active Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{queryStats.totalQueries}</div>
              <div className="text-sm text-muted-foreground">Total Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{queryStats.activeMutations}</div>
              <div className="text-sm text-muted-foreground">Active Mutations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{queryStats.cacheSize}</div>
              <div className="text-sm text-muted-foreground">Cache Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 PERFORMANCE FIX: Only show detailed events when needed */}
      {showDetails && isMonitoringEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Performance Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {events.slice(-10).map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{event.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                    {event.duration && (
                      <span className="text-muted-foreground">
                        {event.duration}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Geen performance events geregistreerd
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={executeCleanup}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Memory Cleanup
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={forceGarbageCollection}
              className="flex items-center gap-2"
            >
              <HardDrive className="h-4 w-4" />
              Garbage Collection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearPerformanceData}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Clear Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerAutoCleanup}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Auto Cleanup
            </Button>
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
    <div className={`flex items-center space-x-4 text-sm ${className}`}>
      <div className="flex items-center space-x-1">
        <Database className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        <span className="text-muted-foreground">{metrics.databaseQueries}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4 text-green-500 dark:text-green-400" />
        <span className="text-muted-foreground">{metrics.averageQueryTime}ms</span>
      </div>
      <div className="flex items-center space-x-1">
        <Memory className="h-4 w-4 text-orange-500" />
        <span className="text-muted-foreground">{metrics.memoryUsage}MB</span>
      </div>
      {metrics.slowQueries > 0 && (
        <div className="flex items-center space-x-1">
          <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
          <span className="text-red-600 dark:text-red-400">{metrics.slowQueries}</span>
        </div>
      )}
    </div>
  )
}