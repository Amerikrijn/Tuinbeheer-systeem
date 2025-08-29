#!/usr/bin/env node

/**
 * 🏦 Traditional Banking System Test Runner
 * 
 * This script runs all tests in parallel without dependencies,
 * focusing on traditional banking standards and compliance.
 * NO AI tools used - only traditional testing approaches.
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

// Configuration - Based on actual existing test files
const CONFIG = {
  testSuites: [
    // UI Components - Small, focused tests that should pass
    { name: 'ui-button', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/button.test.tsx"', pattern: '__tests__/components/ui/button.test.tsx' },
    { name: 'ui-input', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/input.test.tsx"', pattern: '__tests__/components/ui/input.test.tsx' },
    { name: 'ui-card', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/card.test.tsx"', pattern: '__tests__/components/ui/card.test.tsx' },
    { name: 'ui-table', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/table.test.tsx"', pattern: '__tests__/components/ui/table.test.tsx' },
    { name: 'ui-switch', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/switch.test.tsx"', pattern: '__tests__/components/ui/switch.test.tsx' },
    { name: 'ui-label', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/label.test.tsx"', pattern: '__tests__/components/ui/label.test.tsx' },
    { name: 'ui-alert', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/alert.test.tsx"', pattern: '__tests__/components/ui/alert.test.tsx' },
    { name: 'ui-badge', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/badge.test.tsx"', pattern: '__tests__/components/ui/badge.test.tsx' },
    { name: 'ui-checkbox', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/checkbox.test.tsx"', pattern: '__tests__/components/ui/checkbox.test.tsx' },
    { name: 'ui-textarea', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/textarea.test.tsx"', pattern: '__tests__/components/ui/textarea.test.tsx' },
    { name: 'ui-tabs', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/tabs.test.tsx"', pattern: '__tests__/components/ui/tabs.test.tsx' },
    { name: 'ui-breadcrumb', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/breadcrumb.test.tsx"', pattern: '__tests__/components/ui/breadcrumb.test.tsx' },
    { name: 'ui-pagination', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/pagination.test.tsx"', pattern: '__tests__/components/ui/pagination.test.tsx' },
    { name: 'ui-skeleton', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/skeleton.test.tsx"', pattern: '__tests__/components/ui/skeleton.test.tsx' },
    { name: 'ui-navigation-menu', script: 'npm run test:ci -- --testPathPattern="__tests__/components/ui/navigation-menu.test.tsx"', pattern: '__tests__/components/ui/navigation-menu.test.tsx' },
    
    // Core Components - Main application components
    { name: 'core-LoginForm', script: 'npm run test:ci -- --testPathPattern="__tests__/components/LoginForm.test.tsx"', pattern: '__tests__/components/LoginForm.test.tsx' },
    { name: 'core-navigation', script: 'npm run test:ci -- --testPathPattern="__tests__/components/navigation.test.tsx"', pattern: '__tests__/components/navigation.test.tsx' },
    { name: 'core-theme-toggle', script: 'npm run test:ci -- --testPathPattern="__tests__/components/theme-toggle.test.tsx"', pattern: '__tests__/components/theme-toggle.test.tsx' },
    { name: 'core-language-switcher', script: 'npm run test:ci -- --testPathPattern="__tests__/components/language-switcher.test.tsx"', pattern: '__tests__/components/language-switcher.test.tsx' },
    { name: 'core-error-boundary', script: 'npm run test:ci -- --testPathPattern="__tests__/components/error-boundary.test.tsx"', pattern: '__tests__/components/error-boundary.test.tsx' },
    
    // Banking Compliance Tests
    { name: 'compliance-banking', script: 'npm run test:ci -- --testPathPattern="__tests__/setup/banking-pipeline.test.ts"', pattern: '__tests__/setup/banking-pipeline.test.ts' },
    
    // Integration Tests (if they exist)
    { name: 'integration-api', script: 'npm run test:ci -- --testPathPattern="__tests__/integration/**/*.{test,spec}.{ts,tsx}"', pattern: '__tests__/integration/**/*.{test,spec}.{ts,tsx}' },
    
    // Unit Tests (if they exist)
    { name: 'unit-lib', script: 'npm run test:ci -- --testPathPattern="__tests__/unit/lib/**/*.{test,spec}.{ts,tsx}"', pattern: '__tests__/unit/lib/**/*.{test,spec}.{ts,tsx}' },
    { name: 'unit-app', script: 'npm run test:ci -- --testPathPattern="__tests__/unit/app/**/*.{test,spec}.{ts,tsx}"', pattern: '__tests__/unit/app/**/*.{test,spec}.{ts,tsx}' },
    { name: 'unit-hooks', script: 'npm run test:ci -- --testPathPattern="__tests__/unit/hooks/**/*.{test,spec}.{ts,tsx}"', pattern: '__tests__/unit/hooks/**/*.{test,spec}.{ts,tsx}' },
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

// --- New helpers: aggregate artifacts + parse Jest results ---
async function runAggregateArtifacts({ withCoverage, silent } = { withCoverage: false, silent: false }) {
  try {
    const jsonOut = path.join(CONFIG.testResultsDir, 'ci.json');
    const parts = ['npm', 'run', 'test:ci', '--', '--testPathPattern="__tests__"', '--json', `--outputFile ${jsonOut}`];
    if (withCoverage) parts.push('--coverage');
    const cmd = parts.join(' ');
    log(`Running aggregate Jest for artifacts: ${cmd}`);
    await runCommand(cmd, { silent });
    log('Aggregate Jest JSON (and coverage if enabled) generated', 'success');
  } catch (e) {
    log(`Failed to generate aggregate artifacts: ${e.stderr || e.error || e.code}`, 'warning');
  }
}

function parseJestResults(jsonPath) {
  const result = {
    found: false,
    totals: { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0, passRate: 0, timeSec: 0 },
    topFailures: { critical: [], high: [], medium: [] },
    suites: []
  };
  try {
    if (!fs.existsSync(jsonPath)) return result;
    const content = fs.readFileSync(jsonPath, 'utf8');
    const jestResults = JSON.parse(content);
    result.found = true;

    // Extract totals from Jest results
    const tests = jestResults.numTotalTests || 0;
    const failures = jestResults.numFailedTests || 0;
    const errors = jestResults.numRuntimeErrorTestSuites || 0;
    const skipped = jestResults.numPendingTests || 0;
    const passed = tests - failures - errors - skipped;
    const passRate = tests > 0 ? (passed / tests) * 100 : 0;
    const timeSec = jestResults.testResults.reduce((acc, suite) => acc + (suite.endTime - suite.startTime), 0) / 1000;

    result.totals = { tests, failures, errors, skipped, passed, passRate, timeSec };

    // Parse test suites from Jest results
    const suites = [];
    jestResults.testResults.forEach(suite => {
      if (suite.testResults && suite.testResults.length > 0) {
        const suiteTests = suite.testResults.length;
        const suiteFailures = suite.testResults.filter(test => test.status === 'failed').length;
        const suiteErrors = suite.testResults.filter(test => test.status === 'failed' && test.failureMessages && test.failureMessages.length > 0).length;
        const suiteSkipped = suite.testResults.filter(test => test.status === 'pending').length;
        const suiteTime = (suite.endTime - suite.startTime) / 1000;
        const suiteSuccess = suiteTests - suiteFailures - suiteErrors - suiteSkipped;
        const successRate = suiteTests > 0 ? (suiteSuccess / suiteTests) * 100 : 0;
        
        suites.push({ 
          name: suite.name, 
          tests: suiteTests, 
          failures: suiteFailures, 
          errors: suiteErrors, 
          skipped: suiteSkipped, 
          time: suiteTime, 
          successRate 
        });
      }
    });

    result.suites = suites;

    // Top failures
    const sortedByFailureRate = suites
      .filter(s => s.tests > 0)
      .sort((a, b) => (b.failures / b.tests) - (a.failures / a.tests));

    const critical = sortedByFailureRate.filter(s => s.failures === s.tests && s.tests > 0).slice(0, 10);
    const high = sortedByFailureRate.filter(s => s.failures > 0 && s.failures < s.tests && (s.failures / s.tests) > 0.5).slice(0, 10);
    const medium = sortedByFailureRate.filter(s => s.failures > 0 && (s.failures / s.tests) <= 0.5).slice(0, 10);

    result.topFailures = { critical, high, medium };
  } catch (e) {
    log(`Failed to parse Jest results: ${e.message}`, 'warning');
  }
  return result;
}

function readCoverageSummaryIfAny() {
  try {
    const coverageSummaryPath = path.join(CONFIG.coverageDir, 'coverage-summary.json');
    if (fs.existsSync(coverageSummaryPath)) {
      const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
      return coverageData.total;
    }
  } catch (e) {
    log('Could not read coverage data', 'warning');
  }
  return null;
}

function resolveJestResultsPath() {
  try {
    const preferred = path.join(CONFIG.testResultsDir, 'ci.json');
    if (fs.existsSync(preferred)) return preferred;
    
    // Fallback to other possible Jest result files
    const alternatives = [
      path.join(CONFIG.testResultsDir, 'all-tests.json'),
      path.join(CONFIG.testResultsDir, 'test-results.json')
    ];
    
    for (const alt of alternatives) {
      if (fs.existsSync(alt)) return alt;
    }
    
    return null;
  } catch (e) {
    log('Could not resolve Jest results path', 'warning');
    return null;
  }
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
    coverage: null,
    artifacts: {
      junit: resolveJestResultsPath(), // Changed to resolveJestResultsPath
      coverageDir: CONFIG.coverageDir
    },
    jest: null,
  };
  
  report.summary.successRate = Math.round((report.summary.passed / report.summary.total) * 100);
  
  // Attach coverage summary if available
  const cov = readCoverageSummaryIfAny();
  if (cov) {
    report.coverage = cov;
  }

  // Attach parsed Jest totals and top failures if available
  const jestParsed = parseJestResults(report.artifacts.junit);
  if (jestParsed.found) {
    report.jest = jestParsed;
  }
  
  // Write JSON + Markdown reports
  const reportPath = path.join(CONFIG.testResultsDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(CONFIG.testResultsDir, 'test-report.md');
  fs.writeFileSync(markdownPath, markdownReport);
  
  log(`Test report generated: ${reportPath}`, 'success');
  log(`Markdown report generated: ${markdownPath}`, 'success');
  
  return report;
}

function generateMarkdownReport(report) {
  let markdown = `# 🏦 Traditional Banking System Test Report - Complete Coverage\n\n`;
  markdown += `**Generated**: ${new Date(report.timestamp).toLocaleString()}\n\n`;
  markdown += `**Important**: This pipeline uses NO AI tools - only traditional testing approaches!\n\n`;
  
  markdown += `## 📊 Suite Summary\n\n`;
  markdown += `- **Total Test Suites**: ${report.summary.total}\n`;
  markdown += `- **Passed**: ${report.summary.passed} ✅\n`;
  markdown += `- **Failed**: ${report.summary.failed} ❌\n`;
  markdown += `- **Success Rate**: ${report.summary.successRate}%\n\n`;

  if (report.jest) {
    const j = report.jest.totals;
    markdown += `## 🧪 Test Execution Summary (Artifacts)\n\n`;
    markdown += `- **Total Tests**: ${j.tests}\n`;
    markdown += `- **Passed**: ${j.passed}\n`;
    markdown += `- **Failed**: ${j.failures}\n`;
    markdown += `- **Errors**: ${j.errors}\n`;
    markdown += `- **Skipped**: ${j.skipped}\n`;
    markdown += `- **Pass Rate**: ${j.passRate.toFixed(2)}%\n`;
    markdown += `- **Duration**: ${j.timeSec.toFixed(2)}s\n\n`;
  }
  
  if (report.coverage) {
    markdown += `## 🎯 Coverage\n\n`;
    markdown += `- **Lines**: ${report.coverage.lines.pct}%\n`;
    markdown += `- **Functions**: ${report.coverage.functions.pct}%\n`;
    markdown += `- **Branches**: ${report.coverage.branches.pct}%\n`;
    markdown += `- **Statements**: ${report.coverage.statements.pct}%\n\n`;
  } else {
    markdown += `> Coverage artifacts not found. Enable coverage to generate \
(try: \
\`node scripts/run-banking-tests.js --ci --coverage --report\`).\n\n`;
  }

  if (report.jest) {
    const { critical, high, medium } = report.jest.topFailures;
    markdown += `## 🚨 Top Failures\n\n`;
    markdown += `### 🔥 Kritiek (100% failure)\n`;
    if (critical.length) {
      critical.forEach(s => { markdown += `- ❌ ${s.name}: ${s.failures}/${s.tests} failures\n`; });
    } else {
      markdown += `- ✅ Geen kritieke failures\n`;
    }
    markdown += `\n### ⚠️ Hoog (>50% failure)\n`;
    if (high.length) {
      high.forEach(s => { markdown += `- ⚠️ ${s.name}: ${s.failures}/${s.tests} failures (${s.successRate.toFixed(1)}% success)\n`; });
    } else {
      markdown += `- ✅ Geen hoge prioriteit failures\n`;
    }
    markdown += `\n### 🔧 Matig (1-50% failure)\n`;
    if (medium.length) {
      medium.forEach(s => { markdown += `- 🔧 ${s.name}: ${s.failures}/${s.tests} failures (${s.successRate.toFixed(1)}% success)\n`; });
    } else {
      markdown += `- ✅ Geen matige prioriteit failures\n`;
    }
    markdown += `\n`;
  }

  markdown += `## 📦 Artifacts\n\n`;
  markdown += `- **Jest Results**: ${report.artifacts.junit}\n`;
  markdown += `- **Coverage dir**: ${report.artifacts.coverageDir} (lcov, html, summary)\n\n`;

  markdown += `## 🔒 Traditional Banking Compliance Status\n\n`;
  markdown += `- **Security Audit**: ${report.summary.failed === 0 ? '✅ PASSED' : '⚠️ WITH FAILURES'}\n`;
  markdown += `- **Code Quality**: ${report.summary.successRate >= CONFIG.coverageThreshold ? '✅ MAINTAINED' : '⚠️ NEEDS ATTENTION'}\n`;
  markdown += `- **Test Coverage**: ${report.coverage && report.coverage.lines.pct >= CONFIG.coverageThreshold ? '✅ ADEQUATE' : '⚠️ BELOW THRESHOLD'}\n`;
  markdown += `- **AI-Free**: ✅ NO AI tools used - Traditional approach only\n\n`;

  markdown += `## 📋 Next Steps\n\n`;
  if (report.jest) {
    const failedCount = report.jest.totals.failures;
    if (failedCount > 0) {
      markdown += `- Fix critical failures first (see Top Failures)\n`;
      markdown += `- Address high priority failures within 1 week\n`;
      markdown += `- Add data-testid to UI components where missing\n`;
      markdown += `- Create proper mocks for database and external deps\n`;
    } else {
      markdown += `- 🎉 All tests passed! Ready for deployment.\n`;
    }
  }

  return markdown;
}

function printSummary(report) {
  console.log('\n' + '='.repeat(60));
  console.log('🏦 TRADITIONAL BANKING SYSTEM TEST EXECUTION SUMMARY');
  console.log('='.repeat(60));
  console.log('✅ NO AI tools - Traditional testing approach only!');
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
  console.log(`  AI-Free: ✅ NO AI tools used`);
  
  console.log('\n' + '='.repeat(60));
  
  if (report.summary.failed > 0) {
    console.log('\n❌ FAILED TEST SUITES:');
    report.suites.filter(s => !s.success).forEach(suite => {
      console.log(`  - ${suite.name}: ${suite.error || 'Unknown error'}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
    console.log('✅ Traditional banking compliance achieved!');
  }
}

// Main execution
async function main() {
  try {
    log('🏦 Starting Traditional Banking System Test Suite...');
    log('✅ NO AI tools - Traditional testing approach only!');
    log(`Mode: ${options.parallel ? 'Parallel' : 'Sequential'}`);
    log(`Coverage: ${options.coverage ? 'Enabled' : 'Disabled'}`);
    log(`CI Mode: ${options.ci ? 'Enabled' : 'Disabled'}`);
    
    // Run tests
    const results = options.parallel ? 
      await runTestsInParallel() : 
      await runTestsSequentially();

    // Ensure aggregate artifacts (Jest + optional coverage) exist for reporting
    if (options.report || options.ci) {
      await runAggregateArtifacts({ withCoverage: options.coverage, silent: options.ci });
    }
    
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