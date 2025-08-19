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
  const fullOptions = {
    ...options,
    includeSecurity: true,
    includePerformance: true,
    includeMaintainability: true,
    qualityThreshold: 80,
    maxRecommendations: 10,
    enableDetailedAnalysis: true
  }
  
  const agent = new QualityAnalyzerAgent(fullOptions)
  return await agent.run()
}