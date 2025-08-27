#!/usr/bin/env node

/**
 * Local Test Report Generator
 * 
 * This script generates a test report similar to what the CI/CD pipeline produces.
 * Run it after running tests to see the results locally.
 * 
 * Usage: node scripts/test-report.js
 */

const fs = require('fs');
const path = require('path');

function generateTestReport() {
  console.log('🧪 Generating Local Test Report...\n');
  
  // Check if coverage directory exists
  const coverageDir = path.join(process.cwd(), 'coverage');
  if (!fs.existsSync(coverageDir)) {
    console.log('❌ No coverage directory found. Please run tests first with:');
    console.log('   npm run test:coverage\n');
    return;
  }
  
  // Try to read coverage data
  let coverageData = {};
  let totalLines = 0;
  let coveredLines = 0;
  let coveragePercent = 0;
  
  // Try to read LCOV file
  const lcovFile = path.join(coverageDir, 'lcov.info');
  if (fs.existsSync(lcovFile)) {
    const lcovContent = fs.readFileSync(lcovFile, 'utf8');
    
    // Extract total lines and covered lines
    const totalMatch = lcovContent.match(/LF:(\d+)/);
    const coveredMatch = lcovContent.match(/LH:(\d+)/);
    
    if (totalMatch && coveredMatch) {
      totalLines = parseInt(totalMatch[1]);
      coveredLines = parseInt(coveredMatch[1]);
      coveragePercent = totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(1) : 0;
    }
  }
  
  // Try to read JSON coverage file
  const jsonFile = path.join(coverageDir, 'coverage-final.json');
  if (fs.existsSync(jsonFile)) {
    try {
      const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      coverageData = jsonContent;
    } catch (error) {
      console.log('⚠️ Could not parse JSON coverage file');
    }
  }
  
  // Generate report
  console.log('📊 TEST REPORT');
  console.log('==============\n');
  
  // Coverage summary
  if (totalLines > 0) {
    console.log('📈 COVERAGE SUMMARY');
    console.log('-------------------');
    console.log(`Lines Covered: ${coveredLines}/${totalLines} (${coveragePercent}%)`);
    
    if (coveragePercent >= 90) {
      console.log('Status: 🟢 EXCELLENT');
    } else if (coveragePercent >= 80) {
      console.log('Status: 🟡 GOOD');
    } else if (coveragePercent >= 70) {
      console.log('Status: 🟠 MODERATE');
    } else {
      console.log('Status: 🔴 NEEDS IMPROVEMENT');
    }
    console.log('');
  }
  
  // File coverage details
  if (Object.keys(coverageData).length > 0) {
    console.log('📁 FILE COVERAGE DETAILS');
    console.log('------------------------');
    
    const files = Object.keys(coverageData).filter(file => 
      file.includes('app/') || file.includes('components/') || file.includes('lib/')
    );
    
    if (files.length > 0) {
      files.slice(0, 10).forEach(file => {
        const fileData = coverageData[file];
        const lines = fileData.s || {};
        const totalFileLines = Object.keys(lines).length;
        const coveredFileLines = Object.values(lines).filter(hit => hit > 0).length;
        const fileCoverage = totalFileLines > 0 ? ((coveredFileLines / totalFileLines) * 100).toFixed(1) : 0;
        
        const status = fileCoverage >= 90 ? '🟢' : fileCoverage >= 80 ? '🟡' : fileCoverage >= 70 ? '🟠' : '🔴';
        console.log(`${status} ${file}: ${fileCoverage}% (${coveredFileLines}/${totalFileLines} lines)`);
      });
      
      if (files.length > 10) {
        console.log(`... and ${files.length - 10} more files`);
      }
    }
    console.log('');
  }
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS');
  console.log('------------------');
  
  if (coveragePercent >= 90) {
    console.log('✅ Maintain current high coverage level');
    console.log('✅ Focus on adding tests for new features');
    console.log('✅ Consider performance optimization');
  } else if (coveragePercent >= 80) {
    console.log('⚠️ Good coverage, but room for improvement');
    console.log('⚠️ Add tests for uncovered code paths');
    console.log('⚠️ Focus on critical business logic');
  } else if (coveragePercent >= 70) {
    console.log('🔴 Coverage needs improvement');
    console.log('🔴 Prioritize high-impact areas');
    console.log('🔴 Consider test-driven development');
  } else {
    console.log('🚨 Critical coverage issues');
    console.log('🚨 Immediate action required');
    console.log('🚨 Review testing strategy');
  }
  
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Review failing tests (if any)');
  console.log('2. Add tests for uncovered code');
  console.log('3. Improve test quality and coverage');
  console.log('4. Run tests regularly during development');
  
  console.log('\n🏁 Report generation complete!');
}

// Run the report generator
if (require.main === module) {
  generateTestReport();
}

module.exports = { generateTestReport };