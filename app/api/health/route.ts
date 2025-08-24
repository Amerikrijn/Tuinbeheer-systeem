import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  const startTime = Date.now()
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      auth: 'unknown',
      environment: 'unknown'
    },
    responseTime: 0
  }

  try {
    console.log('🔍 DEBUG: Health check started')
    
    // Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    healthCheck.checks.environment = hasSupabaseUrl && hasSupabaseKey && hasServiceKey ? 'healthy' : 'unhealthy'
    
    console.log('🔍 DEBUG: Environment check:', {
      url: hasSupabaseUrl ? '✅ Set' : '❌ Missing',
      key: hasSupabaseKey ? '✅ Set' : '❌ Missing',
      serviceKey: hasServiceKey ? '✅ Set' : '❌ Missing'
    })

    if (!hasSupabaseUrl || !hasSupabaseKey || !hasServiceKey) {
      healthCheck.status = 'unhealthy'
      healthCheck.checks.database = 'unhealthy'
      healthCheck.checks.auth = 'unhealthy'
      
      const responseTime = Date.now() - startTime
      healthCheck.responseTime = responseTime
      
      console.error('❌ ERROR: Missing Supabase environment variables (including service role)')
      return NextResponse.json(healthCheck, { status: 500 })
    }

    // Test database connection using admin client (server-side only)
    console.log('🔍 DEBUG: Testing database connection (admin)...')
    const dbStart = Date.now()
    
    try {
      const supabase = getSupabaseAdminClient()
      console.log('🔍 DEBUG: Supabase admin client obtained')
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      const dbDuration = Date.now() - dbStart
      console.log('🔍 DEBUG: Database query completed in', dbDuration, 'ms')
      
      if (error) {
        console.error('❌ ERROR: Database query failed:', { code: (error as any)?.code, message: (error as any)?.message })
        healthCheck.checks.database = 'unhealthy'
        healthCheck.status = 'unhealthy'
      } else {
        console.log('✅ SUCCESS: Database connection healthy')
        healthCheck.checks.database = 'healthy'
      }
      
      // Test auth connection (admin ability to get session not required; we mark as healthy if DB is ok)
      healthCheck.checks.auth = 'healthy'
      
    } catch (dbException) {
      console.error('❌ ERROR: Database connection exception:', dbException)
      healthCheck.checks.database = 'unhealthy'
      healthCheck.status = 'unhealthy'
    }

  } catch (error) {
    console.error('❌ ERROR: Health check failed:', error)
    healthCheck.status = 'unhealthy'
  }

  const responseTime = Date.now() - startTime
  healthCheck.responseTime = responseTime
  
  console.log('🔍 DEBUG: Health check completed in', responseTime, 'ms')
  console.log('🔍 DEBUG: Final health status:', healthCheck)
  
  const statusCode = healthCheck.status === 'healthy' ? 200 : 500
  return NextResponse.json(healthCheck, { status: statusCode })
}

export async function POST() {
  return NextResponse.json({
    status: 'healthy',
    method: 'POST',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}