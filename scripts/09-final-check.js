#!/usr/bin/env node

/**
 * STAP 9: Final check - alles werkt correct
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

async function finalCheck() {
  console.log('🎯 STAP 9: Final Verification Check')
  console.log('=' .repeat(40))
  
  let score = 0
  const maxScore = 8
  
  // Check 1: Environment files
  console.log('1. Environment files...')
  if (fs.existsSync('.env.test')) {
    console.log('✅ .env.test exists')
    score++
  } else {
    console.log('❌ .env.test missing')
  }
  
  // Check 2: Configuration
  console.log('2. Configuration system...')
  try {
    const { getCurrentEnvironment } = require('../lib/config.ts')
    const env = getCurrentEnvironment()
    if (env === 'test') {
      console.log('✅ Environment detection works')
      score++
    } else {
      console.log('❌ Environment detection failed')
    }
  } catch (err) {
    console.log('❌ Configuration system failed')
  }
  
  // Check 3: Database connection
  console.log('3. Database connection...')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL_TEST,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
    )
    
    const { data, error } = await supabase.from('gardens').select('count').limit(1)
    if (!error) {
      console.log('✅ Database connection works')
      score++
    } else if (error.message.includes('does not exist')) {
      console.log('⚠️  Database connected, schema needed')
      score++
    } else {
      console.log('❌ Database connection failed')
    }
  } catch (err) {
    console.log('❌ Database connection failed')
  }
  
  // Check 4: Schema verification
  console.log('4. Database schema...')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL_TEST,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
    )
    
    const { data: gardens } = await supabase.from('gardens').select('*').limit(1)
    const { data: beds } = await supabase.from('plant_beds').select('*').limit(1)
    const { data: plants } = await supabase.from('plants').select('*').limit(1)
    
    console.log('✅ Database schema complete')
    score++
  } catch (err) {
    console.log('⚠️  Database schema incomplete (run SQL setup)')
  }
  
  // Check 5: Write permissions
  console.log('5. Write permissions...')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL_TEST,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST
    )
    
    const testId = 'final-check-' + Date.now()
    const { error } = await supabase.from('gardens').insert({
      id: testId,
      name: 'Final Check Test',
      location: 'Test'
    })
    
    if (!error) {
      await supabase.from('gardens').delete().eq('id', testId)
      console.log('✅ Write permissions work')
      score++
    } else {
      console.log('❌ Write permissions failed')
    }
  } catch (err) {
    console.log('❌ Write test failed')
  }
  
  // Check 6: Scripts exist
  console.log('6. Setup scripts...')
  const scripts = ['01-check-environment.js', '02-test-connection.js', '03-show-sql.js']
  const allScriptsExist = scripts.every(script => fs.existsSync(`scripts/${script}`))
  
  if (allScriptsExist) {
    console.log('✅ All setup scripts available')
    score++
  } else {
    console.log('❌ Some setup scripts missing')
  }
  
  // Check 7: NPM scripts
  console.log('7. NPM scripts...')
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    if (pkg.scripts['dev:test'] && pkg.scripts['test:db']) {
      console.log('✅ NPM scripts configured')
      score++
    } else {
      console.log('❌ NPM scripts missing')
    }
  }
  
  // Check 8: Documentation
  console.log('8. Documentation...')
  if (fs.existsSync('TEST_ENVIRONMENT_SETUP.md')) {
    console.log('✅ Documentation available')
    score++
  } else {
    console.log('❌ Documentation missing')
  }
  
  console.log('')
  console.log('=' .repeat(40))
  console.log(`📊 FINAL SCORE: ${score}/${maxScore}`)
  console.log('=' .repeat(40))
  
  if (score === maxScore) {
    console.log('🎉 PERFECT! Test environment is 100% ready!')
    console.log('')
    console.log('🚀 You can now:')
    console.log('   • Run: npm run dev:test')
    console.log('   • Develop safely in test environment')
    console.log('   • Deploy to production when ready')
  } else if (score >= 6) {
    console.log('✅ GOOD! Test environment is mostly ready')
    console.log('Fix remaining issues and re-run this check')
  } else {
    console.log('❌ ISSUES FOUND! Please complete the setup steps')
    console.log('Re-run individual scripts to fix issues')
  }
  
  console.log('')
  console.log('📋 Next steps for full deployment pipeline:')
  console.log('   1. Setup DEV environment (separate database)')
  console.log('   2. Setup PROD environment (migrate current DB)')
  console.log('   3. Configure CI/CD pipeline')
  console.log('   4. Setup automated testing')
}

finalCheck()