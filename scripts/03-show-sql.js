#!/usr/bin/env node

/**
 * STAP 3: Toon SQL voor database setup
 */

const fs = require('fs')

console.log('📋 STAP 3: Database Setup SQL')
console.log('=' .repeat(40))

if (!fs.existsSync('test-environment-setup.sql')) {
  console.log('❌ test-environment-setup.sql not found')
  process.exit(1)
}

const sql = fs.readFileSync('test-environment-setup.sql', 'utf8')

console.log('📝 KOPIEER EN PLAK DEZE SQL IN JE SUPABASE SQL EDITOR:')
console.log('─'.repeat(60))
console.log('')
console.log(sql)
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
console.log('✅ Klaar? Ga naar stap 4!')