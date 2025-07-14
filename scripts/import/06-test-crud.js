#!/usr/bin/env node

/**
 * STAP 6: Test CRUD Operations
 * Test Create, Read, Update, Delete operaties
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

console.log('✏️  STAP 6: CRUD Operations Test')
console.log('='.repeat(50))

async function testCRUD() {
  try {
    const testSupabase = createClient(
      'https://dwsgwqosmihsfaxuheji.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
    )

    const testId = 'test-crud-' + Date.now()
    
    // CREATE Test
    console.log('Testing CREATE operation...')
    const { data: createData, error: createError } = await testSupabase
      .from('gardens')
      .insert({
        id: testId,
        name: 'CRUD Test Garden',
        location: 'Test Location',
        description: 'Created by CRUD test'
      })
      .select()
    
    if (createError) {
      console.log('❌ CREATE failed:', createError.message)
      return
    }
    
    console.log('✅ CREATE successful')
    
    // READ Test
    console.log('Testing READ operation...')
    const { data: readData, error: readError } = await testSupabase
      .from('gardens')
      .select('*')
      .eq('id', testId)
      .single()
    
    if (readError) {
      console.log('❌ READ failed:', readError.message)
      return
    }
    
    console.log('✅ READ successful')
    
    // UPDATE Test
    console.log('Testing UPDATE operation...')
    const { data: updateData, error: updateError } = await testSupabase
      .from('gardens')
      .update({ 
        description: 'Updated by CRUD test',
        notes: 'Test notes added'
      })
      .eq('id', testId)
      .select()
    
    if (updateError) {
      console.log('❌ UPDATE failed:', updateError.message)
      return
    }
    
    console.log('✅ UPDATE successful')
    
    // DELETE Test
    console.log('Testing DELETE operation...')
    const { error: deleteError } = await testSupabase
      .from('gardens')
      .delete()
      .eq('id', testId)
    
    if (deleteError) {
      console.log('❌ DELETE failed:', deleteError.message)
      return
    }
    
    console.log('✅ DELETE successful')
    
    // Verify deletion
    console.log('Verifying deletion...')
    const { data: verifyData, error: verifyError } = await testSupabase
      .from('gardens')
      .select('*')
      .eq('id', testId)
    
    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message)
      return
    }
    
    if (verifyData.length === 0) {
      console.log('✅ Verification successful - record deleted')
    } else {
      console.log('❌ Verification failed - record still exists')
      return
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 CRUD operations test PASSED!')
    console.log('All database operations are working correctly.')
    console.log('➡️  Next: npm run import:step7')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

testCRUD()