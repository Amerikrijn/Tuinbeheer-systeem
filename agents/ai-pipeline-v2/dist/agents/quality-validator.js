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
exports.QualityValidatorAgent = void 0;
const fs = __importStar(require("fs"));
class QualityValidatorAgent {
    constructor(openaiProvider) {
        this.provider = openaiProvider;
    }
    async run(issues, fixes) {
        const startTime = Date.now();
        try {
            console.log('✅ Quality Validator Agent starting...');
            console.log(`Issues to validate: ${issues.length}`);
            console.log(`Fixes to validate: ${fixes.length}`);
            if (issues.length === 0 && fixes.length === 0) {
                console.log('✅ No issues or fixes to validate');
                return this.createResult({
                    id: `validation-${Date.now()}`,
                    fixes: [],
                    score: 100,
                    issues: [],
                    recommendations: ['No issues found - code is perfect!'],
                    aiProvider: this.provider.name,
                    timestamp: new Date()
                }, startTime);
            }
            // Validate fixes
            const validatedFixes = await this.validateFixes(fixes);
            // Assess overall quality
            const qualityScore = this.calculateQualityScore(issues, validatedFixes);
            // Generate recommendations
            const recommendations = this.generateRecommendations(issues, validatedFixes, qualityScore);
            // Create validation result
            const validation = {
                id: `validation-${Date.now()}`,
                fixes: validatedFixes,
                score: qualityScore,
                issues: issues,
                recommendations,
                aiProvider: this.provider.name,
                timestamp: new Date()
            };
            const executionTime = Date.now() - startTime;
            console.log(`✅ Quality validation complete! Score: ${qualityScore.toFixed(1)}%`);
            return this.createResult(validation, startTime, executionTime);
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Quality validation failed: ${errorMessage}`);
            return this.createResult({
                id: `validation-error-${Date.now()}`,
                fixes: [],
                score: 0,
                issues: [],
                recommendations: ['Validation failed due to error'],
                aiProvider: this.provider.name,
                timestamp: new Date()
            }, startTime, executionTime, errorMessage);
        }
    }
    async validateFixes(fixes) {
        const validatedFixes = [];
        for (const fix of fixes) {
            try {
                console.log(`✅ Validating fix: ${fix.description}`);
                // AI validation
                const isValid = await this.validateAIFix(fix);
                if (isValid) {
                    validatedFixes.push(fix);
                    console.log(`✅ AI validated fix: ${fix.description}`);
                }
                else {
                    console.log(`❌ AI rejected fix: ${fix.description}`);
                }
            }
            catch (error) {
                console.warn(`⚠️ Failed to validate fix: ${error}`);
            }
        }
        return validatedFixes;
    }
    // Demo validation functie verwijderd - alleen echte AI validation
    async validateAIFix(fix) {
        try {
            // Read the file to get context
            const fileContent = fs.readFileSync(fix.filePath, 'utf-8');
            // AI validation prompt
            const prompt = `Validate this code fix:

Original Issue: ${fix.description}
Before: ${fix.before}
After: ${fix.after}
Risk: ${fix.risk}
Confidence: ${fix.confidence}%

File Context:
${fileContent}

Please provide a JSON response with:
- isValid: boolean (true if fix is good, false if problematic)
- reason: string explaining the validation decision
- suggestions: array of improvement suggestions

Focus on:
- Does the fix solve the original issue?
- Is the fix safe and maintainable?
- Are there any unintended side effects?`;
            const aiResponse = await this.provider.validateQuality([fix], []);
            // Parse AI response
            const parsed = this.parseAIResponse(aiResponse);
            return parsed?.isValid || false;
        }
        catch (error) {
            console.warn(`AI validation failed: ${error}`);
            return false; // No fallback, AI validation required
        }
    }
    calculateQualityScore(issues, validatedFixes) {
        if (issues.length === 0)
            return 100;
        let totalScore = 0;
        let maxScore = issues.length * 100;
        // Calculate base score from remaining issues
        for (const issue of issues) {
            let issueScore = 100;
            // Reduce score based on severity
            switch (issue.severity) {
                case 'critical':
                    issueScore -= 80;
                    break;
                case 'high':
                    issueScore -= 60;
                    break;
                case 'medium':
                    issueScore -= 30;
                    break;
                case 'low':
                    issueScore -= 10;
                    break;
            }
            // Reduce score based on confidence
            issueScore -= (100 - issue.confidence) * 0.5;
            totalScore += Math.max(0, issueScore);
        }
        // Bonus points for successful fixes
        const fixBonus = validatedFixes.length * 5;
        totalScore += fixBonus;
        // Calculate final percentage
        const finalScore = Math.round((totalScore / maxScore) * 100);
        return Math.min(finalScore, 100); // Cap at 100%
    }
    calculateRiskScore(fix) {
        // Convert risk level to numeric score
        switch (fix.risk) {
            case 'low':
                return 0.2;
            case 'medium':
                return 0.5;
            case 'high':
                return 0.8;
            default:
                return 0.5;
        }
    }
    generateRecommendations(issues, fixes, qualityScore) {
        const recommendations = [];
        // Quality-based recommendations
        if (qualityScore < 50) {
            recommendations.push('Code quality is critically low - immediate attention required');
            recommendations.push('Focus on high-severity issues first');
        }
        else if (qualityScore < 70) {
            recommendations.push('Code quality needs improvement - prioritize medium-severity issues');
        }
        else if (qualityScore < 90) {
            recommendations.push('Code quality is good but can be improved');
        }
        else {
            recommendations.push('Code quality is excellent!');
        }
        // Issue-specific recommendations
        const securityIssues = issues.filter(i => i.category === 'security');
        if (securityIssues.length > 0) {
            recommendations.push(`Address ${securityIssues.length} security issues to improve code safety`);
        }
        const performanceIssues = issues.filter(i => i.category === 'performance');
        if (performanceIssues.length > 0) {
            recommendations.push(`Fix ${performanceIssues.length} performance issues to improve code efficiency`);
        }
        const typescriptIssues = issues.filter(i => i.category === 'typescript');
        if (typescriptIssues.length > 0) {
            recommendations.push(`Resolve ${typescriptIssues.length} TypeScript issues to improve type safety`);
        }
        // Fix-based recommendations
        if (fixes.length > 0) {
            const successfulFixes = fixes.filter(f => f.confidence > 80);
            if (successfulFixes.length > 0) {
                recommendations.push(`${successfulFixes.length} high-confidence fixes were successfully applied`);
            }
            const highRiskFixes = fixes.filter(f => f.risk === 'high');
            if (highRiskFixes.length > 0) {
                recommendations.push(`Review ${highRiskFixes.length} high-risk fixes for potential issues`);
            }
        }
        // General improvement suggestions
        if (issues.length > 20) {
            recommendations.push('Consider implementing automated code quality checks');
        }
        if (qualityScore < 80) {
            recommendations.push('Schedule a code review session to address quality concerns');
        }
        return recommendations;
    }
    parseAIResponse(aiResponse) {
        try {
            const parsed = JSON.parse(aiResponse);
            if (typeof parsed.isValid === 'boolean') {
                return {
                    isValid: parsed.isValid,
                    reason: parsed.reason,
                    suggestions: parsed.suggestions
                };
            }
        }
        catch (error) {
            console.warn(`Failed to parse AI validation response: ${error}`);
        }
        return null;
    }
    createResult(validation, startTime, executionTime, error) {
        const finalExecutionTime = executionTime || Date.now() - startTime;
        const result = {
            success: !error,
            data: validation,
            executionTime: finalExecutionTime,
            aiProvider: this.provider.name,
            timestamp: new Date()
        };
        if (error) {
            result.error = error;
        }
        return result;
    }
}
exports.QualityValidatorAgent = QualityValidatorAgent;
//# sourceMappingURL=quality-validator.js.map