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
      connectionType: 'supabase-pooled',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      isPooledConnection: process.env.DATABASE_URL?.includes('pooler.supabase.com') || false,
      poolerPort: process.env.DATABASE_URL?.includes(':6543') || false,
      hasPgbouncer: process.env.DATABASE_URL?.includes('pgbouncer=true') || false,
    }
    
    return NextResponse.json({ 
      ok: true, 
      ...connectionInfo,
      message: 'Database connection healthy'
    })
  } catch (error: any) {
    const responseTime = performance.now() - startTime
    
    return NextResponse.json({ 
      ok: false, 
      error: error.message,
      errorCode: error.code || 'UNKNOWN_ERROR',
      environment: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      timestamp: new Date().toISOString(),
      responseTime: Math.round(responseTime),
      connectionType: 'failed',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      isPooledConnection: process.env.DATABASE_URL?.includes('pooler.supabase.com') || false,
      poolerPort: process.env.DATABASE_URL?.includes(':6543') || false,
      hasPgbouncer: process.env.DATABASE_URL?.includes('pgbouncer=true') || false,
      message: 'Database connection failed'
    }, { status: 500 })
  }
}

/**
 * POST endpoint for detailed connection testing
 * Allows for more comprehensive connection diagnostics
 */
export async function POST() {
  try {
    const startTime = performance.now()
    const tests = []
    
    // Test 1: Basic connection
    const basicTest = await supabase
      .from('gardens')
      .select('count')
      .limit(1)
    
    tests.push({
      name: 'basic_connection',
      success: !basicTest.error,
      error: basicTest.error?.message || null,
      duration: performance.now() - startTime
    })
    
    // Test 2: Complex query (if basic test passed)
    if (!basicTest.error) {
      const complexStartTime = performance.now()
      const complexTest = await supabase
        .from('plant_beds')
        .select('id, name, garden_id')
        .limit(5)
      
      tests.push({
        name: 'complex_query',
        success: !complexTest.error,
        error: complexTest.error?.message || null,
        duration: performance.now() - complexStartTime
      })
    }
    
    // Test 3: Connection pooling test (multiple rapid queries)
    if (!basicTest.error) {
      const poolStartTime = performance.now()
      const poolTests = await Promise.all([
        supabase.from('gardens').select('count').limit(1),
        supabase.from('plant_beds').select('count').limit(1),
        supabase.from('plants').select('count').limit(1)
      ])
      
      const poolSuccess = poolTests.every(test => !test.error)
      tests.push({
        name: 'connection_pooling',
        success: poolSuccess,
        error: poolTests.find(test => test.error)?.error?.message || null,
        duration: performance.now() - poolStartTime,
        concurrentQueries: poolTests.length
      })
    }
    
    const totalTime = performance.now() - startTime
    const allTestsPassed = tests.every(test => test.success)
    
    return NextResponse.json({
      ok: allTestsPassed,
      tests,
      summary: {
        totalTests: tests.length,
        passedTests: tests.filter(test => test.success).length,
        failedTests: tests.filter(test => !test.success).length,
        totalDuration: Math.round(totalTime),
        averageTestDuration: Math.round(totalTime / tests.length)
      },
      connectionInfo: {
        environment: process.env.NODE_ENV || 'development',
        vercelEnv: process.env.VERCEL_ENV || 'local',
        timestamp: new Date().toISOString(),
        connectionType: 'supabase-pooled',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        isPooledConnection: process.env.DATABASE_URL?.includes('pooler.supabase.com') || false,
        poolerPort: process.env.DATABASE_URL?.includes(':6543') || false,
        hasPgbouncer: process.env.DATABASE_URL?.includes('pgbouncer=true') || false,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      errorCode: error.code || 'UNKNOWN_ERROR',
      environment: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      timestamp: new Date().toISOString(),
      message: 'Comprehensive connection test failed'
    }, { status: 500 })
  }
}
