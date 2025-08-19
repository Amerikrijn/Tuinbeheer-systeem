import { CodeIssue, AgentResult } from '../types';
export declare class IssueCollectorAgent {
    private provider;
    private isDemoMode;
    private supportedExtensions;
    constructor(apiKey: string);
    run(targetPath?: string): Promise<AgentResult<CodeIssue[]>>;
    private findCodeFiles;
    private analyzeFile;
    private parseAIResponse;
    private performBasicAnalysis;
}
//# sourceMappingURL=issue-collector.d.ts.map