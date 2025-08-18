export { TestGeneratorAgent } from './TestGeneratorAgent'
export { CodeAnalyzer } from './CodeAnalyzer'
export { TestExecutor } from './TestExecutor'
export { ReportGenerator } from './ReportGenerator'

export type {
  TestScenario,
  TestResult,
  CodeAnalysis,
  SecurityIssue,
  ValidationRule,
  TestGenerationOptions,
  TestCoverageReport
} from './types'

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