export interface CodeFix {
  id: string
  filePath: string
  lineNumber: number
  issueType: 'bug' | 'security' | 'performance' | 'quality' | 'style'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  originalCode: string
  fixedCode: string
  confidence: number
  validationRules: ValidationRule[]
  dependencies: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  risk: 'low' | 'medium' | 'high'
  tags: string[]
  createdAt: string
}

export interface ValidationRule {
  type: 'syntax' | 'semantic' | 'test' | 'custom'
  condition: string
  message: string
}

export interface FixResult {
  fixId: string
  status: 'applied' | 'failed' | 'skipped' | 'requires-review'
  executionTime: number
  output: any
  error?: string
  timestamp: string
  metadata: Record<string, any>
  validationResults: ValidationResult[]
}

export interface ValidationResult {
  ruleId: string
  passed: boolean
  message: string
  details?: any
}

export interface CodeAnalysis {
  filePath: string
  issues: CodeIssue[]
  suggestions: CodeSuggestion[]
  complexity: number
  maintainability: number
  securityScore: number
  performanceScore: number
}

export interface CodeIssue {
  id: string
  type: 'bug' | 'security' | 'performance' | 'quality' | 'style'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  lineNumber: number
  code: string
  impact: string
  recommendation: string
  autoFixable: boolean
}

export interface CodeSuggestion {
  id: string
  type: 'refactor' | 'optimize' | 'document' | 'test'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  currentState: string
  targetState: string
  actionItems: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high' | 'critical'
}

export interface AutoFixOptions {
  filePath: string
  qualityReport?: string
  testResults?: string
  maxFixes: number
  outputPath: string
  includeSecurityFixes?: boolean
  includePerformanceFixes?: boolean
  includeQualityFixes?: boolean
  autoApply?: boolean
  requireValidation?: boolean
}

export interface FixReport {
  id: string
  timestamp: string
  summary: FixSummary
  appliedFixes: CodeFix[]
  failedFixes: CodeFix[]
  skippedFixes: CodeFix[]
  validationResults: ValidationResult[]
  recommendations: string[]
  metadata: FixMetadata
}

export interface FixSummary {
  totalIssues: number
  autoFixed: number
  failedFixes: number
  skippedFixes: number
  successRate: number
  improvementScore: number
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface FixMetadata {
  generatedAt: string
  fixerVersion: string
  totalFixTime: number
  confidence: number
  dataSources: string[]
  appliedStrategies: string[]
}