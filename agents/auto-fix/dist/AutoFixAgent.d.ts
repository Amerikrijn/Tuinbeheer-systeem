import { AutoFixOptions, AnalysisResult } from './types';
export declare class AutoFixAgent {
    private options;
    private codeFixer;
    private validator;
    private reportGenerator;
    private startTime;
    constructor(options: AutoFixOptions);
    run(): Promise<AnalysisResult>;
    private performAnalysis;
    private generateFixes;
    private applyFixes;
    private applyFixToContent;
    private generateReport;
    private calculateMetrics;
}
//# sourceMappingURL=AutoFixAgent.d.ts.map