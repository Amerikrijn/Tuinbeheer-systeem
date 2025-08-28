'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Database, 
  Memory, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react'
import { usePerformanceMonitor, type PerformanceMetrics } from '@/hooks/use-performance-monitor'

interface PerformanceDashboardProps {
  className?: string
  showDetails?: boolean
}

export function PerformanceDashboard({ className = '', showDetails = false }: PerformanceDashboardProps) {
  const performanceMonitor = usePerformanceMonitor()
  const { metrics, events, getPerformanceReport, clearPerformanceData } = performanceMonitor

  // Bereken real-time statistieken
  const completedEvents = events.filter(e => e.duration !== undefined)
  const slowEvents = completedEvents.filter(e => (e.duration || 0) > 1000).length
  const avgEventDuration = completedEvents.length > 0 
    ? Math.round(completedEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / completedEvents.length)
    : 0

  // Performance status bepalen
  const getPerformanceStatus = () => {
    if (metrics.slowQueries > 0) return { status: 'warning', text: 'Attention Needed', color: 'bg-yellow-500' }
    if (metrics.averageQueryTime > 500) return { status: 'warning', text: 'Medium Performance', color: 'bg-yellow-500' }
    if (metrics.averageQueryTime > 1000) return { status: 'error', text: 'Poor Performance', color: 'bg-red-500' }
    return { status: 'success', text: 'Excellent', color: 'bg-green-500' }
  }

  const performanceStatus = getPerformanceStatus()

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
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Database Queries */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.databaseQueries}</div>
              <div className="text-sm text-muted-foreground">Database Queries</div>
            </div>

            {/* Average Query Time */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{metrics.averageQueryTime}ms</div>
              <div className="text-sm text-muted-foreground">Avg Query Time</div>
            </div>

            {/* Memory Usage */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <Memory className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{metrics.memoryUsage}MB</div>
              <div className="text-sm text-muted-foreground">Memory Usage</div>
            </div>

            {/* Slow Queries */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{metrics.slowQueries}</div>
              <div className="text-sm text-muted-foreground">Slow Queries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      {showDetails && (
        <>
          {/* Event Performance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Performance</CardTitle>
              <CardDescription>Detailed performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Events</span>
                  <span className="font-medium">{completedEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Duration</span>
                  <span className="font-medium">{avgEventDuration}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Slow Events (>1s)</span>
                  <span className="font-medium text-red-600">{slowEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Page Load Time</span>
                  <span className="font-medium">{metrics.pageLoadTime}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Events Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Performance Events</CardTitle>
              <CardDescription>Last 10 performance events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.slice(-10).reverse().map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.type === 'database_query' ? 'bg-blue-500' :
                        event.type === 'component_render' ? 'bg-green-500' :
                        event.type === 'api_call' ? 'bg-purple-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-sm font-medium">{event.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.duration ? `${event.duration.toFixed(0)}ms` : '...'}
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No performance events recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Actions</CardTitle>
              <CardDescription>Manage performance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const report = getPerformanceReport()
                    if (report) {
                      console.log('📊 Performance Report:', report)
                      alert('Performance report logged to console')
                    }
                  }}
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearPerformanceData}
                  className="flex-1"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
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
        <Database className="h-4 w-4 text-blue-500" />
        <span className="text-muted-foreground">{metrics.databaseQueries}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4 text-green-500" />
        <span className="text-muted-foreground">{metrics.averageQueryTime}ms</span>
      </div>
      <div className="flex items-center space-x-1">
        <Memory className="h-4 w-4 text-orange-500" />
        <span className="text-muted-foreground">{metrics.memoryUsage}MB</span>
      </div>
      {metrics.slowQueries > 0 && (
        <div className="flex items-center space-x-1">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-red-600">{metrics.slowQueries}</span>
        </div>
      )}
    </div>
  )
}