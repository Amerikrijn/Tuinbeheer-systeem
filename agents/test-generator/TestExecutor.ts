import { TestScenario, TestResult } from './types'

export class TestExecutor {
  constructor() {}

  /**
   * Execute tests for given scenarios
   */
  async executeTests(scenarios: TestScenario[], featurePath: string): Promise<TestResult[]> {
    const results: TestResult[] = []
    
    console.log(`🧪 Executing ${scenarios.length} test scenarios...`)
    
    for (const scenario of scenarios) {
      try {
        const result = await this.executeSingleTest(scenario, featurePath)
        results.push(result)
        
        // Log progress
        const status = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'
        console.log(`${status} ${scenario.name}: ${result.status}`)
        
      } catch (error) {
        console.error(`❌ Error executing test ${scenario.name}:`, error)
        
        // Create error result
        results.push({
          id: `error-${Date.now()}`,
          scenarioId: scenario.id,
          status: 'error',
          executionTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          details: {
            scenario: scenario.name,
            category: scenario.category,
            priority: scenario.priority
          }
        })
      }
    }
    
    console.log(`\n📊 Test execution completed: ${results.length} results`)
    return results
  }

  /**
   * Execute a single test scenario
   */
  private async executeSingleTest(scenario: TestScenario, featurePath: string): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      // Simulate test execution based on scenario type
      const result = await this.simulateTestExecution(scenario, featurePath)
      
      const executionTime = Date.now() - startTime
      
      return {
        id: `result-${Date.now()}`,
        scenarioId: scenario.id,
        status: result.status,
        executionTime,
        output: result.output,
        error: result.error,
        timestamp: new Date().toISOString(),
        details: {
          scenario: scenario.name,
          category: scenario.category,
          priority: scenario.priority,
          riskLevel: scenario.riskLevel,
          tags: scenario.tags
        }
      }
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      return {
        id: `error-${Date.now()}`,
        scenarioId: scenario.id,
        status: 'error',
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: {
          scenario: scenario.name,
          category: scenario.category,
          priority: scenario.priority
        }
      }
    }
  }

  /**
   * Simulate test execution based on scenario type
   */
  private async simulateTestExecution(scenario: TestScenario, featurePath: string): Promise<any> {
    // Simulate different execution times based on scenario type
    const baseDelay = this.getBaseDelay(scenario.category)
    const randomDelay = Math.random() * 100
    
    await this.delay(baseDelay + randomDelay)
    
    // Simulate different success rates based on scenario type and priority
    const successRate = this.getSuccessRate(scenario.category, scenario.priority)
    const isSuccess = Math.random() < successRate
    
    if (isSuccess) {
      return {
        status: 'passed',
        output: scenario.expectedOutput,
        error: null
      }
    } else {
      // Simulate different failure types
      const failureType = this.getFailureType(scenario.category)
      
      return {
        status: 'failed',
        output: null,
        error: `Test failed: ${failureType}`
      }
    }
  }

  /**
   * Get base delay for different scenario types
   */
  private getBaseDelay(category: string): number {
    switch (category) {
      case 'functional':
        return 50
      case 'security':
        return 100
      case 'performance':
        return 200
      case 'edge-case':
        return 75
      default:
        return 50
    }
  }

  /**
   * Get success rate for different scenario types and priorities
   */
  private getSuccessRate(category: string, priority: string): number {
    let baseRate = 0.8 // 80% base success rate
    
    // Adjust based on category
    switch (category) {
      case 'functional':
        baseRate = 0.9
        break
      case 'security':
        baseRate = 0.7
        break
      case 'performance':
        baseRate = 0.8
        break
      case 'edge-case':
        baseRate = 0.6
        break
    }
    
    // Adjust based on priority
    switch (priority) {
      case 'critical':
        baseRate += 0.1 // Higher priority = higher success rate
        break
      case 'high':
        baseRate += 0.05
        break
      case 'medium':
        // No change
        break
      case 'low':
        baseRate -= 0.05
        break
    }
    
    return Math.min(Math.max(baseRate, 0.1), 0.95) // Clamp between 10% and 95%
  }

  /**
   * Get failure type for different scenario categories
   */
  private getFailureType(category: string): string {
    const failureTypes = {
      'functional': 'Functional requirement not met',
      'security': 'Security vulnerability detected',
      'performance': 'Performance threshold exceeded',
      'edge-case': 'Edge case not handled properly',
      'ui': 'UI element not found or not interactive'
    }
    
    return failureTypes[category as keyof typeof failureTypes] || 'Test validation failed'
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get execution summary
   */
  getExecutionSummary(results: TestResult[]): any {
    const total = results.length
    const passed = results.filter(r => r.status === 'passed').length
    const failed = results.filter(r => r.status === 'failed').length
    const errors = results.filter(r => r.status === 'error').length
    const skipped = results.filter(r => r.status === 'skipped').length
    
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0)
    const successRate = total > 0 ? (passed / total) * 100 : 0
    
    return {
      total,
      passed,
      failed,
      errors,
      skipped,
      executionTime: totalTime,
      successRate: Math.round(successRate)
    }
  }

  /**
   * Get results grouped by category
   */
  getResultsByCategory(results: TestResult[]): Record<string, any> {
    const categories: Record<string, any> = {}
    
    results.forEach(result => {
      const category = result.details?.category || 'unknown'
      
      if (!categories[category]) {
        categories[category] = {
          total: 0,
          passed: 0,
          failed: 0,
          errors: 0,
          executionTime: 0
        }
      }
      
      categories[category].total++
      categories[category][result.status]++
      categories[category].executionTime += result.executionTime
    })
    
    return categories
  }
}