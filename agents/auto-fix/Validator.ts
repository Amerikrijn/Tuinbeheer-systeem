import { CodeFix, ValidationRule } from './types'

export class Validator {
  private validationRules: ValidationRule[] = []

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules(): void {
    this.validationRules = [
      {
        name: 'syntax-check',
        description: 'Basic syntax validation',
        validate: (fix: CodeFix, originalCode: string) => {
          // Simple syntax check - ensure the fix doesn't break basic structure
          return fix.after.length > 0 && !fix.after.includes('undefined')
        },
        risk: 'low'
      },
      {
        name: 'length-check',
        description: 'Ensure fix doesn\'t create extremely long lines',
        validate: (fix: CodeFix, originalCode: string) => {
          // Check if the fix would create extremely long lines
          const maxLineLength = 120
          return fix.after.length <= maxLineLength
        },
        risk: 'low'
      },
      {
        name: 'security-check',
        description: 'Basic security validation',
        validate: (fix: CodeFix, originalCode: string) => {
          // Don't allow dangerous patterns in fixes
          const dangerousPatterns = ['eval(', 'innerHTML =', 'document.write']
          return !dangerousPatterns.some(pattern => fix.after.includes(pattern))
        },
        risk: 'high'
      },
      {
        name: 'confidence-check',
        description: 'Validate fix confidence level',
        validate: (fix: CodeFix, originalCode: string) => {
          // Only apply fixes with high confidence
          return fix.confidence >= 80
        },
        risk: 'medium'
      }
    ]
  }

  async validateFixes(fixes: CodeFix[], originalCode: string): Promise<any[]> {
    const results = []

    for (const fix of fixes) {
      const validationResult = await this.validateSingleFix(fix, originalCode)
      results.push(validationResult)
    }

    return results
  }

  private async validateSingleFix(fix: CodeFix, originalCode: string): Promise<any> {
    const results = []

    for (const rule of this.validationRules) {
      try {
        const passed = rule.validate(fix, originalCode)
        results.push({
          ruleId: rule.name,
          passed,
          message: passed ? 'Validation passed' : 'Validation failed',
          details: {
            rule: rule.description,
            risk: rule.risk
          }
        })
              } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.push({
            ruleId: rule.name,
            passed: false,
            message: `Validation error: ${errorMessage}`,
            details: {
              rule: rule.description,
              risk: rule.risk,
              error: errorMessage
            }
          })
        }
    }

    const allPassed = results.every(r => r.passed)
    const highRiskFailures = results.filter(r => !r.passed && r.details.risk === 'high')

    return {
      fixId: fix.id,
      passed: allPassed,
      results,
      highRiskFailures: highRiskFailures.length > 0,
      message: allPassed ? 'All validations passed' : `${results.filter(r => !r.passed).length} validations failed`
    }
  }

  addCustomRule(rule: ValidationRule): void {
    this.validationRules.push(rule)
  }

  getValidationSummary(validationResults: any[]): any {
    const total = validationResults.length
    const passed = validationResults.filter(r => r.passed).length
    const failed = total - passed
    const highRiskFailures = validationResults.filter(r => r.highRiskFailures).length

    return {
      total,
      passed,
      failed,
      highRiskFailures,
      successRate: total > 0 ? (passed / total) * 100 : 0,
      riskLevel: highRiskFailures > 0 ? 'high' : failed > 0 ? 'medium' : 'low'
    }
  }
}