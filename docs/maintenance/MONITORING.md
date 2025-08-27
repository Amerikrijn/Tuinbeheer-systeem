# Health Checks & Monitoring

## 📊 Monitoring Overzicht

### Monitoring Stack
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Infrastructure │    │   Business      │
│   Monitoring    │    │   Monitoring     │    │   Monitoring    │
│                 │    │                 │    │                 │
│ • Performance   │    │ • CPU/Memory    │    │ • User Metrics  │
│ • Error Rates   │    │ • Disk Usage    │    │ • Feature Usage │
│ • Response      │    │ • Network       │    │ • Conversion    │
│   Times         │    │   Traffic       │    │   Rates         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Monitoring Principes
- **Real-time**: Continue monitoring van alle systemen
- **Proactive**: Problemen detecteren voordat ze kritiek worden
- **Comprehensive**: Alle lagen van de applicatie monitoren
- **Actionable**: Alerts die direct actie vereisen

## 🏥 Health Checks

### Application Health Checks

#### Health Check Endpoint
```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { checkDatabaseHealth, checkExternalServices, checkSystemResources } from '@/lib/monitoring'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const startTime = Date.now()
    
    // Parallel health checks uitvoeren
    const [dbHealth, servicesHealth, systemHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkExternalServices(),
      checkSystemResources()
    ])
    
    const responseTime = Date.now() - startTime
    const overallHealth = dbHealth && servicesHealth && systemHealth
    
    // Health check response
    res.status(overallHealth ? 200 : 503).json({
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbHealth ? 'healthy' : 'unhealthy',
          responseTime: dbHealth?.responseTime || 'N/A'
        },
        services: {
          status: servicesHealth ? 'healthy' : 'unhealthy',
          responseTime: servicesHealth?.responseTime || 'N/A'
        },
        system: {
          status: systemHealth ? 'healthy' : 'unhealthy',
          responseTime: systemHealth?.responseTime || 'N/A'
        }
      },
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
```

#### Database Health Check
```typescript
// lib/monitoring/database-health.ts
import { createClient } from '@supabase/supabase-js'

export async function checkDatabaseHealth() {
  const startTime = Date.now()
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Test database connectivity
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'health_check')
      .limit(1)
    
    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }
    
    const responseTime = Date.now() - startTime
    
    return {
      status: true,
      responseTime: `${responseTime}ms`,
      details: {
        connection: 'successful',
        queryTime: responseTime,
        dataReturned: !!data
      }
    }
  } catch (error) {
    return {
      status: false,
      responseTime: `${Date.now() - startTime}ms`,
      error: error.message
    }
  }
}
```

#### External Services Health Check
```typescript
// lib/monitoring/services-health.ts
export async function checkExternalServices() {
  const startTime = Date.now()
  const services = [
    { name: 'email', url: process.env.EMAIL_SERVICE_URL },
    { name: 'sms', url: process.env.SMS_SERVICE_URL },
    { name: 'payment', url: process.env.PAYMENT_SERVICE_URL }
  ]
  
  const results = await Promise.allSettled(
    services.map(async (service) => {
      if (!service.url) return { name: service.name, status: 'not_configured' }
      
      try {
        const response = await fetch(service.url, { 
          method: 'HEAD',
          timeout: 5000 
        })
        
        return {
          name: service.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: response.headers.get('x-response-time') || 'N/A'
        }
      } catch (error) {
        return {
          name: service.name,
          status: 'error',
          error: error.message
        }
      }
    })
  )
  
  const responseTime = Date.now() - startTime
  const allHealthy = results.every(result => 
    result.status === 'fulfilled' && 
    (result.value.status === 'healthy' || result.value.status === 'not_configured')
  )
  
  return {
    status: allHealthy,
    responseTime: `${responseTime}ms`,
    services: results.map(result => 
      result.status === 'fulfilled' ? result.value : { name: 'unknown', status: 'error' }
    )
  }
}
```

#### System Resources Health Check
```typescript
// lib/monitoring/system-health.ts
export async function checkSystemResources() {
  const startTime = Date.now()
  
  try {
    // Memory usage check
    const memoryUsage = process.memoryUsage()
    const memoryHealthy = memoryUsage.heapUsed < 500 * 1024 * 1024 // 500MB limit
    
    // CPU usage check (simplified)
    const cpuUsage = process.cpuUsage()
    const cpuHealthy = true // Simplified check
    
    // Process uptime check
    const uptime = process.uptime()
    const uptimeHealthy = uptime > 0
    
    const responseTime = Date.now() - startTime
    const overallHealthy = memoryHealthy && cpuHealthy && uptimeHealthy
    
    return {
      status: overallHealthy,
      responseTime: `${responseTime}ms`,
      details: {
        memory: {
          status: memoryHealthy ? 'healthy' : 'warning',
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        },
        cpu: {
          status: 'healthy',
          user: `${Math.round(cpuUsage.user / 1000)}ms`,
          system: `${Math.round(cpuUsage.system / 1000)}ms`
        },
        uptime: {
          status: uptimeHealthy ? 'healthy' : 'error',
          seconds: Math.round(uptime)
        }
      }
    }
  } catch (error) {
    return {
      status: false,
      responseTime: `${Date.now() - startTime}ms`,
      error: error.message
    }
  }
}
```

### Health Check Scripts

#### Automated Health Check
```bash
#!/bin/bash
# scripts/health-check.sh

HEALTH_URL="https://your-domain.com/api/health"
MAX_RESPONSE_TIME=5000  # 5 seconds
MAX_RETRIES=3

echo "🔍 Starting health check..."

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i/$MAX_RETRIES..."
  
  # Health check uitvoeren
  response=$(curl -s -w "\n%{http_code}\n%{time_total}" "$HEALTH_URL")
  
  # Response parsen
  http_code=$(echo "$response" | tail -n 2 | head -n 1)
  response_time=$(echo "$response" | tail -n 1 | awk '{print $1 * 1000}')
  body=$(echo "$response" | head -n -2)
  
  echo "HTTP Code: $http_code"
  echo "Response Time: ${response_time}ms"
  
  # Health status controleren
  if [ "$http_code" -eq 200 ]; then
    status=$(echo "$body" | jq -r '.status')
    
    if [ "$status" = "healthy" ]; then
      echo "✅ Application is healthy"
      
      # Response time check
      if (( $(echo "$response_time < $MAX_RESPONSE_TIME" | bc -l) )); then
        echo "✅ Response time is acceptable"
        exit 0
      else
        echo "⚠️  Response time is slow: ${response_time}ms"
        exit 1
      fi
    else
      echo "❌ Application is unhealthy: $status"
      exit 1
    fi
  else
    echo "❌ Health check failed with HTTP $http_code"
    
    if [ $i -eq $MAX_RETRIES ]; then
      echo "❌ Max retries reached"
      exit 1
    fi
    
    echo "Retrying in 5 seconds..."
    sleep 5
  fi
done
```

#### Health Check Cron Job
```bash
# /etc/cron.d/health-check
# Check every 5 minutes
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1

# Daily health report
0 9 * * * /usr/local/bin/health-report.sh >> /var/log/health-report.log 2>&1
```

## 📈 Performance Monitoring

### Performance Metrics

#### Core Web Vitals
```typescript
// lib/monitoring/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals() {
  // Cumulative Layout Shift (CLS)
  getCLS((metric) => {
    console.log('CLS:', metric.value)
    sendMetric('CLS', metric.value)
  })
  
  // First Input Delay (FID)
  getFID((metric) => {
    console.log('FID:', metric.value)
    sendMetric('FID', metric.value)
  })
  
  // First Contentful Paint (FCP)
  getFCP((metric) => {
    console.log('FCP:', metric.value)
    sendMetric('FCP', metric.value)
  })
  
  // Largest Contentful Paint (LCP)
  getLCP((metric) => {
    console.log('LCP:', metric.value)
    sendMetric('LCP', metric.value)
  })
  
  // Time to First Byte (TTFB)
  getTTFB((metric) => {
    console.log('TTFB:', metric.value)
    sendMetric('TTFB', metric.value)
  })
}

function sendMetric(name: string, value: number) {
  // Send to monitoring service
  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, value, timestamp: Date.now() })
  })
}
```

#### Custom Performance Metrics
```typescript
// lib/monitoring/custom-metrics.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  
  // API response time meten
  measureAPIResponse(apiName: string, startTime: number) {
    const duration = Date.now() - startTime
    this.recordMetric(`api.${apiName}.response_time`, duration)
  }
  
  // Database query time meten
  measureDatabaseQuery(queryName: string, startTime: number) {
    const duration = Date.now() - startTime
    this.recordMetric(`db.${queryName}.query_time`, duration)
  }
  
  // Component render time meten
  measureComponentRender(componentName: string, startTime: number) {
    const duration = Date.now() - startTime
    this.recordMetric(`component.${componentName}.render_time`, duration)
  }
  
  // Memory usage meten
  measureMemoryUsage() {
    const usage = process.memoryUsage()
    this.recordMetric('memory.heap_used', usage.heapUsed)
    this.recordMetric('memory.heap_total', usage.heapTotal)
  }
  
  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift()
    }
  }
  
  // Get metric statistics
  getMetricStats(name: string) {
    const values = this.metrics.get(name) || []
    
    if (values.length === 0) return null
    
    const sorted = values.sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }
  
  // Export metrics
  exportMetrics() {
    const result: Record<string, any> = {}
    
    for (const [name, values] of this.metrics.entries()) {
      result[name] = this.getMetricStats(name)
    }
    
    return result
  }
}

export const performanceMonitor = new PerformanceMonitor()
```

### Performance Budgets
```typescript
// lib/monitoring/performance-budgets.ts
export const performanceBudgets = {
  // Core Web Vitals
  CLS: { target: 0.1, max: 0.25 },
  FID: { target: 100, max: 300 },
  FCP: { target: 1800, max: 3000 },
  LCP: { target: 2500, max: 4000 },
  TTFB: { target: 800, max: 1800 },
  
  // Custom metrics
  'api.response_time': { target: 200, max: 500 },
  'db.query_time': { target: 50, max: 100 },
  'component.render_time': { target: 16, max: 33 }, // 60fps target
  
  // Bundle sizes
  'bundle.total': { target: 500 * 1024, max: 1000 * 1024 }, // 500KB target
  'bundle.js': { target: 300 * 1024, max: 600 * 1024 },
  'bundle.css': { target: 50 * 1024, max: 100 * 1024 }
}

export function checkPerformanceBudget(metricName: string, value: number) {
  const budget = performanceBudgets[metricName]
  
  if (!budget) return { status: 'unknown', budget: null }
  
  if (value <= budget.target) {
    return { status: 'excellent', budget }
  } else if (value <= budget.max) {
    return { status: 'acceptable', budget }
  } else {
    return { status: 'poor', budget }
  }
}
```

## 🚨 Error Monitoring

### Error Tracking

#### Error Boundary
```typescript
// components/ErrorBoundary.tsx
import React from 'react'
import { captureException } from '@/lib/monitoring/error-tracking'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error to monitoring service
    captureException(error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
```

#### Error Tracking Service
```typescript
// lib/monitoring/error-tracking.ts
interface ErrorContext {
  errorInfo?: React.ErrorInfo
  componentStack?: string
  userAgent?: string
  url?: string
  userId?: string
  sessionId?: string
}

export function captureException(error: Error, context: ErrorContext = {}) {
  const errorData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', errorData)
  }
  
  // Send to error tracking service
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  }).catch(() => {
    // Fallback: store locally if API fails
    storeErrorLocally(errorData)
  })
}

function storeErrorLocally(errorData: any) {
  try {
    const errors = JSON.parse(localStorage.getItem('errorLog') || '[]')
    errors.push(errorData)
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift()
    }
    
    localStorage.setItem('errorLog', JSON.stringify(errors))
  } catch {
    // Ignore storage errors
  }
}
```

### Error Analytics
```typescript
// lib/monitoring/error-analytics.ts
export interface ErrorStats {
  totalErrors: number
  errorRate: number
  topErrors: Array<{
    name: string
    message: string
    count: number
    percentage: number
  }>
  errorsByType: Record<string, number>
  errorsByPage: Record<string, number>
  errorsByUser: Record<string, number>
}

export async function getErrorStats(
  startDate: Date,
  endDate: Date
): Promise<ErrorStats> {
  const response = await fetch(`/api/errors/stats?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch error stats')
  }
  
  return response.json()
}

export function calculateErrorRate(errorCount: number, requestCount: number): number {
  if (requestCount === 0) return 0
  return (errorCount / requestCount) * 100
}
```

## 📊 Business Metrics

### User Metrics
```typescript
// lib/monitoring/user-metrics.ts
export interface UserMetrics {
  // User engagement
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  
  // Feature usage
  featureUsage: Record<string, number>
  
  // User behavior
  sessionDuration: number
  pageViews: number
  bounceRate: number
  
  // Conversion metrics
  signupRate: number
  activationRate: number
  retentionRate: number
}

export class UserMetricsTracker {
  private sessionStart: number = Date.now()
  private pageViews: number = 0
  
  constructor() {
    this.trackPageView()
    this.trackSessionDuration()
  }
  
  trackPageView() {
    this.pageViews++
    
    // Send page view event
    this.sendEvent('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now()
    })
  }
  
  trackFeatureUsage(featureName: string) {
    this.sendEvent('feature_usage', {
      feature: featureName,
      timestamp: Date.now()
    })
  }
  
  trackUserAction(action: string, details: any = {}) {
    this.sendEvent('user_action', {
      action,
      details,
      timestamp: Date.now()
    })
  }
  
  private trackSessionDuration() {
    setInterval(() => {
      const duration = Date.now() - this.sessionStart
      
      this.sendEvent('session_duration', {
        duration,
        timestamp: Date.now()
      })
    }, 60000) // Every minute
  }
  
  private sendEvent(eventType: string, data: any) {
    // Send to analytics service
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        data,
        userId: this.getUserId(),
        sessionId: this.getSessionId()
      })
    }).catch(() => {
      // Ignore analytics errors
    })
  }
  
  private getUserId(): string | null {
    // Get user ID from auth context or localStorage
    return localStorage.getItem('userId')
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId')
    
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('sessionId', sessionId)
    }
    
    return sessionId
  }
}

export const userMetricsTracker = new UserMetricsTracker()
```

### Business KPIs
```typescript
// lib/monitoring/business-kpis.ts
export interface BusinessKPIs {
  // Financial metrics
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  
  // Operational metrics
  systemUptime: number
  responseTime: number
  errorRate: number
  
  // User satisfaction
  userSatisfaction: number
  supportTickets: number
  churnRate: number
}

export async function getBusinessKPIs(): Promise<BusinessKPIs> {
  const response = await fetch('/api/kpis')
  
  if (!response.ok) {
    throw new Error('Failed to fetch business KPIs')
  }
  
  return response.json()
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}
```

## 🔔 Alerting & Notifications

### Alert Configuration
```typescript
// lib/monitoring/alerts.ts
export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  threshold: number
  duration: number // seconds
  severity: 'low' | 'medium' | 'high' | 'critical'
  channels: string[] // email, slack, sms
  enabled: boolean
}

export class AlertManager {
  private rules: AlertRule[] = []
  private alertHistory: Map<string, any[]> = new Map()
  
  addRule(rule: AlertRule) {
    this.rules.push(rule)
  }
  
  removeRule(ruleId: string) {
    this.rules = this.rules.filter(rule => rule.id !== ruleId)
  }
  
  checkAlerts(metrics: Record<string, number>) {
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      
      const value = metrics[rule.metric]
      if (value === undefined) continue
      
      const shouldAlert = this.evaluateCondition(value, rule.condition, rule.threshold)
      
      if (shouldAlert) {
        this.triggerAlert(rule, value)
      }
    }
  }
  
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold
      case 'lt': return value < threshold
      case 'eq': return value === threshold
      case 'gte': return value >= threshold
      case 'lte': return value <= threshold
      default: return false
    }
  }
  
  private triggerAlert(rule: AlertRule, value: number) {
    const alert = {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      message: `Alert: ${rule.metric} is ${rule.condition} ${rule.threshold} (current: ${value})`
    }
    
    // Store alert
    if (!this.alertHistory.has(rule.id)) {
      this.alertHistory.set(rule.id, [])
    }
    
    const history = this.alertHistory.get(rule.id)!
    history.push(alert)
    
    // Keep only last 100 alerts
    if (history.length > 100) {
      history.shift()
    }
    
    // Send notifications
    this.sendNotifications(rule, alert)
  }
  
  private async sendNotifications(rule: AlertRule, alert: any) {
    for (const channel of rule.channels) {
      try {
        await this.sendNotification(channel, rule, alert)
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error)
      }
    }
  }
  
  private async sendNotification(channel: string, rule: AlertRule, alert: any) {
    switch (channel) {
      case 'email':
        await this.sendEmailAlert(rule, alert)
        break
      case 'slack':
        await this.sendSlackAlert(rule, alert)
        break
      case 'sms':
        await this.sendSMSAlert(rule, alert)
        break
      default:
        console.warn(`Unknown notification channel: ${channel}`)
    }
  }
  
  private async sendEmailAlert(rule: AlertRule, alert: any) {
    // Implement email sending
    console.log('Sending email alert:', alert)
  }
  
  private async sendSlackAlert(rule: AlertRule, alert: any) {
    // Implement Slack notification
    console.log('Sending Slack alert:', alert)
  }
  
  private async sendSMSAlert(rule: AlertRule, alert: any) {
    // Implement SMS sending
    console.log('Sending SMS alert:', alert)
  }
  
  getAlertHistory(ruleId?: string) {
    if (ruleId) {
      return this.alertHistory.get(ruleId) || []
    }
    
    const allAlerts: any[] = []
    for (const alerts of this.alertHistory.values()) {
      allAlerts.push(...alerts)
    }
    
    return allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}

export const alertManager = new AlertManager()
```

### Default Alert Rules
```typescript
// lib/monitoring/default-alerts.ts
import { alertManager } from './alerts'

export function setupDefaultAlerts() {
  // High error rate
  alertManager.addRule({
    id: 'high-error-rate',
    name: 'High Error Rate',
    metric: 'error_rate',
    condition: 'gt',
    threshold: 5, // 5%
    duration: 300, // 5 minutes
    severity: 'high',
    channels: ['email', 'slack'],
    enabled: true
  })
  
  // Slow response time
  alertManager.addRule({
    id: 'slow-response-time',
    name: 'Slow Response Time',
    metric: 'api.response_time',
    condition: 'gt',
    threshold: 1000, // 1 second
    duration: 60, // 1 minute
    severity: 'medium',
    channels: ['slack'],
    enabled: true
  })
  
  // High memory usage
  alertManager.addRule({
    id: 'high-memory-usage',
    name: 'High Memory Usage',
    metric: 'memory.heap_used',
    condition: 'gt',
    threshold: 400 * 1024 * 1024, // 400MB
    duration: 300, // 5 minutes
    severity: 'medium',
    channels: ['slack'],
    enabled: true
  })
  
  // System down
  alertManager.addRule({
    id: 'system-down',
    name: 'System Down',
    metric: 'health_status',
    condition: 'eq',
    threshold: 0, // 0 = down
    duration: 30, // 30 seconds
    severity: 'critical',
    channels: ['email', 'slack', 'sms'],
    enabled: true
  })
}

// Setup alerts when module is imported
setupDefaultAlerts()
```

## 📊 Monitoring Dashboard

### Dashboard Components
```typescript
// components/monitoring/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { HealthStatus } from './HealthStatus'
import { PerformanceMetrics } from './PerformanceMetrics'
import { ErrorMetrics } from './ErrorMetrics'
import { BusinessMetrics } from './BusinessMetrics'

export function MonitoringDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      // Trigger refresh of all components
      window.dispatchEvent(new CustomEvent('refresh-metrics'))
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [refreshInterval, autoRefresh])
  
  return (
    <div className="monitoring-dashboard">
      <div className="dashboard-header">
        <h1>System Monitoring Dashboard</h1>
        
        <div className="dashboard-controls">
          <label>
            Auto Refresh:
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          </label>
          
          <label>
            Refresh Interval:
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </label>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <HealthStatus />
        <PerformanceMetrics />
        <ErrorMetrics />
        <BusinessMetrics />
      </div>
    </div>
  )
}
```

### Health Status Component
```typescript
// components/monitoring/HealthStatus.tsx
import React, { useState, useEffect } from 'react'

interface HealthData {
  status: string
  timestamp: string
  checks: Record<string, any>
}

export function HealthStatus() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchHealth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      const data = await response.json()
      setHealth(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchHealth()
    
    // Listen for refresh events
    const handleRefresh = () => fetchHealth()
    window.addEventListener('refresh-metrics', handleRefresh)
    
    return () => window.removeEventListener('refresh-metrics', handleRefresh)
  }, [])
  
  if (loading) {
    return <div className="health-status loading">Loading health status...</div>
  }
  
  if (error) {
    return <div className="health-status error">Error: {error}</div>
  }
  
  if (!health) {
    return <div className="health-status unknown">No health data available</div>
  }
  
  const isHealthy = health.status === 'healthy'
  
  return (
    <div className={`health-status ${isHealthy ? 'healthy' : 'unhealthy'}`}>
      <h3>System Health</h3>
      
      <div className="health-overview">
        <div className={`status-indicator ${health.status}`}>
          {health.status.toUpperCase()}
        </div>
        
        <div className="last-check">
          Last check: {new Date(health.timestamp).toLocaleString()}
        </div>
      </div>
      
      <div className="health-checks">
        {Object.entries(health.checks).map(([name, check]) => (
          <div key={name} className={`health-check ${check.status}`}>
            <span className="check-name">{name}</span>
            <span className="check-status">{check.status}</span>
            {check.responseTime && (
              <span className="check-time">{check.responseTime}</span>
            )}
          </div>
        ))}
      </div>
      
      <button onClick={fetchHealth} className="refresh-button">
        Refresh
      </button>
    </div>
  )
}
```

## 📋 Monitoring Checklist

### Setup & Configuration
- [ ] **Health check endpoints** geïmplementeerd
- [ ] **Performance monitoring** geconfigureerd
- [ ] **Error tracking** geïmplementeerd
- [ ] **Alert rules** gedefinieerd
- [ ] **Notification channels** geconfigureerd

### Monitoring Coverage
- [ ] **Application layer** gemonitord
- [ ] **Database layer** gemonitord
- [ ] **Infrastructure layer** gemonitord
- [ ] **Business metrics** gemonitord
- [ ] **User experience** gemonitord

### Alerting & Response
- [ ] **Alert thresholds** gedefinieerd
- [ ] **Escalation procedures** gedefinieerd
- [ ] **Response team** samengesteld
- [ ] **Communication plan** gedefinieerd
- [ ] **Incident response** procedures

### Maintenance & Optimization
- [ ] **Monitoring dashboards** actueel
- [ ] **Alert rules** geoptimaliseerd
- [ ] **Performance baselines** vastgesteld
- [ ] **Capacity planning** uitgevoerd
- [ ] **Monitoring costs** geoptimaliseerd

## 📚 Resources

### Monitoring Tools
- [Vercel Analytics](https://vercel.com/analytics)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)

### Best Practices
- [Monitoring Best Practices](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Alert Design](https://www.pagerduty.com/resources/learn/on-call-best-practices/)
- [Performance Monitoring](https://web.dev/performance-monitoring/)
- [Error Tracking](https://sentry.io/for/javascript/)

### Documentation
- [Next.js Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)
- [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring.html)
- [Vercel Monitoring](https://vercel.com/docs/monitoring)
- [Supabase Monitoring](https://supabase.com/docs/guides/monitoring)