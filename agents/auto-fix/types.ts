export interface CodeFix {
  id: string
  filePath: string
  lineNumber: number
  issueType: 'bug' | 'security' | 'performance' | 'quality' | 'style' | 'typescript' | 'eslint'
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
  // New fields for advanced features
  typescriptNode?: any // TypeScript compiler API node
  eslintRule?: string // ESLint rule that triggered this fix
  mlConfidence?: number // Machine learning confidence score
  fixPattern?: string // Pattern used for this fix
  requiresReview?: boolean // Whether this fix requires human review
  pullRequestRequired?: boolean // Whether this fix should generate a PR
}

export interface ValidationRule {
  type: 'syntax' | 'semantic' | 'test' | 'custom' | 'typescript' | 'eslint' | 'ml'
  condition: string
  message: string
  // New fields for advanced validation
  typescriptCheck?: boolean
  eslintCheck?: boolean
  mlValidation?: boolean
  customValidator?: (code: string) => boolean
}

export interface FixResult {
  fixId: string
  status: 'applied' | 'failed' | 'skipped' | 'requires-review' | 'pr-generated'
  executionTime: number
  output: any
  error?: string
  timestamp: string
  metadata: Record<string, any>
  validationResults: ValidationResult[]
  // New fields for advanced tracking
  gitCommitHash?: string
  pullRequestUrl?: string
  mlPredictions?: MLPrediction[]
}

export interface ValidationResult {
  ruleId: string
  passed: boolean
  message: string
  details?: any
  // New fields for advanced validation
  typescriptResult?: TypeScriptValidationResult
  eslintResult?: ESLintValidationResult
  mlResult?: MLValidationResult
}

export interface CodeAnalysis {
  filePath: string
  issues: CodeIssue[]
  suggestions: CodeSuggestion[]
  complexity: number
  maintainability: number
  securityScore: number
  performanceScore: number
  // New fields for advanced analysis
  typescriptAnalysis?: TypeScriptAnalysis
  eslintAnalysis?: ESLintAnalysis
  mlAnalysis?: MLAnalysis
  gitHistory?: GitHistoryAnalysis
}

export interface CodeIssue {
  id: string
  type: 'bug' | 'security' | 'performance' | 'quality' | 'style' | 'typescript' | 'eslint'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  lineNumber: number
  code: string
  impact: string
  recommendation: string
  autoFixable: boolean
  // New fields for advanced issue tracking
  typescriptNode?: any
  eslintRule?: string
  mlConfidence?: number
  fixPattern?: string
  requiresReview?: boolean
}

export interface CodeSuggestion {
  id: string
  type: 'refactor' | 'optimize' | 'document' | 'test' | 'typescript' | 'eslint'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  currentState: string
  targetState: string
  actionItems: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  // New fields for advanced suggestions
  mlScore?: number
  patternMatch?: string
  similarIssues?: string[]
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
  // New options for advanced features
  includeTypeScriptFixes?: boolean
  includeESLintFixes?: boolean
  enableMachineLearning?: boolean
  generatePullRequests?: boolean
  autoCommit?: boolean
  requireCodeReview?: boolean
  mlModelPath?: string
  eslintConfigPath?: string
  typescriptConfigPath?: string
  gitIntegration?: boolean
  sonarQubeIntegration?: boolean
  codeClimateIntegration?: boolean
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
  // New fields for advanced reporting
  pullRequests?: PullRequestInfo[]
  gitCommits?: GitCommitInfo[]
  mlMetrics?: MLMetrics
  integrationResults?: IntegrationResults
}

export interface FixSummary {
  totalIssues: number
  autoFixed: number
  failedFixes: number
  skippedFixes: number
  successRate: number
  improvementScore: number
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  // New fields for advanced summary
  typescriptIssuesFixed: number
  eslintIssuesFixed: number
  mlSuggestionsApplied: number
  pullRequestsGenerated: number
  codeReviewRequired: number
}

export interface FixMetadata {
  generatedAt: string
  fixerVersion: string
  totalFixTime: number
  confidence: number
  dataSources: string[]
  appliedStrategies: string[]
  // New fields for advanced metadata
  mlModelVersion?: string
  typescriptVersion?: string
  eslintVersion?: string
  gitBranch?: string
  integrationResults?: Record<string, any>
}

// New interfaces for TypeScript compiler API integration
export interface TypeScriptAnalysis {
  ast: any
  diagnostics: TypeScriptDiagnostic[]
  symbols: TypeScriptSymbol[]
  imports: TypeScriptImport[]
  exports: TypeScriptExport[]
  typeInfo: TypeScriptTypeInfo
}

export interface TypeScriptDiagnostic {
  code: number
  category: 'error' | 'warning' | 'suggestion'
  message: string
  start: number
  length: number
  line: number
  character: number
  file: string
}

export interface TypeScriptSymbol {
  name: string
  kind: string
  location: any
  type: any
  documentation: string[]
}

export interface TypeScriptImport {
  moduleSpecifier: string
  namedBindings: string[]
  defaultBinding?: string
  location: any
}

export interface TypeScriptExport {
  name: string
  kind: string
  location: any
  type: any
}

export interface TypeScriptTypeInfo {
  type: any
  isPrimitive: boolean
  isUnion: boolean
  isIntersection: boolean
  isGeneric: boolean
  genericTypes: any[]
}

export interface TypeScriptValidationResult {
  syntaxValid: boolean
  typeValid: boolean
  semanticValid: boolean
  errors: TypeScriptDiagnostic[]
  warnings: TypeScriptDiagnostic[]
}

// New interfaces for ESLint integration
export interface ESLintAnalysis {
  results: ESLintResult[]
  errorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  usedDeprecatedRules: string[]
}

export interface ESLintResult {
  filePath: string
  messages: ESLintMessage[]
  errorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  source: string
}

export interface ESLintMessage {
  ruleId: string
  severity: number
  message: string
  line: number
  column: number
  nodeType: string
  messageId: string
  endLine?: number
  endColumn?: number
  fix?: ESLintFix
}

export interface ESLintFix {
  range: [number, number]
  text: string
}

export interface ESLintValidationResult {
  valid: boolean
  errors: ESLintMessage[]
  warnings: ESLintMessage[]
  fixableIssues: ESLintMessage[]
}

// New interfaces for Machine Learning
export interface MLAnalysis {
  predictions: MLPrediction[]
  confidence: number
  modelVersion: string
  trainingDataSize: number
  lastTrained: string
}

export interface MLPrediction {
  issueType: string
  confidence: number
  pattern: string
  suggestedFix: string
  similarCases: string[]
  trainingData: MLTrainingData
}

export interface MLTrainingData {
  source: string
  pattern: string
  successRate: number
  usageCount: number
  lastUsed: string
}

export interface MLValidationResult {
  mlConfidence: number
  patternMatch: boolean
  historicalSuccess: number
  recommendedAction: string
}

export interface MLMetrics {
  totalPredictions: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainingTime: number
  inferenceTime: number
}

// New interfaces for Git integration
export interface GitHistoryAnalysis {
  commitCount: number
  lastCommit: string
  branch: string
  contributors: string[]
  changeFrequency: number
}

export interface GitCommitInfo {
  hash: string
  message: string
  author: string
  timestamp: string
  filesChanged: string[]
  fixesApplied: string[]
}

export interface PullRequestInfo {
  id: string
  title: string
  description: string
  branch: string
  status: 'open' | 'merged' | 'closed'
  url: string
  fixesIncluded: string[]
  reviewStatus: 'pending' | 'approved' | 'changes-requested'
  createdAt: string
  updatedAt: string
}

// New interfaces for external tool integration
export interface IntegrationResults {
  sonarQube?: SonarQubeResult
  codeClimate?: CodeClimateResult
  github?: GitHubResult
  gitlab?: GitLabResult
}

export interface SonarQubeResult {
  qualityGate: string
  bugs: number
  vulnerabilities: number
  codeSmells: number
  coverage: number
  duplications: number
  maintainability: string
  reliability: string
  security: string
}

export interface CodeClimateResult {
  gpa: number
  issuesCount: number
  testCoverage: number
  maintainability: string
  technicalDebt: number
  complexity: number
}

export interface GitHubResult {
  repository: string
  branch: string
  pullRequests: PullRequestInfo[]
  issues: any[]
  actions: any[]
}

export interface GitLabResult {
  project: string
  branch: string
  mergeRequests: PullRequestInfo[]
  issues: any[]
  pipelines: any[]
}

// New interfaces for configuration
export interface AutoFixConfig {
  general: GeneralConfig
  typescript: TypeScriptConfig
  eslint: ESLintConfig
  machineLearning: MLConfig
  git: GitConfig
  integrations: IntegrationsConfig
  validation: ValidationConfig
}

export interface GeneralConfig {
  maxFixes: number
  autoApply: boolean
  requireValidation: boolean
  outputPath: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface TypeScriptConfig {
  enabled: boolean
  configPath: string
  strictMode: boolean
  includeNodeModules: boolean
  customRules: string[]
}

export interface ESLintConfig {
  enabled: boolean
  configPath: string
  autoFix: boolean
  customRules: string[]
  ignorePatterns: string[]
}

export interface MLConfig {
  enabled: boolean
  modelPath: string
  confidenceThreshold: number
  trainingDataPath: string
  updateFrequency: number
}

export interface GitConfig {
  enabled: boolean
  autoCommit: boolean
  generatePRs: boolean
  requireReview: boolean
  branchPrefix: string
}

export interface IntegrationsConfig {
  sonarQube: SonarQubeConfig
  codeClimate: CodeClimateConfig
  github: GitHubConfig
  gitlab: GitLabConfig
}

export interface SonarQubeConfig {
  enabled: boolean
  url: string
  token: string
  projectKey: string
}

export interface CodeClimateConfig {
  enabled: boolean
  url: string
  token: string
  repositoryId: string
}

export interface GitHubConfig {
  enabled: boolean
  token: string
  owner: string
  repository: string
}

export interface GitLabConfig {
  enabled: boolean
  token: string
  url: string
  projectId: string
}

export interface ValidationConfig {
  typescript: boolean
  eslint: boolean
  machineLearning: boolean
  custom: boolean
  rollbackOnFailure: boolean
}