#!/usr/bin/env ts-node

import { PipelineOrchestratorAgent } from './PipelineOrchestratorAgent'
import { OrchestratorOptions } from './types'
import * as path from 'path'

/**
 * Parse command line arguments
 */
function parseArguments(): OrchestratorOptions {
  const args = process.argv.slice(2)
  const options: Partial<OrchestratorOptions> = {
    enableMonitoring: true,
    enableNotifications: false,
    maxConcurrentWorkflows: 3,
    defaultTimeout: 300000,
    logLevel: 'info'
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

      case '--config':
      case '-c':
        if (nextArg) {
          options.configPath = nextArg
          i++
        } else {
          console.error('❌ Error: --config requires a config file path')
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

      case '--max-workflows':
        if (nextArg) {
          const maxWorkflows = parseInt(nextArg)
          if (isNaN(maxWorkflows) || maxWorkflows < 1) {
            console.error('❌ Error: --max-workflows must be a positive number')
            process.exit(1)
          }
          options.maxConcurrentWorkflows = maxWorkflows
          i++
        } else {
          console.error('❌ Error: --max-workflows requires a number')
          process.exit(1)
        }
        break

      case '--timeout':
        if (nextArg) {
          const timeout = parseInt(nextArg)
          if (isNaN(timeout) || timeout < 1000) {
            console.error('❌ Error: --timeout must be at least 1000ms')
            process.exit(1)
          }
          options.defaultTimeout = timeout
          i++
        } else {
          console.error('❌ Error: --timeout requires a number')
          process.exit(1)
        }
        break

      case '--no-monitoring':
        options.enableMonitoring = false
        break

      case '--enable-notifications':
        options.enableNotifications = true
        break

      case '--log-level':
        if (nextArg) {
          const logLevel = nextArg as 'debug' | 'info' | 'warn' | 'error'
          if (!['debug', 'info', 'warn', 'error'].includes(logLevel)) {
            console.error('❌ Error: --log-level must be debug, info, warn, or error')
            process.exit(1)
          }
          options.logLevel = logLevel
          i++
        } else {
          console.error('❌ Error: --log-level requires a level')
          process.exit(1)
        }
        break

      case '--version':
      case '-v':
        showVersion()
        process.exit(0)
        break

      default:
        console.error(`❌ Error: Unknown option: ${arg}`)
        showHelp()
        process.exit(1)
    }
  }

  // Set default values
  if (!options.configPath) {
    options.configPath = './pipeline-config.json'
  }

  if (!options.outputPath) {
    options.outputPath = './pipeline-results'
  }

  return options as OrchestratorOptions
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🚀 AI-Powered Pipeline Orchestrator Agent CLI

USAGE:
  npx ts-node cli.ts [OPTIONS]

OPTIONS:
  -c, --config <path>           Configuration file path (default: ./pipeline-config.json)
  -o, --output <path>           Output directory for results (default: ./pipeline-results)
  --max-workflows <number>       Maximum concurrent workflows (default: 3)
  --timeout <ms>                Default timeout in milliseconds (default: 300000)
  --no-monitoring               Disable monitoring and health checks
  --enable-notifications        Enable notifications
  --log-level <level>           Log level: debug, info, warn, error (default: info)
  -h, --help                    Show this help message
  -v, --version                 Show version information

EXAMPLES:
  # Basic usage with default configuration
  npx ts-node cli.ts

  # Custom configuration and output
  npx ts-node cli.ts --config ./my-pipeline.json --output ./results

  # High-performance mode
  npx ts-node cli.ts --max-workflows 10 --timeout 600000

  # Development mode
  npx ts-node cli.ts --log-level debug --no-monitoring

FEATURES:
  🔄 Workflow orchestration and execution
  🤖 Multi-agent coordination and management
  📊 Real-time monitoring and health checks
  🎯 Quality gates and validation
  📈 Metrics collection and reporting
  🚀 Parallel workflow execution
  🔒 Retry policies and rollback strategies
  📋 Comprehensive logging and debugging

For more information, visit: https://github.com/your-repo/ai-testing-system
`)
}

/**
 * Show version information
 */
function showVersion() {
  console.log('AI-Powered Pipeline Orchestrator Agent v1.0.0')
  console.log('Part of the AI Testing & Quality Analysis System')
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 AI-Powered Pipeline Orchestrator Agent')
    console.log('==========================================')
    console.log('')

    // Parse command line arguments
    const options = parseArguments()

    // Display configuration
    console.log('📋 Configuration:')
    console.log(`  Config File: ${options.configPath}`)
    console.log(`  Output Directory: ${options.outputPath}`)
    console.log(`  Max Concurrent Workflows: ${options.maxConcurrentWorkflows}`)
    console.log(`  Default Timeout: ${options.defaultTimeout}ms`)
    console.log(`  Monitoring: ${options.enableMonitoring ? 'Enabled' : 'Disabled'}`)
    console.log(`  Notifications: ${options.enableNotifications ? 'Enabled' : 'Disabled'}`)
    console.log(`  Log Level: ${options.logLevel}`)
    console.log('')

    // Create and initialize the orchestrator
    const orchestrator = new PipelineOrchestratorAgent(options)
    
    // Initialize the pipeline
    await orchestrator.initialize()
    
    // Display status
    const status = orchestrator.getStatus()
    console.log('📊 Pipeline Status:')
    console.log(`  Status: ${status.status}`)
    console.log(`  Active Workflows: ${status.activeWorkflows}`)
    console.log(`  Queued Workflows: ${status.queuedWorkflows}`)
    console.log(`  Agents: ${Object.keys(status.agentStatus).length}`)
    console.log(`  Uptime: ${Math.round(status.uptime / 1000)}s`)
    console.log('')

    // Display available workflows
    const workflows = orchestrator.getWorkflows()
    if (workflows.length > 0) {
      console.log('🔄 Available Workflows:')
      workflows.forEach(workflow => {
        console.log(`  - ${workflow.name} (${workflow.id})`)
        console.log(`    ${workflow.description}`)
        console.log(`    Steps: ${workflow.steps.length}, Timeout: ${workflow.timeout}ms`)
        console.log('')
      })
    }

    // Display agent information
    const agents = orchestrator.getAgents()
    if (agents.length > 0) {
      console.log('🤖 Registered Agents:')
      agents.forEach(agent => {
        const health = orchestrator.getAgentHealth(agent.id)
        const healthStatus = health ? health.status : 'unknown'
        console.log(`  - ${agent.name} (${agent.type}): ${agent.status} [${healthStatus}]`)
      })
      console.log('')
    }

    // Interactive mode (simplified)
    console.log('🎯 Pipeline Orchestrator is ready!')
    console.log('Use the following commands:')
    console.log('  - execute <workflow-id> [config] - Execute a workflow')
    console.log('  - status                        - Show current status')
    console.log('  - metrics                       - Show metrics')
    console.log('  - agents                        - Show agent information')
    console.log('  - workflows                     - Show available workflows')
    console.log('  - quit                          - Exit the orchestrator')
    console.log('')

    // Simple command loop
    process.stdin.setRawMode(false)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    process.stdin.on('data', async (data) => {
      const input = data.toString().trim()
      const parts = input.split(' ')
      const command = parts[0].toLowerCase()

      try {
        switch (command) {
          case 'execute':
            if (parts.length < 2) {
              console.log('❌ Usage: execute <workflow-id> [config]')
              break
            }
            const workflowId = parts[1]
            const config = parts.length > 2 ? JSON.parse(parts.slice(2).join(' ')) : {}
            console.log(`🚀 Executing workflow: ${workflowId}`)
            const result = await orchestrator.executeWorkflow(workflowId, config)
            console.log(`✅ Workflow completed: ${result.id}`)
            break

          case 'status':
            const currentStatus = orchestrator.getStatus()
            console.log('📊 Current Status:', currentStatus)
            break

          case 'metrics':
            const metrics = orchestrator.getMetrics()
            console.log('📈 Metrics:', metrics)
            break

          case 'agents':
            const allAgents = orchestrator.getAgents()
            console.log('🤖 Agents:', allAgents)
            break

          case 'workflows':
            const allWorkflows = orchestrator.getWorkflows()
            console.log('🔄 Workflows:', allWorkflows)
            break

          case 'quit':
          case 'exit':
            console.log('🔄 Shutting down...')
            await orchestrator.shutdown()
            process.exit(0)
            break

          default:
            console.log(`❌ Unknown command: ${command}`)
            break
        }
      } catch (error) {
        console.error(`❌ Error executing command: ${error.message}`)
      }

      console.log('\n🎯 Enter command:')
    })

    console.log('🎯 Enter command:')

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