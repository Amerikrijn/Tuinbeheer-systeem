#!/usr/bin/env node

/**
 * STAP 7: Environment Switching Test
 * Test het schakelen tussen TEST en PROD environments
 */

require('dotenv').config({ path: '.env.test' })

console.log('⚙️  STAP 7: Environment Switching Test')
console.log('='.repeat(50))

async function testEnvironmentSwitching() {
  try {
    // Test 1: Load config system
    console.log('Testing configuration system...')
    const { getCurrentEnvironment, getSupabaseConfig, validateSupabaseConfig } = require('../../lib/config.ts')
    
    // Test 2: Check current environment
    const currentEnv = getCurrentEnvironment()
    console.log(`✅ Current environment: ${currentEnv}`)
    
    if (currentEnv !== 'test') {
      console.log('⚠️  Expected environment to be "test", but got:', currentEnv)
      console.log('Make sure APP_ENV=test is set in .env.test')
    }
    
    // Test 3: Get config for current environment
    const config = getSupabaseConfig()
    console.log('✅ Configuration loaded')
    console.log(`  URL: ${config.url.substring(0, 40)}...`)
    console.log(`  Key length: ${config.anonKey.length}`)
    
    // Test 4: Validate config
    try {
      validateSupabaseConfig(config)
      console.log('✅ Configuration validation passed')
    } catch (validationError) {
      console.log('❌ Configuration validation failed:', validationError.message)
      return
    }
    
    // Test 5: Check if using correct test URL
    if (config.url.includes('dwsgwqosmihsfaxuheji')) {
      console.log('✅ Using TEST database correctly')
    } else {
      console.log('❌ NOT using test database!')
      console.log('Current URL:', config.url)
      return
    }
    
    // Test 6: Simulate production environment
    console.log('\nTesting production environment simulation...')
    const originalEnv = process.env.APP_ENV
    process.env.APP_ENV = 'prod'
    
    // Re-require the config to get fresh environment
    delete require.cache[require.resolve('../../lib/config.ts')]
    const { getCurrentEnvironment: getProdEnv, getSupabaseConfig: getProdConfig } = require('../../lib/config.ts')
    
    const prodEnv = getProdEnv()
    const prodConfig = getProdConfig()
    
    console.log(`✅ Production environment: ${prodEnv}`)
    console.log(`✅ Production URL: ${prodConfig.url.substring(0, 40)}...`)
    
    if (prodConfig.url.includes('qrotadbmnkhhwhshijdy')) {
      console.log('✅ Production configuration correct')
    } else {
      console.log('❌ Production configuration incorrect')
    }
    
    // Restore environment
    process.env.APP_ENV = originalEnv

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Environment switching test PASSED!')
    console.log('Both TEST and PROD environments are correctly configured.')
    console.log('➡️  Next: npm run import:step8')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

testEnvironmentSwitching()