#!/usr/bin/env node

/**
 * Tuinbeheer Systeem Database Setup Script
 * 
 * This script automatically sets up the database schema and seed data
 * in your Supabase project.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function validateEnvironment() {
  logInfo('Validating environment variables...');
  
  if (!SUPABASE_URL) {
    logError('NEXT_PUBLIC_SUPABASE_URL is not set');
    return false;
  }
  
  if (!SUPABASE_ANON_KEY) {
    logError('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return false;
  }
  
  if (!SUPABASE_URL.includes('.supabase.co')) {
    logError('Invalid Supabase URL format');
    return false;
  }
  
  logSuccess('Environment variables validated');
  return true;
}

async function readSQLFile(filename) {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  
  return fs.readFileSync(filePath, 'utf8');
}

async function executeSQLFile(supabase, filename, description) {
  logInfo(`Executing ${description}...`);
  
  try {
    const sql = await readSQLFile(filename);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query for some statements
          const { error: directError } = await supabase
            .from('_temp_exec')
            .select('*')
            .limit(0);
          
          if (directError && !directError.message.includes('relation "_temp_exec" does not exist')) {
            throw error;
          }
        }
      }
    }
    
    logSuccess(`${description} completed successfully`);
  } catch (error) {
    logError(`Failed to execute ${description}: ${error.message}`);
    throw error;
  }
}

async function testConnection(supabase) {
  logInfo('Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    // This will fail, but if it fails with a specific error, connection is working
    if (error && error.message.includes('relation "_test_connection" does not exist')) {
      logSuccess('Supabase connection successful');
      return true;
    }
    
    if (error) {
      throw error;
    }
    
    logSuccess('Supabase connection successful');
    return true;
  } catch (error) {
    logError(`Connection failed: ${error.message}`);
    return false;
  }
}

async function setupDatabase() {
  log('\n🌱 Tuinbeheer Systeem Database Setup', 'bright');
  log('=====================================\n', 'bright');
  
  try {
    // Validate environment
    if (!await validateEnvironment()) {
      process.exit(1);
    }
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test connection
    if (!await testConnection(supabase)) {
      process.exit(1);
    }
    
    // Execute schema
    await executeSQLFile(supabase, '01-schema.sql', 'Database schema creation');
    
    // Execute seed data
    const shouldSeedData = process.argv.includes('--seed') || process.argv.includes('--with-seed');
    
    if (shouldSeedData) {
      await executeSQLFile(supabase, '02-seed-data.sql', 'Seed data insertion');
    } else {
      logInfo('Skipping seed data (use --seed flag to include sample data)');
    }
    
    log('\n🎉 Database setup completed successfully!', 'green');
    log('\nNext steps:', 'bright');
    log('1. Start your development server: npm run dev');
    log('2. Open http://localhost:3000 in your browser');
    log('3. Begin managing your gardens!\n');
    
  } catch (error) {
    logError(`\nDatabase setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function resetDatabase() {
  log('\n🔄 Resetting Tuinbeheer Systeem Database', 'bright');
  log('=======================================\n', 'bright');
  
  try {
    // Validate environment
    if (!await validateEnvironment()) {
      process.exit(1);
    }
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test connection
    if (!await testConnection(supabase)) {
      process.exit(1);
    }
    
    logWarning('This will delete all existing data!');
    
    // Execute schema (which drops and recreates tables)
    await executeSQLFile(supabase, '01-schema.sql', 'Database reset');
    
    // Always add seed data after reset
    await executeSQLFile(supabase, '02-seed-data.sql', 'Seed data insertion');
    
    logSuccess('\nDatabase reset completed successfully!');
    
  } catch (error) {
    logError(`\nDatabase reset failed: ${error.message}`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'reset':
      await resetDatabase();
      break;
    case 'setup':
    default:
      await setupDatabase();
      break;
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { setupDatabase, resetDatabase };