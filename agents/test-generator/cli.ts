#!/usr/bin/env node

import { runTestGeneration } from './index'
import * as path from 'path'

// Parse command line arguments
function parseArguments(): {
  feature: string
  path: string
  strategy: 'full-path-coverage' | 'risk-based' | 'change-focused'
  maxInteractions: number
  output: string
} {
  const args = process.argv.slice(2)
  
  let feature = 'Login Flow'
  let featurePath = './app/auth/login'
  let strategy: 'full-path-coverage' | 'risk-based' | 'change-focused' = 'full-path-coverage'
  let maxInteractions = 500
  let output = './test-results'
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--feature':
        feature = args[++i] || feature
        break
      case '--path':
        featurePath = args[++i] || featurePath
        break
      case '--strategy':
        const strategyArg = args[++i]
        if (strategyArg && ['full-path-coverage', 'risk-based', 'change-focused'].includes(strategyArg)) {
          strategy = strategyArg as any
        }
        break
      case '--max-interactions':
        const maxArg = args[++i]
        if (maxArg) {
          const parsed = parseInt(maxArg)
          if (!isNaN(parsed) && parsed > 0) {
            maxInteractions = parsed
          }
        }
        break
      case '--output':
        output = args[++i] || output
        break
      case '--help':
      case '-h':
        showHelp()
        process.exit(0)
        break
      default:
        if (arg.startsWith('--')) {
          console.warn(`Warning: Unknown argument ${arg}`)
        }
    }
  }
  
  return {
    feature,
    path: featurePath,
    strategy,
    maxInteractions,
    output
  }
}

function showHelp(): void {
  console.log(`
🤖 AI-Powered Test Generator Agent

Usage: node cli.ts [options]

Options:
  --feature <name>           Feature name (default: "Login Flow")
  --path <path>             Path to feature directory (default: "./app/auth/login")
  --strategy <strategy>     Testing strategy (default: "full-path-coverage")
                           Options: full-path-coverage, risk-based, change-focused
  --max-interactions <num>  Maximum test interactions (default: 500)
  --output <path>           Output directory for reports (default: "./test-results")
  --help, -h                Show this help message

Examples:
  # Basic usage with defaults
  node cli.ts
  
  # Custom feature path
  node cli.ts --path "./features/user-management"
  
  # Risk-based strategy with custom limits
  node cli.ts --strategy risk-based --max-interactions 300
  
  # Custom output directory
  node cli.ts --output "./reports/test-results"

Strategies:
  full-path-coverage: Comprehensive testing of all code paths
  risk-based: Focus on high-risk areas and security vulnerabilities
  change-focused: Target recently modified code and dependencies

Output:
  The agent will generate:
  - login-exploration.json: Detailed test results in JSON format
  - login-exploration-summary.md: Human-readable summary report
  - coverage-report.json: Test coverage metrics
`)
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting AI-Powered Test Generator Agent...\n')
    
    const options = parseArguments()
    
    console.log('Configuration:')
    console.log(`  Feature: ${options.feature}`)
    console.log(`  Path: ${options.path}`)
    console.log(`  Strategy: ${options.strategy}`)
    console.log(`  Max Interactions: ${options.maxInteractions}`)
    console.log(`  Output: ${options.output}\n`)
    
    // Validate feature path
    const fs = require('fs')
    if (!fs.existsSync(options.path)) {
      console.error(`❌ Error: Feature path "${options.path}" does not exist`)
      process.exit(1)
    }
    
    // Ensure output directory exists
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, { recursive: true })
      console.log(`📁 Created output directory: ${options.output}`)
    }
    
    // Run the test generation
    const result = await runTestGeneration({
      featurePath: options.path,
      strategy: options.strategy,
      maxInteractions: options.maxInteractions,
      outputPath: options.output
    })
    
    console.log('\n🎯 Test Generation Completed Successfully!')
    console.log(`📊 Generated ${result.scenarios.length} test scenarios`)
    console.log(`✅ Executed ${result.results.length} tests`)
    console.log(`📈 Success rate: ${result.summary.passed}/${result.summary.total} (${Math.round((result.summary.passed / result.summary.total) * 100)}%)`)
    
    console.log(`\n📁 Reports saved to: ${path.resolve(options.output)}`)
    console.log('  - login-exploration.json (Detailed results)')
    console.log('  - login-exploration-summary.md (Human-readable)')
    console.log('  - coverage-report.json (Coverage metrics)')
    
  } catch (error) {
    console.error('\n❌ Test Generation Failed:')
    console.error(error)
    process.exit(1)
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}