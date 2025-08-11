import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAdminAvailable } from '@/lib/supabase'
import { validateSecurityConfiguration } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      vercel_env: process.env.VERCEL_ENV || 'not-vercel',
      checks: {
        environment_variables: {
          status: 'checking',
          details: {}
        },
        supabase_connection: {
          status: 'checking',
          details: {}
        },
        admin_client: {
          status: 'checking',
          details: {}
        }
      }
    }

    // 1. Check environment variables
    try {
      const validation = validateSecurityConfiguration()
      healthCheck.checks.environment_variables = {
        status: validation.valid ? 'healthy' : 'warning',
        details: {
          valid: validation.valid,
          errors: validation.errors,
          variables_checked: [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
          ]
        }
      }
    } catch (error) {
      healthCheck.checks.environment_variables = {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // 2. Check Supabase connection
    try {
      const { data, error } = await supabase
        .from('gardens')
        .select('count')
        .limit(1)

      healthCheck.checks.supabase_connection = {
        status: error ? 'error' : 'healthy',
        details: {
          connected: !error,
          error: error?.message,
          response_time: 'measured_in_real_implementation'
        }
      }
    } catch (error) {
      healthCheck.checks.supabase_connection = {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }
    }

    // 3. Check admin client availability
    try {
      const adminAvailable = isAdminAvailable()
      healthCheck.checks.admin_client = {
        status: adminAvailable ? 'healthy' : 'warning',
        details: {
          available: adminAvailable,
          message: adminAvailable 
            ? 'Admin operations available' 
            : 'Admin operations disabled - SUPABASE_SERVICE_ROLE_KEY not configured'
        }
      }
    } catch (error) {
      healthCheck.checks.admin_client = {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Admin client check failed'
        }
      }
    }

    // Determine overall health
    const hasErrors = Object.values(healthCheck.checks).some(check => check.status === 'error')
    const hasWarnings = Object.values(healthCheck.checks).some(check => check.status === 'warning')
    
    const overallStatus = hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy'

    return NextResponse.json({
      ...healthCheck,
      overall_status: overallStatus,
      recommendations: getRecommendations(healthCheck.checks)
    }, { 
      status: hasErrors ? 500 : hasWarnings ? 206 : 200 
    })

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall_status: 'critical',
      error: error instanceof Error ? error.message : 'Health check failed',
      recommendations: ['Check server logs', 'Verify environment configuration', 'Contact support']
    }, { status: 500 })
  }
}

function getRecommendations(checks: any): string[] {
  const recommendations: string[] = []

  if (checks.environment_variables.status !== 'healthy') {
    recommendations.push('Configure missing environment variables in your deployment platform')
    recommendations.push('Refer to ENVIRONMENT_SETUP_GUIDE.md for detailed instructions')
  }

  if (checks.supabase_connection.status !== 'healthy') {
    recommendations.push('Check Supabase project status and network connectivity')
    recommendations.push('Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct')
  }

  if (checks.admin_client.status !== 'healthy') {
    recommendations.push('Configure SUPABASE_SERVICE_ROLE_KEY for admin operations')
    recommendations.push('Ensure the service role key has proper permissions in Supabase')
  }

  if (recommendations.length === 0) {
    recommendations.push('System is healthy - no action required')
  }

  return recommendations
}