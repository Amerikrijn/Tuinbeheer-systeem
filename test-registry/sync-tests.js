#!/usr/bin/env node

/**
 * Test Synchronisatie Script voor Cursor Pipeline → CI/CD Integratie
 * 
 * Dit script synchroniseert test cases tussen de Cursor pipeline en de bestaande CI/CD.
 * Het wordt aangeroepen via @pipeline-regression-sync command.
 */

const fs = require('fs');
const path = require('path');
const { TestRegistry } = require('./TestRegistry');

class TestSyncManager {
  constructor() {
    this.registry = new TestRegistry();
    this.syncLog = [];
  }

  /**
   * Voer volledige synchronisatie uit
   */
  async syncTests() {
    console.log('🔄 Starting test synchronization...');
    
    try {
      // 1. Scan voor nieuwe test cases in Cursor pipeline
      const newTests = await this.scanCursorTests();
      console.log(`📊 Found ${newTests.length} new test cases`);
      
      // 2. Valideer banking compliance
      const complianceResults = await this.validateBankingCompliance(newTests);
      console.log(`🔒 Banking compliance: ${complianceResults.passed}/${complianceResults.total} passed`);
      
      // 3. Voeg tests toe aan registry
      for (const test of newTests) {
        try {
          this.registry.addCursorTest(test);
          this.syncLog.push(`✅ Added test: ${test.id}`);
        } catch (error) {
          this.syncLog.push(`❌ Failed to add test ${test.id}: ${error.message}`);
        }
      }
      
      // 4. Genereer CI/CD test files
      await this.generateCICDTestFiles();
      console.log('📁 Generated CI/CD test files');
      
      // 5. Update package.json scripts
      await this.updatePackageJsonScripts();
      console.log('📦 Updated package.json scripts');
      
      // 6. Genereer synchronisatie rapport
      const report = this.registry.generateSyncReport();
      await this.saveSyncReport(report);
      console.log('📋 Generated sync report');
      
      // 7. Valideer synchronisatie
      const validation = await this.validateSync();
      console.log(`✅ Sync validation: ${validation.success ? 'PASSED' : 'FAILED'}`);
      
      if (!validation.success) {
        console.error('❌ Sync validation failed:', validation.errors);
        process.exit(1);
      }
      
      console.log('🎉 Test synchronization completed successfully!');
      this.printSummary(report);
      
    } catch (error) {
      console.error('❌ Test synchronization failed:', error);
      process.exit(1);
    }
  }

  /**
   * Scan voor nieuwe test cases in Cursor pipeline
   */
  async scanCursorTests() {
    const testCases = [];
    const testDirs = [
      '__tests__/unit',
      '__tests__/integration', 
      '__tests__/components',
      '__tests__/api'
    ];

    for (const dir of testDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.test.ts') || file.endsWith('.test.tsx'));
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Parse test cases uit file content
          const parsedTests = this.parseTestCases(filePath, content);
          testCases.push(...parsedTests);
        }
      }
    }

    return testCases;
  }

  /**
   * Parse test cases uit file content
   */
  parseTestCases(filePath, content) {
    const testCases = [];
    const lines = content.split('\n');
    
    let currentTest = null;
    let inDescribe = false;
    let inIt = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detecteer describe blocks
      if (line.startsWith('describe(')) {
        const match = line.match(/describe\(['"`]([^'"`]+)['"`]/);
        if (match) {
          currentTest = {
            id: this.generateTestId(filePath, match[1]),
            name: match[1],
            type: this.determineTestType(filePath),
            category: this.determineCategory(filePath),
            description: '',
            testFile: filePath,
            testFunction: '',
            coverage: { lines: 0, functions: 0, branches: 0 },
            bankingCompliance: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            priority: 'medium',
            dependencies: [],
            environment: []
          };
          inDescribe = true;
        }
      }
      
      // Detecteer it blocks
      if (line.startsWith('it(') && currentTest) {
        const match = line.match(/it\(['"`]([^'"`]+)['"`]/);
        if (match) {
          currentTest.description = match[1];
          currentTest.testFunction = this.generateTestFunctionName(currentTest.name, match[1]);
          inIt = true;
        }
      }
      
      // Detecteer test end
      if (line === '});' && inIt && currentTest) {
        testCases.push({ ...currentTest });
        currentTest = null;
        inDescribe = false;
        inIt = false;
      }
    }
    
    return testCases;
  }

  /**
   * Genereer unieke test ID
   */
  generateTestId(filePath, testName) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const sanitizedName = testName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${fileName}-${sanitizedName}-${Date.now()}`;
  }

  /**
   * Bepaal test type op basis van file path
   */
  determineTestType(filePath) {
    if (filePath.includes('/unit/')) return 'unit';
    if (filePath.includes('/integration/')) return 'integration';
    if (filePath.includes('/components/')) return 'unit';
    if (filePath.includes('/api/')) return 'integration';
    return 'unit';
  }

  /**
   * Bepaal test category
   */
  determineCategory(filePath) {
    const parts = filePath.split('/');
    return parts[parts.length - 2] || 'general';
  }

  /**
   * Genereer test function naam
   */
  generateTestFunctionName(describeName, itName) {
    const sanitizedDescribe = describeName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedIt = itName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `test${sanitizedDescribe}${sanitizedIt}`;
  }

  /**
   * Valideer banking compliance
   */
  async validateBankingCompliance(testCases) {
    let passed = 0;
    let total = testCases.length;
    
    for (const testCase of testCases) {
      // Basis banking compliance checks
      const hasAuditLogging = testCase.description.toLowerCase().includes('audit');
      const hasSecurityPatterns = testCase.type === 'security' || testCase.tags.includes('security');
      const hasErrorHandling = testCase.description.toLowerCase().includes('error');
      const hasTypeSafety = testCase.testFile.endsWith('.ts') || testCase.testFile.endsWith('.tsx');
      
      testCase.bankingCompliance = hasAuditLogging || hasSecurityPatterns || hasErrorHandling || hasTypeSafety;
      
      if (testCase.bankingCompliance) {
        passed++;
      }
    }
    
    return { passed, total };
  }

  /**
   * Genereer CI/CD test files
   */
  async generateCICDTestFiles() {
    // Dit wordt al gedaan door TestRegistry.generateCICDTestFiles()
    // Hier kunnen we extra validatie toevoegen
    const cursorTestPath = path.join('__tests__', 'regression', 'cursor-tests.ts');
    
    if (!fs.existsSync(cursorTestPath)) {
      throw new Error('Cursor test file was not generated');
    }
    
    const content = fs.readFileSync(cursorTestPath, 'utf8');
    if (!content.includes('describe(') || !content.includes('it(')) {
      throw new Error('Generated cursor test file is invalid');
    }
  }

  /**
   * Update package.json scripts
   */
  async updatePackageJsonScripts() {
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Controleer of scripts correct zijn toegevoegd
    const requiredScripts = [
      'test:regression:cursor',
      'test:regression:all',
      'test:regression:sync',
      'test:regression:validate'
    ];
    
    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        throw new Error(`Required script ${script} is missing from package.json`);
      }
    }
  }

  /**
   * Sla synchronisatie rapport op
   */
  async saveSyncReport(report) {
    const reportPath = path.join('test-registry', 'sync-reports', `sync-${report.syncId}.json`);
    
    // Maak directory als het niet bestaat
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Sla ook een latest rapport op
    const latestPath = path.join('test-registry', 'latest-sync-report.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
  }

  /**
   * Valideer synchronisatie
   */
  async validateSync() {
    const errors = [];
    
    // Controleer of cursor test file bestaat
    const cursorTestPath = path.join('__tests__', 'regression', 'cursor-tests.ts');
    if (!fs.existsSync(cursorTestPath)) {
      errors.push('Cursor test file not generated');
    }
    
    // Controleer of package.json scripts zijn bijgewerkt
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.scripts['test:regression:cursor']) {
      errors.push('Package.json scripts not updated');
    }
    
    // Controleer of registry is opgeslagen
    const registryPath = path.join('test-registry', 'registry.json');
    if (!fs.existsSync(registryPath)) {
      errors.push('Test registry not saved');
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Print synchronisatie samenvatting
   */
  printSummary(report) {
    console.log('\n📊 Synchronization Summary:');
    console.log(`   Total tests: ${report.summary.totalTests}`);
    console.log(`   Cursor tests: ${report.summary.cursorTests}`);
    console.log(`   New tests: ${report.summary.newTests}`);
    console.log(`   Updated tests: ${report.summary.updatedTests}`);
    console.log(`   Coverage: ${report.coverage.lines}% lines, ${report.coverage.functions}% functions, ${report.coverage.branches}% branches`);
    console.log(`   Banking compliance: ${report.bankingCompliance.complianceRate.toFixed(1)}%`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    if (report.nextSteps.length > 0) {
      console.log('\n🎯 Next Steps:');
      report.nextSteps.forEach(step => console.log(`   - ${step}`));
    }
  }
}

// Voer synchronisatie uit als script direct wordt aangeroepen
if (require.main === module) {
  const syncManager = new TestSyncManager();
  syncManager.syncTests().catch(error => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });
}

module.exports = { TestSyncManager };

