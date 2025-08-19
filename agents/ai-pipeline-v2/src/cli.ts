#!/usr/bin/env ts-node

import { Command } from 'commander'
import { AIPipeline } from './pipeline'
import { PipelineConfig } from './types'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

const program = new Command()

program
  .name('ai-pipeline')
  .description('AI-Powered Pipeline for Testing, Orchestration, and Code Fixing')
  .version('2.0.0')

program
  .command('run')
  .description('Run the AI pipeline')
  .option('-t, --target <path>', 'Target directory to analyze', './src')
  .option('-i, --iterations <number>', 'Maximum iterations', '10')
  .option('-q, --quality <number>', 'Quality threshold (0-100)', '90')
  .option('-o, --output <path>', 'Output directory', './ai-pipeline-results')
  .option('--auto-apply', 'Automatically apply fixes', false)
  .option('--git-integration', 'Enable Git integration', false)
  .option('--config <path>', 'Configuration file path')
  .option('--demo', 'Run in demo mode without API calls', false)
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 AI Pipeline v2.0 Starting...'))
      console.log('')

      // Load configuration
      const config = await loadConfiguration(options.config)
      
      // Override config with CLI options
      config.maxIterations = parseInt(options.iterations)
      config.qualityThreshold = parseInt(options.quality)
      config.outputPath = options.output
      config.autoApply = options.autoApply
      config.gitIntegration = options.gitIntegration

      // Validate OpenAI API key (unless in demo mode)
      let openaiApiKey: string = process.env.OPENAI_API_KEY || ''
      if (!openaiApiKey && !options.demo) {
        throw new Error('OPENAI_API_KEY environment variable is required (use --demo for demo mode)')
      }
      
      if (options.demo) {
        openaiApiKey = 'demo-mode'
        console.log(chalk.yellow('🎭 Running in DEMO mode - no real API calls will be made'))
      }

      // Create and run pipeline
      const pipeline = new AIPipeline(config, openaiApiKey)
      const results = await pipeline.run(options.target)

      // Display results
      displayResults(results)

    } catch (error) {
      console.error(chalk.red('❌ Pipeline failed:'), error)
      process.exit(1)
    }
  })

program
  .command('config')
  .description('Manage pipeline configuration')
  .option('--init', 'Initialize default configuration')
  .option('--show', 'Show current configuration')
  .option('--set <key=value>', 'Set configuration value')
  .action(async (options) => {
    try {
      if (options.init) {
        await initializeConfiguration()
      } else if (options.show) {
        await showConfiguration()
      } else if (options.set) {
        await setConfiguration(options.set)
      } else {
        console.log(chalk.yellow('Use --init, --show, or --set to manage configuration'))
      }
    } catch (error) {
      console.error(chalk.red('❌ Configuration failed:'), error)
      process.exit(1)
    }
  })

program
  .command('agents')
  .description('Manage AI agents')
  .option('--list', 'List available agents')
  .option('--status', 'Check agent status')
  .action(async (options) => {
    try {
      if (options.list) {
        await listAgents()
      } else if (options.status) {
        await checkAgentStatus()
      } else {
        console.log(chalk.yellow('Use --list or --status to manage agents'))
      }
    } catch (error) {
      console.error(chalk.red('❌ Agent management failed:'), error)
      process.exit(1)
    }
  })

async function loadConfiguration(configPath?: string): Promise<PipelineConfig> {
  const defaultConfig: PipelineConfig = {
    agents: [
      {
        id: 'issue-collector',
        name: 'Issue Collector',
        description: 'Finds code issues and problems',
        provider: {
          name: 'OpenAI GPT-4',
          type: 'openai',
          config: {},
          isAvailable: true
        },
        enabled: true,
        config: {}
      },
      {
        id: 'test-generator',
        name: 'Test Generator',
        description: 'Generates test cases for issues',
        provider: {
          name: 'Anthropic Claude',
          type: 'anthropic',
          config: {},
          isAvailable: false
        },
        enabled: false,
        config: {}
      },
      {
        id: 'code-fixer',
        name: 'Code Fixer',
        description: 'Fixes identified code issues',
        provider: {
          name: 'GitHub Copilot',
          type: 'github-copilot',
          config: {},
          isAvailable: false
        },
        enabled: false,
        config: {}
      },
      {
        id: 'quality-validator',
        name: 'Quality Validator',
        description: 'Validates fixes and assesses quality',
        provider: {
          name: 'OpenAI GPT-4',
          type: 'openai',
          config: {},
          isAvailable: true
        },
        enabled: true,
        config: {}
      }
    ],
    maxIterations: 10,
    qualityThreshold: 90,
    autoApply: false,
    gitIntegration: false,
    outputPath: './ai-pipeline-results',
    logLevel: 'info'
  }

  if (configPath && fs.existsSync(configPath)) {
    try {
      const fileContent = fs.readFileSync(configPath, 'utf-8')
      const fileConfig = JSON.parse(fileContent)
      return { ...defaultConfig, ...fileConfig }
    } catch (error) {
      console.warn(chalk.yellow(`Failed to load config from ${configPath}, using defaults`))
    }
  }

  return defaultConfig
}

async function initializeConfiguration(): Promise<void> {
  const configPath = './ai-pipeline.config.json'
  const config = await loadConfiguration()
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(chalk.green(`✅ Configuration initialized at ${configPath}`))
}

async function showConfiguration(): Promise<void> {
  const config = await loadConfiguration()
  console.log(chalk.blue('📋 Current Configuration:'))
  console.log(JSON.stringify(config, null, 2))
}

async function setConfiguration(keyValue: string): Promise<void> {
  const [key, value] = keyValue.split('=')
  if (!key || !value) {
    throw new Error('Invalid format. Use: --set key=value')
  }
  
  console.log(chalk.yellow(`Setting ${key} = ${value} not yet implemented`))
}

async function listAgents(): Promise<void> {
  const config = await loadConfiguration()
  console.log(chalk.blue('🤖 Available Agents:'))
  
  for (const agent of config.agents) {
    const status = agent.enabled ? chalk.green('✅ Enabled') : chalk.red('❌ Disabled')
    const provider = chalk.cyan(agent.provider.name)
    console.log(`  ${agent.name} (${provider}) - ${status}`)
    console.log(`    ${agent.description}`)
  }
}

async function checkAgentStatus(): Promise<void> {
  console.log(chalk.yellow('Agent status check not yet implemented'))
}

function displayResults(results: any): void {
  console.log('')
  console.log(chalk.green('🎯 Pipeline Results:'))
  console.log('─'.repeat(50))
  console.log(`Success: ${results.success ? chalk.green('✅ Yes') : chalk.red('❌ No')}`)
  console.log(`Iterations: ${chalk.cyan(results.iterations)}`)
  console.log(`Final Quality: ${chalk.cyan(results.finalQualityScore.toFixed(1))}%`)
  console.log(`Issues Found: ${chalk.cyan(results.issuesFound)}`)
  console.log(`Issues Fixed: ${chalk.cyan(results.issuesFixed)}`)
  console.log(`Tests Generated: ${chalk.cyan(results.testsGenerated)}`)
  console.log(`Execution Time: ${chalk.cyan(results.executionTime)}ms`)
  
  if (results.errors.length > 0) {
    console.log('')
    console.log(chalk.red('❌ Errors:'), results.errors)
  }
  
  if (results.warnings.length > 0) {
    console.log('')
    console.log(chalk.yellow('⚠️ Warnings:'), results.warnings)
  }
}

// Run CLI
if (require.main === module) {
  program.parse()
}