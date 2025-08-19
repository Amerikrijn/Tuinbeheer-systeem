import { MLAnalysis, MLPrediction, MLTrainingData, MLValidationResult, MLMetrics, CodeIssue, CodeFix } from './types';
export declare class MachineLearningEngine {
    private modelPath;
    private trainingDataPath;
    private confidenceThreshold;
    private patterns;
    private modelVersion;
    private lastTrained;
    constructor(options?: {
        modelPath?: string;
        trainingDataPath?: string;
        confidenceThreshold?: number;
    });
    /**
     * Analyze code and generate ML-powered predictions
     */
    analyzeCode(sourceCode: string, filePath: string): Promise<MLAnalysis>;
    /**
     * Generate ML-powered fix suggestions
     */
    generateFixSuggestions(issues: CodeIssue[]): Promise<CodeFix[]>;
    /**
     * Train the ML model with new data
     */
    trainModel(trainingData: MLTrainingData[]): Promise<void>;
    /**
     * Validate ML predictions
     */
    validatePrediction(prediction: MLPrediction, actualFix: CodeFix): Promise<MLValidationResult>;
    /**
     * Get ML metrics and performance statistics
     */
    getMetrics(): Promise<MLMetrics>;
    /**
     * Generate predictions for code
     */
    private generatePredictions;
    /**
     * Extract code patterns from source code
     */
    private extractCodePatterns;
    /**
     * Predict fix from a pattern
     */
    private predictFromPattern;
    /**
     * Predict fix for a specific issue
     */
    private predictFixForIssue;
    /**
     * Create fix from ML prediction
     */
    private createFixFromPrediction;
    /**
     * Calculate overall confidence for predictions
     */
    private calculateOverallConfidence;
    /**
     * Calculate pattern confidence
     */
    private calculatePatternConfidence;
    /**
     * Generate suggested fix from pattern and training data
     */
    private generateSuggestedFix;
    /**
     * Check if pattern matches an issue
     */
    private patternMatchesIssue;
    /**
     * Find similar cases for a pattern
     */
    private findSimilarCases;
    /**
     * Calculate similarity between two strings
     */
    private calculateSimilarity;
    /**
     * Calculate Levenshtein distance
     */
    private levenshteinDistance;
    /**
     * Infer issue type from pattern
     */
    private inferIssueType;
    /**
     * Calculate fix success rate
     */
    private calculateFixSuccess;
    /**
     * Check pattern match
     */
    private checkPatternMatch;
    /**
     * Get recommended action
     */
    private getRecommendedAction;
    /**
     * Calculate accuracy
     */
    private calculateAccuracy;
    /**
     * Calculate precision
     */
    private calculatePrecision;
    /**
     * Calculate recall
     */
    private calculateRecall;
    /**
     * Calculate F1 score
     */
    private calculateF1Score;
    /**
     * Increment version number
     */
    private incrementVersion;
    /**
     * Calculate days between dates
     */
    private daysBetween;
    /**
     * Load training data from file
     */
    private loadTrainingData;
    /**
     * Save training data to file
     */
    private saveTrainingData;
    /**
     * Initialize default training patterns
     */
    private initializeDefaultPatterns;
    /**
     * Cleanup resources
     */
    dispose(): void;
}
//# sourceMappingURL=MachineLearningEngine.d.ts.map