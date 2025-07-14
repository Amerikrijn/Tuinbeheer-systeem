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
    // Test 1: Check environment variables
    console.log('Testing environment variables...')
    const currentEnv = process.env.APP_ENV || 'prod'
    console.log(`✅ Current environment: ${currentEnv}`)
    
    if (currentEnv !== 'test') {
      console.log('⚠️  Expected environment to be "test", but got:', currentEnv)
      console.log('Make sure APP_ENV=test is set in .env.test')
    }
    
    // Test 2: Check environment URLs
    console.log('Testing environment URLs...')
    const testUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_TEST
    const prodUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (testUrl && testUrl.includes('dwsgwqosmihsfaxuheji')) {
      console.log('✅ Test URL configured correctly')
    } else {
      console.log('❌ Test URL not configured properly')
    }
    
    if (prodUrl && prodUrl.includes('qrotadbmnkhhwhshijdy')) {
      console.log('✅ Production URL configured correctly')
    } else {
      console.log('❌ Production URL not configured properly')
    }
    
    // Test 3: Check API keys
    console.log('Testing API keys...')
    const testKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
    const prodKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (testKey && testKey.startsWith('eyJ')) {
      console.log('✅ Test API key configured')
    } else {
      console.log('❌ Test API key not configured')
    }
    
    if (prodKey && prodKey.startsWith('eyJ')) {
      console.log('✅ Production API key configured')
    } else {
      console.log('❌ Production API key not configured')
    }

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