/**
 * Enterprise AI Pipeline - Main Export
 * Real implementation of SPEC → TECH → IMPL → TEST → SEC → PERF → DOCS → READY workflow
 */

export { PipelineOrchestrator } from './orchestrator'
export { FeatureBuilder } from './feature-builder'
export { TestEngineer } from './test-engineer'
export { SecOpsAgent } from './secops-agent'
export { PerfAgent } from './perf-agent'
export { DocsWriter } from './docs-writer'
export { PipelineCommands } from './commands'

export type { PipelineStage, PipelineState } from './orchestrator'
export type { FeatureSpec } from './feature-builder'
export type { TestSuite } from './test-engineer'
export type { SecurityScan } from './secops-agent'
export type { PerformanceMetrics, PerformanceReport } from './perf-agent'
export type { DocumentationUpdate } from './docs-writer'

// Main pipeline instance for commands
export const pipeline = new (require('./commands').PipelineCommands)()

/**
 * Pipeline Commands for Cursor
 * Use these commands in Cursor to manage the pipeline
 */

// @pipeline-start <feature> [description]
export async function pipelineStart(feature: string, description?: string) {
  return await pipeline.pipelineStart(feature, description)
}

// @pipeline-continue
export async function pipelineContinue() {
  return await pipeline.pipelineContinue()
}

// @pipeline-status
export async function pipelineStatus() {
  return await pipeline.pipelineStatus()
}

/**
 * Usage Examples:
 * 
 * // Start new feature pipeline
 * @pipeline-start user-profile-management "Enhanced user profile management with photo upload"
 * 
 * // Continue to next stage
 * @pipeline-continue
 * 
 * // Check current status
 * @pipeline-status
 */
