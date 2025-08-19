import * as fs from 'fs'
import * as path from 'path'
import { OpenAIProvider } from '../core/providers/openai-provider'
import { CodeIssue, TestSuite, TestCase, AgentResult } from '../types'

export class TestGeneratorAgent {
  private provider: OpenAIProvider
  private outputDir: string

  constructor(openaiProvider: OpenAIProvider) {
    this.provider = openaiProvider
    this.outputDir = './ai-pipeline-tests'
  }

  async run(issues: CodeIssue[]): Promise<AgentResult<TestSuite[]>> {
    const startTime = Date.now()

    try {
      console.log('🧪 Test Generator Agent starting...')
      console.log(`Issues to generate tests for: ${issues.length}`)

      if (issues.length === 0) {
        console.log('✅ No issues found, no tests to generate')
        return this.createResult([], startTime)
      }

      // Create output directory
      await this.createOutputDirectory()

      // Group issues by file
      const issuesByFile = this.groupIssuesByFile(issues)
      const testSuites: TestSuite[] = []

      // Generate tests for each file
      for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
        try {
          console.log(`🧪 Generating tests for: ${filePath}`)
          
          const testSuite = await this.generateTestSuite(filePath, fileIssues)
          if (testSuite) {
            testSuites.push(testSuite)
            
            // Save test suite to file
            await this.saveTestSuite(testSuite)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to generate tests for ${filePath}: ${error}`)
        }
      }

      const executionTime = Date.now() - startTime
      console.log(`✅ Test generation complete! Generated ${testSuites.length} test suites`)

      return this.createResult(testSuites, startTime, executionTime)

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.error(`❌ Test generation failed: ${errorMessage}`)
      
      return this.createResult([], startTime, executionTime, errorMessage)
    }
  }

  private async generateTestSuite(filePath: string, issues: CodeIssue[]): Promise<TestSuite | null> {
    try {
      const fileName = path.basename(filePath, path.extname(filePath))
      const testFileName = `${fileName}.test.ts`
      const testFilePath = path.join(this.outputDir, testFileName)

      // Generate tests for each issue
      const tests: TestCase[] = []
      
      for (const issue of issues) {
        const testCase = await this.generateTestCase(issue)
        if (testCase) {
          tests.push(testCase)
        }
      }

      if (tests.length === 0) {
        return null
      }

      // Calculate coverage based on issues covered
      const coverage = Math.min((tests.length / issues.length) * 100, 100)

      return {
        id: `test-suite-${fileName}-${Date.now()}`,
        filePath: testFilePath,
        tests,
        coverage,
        aiProvider: this.provider.name,
        timestamp: new Date()
      }

    } catch (error) {
      console.warn(`Failed to generate test suite: ${error}`)
      return null
    }
  }

  private async generateTestCase(issue: CodeIssue): Promise<TestCase | null> {
    try {
      // Generate AI-powered test case
      const aiResponse = await this.provider.callAPI(
        this.buildTestPrompt(issue),
        { role: 'test-generator' }
      )

      // Parse AI response
      const parsedTest = this.parseAIResponse(aiResponse, issue)
      if (parsedTest) {
        return parsedTest
      }

      // Fallback to pattern-based test
      return this.generatePatternBasedTest(issue)

    } catch (error) {
      console.warn(`Failed to generate AI test: ${error}`)
      return this.generatePatternBasedTest(issue)
    }
  }

  // Demo test functie verwijderd - alleen echte AI tests

  private generatePatternBasedTest(issue: CodeIssue): TestCase | null {
    const testId = `pattern-test-${issue.id}-${Date.now()}`
    
    let testCode = ''
    let testName = 'Pattern-based test'

    // Pattern-based test generation
    if (issue.message.includes('console.log')) {
      testCode = `test('should not contain console.log statements', () => {
  const fileContent = fs.readFileSync('${issue.filePath}', 'utf-8');
  expect(fileContent).not.toContain('console.log');
});`
      testName = 'Console.log detection'
    } else if (issue.message.includes('var ')) {
      testCode = `test('should use const/let instead of var', () => {
  const fileContent = fs.readFileSync('${issue.filePath}', 'utf-8');
  expect(fileContent).not.toContain('var ');
});`
      testName = 'Var usage detection'
    } else if (issue.message.includes('TODO')) {
      testCode = `test('should have formatted TODO comments', () => {
  const fileContent = fs.readFileSync('${issue.filePath}', 'utf-8');
  const todoLines = fileContent.split('\\n').filter(line => line.includes('TODO'));
  todoLines.forEach(line => {
    expect(line.trim()).toMatch(/^\\/\\/ TODO:/);
  });
});`
      testName = 'TODO comment formatting'
    } else {
      return null // No pattern match
    }

    return {
      id: testId,
      name: testName,
      description: `Pattern-based test for: ${issue.message}`,
      code: testCode,
      category: 'unit',
      priority: 'medium',
      aiProvider: 'pattern-based'
    }
  }

  private async saveTestSuite(testSuite: TestSuite): Promise<void> {
    try {
      // Generate test file content
      const testFileContent = this.generateTestFileContent(testSuite)
      
      // Write to file
      fs.writeFileSync(testSuite.filePath, testFileContent, 'utf-8')
      console.log(`💾 Test suite saved: ${testSuite.filePath}`)
      
    } catch (error) {
      console.error(`❌ Failed to save test suite: ${error}`)
    }
  }

  private generateTestFileContent(testSuite: TestSuite): string {
    const fileName = path.basename(testSuite.filePath, '.test.ts')
    
    let content = `// Auto-generated test suite for ${fileName}
// Generated by AI Pipeline v2.0 - Test Generator Agent
// Coverage: ${testSuite.coverage.toFixed(1)}%
// Generated at: ${testSuite.timestamp.toISOString()}

import * as fs from 'fs';
import * as path from 'path';

describe('${fileName}', () => {
`;

    // Add each test case
    for (const testCase of testSuite.tests) {
      content += `
  ${testCase.code}
`;
    }

    content += `});
`;

    return content
  }

  private groupIssuesByFile(issues: CodeIssue[]): Record<string, CodeIssue[]> {
    const grouped: Record<string, CodeIssue[]> = {}
    
    for (const issue of issues) {
      if (!grouped[issue.filePath]) {
        grouped[issue.filePath] = []
      }
      const fileIssues = grouped[issue.filePath]
      if (fileIssues) {
        fileIssues.push(issue)
      }
    }
    
    return grouped
  }

  private async createOutputDirectory(): Promise<void> {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  private buildTestPrompt(issue: CodeIssue): string {
    return `Generate a test case for the following code issue:

Issue: ${issue.message}
Category: ${issue.category}
Severity: ${issue.severity}
File: ${issue.filePath}
Line: ${issue.line}
Code: ${issue.code}

Please provide a JSON response with:
- name: descriptive test name
- description: what the test validates
- code: complete test code (Jest format)
- category: unit/integration/e2e
- priority: low/medium/high

Focus on testing the specific issue and ensuring it doesn't regress.`
  }

  private parseAIResponse(aiResponse: string, issue: CodeIssue): TestCase | null {
    try {
      const parsed = JSON.parse(aiResponse)
      
      if (parsed.code && parsed.name) {
        return {
          id: `ai-test-${issue.id}-${Date.now()}`,
          name: parsed.name,
          description: parsed.description || `AI-generated test for: ${issue.message}`,
          code: parsed.code,
          category: parsed.category || 'unit',
          priority: parsed.priority || 'medium',
          aiProvider: this.provider.name
        }
      }
    } catch (error) {
      console.warn(`Failed to parse AI response: ${error}`)
    }
    
    return null
  }

  private createResult(
    testSuites: TestSuite[], 
    startTime: number, 
    executionTime?: number,
    error?: string
  ): AgentResult<TestSuite[]> {
    const finalExecutionTime = executionTime || Date.now() - startTime
    
    const result: AgentResult<TestSuite[]> = {
      success: !error,
      data: testSuites,
      executionTime: finalExecutionTime,
      aiProvider: this.provider.name,
      timestamp: new Date()
    }
    
    if (error) {
      result.error = error
    }
    
    return result
  }
}