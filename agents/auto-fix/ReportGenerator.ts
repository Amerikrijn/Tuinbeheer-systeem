import { AutoFixReport } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class ReportGenerator {
  
  async generateAutoFixReport(report: AutoFixReport, outputPath: string): Promise<void> {
    console.log('📊 Generating comprehensive auto-fix report...')
    
    try {
      // Save detailed JSON report
      await this.saveJsonReport(report, outputPath)
      
      // Save human-readable summary
      await this.saveHumanReadableReport(report, outputPath)
      
      // Save fix metrics
      await this.saveFixMetrics(report, outputPath)
      
      console.log('📋 Auto-fix report generated successfully!')
    } catch (error) {
      console.error('Error generating auto-fix report:', error)
      throw error
    }
  }

  private async saveJsonReport(report: AutoFixReport, outputPath: string): Promise<void> {
    const reportPath = path.join(outputPath, 'auto-fix-report.json')
    
    try {
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(`💾 Auto-fix JSON report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving auto-fix JSON report:', error)
    }
  }

  private async saveHumanReadableReport(report: AutoFixReport, outputPath: string): Promise<void> {
    const reportPath = path.join(outputPath, 'auto-fix-summary.md')
    
    try {
      const markdown = this.generateMarkdownReport(report)
      
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, markdown)
      console.log(`📝 Auto-fix summary report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving auto-fix summary report:', error)
    }
  }

  private async saveFixMetrics(report: AutoFixReport, outputPath: string): Promise<void> {
    const reportPath = path.join(outputPath, 'auto-fix-metrics.json')
    
    try {
      const metrics = {
        summary: report.summary,
        metadata: report.metadata,
        issueTypes: this.groupIssuesByType(report.issues),
        fixStatus: this.groupFixesByStatus(report.fixes)
      }
      
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2))
      console.log(`📊 Auto-fix metrics saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving auto-fix metrics:', error)
    }
  }

  private generateMarkdownReport(report: AutoFixReport): string {
    const { summary, issues, fixes, recommendations, metadata } = report
    
    return `# Auto-Fix Report

## Executive Summary

- **File Analyzed**: ${report.filePath}
- **Total Issues Found**: ${summary.totalIssues}
- **Issues Fixed**: ${summary.issuesFixed}
- **Issues Skipped**: ${summary.issuesSkipped}
- **Issues Failed**: ${summary.issuesFailed}
- **Overall Improvement**: ${summary.overallImprovement}%
- **Estimated Effort**: ${summary.estimatedEffort}

## Issue Breakdown

### Security Issues
- **Count**: ${summary.securityIssues}
- **Fixed**: ${fixes.filter(f => f.status === 'applied' && issues.find(i => i.id === f.issueId)?.type === 'security').length}

### Performance Issues
- **Count**: ${summary.performanceIssues}
- **Fixed**: ${fixes.filter(f => f.status === 'applied' && issues.find(i => i.id === f.issueId)?.type === 'performance').length}

### Quality Issues
- **Count**: ${summary.qualityIssues}
- **Fixed**: ${fixes.filter(f => f.status === 'applied' && issues.find(i => i.id === f.issueId)?.type === 'quality').length}

## Applied Fixes

${fixes.filter(f => f.status === 'applied').map(fix => {
  const issue = issues.find(i => i.id === fix.issueId)
  return `### ${issue?.type.toUpperCase()} Fix
- **Description**: ${issue?.description}
- **Severity**: ${issue?.severity}
- **Line**: ${issue?.lineNumber}
- **Applied**: ${fix.appliedAt}

\`\`\`diff
${fix.diff}
\`\`\`
`
}).join('\n')}

## Recommendations

${recommendations.map(rec => `- ${rec}`).join('\n')}

## Metadata

- **Agent Version**: ${metadata.agentVersion}
- **Analysis Time**: ${metadata.analysisTime}ms
- **Total Time**: ${metadata.totalTime}ms
- **Environment**: ${metadata.environment}
- **Generated**: ${report.timestamp}
`
  }

  private groupIssuesByType(issues: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {}
    
    issues.forEach(issue => {
      if (!groups[issue.type]) {
        groups[issue.type] = []
      }
      groups[issue.type].push(issue)
    })
    
    return groups
  }

  private groupFixesByStatus(fixes: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {}
    
    fixes.forEach(fix => {
      if (!groups[fix.status]) {
        groups[fix.status] = []
      }
      groups[fix.status].push(fix)
    })
    
    return groups
  }
}