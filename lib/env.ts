import { z } from 'zod'

const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  
  // Database Configuration
  DATABASE_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Development Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
  
  // API Configuration
  API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
  API_TIMEOUT: z.string().transform(Number).default('30000'),
  
  // Security
  JWT_SECRET: z.string().min(1).optional(),
  ENCRYPTION_KEY: z.string().min(1).optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_AUDIT_LOGGING: z.string().transform(val => val === 'true').default('false'),
  
  // Feature Flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
  ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('false'),
  
  // External Services
  STORAGE_BUCKET: z.string().optional(),
  CDN_URL: z.string().url().optional(),
  
  // Test Configuration
  TEST_DATABASE_URL: z.string().url().optional(),
  TEST_SUPABASE_URL: z.string().url().optional(),
  TEST_SUPABASE_ANON_KEY: z.string().optional(),
})

// Parse environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'))
      console.error('❌ Missing or invalid environment variables:')
      missingVars.forEach(varName => console.error(`   - ${varName}`))
      console.error('\n📝 Please check your Vercel environment variables or .env.local file.')
      console.error('💡 Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    throw error
  }
}

// Export validated environment variables
export const env = parseEnv()

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>

// Helper functions
export function isDevelopment() {
  return env.NODE_ENV === 'development'
}

export function isProduction() {
  return env.NODE_ENV === 'production'
}

export function isTest() {
  return env.NODE_ENV === 'test'
}

export function getSupabaseConfig() {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

export function getApiConfig() {
  return {
    baseUrl: env.API_BASE_URL,
    timeout: env.API_TIMEOUT,
  }
}

export function getLoggingConfig() {
  return {
    level: env.LOG_LEVEL,
    enableAudit: env.ENABLE_AUDIT_LOGGING,
    enableDebug: env.ENABLE_DEBUG_MODE,
    enablePerformance: env.ENABLE_PERFORMANCE_MONITORING,
  }
}
