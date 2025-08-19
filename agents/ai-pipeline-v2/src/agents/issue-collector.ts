import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'
import { OpenAIProvider } from '../core/providers/openai-provider'
import { CodeIssue, AgentResult } from '../types'

export class IssueCollectorAgent {
  private provider: OpenAIProvider
  private isDemoMode: boolean
  private supportedExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.rs']

  constructor(apiKey: string) {
    this.provider = new OpenAIProvider({ apiKey })
    this.isDemoMode = apiKey === 'demo-mode'
  }

  async run(targetPath: string = './src'): Promise<AgentResult<CodeIssue[]>> {
    const startTime = Date.now()

    try {
      if (!this.isDemoMode && !this.provider.isAvailable) {
        throw new Error('OpenAI provider not available')
      }

      console.log('🔍 Issue Collector Agent starting...')
      console.log(`Target: ${targetPath}`)

      // Find all code files
      const files = this.findCodeFiles(targetPath)
      console.log(`Found ${files.length} code files`)

      // Analyze each file
      const allIssues: CodeIssue[] = []
      
      for (const file of files) {
        console.log(`Analyzing: ${file}`)
        const fileIssues = await this.analyzeFile(file)
        allIssues.push(...fileIssues)
      }

      const executionTime = Date.now() - startTime
      console.log(`✅ Issue collection complete! Found ${allIssues.length} issues`)

      return {
        success: true,
        data: allIssues,
        executionTime,
        aiProvider: this.provider.name,
        timestamp: new Date()
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.error(`❌ Issue collection failed: ${errorMessage}`)
      
      return {
        success: false,
        data: [],
        error: errorMessage,
        executionTime,
        aiProvider: this.provider.name,
        timestamp: new Date()
      }
    }
  }

  private findCodeFiles(targetPath: string): string[] {
    const pattern = path.join(targetPath, '**/*')
    const files = glob.sync(pattern, { nodir: true })
    
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return this.supportedExtensions.includes(ext)
    })
  }

  private async analyzeFile(filePath: string): Promise<CodeIssue[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      
      if (this.isDemoMode) {
        // Use basic analysis in demo mode
        return this.performBasicAnalysis(filePath, lines)
      } else {
        // Analyze with AI
        const aiResponse = await this.provider.analyzeCode(content, filePath)
        
        // Parse AI response
        const parsedIssues = this.parseAIResponse(aiResponse, filePath, lines)
        
        return parsedIssues
      }
    } catch (error) {
      console.warn(`Failed to analyze ${filePath}: ${error}`)
      return []
    }
  }

  private parseAIResponse(aiResponse: string, filePath: string, lines: string[]): CodeIssue[] {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(aiResponse)
      
      if (parsed.issues && Array.isArray(parsed.issues)) {
        return parsed.issues.map((issue: any, index: number) => ({
          id: `issue-${filePath}-${index}-${Date.now()}`,
          type: issue.type || 'warning',
          severity: issue.severity || 'medium',
          message: issue.message || 'Issue detected',
          filePath,
          line: issue.line || 1,
          column: issue.column || 1,
          code: lines[issue.line - 1] || '',
          category: issue.category || 'quality',
          fixable: issue.fixable !== false,
          confidence: issue.confidence || 80,
          aiProvider: this.provider.name,
          timestamp: new Date()
        }))
      }
    } catch (error) {
      console.warn(`Failed to parse AI response: ${error}`)
    }

    // Fallback: basic analysis
    return this.performBasicAnalysis(filePath, lines)
  }

  private performBasicAnalysis(filePath: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1
      
      // Basic pattern matching as fallback
      if (line && line.includes('console.log')) {
        issues.push({
          id: `basic-${filePath}-${lineNumber}-${Date.now()}`,
          type: 'warning',
          severity: 'low',
          message: 'Console.log statement found - consider removing in production',
          filePath,
          line: lineNumber,
          column: 1,
          code: line.trim(),
          category: 'quality',
          fixable: true,
          confidence: 90,
          aiProvider: 'basic-analysis',
          timestamp: new Date()
        })
      }
      
      if (line && (line.includes('TODO:') || line.includes('FIXME:'))) {
        issues.push({
          id: `basic-${filePath}-${lineNumber}-${Date.now()}`,
          type: 'suggestion',
          severity: 'medium',
          message: 'TODO/FIXME comment found - consider addressing',
          filePath,
          line: lineNumber,
          column: 1,
          code: line.trim(),
          category: 'quality',
          fixable: false,
          confidence: 85,
          aiProvider: 'basic-analysis',
          timestamp: new Date()
        })
      }
    }
    
    return issues
  }
}