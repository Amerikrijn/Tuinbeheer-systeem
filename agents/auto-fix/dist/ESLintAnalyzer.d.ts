import { ESLintAnalysis, CodeFix } from './types';
export declare class ESLintAnalyzer {
    private eslint;
    private configPath;
    constructor(configPath?: string);
    analyzeFile(filePath: string): Promise<ESLintAnalysis>;
    generateFixes(analysis: ESLintAnalysis): Promise<CodeFix[]>;
    private generateFixForMessage;
    private applyESLintFix;
    private mapSeverity;
    private findESLintConfig;
    dispose(): void;
}
//# sourceMappingURL=ESLintAnalyzer.d.ts.map