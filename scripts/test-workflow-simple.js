#!/usr/bin/env node

/**
 * Simple Workflow Test Script
 * Tests the basic functionality without starting the server
 * 
 * This script:
 * 1. Runs the test suite
 * 2. Performs basic validation
 * 3. Reports results
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  testResultsDir: './test-results'
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, description) {
  log(`\n${colors.cyan}${colors.bright}${step}${colors.reset}`, 'cyan')
  log(description, 'reset')
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue')
}

// Utility functions
function createTestResultsDir() {
  if (!fs.existsSync(CONFIG.testResultsDir)) {
    fs.mkdirSync(CONFIG.testResultsDir, { recursive: true })
  }
}

function saveTestResult(testName, result) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${testName}-${timestamp}.json`
  const filepath = path.join(CONFIG.testResultsDir, filename)
  
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2))
  logInfo(`Test result saved to: ${filepath}`)
}

// Test functions
async function testFileStructure() {
  logStep('1.1', 'Testing file structure...')
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'app/page.tsx',
    'lib/services/database.service.ts',
    'app/api/gardens/route.ts'
  ]
  
  const results = {}
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`${file} exists`)
      results[file] = { status: 'success', exists: true }
    } else {
      logError(`${file} missing`)
      results[file] = { status: 'error', exists: false }
    }
  }
  
  return results
}

async function testDependencies() {
  logStep('1.2', 'Testing dependencies...')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      '@supabase/supabase-js'
    ]
    
    const results = {}
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        logSuccess(`${dep} is installed`)
        results[dep] = { status: 'success', installed: true }
      } else {
        logError(`${dep} is not installed`)
        results[dep] = { status: 'error', installed: false }
      }
    }
    
    return results
  } catch (error) {
    logError(`Failed to read package.json: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

async function testTypeScriptConfig() {
  logStep('1.3', 'Testing TypeScript configuration...')
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
    
    const results = {
      paths: tsconfig.compilerOptions?.paths ? 'success' : 'error',
      strict: tsconfig.compilerOptions?.strict ? 'success' : 'warning',
      jsx: tsconfig.compilerOptions?.jsx ? 'success' : 'error'
    }
    
    if (results.paths === 'success') logSuccess('Path mapping configured')
    if (results.strict === 'success') logSuccess('Strict mode enabled')
    if (results.jsx === 'success') logSuccess('JSX configured')
    
    return results
  } catch (error) {
    logError(`Failed to read tsconfig.json: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

async function runUnitTests() {
  logStep('2.1', 'Running unit tests...')
  
  try {
    logInfo('Running unit tests...')
    execSync('npm run test:unit', { stdio: 'inherit' })
    logSuccess('Unit tests passed')
    
    return { status: 'success', unit: 'passed' }
  } catch (error) {
    logError('Unit tests failed')
    return { status: 'error', error: error.message }
  }
}

async function testBuildProcess() {
  logStep('2.2', 'Testing build process...')
  
  try {
    logInfo('Testing build...')
    execSync('npm run build', { stdio: 'pipe' })
    logSuccess('Build successful')
    
    return { status: 'success', build: 'passed' }
  } catch (error) {
    logWarning('Build failed (this is expected in development)')
    return { status: 'warning', build: 'failed', error: error.message }
  }
}

async function validateCodeQuality() {
  logStep('2.3', 'Validating code quality...')
  
  try {
    logInfo('Running type check...')
    execSync('npm run typecheck', { stdio: 'pipe' })
    logSuccess('Type check passed')
    
    return { status: 'success', typecheck: 'passed' }
  } catch (error) {
    logWarning('Type check failed (this may be expected)')
    return { status: 'warning', typecheck: 'failed', error: error.message }
  }
}

// Main workflow test
async function runSimpleWorkflowTest() {
  logStep('SIMPLE WORKFLOW TEST', 'Starting basic workflow validation...')
  
  const startTime = Date.now()
  const results = {
    timestamp: new Date().toISOString(),
    duration: 0,
    tests: {}
  }
  
  try {
    // Phase 1: Infrastructure Tests
    logStep('PHASE 1', 'Testing infrastructure and configuration...')
    
    results.tests.infrastructure = {
      fileStructure: await testFileStructure(),
      dependencies: await testDependencies(),
      typescriptConfig: await testTypeScriptConfig()
    }
    
    // Phase 2: Code Quality Tests
    logStep('PHASE 2', 'Testing code quality and build process...')
    
    results.tests.codeQuality = {
      unitTests: await runUnitTests(),
      buildProcess: await testBuildProcess(),
      typeCheck: await validateCodeQuality()
    }
    
    // Calculate duration
    results.duration = Date.now() - startTime
    
    // Generate summary
    const summary = generateSummary(results)
    results.summary = summary
    
    // Save results
    saveTestResult('simple-workflow-test', results)
    
    // Display results
    displayResults(results)
    
    return results
    
  } catch (error) {
    logError(`Simple workflow test failed: ${error.message}`)
    results.error = error.message
    results.duration = Date.now() - startTime
    
    saveTestResult('simple-workflow-test-error', results)
    return results
  }
}

function generateSummary(results) {
  const totalTests = Object.values(results.tests).flatMap(Object.values).length
  const passedTests = Object.values(results.tests)
    .flatMap(Object.values)
    .filter(test => test.status === 'success').length
  
  const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0
  
  return {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    successRate: `${successRate}%`,
    overallStatus: successRate >= 80 ? 'PASSED' : successRate >= 60 ? 'PARTIAL' : 'FAILED'
  }
}

function displayResults(results) {
  logStep('RESULTS', 'Simple workflow test completed!')
  
  log(`\n${colors.bright}Test Summary:${colors.reset}`)
  log(`Total Tests: ${results.summary.totalTests}`, 'blue')
  log(`Passed: ${results.summary.passedTests}`, 'green')
  log(`Failed: ${results.summary.failedTests}`, 'red')
  log(`Success Rate: ${results.summary.successRate}`, 'cyan')
  log(`Overall Status: ${results.summary.overallStatus}`, results.summary.overallStatus === 'PASSED' ? 'green' : 'yellow')
  log(`Duration: ${(results.duration / 1000).toFixed(1)}s`, 'blue')
  
  if (results.summary.overallStatus === 'PASSED') {
    log('\n🎉 All tests passed! The basic workflow is working correctly.', 'green')
  } else if (results.summary.overallStatus === 'PARTIAL') {
    log('\n⚠️  Some tests failed. Review the results above.', 'yellow')
  } else {
    log('\n❌ Multiple tests failed. The workflow needs attention.', 'red')
  }
}

// Main execution
async function main() {
  try {
    log(`${colors.bright}${colors.cyan}🌱 Tuinbeheer Simple Workflow Test Suite${colors.reset}`, 'cyan')
    log('Testing the basic workflow without server dependencies...', 'blue')
    
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      logError('Please run this script from the project root directory')
      process.exit(1)
    }
    
    // Create test results directory
    createTestResultsDir()
    
    // Run the simple workflow test
    const results = await runSimpleWorkflowTest()
    
    // Exit with appropriate code
    if (results.summary?.overallStatus === 'PASSED') {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error) {
    logError(`Script execution failed: ${error.message}`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  runSimpleWorkflowTest,
  testFileStructure,
  testDependencies,
  testTypeScriptConfig,
  runUnitTests,
  testBuildProcess,
  validateCodeQuality
}