#!/usr/bin/env node

/**
 * Test script to verify TEST environment database connection
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

async function testConnection() {
  console.log('🧪 TESTING SUPABASE TEST ENVIRONMENT CONNECTION')
  console.log('=' .repeat(50))
  
  // Get test environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_TEST
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
  
  console.log('📋 Configuration:')
  console.log('  URL:', supabaseUrl)
  console.log('  Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET')
  console.log('  Environment:', process.env.APP_ENV || 'NOT SET')
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing test environment configuration!')
    console.error('Please update .env.test with your test Supabase credentials')
    process.exit(1)
  }
  
  // Create client
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    console.log('\n🔍 Testing connection...')
    
    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...')
    const { data, error } = await supabase.from('gardens').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      if (error.message.includes('relation "gardens" does not exist')) {
        console.error('💡 Database schema not set up yet. Please run the setup SQL first.')
      }
      return false
    }
    
    console.log('✅ Basic connectivity: OK')
    
    // Test 2: Test data verification
    console.log('2. Testing data access...')
    const { data: gardens, error: gardenError } = await supabase
      .from('gardens')
      .select('*')
      .limit(5)
    
    if (gardenError) {
      console.error('❌ Data access failed:', gardenError.message)
      return false
    }
    
    console.log('✅ Data access: OK')
    console.log(`   Found ${gardens.length} gardens`)
    
    // Test 3: Check for test data
    console.log('3. Checking for test data...')
    const { data: testGarden, error: testError } = await supabase
      .from('gardens')
      .select('*')
      .eq('name', 'Test Tuin')
      .single()
    
    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Test data check failed:', testError.message)
      return false
    }
    
    if (testGarden) {
      console.log('✅ Test data found: OK')
      console.log(`   Test garden: ${testGarden.name}`)
    } else {
      console.log('⚠️  Test data not found (this is OK for new setup)')
    }
    
    // Test 4: Test write operations
    console.log('4. Testing write operations...')
    const testId = 'test-connection-' + Date.now()
    
    const { data: insertData, error: insertError } = await supabase
      .from('gardens')
      .insert({
        id: testId,
        name: 'Connection Test Garden',
        location: 'Test Location',
        description: 'Created by test script'
      })
      .select()
    
    if (insertError) {
      console.error('❌ Write test failed:', insertError.message)
      return false
    }
    
    console.log('✅ Write operations: OK')
    
    // Cleanup test data
    await supabase.from('gardens').delete().eq('id', testId)
    console.log('✅ Cleanup: OK')
    
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('Test environment is ready to use.')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Test environment connection successful!')
      process.exit(0)
    } else {
      console.log('\n❌ Test environment connection failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n💥 Test script error:', error.message)
    process.exit(1)
  })