import { PipelineConfig, PipelineResult } from './types';
export declare class AIPipeline {
    private config;
    private issueCollector;
    private codeFixer;
    private testGenerator;
    private qualityValidator;
    private results;
    constructor(config: PipelineConfig, openaiApiKey: string);
    run(targetPath?: string): Promise<PipelineResult>;
    private initializeResults;
    private calculateQualityScore;
    private prepareNextIteration;
    private saveResults;
}
//# sourceMappingURL=pipeline.d.ts.map