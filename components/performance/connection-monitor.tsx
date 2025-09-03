'use client';

import { useState, useEffect } from 'react';
import { connectionMonitor, type ConnectionMetrics } from '@/lib/connection-monitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ConnectionMonitorProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ConnectionMonitor({ 
  showDetails = true, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: ConnectionMonitorProps) {
  const [metrics, setMetrics] = useState<ConnectionMetrics>(connectionMonitor.getMetrics());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const cleanup = connectionMonitor.startMonitoring(refreshInterval);
      return cleanup;
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    // Update metrics when they change
    const interval = setInterval(() => {
      setMetrics(connectionMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await connectionMonitor.checkConnectionHealth();
      setMetrics(connectionMonitor.getMetrics());
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (metrics.isHealthy) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (metrics.errorRate > 20) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    if (metrics.isHealthy && metrics.errorRate < 5) {
      return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
    } else if (metrics.errorRate > 20) {
      return <Badge variant="destructive">Unhealthy</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>;
    }
  };

  const getConnectionTypeBadge = () => {
    if (metrics.connectionType === 'pooled') {
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Pooled</Badge>;
    } else if (metrics.connectionType === 'direct') {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Direct</Badge>;
    } else {
      return <Badge variant="outline" className="border-gray-500 text-gray-500">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Connection
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection Type:</span>
          {getConnectionTypeBadge()}
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Avg Response:</span>
          <span className="text-sm font-medium">
            {metrics.averageResponseTime.toFixed(0)}ms
          </span>
        </div>

        {/* Error Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Error Rate:</span>
          <span className={`text-sm font-medium ${
            metrics.errorRate > 10 ? 'text-red-500' : 
            metrics.errorRate > 5 ? 'text-yellow-500' : 
            'text-green-500'
          }`}>
            {metrics.errorRate.toFixed(1)}%
          </span>
        </div>

        {showDetails && (
          <>
            {/* Total Connections */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Connections:</span>
              <span className="text-sm font-medium">{metrics.totalConnections}</span>
            </div>

            {/* Active Connections */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active:</span>
              <span className="text-sm font-medium text-green-500">{metrics.activeConnections}</span>
            </div>

            {/* Failed Connections */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed:</span>
              <span className="text-sm font-medium text-red-500">{metrics.failedConnections}</span>
            </div>

            {/* Peak Response Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Peak Response:</span>
              <span className="text-sm font-medium">{metrics.peakResponseTime.toFixed(0)}ms</span>
            </div>

            {/* Last Check */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Check:</span>
              <span className="text-sm font-medium">
                {new Date(metrics.lastHealthCheck).toLocaleTimeString()}
              </span>
            </div>
          </>
        )}

        {/* Manual Refresh Button */}
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full"
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Refresh'}
          </Button>
          
          {lastRefresh && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              Last manual refresh: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for dashboard/widget use
 */
export function ConnectionMonitorCompact() {
  const [metrics, setMetrics] = useState<ConnectionMetrics>(connectionMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(connectionMonitor.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (metrics.isHealthy && metrics.errorRate < 5) return 'text-green-500';
    if (metrics.errorRate > 20) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Database className="h-3 w-3" />
      <span className={getStatusColor()}>
        {metrics.averageResponseTime.toFixed(0)}ms
      </span>
      <span className="text-muted-foreground">
        ({metrics.connectionType})
      </span>
    </div>
  );
}

/**
 * Floating monitor for development/debugging
 */
export function FloatingConnectionMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<ConnectionMetrics>(connectionMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(connectionMonitor.getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        title="Show Connection Monitor"
      >
        <Database className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">DB Monitor</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={metrics.isHealthy ? 'text-green-600' : 'text-red-600'}>
              {metrics.isHealthy ? '✅' : '❌'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Response:</span>
            <span>{metrics.averageResponseTime.toFixed(0)}ms</span>
          </div>
          
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="text-blue-600">{metrics.connectionType}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Errors:</span>
            <span className={metrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}>
              {metrics.errorRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
