#!/usr/bin/env ts-node

import { AutoFixAgent } from './AutoFixAgent'
import { AutoFixOptions } from './types'
import * as path from 'path'

/**
 * Parse command line arguments
 */
function parseArguments(): AutoFixOptions {
  const args = process.argv.slice(2)
  const options: Partial<AutoFixOptions> = {
    maxFixes: 50,
    includeSecurityFixes: true,
    includePerformanceFixes: true,
    includeQualityFixes: true,
    autoApply: false,
    requireValidation: true
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--help':
      case '-h':
        showHelp()
        process.exit(0)
        break

      case '--file':
      case '-f':
        if (nextArg) {
          options.filePath = nextArg
          i++
        } else {
          console.error('❌ Error: --file requires a file path')
          process.exit(1)
        }
        break

      case '--output':
      case '-o':
        if (nextArg) {
          options.outputPath = nextArg
          i++
        } else {
          console.error('❌ Error: --output requires an output path')
          process.exit(1)
        }
        break

      case '--max-fixes':
        if (nextArg) {
          const maxFixes = parseInt(nextArg)
          if (isNaN(maxFixes) || maxFixes < 1) {
            console.error('❌ Error: --max-fixes must be a positive number')
            process.exit(1)
          }
          options.maxFixes = maxFixes
          i++
        } else {
          console.error('❌ Error: --max-fixes requires a number')
          process.exit(1)
        }
        break

      case '--auto-apply':
        options.autoApply = true
        break

      case '--no-auto-apply':
        options.autoApply = false
        break

      case '--require-validation':
        options.requireValidation = true
        break

      case '--no-validation':
        options.requireValidation = false
        break

      case '--include-security':
        options.includeSecurityFixes = true
        break

      case '--no-security':
        options.includeSecurityFixes = false
        break

      case '--include-performance':
        options.includePerformanceFixes = true
        break

      case '--no-performance':
        options.includePerformanceFixes = false
        break

      case '--include-quality':
        options.includeQualityFixes = true
        break

      case '--no-quality':
        options.includeQualityFixes = false
        break

      case '--version':
      case '-v':
        showVersion()
        process.exit(0)
        break

      default:
        if (!options.filePath) {
          options.filePath = arg
        } else {
          console.error(`❌ Error: Unknown option: ${arg}`)
          showHelp()
          process.exit(1)
        }
        break
    }
  }

  // Validate required options
  if (!options.filePath) {
    console.error('❌ Error: File path is required')
    showHelp()
    process.exit(1)
  }

  if (!options.outputPath) {
    options.outputPath = './auto-fix-results'
  }

  return options as AutoFixOptions
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🚀 AI-Powered Auto-Fix Agent CLI

USAGE:
  npx ts-node cli.ts [OPTIONS] <file-path>

OPTIONS:
  -f, --file <path>           Target file to analyze and fix
  -o, --output <path>         Output directory for reports (default: ./auto-fix-results)
  --max-fixes <number>        Maximum number of fixes to apply (default: 50)
  --auto-apply                Automatically apply fixes to files
  --no-auto-apply            Don't apply fixes automatically (default)
  --require-validation        Require validation of applied fixes (default)
  --no-validation            Skip validation of applied fixes
  --include-security          Include security-related fixes (default)
  --no-security              Exclude security-related fixes
  --include-performance       Include performance-related fixes (default)
  --no-performance           Exclude performance-related fixes
  --include-quality           Include quality-related fixes (default)
  --no-quality               Exclude quality-related fixes
  -h, --help                 Show this help message
  -v, --version              Show version information

EXAMPLES:
  # Basic usage - analyze file without applying fixes
  npx ts-node cli.ts ./src/components/Button.tsx

  # Auto-apply fixes with custom output directory
  npx ts-node cli.ts --auto-apply --output ./fixes ./src/utils/helpers.ts

  # Limit fixes and exclude security fixes
  npx ts-node cli.ts --max-fixes 10 --no-security ./src/auth/login.ts

  # Full auto-fix with validation
  npx ts-node cli.ts --auto-apply --require-validation ./src/index.ts

FEATURES:
  🔍 Automatic code issue detection
  🔧 Intelligent fix generation
  ⚡ Optional automatic fix application
  🔍 Comprehensive validation
  📊 Detailed reporting (JSON, Markdown, Metrics)
  🎯 Risk-based prioritization
  🛡️ Safety controls and rollback options

For more information, visit: https://github.com/your-repo/ai-testing-system
`)
}

/**
 * Show version information
 */
function showVersion() {
  console.log('AI-Powered Auto-Fix Agent v1.0.0')
  console.log('Part of the AI Testing & Quality Analysis System')
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 AI-Powered Auto-Fix Agent')
    console.log('================================')
    console.log('')

    // Parse command line arguments
    const options = parseArguments()

    // Display configuration
    console.log('📋 Configuration:')
    console.log(`  Target File: ${options.filePath}`)
    console.log(`  Output Directory: ${options.outputPath}`)
    console.log(`  Max Fixes: ${options.maxFixes}`)
    console.log(`  Auto-Apply: ${options.autoApply ? 'Yes' : 'No'}`)
    console.log(`  Require Validation: ${options.requireValidation ? 'Yes' : 'No'}`)
    console.log(`  Include Security: ${options.includeSecurityFixes ? 'Yes' : 'No'}`)
    console.log(`  Include Performance: ${options.includePerformanceFixes ? 'Yes' : 'No'}`)
    console.log(`  Include Quality: ${options.includeQualityFixes ? 'Yes' : 'No'}`)
    console.log('')

    // Validate file exists
    const fs = require('fs')
    if (!fs.existsSync(options.filePath)) {
      console.error(`❌ Error: File not found: ${options.filePath}`)
      process.exit(1)
    }

    // Create and run the agent
    const agent = new AutoFixAgent(options)
    const result = await agent.run()

    console.log('🎉 Auto-Fix Agent completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })
}