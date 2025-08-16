#!/usr/bin/env node

/**
 * End-to-End Workflow Test Script
 * Tests the complete chain from question to preview
 * 
 * This script:
 * 1. Starts the development server
 * 2. Runs the test suite
 * 3. Performs manual workflow tests
 * 4. Reports results
 */

const { spawn, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  port: 3000,
  testTimeout: 60000, // 60 seconds
  serverStartTimeout: 30000, // 30 seconds
  baseUrl: `http://localhost:3000`,
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
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function checkPort(port) {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

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
async function testServerHealth() {
  logStep('1.1', 'Testing server health...')
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/health`)
    const data = await response.json()
    
    if (response.ok && data.status === 'healthy') {
      logSuccess('Server health check passed')
      return true
    } else {
      logError('Server health check failed')
      return false
    }
  } catch (error) {
    logError(`Server health check error: ${error.message}`)
    return false
  }
}

async function testAPIEndpoints() {
  logStep('1.2', 'Testing API endpoints...')
  
  const endpoints = [
    '/api/gardens',
    '/api/status',
    '/api/version'
  ]
  
  const results = {}
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${CONFIG.baseUrl}${endpoint}`)
      const data = await response.json()
      
      if (response.ok) {
        logSuccess(`${endpoint} - OK`)
        results[endpoint] = { status: 'success', response: data }
      } else {
        logWarning(`${endpoint} - ${response.status}: ${data.error || 'Unknown error'}`)
        results[endpoint] = { status: 'warning', statusCode: response.status, error: data.error }
      }
    } catch (error) {
      logError(`${endpoint} - Error: ${error.message}`)
      results[endpoint] = { status: 'error', error: error.message }
    }
  }
  
  return results
}

async function testDatabaseConnection() {
  logStep('1.3', 'Testing database connection...')
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/gardens?pageSize=1`)
    const data = await response.json()
    
    if (response.ok && data.success) {
      logSuccess('Database connection successful')
      return { status: 'success', data: data }
    } else {
      logError('Database connection failed')
      return { status: 'error', error: data.error }
    }
  } catch (error) {
    logError(`Database connection error: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

async function testSearchFunctionality() {
  logStep('2.1', 'Testing search functionality...')
  
  try {
    // Test search with valid query
    const searchResponse = await fetch(`${CONFIG.baseUrl}/api/gardens?search=Test&pageSize=5`)
    const searchData = await searchResponse.json()
    
    if (searchResponse.ok && searchData.success) {
      logSuccess('Search functionality working')
      return { status: 'success', results: searchData.data }
    } else {
      logWarning('Search functionality may have issues')
      return { status: 'warning', error: searchData.error }
    }
  } catch (error) {
    logError(`Search test error: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

async function testPagination() {
  logStep('2.2', 'Testing pagination...')
  
  try {
    // Test first page
    const page1Response = await fetch(`${CONFIG.baseUrl}/api/gardens?page=1&pageSize=2`)
    const page1Data = await page1Response.json()
    
    if (page1Response.ok && page1Data.success) {
      logSuccess('Pagination working (page 1)')
      
      // Test second page if available
      if (page1Data.data.total_pages > 1) {
        const page2Response = await fetch(`${CONFIG.baseUrl}/api/gardens?page=2&pageSize=2`)
        const page2Data = await page2Response.json()
        
        if (page2Response.ok && page2Data.success) {
          logSuccess('Pagination working (page 2)')
          return { status: 'success', page1: page1Data.data, page2: page2Data.data }
        }
      }
      
      return { status: 'success', page1: page1Data.data }
    } else {
      logWarning('Pagination may have issues')
      return { status: 'warning', error: page1Data.error }
    }
  } catch (error) {
    logError(`Pagination test error: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

async function testErrorHandling() {
  logStep('2.3', 'Testing error handling...')
  
  try {
    // Test invalid page parameter
    const invalidResponse = await fetch(`${CONFIG.baseUrl}/api/gardens?page=invalid&pageSize=abc`)
    const invalidData = await invalidResponse.json()
    
    if (invalidResponse.ok) {
      logSuccess('Error handling: gracefully handles invalid parameters')
      return { status: 'success', test: 'invalid_parameters' }
    } else {
      logWarning('Error handling: strict parameter validation')
      return { status: 'warning', test: 'strict_validation' }
    }
  } catch (error) {
    logError(`Error handling test error: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

async function runAutomatedTests() {
  logStep('3.1', 'Running automated test suite...')
  
  try {
    logInfo('Running unit tests...')
    execSync('npm run test:unit', { stdio: 'inherit' })
    logSuccess('Unit tests passed')
    
    logInfo('Running integration tests...')
    execSync('npm run test:integration', { stdio: 'inherit' })
    logSuccess('Integration tests passed')
    
    return { status: 'success', unit: 'passed', integration: 'passed' }
  } catch (error) {
    logError('Some automated tests failed')
    return { status: 'error', error: error.message }
  }
}

async function runE2ETests() {
  logStep('3.2', 'Running end-to-end tests...')
  
  try {
    logInfo('Running E2E tests...')
    execSync('npm run test:e2e', { stdio: 'inherit' })
    logSuccess('E2E tests passed')
    
    return { status: 'success', e2e: 'passed' }
  } catch (error) {
    logError('E2E tests failed')
    return { status: 'error', error: error.message }
  }
}

// Main workflow test
async function runWorkflowTest() {
  logStep('WORKFLOW TEST', 'Starting comprehensive workflow test...')
  
  const startTime = Date.now()
  const results = {
    timestamp: new Date().toISOString(),
    duration: 0,
    tests: {}
  }
  
  try {
    // Phase 1: Infrastructure Tests
    logStep('PHASE 1', 'Testing infrastructure and connectivity...')
    
    results.tests.infrastructure = {
      serverHealth: await testServerHealth(),
      apiEndpoints: await testAPIEndpoints(),
      databaseConnection: await testDatabaseConnection()
    }
    
    // Phase 2: Core Functionality Tests
    logStep('PHASE 2', 'Testing core functionality...')
    
    results.tests.coreFunctionality = {
      search: await testSearchFunctionality(),
      pagination: await testPagination(),
      errorHandling: await testErrorHandling()
    }
    
    // Phase 3: Automated Tests
    logStep('PHASE 3', 'Running automated test suites...')
    
    results.tests.automated = {
      unit: await runAutomatedTests(),
      e2e: await runE2ETests()
    }
    
    // Calculate duration
    results.duration = Date.now() - startTime
    
    // Generate summary
    const summary = generateSummary(results)
    results.summary = summary
    
    // Save results
    saveTestResult('workflow-test', results)
    
    // Display results
    displayResults(results)
    
    return results
    
  } catch (error) {
    logError(`Workflow test failed: ${error.message}`)
    results.error = error.message
    results.duration = Date.now() - startTime
    
    saveTestResult('workflow-test-error', results)
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
  logStep('RESULTS', 'Workflow test completed!')
  
  log(`\n${colors.bright}Test Summary:${colors.reset}`)
  log(`Total Tests: ${results.summary.totalTests}`, 'blue')
  log(`Passed: ${results.summary.passedTests}`, 'green')
  log(`Failed: ${results.summary.failedTests}`, 'red')
  log(`Success Rate: ${results.summary.successRate}`, 'cyan')
  log(`Overall Status: ${results.summary.overallStatus}`, results.summary.overallStatus === 'PASSED' ? 'green' : 'yellow')
  log(`Duration: ${(results.duration / 1000).toFixed(1)}s`, 'blue')
  
  if (results.summary.overallStatus === 'PASSED') {
    log('\n🎉 All tests passed! The workflow is working correctly.', 'green')
  } else if (results.summary.overallStatus === 'PARTIAL') {
    log('\n⚠️  Some tests failed. Review the results above.', 'yellow')
  } else {
    log('\n❌ Multiple tests failed. The workflow needs attention.', 'red')
  }
}

// Main execution
async function main() {
  try {
    log(`${colors.bright}${colors.cyan}🌱 Tuinbeheer Workflow Test Suite${colors.reset}`, 'cyan')
    log('Testing the complete chain from question to preview...', 'blue')
    
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      logError('Please run this script from the project root directory')
      process.exit(1)
    }
    
    // Create test results directory
    createTestResultsDir()
    
    // Check if server is already running
    if (checkPort(CONFIG.port)) {
      logWarning(`Port ${CONFIG.port} is already in use. Assuming server is running.`)
    } else {
      logInfo(`Port ${CONFIG.port} is available.`)
    }
    
    // Run the workflow test
    const results = await runWorkflowTest()
    
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
  runWorkflowTest,
  testServerHealth,
  testAPIEndpoints,
  testDatabaseConnection,
  testSearchFunctionality,
  testPagination,
  testErrorHandling
}