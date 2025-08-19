import { QualityAnalyzer } from './QualityAnalyzer'
import { ReportGenerator } from './ReportGenerator'
import { QualityAnalysisOptions, QualityReport } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class QualityAnalyzerAgent {
  private qualityAnalyzer: QualityAnalyzer
  private reportGenerator: ReportGenerator
  private options: QualityAnalysisOptions
  private iterationResults: any[] = []

  constructor(options: QualityAnalysisOptions) {
    this.options = options
    this.qualityAnalyzer = new QualityAnalyzer()
    this.reportGenerator = new ReportGenerator()
  }

  /**
   * Main execution method with 2 iterations
   */
  async run(): Promise<any> {
    console.log('🔍 AI-Powered Quality Analyzer Agent Starting...')
    console.log(`📁 Test Results: ${this.options.testResults}`)
    console.log(`📋 Test Scenarios: ${this.options.testScenarios}`)
    console.log(`🔄 Max iterations: 2 (with improvement tracking)`)
    console.log('')

    try {
      // Iteratie 1: Basis kwaliteitsanalyse
      console.log('🔄 Iteratie 1: Basis kwaliteitsanalyse...')
      const iteration1Result = await this.executeIteration(1)
      this.iterationResults.push(iteration1Result)
      
      console.log(`📊 Iteratie 1 Resultaat: Kwaliteit: ${iteration1Result.qualityScore}/100, Grade: ${iteration1Result.overallGrade}`)
      console.log('')

      // Iteratie 2: Verbeterde kwaliteitsanalyse
      console.log('🔄 Iteratie 2: Verbeterde kwaliteitsanalyse...')
      const iteration2Result = await this.executeIteration(2, iteration1Result)
      this.iterationResults.push(iteration2Result)
      
      console.log(`📊 Iteratie 2 Resultaat: Kwaliteit: ${iteration2Result.qualityScore}/100, Grade: ${iteration2Result.overallGrade}`)
      console.log('')

      // Vergelijk resultaten
      this.showImprovementSummary(iteration1Result, iteration2Result)

      // Genereer rapporten
      const finalReport = await this.generateFinalReport(iteration2Result)
      
      return finalReport

    } catch (error) {
      console.error('❌ Error during quality analysis:', error)
      throw error
    }
  }

  /**
   * Execute a single iteration
   */
  private async executeIteration(iterationNumber: number, previousResult?: any): Promise<any> {
    const startTime = Date.now()
    
    try {
      // Load test data
      const testData = await this.loadTestData()
      
      // Analyze quality with improvement logic
      let analysis = await this.qualityAnalyzer.analyzeTestQuality(testData.testResults, testData.testScenarios)
      
      if (iterationNumber === 2 && previousResult) {
        // Improve analysis in second iteration
        analysis = await this.improveAnalysis(analysis, previousResult, testData)
      }
      
      // Calculate quality score for this iteration
      const qualityScore = this.calculateQualityScore(analysis, testData)
      const overallGrade = this.calculateOverallGrade(qualityScore)
      
      const result = {
        iteration: iterationNumber,
        analysis,
        qualityScore,
        overallGrade,
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
   * Load test data from files
   */
  private async loadTestData(): Promise<any> {
    try {
      // Load test results
      let testResults = []
      if (this.options.testResults && typeof this.options.testResults === 'string' && fs.existsSync(this.options.testResults)) {
        const testResultsContent = fs.readFileSync(this.options.testResults, 'utf-8')
        testResults = JSON.parse(testResultsContent)
      } else if (Array.isArray(this.options.testResults)) {
        testResults = this.options.testResults
      }
      
      // Load test scenarios
      let testScenarios = []
      if (this.options.testScenarios && typeof this.options.testScenarios === 'string' && fs.existsSync(this.options.testScenarios)) {
        const testScenariosContent = fs.readFileSync(this.options.testScenarios, 'utf-8')
        testScenarios = JSON.parse(testScenariosContent)
      } else if (Array.isArray(this.options.testScenarios)) {
        testScenarios = this.options.testScenarios
      }
      
      return { testResults, testScenarios }
    } catch (error) {
      console.error('❌ Error loading test data:', error)
      return { testResults: [], testScenarios: [] }
    }
  }

  /**
   * Improve analysis based on previous iteration
   */
  private async improveAnalysis(analysis: any, previousResult: any, testData: any): Promise<any> {
    const improvedAnalysis = { ...analysis }

    // Add more detailed metrics
    improvedAnalysis.metrics = {
      ...improvedAnalysis.metrics,
      testCoverage: this.calculateTestCoverage(testData),
      codeComplexity: this.analyzeCodeComplexity(testData),
      securityScore: this.calculateSecurityScore(testData),
      maintainabilityScore: this.calculateMaintainabilityScore(testData),
      reliabilityScore: this.calculateReliabilityScore(testData)
    }

    // Add more detailed risk assessment
    improvedAnalysis.riskAssessment = {
      ...improvedAnalysis.riskAssessment,
      detailedRisks: this.identifyDetailedRisks(testData),
      riskTrends: this.analyzeRiskTrends(previousResult, improvedAnalysis),
      mitigationStrategies: this.generateMitigationStrategies(improvedAnalysis.riskAssessment)
    }

    // Add more detailed recommendations
    improvedAnalysis.recommendations = [
      ...improvedAnalysis.recommendations,
      ...this.generateAdvancedRecommendations(improvedAnalysis, testData)
    ]

    return improvedAnalysis
  }

  /**
   * Calculate test coverage
   */
  private calculateTestCoverage(testData: any): number {
    const { testResults, testScenarios } = testData
    
    if (!testScenarios || testScenarios.length === 0) return 0
    
    const executedScenarios = testResults?.length || 0
    const totalScenarios = testScenarios.length
    
    return Math.round((executedScenarios / totalScenarios) * 100)
  }

  /**
   * Analyze code complexity
   */
  private analyzeCodeComplexity(testData: any): any {
    const { testScenarios } = testData
    
    if (!testScenarios) return { score: 0, level: 'low' }
    
    // Analyze complexity based on test scenarios
    const complexityIndicators = {
      highPriority: testScenarios.filter((s: any) => s.priority === 'critical' || s.priority === 'high').length,
      securityTests: testScenarios.filter((s: any) => s.category === 'security').length,
      edgeCases: testScenarios.filter((s: any) => s.category === 'edge-case').length
    }
    
    let complexityScore = 0
    complexityScore += complexityIndicators.highPriority * 10
    complexityScore += complexityIndicators.securityTests * 15
    complexityScore += complexityIndicators.edgeCases * 5
    
    const level = complexityScore > 50 ? 'high' : complexityScore > 25 ? 'medium' : 'low'
    
    return {
      score: Math.min(complexityScore, 100),
      level,
      indicators: complexityIndicators
    }
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(testData: any): number {
    const { testScenarios, testResults } = testData
    
    if (!testScenarios) return 0
    
    const securityTests = testScenarios.filter((s: any) => s.category === 'security')
    if (securityTests.length === 0) return 30 // Low score if no security tests
    
    const securityResults = testResults?.filter((r: any) => 
      securityTests.some((s: any) => s.id === r.scenarioId)
    ) || []
    
    const passedSecurityTests = securityResults.filter((r: any) => r.status === 'passed').length
    const totalSecurityTests = securityResults.length
    
    if (totalSecurityTests === 0) return 50
    
    const baseScore = (passedSecurityTests / totalSecurityTests) * 70
    const bonusScore = securityTests.length * 2 // Bonus for having security tests
    
    return Math.min(Math.round(baseScore + bonusScore), 100)
  }

  /**
   * Calculate maintainability score
   */
  private calculateMaintainabilityScore(testData: any): number {
    const { testScenarios } = testData
    
    if (!testScenarios) return 0
    
    // Analyze maintainability based on test structure
    const maintainabilityIndicators = {
      wellNamed: testScenarios.filter((s: any) => 
        s.name && s.name.length > 10 && s.name.length < 100
      ).length,
      documented: testScenarios.filter((s: any) => 
        s.description && s.description.length > 20
      ).length,
      categorized: testScenarios.filter((s: any) => 
        s.category && s.tags && s.tags.length > 0
      ).length
    }
    
    const totalTests = testScenarios.length
    let score = 0
    
    score += (maintainabilityIndicators.wellNamed / totalTests) * 40
    score += (maintainabilityIndicators.documented / totalTests) * 40
    score += (maintainabilityIndicators.categorized / totalTests) * 20
    
    return Math.round(score)
  }

  /**
   * Calculate reliability score
   */
  private calculateReliabilityScore(testData: any): number {
    const { testResults } = testData
    
    if (!testResults || testResults.length === 0) return 0
    
    const totalTests = testResults.length
    const passedTests = testResults.filter((r: any) => r.status === 'passed').length
    const failedTests = testResults.filter((r: any) => r.status === 'failed').length
    const errorTests = testResults.filter((r: any) => r.status === 'error').length
    
    // Base score from pass rate
    let score = (passedTests / totalTests) * 60
    
    // Penalty for errors (more severe than failures)
    score -= (errorTests / totalTests) * 30
    
    // Penalty for failures
    score -= (failedTests / totalTests) * 20
    
    // Bonus for consistent execution
    const executionTimes = testResults.map((r: any) => r.executionTime || 0)
    const avgExecutionTime = executionTimes.reduce((sum: number, time: number) => sum + time, 0) / executionTimes.length
    const timeConsistency = executionTimes.filter((time: number) => 
      Math.abs(time - avgExecutionTime) < avgExecutionTime * 0.5
    ).length / executionTimes.length
    
    score += timeConsistency * 10
    
    return Math.max(Math.round(score), 0)
  }

  /**
   * Identify detailed risks
   */
  private identifyDetailedRisks(testData: any): any[] {
    const { testScenarios, testResults } = testData
    const risks = []
    
    // Test coverage risks
    if (testScenarios && testResults) {
      const coverage = this.calculateTestCoverage(testData)
      if (coverage < 80) {
        risks.push({
          type: 'coverage',
          severity: 'medium',
          description: `Low test coverage: ${coverage}%`,
          impact: 'May miss critical bugs',
          recommendation: 'Increase test coverage to at least 80%'
        })
      }
    }
    
    // Security risks
    const securityTests = testScenarios?.filter((s: any) => s.category === 'security') || []
    if (securityTests.length === 0) {
      risks.push({
        type: 'security',
        severity: 'high',
        description: 'No security tests found',
        impact: 'Security vulnerabilities may go undetected',
        recommendation: 'Implement comprehensive security testing'
      })
    }
    
    // Performance risks
    const performanceTests = testScenarios?.filter((s: any) => s.category === 'performance') || []
    if (performanceTests.length === 0) {
      risks.push({
        type: 'performance',
        severity: 'medium',
        description: 'No performance tests found',
        impact: 'Performance issues may go undetected',
        recommendation: 'Add performance testing scenarios'
      })
    }
    
    return risks
  }

  /**
   * Analyze risk trends
   */
  private analyzeRiskTrends(previousResult: any, currentAnalysis: any): any[] {
    const trends = []
    
    if (previousResult && previousResult.analysis) {
      const previousRisks = previousResult.analysis.riskAssessment?.risks || []
      const currentRisks = currentAnalysis.riskAssessment?.risks || []
      
      // Risk count trend
      if (currentRisks.length > previousRisks.length) {
        trends.push({
          type: 'risk-increase',
          description: `Risk count increased from ${previousRisks.length} to ${currentRisks.length}`,
          severity: 'medium',
          recommendation: 'Review new risks and prioritize mitigation'
        })
      } else if (currentRisks.length < previousRisks.length) {
        trends.push({
          type: 'risk-decrease',
          description: `Risk count decreased from ${previousRisks.length} to ${currentRisks.length}`,
          severity: 'low',
          recommendation: 'Continue current risk mitigation strategies'
        })
      }
      
      // Quality score trend
      const qualityChange = currentAnalysis.qualityScore - previousResult.qualityScore
      if (qualityChange > 0) {
        trends.push({
          type: 'quality-improvement',
          description: `Quality score improved by +${qualityChange} points`,
          severity: 'low',
          recommendation: 'Maintain current quality practices'
        })
      } else if (qualityChange < 0) {
        trends.push({
          type: 'quality-decline',
          description: `Quality score declined by ${Math.abs(qualityChange)} points`,
          severity: 'high',
          recommendation: 'Investigate quality decline and implement corrective actions'
        })
      }
    }
    
    return trends
  }

  /**
   * Generate mitigation strategies
   */
  private generateMitigationStrategies(riskAssessment: any): any[] {
    const strategies = []
    
    if (riskAssessment.overallRisk === 'critical' || riskAssessment.overallRisk === 'high') {
      strategies.push({
        priority: 'immediate',
        action: 'Conduct comprehensive security audit',
        timeline: 'Within 24 hours',
        resources: 'Security team, external auditor if needed'
      })
      
      strategies.push({
        priority: 'high',
        action: 'Implement automated security scanning',
        timeline: 'Within 1 week',
        resources: 'DevOps team, security tools'
      })
    }
    
    if (riskAssessment.overallRisk === 'medium') {
      strategies.push({
        priority: 'medium',
        action: 'Review and update test coverage',
        timeline: 'Within 1 week',
        resources: 'QA team, developers'
      })
    }
    
    strategies.push({
      priority: 'ongoing',
      action: 'Regular quality reviews and monitoring',
      timeline: 'Continuous',
      resources: 'All team members, automated tools'
    })
    
    return strategies
  }

  /**
   * Generate advanced recommendations
   */
  private generateAdvancedRecommendations(analysis: any, testData: any): any[] {
    const recommendations = []
    
    // Coverage-based recommendations
    const coverage = this.calculateTestCoverage(testData)
    if (coverage < 90) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        description: `Increase test coverage from ${coverage}% to 90%+`,
        action: 'Add more test scenarios for uncovered functionality',
        impact: 'Higher confidence in code quality'
      })
    }
    
    // Performance-based recommendations
    if (analysis.metrics?.performanceScore < 80) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        description: 'Improve performance testing coverage',
        action: 'Add load testing, stress testing, and performance benchmarks',
        impact: 'Better performance under load'
      })
    }
    
    // Security-based recommendations
    if (analysis.metrics?.securityScore < 85) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        description: 'Enhance security testing',
        action: 'Implement penetration testing, vulnerability scanning, and security code review',
        impact: 'Reduced security risks'
      })
    }
    
    // Maintainability-based recommendations
    if (analysis.metrics?.maintainabilityScore < 75) {
      recommendations.push({
        type: 'maintainability',
        priority: 'medium',
        description: 'Improve code maintainability',
        action: 'Refactor complex code, improve documentation, and standardize naming conventions',
        impact: 'Easier maintenance and faster development'
      })
    }
    
    return recommendations
  }

  /**
   * Calculate quality score for an iteration
   */
  private calculateQualityScore(analysis: any, testData: any): number {
    let score = 0
    
    // Base score from analysis
    if (analysis.metrics) {
      score += (analysis.metrics.testCoverage || 0) * 0.3
      score += (analysis.metrics.securityScore || 0) * 0.25
      score += (analysis.metrics.maintainabilityScore || 0) * 0.2
      score += (analysis.metrics.reliabilityScore || 0) * 0.25
    }
    
    // Bonus for comprehensive analysis
    if (analysis.recommendations && analysis.recommendations.length > 5) {
      score += 10
    }
    
    // Bonus for low risk
    if (analysis.riskAssessment?.overallRisk === 'low') {
      score += 10
    }
    
    return Math.round(Math.min(score, 100))
  }

  /**
   * Calculate overall grade
   */
  private calculateOverallGrade(qualityScore: number): string {
    if (qualityScore >= 90) return 'A'
    if (qualityScore >= 80) return 'B'
    if (qualityScore >= 70) return 'C'
    if (qualityScore >= 60) return 'D'
    return 'F'
  }

  /**
   * Show improvement summary between iterations
   */
  private showImprovementSummary(iteration1: any, iteration2: any): void {
    console.log('🎯 Verbetering Samenvatting')
    console.log('============================')
    
    const qualityImprovement = iteration2.qualityScore - iteration1.qualityScore
    const gradeImprovement = this.getGradeDifference(iteration1.overallGrade, iteration2.overallGrade)
    
    console.log(`📊 Kwaliteit: ${iteration1.qualityScore} → ${iteration2.qualityScore} (+${qualityImprovement} punten)`)
    console.log(`📈 Grade: ${iteration1.overallGrade} → ${iteration2.overallGrade} ${gradeImprovement}`)
    console.log(`⚡ Uitvoeringstijd: ${iteration1.executionTime}ms → ${iteration2.executionTime}ms`)
    
    if (qualityImprovement > 0) {
      console.log(`✅ Verbetering: ${((qualityImprovement / iteration1.qualityScore) * 100).toFixed(1)}%`)
    } else {
      console.log(`⚠️ Geen kwaliteitsverbetering in iteratie 2`)
    }
    
    console.log('')
  }

  /**
   * Get grade difference
   */
  private getGradeDifference(grade1: string, grade2: string): string {
    const grades = ['F', 'D', 'C', 'B', 'A']
    const index1 = grades.indexOf(grade1)
    const index2 = grades.indexOf(grade2)
    
    if (index2 > index1) return '↗️'
    if (index2 < index1) return '↘️'
    return '→'
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
        gradeChange: this.getGradeDifference(
          this.iterationResults[0].overallGrade,
          finalResult.overallGrade
        ),
        totalIterations: this.iterationResults.length
      }
    }

    // Generate reports
    await this.reportGenerator.generateQualityReport(report, this.options.outputPath)

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