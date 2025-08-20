export interface CodeIssue {
    id: string;
    type: 'error' | 'warning' | 'suggestion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    filePath: string;
    line: number;
    column: number;
    code: string;
    category: 'security' | 'performance' | 'quality' | 'typescript' | 'eslint';
    fixable: boolean;
    confidence: number;
    aiProvider: string;
    timestamp: Date;
}
export interface CodeFix {
    id: string;
    issueId: string;
    description: string;
    before: string;
    after: string;
    filePath: string;
    line: number;
    column: number;
    risk: 'low' | 'medium' | 'high';
    confidence: number;
    category: string;
    aiProvider: string;
    autoApply: boolean;
    timestamp: Date;
}
export interface TestSuite {
    id: string;
    filePath: string;
    tests: TestCase[];
    coverage: number;
    aiProvider: string;
    timestamp: Date;
}
export interface TestCase {
    id: string;
    name: string;
    description: string;
    code: string;
    category: 'unit' | 'integration' | 'e2e';
    priority: 'low' | 'medium' | 'high';
    aiProvider: string;
}
export interface QualityValidation {
    id: string;
    fixes: CodeFix[];
    score: number;
    issues: CodeIssue[];
    recommendations: string[];
    aiProvider: string;
    timestamp: Date;
}
export interface AIProvider {
    name: string;
    type: 'openai' | 'github-copilot';
    config: any;
    isAvailable: boolean;
}
export interface AgentConfig {
    id: string;
    name: string;
    description: string;
    provider: AIProvider;
    enabled: boolean;
    config: Record<string, any>;
}
export interface PipelineConfig {
    agents: AgentConfig[];
    maxIterations: number;
    qualityThreshold: number;
    autoApply: boolean;
    gitIntegration: boolean;
    outputPath: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export interface PipelineResult {
    success: boolean;
    iterations: number;
    finalQualityScore: number;
    issuesFound: number;
    issuesFixed: number;
    testsGenerated: number;
    executionTime: number;
    errors: string[];
    timestamp: Date;
    mode: 'ai' | 'ci' | 'unknown';
    aiProvider: string;
    targetPath: string;
    allIssues: CodeIssue[];
    allFixes: CodeFix[];
    allTests: TestSuite[];
}
export interface AgentResult<T> {
    success: boolean;
    data: T;
    error?: string;
    executionTime: number;
    aiProvider: string;
    timestamp: Date;
    warnings?: string[];
}
export interface PipelineSummary {
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    qualityScore: number;
    recommendations: string[];
    executionTime: number;
    aiProvider: string;
    timestamp: Date;
}
export interface PipelineContext {
    workingDirectory: string;
    gitBranch: string;
    gitStatus: any;
    config: PipelineConfig;
    results: PipelineResult;
    currentIteration: number;
}
export interface AgentTask {
    id: string;
    agentId: string;
    input: any;
    output?: any;
    status: 'pending' | 'running' | 'completed' | 'failed';
    error?: string;
    startTime: Date;
    endTime?: Date;
    executionTime?: number;
}
//# sourceMappingURL=index.d.ts.map