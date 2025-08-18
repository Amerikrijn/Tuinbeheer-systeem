import { WorkflowEngine } from './WorkflowEngine'
import { AgentManager } from './AgentManager'
import { 
  OrchestratorOptions, 
  PipelineConfig, 
  WorkflowConfig,
  WorkflowExecutionRequest,
  PipelineStatus,
  PipelineMetrics
} from './types'
import * as fs from 'fs'
import * as path from 'path'

export class PipelineOrchestratorAgent {
  private workflowEngine: WorkflowEngine
  private agentManager: AgentManager
  private options: OrchestratorOptions
  private config: PipelineConfig | null = null
  private startTime: number

  constructor(options: OrchestratorOptions) {
    this.options = options
    this.workflowEngine = new WorkflowEngine(options.maxConcurrentWorkflows)
    this.agentManager = new AgentManager()
    this.startTime = Date.now()
  }

  /**
   * Initialize the pipeline orchestrator
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing AI-Powered Pipeline Orchestrator...')
    
    try {
      // Load pipeline configuration
      await this.loadConfiguration()
      
      // Register agents
      await this.registerAgents()
      
      // Initialize workflows
      await this.initializeWorkflows()
      
      console.log('✅ Pipeline Orchestrator initialized successfully!')
      
    } catch (error) {
      console.error('❌ Failed to initialize Pipeline Orchestrator:', error)
      throw error
    }
  }

  /**
   * Load pipeline configuration
   */
  private async loadConfiguration(): Promise<void> {
    if (!fs.existsSync(this.options.configPath)) {
      console.log('📝 No configuration file found, creating default configuration...')
      this.config = this.createDefaultConfiguration()
      await this.saveConfiguration()
    } else {
      const configContent = fs.readFileSync(this.options.configPath, 'utf-8')
      this.config = JSON.parse(configContent)
      console.log(`📋 Loaded configuration: ${this.config.name} v${this.config.version}`)
    }
  }

  /**
   * Create default configuration
   */
  private createDefaultConfiguration(): PipelineConfig {
    return {
      id: 'default-pipeline',
      name: 'AI Testing Pipeline',
      description: 'Default AI-powered testing and quality analysis pipeline',
      version: '1.0.0',
      agents: [
        {
          id: 'test-generator',
          name: 'Test Generator Agent',
          type: 'test-generator',
          status: 'active',
          path: '../test-generator',
          dependencies: [],
          config: {},
          healthCheck: {
            enabled: true,
            interval: 30000, // 30 seconds
            timeout: 5000,   // 5 seconds
            retries: 3
          }
        },
        {
          id: 'quality-analyzer',
          name: 'Quality Analyzer Agent',
          type: 'quality-analyzer',
          status: 'active',
          path: '../quality-analyzer',
          dependencies: ['test-generator'],
          config: {},
          healthCheck: {
            enabled: true,
            interval: 30000,
            timeout: 5000,
            retries: 3
          }
        },
        {
          id: 'auto-fix',
          name: 'Auto-Fix Agent',
          type: 'auto-fix',
          status: 'active',
          path: '../auto-fix',
          dependencies: ['quality-analyzer'],
          config: {},
          healthCheck: {
            enabled: true,
            interval: 30000,
            timeout: 5000,
            retries: 3
          }
        }
      ],
      workflows: [
        {
          id: 'full-testing-pipeline',
          name: 'Full Testing Pipeline',
          description: 'Complete testing, quality analysis, and auto-fix workflow',
          steps: [
            {
              id: 'generate-tests',
              name: 'Generate Tests',
              agentId: 'test-generator',
              order: 1,
              required: true,
              config: {
                path: './app/auth/login',
                strategy: 'full-path-coverage',
                maxInteractions: 100
              },
              dependencies: [],
              timeout: 300000, // 5 minutes
              retryPolicy: {
                maxRetries: 2,
                backoffMultiplier: 2,
                initialDelay: 1000,
                maxDelay: 10000
              },
              rollbackPolicy: {
                enabled: false,
                strategy: 'full',
                checkpointInterval: 0,
                maxCheckpoints: 0
              }
            },
            {
              id: 'analyze-quality',
              name: 'Analyze Quality',
              agentId: 'quality-analyzer',
              order: 2,
              required: true,
              config: {
                testResults: '../test-generator/test-results/login-exploration.json',
                testScenarios: '../test-generator/test-results/login-exploration.json'
              },
              dependencies: ['generate-tests'],
              timeout: 180000, // 3 minutes
              retryPolicy: {
                maxRetries: 2,
                backoffMultiplier: 2,
                initialDelay: 1000,
                maxDelay: 10000
              },
              rollbackPolicy: {
                enabled: false,
                strategy: 'full',
                checkpointInterval: 0,
                maxCheckpoints: 0
              }
            },
            {
              id: 'auto-fix-issues',
              name: 'Auto-Fix Issues',
              agentId: 'auto-fix',
              order: 3,
              required: false,
              config: {
                filePath: './app/auth/login',
                maxFixes: 50,
                autoApply: false
              },
              dependencies: ['analyze-quality'],
              timeout: 240000, // 4 minutes
              retryPolicy: {
                maxRetries: 1,
                backoffMultiplier: 2,
                initialDelay: 2000,
                maxDelay: 10000
              },
              rollbackPolicy: {
                enabled: true,
                strategy: 'partial',
                checkpointInterval: 60000,
                maxCheckpoints: 5
              }
            }
          ],
          triggers: [
            {
              type: 'manual',
              config: {},
              enabled: true
            }
          ],
          conditions: [
            {
              type: 'quality-score',
              operator: 'gte',
              value: 70,
              field: 'qualityScore'
            }
          ],
          maxRetries: 2,
          timeout: 900000, // 15 minutes
          parallel: false,
          enabled: true
        }
      ],
      settings: {
        maxConcurrentWorkflows: 3,
        defaultTimeout: 300000, // 5 minutes
        enableLogging: true,
        enableMetrics: true,
        enableNotifications: false,
        qualityGates: [
          {
            id: 'quality-threshold',
            name: 'Quality Score Threshold',
            type: 'quality-score',
            threshold: 70,
            operator: 'gte',
            action: 'warn',
            enabled: true
          },
          {
            id: 'test-coverage-threshold',
            name: 'Test Coverage Threshold',
            type: 'test-coverage',
            threshold: 80,
            operator: 'gte',
            action: 'warn',
            enabled: true
          }
        ],
        notifications: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfiguration(): Promise<void> {
    if (!this.config) return

    const configDir = path.dirname(this.options.configPath)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    this.config.updatedAt = new Date().toISOString()
    const configContent = JSON.stringify(this.config, null, 2)
    fs.writeFileSync(this.options.configPath, configContent, 'utf-8')
    
    console.log(`💾 Configuration saved to: ${this.options.configPath}`)
  }

  /**
   * Register all agents
   */
  private async registerAgents(): Promise<void> {
    if (!this.config) return

    console.log('🔧 Registering agents...')
    
    for (const agentConfig of this.config.agents) {
      try {
        this.agentManager.registerAgent(agentConfig)
      } catch (error) {
        console.warn(`⚠️ Failed to register agent ${agentConfig.name}:`, error)
      }
    }
    
    console.log(`✅ Registered ${this.config.agents.length} agents`)
  }

  /**
   * Initialize workflows
   */
  private async initializeWorkflows(): Promise<void> {
    if (!this.config) return

    console.log('🔄 Initializing workflows...')
    
    // For now, we'll just log the workflows
    // In a real implementation, this would set up triggers and schedules
    for (const workflow of this.config.workflows) {
      if (workflow.enabled) {
        console.log(`  - ${workflow.name}: ${workflow.description}`)
      }
    }
    
    console.log(`✅ Initialized ${this.config.workflows.filter(w => w.enabled).length} workflows`)
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    config: Record<string, any> = {},
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): Promise<any> {
    if (!this.config) {
      throw new Error('Pipeline not initialized')
    }

    const workflow = this.config.workflows.find(w => w.id === workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    if (!workflow.enabled) {
      throw new Error(`Workflow is disabled: ${workflowId}`)
    }

    const request: WorkflowExecutionRequest = {
      workflowId,
      config,
      priority,
      metadata: {
        requestedAt: new Date().toISOString(),
        requestedBy: 'pipeline-orchestrator'
      }
    }

    console.log(`🚀 Executing workflow: ${workflow.name}`)
    console.log(`📋 Priority: ${priority}`)
    console.log(`⚙️ Configuration:`, config)

    try {
      const result = await this.workflowEngine.executeWorkflow(workflow, request)
      console.log(`✅ Workflow execution completed: ${result.id}`)
      return result
    } catch (error) {
      console.error(`❌ Workflow execution failed:`, error)
      throw error
    }
  }

  /**
   * Get pipeline status
   */
  getStatus(): PipelineStatus {
    const status = this.agentManager.getPipelineStatus()
    
    // Add workflow information
    const activeExecutions = this.workflowEngine.getActiveExecutions()
    const queuedWorkflows = this.workflowEngine.getWorkflowQueue()
    
    status.activeWorkflows = activeExecutions.length
    status.queuedWorkflows = queuedWorkflows.length
    
    return status
  }

  /**
   * Get pipeline metrics
   */
  getMetrics(): PipelineMetrics {
    const agentStats = this.agentManager.getAgentStatistics()
    const agentHealth = this.agentManager.getAllAgentHealth()
    
    // Calculate quality trends (simplified)
    const qualityTrends = [
      {
        date: new Date().toISOString(),
        qualityScore: 75,
        testCoverage: 80,
        riskLevel: 'medium',
        issuesCount: 5
      }
    ]

    return {
      totalExecutions: 0, // Would come from execution history
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      successRate: 0,
      activeWorkflows: this.workflowEngine.getActiveExecutions().length,
      agentHealth,
      qualityTrends
    }
  }

  /**
   * Get available workflows
   */
  getWorkflows(): WorkflowConfig[] {
    if (!this.config) return []
    return this.config.workflows.filter(w => w.enabled)
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowConfig | undefined {
    if (!this.config) return undefined
    return this.config.workflows.find(w => w.id === workflowId)
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): any[] {
    return this.workflowEngine.getActiveExecutions()
  }

  /**
   * Cancel execution
   */
  cancelExecution(executionId: string): boolean {
    return this.workflowEngine.cancelExecution(executionId)
  }

  /**
   * Get agent information
   */
  getAgents(): any[] {
    return this.agentManager.getAllAgents()
  }

  /**
   * Get agent health
   */
  getAgentHealth(agentId: string): any {
    return this.agentManager.getAgentHealth(agentId)
  }

  /**
   * Restart agent health checks
   */
  restartHealthChecks(): void {
    this.agentManager.restartHealthChecks()
  }

  /**
   * Update configuration
   */
  async updateConfiguration(updates: Partial<PipelineConfig>): Promise<void> {
    if (!this.config) return

    this.config = { ...this.config, ...updates, updatedAt: new Date().toISOString() }
    await this.saveConfiguration()
    
    console.log('✅ Configuration updated successfully')
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Pipeline Orchestrator...')
    
    try {
      // Stop all health checks
      this.agentManager.stopAllHealthChecks()
      
      // Cancel active executions
      const activeExecutions = this.workflowEngine.getActiveExecutions()
      for (const execution of activeExecutions) {
        this.workflowEngine.cancelExecution(execution.id)
      }
      
      // Cleanup resources
      this.agentManager.cleanup()
      
      console.log('✅ Pipeline Orchestrator shutdown complete')
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error)
    }
  }

  /**
   * Get runtime information
   */
  getRuntimeInfo(): {
    uptime: number
    startTime: string
    version: string
    status: string
  } {
    return {
      uptime: Date.now() - this.startTime,
      startTime: new Date(this.startTime).toISOString(),
      version: this.config?.version || '1.0.0',
      status: this.getStatus().status
    }
  }
}