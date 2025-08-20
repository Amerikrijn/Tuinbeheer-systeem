import { IssueCollectorAgent } from './agents/issue-collector'
import { CodeFixerAgent } from './agents/code-fixer'
import { TestGeneratorAgent } from './agents/test-generator'
import { QualityValidatorAgent } from './agents/quality-validator'
import { OpenAIProvider } from './core/providers/openai-provider'
import { PipelineConfig, PipelineResult, CodeIssue, CodeFix, TestSuite, QualityValidation, AgentResult } from './types'
import * as fs from 'fs'
import * as path from 'path'
import { QualityCheckRunner } from './quality-checks'

export class AIPipeline {
  private config: PipelineConfig
  private issueCollector: IssueCollectorAgent
  private codeFixer: CodeFixerAgent
  private testGenerator: TestGeneratorAgent
  private qualityValidator: QualityValidatorAgent
  private results: PipelineResult
  private openaiProvider: OpenAIProvider
  private qualityRunner: QualityCheckRunner

  constructor(config: PipelineConfig, openaiApiKey: string) {
    this.config = config
    
    // Initialize OpenAI provider
    this.openaiProvider = new OpenAIProvider(openaiApiKey)
    
    if (!this.openaiProvider.isAvailable) {
      console.warn('⚠️ OpenAI provider not available, pipeline will run in limited mode')
    }
    
    // Initialize all agents with OpenAI provider
    this.issueCollector = new IssueCollectorAgent(this.openaiProvider)
    this.codeFixer = new CodeFixerAgent(this.openaiProvider)
    this.testGenerator = new TestGeneratorAgent(this.openaiProvider)
    this.qualityValidator = new QualityValidatorAgent(this.openaiProvider)
    this.qualityRunner = new QualityCheckRunner(this.config.qualityChecks)
    
    this.results = this.initializeResults()
    
    console.log('🚀 AI Pipeline v2.0 initialized')
    console.log(`🤖 OpenAI Provider: ${this.openaiProvider.isAvailable ? '✅ Available' : '❌ Not Available'}`)
    console.log(`🎯 Quality Threshold: ${this.config.qualityThreshold}%`)
    console.log(`🔄 Max Iterations: ${this.config.maxIterations}`)
  }

  async run(targetPath: string = './src'): Promise<PipelineResult> {
    const startTime = Date.now()
    console.log('🚀 AI Pipeline v2.0 starting...')
    console.log(`Target: ${targetPath}`)
    console.log(`Max iterations: ${this.config.maxIterations}`)
    console.log(`Quality threshold: ${this.config.qualityThreshold}%`)
    console.log('')

    try {
      // Validate target path
      if (!fs.existsSync(targetPath)) {
        throw new Error(`Target path does not exist: ${targetPath}`)
      }

      let iteration = 1
      let currentQualityScore = 0
      let totalIssuesFound = 0
      let totalIssuesFixed = 0
      let totalTestsGenerated = 0
      let allIssues: CodeIssue[] = []
      let allFixes: CodeFix[] = []
      let allTests: TestSuite[] = []

      // Continue loop until quality is perfect or max iterations reached
      while (currentQualityScore < this.config.qualityThreshold && iteration <= this.config.maxIterations) {
        console.log(`🔄 Iteration ${iteration}`)
        console.log('─'.repeat(50))

        // Optional: run configured quality checks before AI analysis
        let checkIssues: CodeIssue[] = []
        if (this.config.qualityChecks && this.config.qualityChecks.length > 0) {
          console.log('🛡️ Step 0: Running quality checks...')
          checkIssues = await this.qualityRunner.run(targetPath)
          if (checkIssues.length) {
            totalIssuesFound += checkIssues.length
            console.log(`✅ Quality checks found ${checkIssues.length} issues`)
          } else {
            console.log('✅ No issues found by quality checks')
          }
        }

        // Step 1: Collect Issues
        console.log('🔍 Step 1: Collecting Issues...')
        const issueResult = await this.issueCollector.run(targetPath)

        if (!issueResult.success) {
          console.warn(`⚠️ Issue collection failed: ${issueResult.error}`)
          // Continue with previous issues if available
          if (allIssues.length === 0) {
            throw new Error(`Issue collection failed and no previous issues available: ${issueResult.error}`)
          }
        } else {
          allIssues = [...checkIssues, ...issueResult.data]
          totalIssuesFound += issueResult.data.length
          console.log(`✅ Found ${issueResult.data.length} issues`)
        }

        // Step 2: Calculate Quality Score
        currentQualityScore = this.calculateQualityScore(allIssues)
        console.log(`📊 Current quality score: ${currentQualityScore.toFixed(1)}%`)

        // Step 3: Generate Tests (if issues found)
        if (allIssues.length > 0) {
          console.log('🧪 Step 2: Generating Tests...')
          const testResult = await this.testGenerator.run(allIssues)
          if (testResult.success) {
            allTests = testResult.data
            totalTestsGenerated += allTests.length
            console.log(`✅ Generated ${allTests.length} test suites`)
          } else {
            console.warn(`⚠️ Test generation failed: ${testResult.error}`)
          }
        } else {
          console.log('✅ No issues found, skipping test generation')
        }

        // Step 4: Fix Code (if issues found and fixable)
        if (allIssues.length > 0) {
          console.log('🔧 Step 3: Fixing Code...')
          const fixResult = await this.codeFixer.run(allIssues)
          if (fixResult.success) {
            allFixes = fixResult.data
            totalIssuesFixed += allFixes.length
            console.log(`✅ Applied ${allFixes.length} fixes`)
          } else {
            console.warn(`⚠️ Code fixing failed: ${fixResult.error}`)
          }
        } else {
          console.log('✅ No issues found, skipping code fixing')
        }

        // Step 5: Validate Fixes
        console.log('✅ Step 4: Validating Fixes...')
        const validationResult = await this.qualityValidator.run(allIssues, allFixes)
        if (validationResult.success) {
          currentQualityScore = validationResult.data.score
          console.log(`✅ Validation complete - Quality Score: ${currentQualityScore.toFixed(1)}%`)
        } else {
          console.warn(`⚠️ Validation failed: ${validationResult.error}`)
        }

        // Step 6: Check if we should continue
        if (currentQualityScore >= this.config.qualityThreshold) {
          console.log(`🎯 Quality threshold (${this.config.qualityThreshold}%) reached!`)
          break
        }

        if (iteration >= this.config.maxIterations) {
          console.log(`⏰ Max iterations (${this.config.maxIterations}) reached`)
          break
        }

        // Step 7: Prepare for next iteration
        console.log(`📈 Quality improved from ${currentQualityScore.toFixed(1)}%`)
        console.log(`🔄 Preparing for iteration ${iteration + 1}...`)
        console.log('')

        iteration++
      }

      // Final results
      const executionTime = Date.now() - startTime
      this.results = {
        success: true,
        iterations: iteration - 1,
        finalQualityScore: currentQualityScore,
        issuesFound: totalIssuesFound,
        issuesFixed: totalIssuesFixed,
        testsGenerated: totalTestsGenerated,
        executionTime,
        errors: [],
        timestamp: new Date(),
        mode: this.openaiProvider.isAvailable ? 'ai' : 'ci',
        aiProvider: this.openaiProvider.name,
        targetPath,
        allIssues,
        allFixes,
        allTests
      }

      console.log('🎉 AI Pipeline completed successfully!')
      console.log(`📊 Final Quality Score: ${currentQualityScore.toFixed(1)}%`)
      console.log(`🔄 Total Iterations: ${iteration - 1}`)
      console.log(`🔍 Issues Found: ${totalIssuesFound}`)
      console.log(`🔧 Issues Fixed: ${totalIssuesFixed}`)
      console.log(`🧪 Tests Generated: ${totalTestsGenerated}`)
      console.log(`⏱️ Execution Time: ${(executionTime / 1000).toFixed(2)}s`)

      return this.results

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.error(`❌ AI Pipeline failed: ${errorMessage}`)
      
      this.results = {
        success: false,
        iterations: 0,
        finalQualityScore: 0,
        issuesFound: 0,
        issuesFixed: 0,
        testsGenerated: 0,
        executionTime,
        errors: [errorMessage],
        timestamp: new Date(),
        mode: this.openaiProvider.isAvailable ? 'ai' : 'ci',
        aiProvider: this.openaiProvider.name,
        targetPath,
        allIssues: [],
        allFixes: [],
        allTests: []
      }

      return this.results
    }
  }

  private calculateQualityScore(issues: CodeIssue[]): number {
    if (issues.length === 0) {
      return 100 // Perfect score if no issues
    }

    // Calculate score based on issue severity and count
    let totalScore = 100
    let totalWeight = 0

    for (const issue of issues) {
      let weight = 1
      let scoreDeduction = 0

      switch (issue.severity) {
        case 'critical':
          weight = 5
          scoreDeduction = 20
          break
        case 'high':
          weight = 4
          scoreDeduction = 15
          break
        case 'medium':
          weight = 3
          scoreDeduction = 10
          break
        case 'low':
          weight = 1
          scoreDeduction = 5
          break
        default:
          weight = 2
          scoreDeduction = 8
      }

      totalScore -= (scoreDeduction * weight)
      totalWeight += weight
    }

    // Normalize score
    const finalScore = Math.max(0, totalScore / Math.max(1, totalWeight))
    return Math.round(finalScore)
  }

  private initializeResults(): PipelineResult {
    return {
      success: false,
      iterations: 0,
      finalQualityScore: 0,
      issuesFound: 0,
      issuesFixed: 0,
      testsGenerated: 0,
      executionTime: 0,
      errors: [],
      timestamp: new Date(),
      mode: 'unknown',
      aiProvider: 'unknown',
      targetPath: '',
      allIssues: [],
      allFixes: [],
      allTests: []
    }
  }

  // Getter methods for external access
  getResults(): PipelineResult {
    return this.results
  }

  getOpenAIStatus(): boolean {
    return this.openaiProvider.isAvailable
  }

  getProviderName(): string {
    return this.openaiProvider.name
  }
}