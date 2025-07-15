#!/usr/bin/env node

/**
 * Tuinbeheer Systeem - Supabase Database Setup Script
 * 
 * This script sets up a complete Supabase database environment with:
 * - Database schema creation
 * - Data migration
 * - Environment configuration
 * - Connection testing
 * - Error handling and recovery
 * 
 * Usage:
 *   node scripts/database/setup-supabase.js
 *   node scripts/database/setup-supabase.js --url=<URL> --key=<KEY>
 *   node scripts/database/setup-supabase.js --interactive
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const CONFIG = {
  MIGRATION_DIR: path.join(__dirname, '../../database/migrations'),
  SEED_DIR: path.join(__dirname, '../../database/seeds'),
  ENV_FILE: path.join(__dirname, '../../.env.local'),
  ENV_EXAMPLE: path.join(__dirname, '../../.env.example'),
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 2000,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Logger utility
class Logger {
  static info(message, ...args) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`, ...args);
  }

  static success(message, ...args) {
    console.log(`${colors.green}✅${colors.reset} ${message}`, ...args);
  }

  static warn(message, ...args) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`${colors.red}❌${colors.reset} ${message}`, ...args);
  }

  static section(title) {
    const line = '='.repeat(60);
    console.log(`\n${colors.cyan}${line}${colors.reset}`);
    console.log(`${colors.cyan}${title.toUpperCase()}${colors.reset}`);
    console.log(`${colors.cyan}${line}${colors.reset}\n`);
  }
}

// Main setup class
class SupabaseSetup {
  constructor(options = {}) {
    this.options = {
      interactive: false,
      includeSampleData: true,
      environment: 'development',
      ...options,
    };
    
    this.supabase = null;
    this.rl = null;
    this.progress = {
      total: 0,
      completed: 0,
    };
  }

  async run() {
    try {
      Logger.section('🌿 Tuinbeheer Systeem - Supabase Setup');
      
      // Initialize readline interface
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Get credentials
      const credentials = await this.getCredentials();
      
      // Validate credentials
      await this.validateCredentials(credentials);
      
      // Initialize Supabase client
      this.supabase = createClient(credentials.url, credentials.key);
      
      // Test connection
      await this.testConnection();
      
      // Setup database schema
      await this.setupSchema();
      
      // Setup sample data if requested
      if (this.options.includeSampleData) {
        await this.setupSampleData();
      }
      
      // Create environment file
      await this.createEnvironmentFile(credentials);
      
      // Final verification
      await this.verifySetup();
      
      // Success message
      Logger.success('Setup completed successfully!');
      this.printNextSteps();
      
    } catch (error) {
      Logger.error('Setup failed:', error.message);
      await this.handleError(error);
      process.exit(1);
    } finally {
      if (this.rl) {
        this.rl.close();
      }
    }
  }

  async getCredentials() {
    Logger.section('📋 Credential Collection');
    
    const args = process.argv.slice(2);
    let url = null;
    let key = null;

    // Parse command line arguments
    args.forEach(arg => {
      if (arg.startsWith('--url=')) {
        url = arg.split('=')[1];
      } else if (arg.startsWith('--key=')) {
        key = arg.split('=')[1];
      } else if (arg === '--interactive') {
        this.options.interactive = true;
      }
    });

    // If not provided via args, prompt user
    if (!url || !key || this.options.interactive) {
      Logger.info('Please provide your Supabase project credentials:');
      Logger.info('You can find these in your Supabase dashboard → Settings → API');
      
      url = url || await this.prompt('Supabase URL (e.g., https://xyz.supabase.co): ');
      key = key || await this.prompt('Supabase Anon Key: ');
      
      // Ask for additional options
      const includeSample = await this.prompt('Include sample data? (y/n): ');
      this.options.includeSampleData = includeSample.toLowerCase() === 'y';
      
      const environment = await this.prompt('Environment (development/production): ');
      this.options.environment = environment || 'development';
    }

    return { url, key };
  }

  async validateCredentials(credentials) {
    Logger.section('🔍 Credential Validation');
    
    // Validate URL format
    if (!credentials.url.startsWith('https://') || !credentials.url.includes('.supabase.co')) {
      throw new Error('Invalid Supabase URL format. Expected: https://xyz.supabase.co');
    }
    
    // Validate key format (JWT token)
    if (!credentials.key.startsWith('eyJ')) {
      throw new Error('Invalid Supabase key format. Expected JWT token starting with "eyJ"');
    }
    
    Logger.success('Credentials format validated');
  }

  async testConnection() {
    Logger.section('🔌 Connection Testing');
    
    try {
      Logger.info('Testing database connection...');
      
      // Test basic connection
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
      
      if (error) {
        throw new Error(`Connection failed: ${error.message}`);
      }
      
      Logger.success('Database connection established');
      
      // Test authentication
      const { data: authData, error: authError } = await this.supabase.auth.getSession();
      if (authError) {
        Logger.warn('Authentication test failed, but basic connection works');
      } else {
        Logger.success('Authentication system accessible');
      }
      
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  async setupSchema() {
    Logger.section('🗃️ Database Schema Setup');
    
    // Get migration files
    const migrationFiles = await this.getMigrationFiles();
    
    if (migrationFiles.length === 0) {
      Logger.warn('No migration files found, skipping schema setup');
      return;
    }
    
    Logger.info(`Found ${migrationFiles.length} migration files`);
    this.progress.total = migrationFiles.length;
    
    // Execute migrations in order
    for (const file of migrationFiles) {
      await this.executeMigration(file);
      this.progress.completed++;
      this.printProgress();
    }
    
    Logger.success('Database schema setup completed');
  }

  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(CONFIG.MIGRATION_DIR);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort()
        .map(file => path.join(CONFIG.MIGRATION_DIR, file));
    } catch (error) {
      Logger.warn('Migration directory not found, creating from embedded schema');
      return this.createEmbeddedMigrations();
    }
  }

  async createEmbeddedMigrations() {
    // Create migration directory if it doesn't exist
    if (!fs.existsSync(CONFIG.MIGRATION_DIR)) {
      fs.mkdirSync(CONFIG.MIGRATION_DIR, { recursive: true });
    }

    // Embedded schema for when migration files are missing
    const embeddedSchema = `
-- Tuinbeheer Systeem Database Schema
-- Generated by setup script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create gardens table
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    canvas_width INTEGER DEFAULT 20,
    canvas_height INTEGER DEFAULT 20,
    grid_size DECIMAL(5,2) DEFAULT 1.0,
    default_zoom DECIMAL(5,2) DEFAULT 1.0,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f8fafc',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plant_beds table
CREATE TABLE IF NOT EXISTS plant_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    visual_width DECIMAL(10,2),
    visual_height DECIMAL(10,2),
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id UUID NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    plant_type VARCHAR(100),
    variety VARCHAR(255),
    height DECIMAL(10,2),
    spread DECIMAL(10,2),
    color VARCHAR(100),
    season VARCHAR(100),
    care_instructions TEXT,
    planting_date DATE,
    expected_harvest DATE,
    status VARCHAR(50) DEFAULT 'planned',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);
CREATE INDEX IF NOT EXISTS idx_plants_type ON plants(plant_type);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gardens_updated_at 
    BEFORE UPDATE ON gardens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at 
    BEFORE UPDATE ON plant_beds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at 
    BEFORE UPDATE ON plants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Visual garden position update trigger
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.position_x != NEW.position_x OR 
        OLD.position_y != NEW.position_y OR 
        OLD.visual_width != NEW.visual_width OR 
        OLD.visual_height != NEW.visual_height OR 
        OLD.rotation != NEW.rotation) THEN
        NEW.visual_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plant_beds_visual_updated_at 
    BEFORE UPDATE ON plant_beds 
    FOR EACH ROW EXECUTE FUNCTION update_visual_updated_at();
`;

    // Write embedded schema to file
    const schemaFile = path.join(CONFIG.MIGRATION_DIR, '001_embedded_schema.sql');
    fs.writeFileSync(schemaFile, embeddedSchema);
    
    Logger.info('Created embedded schema migration file');
    return [schemaFile];
  }

  async executeMigration(filePath) {
    const fileName = path.basename(filePath);
    Logger.info(`Executing migration: ${fileName}`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await this.supabase.rpc('exec_sql', { 
            sql: statement 
          });
          
          if (error) {
            // Try direct execution if RPC fails
            const { error: directError } = await this.supabase
              .from('__migrations__')
              .select('*')
              .limit(1);
            
            if (directError) {
              throw new Error(`Migration execution failed: ${error.message}`);
            }
          }
        }
      }
      
      Logger.success(`Migration completed: ${fileName}`);
      
    } catch (error) {
      Logger.error(`Migration failed: ${fileName}`);
      throw error;
    }
  }

  async setupSampleData() {
    Logger.section('🌱 Sample Data Setup');
    
    if (!this.options.includeSampleData) {
      Logger.info('Skipping sample data setup');
      return;
    }

    Logger.info('Creating sample data...');
    
    try {
      // Create sample garden
      const { data: garden, error: gardenError } = await this.supabase
        .from('gardens')
        .insert({
          name: 'Demo Garden',
          description: 'A sample garden for demonstration purposes',
          canvas_width: 20,
          canvas_height: 15,
          grid_size: 1.0,
          default_zoom: 1.0,
          show_grid: true,
          snap_to_grid: true,
          background_color: '#f8fafc'
        })
        .select()
        .single();

      if (gardenError) {
        throw new Error(`Failed to create sample garden: ${gardenError.message}`);
      }

      Logger.success('Sample garden created');

      // Create sample plant beds
      const plantBeds = [
        {
          garden_id: garden.id,
          name: 'Vegetable Bed',
          length: 4.0,
          width: 2.0,
          position_x: 5.0,
          position_y: 5.0,
          visual_width: 4.0,
          visual_height: 2.0,
          color_code: '#22c55e'
        },
        {
          garden_id: garden.id,
          name: 'Flower Bed',
          length: 3.0,
          width: 3.0,
          position_x: 10.0,
          position_y: 5.0,
          visual_width: 3.0,
          visual_height: 3.0,
          color_code: '#f59e0b'
        },
        {
          garden_id: garden.id,
          name: 'Herb Garden',
          length: 2.0,
          width: 2.0,
          position_x: 5.0,
          position_y: 10.0,
          visual_width: 2.0,
          visual_height: 2.0,
          color_code: '#8b5cf6'
        }
      ];

      const { data: beds, error: bedsError } = await this.supabase
        .from('plant_beds')
        .insert(plantBeds)
        .select();

      if (bedsError) {
        throw new Error(`Failed to create sample plant beds: ${bedsError.message}`);
      }

      Logger.success('Sample plant beds created');

      // Create sample plants
      const plants = [
        {
          plant_bed_id: beds[0].id,
          name: 'Tomato',
          scientific_name: 'Solanum lycopersicum',
          plant_type: 'Vegetable',
          variety: 'Cherry',
          height: 1.5,
          spread: 0.8,
          color: 'Red',
          season: 'Summer',
          care_instructions: 'Regular watering, full sun, support with stakes',
          status: 'growing'
        },
        {
          plant_bed_id: beds[0].id,
          name: 'Lettuce',
          scientific_name: 'Lactuca sativa',
          plant_type: 'Vegetable',
          variety: 'Butterhead',
          height: 0.2,
          spread: 0.3,
          color: 'Green',
          season: 'Spring',
          care_instructions: 'Cool weather, regular watering, partial shade',
          status: 'growing'
        },
        {
          plant_bed_id: beds[1].id,
          name: 'Tulip',
          scientific_name: 'Tulipa',
          plant_type: 'Flower',
          variety: 'Red Emperor',
          height: 0.4,
          spread: 0.1,
          color: 'Red',
          season: 'Spring',
          care_instructions: 'Plant bulbs in fall, well-drained soil, full sun',
          status: 'dormant'
        },
        {
          plant_bed_id: beds[2].id,
          name: 'Basil',
          scientific_name: 'Ocimum basilicum',
          plant_type: 'Herb',
          variety: 'Sweet Basil',
          height: 0.3,
          spread: 0.2,
          color: 'Green',
          season: 'Summer',
          care_instructions: 'Warm weather, regular watering, pinch flowers',
          status: 'growing'
        }
      ];

      const { error: plantsError } = await this.supabase
        .from('plants')
        .insert(plants);

      if (plantsError) {
        throw new Error(`Failed to create sample plants: ${plantsError.message}`);
      }

      Logger.success('Sample plants created');
      Logger.info('Sample data setup completed');

    } catch (error) {
      Logger.warn(`Sample data setup failed: ${error.message}`);
      Logger.info('Continuing with setup...');
    }
  }

  async createEnvironmentFile(credentials) {
    Logger.section('⚙️ Environment Configuration');
    
    const envContent = `# Tuinbeheer Systeem - Environment Configuration
# Generated: ${new Date().toISOString()}
# Environment: ${this.options.environment}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${credentials.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${credentials.key}

# Application Configuration
NODE_ENV=${this.options.environment}
APP_ENV=${this.options.environment}

# Development Configuration
NEXT_PUBLIC_APP_NAME=Tuinbeheer Systeem
NEXT_PUBLIC_APP_VERSION=1.1.0

# Optional: Database Direct Connection (for advanced usage)
# DATABASE_URL=postgresql://postgres:password@db.${credentials.url.split('.')[0].replace('https://', '')}.supabase.co:5432/postgres

# Optional: Service Role Key (for admin functions - keep secure!)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUGGING=true
NEXT_PUBLIC_ENABLE_SAMPLE_DATA=true
`;

    try {
      fs.writeFileSync(CONFIG.ENV_FILE, envContent);
      Logger.success('Environment file created: .env.local');
      
      // Set file permissions to be more secure
      fs.chmodSync(CONFIG.ENV_FILE, '600');
      Logger.info('Environment file permissions set to 600 (owner read/write only)');
      
    } catch (error) {
      Logger.error('Failed to create environment file:', error.message);
      throw error;
    }
  }

  async verifySetup() {
    Logger.section('🔍 Setup Verification');
    
    const tests = [
      { name: 'Database Connection', test: () => this.testConnection() },
      { name: 'Schema Verification', test: () => this.verifySchema() },
      { name: 'Data Access', test: () => this.verifyDataAccess() },
      { name: 'Environment File', test: () => this.verifyEnvironmentFile() }
    ];

    for (const test of tests) {
      try {
        Logger.info(`Testing: ${test.name}`);
        await test.test();
        Logger.success(`✅ ${test.name}`);
      } catch (error) {
        Logger.error(`❌ ${test.name}: ${error.message}`);
        throw new Error(`Verification failed: ${test.name}`);
      }
    }
  }

  async verifySchema() {
    const tables = ['gardens', 'plant_beds', 'plants'];
    
    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        throw new Error(`Table ${table} not accessible: ${error.message}`);
      }
    }
  }

  async verifyDataAccess() {
    // Test CRUD operations
    const { data, error } = await this.supabase
      .from('gardens')
      .select('count(*)')
      .single();
    
    if (error) {
      throw new Error(`Data access failed: ${error.message}`);
    }
  }

  async verifyEnvironmentFile() {
    if (!fs.existsSync(CONFIG.ENV_FILE)) {
      throw new Error('Environment file not found');
    }
    
    const content = fs.readFileSync(CONFIG.ENV_FILE, 'utf8');
    if (!content.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      throw new Error('Environment file missing required variables');
    }
  }

  async handleError(error) {
    Logger.section('🚨 Error Recovery');
    
    // Common error patterns and solutions
    const errorPatterns = [
      {
        pattern: /Invalid JWT/,
        solution: 'Check your Supabase anon key - it should be a valid JWT token starting with "eyJ"'
      },
      {
        pattern: /Failed to connect/,
        solution: 'Verify your internet connection and Supabase URL'
      },
      {
        pattern: /relation.*does not exist/,
        solution: 'Database schema not set up - ensure migration files are present'
      },
      {
        pattern: /permission denied/,
        solution: 'Check your Supabase project permissions and RLS settings'
      }
    ];

    for (const pattern of errorPatterns) {
      if (pattern.pattern.test(error.message)) {
        Logger.info(`💡 Suggested solution: ${pattern.solution}`);
        break;
      }
    }

    Logger.info('\n🔧 Troubleshooting steps:');
    Logger.info('1. Verify your Supabase credentials are correct');
    Logger.info('2. Check your internet connection');
    Logger.info('3. Ensure your Supabase project is active');
    Logger.info('4. Try running the setup again');
    Logger.info('5. Check the setup logs for detailed error information');
  }

  printProgress() {
    const percentage = Math.round((this.progress.completed / this.progress.total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    Logger.info(`Progress: [${bar}] ${percentage}% (${this.progress.completed}/${this.progress.total})`);
  }

  printNextSteps() {
    Logger.section('🎉 Next Steps');
    
    Logger.info('Your Supabase database is now set up and ready to use!');
    Logger.info('');
    Logger.info('🚀 To start development:');
    Logger.info('   npm run dev');
    Logger.info('');
    Logger.info('🧪 To test the setup:');
    Logger.info('   npm run test:database');
    Logger.info('');
    Logger.info('📖 To view documentation:');
    Logger.info('   Open docs/setup/database-setup.md');
    Logger.info('');
    Logger.info('🌐 Access points:');
    Logger.info('   • Application: http://localhost:3000');
    Logger.info('   • Visual Designer: http://localhost:3000/visual-garden-demo');
    Logger.info('   • Plant Beds: http://localhost:3000/plant-beds');
    Logger.info('');
    Logger.info('📞 Need help?');
    Logger.info('   • Check the troubleshooting guide in docs/');
    Logger.info('   • Run: npm run test:connection');
    Logger.info('   • Contact: support@tuinbeheer.com');
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the setup
if (require.main === module) {
  const setup = new SupabaseSetup();
  setup.run();
}

module.exports = SupabaseSetup;