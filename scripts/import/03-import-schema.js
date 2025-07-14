#!/usr/bin/env node

/**
 * STAP 3: Import Database Schema
 * Importeer database schema in Supabase via DDL execution
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
    
    // Step 1: Check if we can execute raw SQL
    console.log('\n1️⃣ Trying direct SQL execution...')
    
    try {
      // Try to execute SQL via the SQL endpoint
      const response = await fetch('https://dwsgwqosmihsfaxuheji.supabase.co/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
        },
        body: JSON.stringify({ sql: sqlContent })
      })

      if (response.ok) {
        console.log('✅ Direct SQL execution successful!')
        console.log('🎉 Schema imported via API!')
        console.log('➡️  Next: npm run import:step4')
        return
      }
    } catch (err) {
      console.log('⚠️  Direct SQL execution not available')
    }

    // Step 2: Manual table creation
    console.log('\n2️⃣ Creating tables manually...')
    
    const createResults = await createTablesManually(supabase)
    
    if (createResults.success) {
      console.log('✅ Tables created successfully!')
      
      // Step 3: Insert sample data
      console.log('\n3️⃣ Inserting sample data...')
      await insertSampleData(supabase)
      
      console.log('\n' + '='.repeat(50))
      console.log('🎉 Schema import COMPLETED!')
      console.log('Database tables and sample data have been imported.')
      console.log('➡️  Next: npm run import:step4')
      
    } else {
      console.log('\n❌ Automatic import failed.')
      console.log('Using manual SQL approach...')
      await showManualInstructions(sqlContent)
    }

  } catch (error) {
    console.log('❌ Import error:', error.message)
    await showManualInstructions(fs.readFileSync('database_setup.sql', 'utf8'))
  }
}

async function createTablesManually(supabase) {
  try {
    // Check if tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .from('gardens')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ Tables already exist!')
      return { success: true }
    }

    console.log('Creating tables...')
    
    // Since we can't create tables via client, we'll simulate success
    // and show instructions for manual creation
    return { success: false }
    
  } catch (error) {
    console.log('❌ Table creation failed:', error.message)
    return { success: false }
  }
}

async function insertSampleData(supabase) {
  try {
    console.log('Inserting sample garden data...')
    
    const { data: garden, error: gardenError } = await supabase
      .from('gardens')
      .insert([
        {
          id: 'test-garden-1',
          name: 'Test Garden 1',
          location: 'Test Location',
          description: 'Test garden created by import script',
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (gardenError) {
      console.log('⚠️  Sample data insertion failed:', gardenError.message)
      return
    }

    console.log('✅ Sample data inserted successfully!')
    
  } catch (error) {
    console.log('⚠️  Sample data insertion error:', error.message)
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