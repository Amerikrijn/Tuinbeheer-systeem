export interface TestScenario {
  id: string
  name: string
  description: string
  category: 'functional' | 'security' | 'ui' | 'edge-case' | 'performance'
  priority: 'critical' | 'high' | 'medium' | 'low'
  input: Record<string, any>
  expectedOutput: any
  validationRules: ValidationRule[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  createdAt: string
}

export interface ValidationRule {
  type: 'assertion' | 'regex' | 'custom'
  condition: string
  message: string
}

export interface TestResult {
  scenarioId: string
  status: 'passed' | 'failed' | 'error' | 'skipped'
  executionTime: number
  output: any
  error?: string
  timestamp: string
  metadata: Record<string, any>
}

export interface CodeAnalysis {
  filePath: string
  complexity: number
  dependencies: string[]
  riskFactors: string[]
  testCoverage: number
  securityIssues: SecurityIssue[]
  suggestions: string[]
}

export interface SecurityIssue {
  type: 'sql-injection' | 'xss' | 'csrf' | 'authentication' | 'authorization'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  lineNumber?: number
  code?: string
  recommendation: string
}

export interface TestGenerationOptions {
  featurePath: string
  strategy: 'full-path-coverage' | 'risk-based' | 'change-focused'
  maxInteractions: number
  outputPath: string
  includeSecurityTests?: boolean
  includePerformanceTests?: boolean
  includeEdgeCases?: boolean
}

export interface TestCoverageReport {
  totalScenarios: number
  executedScenarios: number
  passedScenarios: number
  failedScenarios: number
  coverageByCategory: Record<string, number>
  riskCoverage: Record<string, number>
  executionTime: number
  recommendations: string[]
}