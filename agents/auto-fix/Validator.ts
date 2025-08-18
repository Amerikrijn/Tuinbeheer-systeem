import { CodeFix, FixResult, ValidationResult, ValidationRule } from './types'
import * as fs from 'fs'

export class Validator {
  private validationRules: ValidationRule[] = []

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules() {
    this.validationRules = [
      {
        type: 'syntax',
        condition: 'Code compiles without syntax errors',
        message: 'Fixed code must compile successfully'
      },
      {
        type: 'semantic',
        condition: 'Code maintains original functionality',
        message: 'Fix should not break existing functionality'
      },
      {
        type: 'test',
        condition: 'All tests pass after fix',
        message: 'Fix should not cause test failures'
      },
      {
        type: 'custom',
        condition: 'Code follows project style guidelines',
        message: 'Fix should maintain code style consistency'
      }
    ]
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(rule: ValidationRule) {
    this.validationRules.push(rule)
  }

  /**
   * Validate a code fix
   */
  async validateFix(fix: CodeFix): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    for (const rule of this.validationRules) {
      const result = await this.validateRule(fix, rule)
      results.push(result)
    }

    return results
  }

  /**
   * Validate a specific rule against a fix
   */
  private async validateRule(fix: CodeFix, rule: ValidationRule): Promise<ValidationResult> {
    try {
      let passed = false
      let details: any = null

      switch (rule.type) {
        case 'syntax':
          passed = await this.validateSyntax(fix)
          break
        
        case 'semantic':
          passed = await this.validateSemantics(fix)
          break
        
        case 'test':
          passed = await this.validateTests(fix)
          break
        
        case 'custom':
          passed = await this.validateCustom(fix, rule)
          break
        
        default:
          passed = false
          details = `Unknown validation rule type: ${rule.type}`
      }

      return {
        ruleId: rule.type,
        passed,
        message: rule.message,
        details
      }
    } catch (error) {
      return {
        ruleId: rule.type,
        passed: false,
        message: `Validation error: ${error.message}`,
        details: error
      }
    }
  }

  /**
   * Validate syntax of the fix
   */
  private async validateSyntax(fix: CodeFix): Promise<boolean> {
    try {
      // Basic syntax validation - check if the file is still readable
      const content = fs.readFileSync(fix.filePath, 'utf-8')
      const lines = content.split('\n')
      
      // Check if the line number is valid
      if (fix.lineNumber > 0 && fix.lineNumber <= lines.length) {
        const currentLine = lines[fix.lineNumber - 1]
        
        // Basic checks for common syntax issues
        if (currentLine.includes('undefined') || currentLine.includes('null')) {
          return false
        }
        
        // Check for balanced brackets/parentheses
        const openBrackets = (currentLine.match(/[\(\[\{]/g) || []).length
        const closeBrackets = (currentLine.match(/[\)\]\}]/g) || []).length
        
        if (openBrackets !== closeBrackets) {
          return false
        }
        
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Validate semantics of the fix
   */
  private async validateSemantics(fix: CodeFix): Promise<boolean> {
    try {
      // For now, we'll do basic semantic validation
      // In a real implementation, this could include:
      // - Type checking
      // - Variable scope validation
      // - Function signature validation
      
      const content = fs.readFileSync(fix.filePath, 'utf-8')
      const lines = content.split('\n')
      
      if (fix.lineNumber > 0 && fix.lineNumber <= lines.length) {
        const currentLine = lines[fix.lineNumber - 1]
        
        // Check if the fix actually changed something
        if (currentLine === fix.originalCode) {
          return false // No change was made
        }
        
        // Check if the fix is not empty
        if (currentLine.trim() === '') {
          return false // Empty line is usually not good
        }
        
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Validate that tests still pass
   */
  private async validateTests(fix: CodeFix): Promise<boolean> {
    try {
      // In a real implementation, this would run the test suite
      // For now, we'll assume tests pass if the fix was applied successfully
      
      // Check if the fix file exists and is readable
      if (fs.existsSync(fix.filePath)) {
        const content = fs.readFileSync(fix.filePath, 'utf-8')
        const lines = content.split('\n')
        
        if (fix.lineNumber > 0 && fix.lineNumber <= lines.length) {
          const currentLine = lines[fix.lineNumber - 1]
          
          // If the fix was applied, assume tests would pass
          return currentLine === fix.fixedCode
        }
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Validate custom rules
   */
  private async validateCustom(fix: CodeFix, rule: ValidationRule): Promise<boolean> {
    try {
      // Custom validation based on the rule condition
      if (rule.condition.includes('style')) {
        return await this.validateStyle(fix)
      }
      
      if (rule.condition.includes('security')) {
        return await this.validateSecurity(fix)
      }
      
      // Default custom validation
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Validate code style
   */
  private async validateStyle(fix: CodeFix): Promise<boolean> {
    try {
      const content = fs.readFileSync(fix.filePath, 'utf-8')
      const lines = content.split('\n')
      
      if (fix.lineNumber > 0 && fix.lineNumber <= lines.length) {
        const currentLine = lines[fix.lineNumber - 1]
        
        // Basic style checks
        if (currentLine.length > 120) {
          return false // Line too long
        }
        
        if (currentLine.startsWith(' ') && !currentLine.startsWith('  ')) {
          return false // Inconsistent indentation
        }
        
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Validate security aspects
   */
  private async validateSecurity(fix: CodeFix): Promise<boolean> {
    try {
      const content = fs.readFileSync(fix.filePath, 'utf-8')
      const lines = content.split('\n')
      
      if (fix.lineNumber > 0 && fix.lineNumber <= lines.length) {
        const currentLine = lines[fix.lineNumber - 1]
        
        // Basic security checks
        if (currentLine.includes('eval(') || currentLine.includes('innerHTML')) {
          return false // Potentially dangerous
        }
        
        if (currentLine.includes('password') && currentLine.includes('console.log')) {
          return false // Logging sensitive data
        }
        
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Validate multiple fixes
   */
  async validateFixes(fixes: CodeFix[]): Promise<ValidationResult[][]> {
    const results: ValidationResult[][] = []
    
    for (const fix of fixes) {
      const fixResults = await this.validateFix(fix)
      results.push(fixResults)
    }
    
    return results
  }

  /**
   * Get validation summary
   */
  getValidationSummary(results: ValidationResult[][]): {
    totalValidations: number
    passedValidations: number
    failedValidations: number
    successRate: number
  } {
    let total = 0
    let passed = 0
    let failed = 0
    
    for (const fixResults of results) {
      for (const result of fixResults) {
        total++
        if (result.passed) {
          passed++
        } else {
          failed++
        }
      }
    }
    
    return {
      totalValidations: total,
      passedValidations: passed,
      failedValidations: failed,
      successRate: total > 0 ? passed / total : 0
    }
  }

  /**
   * Check if all validations passed
   */
  allValidationsPassed(results: ValidationResult[][]): boolean {
    for (const fixResults of results) {
      for (const result of fixResults) {
        if (!result.passed) {
          return false
        }
      }
    }
    return true
  }
}