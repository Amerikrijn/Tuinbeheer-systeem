import { PipelineConfig, PipelineResult } from './types';
export declare class AIPipeline {
    private config;
    private issueCollector;
    private results;
    constructor(config: PipelineConfig, openaiApiKey: string);
    run(targetPath?: string): Promise<PipelineResult>;
    private initializeResults;
    private calculateQualityScore;
    private generateTests;
    private fixCode;
    private validateFixes;
    private prepareNextIteration;
    private saveResults;
}
//# sourceMappingURL=pipeline.d.ts.map