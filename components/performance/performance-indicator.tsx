'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Database, HardDrive, Clock, Activity } from 'lucide-react'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'

export function PerformanceIndicator() {
  const { metrics, isMonitoring } = usePerformanceMonitor()

  if (!isMonitoring || metrics.databaseQueries === 0) {
    return null
  }

  const getPerformanceStatus = () => {
    if (metrics.averageQueryTime < 100) return 'excellent'
    if (metrics.averageQueryTime < 500) return 'good'
    if (metrics.averageQueryTime < 1000) return 'warning'
    return 'critical'
  }

  const status = getPerformanceStatus()
  const statusColors = {
    excellent: 'bg-green-100 text-green-800 border-green-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-4 border-2 border-dashed border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
            <span className="font-semibold text-gray-700">Performance Monitor</span>
            <Badge className={statusColors[status]}>
              {status === 'excellent' && '🚀 Excellent'}
              {status === 'good' && '✅ Good'}
              {status === 'warning' && '⚠️ Warning'}
              {status === 'critical' && '🚨 Critical'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">Last: {metrics.averageQueryTime}ms</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Avg: {metrics.averageQueryTime}ms</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-purple-500" />
              <span className="text-gray-600">Queries: {metrics.databaseQueries}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-orange-500" />
              <span className="text-gray-600">{metrics.memoryUsage}MB</span>
            </div>
          </div>
        </div>
        
        {/* Performance Bar */}
        <div className="mt-3">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Performance:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  status === 'excellent' ? 'bg-green-500' :
                  status === 'good' ? 'bg-blue-500' :
                  status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, 100 - (metrics.averageQueryTime / 10))}%` 
                }}
              />
            </div>
            <span>{Math.round(100 - (metrics.averageQueryTime / 10))}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PerformanceIndicatorCompact() {
  const { metrics, isMonitoring } = usePerformanceMonitor()

  if (!isMonitoring || metrics.databaseQueries === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground bg-gray-50 rounded-lg p-2 border">
      <span className="flex items-center">
        <Clock className="w-3 h-3 mr-1 text-blue-500" />
        {metrics.averageQueryTime}ms
      </span>
      <span className="flex items-center">
        <Database className="w-3 h-3 mr-1 text-purple-500" />
        {metrics.databaseQueries}q
      </span>
      <span className="flex items-center">
        <HardDrive className="w-3 h-3 mr-1 text-orange-500" />
        {metrics.memoryUsage}MB
      </span>
    </div>
  )
}