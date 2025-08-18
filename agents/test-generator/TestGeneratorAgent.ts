import { CodeAnalyzer } from './CodeAnalyzer'
import { TestExecutor } from './TestExecutor'
import { ReportGenerator } from './ReportGenerator'
import { TestGenerationOptions, TestCoverageReport } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class TestGeneratorAgent {
  private codeAnalyzer: CodeAnalyzer
  private testExecutor: TestExecutor
  private reportGenerator: ReportGenerator
  private options: TestGenerationOptions
  private iterationResults: any[] = []

  constructor(options: TestGenerationOptions) {
    this.options = options
    this.codeAnalyzer = new CodeAnalyzer()
    this.testExecutor = new TestExecutor()
    this.reportGenerator = new ReportGenerator(options.outputPath)
  }

  /**
   * Main execution method with 2 iterations
   */
  async run(): Promise<any> {
    console.log('🚀 AI-Powered Test Generator Agent Starting...')
    console.log(`📁 Target feature: ${this.options.featurePath}`)
    console.log(`🎯 Strategy: ${this.options.strategy}`)
    console.log(`🔄 Max iterations: 2 (with improvement tracking)`)
    console.log('')

    try {
      // Iteratie 1: Basis test generatie
      console.log('🔄 Iteratie 1: Basis test generatie...')
      const iteration1Result = await this.executeIteration(1)
      this.iterationResults.push(iteration1Result)
      
      console.log(`📊 Iteratie 1 Resultaat: ${iteration1Result.scenarios.length} scenarios, Kwaliteit: ${iteration1Result.qualityScore}/100`)
      console.log('')

      // Iteratie 2: Verbeterde test generatie
      console.log('🔄 Iteratie 2: Verbeterde test generatie...')
      const iteration2Result = await this.executeIteration(2, iteration1Result)
      this.iterationResults.push(iteration2Result)
      
      console.log(`📊 Iteratie 2 Resultaat: ${iteration2Result.scenarios.length} scenarios, Kwaliteit: ${iteration2Result.qualityScore}/100`)
      console.log('')

      // Vergelijk resultaten
      this.showImprovementSummary(iteration1Result, iteration2Result)

      // Genereer rapporten
      const finalReport = await this.generateFinalReport(iteration2Result)
      
      return finalReport

    } catch (error) {
      console.error('❌ Error during test generation:', error)
      throw error
    }
  }

  /**
   * Execute a single iteration
   */
  private async executeIteration(iterationNumber: number, previousResult?: any): Promise<any> {
    const startTime = Date.now()
    
    try {
      // Analyze code
      const codeAnalysis = await this.codeAnalyzer.analyzeCode(this.options.featurePath)
      
      // Generate test scenarios with improvement logic
      let scenarios = await this.generateTestScenarios(codeAnalysis, iterationNumber, previousResult)
      
      // Execute tests
      const testResults = await this.testExecutor.executeTests(scenarios, this.options.featurePath)
      
      // Calculate quality score for this iteration
      const qualityScore = this.calculateQualityScore(scenarios, testResults, codeAnalysis)
      
      const result = {
        iteration: iterationNumber,
        scenarios,
        testResults,
        codeAnalysis,
        qualityScore,
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
   * Generate test scenarios with improvement logic
   */
  private async generateTestScenarios(codeAnalysis: any, iterationNumber: number, previousResult?: any): Promise<any[]> {
    let scenarios = []
    
    if (iterationNumber === 1) {
      // Eerste iteratie: basis scenarios
      scenarios = await this.codeAnalyzer.generateTestScenarios(codeAnalysis, this.options)
    } else {
      // Tweede iteratie: verbeterde scenarios
      scenarios = await this.improveTestScenarios(previousResult, codeAnalysis)
    }
    
    return scenarios
  }

  /**
   * Improve test scenarios based on previous iteration
   */
  private async improveTestScenarios(previousResult: any, codeAnalysis: any): Promise<any[]> {
    const improvedScenarios = [...previousResult.scenarios]
    
    // Voeg edge cases toe
    const edgeCaseScenarios = await this.generateEdgeCaseScenarios(codeAnalysis)
    improvedScenarios.push(...edgeCaseScenarios)
    
    // Voeg error scenarios toe
    const errorScenarios = await this.generateErrorScenarios(codeAnalysis)
    improvedScenarios.push(...errorScenarios)
    
    // Voeg security test scenarios toe
    if (this.options.includeSecurityTests) {
      const securityScenarios = await this.generateSecurityScenarios(codeAnalysis)
      improvedScenarios.push(...securityScenarios)
    }
    
    // Voeg performance test scenarios toe
    if (this.options.includePerformanceTests) {
      const performanceScenarios = await this.generatePerformanceScenarios(codeAnalysis)
      improvedScenarios.push(...performanceScenarios)
    }
    
    return improvedScenarios
  }

  /**
   * Generate edge case scenarios
   */
  private async generateEdgeCaseScenarios(codeAnalysis: any): Promise<any[]> {
    const edgeCases = []
    
    // Voeg edge cases toe op basis van code analyse
    if (codeAnalysis.hasInputValidation) {
      edgeCases.push({
        id: `edge-case-${Date.now()}`,
        name: 'Empty Input Validation',
        description: 'Test with empty/null input values',
        category: 'edge-case',
        priority: 'high',
        input: { email: '', password: null },
        expectedOutput: 'validation_error',
        validationRules: [
          {
            type: 'assertion',
            condition: 'should_return_validation_error',
            message: 'Empty inputs should trigger validation error'
          }
        ],
        riskLevel: 'medium',
        tags: ['edge-case', 'validation', 'iteration-2']
      })
    }
    
    return edgeCases
  }

  /**
   * Generate error scenarios
   */
  private async generateErrorScenarios(codeAnalysis: any): Promise<any[]> {
    const errorScenarios = []
    
    // Voeg error scenarios toe
    errorScenarios.push({
      id: `error-case-${Date.now()}`,
      name: 'Network Error Handling',
      description: 'Test behavior when network requests fail',
      category: 'edge-case',
      priority: 'medium',
      input: { simulateNetworkError: true },
      expectedOutput: 'graceful_error_handling',
      validationRules: [
        {
          type: 'assertion',
          condition: 'should_handle_error_gracefully',
          message: 'Network errors should be handled gracefully'
        }
      ],
      riskLevel: 'low',
      tags: ['error-handling', 'iteration-2']
    })
    
    return errorScenarios
  }

  /**
   * Generate security scenarios
   */
  private async generateSecurityScenarios(codeAnalysis: any): Promise<any[]> {
    const securityScenarios = []
    
    // Voeg security test scenarios toe
    securityScenarios.push({
      id: `security-case-${Date.now()}`,
      name: 'SQL Injection Prevention',
      description: 'Test SQL injection prevention',
      category: 'security',
      priority: 'critical',
      input: { userInput: "'; DROP TABLE users; --" },
      expectedOutput: 'safe_handling',
      validationRules: [
        {
          type: 'assertion',
          condition: 'should_prevent_sql_injection',
          message: 'SQL injection attempts should be safely handled'
        }
      ],
      riskLevel: 'critical',
      tags: ['security', 'sql-injection', 'iteration-2']
    })
    
    return securityScenarios
  }

  /**
   * Generate performance scenarios
   */
  private async generatePerformanceScenarios(codeAnalysis: any): Promise<any[]> {
    const performanceScenarios = []
    
    // Voeg performance test scenarios toe
    performanceScenarios.push({
      id: `performance-case-${Date.now()}`,
      name: 'Large Data Set Performance',
      description: 'Test performance with large data sets',
      category: 'performance',
      priority: 'medium',
      input: { dataSize: 'large', timeout: 5000 },
      expectedOutput: 'completes_within_timeout',
      validationRules: [
        {
          type: 'assertion',
          condition: 'should_complete_within_timeout',
          message: 'Large data sets should complete within timeout'
        }
      ],
      riskLevel: 'low',
      tags: ['performance', 'iteration-2']
    })
    
    return performanceScenarios
  }

  /**
   * Calculate quality score for an iteration
   */
  private calculateQualityScore(scenarios: any[], testResults: any[], codeAnalysis: any): number {
    let score = 0
    
    // Base score from number of scenarios
    score += Math.min(scenarios.length * 5, 30)
    
    // Score from test execution
    if (testResults.length > 0) {
      const passedTests = testResults.filter(r => r.status === 'passed').length
      score += (passedTests / testResults.length) * 30
    }
    
    // Score from code coverage
    if (codeAnalysis.testCoverage) {
      score += codeAnalysis.testCoverage * 0.4
    }
    
    // Bonus for edge cases and security tests
    const edgeCaseCount = scenarios.filter(s => s.category === 'edge-case').length
    const securityCount = scenarios.filter(s => s.category === 'security').length
    
    score += Math.min(edgeCaseCount * 2, 10)
    score += Math.min(securityCount * 3, 15)
    
    return Math.round(Math.min(score, 100))
  }

  /**
   * Show improvement summary between iterations
   */
  private showImprovementSummary(iteration1: any, iteration2: any): void {
    console.log('🎯 Verbetering Samenvatting')
    console.log('============================')
    
    const qualityImprovement = iteration2.qualityScore - iteration1.qualityScore
    const scenarioImprovement = iteration2.scenarios.length - iteration1.scenarios.length
    
    console.log(`📊 Kwaliteit: ${iteration1.qualityScore} → ${iteration2.qualityScore} (+${qualityImprovement} punten)`)
    console.log(`🔍 Scenarios: ${iteration1.scenarios.length} → ${iteration2.scenarios.length} (+${scenarioImprovement})`)
    console.log(`⚡ Uitvoeringstijd: ${iteration1.executionTime}ms → ${iteration2.executionTime}ms`)
    
    if (qualityImprovement > 0) {
      console.log(`✅ Verbetering: ${((qualityImprovement / iteration1.qualityScore) * 100).toFixed(1)}%`)
    } else {
      console.log(`⚠️ Geen kwaliteitsverbetering in iteratie 2`)
    }
    
    console.log('')
  }

  /**
   * Generate final report with iteration data
   */
  private async generateFinalReport(finalResult: any): Promise<any> {
    const report = {
      ...finalResult,
      iterationHistory: this.iterationResults,
      improvementSummary: {
        qualityIncrease: finalResult.qualityScore - this.iterationResults[0].qualityScore,
        scenarioIncrease: finalResult.scenarios.length - this.iterationResults[0].scenarios.length,
        totalIterations: this.iterationResults.length
      }
    }

    // Save reports
    await this.reportGenerator.saveReport(report)
    await this.reportGenerator.generateMarkdownSummary(report)
    await this.reportGenerator.generateCoverageReport(report)

    return report
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      options: this.options,
      iterations: this.iterationResults.length,
      currentQuality: this.iterationResults.length > 0 ? this.iterationResults[this.iterationResults.length - 1].qualityScore : 0
    }
  }
}