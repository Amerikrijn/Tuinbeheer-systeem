#!/usr/bin/env node

import { runQualityAnalysis } from './index'
import * as fs from 'fs'
import * as path from 'path'

// Parse command line arguments
function parseArguments(): {
  testResultsPath: string
  testScenariosPath: string
  outputPath: string
} {
  const args = process.argv.slice(2)
  
  let testResultsPath = '../../test-generator/test-results/login-exploration.json'
  let testScenariosPath = '../../test-generator/test-results/login-exploration.json'
  let outputPath = './quality-results'
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--test-results':
        testResultsPath = args[++i] || testResultsPath
        break
      case '--test-scenarios':
        testScenariosPath = args[++i] || testScenariosPath
        break
      case '--output':
        outputPath = args[++i] || outputPath
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
    testResultsPath,
    testScenariosPath,
    outputPath
  }
}

function showHelp(): void {
  console.log(`
🔍 AI-Powered Quality Analyzer Agent

Usage: node cli.ts [options]

Options:
  --test-results <path>    Path to test results JSON file (default: "../../test-generator/test-results/login-exploration.json")
  --test-scenarios <path>  Path to test scenarios JSON file (default: "../../test-generator/test-results/login-exploration.json")
  --output <path>          Output directory for quality reports (default: "./quality-results")
  --help, -h               Show this help message

Examples:
  # Basic usage with defaults
  node cli.ts
  
  # Custom test results path
  node cli.ts --test-results "./my-test-results.json"
  
  # Custom output directory
  node cli.ts --output "./reports/quality"

Output:
  The agent will generate:
  - quality-analysis.json: Detailed quality analysis in JSON format
  - quality-analysis-summary.md: Human-readable quality summary report
  - quality-metrics.json: Quality metrics and breakdowns
`)
}

async function main(): Promise<void> {
  try {
    console.log('🔍 Starting AI-Powered Quality Analyzer Agent...\n')
    
    const options = parseArguments()
    
    console.log('Configuration:')
    console.log(`  Test Results: ${options.testResultsPath}`)
    console.log(`  Test Scenarios: ${options.testScenariosPath}`)
    console.log(`  Output: ${options.outputPath}\n`)
    
    // Validate input files
    if (!fs.existsSync(options.testResultsPath)) {
      console.error(`❌ Error: Test results file "${options.testResultsPath}" does not exist`)
      process.exit(1)
    }
    
    if (!fs.existsSync(options.testScenariosPath)) {
      console.error(`❌ Error: Test scenarios file "${options.testScenariosPath}" does not exist`)
      process.exit(1)
    }
    
    // Ensure output directory exists
    if (!fs.existsSync(options.outputPath)) {
      fs.mkdirSync(options.outputPath, { recursive: true })
      console.log(`📁 Created output directory: ${options.outputPath}`)
    }
    
    // Load test data
    console.log('📂 Loading test data...')
    const testResultsData = JSON.parse(fs.readFileSync(options.testResultsPath, 'utf-8'))
    const testScenariosData = JSON.parse(fs.readFileSync(options.testScenariosPath, 'utf-8'))
    
    // Extract test results and scenarios
    const testResults = testResultsData.test_results || []
    const testScenarios = testScenariosData.test_results?.map((r: any) => r.scenario).filter(Boolean) || []
    
    console.log(`✅ Loaded ${testResults.length} test results`)
    console.log(`✅ Loaded ${testScenarios.length} test scenarios`)
    
    if (testResults.length === 0) {
      console.error('❌ Error: No test results found in the input file')
      process.exit(1)
    }
    
    // Run quality analysis
    const qualityReport = await runQualityAnalysis({
      testResults,
      testScenarios,
      outputPath: options.outputPath
    })
    
    console.log('\n🎯 Quality Analysis Completed Successfully!')
    console.log(`📊 Overall Grade: ${qualityReport.summary.overallGrade}`)
    console.log(`🎯 Quality Score: ${qualityReport.summary.qualityScore}/100`)
    console.log(`⚠️  Risk Level: ${qualityReport.riskAssessment.overallRisk.toUpperCase()}`)
    console.log(`💡 Recommendations: ${qualityReport.recommendations.length}`)
    
    console.log(`\n📁 Quality reports saved to: ${path.resolve(options.outputPath)}`)
    console.log('  - quality-analysis.json (Detailed analysis)')
    console.log('  - quality-analysis-summary.md (Human-readable)')
    console.log('  - quality-metrics.json (Quality metrics)')
    
  } catch (error) {
    console.error('\n❌ Quality Analysis Failed:')
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