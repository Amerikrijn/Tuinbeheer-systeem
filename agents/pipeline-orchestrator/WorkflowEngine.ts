import { 
  WorkflowConfig, 
  WorkflowStep, 
  PipelineExecution, 
  ExecutionStep, 
  ExecutionResults,
  WorkflowExecutionRequest,
  RetryPolicy,
  RollbackPolicy
} from './types'
import * as fs from 'fs'
import * as path from 'path'
import { spawn } from 'child_process'

export class WorkflowEngine {
  private activeExecutions: Map<string, PipelineExecution> = new Map()
  private workflowQueue: WorkflowExecutionRequest[] = []
  private maxConcurrentWorkflows: number

  constructor(maxConcurrentWorkflows: number = 3) {
    this.maxConcurrentWorkflows = maxConcurrentWorkflows
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: WorkflowConfig,
    request: WorkflowExecutionRequest
  ): Promise<PipelineExecution> {
    const execution: PipelineExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pipelineId: 'main-pipeline',
      workflowId: workflow.id,
      status: 'pending',
      startTime: new Date().toISOString(),
      steps: [],
      metadata: request.metadata || {},
      results: {
        overallStatus: 'success',
        qualityScore: 0,
        testCoverage: 0,
        riskLevel: 'low',
        summary: '',
        recommendations: [],
        artifacts: []
      }
    }

    // Initialize execution steps
    execution.steps = workflow.steps.map(step => ({
      id: `step-${step.id}`,
      stepId: step.id,
      status: 'pending',
      startTime: '',
      endTime: '',
      duration: 0,
      output: null,
      error: undefined,
      retries: 0,
      metadata: {}
    }))

    // Add to active executions
    this.activeExecutions.set(execution.id, execution)

    try {
      // Execute workflow steps
      await this.executeWorkflowSteps(execution, workflow)
      
      // Update execution status
      execution.status = 'completed'
      execution.endTime = new Date().toISOString()
      execution.duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()
      
      // Generate results
      execution.results = await this.generateExecutionResults(execution, workflow)
      
    } catch (error) {
      execution.status = 'failed'
      execution.endTime = new Date().toISOString()
      execution.duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()
      execution.results.summary = `Workflow failed: ${error.message}`
      execution.results.overallStatus = 'failure'
    } finally {
      // Remove from active executions
      this.activeExecutions.delete(execution.id)
    }

    return execution
  }

  /**
   * Execute workflow steps
   */
  private async executeWorkflowSteps(
    execution: PipelineExecution,
    workflow: WorkflowConfig
  ): Promise<void> {
    const { steps } = workflow

    // Sort steps by order
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order)

    for (const step of sortedSteps) {
      const executionStep = execution.steps.find(es => es.stepId === step.id)
      if (!executionStep) continue

      try {
        // Check dependencies
        if (!this.checkStepDependencies(execution, step)) {
          executionStep.status = 'skipped'
          executionStep.metadata.reason = 'Dependencies not met'
          continue
        }

        // Execute step
        await this.executeStep(executionStep, step, execution)
        
      } catch (error) {
        executionStep.status = 'failed'
        executionStep.error = error.message
        executionStep.endTime = new Date().toISOString()
        
        // Handle retry policy
        if (executionStep.retries < step.retryPolicy.maxRetries) {
          await this.retryStep(executionStep, step, execution)
        } else {
          throw new Error(`Step ${step.name} failed after ${step.retryPolicy.maxRetries} retries: ${error.message}`)
        }
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    executionStep: ExecutionStep,
    step: WorkflowStep,
    execution: PipelineExecution
  ): Promise<void> {
    executionStep.status = 'running'
    executionStep.startTime = new Date().toISOString()
    
    try {
      // Execute the agent for this step
      const output = await this.executeAgent(step, execution)
      
      executionStep.status = 'completed'
      executionStep.output = output
      executionStep.endTime = new Date().toISOString()
      executionStep.duration = new Date(executionStep.endTime).getTime() - new Date(executionStep.startTime).getTime()
      
    } catch (error) {
      throw error
    }
  }

  /**
   * Execute an agent
   */
  private async executeAgent(step: WorkflowStep, execution: PipelineExecution): Promise<any> {
    const agentPath = path.resolve(step.config.agentPath || `../${step.agentId}`)
    
    if (!fs.existsSync(agentPath)) {
      throw new Error(`Agent path not found: ${agentPath}`)
    }

    return new Promise((resolve, reject) => {
      const args = this.buildAgentArguments(step, execution)
      const agentProcess = spawn('npx', ['ts-node', 'cli.ts', ...args], {
        cwd: agentPath,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      agentProcess.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      agentProcess.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      agentProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Try to parse JSON output
            const output = JSON.parse(stdout)
            resolve(output)
          } catch {
            // Return raw output if not JSON
            resolve({ stdout, stderr, exitCode: code })
          }
        } else {
          reject(new Error(`Agent execution failed with code ${code}: ${stderr}`))
        }
      })

      agentProcess.on('error', (error) => {
        reject(new Error(`Failed to start agent: ${error.message}`))
      })

      // Set timeout
      setTimeout(() => {
        agentProcess.kill()
        reject(new Error(`Agent execution timed out after ${step.timeout}ms`))
      }, step.timeout || 300000) // Default 5 minutes
    })
  }

  /**
   * Build agent command line arguments
   */
  private buildAgentArguments(step: WorkflowStep, execution: PipelineExecution): string[] {
    const args: string[] = []

    // Add step-specific configuration
    Object.entries(step.config).forEach(([key, value]) => {
      if (key !== 'agentPath' && key !== 'timeout') {
        if (typeof value === 'boolean') {
          if (value) args.push(`--${key}`)
        } else {
          args.push(`--${key}`, String(value))
        }
      }
    })

    // Add execution metadata
    args.push('--execution-id', execution.id)
    args.push('--workflow-id', execution.workflowId)

    return args
  }

  /**
   * Check if step dependencies are met
   */
  private checkStepDependencies(execution: PipelineExecution, step: WorkflowStep): boolean {
    if (!step.dependencies || step.dependencies.length === 0) {
      return true
    }

    for (const depId of step.dependencies) {
      const depStep = execution.steps.find(es => es.stepId === depId)
      if (!depStep || depStep.status !== 'completed') {
        return false
      }
    }

    return true
  }

  /**
   * Retry a failed step
   */
  private async retryStep(
    executionStep: ExecutionStep,
    step: WorkflowStep,
    execution: PipelineExecution
  ): Promise<void> {
    const retryPolicy = step.retryPolicy
    const delay = Math.min(
      retryPolicy.initialDelay * Math.pow(retryPolicy.backoffMultiplier, executionStep.retries),
      retryPolicy.maxDelay
    )

    executionStep.retries++
    executionStep.status = 'pending'
    executionStep.error = undefined

    console.log(`Retrying step ${step.name} in ${delay}ms (attempt ${executionStep.retries}/${retryPolicy.maxRetries})`)

    await new Promise(resolve => setTimeout(resolve, delay))

    // Re-execute the step
    await this.executeStep(executionStep, step, execution)
  }

  /**
   * Generate execution results
   */
  private async generateExecutionResults(
    execution: PipelineExecution,
    workflow: WorkflowConfig
  ): Promise<ExecutionResults> {
    const completedSteps = execution.steps.filter(step => step.status === 'completed')
    const failedSteps = execution.steps.filter(step => step.status === 'failed')
    const skippedSteps = execution.steps.filter(step => step.status === 'skipped')

    // Calculate overall status
    let overallStatus: 'success' | 'partial' | 'failure' = 'success'
    if (failedSteps.length > 0) {
      overallStatus = failedSteps.some(step => step.required) ? 'failure' : 'partial'
    }

    // Extract quality metrics from step outputs
    let qualityScore = 0
    let testCoverage = 0
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    for (const step of completedSteps) {
      if (step.output && typeof step.output === 'object') {
        // Extract quality score
        if (step.output.qualityScore !== undefined) {
          qualityScore = Math.max(qualityScore, step.output.qualityScore)
        }
        
        // Extract test coverage
        if (step.output.testCoverage !== undefined) {
          testCoverage = Math.max(testCoverage, step.output.testCoverage)
        }
        
        // Extract risk level
        if (step.output.riskLevel) {
          const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          if (riskOrder[step.output.riskLevel] > riskOrder[riskLevel]) {
            riskLevel = step.output.riskLevel
          }
        }
      }
    }

    // Generate summary
    const summary = this.generateExecutionSummary(execution, completedSteps, failedSteps, skippedSteps)

    // Generate recommendations
    const recommendations = this.generateRecommendations(execution, completedSteps, failedSteps)

    // Collect artifacts
    const artifacts = this.collectArtifacts(execution, completedSteps)

    return {
      overallStatus,
      qualityScore,
      testCoverage,
      riskLevel,
      summary,
      recommendations,
      artifacts
    }
  }

  /**
   * Generate execution summary
   */
  private generateExecutionSummary(
    execution: PipelineExecution,
    completedSteps: ExecutionStep[],
    failedSteps: ExecutionStep[],
    skippedSteps: ExecutionStep[]
  ): string {
    const totalSteps = execution.steps.length
    const successRate = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0

    let summary = `Workflow execution ${execution.status}`
    summary += `\n- Total steps: ${totalSteps}`
    summary += `\n- Completed: ${completedSteps.length}`
    summary += `\n- Failed: ${failedSteps.length}`
    summary += `\n- Skipped: ${skippedSteps.length}`
    summary += `\n- Success rate: ${successRate.toFixed(1)}%`
    summary += `\n- Duration: ${execution.duration}ms`

    return summary
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    execution: PipelineExecution,
    completedSteps: ExecutionStep[],
    failedSteps: ExecutionStep[]
  ): string[] {
    const recommendations: string[] = []

    if (failedSteps.length > 0) {
      recommendations.push(`Review and fix ${failedSteps.length} failed steps`)
      
      const criticalFailures = failedSteps.filter(step => 
        step.metadata.required || step.retries > 0
      )
      if (criticalFailures.length > 0) {
        recommendations.push(`Prioritize fixing ${criticalFailures.length} critical failures`)
      }
    }

    if (completedSteps.length > 0) {
      recommendations.push('All completed steps executed successfully')
    }

    if (execution.results.qualityScore < 80) {
      recommendations.push('Consider improving code quality to meet quality gates')
    }

    if (execution.results.testCoverage < 80) {
      recommendations.push('Increase test coverage to improve reliability')
    }

    return recommendations
  }

  /**
   * Collect artifacts from completed steps
   */
  private collectArtifacts(execution: PipelineExecution, completedSteps: ExecutionStep[]): any[] {
    const artifacts: any[] = []

    for (const step of completedSteps) {
      if (step.output && step.output.files) {
        Object.entries(step.output.files).forEach(([type, filePath]) => {
          if (fs.existsSync(filePath as string)) {
            const stats = fs.statSync(filePath as string)
            artifacts.push({
              id: `artifact-${step.id}-${type}`,
              name: `${step.stepId}-${type}`,
              type: type === 'json' ? 'data' : type === 'markdown' ? 'report' : 'log',
              path: filePath,
              size: stats.size,
              mimeType: this.getMimeType(filePath as string),
              metadata: { stepId: step.stepId, stepName: step.stepId }
            })
          }
        })
      }
    }

    return artifacts
  }

  /**
   * Get MIME type for file
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.json': 'application/json',
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.xml': 'application/xml'
    }
    return mimeTypes[ext] || 'application/octet-stream'
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): PipelineExecution[] {
    return Array.from(this.activeExecutions.values())
  }

  /**
   * Get execution by ID
   */
  getExecution(id: string): PipelineExecution | undefined {
    return this.activeExecutions.get(id)
  }

  /**
   * Cancel execution
   */
  cancelExecution(id: string): boolean {
    const execution = this.activeExecutions.get(id)
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled'
      execution.endTime = new Date().toISOString()
      return true
    }
    return false
  }

  /**
   * Get workflow queue
   */
  getWorkflowQueue(): WorkflowExecutionRequest[] {
    return [...this.workflowQueue]
  }

  /**
   * Add workflow to queue
   */
  addToQueue(request: WorkflowExecutionRequest): void {
    this.workflowQueue.push(request)
  }

  /**
   * Process queue
   */
  async processQueue(): Promise<void> {
    if (this.activeExecutions.size >= this.maxConcurrentWorkflows) {
      return // At capacity
    }

    const nextRequest = this.workflowQueue.shift()
    if (!nextRequest) {
      return // Queue is empty
    }

    // TODO: Load workflow config and execute
    console.log(`Processing queued workflow: ${nextRequest.workflowId}`)
  }
}