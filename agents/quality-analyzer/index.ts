import { QualityAnalyzerAgent } from './QualityAnalyzerAgent'
import { TestResult, TestScenario } from '../test-generator/types'
import { QualityReport, ImprovementSuggestion } from './types'

export { QualityAnalyzerAgent, QualityReport, ImprovementSuggestion }

// Main entry point for the Quality Analyzer Agent
export async function runQualityAnalysis(options: {
  testResults: TestResult[]
  testScenarios: TestScenario[]
  outputPath: string
}) {
  const agent = new QualityAnalyzerAgent(options)
  return await agent.run()
}