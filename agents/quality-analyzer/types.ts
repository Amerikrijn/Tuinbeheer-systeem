import { TestResult, TestScenario } from '../test-generator/types'

export interface QualityAnalysisOptions {
  outputPath: string
  testResults?: string | TestResult[]
  testScenarios?: string | TestScenario[]
  includeSecurity: boolean
  includePerformance: boolean
  includeMaintainability: boolean
  qualityThreshold: number
  maxRecommendations: number
  enableDetailedAnalysis: boolean
}

export interface QualityReport {
  id: string
  timestamp: string
  summary: QualitySummary
  analysis: QualityAnalysis
  recommendations: ImprovementSuggestion[]
  riskAssessment: RiskAssessment
  coverageAnalysis: CoverageAnalysis
  performanceMetrics: PerformanceMetrics
  metadata: QualityMetadata
}

export interface QualitySummary {
  totalTests: number
  passedTests: number
  failedTests: number
  errorTests: number
  successRate: number
  qualityScore: number
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface QualityAnalysis {
  testQuality: TestQualityMetrics
  codeQuality: CodeQualityMetrics
  securityQuality: SecurityQualityMetrics
  performanceQuality: PerformanceQualityMetrics
  maintainabilityQuality: MaintainabilityQualityMetrics
}

export interface TestQualityMetrics {
  coverage: number
  reliability: number
  maintainability: number
  readability: number
  completeness: number
}

export interface CodeQualityMetrics {
  complexity: number
  duplication: number
  maintainability: number
  testability: number
  readability: number
}

export interface SecurityQualityMetrics {
  vulnerabilityCount: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  securityScore: number
  complianceStatus: 'compliant' | 'non-compliant' | 'partial'
}

export interface PerformanceQualityMetrics {
  responseTime: number
  throughput: number
  resourceUsage: number
  scalability: number
  efficiency: number
}

export interface MaintainabilityQualityMetrics {
  codeComplexity: number
  documentation: number
  modularity: number
  reusability: number
  testability: number
}

export interface ImprovementSuggestion {
  id: string
  type: 'test' | 'code' | 'security' | 'performance' | 'documentation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  title: string
  description: string
  currentState: string
  targetState: string
  actionItems: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  risk: 'low' | 'medium' | 'high'
  dependencies: string[]
  tags: string[]
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  riskFactors: RiskFactor[]
  mitigationStrategies: string[]
  riskScore: number
}

export interface RiskFactor {
  id: string
  category: string
  description: string
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
}

export interface CoverageAnalysis {
  overallCoverage: number
  functionalCoverage: number
  securityCoverage: number
  edgeCaseCoverage: number
  uiCoverage: number
  performanceCoverage: number
  gaps: CoverageGap[]
  recommendations: string[]
}

export interface CoverageGap {
  id: string
  category: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  impact: string
  suggestedTests: string[]
}

export interface PerformanceMetrics {
  averageExecutionTime: number
  slowestTests: PerformanceTest[]
  fastestTests: PerformanceTest[]
  performanceTrend: 'improving' | 'stable' | 'degrading'
  bottlenecks: string[]
}

export interface PerformanceTest {
  testId: string
  testName: string
  executionTime: number
  category: string
  performance: 'excellent' | 'good' | 'acceptable' | 'poor'
}

export interface QualityMetadata {
  generatedAt: string
  analyzerVersion: string
  totalAnalysisTime: number
  confidence: number
  dataSources: string[]
}