import { CodeFix, CodeIssue, CodeSuggestion, FixResult, ValidationResult } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class CodeFixer {
  private appliedFixes: CodeFix[] = []
  private failedFixes: CodeFix[] = []
  private skippedFixes: CodeFix[] = []

  constructor() {}

  /**
   * Analyze code and identify fixable issues
   */
  async analyzeCode(filePath: string): Promise<CodeIssue[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      const issues: CodeIssue[] = []

      // Analyze each line for common issues
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1

        // Check for common code smells and issues
        const lineIssues = this.analyzeLine(line, lineNumber)
        issues.push(...lineIssues)
      }

      // Analyze file-level issues
      const fileIssues = this.analyzeFileLevel(content, filePath)
      issues.push(...fileIssues)

      return issues
    } catch (error) {
      console.error(`Error analyzing code in ${filePath}:`, error)
      return []
    }
  }

  /**
   * Analyze individual line for issues
   */
  private analyzeLine(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    // Check for common issues
    if (line.includes('console.log') && !line.includes('// TODO: Remove')) {
      issues.push({
        id: `console-log-${lineNumber}`,
        type: 'quality',
        severity: 'low',
        description: 'Console.log statement found - consider removing in production',
        lineNumber,
        code: line.trim(),
        impact: 'Debug code in production',
        recommendation: 'Remove console.log or add TODO comment',
        autoFixable: true
      })
    }

    // Check for hardcoded values
    if (line.includes('localhost') || line.includes('127.0.0.1')) {
      issues.push({
        id: `hardcoded-host-${lineNumber}`,
        type: 'quality',
        severity: 'medium',
        description: 'Hardcoded localhost/127.0.0.1 found',
        lineNumber,
        code: line.trim(),
        impact: 'Environment-specific configuration',
        recommendation: 'Use environment variables or configuration files',
        autoFixable: false
      })
    }

    // Check for magic numbers
    const magicNumberMatch = line.match(/\b\d{3,}\b/)
    if (magicNumberMatch && !line.includes('// Magic number')) {
      issues.push({
        id: `magic-number-${lineNumber}`,
        type: 'quality',
        severity: 'low',
        description: 'Magic number found - consider using named constants',
        lineNumber,
        code: line.trim(),
        impact: 'Code readability and maintainability',
        recommendation: 'Define named constants for magic numbers',
        autoFixable: false
      })
    }

    return issues
  }

  /**
   * Analyze file-level issues
   */
  private analyzeFileLevel(content: string, filePath: string): CodeIssue[] {
    const issues: CodeIssue[] = []

    // Check file size
    if (content.length > 10000) {
      issues.push({
        id: 'file-size',
        type: 'quality',
        severity: 'medium',
        description: 'File is very large - consider splitting into smaller modules',
        lineNumber: 0,
        code: `File size: ${content.length} characters`,
        impact: 'Maintainability and readability',
        recommendation: 'Split file into smaller, focused modules',
        autoFixable: false
      })
    }

    // Check for TODO comments
    const todoMatches = content.match(/TODO:/g)
    if (todoMatches && todoMatches.length > 3) {
      issues.push({
        id: 'multiple-todos',
        type: 'quality',
        severity: 'medium',
        description: 'Multiple TODO comments found - consider addressing technical debt',
        lineNumber: 0,
        code: `Found ${todoMatches.length} TODO comments`,
        impact: 'Technical debt accumulation',
        recommendation: 'Review and address TODO items',
        autoFixable: false
      })
    }

    return issues
  }

  /**
   * Generate fixes for identified issues
   */
  async generateFixes(issues: CodeIssue[]): Promise<CodeFix[]> {
    const fixes: CodeFix[] = []

    for (const issue of issues) {
      if (issue.autoFixable) {
        const fix = await this.generateFix(issue)
        if (fix) {
          fixes.push(fix)
        }
      }
    }

    return fixes
  }

  /**
   * Generate a specific fix for an issue
   */
  private async generateFix(issue: CodeIssue): Promise<CodeFix | null> {
    try {
      const content = fs.readFileSync(issue.filePath, 'utf-8')
      const lines = content.split('\n')
      
      if (issue.lineNumber > 0 && issue.lineNumber <= lines.length) {
        const originalLine = lines[issue.lineNumber - 1]
        let fixedLine = originalLine

        // Apply specific fixes based on issue type
        switch (issue.id.split('-')[0]) {
          case 'console':
            // Remove console.log statement
            fixedLine = originalLine.replace(/console\.log\([^)]*\);?\s*/, '')
            break
          
          default:
            // No automatic fix available
            return null
        }

        if (fixedLine !== originalLine) {
          return {
            id: `fix-${issue.id}`,
            filePath: issue.filePath,
            lineNumber: issue.lineNumber,
            issueType: issue.type,
            severity: issue.severity,
            description: `Auto-fix for: ${issue.description}`,
            originalCode: originalLine,
            fixedCode: fixedLine,
            confidence: 0.8,
            validationRules: [
              {
                type: 'syntax',
                condition: 'Code compiles without errors',
                message: 'Fixed code should compile successfully'
              }
            ],
            dependencies: [],
            estimatedEffort: 'low',
            risk: 'low',
            tags: ['auto-fix', issue.type],
            createdAt: new Date().toISOString()
          }
        }
      }
    } catch (error) {
      console.error(`Error generating fix for issue ${issue.id}:`, error)
    }

    return null
  }

  /**
   * Apply a fix to the code
   */
  async applyFix(fix: CodeFix): Promise<FixResult> {
    const startTime = Date.now()
    
    try {
      const content = fs.readFileSync(fix.filePath, 'utf-8')
      const lines = content.split('\n')
      
      if (fix.lineNumber > 0 && fix.lineNumber <= lines.length) {
        // Apply the fix
        lines[fix.lineNumber - 1] = fix.fixedCode
        
        // Write the updated content
        fs.writeFileSync(fix.filePath, lines.join('\n'))
        
        // Validate the fix
        const validationResults = await this.validateFix(fix)
        
        const result: FixResult = {
          fixId: fix.id,
          status: 'applied',
          executionTime: Date.now() - startTime,
          output: { success: true, fileUpdated: true },
          timestamp: new Date().toISOString(),
          metadata: { appliedAt: new Date().toISOString() },
          validationResults
        }

        this.appliedFixes.push(fix)
        return result
      } else {
        throw new Error(`Invalid line number: ${fix.lineNumber}`)
      }
    } catch (error) {
      const result: FixResult = {
        fixId: fix.id,
        status: 'failed',
        executionTime: Date.now() - startTime,
        output: { success: false, error: error.message },
        error: error.message,
        timestamp: new Date().toISOString(),
        metadata: { failedAt: new Date().toISOString() },
        validationResults: []
      }

      this.failedFixes.push(fix)
      return result
    }
  }

  /**
   * Validate that a fix is correct
   */
  private async validateFix(fix: CodeFix): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    // Basic validation - check if file still exists and is readable
    try {
      const content = fs.readFileSync(fix.filePath, 'utf-8')
      const lines = content.split('\n')
      
      if (lines[fix.lineNumber - 1] === fix.fixedCode) {
        results.push({
          ruleId: 'fix-applied',
          passed: true,
          message: 'Fix was successfully applied to the file'
        })
      } else {
        results.push({
          ruleId: 'fix-applied',
          passed: false,
          message: 'Fix was not properly applied to the file'
        })
      }
    } catch (error) {
      results.push({
        ruleId: 'file-readable',
        passed: false,
        message: `File is no longer readable: ${error.message}`
      })
    }

    return results
  }

  /**
   * Get summary of all fixes
   */
  getFixSummary() {
    return {
      appliedFixes: this.appliedFixes,
      failedFixes: this.failedFixes,
      skippedFixes: this.skippedFixes,
      totalFixes: this.appliedFixes.length + this.failedFixes.length + this.skippedFixes.length,
      successRate: this.appliedFixes.length / (this.appliedFixes.length + this.failedFixes.length) || 0
    }
  }

  /**
   * Reset all fix tracking
   */
  reset() {
    this.appliedFixes = []
    this.failedFixes = []
    this.skippedFixes = []
  }
}