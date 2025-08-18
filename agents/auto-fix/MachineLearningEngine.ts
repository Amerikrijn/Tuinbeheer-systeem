import * as fs from 'fs'
import * as path from 'path'
import { 
  MLAnalysis, 
  MLPrediction, 
  MLTrainingData, 
  MLValidationResult, 
  MLMetrics,
  CodeIssue,
  CodeFix
} from './types'

export class MachineLearningEngine {
  private modelPath: string
  private trainingDataPath: string
  private confidenceThreshold: number
  private patterns: Map<string, MLTrainingData> = new Map()
  private modelVersion: string = '1.0.0'
  private lastTrained: string = new Date().toISOString()

  constructor(options: {
    modelPath?: string
    trainingDataPath?: string
    confidenceThreshold?: number
  } = {}) {
    this.modelPath = options.modelPath || './ml-models/code-fix-model'
    this.trainingDataPath = options.trainingDataPath || './ml-data/training-data.json'
    this.confidenceThreshold = options.confidenceThreshold || 0.7
    
    this.loadTrainingData()
  }

  /**
   * Analyze code and generate ML-powered predictions
   */
  async analyzeCode(sourceCode: string, filePath: string): Promise<MLAnalysis> {
    try {
      console.log(`🤖 ML Engine analyzing ${filePath}...`)
      
      const predictions = await this.generatePredictions(sourceCode, filePath)
      const confidence = this.calculateOverallConfidence(predictions)
      
      const analysis: MLAnalysis = {
        predictions,
        confidence,
        modelVersion: this.modelVersion,
        trainingDataSize: this.patterns.size,
        lastTrained: this.lastTrained
      }

      console.log(`✅ ML analysis complete: ${predictions.length} predictions, confidence: ${confidence.toFixed(2)}`)
      return analysis

    } catch (error) {
      console.error(`❌ ML analysis failed for ${filePath}:`, error)
      throw error
    }
  }

  /**
   * Generate ML-powered fix suggestions
   */
  async generateFixSuggestions(issues: CodeIssue[]): Promise<CodeFix[]> {
    const fixes: CodeFix[] = []

    for (const issue of issues) {
      const predictions = await this.predictFixForIssue(issue)
      
      for (const prediction of predictions) {
        if (prediction.confidence >= this.confidenceThreshold) {
          const fix = this.createFixFromPrediction(issue, prediction)
          if (fix) {
            fixes.push(fix)
          }
        }
      }
    }

    return fixes
  }

  /**
   * Train the ML model with new data
   */
  async trainModel(trainingData: MLTrainingData[]): Promise<void> {
    try {
      console.log('🤖 Training ML model...')
      
      // Update patterns with new training data
      for (const data of trainingData) {
        this.patterns.set(data.pattern, data)
      }
      
      // Update training metadata
      this.lastTrained = new Date().toISOString()
      this.modelVersion = this.incrementVersion(this.modelVersion)
      
      // Save updated training data
      await this.saveTrainingData()
      
      console.log(`✅ ML model trained successfully. Version: ${this.modelVersion}, Patterns: ${this.patterns.size}`)
      
    } catch (error) {
      console.error('❌ ML model training failed:', error)
      throw error
    }
  }

  /**
   * Validate ML predictions
   */
  async validatePrediction(prediction: MLPrediction, actualFix: CodeFix): Promise<MLValidationResult> {
    const success = this.calculateFixSuccess(prediction, actualFix)
    const patternMatch = this.checkPatternMatch(prediction.pattern, actualFix)
    
    return {
      mlConfidence: prediction.confidence,
      patternMatch,
      historicalSuccess: success,
      recommendedAction: this.getRecommendedAction(prediction, success)
    }
  }

  /**
   * Get ML metrics and performance statistics
   */
  async getMetrics(): Promise<MLMetrics> {
    const totalPredictions = this.patterns.size
    const accuracy = this.calculateAccuracy()
    const precision = this.calculatePrecision()
    const recall = this.calculateRecall()
    const f1Score = this.calculateF1Score(precision, recall)
    
    return {
      totalPredictions,
      accuracy,
      precision,
      recall,
      f1Score,
      trainingTime: 0, // Would be calculated during actual training
      inferenceTime: 0  // Would be measured during inference
    }
  }

  /**
   * Generate predictions for code
   */
  private async generatePredictions(sourceCode: string, filePath: string): Promise<MLPrediction[]> {
    const predictions: MLPrediction[] = []
    
    // Analyze code patterns and generate predictions
    const patterns = this.extractCodePatterns(sourceCode)
    
    for (const pattern of patterns) {
      const prediction = await this.predictFromPattern(pattern, filePath)
      if (prediction) {
        predictions.push(prediction)
      }
    }
    
    return predictions
  }

  /**
   * Extract code patterns from source code
   */
  private extractCodePatterns(sourceCode: string): string[] {
    const patterns: string[] = []
    const lines = sourceCode.split('\n')
    
    // Extract various code patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Function definition patterns
      if (line.match(/^function\s+\w+\s*\(/)) {
        patterns.push('function-definition')
      }
      
      // Variable declaration patterns
      if (line.match(/^(const|let|var)\s+\w+\s*=/)) {
        patterns.push('variable-declaration')
      }
      
      // Import patterns
      if (line.match(/^import\s+/)) {
        patterns.push('import-statement')
      }
      
      // Export patterns
      if (line.match(/^export\s+/)) {
        patterns.push('export-statement')
      }
      
      // Error handling patterns
      if (line.match(/try\s*\{/) || line.match(/catch\s*\(/)) {
        patterns.push('error-handling')
      }
      
      // Async/await patterns
      if (line.match(/async\s+function/) || line.match(/await\s+/)) {
        patterns.push('async-await')
      }
      
      // Type annotation patterns
      if (line.match(/:\s*\w+(\[\])?(\s*[=,;])/)) {
        patterns.push('type-annotation')
      }
    }
    
    return [...new Set(patterns)] // Remove duplicates
  }

  /**
   * Predict fix from a pattern
   */
  private async predictFromPattern(pattern: string, filePath: string): Promise<MLPrediction | null> {
    const trainingData = this.patterns.get(pattern)
    if (!trainingData) return null
    
    // Generate prediction based on training data
    const confidence = this.calculatePatternConfidence(pattern)
    const suggestedFix = this.generateSuggestedFix(pattern, trainingData)
    
    if (!suggestedFix) return null
    
    return {
      issueType: this.inferIssueType(pattern),
      confidence,
      pattern,
      suggestedFix,
      similarCases: this.findSimilarCases(pattern),
      trainingData
    }
  }

  /**
   * Predict fix for a specific issue
   */
  private async predictFixForIssue(issue: CodeIssue): Promise<MLPrediction[]> {
    const predictions: MLPrediction[] = []
    
    // Find patterns that match this issue
    for (const [pattern, trainingData] of this.patterns.entries()) {
      if (this.patternMatchesIssue(pattern, issue)) {
        const confidence = this.calculatePatternConfidence(pattern)
        const suggestedFix = this.generateSuggestedFix(pattern, trainingData)
        
        if (suggestedFix && confidence >= this.confidenceThreshold) {
          predictions.push({
            issueType: issue.type,
            confidence,
            pattern,
            suggestedFix,
            similarCases: this.findSimilarCases(pattern),
            trainingData
          })
        }
      }
    }
    
    return predictions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Create fix from ML prediction
   */
  private createFixFromPrediction(issue: CodeIssue, prediction: MLPrediction): CodeFix | null {
    if (!prediction.suggestedFix) return null
    
    return {
      id: `ml-${prediction.pattern}-${issue.id}`,
      filePath: issue.filePath,
      lineNumber: issue.lineNumber,
      issueType: issue.type,
      severity: issue.severity,
      description: `ML-suggested fix for ${issue.description}`,
      originalCode: issue.code,
      fixedCode: prediction.suggestedFix,
      confidence: prediction.confidence,
      validationRules: [{
        type: 'ml',
        condition: 'ML prediction confidence threshold met',
        message: `ML confidence: ${prediction.confidence.toFixed(2)}`
      }],
      dependencies: [],
      estimatedEffort: 'low',
      risk: 'low',
      tags: ['ml', prediction.pattern, 'ai-suggested'],
      createdAt: new Date().toISOString(),
      mlConfidence: prediction.confidence,
      fixPattern: prediction.pattern
    }
  }

  /**
   * Calculate overall confidence for predictions
   */
  private calculateOverallConfidence(predictions: MLPrediction[]): number {
    if (predictions.length === 0) return 0
    
    const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0)
    return totalConfidence / predictions.length
  }

  /**
   * Calculate pattern confidence
   */
  private calculatePatternConfidence(pattern: string): number {
    const trainingData = this.patterns.get(pattern)
    if (!trainingData) return 0
    
    // Base confidence on historical success rate
    let confidence = trainingData.successRate
    
    // Boost confidence for frequently used patterns
    if (trainingData.usageCount > 10) {
      confidence += 0.1
    }
    
    // Boost confidence for recently used patterns
    const daysSinceLastUse = this.daysBetween(new Date(trainingData.lastUsed), new Date())
    if (daysSinceLastUse < 7) {
      confidence += 0.05
    }
    
    return Math.min(confidence, 1.0)
  }

  /**
   * Generate suggested fix from pattern and training data
   */
  private generateSuggestedFix(pattern: string, trainingData: MLTrainingData): string | null {
    // This would be more sophisticated in a real ML implementation
    // For now, we'll use pattern-based heuristics
    
    switch (pattern) {
      case 'function-definition':
        return '// Add proper return type annotation\n// Add parameter type annotations\n// Add JSDoc documentation'
      
      case 'variable-declaration':
        return '// Use const instead of let when possible\n// Add explicit type annotation\n// Use meaningful variable names'
      
      case 'import-statement':
        return '// Use named imports instead of default imports\n// Group imports by type\n// Remove unused imports'
      
      case 'export-statement':
        return '// Use named exports for better tree-shaking\n// Add proper JSDoc documentation\n// Export only what is needed'
      
      case 'error-handling':
        return '// Add proper error types\n// Log errors appropriately\n// Handle specific error cases'
      
      case 'async-await':
        return '// Add proper error handling\n// Use Promise.all for parallel operations\n// Add timeout handling'
      
      case 'type-annotation':
        return '// Use more specific types\n// Avoid any type\n// Use union types when appropriate'
      
      default:
        return null
    }
  }

  /**
   * Check if pattern matches an issue
   */
  private patternMatchesIssue(pattern: string, issue: CodeIssue): boolean {
    // Simple pattern matching - could be more sophisticated
    const issueText = issue.description.toLowerCase()
    const patternText = pattern.toLowerCase()
    
    return issueText.includes(patternText) || 
           issueText.includes(pattern.replace('-', ' ')) ||
           this.calculateSimilarity(issueText, patternText) > 0.6
  }

  /**
   * Find similar cases for a pattern
   */
  private findSimilarCases(pattern: string): string[] {
    const similar: string[] = []
    
    for (const [otherPattern, trainingData] of this.patterns.entries()) {
      if (otherPattern !== pattern && this.calculateSimilarity(pattern, otherPattern) > 0.7) {
        similar.push(otherPattern)
      }
    }
    
    return similar.slice(0, 3) // Return top 3 similar patterns
  }

  /**
   * Calculate similarity between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Infer issue type from pattern
   */
  private inferIssueType(pattern: string): string {
    switch (pattern) {
      case 'function-definition':
        return 'quality'
      case 'variable-declaration':
        return 'style'
      case 'import-statement':
        return 'quality'
      case 'export-statement':
        return 'quality'
      case 'error-handling':
        return 'security'
      case 'async-await':
        return 'performance'
      case 'type-annotation':
        return 'typescript'
      default:
        return 'quality'
    }
  }

  /**
   * Calculate fix success rate
   */
  private calculateFixSuccess(prediction: MLPrediction, actualFix: CodeFix): number {
    // This would be calculated based on actual fix success tracking
    // For now, return a default value
    return prediction.trainingData.successRate
  }

  /**
   * Check pattern match
   */
  private checkPatternMatch(pattern: string, fix: CodeFix): boolean {
    return fix.fixPattern === pattern
  }

  /**
   * Get recommended action
   */
  private getRecommendedAction(prediction: MLPrediction, success: number): string {
    if (success > 0.8) {
      return 'Apply fix automatically - high success rate'
    } else if (success > 0.6) {
      return 'Apply fix with review - moderate success rate'
    } else {
      return 'Manual review required - low success rate'
    }
  }

  /**
   * Calculate accuracy
   */
  private calculateAccuracy(): number {
    // This would be calculated from actual prediction results
    // For now, return a default value
    return 0.75
  }

  /**
   * Calculate precision
   */
  private calculatePrecision(): number {
    // This would be calculated from actual prediction results
    return 0.72
  }

  /**
   * Calculate recall
   */
  private calculateRecall(): number {
    // This would be calculated from actual prediction results
    return 0.78
  }

  /**
   * Calculate F1 score
   */
  private calculateF1Score(precision: number, recall: number): number {
    if (precision + recall === 0) return 0
    return (2 * precision * recall) / (precision + recall)
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.')
    const patch = parseInt(parts[2]) + 1
    return `${parts[0]}.${parts[1]}.${patch}`
  }

  /**
   * Calculate days between dates
   */
  private daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
  }

  /**
   * Load training data from file
   */
  private loadTrainingData(): void {
    try {
      if (fs.existsSync(this.trainingDataPath)) {
        const data = JSON.parse(fs.readFileSync(this.trainingDataPath, 'utf8'))
        for (const [pattern, trainingData] of Object.entries(data)) {
          this.patterns.set(pattern, trainingData as MLTrainingData)
        }
        console.log(`📚 Loaded ${this.patterns.size} training patterns`)
      }
    } catch (error) {
      console.warn('Could not load training data, using defaults:', error)
      this.initializeDefaultPatterns()
    }
  }

  /**
   * Save training data to file
   */
  private async saveTrainingData(): Promise<void> {
    try {
      const data: Record<string, MLTrainingData> = {}
      for (const [pattern, trainingData] of this.patterns.entries()) {
        data[pattern] = trainingData
      }
      
      const dir = path.dirname(this.trainingDataPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(this.trainingDataPath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Failed to save training data:', error)
    }
  }

  /**
   * Initialize default training patterns
   */
  private initializeDefaultPatterns(): void {
    const defaultPatterns: Record<string, MLTrainingData> = {
      'function-definition': {
        source: 'default',
        pattern: 'function-definition',
        successRate: 0.8,
        usageCount: 15,
        lastUsed: new Date().toISOString()
      },
      'variable-declaration': {
        source: 'default',
        pattern: 'variable-declaration',
        successRate: 0.9,
        usageCount: 25,
        lastUsed: new Date().toISOString()
      },
      'import-statement': {
        source: 'default',
        pattern: 'import-statement',
        successRate: 0.85,
        usageCount: 20,
        lastUsed: new Date().toISOString()
      }
    }
    
    for (const [pattern, trainingData] of Object.entries(defaultPatterns)) {
      this.patterns.set(pattern, trainingData)
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.patterns.clear()
  }
}