#!/usr/bin/env node

/**
 * STAP 8: Test de draaiende applicatie
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

async function testApp() {
  console.log('🌐 STAP 8: Application Integration Test')
  console.log('=' .repeat(40))
  
  console.log('🔍 Deze stap test of je applicatie correct draait...')
  console.log('')
  
  // Test 1: Environment check
  console.log('1. Checking environment...')
  if (process.env.NEXT_PUBLIC_SUPABASE_URL_TEST) {
    console.log('✅ Test environment loaded')
  } else {
    console.log('❌ Environment not loaded correctly')
  }
  
  // Test 2: Database connection through app config
  console.log('2. Testing database through app config...')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_TEST,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
  )
  
  try {
    const { data, error } = await supabase.from('gardens').select('count').limit(1)
    if (error) {
      console.log('❌ Database connection failed:', error.message)
    } else {
      console.log('✅ Database connection works')
    }
  } catch (err) {
    console.log('❌ Database test failed:', err.message)
  }
  
  // Test 3: Check if server is running
  console.log('3. Checking if development server is accessible...')
  console.log('   Open your browser and go to: http://localhost:3000')
  console.log('   You should see the Tuinbeheer application')
  console.log('   Database connection should show TEST environment')
  console.log('')
  
  console.log('📋 MANUAL CHECKS:')
  console.log('□ Application loads without errors')
  console.log('□ Database connection shows test environment')
  console.log('□ Can create/edit/delete garden data safely')
  console.log('□ No production data is visible')
  console.log('')
  
  console.log('✅ Application integration test completed!')
  console.log('If all manual checks pass, your test environment is working!')
}

testApp()