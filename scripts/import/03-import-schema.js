#!/usr/bin/env node

/**
 * STAP 3: Import Database Schema
 * Importeer database schema in Supabase
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

console.log('📦 STAP 3: Database Schema Import')
console.log('='.repeat(50))

async function importSchema() {
  try {
    // Read SQL file
    if (!fs.existsSync('database_setup.sql')) {
      console.log('❌ database_setup.sql not found!')
      process.exit(1)
    }

    const sqlContent = fs.readFileSync('database_setup.sql', 'utf8')
    
    // Create Supabase client
    const supabase = createClient(
      'https://dwsgwqosmihsfaxuheji.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
    )

    console.log('🔗 Connecting to TEST database...')
    console.log('URL: https://dwsgwqosmihsfaxuheji.supabase.co')
    
    // Check if tables already exist
    console.log('\n1️⃣ Checking existing tables...')
    
    const { data: existingTables, error: checkError } = await supabase
      .from('gardens')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ Tables already exist!')
      console.log('🎉 Schema already imported!')
      console.log('➡️  Next: npm run import:step4')
      return
    }

    // Show manual import instructions
    console.log('\n2️⃣ Manual import required...')
    await showManualInstructions(sqlContent)

  } catch (error) {
    console.log('❌ Import error:', error.message)
    await showManualInstructions(fs.readFileSync('database_setup.sql', 'utf8'))
  }
}

async function showManualInstructions(sqlContent) {
  console.log('\n📋 MANUAL IMPORT INSTRUCTIONS')
  console.log('='.repeat(50))
  
  console.log('Please follow these steps to import the schema:')
  console.log('')
  console.log('1. 🌐 Go to: https://dwsgwqosmihsfaxuheji.supabase.co')
  console.log('2. 🔐 Log in to your Supabase dashboard')
  console.log('3. 📊 Click "SQL Editor" in the left sidebar')
  console.log('4. 📋 Create a new query')
  console.log('5. 📝 Copy and paste the SQL below:')
  console.log('')
  console.log('─'.repeat(60))
  console.log(sqlContent)
  console.log('─'.repeat(60))
  console.log('')
  console.log('6. ▶️  Click "Run" to execute the SQL')
  console.log('7. ✅ Verify you see "Success" message')
  console.log('')
  
  // Interactive confirmation
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question('Have you successfully executed the SQL in Supabase? (y/n): ', (answer) => {
      const response = answer.toLowerCase().trim()
      
      if (response === 'y' || response === 'yes') {
        console.log('✅ Schema import confirmed!')
        console.log('➡️  Next: npm run import:step4')
      } else {
        console.log('❌ Please execute the SQL first before continuing.')
        process.exit(1)
      }
      
      rl.close()
      resolve()
    })
  })
}

importSchema()