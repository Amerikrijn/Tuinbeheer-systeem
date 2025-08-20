import { ESLint } from 'eslint'
import { CodeIssue } from '../types'

export interface QualityCheck {
  name: string
  run(targetPath: string): Promise<CodeIssue[]>
}

async function runEslint(targetPath: string): Promise<CodeIssue[]> {
  const eslint = new ESLint({ fix: true })
  const results = await eslint.lintFiles([`${targetPath}/**/*.{js,ts,tsx}`])
  await ESLint.outputFixes(results)
  const issues: CodeIssue[] = []
  for (const result of results) {
    for (const message of result.messages) {
      issues.push({
        id: `${result.filePath}-${message.ruleId}-${message.line}-${message.column}`,
        type: message.severity === 2 ? 'error' : 'warning',
        severity: message.severity === 2 ? 'high' : 'medium',
        message: message.message,
        filePath: result.filePath,
        line: message.line,
        column: message.column,
        code: message.ruleId || '',
        category: 'eslint',
        fixable: Boolean(message.fix),
        confidence: 1,
        aiProvider: 'eslint',
        timestamp: new Date()
      })
    }
  }
  return issues
}

export class QualityCheckRunner {
  private checks: QualityCheck[] = []

  constructor(checkNames: string[] = []) {
    if (checkNames.includes('eslint')) {
      this.checks.push({ name: 'eslint', run: runEslint })
    }
  }

  async run(targetPath: string): Promise<CodeIssue[]> {
    let all: CodeIssue[] = []
    for (const check of this.checks) {
      try {
        const result = await check.run(targetPath)
        all = all.concat(result)
      } catch (err) {
        console.warn(`⚠️ Quality check ${check.name} failed: ${err}`)
      }
    }
    return all
  }
}
