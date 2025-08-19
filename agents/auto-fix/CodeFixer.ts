import { CodeIssue, CodeFix, AutoFixOptions } from './types'

export class CodeFixer {
  private securityPatterns = [
    { pattern: /eval\s*\(/, risk: 'high', fix: 'eval()', replacement: '// Use safer alternatives like Function() or direct execution' },
    { pattern: /innerHTML\s*=/, risk: 'high', fix: 'innerHTML =', replacement: 'textContent =' },
    { pattern: /document\.write/, risk: 'high', fix: 'document.write', replacement: '// Use DOM manipulation instead' },
    { pattern: /setTimeout\s*\([^,]+,\s*0\)/, risk: 'medium', fix: 'setTimeout(, 0)', replacement: '// Consider using queueMicrotask() or Promise.resolve()' },
    { pattern: /console\.log/, risk: 'low', fix: 'console.log', replacement: '// Remove console.log in production' }
  ]

  private performancePatterns = [
    { pattern: /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*array\.length;\s*i\+\+\)/, risk: 'low', fix: 'for (let i = 0; i < array.length; i++)', replacement: 'for (const item of array)' },
    { pattern: /\.forEach\s*\(\s*function\s*\(/, risk: 'low', fix: '.forEach(function(', replacement: '.forEach((' },
    { pattern: /new\s+Array\s*\(\s*\)/, risk: 'low', fix: 'new Array()', replacement: '[]' },
    { pattern: /new\s+Object\s*\(\s*\)/, risk: 'low', fix: 'new Object()', replacement: '{}' },
    { pattern: /\.indexOf\s*\(\s*[^)]+\s*\)\s*!==\s*-1/, risk: 'low', fix: '.indexOf() !== -1', replacement: '.includes()' }
  ]

  private qualityPatterns = [
    { pattern: /TODO\s*:/, risk: 'low', fix: 'TODO:', replacement: '// TODO:' },
    { pattern: /FIXME\s*:/, risk: 'medium', fix: 'FIXME:', replacement: '// FIXME:' },
    { pattern: /HACK\s*:/, risk: 'high', fix: 'HACK:', replacement: '// HACK:' },
    { pattern: /var\s+/, risk: 'low', fix: 'var ', replacement: 'const ' },
    { pattern: /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+);\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\1/, risk: 'medium', fix: 'let x = y; x = x', replacement: 'const x = y' }
  ]

  private typescriptPatterns = [
    { pattern: /:\s*any\b/, risk: 'medium', fix: ': any', replacement: ': unknown' },
    { pattern: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/, risk: 'low', fix: 'function name() {', replacement: 'function name(): void {' },
    { pattern: /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*string\s*=\s*['"`][^'"`]*['"`]/, risk: 'low', fix: 'const x: string = "value"', replacement: 'const x = "value"' },
    { pattern: /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\{\s*\}/, risk: 'low', fix: 'interface Name {}', replacement: 'type Name = Record<string, never>' }
  ]

  async analyzeCode(content: string, filePath: string, options: AutoFixOptions): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = []
    const lines = content.split('\n')

    // Analyze each line for patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Security checks
      if (options.includeSecurityFixes) {
        issues.push(...this.checkSecurityPatterns(line, lineNumber))
      }

      // Performance checks
      if (options.includePerformanceFixes) {
        issues.push(...this.checkPerformancePatterns(line, lineNumber))
      }

      // Quality checks
      if (options.includeQualityFixes) {
        issues.push(...this.checkQualityPatterns(line, lineNumber))
      }

      // TypeScript checks
      if (options.includeTypeScriptFixes) {
        issues.push(...this.checkTypeScriptPatterns(line, lineNumber))
      }
    }

    // ESLint-like checks (simplified)
    if (options.includeESLintFixes) {
      issues.push(...this.checkESLintPatterns(content, filePath))
    }

    return issues
  }

  async generateFixes(issues: CodeIssue[], options: AutoFixOptions): Promise<CodeFix[]> {
    const fixes: CodeFix[] = []

    for (const issue of issues) {
      if (issue.fixable) {
        const fix = this.generateFixForIssue(issue, options)
        if (fix) {
          fixes.push(fix)
        }
      }
    }

    return fixes
  }

  async applyFix(fix: CodeFix, content: string, filePath: string): Promise<any> {
    try {
      const lines = content.split('\n')
      const lineIndex = fix.line - 1

      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex]
        const newLine = line.replace(fix.before, fix.after)
        lines[lineIndex] = newLine

        return {
          success: true,
          appliedFixes: [fix],
          failedFixes: [],
          rollbackRequired: false,
          message: 'Fix applied successfully'
        }
      }

      return {
        success: false,
        appliedFixes: [],
        failedFixes: [fix],
        rollbackRequired: false,
        message: 'Line number out of range'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        appliedFixes: [],
        failedFixes: [fix],
        rollbackRequired: false,
        message: `Error applying fix: ${errorMessage}`
      }
    }
  }

  private checkSecurityPatterns(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    for (const pattern of this.securityPatterns) {
      if (pattern.pattern.test(line)) {
        issues.push({
          id: `security-${lineNumber}-${Date.now()}`,
          type: 'warning',
          severity: pattern.risk === 'high' ? 'critical' : 'high',
          message: `Security issue: ${pattern.fix} detected`,
          line: lineNumber,
          column: line.indexOf(pattern.fix) + 1,
          code: line.trim(),
          category: 'security',
          fixable: true,
          confidence: 90
        })
      }
    }

    return issues
  }

  private checkPerformancePatterns(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    for (const pattern of this.performancePatterns) {
      if (pattern.pattern.test(line)) {
        issues.push({
          id: `performance-${lineNumber}-${Date.now()}`,
          type: 'suggestion',
          severity: 'medium',
          message: `Performance improvement: ${pattern.fix} can be optimized`,
          line: lineNumber,
          column: line.indexOf(pattern.fix) + 1,
          code: line.trim(),
          category: 'performance',
          fixable: true,
          confidence: 85
        })
      }
    }

    return issues
  }

  private checkQualityPatterns(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    for (const pattern of this.qualityPatterns) {
      if (pattern.pattern.test(line)) {
        issues.push({
          id: `quality-${lineNumber}-${Date.now()}`,
          type: 'suggestion',
          severity: pattern.risk === 'high' ? 'high' : 'medium',
          message: `Code quality: ${pattern.fix} should be addressed`,
          line: lineNumber,
          column: line.indexOf(pattern.fix) + 1,
          code: line.trim(),
          category: 'quality',
          fixable: true,
          confidence: 80
        })
      }
    }

    return issues
  }

  private checkTypeScriptPatterns(line: string, lineNumber: number): CodeIssue[] {
    const issues: CodeIssue[] = []

    for (const pattern of this.typescriptPatterns) {
      if (pattern.pattern.test(line)) {
        issues.push({
          id: `typescript-${lineNumber}-${Date.now()}`,
          type: 'suggestion',
          severity: 'medium',
          message: `TypeScript improvement: ${pattern.fix} can be enhanced`,
          line: lineNumber,
          column: line.indexOf(pattern.fix) + 1,
          code: line.trim(),
          category: 'typescript',
          fixable: true,
          confidence: 85
        })
      }
    }

    return issues
  }

  private checkESLintPatterns(content: string, filePath: string): CodeIssue[] {
    const issues: CodeIssue[] = []

    // Simple ESLint-like checks
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Check for trailing spaces
      if (line.endsWith(' ')) {
        issues.push({
          id: `eslint-${lineNumber}-${Date.now()}`,
          type: 'warning',
          severity: 'low',
          message: 'ESLint: Trailing spaces not allowed',
          line: lineNumber,
          column: line.length,
          code: line.trim(),
          category: 'eslint',
          fixable: true,
          confidence: 95
        })
      }

      // Check for missing semicolons (simple check)
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.trim().startsWith('//')) {
        issues.push({
          id: `eslint-${lineNumber}-${Date.now()}`,
          type: 'warning',
          severity: 'low',
          message: 'ESLint: Missing semicolon',
          line: lineNumber,
          column: line.length,
          code: line.trim(),
          category: 'eslint',
          fixable: true,
          confidence: 90
        })
      }
    }

    return issues
  }

  private generateFixForIssue(issue: CodeIssue, options: AutoFixOptions): CodeFix | null {
    let before = ''
    let after = ''

    // Generate fix based on category and message
    switch (issue.category) {
      case 'security':
        before = this.getSecurityFix(issue.message, issue.code)
        after = this.getSecurityReplacement(issue.message, issue.code)
        break
      case 'performance':
        before = this.getPerformanceFix(issue.message, issue.code)
        after = this.getPerformanceReplacement(issue.message, issue.code)
        break
      case 'quality':
        before = this.getQualityFix(issue.message, issue.code)
        after = this.getQualityReplacement(issue.message, issue.code)
        break
      case 'typescript':
        before = this.getTypeScriptFix(issue.message, issue.code)
        after = this.getTypeScriptReplacement(issue.message, issue.code)
        break
      case 'eslint':
        before = this.getESLintFix(issue.message, issue.code)
        after = this.getESLintReplacement(issue.message, issue.code)
        break
    }

    if (!before || !after) {
      return null
    }

    return {
      id: `fix-${issue.id}`,
      issueId: issue.id,
      description: issue.message,
      before,
      after,
      line: issue.line,
      column: issue.column,
      risk: issue.severity === 'critical' ? 'high' : issue.severity === 'high' ? 'medium' : 'low',
      confidence: issue.confidence,
      category: issue.category,
      autoApply: issue.severity !== 'critical' && issue.confidence > 80
    }
  }

  private getSecurityFix(message: string, code?: string): string {
    if (message.includes('eval()')) return 'eval('
    if (message.includes('innerHTML =')) return 'innerHTML ='
    if (message.includes('document.write')) return 'document.write'
    if (message.includes('setTimeout(, 0)')) return 'setTimeout(, 0)'
    if (message.includes('console.log')) return 'console.log'
    return ''
  }

  private getSecurityReplacement(message: string, code?: string): string {
    if (message.includes('eval()')) return '// Use safer alternatives'
    if (message.includes('innerHTML =')) return 'textContent ='
    if (message.includes('document.write')) return '// Use DOM manipulation'
    if (message.includes('setTimeout(, 0)')) return '// Use queueMicrotask()'
    if (message.includes('console.log')) return '// Remove in production'
    return ''
  }

  private getPerformanceFix(message: string, code?: string): string {
    if (message.includes('for (let i = 0; i < array.length; i++)')) return 'for (let i = 0; i < array.length; i++)'
    if (message.includes('.forEach(function(')) return '.forEach(function('
    if (message.includes('new Array()')) return 'new Array()'
    if (message.includes('new Object()')) return 'new Object()'
    if (message.includes('.indexOf() !== -1')) return '.indexOf() !== -1'
    return ''
  }

  private getPerformanceReplacement(message: string, code?: string): string {
    if (message.includes('for (let i = 0; i < array.length; i++)')) return 'for (const item of array)'
    if (message.includes('.forEach(function(')) return '.forEach(('
    if (message.includes('new Array()')) return '[]'
    if (message.includes('new Object()')) return '{}'
    if (message.includes('.indexOf() !== -1')) return '.includes()'
    return ''
  }

  private getQualityFix(message: string, code?: string): string {
    if (message.includes('TODO:')) return 'TODO:'
    if (message.includes('FIXME:')) return 'FIXME:'
    if (message.includes('HACK:')) return 'HACK:'
    if (message.includes('var ')) return 'var '
    return ''
  }

  private getQualityReplacement(message: string, code?: string): string {
    if (message.includes('TODO:')) return '// TODO:'
    if (message.includes('FIXME:')) return '// FIXME:'
    if (message.includes('HACK:')) return '// HACK:'
    if (message.includes('var ')) return 'const '
    return ''
  }

  private getTypeScriptFix(message: string, code?: string): string {
    if (message.includes(': any')) return ': any'
    if (message.includes('function name() {')) return code || 'function name() {'
    if (message.includes('const x: string = "value"')) return 'const x: string = "value"'
    if (message.includes('interface Name {}')) return 'interface Name {}'
    return ''
  }

  private getTypeScriptReplacement(message: string, code?: string): string {
    if (message.includes(': any')) return ': unknown'
    if (message.includes('function name() {')) return code?.replace('function ', 'function ').replace(' {', ': string {') || 'function name(): string {'
    if (message.includes('const x: string = "value"')) return 'const x = "value"'
    if (message.includes('interface Name {}')) return 'type Name = Record<string, never>'
    return ''
  }

  private getESLintFix(message: string, code?: string): string {
    if (message.includes('Trailing spaces')) return ' '
    if (message.includes('Missing semicolon')) return ''
    return ''
  }

  private getESLintReplacement(message: string, code?: string): string {
    if (message.includes('Trailing spaces')) return ''
    if (message.includes('Missing semicolon')) return ';'
    return ''
  }
}