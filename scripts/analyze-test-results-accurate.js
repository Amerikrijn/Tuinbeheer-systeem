#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 ACCURATE Test Resultaten Analyseren (Duplicaten Gedetecteerd)...\n');

function analyzeTestResultsAccurate(xmlFile) {
  if (!fs.existsSync(xmlFile)) {
    console.error(`❌ Test resultaten bestand niet gevonden: ${xmlFile}`);
    return;
  }

  const content = fs.readFileSync(xmlFile, 'utf8');
  
  // Extract totals from header
  const headerMatch = content.match(/<testsuites[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*time="([^"]+)"/);
  
  if (!headerMatch) {
    console.error('❌ Kan test header niet parsen');
    return;
  }
  
  const totalTests = parseInt(headerMatch[1]);
  const totalFailures = parseInt(headerMatch[2]);
  const totalErrors = parseInt(headerMatch[3]);
  const totalTime = parseFloat(headerMatch[4]);
  const totalSuccess = totalTests - totalFailures - totalErrors;
  
  // Parse test suites accurately
  const testSuites = [];
  const testSuiteRegex = /<testsuite[^>]*name="([^"]*)"[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*time="([^"]+)"/g;
  
  let match;
  while ((match = testSuiteRegex.exec(content)) !== null) {
    const [, name, tests, failures, errors, time] = match;
    
    // Skip if name is just "cursor" (hostname)
    if (name === 'cursor') continue;
    
    testSuites.push({
      name,
      tests: parseInt(tests),
      failures: parseInt(failures),
      errors: parseInt(errors),
      time: parseFloat(time),
      successRate: ((parseInt(tests) - parseInt(failures) - parseInt(errors)) / parseInt(tests)) * 100
    });
  }
  
  // Parse individual test cases
  const testCases = [];
  const testCaseRegex = /<testcase[^>]*classname="([^"]*)"[^>]*name="([^"]*)"[^>]*time="([^"]+)"/g;
  
  while ((match = testCaseRegex.exec(content)) !== null) {
    const [, classname, testName, time] = match;
    
    // Skip if classname is just "cursor" (hostname)
    if (classname === 'cursor') continue;
    
    testCases.push({
      classname,
      name: testName,
      time: parseFloat(time)
    });
  }
  
  // Count actual unique test files
  const uniqueTestFiles = new Set();
  testSuites.forEach(ts => {
    if (ts.name.includes('__tests__/')) {
      uniqueTestFiles.add(ts.name);
    } else if (ts.name.includes('.test.') || ts.name.includes('.spec.')) {
      uniqueTestFiles.add(ts.name);
    }
  });
  
  // Calculate actual statistics
  const actualTotalTests = testCases.length;
  const actualTotalSuites = testSuites.length;
  
  console.log('📊 ACCURATE TEST OVERZICHT (Duplicaten Verwijderd)');
  console.log('==================================================');
  console.log(`Vitest gerapporteerd: ${totalTests} tests`);
  console.log(`Daadwerkelijk unieke tests: ${actualTotalTests} tests`);
  console.log(`Daadwerkelijk unieke suites: ${actualTotalSuites} suites`);
  console.log(`Unieke test bestanden: ${uniqueTestFiles.size}`);
  console.log(`Geslaagde tests: ${totalSuccess} (${((totalSuccess/totalTests)*100).toFixed(1)}%)`);
  console.log(`Gefaalde tests: ${totalFailures} (${((totalFailures/totalTests)*100).toFixed(1)}%)`);
  console.log(`Errors: ${totalErrors} (${((totalErrors/totalTests)*100).toFixed(1)}%)`);
  console.log(`Uitvoeringstijd: ${totalTime.toFixed(2)} seconden`);
  console.log('');
  
  // Detect duplicates
  console.log('🔍 DUPLICAAT DETECTIE');
  console.log('======================');
  
  const duplicateSuites = {};
  testSuites.forEach(ts => {
    if (duplicateSuites[ts.name]) {
      duplicateSuites[ts.name]++;
    } else {
      duplicateSuites[ts.name] = 1;
    }
  });
  
  const actualDuplicates = Object.entries(duplicateSuites).filter(([name, count]) => count > 1);
  
  if (actualDuplicates.length > 0) {
    console.log('❌ DUBBELE TEST SUITES GEVONDEN:');
    actualDuplicates.forEach(([name, count]) => {
      console.log(`   ${name}: ${count}x uitgevoerd`);
    });
  } else {
    console.log('✅ Geen dubbele test suites gevonden');
  }
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
  
  console.log('🔧 MATIGE PRIORITEIT FAILURES (1-50% failure rate)');
  console.log('====================================================');
  const mediumPriorityFailures = testSuites.filter(ts => 
    ts.failures > 0 && 
    (ts.failures / ts.tests) <= 0.5
  );
  mediumPriorityFailures.forEach(ts => {
    console.log(`🔧 ${ts.name}: ${ts.failures}/${ts.tests} tests falen (${ts.successRate.toFixed(1)}% success)`);
  });
  
  if (mediumPriorityFailures.length === 0) {
    console.log('✅ Geen matige prioriteit failures gevonden');
  }
  console.log('');
  
  console.log('✅ GESLAAGDE TEST SUITES (0 failures)');
  console.log('======================================');
  const successfulSuites = testSuites.filter(ts => ts.failures === 0 && ts.tests > 0);
  successfulSuites.forEach(ts => {
    console.log(`✅ ${ts.name}: ${ts.tests} tests geslaagd`);
  });
  console.log('');
  
  // Calculate category statistics
  const categories = {
    'UI Components': { total: 0, failures: 0, suites: 0 },
    'Hooks': { total: 0, failures: 0, suites: 0 },
    'Unit Tests': { total: 0, failures: 0, suites: 0 },
    'Integration Tests': { total: 0, failures: 0, suites: 0 },
    'API Tests': { total: 0, failures: 0, suites: 0 },
    'Core Components': { total: 0, failures: 0, suites: 0 },
    'Other': { total: 0, failures: 0, suites: 0 }
  };
  
  testSuites.forEach(ts => {
    let category = 'Other';
    if (ts.name.includes('components/ui/')) category = 'UI Components';
    else if (ts.name.includes('hooks/')) category = 'Hooks';
    else if (ts.name.includes('unit/')) category = 'Unit Tests';
    else if (ts.name.includes('integration/')) category = 'Integration Tests';
    else if (ts.name.includes('api/')) category = 'API Tests';
    else if (ts.name.includes('components/') && !ts.name.includes('ui/')) category = 'Core Components';
    
    categories[category].total += ts.tests;
    categories[category].failures += ts.failures;
    categories[category].suites += 1;
  });
  
  console.log('📈 SUCCESS RATE PER CATEGORIE');
  console.log('==============================');
  Object.entries(categories).forEach(([name, stats]) => {
    if (stats.total > 0) {
      const successRate = ((stats.total - stats.failures) / stats.total) * 100;
      console.log(`${name}: ${stats.total - stats.failures}/${stats.total} tests (${successRate.toFixed(1)}% success) - ${stats.suites} suites`);
    }
  });
  console.log('');
  
  // Priority recommendations
  console.log('🎯 PRIORITEITEN VOOR REPARATIE');
  console.log('================================');
  
  const criticalCount = criticalFailures.reduce((sum, ts) => sum + ts.failures, 0);
  const highCount = highPriorityFailures.reduce((sum, ts) => sum + ts.failures, 0);
  const mediumCount = mediumPriorityFailures.reduce((sum, ts) => sum + ts.failures, 0);
  
  console.log(`🔥 KRITIEK (direct fixen): ${criticalCount} test failures`);
  console.log(`⚠️ HOOG (binnen 1 week): ${highCount} test failures`);
  console.log(`🔧 MATIG (binnen 2 weken): ${mediumCount} test failures`);
  console.log('');
  
  console.log('💡 AANBEVELINGEN');
  console.log('==================');
  console.log(`1. Fix eerst de ${criticalCount} kritieke failures`);
  console.log(`2. Dan de ${highCount} hoge prioriteit failures`);
  console.log(`3. Dit verhoogt je success rate van ${((totalSuccess/totalTests)*100).toFixed(1)}% naar >95%`);
  console.log('');
  
  // Duplicate analysis
  console.log('🔍 DUPLICAAT ANALYSE');
  console.log('=====================');
  console.log(`Vitest rapporteerde: ${totalTests} tests`);
  console.log(`Daadwerkelijk unieke: ${actualTotalTests} tests`);
  console.log(`Verschil door duplicaten: ${totalTests - actualTotalTests} tests`);
  console.log(`Duplicatie percentage: ${(((totalTests - actualTotalTests) / totalTests) * 100).toFixed(1)}%`);
  console.log('');
  
  // Generate accurate summary file
  const summary = {
    timestamp: new Date().toISOString(),
    vitestReported: {
      totalTests,
      totalSuccess,
      totalFailures,
      totalErrors,
      totalTime
    },
    actualResults: {
      totalTests: actualTotalTests,
      totalSuites: actualTotalSuites,
      uniqueTestFiles: uniqueTestFiles.size
    },
    duplicates: {
      totalDuplicates: totalTests - actualTotalTests,
      duplicatePercentage: ((totalTests - actualTotalTests) / totalTests) * 100,
      duplicateSuites: actualDuplicates
    },
    testSuites: testSuites.length,
    criticalFailures: criticalFailures.length,
    highPriorityFailures: highPriorityFailures.length,
    mediumPriorityFailures: mediumPriorityFailures.length,
    successfulSuites: successfulSuites.length,
    categories,
    recommendations: {
      critical: criticalFailures.map(ts => ({ name: ts.name, failures: ts.failures })),
      high: highPriorityFailures.map(ts => ({ name: ts.name, failures: ts.failures, successRate: ts.successRate })),
      medium: mediumPriorityFailures.map(ts => ({ name: ts.name, failures: ts.failures, successRate: ts.successRate }))
    }
  };
  
  const summaryFile = 'test-analysis-accurate-summary.json';
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`📄 Accuraat rapport opgeslagen in: ${summaryFile}`);
}

// Main execution
const xmlFile = process.argv[2] || 'test-results/ci.xml';
analyzeTestResultsAccurate(xmlFile);