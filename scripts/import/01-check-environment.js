#!/usr/bin/env node

/**
 * STAP 1: Environment Check
 * Controleer of alle benodigde bestanden en configuraties aanwezig zijn
 */

const fs = require('fs')

console.log('🔍 STAP 1: Environment Check')
console.log('='.repeat(50))

let allGood = true

// Check environment files
console.log('Checking environment files...')
if (fs.existsSync('.env.test')) {
  console.log('✅ .env.test - EXISTS')
} else {
  console.log('❌ .env.test - MISSING')
  allGood = false
}

if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example - EXISTS')
} else {
  console.log('❌ .env.example - MISSING')
  allGood = false
}

// Check configuration files
console.log('\nChecking configuration files...')
if (fs.existsSync('lib/config.ts')) {
  console.log('✅ lib/config.ts - EXISTS')
} else {
  console.log('❌ lib/config.ts - MISSING')
  allGood = false
}

if (fs.existsSync('lib/supabase.ts')) {
  console.log('✅ lib/supabase.ts - EXISTS')
} else {
  console.log('❌ lib/supabase.ts - MISSING')
  allGood = false
}

// Check database files
console.log('\nChecking database files...')
if (fs.existsSync('database_setup.sql')) {
  console.log('✅ database_setup.sql - EXISTS')
} else {
  console.log('❌ database_setup.sql - MISSING')
  allGood = false
}

// Check environment variables
console.log('\nChecking environment variables...')
if (fs.existsSync('.env.test')) {
  const envContent = fs.readFileSync('.env.test', 'utf8')
  
  if (envContent.includes('dwsgwqosmihsfaxuheji.supabase.co')) {
    console.log('✅ Test URL configured')
  } else {
    console.log('❌ Test URL not configured')
    allGood = false
  }
  
  if (envContent.includes('APP_ENV=test')) {
    console.log('✅ Environment selector configured')
  } else {
    console.log('❌ Environment selector not configured')
    allGood = false
  }
}

// Check package.json
console.log('\nChecking package.json scripts...')
if (fs.existsSync('package.json')) {
  const pkgContent = fs.readFileSync('package.json', 'utf8')
  const pkg = JSON.parse(pkgContent)
  
  if (pkg.scripts && pkg.scripts['import:step1']) {
    console.log('✅ Import scripts configured')
  } else {
    console.log('❌ Import scripts not configured')
    allGood = false
  }
}

console.log('\n' + '='.repeat(50))
if (allGood) {
  console.log('🎉 Environment check PASSED!')
  console.log('All required files and configurations are present.')
  console.log('\n📋 Environment setup:')
  console.log('  • Production: https://qrotadbmnkhhwhshijdy.supabase.co')
  console.log('  • Test: https://dwsgwqosmihsfaxuheji.supabase.co')
  console.log('\n➡️  Next: npm run import:step2')
} else {
  console.log('❌ Environment check FAILED!')
  console.log('Some required files or configurations are missing.')
  console.log('Please fix the issues above before continuing.')
}