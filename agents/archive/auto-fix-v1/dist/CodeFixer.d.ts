import { CodeIssue, CodeFix, AutoFixOptions } from './types';
export declare class CodeFixer {
    private securityPatterns;
    private performancePatterns;
    private qualityPatterns;
    private typescriptPatterns;
    analyzeCode(content: string, filePath: string, options: AutoFixOptions): Promise<CodeIssue[]>;
    generateFixes(issues: CodeIssue[], options: AutoFixOptions): Promise<CodeFix[]>;
    applyFix(fix: CodeFix, content: string, filePath: string): Promise<any>;
    private checkSecurityPatterns;
    private checkPerformancePatterns;
    private checkQualityPatterns;
    private checkTypeScriptPatterns;
    private checkESLintPatterns;
    private generateFixForIssue;
    private getSecurityFix;
    private getSecurityReplacement;
    private getPerformanceFix;
    private getPerformanceReplacement;
    private getQualityFix;
    private getQualityReplacement;
    private getTypeScriptFix;
    private getTypeScriptReplacement;
    private getESLintFix;
    private getESLintReplacement;
}
//# sourceMappingURL=CodeFixer.d.ts.map