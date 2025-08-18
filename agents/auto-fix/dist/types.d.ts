export interface CodeIssue {
    id: string;
    type: 'error' | 'warning' | 'suggestion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    line: number;
    column: number;
    code?: string;
    category: 'security' | 'performance' | 'quality' | 'typescript' | 'eslint';
    fixable: boolean;
    confidence: number;
}
export interface CodeFix {
    id: string;
    issueId: string;
    description: string;
    before: string;
    after: string;
    line: number;
    column: number;
    risk: 'low' | 'medium' | 'high';
    confidence: number;
    category: 'security' | 'performance' | 'quality' | 'typescript' | 'eslint';
    autoApply: boolean;
}
export interface CodeAnalysis {
    filePath: string;
    issues: CodeIssue[];
    fixes: CodeFix[];
    metrics: {
        totalLines: number;
        totalIssues: number;
        fixableIssues: number;
        securityIssues: number;
        performanceIssues: number;
        qualityIssues: number;
    };
    timestamp: Date;
}
export interface AutoFixOptions {
    filePath: string;
    outputPath: string;
    maxFixes: number;
    autoApply: boolean;
    requireValidation: boolean;
    includeSecurityFixes: boolean;
    includePerformanceFixes: boolean;
    includeQualityFixes: boolean;
    includeTypeScriptFixes: boolean;
    includeESLintFixes: boolean;
}
export interface FixResult {
    success: boolean;
    appliedFixes: CodeFix[];
    failedFixes: CodeFix[];
    rollbackRequired: boolean;
    message: string;
}
export interface FixReport {
    summary: {
        totalIssues: number;
        totalFixes: number;
        appliedFixes: number;
        failedFixes: number;
        qualityScore: number;
        riskLevel: 'low' | 'medium' | 'high';
    };
    analysis: CodeAnalysis;
    fixes: CodeFix[];
    results: FixResult[];
    recommendations: string[];
    timestamp: Date;
}
export interface ValidationRule {
    name: string;
    description: string;
    validate: (fix: CodeFix, originalCode: string) => boolean;
    risk: 'low' | 'medium' | 'high';
}
export interface Metrics {
    totalIssues: number;
    fixesGenerated: number;
    fixesApplied: number;
    qualityImprovement: number;
    executionTime: number;
    memoryUsage: number;
}
export interface AnalysisResult {
    success: boolean;
    analysis: CodeAnalysis;
    fixes: CodeFix[];
    metrics: Metrics;
    message: string;
}
export interface AnalysisConfig {
    typescript: {
        enabled: boolean;
        strictMode: boolean;
        checkTypes: boolean;
    };
    eslint: {
        enabled: boolean;
        rules: Record<string, any>;
    };
    security: {
        enabled: boolean;
        checkPatterns: string[];
    };
    performance: {
        enabled: boolean;
        checkPatterns: string[];
    };
    quality: {
        enabled: boolean;
        checkPatterns: string[];
    };
}
//# sourceMappingURL=types.d.ts.map