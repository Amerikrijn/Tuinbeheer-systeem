import { TestResult, TestScenario } from '../test-generator/types'
import { QualityReport, ImprovementSuggestion, QualitySummary, QualityAnalysis, RiskAssessment, CoverageAnalysis, PerformanceMetrics } from './types'
import { QualityAnalyzer } from './QualityAnalyzer'
import { ReportGenerator } from './ReportGenerator'

export class QualityAnalyzerAgent {
  private testResults: TestResult[]
  private testScenarios: TestScenario[]
  private outputPath: string
  private qualityAnalyzer: QualityAnalyzer
  private reportGenerator: ReportGenerator

  constructor(options: {
    testResults: TestResult[]
    testScenarios: TestScenario[]
    outputPath: string
  }) {
    this.testResults = options.testResults
    this.testScenarios = options.testScenarios
    this.outputPath = options.outputPath
    this.qualityAnalyzer = new QualityAnalyzer()
    this.reportGenerator = new ReportGenerator()
  }

  async run(): Promise<QualityReport> {
    console.log('🔍 AI-Powered Quality Analyzer Agent Starting...')
    console.log(`📊 Analyzing ${this.testResults.length} test results`)
    console.log(`🧪 Evaluating ${this.testScenarios.length} test scenarios`)
    
    try {
      // Step 1: Analyze test quality
      console.log('\n🔍 Step 1: Analyzing test quality...')
      const testQuality = this.qualityAnalyzer.analyzeTestQuality(this.testResults, this.testScenarios)
      console.log(`✅ Test quality analysis completed`)
      
      // Step 2: Assess risks
      console.log('\n⚠️  Step 2: Assessing risks...')
      const riskAssessment = this.qualityAnalyzer.assessRisks(this.testResults, this.testScenarios)
      console.log(`✅ Risk assessment completed`)
      
      // Step 3: Analyze coverage
      console.log('\n📊 Step 3: Analyzing coverage...')
      const coverageAnalysis = this.qualityAnalyzer.analyzeCoverage(this.testResults, this.testScenarios)
      console.log(`✅ Coverage analysis completed`)
      
      // Step 4: Evaluate performance
      console.log('\n⚡ Step 4: Evaluating performance...')
      const performanceMetrics = this.qualityAnalyzer.evaluatePerformance(this.testResults)
      console.log(`✅ Performance evaluation completed`)
      
      // Step 5: Generate improvement suggestions
      console.log('\n💡 Step 5: Generating improvement suggestions...')
      const suggestions = this.qualityAnalyzer.generateImprovementSuggestions(
        this.testResults,
        this.testScenarios,
        testQuality,
        riskAssessment,
        coverageAnalysis,
        performanceMetrics
      )
      console.log(`✅ Generated ${suggestions.length} improvement suggestions`)
      
      // Step 6: Create quality report
      console.log('\n📋 Step 6: Creating quality report...')
      const qualityReport = this.createQualityReport(
        testQuality,
        riskAssessment,
        coverageAnalysis,
        performanceMetrics,
        suggestions
      )
      
      // Step 7: Generate reports
      console.log('\n📊 Step 7: Generating reports...')
      await this.reportGenerator.generateQualityReport(qualityReport, this.outputPath)
      console.log(`✅ Quality reports generated successfully`)
      
      // Step 8: Display summary
      console.log('\n📋 Step 8: Quality Analysis Summary')
      this.displayQualitySummary(qualityReport)
      
      console.log('\n🎉 Quality Analysis Process Completed Successfully!')
      
      return qualityReport
      
    } catch (error) {
      console.error('❌ Error in quality analysis process:', error)
      throw error
    }
  }

  private createQualityReport(
    testQuality: any,
    riskAssessment: RiskAssessment,
    coverageAnalysis: CoverageAnalysis,
    performanceMetrics: PerformanceMetrics,
    suggestions: ImprovementSuggestion[]
  ): QualityReport {
    const summary = this.calculateQualitySummary()
    
    const analysis: QualityAnalysis = {
      testQuality: testQuality.testQuality,
      codeQuality: testQuality.codeQuality,
      securityQuality: testQuality.securityQuality,
      performanceQuality: testQuality.performanceQuality,
      maintainabilityQuality: testQuality.maintainabilityQuality
    }

    return {
      id: `quality-analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary,
      analysis,
      recommendations: suggestions,
      riskAssessment,
      coverageAnalysis,
      performanceMetrics,
      metadata: {
        generatedAt: new Date().toISOString(),
        analyzerVersion: '1.0.0',
        totalAnalysisTime: Date.now() - Date.now(), // Placeholder
        confidence: 0.95,
        dataSources: ['test-results', 'test-scenarios', 'code-analysis']
      }
    }
  }

  private calculateQualitySummary(): QualitySummary {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.status === 'passed').length
    const failedTests = this.testResults.filter(r => r.status === 'failed').length
    const errorTests = this.testResults.filter(r => r.status === 'error').length
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    
    // Calculate quality score based on multiple factors
    const qualityScore = this.calculateQualityScore(successRate, failedTests, errorTests)
    const overallGrade = this.calculateGrade(qualityScore)
    
    return {
      totalTests,
      passedTests,
      failedTests,
      errorTests,
      successRate: Math.round(successRate * 100) / 100,
      qualityScore: Math.round(qualityScore * 100) / 100,
      overallGrade
    }
  }

  private calculateQualityScore(successRate: number, failedTests: number, errorTests: number): number {
    let score = successRate
    
    // Penalize for failed tests
    if (failedTests > 0) {
      score -= failedTests * 5
    }
    
    // Penalize for errors
    if (errorTests > 0) {
      score -= errorTests * 10
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score))
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  private displayQualitySummary(report: QualityReport): void {
    const { summary, analysis, riskAssessment, coverageAnalysis } = report
    
    console.log('\n📊 QUALITY SUMMARY')
    console.log('='.repeat(50))
    console.log(`Overall Grade: ${summary.overallGrade}`)
    console.log(`Quality Score: ${summary.qualityScore}/100`)
    console.log(`Success Rate: ${summary.successRate}%`)
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`✅ Passed: ${summary.passedTests}`)
    console.log(`❌ Failed: ${summary.failedTests}`)
    console.log(`⚠️  Errors: ${summary.errorTests}`)
    
    console.log('\n🎯 QUALITY METRICS')
    console.log('='.repeat(50))
    console.log(`Test Quality: ${Math.round(analysis.testQuality.coverage)}%`)
    console.log(`Security Quality: ${Math.round(analysis.securityQuality.securityScore)}%`)
    console.log(`Performance Quality: ${Math.round(analysis.performanceQuality.efficiency)}%`)
    console.log(`Maintainability: ${Math.round(analysis.maintainabilityQuality.codeComplexity)}%`)
    
    console.log('\n⚠️  RISK ASSESSMENT')
    console.log('='.repeat(50))
    console.log(`Overall Risk: ${riskAssessment.overallRisk.toUpperCase()}`)
    console.log(`Risk Score: ${riskAssessment.riskScore}/100`)
    console.log(`Risk Factors: ${riskAssessment.riskFactors.length}`)
    
    console.log('\n📊 COVERAGE ANALYSIS')
    console.log('='.repeat(50))
    console.log(`Overall Coverage: ${coverageAnalysis.overallCoverage}%`)
    console.log(`Functional Coverage: ${coverageAnalysis.functionalCoverage}%`)
    console.log(`Security Coverage: ${coverageAnalysis.securityCoverage}%`)
    console.log(`Edge Case Coverage: ${coverageAnalysis.edgeCaseCoverage}%`)
    
    console.log('\n💡 IMPROVEMENT SUGGESTIONS')
    console.log('='.repeat(50))
    const criticalSuggestions = report.recommendations.filter(s => s.priority === 'critical')
    const highSuggestions = report.recommendations.filter(s => s.priority === 'high')
    
    if (criticalSuggestions.length > 0) {
      console.log(`🔴 Critical Priority: ${criticalSuggestions.length}`)
      criticalSuggestions.forEach(s => console.log(`   - ${s.title}`))
    }
    
    if (highSuggestions.length > 0) {
      console.log(`🟠 High Priority: ${highSuggestions.length}`)
      highSuggestions.forEach(s => console.log(`   - ${s.title}`))
    }
    
    console.log(`📝 Total Suggestions: ${report.recommendations.length}`)
  }

  getStatus(): string {
    return 'Quality Analyzer Agent is ready and operational'
  }

  getQualityScore(): number {
    const summary = this.calculateQualitySummary()
    return summary.qualityScore
  }

  getRiskLevel(): string {
    // This would be calculated based on current analysis
    return 'medium'
  }

  getRecommendations(): ImprovementSuggestion[] {
    // This would return the latest recommendations
    return []
  }
}