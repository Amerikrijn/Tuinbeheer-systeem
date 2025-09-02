import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  const startTime = Date.now()
  let dbError: string | null = null
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown' as 'unknown' | 'healthy' | 'unhealthy',
      auth: 'unknown' as 'unknown' | 'healthy' | 'unhealthy',
      environment: 'unknown' as 'unknown' | 'healthy' | 'unhealthy'
    },
    responseTime: 0,
    dbError: null as string | null,
  }

  try {
    // PERFORMANCE OPTIMIZATION: Use getSafeSupabaseConfig for build-time safety
    const { getSafeSupabaseConfig } = await import('@/lib/config')
    const config = getSafeSupabaseConfig()
    
    // Check environment variables safely
    const hasSupabaseUrl = !!config.url
    const hasSupabaseKey = !!config.anonKey
    const hasServiceKey = !!process.env['SUPABASE_SERVICE_ROLE_KEY']
    
    healthCheck.checks.environment = hasSupabaseUrl && hasSupabaseKey && hasServiceKey ? 'healthy' : 'unhealthy'

    if (!hasSupabaseUrl || !hasSupabaseKey || !hasServiceKey) {
      healthCheck.status = 'unhealthy'
      healthCheck.checks.database = 'unhealthy'
      healthCheck.checks.auth = 'unhealthy'
      const responseTime = Date.now() - startTime
      healthCheck.responseTime = responseTime
      return NextResponse.json(healthCheck, { status: 500 })
    }

    // Test database connection using admin client
    try {
      const supabase = supabaseAdmin
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        dbError = (error as any)?.message || 'Unknown database error'
        healthCheck.checks.database = 'unhealthy'
        healthCheck.status = 'unhealthy'
      } else {
        healthCheck.checks.database = 'healthy'
      }

      healthCheck.checks.auth = 'healthy'
    } catch (dbException) {
      dbError = dbException instanceof Error ? dbException.message : 'Database exception'
      healthCheck.checks.database = 'unhealthy'
      healthCheck.status = 'unhealthy'
    }

  } catch {
    healthCheck.status = 'unhealthy'
  }

  const responseTime = Date.now() - startTime
  healthCheck.responseTime = responseTime
  healthCheck.dbError = dbError

  const statusCode = healthCheck.status === 'healthy' ? 200 : 500
  return NextResponse.json(healthCheck, { status: statusCode })
}

// PERFORMANCE OPTIMIZATION: Removed unnecessary POST endpoint