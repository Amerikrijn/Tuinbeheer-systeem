"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
class Validator {
    constructor() {
        this.validationRules = [];
        this.initializeDefaultRules();
    }
    initializeDefaultRules() {
        this.validationRules = [
            {
                name: 'syntax-check',
                description: 'Basic syntax validation',
                validate: (fix, originalCode) => {
                    // Simple syntax check - ensure the fix doesn't break basic structure
                    return fix.after.length > 0 && !fix.after.includes('undefined');
                },
                risk: 'low'
            },
            {
                name: 'length-check',
                description: 'Ensure fix doesn\'t create extremely long lines',
                validate: (fix, originalCode) => {
                    // Check if the fix would create extremely long lines
                    const maxLineLength = 120;
                    return fix.after.length <= maxLineLength;
                },
                risk: 'low'
            },
            {
                name: 'security-check',
                description: 'Basic security validation',
                validate: (fix, originalCode) => {
                    // Don't allow dangerous patterns in fixes
                    const dangerousPatterns = ['eval(', 'innerHTML =', 'document.write'];
                    return !dangerousPatterns.some(pattern => fix.after.includes(pattern));
                },
                risk: 'high'
            },
            {
                name: 'confidence-check',
                description: 'Validate fix confidence level',
                validate: (fix, originalCode) => {
                    // Only apply fixes with high confidence
                    return fix.confidence >= 80;
                },
                risk: 'medium'
            }
        ];
    }
    async validateFixes(fixes, originalCode) {
        const results = [];
        for (const fix of fixes) {
            const validationResult = await this.validateSingleFix(fix, originalCode);
            results.push(validationResult);
        }
        return results;
    }
    async validateSingleFix(fix, originalCode) {
        const results = [];
        for (const rule of this.validationRules) {
            try {
                const passed = rule.validate(fix, originalCode);
                results.push({
                    ruleId: rule.name,
                    passed,
                    message: passed ? 'Validation passed' : 'Validation failed',
                    details: {
                        rule: rule.description,
                        risk: rule.risk
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.push({
                    ruleId: rule.name,
                    passed: false,
                    message: `Validation error: ${errorMessage}`,
                    details: {
                        rule: rule.description,
                        risk: rule.risk,
                        error: errorMessage
                    }
                });
            }
        }
        const allPassed = results.every(r => r.passed);
        const highRiskFailures = results.filter(r => !r.passed && r.details.risk === 'high');
        return {
            fixId: fix.id,
            passed: allPassed,
            results,
            highRiskFailures: highRiskFailures.length > 0,
            message: allPassed ? 'All validations passed' : `${results.filter(r => !r.passed).length} validations failed`
        };
    }
    addCustomRule(rule) {
        this.validationRules.push(rule);
    }
    getValidationSummary(validationResults) {
        const total = validationResults.length;
        const passed = validationResults.filter(r => r.passed).length;
        const failed = total - passed;
        const highRiskFailures = validationResults.filter(r => r.highRiskFailures).length;
        return {
            total,
            passed,
            failed,
            highRiskFailures,
            successRate: total > 0 ? (passed / total) * 100 : 0,
            riskLevel: highRiskFailures > 0 ? 'high' : failed > 0 ? 'medium' : 'low'
        };
    }
}
exports.Validator = Validator;
//# sourceMappingURL=Validator.js.map