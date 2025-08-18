import { CodeAnalyzer } from './CodeAnalyzer'
import { TestExecutor } from './TestExecutor'
import { ReportGenerator } from './ReportGenerator'
import { TestGenerationOptions, TestScenario, TestResult } from './types'

export class TestGeneratorAgent {
  private options: TestGenerationOptions
  private codeAnalyzer: CodeAnalyzer
  private testExecutor!: TestExecutor
  private reportGenerator: ReportGenerator

  constructor(options: TestGenerationOptions) {
    this.options = options
    this.codeAnalyzer = new CodeAnalyzer(options.featurePath)
    this.reportGenerator = new ReportGenerator([], [], options.outputPath)
  }

  async run(): Promise<{
    scenarios: TestScenario[]
    results: TestResult[]
    summary: any
    coverage: any
  }> {
    console.log('🤖 AI-Powered Test Generator Agent Starting...')
    console.log(`📁 Analyzing feature: ${this.options.featurePath}`)
    console.log(`🎯 Strategy: ${this.options.strategy}`)
    console.log(`🔢 Max interactions: ${this.options.maxInteractions}`)
    console.log(`📤 Output path: ${this.options.outputPath}`)
    
    try {
      // Step 1: Analyze the codebase
      console.log('\n🔍 Step 1: Analyzing codebase...')
      const analyses = await this.codeAnalyzer.analyzeCodebase()
      console.log(`✅ Code analysis completed. Analyzed ${analyses.length} files.`)
      
      // Step 2: Generate test scenarios
      console.log('\n🧪 Step 2: Generating test scenarios...')
      const scenarios = await this.codeAnalyzer.generateTestScenarios()
      console.log(`✅ Generated ${scenarios.length} test scenarios.`)
      
      // Step 3: Execute tests
      console.log('\n🚀 Step 3: Executing tests...')
      this.testExecutor = new TestExecutor(scenarios, this.options.maxInteractions)
      const results = await this.testExecutor.executeAllTests()
      console.log(`✅ Test execution completed. ${results.length} tests executed.`)
      
      // Step 4: Generate reports
      console.log('\n📊 Step 4: Generating reports...')
      this.reportGenerator = new ReportGenerator(scenarios, results, this.options.outputPath)
      await this.reportGenerator.generateReport()
      
      // Step 5: Display summary
      console.log('\n📋 Step 5: Execution Summary')
      const summary = this.testExecutor.getExecutionSummary()
      const coverage = this.testExecutor.getResultsByCategory()
      
      this.displayExecutionSummary(summary)
      this.displayCoverageSummary(coverage)
      
      console.log('\n🎉 Test Generation Process Completed Successfully!')
      
      return {
        scenarios,
        results,
        summary,
        coverage
      }
      
    } catch (error) {
      console.error('❌ Error in test generation process:', error)
      throw error
    }
  }

  private displayExecutionSummary(summary: any): void {
    console.log('\n📊 EXECUTION SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${summary.total}`)
    console.log(`✅ Passed: ${summary.passed}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`⚠️  Errors: ${summary.errors}`)
    console.log(`⏭️  Skipped: ${summary.skipped}`)
    console.log(`⏱️  Total Time: ${summary.executionTime}ms`)
    console.log(`📈 Success Rate: ${summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%`)
  }

  private displayCoverageSummary(coverage: Record<string, any>): void {
    console.log('\n🎯 COVERAGE BY CATEGORY')
    console.log('='.repeat(50))
    
    Object.entries(coverage).forEach(([category, data]) => {
      const successRate = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0
      const status = successRate >= 80 ? '🟢' : successRate >= 60 ? '🟡' : '🔴'
      
      console.log(`${status} ${category.toUpperCase()}:`)
      console.log(`   Total: ${data.total} | Passed: ${data.passed} | Failed: ${data.failed} | Errors: ${data.errors}`)
      console.log(`   Success Rate: ${successRate}%`)
    })
  }

  async generateAdditionalScenarios(issueType: string): Promise<TestScenario[]> {
    console.log(`🔄 Generating additional scenarios for issue type: ${issueType}`)
    
    try {
      // Analyze the codebase again to identify specific areas
      const analyses = await this.codeAnalyzer.analyzeCodebase()
      
      // Generate focused scenarios based on issue type
      let additionalScenarios: TestScenario[] = []
      
      switch (issueType) {
        case 'security':
          additionalScenarios = this.generateSecurityScenarios(analyses)
          break
        case 'performance':
          additionalScenarios = this.generatePerformanceScenarios(analyses)
          break
        case 'edge-cases':
          additionalScenarios = this.generateEdgeCaseScenarios(analyses)
          break
        case 'ui':
          additionalScenarios = this.generateUIScenarios(analyses)
          break
        default:
          additionalScenarios = this.generateGenericScenarios(analyses)
      }
      
      console.log(`✅ Generated ${additionalScenarios.length} additional ${issueType} scenarios`)
      return additionalScenarios
      
    } catch (error) {
      console.error(`❌ Error generating additional scenarios for ${issueType}:`, error)
      return []
    }
  }

  private generateSecurityScenarios(analyses: any[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const timestamp = new Date().toISOString()
    
    // Generate comprehensive security test scenarios
    const securityTests = [
      {
        name: 'Brute Force Attack Prevention',
        description: 'Test login form against brute force attacks',
        input: { action: 'brute-force', attempts: 10, delay: 1000 },
        expectedOutput: { success: false, blocked: true, cooldown: true }
      },
      {
        name: 'Session Hijacking Prevention',
        description: 'Test session security and token validation',
        input: { action: 'session-test', token: 'invalid-token' },
        expectedOutput: { success: false, error: 'Invalid session' }
      },
      {
        name: 'CSRF Protection',
        description: 'Test CSRF token validation',
        input: { action: 'csrf-test', token: 'invalid-csrf' },
        expectedOutput: { success: false, error: 'CSRF validation failed' }
      },
      {
        name: 'Input Sanitization',
        description: 'Test various malicious input patterns',
        input: { action: 'sanitization-test', payload: '<script>alert("xss")</script>' },
        expectedOutput: { success: false, sanitized: true }
      }
    ]
    
    securityTests.forEach((test, index) => {
      scenarios.push({
        id: `security-${index}-${Date.now()}`,
        name: test.name,
        description: test.description,
        category: 'security',
        priority: 'critical',
        input: test.input,
        expectedOutput: test.expectedOutput,
        validationRules: [
          {
            type: 'assertion',
            condition: 'security.validation === true',
            message: 'Security validation should pass'
          }
        ],
        riskLevel: 'critical',
        tags: ['security', 'vulnerability', 'protection'],
        createdAt: timestamp
      })
    })
    
    return scenarios
  }

  private generatePerformanceScenarios(analyses: any[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const timestamp = new Date().toISOString()
    
    const performanceTests = [
      {
        name: 'Login Response Time',
        description: 'Test login form response time under normal load',
        input: { action: 'performance-test', load: 'normal', users: 1 },
        expectedOutput: { success: true, responseTime: '< 500ms' }
      },
      {
        name: 'Concurrent User Login',
        description: 'Test login performance with multiple concurrent users',
        input: { action: 'performance-test', load: 'concurrent', users: 10 },
        expectedOutput: { success: true, responseTime: '< 1000ms' }
      },
      {
        name: 'Memory Usage Test',
        description: 'Test memory usage during login operations',
        input: { action: 'memory-test', operations: 100 },
        expectedOutput: { success: true, memoryUsage: 'stable' }
      }
    ]
    
    performanceTests.forEach((test, index) => {
      scenarios.push({
        id: `performance-${index}-${Date.now()}`,
        name: test.name,
        description: test.description,
        category: 'performance',
        priority: 'medium',
        input: test.input,
        expectedOutput: test.expectedOutput,
        validationRules: [
          {
            type: 'assertion',
            condition: 'performance.threshold === "met"',
            message: 'Performance threshold should be met'
          }
        ],
        riskLevel: 'medium',
        tags: ['performance', 'load', 'scalability'],
        createdAt: timestamp
      })
    })
    
    return scenarios
  }

  private generateEdgeCaseScenarios(analyses: any[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const timestamp = new Date().toISOString()
    
    const edgeCaseTests = [
      {
        name: 'Extremely Long Input',
        description: 'Test with extremely long email and password inputs',
        input: { email: 'a'.repeat(1000) + '@test.com', password: 'b'.repeat(1000) },
        expectedOutput: { success: false, error: 'Input too long' }
      },
      {
        name: 'Special Characters',
        description: 'Test with various special characters and unicode',
        input: { email: 'test@test.com', password: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
        expectedOutput: { success: false, error: 'Invalid characters' }
      },
      {
        name: 'Empty Form Submission',
        description: 'Test form submission with all fields empty',
        input: { email: '', password: '' },
        expectedOutput: { success: false, error: 'All fields required' }
      },
      {
        name: 'Whitespace Only',
        description: 'Test with whitespace-only inputs',
        input: { email: '   ', password: '   ' },
        expectedOutput: { success: false, error: 'Invalid input' }
      }
    ]
    
    edgeCaseTests.forEach((test, index) => {
      scenarios.push({
        id: `edge-case-${index}-${Date.now()}`,
        name: test.name,
        description: test.description,
        category: 'edge-case',
        priority: 'medium',
        input: test.input,
        expectedOutput: test.expectedOutput,
        validationRules: [
          {
            type: 'assertion',
            condition: 'edgeCase.handled === true',
            message: 'Edge case should be handled gracefully'
          }
        ],
        riskLevel: 'low',
        tags: ['edge-case', 'input-validation', 'robustness'],
        createdAt: timestamp
      })
    })
    
    return scenarios
  }

  private generateUIScenarios(analyses: any[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const timestamp = new Date().toISOString()
    
    const uiTests = [
      {
        name: 'Form Field Focus',
        description: 'Test form field focus and navigation',
        input: { action: 'focus-test', field: 'email' },
        expectedOutput: { success: true, focused: true, accessible: true }
      },
      {
        name: 'Keyboard Navigation',
        description: 'Test keyboard navigation through form fields',
        input: { action: 'keyboard-test', key: 'Tab' },
        expectedOutput: { success: true, navigated: true, order: 'correct' }
      },
      {
        name: 'Screen Reader Compatibility',
        description: 'Test screen reader accessibility',
        input: { action: 'accessibility-test', reader: 'screen-reader' },
        expectedOutput: { success: true, accessible: true, aria: 'proper' }
      },
      {
        name: 'Mobile Responsiveness',
        description: 'Test mobile device compatibility',
        input: { action: 'mobile-test', device: 'mobile', orientation: 'portrait' },
        expectedOutput: { success: true, responsive: true, usable: true }
      }
    ]
    
    uiTests.forEach((test, index) => {
      scenarios.push({
        id: `ui-${index}-${Date.now()}`,
        name: test.name,
        description: test.description,
        category: 'ui',
        priority: 'medium',
        input: test.input,
        expectedOutput: test.expectedOutput,
        validationRules: [
          {
            type: 'assertion',
            condition: 'ui.accessible === true',
            message: 'UI should be accessible and usable'
          }
        ],
        riskLevel: 'low',
        tags: ['ui', 'accessibility', 'usability'],
        createdAt: timestamp
      })
    })
    
    return scenarios
  }

  private generateGenericScenarios(analyses: any[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const timestamp = new Date().toISOString()
    
    const genericTests = [
      {
        name: 'Network Error Handling',
        description: 'Test behavior when network is unavailable',
        input: { action: 'network-test', status: 'offline' },
        expectedOutput: { success: false, error: 'Network unavailable' }
      },
      {
        name: 'Server Error Handling',
        description: 'Test behavior when server returns errors',
        input: { action: 'server-test', status: '500' },
        expectedOutput: { success: false, error: 'Server error' }
      },
      {
        name: 'Timeout Handling',
        description: 'Test behavior when requests timeout',
        input: { action: 'timeout-test', duration: 5000 },
        expectedOutput: { success: false, error: 'Request timeout' }
      }
    ]
    
    genericTests.forEach((test, index) => {
      scenarios.push({
        id: `generic-${index}-${Date.now()}`,
        name: test.name,
        description: test.description,
        category: 'functional',
        priority: 'medium',
        input: test.input,
        expectedOutput: test.expectedOutput,
        validationRules: [
          {
            type: 'assertion',
            condition: 'error.handled === true',
            message: 'Error should be handled gracefully'
          }
        ],
        riskLevel: 'medium',
        tags: ['error-handling', 'robustness', 'reliability'],
        createdAt: timestamp
      })
    })
    
    return scenarios
  }

  getStatus(): string {
    return 'Test Generator Agent is ready and operational'
  }

  getOptions(): TestGenerationOptions {
    return { ...this.options }
  }
}