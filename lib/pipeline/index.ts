/**
 * Enterprise AI Pipeline - Main Export
 * Real implementation of SPEC → TECH → IMPL → TEST → SEC → PERF → DOCS → READY workflow
 */

export { PipelineOrchestrator } from './orchestrator'
export { PipelineCommands } from './commands'

export type { PipelineStage, PipelineState } from './orchestrator'

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
 * @pipeline-start user-dashboard-enhancement "Enhanced user dashboard with real-time updates"
 * 
 * // Continue to next stage
 * @pipeline-continue
 * 
 * // Check current status
 * @pipeline-status
 */
