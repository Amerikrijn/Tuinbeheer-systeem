#!/usr/bin/env node

/**
 * STAP 1: Controleer environment configuratie
 */

const fs = require('fs')

console.log('🔍 STAP 1: Environment Check')
console.log('=' .repeat(40))

// Check if required files exist
const requiredFiles = [
  '.env.test',
  'lib/config.ts',
  'lib/supabase.ts',
  'test-environment-setup.sql'
]

let allGood = true

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - EXISTS`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    allGood = false
  }
})

// Check environment variables
if (fs.existsSync('.env.test')) {
  const envContent = fs.readFileSync('.env.test', 'utf8')
  
  if (envContent.includes('dwsgwqosmihsfaxuheji.supabase.co')) {
    console.log('✅ Test URL configured')
  } else {
    console.log('❌ Test URL not configured')
    allGood = false
  }
  
  if (envContent.includes('eyJhbGciOiJIUzI1NiIs')) {
    console.log('✅ Test API key configured')
  } else {
    console.log('❌ Test API key not configured') 
    allGood = false
  }
}

if (allGood) {
  console.log('\n🎉 Environment check PASSED!')
  process.exit(0)
} else {
  console.log('\n❌ Environment check FAILED!')
  process.exit(1)
}