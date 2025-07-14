#!/usr/bin/env node

/**
 * COPY DATABASE - Van productie naar test
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

async function copyDatabase() {
  console.log('📋 KOPIËREN DATABASE - Productie → Test')
  console.log('=' .repeat(50))
  
  try {
    // Stap 1: Kopieer gardens
    console.log('1. Kopiëren gardens...')
    const { data: gardens, error: gardensError } = await prodSupabase
      .from('gardens')
      .select('*')
    
    if (gardensError) {
      console.log('❌ Fout bij lezen gardens:', gardensError.message)
      return
    }
    
    console.log(`   Gevonden ${gardens.length} gardens`)
    
    // Eerst schema aanmaken in test database
    console.log('2. Schema aanmaken in test database...')
    // Je moet nog steeds de database schema aanmaken (tables)
    console.log('   ⚠️  Je moet nog steeds de SQL schema uitvoeren in test database!')
    console.log('   Run: npm run test:step3 voor de SQL')
    
    // Insereer data
    if (gardens.length > 0) {
      console.log('3. Insereren gardens in test database...')
      const { error: insertError } = await testSupabase
        .from('gardens')
        .upsert(gardens)
      
      if (insertError) {
        console.log('❌ Fout bij insereren gardens:', insertError.message)
        return
      }
      
      console.log(`   ✅ ${gardens.length} gardens gekopieerd`)
    }
    
    // Stap 2: Kopieer plant_beds
    console.log('4. Kopiëren plant_beds...')
    const { data: beds, error: bedsError } = await prodSupabase
      .from('plant_beds')
      .select('*')
    
    if (bedsError) {
      console.log('❌ Fout bij lezen plant_beds:', bedsError.message)
      return
    }
    
    if (beds.length > 0) {
      const { error: insertBedsError } = await testSupabase
        .from('plant_beds')
        .upsert(beds)
      
      if (insertBedsError) {
        console.log('❌ Fout bij insereren plant_beds:', insertBedsError.message)
        return
      }
      
      console.log(`   ✅ ${beds.length} plant_beds gekopieerd`)
    }
    
    // Stap 3: Kopieer plants
    console.log('5. Kopiëren plants...')
    const { data: plants, error: plantsError } = await prodSupabase
      .from('plants')
      .select('*')
    
    if (plantsError) {
      console.log('❌ Fout bij lezen plants:', plantsError.message)
      return
    }
    
    if (plants.length > 0) {
      const { error: insertPlantsError } = await testSupabase
        .from('plants')
        .upsert(plants)
      
      if (insertPlantsError) {
        console.log('❌ Fout bij insereren plants:', insertPlantsError.message)
        return
      }
      
      console.log(`   ✅ ${plants.length} plants gekopieerd`)
    }
    
    console.log('\n🎉 DATABASE KOPIE VOLTOOID!')
    console.log('Je test database heeft nu dezelfde data als productie')
    
  } catch (error) {
    console.log('❌ Onverwachte fout:', error.message)
  }
}

copyDatabase()