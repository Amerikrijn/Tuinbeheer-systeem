import * as fs from 'fs'
import * as path from 'path'
import { TestScenario, TestResult, TestCoverageReport } from './types'

export class ReportGenerator {
  private scenarios: TestScenario[]
  private results: TestResult[]
  private outputPath: string

  constructor(scenarios: TestScenario[], results: TestResult[], outputPath: string) {
    this.scenarios = scenarios
    this.results = results
    this.outputPath = outputPath
  }

  async generateReport(): Promise<void> {
    console.log('📊 Generating comprehensive test report...')
    
    const report = {
      summary: this.generateSummary(),
      coverage: this.generateCoverageReport(),
      results: this.organizeResults(),
      issues: this.identifyIssues(),
      recommendations: this.generateRecommendations(),
      metadata: this.generateMetadata()
    }

    // Save detailed JSON report
    await this.saveJsonReport(report)
    
    // Save human-readable summary
    await this.saveHumanReadableReport(report)
    
    // Save coverage metrics
    await this.saveCoverageReport(report.coverage)
    
    console.log('📋 Test report generated successfully!')
  }

  private generateSummary(): any {
    const totalScenarios = this.scenarios.length
    const totalResults = this.results.length
    const passed = this.results.filter(r => r.status === 'passed').length
    const failed = this.results.filter(r => r.status === 'failed').length
    const errors = this.results.filter(r => r.status === 'error').length
    const skipped = this.results.filter(r => r.status === 'skipped').length
    
    const totalExecutionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0)
    const averageExecutionTime = totalResults > 0 ? totalExecutionTime / totalResults : 0
    
    const successRate = totalResults > 0 ? (passed / totalResults) * 100 : 0
    
    return {
      totalScenarios,
      totalResults,
      passed,
      failed,
      errors,
      skipped,
      successRate: Math.round(successRate * 100) / 100,
      totalExecutionTime,
      averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
      timestamp: new Date().toISOString()
    }
  }

  private generateCoverageReport(): TestCoverageReport {
    const totalScenarios = this.scenarios.length
    const executedScenarios = this.results.length
    const passedScenarios = this.results.filter(r => r.status === 'passed').length
    const failedScenarios = this.results.filter(r => r.status === 'failed').length
    
    // Calculate coverage by category
    const coverageByCategory: Record<string, number> = {}
    const categoryCounts: Record<string, number> = {}
    
    this.scenarios.forEach(scenario => {
      const category = scenario.category
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
    
    this.results.forEach(result => {
      const category = result.metadata?.category || 'unknown'
      if (!coverageByCategory[category]) {
        coverageByCategory[category] = 0
      }
      if (result.status === 'passed' || result.status === 'failed') {
        coverageByCategory[category]++
      }
    })
    
    // Calculate percentage coverage for each category
    Object.keys(categoryCounts).forEach(category => {
      const total = categoryCounts[category]
      const covered = coverageByCategory[category] || 0
      coverageByCategory[category] = total > 0 ? Math.round((covered / total) * 100) : 0
    })
    
    // Calculate risk coverage
    const riskCoverage: Record<string, number> = {}
    const riskCounts: Record<string, number> = {}
    
    this.scenarios.forEach(scenario => {
      const risk = scenario.riskLevel
      riskCounts[risk] = (riskCounts[risk] || 0) + 1
    })
    
    this.results.forEach(result => {
      const risk = result.metadata?.riskLevel || 'unknown'
      if (!riskCoverage[risk]) {
        riskCoverage[risk] = 0
      }
      if (result.status === 'passed' || result.status === 'failed') {
        riskCoverage[risk]++
      }
    })
    
    // Calculate percentage coverage for each risk level
    Object.keys(riskCounts).forEach(risk => {
      const total = riskCounts[risk]
      const covered = riskCoverage[risk] || 0
      riskCoverage[risk] = total > 0 ? Math.round((covered / total) * 100) : 0
    })
    
    const executionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0)
    
    const recommendations = this.generateCoverageRecommendations(coverageByCategory, riskCoverage)
    
    return {
      totalScenarios,
      executedScenarios,
      passedScenarios,
      failedScenarios,
      coverageByCategory,
      riskCoverage,
      executionTime,
      recommendations
    }
  }

  private organizeResults(): any {
    const resultsByCategory = this.groupResultsByCategory()
    const resultsByPriority = this.groupResultsByPriority()
    const resultsByStatus = this.groupResultsByStatus()
    const resultsByRiskLevel = this.groupResultsByRiskLevel()
    
    return {
      byCategory: resultsByCategory,
      byPriority: resultsByPriority,
      byStatus: resultsByStatus,
      byRiskLevel: resultsByRiskLevel,
      detailed: this.results.map(result => ({
        ...result,
        scenario: this.scenarios.find(s => s.id === result.scenarioId)
      }))
    }
  }

  private groupResultsByCategory(): Record<string, any> {
    const grouped: Record<string, any> = {}
    
    this.results.forEach(result => {
      const category = result.metadata?.category || 'unknown'
      if (!grouped[category]) {
        grouped[category] = {
          total: 0,
          passed: 0,
          failed: 0,
          errors: 0,
          results: []
        }
      }
      
      grouped[category].total++
      grouped[category].results.push(result)
      
      switch (result.status) {
        case 'passed':
          grouped[category].passed++
          break
        case 'failed':
          grouped[category].failed++
          break
        case 'error':
          grouped[category].errors++
          break
      }
    })
    
    return grouped
  }

  private groupResultsByPriority(): Record<string, any> {
    const grouped: Record<string, any> = {}
    
    this.results.forEach(result => {
      const priority = result.metadata?.priority || 'unknown'
      if (!grouped[priority]) {
        grouped[priority] = {
          total: 0,
          passed: 0,
          failed: 0,
          errors: 0,
          results: []
        }
      }
      
      grouped[priority].total++
      grouped[priority].results.push(result)
      
      switch (result.status) {
        case 'passed':
          grouped[priority].passed++
          break
        case 'failed':
          grouped[priority].failed++
          break
        case 'error':
          grouped[priority].errors++
          break
      }
    })
    
    return grouped
  }

  private groupResultsByStatus(): Record<string, TestResult[]> {
    const grouped: Record<string, TestResult[]> = {
      passed: [],
      failed: [],
      error: [],
      skipped: []
    }
    
    this.results.forEach(result => {
      grouped[result.status].push(result)
    })
    
    return grouped
  }

  private groupResultsByRiskLevel(): Record<string, any> {
    const grouped: Record<string, any> = {}
    
    this.results.forEach(result => {
      const risk = result.metadata?.riskLevel || 'unknown'
      if (!grouped[risk]) {
        grouped[risk] = {
          total: 0,
          passed: 0,
          failed: 0,
          errors: 0,
          results: []
        }
      }
      
      grouped[risk].total++
      grouped[risk].results.push(result)
      
      switch (result.status) {
        case 'passed':
          grouped[risk].passed++
          break
        case 'failed':
          grouped[risk].failed++
          break
        case 'error':
          grouped[risk].errors++
          break
      }
    })
    
    return grouped
  }

  private identifyIssues(): any[] {
    const issues: any[] = []
    
    // Identify failed tests
    this.results.filter(r => r.status === 'failed').forEach(result => {
      const scenario = this.scenarios.find(s => s.id === result.scenarioId)
      issues.push({
        type: 'test-failure',
        severity: 'medium',
        description: `Test "${scenario?.name || 'Unknown'}" failed`,
        scenarioId: result.scenarioId,
        output: result.output,
        recommendation: 'Review test logic and expected output'
      })
    })
    
    // Identify test errors
    this.results.filter(r => r.status === 'error').forEach(result => {
      const scenario = this.scenarios.find(s => s.id === result.scenarioId)
      issues.push({
        type: 'test-error',
        severity: 'high',
        description: `Test "${scenario?.name || 'Unknown'}" encountered an error`,
        scenarioId: result.scenarioId,
        error: result.error,
        recommendation: 'Investigate test execution environment and dependencies'
      })
    })
    
    // Identify low coverage areas
    const coverageReport = this.generateCoverageReport()
    Object.entries(coverageReport.coverageByCategory).forEach(([category, coverage]) => {
      if (coverage < 80) {
        issues.push({
          type: 'low-coverage',
          severity: 'medium',
          description: `Low test coverage in ${category} category: ${coverage}%`,
          category,
          coverage,
          recommendation: `Add more tests for ${category} functionality`
        })
      }
    })
    
    // Identify high-risk areas with low coverage
    Object.entries(coverageReport.riskCoverage).forEach(([risk, coverage]) => {
      if (coverage < 90 && (risk === 'critical' || risk === 'high')) {
        issues.push({
          type: 'high-risk-low-coverage',
          severity: 'critical',
          description: `Critical risk area "${risk}" has low test coverage: ${coverage}%`,
          riskLevel: risk,
          coverage,
          recommendation: `Prioritize testing for ${risk} risk scenarios`
        })
      }
    })
    
    return issues
  }

  private generateRecommendations(): any[] {
    const recommendations: any[] = []
    
    // Coverage-based recommendations
    const coverageReport = this.generateCoverageReport()
    
    if (coverageReport.totalScenarios < 10) {
      recommendations.push({
        type: 'coverage',
        priority: 'high',
        description: 'Increase test coverage by adding more test scenarios',
        action: 'Generate additional test cases for uncovered functionality'
      })
    }
    
    // Performance recommendations
    const slowTests = this.results.filter(r => r.executionTime > 1000)
    if (slowTests.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        description: `${slowTests.length} tests are taking longer than 1 second to execute`,
        action: 'Optimize slow tests or consider parallel execution'
      })
    }
    
    // Quality recommendations
    const errorRate = this.results.filter(r => r.status === 'error').length / this.results.length
    if (errorRate > 0.1) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        description: `High error rate detected: ${Math.round(errorRate * 100)}% of tests failed with errors`,
        action: 'Investigate test environment and fix underlying issues'
      })
    }
    
    // Security recommendations
    const securityTests = this.results.filter(r => r.metadata?.category === 'security')
    if (securityTests.length === 0) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        description: 'No security tests were executed',
        action: 'Implement comprehensive security testing for authentication flows'
      })
    }
    
    return recommendations
  }

  private generateCoverageRecommendations(coverageByCategory: Record<string, number>, riskCoverage: Record<string, number>): string[] {
    const recommendations: string[] = []
    
    // Category coverage recommendations
    Object.entries(coverageByCategory).forEach(([category, coverage]) => {
      if (coverage < 80) {
        recommendations.push(`Increase test coverage for ${category} category (currently ${coverage}%)`)
      }
    })
    
    // Risk coverage recommendations
    Object.entries(riskCoverage).forEach(([risk, coverage]) => {
      if (coverage < 90) {
        recommendations.push(`Improve test coverage for ${risk} risk scenarios (currently ${coverage}%)`)
      }
    })
    
    return recommendations
  }

  private generateMetadata(): any {
    return {
      generatedAt: new Date().toISOString(),
      totalScenarios: this.scenarios.length,
      totalResults: this.results.length,
      reportVersion: '1.0.0',
      generator: 'AI-Powered Test Generator Agent'
    }
  }

  private async saveJsonReport(report: any): Promise<void> {
    const reportPath = path.join(this.outputPath, 'login-exploration.json')
    
    try {
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      // Update the existing file with new data
      const existingData = fs.existsSync(reportPath) 
        ? JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
        : {}
      
      const updatedData = {
        ...existingData,
        test_session: {
          ...existingData.test_session,
          status: 'completed',
          end_time: new Date().toISOString()
        },
        test_results: report.results.detailed,
        issues_found: report.issues,
        improvements_suggested: report.recommendations,
        coverage_metrics: {
          functional_paths: report.coverage.coverageByCategory.functional || 0,
          edge_cases: report.coverage.coverageByCategory['edge-case'] || 0,
          security_tests: report.coverage.coverageByCategory.security || 0,
          ui_tests: report.coverage.coverageByCategory.ui || 0,
          total_tests: report.coverage.totalScenarios
        },
        execution_summary: {
          tests_executed: report.summary.totalResults,
          tests_passed: report.summary.passed,
          tests_failed: report.summary.failed,
          execution_time: report.summary.totalExecutionTime,
          last_updated: new Date().toISOString()
        }
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(updatedData, null, 2))
      console.log(`💾 JSON report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving JSON report:', error)
    }
  }

  private async saveHumanReadableReport(report: any): Promise<void> {
    const reportPath = path.join(this.outputPath, 'login-exploration-summary.md')
    
    try {
      const markdown = this.generateMarkdownReport(report)
      
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, markdown)
      console.log(`📝 Human-readable report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving human-readable report:', error)
    }
  }

  private async saveCoverageReport(coverage: TestCoverageReport): Promise<void> {
    const reportPath = path.join(this.outputPath, 'coverage-report.json')
    
    try {
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(coverage, null, 2))
      console.log(`📊 Coverage report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving coverage report:', error)
    }
  }

  private generateMarkdownReport(report: any): string {
    const { summary, coverage, issues, recommendations } = report
    
    return `# Login Flow Test Exploration Report

## Executive Summary

- **Total Scenarios**: ${summary.totalScenarios}
- **Tests Executed**: ${summary.totalResults}
- **Success Rate**: ${summary.successRate}%
- **Total Execution Time**: ${summary.totalExecutionTime}ms
- **Average Execution Time**: ${summary.averageExecutionTime}ms

## Test Results Breakdown

### By Status
- ✅ **Passed**: ${summary.passed}
- ❌ **Failed**: ${summary.failed}
- ⚠️ **Errors**: ${summary.errors}
- ⏭️ **Skipped**: ${summary.skipped}

### By Category
${Object.entries(coverage.coverageByCategory).map(([category, coverage]) => 
  `- **${category}**: ${coverage}% coverage`
).join('\n')}

### By Risk Level
${Object.entries(coverage.riskCoverage).map(([risk, coverage]) => 
  `- **${risk}**: ${coverage}% coverage`
).join('\n')}

## Issues Identified

${issues.length === 0 ? 'No issues found! 🎉' : issues.map((issue: any) =>
  `### ${issue.type.toUpperCase()}
- **Severity**: ${issue.severity}
- **Description**: ${issue.description}
- **Recommendation**: ${issue.recommendation}
`
).join('\n')}

## Recommendations

${recommendations.map((rec: any) =>
  `### ${rec.type.toUpperCase()}
- **Priority**: ${rec.priority}
- **Description**: ${rec.description}
- **Action**: ${rec.action}
`
).join('\n')}

## Coverage Analysis

### Category Coverage
${Object.entries(coverage.coverageByCategory).map(([category, coverage]) => {
  const status = (coverage as number) >= 80 ? '🟢' : (coverage as number) >= 60 ? '🟡' : '🔴'
  return `${status} **${category}**: ${coverage}%`
}).join('\n')}

### Risk Coverage
${Object.entries(coverage.riskCoverage).map(([risk, coverage]) => {
  const status = (coverage as number) >= 90 ? '🟢' : (coverage as number) >= 70 ? '🟡' : '🔴'
  return `${status} **${risk}**: ${coverage}%`
}).join('\n')}

---
*Report generated on ${new Date().toLocaleString()} by AI-Powered Test Generator Agent*
`
  }
}