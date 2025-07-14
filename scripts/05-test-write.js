#!/usr/bin/env node

/**
 * STAP 5: Test write operaties
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

async function testWrite() {
  console.log('✏️  STAP 5: Write Operations Test')
  console.log('=' .repeat(40))
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_TEST,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
  )
  
  const testId = 'test-' + Date.now()
  
  try {
    console.log('Creating test garden...')
    
    // Test insert
    const { data: insertData, error: insertError } = await supabase
      .from('gardens')
      .insert({
        id: testId,
        name: 'Script Test Garden',
        location: 'Test Location',
        description: 'Created by test script'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message)
      process.exit(1)
    }
    
    console.log('✅ Insert successful:', insertData[0].name)
    
    // Test update
    console.log('Updating test garden...')
    const { data: updateData, error: updateError } = await supabase
      .from('gardens')
      .update({ description: 'Updated by test script' })
      .eq('id', testId)
      .select()
    
    if (updateError) {
      console.log('❌ Update failed:', updateError.message)
    } else {
      console.log('✅ Update successful')
    }
    
    // Test delete (cleanup)
    console.log('Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('gardens')
      .delete()
      .eq('id', testId)
    
    if (deleteError) {
      console.log('⚠️  Cleanup failed:', deleteError.message)
    } else {
      console.log('✅ Cleanup successful')
    }
    
    console.log('\n🎉 Write operations test PASSED!')
    
  } catch (err) {
    console.log('❌ Write test failed:', err.message)
    process.exit(1)
  }
}

testWrite()