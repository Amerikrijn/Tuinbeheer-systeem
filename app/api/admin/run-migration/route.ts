import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { migrationName } = await request.json()

    if (migrationName !== 'force-password-change') {
      return NextResponse.json(
        { error: 'Invalid migration name' },
        { status: 400 }
      )
    }

    console.log('🔐 Checking force password change migration status...')

    // Test if columns already exist by trying to select them
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('id, force_password_change, password_changed_at')
      .limit(1)

    if (testError) {
      // Columns don't exist, we need to add them manually in Supabase dashboard
      console.error('Migration needed - columns do not exist:', testError.message)
      
      return NextResponse.json({
        success: false,
        needsMigration: true,
        message: 'Force password change columns do not exist yet',
        migrationSQL: `
-- Run this SQL in your Supabase SQL Editor:

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.users.force_password_change IS 'Banking security: User must change password after admin reset';
COMMENT ON COLUMN public.users.password_changed_at IS 'Banking audit: Last time user changed their password';

CREATE INDEX IF NOT EXISTS idx_users_force_password_change 
ON public.users(force_password_change) 
WHERE force_password_change = TRUE;
        `.trim(),
        instructions: 'Copy the SQL above and run it in Supabase Dashboard > SQL Editor'
      })
    }

    // Columns exist, migration is complete
    console.log('✅ MIGRATION STATUS: Force password change columns already exist')

    // Log the verification
    const { error: logError } = await supabaseAdmin
      .from('system_logs')
      .insert({
        level: 'INFO',
        message: 'Force password change migration verified - Banking compliance',
        context: 'database-migration-check'
      })

    if (logError) {
      console.warn('Could not log migration verification:', logError)
    }

    return NextResponse.json({
      success: true,
      needsMigration: false,
      message: 'Force password change columns are already present',
      columnsFound: testData ? testData.length : 0
    })

  } catch (error) {
    console.error('Migration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}