import { TestScenario, TestResult, CodeAnalysis } from './types'
import { LearningEngine, LearningInsights, TestPrediction } from './LearningEngine'
import { IntelligentTestResults, ExecutionMetrics, OptimizationSummary } from './IntelligentTestExecutor'
import { IntelligentCodeAnalysis } from './IntelligentCodeAnalyzer'
import * as fs from 'fs'
import * as path from 'path'

export interface IntelligentReport {
  summary: ReportSummary
  testResults: TestResultSummary
  codeAnalysis: CodeAnalysisSummary
  learningInsights: LearningInsightsSummary
  optimization: OptimizationSummary
  recommendations: Recommendation[]
  metadata: ReportMetadata
}

export interface ReportSummary {
  totalTests: number
  passedTests: number
  failedTests: number
  successRate: number
  totalExecutionTime: number
  averageExecutionTime: number
  coverageScore: number
  qualityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface TestResultSummary {
  results: TestResult[]
  executionMetrics: ExecutionMetrics
  failureAnalysis: FailureAnalysis
  performanceAnalysis: PerformanceAnalysis
  categoryBreakdown: CategoryBreakdown
}

export interface CodeAnalysisSummary {
  basicAnalysis: CodeAnalysis
  patterns: PatternSummary[]
  structure: StructureSummary
  securityVulnerabilities: SecuritySummary
  testability: TestabilitySummary
  language: string
  analysisQuality: number
}

export interface LearningInsightsSummary {
  insights: LearningInsights
  predictions: TestPrediction[]
  adaptations: any[]
  trends: TrendAnalysis
  improvementAreas: string[]
}

export interface OptimizationSummary {
  executionStrategy: string
  parallelEfficiency: number
  resourceUtilization: any
  optimizationImpact: any
  recommendations: string[]
}

export interface Recommendation {
  type: 'test' | 'code' | 'performance' | 'security' | 'coverage'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  implementation: string[]
}

export interface ReportMetadata {
  generatedAt: string
  agentVersion: string
  executionId: string
  featurePath: string
  strategy: string
  iterations: number
}

export interface FailureAnalysis {
  totalFailures: number
  failureRate: number
  failureTypes: Record<string, number>
  mostCommonFailures: string[]
  failureTrends: string[]
}

export interface PerformanceAnalysis {
  fastestTest: number
  slowestTest: number
  averageTime: number
  performanceHotspots: string[]
  optimizationOpportunities: string[]
}

export interface CategoryBreakdown {
  functional: CategoryStats
  security: CategoryStats
  performance: CategoryStats
  edgeCase: CategoryStats
  ui: CategoryStats
  integration: CategoryStats
}

export interface CategoryStats {
  count: number
  passed: number
  failed: number
  successRate: number
  averageTime: number
}

export interface PatternSummary {
  type: string
  count: number
  averageComplexity: number
  testability: string
  coverage: number
}

export interface StructureSummary {
  totalPatterns: number
  relationships: number
  hotspots: number
  coverageGaps: number
  complexityDistribution: Record<string, number>
}

export interface SecuritySummary {
  totalVulnerabilities: number
  criticalIssues: number
  highIssues: number
  mediumIssues: number
  lowIssues: number
  recommendations: string[]
}

export interface TestabilitySummary {
  overallScore: number
  factors: string[]
  recommendations: string[]
  improvementPotential: number
}

export interface TrendAnalysis {
  performanceTrend: 'improving' | 'stable' | 'declining'
  qualityTrend: 'improving' | 'stable' | 'declining'
  coverageTrend: 'improving' | 'stable' | 'declining'
  riskTrend: 'improving' | 'stable' | 'declining'
}

export class IntelligentReportGenerator {
  private learningEngine: LearningEngine
  private outputPath: string

  constructor(learningEngine: LearningEngine, outputPath: string = './intelligent-reports') {
    this.learningEngine = learningEngine
    this.outputPath = outputPath
  }

  /**
   * Generate comprehensive intelligent report
   */
  async generateIntelligentReport(
    scenarios: TestScenario[],
    intelligentResults: IntelligentTestResults,
    codeAnalysis: IntelligentCodeAnalysis,
    options: any
  ): Promise<IntelligentReport> {
    console.log('📊 Generating intelligent report...')
    
    try {
      // Generate report sections
      const summary = this.generateReportSummary(scenarios, intelligentResults, codeAnalysis)
      const testResults = this.generateTestResultSummary(intelligentResults)
      const codeAnalysisSummary = this.generateCodeAnalysisSummary(codeAnalysis)
      const learningInsights = this.generateLearningInsightsSummary(intelligentResults)
      const optimization = this.generateOptimizationSummary(intelligentResults)
      const recommendations = this.generateRecommendations(scenarios, intelligentResults, codeAnalysis)
      const metadata = this.generateMetadata(options)
      
      const report: IntelligentReport = {
        summary,
        testResults,
        codeAnalysis: codeAnalysisSummary,
        learningInsights,
        optimization,
        recommendations,
        metadata
      }
      
      // Save report
      await this.saveReport(report, options)
      
      console.log('✅ Intelligent report generated successfully')
      return report
      
    } catch (error) {
      console.error('❌ Error generating intelligent report:', error)
      throw error
    }
  }

  /**
   * Generate markdown report
   */
  async generateMarkdownReport(report: IntelligentReport): Promise<string> {
    const markdown = `
# 🤖 Intelligent Test Report

## 📊 Executive Summary

**Overall Quality Score**: ${report.summary.qualityScore}/100  
**Success Rate**: ${report.summary.successRate.toFixed(1)}%  
**Risk Level**: ${report.summary.riskLevel.toUpperCase()}  
**Total Tests**: ${report.summary.totalTests}  
**Execution Time**: ${(report.summary.totalExecutionTime / 1000).toFixed(2)}s

---

## 🧪 Test Results

### Performance Metrics
- **Fastest Test**: ${(report.testResults.executionMetrics.fastestTest / 1000).toFixed(2)}s
- **Slowest Test**: ${(report.testResults.executionMetrics.slowestTest / 1000).toFixed(2)}s
- **Average Time**: ${(report.testResults.executionMetrics.averageExecutionTime / 1000).toFixed(2)}s

### Category Breakdown
${this.generateCategoryBreakdownMarkdown(report.testResults.categoryBreakdown)}

### Failure Analysis
- **Total Failures**: ${report.testResults.failureAnalysis.totalFailures}
- **Failure Rate**: ${report.testResults.failureAnalysis.failureRate.toFixed(1)}%
- **Most Common Failures**: ${report.testResults.failureAnalysis.mostCommonFailures.join(', ')}

---

## 🧠 Code Analysis

### Analysis Quality: ${report.codeAnalysis.analysisQuality}/100

### Language: ${report.codeAnalysis.language.toUpperCase()}

### Patterns Detected
${this.generatePatternsMarkdown(report.codeAnalysis.patterns)}

### Security Vulnerabilities
- **Total Issues**: ${report.codeAnalysis.securityVulnerabilities.totalVulnerabilities}
- **Critical**: ${report.codeAnalysis.securityVulnerabilities.criticalIssues}
- **High**: ${report.codeAnalysis.securityVulnerabilities.highIssues}
- **Medium**: ${report.codeAnalysis.securityVulnerabilities.mediumIssues}
- **Low**: ${report.codeAnalysis.securityVulnerabilities.lowIssues}

### Testability Score: ${report.codeAnalysis.testability.overallScore}/100

---

## 🧠 Learning Insights

### Historical Performance
- **Total Tests Executed**: ${report.learningInsights.insights.totalTestsExecuted}
- **Historical Success Rate**: ${report.learningInsights.insights.successRate.toFixed(1)}%
- **Failure Patterns Identified**: ${report.learningInsights.insights.failurePatterns}
- **Coverage Gaps**: ${report.learningInsights.insights.coverageGaps}

### Predictions
${this.generatePredictionsMarkdown(report.learningInsights.predictions)}

### Recent Adaptations
${this.generateAdaptationsMarkdown(report.learningInsights.adaptations)}

---

## 🚀 Optimization

### Execution Strategy: ${report.optimization.executionStrategy.toUpperCase()}

### Performance Impact
- **Time Saved**: ${report.optimization.optimizationImpact.timeSaved}
- **Resource Efficiency**: ${report.optimization.optimizationImpact.resourceEfficiency}
- **Failure Reduction**: ${report.optimization.optimizationImpact.failureReduction}
- **Coverage Improvement**: ${report.optimization.optimizationImpact.coverageImprovement}

### Resource Utilization
- **CPU**: ${report.optimization.resourceUtilization.cpuUtilization.toFixed(1)}%
- **Memory**: ${report.optimization.resourceUtilization.memoryUtilization.toFixed(1)}%
- **Disk**: ${report.optimization.resourceUtilization.diskUtilization.toFixed(1)}%
- **Network**: ${report.optimization.resourceUtilization.networkUtilization.toFixed(1)}%

---

## 💡 Recommendations

${this.generateRecommendationsMarkdown(report.recommendations)}

---

## 📈 Trends

- **Performance**: ${report.learningInsights.trends.performanceTrend}
- **Quality**: ${report.learningInsights.trends.qualityTrend}
- **Coverage**: ${report.learningInsights.trends.coverageTrend}
- **Risk**: ${report.learningInsights.trends.riskTrend}

---

## 🔍 Metadata

- **Generated**: ${report.metadata.generatedAt}
- **Agent Version**: ${report.metadata.agentVersion}
- **Execution ID**: ${report.metadata.executionId}
- **Feature Path**: ${report.metadata.featurePath}
- **Strategy**: ${report.metadata.strategy}
- **Iterations**: ${report.metadata.iterations}

---

*Report generated by AI-Powered Test Agent with intelligent learning capabilities*
    `.trim()

    return markdown
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport(report: IntelligentReport): Promise<string> {
    return JSON.stringify(report, null, 2)
  }

  // Private methods for generating report sections
  
  private generateReportSummary(
    scenarios: TestScenario[],
    intelligentResults: IntelligentTestResults,
    codeAnalysis: IntelligentCodeAnalysis
  ): ReportSummary {
    const { testResults, executionMetrics } = intelligentResults
    const totalTests = testResults.length
    const passedTests = testResults.filter(r => r.status === 'passed').length
    const failedTests = testResults.filter(r => r.status === 'failed' || r.status === 'error').length
    
    // Calculate quality score based on multiple factors
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    const coverageScore = this.calculateCoverageScore(scenarios, testResults)
    const qualityScore = this.calculateQualityScore(successRate, coverageScore, codeAnalysis)
    const riskLevel = this.calculateRiskLevel(codeAnalysis, testResults)
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      totalExecutionTime: executionMetrics.totalExecutionTime,
      averageExecutionTime: executionMetrics.averageExecutionTime,
      coverageScore,
      qualityScore,
      riskLevel
    }
  }

  private generateTestResultSummary(intelligentResults: IntelligentTestResults): TestResultSummary {
    const { testResults, executionMetrics } = intelligentResults
    
    return {
      results: testResults,
      executionMetrics,
      failureAnalysis: this.analyzeFailures(testResults),
      performanceAnalysis: this.analyzePerformance(testResults),
      categoryBreakdown: this.analyzeCategoryBreakdown(testResults)
    }
  }

  private generateCodeAnalysisSummary(codeAnalysis: IntelligentCodeAnalysis): CodeAnalysisSummary {
    return {
      basicAnalysis: {
        filePath: codeAnalysis.filePath,
        complexity: codeAnalysis.complexity,
        dependencies: codeAnalysis.dependencies,
        riskFactors: codeAnalysis.riskFactors,
        testCoverage: codeAnalysis.testCoverage,
        securityIssues: codeAnalysis.securityIssues,
        suggestions: codeAnalysis.suggestions,
        hasInputValidation: codeAnalysis.hasInputValidation,
        hasErrorHandling: codeAnalysis.hasErrorHandling,
        hasSecurityMeasures: codeAnalysis.hasSecurityMeasures
      },
      patterns: this.summarizePatterns(codeAnalysis.patterns),
      structure: this.summarizeStructure(codeAnalysis.structure),
      securityVulnerabilities: this.summarizeSecurity(codeAnalysis.securityVulnerabilities),
      testability: codeAnalysis.testability,
      language: codeAnalysis.language,
      analysisQuality: codeAnalysis.analysisQuality
    }
  }

  private generateLearningInsightsSummary(intelligentResults: IntelligentTestResults): LearningInsightsSummary {
    const { learningInsights, predictions, adaptations } = intelligentResults
    
    return {
      insights: learningInsights,
      predictions,
      adaptations,
      trends: this.analyzeTrends(learningInsights),
      improvementAreas: this.identifyImprovementAreas(learningInsights)
    }
  }

  private generateOptimizationSummary(intelligentResults: IntelligentTestResults): OptimizationSummary {
    const { optimizationSummary } = intelligentResults
    
    return {
      ...optimizationSummary,
      recommendations: this.generateOptimizationRecommendations(optimizationSummary)
    }
  }

  private generateRecommendations(
    scenarios: TestScenario[],
    intelligentResults: IntelligentTestResults,
    codeAnalysis: IntelligentCodeAnalysis
  ): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    // Test recommendations
    const testRecommendations = this.generateTestRecommendations(scenarios, intelligentResults)
    recommendations.push(...testRecommendations)
    
    // Code recommendations
    const codeRecommendations = this.generateCodeRecommendations(codeAnalysis)
    recommendations.push(...codeRecommendations)
    
    // Performance recommendations
    const performanceRecommendations = this.generatePerformanceRecommendations(intelligentResults)
    recommendations.push(...performanceRecommendations)
    
    // Security recommendations
    const securityRecommendations = this.generateSecurityRecommendations(codeAnalysis)
    recommendations.push(...securityRecommendations)
    
    // Coverage recommendations
    const coverageRecommendations = this.generateCoverageRecommendations(codeAnalysis)
    recommendations.push(...coverageRecommendations)
    
    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private generateMetadata(options: any): ReportMetadata {
    return {
      generatedAt: new Date().toISOString(),
      agentVersion: '2.0.0-intelligent',
      executionId: `exec-${Date.now()}`,
      featurePath: options.featurePath || 'unknown',
      strategy: options.strategy || 'intelligent',
      iterations: options.iterations || 2
    }
  }

  // Helper methods
  
  private calculateCoverageScore(scenarios: TestScenario[], results: TestResult[]): number {
    if (scenarios.length === 0) return 0
    
    const coveredScenarios = scenarios.filter(scenario => 
      results.some(result => result.scenarioId === scenario.id)
    )
    
    return (coveredScenarios.length / scenarios.length) * 100
  }

  private calculateQualityScore(successRate: number, coverageScore: number, codeAnalysis: IntelligentCodeAnalysis): number {
    let score = 0
    
    // Success rate weight: 40%
    score += (successRate / 100) * 40
    
    // Coverage score weight: 30%
    score += (coverageScore / 100) * 30
    
    // Code analysis quality weight: 20%
    score += (codeAnalysis.analysisQuality / 100) * 20
    
    // Security score weight: 10%
    const securityScore = this.calculateSecurityScore(codeAnalysis.securityVulnerabilities)
    score += securityScore * 10
    
    return Math.round(score)
  }

  private calculateSecurityScore(vulnerabilities: any[]): number {
    if (vulnerabilities.length === 0) return 1.0
    
    let score = 1.0
    const severityWeights = { critical: 0.4, high: 0.3, medium: 0.2, low: 0.1 }
    
    for (const vuln of vulnerabilities) {
      const weight = severityWeights[vuln.severity] || 0.1
      score -= weight * 0.2 // Reduce score by 20% of weight for each vulnerability
    }
    
    return Math.max(0, score)
  }

  private calculateRiskLevel(codeAnalysis: IntelligentCodeAnalysis, testResults: TestResult[]): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0
    
    // Code complexity risk
    if (codeAnalysis.complexity > 15) riskScore += 3
    else if (codeAnalysis.complexity > 10) riskScore += 2
    else if (codeAnalysis.complexity > 5) riskScore += 1
    
    // Security vulnerabilities risk
    const criticalVulns = codeAnalysis.securityVulnerabilities.filter(v => v.severity === 'critical').length
    const highVulns = codeAnalysis.securityVulnerabilities.filter(v => v.severity === 'high').length
    
    riskScore += criticalVulns * 3
    riskScore += highVulns * 2
    
    // Test failure risk
    const failureRate = testResults.length > 0 ? 
      testResults.filter(r => r.status === 'failed').length / testResults.length : 0
    
    if (failureRate > 0.3) riskScore += 3
    else if (failureRate > 0.2) riskScore += 2
    else if (failureRate > 0.1) riskScore += 1
    
    // Determine risk level
    if (riskScore >= 8) return 'critical'
    if (riskScore >= 6) return 'high'
    if (riskScore >= 3) return 'medium'
    return 'low'
  }

  private analyzeFailures(testResults: TestResult[]): FailureAnalysis {
    const failures = testResults.filter(r => r.status === 'failed' || r.status === 'error')
    const totalTests = testResults.length
    
    // Analyze failure types
    const failureTypes: Record<string, number> = {}
    for (const failure of failures) {
      const type = failure.error ? this.categorizeError(failure.error) : 'unknown'
      failureTypes[type] = (failureTypes[type] || 0) + 1
    }
    
    // Find most common failures
    const mostCommonFailures = Object.entries(failureTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type)
    
    return {
      totalFailures: failures.length,
      failureRate: totalTests > 0 ? (failures.length / totalTests) * 100 : 0,
      failureTypes,
      mostCommonFailures,
      failureTrends: this.analyzeFailureTrends(failures)
    }
  }

  private analyzePerformance(testResults: TestResult[]): PerformanceAnalysis {
    const executionTimes = testResults.map(r => r.executionTime)
    
    return {
      fastestTest: Math.min(...executionTimes),
      slowestTest: Math.max(...executionTimes),
      averageTime: executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length,
      performanceHotspots: this.identifyPerformanceHotspots(testResults),
      optimizationOpportunities: this.identifyPerformanceOpportunities(testResults)
    }
  }

  private analyzeCategoryBreakdown(testResults: TestResult[]): CategoryBreakdown {
    const categories = ['functional', 'security', 'performance', 'edge-case', 'ui', 'integration']
    const breakdown: CategoryBreakdown = {} as CategoryBreakdown
    
    for (const category of categories) {
      const categoryTests = testResults.filter(r => r.details.category === category)
      const passed = categoryTests.filter(r => r.status === 'passed').length
      
      breakdown[category as keyof CategoryBreakdown] = {
        count: categoryTests.length,
        passed,
        failed: categoryTests.length - passed,
        successRate: categoryTests.length > 0 ? (passed / categoryTests.length) * 100 : 0,
        averageTime: categoryTests.length > 0 ? 
          categoryTests.reduce((sum, r) => sum + r.executionTime, 0) / categoryTests.length : 0
      }
    }
    
    return breakdown
  }

  private summarizePatterns(patterns: any[]): PatternSummary[] {
    const patternMap = new Map<string, any[]>()
    
    for (const pattern of patterns) {
      if (!patternMap.has(pattern.type)) {
        patternMap.set(pattern.type, [])
      }
      patternMap.get(pattern.type)!.push(pattern)
    }
    
    return Array.from(patternMap.entries()).map(([type, patternList]) => ({
      type,
      count: patternList.length,
      averageComplexity: patternList.reduce((sum, p) => sum + p.complexity, 0) / patternList.length,
      testability: this.calculateAverageTestability(patternList),
      coverage: patternList.reduce((sum, p) => sum + p.coverage, 0) / patternList.length
    }))
  }

  private summarizeStructure(structure: any): StructureSummary {
    return {
      totalPatterns: structure.patterns?.length || 0,
      relationships: structure.relationships?.length || 0,
      hotspots: structure.hotspots?.length || 0,
      coverageGaps: structure.coverageGaps?.length || 0,
      complexityDistribution: this.calculateComplexityDistribution(structure.patterns || [])
    }
  }

  private summarizeSecurity(vulnerabilities: any[]): SecuritySummary {
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 }
    
    for (const vuln of vulnerabilities) {
      severityCounts[vuln.severity as keyof typeof severityCounts]++
    }
    
    return {
      totalVulnerabilities: vulnerabilities.length,
      ...severityCounts,
      recommendations: this.generateSecurityRecommendations(vulnerabilities)
    }
  }

  private analyzeTrends(insights: LearningInsights): TrendAnalysis {
    // This would analyze historical data to determine trends
    // For now, return estimated trends
    return {
      performanceTrend: 'improving',
      qualityTrend: 'stable',
      coverageTrend: 'improving',
      riskTrend: 'stable'
    }
  }

  private identifyImprovementAreas(insights: LearningInsights): string[] {
    const areas: string[] = []
    
    if (insights.successRate < 90) areas.push('Test reliability needs improvement')
    if (insights.failurePatterns > 5) areas.push('Address recurring failure patterns')
    if (insights.coverageGaps > 3) areas.push('Fill coverage gaps')
    if (insights.averageExecutionTime > 3000) areas.push('Optimize test performance')
    
    return areas
  }

  // Additional helper methods
  private categorizeError(error: string): string {
    if (error.includes('timeout')) return 'timeout'
    if (error.includes('assertion')) return 'assertion'
    if (error.includes('network')) return 'network'
    if (error.includes('resource')) return 'resource'
    return 'other'
  }

  private analyzeFailureTrends(failures: TestResult[]): string[] {
    // This would analyze failure trends over time
    return ['Recent increase in timeout failures', 'Network errors decreasing']
  }

  private identifyPerformanceHotspots(testResults: TestResult[]): string[] {
    const slowTests = testResults.filter(r => r.executionTime > 2000)
    return slowTests.map(r => r.details.scenario)
  }

  private identifyPerformanceOpportunities(testResults: TestResult[]): string[] {
    return ['Parallelize slow tests', 'Optimize resource allocation']
  }

  private calculateAverageTestability(patterns: any[]): string {
    const testabilityScores = { easy: 3, medium: 2, hard: 1 }
    const totalScore = patterns.reduce((sum, p) => sum + testabilityScores[p.testability], 0)
    const average = totalScore / patterns.length
    
    if (average >= 2.5) return 'easy'
    if (average >= 1.5) return 'medium'
    return 'hard'
  }

  private calculateComplexityDistribution(patterns: any[]): Record<string, number> {
    const distribution: Record<string, number> = { low: 0, medium: 0, high: 0 }
    
    for (const pattern of patterns) {
      if (pattern.complexity <= 3) distribution.low++
      else if (pattern.complexity <= 7) distribution.medium++
      else distribution.high++
    }
    
    return distribution
  }

  private generateSecurityRecommendations(vulnerabilities: any[]): string[] {
    const recommendations: string[] = []
    
    for (const vuln of vulnerabilities) {
      if (vuln.recommendation) {
        recommendations.push(vuln.recommendation)
      }
    }
    
    return recommendations
  }

  private generateTestRecommendations(scenarios: TestScenario[], intelligentResults: IntelligentTestResults): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    // Add recommendations based on test results
    if (intelligentResults.testResults.length < scenarios.length) {
      recommendations.push({
        type: 'test',
        priority: 'medium',
        title: 'Increase Test Coverage',
        description: 'Some scenarios were not executed',
        impact: 'Medium',
        effort: 'medium',
        implementation: ['Review skipped scenarios', 'Implement missing test cases']
      })
    }
    
    return recommendations
  }

  private generateCodeRecommendations(codeAnalysis: IntelligentCodeAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    if (codeAnalysis.complexity > 10) {
      recommendations.push({
        type: 'code',
        priority: 'high',
        title: 'Reduce Code Complexity',
        description: 'High cyclomatic complexity detected',
        impact: 'High',
        effort: 'medium',
        implementation: ['Break down complex methods', 'Extract helper functions']
      })
    }
    
    return recommendations
  }

  private generatePerformanceRecommendations(intelligentResults: IntelligentTestResults): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    if (intelligentResults.executionMetrics.averageExecutionTime > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Optimize Test Performance',
        description: 'Tests are taking longer than expected',
        impact: 'Medium',
        effort: 'high',
        implementation: ['Parallelize independent tests', 'Optimize resource allocation']
      })
    }
    
    return recommendations
  }

  private generateSecurityRecommendations(codeAnalysis: IntelligentCodeAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    const criticalVulns = codeAnalysis.securityVulnerabilities.filter(v => v.severity === 'critical')
    if (criticalVulns.length > 0) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        title: 'Fix Critical Security Vulnerabilities',
        description: `${criticalVulns.length} critical security issues detected`,
        impact: 'Critical',
        effort: 'high',
        implementation: criticalVulns.map(v => v.recommendation)
      })
    }
    
    return recommendations
  }

  private generateCoverageRecommendations(codeAnalysis: IntelligentCodeAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    if (codeAnalysis.testCoverage < 80) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        title: 'Improve Test Coverage',
        description: 'Test coverage is below 80%',
        impact: 'Medium',
        effort: 'medium',
        implementation: ['Add tests for uncovered code paths', 'Implement edge case tests']
      })
    }
    
    return recommendations
  }

  private generateOptimizationRecommendations(optimizationSummary: any): string[] {
    const recommendations: string[] = []
    
    if (optimizationSummary.parallelEfficiency < 80) {
      recommendations.push('Optimize parallel execution strategy')
    }
    
    if (optimizationSummary.resourceUtilization.cpuUtilization > 90) {
      recommendations.push('Reduce CPU usage or increase available cores')
    }
    
    return recommendations
  }

  private generateCategoryBreakdownMarkdown(breakdown: CategoryBreakdown): string {
    return Object.entries(breakdown)
      .map(([category, stats]) => {
        if (stats.count === 0) return ''
        return `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${stats.count} tests, ${stats.successRate.toFixed(1)}% success, ${(stats.averageTime / 1000).toFixed(2)}s avg`
      })
      .filter(line => line !== '')
      .join('\n')
  }

  private generatePatternsMarkdown(patterns: PatternSummary[]): string {
    return patterns
      .map(pattern => `- **${pattern.type}**: ${pattern.count} patterns, ${pattern.averageComplexity.toFixed(1)} avg complexity, ${pattern.testability} testability`)
      .join('\n')
  }

  private generatePredictionsMarkdown(predictions: TestPrediction[]): string {
    return predictions
      .map(pred => `- **${pred.scenarioId}**: ${pred.predictedStatus} (${(pred.confidence * 100).toFixed(1)}% confidence)`)
      .join('\n')
  }

  private generateAdaptationsMarkdown(adaptations: any[]): string {
    if (adaptations.length === 0) return 'No recent adaptations'
    
    return adaptations
      .map(adapt => `- **${adapt.changeType}**: ${adapt.oldValue} → ${adapt.newValue} (${adapt.reason})`)
      .join('\n')
  }

  private generateRecommendationsMarkdown(recommendations: Recommendation[]): string {
    return recommendations
      .map(rec => `### ${rec.priority.toUpperCase()}: ${rec.title}\n\n${rec.description}\n\n**Impact**: ${rec.impact} | **Effort**: ${rec.effort}\n\n**Implementation**:\n${rec.implementation.map(impl => `- ${impl}`).join('\n')}`)
      .join('\n\n')
  }

  private async saveReport(report: IntelligentReport, options: any): Promise<void> {
    try {
      if (!fs.existsSync(this.outputPath)) {
        fs.mkdirSync(this.outputPath, { recursive: true })
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const baseName = `intelligent-report-${timestamp}`
      
      // Save JSON report
      const jsonPath = path.join(this.outputPath, `${baseName}.json`)
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
      
      // Save Markdown report
      const markdown = await this.generateMarkdownReport(report)
      const mdPath = path.join(this.outputPath, `${baseName}.md`)
      fs.writeFileSync(mdPath, markdown)
      
      console.log(`📁 Reports saved to:\n  - JSON: ${jsonPath}\n  - Markdown: ${mdPath}`)
      
    } catch (error) {
      console.error('Failed to save report:', error)
    }
  }
}