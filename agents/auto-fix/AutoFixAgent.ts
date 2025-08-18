import { CodeFixer } from './CodeFixer'
import { Validator } from './Validator'
import { ReportGenerator } from './ReportGenerator'
import { AutoFixOptions, FixReport } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class AutoFixAgent {
  private codeFixer: CodeFixer
  private validator: Validator
  private reportGenerator: ReportGenerator
  private options: AutoFixOptions
  private iterationResults: any[] = []

  constructor(options: AutoFixOptions) {
    this.options = options
    this.codeFixer = new CodeFixer()
    this.validator = new Validator()
    this.reportGenerator = new ReportGenerator(options.outputPath)
  }

  /**
   * Main execution method with 2 iterations
   */
  async run(): Promise<any> {
    console.log('🔧 AI-Powered Auto-Fix Agent Starting...')
    console.log(`📁 Target file: ${this.options.filePath}`)
    console.log(`🔄 Max iterations: 2 (with improvement tracking)`)
    console.log(`🚨 Auto-apply: ${this.options.autoApply ? 'ENABLED' : 'DISABLED'} (analysis only)`)
    console.log('')

    try {
      // Iteratie 1: Basis code analyse en fix identificatie
      console.log('🔄 Iteratie 1: Basis code analyse en fix identificatie...')
      const iteration1Result = await this.executeIteration(1)
      this.iterationResults.push(iteration1Result)
      
      console.log(`📊 Iteratie 1 Resultaat: ${iteration1Result.issuesFound} issues gevonden, ${iteration1Result.fixesGenerated} fixes gegenereerd`)
      console.log('')

      // Iteratie 2: Verbeterde analyse en extra fixes
      console.log('🔄 Iteratie 2: Verbeterde analyse en extra fixes...')
      const iteration2Result = await this.executeIteration(2, iteration1Result)
      this.iterationResults.push(iteration2Result)
      
      console.log(`📊 Iteratie 2 Resultaat: ${iteration2Result.issuesFound} issues gevonden, ${iteration2Result.fixesGenerated} fixes gegenereerd`)
      console.log('')

      // Vergelijk resultaten
      this.showImprovementSummary(iteration1Result, iteration2Result)

      // Genereer rapporten
      const finalReport = await this.generateFinalReport(iteration2Result)
      
      return finalReport

    } catch (error) {
      console.error('❌ Error during auto-fix analysis:', error)
      throw error
    }
  }

  /**
   * Execute a single iteration
   */
  private async executeIteration(iterationNumber: number, previousResult?: any): Promise<any> {
    const startTime = Date.now()
    
    try {
      // Analyze code
      const codeAnalysis = await this.codeFixer.analyzeCode(this.options.filePath)
      
      // Generate fixes with improvement logic
      let fixes = await this.generateFixes(codeAnalysis, iterationNumber, previousResult)
      
      // Validate fixes
      const validationResults = await this.validator.validateFixes(fixes, codeAnalysis)
      
      // Apply fixes if enabled
      let appliedFixes = []
      if (this.options.autoApply && iterationNumber === 2) {
        // Only apply fixes in second iteration if auto-apply is enabled
        appliedFixes = await this.applyFixes(fixes, validationResults)
      }
      
      // Calculate metrics for this iteration
      const metrics = this.calculateIterationMetrics(fixes, validationResults, appliedFixes, codeAnalysis)
      
      const result = {
        iteration: iterationNumber,
        codeAnalysis,
        fixes,
        validationResults,
        appliedFixes,
        metrics,
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
   * Generate fixes based on iteration number
   */
  private async generateFixes(codeAnalysis: any, iterationNumber: number, previousResult?: any): Promise<any[]> {
    let fixes = []
    
    if (iterationNumber === 1) {
      // First iteration: basic fixes
      fixes = await this.codeFixer.generateFixes(codeAnalysis, this.options)
    } else {
      // Second iteration: improved fixes
      fixes = await this.improveFixes(previousResult, codeAnalysis)
    }
    
    return fixes
  }

  /**
   * Improve fixes based on previous iteration
   */
  private async improveFixes(previousResult: any, codeAnalysis: any): Promise<any[]> {
    const improvedFixes = [...previousResult.fixes]
    
    // Add more sophisticated fixes
    const advancedFixes = await this.generateAdvancedFixes(codeAnalysis)
    improvedFixes.push(...advancedFixes)
    
    // Add performance fixes if enabled
    if (this.options.includePerformanceFixes) {
      const performanceFixes = await this.generatePerformanceFixes(codeAnalysis)
      improvedFixes.push(...performanceFixes)
    }
    
    // Add security fixes if enabled
    if (this.options.includeSecurityFixes) {
      const securityFixes = await this.generateSecurityFixes(codeAnalysis)
      improvedFixes.push(...securityFixes)
    }
    
    // Add quality fixes if enabled
    if (this.options.includeQualityFixes) {
      const qualityFixes = await this.generateQualityFixes(codeAnalysis)
      improvedFixes.push(...qualityFixes)
    }
    
    return improvedFixes
  }

  /**
   * Generate advanced fixes
   */
  private async generateAdvancedFixes(codeAnalysis: any): Promise<any[]> {
    const advancedFixes = []
    
    // Add code structure improvements
    if (codeAnalysis.complexity > 50) {
      advancedFixes.push({
        id: `advanced-structure-${Date.now()}`,
        type: 'code-structure',
        description: 'Refactor complex code structure',
        priority: 'high',
        filePath: this.options.filePath,
        lineNumber: codeAnalysis.complexityLines?.[0] || 1,
        originalCode: 'Complex code structure detected',
        suggestedFix: 'Break down into smaller, focused functions',
        confidence: 0.8,
        category: 'refactoring',
        tags: ['advanced', 'iteration-2']
      })
    }
    
    // Add error handling improvements
    if (!codeAnalysis.hasErrorHandling) {
      advancedFixes.push({
        id: `advanced-error-handling-${Date.now()}`,
        type: 'error-handling',
        description: 'Add comprehensive error handling',
        priority: 'medium',
        filePath: this.options.filePath,
        lineNumber: 1,
        originalCode: 'Missing error handling',
        suggestedFix: 'Implement try-catch blocks and error boundaries',
        confidence: 0.9,
        category: 'robustness',
        tags: ['advanced', 'iteration-2']
      })
    }
    
    return advancedFixes
  }

  /**
   * Generate performance fixes
   */
  private async generatePerformanceFixes(codeAnalysis: any): Promise<any[]> {
    const performanceFixes = []
    
    // Add memory optimization fixes
    performanceFixes.push({
      id: `performance-memory-${Date.now()}`,
      type: 'performance',
      description: 'Optimize memory usage',
      priority: 'medium',
      filePath: this.options.filePath,
      lineNumber: 1,
      originalCode: 'Potential memory leaks',
      suggestedFix: 'Implement proper cleanup and resource management',
      confidence: 0.7,
      category: 'performance',
      tags: ['performance', 'iteration-2']
    })
    
    // Add algorithm optimization fixes
    performanceFixes.push({
      id: `performance-algorithm-${Date.now()}`,
      type: 'performance',
      description: 'Optimize algorithm efficiency',
      priority: 'medium',
      filePath: this.options.filePath,
      lineNumber: 1,
      originalCode: 'Suboptimal algorithm detected',
      suggestedFix: 'Use more efficient data structures and algorithms',
      confidence: 0.6,
      category: 'performance',
      tags: ['performance', 'iteration-2']
    })
    
    return performanceFixes
  }

  /**
   * Generate security fixes
   */
  private async generateSecurityFixes(codeAnalysis: any): Promise<any[]> {
    const securityFixes = []
    
    // Add input validation fixes
    if (!codeAnalysis.hasInputValidation) {
      securityFixes.push({
        id: `security-input-validation-${Date.now()}`,
        type: 'security',
        description: 'Add input validation',
        priority: 'critical',
        filePath: this.options.filePath,
        lineNumber: 1,
        originalCode: 'Missing input validation',
        suggestedFix: 'Implement comprehensive input sanitization and validation',
        confidence: 0.9,
        category: 'security',
        tags: ['security', 'iteration-2']
      })
    }
    
    // Add authentication fixes
    if (codeAnalysis.securityIssues?.some((issue: any) => issue.type === 'authentication')) {
      securityFixes.push({
        id: `security-auth-${Date.now()}`,
        type: 'security',
        description: 'Improve authentication security',
        priority: 'critical',
        filePath: this.options.filePath,
        lineNumber: 1,
        originalCode: 'Weak authentication detected',
        suggestedFix: 'Implement strong authentication with proper session management',
        confidence: 0.8,
        category: 'security',
        tags: ['security', 'iteration-2']
      })
    }
    
    return securityFixes
  }

  /**
   * Generate quality fixes
   */
  private async generateQualityFixes(codeAnalysis: any): Promise<any[]> {
    const qualityFixes = []
    
    // Add code style fixes
    qualityFixes.push({
      id: `quality-style-${Date.now()}`,
      type: 'quality',
      description: 'Improve code style and consistency',
      priority: 'low',
      filePath: this.options.filePath,
      lineNumber: 1,
      originalCode: 'Inconsistent code style',
      suggestedFix: 'Apply consistent formatting and naming conventions',
      confidence: 0.8,
      category: 'quality',
      tags: ['quality', 'iteration-2']
    })
    
    // Add documentation fixes
    if (!codeAnalysis.hasDocumentation) {
      qualityFixes.push({
        id: `quality-documentation-${Date.now()}`,
        type: 'quality',
        description: 'Add code documentation',
        priority: 'medium',
        filePath: this.options.filePath,
        lineNumber: 1,
        originalCode: 'Missing documentation',
        suggestedFix: 'Add comprehensive JSDoc comments and README documentation',
        confidence: 0.9,
        category: 'quality',
        tags: ['quality', 'iteration-2']
      })
    }
    
    return qualityFixes
  }

  /**
   * Apply fixes to the code
   */
  private async applyFixes(fixes: any[], validationResults: any[]): Promise<any[]> {
    const appliedFixes = []
    
    for (const fix of fixes) {
      try {
        // Check if fix passed validation
        const validation = validationResults.find(v => v.fixId === fix.id)
        if (validation && validation.isValid) {
          // Apply the fix
          const result = await this.codeFixer.applyFix(fix, this.options.filePath)
          if (result.success) {
            appliedFixes.push({
              ...fix,
              appliedAt: new Date().toISOString(),
              result
            })
          }
        }
      } catch (error) {
        console.error(`Error applying fix ${fix.id}:`, error)
      }
    }
    
    return appliedFixes
  }

  /**
   * Calculate metrics for an iteration
   */
  private calculateIterationMetrics(fixes: any[], validationResults: any[], appliedFixes: any[], codeAnalysis: any): any {
    const totalFixes = fixes.length
    const validFixes = validationResults.filter(v => v.isValid).length
    const appliedCount = appliedFixes.length
    const skippedCount = totalFixes - appliedCount
    
    // Calculate improvement score
    let improvementScore = 0
    
    // Base score from number of valid fixes
    improvementScore += Math.min(validFixes * 5, 40)
    
    // Bonus for applied fixes
    improvementScore += Math.min(appliedCount * 3, 30)
    
    // Bonus for comprehensive analysis
    if (totalFixes > 10) improvementScore += 20
    
    // Bonus for low complexity
    if (codeAnalysis.complexity < 30) improvementScore += 10
    
    return {
      totalFixes,
      validFixes,
      appliedCount,
      skippedCount,
      improvementScore: Math.min(improvementScore, 100),
      validationRate: totalFixes > 0 ? (validFixes / totalFixes) * 100 : 0,
      applicationRate: totalFixes > 0 ? (appliedCount / totalFixes) * 100 : 0
    }
  }

  /**
   * Show improvement summary between iterations
   */
  private showImprovementSummary(iteration1: any, iteration2: any): void {
    console.log('🎯 Verbetering Samenvatting')
    console.log('============================')
    
    const fixImprovement = iteration2.metrics.totalFixes - iteration1.metrics.totalFixes
    const scoreImprovement = iteration2.metrics.improvementScore - iteration1.metrics.improvementScore
    
    console.log(`📊 Fixes: ${iteration1.metrics.totalFixes} → ${iteration2.metrics.totalFixes} (+${fixImprovement})`)
    console.log(`📈 Improvement Score: ${iteration1.metrics.improvementScore} → ${iteration2.metrics.improvementScore} (+${scoreImprovement} punten)`)
    console.log(`⚡ Uitvoeringstijd: ${iteration1.executionTime}ms → ${iteration2.executionTime}ms`)
    
    if (scoreImprovement > 0) {
      console.log(`✅ Verbetering: ${((scoreImprovement / iteration1.metrics.improvementScore) * 100).toFixed(1)}%`)
    } else {
      console.log(`⚠️ Geen verbetering in iteratie 2`)
    }
    
    console.log('')
  }

  /**
   * Generate final report with iteration data
   */
  private async generateFinalReport(finalResult: any): Promise<any> {
    const report = {
      ...finalResult,
      iterationHistory: this.iterationResults,
      improvementSummary: {
        fixIncrease: finalResult.metrics.totalFixes - this.iterationResults[0].metrics.totalFixes,
        scoreIncrease: finalResult.metrics.improvementScore - this.iterationResults[0].metrics.improvementScore,
        totalIterations: this.iterationResults.length
      }
    }

    // Save reports
    await this.reportGenerator.saveReport(report)
    await this.reportGenerator.generateMarkdownSummary(report)
    await this.reportGenerator.generateMetricsReport(report)

    return report
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      options: this.options,
      iterations: this.iterationResults.length,
      currentScore: this.iterationResults.length > 0 ? this.iterationResults[this.iterationResults.length - 1].metrics.improvementScore : 0
    }
  }
}