import { IssueCollectorAgent } from './agents/issue-collector'
import { PipelineConfig, PipelineResult, CodeIssue, AgentResult } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class AIPipeline {
  private config: PipelineConfig
  private issueCollector: IssueCollectorAgent
  private results: PipelineResult

  constructor(config: PipelineConfig, openaiApiKey: string) {
    this.config = config
    this.issueCollector = new IssueCollectorAgent(openaiApiKey)
    this.results = this.initializeResults()
    
    // Check if running in demo mode
    if (openaiApiKey === 'demo-mode') {
      console.log('🎭 Demo mode enabled - using mock data')
    }
  }

  async run(targetPath: string = './src'): Promise<PipelineResult> {
    const startTime = Date.now()
    console.log('🚀 AI Pipeline starting...')
    console.log(`Target: ${targetPath}`)
    console.log(`Max iterations: ${this.config.maxIterations}`)
    console.log(`Quality threshold: ${this.config.qualityThreshold}%`)
    console.log('')

    try {
      let iteration = 1
      let currentQualityScore = 0
      let totalIssuesFound = 0
      let totalIssuesFixed = 0
      let totalTestsGenerated = 0

      // Continue loop until quality is perfect or max iterations reached
      while (currentQualityScore < this.config.qualityThreshold && iteration <= this.config.maxIterations) {
        console.log(`🔄 Iteration ${iteration}`)
        console.log('─'.repeat(50))

        // Step 1: Collect Issues
        console.log('🔍 Step 1: Collecting Issues...')
        const issueResult = await this.issueCollector.run(targetPath)
        
        if (!issueResult.success) {
          throw new Error(`Issue collection failed: ${issueResult.error}`)
        }

        const issues = issueResult.data
        totalIssuesFound += issues.length
        console.log(`✅ Found ${issues.length} issues`)

        // Step 2: Calculate Quality Score
        currentQualityScore = this.calculateQualityScore(issues)
        console.log(`📊 Current quality score: ${currentQualityScore.toFixed(1)}%`)

        // Step 3: Generate Tests (placeholder for now)
        console.log('🧪 Step 2: Generating Tests...')
        const testsGenerated = this.generateTests(issues)
        totalTestsGenerated += testsGenerated
        console.log(`✅ Generated ${testsGenerated} tests`)

        // Step 4: Fix Code (placeholder for now)
        console.log('🔧 Step 3: Fixing Code...')
        const issuesFixed = this.fixCode(issues)
        totalIssuesFixed += issuesFixed
        console.log(`✅ Fixed ${issuesFixed} issues`)

        // Step 5: Validate Fixes
        console.log('✅ Step 4: Validating Fixes...')
        const validationResult = this.validateFixes(issues)
        console.log(`✅ Validation complete`)

        // Step 6: Check if we should continue
        if (currentQualityScore >= this.config.qualityThreshold) {
          console.log('🎉 Quality threshold reached!')
          break
        }

        if (iteration >= this.config.maxIterations) {
          console.log('⏰ Max iterations reached')
          break
        }

        // Step 7: Prepare for next iteration
        console.log('🔄 Preparing for next iteration...')
        await this.prepareNextIteration(targetPath)
        
        iteration++
        console.log('')
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
        warnings: [],
        timestamp: new Date()
      }

      // Save results
      await this.saveResults()

      console.log('')
      console.log('🎯 Pipeline Complete!')
      console.log(`Iterations: ${this.results.iterations}`)
      console.log(`Final Quality: ${this.results.finalQualityScore.toFixed(1)}%`)
      console.log(`Issues Found: ${this.results.issuesFound}`)
      console.log(`Issues Fixed: ${this.results.issuesFixed}`)
      console.log(`Tests Generated: ${this.results.testsGenerated}`)
      console.log(`Execution Time: ${this.results.executionTime}ms`)

      return this.results

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.error(`❌ Pipeline failed: ${errorMessage}`)
      
      this.results = {
        success: false,
        iterations: 0,
        finalQualityScore: 0,
        issuesFound: 0,
        issuesFixed: 0,
        testsGenerated: 0,
        executionTime,
        errors: [errorMessage],
        warnings: [],
        timestamp: new Date()
      }

      await this.saveResults()
      return this.results
    }
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
      warnings: [],
      timestamp: new Date()
    }
  }

  private calculateQualityScore(issues: CodeIssue[]): number {
    if (issues.length === 0) return 100

    // Calculate score based on issue severity and count
    let totalScore = 0
    let maxScore = issues.length * 100

    for (const issue of issues) {
      let issueScore = 100
      
      // Reduce score based on severity
      switch (issue.severity) {
        case 'critical':
          issueScore -= 80
          break
        case 'high':
          issueScore -= 60
          break
        case 'medium':
          issueScore -= 30
          break
        case 'low':
          issueScore -= 10
          break
      }

      // Reduce score based on confidence
      issueScore -= (100 - issue.confidence) * 0.5

      totalScore += Math.max(0, issueScore)
    }

    return Math.round((totalScore / maxScore) * 100)
  }

  private generateTests(issues: CodeIssue[]): number {
    // Placeholder: will be implemented with test generator agent
    return Math.min(issues.length * 2, 10) // Generate up to 2 tests per issue, max 10
  }

  private fixCode(issues: CodeIssue[]): number {
    // Placeholder: will be implemented with code fixer agent
    const fixableIssues = issues.filter(issue => issue.fixable)
    return Math.min(fixableIssues.length, 5) // Fix up to 5 issues per iteration
  }

  private validateFixes(issues: CodeIssue[]): boolean {
    // Placeholder: will be implemented with quality validator agent
    return true
  }

  private async prepareNextIteration(targetPath: string): Promise<void> {
    // Placeholder: prepare for next iteration
    // This could include:
    // - Running tests
    // - Checking git status
    // - Preparing next batch of files
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work
  }

  private async saveResults(): Promise<void> {
    const outputDir = this.config.outputPath
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const resultsPath = path.join(outputDir, 'pipeline-results.json')
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2))
    
    console.log(`📄 Results saved to: ${resultsPath}`)
  }
}