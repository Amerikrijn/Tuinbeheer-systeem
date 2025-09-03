/**
 * Real AI Pipeline - Main Export
 * Echte AI agents met LLM interactie en banking standards
 */

export { RealAIPipelineOrchestrator } from './real-orchestrator'
export { RealAIPipelineCommands } from './real-commands'
export { 
  SpecAgent, 
  TechAgent, 
  ImplAgent, 
  TestAgent, 
  SecAgent, 
  PerfAgent, 
  DocsAgent, 
  ReadyAgent,
  AgentFactory 
} from './real-ai-agents'

export type { PipelineStage, PipelineState } from './real-orchestrator'
export type { AgentResponse, AgentContext } from './real-ai-agents'

// Main real AI pipeline instance for commands
export const realAIPipeline = new (require('./real-commands').RealAIPipelineCommands)()

/**
 * Real AI Pipeline Commands for Cursor
 * Use these commands in Cursor to manage the real AI pipeline
 */

// @pipeline-start <feature> [description]
export async function realPipelineStart(feature: string, description?: string) {
  return await realAIPipeline.pipelineStart(feature, description)
}

// @pipeline-continue
export async function realPipelineContinue() {
  return await realAIPipeline.pipelineContinue()
}

// @pipeline-status
export async function realPipelineStatus() {
  return await realAIPipeline.pipelineStatus()
}

// @pipeline-approve <stage> [userInput]
export async function realPipelineApprove(stage: string, userInput?: string) {
  return await realAIPipeline.pipelineApprove(stage, userInput)
}

// @pipeline-input <input>
export async function realPipelineInput(input: string) {
  return await realAIPipeline.pipelineInput(input)
}

// Individual agent commands
export async function realSpecAgent(feature: string, description?: string) {
  return await realAIPipeline.specAgent(feature, description)
}

export async function realTechAgent() {
  return await realAIPipeline.techAgent()
}

export async function realImplAgent() {
  return await realAIPipeline.implAgent()
}

export async function realTestAgent() {
  return await realAIPipeline.testAgent()
}

export async function realSecAgent() {
  return await realAIPipeline.secAgent()
}

export async function realPerfAgent() {
  return await realAIPipeline.perfAgent()
}

export async function realDocsAgent() {
  return await realAIPipeline.docsAgent()
}

export async function realReadyAgent() {
  return await realAIPipeline.readyAgent()
}

/**
 * Usage Examples:
 * 
 * // Start new feature pipeline with real AI agents
 * @pipeline-start fix-beheerscherm-issues "Fix de foutmelding bij het opslaan van tuin toegang"
 * 
 * // Continue to next stage with AI agent
 * @pipeline-continue
 * 
 * // Check current status with AI agent info
 * @pipeline-status
 * 
 * // Approve current stage
 * @pipeline-approve spec
 * 
 * // Provide input for current stage
 * @pipeline-input "De business value is om admin gebruikers te helpen met tuin toegang beheer"
 * 
 * // Execute individual agents
 * @spec-agent fix-beheerscherm-issues "Fix admin beheerscherm"
 * @tech-agent
 * @impl-agent
 * @test-agent
 * @sec-agent
 * @perf-agent
 * @docs-agent
 * @ready-agent
 */
