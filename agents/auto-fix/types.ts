export interface AutoFixOptions {
  filePath: string
  maxFixes: number
  autoApply: boolean
  requireValidation: boolean
  includeSecurityFixes: boolean
  includePerformanceFixes: boolean
  includeQualityFixes: boolean
  outputPath: string
}

export interface CodeIssue {
  id: string
  type: 'security' | 'performance' | 'quality' | 'bug' | 'style'
  severity: 'low' | 'medium' | 'high' | 'critical'
  filePath: string
  lineNumber: number
  columnNumber: number
  description: string
  currentCode: string
  suggestedFix: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  tags: string[]
}

export interface FixResult {
  id: string
  issueId: string
  status: 'applied' | 'suggested' | 'failed' | 'skipped'
  originalCode: string
  fixedCode: string
  diff: string
  validationResult?: ValidationResult
  appliedAt: string
  appliedBy: string
}

export interface ValidationResult {
  passed: boolean
  testsPassed: number
  testsFailed: number
  errors: string[]
  warnings: string[]
  executionTime: number
}

export interface AutoFixReport {
  id: string
  timestamp: string
  filePath: string
  summary: FixSummary
  issues: CodeIssue[]
  fixes: FixResult[]
  recommendations: string[]
  metadata: FixMetadata
}

export interface FixSummary {
  totalIssues: number
  issuesFixed: number
  issuesSkipped: number
  issuesFailed: number
  securityIssues: number
  performanceIssues: number
  qualityIssues: number
  overallImprovement: number
  estimatedEffort: string
}

export interface FixMetadata {
  agentVersion: string
  analysisTime: number
  fixTime: number
  totalTime: number
  configuration: AutoFixOptions
  environment: string
}