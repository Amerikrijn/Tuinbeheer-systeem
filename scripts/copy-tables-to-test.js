#!/usr/bin/env node

/**
 * KOPIEER TABELLEN - Van productie naar test
 * Dit script kopieert het database schema (tabellen) van productie naar test
 */

const { createClient } = require('@supabase/supabase-js')

// Productie database (bron)
const prodSupabase = createClient(
  'https://qrotadbmnkhhwhshijdy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
)

// Test database (bestemming)
const testSupabase = createClient(
  'https://dwsgwqosmihsfaxuheji.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
)

async function copyTables() {
  console.log('📋 KOPIËREN TABELLEN - Productie Schema → Test')
  console.log('=' .repeat(50))
  
  try {
    // Stap 1: Haal alle tabellen op uit productie
    console.log('1. Ophalen productie tabellen...')
    
    // Check welke tabellen bestaan in productie
    const tables = ['gardens', 'plant_beds', 'plants']
    const existingTables = []
    
    for (const table of tables) {
      try {
        const { data, error } = await prodSupabase.from(table).select('*').limit(1)
        if (!error) {
          existingTables.push(table)
          console.log(`   ✅ ${table} - EXISTS`)
        } else {
          console.log(`   ❌ ${table} - NOT FOUND`)
        }
      } catch (err) {
        console.log(`   ❌ ${table} - ERROR: ${err.message}`)
      }
    }
    
    if (existingTables.length === 0) {
      console.log('❌ Geen tabellen gevonden in productie!')
      return
    }
    
    // Stap 2: Kopieer de data van elke tabel
    console.log('\n2. Kopiëren tabel data...')
    
    for (const table of existingTables) {
      try {
        console.log(`   Kopiëren ${table}...`)
        
        // Haal alle data op van productie
        const { data: prodData, error: prodError } = await prodSupabase
          .from(table)
          .select('*')
        
        if (prodError) {
          console.log(`   ❌ Fout bij lezen ${table}:`, prodError.message)
          continue
        }
        
        console.log(`   Gevonden ${prodData.length} records`)
        
        if (prodData.length > 0) {
          // Eerst proberen alle bestaande data te verwijderen uit test
          const { error: deleteError } = await testSupabase
            .from(table)
            .delete()
            .neq('id', 'dummy-never-exists')
          
          if (deleteError) {
            console.log(`   ⚠️  Kon ${table} niet legen:`, deleteError.message)
          }
          
          // Insereer productie data in test
          const { error: insertError } = await testSupabase
            .from(table)
            .insert(prodData)
          
          if (insertError) {
            console.log(`   ❌ Fout bij insereren ${table}:`, insertError.message)
          } else {
            console.log(`   ✅ ${prodData.length} records gekopieerd naar ${table}`)
          }
        }
        
      } catch (err) {
        console.log(`   ❌ Onverwachte fout bij ${table}:`, err.message)
      }
    }
    
    // Stap 3: Verificatie
    console.log('\n3. Verificatie...')
    
    for (const table of existingTables) {
      try {
        const { data: testData, error: testError } = await testSupabase
          .from(table)
          .select('*')
        
        if (testError) {
          console.log(`   ❌ ${table}: ${testError.message}`)
        } else {
          console.log(`   ✅ ${table}: ${testData.length} records`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`)
      }
    }
    
    console.log('\n🎉 TABELLEN KOPIE VOLTOOID!')
    console.log('Je test database heeft nu dezelfde tabellen en data als productie')
    
  } catch (error) {
    console.log('❌ Onverwachte fout:', error.message)
  }
}

copyTables()