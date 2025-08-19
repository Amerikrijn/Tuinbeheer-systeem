import { AutoFixAgent } from './AutoFixAgent'
import { AutoFixOptions, AutoFixReport } from './types'

export { AutoFixAgent, AutoFixOptions, AutoFixReport }

// Main entry point for the Auto-Fix Agent
export async function runAutoFix(options: AutoFixOptions): Promise<AutoFixReport> {
  const agent = new AutoFixAgent(options)
  return await agent.run()
}