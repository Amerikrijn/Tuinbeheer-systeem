import { TestResult, TestScenario } from '../test-generator/types'
import { 
  QualityAnalysis, 
  RiskAssessment, 
  CoverageAnalysis, 
  PerformanceMetrics, 
  ImprovementSuggestion,
  RiskFactor,
  CoverageGap,
  PerformanceTest
} from './types'

export class QualityAnalyzer {
  
  analyzeTestQuality(testResults: TestResult[], testScenarios: TestScenario[]): QualityAnalysis {
    const testQuality = this.analyzeTestQualityMetrics(testResults, testScenarios)
    const codeQuality = this.analyzeCodeQualityMetrics(testResults, testScenarios)
    const securityQuality = this.analyzeSecurityQualityMetrics(testResults, testScenarios)
    const performanceQuality = this.analyzePerformanceQualityMetrics(testResults)
    const maintainabilityQuality = this.analyzeMaintainabilityQualityMetrics(testResults, testScenarios)
    
    return {
      testQuality,
      codeQuality,
      securityQuality,
      performanceQuality,
      maintainabilityQuality
    }
  }

  private analyzeTestQualityMetrics(testResults: TestResult[], testScenarios: TestScenario[]): any {
    const totalTests = testResults.length
    const passedTests = testResults.filter(r => r.status === 'passed').length
    const failedTests = testResults.filter(r => r.status === 'failed').length
    const errorTests = testResults.filter(r => r.status === 'error').length
    
    // Calculate coverage based on executed vs total scenarios
    const coverage = testScenarios.length > 0 ? (totalTests / testScenarios.length) * 100 : 0
    
    // Calculate reliability (passed / total)
    const reliability = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    
    // Calculate maintainability based on test complexity
    const maintainability = this.calculateTestMaintainability(testResults)
    
    // Calculate readability (placeholder - would analyze test descriptions)
    const readability = 75 // Placeholder value
    
    // Calculate completeness based on scenario coverage
    const completeness = coverage
    
    return {
      coverage: Math.round(coverage * 100) / 100,
      reliability: Math.round(reliability * 100) / 100,
      maintainability: Math.round(maintainability * 100) / 100,
      readability: Math.round(readability * 100) / 100,
      completeness: Math.round(completeness * 100) / 100
    }
  }

  private analyzeCodeQualityMetrics(testResults: TestResult[], testScenarios: TestScenario[]): any {
    // Analyze code quality based on test results and scenarios
    const complexity = this.calculateCodeComplexity(testScenarios)
    const duplication = this.calculateCodeDuplication(testScenarios)
    const maintainability = this.calculateCodeMaintainability(testScenarios)
    const testability = this.calculateCodeTestability(testScenarios)
    const readability = this.calculateCodeReadability(testScenarios)
    
    return {
      complexity: Math.round(complexity * 100) / 100,
      duplication: Math.round(duplication * 100) / 100,
      maintainability: Math.round(maintainability * 100) / 100,
      testability: Math.round(testability * 100) / 100,
      readability: Math.round(readability * 100) / 100
    }
  }

  private analyzeSecurityQualityMetrics(testResults: TestResult[], testScenarios: TestScenario[]): any {
    // Count security-related tests
    const securityTests = testScenarios.filter(s => s.category === 'security')
    const securityResults = testResults.filter(r => 
      r.metadata?.category === 'security'
    )
    
    const vulnerabilityCount = this.countSecurityVulnerabilities(testResults)
    const riskLevel = this.determineSecurityRiskLevel(vulnerabilityCount, securityResults.length)
    const securityScore = this.calculateSecurityScore(securityResults, securityTests.length)
    const complianceStatus = this.determineComplianceStatus(securityScore)
    
    return {
      vulnerabilityCount,
      riskLevel,
      securityScore: Math.round(securityScore * 100) / 100,
      complianceStatus
    }
  }

  private analyzePerformanceQualityMetrics(testResults: TestResult[]): any {
    const executionTimes = testResults.map(r => r.executionTime).filter(t => t > 0)
    const avgExecutionTime = executionTimes.length > 0 ? 
      executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length : 0
    
    const responseTime = avgExecutionTime
    const throughput = this.calculateThroughput(testResults)
    const resourceUsage = this.calculateResourceUsage(testResults)
    const scalability = this.calculateScalability(testResults)
    const efficiency = this.calculateEfficiency(testResults)
    
    return {
      responseTime: Math.round(responseTime * 100) / 100,
      throughput: Math.round(throughput * 100) / 100,
      resourceUsage: Math.round(resourceUsage * 100) / 100,
      scalability: Math.round(scalability * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100
    }
  }

  private analyzeMaintainabilityQualityMetrics(testResults: TestResult[], testScenarios: TestScenario[]): any {
    const codeComplexity = this.calculateCodeComplexity(testScenarios)
    const documentation = this.calculateDocumentationQuality(testScenarios)
    const modularity = this.calculateModularity(testScenarios)
    const reusability = this.calculateReusability(testScenarios)
    const testability = this.calculateCodeTestability(testScenarios)
    
    return {
      codeComplexity: Math.round(codeComplexity * 100) / 100,
      documentation: Math.round(documentation * 100) / 100,
      modularity: Math.round(modularity * 100) / 100,
      reusability: Math.round(reusability * 100) / 100,
      testability: Math.round(testability * 100) / 100
    }
  }

  assessRisks(testResults: TestResult[], testScenarios: TestScenario[]): RiskAssessment {
    const riskFactors = this.identifyRiskFactors(testResults, testScenarios)
    const overallRisk = this.determineOverallRisk(riskFactors)
    const riskScore = this.calculateRiskScore(riskFactors)
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors)
    
    return {
      overallRisk,
      riskFactors,
      mitigationStrategies,
      riskScore
    }
  }

  private identifyRiskFactors(testResults: TestResult[], testScenarios: TestScenario[]): RiskFactor[] {
    const riskFactors: RiskFactor[] = []
    
    // Failed tests risk
    const failedTests = testResults.filter(r => r.status === 'failed')
    if (failedTests.length > 0) {
      riskFactors.push({
        id: 'failed-tests',
        category: 'test-quality',
        description: `${failedTests.length} tests failed, indicating potential code quality issues`,
        probability: 'high',
        impact: 'medium',
        riskLevel: 'medium',
        mitigation: 'Review and fix failed tests, investigate root causes'
      })
    }
    
    // Error tests risk
    const errorTests = testResults.filter(r => r.status === 'error')
    if (errorTests.length > 0) {
      riskFactors.push({
        id: 'error-tests',
        category: 'test-environment',
        description: `${errorTests.length} tests encountered errors, indicating environment or setup issues`,
        probability: 'medium',
        impact: 'high',
        riskLevel: 'high',
        mitigation: 'Fix test environment, resolve dependency issues'
      })
    }
    
    // Low coverage risk
    const coverage = testResults.length / testScenarios.length
    if (coverage < 0.8) {
      riskFactors.push({
        id: 'low-coverage',
        category: 'test-coverage',
        description: `Test coverage is ${Math.round(coverage * 100)}%, below recommended 80%`,
        probability: 'high',
        impact: 'high',
        riskLevel: 'high',
        mitigation: 'Increase test coverage, add missing test scenarios'
      })
    }
    
    // Security test failures
    const securityFailures = testResults.filter(r => 
      r.metadata?.category === 'security' && r.status === 'failed'
    )
    if (securityFailures.length > 0) {
      riskFactors.push({
        id: 'security-failures',
        category: 'security',
        description: `${securityFailures.length} security tests failed, indicating potential vulnerabilities`,
        probability: 'medium',
        impact: 'critical',
        riskLevel: 'critical',
        mitigation: 'Immediately investigate and fix security issues'
      })
    }
    
    return riskFactors
  }

  private determineOverallRisk(riskFactors: RiskFactor[]): 'low' | 'medium' | 'high' | 'critical' {
    if (riskFactors.some(r => r.riskLevel === 'critical')) return 'critical'
    if (riskFactors.some(r => r.riskLevel === 'high')) return 'high'
    if (riskFactors.some(r => r.riskLevel === 'medium')) return 'medium'
    return 'low'
  }

  private calculateRiskScore(riskFactors: RiskFactor[]): number {
    let score = 0
    
    riskFactors.forEach(factor => {
      const probabilityScore = this.getProbabilityScore(factor.probability)
      const impactScore = this.getImpactScore(factor.impact)
      score += probabilityScore * impactScore
    })
    
    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score))
  }

  private getProbabilityScore(probability: string): number {
    switch (probability) {
      case 'low': return 1
      case 'medium': return 3
      case 'high': return 5
      default: return 1
    }
  }

  private getImpactScore(impact: string): number {
    switch (impact) {
      case 'low': return 1
      case 'medium': return 3
      case 'high': return 5
      case 'critical': return 10
      default: return 1
    }
  }

  private generateMitigationStrategies(riskFactors: RiskFactor[]): string[] {
    const strategies: string[] = []
    
    riskFactors.forEach(factor => {
      if (factor.mitigation && !strategies.includes(factor.mitigation)) {
        strategies.push(factor.mitigation)
      }
    })
    
    // Add general strategies
    strategies.push('Implement continuous monitoring and alerting')
    strategies.push('Establish regular code review processes')
    strategies.push('Set up automated quality gates in CI/CD pipeline')
    
    return strategies
  }

  analyzeCoverage(testResults: TestResult[], testScenarios: TestScenario[]): CoverageAnalysis {
    const overallCoverage = this.calculateOverallCoverage(testResults, testScenarios)
    const functionalCoverage = this.calculateCategoryCoverage(testResults, testScenarios, 'functional')
    const securityCoverage = this.calculateCategoryCoverage(testResults, testScenarios, 'security')
    const edgeCaseCoverage = this.calculateCategoryCoverage(testResults, testScenarios, 'edge-case')
    const uiCoverage = this.calculateCategoryCoverage(testResults, testScenarios, 'ui')
    const performanceCoverage = this.calculateCategoryCoverage(testResults, testScenarios, 'performance')
    
    const gaps = this.identifyCoverageGaps(testResults, testScenarios)
    const recommendations = this.generateCoverageRecommendations(gaps)
    
    return {
      overallCoverage: Math.round(overallCoverage * 100) / 100,
      functionalCoverage: Math.round(functionalCoverage * 100) / 100,
      securityCoverage: Math.round(securityCoverage * 100) / 100,
      edgeCaseCoverage: Math.round(edgeCaseCoverage * 100) / 100,
      uiCoverage: Math.round(uiCoverage * 100) / 100,
      performanceCoverage: Math.round(performanceCoverage * 100) / 100,
      gaps,
      recommendations
    }
  }

  private calculateOverallCoverage(testResults: TestResult[], testScenarios: TestScenario[]): number {
    if (testScenarios.length === 0) return 0
    return (testResults.length / testScenarios.length) * 100
  }

  private calculateCategoryCoverage(testResults: TestResult[], testScenarios: TestScenario[], category: string): number {
    const categoryScenarios = testScenarios.filter(s => s.category === category)
    const categoryResults = testResults.filter(r => r.metadata?.category === category)
    
    if (categoryScenarios.length === 0) return 0
    return (categoryResults.length / categoryScenarios.length) * 100
  }

  private identifyCoverageGaps(testResults: TestResult[], testScenarios: TestScenario[]): CoverageGap[] {
    const gaps: CoverageGap[] = []
    
    // Find scenarios without results
    const executedScenarioIds = new Set(testResults.map(r => r.scenarioId))
    const uncoveredScenarios = testScenarios.filter(s => !executedScenarioIds.has(s.id))
    
    uncoveredScenarios.forEach(scenario => {
      gaps.push({
        id: `gap-${scenario.id}`,
        category: scenario.category,
        description: `Test scenario "${scenario.name}" was not executed`,
        severity: this.determineGapSeverity(scenario),
        impact: 'Reduced test coverage and potential quality issues',
        suggestedTests: [scenario.name]
      })
    })
    
    return gaps
  }

  private determineGapSeverity(scenario: TestScenario): 'low' | 'medium' | 'high' | 'critical' {
    if (scenario.riskLevel === 'critical') return 'critical'
    if (scenario.riskLevel === 'high') return 'high'
    if (scenario.category === 'security') return 'high'
    if (scenario.category === 'functional') return 'medium'
    return 'low'
  }

  private generateCoverageRecommendations(gaps: CoverageGap[]): string[] {
    const recommendations: string[] = []
    
    if (gaps.length > 0) {
      recommendations.push(`Execute ${gaps.length} uncovered test scenarios to improve coverage`)
    }
    
    const criticalGaps = gaps.filter(g => g.severity === 'critical')
    if (criticalGaps.length > 0) {
      recommendations.push(`Prioritize execution of ${criticalGaps.length} critical test scenarios`)
    }
    
    const securityGaps = gaps.filter(g => g.category === 'security')
    if (securityGaps.length > 0) {
      recommendations.push(`Ensure all ${securityGaps.length} security test scenarios are executed`)
    }
    
    return recommendations
  }

  evaluatePerformance(testResults: TestResult[]): PerformanceMetrics {
    const executionTimes = testResults.map(r => r.executionTime).filter(t => t > 0)
    const averageExecutionTime = executionTimes.length > 0 ? 
      executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length : 0
    
    const slowestTests = this.identifySlowestTests(testResults)
    const fastestTests = this.identifyFastestTests(testResults)
    const performanceTrend = this.determinePerformanceTrend(testResults)
    const bottlenecks = this.identifyBottlenecks(testResults)
    
    return {
      averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
      slowestTests,
      fastestTests,
      performanceTrend,
      bottlenecks
    }
  }

  private identifySlowestTests(testResults: TestResult[]): PerformanceTest[] {
    return testResults
      .filter(r => r.executionTime > 0)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 5)
      .map(r => ({
        testId: r.scenarioId,
        testName: 'Test', // Would get from scenario
        executionTime: r.executionTime,
        category: r.metadata?.category || 'unknown',
        performance: this.categorizePerformance(r.executionTime)
      }))
  }

  private identifyFastestTests(testResults: TestResult[]): PerformanceTest[] {
    return testResults
      .filter(r => r.executionTime > 0)
      .sort((a, b) => a.executionTime - b.executionTime)
      .slice(0, 5)
      .map(r => ({
        testId: r.scenarioId,
        testName: 'Test', // Would get from scenario
        executionTime: r.executionTime,
        category: r.metadata?.category || 'unknown',
        performance: this.categorizePerformance(r.executionTime)
      }))
  }

  private categorizePerformance(executionTime: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (executionTime < 100) return 'excellent'
    if (executionTime < 500) return 'good'
    if (executionTime < 1000) return 'acceptable'
    return 'poor'
  }

  private determinePerformanceTrend(testResults: TestResult[]): 'improving' | 'stable' | 'degrading' {
    // This would analyze historical data
    // For now, return stable
    return 'stable'
  }

  private identifyBottlenecks(testResults: TestResult[]): string[] {
    const bottlenecks: string[] = []
    
    const slowTests = testResults.filter(r => r.executionTime > 1000)
    if (slowTests.length > 0) {
      bottlenecks.push(`${slowTests.length} tests taking longer than 1 second`)
    }
    
    const errorTests = testResults.filter(r => r.status === 'error')
    if (errorTests.length > 0) {
      bottlenecks.push(`${errorTests.length} tests failing with errors`)
    }
    
    return bottlenecks
  }

  generateImprovementSuggestions(
    testResults: TestResult[],
    testScenarios: TestScenario[],
    testQuality: any,
    riskAssessment: RiskAssessment,
    coverageAnalysis: CoverageAnalysis,
    performanceMetrics: PerformanceMetrics
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = []
    
    // Test quality improvements
    if (testQuality.testQuality.coverage < 80) {
      suggestions.push({
        id: `improvement-${Date.now()}-1`,
        type: 'test',
        priority: 'high',
        category: 'coverage',
        title: 'Increase Test Coverage',
        description: 'Test coverage is below the recommended 80% threshold',
        currentState: `${Math.round(testQuality.testQuality.coverage)}% coverage`,
        targetState: '80%+ coverage',
        actionItems: [
          'Add missing test scenarios',
          'Execute uncovered test cases',
          'Review test generation strategy'
        ],
        estimatedEffort: 'medium',
        impact: 'high',
        risk: 'low',
        dependencies: [],
        tags: ['coverage', 'quality']
      })
    }
    
    // Security improvements
    if (testQuality.securityQuality.securityScore < 70) {
      suggestions.push({
        id: `improvement-${Date.now()}-2`,
        type: 'security',
        priority: 'critical',
        category: 'security',
        title: 'Improve Security Testing',
        description: 'Security test quality is below acceptable levels',
        currentState: `${Math.round(testQuality.securityQuality.securityScore)}% security score`,
        targetState: '70%+ security score',
        actionItems: [
          'Add comprehensive security test scenarios',
          'Implement vulnerability scanning',
          'Review authentication and authorization tests'
        ],
        estimatedEffort: 'high',
        impact: 'critical',
        risk: 'low',
        dependencies: [],
        tags: ['security', 'critical']
      })
    }
    
    // Performance improvements
    if (performanceMetrics.averageExecutionTime > 1000) {
      suggestions.push({
        id: `improvement-${Date.now()}-3`,
        type: 'performance',
        priority: 'medium',
        category: 'performance',
        title: 'Optimize Test Performance',
        description: 'Average test execution time is above 1 second',
        currentState: `${performanceMetrics.averageExecutionTime}ms average execution time`,
        targetState: '< 1000ms average execution time',
        actionItems: [
          'Identify and optimize slow tests',
          'Implement parallel test execution',
          'Review test setup and teardown processes'
        ],
        estimatedEffort: 'medium',
        impact: 'medium',
        risk: 'low',
        dependencies: [],
        tags: ['performance', 'optimization']
      })
    }
    
    // Risk mitigation
    if (riskAssessment.overallRisk === 'high' || riskAssessment.overallRisk === 'critical') {
      suggestions.push({
        id: `improvement-${Date.now()}-4`,
        type: 'test',
        priority: 'critical',
        category: 'risk-mitigation',
        title: 'Mitigate High-Risk Factors',
        description: 'Critical risk factors identified that require immediate attention',
        currentState: `${riskAssessment.overallRisk} risk level`,
        targetState: 'Medium or lower risk level',
        actionItems: [
          'Address critical security vulnerabilities',
          'Fix failing tests',
          'Improve test environment stability'
        ],
        estimatedEffort: 'high',
        impact: 'critical',
        risk: 'low',
        dependencies: [],
        tags: ['risk', 'critical', 'mitigation']
      })
    }
    
    return suggestions
  }

  // Helper methods for calculations
  private calculateTestMaintainability(testResults: TestResult[]): number {
    // Placeholder calculation
    return 75
  }

  private calculateCodeComplexity(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 60
  }

  private calculateCodeDuplication(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 20
  }

  private calculateCodeMaintainability(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 70
  }

  private calculateCodeTestability(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 80
  }

  private calculateCodeReadability(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 75
  }

  private countSecurityVulnerabilities(testResults: TestResult[]): number {
    // Count failed security tests
    return testResults.filter(r => 
      r.metadata?.category === 'security' && r.status === 'failed'
    ).length
  }

  private determineSecurityRiskLevel(vulnerabilityCount: number, securityTestCount: number): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnerabilityCount > 5) return 'critical'
    if (vulnerabilityCount > 2) return 'high'
    if (vulnerabilityCount > 0) return 'medium'
    return 'low'
  }

  private calculateSecurityScore(securityResults: TestResult[], totalSecurityTests: number): number {
    if (totalSecurityTests === 0) return 0
    
    const passedSecurityTests = securityResults.filter(r => r.status === 'passed').length
    return (passedSecurityTests / totalSecurityTests) * 100
  }

  private determineComplianceStatus(securityScore: number): 'compliant' | 'non-compliant' | 'partial' {
    if (securityScore >= 90) return 'compliant'
    if (securityScore >= 70) return 'partial'
    return 'non-compliant'
  }

  private calculateThroughput(testResults: TestResult[]): number {
    // Placeholder calculation
    return 85
  }

  private calculateResourceUsage(testResults: TestResult[]): number {
    // Placeholder calculation
    return 70
  }

  private calculateScalability(testResults: TestResult[]): number {
    // Placeholder calculation
    return 75
  }

  private calculateEfficiency(testResults: TestResult[]): number {
    // Placeholder calculation
    return 80
  }

  private calculateDocumentationQuality(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 65
  }

  private calculateModularity(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 70
  }

  private calculateReusability(testScenarios: TestScenario[]): number {
    // Placeholder calculation
    return 75
  }
}