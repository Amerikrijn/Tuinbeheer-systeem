#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 Test Resultaten Analyseren (Gerepareerd)...\n');

function analyzeTestResults(xmlFile) {
  if (!fs.existsSync(xmlFile)) {
    console.error(`❌ Test resultaten bestand niet gevonden: ${xmlFile}`);
    return;
  }

  const content = fs.readFileSync(xmlFile, 'utf8');
  
  // Extract totals from header
  const headerMatch = content.match(/tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*time="([^"]+)"/);
  
  if (!headerMatch) {
    console.error('❌ Kan test header niet parsen');
    return;
  }
  
  const totalTests = parseInt(headerMatch[1]);
  const totalFailures = parseInt(headerMatch[2]);
  const totalErrors = parseInt(headerMatch[3]);
  const totalTime = parseFloat(headerMatch[4]);
  const totalSuccess = totalTests - totalFailures - totalErrors;
  
  console.log('📊 TEST OVERZICHT');
  console.log('==================');
  console.log(`Totaal aantal tests: ${totalTests}`);
  console.log(`Geslaagde tests: ${totalSuccess} (${((totalSuccess/totalTests)*100).toFixed(1)}%)`);
  console.log(`Gefaalde tests: ${totalFailures} (${((totalFailures/totalTests)*100).toFixed(1)}%)`);
  console.log(`Errors: ${totalErrors} (${((totalErrors/totalTests)*100).toFixed(1)}%)`);
  console.log(`Uitvoeringstijd: ${totalTime.toFixed(2)} seconden`);
  console.log('');
  
  // Parse test suites manually
  const testSuites = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<testsuite') && line.includes('name=')) {
      // Extract name
      const nameMatch = line.match(/name="([^"]*)"/);
      if (!nameMatch) continue;
      const name = nameMatch[1];
      
      // Skip if it's just the main testsuites tag
      if (name === 'vitest tests') continue;
      
      // Extract tests, failures, errors, time
      const testsMatch = line.match(/tests="(\d+)"/);
      const failuresMatch = line.match(/failures="(\d+)"/);
      const errorsMatch = line.match(/errors="(\d+)"/);
      const timeMatch = line.match(/time="([^"]+)"/);
      
      if (testsMatch && failuresMatch && errorsMatch && timeMatch) {
        const tests = parseInt(testsMatch[1]);
        const failures = parseInt(failuresMatch[1]);
        const errors = parseInt(errorsMatch[1]);
        const time = parseFloat(timeMatch[1]);
        
        testSuites.push({
          name,
          tests,
          failures,
          errors,
          time,
          successRate: ((tests - failures - errors) / tests) * 100
        });
      }
    }
  }
  
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
  
  // Check for unexpected successes
  console.log('🎯 ONVERWACHTE SUCCESS (moeten gecontroleerd worden)');
  console.log('====================================================');
  const unexpectedSuccesses = successfulSuites.filter(ts => {
    // These are tests that might be too superficial
    return ts.name.includes('auth') || 
           ts.name.includes('security') || 
           ts.name.includes('database') ||
           ts.name.includes('api') ||
           ts.tests > 10; // Large test suites that succeed might be too shallow
  });
  
  unexpectedSuccesses.forEach(ts => {
    console.log(`⚠️ ${ts.name}: ${ts.tests} tests geslaagd - CONTROLEER OF TESTS TE OPPERVLAKKIG ZIJN!`);
  });
  
  if (unexpectedSuccesses.length === 0) {
    console.log('✅ Geen onverwachte successes gevonden');
  }
  console.log('');
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests,
    totalSuccess,
    totalFailures,
    totalErrors,
    totalTime,
    testSuites: testSuites.length,
    criticalFailures: criticalFailures.length,
    highPriorityFailures: highPriorityFailures.length,
    mediumPriorityFailures: mediumPriorityFailures.length,
    successfulSuites: successfulSuites.length,
    unexpectedSuccesses: unexpectedSuccesses.length,
    categories,
    recommendations: {
      critical: criticalFailures.map(ts => ({ name: ts.name, failures: ts.failures })),
      high: highPriorityFailures.map(ts => ({ name: ts.name, failures: ts.failures, successRate: ts.successRate })),
      medium: mediumPriorityFailures.map(ts => ({ name: ts.name, failures: ts.failures, successRate: ts.successRate })),
      unexpected: unexpectedSuccesses.map(ts => ({ name: ts.name, tests: ts.tests }))
    }
  };
  
  const summaryFile = 'test-analysis-fixed-summary.json';
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`📄 Gedetailleerd rapport opgeslagen in: ${summaryFile}`);
}

// Main execution
const xmlFile = process.argv[2] || 'test-results/ci.xml';
analyzeTestResults(xmlFile);