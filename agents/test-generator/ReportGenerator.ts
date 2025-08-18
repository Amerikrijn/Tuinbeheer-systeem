import { TestScenario, TestResult } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class ReportGenerator {
  private outputPath: string

  constructor(outputPath: string) {
    this.outputPath = outputPath
    this.ensureOutputDirectory()
  }

  /**
   * Save the complete test report
   */
  async saveReport(report: any): Promise<void> {
    try {
      const reportPath = path.join(this.outputPath, 'test-execution-report.json')
      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
      console.log(`📄 Test report saved to: ${reportPath}`)
    } catch (error) {
      console.error('❌ Error saving test report:', error)
      throw error
    }
  }

  /**
   * Generate markdown summary
   */
  async generateMarkdownSummary(report: any): Promise<void> {
    try {
      const summaryPath = path.join(this.outputPath, 'test-execution-summary.md')
      const markdown = this.formatMarkdownSummary(report)
      await fs.promises.writeFile(summaryPath, markdown)
      console.log(`📄 Markdown summary saved to: ${summaryPath}`)
    } catch (error) {
      console.error('❌ Error generating markdown summary:', error)
      throw error
    }
  }

  /**
   * Generate coverage report
   */
  async generateCoverageReport(report: any): Promise<void> {
    try {
      const coveragePath = path.join(this.outputPath, 'test-coverage-report.json')
      const coverageReport = this.generateCoverageData(report)
      await fs.promises.writeFile(coveragePath, JSON.stringify(coverageReport, null, 2))
      console.log(`📄 Coverage report saved to: ${coveragePath}`)
    } catch (error) {
      console.error('❌ Error generating coverage report:', error)
      throw error
    }
  }

  /**
   * Format markdown summary
   */
  private formatMarkdownSummary(report: any): string {
    const { scenarios, testResults, qualityScore, iterationHistory, improvementSummary } = report
    
    let markdown = `# 🧪 Test Execution Summary\n\n`
    markdown += `**Generated:** ${new Date().toLocaleString()}\n`
    markdown += `**Quality Score:** ${qualityScore}/100\n\n`

    // Iteration Summary
    if (iterationHistory && iterationHistory.length > 0) {
      markdown += `## 🔄 Iteration Summary\n\n`
      markdown += `| Iteration | Scenarios | Quality Score | Execution Time |\n`
      markdown += `|------------|-----------|---------------|----------------|\n`
      
      iterationHistory.forEach((iteration: any, index: number) => {
        markdown += `| ${index + 1} | ${iteration.scenarios.length} | ${iteration.qualityScore}/100 | ${iteration.executionTime}ms |\n`
      })
      
      if (improvementSummary) {
        markdown += `\n**Improvement Summary:**\n`
        markdown += `- Quality Increase: +${improvementSummary.qualityIncrease} points\n`
        markdown += `- Scenario Increase: +${improvementSummary.scenarioIncrease}\n`
        markdown += `- Total Iterations: ${improvementSummary.totalIterations}\n\n`
      }
    }

    // Test Results Summary
    if (testResults && testResults.length > 0) {
      const summary = this.calculateTestSummary(testResults)
      
      markdown += `## 📊 Test Results Summary\n\n`
      markdown += `- **Total Tests:** ${summary.total}\n`
      markdown += `- **Passed:** ${summary.passed} (${summary.passRate}%)\n`
      markdown += `- **Failed:** ${summary.failed}\n`
      markdown += `- **Errors:** ${summary.errors}\n`
      markdown += `- **Total Execution Time:** ${summary.totalTime}ms\n\n`
    }

    // Scenarios by Category
    if (scenarios && scenarios.length > 0) {
      markdown += `## 🎯 Scenarios by Category\n\n`
      
      const categories = this.groupScenariosByCategory(scenarios)
      Object.entries(categories).forEach(([category, categoryScenarios]) => {
        markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryScenarios.length})\n\n`
        
        categoryScenarios.forEach((scenario: any) => {
          markdown += `- **${scenario.name}** (${scenario.priority})\n`
          markdown += `  - ${scenario.description}\n`
          markdown += `  - Risk Level: ${scenario.riskLevel}\n`
          markdown += `  - Tags: ${scenario.tags.join(', ')}\n\n`
        })
      }
    }

    // Test Results Details
    if (testResults && testResults.length > 0) {
      markdown += `## 🔍 Test Results Details\n\n`
      
      testResults.forEach((result: any) => {
        const scenario = scenarios.find((s: any) => s.id === result.scenarioId)
        const status = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'
        
        markdown += `### ${status} ${scenario ? scenario.name : 'Unknown Scenario'}\n\n`
        markdown += `- **Status:** ${result.status}\n`
        markdown += `- **Execution Time:** ${result.executionTime}ms\n`
        markdown += `- **Category:** ${result.details?.category || 'Unknown'}\n`
        markdown += `- **Priority:** ${result.details?.priority || 'Unknown'}\n`
        
        if (result.error) {
          markdown += `- **Error:** ${result.error}\n`
        }
        
        if (result.output) {
          markdown += `- **Output:** \`\`\`json\n${JSON.stringify(result.output, null, 2)}\n\`\`\`\n`
        }
        
        markdown += `\n`
      })
    }

    return markdown
  }

  /**
   * Generate coverage data
   */
  private generateCoverageData(report: any): any {
    const { scenarios, testResults, codeAnalysis } = report
    
    const coverage = {
      summary: {
        totalScenarios: scenarios?.length || 0,
        totalTests: testResults?.length || 0,
        qualityScore: report.qualityScore || 0,
        estimatedCoverage: codeAnalysis?.testCoverage || 0
      },
      byCategory: this.groupScenariosByCategory(scenarios || []),
      byPriority: this.groupScenariosByPriority(scenarios || []),
      byRiskLevel: this.groupScenariosByRiskLevel(scenarios || []),
      testResults: {
        byStatus: this.groupTestResultsByStatus(testResults || []),
        byCategory: this.groupTestResultsByCategory(testResults || []),
        executionTimes: this.calculateExecutionTimeStats(testResults || [])
      }
    }
    
    return coverage
  }

  /**
   * Calculate test summary
   */
  private calculateTestSummary(testResults: TestResult[]): any {
    const total = testResults.length
    const passed = testResults.filter(r => r.status === 'passed').length
    const failed = testResults.filter(r => r.status === 'failed').length
    const errors = testResults.filter(r => r.status === 'error').length
    const skipped = testResults.filter(r => r.status === 'skipped').length
    
    const totalTime = testResults.reduce((sum, r) => sum + r.executionTime, 0)
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
    
    return {
      total,
      passed,
      failed,
      errors,
      skipped,
      totalTime,
      passRate
    }
  }

  /**
   * Group scenarios by category
   */
  private groupScenariosByCategory(scenarios: TestScenario[]): Record<string, TestScenario[]> {
    const categories: Record<string, TestScenario[]> = {}
    
    scenarios.forEach(scenario => {
      const category = scenario.category || 'unknown'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(scenario)
    })
    
    return categories
  }

  /**
   * Group scenarios by priority
   */
  private groupScenariosByPriority(scenarios: TestScenario[]): Record<string, TestScenario[]> {
    const priorities: Record<string, TestScenario[]> = {}
    
    scenarios.forEach(scenario => {
      const priority = scenario.priority || 'unknown'
      if (!priorities[priority]) {
        priorities[priority] = []
      }
      priorities[priority].push(scenario)
    })
    
    return priorities
  }

  /**
   * Group scenarios by risk level
   */
  private groupScenariosByRiskLevel(scenarios: TestScenario[]): Record<string, TestScenario[]> {
    const riskLevels: Record<string, TestScenario[]> = {}
    
    scenarios.forEach(scenario => {
      const riskLevel = scenario.riskLevel || 'unknown'
      if (!riskLevels[riskLevel]) {
        riskLevels[riskLevel] = []
      }
      riskLevels[riskLevel].push(scenario)
    })
    
    return riskLevels
  }

  /**
   * Group test results by status
   */
  private groupTestResultsByStatus(testResults: TestResult[]): Record<string, TestResult[]> {
    const statuses: Record<string, TestResult[]> = {}
    
    testResults.forEach(result => {
      const status = result.status || 'unknown'
      if (!statuses[status]) {
        statuses[status] = []
      }
      statuses[status].push(result)
    })
    
    return statuses
  }

  /**
   * Group test results by category
   */
  private groupTestResultsByCategory(testResults: TestResult[]): Record<string, TestResult[]> {
    const categories: Record<string, TestResult[]> = {}
    
    testResults.forEach(result => {
      const category = result.details?.category || 'unknown'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(result)
    })
    
    return categories
  }

  /**
   * Calculate execution time statistics
   */
  private calculateExecutionTimeStats(testResults: TestResult[]): any {
    if (testResults.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0 }
    }
    
    const times = testResults.map(r => r.executionTime).sort((a, b) => a - b)
    const min = times[0]
    const max = times[times.length - 1]
    const average = times.reduce((sum, time) => sum + time, 0) / times.length
    const median = times[Math.floor(times.length / 2)]
    
    return {
      min,
      max,
      average: Math.round(average),
      median
    }
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true })
    }
  }
}