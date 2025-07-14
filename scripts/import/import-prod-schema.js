#!/usr/bin/env node

/**
 * PRODUCTION: Import Database Schema
 * Importeer database schema in PRODUCTION Supabase
 */

require('dotenv').config({ path: '.env.test' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

console.log('🚀 PRODUCTION: Database Schema Import')
console.log('='.repeat(50))

async function importProdSchema() {
  try {
    // Read SQL file
    if (!fs.existsSync('database_setup.sql')) {
      console.log('❌ database_setup.sql not found!')
      process.exit(1)
    }

    const sqlContent = fs.readFileSync('database_setup.sql', 'utf8')
    
    // Create Supabase client for PRODUCTION
    const supabase = createClient(
      'https://qrotadbmnkhhwhshijdy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
    )

    console.log('🔗 Connecting to PRODUCTION database...')
    console.log('⚠️  URL: https://qrotadbmnkhhwhshijdy.supabase.co')
    console.log('⚠️  WARNING: This will modify your PRODUCTION database!')
    console.log('')
    
    // Confirmation prompt
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const confirm = await new Promise((resolve) => {
      rl.question('Are you sure you want to import to PRODUCTION? (yes/no): ', (answer) => {
        resolve(answer.toLowerCase().trim())
      })
    })
    
    if (confirm !== 'yes') {
      console.log('❌ Production import cancelled.')
      rl.close()
      process.exit(0)
    }
    
    rl.close()
    
    // Check if tables already exist
    console.log('\n1️⃣ Checking existing tables...')
    
    const createResults = await checkProductionTables(supabase)
    
    if (createResults.success) {
      console.log('✅ Tables already exist in production!')
      console.log('🎉 Production database is ready!')
      
    } else {
      console.log('\n⚠️  Manual import required for production.')
      console.log('Using manual SQL approach...')
      await showProductionInstructions(sqlContent)
    }

  } catch (error) {
    console.log('❌ Production import error:', error.message)
    await showProductionInstructions(fs.readFileSync('database_setup.sql', 'utf8'))
  }
}

async function checkProductionTables(supabase) {
  try {
    // Check if tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .from('gardens')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ Tables already exist in production!')
      return { success: true }
    }

    console.log('⚠️  Tables do not exist in production')
    return { success: false }
    
  } catch (error) {
    console.log('⚠️  Could not check production tables:', error.message)
    return { success: false }
  }
}

async function showProductionInstructions(sqlContent) {
  console.log('\n📋 PRODUCTION IMPORT INSTRUCTIONS')
  console.log('='.repeat(50))
  
  console.log('⚠️  WARNING: You are about to modify PRODUCTION database!')
  console.log('')
  console.log('Please follow these steps carefully:')
  console.log('')
  console.log('1. 🌐 Go to: https://qrotadbmnkhhwhshijdy.supabase.co')
  console.log('2. 🔐 Log in to your Supabase dashboard')
  console.log('3. 📊 Click "SQL Editor" in the left sidebar')
  console.log('4. 📋 Create a new query')
  console.log('5. 📝 Copy and paste the SQL below:')
  console.log('')
  console.log('─'.repeat(60))
  console.log(sqlContent)
  console.log('─'.repeat(60))
  console.log('')
  console.log('6. ⚠️  DOUBLE CHECK: Make sure you are in PRODUCTION')
  console.log('7. ▶️  Click "Run" to execute the SQL')
  console.log('8. ✅ Verify you see "Success" message')
  console.log('')
  console.log('⚠️  IMPORTANT: This will create tables with sample data in production!')
  console.log('⚠️  Remove sample data after import if needed.')
  console.log('')
  
  // Interactive confirmation
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question('Have you successfully executed the SQL in PRODUCTION Supabase? (yes/no): ', (answer) => {
      const response = answer.toLowerCase().trim()
      
      if (response === 'yes') {
        console.log('✅ Production schema import confirmed!')
        console.log('🎉 Production database is ready!')
        console.log('')
        console.log('⚠️  NEXT STEPS:')
        console.log('1. Review production data')
        console.log('2. Remove sample data if needed')
        console.log('3. Set up proper access controls')
        console.log('4. Configure production environment variables')
      } else {
        console.log('❌ Please execute the SQL in production first.')
        console.log('Production import cancelled.')
      }
      
      rl.close()
      resolve()
    })
  })
}

importProdSchema()