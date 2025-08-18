import { ESLint } from 'eslint'
import * as fs from 'fs'
import * as path from 'path'
import { 
  ESLintAnalysis, 
  ESLintResult, 
  ESLintMessage, 
  ESLintFix,
  ESLintValidationResult,
  CodeIssue,
  CodeFix
} from './types'

export class ESLintAnalyzer {
  private eslint: ESLint
  private configPath: string

  constructor(configPath?: string) {
    this.configPath = configPath || this.findESLintConfig()
    this.eslint = new ESLint({
      useEslintrc: true,
      configFile: this.configPath,
      fix: false,
      cache: true,
      cacheLocation: path.join(process.cwd(), '.eslintcache')
    })
  }

  async analyzeFile(filePath: string): Promise<ESLintAnalysis> {
    try {
      console.log(`🔍 Analyzing ${filePath} with ESLint...`)
      
      const results = await this.eslint.lintFiles([filePath])
      const result = results[0]
      
      if (!result) {
        throw new Error(`No ESLint results for ${filePath}`)
      }

      const analysis: ESLintAnalysis = {
        results: [result],
        errorCount: result.errorCount,
        warningCount: result.warningCount,
        fixableErrorCount: result.fixableErrorCount,
        fixableWarningCount: result.fixableWarningCount,
        usedDeprecatedRules: result.usedDeprecatedRules || []
      }

      console.log(`✅ ESLint analysis complete: ${result.errorCount} errors, ${result.warningCount} warnings`)
      return analysis

    } catch (error) {
      console.error(`❌ ESLint analysis failed for ${filePath}:`, error)
      throw error
    }
  }

  async generateFixes(analysis: ESLintAnalysis): Promise<CodeFix[]> {
    const fixes: CodeFix[] = []

    for (const result of analysis.results) {
      for (const message of result.messages) {
        if (message.fix) {
          const fix = await this.generateFixForMessage(message, result.filePath)
          if (fix) {
            fixes.push(fix)
          }
        }
      }
    }

    return fixes
  }

  private async generateFixForMessage(
    message: ESLintMessage, 
    filePath: string
  ): Promise<CodeFix | null> {
    if (!message.fix) return null

    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8')
      const fixedCode = this.applyESLintFix(sourceCode, message.fix)
      
      if (fixedCode === sourceCode) return null

      return {
        id: `eslint-${message.ruleId}-${message.line}-${message.column}`,
        filePath,
        lineNumber: message.line,
        issueType: 'eslint',
        severity: this.mapSeverity(message.severity),
        description: message.message,
        originalCode: sourceCode.substring(message.fix!.range[0], message.fix!.range[1]),
        fixedCode: fixedCode.substring(message.fix!.range[0], message.fix!.range[1]),
        confidence: 0.95,
        validationRules: [{
          type: 'eslint',
          condition: 'ESLint rule passes after fix',
          message: `Fix must resolve ESLint rule: ${message.ruleId}`
        }],
        dependencies: [],
        estimatedEffort: 'low',
        risk: 'low',
        tags: ['eslint', message.ruleId || 'unknown'],
        createdAt: new Date().toISOString(),
        eslintRule: message.ruleId || undefined
      }

    } catch (error) {
      console.error(`Failed to generate fix for ESLint message:`, error)
      return null
    }
  }

  private applyESLintFix(sourceCode: string, fix: ESLintFix): string {
    const before = sourceCode.substring(0, fix.range[0])
    const after = sourceCode.substring(fix.range[1])
    return before + fix.text + after
  }

  private mapSeverity(severity: number): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 0: return 'low'
      case 1: return 'medium'
      case 2: return 'high'
      default: return 'low'
    }
  }

  private findESLintConfig(): string {
    const possibleConfigs = [
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.yaml',
      '.eslintrc.yml',
      '.eslintrc.json',
      'eslint.config.js'
    ]

    let currentDir = process.cwd()
    while (currentDir !== path.dirname(currentDir)) {
      for (const config of possibleConfigs) {
        const configPath = path.join(currentDir, config)
        if (fs.existsSync(configPath)) {
          return configPath
        }
      }
      currentDir = path.dirname(currentDir)
    }

    return path.join(process.cwd(), '.eslintrc.json')
  }

  dispose(): void {
    try {
      const cachePath = path.join(process.cwd(), '.eslintcache')
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath)
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}