import { TestScenario, CodeAnalysis, SecurityIssue } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class CodeAnalyzer {
  constructor() {}

  /**
   * Analyze code for a specific feature path
   */
  async analyzeCode(featurePath: string): Promise<CodeAnalysis> {
    try {
      const filePath = path.resolve(featurePath)
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Feature path not found: ${featurePath}`)
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      
      const analysis: CodeAnalysis = {
        filePath,
        complexity: this.calculateComplexity(content),
        dependencies: this.extractDependencies(content),
        riskFactors: this.identifyRiskFactors(content),
        testCoverage: this.estimateTestCoverage(content),
        securityIssues: this.identifySecurityIssues(content, lines),
        suggestions: this.generateSuggestions(content)
      }

      // Add iteration-specific analysis
      analysis.hasInputValidation = this.hasInputValidation(content)
      analysis.hasErrorHandling = this.hasErrorHandling(content)
      analysis.hasSecurityMeasures = this.hasSecurityMeasures(content)

      return analysis
    } catch (error) {
      console.error(`Error analyzing code in ${featurePath}:`, error)
      throw error
    }
  }

  /**
   * Generate test scenarios based on code analysis
   */
  async generateTestScenarios(codeAnalysis: CodeAnalysis, options: any): Promise<TestScenario[]> {
    const scenarios: TestScenario[] = []
    const timestamp = new Date().toISOString()

    // Generate basic functional scenarios
    const functionalScenarios = this.generateFunctionalScenarios(codeAnalysis, timestamp)
    scenarios.push(...functionalScenarios)

    // Generate security scenarios if enabled
    if (options.includeSecurityTests) {
      const securityScenarios = this.generateSecurityScenarios(codeAnalysis, timestamp)
      scenarios.push(...securityScenarios)
    }

    // Generate performance scenarios if enabled
    if (options.includePerformanceTests) {
      const performanceScenarios = this.generatePerformanceScenarios(codeAnalysis, timestamp)
      scenarios.push(...performanceScenarios)
    }

    // Generate edge case scenarios if enabled
    if (options.includeEdgeCases) {
      const edgeCaseScenarios = this.generateEdgeCaseScenarios(codeAnalysis, timestamp)
      scenarios.push(...edgeCaseScenarios)
    }

    return scenarios
  }

  /**
   * Generate basic functional test scenarios
   */
  private generateFunctionalScenarios(codeAnalysis: CodeAnalysis, timestamp: string): TestScenario[] {
    const scenarios: TestScenario[] = []

    // Basic login test
    scenarios.push({
      id: `functional-login-${Date.now()}`,
      name: 'Valid Login Test',
      description: 'Test successful login with valid credentials',
      category: 'functional',
      priority: 'high',
      input: { email: 'test@example.com', password: 'validpassword123' },
      expectedOutput: { success: true, token: 'valid_token' },
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.success === true',
          message: 'Login should succeed with valid credentials'
        }
      ],
      riskLevel: 'low',
      tags: ['functional', 'login', 'iteration-1'],
      createdAt: timestamp
    })

    // Invalid login test
    scenarios.push({
      id: `functional-invalid-login-${Date.now()}`,
      name: 'Invalid Login Test',
      description: 'Test login failure with invalid credentials',
      category: 'functional',
      priority: 'high',
      input: { email: 'test@example.com', password: 'wrongpassword' },
      expectedOutput: { success: false, error: 'Invalid credentials' },
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.success === false',
          message: 'Login should fail with invalid credentials'
        }
      ],
      riskLevel: 'low',
      tags: ['functional', 'login', 'iteration-1'],
      createdAt: timestamp
    })

    return scenarios
  }

  /**
   * Generate security test scenarios
   */
  private generateSecurityScenarios(codeAnalysis: CodeAnalysis, timestamp: string): TestScenario[] {
    const scenarios: TestScenario[] = []

    // SQL Injection test
    scenarios.push({
      id: `security-sql-injection-${Date.now()}`,
      name: 'SQL Injection Prevention',
      description: 'Test SQL injection prevention',
      category: 'security',
      priority: 'critical',
      input: { email: "'; DROP TABLE users; --", password: 'password' },
      expectedOutput: { success: false, error: 'Invalid input' },
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.success === false',
          message: 'SQL injection attempts should be blocked'
        }
      ],
      riskLevel: 'critical',
      tags: ['security', 'sql-injection', 'iteration-1'],
      createdAt: timestamp
    })

    // XSS test
    scenarios.push({
      id: `security-xss-${Date.now()}`,
      name: 'XSS Prevention',
      description: 'Test XSS prevention',
      category: 'security',
      priority: 'critical',
      input: { email: '<script>alert("xss")</script>@test.com', password: 'password' },
      expectedOutput: { success: false, error: 'Invalid input' },
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.success === false',
          message: 'XSS attempts should be blocked'
        }
      ],
      riskLevel: 'critical',
      tags: ['security', 'xss', 'iteration-1'],
      createdAt: timestamp
    })

    return scenarios
  }

  /**
   * Generate performance test scenarios
   */
  private generatePerformanceScenarios(codeAnalysis: CodeAnalysis, timestamp: string): TestScenario[] {
    const scenarios: TestScenario[] = []

    // Response time test
    scenarios.push({
      id: `performance-response-time-${Date.now()}`,
      name: 'Response Time Test',
      description: 'Test login response time',
      category: 'performance',
      priority: 'medium',
      input: { email: 'test@example.com', password: 'password', measureTime: true },
      expectedOutput: { success: true, responseTime: '< 500ms' },
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.responseTime < 500',
          message: 'Response time should be under 500ms'
        }
      ],
      riskLevel: 'medium',
      tags: ['performance', 'response-time', 'iteration-1'],
      createdAt: timestamp
    })

    return scenarios
  }

  /**
   * Generate edge case test scenarios
   */
  private generateEdgeCaseScenarios(codeAnalysis: CodeAnalysis, timestamp: string): TestScenario[] {
    const scenarios: TestScenario[] = []

    // Empty input test
    scenarios.push({
      id: `edge-case-empty-input-${Date.now()}`,
      name: 'Empty Input Test',
      description: 'Test with empty email and password',
      category: 'edge-case',
      priority: 'medium',
      input: { email: '', password: '' },
      expectedOutput: { success: false, error: 'Email and password required' },
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.success === false',
          message: 'Empty inputs should be rejected'
        }
      ],
      riskLevel: 'low',
      tags: ['edge-case', 'validation', 'iteration-1'],
      createdAt: timestamp
    })

    // Very long input test
    scenarios.push({
      id: `edge-case-long-input-${Date.now()}`,
      name: 'Long Input Test',
      description: 'Test with very long email and password',
      category: 'edge-case',
      priority: 'medium',
      input: { email: 'a'.repeat(1000) + '@test.com', password: 'b'.repeat(1000) },
      expectedOutput: { success: false, error: 'Input too long' },
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.success === false',
          message: 'Very long inputs should be rejected'
        }
      ],
      riskLevel: 'low',
      tags: ['edge-case', 'validation', 'iteration-1'],
      createdAt: timestamp
    })

    return scenarios
  }

  /**
   * Calculate code complexity
   */
  private calculateComplexity(content: string): number {
    const lines = content.split('\n')
    let complexity = 0

    // Count control structures
    const controlStructures = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'finally']
    controlStructures.forEach(structure => {
      const regex = new RegExp(`\\b${structure}\\b`, 'g')
      const matches = content.match(regex)
      if (matches) {
        complexity += matches.length
      }
    })

    // Normalize complexity score (0-100)
    return Math.min(complexity * 2, 100)
  }

  /**
   * Extract dependencies from code
   */
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = []
    
    // Look for import statements
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g
    let match
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    // Look for require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    return [...new Set(dependencies)] // Remove duplicates
  }

  /**
   * Identify risk factors in code
   */
  private identifyRiskFactors(content: string): string[] {
    const riskFactors: string[] = []

    // Check for hardcoded credentials
    if (content.includes('password') && content.includes('admin')) {
      riskFactors.push('hardcoded-credentials')
    }

    // Check for console.log statements
    if (content.includes('console.log')) {
      riskFactors.push('debug-code-in-production')
    }

    // Check for eval usage
    if (content.includes('eval(')) {
      riskFactors.push('eval-usage')
    }

    // Check for innerHTML usage
    if (content.includes('innerHTML')) {
      riskFactors.push('potential-xss')
    }

    return riskFactors
  }

  /**
   * Estimate test coverage
   */
  private estimateTestCoverage(content: string): number {
    // Simple heuristic: count test-related keywords
    const testKeywords = ['test', 'spec', 'describe', 'it', 'expect', 'assert']
    let testCount = 0

    testKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = content.match(regex)
      if (matches) {
        testCount += matches.length
      }
    })

    // Estimate coverage based on test density
    const lines = content.split('\n').length
    const coverage = Math.min((testCount / lines) * 100, 100)
    
    return Math.round(coverage)
  }

  /**
   * Identify security issues
   */
  private identifySecurityIssues(content: string, lines: string[]): SecurityIssue[] {
    const issues: SecurityIssue[] = []

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for SQL injection vulnerabilities
      if (line.includes('SELECT') && line.includes('${') && !line.includes('prepared')) {
        issues.push({
          type: 'sql-injection',
          severity: 'critical',
          description: 'Potential SQL injection vulnerability',
          lineNumber,
          code: line.trim(),
          recommendation: 'Use prepared statements or parameterized queries'
        })
      }

      // Check for XSS vulnerabilities
      if (line.includes('innerHTML') && line.includes('${')) {
        issues.push({
          type: 'xss',
          severity: 'critical',
          description: 'Potential XSS vulnerability',
          lineNumber,
          code: line.trim(),
          recommendation: 'Use textContent or proper sanitization'
        })
      }

      // Check for hardcoded secrets
      if (line.includes('password') && line.includes('=') && line.includes('"')) {
        issues.push({
          type: 'authentication',
          severity: 'high',
          description: 'Hardcoded password found',
          lineNumber,
          code: line.trim(),
          recommendation: 'Use environment variables for secrets'
        })
      }
    })

    return issues
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(content: string): string[] {
    const suggestions: string[] = []

    if (content.includes('console.log')) {
      suggestions.push('Remove console.log statements for production')
    }

    if (content.includes('==') && !content.includes('===')) {
      suggestions.push('Use strict equality (===) instead of loose equality (==)')
    }

    if (content.includes('var ')) {
      suggestions.push('Use const or let instead of var')
    }

    if (content.includes('function(') && !content.includes('function (')) {
      suggestions.push('Add space after function keyword')
    }

    return suggestions
  }

  /**
   * Check if code has input validation
   */
  private hasInputValidation(content: string): boolean {
    const validationKeywords = ['validate', 'validation', 'check', 'verify', 'sanitize']
    return validationKeywords.some(keyword => content.includes(keyword))
  }

  /**
   * Check if code has error handling
   */
  private hasErrorHandling(content: string): boolean {
    const errorKeywords = ['try', 'catch', 'error', 'exception', 'throw']
    return errorKeywords.some(keyword => content.includes(keyword))
  }

  /**
   * Check if code has security measures
   */
  private hasSecurityMeasures(content: string): boolean {
    const securityKeywords = ['encrypt', 'hash', 'salt', 'token', 'jwt', 'bcrypt']
    return securityKeywords.some(keyword => content.includes(keyword))
  }
}