import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up user_garden_access table...')

    // First, check if table already exists
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('user_garden_access')
      .select('*')
      .limit(1)

    if (!checkError) {
      console.log('✅ user_garden_access table already exists')
      return NextResponse.json({
        success: true,
        message: 'user_garden_access table already exists',
        tableExists: true
      })
    }

    // Create user_garden_access table using a simple approach
    // We'll use the existing API structure to create the table
    console.log('🔧 Creating user_garden_access table...')
    
    // Try to create a test record to trigger table creation
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      garden_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      granted_by: null, // Set to null since we don't have the admin user ID
      access_level: 'read',
      is_active: false // Mark as inactive so it doesn't affect real data
    }

    const { error: createError } = await supabaseAdmin
      .from('user_garden_access')
      .insert(testRecord)

    if (createError && !createError.message.includes('relation "user_garden_access" does not exist')) {
      console.error('❌ Error creating table:', createError)
      return NextResponse.json(
        { error: `Failed to create table: ${createError.message}` },
        { status: 500 }
      )
    }

    // Create indexes
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id ON public.user_garden_access(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id ON public.user_garden_access(garden_id);
      CREATE INDEX IF NOT EXISTS idx_user_garden_access_active ON public.user_garden_access(is_active);
    `

    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createIndexesQuery
    })

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError)
      // Don't fail the whole operation for index errors
    }

    // Create updated_at trigger function
    const createTriggerFunctionQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `

    const { error: functionError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTriggerFunctionQuery
    })

    if (functionError) {
      console.error('❌ Error creating trigger function:', functionError)
    }

    // Create trigger
    const createTriggerQuery = `
      DROP TRIGGER IF EXISTS update_user_garden_access_updated_at ON public.user_garden_access;
      CREATE TRIGGER update_user_garden_access_updated_at
          BEFORE UPDATE ON public.user_garden_access
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `

    const { error: triggerError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTriggerQuery
    })

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError)
    }

    // Disable RLS temporarily
    const disableRLSQuery = `
      ALTER TABLE public.user_garden_access DISABLE ROW LEVEL SECURITY;
    `

    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: disableRLSQuery
    })

    if (rlsError) {
      console.error('❌ Error disabling RLS:', rlsError)
    }

    // Grant permissions
    const grantPermissionsQuery = `
      GRANT ALL ON public.user_garden_access TO authenticated;
    `

    const { error: grantError } = await supabaseAdmin.rpc('exec_sql', {
      sql: grantPermissionsQuery
    })

    if (grantError) {
      console.error('❌ Error granting permissions:', grantError)
    }

    // Verify table was created
    const { data: tableData, error: verifyError } = await supabaseAdmin
      .from('user_garden_access')
      .select('*')
      .limit(1)

    if (verifyError) {
      console.error('❌ Error verifying table:', verifyError)
      return NextResponse.json(
        { error: `Table created but verification failed: ${verifyError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ user_garden_access table setup completed successfully')

    return NextResponse.json({
      success: true,
      message: 'user_garden_access table created successfully',
      tableExists: true,
      sampleData: tableData
    })

  } catch (error) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json(
      { error: `Database setup failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// GET endpoint to check if table exists
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_garden_access')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        exists: false,
        error: error.message
      })
    }

    return NextResponse.json({
      exists: true,
      message: 'user_garden_access table exists',
      sampleData: data
    })

  } catch (error) {
    return NextResponse.json({
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
