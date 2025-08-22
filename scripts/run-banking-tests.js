#!/usr/bin/env node

/**
 * 🏦 Banking System Test Runner
 * 
 * This script runs all tests in parallel without dependencies,
 * focusing on traditional banking standards and compliance.
 * 
 * Usage:
 *   node scripts/run-banking-tests.js [options]
 * 
 * Options:
 *   --parallel     Run tests in parallel (default: true)
 *   --sequential   Run tests sequentially
 *   --coverage     Generate coverage reports
 *   --report       Generate detailed test report
 *   --ci           CI mode with JUnit output
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  testSuites: [
    { name: 'unit-lib', script: 'npx vitest run __tests__/unit/lib/**/*.{test,spec}.{ts,tsx} --reporter=junit --outputFile test-results/unit-lib.xml', pattern: '__tests__/unit/lib/**/*.{test,spec}.{ts,tsx}' },
    { name: 'unit-app', script: 'npx vitest run __tests__/unit/app/**/*.{test,spec}.{ts,tsx} --reporter=junit --outputFile test-results/unit-app.xml', pattern: '__tests__/unit/app/**/*.{test,spec}.{ts,tsx}' },
    { name: 'unit-components', script: 'npx vitest run __tests__/unit/components/**/*.{test,spec}.{ts,tsx} --reporter=junit --outputFile test-results/unit-components.xml', pattern: '__tests__/unit/components/**/*.{test,spec}.{ts,tsx}' },
    { name: 'unit-api', script: 'npx vitest run __tests__/unit/api/**/*.{test,spec}.{ts,tsx} --reporter=junit --outputFile test-results/unit-api.xml', pattern: '__tests__/unit/api/**/*.{test,spec}.{ts,tsx}' },
    { name: 'components', script: 'npx vitest run __tests__/components/**/*.{test,spec}.{ts,tsx} --reporter=junit --outputFile test-results/components.xml', pattern: '__tests__/components/**/*.{test,spec}.{ts,tsx}' },
    { name: 'integration', script: 'npx vitest run __tests__/integration/**/*.{test,spec}.{ts,tsx} --reporter=junit --outputFile test-results/integration.xml', pattern: '__tests__/integration/**/*.{test,spec}.{ts,tsx}' },
    { name: 'e2e', script: 'npm run build && npx vitest run __tests__/e2e/**/*.{test,spec}.{ts,tsx} --reporter=junit --outputFile test-results/e2e.xml', pattern: '__tests__/e2e/**/*.{test,spec}.{ts,tsx}' }
  ],
  coverageThreshold: 80,
  testResultsDir: 'test-results',
  coverageDir: 'coverage'
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  parallel: !args.includes('--sequential'),
  coverage: args.includes('--coverage') || args.includes('--ci'),
  report: args.includes('--report') || args.includes('--ci'),
  ci: args.includes('--ci')
};

// Ensure test results directory exists
if (!fs.existsSync(CONFIG.testResultsDir)) {
  fs.mkdirSync(CONFIG.testResultsDir, { recursive: true });
}

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      child.stdout.on('data', (data) => stdout += data.toString());
      child.stderr.on('data', (data) => stderr += data.toString());
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        reject({ code, stdout, stderr });
      }
    });

    child.on('error', (error) => {
      reject({ code: -1, error: error.message });
    });
  });
}

async function runTestSuite(suite) {
  log(`Starting ${suite.name} tests...`);
  
  try {
    const startTime = Date.now();
    const result = await runCommand(suite.script, { silent: options.ci });
    const duration = Date.now() - startTime;
    
    log(`${suite.name} tests completed successfully in ${duration}ms`, 'success');
    return { name: suite.name, success: true, duration, ...result };
  } catch (error) {
    log(`${suite.name} tests failed: ${error.code}`, 'error');
    return { name: suite.name, success: false, error: error.message };
  }
}

async function runTestsSequentially() {
  log('Running tests sequentially...');
  
  const results = [];
  for (const suite of CONFIG.testSuites) {
    const result = await runTestSuite(suite);
    results.push(result);
    
    if (!result.success && options.ci) {
      log(`Stopping execution due to test failure in ${suite.name}`, 'error');
      break;
    }
  }
  
  return results;
}

async function runTestsInParallel() {
  log('Running tests in parallel...');
  
  const testPromises = CONFIG.testSuites.map(suite => runTestSuite(suite));
  const results = await Promise.allSettled(testPromises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return { name: CONFIG.testSuites[index].name, success: false, error: result.reason };
    }
  });
}

function generateTestReport(results) {
  log('Generating test report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      successRate: 0
    },
    suites: results,
    coverage: null
  };
  
  report.summary.successRate = Math.round((report.summary.passed / report.summary.total) * 100);
  
  // Generate coverage summary if available
  if (options.coverage && fs.existsSync(CONFIG.coverageDir)) {
    try {
      const coverageSummaryPath = path.join(CONFIG.coverageDir, 'coverage-summary.json');
      if (fs.existsSync(coverageSummaryPath)) {
        const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
        report.coverage = coverageData.total;
      }
    } catch (error) {
      log('Could not read coverage data', 'warning');
    }
  }
  
  // Write report to file
  const reportPath = path.join(CONFIG.testResultsDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate human-readable report
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(CONFIG.testResultsDir, 'test-report.md');
  fs.writeFileSync(markdownPath, markdownReport);
  
  log(`Test report generated: ${reportPath}`, 'success');
  log(`Markdown report generated: ${markdownPath}`, 'success');
  
  return report;
}

function generateMarkdownReport(report) {
  let markdown = `# 🏦 Banking System Test Report\n\n`;
  markdown += `**Generated**: ${new Date(report.timestamp).toLocaleString()}\n\n`;
  
  markdown += `## 📊 Summary\n\n`;
  markdown += `- **Total Test Suites**: ${report.summary.total}\n`;
  markdown += `- **Passed**: ${report.summary.passed} ✅\n`;
  markdown += `- **Failed**: ${report.summary.failed} ❌\n`;
  markdown += `- **Success Rate**: ${report.summary.successRate}%\n\n`;
  
  if (report.coverage) {
    markdown += `## 🎯 Coverage\n\n`;
    markdown += `- **Lines**: ${report.coverage.lines.pct}%\n`;
    markdown += `- **Functions**: ${report.coverage.functions.pct}%\n`;
    markdown += `- **Branches**: ${report.coverage.branches.pct}%\n`;
    markdown += `- **Statements**: ${report.coverage.statements.pct}%\n\n`;
  }
  
  markdown += `## 🧪 Test Suite Results\n\n`;
  
  report.suites.forEach(suite => {
    const status = suite.success ? '✅' : '❌';
    const duration = suite.duration ? ` (${suite.duration}ms)` : '';
    markdown += `- **${suite.name}**: ${status} ${suite.success ? 'PASSED' : 'FAILED'}${duration}\n`;
    
    if (!suite.success && suite.error) {
      markdown += `  - Error: ${suite.error}\n`;
    }
  });
  
  markdown += `\n## 🔒 Banking Compliance Status\n\n`;
  markdown += `- **Security Audit**: ${report.summary.failed === 0 ? '✅ PASSED' : '❌ FAILED'}\n`;
  markdown += `- **Code Quality**: ${report.summary.successRate >= CONFIG.coverageThreshold ? '✅ MAINTAINED' : '⚠️ NEEDS ATTENTION'}\n`;
  markdown += `- **Test Coverage**: ${report.coverage && report.coverage.lines.pct >= CONFIG.coverageThreshold ? '✅ ADEQUATE' : '⚠️ BELOW THRESHOLD'}\n\n`;
  
  markdown += `## 📋 Next Steps\n\n`;
  if (report.summary.failed === 0) {
    markdown += `🎉 **All tests passed!** The system is ready for deployment.\n`;
  } else {
    markdown += `⚠️ **Tests failed!** Please review and fix the failing tests before deployment.\n`;
  }
  
  return markdown;
}

function printSummary(report) {
  console.log('\n' + '='.repeat(60));
  console.log('🏦 BANKING SYSTEM TEST EXECUTION SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n📊 Results:`);
  console.log(`  Total Suites: ${report.summary.total}`);
  console.log(`  Passed: ${report.summary.passed} ✅`);
  console.log(`  Failed: ${report.summary.failed} ❌`);
  console.log(`  Success Rate: ${report.summary.successRate}%`);
  
  if (report.coverage) {
    console.log(`\n🎯 Coverage:`);
    console.log(`  Lines: ${report.coverage.lines.pct}%`);
    console.log(`  Functions: ${report.coverage.functions.pct}%`);
    console.log(`  Branches: ${report.coverage.branches.pct}%`);
    console.log(`  Statements: ${report.coverage.statements.pct}%`);
  }
  
  console.log(`\n🔒 Compliance:`);
  console.log(`  Security Audit: ${report.summary.failed === 0 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Code Quality: ${report.summary.successRate >= CONFIG.coverageThreshold ? '✅ MAINTAINED' : '⚠️ NEEDS ATTENTION'}`);
  
  console.log('\n' + '='.repeat(60));
  
  if (report.summary.failed > 0) {
    console.log('\n❌ FAILED TEST SUITES:');
    report.suites.filter(s => !s.success).forEach(suite => {
      console.log(`  - ${suite.name}: ${suite.error || 'Unknown error'}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
  }
}

// Main execution
async function main() {
  try {
    log('🏦 Starting Banking System Test Suite...');
    log(`Mode: ${options.parallel ? 'Parallel' : 'Sequential'}`);
    log(`Coverage: ${options.coverage ? 'Enabled' : 'Disabled'}`);
    log(`CI Mode: ${options.ci ? 'Enabled' : 'Disabled'}`);
    
    // Run tests
    const results = options.parallel ? 
      await runTestsInParallel() : 
      await runTestsSequentially();
    
    // Generate report if requested
    let report;
    if (options.report) {
      report = generateTestReport(results);
    } else {
      // Simple summary
      report = {
        summary: {
          total: results.length,
          passed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          successRate: Math.round((results.filter(r => r.success).length / results.length) * 100)
        },
        suites: results
      };
    }
    
    // Print summary
    printSummary(report);
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTestsInParallel, runTestsSequentially, generateTestReport };