#!/usr/bin/env node

import { AutoFixAgent } from './AutoFixAgent'
import { AutoFixOptions } from './types'
import * as path from 'path'

console.log('🔧 Starting AI-Powered Auto-Fix Agent...\n')

// Parse command line arguments
const args = process.argv.slice(2)
const options: Partial<AutoFixOptions> = {}

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  
  switch (arg) {
    case '--help':
    case '-h':
      showHelp()
      process.exit(0)
      break
      
    case '--file':
    case '-f':
      options.filePath = args[++i]
      break
      
    case '--max-fixes':
    case '-m':
      options.maxFixes = parseInt(args[++i]) || 10
      break
      
    case '--auto-apply':
    case '-a':
      options.autoApply = true
      break
      
    case '--require-validation':
    case '-v':
      options.requireValidation = true
      break
      
    case '--include-security':
    case '-s':
      options.includeSecurityFixes = true
      break
      
    case '--include-performance':
    case '-p':
      options.includePerformanceFixes = true
      break
      
    case '--include-quality':
    case '-q':
      options.includeQualityFixes = true
      break
      
    case '--output':
    case '-o':
      options.outputPath = args[++i]
      break
      
    default:
      if (!options.filePath) {
        options.filePath = arg
      }
      break
  }
}

// Set default options
const defaultOptions: AutoFixOptions = {
  filePath: options.filePath || './test-file.js',
  maxFixes: options.maxFixes || 10,
  autoApply: options.autoApply || false,
  requireValidation: options.requireValidation || false,
  includeSecurityFixes: options.includeSecurityFixes !== false,
  includePerformanceFixes: options.includePerformanceFixes !== false,
  includeQualityFixes: options.includeQualityFixes !== false,
  outputPath: options.outputPath || './auto-fix-results'
}

// Validate required options
if (!defaultOptions.filePath) {
  console.error('❌ Error: File path is required')
  console.error('Usage: node cli.ts <file-path> [options]')
  process.exit(1)
}

// Run the agent
async function main() {
  try {
    console.log('🔧 AI-Powered Auto-Fix Agent')
    console.log('=============================')
    console.log(`Target File: ${defaultOptions.filePath}`)
    console.log(`Max Fixes: ${defaultOptions.maxFixes}`)
    console.log(`Auto Apply: ${defaultOptions.autoApply ? 'Yes' : 'No'}`)
    console.log(`Require Validation: ${defaultOptions.requireValidation ? 'Yes' : 'No'}`)
    console.log(`Security Fixes: ${defaultOptions.includeSecurityFixes ? 'Yes' : 'No'}`)
    console.log(`Performance Fixes: ${defaultOptions.includePerformanceFixes ? 'Yes' : 'No'}`)
    console.log(`Quality Fixes: ${defaultOptions.includeQualityFixes ? 'Yes' : 'No'}`)
    console.log(`Output Path: ${defaultOptions.outputPath}`)
    console.log('')

    const agent = new AutoFixAgent(defaultOptions)
    const report = await agent.run()
    
    console.log('🎉 Auto-fix execution completed successfully!')
    console.log(`📊 Report saved to: ${defaultOptions.outputPath}`)
    
  } catch (error) {
    console.error('❌ Error during auto-fix execution:', error)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
🔧 AI-Powered Auto-Fix Agent

Usage: node cli.ts [options] <file-path>

Options:
  --file, -f <path>           Path to file to analyze and fix (default: "./test-file.js")
  --max-fixes, -m <number>    Maximum number of fixes to apply (default: 10)
  --auto-apply, -a            Automatically apply fixes (default: false)
  --require-validation, -v    Require validation before applying fixes (default: false)
  --include-security, -s      Include security fixes (default: true)
  --include-performance, -p   Include performance fixes (default: true)
  --include-quality, -q       Include quality fixes (default: true)
  --output, -o <path>         Output directory for reports (default: "./auto-fix-results")
  --help, -h                  Show this help message

Examples:
  # Basic usage with defaults
  node cli.ts ./my-file.js
  
  # Custom options
  node cli.ts --file ./app.js --max-fixes 20 --auto-apply --output ./fixes
  
  # Security only
  node cli.ts --file ./app.js --include-security --include-performance false --include-quality false

Output:
  The agent will generate:
  - auto-fix-report.json: Detailed auto-fix report in JSON format
  - auto-fix-summary.md: Human-readable summary report
  - auto-fix-metrics.json: Fix metrics and breakdowns
`)
}

// Start execution
main()