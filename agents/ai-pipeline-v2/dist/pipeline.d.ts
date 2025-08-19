import { PipelineConfig, PipelineResult } from './types';
export declare class AIPipeline {
    private config;
    private issueCollector;
    private codeFixer;
    private testGenerator;
    private qualityValidator;
    private results;
    private openaiProvider;
    constructor(config: PipelineConfig, openaiApiKey: string);
    run(targetPath?: string): Promise<PipelineResult>;
    private calculateQualityScore;
    private initializeResults;
    getResults(): PipelineResult;
    getOpenAIStatus(): boolean;
    getProviderName(): string;
}
//# sourceMappingURL=pipeline.d.ts.map