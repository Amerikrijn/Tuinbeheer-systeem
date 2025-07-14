#!/usr/bin/env node

/**
 * STAP 8: Final Verification
 * Finale verificatie van de complete setup
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

console.log('🎯 STAP 8: Final Verification')
console.log('='.repeat(50))

async function finalVerification() {
  try {
    let score = 0
    const maxScore = 8
    
    // Test 1: Environment configuration
    console.log('1. Environment configuration...')
    try {
      const { getCurrentEnvironment, getSupabaseConfig } = require('../../lib/config.ts')
      const env = getCurrentEnvironment()
      const config = getSupabaseConfig()
      
      if (env === 'test' && config.url.includes('dwsgwqosmihsfaxuheji')) {
        console.log('✅ Environment configuration correct')
        score++
      } else {
        console.log('❌ Environment configuration incorrect')
      }
    } catch (err) {
      console.log('❌ Environment configuration failed')
    }
    
    // Test 2: Database connection
    console.log('2. Database connection...')
    try {
      const testSupabase = createClient(
        'https://dwsgwqosmihsfaxuheji.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
      )
      
      const { data, error } = await testSupabase.from('gardens').select('count').limit(1)
      
      if (!error) {
        console.log('✅ Database connection works')
        score++
      } else {
        console.log('❌ Database connection failed')
      }
    } catch (err) {
      console.log('❌ Database connection failed')
    }
    
    // Test 3: Tables exist
    console.log('3. Required tables...')
    try {
      const testSupabase = createClient(
        'https://dwsgwqosmihsfaxuheji.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
      )
      
      const tables = ['gardens', 'plant_beds', 'plants']
      let allExist = true
      
      for (const table of tables) {
        const { data, error } = await testSupabase.from(table).select('*').limit(1)
        if (error) {
          allExist = false
          break
        }
      }
      
      if (allExist) {
        console.log('✅ All required tables exist')
        score++
      } else {
        console.log('❌ Some tables missing')
      }
    } catch (err) {
      console.log('❌ Table check failed')
    }
    
    // Test 4: Sample data
    console.log('4. Sample data...')
    try {
      const testSupabase = createClient(
        'https://dwsgwqosmihsfaxuheji.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
      )
      
      const { data: gardens, error } = await testSupabase.from('gardens').select('*')
      
      if (!error && gardens.length > 0) {
        console.log('✅ Sample data available')
        score++
      } else {
        console.log('❌ No sample data found')
      }
    } catch (err) {
      console.log('❌ Sample data check failed')
    }
    
    // Test 5: CRUD operations
    console.log('5. CRUD operations...')
    try {
      const testSupabase = createClient(
        'https://dwsgwqosmihsfaxuheji.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
      )
      
      const testId = 'final-test-' + Date.now()
      
      // Quick CRUD test
      const { error: insertError } = await testSupabase.from('gardens').insert({
        id: testId,
        name: 'Final Test',
        location: 'Test'
      })
      
      if (!insertError) {
        await testSupabase.from('gardens').delete().eq('id', testId)
        console.log('✅ CRUD operations work')
        score++
      } else {
        console.log('❌ CRUD operations failed')
      }
    } catch (err) {
      console.log('❌ CRUD test failed')
    }
    
    // Test 6: Environment files
    console.log('6. Environment files...')
    const fs = require('fs')
    if (fs.existsSync('.env.test') && fs.existsSync('.env.example')) {
      console.log('✅ Environment files exist')
      score++
    } else {
      console.log('❌ Environment files missing')
    }
    
    // Test 7: NPM scripts
    console.log('7. NPM scripts...')
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      if (pkg.scripts && pkg.scripts['import:step1'] && pkg.scripts['dev:test']) {
        console.log('✅ NPM scripts configured')
        score++
      } else {
        console.log('❌ NPM scripts missing')
      }
    } else {
      console.log('❌ package.json missing')
    }
    
    // Test 8: Production environment
    console.log('8. Production environment...')
    try {
      const prodSupabase = createClient(
        'https://qrotadbmnkhhwhshijdy.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
      )
      
      const { data, error } = await prodSupabase.from('gardens').select('count').limit(1)
      
      if (!error || error.message.includes('does not exist')) {
        console.log('✅ Production environment accessible')
        score++
      } else {
        console.log('❌ Production environment inaccessible')
      }
    } catch (err) {
      console.log('❌ Production environment test failed')
    }
    
    // Results
    console.log('\n' + '='.repeat(50))
    console.log(`📊 FINAL SCORE: ${score}/${maxScore}`)
    console.log('='.repeat(50))
    
    if (score === maxScore) {
      console.log('🎉 PERFECT! Import setup is 100% complete!')
      console.log('✅ All tests passed successfully.')
    } else if (score >= 6) {
      console.log('✅ GOOD! Import setup is mostly complete.')
      console.log('Some minor issues remain, but the system is functional.')
    } else {
      console.log('❌ ISSUES FOUND! Import setup needs attention.')
      console.log('Please review the failed tests above.')
    }
    
    console.log('\n➡️  Next: npm run import:step9')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

finalVerification()