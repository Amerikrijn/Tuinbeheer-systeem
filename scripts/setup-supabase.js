#!/usr/bin/env node

/**
 * ===================================================================
 * TUINBEHEER SYSTEEM - SUPABASE SETUP SCRIPT
 * ===================================================================
 * 
 * This script sets up a new Supabase database for the Garden Management System.
 * It validates credentials, creates the database schema, and seeds initial data.
 * 
 * Usage:
 *   node scripts/setup-supabase.js
 *   node scripts/setup-supabase.js --interactive
 *   node scripts/setup-supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>
 * 
 * ===================================================================
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const error = (message) => log(`❌ ${message}`, colors.red);
const success = (message) => log(`✅ ${message}`, colors.green);
const info = (message) => log(`ℹ️  ${message}`, colors.blue);
const warn = (message) => log(`⚠️  ${message}`, colors.yellow);

// Banner
function showBanner() {
  log('', colors.green);
  log('🌿 ===================================================================', colors.green);
  log('🌿 TUINBEHEER SYSTEEM - SUPABASE SETUP', colors.green);
  log('🌿 Garden Management System Database Configuration', colors.green);
  log('🌿 ===================================================================', colors.green);
  log('');
}

// Validation functions
function validateUrl(url) {
  if (!url) {
    return { valid: false, message: 'URL is required' };
  }
  
  if (!url.startsWith('https://')) {
    return { valid: false, message: 'URL must start with https://' };
  }
  
  if (!url.includes('.supabase.co')) {
    return { valid: false, message: 'URL must be a valid Supabase URL (*.supabase.co)' };
  }
  
  return { valid: true };
}

function validateAnonKey(key) {
  if (!key) {
    return { valid: false, message: 'Anon key is required' };
  }
  
  if (!key.startsWith('eyJ')) {
    return { valid: false, message: 'Anon key must be a valid JWT token (starting with "eyJ")' };
  }
  
  if (key.length < 50) {
    return { valid: false, message: 'Anon key appears to be too short' };
  }
  
  return { valid: true };
}

// Interactive input
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function getCredentialsInteractively() {
  const rl = createReadlineInterface();
  
  info('Please provide your Supabase credentials:');
  info('You can find these in your Supabase dashboard → Settings → API');
  log('');
  
  let url, anonKey;
  
  // Get URL
  while (true) {
    url = await askQuestion(rl, 'Supabase URL (https://your-project.supabase.co): ');
    const validation = validateUrl(url);
    
    if (validation.valid) {
      break;
    } else {
      error(validation.message);
    }
  }
  
  // Get anon key
  while (true) {
    anonKey = await askQuestion(rl, 'Supabase Anon Key (eyJhbGciOiJIUzI1NiIs...): ');
    const validation = validateAnonKey(anonKey);
    
    if (validation.valid) {
      break;
    } else {
      error(validation.message);
    }
  }
  
  rl.close();
  return { url, anonKey };
}

// Environment file management
function updateEnvFile(url, anonKey) {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Create .env.local if it doesn't exist
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      success('Created .env.local from .env.example');
    } else {
      fs.writeFileSync(envPath, '');
      success('Created .env.local file');
    }
  }
  
  // Read existing content
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update or add Supabase URL
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUPABASE_URL=.*/,
      `NEXT_PUBLIC_SUPABASE_URL=${url}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_SUPABASE_URL=${url}`;
  }
  
  // Update or add Supabase anon key
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`;
  }
  
  // Add setup timestamp
  const timestamp = new Date().toISOString();
  if (envContent.includes('SUPABASE_SETUP_TIMESTAMP=')) {
    envContent = envContent.replace(
      /SUPABASE_SETUP_TIMESTAMP=.*/,
      `SUPABASE_SETUP_TIMESTAMP=${timestamp}`
    );
  } else {
    envContent += `\nSUPABASE_SETUP_TIMESTAMP=${timestamp}`;
  }
  
  // Write updated content
  fs.writeFileSync(envPath, envContent);
  success('Updated .env.local with Supabase credentials');
}

// Database setup
async function testConnection(supabase) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function setupDatabase(supabase) {
  info('Setting up database schema...');
  
  // Read SQL setup file
  const sqlPath = path.join(process.cwd(), 'supabase-sql-scripts', 'v1.1.0', 'complete-setup-v1.1.0.sql');
  
  if (!fs.existsSync(sqlPath)) {
    error(`SQL setup file not found: ${sqlPath}`);
    error('Please ensure the supabase-sql-scripts directory exists');
    return { success: false };
  }
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  info(`Executing ${statements.length} SQL statements...`);
  
  let executedStatements = 0;
  let errors = [];
  
  for (const statement of statements) {
    try {
      await supabase.rpc('exec_sql', { sql: statement });
      executedStatements++;
      
      if (executedStatements % 10 === 0) {
        info(`Executed ${executedStatements}/${statements.length} statements`);
      }
    } catch (error) {
      // Log error but continue (some statements might fail due to existing objects)
      warn(`SQL execution warning: ${error.message}`);
      errors.push(error.message);
    }
  }
  
  if (errors.length > 0) {
    warn(`Setup completed with ${errors.length} warnings`);
    info('This is normal for subsequent runs as some objects may already exist');
  }
  
  return { success: true, executedStatements, errors };
}

async function seedSampleData(supabase) {
  info('Seeding sample data...');
  
  try {
    // Check if sample data already exists
    const { data: existingGardens, error: checkError } = await supabase
      .from('gardens')
      .select('id')
      .limit(1);
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingGardens && existingGardens.length > 0) {
      info('Sample data already exists, skipping seeding');
      return { success: true, skipped: true };
    }
    
    // Create sample garden
    const { data: garden, error: gardenError } = await supabase
      .from('gardens')
      .insert({
        name: 'Demo Garden',
        description: 'A sample garden for demonstration purposes',
        location: 'Netherlands',
        canvas_width: 20,
        canvas_height: 20,
        grid_size: 1,
        default_zoom: 1,
        show_grid: true,
        snap_to_grid: true,
        background_color: '#f8fafc'
      })
      .select()
      .single();
    
    if (gardenError) {
      throw gardenError;
    }
    
    // Create sample plant beds
    const plantBeds = [
      {
        id: 'BED001',
        garden_id: garden.id,
        name: 'Vegetable Patch',
        length: 3,
        width: 2,
        position_x: 2,
        position_y: 2,
        visual_width: 3,
        visual_height: 2,
        color_code: '#22c55e'
      },
      {
        id: 'BED002',
        garden_id: garden.id,
        name: 'Flower Border',
        length: 4,
        width: 1,
        position_x: 6,
        position_y: 2,
        visual_width: 4,
        visual_height: 1,
        color_code: '#f59e0b'
      },
      {
        id: 'BED003',
        garden_id: garden.id,
        name: 'Herb Garden',
        length: 2,
        width: 2,
        position_x: 2,
        position_y: 5,
        visual_width: 2,
        visual_height: 2,
        color_code: '#8b5cf6'
      }
    ];
    
    const { error: bedsError } = await supabase
      .from('plant_beds')
      .insert(plantBeds);
    
    if (bedsError) {
      throw bedsError;
    }
    
    success('Sample data seeded successfully');
    return { success: true, garden, plantBeds };
    
  } catch (error) {
    error(`Failed to seed sample data: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main setup function
async function setupSupabase() {
  showBanner();
  
  // Get credentials
  const args = process.argv.slice(2);
  const isInteractive = args.includes('--interactive');
  
  let url, anonKey;
  
  if (isInteractive || args.length === 0) {
    const credentials = await getCredentialsInteractively();
    url = credentials.url;
    anonKey = credentials.anonKey;
  } else if (args.length >= 2) {
    url = args[0];
    anonKey = args[1];
  } else {
    error('Invalid arguments. Usage:');
    error('  node scripts/setup-supabase.js --interactive');
    error('  node scripts/setup-supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
    process.exit(1);
  }
  
  // Validate credentials
  const urlValidation = validateUrl(url);
  const keyValidation = validateAnonKey(anonKey);
  
  if (!urlValidation.valid) {
    error(`Invalid URL: ${urlValidation.message}`);
    process.exit(1);
  }
  
  if (!keyValidation.valid) {
    error(`Invalid anon key: ${keyValidation.message}`);
    process.exit(1);
  }
  
  // Create Supabase client
  info('Creating Supabase client...');
  const supabase = createClient(url, anonKey);
  
  // Test connection
  info('Testing database connection...');
  const connectionTest = await testConnection(supabase);
  
  if (!connectionTest.success) {
    error(`Connection failed: ${connectionTest.error}`);
    error('Please check your credentials and try again');
    process.exit(1);
  }
  
  success('Database connection successful');
  
  // Update environment file
  updateEnvFile(url, anonKey);
  
  // Setup database
  const setupResult = await setupDatabase(supabase);
  
  if (!setupResult.success) {
    error('Database setup failed');
    process.exit(1);
  }
  
  success(`Database setup complete! Executed ${setupResult.executedStatements} statements`);
  
  // Seed sample data
  const seedResult = await seedSampleData(supabase);
  
  if (seedResult.success) {
    if (seedResult.skipped) {
      info('Sample data seeding skipped');
    } else {
      success('Sample data seeded successfully');
    }
  } else {
    warn('Sample data seeding failed, but database setup is complete');
  }
  
  // Final success message
  log('');
  log('🎉 ===================================================================', colors.green);
  log('🎉 SETUP COMPLETE!', colors.green);
  log('🎉 ===================================================================', colors.green);
  log('');
  success('Your Supabase database is now configured and ready to use!');
  log('');
  info('Next steps:');
  info('1. Start the development server: npm run dev');
  info('2. Open http://localhost:3000 in your browser');
  info('3. Check out the Visual Garden Designer at /visual-garden-demo');
  log('');
  info('Need help? Check the documentation:');
  info('- User Guide: docs/guides/users/README.md');
  info('- Developer Guide: docs/guides/developers/README.md');
  info('- Troubleshooting: docs/setup/troubleshooting.md');
  log('');
}

// Error handling
process.on('unhandledRejection', (error) => {
  error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  log('');
  warn('Setup cancelled by user');
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  setupSupabase().catch((error) => {
    error(`Setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupSupabase };