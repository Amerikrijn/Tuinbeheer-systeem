#!/usr/bin/env node

/**
 * STAP 3: Show Database Setup SQL
 * Toon de SQL die uitgevoerd moet worden in Supabase
 */

const fs = require('fs')

console.log('📋 STAP 3: Database Setup SQL')
console.log('='.repeat(50))

if (!fs.existsSync('database_setup.sql')) {
  console.log('❌ database_setup.sql not found!')
  console.log('Please make sure this file exists in your project root.')
  process.exit(1)
}

const sqlContent = fs.readFileSync('database_setup.sql', 'utf8')

console.log('✅ Database setup SQL loaded')
console.log('')
console.log('📝 COPY AND PASTE THIS SQL INTO YOUR SUPABASE SQL EDITOR:')
console.log('─'.repeat(60))
console.log('')
console.log(sqlContent)
console.log('')
console.log('─'.repeat(60))
console.log('')
console.log('🎯 INSTRUCTIONS:')
console.log('1. Go to: https://dwsgwqosmihsfaxuheji.supabase.co (TEST)')
console.log('2. Click "SQL Editor" in the left menu')
console.log('3. Copy the SQL above')
console.log('4. Paste it in the SQL editor')
console.log('5. Click "Run" to set up the database')
console.log('')
console.log('📋 OPTIONAL: Also run in PRODUCTION:')
console.log('1. Go to: https://qrotadbmnkhhwhshijdy.supabase.co (PROD)')
console.log('2. Follow the same steps')
console.log('')
console.log('✅ Done? Continue with: npm run import:step4')