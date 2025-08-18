import * as fs from 'fs'
import * as path from 'path'
import { CodeAnalysis, SecurityIssue, TestScenario } from './types'

export class CodeAnalyzer {
  private featurePath: string
  private analysisCache: Map<string, CodeAnalysis> = new Map()

  constructor(featurePath: string) {
    this.featurePath = featurePath
  }

  async analyzeCodebase(): Promise<CodeAnalysis[]> {
    const analyses: CodeAnalysis[] = []
    
    try {
      const files = await this.discoverFiles(this.featurePath)
      
      for (const file of files) {
        if (this.shouldAnalyzeFile(file)) {
          const analysis = await this.analyzeFile(file)
          analyses.push(analysis)
          this.analysisCache.set(file, analysis)
        }
      }
    } catch (error) {
      console.error('Error analyzing codebase:', error)
    }

    return analyses
  }

  private async discoverFiles(dirPath: string): Promise<string[]> {
    const files: string[] = []
    
    try {
      const items = await fs.promises.readdir(dirPath, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name)
        
        if (item.isDirectory()) {
          if (!item.name.startsWith('.') && item.name !== 'node_modules') {
            files.push(...await this.discoverFiles(fullPath))
          }
        } else if (this.isCodeFile(item.name)) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error)
    }

    return files
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.java', '.cs']
    return codeExtensions.some(ext => filename.endsWith(ext))
  }

  private shouldAnalyzeFile(filePath: string): boolean {
    const excludePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'coverage',
      '.next'
    ]
    
    return !excludePatterns.some(pattern => filePath.includes(pattern))
  }

  private async analyzeFile(filePath: string): Promise<CodeAnalysis> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8')
      const lines = content.split('\n')
      
      const analysis: CodeAnalysis = {
        filePath,
        complexity: this.calculateComplexity(content),
        dependencies: this.extractDependencies(content),
        riskFactors: this.identifyRiskFactors(content, lines),
        testCoverage: this.estimateTestCoverage(filePath),
        securityIssues: this.detectSecurityIssues(content, lines),
        suggestions: this.generateSuggestions(content, filePath)
      }

      return analysis
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error)
      return this.createDefaultAnalysis(filePath)
    }
  }

  private calculateComplexity(content: string): number {
    // Simple cyclomatic complexity calculation
    const complexityIndicators = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\|\|/g,
      /&&/g
    ]
    
    let complexity = 1 // Base complexity
    
    complexityIndicators.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    })
    
    return complexity
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = []
    
    // Extract import statements
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g
    let match
    
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }
    
    // Extract require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }
    
    return [...new Set(dependencies)]
  }

  private identifyRiskFactors(content: string, lines: string[]): string[] {
    const riskFactors: string[] = []
    
    // Check for high-risk patterns
    const riskPatterns = [
      { pattern: /eval\s*\(/, risk: 'Code execution vulnerability' },
      { pattern: /innerHTML\s*=/, risk: 'XSS vulnerability' },
      { pattern: /localStorage\s*\.\s*setItem/, risk: 'Sensitive data storage' },
      { pattern: /fetch\s*\(/, risk: 'External API calls' },
      { pattern: /document\.cookie/, risk: 'Cookie manipulation' },
      { pattern: /window\.open/, risk: 'Popup security risk' },
      { pattern: /setTimeout\s*\(/, risk: 'Timing-based vulnerabilities' }
    ]
    
    riskPatterns.forEach(({ pattern, risk }) => {
      if (pattern.test(content)) {
        riskFactors.push(risk)
      }
    })
    
    // Check for authentication patterns
    if (content.includes('password') || content.includes('auth') || content.includes('login')) {
      riskFactors.push('Authentication logic')
    }
    
    return [...new Set(riskFactors)]
  }

  private estimateTestCoverage(filePath: string): number {
    // This is a placeholder - in a real implementation, you'd parse test files
    // and calculate actual coverage metrics
    return Math.random() * 100
  }

  private detectSecurityIssues(content: string, lines: string[]): SecurityIssue[] {
    const issues: SecurityIssue[] = []
    
    // SQL Injection detection
    const sqlPatterns = [
      /SELECT.*WHERE.*\$\{/g,
      /INSERT.*VALUES.*\$\{/g,
      /UPDATE.*SET.*\$\{/g,
      /DELETE.*WHERE.*\$\{/g
    ]
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push({
          type: 'sql-injection',
          severity: 'critical',
          description: 'Potential SQL injection vulnerability detected',
          recommendation: 'Use parameterized queries or ORM methods'
        })
      }
    })
    
    // XSS detection
    if (/dangerouslySetInnerHTML|innerHTML\s*=/.test(content)) {
      issues.push({
        type: 'xss',
        severity: 'high',
        description: 'Potential XSS vulnerability through innerHTML',
        recommendation: 'Use React\'s built-in XSS protection or sanitize input'
      })
    }
    
    // Authentication bypass detection
    if (/bypass.*auth|skip.*login|admin.*true/.test(content)) {
      issues.push({
        type: 'authentication',
        severity: 'critical',
        description: 'Potential authentication bypass detected',
        recommendation: 'Review authentication logic and remove debug code'
      })
    }
    
    return issues
  }

  private generateSuggestions(content: string, filePath: string): string[] {
    const suggestions: string[] = []
    
    // Suggest tests based on content analysis
    if (content.includes('useState') || content.includes('useEffect')) {
      suggestions.push('Add React hook testing with @testing-library/react-hooks')
    }
    
    if (content.includes('async') || content.includes('await')) {
      suggestions.push('Add async function testing with proper error handling')
    }
    
    if (content.includes('form') || content.includes('input')) {
      suggestions.push('Add form validation and submission testing')
    }
    
    if (content.includes('router') || content.includes('navigation')) {
      suggestions.push('Add navigation and routing testing')
    }
    
    return suggestions
  }

  private createDefaultAnalysis(filePath: string): CodeAnalysis {
    return {
      filePath,
      complexity: 1,
      dependencies: [],
      riskFactors: ['Unable to analyze'],
      testCoverage: 0,
      securityIssues: [],
      suggestions: ['Review file manually']
    }
  }

  async generateTestScenarios(): Promise<TestScenario[]> {
    const analyses = await this.analyzeCodebase()
    const scenarios: TestScenario[] = []
    
    for (const analysis of analyses) {
      scenarios.push(...this.createScenariosFromAnalysis(analysis))
    }
    
    return scenarios
  }

  private createScenariosFromAnalysis(analysis: CodeAnalysis): TestScenario[] {
    const scenarios: TestScenario[] = []
    const timestamp = new Date().toISOString()
    
    // Generate functional test scenarios
    if (analysis.filePath.includes('login') || analysis.filePath.includes('auth')) {
      scenarios.push(
        this.createLoginTestScenario('valid-credentials', 'low', timestamp),
        this.createLoginTestScenario('invalid-credentials', 'medium', timestamp),
        this.createLoginTestScenario('empty-credentials', 'low', timestamp),
        this.createLoginTestScenario('sql-injection-attempt', 'high', timestamp),
        this.createLoginTestScenario('xss-attempt', 'high', timestamp)
      )
    }
    
    // Generate UI test scenarios
    if (analysis.filePath.includes('.tsx') || analysis.filePath.includes('.jsx')) {
      scenarios.push(
        this.createUITestScenario('button-clicks', 'low', timestamp),
        this.createUITestScenario('form-validation', 'medium', timestamp),
        this.createUITestScenario('responsive-design', 'low', timestamp)
      )
    }
    
    // Generate security test scenarios
    if (analysis.securityIssues.length > 0) {
      scenarios.push(
        this.createSecurityTestScenario('vulnerability-scan', 'critical', timestamp)
      )
    }
    
    return scenarios
  }

  private createLoginTestScenario(type: string, riskLevel: 'low' | 'medium' | 'high' | 'critical', timestamp: string): TestScenario {
    const scenarios = {
      'valid-credentials': {
        name: 'Valid Login Credentials',
        description: 'Test login with valid email and password',
        input: { email: 'test@example.com', password: 'validPassword123' },
        expectedOutput: { success: true, redirect: '/' }
      },
      'invalid-credentials': {
        name: 'Invalid Login Credentials',
        description: 'Test login with invalid email or password',
        input: { email: 'invalid@example.com', password: 'wrongPassword' },
        expectedOutput: { success: false, error: 'Invalid credentials' }
      },
      'empty-credentials': {
        name: 'Empty Login Credentials',
        description: 'Test login with empty email or password fields',
        input: { email: '', password: '' },
        expectedOutput: { success: false, error: 'Fields are required' }
      },
      'sql-injection-attempt': {
        name: 'SQL Injection Prevention',
        description: 'Test login with SQL injection attempt',
        input: { email: "'; DROP TABLE users; --", password: 'password' },
        expectedOutput: { success: false, error: 'Invalid input' }
      },
      'xss-attempt': {
        name: 'XSS Prevention',
        description: 'Test login with XSS attempt',
        input: { email: '<script>alert("xss")</script>', password: 'password' },
        expectedOutput: { success: false, error: 'Invalid input' }
      }
    }
    
    const scenario = scenarios[type as keyof typeof scenarios]
    
    return {
      id: `login-${type}-${Date.now()}`,
      name: scenario.name,
      description: scenario.description,
      category: 'functional',
      priority: riskLevel === 'critical' ? 'high' : 'medium',
      input: scenario.input,
      expectedOutput: scenario.expectedOutput,
      validationRules: [
        {
          type: 'assertion',
          condition: 'response.status === expectedOutput.success',
          message: 'Login response should match expected output'
        }
      ],
      riskLevel: riskLevel as 'low' | 'medium' | 'high' | 'critical',
      tags: ['login', 'authentication', type],
      createdAt: timestamp
    }
  }

  private createUITestScenario(type: string, riskLevel: 'low' | 'medium' | 'high' | 'critical', timestamp: string): TestScenario {
    const scenarios = {
      'button-clicks': {
        name: 'Button Click Interactions',
        description: 'Test all button click interactions in the UI',
        input: { action: 'click', element: 'button' },
        expectedOutput: { success: true, action: 'executed' }
      },
      'form-validation': {
        name: 'Form Validation',
        description: 'Test form validation and error handling',
        input: { action: 'validate', form: 'login' },
        expectedOutput: { success: true, validation: 'passed' }
      },
      'responsive-design': {
        name: 'Responsive Design',
        description: 'Test UI responsiveness across different screen sizes',
        input: { action: 'resize', dimensions: ['mobile', 'tablet', 'desktop'] },
        expectedOutput: { success: true, responsive: true }
      }
    }
    
    const scenario = scenarios[type as keyof typeof scenarios]
    
    return {
      id: `ui-${type}-${Date.now()}`,
      name: scenario.name,
      description: scenario.description,
      category: 'ui',
      priority: 'medium',
      input: scenario.input,
      expectedOutput: scenario.expectedOutput,
      validationRules: [
        {
          type: 'assertion',
          condition: 'ui.element.visible === true',
          message: 'UI element should be visible and interactive'
        }
      ],
      riskLevel: riskLevel as 'low' | 'medium' | 'high' | 'critical',
      tags: ['ui', 'interaction', type],
      createdAt: timestamp
    }
  }

  private createSecurityTestScenario(type: string, riskLevel: 'low' | 'medium' | 'high' | 'critical', timestamp: string): TestScenario {
    return {
      id: `security-${type}-${Date.now()}`,
      name: 'Security Vulnerability Scan',
      description: 'Comprehensive security testing for identified vulnerabilities',
      category: 'security',
      priority: 'critical',
      input: { action: 'security-scan', scope: 'full' },
      expectedOutput: { success: true, vulnerabilities: 0 },
      validationRules: [
        {
          type: 'assertion',
          condition: 'security.issues.length === 0',
          message: 'No security vulnerabilities should be detected'
        }
      ],
      riskLevel: riskLevel as 'low' | 'medium' | 'high' | 'critical',
      tags: ['security', 'vulnerability', 'scan'],
      createdAt: timestamp
    }
  }
}