import { WorkflowEngine } from './WorkflowEngine'
import { AgentManager } from './AgentManager'
import { PipelineConfig, WorkflowExecutionRequest, PipelineStatus } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class PipelineOrchestratorAgent {
  private workflowEngine: WorkflowEngine
  private agentManager: AgentManager
  private config!: PipelineConfig
  private iterationResults: any[] = []
  private startTime: number = Date.now()

  constructor() {
    this.workflowEngine = new WorkflowEngine()
    this.agentManager = new AgentManager()
  }

  /**
   * Initialize the orchestrator
   */
  async initialize(configPath?: string): Promise<void> {
    try {
      // Load configuration
      if (configPath) {
        await this.loadConfiguration(configPath)
      } else {
        this.config = this.createDefaultConfiguration()
      }

      // Register agents
      await this.registerAgents()

      // Initialize workflows
      await this.initializeWorkflows()

      console.log('🚀 Pipeline Orchestrator Agent initialized successfully')
      console.log(`📊 Configuration: ${this.config.name} (v${this.config.version})`)
      console.log(`🤖 Registered Agents: ${this.config.agents.length}`)
      console.log(`🔄 Available Workflows: ${this.config.workflows.length}`)
      console.log('')

    } catch (error) {
      console.error('❌ Error initializing Pipeline Orchestrator:', error)
      throw error
    }
  }

  /**
   * Execute a workflow with 2 iterations
   */
  async executeWorkflow(workflowId: string, options?: any): Promise<any> {
    console.log(`🔄 Executing workflow: ${workflowId}`)
    console.log(`🔄 Max iterations: 2 (with improvement tracking)`)
    console.log('')

    try {
      // Find workflow configuration
      const workflow = this.config.workflows.find(w => w.id === workflowId)
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`)
      }

      console.log(`🚀 Workflow mode: ${workflow.parallel ? 'Parallel' : 'Sequential'}`)
      console.log(`📊 Workflow steps: ${workflow.steps.length}`)
      console.log('')

      // Iteratie 1: Basis workflow uitvoering
      console.log('🔄 Iteratie 1: Basis workflow uitvoering...')
      const iteration1Result = await this.executeWorkflowIteration(workflowId, 1, options, workflow)
      this.iterationResults.push(iteration1Result)
      
      console.log(`📊 Iteratie 1 Resultaat: ${iteration1Result.status}, ${iteration1Result.stepsCompleted} stappen voltooid`)
      console.log('')

      // Iteratie 2: Verbeterde workflow uitvoering
      console.log('🔄 Iteratie 2: Verbeterde workflow uitvoering...')
      const iteration2Result = await this.executeWorkflowIteration(workflowId, 2, options, workflow, iteration1Result)
      this.iterationResults.push(iteration2Result)
      
      console.log(`📊 Iteratie 2 Resultaat: ${iteration2Result.status}, ${iteration2Result.stepsCompleted} stappen voltooid`)
      console.log('')

      // Vergelijk resultaten
      this.showImprovementSummary(iteration1Result, iteration2Result)

      // Genereer eindrapport
      const finalReport = this.generateFinalReport(iteration2Result)
      
      return finalReport

    } catch (error) {
      console.error('❌ Error executing workflow:', error)
      throw error
    }
  }

  /**
   * Execute a single workflow iteration
   */
  private async executeWorkflowIteration(workflowId: string, iterationNumber: number, options?: any, workflowConfig?: any, previousResult?: any): Promise<any> {
    const startTime = Date.now()
    
    try {
      // Find workflow
      const workflow = workflowConfig || this.config.workflows.find(w => w.id === workflowId)
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`)
      }

      // Execute workflow with improvement logic
      let executionResult = await this.workflowEngine.executeWorkflow(workflow, this.config.agents, options)
      
      if (iterationNumber === 2 && previousResult) {
        // Improve execution in second iteration
        executionResult = await this.improveExecution(executionResult, previousResult, workflow)
      }

      // Calculate metrics for this iteration
      const metrics = this.calculateIterationMetrics(executionResult, iterationNumber)
      
      const result = {
        iteration: iterationNumber,
        workflowId,
        workflowName: workflow.name,
        executionResult,
        metrics,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }

      return result

    } catch (error) {
      console.error(`❌ Error in iteration ${iterationNumber}:`, error)
      throw error
    }
  }

  /**
   * Improve execution based on previous iteration
   */
  private async improveExecution(executionResult: any, previousResult: any, workflow: any): Promise<any> {
    const improvedExecution = { ...executionResult }

    // Add more detailed monitoring
    improvedExecution.monitoring = {
      ...improvedExecution.monitoring,
      performanceMetrics: this.calculatePerformanceMetrics(improvedExecution),
      resourceUsage: this.calculateResourceUsage(improvedExecution),
      errorAnalysis: this.analyzeErrors(improvedExecution),
      successPatterns: this.identifySuccessPatterns(improvedExecution)
    }

    // Add more detailed reporting
    improvedExecution.reporting = {
      ...improvedExecution.reporting,
      trendAnalysis: this.analyzeTrends(previousResult, improvedExecution),
      recommendations: this.generateAdvancedRecommendations(improvedExecution, workflow),
      riskAssessment: this.assessExecutionRisks(improvedExecution)
    }

    // Add more detailed artifacts
    improvedExecution.artifacts = [
      ...improvedExecution.artifacts,
      ...this.generateAdditionalArtifacts(improvedExecution, workflow)
    ]

    return improvedExecution
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(executionResult: any): any {
    const { steps } = executionResult
    
    if (!steps || steps.length === 0) return {}
    
    const executionTimes = steps.map((step: any) => step.executionTime || 0)
    const totalTime = executionTimes.reduce((sum, time) => sum + time, 0)
    const avgTime = totalTime / executionTimes.length
    
    return {
      totalExecutionTime: totalTime,
      averageStepTime: avgTime,
      fastestStep: Math.min(...executionTimes),
      slowestStep: Math.max(...executionTimes),
      timeDistribution: this.calculateTimeDistribution(executionTimes)
    }
  }

  /**
   * Calculate resource usage
   */
  private calculateResourceUsage(executionResult: any): any {
    const { steps } = executionResult
    
    if (!steps || steps.length === 0) return {}
    
    const memoryUsage = steps.map((step: any) => step.memoryUsage || 0)
    const cpuUsage = steps.map((step: any) => step.cpuUsage || 0)
    
    return {
      peakMemoryUsage: Math.max(...memoryUsage),
      averageMemoryUsage: memoryUsage.reduce((sum, mem) => sum + mem, 0) / memoryUsage.length,
      peakCpuUsage: Math.max(...cpuUsage),
      averageCpuUsage: cpuUsage.reduce((sum, cpu) => sum + cpu, 0) / cpuUsage.length
    }
  }

  /**
   * Analyze errors
   */
  private analyzeErrors(executionResult: any): any {
    const { steps } = executionResult
    
    if (!steps || steps.length === 0) return {}
    
    const errorSteps = steps.filter((step: any) => step.status === 'failed' || step.status === 'error')
    const errorTypes = errorSteps.map((step: any) => step.error?.type || 'unknown')
    
    const errorCounts: Record<string, number> = {}
    errorTypes.forEach(type => {
      errorCounts[type] = (errorCounts[type] || 0) + 1
    })
    
    return {
      totalErrors: errorSteps.length,
      errorRate: (errorSteps.length / steps.length) * 100,
      errorTypes: errorCounts,
      mostCommonError: Object.entries(errorCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    }
  }

  /**
   * Identify success patterns
   */
  private identifySuccessPatterns(executionResult: any): any {
    const { steps } = executionResult
    
    if (!steps || steps.length === 0) return {}
    
    const successfulSteps = steps.filter((step: any) => step.status === 'completed')
    const successFactors = successfulSteps.map((step: any) => ({
      agentType: step.agentType,
      executionTime: step.executionTime,
      resourceUsage: step.memoryUsage || 0
    }))
    
    return {
      totalSuccessful: successfulSteps.length,
      successRate: (successfulSteps.length / steps.length) * 100,
      averageSuccessTime: successfulSteps.reduce((sum, step) => sum + (step.executionTime || 0), 0) / successfulSteps.length,
      successFactors
    }
  }

  /**
   * Analyze trends between iterations
   */
  private analyzeTrends(previousResult: any, currentExecution: any): any[] {
    const trends = []
    
    if (previousResult && previousResult.executionResult) {
      const previousSteps = previousResult.executionResult.steps || []
      const currentSteps = currentExecution.steps || []
      
      // Execution time trend
      const previousTime = previousResult.executionTime
      const currentTime = currentExecution.executionTime
      const timeChange = currentTime - previousTime
      
      if (timeChange < 0) {
        trends.push({
          type: 'performance-improvement',
          description: `Execution time improved by ${Math.abs(timeChange)}ms`,
          metric: 'execution-time',
          change: timeChange,
          recommendation: 'Maintain current optimization strategies'
        })
      } else if (timeChange > 0) {
        trends.push({
          type: 'performance-decline',
          description: `Execution time increased by ${timeChange}ms`,
          metric: 'execution-time',
          change: timeChange,
          recommendation: 'Investigate performance regression'
        })
      }
      
      // Success rate trend
      const previousSuccess = previousResult.metrics?.successRate || 0
      const currentSuccess = currentExecution.metrics?.successRate || 0
      const successChange = currentSuccess - previousSuccess
      
      if (successChange > 0) {
        trends.push({
          type: 'success-improvement',
          description: `Success rate improved by +${successChange.toFixed(1)}%`,
          metric: 'success-rate',
          change: successChange,
          recommendation: 'Continue current improvement strategies'
        })
      } else if (successChange < 0) {
        trends.push({
          type: 'success-decline',
          description: `Success rate declined by ${Math.abs(successChange).toFixed(1)}%`,
          metric: 'success-rate',
          change: successChange,
          recommendation: 'Investigate success rate decline'
        })
      }
    }
    
    return trends
  }

  /**
   * Generate advanced recommendations
   */
  private generateAdvancedRecommendations(executionResult: any, workflow: any): any[] {
    const recommendations = []
    
    // Performance-based recommendations
    const performanceMetrics = executionResult.monitoring?.performanceMetrics
    if (performanceMetrics) {
      if (performanceMetrics.averageStepTime > 5000) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          description: 'High average step execution time',
          action: 'Optimize slow steps and consider parallel execution',
          impact: 'Faster pipeline execution'
        })
      }
      
      if (performanceMetrics.slowestStep > 10000) {
        recommendations.push({
          type: 'performance',
          priority: 'critical',
          description: 'Very slow step detected',
          action: 'Investigate and optimize the slowest step',
          impact: 'Significant performance improvement'
        })
      }
    }
    
    // Resource-based recommendations
    const resourceUsage = executionResult.monitoring?.resourceUsage
    if (resourceUsage) {
      if (resourceUsage.peakMemoryUsage > 1000) {
        recommendations.push({
          type: 'resource',
          priority: 'medium',
          description: 'High memory usage detected',
          action: 'Optimize memory usage and implement cleanup',
          impact: 'Better resource utilization'
        })
      }
      
      if (resourceUsage.peakCpuUsage > 80) {
        recommendations.push({
          type: 'resource',
          priority: 'medium',
          description: 'High CPU usage detected',
          action: 'Consider load balancing and resource scaling',
          impact: 'Better performance under load'
        })
      }
    }
    
    // Quality-based recommendations
    const errorAnalysis = executionResult.monitoring?.errorAnalysis
    if (errorAnalysis && errorAnalysis.errorRate > 10) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        description: 'High error rate detected',
        action: 'Investigate error patterns and implement fixes',
        impact: 'Higher pipeline reliability'
      })
    }
    
    return recommendations
  }

  /**
   * Assess execution risks
   */
  private assessExecutionRisks(executionResult: any): any {
    const risks = []
    
    // Performance risks
    const performanceMetrics = executionResult.monitoring?.performanceMetrics
    if (performanceMetrics && performanceMetrics.totalExecutionTime > 300000) {
      risks.push({
        type: 'performance',
        severity: 'medium',
        description: 'Pipeline execution time exceeds 5 minutes',
        impact: 'May impact CI/CD pipeline efficiency',
        mitigation: 'Optimize slow steps and consider parallel execution'
      })
    }
    
    // Resource risks
    const resourceUsage = executionResult.monitoring?.resourceUsage
    if (resourceUsage && resourceUsage.peakMemoryUsage > 2000) {
      risks.push({
        type: 'resource',
        severity: 'high',
        description: 'Very high memory usage detected',
        impact: 'May cause pipeline failures on resource-constrained systems',
        mitigation: 'Implement memory optimization and cleanup'
      })
    }
    
    // Reliability risks
    const errorAnalysis = executionResult.monitoring?.errorAnalysis
    if (errorAnalysis && errorAnalysis.errorRate > 20) {
      risks.push({
        type: 'reliability',
        severity: 'critical',
        description: 'Very high error rate detected',
        impact: 'Pipeline may be unreliable for production use',
        mitigation: 'Immediate investigation and fixes required'
      })
    }
    
    return {
      totalRisks: risks.length,
      risks,
      overallRisk: this.calculateOverallRisk(risks)
    }
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRisk(risks: any[]): string {
    if (risks.some(r => r.severity === 'critical')) return 'critical'
    if (risks.some(r => r.severity === 'high')) return 'high'
    if (risks.some(r => r.severity === 'medium')) return 'medium'
    return 'low'
  }

  /**
   * Generate additional artifacts
   */
  private generateAdditionalArtifacts(executionResult: any, workflow: any): any[] {
    const artifacts = []
    
    // Generate performance report
    artifacts.push({
      id: `performance-report-${Date.now()}`,
      name: 'Performance Analysis Report',
      type: 'performance',
      content: executionResult.monitoring?.performanceMetrics,
      format: 'json',
      timestamp: new Date().toISOString()
    })
    
    // Generate resource usage report
    artifacts.push({
      id: `resource-report-${Date.now()}`,
      name: 'Resource Usage Report',
      type: 'resource',
      content: executionResult.monitoring?.resourceUsage,
      format: 'json',
      timestamp: new Date().toISOString()
    })
    
    // Generate trend analysis report
    artifacts.push({
      id: `trend-report-${Date.now()}`,
      name: 'Trend Analysis Report',
      type: 'trend',
      content: executionResult.reporting?.trendAnalysis,
      format: 'json',
      timestamp: new Date().toISOString()
    })
    
    return artifacts
  }

  /**
   * Calculate metrics for an iteration
   */
  private calculateIterationMetrics(executionResult: any, iterationNumber: number): any {
    const { steps } = executionResult
    
    if (!steps || steps.length === 0) return {}
    
    const totalSteps = steps.length
    const completedSteps = steps.filter((step: any) => step.status === 'completed').length
    const failedSteps = steps.filter((step: any) => step.status === 'failed' || step.status === 'error').length
    const skippedSteps = steps.filter((step: any) => step.status === 'skipped').length
    
    // Calculate improvement score
    let improvementScore = 0
    
    // Base score from completion rate
    improvementScore += (completedSteps / totalSteps) * 60
    
    // Bonus for low failure rate
    if (failedSteps === 0) improvementScore += 20
    
    // Bonus for comprehensive execution
    if (totalSteps > 5) improvementScore += 10
    
    // Bonus for second iteration
    if (iterationNumber === 2) improvementScore += 10
    
    return {
      totalSteps,
      completedSteps,
      failedSteps,
      skippedSteps,
      successRate: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      failureRate: totalSteps > 0 ? (failedSteps / totalSteps) * 100 : 0,
      improvementScore: Math.min(improvementScore, 100)
    }
  }

  /**
   * Show improvement summary between iterations
   */
  private showImprovementSummary(iteration1: any, iteration2: any): void {
    console.log('🎯 Verbetering Samenvatting')
    console.log('============================')
    
    const successImprovement = iteration2.metrics.successRate - iteration1.metrics.successRate
    const scoreImprovement = iteration2.metrics.improvementScore - iteration1.metrics.improvementScore
    
    console.log(`📊 Success Rate: ${iteration1.metrics.successRate.toFixed(1)}% → ${iteration2.metrics.successRate.toFixed(1)}% (+${successImprovement.toFixed(1)}%)`)
    console.log(`📈 Improvement Score: ${iteration1.metrics.improvementScore} → ${iteration2.metrics.improvementScore} (+${scoreImprovement} punten)`)
    console.log(`⚡ Uitvoeringstijd: ${iteration1.executionTime}ms → ${iteration2.executionTime}ms`)
    
    if (scoreImprovement > 0) {
      console.log(`✅ Verbetering: ${((scoreImprovement / iteration1.metrics.improvementScore) * 100).toFixed(1)}%`)
    } else {
      console.log(`⚠️ Geen verbetering in iteratie 2`)
    }
    
    console.log('')
  }

  /**
   * Generate final report with iteration data
   */
  private generateFinalReport(finalResult: any): any {
    const report = {
      ...finalResult,
      iterationHistory: this.iterationResults,
      improvementSummary: {
        successRateIncrease: finalResult.metrics.successRate - this.iterationResults[0].metrics.successRate,
        scoreIncrease: finalResult.metrics.improvementScore - this.iterationResults[0].metrics.improvementScore,
        totalIterations: this.iterationResults.length
      }
    }

    return report
  }

  /**
   * Load configuration from file
   */
  private async loadConfiguration(configPath: string): Promise<void> {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8')
      this.config = JSON.parse(configContent)
      console.log(`📁 Configuration loaded from: ${configPath}`)
    } catch (error) {
      console.error(`Error loading configuration from ${configPath}:`, error)
      throw error
    }
  }

  /**
   * Create default configuration
   */
  private createDefaultConfiguration(): PipelineConfig {
    return {
      id: 'default-pipeline',
      name: 'Default AI Testing Pipeline',
      description: 'Default configuration for AI testing pipeline',
      version: '1.0.0',
      agents: [],
      workflows: [],
      settings: {
        maxConcurrentWorkflows: 2,
        defaultTimeout: 300000,
        enableLogging: true,
        enableMetrics: true,
        enableNotifications: false,
        qualityGates: [],
        notifications: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfiguration(configPath: string): Promise<void> {
    try {
      const configDir = path.dirname(configPath)
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true })
      }
      
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2))
      console.log(`💾 Configuration saved to: ${configPath}`)
    } catch (error) {
      console.error(`Error saving configuration to ${configPath}:`, error)
      throw error
    }
  }

  /**
   * Register agents
   */
  private async registerAgents(): Promise<void> {
    for (const agentConfig of this.config.agents) {
      await this.agentManager.registerAgent(agentConfig)
    }
    console.log(`🤖 Registered ${this.config.agents.length} agents`)
  }

  /**
   * Initialize workflows
   */
  private async initializeWorkflows(): Promise<void> {
    // Workflows are initialized when needed
    console.log(`🔄 Initialized ${this.config.workflows.length} workflows`)
  }

  /**
   * Get current status
   */
  getStatus(): PipelineStatus {
    return {
      status: 'running',
      activeWorkflows: this.workflowEngine.getActiveExecutions().length,
      registeredAgents: this.agentManager.getAllAgents().length,
      totalIterations: this.iterationResults.length,
      lastExecution: this.iterationResults.length > 0 ? this.iterationResults[this.iterationResults.length - 1].timestamp : null
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): any {
    return {
      totalIterations: this.iterationResults.length,
      averageExecutionTime: this.iterationResults.length > 0 
        ? this.iterationResults.reduce((sum, r) => sum + r.executionTime, 0) / this.iterationResults.length 
        : 0,
      successRate: this.iterationResults.length > 0 
        ? this.iterationResults.reduce((sum, r) => sum + r.metrics.successRate, 0) / this.iterationResults.length 
        : 0,
      improvementTrend: this.iterationResults.length > 1 
        ? this.iterationResults[this.iterationResults.length - 1].metrics.improvementScore - this.iterationResults[0].metrics.improvementScore 
        : 0
    }
  }

  /**
   * Get workflows
   */
  getWorkflows(): any[] {
    return this.config.workflows
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): any {
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
  async cancelExecution(executionId: string): Promise<boolean> {
    return await this.workflowEngine.cancelExecution(executionId)
  }

  /**
   * Get agents
   */
  getAgents(): any[] {
    return this.agentManager.getAllAgents()
  }

  /**
   * Get agent health
   */
  getAgentHealth(): any[] {
    return this.agentManager.getAllAgentHealth()
  }

  /**
   * Restart health checks
   */
  async restartHealthChecks(): Promise<void> {
    await this.agentManager.restartHealthChecks()
  }

  /**
   * Update configuration
   */
  async updateConfiguration(updates: Partial<PipelineConfig>): Promise<void> {
    this.config = { ...this.config, ...updates, updatedAt: new Date().toISOString() }
    console.log('🔧 Configuration updated')
  }

  /**
   * Shutdown orchestrator
   */
  async shutdown(): Promise<void> {
    await this.agentManager.cleanup()
    console.log('🛑 Pipeline Orchestrator Agent shutdown complete')
  }

  /**
   * Get runtime information
   */
  getRuntimeInfo(): any {
    return {
      version: this.config.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }
}