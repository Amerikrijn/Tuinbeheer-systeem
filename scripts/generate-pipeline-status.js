#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 Pipeline Status Genereren...\n');

function generatePipelineStatus() {
  // Check if test analysis exists
  if (!fs.existsSync('test-analysis-fixed-summary.json')) {
    console.log('❌ Test analysis niet gevonden. Run eerst: node scripts/fix-test-analysis.js');
    return;
  }

  const analysis = JSON.parse(fs.readFileSync('test-analysis-fixed-summary.json', 'utf8'));
  
  // Calculate overall status
  const successRate = ((analysis.totalSuccess / analysis.totalTests) * 100).toFixed(1);
  const criticalCount = analysis.recommendations.critical.length;
  const highCount = analysis.recommendations.high.length;
  const mediumCount = analysis.recommendations.medium.length;
  
  // Determine pipeline status
  let pipelineStatus = '🟢 SUCCESS';
  let statusEmoji = '✅';
  
  if (criticalCount > 0) {
    pipelineStatus = '🔴 CRITICAL ISSUES';
    statusEmoji = '🚨';
  } else if (highCount > 0) {
    pipelineStatus = '🟡 HIGH PRIORITY ISSUES';
    statusEmoji = '⚠️';
  } else if (mediumCount > 0) {
    pipelineStatus = '🟠 MEDIUM PRIORITY ISSUES';
    statusEmoji = '🔧';
  }
  
  // Generate pipeline status report
  const pipelineReport = `# 🏦 Pipeline Status Report

## 📊 Overall Status
${statusEmoji} **Pipeline**: ${pipelineStatus}
📈 **Test Success Rate**: ${successRate}%
🧪 **Total Tests**: ${analysis.totalTests}
✅ **Passed**: ${analysis.totalSuccess}
❌ **Failed**: ${analysis.totalFailures}

## 🎯 Priority Breakdown
🔥 **Critical Issues**: ${criticalCount} test suites
⚠️ **High Priority**: ${highCount} test suites  
🔧 **Medium Priority**: ${mediumCount} test suites

## 🚨 Critical Issues (Direct Fixen)
${analysis.recommendations.critical.map(ts => `- ❌ ${ts.name}: ${ts.failures} failures`).join('\n')}

## ⚠️ High Priority Issues (Binnen 1 Week)
${analysis.recommendations.high.map(ts => `- ⚠️ ${ts.name}: ${ts.failures} failures (${ts.successRate.toFixed(1)}% success)`).join('\n')}

## 🔧 Medium Priority Issues (Binnen 2 Weken)
${analysis.recommendations.medium.map(ts => `- 🔧 ${ts.name}: ${ts.failures} failures (${ts.successRate.toFixed(1)}% success)`).join('\n')}

## 🎯 Onverwachte Successes (Controleren)
${analysis.recommendations.unexpected.map(ts => `- ⚠️ ${ts.name}: ${ts.tests} tests - mogelijk te oppervlakkig`).join('\n')}

## 📈 Success Rate per Category
${Object.entries(analysis.categories).map(([name, stats]) => {
  if (stats.total > 0) {
    const rate = ((stats.total - stats.failures) / stats.total * 100).toFixed(1);
    return `- **${name}**: ${stats.total - stats.failures}/${stats.total} tests (${rate}% success)`;
  }
  return null;
}).filter(Boolean).join('\n')}

## 🚀 Actie Plan
1. **Week 1**: Fix ${criticalCount} kritieke issues
2. **Week 2**: Fix ${highCount} hoge prioriteit issues  
3. **Week 3**: Fix ${mediumCount} matige prioriteit issues
4. **Week 4**: Optimalisatie en coverage verbetering

## 💡 Aanbevelingen
- Focus eerst op kritieke failures (${criticalCount} test suites)
- Dan op hoge prioriteit failures (${highCount} test suites)
- Dit verhoogt success rate van ${successRate}% naar >95%

---
*Generated: ${new Date().toLocaleString('nl-NL')}*
*Pipeline: Traditional Banking Tests - Complete Coverage*`;

  // Save pipeline status report
  fs.writeFileSync('pipeline-status-report.md', pipelineReport);
  
  // Also generate a GitHub Actions summary
  const githubSummary = `## 🏦 Pipeline Status: ${pipelineStatus}

**Test Success Rate**: ${successRate}% (${analysis.totalSuccess}/${analysis.totalTests})

### 🚨 Critical Issues: ${criticalCount}
${analysis.recommendations.critical.slice(0, 5).map(ts => `- ${ts.name}: ${ts.failures} failures`).join('\n')}
${criticalCount > 5 ? `... en ${criticalCount - 5} meer` : ''}

### ⚠️ High Priority: ${highCount}
${analysis.recommendations.high.slice(0, 5).map(ts => `- ${ts.name}: ${ts.failures} failures`).join('\n')}
${highCount > 5 ? `... en ${highCount - 5} meer` : ''}

**Check artifacts voor volledig rapport**`;

  fs.writeFileSync('github-summary.md', githubSummary);
  
  console.log('✅ Pipeline Status Report gegenereerd:');
  console.log('📄 pipeline-status-report.md - Volledig rapport');
  console.log('📄 github-summary.md - GitHub Actions samenvatting');
  console.log('');
  console.log('🎯 Pipeline Status:', pipelineStatus);
  console.log('📈 Test Success Rate:', successRate + '%');
  console.log('🚨 Critical Issues:', criticalCount);
  console.log('⚠️ High Priority Issues:', highCount);
  console.log('🔧 Medium Priority Issues:', mediumCount);
}

// Main execution
generatePipelineStatus();