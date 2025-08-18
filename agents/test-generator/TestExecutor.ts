import { TestScenario, TestResult } from './types'

export class TestExecutor {
  private scenarios: TestScenario[]
  private results: TestResult[] = []
  private maxInteractions: number
  private currentInteractionCount: number = 0

  constructor(scenarios: TestScenario[], maxInteractions: number = 500) {
    this.scenarios = scenarios
    this.maxInteractions = maxInteractions
  }

  async executeAllTests(): Promise<TestResult[]> {
    console.log(`🚀 Starting test execution for ${this.scenarios.length} scenarios...`)
    
    for (const scenario of this.scenarios) {
      if (this.currentInteractionCount >= this.maxInteractions) {
        console.log(`⚠️  Reached maximum interactions limit (${this.maxInteractions})`)
        break
      }

      try {
        const result = await this.executeTest(scenario)
        this.results.push(result)
        
        // Update interaction count
        this.currentInteractionCount += this.calculateInteractionCount(scenario)
        
        // Log progress
        console.log(`✅ Executed: ${scenario.name} - ${result.status}`)
        
        // Add delay to prevent overwhelming the system
        await this.delay(100)
        
      } catch (error) {
        console.error(`❌ Error executing test ${scenario.name}:`, error)
        this.results.push({
          scenarioId: scenario.id,
          status: 'error',
          executionTime: 0,
          output: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          metadata: { error: true }
        })
      }
    }

    console.log(`🎯 Test execution completed. ${this.results.length} tests executed.`)
    return this.results
  }

  private async executeTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      let output: any
      
      switch (scenario.category) {
        case 'functional':
          output = await this.executeFunctionalTest(scenario)
          break
        case 'security':
          output = await this.executeSecurityTest(scenario)
          break
        case 'ui':
          output = await this.executeUITest(scenario)
          break
        case 'edge-case':
          output = await this.executeEdgeCaseTest(scenario)
          break
        case 'performance':
          output = await this.executePerformanceTest(scenario)
          break
        default:
          output = await this.executeGenericTest(scenario)
      }

      const executionTime = Date.now() - startTime
      const status = this.validateTestResult(scenario, output) ? 'passed' : 'failed'

      return {
        scenarioId: scenario.id,
        status,
        executionTime,
        output,
        timestamp: new Date().toISOString(),
        metadata: {
          category: scenario.category,
          priority: scenario.priority,
          riskLevel: scenario.riskLevel
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        scenarioId: scenario.id,
        status: 'error',
        executionTime,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        metadata: {
          category: scenario.category,
          priority: scenario.priority,
          riskLevel: scenario.riskLevel,
          error: true
        }
      }
    }
  }

  private async executeFunctionalTest(scenario: TestScenario): Promise<any> {
    // Simulate functional test execution
    const { input } = scenario
    
    // Simulate different test scenarios based on input
    if (input.email && input.password) {
      if (input.email === 'test@example.com' && input.password === 'validPassword123') {
        return { success: true, redirect: '/', message: 'Login successful' }
      } else if (input.email === '' || input.password === '') {
        return { success: false, error: 'Fields are required', message: 'Validation failed' }
      } else {
        return { success: false, error: 'Invalid credentials', message: 'Authentication failed' }
      }
    }
    
    return { success: false, error: 'Invalid input', message: 'Test failed' }
  }

  private async executeSecurityTest(scenario: TestScenario): Promise<any> {
    // Simulate security test execution
    const { input } = scenario
    
    if (input.action === 'security-scan') {
      // Simulate security vulnerability scan
      const vulnerabilities = this.simulateSecurityScan()
      return {
        success: vulnerabilities.length === 0,
        vulnerabilities,
        scanCompleted: true,
        timestamp: new Date().toISOString()
      }
    }
    
    return { success: false, error: 'Invalid security test' }
  }

  private async executeUITest(scenario: TestScenario): Promise<any> {
    // Simulate UI test execution
    const { input } = scenario
    
    if (input.action === 'click') {
      return { success: true, action: 'executed', element: input.element, clicked: true }
    } else if (input.action === 'validate') {
      return { success: true, validation: 'passed', form: input.form, valid: true }
    } else if (input.action === 'resize') {
      return { success: true, responsive: true, dimensions: input.dimensions, tested: true }
    }
    
    return { success: false, error: 'Invalid UI test' }
  }

  private async executeEdgeCaseTest(scenario: TestScenario): Promise<any> {
    // Simulate edge case test execution
    return {
      success: true,
      edgeCase: 'handled',
      robustness: 'verified',
      message: 'Edge case handled correctly'
    }
  }

  private async executePerformanceTest(scenario: TestScenario): Promise<any> {
    // Simulate performance test execution
    const startTime = Date.now()
    await this.delay(Math.random() * 100) // Simulate work
    const executionTime = Date.now() - startTime
    
    return {
      success: true,
      performance: 'acceptable',
      executionTime,
      threshold: 'met'
    }
  }

  private async executeGenericTest(scenario: TestScenario): Promise<any> {
    // Generic test execution for unknown categories
    return {
      success: true,
      category: scenario.category,
      executed: true,
      message: 'Generic test executed successfully'
    }
  }

  private validateTestResult(scenario: TestScenario, output: any): boolean {
    // Validate test results based on validation rules
    for (const rule of scenario.validationRules) {
      if (!this.evaluateValidationRule(rule, output)) {
        return false
      }
    }
    return true
  }

  private evaluateValidationRule(rule: any, output: any): boolean {
    try {
      switch (rule.type) {
        case 'assertion':
          // Simple assertion evaluation
          return this.evaluateAssertion(rule.condition, output)
        case 'regex':
          // Regex pattern matching
          const regex = new RegExp(rule.condition)
          return regex.test(JSON.stringify(output))
        case 'custom':
          // Custom validation logic
          return this.evaluateCustomRule(rule.condition, output)
        default:
          return true
      }
    } catch (error) {
      console.error('Error evaluating validation rule:', error)
      return false
    }
  }

  private evaluateAssertion(condition: string, output: any): boolean {
    try {
      // Simple assertion evaluation
      if (condition.includes('response.status === expectedOutput.success')) {
        return output.success === true
      }
      if (condition.includes('ui.element.visible === true')) {
        return output.success === true
      }
      if (condition.includes('security.issues.length === 0')) {
        return output.vulnerabilities && output.vulnerabilities.length === 0
      }
      return true
    } catch (error) {
      console.error('Error evaluating assertion:', error)
      return false
    }
  }

  private evaluateCustomRule(condition: string, output: any): boolean {
    // Custom rule evaluation logic
    try {
      // This is a simplified implementation
      // In a real system, you might use a more sophisticated rule engine
      return true
    } catch (error) {
      console.error('Error evaluating custom rule:', error)
      return false
    }
  }

  private simulateSecurityScan(): any[] {
    // Simulate security vulnerability detection
    const vulnerabilities = []
    
    // Randomly generate some vulnerabilities for demonstration
    if (Math.random() > 0.7) {
      vulnerabilities.push({
        type: 'sql-injection',
        severity: 'medium',
        description: 'Potential SQL injection in login form',
        lineNumber: 45,
        recommendation: 'Use parameterized queries'
      })
    }
    
    if (Math.random() > 0.8) {
      vulnerabilities.push({
        type: 'xss',
        severity: 'low',
        description: 'Minor XSS vulnerability in error messages',
        lineNumber: 123,
        recommendation: 'Sanitize user input'
      })
    }
    
    return vulnerabilities
  }

  private calculateInteractionCount(scenario: TestScenario): number {
    // Calculate how many interactions this test scenario represents
    let count = 1 // Base interaction
    
    // Add interactions based on complexity
    if (scenario.category === 'security') {
      count += 2 // Security tests are more intensive
    }
    
    if (scenario.riskLevel === 'critical' || scenario.riskLevel === 'high') {
      count += 1 // High-risk tests get more attention
    }
    
    // Add interactions based on input complexity
    if (scenario.input && Object.keys(scenario.input).length > 2) {
      count += 1
    }
    
    return count
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getResults(): TestResult[] {
    return this.results
  }

  getExecutionSummary(): {
    total: number
    passed: number
    failed: number
    errors: number
    skipped: number
    executionTime: number
  } {
    const total = this.results.length
    const passed = this.results.filter(r => r.status === 'passed').length
    const failed = this.results.filter(r => r.status === 'failed').length
    const errors = this.results.filter(r => r.status === 'error').length
    const skipped = this.results.filter(r => r.status === 'skipped').length
    const executionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0)

    return {
      total,
      passed,
      failed,
      errors,
      skipped,
      executionTime
    }
  }

  getResultsByCategory(): Record<string, TestResult[]> {
    const resultsByCategory: Record<string, TestResult[]> = {}
    
    this.results.forEach(result => {
      const category = result.metadata?.category || 'unknown'
      if (!resultsByCategory[category]) {
        resultsByCategory[category] = []
      }
      resultsByCategory[category].push(result)
    })
    
    return resultsByCategory
  }

  getResultsByPriority(): Record<string, TestResult[]> {
    const resultsByPriority: Record<string, TestResult[]> = {}
    
    this.results.forEach(result => {
      const priority = result.metadata?.priority || 'unknown'
      if (!resultsByPriority[priority]) {
        resultsByPriority[priority] = []
      }
      resultsByPriority[priority].push(result)
    })
    
    return resultsByPriority
  }
}