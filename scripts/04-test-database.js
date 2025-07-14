#!/usr/bin/env node

/**
 * STAP 4: Test database schema
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

async function testDatabase() {
  console.log('🗄️  STAP 4: Database Schema Test')
  console.log('=' .repeat(40))
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_TEST,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
  )
  
  try {
    // Test 1: Gardens table
    console.log('Testing gardens table...')
    const { data: gardens, error: gardenError } = await supabase
      .from('gardens')
      .select('*')
      .limit(1)
    
    if (gardenError) {
      console.log('❌ Gardens table error:', gardenError.message)
      process.exit(1)
    }
    console.log('✅ Gardens table OK')
    
    // Test 2: Plant beds table
    console.log('Testing plant_beds table...')
    const { data: beds, error: bedError } = await supabase
      .from('plant_beds')
      .select('*')
      .limit(1)
    
    if (bedError) {
      console.log('❌ Plant beds table error:', bedError.message)
      process.exit(1)
    }
    console.log('✅ Plant beds table OK')
    
    // Test 3: Plants table
    console.log('Testing plants table...')
    const { data: plants, error: plantError } = await supabase
      .from('plants')
      .select('*')
      .limit(1)
    
    if (plantError) {
      console.log('❌ Plants table error:', plantError.message)
      process.exit(1)
    }
    console.log('✅ Plants table OK')
    
    console.log('\n🎉 Database schema test PASSED!')
    console.log(`Found ${gardens.length} gardens, ${beds.length} plant beds, ${plants.length} plants`)
    
  } catch (err) {
    console.log('❌ Database test failed:', err.message)
    process.exit(1)
  }
}

testDatabase()