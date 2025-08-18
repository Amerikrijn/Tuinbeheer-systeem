import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const startTime = Date.now()
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
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

    if (!hasSupabaseUrl || !hasSupabaseKey) {
      healthCheck.status = 'unhealthy'
      healthCheck.checks.database = 'unhealthy'
      healthCheck.checks.auth = 'unhealthy'
      
      const responseTime = Date.now() - startTime
      healthCheck.responseTime = responseTime
      
      console.error('❌ ERROR: Missing Supabase environment variables')
      return NextResponse.json(healthCheck, { status: 500 })
    }

    // Test database connection
    console.log('🔍 DEBUG: Testing database connection...')
    const dbStart = Date.now()
    
    try {
      const supabase = getSupabaseClient()
      console.log('🔍 DEBUG: Supabase client obtained')
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .timeout(10000) // 10 second timeout
      
      const dbDuration = Date.now() - dbStart
      console.log('🔍 DEBUG: Database query completed in', dbDuration, 'ms')
      
      if (error) {
        console.error('❌ ERROR: Database query failed:', error)
        healthCheck.checks.database = 'unhealthy'
        healthCheck.status = 'unhealthy'
      } else {
        console.log('✅ SUCCESS: Database connection healthy')
        healthCheck.checks.database = 'healthy'
      }
      
      // Test auth connection
      console.log('🔍 DEBUG: Testing auth connection...')
      const authStart = Date.now()
      
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        const authDuration = Date.now() - authStart
        console.log('🔍 DEBUG: Auth check completed in', authDuration, 'ms')
        
        if (authError) {
          console.error('❌ ERROR: Auth check failed:', authError)
          healthCheck.checks.auth = 'unhealthy'
          healthCheck.status = 'unhealthy'
        } else {
          console.log('✅ SUCCESS: Auth connection healthy')
          healthCheck.checks.auth = 'healthy'
        }
      } catch (authException) {
        console.error('❌ ERROR: Auth check exception:', authException)
        healthCheck.checks.auth = 'unhealthy'
        healthCheck.status = 'unhealthy'
      }
      
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