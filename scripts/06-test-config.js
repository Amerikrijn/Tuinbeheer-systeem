#!/usr/bin/env node

/**
 * STAP 6: Test applicatie configuratie
 */

process.env.APP_ENV = 'test'
require('dotenv').config({ path: '.env.test' })

async function testConfig() {
  console.log('⚙️  STAP 6: Application Config Test')
  console.log('=' .repeat(40))
  
  try {
    // Test if we can import our config
    console.log('Loading configuration...')
    const { getCurrentEnvironment, getSupabaseConfig, validateSupabaseConfig } = require('../lib/config.ts')
    
    // Test environment detection
    const env = getCurrentEnvironment()
    console.log('✅ Current environment:', env)
    
    if (env !== 'test') {
      console.log('⚠️  Expected "test" but got:', env)
      console.log('Make sure APP_ENV=test is set')
    }
    
    // Test config retrieval
    const config = getSupabaseConfig()
    console.log('✅ Config loaded')
    console.log('  URL:', config.url.substring(0, 40) + '...')
    console.log('  Key length:', config.anonKey.length)
    
    // Test validation
    validateSupabaseConfig(config)
    console.log('✅ Config validation passed')
    
    // Check if it's using the test environment
    if (config.url.includes('dwsgwqosmihsfaxuheji')) {
      console.log('✅ Using TEST database correctly')
    } else {
      console.log('❌ NOT using test database!')
      console.log('Current URL:', config.url)
      process.exit(1)
    }
    
    console.log('\n🎉 Application config test PASSED!')
    
  } catch (err) {
    console.log('❌ Config test failed:', err.message)
    process.exit(1)
  }
}

testConfig()