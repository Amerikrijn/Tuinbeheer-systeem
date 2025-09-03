import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Database Health Check Endpoint
 * 
 * Verifies database connection health and performance metrics
 * Used for monitoring connection pooling and Supabase pooler status
 */
export async function GET() {
  try {
    const startTime = performance.now()
    
    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1)
    
    const responseTime = performance.now() - startTime
    
    if (error) {
      throw error
    }
    
    // Additional connection info
    const connectionInfo = {
      environment: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      timestamp: new Date().toISOString(),
      responseTime: Math.round(responseTime),
      connectionType: 'supabase-pooled'
    }
    
    return NextResponse.json({
      ok: true,
      message: 'Database connection healthy',
      ...connectionInfo
    })
    
  } catch (error: any) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 })
  }
}

/**
 * POST endpoint for detailed connection testing
 */
export async function POST() {
  try {
    const startTime = performance.now()
    
    // Test multiple operations to verify connection stability
    const tests = await Promise.allSettled([
      supabase.from('gardens').select('count').limit(1),
      supabase.from('users').select('count').limit(1),
      supabase.rpc('version')
    ])
    
    const responseTime = performance.now() - startTime
    
    const results = tests.map((test, index) => ({
      test: ['gardens', 'users', 'version'][index],
      success: test.status === 'fulfilled',
      error: test.status === 'rejected' ? test.reason?.message : null
    }))
    
    const allPassed = results.every(r => r.success)
    
    return NextResponse.json({
      ok: allPassed,
      message: allPassed ? 'All connection tests passed' : 'Some connection tests failed',
      responseTime: Math.round(responseTime),
      tests: results,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
    
  } catch (error: any) {
    console.error('Detailed connection test failed:', error)
    
    return NextResponse.json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}