export interface TestScenario {
  id: string
  name: string
  description: string
  category: 'functional' | 'security' | 'performance' | 'edge-case' | 'ui' | 'integration'
  priority: 'low' | 'medium' | 'high' | 'critical'
  input: any
  expectedOutput: any
  validationRules: ValidationRule[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  createdAt: string
}

export interface TestResult {
  id: string
  scenarioId: string
  status: 'passed' | 'failed' | 'error' | 'skipped'
  executionTime: number
  output?: any
  error?: string
  timestamp: string
  details: {
    scenario: string
    category: string
    priority: string
    riskLevel?: string
    tags?: string[]
  }
}

export interface CodeAnalysis {
  filePath: string
  complexity: number
  dependencies: string[]
  riskFactors: string[]
  testCoverage: number
  securityIssues: SecurityIssue[]
  suggestions: string[]
  hasInputValidation?: boolean
  hasErrorHandling?: boolean
  hasSecurityMeasures?: boolean
}

export interface SecurityIssue {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  lineNumber?: number
  code?: string
  recommendation: string
}

export interface ValidationRule {
  type: 'assertion' | 'regex' | 'custom'
  condition: string
  message: string
}

export interface TestGenerationOptions {
  featurePath: string
  strategy: 'risk-based' | 'coverage-based' | 'random'
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