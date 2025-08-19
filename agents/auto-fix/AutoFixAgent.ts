import { AutoFixOptions, CodeIssue, FixResult, AutoFixReport, FixSummary, FixMetadata } from './types'
import { ReportGenerator } from './ReportGenerator'
import * as fs from 'fs'
import * as path from 'path'

export class AutoFixAgent {
  private options: AutoFixOptions
  private reportGenerator: ReportGenerator
  private issues: CodeIssue[] = []
  private fixes: FixResult[] = []

  constructor(options: AutoFixOptions) {
    this.options = options
    this.reportGenerator = new ReportGenerator()
  }

  /**
   * Main execution method with 2 iterations
   */
  async run(): Promise<AutoFixReport> {
    console.log('🔧 AI-Powered Auto-Fix Agent Starting...')
    console.log(`📁 Target File: ${this.options.filePath}`)
    console.log(`🔄 Max fixes: ${this.options.maxFixes}`)
    console.log(`🔄 Max iterations: 2 (with improvement tracking)`)
    console.log('')

    try {
      // Iteratie 1: Basis code analyse en fixes
      console.log('🔄 Iteratie 1: Basis code analyse en fixes...')
      const iteration1Result = await this.executeIteration(1)
      
      console.log(`📊 Iteratie 1 Resultaat: ${iteration1Result.issuesFound} issues gevonden, ${iteration1Result.fixesApplied} fixes toegepast`)
      console.log('')

      // Iteratie 2: Verbeterde analyse en fixes
      console.log('🔄 Iteratie 2: Verbeterde analyse en fixes...')
      const iteration2Result = await this.executeIteration(2, iteration1Result)
      
      console.log(`📊 Iteratie 2 Resultaat: ${iteration2Result.issuesFound} issues gevonden, ${iteration2Result.fixesApplied} fixes toegepast`)
      console.log('')

      // Vergelijk resultaten
      this.showImprovementSummary(iteration1Result, iteration2Result)

      // Genereer eindrapport
      const finalReport = await this.generateFinalReport(iteration2Result)
      
      return finalReport

    } catch (error) {
      console.error('❌ Error during auto-fix execution:', error)
      throw error
    }
  }

  /**
   * Execute a single iteration
   */
  private async executeIteration(iterationNumber: number, previousResult?: any): Promise<any> {
    const startTime = Date.now()
    
    try {
      // Analyze code for issues
      const issues = await this.analyzeCode()
      this.issues = issues
      
      // Apply fixes based on iteration
      let fixesApplied = 0
      if (iterationNumber === 1) {
        // First iteration: apply basic fixes
        fixesApplied = await this.applyBasicFixes(issues)
      } else {
        // Second iteration: apply advanced fixes
        fixesApplied = await this.applyAdvancedFixes(issues, previousResult)
      }
      
      const result = {
        iteration: iterationNumber,
        issuesFound: issues.length,
        fixesApplied,
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
   * Analyze code for issues
   */
  private async analyzeCode(): Promise<CodeIssue[]> {
    console.log('🔍 Analyzing code for issues...')
    
    const issues: CodeIssue[] = []
    
    try {
      if (!fs.existsSync(this.options.filePath)) {
        console.warn(`⚠️ File not found: ${this.options.filePath}`)
        return issues
      }

      const content = fs.readFileSync(this.options.filePath, 'utf-8')
      const lines = content.split('\n')

      // Analyze each line for potential issues
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1

        // Security issues
        if (this.options.includeSecurityFixes) {
          const securityIssues = this.analyzeSecurityIssues(line, lineNumber)
          issues.push(...securityIssues)
        }

        // Performance issues
        if (this.options.includePerformanceFixes) {
          const performanceIssues = this.analyzePerformanceIssues(line, lineNumber)
          issues.push(...performanceIssues)
        }

        // Quality issues
        if (this.options.includeQualityFixes) {
          const qualityIssues = this.analyzeQualityIssues(line, lineNumber)
          issues.push(...qualityIssues)
        }
      }

      // Limit to max fixes
      if (issues.length > this.options.maxFixes) {
        issues.splice(this.options.maxFixes)
      }

      console.log(`✅ Found ${issues.length} issues to fix`)
      return issues

    } catch (error) {
      console.error('❌ Error analyzing code:', error)
      return []
    }
  }

  /**
   * Analyze security issues
   */
  private analyzeSecurityIssues(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    // Check for SQL injection vulnerabilities
    if (line.includes('SELECT') && line.includes('${') && !line.includes('prepared')) {
      issues.push({
        id: `security-${lineNumber}-1`,
        type: 'security',
        severity: 'critical',
        filePath: this.options.filePath,
        lineNumber,
        columnNumber: line.indexOf('${'),
        description: 'Potential SQL injection vulnerability detected',
        currentCode: line,
        suggestedFix: line.replace(/\$\{([^}]+)\}/g, '?'),
        confidence: 0.9,
        impact: 'critical',
        effort: 'medium',
        tags: ['sql-injection', 'security', 'critical']
      })
    }

    // Check for XSS vulnerabilities
    if (line.includes('innerHTML') && line.includes('${')) {
      issues.push({
        id: `security-${lineNumber}-2`,
        type: 'security',
        severity: 'high',
        filePath: this.options.filePath,
        lineNumber,
        columnNumber: line.indexOf('innerHTML'),
        description: 'Potential XSS vulnerability detected',
        currentCode: line,
        suggestedFix: line.replace('innerHTML', 'textContent'),
        confidence: 0.8,
        impact: 'high',
        effort: 'low',
        tags: ['xss', 'security', 'high']
      })
    }

    return issues
  }

  /**
   * Analyze performance issues
   */
  private analyzePerformanceIssues(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    // Check for inefficient loops
    if (line.includes('for (') && line.includes('length') && line.includes('i++')) {
      const arrayName = line.match(/for\s*\(\s*let\s+(\w+)\s*=\s*0/)?.[1]
      if (arrayName) {
        issues.push({
          id: `performance-${lineNumber}-1`,
          type: 'performance',
          severity: 'medium',
          filePath: this.options.filePath,
          lineNumber,
          columnNumber: line.indexOf('for'),
          description: 'Consider using forEach or for...of for better performance',
          currentCode: line,
          suggestedFix: `${arrayName}.forEach(item => {\n  // TODO: Implement loop body\n})`,
          confidence: 0.7,
          impact: 'medium',
          effort: 'low',
          tags: ['performance', 'loop', 'medium']
        })
      }
    }

    return issues
  }

  /**
   * Analyze quality issues
   */
  private analyzeQualityIssues(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    // Check for magic numbers
    if (line.match(/\b\d{3,}\b/) && !line.includes('//')) {
      issues.push({
        id: `quality-${lineNumber}-1`,
        type: 'quality',
        severity: 'low',
        filePath: this.options.filePath,
        lineNumber,
        columnNumber: line.search(/\b\d{3,}\b/),
        description: 'Magic number detected, consider using a named constant',
        currentCode: line,
        suggestedFix: `// TODO: Replace magic number with named constant\n${line}`,
        confidence: 0.6,
        impact: 'low',
        effort: 'low',
        tags: ['quality', 'magic-number', 'low']
      })
    }

    // Check for long lines
    if (line.length > 120) {
      issues.push({
        id: `quality-${lineNumber}-2`,
        type: 'quality',
        severity: 'low',
        filePath: this.options.filePath,
        lineNumber,
        columnNumber: 0,
        description: 'Line is too long, consider breaking it up',
        currentCode: line,
        suggestedFix: `// TODO: Break long line into multiple lines\n${line}`,
        confidence: 0.8,
        impact: 'low',
        effort: 'low',
        tags: ['quality', 'line-length', 'low']
      })
    }

    return issues
  }

  /**
   * Apply basic fixes
   */
  private async applyBasicFixes(issues: CodeIssue[]): Promise<number> {
    console.log('🔧 Applying basic fixes...')
    
    let fixesApplied = 0
    
    for (const issue of issues) {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        try {
          await this.applyFix(issue)
          fixesApplied++
        } catch (error) {
          console.error(`❌ Failed to apply fix for issue ${issue.id}:`, error)
        }
      }
    }
    
    return fixesApplied
  }

  /**
   * Apply advanced fixes
   */
  private async applyAdvancedFixes(issues: CodeIssue[], previousResult: any): Promise<number> {
    console.log('🔧 Applying advanced fixes...')
    
    let fixesApplied = 0
    
    for (const issue of issues) {
      if (issue.severity === 'medium' || issue.severity === 'low') {
        try {
          await this.applyFix(issue)
          fixesApplied++
        } catch (error) {
          console.error(`❌ Failed to apply fix for issue ${issue.id}:`, error)
        }
      }
    }
    
    return fixesApplied
  }

  /**
   * Apply a single fix
   */
  private async applyFix(issue: CodeIssue): Promise<void> {
    try {
      if (!this.options.autoApply) {
        console.log(`💡 Suggested fix for ${issue.type} issue: ${issue.description}`)
        return
      }

      // Read current file
      const content = fs.readFileSync(this.options.filePath, 'utf-8')
      const lines = content.split('\n')
      
      // Apply fix
      if (issue.lineNumber <= lines.length) {
        const originalLine = lines[issue.lineNumber - 1]
        lines[issue.lineNumber - 1] = issue.suggestedFix
        
        // Write back to file
        fs.writeFileSync(this.options.filePath, lines.join('\n'))
        
        // Record fix
        const fixResult: FixResult = {
          id: `fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          issueId: issue.id,
          status: 'applied',
          originalCode: originalLine,
          fixedCode: issue.suggestedFix,
          diff: `- ${originalLine}\n+ ${issue.suggestedFix}`,
          appliedAt: new Date().toISOString(),
          appliedBy: 'AutoFixAgent'
        }
        
        this.fixes.push(fixResult)
        console.log(`✅ Applied fix for ${issue.type} issue: ${issue.description}`)
      }
      
    } catch (error) {
      console.error(`❌ Error applying fix:`, error)
      throw error
    }
  }

  /**
   * Show improvement summary
   */
  private showImprovementSummary(iteration1Result: any, iteration2Result: any): void {
    console.log('📊 Improvement Summary:')
    console.log('========================')
    console.log(`Issues Found: ${iteration1Result.issuesFound} → ${iteration2Result.issuesFound}`)
    console.log(`Fixes Applied: ${iteration1Result.fixesApplied} → ${iteration2Result.fixesApplied}`)
    console.log(`Execution Time: ${iteration1Result.executionTime}ms → ${iteration2Result.executionTime}ms`)
    
    const improvement = iteration2Result.fixesApplied - iteration1Result.fixesApplied
    if (improvement > 0) {
      console.log(`🎯 Improvement: +${improvement} fixes applied in iteration 2`)
    } else {
      console.log(`⚠️ No improvement in iteration 2`)
    }
    console.log('')
  }

  /**
   * Generate final report
   */
  private async generateFinalReport(finalResult: any): Promise<AutoFixReport> {
    console.log('📋 Generating final auto-fix report...')
    
    const summary: FixSummary = {
      totalIssues: this.issues.length,
      issuesFixed: this.fixes.filter(f => f.status === 'applied').length,
      issuesSkipped: this.fixes.filter(f => f.status === 'skipped').length,
      issuesFailed: this.fixes.filter(f => f.status === 'failed').length,
      securityIssues: this.issues.filter(i => i.type === 'security').length,
      performanceIssues: this.issues.filter(i => i.type === 'performance').length,
      qualityIssues: this.issues.filter(i => i.type === 'quality').length,
      overallImprovement: this.calculateOverallImprovement(),
      estimatedEffort: this.estimateEffort()
    }

    const metadata: FixMetadata = {
      agentVersion: '1.0.0',
      analysisTime: finalResult.executionTime,
      fixTime: 0, // Would calculate actual fix time
      totalTime: finalResult.executionTime,
      configuration: this.options,
      environment: 'development'
    }

    const report: AutoFixReport = {
      id: `report-${Date.now()}`,
      timestamp: new Date().toISOString(),
      filePath: this.options.filePath,
      summary,
      issues: this.issues,
      fixes: this.fixes,
      recommendations: this.generateRecommendations(),
      metadata
    }

    // Save report
    await this.reportGenerator.generateAutoFixReport(report, this.options.outputPath)
    
    return report
  }

  /**
   * Calculate overall improvement
   */
  private calculateOverallImprovement(): number {
    if (this.issues.length === 0) return 0
    
    const criticalIssues = this.issues.filter(i => i.severity === 'critical').length
    const highIssues = this.issues.filter(i => i.severity === 'high').length
    const mediumIssues = this.issues.filter(i => i.severity === 'medium').length
    const lowIssues = this.issues.filter(i => i.severity === 'low').length
    
    const totalWeight = criticalIssues * 4 + highIssues * 3 + mediumIssues * 2 + lowIssues * 1
    const fixedWeight = this.fixes.filter(f => f.status === 'applied').length * 2
    
    return totalWeight > 0 ? Math.round((fixedWeight / totalWeight) * 100) : 0
  }

  /**
   * Estimate effort required
   */
  private estimateEffort(): string {
    const totalIssues = this.issues.length
    if (totalIssues === 0) return 'none'
    if (totalIssues <= 5) return 'low'
    if (totalIssues <= 15) return 'medium'
    return 'high'
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (this.issues.filter(i => i.type === 'security').length > 0) {
      recommendations.push('Implement security code review process')
      recommendations.push('Add automated security scanning to CI/CD pipeline')
    }
    
    if (this.issues.filter(i => i.type === 'performance').length > 0) {
      recommendations.push('Add performance testing to development workflow')
      recommendations.push('Consider using performance profiling tools')
    }
    
    if (this.issues.filter(i => i.type === 'quality').length > 0) {
      recommendations.push('Implement code quality gates in CI/CD')
      recommendations.push('Add linting rules for common quality issues')
    }
    
    return recommendations
  }
}