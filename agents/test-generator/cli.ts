#!/usr/bin/env ts-node

import { TestGeneratorAgent } from './TestGeneratorAgent'
import { TestGenerationOptions } from './types'

interface CLIArgs {
  path?: string
  strategy?: 'risk-based' | 'coverage-based' | 'random'
  maxInteractions?: number
  output?: string
  security?: boolean
  performance?: boolean
  edgeCases?: boolean
  help?: boolean
  version?: boolean
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {}
  
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]
    
    switch (arg) {
      case '--path':
      case '-p':
        args.path = process.argv[++i]
        break
      case '--strategy':
      case '-s':
        args.strategy = process.argv[++i] as any
        break
      case '--max-interactions':
      case '-m':
        args.maxInteractions = parseInt(process.argv[++i])
        break
      case '--output':
      case '-o':
        args.output = process.argv[++i]
        break
      case '--security':
        args.security = true
        break
      case '--performance':
        args.performance = true
        break
      case '--edge-cases':
        args.edgeCases = true
        break
      case '--help':
      case '-h':
        args.help = true
        break
      case '--version':
      case '-v':
        args.version = true
        break
    }
  }
  
  return args
}

function showHelp(): void {
  console.log(`
🚀 AI-Powered Test Generator Agent

Usage: npx ts-node cli.ts [options]

Options:
  -p, --path <path>              Path to the feature to test (default: ./app/auth/login)
  -s, --strategy <strategy>       Test generation strategy (default: risk-based)
                                  Options: risk-based, coverage-based, random
  -m, --max-interactions <num>   Maximum interactions per iteration (default: 100)
  -o, --output <path>            Output directory for reports (default: ./test-results)
  --security                     Include security test scenarios
  --performance                  Include performance test scenarios
  --edge-cases                   Include edge case test scenarios
  -h, --help                     Show this help message
  -v, --version                  Show version information

Examples:
  # Basic usage with default settings
  npx ts-node cli.ts

  # Custom path and strategy
  npx ts-node cli.ts --path ./app/dashboard --strategy coverage-based

  # Include all test types
  npx ts-node cli.ts --security --performance --edge-cases

  # Custom output directory
  npx ts-node cli.ts --output ./custom-test-results

Features:
  🔄 2 Iterations with improvement tracking
  📊 Quality scoring per iteration
  🎯 Multiple test categories
  📈 Performance metrics
  🔍 Detailed reporting
  🚀 CI/CD ready

The agent will:
  1. Run iteration 1: Generate basic test scenarios
  2. Run iteration 2: Improve scenarios with edge cases, security, and performance tests
  3. Compare results and show improvements
  4. Generate comprehensive reports
`)
}

function showVersion(): void {
  console.log('AI-Powered Test Generator Agent v1.0.0')
}

async function main(): Promise<void> {
  const args = parseArgs()
  
  if (args.help) {
    showHelp()
    return
  }
  
  if (args.version) {
    showVersion()
    return
  }
  
  try {
    // Set default options
    const options: TestGenerationOptions = {
      featurePath: args.path || './app/auth/login',
      strategy: args.strategy || 'risk-based',
      maxInteractions: args.maxInteractions || 100,
      outputPath: args.output || './test-results',
      includeSecurityTests: args.security || false,
      includePerformanceTests: args.performance || false,
      includeEdgeCases: args.edgeCases || false
    }
    
    console.log('🚀 Starting AI-Powered Test Generator Agent...')
    console.log('')
    console.log('📋 Configuration:')
    console.log(`   Feature Path: ${options.featurePath}`)
    console.log(`   Strategy: ${options.strategy}`)
    console.log(`   Max Interactions: ${options.maxInteractions}`)
    console.log(`   Output Path: ${options.outputPath}`)
    console.log(`   Security Tests: ${options.includeSecurityTests ? '✅' : '❌'}`)
    console.log(`   Performance Tests: ${options.includePerformanceTests ? '✅' : '❌'}`)
    console.log(`   Edge Cases: ${options.includeEdgeCases ? '✅' : '❌'}`)
    console.log('')
    
    // Create and run the agent
    const agent = new TestGeneratorAgent(options)
    const result = await agent.run()
    
    console.log('')
    console.log('🎉 Test generation completed successfully!')
    console.log('')
    console.log('📊 Final Results:')
    console.log(`   Total Scenarios: ${result.scenarios.length}`)
    console.log(`   Final Quality Score: ${result.qualityScore}/100`)
    console.log(`   Total Execution Time: ${result.executionTime}ms`)
    console.log(`   Iterations Completed: ${result.iterationHistory?.length || 1}`)
    
    if (result.improvementSummary) {
      console.log('')
      console.log('📈 Improvement Summary:')
      console.log(`   Quality Increase: +${result.improvementSummary.qualityIncrease} points`)
      console.log(`   Scenario Increase: +${result.improvementSummary.scenarioIncrease}`)
      console.log(`   Total Iterations: ${result.improvementSummary.totalIterations}`)
    }
    
    console.log('')
    console.log('📁 Reports generated:')
    console.log(`   JSON Report: ${options.outputPath}/test-execution-report.json`)
    console.log(`   Markdown Summary: ${options.outputPath}/test-execution-summary.md`)
    console.log(`   Coverage Report: ${options.outputPath}/test-coverage-report.json`)
    
  } catch (error) {
    console.error('❌ Error during test generation:', error)
    process.exit(1)
  }
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
}