import { TestGeneratorAgent } from './TestGeneratorAgent'
import { TestScenario } from './types'
import { CodeAnalyzer } from './CodeAnalyzer'
import { TestExecutor } from './TestExecutor'
import { ReportGenerator } from './ReportGenerator'

export { TestGeneratorAgent, TestScenario, CodeAnalyzer, TestExecutor, ReportGenerator }

// Main entry point for the Test Generator Agent
export async function runTestGeneration(options: {
  featurePath: string
  strategy: 'full-path-coverage' | 'risk-based' | 'change-focused'
  maxInteractions: number
  outputPath: string
}) {
  const agent = new TestGeneratorAgent(options)
  return await agent.run()
}