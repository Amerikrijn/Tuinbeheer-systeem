import OpenAI from 'openai'

export interface AIProvider {
  name: string
  isAvailable: boolean
  analyzeCode(content: string, filePath: string): Promise<string>
  generateTests(issues: any[]): Promise<string>
  fixCode(issues: any[]): Promise<string>
  validateQuality(issues: any[], fixes: any[]): Promise<string>
}

export class OpenAIProvider implements AIProvider {
  public name = 'OpenAI'
  private client!: OpenAI
  public isAvailable: boolean

  constructor(apiKey: string) {
    if (!apiKey) {
      this.isAvailable = false
      console.warn('⚠️ OpenAI API key not provided')
      return
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey,
      })
      this.isAvailable = true
      console.log('✅ OpenAI provider initialized successfully')
    } catch (error) {
      this.isAvailable = false
      console.error('❌ Failed to initialize OpenAI provider:', error)
    }
  }

  async analyzeCode(content: string, filePath: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = `Analyze this code file for potential issues, bugs, and improvements:

File: ${filePath}
Content:
\`\`\`
${content}
\`\`\`

Please identify:
1. Code quality issues
2. Potential bugs
3. Performance improvements
4. Security concerns
5. Best practice violations

Return your analysis in JSON format:
{
  "issues": [
    {
      "type": "bug|quality|performance|security|best-practice",
      "severity": "low|medium|high|critical",
      "line": number,
      "message": "description",
      "suggestion": "how to fix"
    }
  ]
}`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer and static analysis tool. Analyze the provided code and identify issues.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })

      return response.choices[0]?.message?.content || '{}'
    } catch (error) {
      console.error('❌ OpenAI API call failed:', error)
      return '{"issues": []}'
    }
  }

  async generateTests(issues: any[]): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = `Generate comprehensive test cases for the following code issues:

Issues: ${JSON.stringify(issues, null, 2)}

Please generate test cases that:
1. Cover all identified issues
2. Test edge cases
3. Include positive and negative test scenarios
4. Follow testing best practices

Return your response in JSON format:
{
  "testSuites": [
    {
      "name": "test suite name",
      "description": "what this test suite covers",
      "tests": [
        {
          "name": "test name",
          "description": "test description",
          "code": "actual test code"
        }
      ]
    }
  ]
}`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert test engineer. Generate comprehensive test cases for the identified code issues.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })

      return response.choices[0]?.message?.content || '{}'
    } catch (error) {
      console.error('❌ OpenAI API call failed:', error)
      return '{"testSuites": []}'
    }
  }

  async fixCode(issues: any[]): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = `Fix the following code issues:

Issues: ${JSON.stringify(issues, null, 2)}

Please provide fixes that:
1. Resolve all identified issues
2. Maintain code quality and readability
3. Follow best practices
4. Include explanations for changes

Return your response in JSON format:
{
  "fixes": [
    {
      "issueId": "reference to original issue",
      "filePath": "path to file",
      "originalCode": "original problematic code",
      "fixedCode": "corrected code",
      "explanation": "what was fixed and why"
    }
  ]
}`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer. Fix the identified code issues while maintaining code quality.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
      })

      return response.choices[0]?.message?.content || '{}'
    } catch (error) {
      console.error('❌ OpenAI API call failed:', error)
      return '{"fixes": []}'
    }
  }

  async validateQuality(issues: any[], fixes: any[]): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('OpenAI provider not available')
    }

    try {
      const prompt = `Validate the quality of the fixes applied to resolve these issues:

Original Issues: ${JSON.stringify(issues, null, 2)}
Applied Fixes: ${JSON.stringify(fixes, null, 2)}

Please assess:
1. Whether all issues were properly addressed
2. The quality of the fixes
3. Any new issues introduced
4. Overall code quality improvement

Return your response in JSON format:
{
  "score": 85,
  "assessment": "overall quality assessment",
  "issuesResolved": 5,
  "newIssues": 0,
  "qualityImprovement": "description of improvements",
  "recommendations": ["additional suggestions"]
}`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code quality analyst. Assess the quality of code fixes and provide a comprehensive evaluation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })

      return response.choices[0]?.message?.content || '{}'
    } catch (error) {
      console.error('❌ OpenAI API call failed:', error)
      return '{"score": 0, "assessment": "validation failed"}'
    }
  }
}