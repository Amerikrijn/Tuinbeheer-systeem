#!/usr/bin/env node
'use strict';

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log('URL:', supabaseUrl);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    console.log('\n🔍 Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('gardens')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Check what tables exist
    console.log('\n🔍 Checking available tables...');
    
    // Test gardens table
    const { data: gardens, error: gardensError } = await supabase
      .from('gardens')
      .select('id, name, created_at')
      .limit(3);
    
    if (gardensError) {
      console.log('❌ Gardens table error:', gardensError.message);
    } else {
      console.log('✅ Gardens table accessible');
      console.log('   Found', gardens?.length || 0, 'gardens');
      if (gardens && gardens.length > 0) {
        console.log('   Sample garden:', gardens[0].name);
      }
    }
    
    // Test plant_beds table
    const { data: plantBeds, error: plantBedsError } = await supabase
      .from('plant_beds')
      .select('id, name, garden_id, letter_code, created_at')
      .limit(3);
    
    if (plantBedsError) {
      console.log('❌ Plant_beds table error:', plantBedsError.message);
    } else {
      console.log('✅ Plant_beds table accessible');
      console.log('   Found', plantBeds?.length || 0, 'plant beds');
      if (plantBeds && plantBeds.length > 0) {
        console.log('   Sample plant bed:', plantBeds[0].name);
        console.log('   Letter code:', plantBeds[0].letter_code || 'None');
      }
    }
    
    // Test plants table
    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .select('id, name, plant_bed_id, created_at')
      .limit(3);
    
    if (plantsError) {
      console.log('❌ Plants table error:', plantsError.message);
    } else {
      console.log('✅ Plants table accessible');
      console.log('   Found', plants?.length || 0, 'plants');
      if (plants && plants.length > 0) {
        console.log('   Sample plant:', plants[0].name);
      }
    }
    
    // Check if letter_code column exists in plant_beds
    console.log('\n🔍 Checking letter_code system...');
    if (plantBeds && plantBeds.length > 0) {
      const hasLetterCodes = plantBeds.some(bed => bed.letter_code);
      console.log('   Plant beds with letter codes:', hasLetterCodes ? 'Yes' : 'No');
      
      if (hasLetterCodes) {
        const letterCodeCount = plantBeds.filter(bed => bed.letter_code).length;
        console.log('   Count with letter codes:', letterCodeCount);
      }
    }
    
    console.log('\n✅ Database connection test completed');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testDatabaseConnection();