import { OpenAIProvider } from '../core/providers/openai-provider';
import { CodeIssue, AgentResult } from '../types';
export declare class IssueCollectorAgent {
    private provider;
    private supportedExtensions;
    constructor(openaiProvider: OpenAIProvider);
    run(targetPath?: string): Promise<AgentResult<CodeIssue[]>>;
    private findCodeFiles;
    private analyzeFile;
    private parseAIResponse;
    private performBasicAnalysis;
}
//# sourceMappingURL=issue-collector.d.ts.map