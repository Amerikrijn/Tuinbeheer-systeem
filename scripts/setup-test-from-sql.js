#!/usr/bin/env node

/**
 * SETUP TEST DATABASE - Vanuit database_setup.sql
 */

const fs = require('fs')

console.log('🗄️  TEST DATABASE SETUP - Vanuit SQL Script')
console.log('=' .repeat(50))

// Check of database_setup.sql bestaat
if (!fs.existsSync('database_setup.sql')) {
  console.log('❌ database_setup.sql niet gevonden!')
  console.log('Zorg dat dit bestand bestaat in je project root')
  process.exit(1)
}

// Lees de SQL
const sqlContent = fs.readFileSync('database_setup.sql', 'utf8')

console.log('✅ Database setup script gevonden')
console.log('')
console.log('📋 KOPIEER EN PLAK DEZE SQL IN JE TEST DATABASE:')
console.log('─'.repeat(60))
console.log('')
console.log(sqlContent)
console.log('')
console.log('─'.repeat(60))
console.log('')
console.log('🎯 INSTRUCTIES:')
console.log('1. Ga naar: https://dwsgwqosmihsfaxuheji.supabase.co')
console.log('2. Klik op "SQL Editor" in het menu')
console.log('3. Kopieer de SQL hierboven')
console.log('4. Plak in de SQL editor')
console.log('5. Klik "Run" om de database op te zetten')
console.log('')
console.log('✅ Klaar? Test met: npm run test:step4')