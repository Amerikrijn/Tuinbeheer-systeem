#!/usr/bin/env node

/**
 * Development Server Script
 * Starts the Next.js development server with improved stability
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
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

// Check environment setup
function checkEnvironment() {
  logInfo('Checking environment setup...')
  
  const envFile = '.env.local'
  const envExample = '.env.local.example'
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExample)) {
      logWarning('No .env.local file found. Please copy .env.local.example to .env.local and configure your environment variables.')
      logInfo('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
    } else {
      logError('No environment configuration found. Please create a .env.local file with your Supabase credentials.')
    }
    return false
  }
  
  logSuccess('Environment file found')
  return true
}

// Clean development artifacts
function cleanDevelopmentArtifacts() {
  logInfo('Cleaning development artifacts...')
  
  const dirsToClean = ['.next', 'node_modules/.cache']
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true })
        logSuccess(`Cleaned ${dir}`)
      } catch (error) {
        logWarning(`Could not clean ${dir}: ${error.message}`)
      }
    }
  })
}

// Start development server
function startDevServer() {
  logInfo('Starting development server...')
  
  // Set development environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    NEXT_TELEMETRY_DISABLED: '1',
    // Add any additional development variables here
  }
  
  // Start the server with improved options
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env,
    shell: true
  })
  
  // Handle server events
  server.on('error', (error) => {
    logError(`Failed to start server: ${error.message}`)
    process.exit(1)
  })
  
  server.on('exit', (code) => {
    if (code !== 0) {
      logError(`Server exited with code ${code}`)
      process.exit(code)
    }
  })
  
  // Handle process signals
  process.on('SIGINT', () => {
    logInfo('Shutting down development server...')
    server.kill('SIGINT')
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    logInfo('Shutting down development server...')
    server.kill('SIGTERM')
    process.exit(0)
  })
  
  return server
}

// Main execution
async function main() {
  try {
    log(`${colors.bright}${colors.cyan}🚀 Tuinbeheer Development Server${colors.reset}`, 'cyan')
    log('Starting development server with improved stability...', 'blue')
    
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      logError('Please run this script from the project root directory')
      process.exit(1)
    }
    
    // Check environment setup
    if (!checkEnvironment()) {
      logWarning('Continuing without environment validation...')
    }
    
    // Clean development artifacts
    cleanDevelopmentArtifacts()
    
    // Start the server
    const server = startDevServer()
    
    // Wait for server to be ready
    logInfo('Development server is starting...')
    logInfo('Press Ctrl+C to stop the server')
    
  } catch (error) {
    logError(`Failed to start development server: ${error.message}`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  checkEnvironment,
  cleanDevelopmentArtifacts,
  startDevServer
}