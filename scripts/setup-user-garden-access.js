#!/usr/bin/env node

/**
 * Setup script for user_garden_access table
 * This script creates the missing database table that's causing the garden access issue
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupUserGardenAccessTable() {
  console.log('🔧 Setting up user_garden_access table...')

  try {
    // First, check if table already exists
    const { data: existingData, error: checkError } = await supabase
      .from('user_garden_access')
      .select('*')
      .limit(1)

    if (!checkError) {
      console.log('✅ user_garden_access table already exists')
      return
    }

    console.log('📋 Table does not exist, creating...')

    // Create the table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.user_garden_access (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
          granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
          granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, garden_id)
      );
    `

    // Execute the SQL
    const { error: createError } = await supabase.rpc('exec', {
      sql: createTableSQL
    })

    if (createError) {
      console.error('❌ Error creating table:', createError)
      throw createError
    }

    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id ON public.user_garden_access(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id ON public.user_garden_access(garden_id);
      CREATE INDEX IF NOT EXISTS idx_user_garden_access_active ON public.user_garden_access(is_active);
    `

    const { error: indexError } = await supabase.rpc('exec', {
      sql: createIndexesSQL
    })

    if (indexError) {
      console.warn('⚠️ Warning: Could not create indexes:', indexError.message)
    }

    // Disable RLS temporarily
    const disableRLSSQL = `
      ALTER TABLE public.user_garden_access DISABLE ROW LEVEL SECURITY;
    `

    const { error: rlsError } = await supabase.rpc('exec', {
      sql: disableRLSSQL
    })

    if (rlsError) {
      console.warn('⚠️ Warning: Could not disable RLS:', rlsError.message)
    }

    // Grant permissions
    const grantPermissionsSQL = `
      GRANT ALL ON public.user_garden_access TO authenticated;
    `

    const { error: grantError } = await supabase.rpc('exec', {
      sql: grantPermissionsSQL
    })

    if (grantError) {
      console.warn('⚠️ Warning: Could not grant permissions:', grantError.message)
    }

    // Verify table was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_garden_access')
      .select('*')
      .limit(1)

    if (verifyError) {
      console.error('❌ Table creation verification failed:', verifyError)
      throw verifyError
    }

    console.log('✅ user_garden_access table created successfully!')
    console.log('📊 Table is ready for use')

    // Show table structure
    const { data: structureData, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'user_garden_access' })

    if (!structureError && structureData) {
      console.log('📋 Table structure:')
      console.table(structureData)
    }

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupUserGardenAccessTable()
  .then(() => {
    console.log('🎉 Setup completed successfully!')
    console.log('💡 You can now use the garden access management feature')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
