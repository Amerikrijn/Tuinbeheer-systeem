export interface LLMConfig {
    provider: string;
    model: string;
    api_key: string;
    max_tokens: number;
    temperature: number;
}
export interface QualityConfig {
    threshold: number;
    max_iterations: number;
    auto_apply_fixes: boolean;
    require_validation: boolean;
}
export interface AgentConfig {
    enabled: boolean;
    description: string;
    focus: string[];
    max_issues_per_file?: number;
    max_fixes_per_iteration?: number;
    confidence_threshold?: number;
    test_framework?: string;
    validation_mode?: string;
}
export interface PipelineConfig {
    backup_files: boolean;
    git_integration: boolean;
    output_format: string;
    verbose_logging: boolean;
}
export interface FilePatterns {
    include: string[];
    exclude: string[];
}
export interface AdvancedConfig {
    retry_attempts: number;
    timeout_seconds: number;
    batch_size: number;
    parallel_processing: boolean;
}
export interface FullPipelineConfig {
    llm: LLMConfig;
    quality: QualityConfig;
    agents: {
        issue_collector: AgentConfig;
        code_fixer: AgentConfig;
        test_generator: AgentConfig;
        quality_validator: AgentConfig;
    };
    pipeline: PipelineConfig;
    files: FilePatterns;
    advanced: AdvancedConfig;
}
export declare class ConfigLoader {
    private configPath;
    private config;
    constructor(configPath?: string);
    load(): Promise<FullPipelineConfig>;
    private getDefaultConfig;
    private mergeWithDefaults;
    getLLMConfig(): LLMConfig | null;
    getQualityConfig(): QualityConfig | null;
    getAgentConfig(agentName: string): AgentConfig | null;
    isAgentEnabled(agentName: string): boolean;
    getFilePatterns(): FilePatterns | null;
}
//# sourceMappingURL=config-loader.d.ts.map