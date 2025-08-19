import { 
  AutoFixOptions, 
  CodeAnalysis, 
  CodeFix, 
  FixReport, 
  FixResult, 
  Metrics,
  AnalysisResult 
} from './types'
import { CodeFixer } from './CodeFixer'
import { Validator } from './Validator'
import { ReportGenerator } from './ReportGenerator'
import * as fs from 'fs'
import * as path from 'path'

export class AutoFixAgent {
  private options: AutoFixOptions
  private codeFixer: CodeFixer
  private validator: Validator
  private reportGenerator: ReportGenerator
  private startTime: number

  constructor(options: AutoFixOptions) {
    this.options = options
    this.codeFixer = new CodeFixer()
    this.validator = new Validator()
    this.reportGenerator = new ReportGenerator()
    this.startTime = Date.now()
  }

  async run(): Promise<AnalysisResult> {
    console.log('🔧 Starting Auto-Fix Agent...')
    console.log(`Target: ${this.options.filePath}`)
    console.log(`Max fixes: ${this.options.maxFixes}`)
    console.log('')

    try {
      // Validate target exists
      if (!fs.existsSync(this.options.filePath)) {
        throw new Error(`Target not found: ${this.options.filePath}`)
      }

      // Create output directory
      if (!fs.existsSync(this.options.outputPath)) {
        fs.mkdirSync(this.options.outputPath, { recursive: true })
      }

      let currentAnalysis: CodeAnalysis
      let currentFixes: CodeFix[] = []
      let iteration = 1

      // First iteration: Initial analysis and fix generation
      console.log(`🔄 Iteration ${iteration}: Initial Analysis`)
      currentAnalysis = await this.performAnalysis(this.options.filePath)
      currentFixes = await this.generateFixes(currentAnalysis)
      
      console.log(`📊 Found ${currentAnalysis.issues.length} issues`)
      console.log(`🔧 Generated ${currentFixes.length} fixes`)
      console.log('')

      // Second iteration: Apply fixes and re-analyze
      if (this.options.autoApply && currentFixes.length > 0) {
        iteration++
        console.log(`🔄 Iteration ${iteration}: Apply Fixes`)
        
        const fixResults = await this.applyFixes(currentFixes, this.options.filePath)
        const appliedFixes = fixResults.filter(r => r.success)
        
        if (appliedFixes.length > 0) {
          console.log(`✅ Applied ${appliedFixes.length} fixes`)
          
          // Re-analyze after fixes
          currentAnalysis = await this.performAnalysis(this.options.filePath)
          currentFixes = await this.generateFixes(currentAnalysis)
          
          console.log(`📊 After fixes: ${currentAnalysis.issues.length} issues remaining`)
          console.log(`🔧 Additional fixes: ${currentFixes.length}`)
        }
      }

      // Generate final report
      const report = await this.generateReport(currentAnalysis, currentFixes, iteration)
      
      // Calculate metrics
      const metrics = this.calculateMetrics(currentAnalysis, currentFixes, iteration)
      
      console.log('')
      console.log('📊 Final Results:')
      console.log(`Total issues: ${metrics.totalIssues}`)
      console.log(`Fixes generated: ${metrics.fixesGenerated}`)
      console.log(`Quality improvement: ${metrics.qualityImprovement.toFixed(1)}%`)
      console.log(`Execution time: ${metrics.executionTime}ms`)

      return {
        success: true,
        analysis: currentAnalysis,
        fixes: currentFixes,
        metrics,
        message: 'Auto-fix analysis completed successfully'
      }

            } catch (error) {
          console.error('❌ Auto-fix failed:', error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          return {
            success: false,
            analysis: {} as CodeAnalysis,
            fixes: [],
            metrics: {} as Metrics,
            message: `Auto-fix failed: ${errorMessage}`
          }
        }
  }

  private async performAnalysis(filePath: string): Promise<CodeAnalysis> {
    console.log('🔍 Performing code analysis...')
    
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    const issues = await this.codeFixer.analyzeCode(content, filePath, this.options)
    const fixes = await this.codeFixer.generateFixes(issues, this.options)
    
    return {
      filePath,
      issues,
      fixes,
      metrics: {
        totalLines: lines.length,
        totalIssues: issues.length,
        fixableIssues: issues.filter(i => i.fixable).length,
        securityIssues: issues.filter(i => i.category === 'security').length,
        performanceIssues: issues.filter(i => i.category === 'performance').length,
        qualityIssues: issues.filter(i => i.category === 'quality').length
      },
      timestamp: new Date()
    }
  }

  private async generateFixes(analysis: CodeAnalysis): Promise<CodeFix[]> {
    console.log('🔧 Generating fixes...')
    
    const fixes = await this.codeFixer.generateFixes(analysis.issues, this.options)
    
    // Limit to max fixes
    return fixes.slice(0, this.options.maxFixes)
  }

  private async applyFixes(fixes: CodeFix[], filePath: string): Promise<FixResult[]> {
    console.log('⚡ Applying fixes...')
    
    const results: FixResult[] = []
    const content = fs.readFileSync(filePath, 'utf-8')
    
    for (const fix of fixes) {
      if (fix.autoApply && fix.risk === 'low') {
        try {
          const result = await this.codeFixer.applyFix(fix, content, filePath)
          results.push(result)
          
          if (result.success) {
            // Update file content for next fix
            const newContent = this.applyFixToContent(content, fix)
            fs.writeFileSync(filePath, newContent)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.push({
            success: false,
            appliedFixes: [],
            failedFixes: [fix],
            rollbackRequired: false,
            message: `Failed to apply fix: ${errorMessage}`
          })
        }
      } else {
        results.push({
          success: false,
          appliedFixes: [],
          failedFixes: [fix],
          rollbackRequired: false,
          message: 'Fix requires manual review or is too risky'
        })
      }
    }
    
    return results
  }

  private applyFixToContent(content: string, fix: CodeFix): string {
    const lines = content.split('\n')
    const lineIndex = fix.line - 1
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex]
      // Simple replacement - replace the exact pattern
      const newLine = line.replace(fix.before, fix.after)
      lines[lineIndex] = newLine
    }
    
    return lines.join('\n')
  }

  private async generateReport(analysis: CodeAnalysis, fixes: CodeFix[], iterations: number): Promise<FixReport> {
    console.log('📋 Generating report...')
    
    const report = await this.reportGenerator.generateReport(analysis, fixes, iterations)
    
    // Save report
    const reportPath = path.join(this.options.outputPath, 'auto-fix-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Generate markdown report
    const markdownPath = path.join(this.options.outputPath, 'auto-fix-report.md')
    const markdown = this.reportGenerator.generateMarkdownReport(report)
    fs.writeFileSync(markdownPath, markdown)
    
    console.log(`📄 Report saved to: ${reportPath}`)
    console.log(`📄 Markdown saved to: ${markdownPath}`)
    
    return report
  }

  private calculateMetrics(analysis: CodeAnalysis, fixes: CodeFix[], iterations: number): Metrics {
    const endTime = Date.now()
    const executionTime = endTime - this.startTime
    
    const totalIssues = analysis.metrics.totalIssues
    const fixesGenerated = fixes.length
    const fixesApplied = this.options.autoApply ? fixes.filter(f => f.risk === 'low').length : 0
    
    // Calculate quality improvement based on issues resolved
    const qualityImprovement = totalIssues > 0 ? (fixesApplied / totalIssues) * 100 : 0
    
    return {
      totalIssues,
      fixesGenerated,
      fixesApplied,
      qualityImprovement,
      executionTime,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    }
  }
}