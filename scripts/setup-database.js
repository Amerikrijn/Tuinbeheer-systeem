#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Database Setup Script');
console.log('========================');

// Check if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  console.error('');
  console.error('Please set these variables in your .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('');

async function setupDatabase() {
  try {
    console.log('🔍 Importing Supabase client...');
    const { createClient } = await import('@supabase/supabase-js');
    
    console.log('🔍 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('gardens')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    
    console.log('✅ Database connection successful');
    console.log('');
    
    // Check current database status
    console.log('🔍 Checking current database status...');
    
    // Check if plant_beds table exists and has letter_code column
    const { data: plantBeds, error: plantBedsError } = await supabase
      .from('plant_beds')
      .select('id, name, garden_id, letter_code')
      .limit(5);
    
    if (plantBedsError) {
      console.log('❌ plant_beds table error:', plantBedsError.message);
      console.log('   This suggests the table might not exist yet');
    } else {
      console.log('✅ plant_beds table accessible');
      console.log(`   Found ${plantBeds?.length || 0} plant beds`);
      
      if (plantBeds && plantBeds.length > 0) {
        const hasLetterCodes = plantBeds.some(bed => bed.letter_code);
        console.log(`   Plant beds with letter codes: ${hasLetterCodes ? 'Yes' : 'No'}`);
        
        if (hasLetterCodes) {
          const letterCodeCount = plantBeds.filter(bed => bed.letter_code).length;
          console.log(`   Count with letter codes: ${letterCodeCount}`);
        }
      }
    }
    
    console.log('');
    
    // Check if plants table exists
    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .select('id, name, plant_bed_id')
      .limit(5);
    
    if (plantsError) {
      console.log('❌ plants table error:', plantsError.message);
    } else {
      console.log('✅ plants table accessible');
      console.log(`   Found ${plants?.length || 0} plants`);
    }
    
    console.log('');
    console.log('📋 Database Status Summary:');
    console.log('============================');
    
    if (plantBedsError) {
      console.log('❌ plant_beds table: Not accessible');
      console.log('   Action needed: Create plant_beds table');
    } else {
      console.log('✅ plant_beds table: Accessible');
      if (plantBeds && plantBeds.length > 0) {
        const hasLetterCodes = plantBeds.some(bed => bed.letter_code);
        if (hasLetterCodes) {
          console.log('✅ letter_code system: Already implemented');
        } else {
          console.log('❌ letter_code system: Missing');
          console.log('   Action needed: Implement letter code system');
        }
      }
    }
    
    if (plantsError) {
      console.log('❌ plants table: Not accessible');
      console.log('   Action needed: Create plants table');
    } else {
      console.log('✅ plants table: Accessible');
    }
    
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('===============');
    
    if (plantBedsError || plantsError) {
      console.log('1. Run the database migration scripts to create missing tables');
      console.log('2. Set up the letter code system');
      console.log('3. Test the database connection again');
    } else if (plantBeds && plantBeds.length > 0 && !plantBeds.some(bed => bed.letter_code)) {
      console.log('1. Run the letter code system migration');
      console.log('2. Update existing plant beds with letter codes');
      console.log('3. Test the system');
    } else {
      console.log('✅ Database appears to be properly set up!');
      console.log('   You can now use the application normally');
    }
    
    console.log('');
    console.log('📚 Available migration scripts:');
    console.log('   - database/fix_letter_code_system.sql');
    console.log('   - database/implement_missing_parts.sql');
    console.log('');
    console.log('💡 To run a migration script:');
    console.log('   npm run db:exec-sql database/fix_letter_code_system.sql');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('');
    console.error('Troubleshooting tips:');
    console.error('1. Check your Supabase credentials');
    console.error('2. Ensure your database is running');
    console.error('3. Check if you have the right permissions');
    process.exit(1);
  }
}

setupDatabase();