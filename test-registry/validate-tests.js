#!/usr/bin/env node

/**
 * Test Validatie Script voor Cursor Pipeline → CI/CD Integratie
 * 
 * Dit script valideert of alle test cases voldoen aan banking standards
 * en of de synchronisatie correct is uitgevoerd.
 */

const fs = require('fs');
const path = require('path');
const { TestRegistry } = require('./TestRegistry');

class TestValidator {
  constructor() {
    this.registry = new TestRegistry();
    this.validationResults = {
      bankingCompliance: { passed: 0, failed: 0, issues: [] },
      coverage: { passed: false, current: {}, target: {} },
      backwardCompatibility: { passed: false, issues: [] },
      testIntegrity: { passed: false, issues: [] }
    };
  }

  /**
   * Voer volledige validatie uit
   */
  async validateTests() {
    console.log('🔍 Starting test validation...');
    
    try {
      // 1. Valideer banking compliance
      await this.validateBankingCompliance();
      console.log('🔒 Banking compliance validation completed');
      
      // 2. Valideer test coverage
      await this.validateTestCoverage();
      console.log('📊 Test coverage validation completed');
      
      // 3. Valideer backward compatibility
      await this.validateBackwardCompatibility();
      console.log('🔄 Backward compatibility validation completed');
      
      // 4. Valideer test integriteit
      await this.validateTestIntegrity();
      console.log('✅ Test integrity validation completed');
      
      // 5. Genereer validatie rapport
      const report = await this.generateValidationReport();
      await this.saveValidationReport(report);
      console.log('📋 Validation report generated');
      
      // 6. Print resultaten
      this.printValidationResults();
      
      // 7. Exit met juiste code
      const allPassed = this.allValidationsPassed();
      if (!allPassed) {
        console.error('❌ Validation failed - see issues above');
        process.exit(1);
      }
      
      console.log('🎉 All validations passed!');
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Valideer banking compliance
   */
  async validateBankingCompliance() {
    const testCases = this.registry.cursorTests || [];
    let passed = 0;
    let failed = 0;
    const issues = [];
    
    for (const testCase of testCases) {
      const complianceCheck = this.checkBankingCompliance(testCase);
      
      if (complianceCheck.overallCompliance) {
        passed++;
      } else {
        failed++;
        issues.push({
          testId: testCase.id,
          issues: complianceCheck.issues,
          recommendations: complianceCheck.recommendations
        });
      }
    }
    
    this.validationResults.bankingCompliance = { passed, failed, issues };
  }

  /**
   * Check banking compliance voor individuele test case
   */
  checkBankingCompliance(testCase) {
    const issues = [];
    const recommendations = [];
    
    // Check audit logging
    const hasAuditLogging = testCase.description.toLowerCase().includes('audit') || 
                           testCase.testFile.includes('audit');
    if (!hasAuditLogging) {
      issues.push('Missing audit logging validation');
      recommendations.push('Add audit logging tests to ensure compliance');
    }
    
    // Check security patterns
    const hasSecurityPatterns = testCase.type === 'security' || 
                               testCase.tags.includes('security');
    if (!hasSecurityPatterns && testCase.type !== 'security') {
      issues.push('Missing security pattern validation');
      recommendations.push('Add security pattern tests for banking compliance');
    }
    
    // Check data protection
    const hasDataProtection = testCase.description.toLowerCase().includes('encrypt') ||
                             testCase.description.toLowerCase().includes('protect');
    if (!hasDataProtection) {
      issues.push('Missing data protection validation');
      recommendations.push('Add data protection tests for sensitive data handling');
    }
    
    // Check error handling
    const hasErrorHandling = testCase.description.toLowerCase().includes('error') ||
                            testCase.description.toLowerCase().includes('exception');
    if (!hasErrorHandling) {
      issues.push('Missing error handling validation');
      recommendations.push('Add error handling tests for robust error management');
    }
    
    // Check type safety
    const hasTypeSafety = testCase.testFile.endsWith('.ts') || testCase.testFile.endsWith('.tsx');
    if (!hasTypeSafety) {
      issues.push('Missing type safety validation');
      recommendations.push('Use TypeScript for type safety compliance');
    }
    
    const overallCompliance = issues.length === 0;
    
    return {
      testCaseId: testCase.id,
      overallCompliance,
      issues,
      recommendations
    };
  }

  /**
   * Valideer test coverage
   */
  async validateTestCoverage() {
    const target = { lines: 80, functions: 80, branches: 60 };
    const current = this.registry.regressionSuite?.totalCoverage || { lines: 0, functions: 0, branches: 0 };
    
    const passed = current.lines >= target.lines && 
                   current.functions >= target.functions && 
                   current.branches >= target.branches;
    
    this.validationResults.coverage = { passed, current, target };
  }

  /**
   * Valideer backward compatibility
   */
  async validateBackwardCompatibility() {
    const issues = [];
    
    // Controleer of bestaande test files nog steeds bestaan
    const existingTests = this.registry.existingTests || [];
    for (const test of existingTests) {
      if (!fs.existsSync(test.testFile)) {
        issues.push(`Existing test file not found: ${test.testFile}`);
      }
    }
    
    // Controleer of bestaande test scripts nog steeds werken
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Controleer of bestaande test scripts nog steeds bestaan
      const requiredScripts = ['test:ci', 'test:regression'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
          issues.push(`Required test script missing: ${script}`);
        }
      }
    }
    
    // Controleer of bestaande CI/CD workflow nog steeds werkt
    const ciCdPath = '.github/workflows/ci-cd.yml';
    if (!fs.existsSync(ciCdPath)) {
      issues.push('CI/CD workflow file not found');
    }
    
    const passed = issues.length === 0;
    this.validationResults.backwardCompatibility = { passed, issues };
  }

  /**
   * Valideer test integriteit
   */
  async validateTestIntegrity() {
    const issues = [];
    
    // Controleer of cursor test file correct is gegenereerd
    const cursorTestPath = path.join('__tests__', 'regression', 'cursor-tests.ts');
    if (!fs.existsSync(cursorTestPath)) {
      issues.push('Cursor test file not generated');
    } else {
      const content = fs.readFileSync(cursorTestPath, 'utf8');
      
      // Controleer of file correcte structuur heeft
      if (!content.includes('describe(')) {
        issues.push('Cursor test file missing describe blocks');
      }
      
      if (!content.includes('it(')) {
        issues.push('Cursor test file missing it blocks');
      }
      
      if (!content.includes('Auto-generated from Cursor Pipeline')) {
        issues.push('Cursor test file missing generation header');
      }
    }
    
    // Controleer of test registry correct is opgeslagen
    const registryPath = path.join('test-registry', 'registry.json');
    if (!fs.existsSync(registryPath)) {
      issues.push('Test registry not saved');
    } else {
      try {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        
        // Controleer of registry correcte structuur heeft
        if (!registry.cursorTests) {
          issues.push('Test registry missing cursorTests');
        }
        
        if (!registry.regressionSuite) {
          issues.push('Test registry missing regressionSuite');
        }
        
        if (!registry.bankingCompliance) {
          issues.push('Test registry missing bankingCompliance flag');
        }
      } catch (error) {
        issues.push(`Test registry is corrupted: ${error.message}`);
      }
    }
    
    // Controleer of package.json scripts correct zijn bijgewerkt
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const requiredScripts = [
        'test:regression:cursor',
        'test:regression:all',
        'test:regression:sync',
        'test:regression:validate'
      ];
      
      for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
          issues.push(`Required script missing from package.json: ${script}`);
        }
      }
    }
    
    const passed = issues.length === 0;
    this.validationResults.testIntegrity = { passed, issues };
  }

  /**
   * Genereer validatie rapport
   */
  async generateValidationReport() {
    const report = {
      validationId: `validation-${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary: {
        bankingCompliance: this.validationResults.bankingCompliance,
        coverage: this.validationResults.coverage,
        backwardCompatibility: this.validationResults.backwardCompatibility,
        testIntegrity: this.validationResults.testIntegrity
      },
      overallStatus: this.allValidationsPassed() ? 'PASSED' : 'FAILED',
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };
    
    return report;
  }

  /**
   * Genereer aanbevelingen
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Banking compliance aanbevelingen
    if (this.validationResults.bankingCompliance.failed > 0) {
      recommendations.push(`Fix ${this.validationResults.bankingCompliance.failed} banking compliance issues`);
    }
    
    // Coverage aanbevelingen
    if (!this.validationResults.coverage.passed) {
      const current = this.validationResults.coverage.current;
      const target = this.validationResults.coverage.target;
      
      if (current.lines < target.lines) {
        recommendations.push(`Increase line coverage from ${current.lines}% to ${target.lines}%`);
      }
      
      if (current.functions < target.functions) {
        recommendations.push(`Increase function coverage from ${current.functions}% to ${target.functions}%`);
      }
      
      if (current.branches < target.branches) {
        recommendations.push(`Increase branch coverage from ${current.branches}% to ${target.branches}%`);
      }
    }
    
    // Backward compatibility aanbevelingen
    if (!this.validationResults.backwardCompatibility.passed) {
      recommendations.push('Fix backward compatibility issues to ensure existing tests continue to work');
    }
    
    // Test integriteit aanbevelingen
    if (!this.validationResults.testIntegrity.passed) {
      recommendations.push('Fix test integrity issues to ensure proper test generation and storage');
    }
    
    return recommendations;
  }

  /**
   * Genereer volgende stappen
   */
  generateNextSteps() {
    const nextSteps = [];
    
    if (!this.allValidationsPassed()) {
      nextSteps.push('Review and fix validation issues');
      nextSteps.push('Re-run validation after fixes');
    }
    
    if (this.validationResults.bankingCompliance.failed > 0) {
      nextSteps.push('Update test cases to meet banking compliance standards');
    }
    
    if (!this.validationResults.coverage.passed) {
      nextSteps.push('Add more tests to achieve coverage targets');
    }
    
    if (this.validationResults.backwardCompatibility.issues.length > 0) {
      nextSteps.push('Restore missing files or scripts');
    }
    
    if (this.validationResults.testIntegrity.issues.length > 0) {
      nextSteps.push('Regenerate test files and registry');
    }
    
    if (this.allValidationsPassed()) {
      nextSteps.push('Proceed with CI/CD integration');
      nextSteps.push('Monitor test execution in CI/CD pipeline');
    }
    
    return nextSteps;
  }

  /**
   * Controleer of alle validaties zijn geslaagd
   */
  allValidationsPassed() {
    return this.validationResults.bankingCompliance.failed === 0 &&
           this.validationResults.coverage.passed &&
           this.validationResults.backwardCompatibility.passed &&
           this.validationResults.testIntegrity.passed;
  }

  /**
   * Sla validatie rapport op
   */
  async saveValidationReport(report) {
    const reportPath = path.join('test-registry', 'validation-reports', `validation-${report.validationId}.json`);
    
    // Maak directory als het niet bestaat
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Sla ook een latest rapport op
    const latestPath = path.join('test-registry', 'latest-validation-report.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
  }

  /**
   * Print validatie resultaten
   */
  printValidationResults() {
    console.log('\n📊 Validation Results:');
    
    // Banking compliance
    const bc = this.validationResults.bankingCompliance;
    console.log(`   🔒 Banking Compliance: ${bc.passed}/${bc.passed + bc.failed} passed`);
    if (bc.failed > 0) {
      console.log(`      ❌ ${bc.failed} tests failed compliance checks`);
    }
    
    // Coverage
    const cov = this.validationResults.coverage;
    console.log(`   📊 Test Coverage: ${cov.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`      Lines: ${cov.current.lines}% (target: ${cov.target.lines}%)`);
    console.log(`      Functions: ${cov.current.functions}% (target: ${cov.target.functions}%)`);
    console.log(`      Branches: ${cov.current.branches}% (target: ${cov.target.branches}%)`);
    
    // Backward compatibility
    const bcCompat = this.validationResults.backwardCompatibility;
    console.log(`   🔄 Backward Compatibility: ${bcCompat.passed ? 'PASSED' : 'FAILED'}`);
    if (!bcCompat.passed) {
      console.log(`      ❌ ${bcCompat.issues.length} compatibility issues found`);
    }
    
    // Test integrity
    const integrity = this.validationResults.testIntegrity;
    console.log(`   ✅ Test Integrity: ${integrity.passed ? 'PASSED' : 'FAILED'}`);
    if (!integrity.passed) {
      console.log(`      ❌ ${integrity.issues.length} integrity issues found`);
    }
    
    // Overall status
    const overallStatus = this.allValidationsPassed() ? 'PASSED' : 'FAILED';
    console.log(`\n🎯 Overall Status: ${overallStatus}`);
    
    if (!this.allValidationsPassed()) {
      console.log('\n❌ Issues found:');
      
      // Print banking compliance issues
      if (bc.failed > 0) {
        console.log('\n   🔒 Banking Compliance Issues:');
        bc.issues.forEach(issue => {
          console.log(`      - Test ${issue.testId}: ${issue.issues.join(', ')}`);
        });
      }
      
      // Print backward compatibility issues
      if (!bcCompat.passed) {
        console.log('\n   🔄 Backward Compatibility Issues:');
        bcCompat.issues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }
      
      // Print test integrity issues
      if (!integrity.passed) {
        console.log('\n   ✅ Test Integrity Issues:');
        integrity.issues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }
    }
  }
}

// Voer validatie uit als script direct wordt aangeroepen
if (require.main === module) {
  const validator = new TestValidator();
  validator.validateTests().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { TestValidator };

