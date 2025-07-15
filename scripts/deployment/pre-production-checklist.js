#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Pre-Production Deployment Checklist
 * 
 * This script validates that all requirements are met before deploying to production.
 * Add this to your package.json scripts:
 * "pre-prod-check": "node scripts/deployment/pre-production-checklist.js"
 */

class PreProductionChecklist {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  async run() {
    console.log('🚀 Pre-Production Deployment Checklist');
    console.log('=====================================\n');

    // Run all checks
    await this.checkEnvironmentVariables();
    await this.checkDatabaseMigrations();
    await this.checkBuildStatus();
    await this.checkSecuritySettings();
    await this.checkBackupStatus();
    await this.checkDocumentation();

    // Summary
    this.showSummary();
    
    // Exit with appropriate code
    if (this.failed > 0) {
      console.log('\n❌ Pre-production checks failed. Production deployment blocked.');
      process.exit(1);
    } else {
      console.log('\n✅ All pre-production checks passed. Ready for production deployment!');
      process.exit(0);
    }
  }

  check(description, condition, required = true) {
    const status = condition ? '✅' : '❌';
    const priority = required ? 'REQUIRED' : 'OPTIONAL';
    
    console.log(`${status} [${priority}] ${description}`);
    
    if (condition) {
      this.passed++;
    } else {
      this.failed++;
      if (!required) {
        console.log('   ⚠️  Optional check failed - continuing anyway');
      }
    }
    
    this.checks.push({ description, passed: condition, required });
  }

  async checkEnvironmentVariables() {
    console.log('🔧 Environment Variables');
    console.log('------------------------');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      const exists = process.env[envVar] !== undefined;
      this.check(`${envVar} is configured`, exists);
    }

    // Check for production-specific environment file
    const prodEnvExists = fs.existsSync('.env.production');
    this.check('Production environment file exists', prodEnvExists, false);
    
    console.log('');
  }

  async checkDatabaseMigrations() {
    console.log('🗄️ Database Migrations');
    console.log('----------------------');
    
    // Check if migration files exist
    const migrationFiles = [
      'database_setup.sql',
      'database_update_bloemen_registratie.sql'
    ];

    for (const file of migrationFiles) {
      const exists = fs.existsSync(file);
      this.check(`Migration file ${file} exists`, exists, false);
    }

    // Check if migration approval file exists
    const migrationApprovalExists = fs.existsSync('database/migrations/migration-approval.json');
    this.check('Migration approval tracking exists', migrationApprovalExists, false);
    
    console.log('');
  }

  async checkBuildStatus() {
    console.log('🔨 Build Status');
    console.log('---------------');
    
    // Check if build directory exists
    const buildExists = fs.existsSync('.next');
    this.check('Next.js build directory exists', buildExists, false);
    
    // Check package.json for production scripts
    const packageJsonExists = fs.existsSync('package.json');
    this.check('package.json exists', packageJsonExists);
    
    if (packageJsonExists) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasProductionScript = packageJson.scripts && packageJson.scripts['build:prod'];
      this.check('Production build script exists', hasProductionScript, false);
    }
    
    console.log('');
  }

  async checkSecuritySettings() {
    console.log('🛡️ Security Settings');
    console.log('--------------------');
    
    // Check for security-related files
    const securityFiles = [
      '.env.example',
      '.gitignore'
    ];

    for (const file of securityFiles) {
      const exists = fs.existsSync(file);
      this.check(`Security file ${file} exists`, exists, file === '.gitignore');
    }

    // Check if sensitive files are properly ignored
    if (fs.existsSync('.gitignore')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      const ignoresEnv = gitignoreContent.includes('.env');
      this.check('Environment files are gitignored', ignoresEnv);
    }
    
    console.log('');
  }

  async checkBackupStatus() {
    console.log('💾 Backup Status');
    console.log('----------------');
    
    // Check for backup-related documentation
    const backupDocExists = fs.existsSync('docs/deployment/backup-procedures.md');
    this.check('Backup procedures documented', backupDocExists, false);
    
    // Check for database backup scripts
    const backupScriptExists = fs.existsSync('scripts/backup/database-backup.js');
    this.check('Database backup script exists', backupScriptExists, false);
    
    console.log('');
  }

  async checkDocumentation() {
    console.log('📚 Documentation');
    console.log('----------------');
    
    // Check for essential documentation
    const docFiles = [
      'README.md',
      'DEPLOYMENT_SUMMARY.md',
      'docs/deployment/deployment-guide.md'
    ];

    for (const file of docFiles) {
      const exists = fs.existsSync(file);
      this.check(`Documentation file ${file} exists`, exists, file === 'README.md');
    }
    
    console.log('');
  }

  showSummary() {
    console.log('📊 Summary');
    console.log('----------');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📋 Total checks: ${this.checks.length}`);
    
    if (this.failed > 0) {
      console.log('\n❌ Failed checks:');
      this.checks
        .filter(check => !check.passed && check.required)
        .forEach(check => {
          console.log(`   • ${check.description}`);
        });
    }
  }
}

// Run the checklist
if (require.main === module) {
  const checklist = new PreProductionChecklist();
  checklist.run().catch(error => {
    console.error('Error running pre-production checklist:', error);
    process.exit(1);
  });
}

module.exports = PreProductionChecklist;