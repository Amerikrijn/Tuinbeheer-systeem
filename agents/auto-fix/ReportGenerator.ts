import { FixReport, CodeFix, FixResult, ValidationResult } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class ReportGenerator {
  private outputPath: string

  constructor(outputPath: string) {
    this.outputPath = outputPath
    this.ensureOutputDirectory()
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory() {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true })
    }
  }

  /**
   * Generate comprehensive fix report
   */
  async generateFixReport(
    appliedFixes: CodeFix[],
    failedFixes: CodeFix[],
    skippedFixes: CodeFix[],
    validationResults: ValidationResult[][],
    metadata: any
  ): Promise<FixReport> {
    const summary = this.generateFixSummary(appliedFixes, failedFixes, skippedFixes)
    
    const report: FixReport = {
      id: `fix-report-${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary,
      appliedFixes,
      failedFixes,
      skippedFixes,
      validationResults: validationResults.flat(),
      recommendations: this.generateRecommendations(appliedFixes, failedFixes, skippedFixes),
      metadata: {
        generatedAt: new Date().toISOString(),
        fixerVersion: '1.0.0',
        totalFixTime: metadata.totalFixTime || 0,
        confidence: this.calculateConfidence(appliedFixes, failedFixes),
        dataSources: metadata.dataSources || [],
        appliedStrategies: metadata.appliedStrategies || []
      }
    }

    return report
  }

  /**
   * Generate fix summary
   */
  private generateFixSummary(
    appliedFixes: CodeFix[],
    failedFixes: CodeFix[],
    skippedFixes: CodeFix[]
  ) {
    const totalIssues = appliedFixes.length + failedFixes.length + skippedFixes.length
    const successRate = totalIssues > 0 ? appliedFixes.length / totalIssues : 0
    const improvementScore = this.calculateImprovementScore(appliedFixes)
    const overallGrade = this.calculateOverallGrade(successRate, improvementScore)

    return {
      totalIssues,
      autoFixed: appliedFixes.length,
      failedFixes: failedFixes.length,
      skippedFixes: skippedFixes.length,
      successRate,
      improvementScore,
      overallGrade
    }
  }

  /**
   * Calculate improvement score based on applied fixes
   */
  private calculateImprovementScore(appliedFixes: CodeFix[]): number {
    if (appliedFixes.length === 0) return 0

    let totalScore = 0
    let maxScore = 0

    for (const fix of appliedFixes) {
      let fixScore = 0
      let maxFixScore = 0

      // Score based on severity
      switch (fix.severity) {
        case 'critical':
          fixScore += 10
          maxFixScore += 10
          break
        case 'high':
          fixScore += 8
          maxFixScore += 8
          break
        case 'medium':
          fixScore += 5
          maxFixScore += 5
          break
        case 'low':
          fixScore += 2
          maxFixScore += 2
          break
      }

      // Score based on confidence
      fixScore += Math.round(fix.confidence * 5)
      maxFixScore += 5

      // Score based on effort
      switch (fix.estimatedEffort) {
        case 'low':
          fixScore += 3
          maxFixScore += 3
          break
        case 'medium':
          fixScore += 2
          maxFixScore += 2
          break
        case 'high':
          fixScore += 1
          maxFixScore += 1
          break
      }

      totalScore += fixScore
      maxScore += maxFixScore
    }

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  }

  /**
   * Calculate overall grade
   */
  private calculateOverallGrade(successRate: number, improvementScore: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    const combinedScore = (successRate * 0.6) + (improvementScore / 100 * 0.4)

    if (combinedScore >= 0.9) return 'A'
    if (combinedScore >= 0.8) return 'B'
    if (combinedScore >= 0.7) return 'C'
    if (combinedScore >= 0.6) return 'D'
    return 'F'
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(appliedFixes: CodeFix[], failedFixes: CodeFix[]): number {
    if (appliedFixes.length === 0 && failedFixes.length === 0) return 0

    const totalFixes = appliedFixes.length + failedFixes.length
    const successRate = appliedFixes.length / totalFixes

    // Base confidence on success rate
    let confidence = successRate

    // Adjust based on fix confidence levels
    if (appliedFixes.length > 0) {
      const avgFixConfidence = appliedFixes.reduce((sum, fix) => sum + fix.confidence, 0) / appliedFixes.length
      confidence = (confidence + avgFixConfidence) / 2
    }

    return Math.round(confidence * 100)
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    appliedFixes: CodeFix[],
    failedFixes: CodeFix[],
    skippedFixes: CodeFix[]
  ): string[] {
    const recommendations: string[] = []

    // Recommendations based on applied fixes
    if (appliedFixes.length > 0) {
      recommendations.push(`Successfully applied ${appliedFixes.length} automatic fixes`)
      
      const criticalFixes = appliedFixes.filter(fix => fix.severity === 'critical')
      if (criticalFixes.length > 0) {
        recommendations.push(`Fixed ${criticalFixes.length} critical issues automatically`)
      }
    }

    // Recommendations based on failed fixes
    if (failedFixes.length > 0) {
      recommendations.push(`Review ${failedFixes.length} failed fixes manually`)
      
      const highPriorityFailed = failedFixes.filter(fix => fix.severity === 'high' || fix.severity === 'critical')
      if (highPriorityFailed.length > 0) {
        recommendations.push(`Prioritize manual review of ${highPriorityFailed.length} high-priority failed fixes`)
      }
    }

    // Recommendations based on skipped fixes
    if (skippedFixes.length > 0) {
      recommendations.push(`Consider manual fixes for ${skippedFixes.length} skipped issues`)
      
      const autoFixableSkipped = skippedFixes.filter(fix => fix.autoFixable)
      if (autoFixableSkipped.length > 0) {
        recommendations.push(`${autoFixableSkipped.length} skipped issues could potentially be auto-fixed`)
      }
    }

    // General recommendations
    if (appliedFixes.length === 0 && failedFixes.length === 0) {
      recommendations.push('No issues were found or fixed - code quality appears good')
    }

    if (appliedFixes.length > 0) {
      recommendations.push('Run tests to ensure fixes did not introduce regressions')
      recommendations.push('Consider adding similar validation rules to prevent future issues')
    }

    return recommendations
  }

  /**
   * Save report to JSON file
   */
  async saveReport(report: FixReport, filename: string = 'fix-report.json'): Promise<string> {
    const filePath = path.join(this.outputPath, filename)
    const jsonContent = JSON.stringify(report, null, 2)
    
    fs.writeFileSync(filePath, jsonContent, 'utf-8')
    
    return filePath
  }

  /**
   * Generate markdown summary
   */
  async generateMarkdownSummary(report: FixReport, filename: string = 'fix-report-summary.md'): Promise<string> {
    const filePath = path.join(this.outputPath, filename)
    
    const markdown = this.formatMarkdownReport(report)
    
    fs.writeFileSync(filePath, markdown, 'utf-8')
    
    return filePath
  }

  /**
   * Format report as markdown
   */
  private formatMarkdownReport(report: FixReport): string {
    const { summary, appliedFixes, failedFixes, skippedFixes, recommendations, metadata } = report

    let markdown = `# 🔧 Auto-Fix Report Summary\n\n`
    markdown += `**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}\n`
    markdown += `**Fixer Version:** ${metadata.fixerVersion}\n`
    markdown += `**Total Fix Time:** ${metadata.totalFixTime}ms\n\n`

    // Summary section
    markdown += `## 📊 Summary\n\n`
    markdown += `| Metric | Value |\n`
    markdown += `|--------|-------|\n`
    markdown += `| **Overall Grade** | **${summary.overallGrade}** |\n`
    markdown += `| **Quality Score** | **${summary.improvementScore}/100** |\n`
    markdown += `| **Success Rate** | **${Math.round(summary.successRate * 100)}%** |\n`
    markdown += `| **Total Issues** | ${summary.totalIssues} |\n`
    markdown += `| **Auto-Fixed** | ${summary.autoFixed} |\n`
    markdown += `| **Failed Fixes** | ${summary.failedFixes} |\n`
    markdown += `| **Skipped Issues** | ${summary.skippedFixes} |\n\n`

    // Applied fixes section
    if (appliedFixes.length > 0) {
      markdown += `## ✅ Successfully Applied Fixes\n\n`
      markdown += `| File | Line | Issue | Severity |\n`
      markdown += `|------|------|-------|----------|\n`
      
      for (const fix of appliedFixes) {
        const fileName = path.basename(fix.filePath)
        markdown += `| \`${fileName}\` | ${fix.lineNumber} | ${fix.description} | ${fix.severity} |\n`
      }
      markdown += `\n`
    }

    // Failed fixes section
    if (failedFixes.length > 0) {
      markdown += `## ❌ Failed Fixes\n\n`
      markdown += `| File | Line | Issue | Severity |\n`
      markdown += `|------|------|-------|----------|\n`
      
      for (const fix of failedFixes) {
        const fileName = path.basename(fix.filePath)
        markdown += `| \`${fileName}\` | ${fix.lineNumber} | ${fix.description} | ${fix.severity} |\n`
      }
      markdown += `\n`
    }

    // Skipped issues section
    if (skippedFixes.length > 0) {
      markdown += `## ⏭️ Skipped Issues\n\n`
      markdown += `| File | Line | Issue | Severity | Auto-Fixable |\n`
      markdown += `|------|------|-------|----------|--------------|\n`
      
      for (const fix of skippedFixes) {
        const fileName = path.basename(fix.filePath)
        markdown += `| \`${fileName}\` | ${fix.lineNumber} | ${fix.description} | ${fix.severity} | ${fix.autoFixable ? 'Yes' : 'No'} |\n`
      }
      markdown += `\n`
    }

    // Recommendations section
    if (recommendations.length > 0) {
      markdown += `## 💡 Recommendations\n\n`
      for (const recommendation of recommendations) {
        markdown += `- ${recommendation}\n`
      }
      markdown += `\n`
    }

    // Metadata section
    markdown += `## 🔍 Technical Details\n\n`
    markdown += `- **Confidence Level:** ${metadata.confidence}%\n`
    markdown += `- **Data Sources:** ${metadata.dataSources.join(', ') || 'None'}\n`
    markdown += `- **Applied Strategies:** ${metadata.appliedStrategies.join(', ') || 'None'}\n`
    markdown += `- **Report ID:** \`${report.id}\`\n`

    return markdown
  }

  /**
   * Generate metrics report
   */
  async generateMetricsReport(report: FixReport, filename: string = 'fix-metrics.json'): Promise<string> {
    const filePath = path.join(this.outputPath, filename)
    
    const metrics = {
      summary: report.summary,
      metadata: report.metadata,
      fixDistribution: {
        bySeverity: this.groupFixesBySeverity(report.appliedFixes),
        byType: this.groupFixesByType(report.appliedFixes),
        byFile: this.groupFixesByFile(report.appliedFixes)
      },
      validationSummary: {
        totalValidations: report.validationResults.length,
        passedValidations: report.validationResults.filter(r => r.passed).length,
        failedValidations: report.validationResults.filter(r => !r.passed).length
      }
    }
    
    const jsonContent = JSON.stringify(metrics, null, 2)
    fs.writeFileSync(filePath, jsonContent, 'utf-8')
    
    return filePath
  }

  /**
   * Group fixes by severity
   */
  private groupFixesBySeverity(fixes: CodeFix[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    
    for (const fix of fixes) {
      grouped[fix.severity] = (grouped[fix.severity] || 0) + 1
    }
    
    return grouped
  }

  /**
   * Group fixes by type
   */
  private groupFixesByType(fixes: CodeFix[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    
    for (const fix of fixes) {
      grouped[fix.issueType] = (grouped[fix.issueType] || 0) + 1
    }
    
    return grouped
  }

  /**
   * Group fixes by file
   */
  private groupFixesByFile(fixes: CodeFix[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    
    for (const fix of fixes) {
      const fileName = path.basename(fix.filePath)
      grouped[fileName] = (grouped[fileName] || 0) + 1
    }
    
    return grouped
  }
}