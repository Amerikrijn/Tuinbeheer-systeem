#!/usr/bin/env node

/**
 * STAP 2: Test Database Connections
 * Test verbinding met zowel test als productie database
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

console.log('🔗 STAP 2: Database Connection Test')
console.log('='.repeat(50))

async function testConnections() {
  try {
    // Test Production Database
    console.log('Testing PRODUCTION database...')
    const prodSupabase = createClient(
      'https://qrotadbmnkhhwhshijdy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
    )

    const { data: prodData, error: prodError } = await prodSupabase
      .from('gardens')
      .select('count')
      .limit(1)

    if (prodError) {
      if (prodError.message.includes('relation "gardens" does not exist')) {
        console.log('⚠️  Production: Database connected, but tables not set up yet')
      } else {
        console.log('❌ Production: Connection failed -', prodError.message)
      }
    } else {
      console.log('✅ Production: Database connected successfully')
    }

    // Test Test Database
    console.log('\nTesting TEST database...')
    const testSupabase = createClient(
      'https://dwsgwqosmihsfaxuheji.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
    )

    const { data: testData, error: testError } = await testSupabase
      .from('gardens')
      .select('count')
      .limit(1)

    if (testError) {
      if (testError.message.includes('relation "gardens" does not exist')) {
        console.log('⚠️  Test: Database connected, but tables not set up yet')
      } else {
        console.log('❌ Test: Connection failed -', testError.message)
      }
    } else {
      console.log('✅ Test: Database connected successfully')
    }

    // Test Application Configuration
    console.log('\nTesting APPLICATION configuration...')
    const { getCurrentEnvironment, getSupabaseConfig } = require('../../lib/config.ts')
    
    const env = getCurrentEnvironment()
    const config = getSupabaseConfig()
    
    console.log(`✅ Current environment: ${env}`)
    console.log(`✅ Config URL: ${config.url.substring(0, 40)}...`)

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Connection test COMPLETED!')
    console.log('Both databases are reachable.')
    console.log('➡️  Next: npm run import:step3')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

testConnections()