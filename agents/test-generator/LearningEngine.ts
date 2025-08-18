import { TestResult, TestScenario, CodeAnalysis } from './types'
import * as fs from 'fs'
import * as path from 'path'

export interface LearningData {
  testHistory: TestExecutionRecord[]
  failurePatterns: FailurePattern[]
  performanceMetrics: PerformanceMetric[]
  coverageData: CoverageRecord[]
  adaptationLog: AdaptationRecord[]
}

export interface TestExecutionRecord {
  id: string
  scenarioId: string
  timestamp: string
  status: 'passed' | 'failed' | 'error' | 'skipped'
  executionTime: number
  resourceUsage: ResourceUsage
  codeChanges: CodeChange[]
  failureReason?: string
  retryCount: number
}

export interface FailurePattern {
  id: string
  pattern: string
  frequency: number
  affectedScenarios: string[]
  rootCause: string
  confidence: number
  lastSeen: string
  suggestedFix?: string
}

export interface PerformanceMetric {
  scenarioId: string
  averageExecutionTime: number
  resourceUsage: ResourceUsage
  trend: 'improving' | 'stable' | 'declining'
  optimizationOpportunities: string[]
}

export interface CoverageRecord {
  codePath: string
  testCount: number
  lastTested: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  coverageGaps: string[]
}

export interface AdaptationRecord {
  timestamp: string
  changeType: 'strategy' | 'priority' | 'resource' | 'retry'
  oldValue: any
  newValue: any
  reason: string
  impact: 'positive' | 'negative' | 'neutral'
}

export interface ResourceUsage {
  cpu: number
  memory: number
  disk: number
  network: number
}

export interface CodeChange {
  file: string
  type: 'added' | 'modified' | 'deleted'
  impact: 'low' | 'medium' | 'high' | 'critical'
  affectedTests: string[]
}

export class LearningEngine {
  private learningData: LearningData
  private dataPath: string
  private models: Map<string, any> = new Map()

  constructor(dataPath: string = './learning-data') {
    this.dataPath = dataPath
    this.learningData = this.loadLearningData()
    this.initializeModels()
  }

  /**
   * Learn from test execution results
   */
  async learnFromExecution(
    scenarios: TestScenario[],
    results: TestResult[],
    codeAnalysis: CodeAnalysis
  ): Promise<void> {
    console.log('🧠 Learning from test execution...')
    
    // Record test execution data
    const executionRecords = this.createExecutionRecords(scenarios, results, codeAnalysis)
    this.learningData.testHistory.push(...executionRecords)
    
    // Analyze patterns
    await this.analyzeFailurePatterns(results)
    await this.analyzePerformanceMetrics(results)
    await this.analyzeCoverageGaps(scenarios, results, codeAnalysis)
    
    // Update learning models
    await this.updateModels()
    
    // Save learning data
    this.saveLearningData()
    
    console.log('✅ Learning completed')
  }

  /**
   * Get intelligent recommendations for test execution
   */
  async getIntelligentRecommendations(
    scenarios: TestScenario[],
    availableResources: ResourceUsage
  ): Promise<IntelligentRecommendations> {
    const recommendations: IntelligentRecommendations = {
      prioritizedScenarios: [],
      executionStrategy: 'sequential',
      resourceAllocation: {},
      retryStrategy: {},
      riskAssessment: {}
    }

    // Prioritize scenarios based on learning
    recommendations.prioritizedScenarios = this.prioritizeScenarios(scenarios)
    
    // Determine execution strategy
    recommendations.executionStrategy = this.determineExecutionStrategy(scenarios, availableResources)
    
    // Optimize resource allocation
    recommendations.resourceAllocation = this.optimizeResourceAllocation(scenarios, availableResources)
    
    // Set retry strategies
    recommendations.retryStrategy = this.optimizeRetryStrategies(scenarios)
    
    // Assess risks
    recommendations.riskAssessment = this.assessRisks(scenarios)

    return recommendations
  }

  /**
   * Predict test outcomes based on historical data
   */
  async predictTestOutcomes(scenarios: TestScenario[]): Promise<TestPrediction[]> {
    const predictions: TestPrediction[] = []
    
    for (const scenario of scenarios) {
      const prediction = await this.predictSingleTest(scenario)
      predictions.push(prediction)
    }
    
    return predictions
  }

  /**
   * Adapt agent behavior based on learning
   */
  async adaptAgentBehavior(): Promise<AdaptationRecord[]> {
    const adaptations: AdaptationRecord[] = []
    
    // Adapt test generation strategy
    const strategyAdaptation = this.adaptTestGenerationStrategy()
    if (strategyAdaptation) adaptations.push(strategyAdaptation)
    
    // Adapt priority calculation
    const priorityAdaptation = this.adaptPriorityCalculation()
    if (priorityAdaptation) adaptations.push(priorityAdaptation)
    
    // Adapt resource allocation
    const resourceAdaptation = this.adaptResourceAllocation()
    if (resourceAdaptation) adaptations.push(resourceAdaptation)
    
    // Log adaptations
    this.learningData.adaptationLog.push(...adaptations)
    
    return adaptations
  }

  /**
   * Get learning insights and statistics
   */
  getLearningInsights(): LearningInsights {
    const totalTests = this.learningData.testHistory.length
    const passedTests = this.learningData.testHistory.filter(t => t.status === 'passed').length
    const failedTests = this.learningData.testHistory.filter(t => t.status === 'failed').length
    
    const insights: LearningInsights = {
      totalTestsExecuted: totalTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      failureRate: totalTests > 0 ? (failedTests / totalTests) * 100 : 0,
      averageExecutionTime: this.calculateAverageExecutionTime(),
      failurePatterns: this.learningData.failurePatterns.length,
      coverageGaps: this.learningData.coverageData.filter(c => c.coverageGaps.length > 0).length,
      recentAdaptations: this.learningData.adaptationLog.slice(-5),
      optimizationOpportunities: this.identifyOptimizationOpportunities()
    }
    
    return insights
  }

  // Private methods for internal learning logic
  
  private createExecutionRecords(
    scenarios: TestScenario[],
    results: TestResult[],
    codeAnalysis: CodeAnalysis
  ): TestExecutionRecord[] {
    const records: TestExecutionRecord[] = []
    
    for (const result of results) {
      const scenario = scenarios.find(s => s.id === result.scenarioId)
      if (!scenario) continue
      
      const record: TestExecutionRecord = {
        id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scenarioId: result.scenarioId,
        timestamp: result.timestamp,
        status: result.status,
        executionTime: result.executionTime,
        resourceUsage: this.estimateResourceUsage(scenario, result),
        codeChanges: this.detectCodeChanges(codeAnalysis),
        failureReason: result.error,
        retryCount: 0
      }
      
      records.push(record)
    }
    
    return records
  }

  private async analyzeFailurePatterns(results: TestResult[]): Promise<void> {
    const failedResults = results.filter(r => r.status === 'failed' || r.status === 'error')
    
    for (const result of failedResults) {
      const pattern = this.extractFailurePattern(result)
      const existingPattern = this.learningData.failurePatterns.find(p => p.pattern === pattern)
      
      if (existingPattern) {
        existingPattern.frequency++
        existingPattern.lastSeen = result.timestamp
        existingPattern.affectedScenarios.push(result.scenarioId)
      } else {
        this.learningData.failurePatterns.push({
          id: `pattern-${Date.now()}`,
          pattern,
          frequency: 1,
          affectedScenarios: [result.scenarioId],
          rootCause: this.analyzeRootCause(result),
          confidence: 0.5,
          lastSeen: result.timestamp
        })
      }
    }
  }

  private async analyzePerformanceMetrics(results: TestResult[]): Promise<void> {
    for (const result of results) {
      const existingMetric = this.learningData.performanceMetrics.find(m => m.scenarioId === result.scenarioId)
      
      if (existingMetric) {
        // Update existing metric
        const newAverage = (existingMetric.averageExecutionTime + result.executionTime) / 2
        existingMetric.averageExecutionTime = newAverage
        existingMetric.trend = this.calculateTrend(existingMetric.averageExecutionTime, result.executionTime)
      } else {
        // Create new metric
        this.learningData.performanceMetrics.push({
          scenarioId: result.scenarioId,
          averageExecutionTime: result.executionTime,
          resourceUsage: this.estimateResourceUsage({} as TestScenario, result),
          trend: 'stable',
          optimizationOpportunities: []
        })
      }
    }
  }

  private async analyzeCoverageGaps(
    scenarios: TestScenario[],
    results: TestResult[],
    codeAnalysis: CodeAnalysis
  ): Promise<void> {
    // Analyze which code paths are not covered by tests
    const coveredPaths = new Set<string>()
    
    for (const scenario of scenarios) {
      // Extract code paths from scenario
      const paths = this.extractCodePaths(scenario)
      paths.forEach(path => coveredPaths.add(path))
    }
    
    // Identify gaps
    const allPaths = this.extractAllCodePaths(codeAnalysis)
    const uncoveredPaths = allPaths.filter(path => !coveredPaths.has(path))
    
    if (uncoveredPaths.length > 0) {
      this.learningData.coverageData.push({
        codePath: 'uncovered-paths',
        testCount: 0,
        lastTested: new Date().toISOString(),
        riskLevel: 'high',
        coverageGaps: uncoveredPaths
      })
    }
  }

  private prioritizeScenarios(scenarios: TestScenario[]): TestScenario[] {
    return scenarios.sort((a, b) => {
      const scoreA = this.calculateScenarioScore(a)
      const scoreB = this.calculateScenarioScore(b)
      return scoreB - scoreA
    })
  }

  private calculateScenarioScore(scenario: TestScenario): number {
    let score = 0
    
    // Priority score
    const priorityScores = { low: 1, medium: 2, high: 3, critical: 4 }
    score += priorityScores[scenario.priority] * 10
    
    // Risk level score
    const riskScores = { low: 1, medium: 2, high: 3, critical: 4 }
    score += riskScores[scenario.riskLevel] * 8
    
    // Historical failure rate
    const failureRate = this.getHistoricalFailureRate(scenario.id)
    score += failureRate * 5
    
    // Coverage gap score
    if (this.isCoverageGap(scenario)) {
      score += 15
    }
    
    return score
  }

  private determineExecutionStrategy(
    scenarios: TestScenario[],
    availableResources: ResourceUsage
  ): 'sequential' | 'parallel' | 'hybrid' {
    const totalScenarios = scenarios.length
    const availableCores = availableResources.cpu
    
    if (totalScenarios <= 2) return 'sequential'
    if (availableCores >= 4 && totalScenarios >= 8) return 'parallel'
    return 'hybrid'
  }

  private optimizeResourceAllocation(
    scenarios: TestScenario[],
    availableResources: ResourceUsage
  ): Record<string, ResourceUsage> {
    const allocation: Record<string, ResourceUsage> = {}
    
    // Simple resource allocation based on scenario priority
    for (const scenario of scenarios) {
      const priority = scenario.priority
      const baseCPU = priority === 'critical' ? 2 : priority === 'high' ? 1.5 : 1
      const baseMemory = priority === 'critical' ? 512 : priority === 'high' ? 256 : 128
      
      allocation[scenario.id] = {
        cpu: Math.min(baseCPU, availableResources.cpu / scenarios.length),
        memory: Math.min(baseMemory, availableResources.memory / scenarios.length),
        disk: 100,
        network: 50
      }
    }
    
    return allocation
  }

  private optimizeRetryStrategies(scenarios: TestScenario[]): Record<string, RetryStrategy> {
    const strategies: Record<string, RetryStrategy> = {}
    
    for (const scenario of scenarios) {
      const failureRate = this.getHistoricalFailureRate(scenario.id)
      
      strategies[scenario.id] = {
        maxRetries: failureRate > 0.3 ? 3 : failureRate > 0.1 ? 2 : 1,
        backoffMultiplier: failureRate > 0.2 ? 2 : 1.5,
        initialDelay: failureRate > 0.3 ? 1000 : 500
      }
    }
    
    return strategies
  }

  private assessRisks(scenarios: TestScenario[]): Record<string, RiskAssessment> {
    const assessments: Record<string, RiskAssessment> = {}
    
    for (const scenario of scenarios) {
      const failureRate = this.getHistoricalFailureRate(scenario.id)
      const executionTime = this.getAverageExecutionTime(scenario.id)
      
      assessments[scenario.id] = {
        failureProbability: failureRate,
        executionRisk: executionTime > 5000 ? 'high' : executionTime > 2000 ? 'medium' : 'low',
        businessImpact: scenario.priority === 'critical' ? 'high' : scenario.priority === 'high' ? 'medium' : 'low',
        mitigationStrategy: this.suggestMitigationStrategy(scenario, failureRate)
      }
    }
    
    return assessments
  }

  private async predictSingleTest(scenario: TestScenario): Promise<TestPrediction> {
    const failureRate = this.getHistoricalFailureRate(scenario.id)
    const avgExecutionTime = this.getAverageExecutionTime(scenario.id)
    
    return {
      scenarioId: scenario.id,
      predictedStatus: failureRate > 0.5 ? 'likely-fail' : 'likely-pass',
      confidence: Math.max(0.1, 1 - failureRate),
      estimatedExecutionTime: avgExecutionTime || 1000,
      riskFactors: this.identifyRiskFactors(scenario)
    }
  }

  // Helper methods
  
  private extractFailurePattern(result: TestResult): string {
    if (!result.error) return 'unknown'
    
    // Simple pattern extraction - can be enhanced with NLP
    const error = result.error.toLowerCase()
    if (error.includes('timeout')) return 'timeout'
    if (error.includes('assertion')) return 'assertion-failure'
    if (error.includes('network')) return 'network-error'
    if (error.includes('resource')) return 'resource-error'
    return 'other'
  }

  private analyzeRootCause(result: TestResult): string {
    // Simple root cause analysis - can be enhanced
    if (result.error?.includes('timeout')) return 'Performance issue or resource constraint'
    if (result.error?.includes('assertion')) return 'Logic error or data mismatch'
    if (result.error?.includes('network')) return 'External dependency issue'
    return 'Unknown root cause'
  }

  private calculateTrend(oldValue: number, newValue: number): 'improving' | 'stable' | 'declining' {
    const change = ((newValue - oldValue) / oldValue) * 100
    if (change < -10) return 'improving'
    if (change > 10) return 'declining'
    return 'stable'
  }

  private getHistoricalFailureRate(scenarioId: string): number {
    const executions = this.learningData.testHistory.filter(h => h.scenarioId === scenarioId)
    if (executions.length === 0) return 0
    
    const failures = executions.filter(h => h.status === 'failed' || h.status === 'error').length
    return failures / executions.length
  }

  private getAverageExecutionTime(scenarioId: string): number {
    const executions = this.learningData.testHistory.filter(h => h.scenarioId === scenarioId)
    if (executions.length === 0) return 0
    
    const totalTime = executions.reduce((sum, h) => sum + h.executionTime, 0)
    return totalTime / executions.length
  }

  private isCoverageGap(scenario: TestScenario): boolean {
    // Check if this scenario covers previously uncovered code paths
    return this.learningData.coverageData.some(c => c.coverageGaps.length > 0)
  }

  private extractCodePaths(scenario: TestScenario): string[] {
    // Extract code paths from scenario - simplified
    return [`scenario-${scenario.id}`]
  }

  private extractAllCodePaths(codeAnalysis: CodeAnalysis): string[] {
    // Extract all code paths from analysis - simplified
    return [codeAnalysis.filePath]
  }

  private estimateResourceUsage(scenario: TestScenario, result: TestResult): ResourceUsage {
    // Simple resource estimation - can be enhanced with real monitoring
    return {
      cpu: 1,
      memory: 128,
      disk: 50,
      network: 25
    }
  }

  private detectCodeChanges(codeAnalysis: CodeAnalysis): CodeChange[] {
    // Detect code changes - simplified
    return [{
      file: codeAnalysis.filePath,
      type: 'modified',
      impact: 'medium',
      affectedTests: []
    }]
  }

  private identifyRiskFactors(scenario: TestScenario): string[] {
    const factors: string[] = []
    
    if (scenario.priority === 'critical') factors.push('high-priority')
    if (scenario.riskLevel === 'high' || scenario.riskLevel === 'critical') factors.push('high-risk')
    if (scenario.category === 'security') factors.push('security-critical')
    
    return factors
  }

  private suggestMitigationStrategy(scenario: TestScenario, failureRate: number): string {
    if (failureRate > 0.5) return 'Implement comprehensive error handling and retry logic'
    if (scenario.priority === 'critical') return 'Add monitoring and alerting for early detection'
    if (scenario.category === 'security') return 'Implement security-focused testing and validation'
    return 'Standard testing approach sufficient'
  }

  private calculateAverageExecutionTime(): number {
    if (this.learningData.testHistory.length === 0) return 0
    
    const totalTime = this.learningData.testHistory.reduce((sum, h) => sum + h.executionTime, 0)
    return totalTime / this.learningData.testHistory.length
  }

  private identifyOptimizationOpportunities(): string[] {
    const opportunities: string[] = []
    
    // Check for performance issues
    const slowTests = this.learningData.performanceMetrics.filter(m => m.averageExecutionTime > 5000)
    if (slowTests.length > 0) {
      opportunities.push(`${slowTests.length} slow tests identified for optimization`)
    }
    
    // Check for coverage gaps
    const coverageGaps = this.learningData.coverageData.filter(c => c.coverageGaps.length > 0)
    if (coverageGaps.length > 0) {
      opportunities.push(`${coverageGaps.length} coverage gaps identified`)
    }
    
    // Check for failure patterns
    const failurePatterns = this.learningData.failurePatterns.filter(p => p.frequency > 3)
    if (failurePatterns.length > 0) {
      opportunities.push(`${failurePatterns.length} recurring failure patterns identified`)
    }
    
    return opportunities
  }

  private adaptTestGenerationStrategy(): AdaptationRecord | null {
    // Check if we need to adapt test generation strategy
    const recentFailures = this.learningData.testHistory
      .filter(h => h.status === 'failed' && 
        new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    
    if (recentFailures.length > 5) {
      return {
        timestamp: new Date().toISOString(),
        changeType: 'strategy',
        oldValue: 'standard',
        newValue: 'aggressive',
        reason: 'High failure rate detected, switching to aggressive testing',
        impact: 'positive'
      }
    }
    
    return null
  }

  private adaptPriorityCalculation(): AdaptationRecord | null {
    // Check if we need to adapt priority calculation
    const criticalFailures = this.learningData.testHistory
      .filter(h => h.status === 'failed' && 
        new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    
    if (criticalFailures.length > 3) {
      return {
        timestamp: new Date().toISOString(),
        changeType: 'priority',
        oldValue: 'standard-priority',
        newValue: 'risk-focused-priority',
        reason: 'Critical failures detected, prioritizing risk-based testing',
        impact: 'positive'
      }
    }
    
    return null
  }

  private adaptResourceAllocation(): AdaptationRecord | null {
    // Check if we need to adapt resource allocation
    const slowTests = this.learningData.performanceMetrics.filter(m => m.trend === 'declining')
    
    if (slowTests.length > 2) {
      return {
        timestamp: new Date().toISOString(),
        changeType: 'resource',
        oldValue: 'balanced',
        newValue: 'performance-focused',
        reason: 'Performance degradation detected, allocating more resources to slow tests',
        impact: 'positive'
      }
    }
    
    return null
  }

  private async updateModels(): Promise<void> {
    // Update machine learning models based on new data
    // This is a placeholder for actual ML model updates
    console.log('🔄 Updating learning models...')
  }

  private initializeModels(): void {
    // Initialize basic learning models
    console.log('🧠 Initializing learning models...')
  }

  private loadLearningData(): LearningData {
    const dataFile = path.join(this.dataPath, 'learning-data.json')
    
    try {
      if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf-8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('Could not load existing learning data, starting fresh')
    }
    
    // Return default structure
    return {
      testHistory: [],
      failurePatterns: [],
      performanceMetrics: [],
      coverageData: [],
      adaptationLog: []
    }
  }

  private saveLearningData(): void {
    try {
      if (!fs.existsSync(this.dataPath)) {
        fs.mkdirSync(this.dataPath, { recursive: true })
      }
      
      const dataFile = path.join(this.dataPath, 'learning-data.json')
      fs.writeFileSync(dataFile, JSON.stringify(this.learningData, null, 2))
    } catch (error) {
      console.error('Failed to save learning data:', error)
    }
  }
}

// Additional interfaces for the learning system

export interface IntelligentRecommendations {
  prioritizedScenarios: TestScenario[]
  executionStrategy: 'sequential' | 'parallel' | 'hybrid'
  resourceAllocation: Record<string, ResourceUsage>
  retryStrategy: Record<string, RetryStrategy>
  riskAssessment: Record<string, RiskAssessment>
}

export interface RetryStrategy {
  maxRetries: number
  backoffMultiplier: number
  initialDelay: number
}

export interface RiskAssessment {
  failureProbability: number
  executionRisk: 'low' | 'medium' | 'high'
  businessImpact: 'low' | 'medium' | 'high'
  mitigationStrategy: string
}

export interface TestPrediction {
  scenarioId: string
  predictedStatus: 'likely-pass' | 'likely-fail' | 'uncertain'
  confidence: number
  estimatedExecutionTime: number
  riskFactors: string[]
}

export interface LearningInsights {
  totalTestsExecuted: number
  successRate: number
  failureRate: number
  averageExecutionTime: number
  failurePatterns: number
  coverageGaps: number
  recentAdaptations: AdaptationRecord[]
  optimizationOpportunities: string[]
}