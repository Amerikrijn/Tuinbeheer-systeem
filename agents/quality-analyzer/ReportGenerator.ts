import * as fs from 'fs'
import * as path from 'path'
import { QualityReport } from './types'

export class ReportGenerator {
  
  async generateQualityReport(report: QualityReport, outputPath: string): Promise<void> {
    console.log('📊 Generating comprehensive quality report...')
    
    try {
      // Save detailed JSON report
      await this.saveJsonReport(report, outputPath)
      
      // Save human-readable summary
      await this.saveHumanReadableReport(report, outputPath)
      
      // Save quality metrics
      await this.saveQualityMetrics(report, outputPath)
      
      console.log('📋 Quality report generated successfully!')
    } catch (error) {
      console.error('Error generating quality report:', error)
      throw error
    }
  }

  private async saveJsonReport(report: QualityReport, outputPath: string): Promise<void> {
    const reportPath = path.join(outputPath, 'quality-analysis.json')
    
    try {
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(`💾 Quality JSON report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving quality JSON report:', error)
    }
  }

  private async saveHumanReadableReport(report: QualityReport, outputPath: string): Promise<void> {
    const reportPath = path.join(outputPath, 'quality-analysis-summary.md')
    
    try {
      const markdown = this.generateMarkdownReport(report)
      
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, markdown)
      console.log(`📝 Quality summary report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving quality summary report:', error)
    }
  }

  private async saveQualityMetrics(report: QualityReport, outputPath: string): Promise<void> {
    const reportPath = path.join(outputPath, 'quality-metrics.json')
    
    try {
      const metrics = {
        summary: report.summary,
        analysis: report.analysis,
        riskAssessment: report.riskAssessment,
        coverageAnalysis: report.coverageAnalysis,
        performanceMetrics: report.performanceMetrics
      }
      
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2))
      console.log(`📊 Quality metrics saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving quality metrics:', error)
    }
  }

  private generateMarkdownReport(report: QualityReport): string {
    const { summary, analysis, riskAssessment, coverageAnalysis, performanceMetrics, recommendations } = report
    
    return `# Quality Analysis Report

## Executive Summary

- **Overall Grade**: ${summary.overallGrade}
- **Quality Score**: ${summary.qualityScore}/100
- **Success Rate**: ${summary.successRate}%
- **Total Tests**: ${summary.totalTests}
- **Risk Level**: ${riskAssessment.overallRisk.toUpperCase()}

## Quality Metrics Breakdown

### Test Quality
- **Coverage**: ${Math.round(analysis.testQuality.coverage)}%
- **Reliability**: ${Math.round(analysis.testQuality.reliability)}%
- **Maintainability**: ${Math.round(analysis.testQuality.maintainability)}%
- **Readability**: ${Math.round(analysis.testQuality.readability)}%
- **Completeness**: ${Math.round(analysis.testQuality.completeness)}%

### Code Quality
- **Complexity**: ${Math.round(analysis.codeQuality.complexity)}%
- **Duplication**: ${Math.round(analysis.codeQuality.duplication)}%
- **Maintainability**: ${Math.round(analysis.codeQuality.maintainability)}%
- **Testability**: ${Math.round(analysis.codeQuality.testability)}%
- **Readability**: ${Math.round(analysis.codeQuality.readability)}%

### Security Quality
- **Security Score**: ${Math.round(analysis.securityQuality.securityScore)}%
- **Vulnerability Count**: ${analysis.securityQuality.vulnerabilityCount}
- **Risk Level**: ${analysis.securityQuality.riskLevel.toUpperCase()}
- **Compliance Status**: ${analysis.securityQuality.complianceStatus.toUpperCase()}

### Performance Quality
- **Response Time**: ${Math.round(analysis.performanceQuality.responseTime)}ms
- **Throughput**: ${Math.round(analysis.performanceQuality.throughput)}%
- **Resource Usage**: ${Math.round(analysis.performanceQuality.resourceUsage)}%
- **Scalability**: ${Math.round(analysis.performanceQuality.scalability)}%
- **Efficiency**: ${Math.round(analysis.performanceQuality.efficiency)}%

### Maintainability Quality
- **Code Complexity**: ${Math.round(analysis.maintainabilityQuality.codeComplexity)}%
- **Documentation**: ${Math.round(analysis.maintainabilityQuality.documentation)}%
- **Modularity**: ${Math.round(analysis.maintainabilityQuality.modularity)}%
- **Reusability**: ${Math.round(analysis.maintainabilityQuality.reusability)}%
- **Testability**: ${Math.round(analysis.maintainabilityQuality.testability)}%

## Risk Assessment

### Overall Risk: ${riskAssessment.overallRisk.toUpperCase()}
**Risk Score**: ${riskAssessment.riskScore}/100

### Risk Factors
${riskAssessment.riskFactors.length === 0 ? 'No risk factors identified! 🎉' : riskAssessment.riskFactors.map(factor => 
  `#### ${factor.category.toUpperCase()}
- **Description**: ${factor.description}
- **Probability**: ${factor.probability.toUpperCase()}
- **Impact**: ${factor.impact.toUpperCase()}
- **Risk Level**: ${factor.riskLevel.toUpperCase()}
- **Mitigation**: ${factor.mitigation}
`
).join('\n')}

### Mitigation Strategies
${riskAssessment.mitigationStrategies.map(strategy => `- ${strategy}`).join('\n')}

## Coverage Analysis

### Overall Coverage: ${coverageAnalysis.overallCoverage}%

### Category Coverage
- **Functional**: ${coverageAnalysis.functionalCoverage}%
- **Security**: ${coverageAnalysis.securityCoverage}%
- **Edge Case**: ${coverageAnalysis.edgeCaseCoverage}%
- **UI**: ${coverageAnalysis.uiCoverage}%
- **Performance**: ${coverageAnalysis.performanceCoverage}%

### Coverage Gaps
${coverageAnalysis.gaps.length === 0 ? 'No coverage gaps identified! 🎉' : coverageAnalysis.gaps.map(gap => 
  `#### ${gap.category.toUpperCase()}
- **Description**: ${gap.description}
- **Severity**: ${gap.severity.toUpperCase()}
- **Impact**: ${gap.impact}
- **Suggested Tests**: ${gap.suggestedTests.join(', ')}
`
).join('\n')}

### Coverage Recommendations
${coverageAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}

## Performance Analysis

### Average Execution Time: ${performanceMetrics.averageExecutionTime}ms

### Performance Trend: ${performanceMetrics.performanceTrend.toUpperCase()}

### Slowest Tests
${performanceMetrics.slowestTests.length === 0 ? 'No slow tests identified' : performanceMetrics.slowestTests.map(test => 
  `- **${test.testName}** (${test.category}): ${test.executionTime}ms - ${test.performance.toUpperCase()}`
).join('\n')}

### Fastest Tests
${performanceMetrics.fastestTests.length === 0 ? 'No fast tests identified' : performanceMetrics.fastestTests.map(test => 
  `- **${test.testName}** (${test.category}): ${test.executionTime}ms - ${test.performance.toUpperCase()}`
).join('\n')}

### Bottlenecks
${performanceMetrics.bottlenecks.length === 0 ? 'No bottlenecks identified' : performanceMetrics.bottlenecks.map(bottleneck => 
  `- ${bottleneck}`
).join('\n')}

## Improvement Recommendations

### Priority Breakdown
${this.generatePriorityBreakdown(recommendations)}

### Detailed Recommendations
${recommendations.map(rec => 
  `#### ${rec.title}
- **Type**: ${rec.type.toUpperCase()}
- **Priority**: ${rec.priority.toUpperCase()}
- **Category**: ${rec.category}
- **Description**: ${rec.description}
- **Current State**: ${rec.currentState}
- **Target State**: ${rec.targetState}
- **Estimated Effort**: ${rec.estimatedEffort.toUpperCase()}
- **Impact**: ${rec.impact.toUpperCase()}
- **Risk**: ${rec.risk.toUpperCase()}

**Action Items:**
${rec.actionItems.map(item => `- ${item}`).join('\n')}

**Dependencies**: ${rec.dependencies.length === 0 ? 'None' : rec.dependencies.join(', ')}
**Tags**: ${rec.tags.join(', ')}
`
).join('\n\n')}

## Quality Score Breakdown

### Grade Scale
- **A (90-100)**: Excellent quality, minimal improvements needed
- **B (80-89)**: Good quality, some improvements recommended
- **C (70-79)**: Acceptable quality, improvements needed
- **D (60-69)**: Poor quality, significant improvements required
- **F (0-59)**: Critical quality issues, immediate action required

### Current Grade: ${summary.overallGrade}
**Quality Score**: ${summary.qualityScore}/100

${this.generateGradeDescription(summary.overallGrade, summary.qualityScore)}

## Next Steps

### Immediate Actions (Next 24 hours)
${this.generateImmediateActions(recommendations)}

### Short-term Goals (Next week)
${this.generateShortTermGoals(recommendations)}

### Long-term Strategy (Next month)
${this.generateLongTermStrategy(recommendations)}

---

*Quality analysis report generated on ${new Date(report.timestamp).toLocaleString()} by AI-Powered Quality Analyzer Agent v${report.metadata.analyzerVersion}*

**Confidence Level**: ${Math.round(report.metadata.confidence * 100)}%
**Analysis Time**: ${report.metadata.totalAnalysisTime}ms
**Data Sources**: ${report.metadata.dataSources.join(', ')}
`
  }

  private generatePriorityBreakdown(recommendations: any[]): string {
    const critical = recommendations.filter(r => r.priority === 'critical').length
    const high = recommendations.filter(r => r.priority === 'high').length
    const medium = recommendations.filter(r => r.priority === 'medium').length
    const low = recommendations.filter(r => r.priority === 'low').length
    
    return `- 🔴 **Critical Priority**: ${critical} recommendations
- 🟠 **High Priority**: ${high} recommendations  
- 🟡 **Medium Priority**: ${medium} recommendations
- 🟢 **Low Priority**: ${low} recommendations

**Total Recommendations**: ${recommendations.length}`
  }

  private generateGradeDescription(grade: string, score: number): string {
    switch (grade) {
      case 'A':
        return '🎉 **Excellent!** Your code quality is outstanding. Focus on maintaining this high standard and consider advanced optimizations.'
      case 'B':
        return '👍 **Good job!** Your code quality is solid. Address the high-priority recommendations to reach excellence.'
      case 'C':
        return '⚠️ **Acceptable but needs improvement.** Focus on critical and high-priority issues to improve quality significantly.'
      case 'D':
        return '🚨 **Poor quality detected.** Immediate action required on critical issues. Consider code review and refactoring.'
      case 'F':
        return '💥 **Critical quality issues!** Immediate intervention required. Stop new development and focus on fixing existing issues.'
      default:
        return '❓ **Unknown grade.** Please review the analysis results.'
    }
  }

  private generateImmediateActions(recommendations: any[]): string {
    const criticalActions = recommendations
      .filter(r => r.priority === 'critical')
      .map(r => `- ${r.title}`)
    
    if (criticalActions.length === 0) {
      return '- No immediate actions required - quality is acceptable'
    }
    
    return criticalActions.join('\n')
  }

  private generateShortTermGoals(recommendations: any[]): string {
    const highPriorityActions = recommendations
      .filter(r => r.priority === 'high')
      .map(r => `- ${r.title}`)
    
    if (highPriorityActions.length === 0) {
      return '- Focus on medium-priority improvements'
    }
    
    return highPriorityActions.join('\n')
  }

  private generateLongTermStrategy(recommendations: any[]): string {
    const mediumActions = recommendations
      .filter(r => r.priority === 'medium')
      .map(r => `- ${r.title}`)
    
    if (mediumActions.length === 0) {
      return '- Maintain current quality standards and focus on optimization'
    }
    
    return mediumActions.join('\n')
  }
}