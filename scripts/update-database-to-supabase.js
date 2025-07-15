#!/usr/bin/env node

/**
 * Database Update Script voor Supabase
 * Update bestaande database met nieuwe bloemen registratie functionaliteit
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuratie
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Test environment configuratie
const TEST_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL_TEST || 'https://dwsgwqosmihsfaxuheji.supabase.co';
const TEST_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY_TEST || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST;

// Kies environment
const isTest = process.env.NODE_ENV === 'test' || process.argv.includes('--test');
const supabaseUrl = isTest ? TEST_SUPABASE_URL : SUPABASE_URL;
const supabaseKey = isTest ? TEST_SUPABASE_SERVICE_KEY : SUPABASE_SERVICE_KEY;

console.log(`🚀 Updating database in ${isTest ? 'TEST' : 'PRODUCTION'} environment`);
console.log(`📍 Supabase URL: ${supabaseUrl}`);

// Initialiseer Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL Migration Scripts
const MIGRATION_SCRIPTS = [
  {
    name: 'Add bloemen registratie fields',
    sql: `
      -- Add new columns to plants table if they don't exist
      ALTER TABLE plants ADD COLUMN IF NOT EXISTS stem_length DECIMAL(8,2);
      ALTER TABLE plants ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE plants ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'eenjarig';
      ALTER TABLE plants ADD COLUMN IF NOT EXISTS bloom_period VARCHAR(100);

      -- Add comments to new columns
      COMMENT ON COLUMN plants.stem_length IS 'Steellengte in cm';
      COMMENT ON COLUMN plants.photo_url IS 'URL naar foto van de plant';
      COMMENT ON COLUMN plants.category IS 'Categorie: eenjarig, vaste_planten, bolgewassen, etc.';
      COMMENT ON COLUMN plants.bloom_period IS 'Bloeiperiode van de plant';

      -- Update existing plants to have category 'eenjarig' if not set
      UPDATE plants SET category = 'eenjarig' WHERE category IS NULL;

      -- Add index for category searches
      CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
    `
  },
  {
    name: 'Verify and update existing schema',
    sql: `
      -- Ensure all required columns exist in plants table
      DO $$ 
      BEGIN
        -- Check if scientific_name column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'plants' AND column_name = 'scientific_name') THEN
          ALTER TABLE plants ADD COLUMN scientific_name VARCHAR(255);
        END IF;

        -- Check if variety column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'plants' AND column_name = 'variety') THEN
          ALTER TABLE plants ADD COLUMN variety VARCHAR(255);
        END IF;

        -- Check if color column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'plants' AND column_name = 'color') THEN
          ALTER TABLE plants ADD COLUMN color VARCHAR(100);
        END IF;

        -- Check if notes column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'plants' AND column_name = 'notes') THEN
          ALTER TABLE plants ADD COLUMN notes TEXT;
        END IF;

        -- Check if care_instructions column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'plants' AND column_name = 'care_instructions') THEN
          ALTER TABLE plants ADD COLUMN care_instructions TEXT;
        END IF;

        -- Check if watering_frequency column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'plants' AND column_name = 'watering_frequency') THEN
          ALTER TABLE plants ADD COLUMN watering_frequency INTEGER;
        END IF;

        -- Check if fertilizer_schedule column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'plants' AND column_name = 'fertilizer_schedule') THEN
          ALTER TABLE plants ADD COLUMN fertilizer_schedule TEXT;
        END IF;
      END $$;
    `
  }
];

// Functie om SQL uit te voeren
async function executeSql(sql, description = 'SQL Query') {
  try {
    console.log(`📝 Executing: ${description}`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Error in ${description}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully executed: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception in ${description}:`, err.message);
    return false;
  }
}

// Functie om database schema te controleren
async function checkDatabaseSchema() {
  console.log('\n🔍 Checking database schema...');
  
  try {
    // Check if plants table exists
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'plants');

    if (error) {
      console.error('❌ Error checking tables:', error);
      return false;
    }

    if (!tables || tables.length === 0) {
      console.log('⚠️  Plants table does not exist. Please run the main database setup first.');
      return false;
    }

    console.log('✅ Plants table exists');
    return true;
  } catch (err) {
    console.error('❌ Error checking database schema:', err.message);
    return false;
  }
}

// Functie om huidige kolommen te controleren
async function checkCurrentColumns() {
  console.log('\n📊 Checking current columns in plants table...');
  
  try {
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'plants');

    if (error) {
      console.error('❌ Error checking columns:', error);
      return false;
    }

    console.log('📋 Current columns in plants table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });

    return true;
  } catch (err) {
    console.error('❌ Error checking columns:', err.message);
    return false;
  }
}

// Functie om migrations uit te voeren
async function runMigrations() {
  console.log('\n🔄 Running database migrations...');
  
  for (const migration of MIGRATION_SCRIPTS) {
    console.log(`\n📝 Running migration: ${migration.name}`);
    const success = await executeSql(migration.sql, migration.name);
    
    if (!success) {
      console.error(`❌ Migration failed: ${migration.name}`);
      return false;
    }
    
    console.log(`✅ Migration completed: ${migration.name}`);
  }
  
  return true;
}

// Functie om updates te verifiëren
async function verifyUpdates() {
  console.log('\n🔍 Verifying database updates...');
  
  try {
    // Check if new columns exist
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'plants')
      .in('column_name', ['stem_length', 'photo_url', 'category', 'bloom_period']);

    if (error) {
      console.error('❌ Error verifying columns:', error);
      return false;
    }

    const requiredColumns = ['stem_length', 'photo_url', 'category', 'bloom_period'];
    const existingColumns = columns.map(col => col.column_name);
    
    console.log('📋 New columns verification:');
    requiredColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });

    return existingColumns.length === requiredColumns.length;
  } catch (err) {
    console.error('❌ Error verifying updates:', err.message);
    return false;
  }
}

// Functie om sample data toe te voegen (optioneel)
async function addSampleData() {
  console.log('\n🌱 Adding sample bloemen data...');
  
  try {
    // Check if there are any existing plants
    const { data: existingPlants, error } = await supabase
      .from('plants')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error checking existing plants:', error);
      return false;
    }

    if (existingPlants && existingPlants.length > 0) {
      console.log('ℹ️  Sample data already exists, skipping...');
      return true;
    }

    // Check if there are plant beds to add plants to
    const { data: plantBeds, error: bedError } = await supabase
      .from('plant_beds')
      .select('id')
      .limit(1);

    if (bedError) {
      console.error('❌ Error checking plant beds:', bedError);
      return false;
    }

    if (!plantBeds || plantBeds.length === 0) {
      console.log('ℹ️  No plant beds available, skipping sample data...');
      return true;
    }

    // Add sample eenjarig plants
    const samplePlants = [
      {
        plant_bed_id: plantBeds[0].id,
        name: 'Zonnebloem',
        scientific_name: 'Helianthus annuus',
        category: 'eenjarig',
        bloom_period: 'Juli-Oktober',
        color: 'Geel, Oranje',
        stem_length: 25.5,
        status: 'healthy',
        planting_date: new Date().toISOString().split('T')[0],
        notes: 'Voorbeeldplant voor nieuwe bloemen registratie'
      },
      {
        plant_bed_id: plantBeds[0].id,
        name: 'Petunia',
        scientific_name: 'Petunia × atkinsiana',
        category: 'eenjarig',
        bloom_period: 'Mei-Oktober',
        color: 'Wit, Roze, Paars, Rood, Blauw',
        stem_length: 15.0,
        status: 'healthy',
        planting_date: new Date().toISOString().split('T')[0],
        notes: 'Populaire hangplant met rijke bloei'
      }
    ];

    const { data, error: insertError } = await supabase
      .from('plants')
      .insert(samplePlants);

    if (insertError) {
      console.error('❌ Error adding sample plants:', insertError);
      return false;
    }

    console.log('✅ Sample bloemen data added successfully');
    return true;
  } catch (err) {
    console.error('❌ Error adding sample data:', err.message);
    return false;
  }
}

// Hoofd functie
async function main() {
  console.log('🌸 Database Update Script voor Bloemen Registratie');
  console.log('=' .repeat(50));
  
  try {
    // Stap 1: Database schema controleren
    const schemaOk = await checkDatabaseSchema();
    if (!schemaOk) {
      console.error('❌ Database schema check failed');
      process.exit(1);
    }

    // Stap 2: Huidige kolommen controleren
    await checkCurrentColumns();

    // Stap 3: Migrations uitvoeren
    const migrationsOk = await runMigrations();
    if (!migrationsOk) {
      console.error('❌ Database migrations failed');
      process.exit(1);
    }

    // Stap 4: Updates verifiëren
    const verifyOk = await verifyUpdates();
    if (!verifyOk) {
      console.error('❌ Database update verification failed');
      process.exit(1);
    }

    // Stap 5: Sample data toevoegen (optioneel)
    if (process.argv.includes('--add-sample-data')) {
      await addSampleData();
    }

    console.log('\n🎉 Database update completed successfully!');
    console.log('✅ All bloemen registratie features are now available');
    console.log('\nNext steps:');
    console.log('1. Test the new plant registration functionality');
    console.log('2. Verify that plant beds can accept new plants');
    console.log('3. Check that the UI shows the new fields correctly');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Script uitvoeren
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, executeSql, checkDatabaseSchema, runMigrations, verifyUpdates };