import { CodeFixer } from './CodeFixer'
import { Validator } from './Validator'
import { ReportGenerator } from './ReportGenerator'
import { AutoFixOptions, CodeIssue, CodeFix, FixResult, ValidationResult } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class AutoFixAgent {
  private codeFixer: CodeFixer
  private validator: Validator
  private reportGenerator: ReportGenerator
  private options: AutoFixOptions

  constructor(options: AutoFixOptions) {
    this.options = options
    this.codeFixer = new CodeFixer()
    this.validator = new Validator()
    this.reportGenerator = new ReportGenerator(options.outputPath)
  }

  /**
   * Main execution method for the Auto-Fix Agent
   */
  async run(): Promise<any> {
    const startTime = Date.now()
    console.log('🚀 AI-Powered Auto-Fix Agent Starting...')
    console.log(`📁 Target file: ${this.options.filePath}`)
    console.log(`🎯 Max fixes: ${this.options.maxFixes}`)
    console.log('')

    try {
      // Step 1: Analyze code for issues
      console.log('🔍 Step 1: Analyzing code for issues...')
      const issues = await this.analyzeCode()
      console.log(`✅ Found ${issues.length} potential issues`)
      console.log('')

      if (issues.length === 0) {
        console.log('🎉 No issues found! Code quality appears excellent.')
        return this.generateNoIssuesReport(startTime)
      }

      // Step 2: Generate fixes for identified issues
      console.log('🔧 Step 2: Generating automatic fixes...')
      const fixes = await this.generateFixes(issues)
      console.log(`✅ Generated ${fixes.length} potential fixes`)
      console.log('')

      if (fixes.length === 0) {
        console.log('⚠️ No automatic fixes could be generated for the identified issues.')
        return this.generateNoFixesReport(issues, startTime)
      }

      // Step 3: Apply fixes (if auto-apply is enabled)
      let appliedFixes: CodeFix[] = []
      let failedFixes: CodeFix[] = []
      let skippedFixes: CodeFix[] = []

      if (this.options.autoApply) {
        console.log('⚡ Step 3: Applying fixes automatically...')
        const fixResults = await this.applyFixes(fixes)
        
        appliedFixes = fixResults.applied
        failedFixes = fixResults.failed
        skippedFixes = fixResults.skipped
        
        console.log(`✅ Applied: ${appliedFixes.length}`)
        console.log(`❌ Failed: ${failedFixes.length}`)
        console.log(`⏭️ Skipped: ${skippedFixes.length}`)
        console.log('')
      } else {
        console.log('⏸️ Step 3: Skipping automatic application (auto-apply disabled)')
        skippedFixes = fixes
        console.log(`⏭️ ${skippedFixes.length} fixes ready for manual review`)
        console.log('')
      }

      // Step 4: Validate applied fixes
      let validationResults: ValidationResult[][] = []
      if (appliedFixes.length > 0 && this.options.requireValidation) {
        console.log('🔍 Step 4: Validating applied fixes...')
        validationResults = await this.validateFixes(appliedFixes)
        console.log(`✅ Validation completed for ${appliedFixes.length} fixes`)
        console.log('')
      }

      // Step 5: Generate comprehensive report
      console.log('📊 Step 5: Generating comprehensive report...')
      const report = await this.generateReport(
        appliedFixes,
        failedFixes,
        skippedFixes,
        validationResults,
        startTime
      )
      console.log('✅ Report generated successfully')
      console.log('')

      // Step 6: Display summary
      this.displaySummary(report)

      return report

    } catch (error) {
      console.error('❌ Error during auto-fix execution:', error)
      throw error
    }
  }

  /**
   * Analyze code for issues
   */
  private async analyzeCode(): Promise<CodeIssue[]> {
    if (!fs.existsSync(this.options.filePath)) {
      throw new Error(`File not found: ${this.options.filePath}`)
    }

    // Add file path to issues for tracking
    const issues = await this.codeFixer.analyzeCode(this.options.filePath)
    
    // Filter issues based on options
    let filteredIssues = issues

    if (!this.options.includeSecurityFixes) {
      filteredIssues = filteredIssues.filter(issue => issue.type !== 'security')
    }

    if (!this.options.includePerformanceFixes) {
      filteredIssues = filteredIssues.filter(issue => issue.type !== 'performance')
    }

    if (!this.options.includeQualityFixes) {
      filteredIssues = filteredIssues.filter(issue => issue.type !== 'quality')
    }

    // Limit to max fixes
    if (filteredIssues.length > this.options.maxFixes) {
      filteredIssues = filteredIssues.slice(0, this.options.maxFixes)
    }

    return filteredIssues
  }

  /**
   * Generate fixes for identified issues
   */
  private async generateFixes(issues: CodeIssue[]): Promise<CodeFix[]> {
    const fixes = await this.codeFixer.generateFixes(issues)
    
    // Sort fixes by priority (critical first, then by severity)
    return fixes.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  /**
   * Apply fixes to the code
   */
  private async applyFixes(fixes: CodeFix[]): Promise<{
    applied: CodeFix[]
    failed: CodeFix[]
    skipped: CodeFix[]
  }> {
    const applied: CodeFix[] = []
    const failed: CodeFix[] = []
    const skipped: CodeFix[] = []

    for (const fix of fixes) {
      try {
        const result = await this.codeFixer.applyFix(fix)
        
        if (result.status === 'applied') {
          applied.push(fix)
        } else if (result.status === 'failed') {
          failed.push(fix)
        } else {
          skipped.push(fix)
        }
      } catch (error) {
        console.error(`Error applying fix ${fix.id}:`, error)
        failed.push(fix)
      }
    }

    return { applied, failed, skipped }
  }

  /**
   * Validate applied fixes
   */
  private async validateFixes(fixes: CodeFix[]): Promise<ValidationResult[][]> {
    return await this.validator.validateFixes(fixes)
  }

  /**
   * Generate comprehensive report
   */
  private async generateReport(
    appliedFixes: CodeFix[],
    failedFixes: CodeFix[],
    skippedFixes: CodeFix[],
    validationResults: ValidationResult[][],
    startTime: number
  ): Promise<any> {
    const metadata = {
      totalFixTime: Date.now() - startTime,
      dataSources: [this.options.filePath],
      appliedStrategies: ['automatic-code-analysis', 'pattern-based-fixing']
    }

    const report = await this.reportGenerator.generateFixReport(
      appliedFixes,
      failedFixes,
      skippedFixes,
      validationResults,
      metadata
    )

    // Save reports
    const jsonPath = await this.reportGenerator.saveReport(report)
    const markdownPath = await this.reportGenerator.generateMarkdownSummary(report)
    const metricsPath = await this.reportGenerator.generateMetricsReport(report)

    return {
      report,
      files: {
        json: jsonPath,
        markdown: markdownPath,
        metrics: metricsPath
      }
    }
  }

  /**
   * Generate report when no issues are found
   */
  private generateNoIssuesReport(startTime: number): any {
    const report = {
      id: `no-issues-${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: 0,
        autoFixed: 0,
        failedFixes: 0,
        skippedFixes: 0,
        successRate: 1.0,
        improvementScore: 100,
        overallGrade: 'A'
      },
      appliedFixes: [],
      failedFixes: [],
      skippedFixes: [],
      validationResults: [],
      recommendations: ['No issues found - code quality is excellent!'],
      metadata: {
        generatedAt: new Date().toISOString(),
        fixerVersion: '1.0.0',
        totalFixTime: Date.now() - startTime,
        confidence: 100,
        dataSources: [this.options.filePath],
        appliedStrategies: ['code-quality-scan']
      }
    }

    return { report, files: {} }
  }

  /**
   * Generate report when no fixes could be generated
   */
  private generateNoFixesReport(issues: CodeIssue[], startTime: number): any {
    const report = {
      id: `no-fixes-${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        autoFixed: 0,
        failedFixes: 0,
        skippedFixes: issues.length,
        successRate: 0,
        improvementScore: 0,
        overallGrade: 'F'
      },
      appliedFixes: [],
      failedFixes: [],
      skippedFixes: issues,
      validationResults: [],
      recommendations: [
        'No automatic fixes could be generated for the identified issues',
        'Consider manual review and fixing of the identified issues',
        'Some issues may require architectural changes or deeper analysis'
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        fixerVersion: '1.0.0',
        totalFixTime: Date.now() - startTime,
        confidence: 0,
        dataSources: [this.options.filePath],
        appliedStrategies: ['issue-identification-only']
      }
    }

    return { report, files: {} }
  }

  /**
   * Display execution summary
   */
  private displaySummary(result: any) {
    const { report } = result
    const { summary } = report

    console.log('🎯 Auto-Fix Execution Summary')
    console.log('================================')
    console.log(`📊 Overall Grade: ${summary.overallGrade}`)
    console.log(`🎯 Quality Score: ${summary.improvementScore}/100`)
    console.log(`✅ Success Rate: ${Math.round(summary.successRate * 100)}%`)
    console.log(`🔧 Total Issues: ${summary.totalIssues}`)
    console.log(`⚡ Auto-Fixed: ${summary.autoFixed}`)
    console.log(`❌ Failed: ${summary.failedFixes}`)
    console.log(`⏭️ Skipped: ${summary.skippedFixes}`)
    console.log('')

    if (result.files.json) {
      console.log('📁 Generated Reports:')
      console.log(`  - JSON Report: ${result.files.json}`)
      console.log(`  - Markdown Summary: ${result.files.markdown}`)
      console.log(`  - Metrics Report: ${result.files.metrics}`)
      console.log('')
    }

    if (summary.recommendations && summary.recommendations.length > 0) {
      console.log('💡 Recommendations:')
      summary.recommendations.forEach((rec: string) => {
        console.log(`  - ${rec}`)
      })
      console.log('')
    }
  }

  /**
   * Get current status and statistics
   */
  getStatus() {
    return {
      options: this.options,
      codeFixer: this.codeFixer.getFixSummary(),
      validator: this.validator
    }
  }

  /**
   * Reset agent state
   */
  reset() {
    this.codeFixer.reset()
  }
}