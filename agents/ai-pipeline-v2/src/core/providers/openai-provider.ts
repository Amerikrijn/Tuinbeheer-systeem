import OpenAI from 'openai'
import { AIProvider } from '../../types'

export class OpenAIProvider implements AIProvider {
  public name = 'OpenAI'
  public type: 'openai' | 'anthropic' | 'github-copilot' = 'openai'
  public config: any
  public isAvailable: boolean = false
  private client: OpenAI | null = null

  constructor(apiKey?: string) {
    this.config = {
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.1')
    }
    
    this.initialize()
  }

  private async initialize() {
    try {
      if (!this.config.apiKey) {
        console.warn('⚠️ OpenAI API key not provided')
        this.isAvailable = false
        return
      }

      this.client = new OpenAI({
        apiKey: this.config.apiKey
      })

      // Test the connection
      await this.client.models.list()
      this.isAvailable = true
      console.log('✅ OpenAI provider initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI provider:', error)
      this.isAvailable = false
    }
  }

  async analyzeCode(code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = this.buildAnalysisPrompt(code, filePath)
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code analyzer. Analyze the provided code and identify potential issues, improvements, and best practices. Return your analysis in a structured format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      return response.choices[0]?.message?.content || 'No analysis generated'
    } catch (error) {
      console.error('❌ OpenAI analysis failed:', error)
      throw new Error(`OpenAI analysis failed: ${error}`)
    }
  }

  async generateCodeFix(issue: string, code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = this.buildFixPrompt(issue, code, filePath)
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code fixer. Generate fixes for the identified issues. Return only the corrected code without explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      return response.choices[0]?.message?.content || 'No fix generated'
    } catch (error) {
      console.error('❌ OpenAI fix generation failed:', error)
      throw new Error(`OpenAI fix generation failed: ${error}`)
    }
  }

  async generateTests(code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = this.buildTestPrompt(code, filePath)
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert test generator. Generate comprehensive tests for the provided code. Return only the test code without explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      return response.choices[0]?.message?.content || 'No tests generated'
    } catch (error) {
      console.error('❌ OpenAI test generation failed:', error)
      throw new Error(`OpenAI test generation failed: ${error}`)
    }
  }

  async validateQuality(code: string, filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = this.buildQualityPrompt(code, filePath)
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code quality validator. Assess the quality of the provided code and provide a score from 0-100 with detailed feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      return response.choices[0]?.message?.content || 'No quality validation generated'
    } catch (error) {
      console.error('❌ OpenAI quality validation failed:', error)
      throw new Error(`OpenAI quality validation failed: ${error}`)
    }
  }

  async callAPI(prompt: string, options?: any): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const systemRole = options?.role || 'assistant'
      const systemContent = this.getSystemContent(systemRole)
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: systemContent
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      return response.choices[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('❌ OpenAI API call failed:', error)
      throw new Error(`OpenAI API call failed: ${error}`)
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