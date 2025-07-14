#!/usr/bin/env node

/**
 * STAP 4: Verify Schema Import
 * Controleer of de schema import succesvol was
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

console.log('✅ STAP 4: Schema Import Verification')
console.log('='.repeat(50))

async function verifyImport() {
  try {
    // Create Supabase client
    const supabase = createClient(
      'https://dwsgwqosmihsfaxuheji.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
    )

    console.log('🔍 Verifying database schema...')
    console.log('Database: https://dwsgwqosmihsfaxuheji.supabase.co')
    
    const tables = ['gardens', 'plant_beds', 'plants']
    const results = {}
    
    // Check each table
    for (const table of tables) {
      try {
        console.log(`\nChecking table: ${table}`)
        
        // Try to query the table
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
          results[table] = { exists: false, error: error.message }
        } else {
          console.log(`✅ ${table}: Table exists and accessible`)
          results[table] = { exists: true, recordCount: data.length }
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
        results[table] = { exists: false, error: err.message }
      }
    }
    
    // Check for data
    console.log('\n🔍 Checking for sample data...')
    
    try {
      const { data: gardens, error: gardenError } = await supabase
        .from('gardens')
        .select('*')
      
      if (!gardenError && gardens.length > 0) {
        console.log(`✅ Found ${gardens.length} garden record(s)`)
        results.sampleData = true
      } else {
        console.log('⚠️  No garden data found')
        results.sampleData = false
      }
    } catch (err) {
      console.log('⚠️  Could not check sample data')
      results.sampleData = false
    }
    
    // Summary
    const successfulTables = Object.values(results).filter(r => r.exists === true).length
    const totalTables = tables.length
    
    console.log('\n' + '='.repeat(50))
    console.log('📊 VERIFICATION RESULTS:')
    console.log(`✅ Tables created: ${successfulTables}/${totalTables}`)
    console.log(`📋 Sample data: ${results.sampleData ? 'Yes' : 'No'}`)
    
    if (successfulTables === totalTables) {
      console.log('🎉 Schema import verification PASSED!')
      console.log('All required tables are present and accessible.')
      console.log('➡️  Next: npm run import:step5')
    } else {
      console.log('❌ Schema import verification FAILED!')
      console.log('Some tables are missing or inaccessible.')
      console.log('')
      console.log('🔧 TROUBLESHOOTING:')
      console.log('1. Make sure you executed the SQL in Supabase (step 3)')
      console.log('2. Check your database permissions')
      console.log('3. Verify the SQL was executed without errors')
      console.log('')
      console.log('Re-run step 3 if needed: npm run import:step3')
    }

  } catch (error) {
    console.log('❌ Verification error:', error.message)
    console.log('')
    console.log('🔧 TROUBLESHOOTING:')
    console.log('1. Check your internet connection')
    console.log('2. Verify Supabase credentials are correct')
    console.log('3. Make sure the database is accessible')
    process.exit(1)
  }
}

verifyImport()