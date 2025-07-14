#!/usr/bin/env node

/**
 * STAP 7: Start test development server
 */

const { spawn } = require('child_process')

console.log('🚀 STAP 7: Starting Test Development Server')
console.log('=' .repeat(40))

console.log('Setting environment variables...')
console.log('APP_ENV=test')
console.log('Using .env.test configuration')
console.log('')

console.log('Starting Next.js development server...')
console.log('URL: http://localhost:3000')
console.log('')
console.log('⚠️  Press Ctrl+C to stop the server')
console.log('=' .repeat(40))

// Set environment variable and start the dev server
const env = { ...process.env, APP_ENV: 'test' }

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: env
})

server.on('close', (code) => {
  console.log(`\n📱 Server stopped with code ${code}`)
})

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...')
  server.kill('SIGINT')
})