#!/usr/bin/env node

/**
 * 🧪 Jest Test Results Analyzer
 * 
 * This script analyzes Jest test results and generates a comprehensive summary
 * for the traditional banking test pipeline.
 * 
 * Usage:
 *   node scripts/analyze-jest-results.js <jest-json-file>
 */

const fs = require('fs');

console.log('🔍 Jest Test Resultaten Analyseren...\n');

function analyzeJestResults(jsonFile) {
  if (!fs.existsSync(jsonFile)) {
    console.error(`❌ Jest resultaten bestand niet gevonden: ${jsonFile}`);
    return;
  }

  const content = fs.readFileSync(jsonFile, 'utf8');
  const results = JSON.parse(content);
  
  // Extract totals from Jest results
  const totalTests = results.numTotalTests || 0;
  const totalFailures = results.numFailedTests || 0;
  const totalErrors = results.numRuntimeErrorTestSuites || 0;
  const totalSuccess = totalTests - totalFailures - totalErrors;
  const totalTime = results.testResults.reduce((acc, suite) => acc + (suite.endTime - suite.startTime), 0) / 1000;
  
  console.log('📊 TEST OVERZICHT');
  console.log('==================');
  console.log(`Totaal aantal tests: ${totalTests}`);
  console.log(`Geslaagde tests: ${totalSuccess} (${((totalSuccess/totalTests)*100).toFixed(1)}%)`);
  console.log(`Gefaalde tests: ${totalFailures} (${((totalFailures/totalTests)*100).toFixed(1)}%)`);
  console.log(`Errors: ${totalErrors} (${((totalErrors/totalTests)*100).toFixed(1)}%)`);
  console.log(`Uitvoeringstijd: ${totalTime.toFixed(2)} seconden`);
  console.log('');
  
  // Analyze test suites
  const testSuites = [];
  
  results.testResults.forEach(suite => {
    if (suite.assertionResults && suite.assertionResults.length > 0) {
      const tests = suite.assertionResults.length;
      const failures = suite.assertionResults.filter(test => test.status === 'failed').length;
      const errors = suite.assertionResults.filter(test => test.status === 'failed' && test.failureMessages && test.failureMessages.length > 0).length;
      const time = (suite.endTime - suite.startTime) / 1000;
      
      testSuites.push({
        name: suite.name,
        tests,
        failures,
        errors,
        time,
        successRate: ((tests - failures - errors) / tests) * 100
      });
    } else {
      // Handle case where suite has no individual test results (e.g., all tests passed)
      const tests = suite.numTotalTests || 0;
      const failures = suite.numFailedTests || 0;
      const errors = suite.numRuntimeErrorTestSuites || 0;
      const time = (suite.endTime - suite.startTime) / 1000;
      
      if (tests > 0) {
        testSuites.push({
          name: suite.name,
          tests,
          failures,
          errors,
          time,
          successRate: ((tests - failures - errors) / tests) * 100
        });
      }
    }
  });
  
  console.log(`Aantal test suites gevonden: ${testSuites.length}`);
  console.log('');
  
  // Sort by failure rate (highest first)
  testSuites.sort((a, b) => (b.failures / b.tests) - (a.failures / a.tests));
  
  console.log('🚨 KRITIEKE FAILURES (100% failure rate)');
  console.log('==========================================');
  const criticalFailures = testSuites.filter(ts => ts.failures === ts.tests && ts.tests > 0);
  criticalFailures.forEach(ts => {
    console.log(`❌ ${ts.name}: ${ts.failures}/${ts.tests} tests falen`);
  });
  
  if (criticalFailures.length === 0) {
    console.log('✅ Geen kritieke failures gevonden');
  }
  console.log('');
  
  console.log('⚠️ HOGE PRIORITEIT FAILURES (>50% failure rate)');
  console.log('================================================');
  const highPriorityFailures = testSuites.filter(ts => 
    ts.failures > 0 && 
    (ts.failures / ts.tests) > 0.5 && 
    ts.failures !== ts.tests
  );
  highPriorityFailures.forEach(ts => {
    console.log(`⚠️ ${ts.name}: ${ts.failures}/${ts.tests} tests falen (${ts.successRate.toFixed(1)}% success)`);
  });
  
  if (highPriorityFailures.length === 0) {
    console.log('✅ Geen hoge prioriteit failures gevonden');
  }
  console.log('');
  
  console.log('🔧 MEDIUM PRIORITEIT FAILURES (>25% failure rate)');
  console.log('==================================================');
  const mediumPriorityFailures = testSuites.filter(ts => 
    ts.failures > 0 && 
    (ts.failures / ts.tests) > 0.25 && 
    (ts.failures / ts.tests) <= 0.5
  );
  mediumPriorityFailures.forEach(ts => {
    console.log(`🔧 ${ts.name}: ${ts.failures}/${ts.tests} tests falen (${ts.successRate.toFixed(1)}% success)`);
  });
  
  if (mediumPriorityFailures.length === 0) {
    console.log('✅ Geen medium prioriteit failures gevonden');
  }
  console.log('');
  
  console.log('✅ SUCCESSFULLE TEST SUITES (>90% success rate)');
  console.log('================================================');
  const successfulSuites = testSuites.filter(ts => ts.successRate >= 90);
  successfulSuites.forEach(ts => {
    console.log(`✅ ${ts.name}: ${ts.successRate.toFixed(1)}% success (${ts.tests - ts.failures - ts.errors}/${ts.tests} tests)`);
  });
  
  if (successfulSuites.length === 0) {
    console.log('⚠️ Geen succesvolle test suites gevonden');
  }
  console.log('');
  
  // Generate recommendations
  const recommendations = {
    critical: criticalFailures.map(ts => ({
      name: ts.name,
      failures: ts.failures,
      tests: ts.tests,
      priority: 'critical'
    })),
    high: highPriorityFailures.map(ts => ({
      name: ts.name,
      failures: ts.failures,
      tests: ts.tests,
      successRate: ts.successRate / 100,
      priority: 'high'
    })),
    medium: mediumPriorityFailures.map(ts => ({
      name: ts.name,
      failures: ts.failures,
      tests: ts.tests,
      successRate: ts.successRate / 100,
      priority: 'medium'
    })),
    unexpected: successfulSuites.filter(ts => ts.tests < 5).map(ts => ({
      name: ts.name,
      tests: ts.tests,
      successRate: ts.successRate / 100,
      priority: 'unexpected'
    }))
  };
  
  // Generate summary JSON
  const summary = {
    totalTests,
    totalSuccess,
    totalFailures,
    totalErrors,
    totalTime,
    criticalFailures: criticalFailures.length,
    highPriorityFailures: highPriorityFailures.length,
    mediumPriorityFailures: mediumPriorityFailures.length,
    unexpectedSuccesses: recommendations.unexpected.length,
    recommendations,
    testSuites: testSuites.map(ts => ({
      name: ts.name,
      tests: ts.tests,
      failures: ts.failures,
      errors: ts.errors,
      successRate: ts.successRate / 100,
      time: ts.time
    }))
  };
  
  // Write summary to file
  fs.writeFileSync('jest-analysis-summary.json', JSON.stringify(summary, null, 2));
  console.log('✅ Samenvatting opgeslagen in jest-analysis-summary.json');
  
  // Ensure test-results directory exists
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  // Generate markdown report
  let markdown = '# 🧪 Jest Test Analysis Report\n\n';
  markdown += `**Generated**: ${new Date().toISOString()}\n\n`;
  markdown += `## 📊 Test Overview\n\n`;
  markdown += `- **Total Tests**: ${totalTests}\n`;
  markdown += `- **Success Rate**: ${totalSuccess}/${totalTests} (${((totalSuccess/totalTests)*100).toFixed(1)}%)\n`;
  markdown += `- **Total Failures**: ${totalFailures}\n`;
  markdown += `- **Total Errors**: ${totalErrors}\n`;
  markdown += `- **Execution Time**: ${totalTime.toFixed(2)}s\n\n`;
  
  if (criticalFailures.length > 0) {
    markdown += `## 🚨 Critical Failures (Fix Immediately)\n\n`;
    criticalFailures.forEach(ts => {
      markdown += `- **${ts.name}**: ${ts.failures}/${ts.tests} tests failing\n`;
    });
    markdown += '\n';
  }
  
  if (highPriorityFailures.length > 0) {
    markdown += `## ⚠️ High Priority Failures (Fix within 1 week)\n\n`;
    highPriorityFailures.forEach(ts => {
      markdown += `- **${ts.name}**: ${ts.failures}/${ts.tests} tests failing (${ts.successRate.toFixed(1)}% success)\n`;
    });
    markdown += '\n';
  }
  
  if (mediumPriorityFailures.length > 0) {
    markdown += `## 🔧 Medium Priority Failures (Fix within 2 weeks)\n\n`;
    mediumPriorityFailures.forEach(ts => {
      markdown += `- **${ts.name}**: ${ts.failures}/${ts.tests} tests failing (${ts.successRate.toFixed(1)}% success)\n`;
    });
    markdown += '\n';
  }
  
  markdown += `## 📋 Recommendations\n\n`;
  markdown += `1. **Fix Critical Failures**: Address ${criticalFailures.length} critical test failures first\n`;
  markdown += `2. **Fix High Priority**: Address ${highPriorityFailures.length} high priority failures within 1 week\n`;
  markdown += `3. **Fix Medium Priority**: Address ${mediumPriorityFailures.length} medium priority failures within 2 weeks\n`;
  markdown += `4. **Add data-testid attributes** to UI components\n`;
  markdown += `5. **Create proper test mocks** for database dependencies\n`;
  markdown += `6. **Set up test environment** with required services\n`;
  
  fs.writeFileSync('test-results/jest-analysis-report.md', markdown);
  console.log('✅ Markdown report opgeslagen in test-results/jest-analysis-report.md');
  
  return summary;
}

// Main execution
const jsonFile = process.argv[2];
if (!jsonFile) {
  console.error('❌ Geef een Jest JSON bestand op als argument');
  console.error('Gebruik: node scripts/analyze-jest-results.js <jest-json-file>');
  process.exit(1);
}

try {
  analyzeJestResults(jsonFile);
} catch (error) {
  console.error('❌ Fout tijdens analyseren:', error.message);
  process.exit(1);
}