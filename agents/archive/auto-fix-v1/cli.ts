#!/usr/bin/env ts-node

import { AutoFixAgent } from './AutoFixAgent'
import { AutoFixOptions } from './types'

interface CLIArgs {
  path?: string
  autoApply?: boolean
  maxFixes?: number
  output?: string
  typescript?: boolean
  eslint?: boolean
  security?: boolean
  performance?: boolean
  quality?: boolean
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
      case '--auto-apply':
      case '-a':
        args.autoApply = true
        break
      case '--max-fixes':
      case '-m':
        args.maxFixes = parseInt(process.argv[++i])
        break
      case '--output':
      case '-o':
        args.output = process.argv[++i]
        break
      case '--typescript':
      case '-t':
        args.typescript = true
        break
      case '--eslint':
      case '-e':
        args.eslint = true
        break
      case '--security':
        args.security = true
        break
      case '--performance':
        args.performance = true
        break
      case '--quality':
        args.quality = true
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
🔧 AI-Powered Auto-Fix Agent

Usage: npx ts-node cli.ts [options]

Options:
  -p, --path <path>              Path to the file/directory to fix (default: ./src)
  -a, --auto-apply               Automatically apply fixes (default: false)
  -m, --max-fixes <num>          Maximum number of fixes to apply (default: 50)
  -o, --output <path>            Output directory for reports (default: ./auto-fix-results)
  -t, --typescript               Enable TypeScript analysis
  -e, --eslint                   Enable ESLint analysis
  --security                     Include security fixes
  --performance                  Include performance fixes
  --quality                      Include quality fixes
  -h, --help                     Show this help message
  -v, --version                  Show version information

Examples:
  # Basic usage with default settings
  npx ts-node cli.ts

  # Custom path and auto-apply
  npx ts-node cli.ts --path ./src/components --auto-apply

  # Include all analysis types
  npx ts-node cli.ts --typescript --eslint --security --performance --quality

  # Custom output directory
  npx ts-node cli.ts --output ./custom-results

Features:
  🔄 2 Iterations with improvement tracking
  📊 Quality scoring per iteration
  🎯 Multiple fix categories
  📈 Performance metrics
  🔍 Detailed reporting
`)
}

function showVersion(): void {
  console.log('AI Auto-Fix Agent v2.0.0')
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
  
  // Default values
  const options: AutoFixOptions = {
    filePath: args.path || './src',
    outputPath: args.output || './auto-fix-results',
    maxFixes: args.maxFixes || 50,
    autoApply: args.autoApply || false,
    requireValidation: true,
    includeSecurityFixes: args.security !== false,
    includePerformanceFixes: args.performance !== false,
    includeQualityFixes: args.quality !== false,
    includeTypeScriptFixes: args.typescript || false,
    includeESLintFixes: args.eslint || false
  }
  
  console.log('🚀 Starting AI Auto-Fix Agent...')
  console.log(`Target: ${options.filePath}`)
  console.log(`Auto-apply: ${options.autoApply ? 'YES' : 'NO'}`)
  console.log(`Max fixes: ${options.maxFixes}`)
  console.log(`Output: ${options.outputPath}`)
  console.log('')
  
  try {
    const agent = new AutoFixAgent(options)
    const result = await agent.run()
    
    console.log('✅ Auto-fix analysis complete!')
    console.log(`📊 Results saved to: ${options.outputPath}`)
    
    if (result.metrics) {
      console.log(`Total issues: ${result.metrics.totalIssues || 0}`)
      console.log(`Fixes generated: ${result.metrics.fixesGenerated || 0}`)
      if (options.autoApply) {
        console.log(`Fixes applied: ${result.metrics.fixesApplied || 0}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Auto-fix failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}