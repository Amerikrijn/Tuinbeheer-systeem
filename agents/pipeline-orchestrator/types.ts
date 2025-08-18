export interface PipelineConfig {
  id: string
  name: string
  description: string
  version: string
  agents: AgentConfig[]
  workflows: WorkflowConfig[]
  settings: PipelineSettings
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  id: string
  name: string
  type: 'test-generator' | 'quality-analyzer' | 'auto-fix' | 'pipeline-orchestrator'
  status: 'active' | 'inactive' | 'error'
  path: string
  dependencies: string[]
  config: Record<string, any>
  healthCheck: HealthCheckConfig
}

export interface HealthCheckConfig {
  enabled: boolean
  interval: number // milliseconds
  timeout: number // milliseconds
  retries: number
  endpoint?: string
}

export interface WorkflowConfig {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  conditions: WorkflowCondition[]
  maxRetries: number
  timeout: number
  parallel: boolean
  enabled: boolean
}

export interface WorkflowStep {
  id: string
  name: string
  agentId: string
  order: number
  required: boolean
  config: Record<string, any>
  dependencies: string[]
  timeout: number
  retryPolicy: RetryPolicy
  rollbackPolicy: RollbackPolicy
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'file-change' | 'quality-gate'
  config: Record<string, any>
  enabled: boolean
}

export interface WorkflowCondition {
  type: 'quality-score' | 'test-coverage' | 'risk-level' | 'custom'
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
  value: any
  field: string
}

export interface RetryPolicy {
  maxRetries: number
  backoffMultiplier: number
  initialDelay: number
  maxDelay: number
}

export interface RollbackPolicy {
  enabled: boolean
  strategy: 'full' | 'partial' | 'incremental'
  checkpointInterval: number
  maxCheckpoints: number
}

export interface PipelineSettings {
  maxConcurrentWorkflows: number
  defaultTimeout: number
  enableLogging: boolean
  enableMetrics: boolean
  enableNotifications: boolean
  qualityGates: QualityGateConfig[]
  notifications: NotificationConfig[]
}

export interface QualityGateConfig {
  id: string
  name: string
  type: 'test-coverage' | 'quality-score' | 'risk-level' | 'performance'
  threshold: number
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
  action: 'block' | 'warn' | 'notify'
  enabled: boolean
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'webhook' | 'console'
  config: Record<string, any>
  events: string[]
  enabled: boolean
}

export interface PipelineExecution {
  id: string
  pipelineId: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  duration?: number
  steps: ExecutionStep[]
  metadata: Record<string, any>
  results: ExecutionResults
}

export interface ExecutionStep {
  id: string
  stepId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime: string
  endTime?: string
  duration?: number
  output: any
  error?: string
  retries: number
  metadata: Record<string, any>
  required?: boolean
}

export interface ExecutionResults {
  overallStatus: 'success' | 'partial' | 'failure'
  qualityScore: number
  testCoverage: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  recommendations: string[]
  artifacts: Artifact[]
}

export interface Artifact {
  id: string
  name: string
  type: 'report' | 'log' | 'data' | 'code'
  path: string
  size: number
  mimeType: string
  metadata: Record<string, any>
}

export interface PipelineMetrics {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageExecutionTime: number
  successRate: number
  activeWorkflows: number
  agentHealth: AgentHealth[]
  qualityTrends: QualityTrend[]
}

export interface AgentHealth {
  agentId: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  lastCheck: string
  responseTime: number
  errorRate: number
  uptime: number
}

export interface QualityTrend {
  date: string
  qualityScore: number
  testCoverage: number
  riskLevel: string
  issuesCount: number
}

export interface OrchestratorOptions {
  configPath: string
  outputPath: string
  enableMonitoring: boolean
  enableNotifications: boolean
  maxConcurrentWorkflows: number
  defaultTimeout: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface WorkflowExecutionRequest {
  workflowId: string
  config: Record<string, any>
  priority: 'low' | 'normal' | 'high' | 'critical'
  timeout?: number
  metadata?: Record<string, any>
}

export interface PipelineStatus {
  status: 'running' | 'idle' | 'error' | 'maintenance'
  activeWorkflows: number
  queuedWorkflows: number
  agentStatus: Record<string, string>
  lastActivity: string
  uptime: number
  registeredAgents: number
  totalIterations: number
  lastExecution?: string
}