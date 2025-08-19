import Anthropic from '@anthropic-ai/sdk'
import { AIProvider } from '../../types'

export class AnthropicProvider implements AIProvider {
  public name = 'Anthropic'
  public type: 'openai' | 'anthropic' | 'github-copilot' = 'anthropic'
  public config: any
  public isAvailable: boolean = false
  private client: Anthropic | null = null

  constructor(apiKey?: string) {
    this.config = {
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.1')
    }
    
    this.initialize()
  }

  private async initialize() {
    try {
      if (!this.config.apiKey) {
        console.warn('⚠️ Anthropic API key not provided')
        this.isAvailable = false
        return
      }

      this.client = new Anthropic({
        apiKey: this.config.apiKey
      })

      // Test the connection with a simple message
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      })
      
      this.isAvailable = true
      console.log('✅ Anthropic provider initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Anthropic provider:', error)
      this.isAvailable = false
    }
  }

  async analyzeCode(code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Anthropic provider not available')
    }

    try {
      const prompt = this.buildAnalysisPrompt(code, filePath)
      
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      return response.content[0]?.type === 'text' ? response.content[0].text : 'No analysis generated'
    } catch (error) {
      console.error('❌ Anthropic analysis failed:', error)
      throw new Error(`Anthropic analysis failed: ${error}`)
    }
  }

  async generateCodeFix(issue: string, code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Anthropic provider not available')
    }

    try {
      const prompt = this.buildFixPrompt(issue, code, filePath)
      
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      return response.content[0]?.type === 'text' ? response.content[0].text : 'No fix generated'
    } catch (error) {
      console.error('❌ Anthropic fix generation failed:', error)
      throw new Error(`Anthropic fix generation failed: ${error}`)
    }
  }

  async generateTests(code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Anthropic provider not available')
    }

    try {
      const prompt = this.buildTestPrompt(code, filePath)
      
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      return response.content[0]?.type === 'text' ? response.content[0].text : 'No tests generated'
    } catch (error) {
      console.error('❌ Anthropic test generation failed:', error)
      throw new Error(`Anthropic test generation failed: ${error}`)
    }
  }

  async validateQuality(code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Anthropic provider not available')
    }

    try {
      const prompt = this.buildQualityPrompt(code, filePath)
      
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      return response.content[0]?.type === 'text' ? response.content[0].text : 'No quality validation generated'
    } catch (error) {
      console.error('❌ Anthropic quality validation failed:', error)
      throw new Error(`Anthropic quality validation failed: ${error}`)
    }
  }

  async callAPI(prompt: string, options?: any): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Anthropic provider not available')
    }

    try {
      const systemRole = options?.role || 'assistant'
      const systemContent = this.getSystemContent(systemRole)
      
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: `${systemContent}\n\n${prompt}`,
          }
        ]
      })

      return response.content[0]?.type === 'text' ? response.content[0].text : 'No response generated'
    } catch (error) {
      console.error('❌ Anthropic API call failed:', error)
      throw new Error(`Anthropic API call failed: ${error}`)
    }
  }

  private getSystemContent(role: string): string {
    const roleMap: Record<string, string> = {
      'issue-collector': 'You are an expert code analyzer. Analyze the provided code and identify potential issues, improvements, and best practices.',
      'code-fixer': 'You are an expert code fixer. Generate fixes for the identified issues. Return only the corrected code without explanations.',
      'test-generator': 'You are an expert test generator. Generate comprehensive tests for the provided code. Return only the test code without explanations.',
      'quality-validator': 'You are an expert code quality validator. Assess the quality of the provided code and provide a score from 0-100 with detailed feedback.',
      'assistant': 'You are a helpful AI assistant specialized in code analysis and improvement.'
    }
    
    return roleMap[role] || roleMap['assistant']!
  }

  private buildAnalysisPrompt(code: string, filePath: string): string {
    return `Analyze the following code from ${filePath}:

\`\`\`
${code}
\`\`\`

Please identify:
1. Potential bugs or errors
2. Code quality issues
3. Performance improvements
4. Security concerns
5. Best practice violations

Return your analysis in a structured format.`
  }

  private buildFixPrompt(issue: string, code: string, filePath: string): string {
    return `Fix the following issue in ${filePath}:

Issue: ${issue}

Original code:
\`\`\`
${code}
\`\`\`

Please provide the corrected code that addresses the issue.`
  }

  private buildTestPrompt(code: string, filePath: string): string {
    return `Generate comprehensive tests for the following code from ${filePath}:

\`\`\`
${code}
\`\`\`

Please generate:
1. Unit tests
2. Edge case tests
3. Error handling tests
4. Integration tests if applicable

Use Jest or similar testing framework.`
  }

  private buildQualityPrompt(code: string, filePath: string): string {
    return `Assess the quality of the following code from ${filePath}:

\`\`\`
${code}
\`\`\`

Please provide:
1. Quality score (0-100)
2. Detailed feedback
3. Specific improvements
4. Overall assessment

Return in format: Score: X/100, Feedback: ...`
  }
}