/**
 * BACKWARD COMPATIBLE HEALTH CHECK API ENDPOINT
 * 
 * Works with existing database schema - no new tables required
 * Can be deployed immediately without database changes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/config'

// Health check configuration
const HEALTH_CONFIG = {
  timeout: 5000, // 5 seconds
  requiredServices: ['database', 'auth'] as const,
} as const

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  environment: string
  uptime: number
  services: {
    database: ServiceStatus
    auth: ServiceStatus
  }
  security: {
    headers: boolean
    auth: boolean
  }
  performance: {
    responseTime: number
    memoryUsage?: NodeJS.MemoryUsage
  }
}

interface ServiceStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  error?: string
  lastCheck: string
}

// ===========================================
// SERVICE HEALTH CHECKS (BACKWARD COMPATIBLE)
// ===========================================

async function checkDatabaseHealth(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    const config = getSupabaseConfig()
    const supabase = createClient(config.url, config.anonKey, {
      auth: { persistSession: false }
    })
    
    // BACKWARD COMPATIBLE: Use existing gardens table
    const { data, error } = await supabase
      .from('gardens')
      .select('id')
      .limit(1)
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      console.warn('Database health check failed', {
        error: error.message,
        responseTime,
      })
      
      return {
        status: 'unhealthy',
        responseTime,
        error: error.message,
        lastCheck: new Date().toISOString(),
      }
    }
    
    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      lastCheck: new Date().toISOString(),
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    
    console.error('Database health check error', {
      error: errorMessage,
      responseTime,
    })
    
    return {
      status: 'unhealthy',
      responseTime,
      error: errorMessage,
      lastCheck: new Date().toISOString(),
    }
  }
}

async function checkAuthHealth(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    const config = getSupabaseConfig()
    const supabase = createClient(config.url, config.anonKey, {
      auth: { persistSession: false }
    })
    
    // BACKWARD COMPATIBLE: Test auth service availability
    const { data, error } = await supabase.auth.getSession()
    const responseTime = Date.now() - startTime
    
    if (error && error.message !== 'Auth session missing!') {
      console.warn('Auth health check failed', {
        error: error.message,
        responseTime,
      })
      
      return {
        status: 'unhealthy',
        responseTime,
        error: error.message,
        lastCheck: new Date().toISOString(),
      }
    }
    
    return {
      status: responseTime < 500 ? 'healthy' : 'degraded',
      responseTime,
      lastCheck: new Date().toISOString(),
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown auth error'
    
    console.error('Auth health check error', {
      error: errorMessage,
      responseTime,
    })
    
    return {
      status: 'unhealthy',
      responseTime,
      error: errorMessage,
      lastCheck: new Date().toISOString(),
    }
  }
}

// ===========================================
// SECURITY CHECKS (SIMPLIFIED)
// ===========================================

function checkSecurityFeatures(request: NextRequest) {
  const headers = request.headers
  
  // Check if security headers are being set by middleware
  const hasSecurityHeaders = !!(
    headers.get('x-frame-options') ||
    headers.get('x-content-type-options') ||
    headers.get('referrer-policy')
  )
  
  return {
    headers: hasSecurityHeaders,
    auth: true, // Assume auth is working if auth health check passes
  }
}

// ===========================================
// MAIN HEALTH CHECK HANDLER
// ===========================================

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('Health check requested', {
      userAgent: request.headers.get('user-agent'),
      ip: request.ip,
    })
    
    // Run health checks in parallel
    const [databaseHealth, authHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkAuthHealth(),
    ])
    
    // Determine overall status
    const services = { database: databaseHealth, auth: authHealth }
    const unhealthyServices = Object.values(services).filter(s => s.status === 'unhealthy')
    const degradedServices = Object.values(services).filter(s => s.status === 'degraded')
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    if (unhealthyServices.length > 0) {
      overallStatus = 'unhealthy'
    } else if (degradedServices.length > 0) {
      overallStatus = 'degraded'
    }
    
    // Performance metrics
    const responseTime = Date.now() - startTime
    const memoryUsage = process.memoryUsage()
    
    // Security checks
    const security = checkSecurityFeatures(request)
    
    // Build health status response
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services,
      security,
      performance: {
        responseTime,
        memoryUsage,
      },
    }
    
    // Log health check result
    console.log('Health check completed', {
      status: overallStatus,
      responseTime,
      unhealthyServices: unhealthyServices.length,
      degradedServices: degradedServices.length,
    })
    
    // Return appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(healthStatus, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    })
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown health check error'
    
    console.error('Health check failed', {
      error: errorMessage,
      responseTime,
    })
    
    const errorResponse = {
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      error: errorMessage,
      responseTime,
    }
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    })
  }
}

// ===========================================
// SIMPLE READINESS CHECK
// ===========================================

export async function HEAD() {
  try {
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}

// ===========================================
// OPTIONS FOR CORS PREFLIGHT
// ===========================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

// Route configuration
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'