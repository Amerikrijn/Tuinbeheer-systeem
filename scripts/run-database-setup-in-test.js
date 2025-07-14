#!/usr/bin/env node

/**
 * VOER DATABASE SETUP UIT IN TEST
 * Dit script voert de database_setup.sql uit in je test database
 */

const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

// Test database
const testSupabase = createClient(
  'https://dwsgwqosmihsfaxuheji.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
)

async function runDatabaseSetup() {
  console.log('🗄️  DATABASE SETUP - Test Environment')
  console.log('=' .repeat(50))
  
  try {
    // Stap 1: Lees database_setup.sql
    console.log('1. Lezen database_setup.sql...')
    
    if (!fs.existsSync('database_setup.sql')) {
      console.log('❌ database_setup.sql niet gevonden!')
      return
    }
    
    const sqlContent = fs.readFileSync('database_setup.sql', 'utf8')
    console.log('✅ Database setup script gelezen')
    
    // Stap 2: Voer SQL statements uit
    console.log('\n2. Uitvoeren SQL statements...')
    
    // Split SQL in statements (basic splitting)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`   Gevonden ${statements.length} SQL statements`)
    
    // Stap 3: Voer elke statement uit via RPC
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.length === 0) continue
      
      try {
        console.log(`   Uitvoeren statement ${i + 1}/${statements.length}...`)
        
        // Voer SQL uit via RPC
        const { data, error } = await testSupabase.rpc('exec_sql', {
          sql: statement
        })
        
        if (error) {
          console.log(`   ❌ Fout bij statement ${i + 1}: ${error.message}`)
          errorCount++
        } else {
          console.log(`   ✅ Statement ${i + 1} succesvol`)
          successCount++
        }
        
      } catch (err) {
        console.log(`   ❌ Onverwachte fout bij statement ${i + 1}: ${err.message}`)
        errorCount++
      }
    }
    
    // Stap 4: Test de tabellen
    console.log('\n3. Testen tabellen...')
    
    const tables = ['gardens', 'plant_beds', 'plants']
    
    for (const table of tables) {
      try {
        const { data, error } = await testSupabase.from(table).select('*').limit(1)
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`)
        } else {
          console.log(`   ✅ ${table}: OK`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`)
      }
    }
    
    // Stap 5: Samenvatting
    console.log('\n4. Samenvatting:')
    console.log(`   ✅ Succesvol: ${successCount} statements`)
    console.log(`   ❌ Fouten: ${errorCount} statements`)
    
    if (errorCount === 0) {
      console.log('\n🎉 DATABASE SETUP VOLTOOID!')
      console.log('Je test database is nu klaar voor gebruik')
    } else {
      console.log('\n⚠️  DATABASE SETUP GEDEELTELIJK VOLTOOID')
      console.log('Er waren enkele fouten, controleer hierboven')
    }
    
  } catch (error) {
    console.log('❌ Onverwachte fout:', error.message)
  }
}

runDatabaseSetup()