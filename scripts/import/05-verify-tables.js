#!/usr/bin/env node

/**
 * STAP 5: Verify Database Tables
 * Controleer of de tabellen correct zijn aangemaakt
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

console.log('🗄️  STAP 5: Database Tables Verification')
console.log('='.repeat(50))

async function verifyTables() {
  try {
    // Test database
    const testSupabase = createClient(
      'https://dwsgwqosmihsfaxuheji.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
    )

    const tables = ['gardens', 'plant_beds', 'plants']
    let allTablesExist = true

    console.log('Checking TEST database tables...')
    
    for (const table of tables) {
      try {
        const { data, error } = await testSupabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
          allTablesExist = false
        } else {
          console.log(`✅ ${table}: Table exists`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
        allTablesExist = false
      }
    }

    // Check for sample data
    console.log('\nChecking sample data...')
    
    try {
      const { data: gardens, error: gardenError } = await testSupabase
        .from('gardens')
        .select('*')
      
      if (gardenError) {
        console.log('❌ Could not read gardens:', gardenError.message)
      } else {
        console.log(`✅ Gardens: ${gardens.length} records found`)
      }
    } catch (err) {
      console.log('❌ Gardens data check failed:', err.message)
    }

    try {
      const { data: beds, error: bedError } = await testSupabase
        .from('plant_beds')
        .select('*')
      
      if (bedError) {
        console.log('❌ Could not read plant_beds:', bedError.message)
      } else {
        console.log(`✅ Plant beds: ${beds.length} records found`)
      }
    } catch (err) {
      console.log('❌ Plant beds data check failed:', err.message)
    }

    try {
      const { data: plants, error: plantError } = await testSupabase
        .from('plants')
        .select('*')
      
      if (plantError) {
        console.log('❌ Could not read plants:', plantError.message)
      } else {
        console.log(`✅ Plants: ${plants.length} records found`)
      }
    } catch (err) {
      console.log('❌ Plants data check failed:', err.message)
    }

    console.log('\n' + '='.repeat(50))
    if (allTablesExist) {
      console.log('🎉 Table verification PASSED!')
      console.log('All required tables exist and are accessible.')
      console.log('➡️  Next: npm run import:step6')
    } else {
      console.log('❌ Table verification FAILED!')
      console.log('Some tables are missing or inaccessible.')
      console.log('Please check the SQL execution in step 3.')
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

verifyTables()