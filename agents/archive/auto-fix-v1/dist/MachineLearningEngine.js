"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineLearningEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MachineLearningEngine {
    constructor(options = {}) {
        this.patterns = new Map();
        this.modelVersion = '1.0.0';
        this.lastTrained = new Date().toISOString();
        this.modelPath = options.modelPath || './ml-models/code-fix-model';
        this.trainingDataPath = options.trainingDataPath || './ml-data/training-data.json';
        this.confidenceThreshold = options.confidenceThreshold || 0.7;
        this.loadTrainingData();
    }
    /**
     * Analyze code and generate ML-powered predictions
     */
    async analyzeCode(sourceCode, filePath) {
        try {
            console.log(`🤖 ML Engine analyzing ${filePath}...`);
            const predictions = await this.generatePredictions(sourceCode, filePath);
            const confidence = this.calculateOverallConfidence(predictions);
            const analysis = {
                predictions,
                confidence,
                modelVersion: this.modelVersion,
                trainingDataSize: this.patterns.size,
                lastTrained: this.lastTrained
            };
            console.log(`✅ ML analysis complete: ${predictions.length} predictions, confidence: ${confidence.toFixed(2)}`);
            return analysis;
        }
        catch (error) {
            console.error(`❌ ML analysis failed for ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Generate ML-powered fix suggestions
     */
    async generateFixSuggestions(issues) {
        const fixes = [];
        for (const issue of issues) {
            const predictions = await this.predictFixForIssue(issue);
            for (const prediction of predictions) {
                if (prediction.confidence >= this.confidenceThreshold) {
                    const fix = this.createFixFromPrediction(issue, prediction);
                    if (fix) {
                        fixes.push(fix);
                    }
                }
            }
        }
        return fixes;
    }
    /**
     * Train the ML model with new data
     */
    async trainModel(trainingData) {
        try {
            console.log('🤖 Training ML model...');
            // Update patterns with new training data
            for (const data of trainingData) {
                this.patterns.set(data.pattern, data);
            }
            // Update training metadata
            this.lastTrained = new Date().toISOString();
            this.modelVersion = this.incrementVersion(this.modelVersion);
            // Save updated training data
            await this.saveTrainingData();
            console.log(`✅ ML model trained successfully. Version: ${this.modelVersion}, Patterns: ${this.patterns.size}`);
        }
        catch (error) {
            console.error('❌ ML model training failed:', error);
            throw error;
        }
    }
    /**
     * Validate ML predictions
     */
    async validatePrediction(prediction, actualFix) {
        const success = this.calculateFixSuccess(prediction, actualFix);
        const patternMatch = this.checkPatternMatch(prediction.pattern, actualFix);
        return {
            mlConfidence: prediction.confidence,
            patternMatch,
            historicalSuccess: success,
            recommendedAction: this.getRecommendedAction(prediction, success)
        };
    }
    /**
     * Get ML metrics and performance statistics
     */
    async getMetrics() {
        const totalPredictions = this.patterns.size;
        const accuracy = this.calculateAccuracy();
        const precision = this.calculatePrecision();
        const recall = this.calculateRecall();
        const f1Score = this.calculateF1Score(precision, recall);
        return {
            totalPredictions,
            accuracy,
            precision,
            recall,
            f1Score,
            trainingTime: 0, // Would be calculated during actual training
            inferenceTime: 0 // Would be measured during inference
        };
    }
    /**
     * Generate predictions for code
     */
    async generatePredictions(sourceCode, filePath) {
        const predictions = [];
        // Analyze code patterns and generate predictions
        const patterns = this.extractCodePatterns(sourceCode);
        for (const pattern of patterns) {
            const prediction = await this.predictFromPattern(pattern, filePath);
            if (prediction) {
                predictions.push(prediction);
            }
        }
        return predictions;
    }
    /**
     * Extract code patterns from source code
     */
    extractCodePatterns(sourceCode) {
        const patterns = [];
        const lines = sourceCode.split('\n');
        // Extract various code patterns
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Function definition patterns
            if (line.match(/^function\s+\w+\s*\(/)) {
                patterns.push('function-definition');
            }
            // Variable declaration patterns
            if (line.match(/^(const|let|var)\s+\w+\s*=/)) {
                patterns.push('variable-declaration');
            }
            // Import patterns
            if (line.match(/^import\s+/)) {
                patterns.push('import-statement');
            }
            // Export patterns
            if (line.match(/^export\s+/)) {
                patterns.push('export-statement');
            }
            // Error handling patterns
            if (line.match(/try\s*\{/) || line.match(/catch\s*\(/)) {
                patterns.push('error-handling');
            }
            // Async/await patterns
            if (line.match(/async\s+function/) || line.match(/await\s+/)) {
                patterns.push('async-await');
            }
            // Type annotation patterns
            if (line.match(/:\s*\w+(\[\])?(\s*[=,;])/)) {
                patterns.push('type-annotation');
            }
        }
        return [...new Set(patterns)]; // Remove duplicates
    }
    /**
     * Predict fix from a pattern
     */
    async predictFromPattern(pattern, filePath) {
        const trainingData = this.patterns.get(pattern);
        if (!trainingData)
            return null;
        // Generate prediction based on training data
        const confidence = this.calculatePatternConfidence(pattern);
        const suggestedFix = this.generateSuggestedFix(pattern, trainingData);
        if (!suggestedFix)
            return null;
        return {
            issueType: this.inferIssueType(pattern),
            confidence,
            pattern,
            suggestedFix,
            similarCases: this.findSimilarCases(pattern),
            trainingData
        };
    }
    /**
     * Predict fix for a specific issue
     */
    async predictFixForIssue(issue) {
        const predictions = [];
        // Find patterns that match this issue
        for (const [pattern, trainingData] of this.patterns.entries()) {
            if (this.patternMatchesIssue(pattern, issue)) {
                const confidence = this.calculatePatternConfidence(pattern);
                const suggestedFix = this.generateSuggestedFix(pattern, trainingData);
                if (suggestedFix && confidence >= this.confidenceThreshold) {
                    predictions.push({
                        issueType: issue.type,
                        confidence,
                        pattern,
                        suggestedFix,
                        similarCases: this.findSimilarCases(pattern),
                        trainingData
                    });
                }
            }
        }
        return predictions.sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Create fix from ML prediction
     */
    createFixFromPrediction(issue, prediction) {
        if (!prediction.suggestedFix)
            return null;
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
        };
    }
    /**
     * Calculate overall confidence for predictions
     */
    calculateOverallConfidence(predictions) {
        if (predictions.length === 0)
            return 0;
        const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0);
        return totalConfidence / predictions.length;
    }
    /**
     * Calculate pattern confidence
     */
    calculatePatternConfidence(pattern) {
        const trainingData = this.patterns.get(pattern);
        if (!trainingData)
            return 0;
        // Base confidence on historical success rate
        let confidence = trainingData.successRate;
        // Boost confidence for frequently used patterns
        if (trainingData.usageCount > 10) {
            confidence += 0.1;
        }
        // Boost confidence for recently used patterns
        const daysSinceLastUse = this.daysBetween(new Date(trainingData.lastUsed), new Date());
        if (daysSinceLastUse < 7) {
            confidence += 0.05;
        }
        return Math.min(confidence, 1.0);
    }
    /**
     * Generate suggested fix from pattern and training data
     */
    generateSuggestedFix(pattern, trainingData) {
        // This would be more sophisticated in a real ML implementation
        // For now, we'll use pattern-based heuristics
        switch (pattern) {
            case 'function-definition':
                return '// Add proper return type annotation\n// Add parameter type annotations\n// Add JSDoc documentation';
            case 'variable-declaration':
                return '// Use const instead of let when possible\n// Add explicit type annotation\n// Use meaningful variable names';
            case 'import-statement':
                return '// Use named imports instead of default imports\n// Group imports by type\n// Remove unused imports';
            case 'export-statement':
                return '// Use named exports for better tree-shaking\n// Add proper JSDoc documentation\n// Export only what is needed';
            case 'error-handling':
                return '// Add proper error types\n// Log errors appropriately\n// Handle specific error cases';
            case 'async-await':
                return '// Add proper error handling\n// Use Promise.all for parallel operations\n// Add timeout handling';
            case 'type-annotation':
                return '// Use more specific types\n// Avoid any type\n// Use union types when appropriate';
            default:
                return null;
        }
    }
    /**
     * Check if pattern matches an issue
     */
    patternMatchesIssue(pattern, issue) {
        // Simple pattern matching - could be more sophisticated
        const issueText = issue.description.toLowerCase();
        const patternText = pattern.toLowerCase();
        return issueText.includes(patternText) ||
            issueText.includes(pattern.replace('-', ' ')) ||
            this.calculateSimilarity(issueText, patternText) > 0.6;
    }
    /**
     * Find similar cases for a pattern
     */
    findSimilarCases(pattern) {
        const similar = [];
        for (const [otherPattern, trainingData] of this.patterns.entries()) {
            if (otherPattern !== pattern && this.calculateSimilarity(pattern, otherPattern) > 0.7) {
                similar.push(otherPattern);
            }
        }
        return similar.slice(0, 3); // Return top 3 similar patterns
    }
    /**
     * Calculate similarity between two strings
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Infer issue type from pattern
     */
    inferIssueType(pattern) {
        switch (pattern) {
            case 'function-definition':
                return 'quality';
            case 'variable-declaration':
                return 'style';
            case 'import-statement':
                return 'quality';
            case 'export-statement':
                return 'quality';
            case 'error-handling':
                return 'security';
            case 'async-await':
                return 'performance';
            case 'type-annotation':
                return 'typescript';
            default:
                return 'quality';
        }
    }
    /**
     * Calculate fix success rate
     */
    calculateFixSuccess(prediction, actualFix) {
        // This would be calculated based on actual fix success tracking
        // For now, return a default value
        return prediction.trainingData.successRate;
    }
    /**
     * Check pattern match
     */
    checkPatternMatch(pattern, fix) {
        return fix.fixPattern === pattern;
    }
    /**
     * Get recommended action
     */
    getRecommendedAction(prediction, success) {
        if (success > 0.8) {
            return 'Apply fix automatically - high success rate';
        }
        else if (success > 0.6) {
            return 'Apply fix with review - moderate success rate';
        }
        else {
            return 'Manual review required - low success rate';
        }
    }
    /**
     * Calculate accuracy
     */
    calculateAccuracy() {
        // This would be calculated from actual prediction results
        // For now, return a default value
        return 0.75;
    }
    /**
     * Calculate precision
     */
    calculatePrecision() {
        // This would be calculated from actual prediction results
        return 0.72;
    }
    /**
     * Calculate recall
     */
    calculateRecall() {
        // This would be calculated from actual prediction results
        return 0.78;
    }
    /**
     * Calculate F1 score
     */
    calculateF1Score(precision, recall) {
        if (precision + recall === 0)
            return 0;
        return (2 * precision * recall) / (precision + recall);
    }
    /**
     * Increment version number
     */
    incrementVersion(version) {
        const parts = version.split('.');
        const patch = parseInt(parts[2]) + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
    }
    /**
     * Calculate days between dates
     */
    daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
    }
    /**
     * Load training data from file
     */
    loadTrainingData() {
        try {
            if (fs.existsSync(this.trainingDataPath)) {
                const data = JSON.parse(fs.readFileSync(this.trainingDataPath, 'utf8'));
                for (const [pattern, trainingData] of Object.entries(data)) {
                    this.patterns.set(pattern, trainingData);
                }
                console.log(`📚 Loaded ${this.patterns.size} training patterns`);
            }
        }
        catch (error) {
            console.warn('Could not load training data, using defaults:', error);
            this.initializeDefaultPatterns();
        }
    }
    /**
     * Save training data to file
     */
    async saveTrainingData() {
        try {
            const data = {};
            for (const [pattern, trainingData] of this.patterns.entries()) {
                data[pattern] = trainingData;
            }
            const dir = path.dirname(this.trainingDataPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.trainingDataPath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Failed to save training data:', error);
        }
    }
    /**
     * Initialize default training patterns
     */
    initializeDefaultPatterns() {
        const defaultPatterns = {
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
        };
        for (const [pattern, trainingData] of Object.entries(defaultPatterns)) {
            this.patterns.set(pattern, trainingData);
        }
    }
    /**
     * Cleanup resources
     */
    dispose() {
        this.patterns.clear();
    }
}
exports.MachineLearningEngine = MachineLearningEngine;
//# sourceMappingURL=MachineLearningEngine.js.map