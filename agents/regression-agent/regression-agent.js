#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RegressionAgent {
  constructor() {
    this.results = {
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      issuesFound: [],
      solutions: [],
      startTime: Date.now()
    };
  }

  async run() {
    console.log('🚀 Regression Agent Starting...');
    
    try {
      // Step 1: Run existing tests
      await this.runTests();
      
      // Step 2: Find issues
      await this.findIssues();
      
      // Step 3: Generate solutions
      await this.generateSolutions();
      
      // Step 4: Save results
      await this.saveResults();
      
      console.log('✅ Regression Agent completed successfully!');
      return this.results;
      
    } catch (error) {
      console.error('❌ Regression Agent failed:', error.message);
      this.results.error = error.message;
      await this.saveResults();
      throw error;
    }
  }

  async runTests() {
    console.log('🧪 Running regression tests...');
    
    try {
      // Run the test suite
      const testOutput = execSync('npm run test:ci', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      // Parse test results
      const lines = testOutput.split('\n');
      let inTestResults = false;
      
      for (const line of lines) {
        if (line.includes('Tests:')) {
          inTestResults = true;
          continue;
        }
        
        if (inTestResults && line.includes('✓')) {
          this.results.testsPassed++;
          this.results.testsRun++;
        } else if (inTestResults && line.includes('✗')) {
          this.results.testsFailed++;
          this.results.testsRun++;
        }
      }
      
      console.log(`✅ Tests completed: ${this.results.testsPassed} passed, ${this.results.testsFailed} failed`);
      
    } catch (error) {
      console.log('⚠️ Some tests failed, but continuing...');
      this.results.testsFailed++;
      this.results.testsRun++;
    }
  }

  async findIssues() {
    console.log('🔍 Finding issues...');
    
    const issues = [];
    
    // Check for common issues
    if (this.results.testsFailed > 0) {
      issues.push({
        type: 'test-failure',
        severity: 'high',
        description: `${this.results.testsFailed} tests are failing`,
        location: 'test suite',
        suggestion: 'Review failing tests and fix implementation issues'
      });
    }
    
    // Check for linting issues
    try {
      const lintOutput = execSync('npm run lint', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      console.log('✅ No linting issues found');
    } catch (error) {
      const lintIssues = error.stdout || error.stderr || '';
      if (lintIssues.includes('error')) {
        const errorCount = (lintIssues.match(/error/g) || []).length;
        issues.push({
          type: 'linting-error',
          severity: 'medium',
          description: `${errorCount} linting errors found`,
          location: 'codebase',
          suggestion: 'Run "npm run lint:fix" to automatically fix issues'
        });
      }
    }
    
    // Check for type issues
    try {
      const typeOutput = execSync('npm run typecheck', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      console.log('✅ No type issues found');
    } catch (error) {
      const typeIssues = error.stdout || error.stderr || '';
      if (typeIssues.includes('error')) {
        const errorCount = (typeIssues.match(/error/g) || []).length;
        issues.push({
          type: 'type-error',
          severity: 'medium',
          description: `${errorCount} TypeScript errors found`,
          location: 'codebase',
          suggestion: 'Fix type annotations and interfaces'
        });
      }
    }
    
    // Check for security issues
    try {
      const securityOutput = execSync('npm audit --audit-level moderate', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      console.log('✅ No security vulnerabilities found');
    } catch (error) {
      const securityIssues = error.stdout || error.stderr || '';
      if (securityIssues.includes('vulnerabilities')) {
        const vulnMatch = securityIssues.match(/(\d+) vulnerabilities/);
        const vulnCount = vulnMatch ? parseInt(vulnMatch[1]) : 0;
        issues.push({
          type: 'security-vulnerability',
          severity: 'high',
          description: `${vulnCount} security vulnerabilities found`,
          location: 'dependencies',
          suggestion: 'Run "npm audit fix" to update vulnerable packages'
        });
      }
    }
    
    this.results.issuesFound = issues;
    console.log(`🔍 Found ${issues.length} issues`);
  }

  async generateSolutions() {
    console.log('🔧 Generating solutions...');
    
    const solutions = [];
    
    for (const issue of this.results.issuesFound) {
      let solution = {
        issue: issue.description,
        action: issue.suggestion,
        command: '',
        priority: issue.severity === 'high' ? 'immediate' : 'soon'
      };
      
      // Generate specific commands for common issues
      switch (issue.type) {
        case 'test-failure':
          solution.command = 'npm run test:ci';
          solution.action = 'Review and fix failing tests';
          break;
          
        case 'linting-error':
          solution.command = 'npm run lint:fix';
          solution.action = 'Automatically fix linting issues';
          break;
          
        case 'type-error':
          solution.command = 'npm run typecheck';
          solution.action = 'Fix TypeScript type errors';
          break;
          
        case 'security-vulnerability':
          solution.command = 'npm audit fix';
          solution.action = 'Update vulnerable dependencies';
          break;
      }
      
      solutions.push(solution);
    }
    
    this.results.solutions = solutions;
    console.log(`🔧 Generated ${solutions.length} solutions`);
  }

  async saveResults() {
    const outputDir = './regression-results';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const resultsFile = path.join(outputDir, 'regression-results.json');
    const reportFile = path.join(outputDir, 'regression-report.md');
    
    // Save JSON results
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    
    // Generate markdown report
    const report = this.generateReport();
    fs.writeFileSync(reportFile, report);
    
    console.log(`📁 Results saved to ${outputDir}/`);
  }

  generateReport() {
    const executionTime = ((Date.now() - this.results.startTime) / 1000).toFixed(2);
    
    return `# 🚀 Regression Agent Report

## 📊 Test Results
- **Tests Run**: ${this.results.testsRun}
- **Tests Passed**: ${this.results.testsPassed}
- **Tests Failed**: ${this.results.testsFailed}
- **Success Rate**: ${this.results.testsRun > 0 ? ((this.results.testsPassed / this.results.testsRun) * 100).toFixed(1) : 0}%

## 🔍 Issues Found
${this.results.issuesFound.length === 0 ? '✅ No issues found!' : this.results.issuesFound.map(issue => 
  `### ${issue.type.replace('-', ' ').toUpperCase()}
  - **Severity**: ${issue.severity}
  - **Description**: ${issue.description}
  - **Location**: ${issue.location}
  - **Suggestion**: ${issue.suggestion}`
).join('\n\n')}

## 🔧 Solutions
${this.results.solutions.length === 0 ? '✅ No solutions needed!' : this.results.solutions.map(solution => 
  `### ${solution.priority.toUpperCase()} Priority
  - **Issue**: ${solution.issue}
  - **Action**: ${solution.action}
  - **Command**: \`${solution.command}\``
).join('\n\n')}

## 📈 Summary
- **Execution Time**: ${executionTime}s
- **Status**: ${this.results.error ? '❌ Failed' : '✅ Success'}
${this.results.error ? `- **Error**: ${this.results.error}` : ''}

---
*Generated by Regression Agent at ${new Date().toISOString()}*`;
  }
}

// Run the agent if called directly
if (require.main === module) {
  const agent = new RegressionAgent();
  agent.run().catch(console.error);
}

module.exports = RegressionAgent;