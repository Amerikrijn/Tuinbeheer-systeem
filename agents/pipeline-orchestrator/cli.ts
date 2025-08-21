#!/usr/bin/env ts-node

import { PipelineOrchestratorAgent } from './PipelineOrchestratorAgent'
import * as readline from 'readline'

interface CLIArgs {
  config?: string
  workflow?: string
  execute?: boolean
  status?: boolean
  metrics?: boolean
  parallel?: boolean
  help?: boolean
  version?: boolean
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {}
  
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]
    
    switch (arg) {
      case '--config':
      case '-c':
        args.config = process.argv[++i]
        break
      case '--workflow':
      case '-w':
        args.workflow = process.argv[++i]
        break
      case '--execute':
      case '-e':
        args.execute = true
        break
      case '--status':
      case '-s':
        args.status = true
        break
      case '--metrics':
      case '-m':
        args.metrics = true
        break
      case '--parallel':
      case '-p':
        args.parallel = true
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
🚀 AI-Powered Pipeline Orchestrator Agent

Usage: npx ts-node cli.ts [options]

Options:
  -c, --config <path>      Path to pipeline configuration file
  -w, --workflow <id>      Workflow ID to execute
  -e, --execute            Execute the specified workflow
  -s, --status             Show pipeline status
  -m, --metrics            Show pipeline metrics
  -p, --parallel           Enable parallel workflow execution
  -h, --help               Show this help message
  -v, --version            Show version information

Examples:
  # Initialize with config and execute workflow
  npx ts-node cli.ts --config ../../.github/ai-pipeline-config.json --workflow ci-ai-pipeline --execute

  # Execute workflow in parallel mode
  npx ts-node cli.ts --config ../../.github/ai-pipeline-config.json --workflow ci-ai-pipeline --execute --parallel

  # Show pipeline status
  npx ts-node cli.ts --config ../../.github/ai-pipeline-config.json --status

  # Show pipeline metrics
  npx ts-node cli.ts --config ../../.github/ai-pipeline-config.json --metrics

  # Interactive mode
  npx ts-node cli.ts --config ../../.github/ai-pipeline-config.json

Features:
  🔄 2 Iterations with improvement tracking
  📊 Performance metrics and monitoring
  🎯 Advanced reporting and analysis
  🚀 CI/CD ready workflow execution
  📈 Trend analysis and recommendations
  🚀 Parallel workflow execution support

The orchestrator will:
  1. Run iteration 1: Execute basic workflow
  2. Run iteration 2: Execute improved workflow with enhanced monitoring
  3. Compare results and show improvements
  4. Generate comprehensive reports
`)
}

function showVersion(): void {
  console.log('AI-Powered Pipeline Orchestrator Agent v1.0.0')
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
    // Initialize orchestrator
    const orchestrator = new PipelineOrchestratorAgent()
    
    if (args.config) {
      await orchestrator.initialize(args.config)
    } else {
      await orchestrator.initialize()
    }
    
    // Execute workflow if requested
    if (args.execute && args.workflow) {
      console.log(`🚀 Executing workflow: ${args.workflow}`)
      const result = await orchestrator.executeWorkflow(args.workflow)
      
      console.log('')
      console.log('🎉 Workflow execution completed!')
      console.log('')
      console.log('📊 Final Results:')
      console.log(`   Workflow: ${result.workflowName}`)
      console.log(`   Status: ${result.executionResult?.status || 'unknown'}`)
      console.log(`   Total Execution Time: ${result.executionTime}ms`)
      console.log(`   Iterations Completed: ${result.iterationHistory?.length || 1}`)
      
      if (result.consolidatedTestResults) {
        console.log('')
        console.log('🔗 Consolidated Test Results:')
        console.log(`   Total Tests: ${result.consolidatedTestResults.totalTests}`)
        console.log(`   AI Tests: ${result.consolidatedTestResults.aiTests.length} sources`)
        console.log(`   Conventional Tests: ${result.consolidatedTestResults.conventionalTests.length} sources`)
        console.log(`   Overall Quality Score: ${result.consolidatedTestResults.overallQualityScore.toFixed(2)}/100`)
        console.log(`   Reports Generated: 3 (JSON, Summary, Executive)`)
      }
      
      if (result.improvementSummary) {
        console.log('')
        console.log('📈 Improvement Summary:')
        console.log(`   Success Rate Increase: +${result.improvementSummary.successRateIncrease.toFixed(1)}%`)
        console.log(`   Score Increase: +${result.improvementSummary.scoreIncrease} points`)
        console.log(`   Total Iterations: ${result.improvementSummary.totalIterations}`)
        console.log(`   Conventional Tests Included: ${result.improvementSummary.conventionalTestsIncluded ? 'Yes' : 'No'}`)
        console.log(`   Total Tests Consolidated: ${result.improvementSummary.totalTestsConsolidated}`)
      }
      
      return
    }
    
    // Show status if requested
    if (args.status) {
      const status = orchestrator.getStatus()
      console.log('')
      console.log('📊 Pipeline Status:')
      console.log(`   Status: ${status.status}`)
      console.log(`   Active Workflows: ${status.activeWorkflows}`)
      console.log(`   Registered Agents: ${status.registeredAgents}`)
      console.log(`   Total Iterations: ${status.totalIterations}`)
      console.log(`   Last Execution: ${status.lastExecution || 'None'}`)
      return
    }
    
    // Show metrics if requested
    if (args.metrics) {
      const metrics = orchestrator.getMetrics()
      console.log('')
      console.log('📈 Pipeline Metrics:')
      console.log(`   Total Iterations: ${metrics.totalIterations}`)
      console.log(`   Average Execution Time: ${Math.round(metrics.averageExecutionTime)}ms`)
      console.log(`   Average Success Rate: ${metrics.successRate.toFixed(1)}%`)
      console.log(`   Improvement Trend: ${metrics.improvementTrend > 0 ? '+' : ''}${metrics.improvementTrend} points`)
      return
    }
    
    // Interactive mode
    if (!args.execute && !args.status && !args.metrics) {
      await interactiveMode(orchestrator)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

async function interactiveMode(orchestrator: PipelineOrchestratorAgent): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  console.log('')
  console.log('🤖 Pipeline Orchestrator Interactive Mode')
  console.log('=========================================')
  console.log('')
  
  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve)
    })
  }
  
  try {
    while (true) {
      console.log('Available commands:')
      console.log('  1. execute <workflow-id>  - Execute a workflow')
      console.log('  2. status                 - Show pipeline status')
      console.log('  3. metrics                - Show pipeline metrics')
      console.log('  4. workflows              - List available workflows')
      console.log('  5. agents                 - List registered agents')
      console.log('  6. help                   - Show help')
      console.log('  7. exit                   - Exit interactive mode')
      console.log('')
      
      const input = await question('Enter command: ')
      const [command, ...args] = input.trim().split(' ')
      
      switch (command.toLowerCase()) {
        case 'execute':
          if (args.length === 0) {
            console.log('❌ Please specify a workflow ID')
            break
          }
          
          const workflowId = args[0]
          console.log(`🚀 Executing workflow: ${workflowId}`)
          
          try {
            const result = await orchestrator.executeWorkflow(workflowId)
            console.log('✅ Workflow executed successfully!')
            console.log(`📊 Result: ${result.executionResult?.status || 'unknown'}`)
          } catch (error) {
            console.error(`❌ Error executing workflow: ${error}`)
          }
          break
          
        case 'status':
          const status = orchestrator.getStatus()
          console.log('')
          console.log('📊 Pipeline Status:')
          console.log(`   Status: ${status.status}`)
          console.log(`   Active Workflows: ${status.activeWorkflows}`)
          console.log(`   Registered Agents: ${status.registeredAgents}`)
          console.log(`   Total Iterations: ${status.totalIterations}`)
          console.log(`   Last Execution: ${status.lastExecution || 'None'}`)
          break
          
        case 'metrics':
          const metrics = orchestrator.getMetrics()
          console.log('')
          console.log('📈 Pipeline Metrics:')
          console.log(`   Total Iterations: ${metrics.totalIterations}`)
          console.log(`   Average Execution Time: ${Math.round(metrics.averageExecutionTime)}ms`)
          console.log(`   Average Success Rate: ${metrics.successRate.toFixed(1)}%`)
          console.log(`   Improvement Trend: ${metrics.improvementTrend > 0 ? '+' : ''}${metrics.improvementTrend} points`)
          break
          
        case 'workflows':
          const workflows = orchestrator.getWorkflows()
          console.log('')
          console.log('🔄 Available Workflows:')
          if (workflows.length === 0) {
            console.log('   No workflows configured')
          } else {
            workflows.forEach(workflow => {
              console.log(`   ${workflow.id}: ${workflow.name}`)
              console.log(`     ${workflow.description}`)
              console.log(`     Enabled: ${workflow.enabled ? '✅' : '❌'}`)
              console.log('')
            })
          }
          break
          
        case 'agents':
          const agents = orchestrator.getAgents()
          console.log('')
          console.log('🤖 Registered Agents:')
          if (agents.length === 0) {
            console.log('   No agents registered')
          } else {
            agents.forEach(agent => {
              console.log(`   ${agent.id}: ${agent.name}`)
              console.log(`     Type: ${agent.type}`)
              console.log(`     Status: ${agent.status}`)
              console.log('')
            })
          }
          break
          
        case 'help':
          showHelp()
          break
          
        case 'exit':
          console.log('👋 Goodbye!')
          rl.close()
          return
          
        default:
          console.log(`❌ Unknown command: ${command}`)
          console.log('Type "help" for available commands')
          break
      }
      
      console.log('')
    }
  } finally {
    rl.close()
  }
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
}