#!/usr/bin/env node

/**
 * STAP 2: Test basis connectie met Supabase
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')

async function testConnection() {
  console.log('🔗 STAP 2: Connection Test')
  console.log('=' .repeat(40))
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_TEST
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
  
  console.log('URL:', url)
  console.log('Key:', key ? key.substring(0, 20) + '...' : 'NOT SET')
  
  if (!url || !key) {
    console.log('❌ Missing credentials')
    process.exit(1)
  }
  
  try {
    const supabase = createClient(url, key)
    
    // Simple test - just check if we can make a request
    const { data, error } = await supabase.from('gardens').select('count').limit(1)
    
    if (error && !error.message.includes('relation "gardens" does not exist')) {
      console.log('❌ Connection failed:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Connection successful!')
    
    if (error && error.message.includes('relation "gardens" does not exist')) {
      console.log('⚠️  Database schema not yet set up (this is normal)')
    }
    
    process.exit(0)
    
  } catch (err) {
    console.log('❌ Connection error:', err.message)
    process.exit(1)
  }
}

testConnection()